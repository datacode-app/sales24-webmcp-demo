# Devpost submission draft

## Project name

Sales24 Agent Desk

## One-line pitch

A multilingual CRM workspace where WebMCP agents prioritize customer conversations and prepare safe, human-reviewed follow-ups without ever sending autonomously.

## Short description

Sales24 Agent Desk gives browser agents five structured WebMCP tools for reading a CRM pipeline, finding priority conversations, focusing customer context, drafting Sorani Kurdish, Arabic, or English follow-ups, and moving deals forward. Every draft enters a visible human-review queue, and no send tool is exposed.

## Inspiration

Sales teams in multilingual markets often work across WhatsApp, Instagram, and Messenger while switching between Sorani Kurdish, Arabic, and English. The signal is there, but the next action is buried in a complex interface.

Browser agents can help, but clicking through a CRM by coordinates is brittle and unsafe. The highest-risk action is outbound messaging: a useful agent should help prepare the work without silently speaking on behalf of the company.

We built Sales24 Agent Desk to show a better pattern: the website exposes clear business capabilities through WebMCP, while the human and agent share the same visible state and approval boundary.

## What it does

The application exposes five imperative WebMCP tools:

1. `get_pipeline_snapshot` — reads pipeline value, stage counts, priority load, and the human-review queue.
2. `find_priority_conversations` — filters and ranks open conversations by language and urgency.
3. `focus_conversation` — opens one customer in the shared workspace so the human sees the context selected by the agent.
4. `draft_follow_up` — prepares a Sorani Kurdish, Arabic, or English follow-up and places it in a review-only queue.
5. `move_deal_stage` — updates the selected deal and immediately reflects the change in the visible pipeline.

The demo workflow asks the agent to find the highest-priority Arabic lead, open it, and prepare a demo follow-up. Narin Solar is selected, an Arabic draft appears as **Needs review / Not sent**, a human approves it, and the agent advances the deal from **Qualified** to **Proposal**. Approval does not send the message. Sales24 deliberately exposes no send tool.

## How we built it

- TypeScript and Vite for a fast, dependency-light web application
- The WebMCP imperative API through `navigator.modelContext.registerTool()`
- JSON Schema input contracts for each tool
- `readOnlyHint` annotations on non-mutating tools
- Structured text and `structuredContent` results
- One shared state engine used by both the human interface and WebMCP tools
- Multilingual seed data and draft generation for Sorani Kurdish, Arabic, and English
- A responsive dark interface with explicit review and delivery status
- Vitest and jsdom for state, tool-registration, and UI-flow tests
- GitHub Actions for tests, production builds, GitHub Pages deployment, and reproducible desktop/mobile screenshots

## Challenges we ran into

### Keeping the human and agent in the same reality

A tool response is not enough if the human interface still shows stale data. We made every tool operate on the same state engine as the UI, so focusing a conversation, creating a draft, approving it, or changing a deal stage is immediately visible to both sides.

### Designing a safe outbound workflow

The easiest demo would have included a send action. We intentionally did not expose one. `draft_follow_up` only creates a review item; approval is a human UI action; approved content remains explicitly **Not sent**. This made the safety boundary simple to understand and inspect.

### Multilingual UX

The inbox mixes Latin and Arabic scripts, three languages, and several channels. We used language-aware content, direction-safe draft rendering, and responsive layouts so the workflow remains understandable on desktop and mobile.

## Accomplishments we are proud of

- Five functional WebMCP tools with clear schemas and annotations
- A complete native WebMCP workflow verified in a compatible browser
- Human approval that is visible, auditable, and separate from delivery
- Shared pipeline and review state that updates immediately after tool execution
- A polished public demo that works without credentials or production customer data
- Ten automated tests, a passing production build, and repeatable visual audits at 1440px and 390px

## What we learned

WebMCP is most powerful when tools map to business intent rather than page mechanics. `find_priority_conversations` is more useful and robust than a sequence of clicks and selectors. We also learned that the best agent experience is often the best human experience: explicit state, narrow actions, useful confirmations, and visible safety boundaries help everyone.

## What's next

- Connect the same tool contracts to the production Sales24 backend
- Add authenticated workspaces and audit trails
- Add policy-driven approvals by channel, account, and campaign
- Stream new conversation signals into the shared queue
- Expand multilingual drafting and review analytics

## Links

- Live demo: https://datacode-app.github.io/sales24-webmcp-demo/
- Public source: https://github.com/datacode-app/sales24-webmcp-demo
- WebMCP specification: https://github.com/webmachinelearning/webmcp

## Suggested categories/tags

WebMCP, CRM, productivity, customer support, sales, multilingual, human-in-the-loop, TypeScript

## Submission checklist

- [x] Public functional URL
- [x] Public source repository with MIT license
- [x] Five functional imperative WebMCP tools
- [x] Desktop and mobile visual QA
- [x] Automated tests and production build
- [x] Demo video under three minutes generated locally
- [ ] Upload demo video to an accepted public video host
- [ ] Join the challenge on Devpost
- [ ] Paste final submission fields and submit
