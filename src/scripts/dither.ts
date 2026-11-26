/**
 * Controlador do fundo "dither" na página (o motor está em dither-engine.ts).
 *
 * Performance:
 *  - só monta quando o canvas chega perto da tela e o navegador está ocioso;
 *  - renderiza num Web Worker via OffscreenCanvas: criação do contexto WebGL e compilação
 *    do shader (que no Windows/ANGLE podem levar centenas de ms) não travam a interface;
 *    sem OffscreenCanvas, cai para a thread principal;
 *  - ~30 fps, pausa fora da viewport / com a aba oculta; `prefers-reduced-motion` = quadro estático;
 *  - sem WebGL ou sem GPU de verdade (renderizador por software): o canvas some e fica
 *    o fallback estático em CSS.
 */
import type { DitherEvent, DitherInput, DitherOptions } from './dither-engine';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function readOptions(canvas: HTMLCanvasElement): DitherOptions {
  const [fx, fy] = (canvas.dataset.focus ?? '0.5,0.62').split(',').map(Number);
  return {
    cell: Number(canvas.dataset.cell ?? 3),
    density: Number(canvas.dataset.density ?? 1),
    focus: [fx, fy],
    speed: Number(canvas.dataset.speed ?? 1),
    fadeBottom: canvas.dataset.fadeBottom === '1',
  };
}

function readColors(canvas: HTMLCanvasElement): [string, string] {
  const style = getComputedStyle(canvas);
  return [style.getPropertyValue('--shader-a') || '#2f6fd8', style.getPropertyValue('--shader-b') || '#3cc8e2'];
}

function whenIdle(fn: () => void) {
  const go = () => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 200));
  if (document.readyState === 'complete') go();
  else window.addEventListener('load', go, { once: true });
}

async function mount(canvas: HTMLCanvasElement) {
  const options = readOptions(canvas);
  const host = canvas.closest<HTMLElement>('[data-dither-host]') ?? canvas.parentElement!;
  const initial: DitherInput = {
    size: [canvas.clientWidth, canvas.clientHeight],
    visible: true,
    hidden: document.hidden,
    reduced: reduceMotion.matches,
    colors: readColors(canvas),
  };

  let dispose = () => {};
  const onEvent = (type: DitherEvent) => {
    if (type === 'ready') {
      canvas.classList.add('is-ready');
    } else {
      canvas.hidden = true;
      dispose();
    }
  };

  let send: (input: DitherInput) => void;
  if ('transferControlToOffscreen' in canvas && typeof Worker === 'function') {
    const worker = new Worker(new URL('./dither.worker.ts', import.meta.url), { type: 'module' });
    const offscreen = canvas.transferControlToOffscreen();
    worker.onmessage = (e: MessageEvent<{ type: DitherEvent }>) => onEvent(e.data.type);
    worker.onerror = () => onEvent('nowebgl');
    worker.postMessage({ type: 'init', canvas: offscreen, options, input: initial }, [offscreen]);
    send = (input) => worker.postMessage({ type: 'input', input });
    dispose = () => worker.terminate();
  } else {
    const { DitherEngine } = await import('./dither-engine');
    const engine = new DitherEngine(canvas, options, onEvent);
    engine.update(initial);
    engine.init();
    send = (input) => engine.update(input);
  }

  // estado da página → motor
  new IntersectionObserver(([entry]) => send({ visible: entry.isIntersecting }), { rootMargin: '80px' }).observe(canvas);
  new ResizeObserver(([entry]) => {
    const box = entry.contentBoxSize?.[0];
    send({ size: box ? [box.inlineSize, box.blockSize] : [canvas.clientWidth, canvas.clientHeight] });
  }).observe(canvas);
  document.addEventListener('visibilitychange', () => send({ hidden: document.hidden }));
  reduceMotion.addEventListener('change', () => send({ reduced: reduceMotion.matches }));
  window.addEventListener('themechange', () => send({ colors: readColors(canvas) }));

  let last: [number, number] = [0.5, 0.6];
  host.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    last = [(e.clientX - rect.left) / rect.width, 1 - (e.clientY - rect.top) / rect.height];
    send({ pointer: [last[0], last[1], e.pointerType === 'mouse' ? 1 : 0] });
  });
  host.addEventListener('pointerleave', () => send({ pointer: [last[0], last[1], 0] }));
}

export function initDither() {
  for (const canvas of document.querySelectorAll<HTMLCanvasElement>('canvas[data-dither]')) {
    if (canvas.dataset.ready) continue;
    canvas.dataset.ready = 'true';
    // monta só quando o canvas se aproxima da tela (o do contato, por exemplo, só lá embaixo)
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        whenIdle(() => {
          mount(canvas).catch(() => (canvas.hidden = true));
        });
      },
      { rootMargin: '300px' },
    );
    io.observe(canvas);
  }
}
