/**
 * Interações globais e leves:
 *  - revelação ao rolar ([data-reveal] / [data-inview] → .is-in)
 *  - spotlight dos cards (.spot) seguindo o cursor
 *  - barra de progresso de leitura (fallback para navegadores sem scroll-driven animations)
 */

export function initReveal() {
  const targets = document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in), [data-inview]:not(.is-in)');
  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.01 },
  );
  targets.forEach((el) => observer.observe(el));
}

/**
 * Animações decorativas infinitas só rodam quando o bloco está na tela.
 * Marque o container com [data-anim]; fora da viewport ele perde [data-playing]
 * e o CSS pausa tudo dentro dele (ver global.css).
 */
export function initAnimationPausing() {
  const blocks = document.querySelectorAll<HTMLElement>('[data-anim]');
  if (!('IntersectionObserver' in window)) {
    blocks.forEach((el) => el.setAttribute('data-playing', ''));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) entry.target.toggleAttribute('data-playing', entry.isIntersecting);
    },
    { rootMargin: '120px 0px' },
  );
  blocks.forEach((el) => observer.observe(el));
}

export function initSpotlight() {
  if (!window.matchMedia('(hover: hover)').matches) return;
  document.addEventListener(
    'pointermove',
    (event) => {
      const card = (event.target as Element | null)?.closest<HTMLElement>('.spot');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      card.style.setProperty('--my', `${event.clientY - rect.top}px`);
    },
    { passive: true },
  );
}

export function initScrollProgress() {
  const bar = document.querySelector<HTMLElement>('[data-scroll-progress]');
  if (!bar || CSS.supports('animation-timeline: scroll()')) return;
  let ticking = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    ticking = false;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  update();
}
