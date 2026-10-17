# Agent Creation Product Review

Reviewed: 2026-10-08  
Scope: Persistence's signed-in **Build from scratch → Simple** path and implications for Samvada AI.  
Reference: <https://in.dashboard.persistence.dev/agents>

## What Persistence asks in Simple setup

The agent creation entry point offers multiple starting routes. This review covers only **Build from scratch → Simple**.

The Simple setup modal is titled **Complete your agent** and displays:

- **Agent name** — required
- **Description** — required, with the placeholder “Describe what you want this agent to achieve”
- A **Simple / Flow** mode switch, with Simple selected by default
- A **Create** action

The subtitle also says a website can optionally be added, but no website field was visible in the Simple form. No knowledge source, voice, language, guardrails, handoff, or disclosure fields were visible at this initial step.

## Useful product lesson for Samvada

Persistence keeps its initial Simple form intentionally small. That supports a fast start and avoids asking customers to configure every operational detail before they have a draft.

For Samvada, keep **the agent description as the only required input** in the initial setup. Let customers optionally attach knowledge and add organization-specific guardrails. Offer a suggested editable name after the brief is entered, rather than making naming a blocker. Keep privacy and grounding protections on by default, and make compliance disclosures prerequisites for activation rather than draft creation.

After the draft exists, the product can guide the customer through one high-impact clarification at a time, show an editable summary of the extracted configuration, and lead into test conversations and an activation checklist. Those later steps are not visible in the Persistence Simple setup modal, so this review does not assume how Persistence handles them.

## What appears after Create

Submitting the Simple form creates a **Draft**, auto-saves it, and opens the agent editor. The initial content is a single long, editable template with these sections:

- **Identity / Persona:** who the agent represents, its call role, and tone
- **Objective:** a numbered call flow, plus a success condition and what to do when the task cannot be completed
- **Conversation rules:** short turns, one question at a time, read-back, interruption handling, pace, and language/tone guidance
- **Scripts:** greeting, verification, main action, failure, transfer, and closing language
- **FAQs and Objection Handling:** suggests six to eight anticipated questions and approved answers
- **Guardrails:** avoid invented facts, keep to the call's scope, verify identity, and offer a human when asked

The editor also exposes first-turn controls for whether the agent or caller speaks first, a static or dynamic opener, and a pause-before-speaking value. The surrounding editor has Workflow, Agent, Settings, and Preview areas, plus a Publish action. I did not publish the draft.

One content-quality issue: the starter template's FAQ says the agent can identify itself as a voice assistant, while its guardrails say to “not discuss being an AI.” Those instructions conflict and should be reconciled in any product that seeds a prompt template.

## Samvada creation flow

The Samvada setup now collects the choices that materially affect a phone agent, spread across four short steps:

1. **Agent brief:** optional name, required plain-language description, and inbound/outbound direction.
2. **Voice and greeting:** primary and additional languages, voice, first speaker, static or dynamic greeting, and pause before speech. Advanced call behavior is available when needed, with interruption, speaking pace, and silence defaults preselected.
3. **Knowledge and tools:** select indexed files from existing workspace knowledge bases, choose connected action integrations, select telephony, STT, LLM, and TTS providers, and assign a purchased phone number. No file upload is offered in this flow. Speech-recognition vocabulary hints are optional. The number picker currently uses masked preview records and leaves a clear seam for the purchased-number API.
4. **Guardrails:** always-on privacy and grounding protections, organization topics and promises, human-handoff triggers, optional approved FAQ answers, and AI/recording disclosures required before activation.

The recommended provider defaults reflect the intended stack: Plivo, Deepgram, GPT mini, and Fish Audio. The description is the only required customer-authored field; advanced choices have useful defaults or remain optional so setup stays approachable. The UI sends these selections in the create payload for backend handling.

## Boundary of this review

To inspect the post-create editor, I created a clearly labeled, non-sensitive sample draft named **UX Review Sample — Order Support** (agent ID `MTGSTBsDKO6b`) with a generic order-support brief. It remains a draft and has not been published.
