import {
  approveDraft,
  draftFollowUp,
  focusConversation,
  getPipelineSnapshot,
  getState,
  moveDealStage,
  subscribe,
  type Contact,
  type CrmState,
  type DealStage,
  type Language,
} from './crm';

let activeRoot: HTMLElement | null = null;
let unsubscribe: (() => void) | null = null;
let webMcpMode: 'checking' | 'native' | 'preview' = 'checking';

const icon = (name: 'inbox' | 'pipeline' | 'agent' | 'shield' | 'arrow' | 'spark') => {
  const paths = {
    inbox: '<path d="M4 5.5h16v13H4z"/><path d="M4 14h4l2 2h4l2-2h4"/>',
    pipeline: '<path d="M5 5h14M7 5v6h10V5M9 11v8m6-8v8M6 19h6m0 0h6"/>',
    agent: '<circle cx="12" cy="8" r="3"/><path d="M5 20c.8-4 3.1-6 7-6s6.2 2 7 6"/><path d="M18 5l1.5-1.5M6 5 4.5 3.5"/>',
    shield: '<path d="M12 3 5 6v5c0 4.6 2.7 8 7 10 4.3-2 7-5.4 7-10V6z"/><path d="m9 12 2 2 4-4"/>',
    arrow: '<path d="m9 18 6-6-6-6"/>',
    spark: '<path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4z"/><path d="m18 15 .8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z"/>',
  };
  return `<svg aria-hidden="true" viewBox="0 0 24 24">${paths[name]}</svg>`;
};

const money = (value: number) => `$${value.toLocaleString('en-US')}`;
const priorityLabel = { high: 'Priority', medium: 'Active', low: 'Normal' } as const;
const stageLabel: Record<DealStage, string> = { new: 'New lead', qualified: 'Qualified', proposal: 'Proposal' };
const languageLabel: Record<Language, string> = { ckb: 'Sorani', ar: 'Arabic', en: 'English' };

function conversationItem(contact: Contact, selected: boolean) {
  return `<button class="conversation ${selected ? 'is-active' : ''}" data-contact-id="${contact.id}">
    <span class="avatar">${contact.company.slice(0, 2).toUpperCase()}</span>
    <span class="conversation-copy">
      <span class="conversation-line"><strong>${contact.company}</strong><small>${contact.waitingMinutes}m</small></span>
      <span>${contact.lastMessage}</span>
      <span class="meta"><i class="priority priority-${contact.priority}"></i>${priorityLabel[contact.priority]} · ${contact.channel}</span>
    </span>
  </button>`;
}

function render(root: HTMLElement, state: CrmState) {
  const snapshot = getPipelineSnapshot();
  const focused = state.contacts.find((contact) => contact.id === state.focusedContactId) ?? state.contacts[0];
  const contactDrafts = state.drafts.filter((draft) => draft.contactId === focused.id);
  const total = Math.max(...Object.values(snapshot.stageCounts));

  root.innerHTML = `<div class="app-shell">
    <aside class="rail">
      <a class="brand" href="#" aria-label="Sales24 home"><span class="brand-mark">S24</span><span>Sales24</span></a>
      <nav aria-label="Primary">
        <a class="nav-item is-active" href="#workspace">${icon('inbox')}<span>Workspace</span></a>
        <a class="nav-item" href="#pipeline">${icon('pipeline')}<span>Pipeline</span></a>
        <a class="nav-item" href="#agent">${icon('agent')}<span>Agent tools</span></a>
      </nav>
      <div class="rail-note">${icon('shield')}<span>Human approval stays in control</span></div>
    </aside>

    <main>
      <header class="topbar">
        <div><p class="eyebrow">Agent-native CRM workspace</p><h1>Sales24 Agent Desk</h1></div>
        <div class="mcp-status ${webMcpMode}" data-webmcp-status><span></span>${webMcpMode === 'native' ? 'WebMCP connected' : webMcpMode === 'preview' ? 'Preview mode' : 'Checking WebMCP'}</div>
      </header>

      <section class="hero" id="workspace">
        <div><span class="hero-kicker">Humans decide. Agents accelerate.</span><h2>Turn every customer signal into a clear next action.</h2><p>Sales24 gives an agent structured access to the same multilingual inbox and pipeline the team sees, while every outbound message stays behind a human review gate.</p></div>
        <div class="tool-stack">
          <span>${icon('spark')} 5 live WebMCP tools</span>
          <code>draft_follow_up</code><code>find_priority_conversations</code><code>move_deal_stage</code>
        </div>
      </section>

      <section class="metrics" aria-label="Pipeline summary">
        <article><span>Pipeline value</span><strong>${money(snapshot.totalPipelineValue)}</strong><small>Across active opportunities</small></article>
        <article><span>Open conversations</span><strong>${snapshot.openConversations}</strong><small>${snapshot.highPriority} need priority attention</small></article>
        <article><span>Human review</span><strong>${snapshot.draftsAwaitingReview}</strong><small>Nothing sends automatically</small></article>
      </section>

      <section class="workspace-grid">
        <section class="panel inbox-panel">
          <div class="panel-head"><div><p class="eyebrow">Unified inbox</p><h3>Priority conversations</h3></div><span class="live-dot">Live</span></div>
          <div class="conversation-list">${state.contacts.map((contact) => conversationItem(contact, contact.id === focused.id)).join('')}</div>
        </section>

        <section class="panel detail-panel">
          <div class="contact-head">
            <div class="avatar large">${focused.company.slice(0, 2).toUpperCase()}</div>
            <div><p class="eyebrow">${focused.channel} · ${languageLabel[focused.language]}</p><h3 data-active-company>${focused.company}</h3><span>${focused.name}</span></div>
            <span class="deal-value">${money(focused.value)}</span>
          </div>
          <div class="message-card"><span>Latest customer message</span><p dir="auto">${focused.lastMessage}</p></div>
          <div class="action-row">
            <label>Language<select data-language><option value="${focused.language}">${languageLabel[focused.language]}</option>${(['ckb','ar','en'] as Language[]).filter((language) => language !== focused.language).map((language) => `<option value="${language}">${languageLabel[language]}</option>`).join('')}</select></label>
            <label>Goal<select data-goal><option value="book_demo">Book demo</option><option value="share_proposal">Share proposal</option><option value="check_in">Check in</option></select></label>
            <button class="primary-button" data-action="draft">${icon('spark')}Draft follow-up</button>
          </div>
          <div class="review-boundary">${icon('shield')}<div><strong>Human review required</strong><span>Agent-created messages are drafts only. No send tool is exposed.</span></div></div>
          <div class="drafts">${contactDrafts.length ? contactDrafts.map((draft) => `<article class="draft-card"><div><span class="status ${draft.status}">${draft.status === 'needs_review' ? 'Needs review' : 'Approved'}</span><span class="unsent">Not sent</span></div><p dir="auto">${draft.body}</p>${draft.status === 'needs_review' ? `<button data-approve-draft="${draft.id}">Approve draft</button>` : ''}</article>`).join('') : '<div class="empty-state">Ask your browser agent to draft a follow-up, or use the controls above.</div>'}</div>
        </section>

        <section class="panel pipeline-panel" id="pipeline">
          <div class="panel-head"><div><p class="eyebrow">Shared state</p><h3>Pipeline</h3></div><span>${snapshot.openConversations} deals</span></div>
          <div class="stage-chart">${(Object.entries(snapshot.stageCounts) as [DealStage, number][]).map(([stage, count]) => `<div class="stage-row"><span>${stageLabel[stage]}</span><div><i style="width:${(count / total) * 100}%"></i></div><strong>${count}</strong></div>`).join('')}</div>
          <label class="stage-control">Move ${focused.company}<select data-stage>${(Object.keys(stageLabel) as DealStage[]).map((stage) => `<option value="${stage}" ${focused.stage === stage ? 'selected' : ''}>${stageLabel[stage]}</option>`).join('')}</select></label>
          <div class="activity-list">${state.activities.slice(0, 3).map((activity) => `<p>${icon('arrow')}<span>${activity.message}</span></p>`).join('') || '<p class="muted">Agent and human changes appear here in real time.</p>'}</div>
        </section>
      </section>

      <section class="prompt-strip" id="agent"><span>Try in ChatGPT or Chrome with WebMCP enabled</span><code>“Find my highest-priority Arabic lead, open it, and draft a demo follow-up.”</code></section>
      <footer><span>Sales24 by Datacode</span><span>WebMCP Challenge 2026 · Demo data only</span></footer>
    </main>
  </div>`;

  root.querySelectorAll<HTMLElement>('[data-contact-id]').forEach((button) => button.addEventListener('click', () => focusConversation({ contactId: button.dataset.contactId! })));
  root.querySelector<HTMLButtonElement>('[data-action="draft"]')?.addEventListener('click', () => {
    const language = root.querySelector<HTMLSelectElement>('[data-language]')!.value as Language;
    const goal = root.querySelector<HTMLSelectElement>('[data-goal]')!.value as 'book_demo' | 'share_proposal' | 'check_in';
    draftFollowUp({ contactId: focused.id, language, goal });
  });
  root.querySelectorAll<HTMLButtonElement>('[data-approve-draft]').forEach((button) => button.addEventListener('click', () => approveDraft({ draftId: button.dataset.approveDraft! })));
  root.querySelector<HTMLSelectElement>('[data-stage]')?.addEventListener('change', (event) => moveDealStage({ contactId: focused.id, stage: (event.target as HTMLSelectElement).value as DealStage }));
}

export function setWebMcpStatus(mode: 'native' | 'preview') {
  webMcpMode = mode;
  if (activeRoot) render(activeRoot, getState());
}

export function renderApp(root: HTMLElement) {
  activeRoot = root;
  unsubscribe?.();
  unsubscribe = subscribe((state) => render(root, state));
  const state = getState();
  if (!state.focusedContactId && state.contacts[0]) state.focusedContactId = state.contacts[0].id;
  render(root, state);
}
