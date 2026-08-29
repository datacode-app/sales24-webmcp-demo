import { describe, expect, it, vi } from 'vitest';
import { registerSales24Tools } from '../src/webmcp';

describe('WebMCP registration', () => {
  it('registers discoverable Sales24 tools with schemas and safety hints', async () => {
    const registerTool = vi.fn().mockResolvedValue(undefined);
    await registerSales24Tools({ registerTool });

    const tools = registerTool.mock.calls.map(([tool]) => tool);
    expect(tools.map((tool) => tool.name)).toEqual([
      'get_pipeline_snapshot',
      'find_priority_conversations',
      'focus_conversation',
      'draft_follow_up',
      'move_deal_stage',
    ]);
    expect(tools[0].annotations.readOnlyHint).toBe(true);
    expect(tools[3].description).toContain('review');
    await expect(Promise.resolve(tools[3].execute({ contactId: 'c-101', language: 'en', goal: 'book_demo' }))).resolves.toMatchObject({
      structuredContent: { status: 'needs_review', sent: false },
    });
  });

  it('fails closed when the browser does not expose WebMCP', async () => {
    await expect(registerSales24Tools(undefined)).resolves.toEqual({ mode: 'preview', registered: 0 });
  });
});
