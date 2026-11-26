/**
 * Abas acessíveis (padrão WAI-ARIA "Tabs with automatic activation"):
 * ←/→ alternam, Home/End vão às extremidades, e um indicador desliza até a aba ativa.
 */
export function initTabs() {
  for (const list of document.querySelectorAll<HTMLElement>('[data-tabs]')) {
    const tabs = [...list.querySelectorAll<HTMLButtonElement>('[data-tab]')];
    const indicator = list.querySelector<HTMLElement>('[data-tab-indicator]');

    const place = (tab: HTMLElement) => {
      indicator?.style.setProperty('--x', `${tab.offsetLeft}px`);
      indicator?.style.setProperty('--w', `${tab.offsetWidth}px`);
    };

    const select = (tab: HTMLButtonElement, focus = false) => {
      for (const t of tabs) {
        const selected = t === tab;
        t.setAttribute('aria-selected', String(selected));
        t.tabIndex = selected ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls') ?? '');
        if (panel) panel.hidden = !selected;
      }
      place(tab);
      if (focus) tab.focus();
    };

    list.addEventListener('click', (e) => {
      const tab = (e.target as Element).closest<HTMLButtonElement>('[data-tab]');
      if (tab) select(tab);
    });

    list.addEventListener('keydown', (e) => {
      const current = tabs.indexOf(document.activeElement as HTMLButtonElement);
      if (current < 0) return;
      const next =
        e.key === 'ArrowRight'
          ? (current + 1) % tabs.length
          : e.key === 'ArrowLeft'
            ? (current - 1 + tabs.length) % tabs.length
            : e.key === 'Home'
              ? 0
              : e.key === 'End'
                ? tabs.length - 1
                : -1;
      if (next < 0) return;
      e.preventDefault();
      select(tabs[next], true);
    });

    // O ResizeObserver dispara logo após o layout (inclusive na 1ª vez e quando a fonte carrega):
    // medir ali evita forçar um layout síncrono da página na inicialização.
    const active = () => tabs.find((t) => t.getAttribute('aria-selected') === 'true') ?? tabs[0];
    new ResizeObserver(() => place(active())).observe(list);
  }
}
