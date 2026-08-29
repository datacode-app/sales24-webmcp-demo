export type Language = 'ckb' | 'ar' | 'en';
export type Priority = 'high' | 'medium' | 'low';
export type DealStage = 'new' | 'qualified' | 'proposal';
export type FollowUpGoal = 'book_demo' | 'share_proposal' | 'check_in';

export interface Contact {
  id: string;
  name: string;
  company: string;
  language: Language;
  priority: Priority;
  stage: DealStage;
  value: number;
  channel: 'WhatsApp' | 'Instagram' | 'Messenger';
  lastMessage: string;
  waitingMinutes: number;
}

export interface Draft {
  id: string;
  contactId: string;
  language: Language;
  goal: FollowUpGoal;
  body: string;
  status: 'needs_review' | 'approved';
  sent: false;
}

export interface Activity {
  id: string;
  message: string;
  at: string;
}

export interface CrmState {
  contacts: Contact[];
  drafts: Draft[];
  activities: Activity[];
  focusedContactId: string | null;
}

const seedContacts: Contact[] = [
  { id: 'c-101', name: 'Dilan Ahmed', company: 'Narin Solar', language: 'ar', priority: 'high', stage: 'qualified', value: 32000, channel: 'WhatsApp', lastMessage: 'Can you share the commercial terms?', waitingMinutes: 74 },
  { id: 'c-102', name: 'Shaho Karim', company: 'Roj Solar', language: 'ckb', priority: 'high', stage: 'new', value: 24000, channel: 'Instagram', lastMessage: 'دەتوانین دیمۆیەک ببینین؟', waitingMinutes: 42 },
  { id: 'c-103', name: 'Sara Mahmoud', company: 'Helio Systems', language: 'en', priority: 'medium', stage: 'proposal', value: 18500, channel: 'Messenger', lastMessage: 'Please send available onboarding times.', waitingMinutes: 31 },
  { id: 'c-104', name: 'Omar Aziz', company: 'Mesopotamia Energy', language: 'ar', priority: 'low', stage: 'new', value: 20000, channel: 'WhatsApp', lastMessage: 'نحتاج تفاصيل أكثر عن النظام.', waitingMinutes: 18 },
  { id: 'c-105', name: 'Kawa Salih', company: 'Zagros Renewables', language: 'ckb', priority: 'medium', stage: 'proposal', value: 15000, channel: 'Instagram', lastMessage: 'نرخ و ماوەی دامەزراندن چەندە؟', waitingMinutes: 12 },
  { id: 'c-106', name: 'Lana Hassan', company: 'SunGrid Iraq', language: 'en', priority: 'low', stage: 'qualified', value: 15000, channel: 'WhatsApp', lastMessage: 'Can your team support Arabic?', waitingMinutes: 6 },
];

const clone = <T>(value: T): T => structuredClone(value);

export function createInitialState(): CrmState {
  return { contacts: clone(seedContacts), drafts: [], activities: [], focusedContactId: null };
}

let state = createInitialState();
const listeners = new Set<(state: CrmState) => void>();

function notify(): void {
  const snapshot = getState();
  listeners.forEach((listener) => listener(snapshot));
}

export function getState(): CrmState {
  return clone(state);
}

export function resetState(): CrmState {
  state = createInitialState();
  notify();
  return getState();
}

export function subscribe(listener: (next: CrmState) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getPipelineSnapshot() {
  const stageCounts: Record<DealStage, number> = { new: 0, qualified: 0, proposal: 0 };
  for (const contact of state.contacts) stageCounts[contact.stage] += 1;
  return {
    totalPipelineValue: state.contacts.reduce((sum, contact) => sum + contact.value, 0),
    openConversations: state.contacts.length,
    highPriority: state.contacts.filter((contact) => contact.priority === 'high').length,
    draftsAwaitingReview: state.drafts.filter((draft) => draft.status === 'needs_review').length,
    stageCounts,
  };
}

export function findPriorityConversations(filters: { language?: Language; priority?: Priority; limit?: number }) {
  const limit = Math.max(1, Math.min(filters.limit ?? 6, 20));
  return state.contacts
    .filter((contact) => !filters.language || contact.language === filters.language)
    .filter((contact) => !filters.priority || contact.priority === filters.priority)
    .sort((a, b) => b.waitingMinutes - a.waitingMinutes)
    .slice(0, limit)
    .map((contact) => clone(contact));
}

export function focusConversation({ contactId }: { contactId: string }) {
  const contact = state.contacts.find((item) => item.id === contactId);
  if (!contact) throw new Error(`Unknown contact: ${contactId}`);
  state.focusedContactId = contactId;
  notify();
  return clone(contact);
}

const copyByLanguage: Record<Language, Record<FollowUpGoal, string>> = {
  ckb: {
    book_demo: 'سڵاو، دەتوانین دیمۆیەکی کورت بۆ پیشاندانی Sales24 ڕێکبخەین. کام کات بۆتان گونجاوە؟',
    share_proposal: 'سڵاو، پێشنیارەکەمان ئامادەیە. دەتوانم وردەکارییەکان بۆ پێداچوونەوەتان بنێرم.',
    check_in: 'سڵاو، دەمەوێت بزانم ئایا زانیاری زیاتر لەبارەی Sales24 پێویستتانە؟',
  },
  ar: {
    book_demo: 'مرحباً، يمكننا ترتيب عرض قصير لنظام Sales24. ما الوقت المناسب لكم؟',
    share_proposal: 'مرحباً، أصبح عرضنا جاهزاً. يمكنني إرسال التفاصيل لمراجعتكم.',
    check_in: 'مرحباً، هل تحتاجون إلى معلومات إضافية عن Sales24؟',
  },
  en: {
    book_demo: 'Hello, we can arrange a short Sales24 demo. What time works for you?',
    share_proposal: 'Hello, your proposal is ready. I can share the details for your review.',
    check_in: 'Hello, do you need any more information about Sales24?',
  },
};

export function draftFollowUp(input: { contactId: string; language: Language; goal: FollowUpGoal }): Draft {
  const contact = state.contacts.find((item) => item.id === input.contactId);
  if (!contact) throw new Error(`Unknown contact: ${input.contactId}`);
  const draft: Draft = {
    id: `draft-${state.drafts.length + 1}`,
    contactId: contact.id,
    language: input.language,
    goal: input.goal,
    body: copyByLanguage[input.language][input.goal],
    status: 'needs_review',
    sent: false,
  };
  state.drafts = [draft, ...state.drafts];
  state.activities = [{ id: `activity-${Date.now()}`, message: `Draft prepared for ${contact.company}; human review required.`, at: new Date().toISOString() }, ...state.activities];
  notify();
  return clone(draft);
}

export function approveDraft({ draftId }: { draftId: string }): Draft {
  const draft = state.drafts.find((item) => item.id === draftId);
  if (!draft) throw new Error(`Unknown draft: ${draftId}`);
  draft.status = 'approved';
  const contact = state.contacts.find((item) => item.id === draft.contactId)!;
  state.activities = [{ id: `activity-${Date.now()}`, message: `Human approved the draft for ${contact.company}; message remains unsent.`, at: new Date().toISOString() }, ...state.activities];
  notify();
  return clone(draft);
}

export function moveDealStage({ contactId, stage }: { contactId: string; stage: DealStage }) {
  const contact = state.contacts.find((item) => item.id === contactId);
  if (!contact) throw new Error(`Unknown contact: ${contactId}`);
  const previousStage = contact.stage;
  contact.stage = stage;
  const labels: Record<DealStage, string> = { new: 'New lead', qualified: 'Qualified', proposal: 'Proposal' };
  const activity = { id: `activity-${Date.now()}`, message: `${contact.company} moved to ${labels[stage]}.`, at: new Date().toISOString() };
  state.activities = [activity, ...state.activities];
  notify();
  return { contactId, previousStage, stage, activity };
}
