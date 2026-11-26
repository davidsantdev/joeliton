/**
 * Gera os assets de marca a partir do logo original.
 *   npm run brand
 *
 * Entradas:  src/assets/brand/logo-original.png
 * Saídas:    src/assets/brand/logo-mark.png      (recortado, usado pelo <Image> do Astro)
 *            public/favicon.ico | favicon-32.png | apple-touch-icon.png | icon-192.png | icon-512.png
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src/assets/brand/logo-original.png');
const pub = path.join(root, 'public');
const BG = '#060a13'; // mesmo fundo do tema escuro

await mkdir(pub, { recursive: true });

// 1) Marca recortada (sem margens transparentes)
const trimmed = await sharp(src).trim({ threshold: 1 }).png().toBuffer();
const mark = sharp(trimmed).resize({ width: 512, height: 512, fit: 'inside' });
await mark.clone().png({ compressionLevel: 9, palette: false }).toFile(path.join(root, 'src/assets/brand/logo-mark.png'));

/** Ícone quadrado com a marca centralizada. */
async function squareIcon(size, { padding = 0.12, background = null } = {}) {
  const inner = Math.round(size * (1 - padding * 2));
  const logo = await sharp(trimmed).resize({ width: inner, height: inner, fit: 'inside' }).toBuffer();
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: background ?? { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

const fav16 = await squareIcon(16, { padding: 0.02 });
const fav32 = await squareIcon(32, { padding: 0.04 });
const fav48 = await squareIcon(48, { padding: 0.04 });
await writeFile(path.join(pub, 'favicon-32.png'), fav32);
await writeFile(path.join(pub, 'apple-touch-icon.png'), await squareIcon(180, { padding: 0.16, background: BG }));
await writeFile(path.join(pub, 'icon-192.png'), await squareIcon(192, { padding: 0.18, background: BG }));
await writeFile(path.join(pub, 'icon-512.png'), await squareIcon(512, { padding: 0.18, background: BG }));

// 2) favicon.ico com PNGs embutidos (formato aceito desde o Windows Vista / todos os navegadores)
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reservado
  header.writeUInt16LE(1, 2); // tipo: ícone
  header.writeUInt16LE(images.length, 4);
  const entries = [];
  let offset = 6 + images.length * 16;
  for (const { size, data } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2); // paleta
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4); // planos
    e.writeUInt16LE(32, 6); // bpp
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(e);
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}
await writeFile(
  path.join(pub, 'favicon.ico'),
  ico([
    { size: 16, data: fav16 },
    { size: 32, data: fav32 },
    { size: 48, data: fav48 },
  ]),
);

console.log('✓ assets de marca gerados');
