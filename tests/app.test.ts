import { beforeEach, describe, expect, it } from 'vitest';
import { resetState } from '../src/crm';
import { renderApp } from '../src/ui';

beforeEach(() => {
  resetState();
  document.body.innerHTML = '<div id="app"></div>';
});

describe('Sales24 Agent Desk UI', () => {
  it('renders the shared pipeline and human review boundary', () => {
    renderApp(document.querySelector<HTMLDivElement>('#app')!);
    expect(document.body.textContent).toContain('$124,500');
    expect(document.body.textContent).toContain('Human review required');
    expect(document.querySelectorAll('[data-contact-id]')).toHaveLength(6);
  });

  it('opens the same conversation that an agent focuses', () => {
    renderApp(document.querySelector<HTMLDivElement>('#app')!);
    document.querySelector<HTMLElement>('[data-contact-id="c-102"]')!.click();
    expect(document.querySelector('[data-active-company]')?.textContent).toContain('Roj Solar');
  });

  it('creates a visible unsent draft from the human controls', () => {
    renderApp(document.querySelector<HTMLDivElement>('#app')!);
    document.querySelector<HTMLElement>('[data-contact-id="c-101"]')!.click();
    document.querySelector<HTMLButtonElement>('[data-action="draft"]')!.click();
    expect(document.body.textContent).toContain('Needs review');
    expect(document.body.textContent).toContain('Not sent');
  });
});
