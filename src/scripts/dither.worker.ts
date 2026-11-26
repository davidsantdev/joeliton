/**
 * Web Worker do fundo dither: dono do contexto WebGL (via OffscreenCanvas).
 * Criação de contexto, compilação de shader e cada quadro acontecem aqui —
 * a thread principal nunca espera pela GPU.
 */
import { DitherEngine, type DitherInput, type DitherOptions } from './dither-engine';

type Message =
  | { type: 'init'; canvas: OffscreenCanvas; options: DitherOptions; input: DitherInput }
  | { type: 'input'; input: DitherInput };

const scope = self as unknown as {
  postMessage(message: unknown): void;
  onmessage: ((event: MessageEvent<Message>) => void) | null;
};

let engine: DitherEngine | null = null;

scope.onmessage = ({ data }) => {
  if (data.type === 'init') {
    engine = new DitherEngine(data.canvas, data.options, (type) => scope.postMessage({ type }));
    engine.update(data.input);
    engine.init();
  } else {
    engine?.update(data.input);
  }
};
