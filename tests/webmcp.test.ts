import { describe, expect, it, vi } from 'vitest';
import { registerSales24Tools } from '../src/webmcp';
import { resetState } from '../src/crm';

describe('WebMCP registration', () => {
  it('registers the same five Sales24 tool contracts used by the real product', async () => {
    resetState();
    const registerTool = vi.fn().mockResolvedValue(undefined);
    const registration = await registerSales24Tools({ registerTool });

    const tools = registerTool.mock.calls.map(([tool]) => tool);
    expect(tools.map((tool) => tool.name)).toEqual([
      'sales24_get_pipeline_summary',
      'sales24_find_conversations',
      'sales24_open_conversation',
      'sales24_prepare_reply',
      'sales24_move_deal_stage',
    ]);
    expect(tools[0].annotations.readOnlyHint).toBe(true);
    expect(tools[3].description).toContain('human review');
    expect(tools[4].annotations.destructiveHint).toBe(true);
    await expect(Promise.resolve(tools[3].execute({ conversationId: 'c-101' }))).resolves.toMatchObject({
      structuredContent: { status: 'draft', sent: false },
    });

    const options = registerTool.mock.calls[0][1] as { signal: AbortSignal };
    expect(options.signal.aborted).toBe(false);
    registration.dispose();
    expect(options.signal.aborted).toBe(true);
  });

  it('requires explicit confirmation before changing a deal stage', async () => {
    resetState();
    const registerTool = vi.fn().mockResolvedValue(undefined);
    await registerSales24Tools({ registerTool });
    const move = registerTool.mock.calls.map(([tool]) => tool).find((tool) => tool.name === 'sales24_move_deal_stage');
    expect(() => move.execute({ dealId: 'c-101', stage: 'proposal', confirmed: false })).toThrow('explicit confirmation');
  });

  it('fails closed when the browser does not expose WebMCP', async () => {
    await expect(registerSales24Tools(undefined)).resolves.toEqual({ mode: 'preview', registered: 0, dispose: expect.any(Function) });
  });
});
