/**
 * Cabeçalho: estado "scrolled", menu mobile acessível e scrollspy com indicador deslizante.
 */
export function initHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;

  /* ---------------------------------------------------------------- scrolled */
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      header.toggleAttribute('data-scrolled', window.scrollY > 24);
      ticking = false;
    });
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ------------------------------------------------------------- menu mobile */
  const toggle = header.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = header.querySelector<HTMLElement>('[data-mobile-menu]');

  const setOpen = (open: boolean, { focusToggle = false } = {}) => {
    if (!toggle || !menu) return;
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    header.toggleAttribute('data-open', open);
    if (open) menu.querySelector<HTMLElement>('a, button')?.focus({ preventScroll: true });
    else if (focusToggle) toggle.focus();
  };

  toggle?.addEventListener('click', () => setOpen(menu?.hidden ?? false));
  menu?.addEventListener('click', (e) => {
    if ((e.target as Element).closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu && !menu.hidden) setOpen(false, { focusToggle: true });
  });
  document.addEventListener('click', (e) => {
    if (menu && !menu.hidden && !header.contains(e.target as Node)) setOpen(false);
  });
  window.matchMedia('(min-width: 64rem)').addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });

  /* ---------------------------------------------------- scrollspy + indicador */
  const list = header.querySelector<HTMLElement>('[data-nav-links]');
  const indicator = header.querySelector<HTMLElement>('[data-nav-indicator]');
  const links = [...header.querySelectorAll<HTMLAnchorElement>('[data-nav-links] [data-nav-link]')];
  if (!list || !indicator || links.length === 0) return;

  let active: HTMLAnchorElement | null = null;

  const moveIndicator = (link: HTMLAnchorElement | null) => {
    if (!link) {
      indicator.removeAttribute('data-visible');
      return;
    }
    indicator.style.setProperty('--x', `${link.offsetLeft}px`);
    indicator.style.setProperty('--w', `${link.offsetWidth}px`);
    indicator.setAttribute('data-visible', '');
  };

  const setActive = (id: string | null) => {
    active = links.find((l) => l.hash === `#${id}`) ?? null;
    for (const l of links) {
      if (l === active) l.setAttribute('aria-current', 'true');
      else l.removeAttribute('aria-current');
    }
    if (!list.matches(':hover')) moveIndicator(active);
  };

  for (const link of links) link.addEventListener('mouseenter', () => moveIndicator(link));
  list.addEventListener('mouseleave', () => moveIndicator(active));

  const sections = links
    .map((l) => document.getElementById(l.hash.slice(1)))
    .filter((s): s is HTMLElement => !!s);

  const visible = new Set<string>();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      }
      // a seção ativa é a primeira (na ordem do documento) cruzando a faixa de leitura
      const current = sections.find((s) => visible.has(s.id));
      setActive(current?.id ?? null);
    },
    { rootMargin: '-38% 0px -55% 0px' },
  );
  sections.forEach((s) => observer.observe(s));

  // reposiciona o indicador quando a fonte carrega / a janela muda de tamanho
  const relayout = () => moveIndicator(active);
  window.addEventListener('resize', relayout);
  document.fonts?.ready.then(relayout);
}
