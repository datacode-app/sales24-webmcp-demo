# Sales24 WebMCP integration reference

Open-source WebMCP tool contracts and a runnable reference harness for the WebMCP integration built into **Sales24**, Datacode's real multilingual CRM.

Built for the [OpenAI WebMCP Challenge](https://webmcp.devpost.com/).

## Honest architecture disclosure

The actual Sales24 application runs from Datacode's private commercial monorepo. The challenge extension is implemented in that real product and uses its authenticated inbox, contacts, AI Assist service, pipeline, permissions, and workspace scoping.

This public repository is **not presented as the production CRM**. It contains:

- a complete runnable reference harness with fictional in-memory records;
- the same five public WebMCP tool names, schemas, annotations, and safety boundaries used by Sales24;
- automated tests and a browser-ready build;
- no proprietary Sales24 source, production credentials, or customer data.

The submitted product demonstration will show the real Sales24 interface with a safe demo workspace. This harness exists so reviewers can inspect and run the WebMCP-specific behavior from public source.

## WebMCP tools

| Tool | Real-product behavior | Safety |
| --- | --- | --- |
| `sales24_get_pipeline_summary` | Reads the visible workspace pipeline by stage and currency | Read-only |
| `sales24_find_conversations` | Finds authorized conversations by language, channel, status, or text | Read-only |
| `sales24_open_conversation` | Opens the selected conversation in the shared Sales24 UI | Read-only |
| `sales24_prepare_reply` | Uses Sales24 AI Assist and places the result in the real reply composer | Draft only; never sends |
| `sales24_move_deal_stage` | Moves an authorized deal to a configured stage | Requires explicit confirmation |

Sales24 registers tools with the imperative `document.modelContext.registerTool()` API. Registrations use the standard `AbortSignal` lifecycle, and browsers without WebMCP remain fully usable by a human.

## Human-agent workflow

1. The agent reads the pipeline and finds a priority conversation.
2. It opens that conversation in the same interface the operator sees.
3. Sales24 AI Assist prepares a multilingual reply.
4. The reply appears in the ordinary composer for human review and remains unsent.
5. A deal-stage change is available only with explicit confirmation.

There is deliberately no message-send tool.

## Run the public reference harness

```bash
npm install
npm run dev
```

Open the URL shown by Vite. For native WebMCP, use ChatGPT's in-app browser or Chrome 149+ with `chrome://flags/#enable-webmcp-testing` enabled.

## Verify

```bash
npm test
npm run build
```

## Suggested agent prompt

> Find the highest-priority Arabic conversation, open it, and prepare a reply for review. Do not send anything.

## Data and privacy

- The public harness uses fictional records only.
- The real-product recording will use a designated demo workspace.
- No customer messages, phone numbers, credentials, or production records belong in this repository or the challenge video.
- Prepared replies remain unsent until a human deliberately uses Sales24's existing send action.

## License

MIT
