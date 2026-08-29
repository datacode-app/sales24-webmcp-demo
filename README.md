# Sales24 Agent Desk

A WebMCP-enabled multilingual CRM workspace where a human and a browser agent share the same inbox, pipeline, and review queue.

Built for the [OpenAI WebMCP Challenge](https://webmcp.devpost.com/).

## Why WebMCP

CRM interfaces force general-purpose agents to inspect dense tables, infer controls, and click through several screens. Sales24 Agent Desk exposes the useful actions as structured browser tools while keeping the visual workspace and human approval boundary intact.

An agent can:

- summarize the current sales pipeline;
- find priority conversations by language;
- focus a conversation in the shared UI;
- prepare a Sorani Kurdish, Arabic, or English follow-up draft;
- move a deal between pipeline stages.

The demo deliberately exposes no send-message tool. Agent-authored messages enter a visible review queue, and a human approves them without the message being dispatched.

## WebMCP tools

| Tool | Behavior |
| --- | --- |
| `get_pipeline_snapshot` | Reads pipeline totals and review workload |
| `find_priority_conversations` | Filters conversations by language and priority |
| `focus_conversation` | Opens the same customer context for the human and agent |
| `draft_follow_up` | Creates an unsent multilingual draft for review |
| `move_deal_stage` | Updates the visible pipeline and activity history |

The implementation uses the imperative `document.modelContext.registerTool()` API. In browsers without WebMCP, the interface runs in preview mode and remains fully usable by a human.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite. To test native WebMCP in Chrome, enable `chrome://flags/#enable-webmcp-testing`, or open the deployed app in ChatGPT's in-app browser.

## Verify

```bash
npm test
npm run build
```

## Suggested agent prompt

> Find my highest-priority Arabic lead, open it, and draft a demo follow-up. Do not send anything.

## Demo safety

- Uses fictional demo data only.
- Stores state in the current page session only.
- Makes no network request for CRM operations.
- Provides no message-send tool.
- Labels every generated follow-up as unsent and awaiting human review.

## License

MIT
