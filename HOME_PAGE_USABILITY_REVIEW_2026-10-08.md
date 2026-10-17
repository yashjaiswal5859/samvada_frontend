# Home, Dashboard, Agents, Voices, Knowledge, Integrations, Campaigns, Contacts, Live Calls, Call History, Observability, Analytics, Workspaces, Settings, and Help Usability Review

**Reviewed:** 8 October 2026  
**Pages:** /home, /dashboard, /agents, /voices, /knowledge, /integrations, /campaigns, /contacts, /calls/live, /calls, /observability, /analytics, /workspaces, /settings, and /help
**Scope:** UI flow, hierarchy, readability, spacing, and responsive presentation only. No backend assessment.

## Summary

The supplied 17-item audit is useful as a checklist, but it mixes meaningful usability findings with automated thresholds and subjective micro-spacing suggestions. I would not treat all 17 items as defects.

Home is the workspace landing page, not an agent-creation surface. The earlier version mixed an agent prompt with template discovery; the current flow keeps Home focused on navigation and starts agent creation from Voice Agents.

## Recommended findings

### P1 — Keep agent creation in Voice Agents

Do not show an agent prompt, dictation control, or create-draft action on Home. Provide a clear link to Voice Agents, where customers can start the description, knowledge, and guardrail flow. Legacy creation URLs should route to that flow instead of reopening creation on Home.

### P2 — Make Home a useful workspace hub

Use concise workspace shortcuts for Voice Agents, Live Calls, Campaigns, Analytics, Knowledge, and Integrations. Do not fabricate operational metrics when live workspace data is unavailable.

### P2 — Group account and workspace context

The findings about workspace identity and the sidebar footer (#7, #8, #10, #11) substantially overlap. Keep workspace switching in one predictable location. Group the user name and access role in one account area, and avoid repeating identity details elsewhere in the shell.

### P2 — Keep workspace context clear

Keep workspace and account switching in their shared, predictable locations. Let the Home hero and navigation cards remain visually secondary to page-specific workflows elsewhere in the product.

## Triage of all 17 findings from the original Home view

The supplied findings were assessed against the original screen. Home’s information architecture has since changed: creation and template discovery now live in Voice Agents, so composer-specific suggestions below are historical.

| # | Assessment |
|---|---|
| 1 | Deprioritize the raw count of 13 text colors. Check semantic color roles and text contrast; the count alone does not show a problem. |
| 2 | Keep as a consistency review. Use a few intentional variants, not a rigid limit of five styles. |
| 3 | Small metadata. Increase if it is hard to read at the actual viewport; otherwise keep it secondary. |
| 4 | “ACTIVE WORKSPACE” is a short label. Sentence case is optional polish, not a usability blocker. |
| 5 | Organization name is useful context but should remain secondary and legible. |
| 6 | Prioritize. Template descriptions are useful scanning content and should be larger than 11px. |
| 7 | Keep, merged with #8, #10, and #11 as one account/workspace grouping issue. |
| 8 | Keep, merged with #7, #10, and #11. |
| 9 | Reframe. The described New Agent button and trunk count were not present in the observed Home utility bar. Reduce the status strip’s visual weight instead. |
| 10 | Keep, merged with #7, #8, and #11. |
| 11 | Keep, merged with #7, #8, and #10. |
| 12 | Low-cost polish: move the result count next to the template heading so filter changes are easier to scan. |
| 13 | Deprioritize. A square microphone icon button can be consistent as its own icon-only variant. |
| 14 | Verify visually before changing. The gap is a small detail and should not outrank the page hierarchy. |
| 15 | Verify at the target viewport. Change only if the action row is visibly off-center. |
| 16 | Subjective without a viewport and filter state. Preserve enough space for labels and selected values; avoid shrinking controls only to meet a width preference. |
| 17 | Low-cost polish if the search field is visibly lower than the heading. Align it on desktop and stack it cleanly on narrow screens. |

## Suggested order

1. Keep agent creation in Voice Agents; Home should not collect an agent prompt or open the create modal.
2. Use Home for clear shortcuts into core workspace areas.
3. Keep shared workspace and account context consistent with the rest of the app.

**Source areas:** src/pages/home/HomePage.tsx, src/components/layout/AppLayout.tsx, src/components/layout/Sidebar.tsx.

## Dashboard page review of the supplied 11-item heuristic list

The strongest findings are about the dashboard’s vertical flow and duplicated onboarding actions. At the narrow viewport reviewed earlier, the three-step setup area takes substantial space before call activity and other dashboard information. The remaining numeric color/button thresholds are prompts to inspect consistency, not defects on their own.

One additional UI consistency issue from the live review: Dashboard says “No Agents Created,” while the Agents page shows three active agents. Make the empty-state copy specific to the section and avoid language that contradicts another page—for example, explain that there is no activity in the selected window if that is what the panel means.

### P1 — Keep setup useful without letting it dominate the dashboard

The “Fast-Track Setup” banner is useful for a new customer, but its three large vertically stacked cards push call volume, recent calls, and other operational context far down the page. On a narrow screen, only part of the setup sequence appears in the first view.

Use a compact setup checklist with visible step progress. Let returning users collapse it or continue setup from a small persistent reminder. Keep the full guidance available to first-time customers, but give dashboard activity a clearer place in the first view.

### P1 — Avoid repeating the same actions nearby

The setup area includes actions to create an agent and add contacts. The nearby Quick Actions section repeats Create Voice Agent and Import Contacts. Keep the onboarding checklist focused on setup, and either collapse duplicate quick actions while it is expanded or reserve Quick Actions for distinct, frequent tasks such as a new campaign.

### P2 — Make the setup card copy easier to scan

The step descriptions use 11px text. Raise important supporting copy to around 13–14px and keep each step’s title, purpose, and next action visually distinct.

### P2 — Use consistent, purposeful action styling

Review the dashboard for a consistent primary and secondary action hierarchy. Similar links in the setup cards should share a CTA treatment. Accent colors may still distinguish step categories when that meaning is clear; do not standardize colors solely to meet a count.

### Reframe or deprioritize other findings

- **Color count (#1) and button-style count (#2):** Check semantic color roles and intentional button variants. The raw counts (16 colors and 9 styles) do not establish usability problems.
- **Small shell labels and account duplication (#3–#5, #8):** These overlap with the Home findings above. Keep metadata secondary but legible, and group the profile and access role in one account area.
- **“+ New Agent” emphasis (#10):** This control was not present in the dashboard header observed earlier; that header showed search, notifications, and the account control. Treat this as stale for the reviewed UI unless it is visible in another current viewport.
- **Arrow colors (#11):** If all setup links have the same meaning, use one consistent action-link style. Keep distinct step colors only where they communicate a real category.

### Suggested dashboard order

1. Compact the setup checklist and show progress without hiding it from new users.
2. Remove nearby duplicate actions or make Quick Actions serve a different purpose.
3. Increase the setup descriptions’ readability.
4. Refine shared button and account-area patterns after the larger hierarchy is settled.

## Agents page review of the supplied 11-item heuristic list

The most useful findings are about duplicate actions, empty-state hierarchy, heading structure, and the space used by zero-value summary cards. I cross-checked the list against AgentListPage source and the earlier authenticated walkthrough. The browser session is currently signed out, so this pass did not include a fresh live screenshot.

### P1 — Make the empty state the main action

The page has four summary cards before the empty-state actions. When there are no agents, four large zero cards repeat the empty condition and push “Build from Scratch” and marketplace browsing down the page. Collapse or simplify those cards in the empty state and put the first-agent actions immediately after the page introduction.

### P1 — Remove duplicate destinations and standardize create actions

The header has a Marketplace button and the content has an Explore Marketplace tab that open the same view. Keep one entry point. Likewise, the header’s “Create Voice Agent” and the empty state’s “Build from Scratch” open the same create modal. Use a consistent primary label such as “Create agent”; keep “Browse templates” as the distinct secondary action.

The audit also mentions a global “+ New Agent” button. That control was not present in the current AgentListPage source or the earlier live screenshot, so I would treat it as stale unless it appears in a fresh signed-in view.

### P2 — Fix the empty-state heading level and breadcrumb readability

The “No voice agents configured yet” text is an H3 below the page H1, with no clear H2 section heading before it. Change it to an H2 or add the missing section heading so keyboard and screen-reader users get a meaningful outline.

The breadcrumb is small and pale. Increase it enough to remain readable, keep it secondary to “Voice Agents,” and remove the workspace UUID from everyday navigation.

### P2 — Keep data loading separate from an empty workspace

In the earlier live walkthrough, the first snapshot briefly showed zero agents and an empty-state message; after the list loaded, three active-agent cards appeared. Show a loading skeleton while the list is loading and render the empty state only after loading completes. This avoids making an existing workspace appear empty during page load.

### Triage of the supplied 11 findings

| # | Assessment |
|---|---|
| 1 | Deprioritize the count of 13 text colors; review semantic roles and contrast instead. |
| 2 | Review the 11 button styles as a consistency question, but do not enforce a rigid maximum. |
| 3 | Repeated shell metadata finding from Home and Dashboard; keep workspace identity secondary but legible. |
| 4 | “ACTIVE WORKSPACE” is a short label; sentence case is optional polish. |
| 5 | Same shell metadata issue as #3. |
| 6 | Useful: use an H2 for the empty-state heading or provide the missing H2 parent section. |
| 7 | The source contains one “No voice agents configured yet” heading, and the earlier live view showed populated agent cards. The claimed duplicated empty state is not confirmed; do not remove a second instance without reproducing it. |
| 8 | Useful minor fix: improve breadcrumb legibility and remove the UUID from the everyday breadcrumb. |
| 9 | Partly useful: standardize the two current create labels because they open the same modal. The reported global “+ New Agent” control appears stale. |
| 10 | Useful: header Marketplace and Explore Marketplace tab are duplicate entry points to the same view. |
| 11 | Useful: compact the four zero-value summary cards when the agent list is empty so the first-agent action is prominent. |

### Suggested Agents page order

1. Show a loading state until agent data is ready.
2. When truly empty, reduce zero-card space and surface one primary create action plus one template action.
3. Remove duplicate Marketplace and Create entry points.
4. Correct heading hierarchy and simplify the breadcrumb.

**Additional source area:** src/pages/agents/AgentListPage.tsx.

## Voices page review of the supplied 12-item heuristic list

I checked the signed-in `/voices` page in the browser and cross-checked the current `VoicesPage.tsx` markup. The page has a clear library purpose and an obvious clone action. The useful improvements are around readability, content hierarchy, and making a voice easy to evaluate without crowding its card.

### P1 — Make the voice cards easier to scan

The trending cards combine provider, accent, latency, a multi-line sample quote, sample-rate/lossless metadata, tone, and two actions. Several of these are rendered at 10–11px. Keep the first scan focused on voice name, accent, a short tone description, and preview/select actions. Increase the sample quote to a comfortable reading size (around 13–14px) and move sample-rate and other technical details into a secondary detail row or expandable voice details. Keep latency visible only if it is a meaningful choice criterion, and label it consistently.

### P2 — Fix the voice-library heading outline

“Trending Production Voices” is currently an `<h3>` directly after the page `<h1>`. Use an `<h2>` for this section (and continue with appropriate levels for voice names) so screen-reader heading navigation follows the visible page structure.

### P2 — Preserve a clear preview-versus-select action hierarchy

The supplied audit says “Listen Sample” is more prominent than “Select,” but that description does not match the current source or live page: “Select” is the filled emerald action and “Listen Sample” is outlined. Keep that hierarchy if selecting a voice is the intended next step, and use the same ordering and styling in the card and library table. If listening is the main evaluation action, give it stronger emphasis intentionally rather than letting button fills decide by accident.

### Triage of the supplied 12 findings

| # | Assessment |
|---|---|
| 1 | Deprioritize the raw count of 13 text colors. Check semantic roles and contrast instead. |
| 2 | Review consistency across shared button variants, but the count of 10 does not establish a usability defect. |
| 3 | The 10px brand tagline in the shell is secondary metadata. Increase it if it is intended to be read as body copy; otherwise prioritize the much more useful voice-card text. |
| 4 | “ACTIVE WORKSPACE” is a short label. Sentence case is optional polish, not a primary usability issue. |
| 5 | This repeats the shared shell metadata/account-area feedback in the Home and Dashboard reviews. Avoid duplicating the same shell recommendation here. |
| 6 | Keep. Increase the 11px sample quote for readability; it helps users judge voice fit. |
| 7 | Keep. Change the Trending section heading from H3 to H2 or add the missing parent section heading. |
| 8 | The report points at the heading rather than the images, and the current card markup gives every trending avatar the same fixed `w-13 h-13 object-cover` sizing. The claimed James-versus-Sophia/Aarav image-ratio mismatch is not confirmed by the current markup. Verify image crop consistency across cards at desktop and mobile widths before changing it. |
| 9 | This repeats shared sidebar account/access feedback already covered in the Home review. |
| 10 | The described emphasis is reversed in the current UI: Select is filled; Listen Sample is outlined. Preserve a deliberate, consistent hierarchy across cards and table actions. |
| 11 | Not confirmed by current structure: each card uses the same image/name/details/sample/actions order, and the quote sits in its own bordered block. Check the actual image crop if a particular asset still looks visually crowded. |
| 12 | Keep, merged with #6. Reduce technical detail in the initial card scan and expose it secondarily. |

### Suggested Voices page order

1. Make name, accent/tone, and preview/select actions the easy-to-scan core of each card.
2. Improve quote readability and visually demote sample-rate/codec details.
3. Correct the H1-to-H2 section hierarchy.
4. Verify portrait crops and responsive card alignment across all trending voices.

**Additional source area:** src/pages/voices/VoicesPage.tsx.

## Knowledge page review of the supplied 12-item heuristic list

I checked the signed-in `/knowledge` page at a narrow viewport and cross-checked `KnowledgebasePage.tsx` plus the shared app shell. The live accessibility tree shows one copy of the workspace, folder, document, and preview areas; I did not reproduce the report’s critical overlap/duplication claim. The main opportunity visible in the first screen is to get users to their knowledge-library work sooner: large summary cards take most of the available mobile height before the folders and documents area appears.

### P1 — Bring folder and document work into the first view

At the reviewed narrow viewport, the page title and three actions are followed by four large metric cards in a two-column grid; the Knowledge Folders/Documents/Preview workspace starts below the fold. In an empty workspace, those zero-value summaries delay the first useful action. Compact or collapse the metrics on narrow screens and prioritize folder creation and document upload/add-text guidance above the fold. Keep the fuller metrics on wider layouts or once they help customers monitor a populated library.

### P2 — Clarify action priority across the empty state

The header gives “Add Text / URL” the filled primary treatment, while the empty-document state promotes “Upload Document” and makes “Add Text” outlined. That can be reasonable if the empty-state context intentionally recommends uploading, but the changed visual hierarchy should be deliberate and predictable. Pick one primary path for the empty state based on the intended first-use flow, keep the other as secondary, and use consistent styling for the same action where the context has not changed.

### P2 — Correct the empty-state heading level

“No Documents in this Folder” is currently an `<h4>` directly under the page `<h1>` in the observed document outline. Make it an `<h2>` or introduce meaningful section headings for the folder/document workspace, then nest the empty-state heading at the appropriate level.

### P2 — Use a consistent navigation count treatment

The sidebar exposes “Phone Numbers 0” as inline text while “Workspaces 1” is rendered with a styled count badge. Use one shared count treatment and accessible name pattern for both navigation items; hide decorative badge styling from assistive technology if the count is already included in the link name.

### Triage of the supplied 12 findings

| # | Assessment |
|---|---|
| 1 | Deprioritize the raw count of 14 text colors. Review semantic roles and contrast, not the threshold alone. |
| 2 | Review shared button variants for consistency, but 10 styles alone do not establish a usability defect. |
| 3 | Repeated shell-brand metadata feedback already covered in earlier page reviews. Keep it secondary but legible. |
| 4 | “ACTIVE WORKSPACE” is a short label; sentence case is optional polish. |
| 5 | Repeated organization metadata and profile-area feedback from the shared shell; do not duplicate the same recommendation. |
| 6 | Useful in context: the folder empty-state helper is 11px. Increase it to a comfortable readable size if it is needed to explain the next step; the larger first-view hierarchy issue has higher priority. |
| 7 | Keep. The empty-state `<h4>` skips from the page H1; give the folder/document area a proper heading outline. |
| 8 | Not confirmed. The signed-in accessibility tree shows a single metric row and a single knowledge workspace. Do not change layout/rendering based on this report unless the overlap is reproduced. |
| 9 | Partly useful. The header and empty-state intentionally emphasize different first-use paths today, but make that contextual hierarchy consistent and clear. |
| 10 | Useful minor consistency fix in the shared sidebar: use the same visual count-badge treatment for Phone Numbers and Workspaces. |
| 11 | Reframe as shared design-system consistency. The shell’s New Agent action uses emerald while this page’s Add Text primary action uses blue. Define consistent semantic primary/action colors across pages; don’t mechanically force all actions to one hue if the colors communicate distinct roles. |
| 12 | Not confirmed as a defect. The global search uses the shared top-bar layout and is not obscuring the Knowledge page’s controls; adjust its max width only if responsive measurements show it crowds utility actions. |

### Suggested Knowledge page order

1. Reduce mobile metric-card height and surface the first folder/document action sooner.
2. Make the empty-state primary action intentional and predictable.
3. Correct heading hierarchy and standardize shared navigation count badges.
4. Treat color counts, global-search width, and the reported duplicated layout as checks to reproduce, not automatic fixes.

**Additional source areas:** src/pages/knowledge/KnowledgebasePage.tsx, src/components/layout/AppLayout.tsx.

## Integrations page review of the supplied 12-item heuristic list

I reviewed the supplied list and cross-checked `IntegrationsPage.tsx`, `SettingsNav.tsx`, and the shared app header. During the live check, navigating directly to `/integrations` briefly showed the route, then returned to `/home`, so I could not confirm the full page layout in a stable browser view. Findings below are grounded in current UI source and responsive classes; layout-specific allegations remain unconfirmed until the route can be kept open.

### P1 — Make API key creation and empty-state guidance easy to find

The API key card’s empty state uses 10px helper text (“Create a key to access APIs programmatically”) and its description is 11px. Increase the explanatory copy to at least 12–13px and keep it readable at mobile widths. This is especially useful because the user needs to understand the next step before generating a credential.

### P2 — Keep the action color system intentional across page and shell

The page’s “Generate API Key” action uses blue, while the persistent app-shell “New Agent” action uses emerald. They have different scopes, so the colors need not be identical, but both currently read as primary filled actions. Define shared semantic action tokens and preserve a clear distinction between the page’s main task and the global shortcut. The raw count of colors is not the reason to change them.

### P2 — Clarify “Notifications” destinations

The global header has a Notifications utility button, and the settings navigation includes a “Notifications” destination. Rename the settings destination to “Notification settings” or “Alert preferences” so the two controls are easier to tell apart in sighted and assistive navigation.

### Triage of the supplied 12 findings

| # | Assessment |
|---|---|
| 1 | Deprioritize the count of 15 text colors. Check semantic color roles, contrast, and hierarchy instead. |
| 2 | Review shared button variants for consistency, but 11 styles alone do not demonstrate a user-facing problem. |
| 3 | Repeated shell brand tagline finding from earlier pages; keep secondary metadata legible without duplicating this recommendation. |
| 4 | “ACTIVE WORKSPACE” is a short label; changing to sentence case is optional polish. |
| 5 | Repeated shell organization metadata issue from earlier pages. |
| 6 | Useful. The API description is 11px. Increase to 12–13px if it helps explain what the credential is for. |
| 7 | Useful. The 10px API-key empty-state helper is too small for meaningful guidance; raise it to 12–13px. |
| 8 | Reframe as semantic consistency. The emerald action is a global shell shortcut; blue is the page’s API-key action. Keep a deliberate hierarchy and consistent tokens rather than mechanically forcing one hue. |
| 9 | Not confirmed and not supported by the current responsive grid: API Keys/Webhooks use 4 of 12 columns on wide screens and stack below the catalog on smaller screens. Revisit only if the stable desktop layout shows cramped controls or excessive empty space. |
| 10 | Partly useful. SettingsNav’s active state is emerald, while the page’s category filter uses blue. They represent separate settings navigation and in-page filtering, so different treatment can be appropriate; ensure each control group has a clear, internally consistent selected state. |
| 11 | Not confirmed. The catalog search is grouped with its section heading and aligned to the catalog area in the source. Check a stable desktop render before changing its position. |
| 12 | Keep. Rename the settings destination to “Notification settings” or “Alert preferences” to distinguish it from the global notification center. |

### Suggested Integrations page order

1. Improve the API key empty-state description and helper text readability.
2. Clarify the in-settings Notifications destination.
3. Review the semantic action-color hierarchy across the app shell and page.
4. Confirm the column balance and search alignment in a stable desktop browser view before changing layout.

**Additional source areas:** src/pages/integrations/IntegrationsPage.tsx, src/components/layout/SettingsNav.tsx, src/components/layout/AppLayout.tsx.

## Campaigns page review of the supplied 12-item heuristic list

I checked the signed-in `/campaigns` page in the browser at a narrow viewport and cross-checked `CampaignListPage.tsx`, the app header, and sidebar. The page has a clear campaign-specific create action and readable high-level campaign metrics. The audit’s strongest confirmed issue is the skipped heading level in the no-campaign state. A further flow issue is that zero-value metrics and the compliance banner take up much of the first mobile view before users reach the empty-state explanation and filters.

### P1 — Make the empty campaign state the focus when the workspace has no campaigns

At the reviewed narrow viewport, four KPI cards show zeros, followed by a large DNC compliance banner, before the filter/search area and empty-state action. For a workspace with no campaigns, compact or collapse zero-value KPIs and shorten the compliance treatment so “Create campaign” and the first-use guidance appear sooner. Keep the operational metrics prominent once campaigns provide useful data.

### P2 — Fix the campaign empty-state heading level

“No Campaigns Found” is rendered as an `<h3>` after the page `<h1>`, with no intervening section heading in the outline. Use an `<h2>` for the empty-state section or add the missing section heading so screen-reader heading navigation reflects the visible hierarchy.

### P2 — Keep the supporting metric text readable

The KPI helper text such as “Autonomous dialers online” is 11px. Raise meaningful supporting copy to around 12–13px, especially text that explains the metric or operational status. Avoid enlarging purely decorative labels at the expense of the metric hierarchy.

### Triage of the supplied 12 findings

| # | Assessment |
|---|---|
| 1 | Deprioritize the raw count of 13 text colors. Check semantic roles and contrast instead. |
| 2 | Review shared button variants for consistency; 9 styles alone do not prove an issue. |
| 3 | Repeated shell brand tagline from earlier pages. Keep it secondary metadata and avoid duplicating the same finding. |
| 4 | “ACTIVE WORKSPACE” is a short label; sentence case is optional polish. |
| 5 | Repeated organization metadata concern from earlier pages. |
| 6 | Partly useful. The 11px KPI helper text could be more readable; prioritize the empty-state flow first. |
| 7 | Keep. The empty-state H3 skips from the page H1; use a proper section heading level. |
| 8 | The source styles the page-level “Create Outbound Campaign” and empty-state “Create First Campaign” with the same dark emerald primary treatment. The global “New Agent” is a separate shell shortcut. Keep the campaign action easy to find, but the claimed ghost-versus-solid mismatch is not present in source. |
| 9 | The global search is capped at `max-w-xl` (576px). The exact width threshold is subjective; reduce it only if desktop screenshots show it crowding header utilities. At the reviewed mobile width it does not dominate the header. |
| 10 | Not useful as stated. The sidebar already groups 17 navigation destinations under Build, Deploy, Monitor, and System. Improve grouping further only if usage evidence identifies low-findability items. |
| 11 | Not confirmed. The active campaign filter uses a dark filled background and white text, not color alone. Preserve a strong selected state and add `aria-pressed`/tab semantics if keyboard interaction requires it. |
| 12 | Not present in the source: both campaign-create actions use the same dark emerald filled style. Keep labels/context distinct while retaining the shared primary button treatment. |

### Suggested Campaigns page order

1. In the zero-campaign state, reduce the space used by zero metrics and the compliance banner so the create path is visible sooner.
2. Correct the empty-state heading outline.
3. Improve readability of small operational helper text.
4. Keep the existing active filter treatment and campaign CTA style; revisit search width only if a desktop layout demonstrates crowding.

**Additional source areas:** src/pages/campaigns/CampaignListPage.tsx, src/components/layout/Header.tsx, src/components/layout/Sidebar.tsx.

## Contacts page review of the supplied 11-item heuristic list

I checked the signed-in `/contacts` page in the browser at a narrow viewport and cross-checked `ContactsPage.tsx` and the shared header/sidebar. The page makes both contact entry paths visible and its contextual filters are easy to locate. The most useful findings concern duplicate actions, redundant empty states, the search scope, and the amount of zero-value summary content before the empty list.

### P1 — Give the empty contact state one clear message and next step

When there are no contacts, the list shows “No contacts found” with Import/Add actions, while the right detail panel simultaneously says “No Contact Selected.” The second message repeats the same empty condition and is especially redundant when the narrow layout stacks both panels. Hide or repurpose the detail panel while the list is empty; keep one explanatory empty state with the two clear ways to populate the list.

### P1 — Standardize the Add and Import actions

The header’s “Add Contact” and the empty-state “Add Contact” invoke the same modal but use different primary button colors. Likewise, the import action is labeled “Import Contacts” in the header and “Import CSV” in the empty state, though both open the same modal. Use one label per action and shared button variants, with a single primary action and one secondary import action in both locations.

### P2 — Make global search distinct from contact search

The top-bar search and contact-list search use similar search-field styling and both mention contacts. The page search is the contextual database filter; the top bar is the global navigation/tool search, although its current placeholder can appear contact-specific. Keep the global scope clear (for example, “Search pages and tools” with its keyboard shortcut) and label the local field “Search contacts” both visibly or accessibly. The page-level input currently relies on placeholder text as its prompt, so add a programmatic label as well.

### P2 — Fix the empty-state heading level

“No contacts found” is currently an `<h3>` after the page `<h1>`, with no intervening section heading. Use an `<h2>` for the empty list section or add an appropriate section heading so the document outline is meaningful.

### P2 — Reduce empty-state metric height on mobile

At the reviewed narrow viewport, all four contact metrics show zero and use a two-by-two card grid before the contact search and empty-state list. Compact or hide secondary zero-value metrics until the list has contacts, so the next-step actions and contact search take less scrolling to reach. Keep the full operational metrics when they contain useful data.

### Triage of the supplied 11 findings

| # | Assessment |
|---|---|
| 1 | Deprioritize the raw count of 13 text colors; review semantic roles and contrast. |
| 2 | Review shared button variants, but 11 styles alone do not prove a user-facing issue. |
| 3 | Repeated shell brand metadata finding from earlier pages. Keep secondary metadata legible; avoid duplicating the recommendation. |
| 4 | “ACTIVE WORKSPACE” is a short label; sentence case is optional polish. |
| 5 | Repeated shell organization metadata finding from earlier pages. |
| 6 | Keep. The no-results heading skips from H1 to H3; repair the section outline. |
| 7 | Keep. Normalize Add Contact’s primary style and choose one Import label because the current header and empty-state actions open the same modal. |
| 8 | Partly useful. Distinguish global search from the contact-list filter and add a programmatic label for the local field. They are separated by the KPI cards in the current narrow view, but their similar scope wording can still confuse. |
| 9 | Partly useful and already noted in the Knowledge review: phone count is right-aligned plain text while Workspaces uses a pill badge. Use a consistent count treatment across shared navigation. |
| 10 | Not confirmed. The live narrow screenshot shows top-bar content inset from the viewport, with normal vertical padding. |
| 11 | Keep. The live accessibility tree confirms “No contacts found” and “No Contact Selected” appear at the same time when the contact list is empty. Hide or repurpose the detail empty state for this case. |

### Suggested Contacts page order

1. Remove the redundant detail-pane empty state when the contact list is empty.
2. Use consistent labels and primary/secondary styles for Add Contact and Import.
3. Clarify global-versus-local search and label the local search accessibly.
4. Compact the zero-value metric cards on mobile and correct the empty-state heading level.

**Additional source areas:** src/pages/contacts/ContactsPage.tsx, src/components/layout/Header.tsx, src/components/layout/Sidebar.tsx.

## Live Calls page review of the supplied 11-item heuristic list

I reviewed the signed-in `/calls/live` page source and attempted the live browser route. The browser returned to `/home` during navigation, so a stable live screenshot was not available. Source inspection confirms several audit items directly: the empty-state action is duplicated, “No active calls” is an H3 after the page H1, and the sidebar’s `/calls` history link can match `/calls/live` as a parent route unless it is marked `end`.

### P1 — Ensure only Live Monitor is active on the live route

The sidebar uses a React Router `NavLink` to `/calls` for Call History without `end`. On `/calls/live`, that parent path can also report active, highlighting both Call History and Live Monitor. Set `end` on the Call History link (or otherwise require an exact route match) so only the current destination is selected.

### P1 — Remove the duplicate Call History action

The no-active-calls empty state renders two side-by-side buttons with the same “View Call History” label and both navigate to `/calls`; one is filled and one outlined. Keep one button with a single clear style. If two actions are desired, make the second a genuinely different next step, such as viewing campaigns or troubleshooting telephony.

### P2 — Give the empty state a proper heading level

“No active calls in progress” is an `<h3>` directly after the page H1 supplied by `CallsNav`. Use an `<h2>` for the main empty section or add the missing section heading to keep the document outline navigable.

### P2 — Distinguish global search from live-call filtering

The page has a contextual filter for phone number, contact, and agent, while the shared header has a global search field with similar visual treatment. Preserve clear scope in each field’s label and accessible name. The contextual input currently uses placeholder text without a programmatic label; add one such as “Search live calls.”

### P2 — Avoid two competing empty messages when there are no calls

When there are no active calls, the list shows “No active calls in progress” while the detail pane says “No Call Selected.” The latter is technically true but repeats the empty condition and takes space, particularly when the responsive layout stacks the panels. Hide or repurpose the detail empty state when the call list is empty; show “Select a call” only when calls exist.

### Triage of the supplied 11 findings

| # | Assessment |
|---|---|
| 1 | Deprioritize the count of 14 text colors. Review semantic roles and contrast. |
| 2 | Review shared button variants, but the count of 8 alone does not establish a problem. |
| 3 | Repeated shell-brand metadata finding from earlier pages. Keep it secondary and legible. |
| 4 | “ACTIVE WORKSPACE” is a short label; sentence case is optional polish. |
| 5 | Repeated shell organization metadata finding from earlier pages. |
| 6 | Keep. The empty-state H3 skips from the page H1; provide a proper section heading. |
| 7 | Not confirmed by the current source: one KPI strip and one contextual search field are rendered. The browser route did not remain open for a fresh duplicate check. |
| 8 | Keep. The source renders two identical “View Call History” actions with different styles. Consolidate them. |
| 9 | Keep and confirm as a route-matching bug: the `/calls` NavLink lacks `end`, so it can be active at `/calls/live` along with the Live Monitor link. |
| 10 | The source has separate list and detail empty panels, but vertical misalignment is visual and was not confirmed in a stable browser view. The duplicated “No calls”/“No call selected” messaging is a clearer, source-confirmed improvement. |
| 11 | Partly useful. Clarify the global and page-local search scopes and add an accessible name to the contextual filter; their similar visual language is secondary to the label/scope distinction. |

### Suggested Live Calls page order

1. Make Call History an exact-match sidebar route so Live Monitor alone is active at `/calls/live`.
2. Consolidate the duplicated View Call History actions.
3. Correct the empty-state heading outline and avoid redundant detail-pane messaging.
4. Label the contextual search input and distinguish its scope from global search.

**Additional source areas:** src/pages/conversations/LiveCallConsolePage.tsx, src/components/layout/Sidebar.tsx, src/components/layout/Header.tsx.

## Call History page review of the supplied 11-item heuristic list

I checked the signed-in `/calls` page in the browser at a narrow viewport and cross-checked `CallHistoryPage.tsx`. The page is a single, clear call-log view with one KPI strip, one contextual filter panel, and one table. The most important confirmed mismatch is its breadcrumb: it says “Observability & Telemetry” above the “Conversations & Call Logs” page heading.

### P1 — Make the page location match the breadcrumb

The breadcrumb’s final segment is “Observability & Telemetry,” which points users toward a different product area than the actual “Conversations & Call Logs” title. Replace it with “Call History” or “Conversations” and align the sidebar/page naming so the location is consistent across navigation.

### P2 — Correct the call-log empty-state heading level

“No Call Sessions Recorded Yet” is rendered as an `<h3>` directly after the page `<h1>`. Use an `<h2>` for the table’s empty-state section or add the appropriate parent section heading.

### P2 — Label the contextual call-log search accessibly

The filter panel’s search input has a long placeholder but no programmatic label. Add a concise accessible name such as “Search call logs” and keep the detailed placeholder as an example of supported search terms.

### Triage of the supplied 11 findings

| # | Assessment |
|---|---|
| 1 | Deprioritize the raw count of 13 text colors. Check semantic roles and contrast. |
| 2 | Review shared button variants, but 6 styles alone do not establish a usability issue. |
| 3 | Repeated shell-brand metadata from earlier pages; keep it secondary and legible. |
| 4 | “ACTIVE WORKSPACE” is a short label; sentence case is optional polish. |
| 5 | Repeated shell organization metadata issue from earlier pages. |
| 6 | Keep. The empty-state heading skips from H1 to H3; correct its level or add the missing section heading. |
| 7 | Not confirmed. The live accessibility tree and current source show one KPI strip, one filter panel, and one table. |
| 8 | Keep. The visible breadcrumb says “Observability & Telemetry” while the H1 says “Conversations & Call Logs.” |
| 9 | Not confirmed as described. The live page’s top utility strip is aligned horizontally and does not display the cited “Trunks: 14 / 50 Active” content. Treat that detail as stale. |
| 10 | Deprioritize. The empty-state icon container is a 48px rounded square, a proportionate size; the report calls it a large faint circle. |
| 11 | Not confirmed. The live screenshot shows the global search in the shared top bar and a separate, lower call-log filter panel with distinct scope and sufficient spacing. |

### Suggested Call History page order

1. Replace the mismatched breadcrumb label with Call History/Conversations.
2. Correct the no-sessions heading hierarchy.
3. Add a programmatic label to the contextual search field.
4. Keep the existing single filter/table layout and empty-state icon sizing.

**Additional source areas:** src/pages/conversations/CallHistoryPage.tsx, src/components/layout/Header.tsx, src/components/layout/Sidebar.tsx.

## Observability page review of the supplied 14-item heuristic list

I checked the signed-in `/observability` page in the browser at a narrow viewport and cross-checked `ObservabilityPage.tsx`. The live view has one KPI area and one telemetry table, not duplicated content. The most important design issue is the mobile scan path: all six KPI cards stack in one column, so the first screen is mostly metrics and the main latency visualization is pushed well below it.

### P1 — Make telemetry overview scannable on mobile

At the reviewed narrow width, the six performance cards render as a single vertical column. The first screen shows only the first few cards, pushing the latency waterfall and live sessions far down the page. Use a two-column grid from an appropriate small breakpoint (or a compact summary row) and reduce card padding on narrow screens. Preserve readable labels and avoid horizontal scrolling for the key metrics.

### P2 — Fix section heading hierarchy and long all-caps labels

The first major content section is an `<h3>` (“Voice-to-Voice (V2V) Latency by Pipeline Component”) directly after the page `<h1>`, and the live sessions section is also H3. Use H2 for these top-level sections and H3 for nested content. Change “Live Telephony Sessions & Interrupts” to sentence/title case; its 36-character all-caps rendering is harder to scan.

### P2 — Improve meaningful telemetry helper text readability

Some metric explanations are 10px and the live-session section description is 11px. These provide context for values and should read comfortably at a glance. Raise meaningful helper copy to around 12–13px, keeping compact 10px type for nonessential technical tags only.

### P2 — Reduce the status badge’s visual weight slightly

The “Real-time Telemetry Stream: 100Hz” badge spans the content width on mobile and uses a saturated pale-green fill, drawing attention before the telemetry itself. Keep the live-state dot/status visible, but use a compact inline badge or lighter outlined treatment so the charts and key data remain the page’s focal point.

### Triage of the supplied 14 findings

| # | Assessment |
|---|---|
| 1 | Deprioritize the raw count of 13 text colors. Check semantic roles and contrast. |
| 2 | Review shared button variants; 8 styles alone do not establish a user-facing issue. |
| 3 | Repeated shell-brand metadata from earlier page reviews; keep secondary metadata legible. |
| 4 | “ACTIVE WORKSPACE” is a short label; sentence case is optional polish. |
| 5 | Repeated shell organization metadata issue from earlier pages. |
| 6 | Keep. “Instant Audio First-Packet” is a 10px metric explanation; raise meaningful supporting text. |
| 7 | Keep. “Live Telephony Sessions & Interrupts” is a long all-caps heading; use sentence/title case. |
| 8 | Keep, merged with #6. The section description is 11px and useful for understanding what the table shows. |
| 9 | Keep. The page has H3 sections immediately after its H1; correct the document outline. |
| 10 | Deprioritize. “New Agent” is a global shell shortcut, not the primary action for this observability page; making it larger could compete with telemetry. |
| 11 | Not confirmed. The cited Trunks/Credit/New Agent cluster is not present in the live top status strip; the visible engine and credit items are separated and aligned. |
| 12 | Partly useful. The live badge is prominent on mobile; keep the state visible but reduce its surface area/contrast slightly. |
| 13 | Not confirmed as a problem. The shared global search is capped at `max-w-xl` and fits the observed header; 576px is a cap, not its fixed rendered width. |
| 14 | Useful refinement. Table headers are 11px uppercase. Consider 12px title/sentence case for scanability, especially on dense tables, while preserving the table’s compact layout. |

### Suggested Observability page order

1. Change the KPI grid to two columns at small mobile widths so the waterfall is reachable sooner.
2. Correct H1/H2/H3 structure and change the long all-caps section heading.
3. Improve meaningful 10–11px helper copy and table-header readability.
4. Make the telemetry status badge more compact while retaining clear live-state feedback.

**Additional source area:** src/pages/observability/ObservabilityPage.tsx.

## Analytics page review of the supplied 12-item heuristic list

I checked the signed-in `/analytics` page in the browser at a narrow viewport and cross-checked `AnalyticsPage.tsx`. The page offers useful reporting controls and distinct dashboard sections. The most important issue I observed is that the five KPI cards render in a single column below the 640px `sm` breakpoint, pushing charts and the leaderboard far down on mobile.

### P1 — Make executive metrics compact on mobile

At the reviewed narrow width, the KPI strip uses one full-width card per row. Only part of the first KPI appears in the initial screen, while the visualization and deeper insights require substantial scrolling. Use a two-column grid from an appropriate compact breakpoint, with reduced padding and readable labels, so customers can scan the executive overview and reach the charts sooner.

### P2 — Correct the analytics section heading hierarchy

The first dashboard section, “Conversational Volume & Concurrency Trends,” is an H3 after the page H1. The page’s major dashboard sections should use H2 headings, with H3 reserved for subsections, to make the long analytics page easier to navigate with assistive technology.

### P2 — Reduce repetition in the leaderboard action column

The leaderboard repeats a visible “Studio” button in every row. This is a useful row-specific destination, so removing it or hiding it only on hover could hurt keyboard and touch users. Keep the action discoverable but make it quieter (for example, a compact consistent link or icon button with an accessible name) and ensure focus styles remain visible.

### P2 — Improve the pipeline subheading readability

“Call Resolution Pipeline” uses 11px uppercase styling inside the sentiment card. Use sentence/title case and around 12–13px so it reads clearly as the next subsection without competing with the card’s main heading.

### Triage of the supplied 12 findings

| # | Assessment |
|---|---|
| 1 | Deprioritize the raw count of 16 text colors. Review semantic roles and contrast instead. |
| 2 | Review button variants for consistency, but 14 styles alone do not prove a usability problem. |
| 3 | Repeated shell-brand metadata finding from earlier pages; keep secondary metadata legible. |
| 4 | “ACTIVE WORKSPACE” is a short label; sentence case is optional polish. |
| 5 | Repeated shell organization metadata finding from earlier pages. |
| 6 | Keep as a small refinement. The “Call Resolution Pipeline” subheading is 11px and should be slightly more readable. |
| 7 | Keep. The first major chart heading is H3 after the page H1; use an H2 section heading. |
| 8 | Deprioritize. “New Agent” is a global shell shortcut; the page’s task-specific action is Add Widget, and the global action should not dominate the report. |
| 9 | Partly useful. The row-level Studio action repeats, but it is a meaningful action for each agent. Reduce its visual weight without making it hover-only or inaccessible. |
| 10 | Not confirmed as a problem. The live narrow screenshot shows a flexible search field in the global header; `max-w-xl` is a maximum width, not a fixed 576px field. |
| 11 | Not supported by current source. “Export Report” and “Manage Agents” both use an outlined secondary button treatment; one exports, the other navigates. |
| 12 | Not an issue. The Sentiment & Intent Outcomes and Call Resolution Pipeline content share the same bordered card with a divider between them. |

### Suggested Analytics page order

1. Change the KPI grid to two columns on narrow screens so visualizations are reachable sooner.
2. Correct the H1/H2/H3 structure for major analytics sections.
3. Make the repeated leaderboard action quieter while keeping it touch- and keyboard-accessible.
4. Increase the pipeline subheading readability and ignore the unconfirmed color-count/search-width claims.

**Additional source area:** src/pages/analytics/AnalyticsPage.tsx.

## Workspaces page review of the supplied 12-item heuristic list

I checked the signed-in `/workspaces` page in the browser at a narrow viewport and cross-checked `WorkspacesPage.tsx`, `Sidebar.tsx`, and the app header. The list has only one search field, and the Workspaces count badge has a clear gap from its label. The most important live-view issue is that the metric values are not visually legible on the light cards; the accessibility tree exposes them, but the screenshot shows the labels and helper text with the value area blank. The workspace list also starts near the bottom of the first mobile view after four metric cards.

### P1 — Restore contrast for workspace metric values

The four metric cards show their labels and supporting text, but the main values are not readable in the live narrow screenshot even though the accessibility tree contains them. Check the light/dark surface pairing: the values use `text-white`, while the rendered cards appear white. Use a text color with sufficient contrast against the actual rendered card background (or render the card in the intended dark surface). Ensure unavailable values such as “—” remain visible too.

### P1 — Bring workspace identity higher in the mobile view

Four summary cards occupy a large 2×2 block before the search and workspace cards. At the reviewed width, the first workspace card starts at the very bottom of the initial screen, so the customer cannot identify or switch their workspace without scrolling. Reduce the summary cards to a compact strip or prioritize the workspace list above secondary aggregate metrics, especially when several values are unavailable.

### P2 — Make the workspace name lead the card hierarchy

The workspace ID is a technical identifier shown beside the title in a high-contrast pill. Keep it available for reference/copying, but make the workspace name and Active state the primary scan targets; use muted, compact styling for the ID.

### P2 — Correct the workspace card heading level

“Default workspace” is currently an `<h3>` directly after the page `<h1>`. Use an `<h2>` for each workspace card (or introduce a section H2 and then nest cards at the appropriate level) so users can navigate the list by meaningful headings.

### Triage of the supplied 12 findings

| # | Assessment |
|---|---|
| 1 | Deprioritize the raw count of 17 text colors. Check semantic roles and contrast; the visible metric-value contrast is the actionable issue. |
| 2 | Review shared button variants, but 7 styles alone do not establish a user-facing problem. |
| 3 | Repeated shell-brand metadata from earlier pages; keep secondary metadata legible. |
| 4 | “ACTIVE WORKSPACE” is a short label; sentence case is optional polish. |
| 5 | Repeated shell organization metadata issue from earlier pages. |
| 6 | Partly useful. “Active workspace records” is 11px, but the contrast and first-view hierarchy findings matter more. |
| 7 | Keep. Workspace card names are H3 immediately after the page H1; adjust the heading outline. |
| 8 | Not confirmed. The live page and source show one workspace search field above the workspace grid. |
| 9 | Partly useful and visible in the live screenshot: the technical ID pill attracts attention before the workspace name is fully in view. De-emphasize the ID while retaining access to it. |
| 10 | The global New Agent shortcut is only 11px with minimal vertical padding. Though it is not this page’s main action, make the shared shell target at least 32px high for comfortable interaction while preserving its utility-action hierarchy. |
| 11 | Keep, reframed. Four aggregate metric cards push the workspace list down; compact them, especially where the values are unavailable. |
| 12 | Not confirmed. The Workspaces count is right-aligned using `justify-between` and has pill padding, so it is not cramped against the label in the source. |

### Suggested Workspaces page order

1. Fix the metric-value contrast on the rendered cards.
2. Compact or reposition summary metrics so workspace names and switch controls appear sooner on mobile.
3. De-emphasize technical IDs and fix the workspace-card heading hierarchy.
4. Keep the single search field and current count-badge spacing.

**Additional source areas:** src/pages/workspaces/WorkspacesPage.tsx, src/components/layout/Sidebar.tsx, src/components/layout/AppLayout.tsx.

## Settings page review of the supplied 11-item heuristic list

I checked the signed-in `/settings` page in the browser at a narrow viewport and cross-checked `SettingsPage.tsx` and `SettingsNav.tsx`. The page currently presents two stacked horizontal navigation rows. Several labels in the inner row repeat destinations already available in the settings navigation (Workspaces, Team, Billing, Security, and API keys/Integrations). The form also places its only “Save Changes” action at the top, before a long series of fields and feature toggles.

### P1 — Remove the duplicate settings navigation layer

Keep one clear top-level settings navigation. The second row currently mixes form sections with destinations that already have their own top-level pages, making it unclear whether a click changes the page or scrolls within General settings. Remove duplicated destinations from the inner row. If the General page needs section navigation, present it as clearly labeled in-page anchors or a compact section list, visually distinct from route navigation.

### P1 — Keep Save Changes reachable after the fields

“Save Changes” appears only in the Organization Voice Profile card header, before six fields and two feature toggles. Users who edit the lower fields must scroll back up to save. Add a matching action at the end of the form or use a clearly visible sticky form footer; retain the top action only if it has a clear purpose such as saving without scrolling.

### P2 — Improve settings control and status readability

The right-side “Voice Architecture Status” heading and several status details use compact all-caps or 11–12px styling. Use sentence/title case for the heading, raise meaningful supporting copy to 12–13px, and keep technical abbreviations only where they help scanability. The feature-toggle controls can remain right-aligned as a conventional settings pattern; keep each label/description grouped with its checkbox and ensure the checkbox has an accessible label.

### P2 — Verify the visible contrast of the Save action

The source gives “Save Changes” a filled emerald class, but the live narrow screenshot renders it with a pale, low-emphasis appearance. Check the rendered theme/contrast so it reads as the primary form action. The audit’s claim that the source button is ghost-styled does not match the source markup.

### Triage of the supplied 11 findings

| # | Assessment |
|---|---|
| 1 | Deprioritize the raw count of 14 text colors. Check semantic roles and contrast. |
| 2 | Review intentional shared button variants; 10 styles alone do not establish a problem. |
| 3 | Repeated shell-brand metadata from earlier pages; keep secondary metadata legible. |
| 4 | “ACTIVE WORKSPACE” is a short label; sentence case is optional polish. |
| 5 | Repeated shell organization metadata from earlier pages. |
| 6 | Keep. “Voice Architecture Status” is an all-caps section heading; use sentence/title case. |
| 7 | Keep, reframed: the two horizontal rows are distinct route and in-page navigation, but they duplicate destinations and are visually similar. Simplify the inner row and make any remaining section navigation explicit. |
| 8 | Not confirmed as a defect. Right-aligned checkboxes are conventional for setting rows; maintain proximity by keeping each control within its label/description row and associating it accessibly. |
| 9 | Keep. The only Save Changes button is in the form header; add a bottom/sticky save action for the long form. |
| 10 | The source button is a filled emerald style, not ghost. However, the live screenshot shows it as low-emphasis/pale, so verify actual rendered contrast and visual priority. |
| 11 | Partly useful. The right status/export column is compact and has multiple status treatments; title-case its headings and reduce low-value accent noise if it competes with the form. |

### Suggested Settings page order

1. Remove duplicated settings destinations from the second navigation row; make any remaining links clearly in-page.
2. Add a Save Changes action after the form fields (or a sticky footer).
3. Verify Save button contrast in the rendered theme.
4. Improve status-copy sizing and heading case while preserving familiar right-aligned toggle controls.

**Additional source areas:** src/pages/settings/SettingsPage.tsx, src/components/layout/SettingsNav.tsx, src/components/layout/AppLayout.tsx.

## Help page review of the supplied 10-item heuristic list

I checked the signed-in `/help` page in the browser at a narrow viewport and cross-checked `HelpSupportPage.tsx`. The help hero is prominent and its search field and topic shortcuts are easy to find, but the hero title and supporting text are too dim against the dark background in the live rendering. The system-status card also communicates conflicting states: its overall badge says “Status unavailable,” while every component dot is green.

### P1 — Improve hero text contrast

“How can we help you?”, its supporting sentence, and the “Popular topics” label are difficult to read against the dark hero in the live narrow view. Use brighter text tokens with adequate contrast, particularly for the hero heading and the small topic label. Keep topic chips visually distinct from the hero surface and maintain a visible focus state.

### P1 — Make unavailable service health look unknown

The overall status badge says “Status unavailable” and the supporting text says live health is not connected, yet API, Telephony, Voice Agents, and Dashboard all show green dots. Use neutral/unknown indicators until live status is known, or clearly label the green dots as configured/available rather than live/active. Do not imply that these services are currently healthy when the overall state is unavailable.

### P2 — Preserve a clear support-action hierarchy and contrast

The source already presents “Open a Support Ticket” as an outlined secondary action and “Contact Support” as the filled blue primary action, so the alleged split-primary hierarchy is not present. The live render does make the secondary action’s label unusually dim; verify its text/border contrast while keeping the primary-versus-secondary distinction.

### Triage of the supplied 10 findings

| # | Assessment |
|---|---|
| 1 | Deprioritize the raw count of 16 text colors. Check semantic roles and contrast. |
| 2 | Review shared button variants, but 12 styles alone do not establish a usability issue. |
| 3 | Repeated shell-brand metadata from earlier pages; keep secondary metadata legible. |
| 4 | “ACTIVE WORKSPACE” is a short label; sentence case is optional polish. |
| 5 | Repeated shell organization metadata from earlier pages. |
| 6 | Not supported by source: Open a Support Ticket is outlined and Contact Support is filled. The hierarchy is clear; improve the low-contrast secondary label seen in the live view. |
| 7 | Keep. The live hero heading, instructions, and Popular topics label are too dim against the dark background. |
| 8 | Not a defect at the reviewed mobile width. The topics wrap into two balanced rows (four then two); wrapping is expected and not excessive. |
| 9 | Deprioritize here. New Agent is a global shell shortcut, not the primary action for help. If its 11px/short target needs adjustment, do it consistently in the shared shell. |
| 10 | Keep. System Status says unavailable while all four service indicators are green; render unknown states consistently until health data exists. |

### Suggested Help page order

1. Raise contrast for the help-hero heading, instructions, and topic label.
2. Align service dots with the overall unavailable/unknown status.
3. Improve the secondary support action’s contrast while preserving the clear primary action.
4. Keep the responsive topic-chip wrapping and shared-shell actions unless a broader shell review calls for a consistent change.

**Additional source area:** src/pages/help/HelpSupportPage.tsx.

## UI implementation status

The highest-value recommendations above have been applied in the frontend:

- **Home and shared shell:** Home no longer contains an agent prompt, dictation control, or create modal. It is a workspace hub with shortcuts to Voice Agents, Live Calls, Campaigns, Analytics, Knowledge, and Integrations. The duplicate “Create with AI” sidebar and command-palette entries were removed; the shared New Agent button is the single global creation shortcut. Legacy creation links route to the canonical Agents flow.
- **Dashboard and Agents:** Setup guidance can collapse and defaults to collapsed for workspaces that already have call activity. Quick Actions now focus on live calls, campaigns, and analytics. Agent loading is distinct from an empty workspace; zero-value metrics are suppressed in the empty state, duplicate Marketplace entry points are removed, and create labels are consistent.
- **Voices, Knowledge, Campaigns, and Contacts:** Voice samples are more readable and section headings follow the page hierarchy. Empty libraries prioritize their next step over zero-value metrics, while their empty and filtered states have clearer copy and consistent actions.
- **Integrations and Settings:** API-key empty guidance has a stronger in-context action, while the page-level API-key shortcut jumps to that section. Settings navigation is consolidated into one route-based row, including a dedicated Telephony Capacity page. General settings now has a save action after the fields, clearer status copy, and labeled toggles.
- **Live Calls and Call History:** Only Call History is active on its route; duplicate history actions are removed, empty detail panels no longer compete with the main empty state, contextual searches have accessible names, and the breadcrumb matches the page.
- **Observability, Analytics, and Workspaces:** Metric grids become two columns at narrower tablet widths, major sections use appropriate headings, helper copy is more readable, and workspace identity appears sooner on mobile with explicit metric contrast.
- **Help:** Hero contrast is tuned for the dark gradient in the light portal theme, the secondary support action remains legible, and service indicators use a neutral unknown state until health data is available.
- **Agent creation:** The description-first flow collects a natural-language brief, knowledge sources, and guardrails. Use-case presets and separate name/role/greeting/model/voice questions were removed from that flow. Its request omits name, role, and voice IDs so the backend can derive metadata and apply workspace defaults. Marketplace blueprint clones keep their explicit template metadata but send a descriptive brief instead of a raw system-prompt preset. The brief can cover caller goals, allowed actions, languages, and handoff behavior; knowledge is attached as retrievable source IDs. Data redaction and knowledge grounding are always-on platform controls; customers cannot switch them off. Organization-defined restricted topics, prohibited promises, and deterministic handoff phrases remain configurable. AI and recording disclosure fields are present but do not block draft creation; approved wording is required before activation, and no legal copy is prefilled. The request includes required disclosure and outbound DND/DNC compliance flags for backend enforcement. Voice selection and detailed call behavior remain post-creation configuration.

#### Agent intent intake: UI contract and review flow

The front end collects the customer’s intent in plain language, optional knowledge sources, and safety boundaries. Its request contract does not include a customer-authored runtime prompt; prompt construction, structured config versioning, API/RAG retrieval, tool allowlists, output filtering, and deterministic escalation remain backend responsibilities. The intended next stage is an intake response that can ask one targeted follow-up at a time, then return a readable configuration summary for customer correction and approval before evaluation and go-live. The current create modal does not fabricate those LLM results; wire these review states to the backend intake response when that endpoint is ready.

Agent Studio now presents runtime instructions as platform-rendered from the approved configuration. Its raw Markdown prompt editor and text-appending Composer were removed so customers cannot bypass structured fields and runtime guardrails.

Disclosures for AI identity and call recording are required before activation, while drafts can be created before approved copy is ready. The customer supplies approved wording. Outbound DND/DNC and applicable TRAI checks are communicated as an always-required backend rule rather than an optional checkbox. Voice, language configuration, interruption timing, telephony assignment, recording operations, and escalation destinations remain in post-draft setup because they are operational deployment settings rather than extra intake questions.

#### Product-led activation recommendation

Optimize for a saved, useful draft quickly: collect the brief, let customers attach knowledge, and allow them to add organization-specific guardrails without requiring legal copy up front. Then let the intake service ask one focused question at a time, show a field-by-field summary for approval, and launch generated happy-path and adversarial evaluations. Keep privacy redaction and grounded retrieval always on. Block activation until required disclosures, deterministic safety checks, and applicable outbound compliance checks are complete and evaluations pass. The front end should surface these states from backend results instead of simulating them.

### Voice AI setup fields to configure after draft creation

These settings matter for production calls, but are not required as separate fields in the initial creation flow:

- **Voice and language:** Select the TTS voice, supported caller language, and pronunciation preferences.
- **Conversation timing:** Configure interruptions, end-of-turn detection, silence handling, and response pacing.
- **Telephony deployment:** Assign a phone number/provider and set inbound or outbound routing, caller ID, and calling hours.
- **Call operations:** Review recording behavior, voicemail handling, retries, and escalation destinations.

Use sensible workspace defaults when creating a draft, then surface these controls in the agent’s configuration before deployment. Keep recording disclosure and safety boundaries in the initial guardrails step because they affect what the agent is allowed to do during calls.

Scope remains frontend UI and navigation. No backend behavior was changed.
