import {
  draftFollowUp,
  findPriorityConversations,
  focusConversation,
  getPipelineSnapshot,
  moveDealStage,
  type DealStage,
  type FollowUpGoal,
  type Language,
  type Priority,
} from './crm';

type Tool = {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean };
  execute: (input?: any) => unknown | Promise<unknown>;
};

type ModelContext = {
  registerTool: (tool: Tool, options?: { signal?: AbortSignal }) => Promise<void> | void;
};

const textResult = (text: string, structuredContent: unknown) => ({
  content: [{ type: 'text', text }],
  structuredContent,
});

export async function registerSales24Tools(modelContext: ModelContext | undefined) {
  if (!modelContext?.registerTool) return { mode: 'preview' as const, registered: 0 };

  const tools: Tool[] = [
    {
      name: 'get_pipeline_snapshot',
      description: 'Read the current Sales24 pipeline totals, stage counts, priority load, and drafts awaiting human review.',
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute: () => {
        const data = getPipelineSnapshot();
        return textResult(`Pipeline value is $${data.totalPipelineValue.toLocaleString()} across ${data.openConversations} open conversations.`, data);
      },
    },
    {
      name: 'find_priority_conversations',
      description: 'Find and rank open customer conversations by language and priority so the user can decide what needs attention first.',
      inputSchema: {
        type: 'object',
        properties: {
          language: { type: 'string', enum: ['ckb', 'ar', 'en'], description: 'Optional customer language.' },
          priority: { type: 'string', enum: ['high', 'medium', 'low'], description: 'Optional priority filter.' },
          limit: { type: 'number', minimum: 1, maximum: 20, description: 'Maximum results.' },
        },
      },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute: (input = {}) => {
        const data = findPriorityConversations(input as { language?: Language; priority?: Priority; limit?: number });
        return textResult(`Found ${data.length} matching conversations.`, data);
      },
    },
    {
      name: 'focus_conversation',
      description: 'Open one customer conversation in the shared Sales24 workspace so the human and agent see the same context.',
      inputSchema: {
        type: 'object',
        properties: { contactId: { type: 'string', description: 'Sales24 contact ID.' } },
        required: ['contactId'],
      },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute: (input = {}) => {
        const data = focusConversation(input as { contactId: string });
        return textResult(`Focused ${data.company} in the shared workspace.`, data);
      },
    },
    {
      name: 'draft_follow_up',
      description: 'Prepare a multilingual follow-up as a review-only draft. This tool never sends a message; a human must review and approve it in the UI.',
      inputSchema: {
        type: 'object',
        properties: {
          contactId: { type: 'string', description: 'Sales24 contact ID.' },
          language: { type: 'string', enum: ['ckb', 'ar', 'en'], description: 'Sorani Kurdish, Arabic, or English.' },
          goal: { type: 'string', enum: ['book_demo', 'share_proposal', 'check_in'], description: 'Purpose of the follow-up.' },
        },
        required: ['contactId', 'language', 'goal'],
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: (input = {}) => {
        const data = draftFollowUp(input as { contactId: string; language: Language; goal: FollowUpGoal });
        return textResult('Draft created and placed in the human review queue. It has not been sent.', data);
      },
    },
    {
      name: 'move_deal_stage',
      description: 'Move a CRM deal to a new stage and show the change immediately in the shared pipeline UI.',
      inputSchema: {
        type: 'object',
        properties: {
          contactId: { type: 'string', description: 'Sales24 contact ID.' },
          stage: { type: 'string', enum: ['new', 'qualified', 'proposal'], description: 'Destination pipeline stage.' },
        },
        required: ['contactId', 'stage'],
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: (input = {}) => {
        const data = moveDealStage(input as { contactId: string; stage: DealStage });
        return textResult(data.activity.message, data);
      },
    },
  ];

  await Promise.all(tools.map((tool) => modelContext.registerTool(tool)));
  return { mode: 'native' as const, registered: tools.length };
}
