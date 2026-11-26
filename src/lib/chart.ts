/** Utilitários para desenhar os gráficos SVG das interfaces ilustrativas (em build time). */

export interface Point {
  x: number;
  y: number;
}

/** Converte valores em pontos dentro de um viewBox, com margem vertical. */
export function toPoints(values: number[], { width, height, max, padTop = 18, padBottom = 10 }: {
  width: number;
  height: number;
  max: number;
  padTop?: number;
  padBottom?: number;
}): Point[] {
  const step = width / (values.length - 1);
  const usable = height - padTop - padBottom;
  return values.map((v, i) => ({
    x: round(i * step),
    y: round(height - padBottom - (v / max) * usable),
  }));
}

/** Curva suave (Catmull-Rom → Bézier cúbica) passando por todos os pontos. */
export function smoothPath(points: Point[], tension = 1): string {
  if (points.length < 2) return '';
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = { x: p1.x + ((p2.x - p0.x) / 6) * tension, y: p1.y + ((p2.y - p0.y) / 6) * tension };
    const c2 = { x: p2.x - ((p3.x - p1.x) / 6) * tension, y: p2.y - ((p3.y - p1.y) / 6) * tension };
    d += ` C${round(c1.x)},${round(c1.y)} ${round(c2.x)},${round(c2.y)} ${p2.x},${p2.y}`;
  }
  return d;
}

/** Fecha a curva até a base para preencher a área. */
export function areaPath(points: Point[], baseline: number, tension = 1): string {
  const first = points[0];
  const last = points[points.length - 1];
  return `${smoothPath(points, tension)} L${last.x},${baseline} L${first.x},${baseline} Z`;
}

const round = (n: number) => Math.round(n * 100) / 100;

export const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const num = (n: number, digits = 2) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
