# Devpost submission draft — real Sales24 product

> **Status:** draft only. Do not submit until the real-product deployment, demo credentials, and replacement screen recording are approved.

## Project name

Sales24 WebMCP

## One-line pitch

WebMCP turns the real Sales24 multilingual CRM into a safe agent workspace where agents prioritize customer conversations and prepare replies while humans retain control of every outbound message.

## Short description

Sales24 now exposes five structured WebMCP tools from its real authenticated CRM interface. An agent can read the current pipeline, find authorized priority conversations, open the correct customer context, invoke Sales24 AI Assist to prepare a multilingual reply in the ordinary composer, and move a deal after explicit confirmation. The agent has no send-message tool.

## Why this is a strong fit for WebMCP

Sales teams in multilingual markets work across WhatsApp, Instagram, Messenger, Telegram, and email. A generic browser agent can try to infer dense tables and click coordinates, but those interactions are brittle and risky. WebMCP lets Sales24 expose business intent directly while preserving its existing workspace permissions and human-facing interface.

The result is a shared human-agent workspace rather than a hidden automation: the agent selects the conversation, Sales24 visibly opens it, AI Assist places an unsent reply in the real composer, and the operator decides whether anything leaves the company.

## What people and agents can do together

1. Ask the agent for the highest-priority Arabic, Sorani Kurdish, or English conversation.
2. Let the agent open the correct conversation in Sales24.
3. Have Sales24 AI Assist prepare a context-aware reply.
4. Review or edit that reply in the normal Sales24 composer; it is not sent automatically.
5. Explicitly approve a pipeline-stage change when appropriate.

## WebMCP implementation

The real Sales24 frontend registers these imperative tools through `document.modelContext.registerTool()`:

- `sales24_get_pipeline_summary`
- `sales24_find_conversations`
- `sales24_open_conversation`
- `sales24_prepare_reply`
- `sales24_move_deal_stage`

The bridge reads the same authenticated, workspace-scoped hooks used by the product UI. Channel-scoped users only expose their authorized conversations. CRM tools are omitted when the current user's navigation permissions do not include the relevant section. Tool registrations use `AbortSignal` cleanup. Deal changes are marked destructive and require `confirmed: true`. Reply preparation calls the existing Sales24 AI Assist service, stages the result in session-only browser state, opens the real conversation, and never invokes the send-message path.

## Existing product versus challenge work

Sales24 existed before the challenge. The WebMCP bridge, tool contracts, composer handoff, registration lifecycle, safety gates, and accompanying tests were added during the challenge period. The public repository contains the runnable open-source reference harness for this new layer. The commercial Sales24 monorepo remains private and is not represented as open source.

## Public-source disclosure

The public repository is a complete functional reference implementation with fictional data and the same WebMCP-facing contracts and safety model. The live demonstration uses the real Sales24 deployment and a designated demo workspace. This separation protects proprietary product code and customer data without presenting the reference harness as the production service.

## Verification completed

- Real Sales24 admin test suite: 2,226 tests passed.
- TypeScript typecheck passed.
- Production build passed.
- Chrome 151 WebMCP lifecycle smoke test passed: tool registered, discovered, and removed after abort.
- Real Sales24 composer visual check passed with a multilingual draft visibly present and unsent.

## Links

- Real product: **[ADD APPROVED JUDGE-ACCESSIBLE SALES24 URL]**
- Public WebMCP source and runnable reference: https://github.com/datacode-app/sales24-webmcp-demo
- Replacement product video: **[ADD PUBLIC YOUTUBE URL]**
- WebMCP specification: https://github.com/webmachinelearning/webmcp

## Submission checklist

- [x] WebMCP integrated into the real Sales24 source branch
- [x] Five native WebMCP tools and human-review safety boundary
- [x] Public runnable integration reference with MIT license
- [x] Automated tests, typecheck, production build, and browser checks
- [ ] Review and merge the Sales24 pull request
- [ ] Deploy only after approval
- [ ] Prepare a safe demo workspace and judge credentials
- [ ] Record a genuine real-product screen demonstration with audio under three minutes
- [ ] User approval of the final product flow and video
- [ ] Submit to Devpost
