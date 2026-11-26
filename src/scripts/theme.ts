/**
 * Alternância de tema claro/escuro.
 * - Persiste em localStorage (aplicado antes da pintura por um script inline no <head>).
 * - Usa a View Transitions API para revelar o novo tema num círculo a partir do botão.
 * - Emite `themechange` para quem depende de cores lidas via JS (ex.: shader WebGL).
 */
export type Theme = 'dark' | 'light';

const KEY = 'jes-theme';
const THEME_COLOR: Record<Theme, string> = { dark: '#060a13', light: '#f3f6fb' };

const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

export const currentTheme = (): Theme => (root.dataset.theme === 'light' ? 'light' : 'dark');

function syncUi(theme: Theme) {
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', THEME_COLOR[theme]);
  for (const btn of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
    btn.setAttribute('aria-label', theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro');
  }
}

function applyTheme(theme: Theme) {
  if (theme === 'light') root.dataset.theme = 'light';
  else delete root.dataset.theme;
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* modo privado / storage bloqueado: segue só na sessão */
  }
  syncUi(theme);
  window.dispatchEvent(new CustomEvent<Theme>('themechange', { detail: theme }));
}

function toggleFrom(button: HTMLElement) {
  const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';

  if (!document.startViewTransition || reducedMotion.matches) {
    applyTheme(next);
    return;
  }

  const rect = button.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

  const transition = document.startViewTransition(() => applyTheme(next));
  transition.ready
    .then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        {
          duration: 700,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          pseudoElement: '::view-transition-new(root)',
        },
      );
    })
    .catch(() => {
      /* transição abortada: o tema já foi aplicado */
    });
}

let bound = false;

export function initThemeToggles() {
  syncUi(currentTheme());
  if (bound) return;
  bound = true;
  // Delegação: funciona para qualquer botão [data-theme-toggle], inclusive os do menu mobile.
  document.addEventListener('click', (event) => {
    const button = (event.target as Element | null)?.closest<HTMLElement>('[data-theme-toggle]');
    if (button) toggleFrom(button);
  });
}
