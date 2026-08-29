import {
  draftFollowUp,
  focusConversation,
  getPipelineSnapshot,
  getState,
  moveDealStage,
  type DealStage,
} from './crm';

type ToolResult = {
  content: Array<{ type: 'text'; text: string }>;
  structuredContent: Record<string, unknown>;
};

type Tool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: {
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
    idempotentHint?: boolean;
    openWorldHint?: boolean;
  };
  execute: (input?: Record<string, unknown>) => ToolResult | Promise<ToolResult>;
};

type ModelContext = {
  registerTool: (tool: Tool, options: { signal: AbortSignal }) => Promise<void> | void;
};

const textResult = (text: string, structuredContent: Record<string, unknown>): ToolResult => ({
  content: [{ type: 'text', text }],
  structuredContent,
});

const requiredString = (input: Record<string, unknown>, key: string): string => {
  const value = input[key];
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${key} is required`);
  return value.trim();
};

export async function registerSales24Tools(modelContext: ModelContext | undefined) {
  if (!modelContext?.registerTool) {
    return { mode: 'preview' as const, registered: 0, dispose: () => undefined };
  }

  const tools: Tool[] = [
    {
      name: 'sales24_get_pipeline_summary',
      description: 'Read the Sales24 deal pipeline grouped by stage and currency for the active workspace.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
      execute: () => {
        const data = getPipelineSnapshot();
        return textResult(`Sales24 has ${data.openConversations} visible deals.`, {
          dealCount: data.openConversations,
          valuesByCurrency: { USD: data.totalPipelineValue },
          stages: data.stageCounts,
        });
      },
    },
    {
      name: 'sales24_find_conversations',
      description: 'Find recent Sales24 inbox conversations by customer text, language, channel, or status.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Customer, company, or message text.' },
          channel: { type: 'string', enum: ['whatsapp', 'instagram', 'messenger'] },
          language: { type: 'string', enum: ['ckb', 'ar', 'en'] },
          status: { type: 'string', enum: ['human'] },
          limit: { type: 'integer', minimum: 1, maximum: 20, default: 5 },
        },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
      execute: (input = {}) => {
        const query = typeof input.query === 'string' ? input.query.trim().toLocaleLowerCase() : '';
        const language = typeof input.language === 'string' ? input.language : null;
        const channel = typeof input.channel === 'string' ? input.channel.toLocaleLowerCase() : null;
        const limit = typeof input.limit === 'number' ? Math.max(1, Math.min(20, Math.trunc(input.limit))) : 5;
        const conversations = getState().contacts
          .filter((contact) => !language || contact.language === language)
          .filter((contact) => !channel || contact.channel.toLocaleLowerCase() === channel)
          .filter((contact) => !query || [contact.name, contact.company, contact.lastMessage].some((value) => value.toLocaleLowerCase().includes(query)))
          .sort((a, b) => b.waitingMinutes - a.waitingMinutes)
          .slice(0, limit)
          .map((contact) => ({
            id: contact.id,
            customer: contact.company,
            language: contact.language,
            channel: contact.channel.toLocaleLowerCase(),
            status: 'human',
            priority: contact.priority,
            lastMessage: contact.lastMessage,
            waitingMinutes: contact.waitingMinutes,
          }));
        return textResult(`Found ${conversations.length} matching Sales24 conversations.`, { count: conversations.length, conversations });
      },
    },
    {
      name: 'sales24_open_conversation',
      description: 'Open a Sales24 conversation in the shared workspace so the human and agent see the same context.',
      inputSchema: {
        type: 'object',
        properties: { conversationId: { type: 'string', description: 'Sales24 conversation ID.' } },
        required: ['conversationId'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
      execute: (input = {}) => {
        const conversationId = requiredString(input, 'conversationId');
        const data = focusConversation({ contactId: conversationId });
        return textResult(`Opened the conversation with ${data.company}.`, { conversationId, customer: data.company });
      },
    },
    {
      name: 'sales24_prepare_reply',
      description: 'Prepare a multilingual follow-up in the Sales24 composer for human review. It never sends a customer message.',
      inputSchema: {
        type: 'object',
        properties: { conversationId: { type: 'string', description: 'Sales24 conversation ID.' } },
        required: ['conversationId'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
      execute: (input = {}) => {
        const conversationId = requiredString(input, 'conversationId');
        const contact = focusConversation({ contactId: conversationId });
        const draft = draftFollowUp({ contactId: conversationId, language: contact.language, goal: 'book_demo' });
        return textResult('Prepared an unsent draft for human review.', {
          conversationId,
          customer: contact.company,
          draft: draft.body,
          status: 'draft',
          sent: false,
        });
      },
    },
    {
      name: 'sales24_move_deal_stage',
      description: 'Move a Sales24 deal to another pipeline stage after explicit user confirmation.',
      inputSchema: {
        type: 'object',
        properties: {
          dealId: { type: 'string', description: 'Sales24 deal ID.' },
          stage: { type: 'string', enum: ['new', 'qualified', 'proposal'] },
          confirmed: { type: 'boolean', description: 'Must be true only after explicit user confirmation.' },
        },
        required: ['dealId', 'stage', 'confirmed'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
      execute: (input = {}) => {
        if (input.confirmed !== true) throw new Error('Deal stage changes require explicit confirmation.');
        const dealId = requiredString(input, 'dealId');
        const stage = requiredString(input, 'stage') as DealStage;
        if (!['new', 'qualified', 'proposal'].includes(stage)) throw new Error('Unknown pipeline stage.');
        const data = moveDealStage({ contactId: dealId, stage });
        return textResult(data.activity.message, { dealId, previousStage: data.previousStage, stage: data.stage });
      },
    },
  ];

  const controller = new AbortController();
  try {
    await Promise.all(tools.map((tool) => modelContext.registerTool(tool, { signal: controller.signal })));
  } catch (error) {
    controller.abort();
    throw error;
  }
  return { mode: 'native' as const, registered: tools.length, dispose: () => controller.abort() };
}
