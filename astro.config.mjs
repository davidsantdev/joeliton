// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

/**
 * URLs do site antigo (WordPress) → seções da nova página.
 * Mantém links já indexados pelo Google e compartilhados por aí funcionando.
 */
const legacyRedirects = {
  '/contato': '/#contato',
  '/sobre': '/#sobre',
  '/faq': '/#duvidas',
  '/portfolio': '/#solucoes',
  '/servicos': '/#solucoes',
  '/casos-de-sucesso': '/#segmentos',
  '/depoimentos': '/',
};

export default defineConfig({
  site: 'https://jesolution.com.br',
  redirects: legacyRedirects,
  integrations: [
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname.replace(/\/$/, '');
        return !(path in legacyRedirects) && !path.endsWith('/404');
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    // o fundo animado roda num Web Worker (src/scripts/dither.worker.ts)
    worker: { format: 'es' },
  },
  // Página única: CSS inline no HTML = nenhuma requisição bloqueando a renderização.
  build: { inlineStylesheets: 'always' },
  devToolbar: { enabled: false },
});
