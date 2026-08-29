# Replacement demo recording plan

**Format:** genuine screen recording of the real Sales24 product. No title-card slideshow, no static screenshot sequence, and no synthetic mock presented as production.

**Target length:** 75–100 seconds (hard limit: under 3 minutes).

## Preconditions

- The reviewed WebMCP change is deployed to an approved Sales24 environment.
- A designated demo workspace contains only fictional contacts, conversations, and deals.
- Judge credentials are active and documented in Devpost's private testing instructions.
- Chrome 149+ has `chrome://flags/#enable-webmcp-testing` enabled, or the recording uses ChatGPT's in-app browser.
- Browser notifications and unrelated tabs are closed; no production identifiers are visible.

## One continuous product flow

| Time | Screen action | Narration point |
| --- | --- | --- |
| 0:00–0:08 | Open the real Sales24 inbox and show the demo workspace name. | “This is Sales24, Datacode's real multilingual CRM, extended with native WebMCP.” |
| 0:08–0:18 | Open the browser agent/tool view and show the five discovered `sales24_*` tools. | “The browser discovers business-level tools instead of guessing coordinates or selectors.” |
| 0:18–0:32 | Ask: “Find the highest-priority Arabic conversation and open it.” Run `sales24_find_conversations`, then `sales24_open_conversation`. | “The result is limited to the signed-in operator's authorized workspace and inbox scope.” |
| 0:32–0:52 | Show the selected fictional customer in the real Sales24 conversation UI. Run `sales24_prepare_reply`. | “Sales24 uses its existing AI Assist service and puts the reply into the ordinary composer.” |
| 0:52–1:07 | Pause on the composer. Edit one word manually. Do not click Send. | “The draft is visible, editable, and unsent. Sales24 deliberately exposes no send-message tool.” |
| 1:07–1:22 | Read the pipeline, request a stage change without confirmation, and show the refusal. | “A write action fails closed until the user explicitly confirms it.” |
| 1:22–1:35 | Confirm the change and show the demo deal move in the real pipeline. | “After confirmation, the product updates the same pipeline the human sees.” |
| 1:35–1:42 | Return to the unsent reply composer. | “Agents accelerate the work; humans keep control of customer communication.” |

## Recording quality gate

- Record at 1440×900 or 1920×1080, 30 fps or higher.
- Keep browser zoom at 100%; enlarge only the agent side panel if necessary.
- Use cursor movement and live state changes—no stitched screenshot slides.
- Use clean human narration or a high-quality voiceover synchronized to the actions.
- Add concise captions, but do not cover the composer, tool results, or permission prompts.
- Verify phone numbers, email addresses, workspace IDs, tokens, browser autofill, and notifications are absent from every frame.
- End on the real product, not the public reference harness.
