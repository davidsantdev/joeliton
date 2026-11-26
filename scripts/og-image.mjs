/**
 * Gera public/og.png (1200×630) — a imagem que aparece ao compartilhar o link
 * no WhatsApp, LinkedIn, Facebook etc. O visual fica em scripts/og/template.html.
 *
 *   npm run og
 *
 * Usa o Chrome/Edge já instalado na máquina (puppeteer-core, sem baixar navegador).
 * Caminho customizado: CHROME_PATH="/caminho/do/chrome" npm run og
 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const template = pathToFileURL(path.join(root, 'scripts/og/template.html')).href;
const output = path.join(root, 'public/og.png');

const executablePath = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].find((p) => p && existsSync(p));

if (!executablePath) {
  console.error('Chrome/Edge não encontrado. Defina a variável CHROME_PATH.');
  process.exit(1);
}

const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--allow-file-access-from-files'] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page.goto(template, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: output, type: 'png' });
  console.log('✓ public/og.png gerado');
} finally {
  await browser.close();
}
