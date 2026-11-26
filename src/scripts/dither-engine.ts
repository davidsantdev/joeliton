/**
 * Motor do fundo "dither" em WebGL — feito à mão, sem dependências.
 *
 * Um campo de ruído simplex com domain warping vira "curvas de nível" (ridged noise),
 * quantizadas com uma matriz de Bayer 8×8. O canvas é renderizado em baixa resolução
 * (1 pixel = 1 célula do dither) e ampliado com `image-rendering: pixelated`.
 *
 * Roda igual num Web Worker (OffscreenCanvas) ou na thread principal (fallback):
 * não toca em `window`/`document`; recebe todo o estado de fora via `update()`.
 */

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;

uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_mouse;   // 0..1, origem embaixo à esquerda
uniform float u_hover;   // 0..1
uniform vec3  u_a;
uniform vec3  u_b;
uniform float u_density;
uniform vec2  u_focus;   // centro da composição (uv)
uniform float u_fade;    // 1 = esmaece a base do canvas

float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

// Simplex 2D — Ashima Arts / Stefan Gustavson (MIT)
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x   + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float f = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    f += a * snoise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return f;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  float t = u_time * 0.05;

  // domain warping: o campo "escorre" lentamente
  vec2 q = vec2(fbm(p * 1.05 + vec2(0.0, t)), fbm(p * 1.05 + vec2(5.2, -0.8 * t)));
  float n = fbm(p * 0.72 + 1.5 * q + vec2(0.35 * t, -0.2 * t));

  // linhas de fluxo (ridged noise): finas e brilhantes onde o campo cruza zero
  float ridge = clamp(1.0 - abs(n * 2.8), 0.0, 1.0);
  ridge *= ridge;
  ridge *= ridge;
  // névoa larga que dá corpo às linhas
  float haze = smoothstep(0.05, 0.8, n + 0.45 * q.y) * 0.3;
  float shape = max(ridge, haze);

  // composição: denso ao redor do foco, calmo bem atrás do título, some nas bordas e no topo
  vec2 c = (uv - u_focus) * vec2(aspect, 1.0);
  float outer = smoothstep(1.15, 0.15, length(c * vec2(0.52, 1.0)));
  float calm = mix(0.38, 1.0, smoothstep(0.1, 0.52, length(c * vec2(0.5, 1.3))));
  float top = smoothstep(1.0, 0.84, uv.y);
  float bottom = mix(1.0, smoothstep(0.05, 0.62, uv.y), u_fade);
  outer *= top * bottom;

  // o cursor "acende" o campo ao redor
  vec2 md = (uv - u_mouse) * vec2(aspect, 1.0);
  float glow = smoothstep(0.38, 0.0, length(md)) * u_hover;

  // telas em pé (celular): o texto ocupa mais área, então o campo fica mais leve
  float density = u_density * mix(0.7, 1.0, smoothstep(0.6, 1.3, aspect));
  float intensity = shape * outer * calm * density + glow * (0.25 + 0.5 * shape);
  intensity = clamp(intensity, 0.0, 1.0);

  float on = step(bayer8(frag) * 0.92 + 0.04, intensity);
  vec3 col = mix(u_a, u_b, clamp(0.5 + 1.2 * q.x + 0.35 * (uv.x - 0.5), 0.0, 1.0));
  gl_FragColor = vec4(col * on, on);
}
`;

export type DitherOptions = {
  /** Tamanho de cada célula do dither, em px CSS */
  cell: number;
  density: number;
  focus: [number, number];
  speed: number;
  fadeBottom: boolean;
};

export type DitherInput = Partial<{
  /** Tamanho do canvas em px CSS */
  size: [number, number];
  visible: boolean;
  /** document.hidden */
  hidden: boolean;
  /** prefers-reduced-motion */
  reduced: boolean;
  /** [u, v, hover] — posição do ponteiro em UV (origem embaixo à esquerda) e se é mouse */
  pointer: [number, number, number];
  /** cores em hex, vindas de --shader-a / --shader-b */
  colors: [string, string];
}>;

export type DitherEvent = 'ready' | 'nowebgl' | 'software' | 'lost';

type RGB = [number, number, number];
type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;

const FRAME_MS = 1000 / 30;
const STATIC_TIME = 18;

const raf = (cb: FrameRequestCallback): number =>
  typeof requestAnimationFrame === 'function'
    ? requestAnimationFrame(cb)
    : (setTimeout(() => cb(performance.now()), FRAME_MS) as unknown as number);
const caf = (id: number) =>
  typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame(id) : clearTimeout(id);

function hexToRgb(value: string): RGB {
  const hex = value.trim().replace('#', '');
  const n = parseInt(hex.length === 3 ? hex.replace(/./g, '$&$&') : hex, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** Renderizadores por software rodam o shader na CPU: não compensa. */
function isSoftwareRenderer(gl: WebGLRenderingContext) {
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
  return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer);
}

const UNIFORMS = ['u_res', 'u_time', 'u_mouse', 'u_hover', 'u_a', 'u_b', 'u_density', 'u_focus', 'u_fade'] as const;

export class DitherEngine {
  private readonly canvas: AnyCanvas;
  private readonly opts: DitherOptions;
  private readonly emit: (event: DitherEvent) => void;
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private uniforms: Partial<Record<(typeof UNIFORMS)[number], WebGLUniformLocation | null>> = {};
  private ready = false;
  private announced = false;
  private raf = 0;
  private lastFrame = 0;
  private readonly start = performance.now();

  private state = { size: [1, 1] as [number, number], visible: true, hidden: false, reduced: false };
  private mouse = { x: 0.5, y: 0.6, tx: 0.5, ty: 0.6, hover: 0, thover: 0 };
  private colors: { a: RGB; b: RGB } = { a: [0.18, 0.44, 0.85], b: [0.24, 0.78, 0.89] };

  constructor(canvas: AnyCanvas, opts: DitherOptions, emit: (event: DitherEvent) => void) {
    this.canvas = canvas;
    this.opts = opts;
    this.emit = emit;
  }

  /** Cria o contexto e compila o shader (sem consultar status de forma bloqueante). */
  init() {
    const gl = (this.canvas as HTMLCanvasElement).getContext('webgl', {
      antialias: false,
      alpha: true,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      powerPreference: 'low-power',
      preserveDrawingBuffer: false,
    });
    if (!gl) return this.emit('nowebgl');
    if (isSoftwareRenderer(gl)) {
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return this.emit('software');
    }
    this.gl = gl;

    (this.canvas as EventTarget).addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      caf(this.raf);
      this.ready = false;
      this.emit('lost');
    });

    const program = gl.createProgram()!;
    for (const [type, source] of [
      [gl.VERTEX_SHADER, VERT],
      [gl.FRAGMENT_SHADER, FRAG],
    ] as const) {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    this.program = program;

    const parallel = gl.getExtension('KHR_parallel_shader_compile');
    const poll = () => {
      if (parallel && !gl.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR)) {
        raf(poll);
        return;
      }
      this.link();
    };
    raf(poll);
  }

  update(input: DitherInput) {
    if (input.size) {
      this.state.size = input.size;
      this.resize();
    }
    if (input.colors) {
      this.colors = { a: hexToRgb(input.colors[0]), b: hexToRgb(input.colors[1]) };
    }
    if (input.pointer) {
      [this.mouse.tx, this.mouse.ty, this.mouse.thover] = input.pointer;
    }
    if (input.visible !== undefined) this.state.visible = input.visible;
    if (input.hidden !== undefined) this.state.hidden = input.hidden;
    if (input.reduced !== undefined) this.state.reduced = input.reduced;
    // ponteiro sozinho não reagenda: o loop já está rodando (ou não deve rodar)
    if (input.size || input.colors || input.visible !== undefined || input.hidden !== undefined || input.reduced !== undefined) {
      this.schedule();
    }
  }

  private link() {
    const { gl, program } = this;
    if (!gl || !program) return;
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return this.emit('nowebgl');
    }
    gl.useProgram(program);

    // um triângulo que cobre a tela inteira
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    for (const name of UNIFORMS) this.uniforms[name] = gl.getUniformLocation(program, name);

    this.ready = true;
    this.resize();
    this.schedule();
  }

  private get animating() {
    return this.state.visible && !this.state.hidden && !this.state.reduced;
  }

  private schedule() {
    if (!this.ready) return;
    caf(this.raf);
    if (this.animating) {
      const loop = (now: number) => {
        this.raf = raf(loop);
        if (now - this.lastFrame < FRAME_MS) return;
        this.lastFrame = now;
        this.draw((now - this.start) / 1000);
      };
      this.raf = raf(loop);
    } else if (this.state.visible) {
      this.draw(STATIC_TIME);
    }
  }

  private resize() {
    if (!this.gl) return;
    const [cssW, cssH] = this.state.size;
    const w = Math.max(1, Math.round(cssW / this.opts.cell));
    const h = Math.max(1, Math.round(cssH / this.opts.cell));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.gl.viewport(0, 0, w, h);
    }
  }

  private draw(seconds: number) {
    const { gl, uniforms: u, mouse: m, opts } = this;
    if (!gl) return;
    m.x += (m.tx - m.x) * 0.08;
    m.y += (m.ty - m.y) * 0.08;
    m.hover += (m.thover - m.hover) * 0.06;

    gl.uniform2f(u.u_res!, this.canvas.width, this.canvas.height);
    gl.uniform1f(u.u_time!, seconds * opts.speed * (1 + m.hover * 0.8));
    gl.uniform2f(u.u_mouse!, m.x, m.y);
    gl.uniform1f(u.u_hover!, m.hover);
    gl.uniform3fv(u.u_a!, this.colors.a);
    gl.uniform3fv(u.u_b!, this.colors.b);
    gl.uniform1f(u.u_density!, opts.density);
    gl.uniform2f(u.u_focus!, opts.focus[0], opts.focus[1]);
    gl.uniform1f(u.u_fade!, opts.fadeBottom ? 1 : 0);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (!this.announced) {
      this.announced = true;
      this.emit('ready');
    }
  }
}
