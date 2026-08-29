import { beforeEach, describe, expect, it } from 'vitest';
import {
  approveDraft,
  createInitialState,
  draftFollowUp,
  findPriorityConversations,
  getPipelineSnapshot,
  moveDealStage,
  resetState,
} from '../src/crm';

beforeEach(() => resetState());

describe('Sales24 shared CRM state', () => {
  it('summarizes the pipeline and open conversation load', () => {
    const snapshot = getPipelineSnapshot();
    expect(snapshot.totalPipelineValue).toBe(124500);
    expect(snapshot.openConversations).toBe(6);
    expect(snapshot.stageCounts).toEqual({ new: 2, qualified: 2, proposal: 2 });
  });

  it('finds high-priority conversations by language without mutating state', () => {
    const before = createInitialState();
    const result = findPriorityConversations({ language: 'ar', priority: 'high' });
    expect(result.map((item) => item.company)).toEqual(['Narin Solar']);
    expect(createInitialState()).toEqual(before);
  });

  it('creates a review-only multilingual follow-up draft and never sends it', () => {
    const result = draftFollowUp({ contactId: 'c-102', language: 'ckb', goal: 'book_demo' });
    expect(result.status).toBe('needs_review');
    expect(result.sent).toBe(false);
    expect(result.body).toContain('دیمۆ');
  });

  it('requires human approval before a draft becomes approved', () => {
    const draft = draftFollowUp({ contactId: 'c-101', language: 'ar', goal: 'share_proposal' });
    const approved = approveDraft({ draftId: draft.id });
    expect(approved.status).toBe('approved');
    expect(approved.sent).toBe(false);
  });

  it('moves a deal and records the visible activity', () => {
    const result = moveDealStage({ contactId: 'c-103', stage: 'proposal' });
    expect(result.previousStage).toBe('qualified');
    expect(result.stage).toBe('proposal');
    expect(result.activity.message).toContain('Proposal');
  });
});
