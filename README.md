# J&E Soluções — site institucional

Site de página única da J&E Soluções (automação comercial para supermercados e lojas de materiais de construção).
Gera HTML estático: roda em qualquer hospedagem, sem servidor nem banco de dados.

## Stack

- [Astro 7](https://astro.build) — HTML pré-renderizado, JS só onde há interação
- [Tailwind CSS 4](https://tailwindcss.com) + tokens de tema em CSS (escuro/claro)
- TypeScript estrito, sem framework de UI (scripts vanilla em `src/scripts/`)
- Fundo animado em WebGL escrito à mão (`dither-engine.ts`), rodando num Web Worker via `OffscreenCanvas`
- Fontes self-hosted (Fontsource): Plus Jakarta Sans, Inter e JetBrains Mono
- Ícones: Lucide (importados um a um) + SVGs de marca

## Rodando

Requer Node 22.23 ou superior.

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # astro check (tipos) + build em dist/
npm run preview   # serve o dist/ localmente
```

Outros scripts:

| Comando         | O que faz                                                                     |
| --------------- | ----------------------------------------------------------------------------- |
| `npm run og`    | Regera `public/og.png` (imagem de compartilhamento) a partir de `scripts/og/template.html`. Usa o Chrome/Edge instalado; caminho customizado via `CHROME_PATH`. |
| `npm run brand` | Regera logo recortado e favicons a partir de `src/assets/brand/logo-original.png`. |
| `npm run format`| Prettier (com plugin do Astro).                                                |

## Onde editar

| O quê                                         | Arquivo                       |
| --------------------------------------------- | ----------------------------- |
| Contatos, redes sociais, CNPJ, SEO            | `src/config/site.ts`          |
| Textos: soluções, segmentos, etapas, FAQ, depoimentos | `src/data/content.ts` |
| Cores, fontes e componentes base (botões, cards)       | `src/styles/global.css` |
| Seções da página                              | `src/components/sections/`    |
| Telas ilustrativas (painel, PDV, orçamento)   | `src/components/mockups/`     |

### Contato e WhatsApp

Com `contact.whatsapp` vazio, o site funciona só com e-mail: os botões abrem o e-mail com a mensagem pronta,
e o botão flutuante e os rótulos "WhatsApp" ficam ocultos. Ao preencher `whatsapp` (só dígitos, `55` + DDD + número)
e `phoneDisplay`, tudo passa a apontar para o WhatsApp automaticamente.

O formulário de contato não tem backend: ele monta a mensagem e abre o WhatsApp ou o e-mail do visitante.

### Depoimentos

A seção só aparece quando houver itens em `testimonials` (`src/data/content.ts`). Aceita texto e vídeo vertical.

## Deploy

O build gera a pasta `dist/`.

- **HostGator / cPanel (Apache):** envie o conteúdo de `dist/` para `public_html/`. O `.htaccess` incluído
  configura a página 404, cache longo para `/_astro/` e cabeçalhos de segurança.
- **Vercel / Netlify / Cloudflare Pages:** comando de build `npm run build`, diretório de saída `dist`.

As URLs do WordPress antigo (`/contato`, `/sobre`, `/faq`, `/portfolio`, `/servicos`, `/casos-de-sucesso`, `/depoimentos`)
redirecionam para as seções correspondentes (configurado em `astro.config.mjs`).

## Decisões técnicas

- **Performance:** CSS inline, fontes com `preload`, `content-visibility` nas seções abaixo da dobra, animações
  decorativas pausadas fora da tela e WebGL fora da thread principal (Web Worker). Sem GPU de verdade ou sem WebGL,
  o fundo animado não é carregado e fica um fallback em CSS.
- **Acessibilidade:** landmarks e hierarquia de títulos, link "pular para o conteúdo", foco visível, abas com teclado
  (padrão WAI-ARIA), FAQ com `<details>`, contraste AA nos dois temas e respeito a `prefers-reduced-motion`.
- **SEO:** HTML completo no servidor, metatags Open Graph, JSON-LD (Organization, WebSite, FAQPage), sitemap e robots.

## Pendências

- [ ] Número do WhatsApp comercial, redes sociais, cidade e CNPJ em `src/config/site.ts`
- [ ] Confirmar que a caixa `contato@jesolucoes.com.br` recebe e-mails
- [ ] Validar com a J&E as funcionalidades citadas em `src/data/content.ts` (ex.: NFC-e/NF-e, PIX/TEF, balança, curva ABC)
- [ ] Depoimentos reais de clientes (o site antigo só tinha depoimentos de template)
- [ ] Opcional: trocar as telas ilustrativas por capturas reais do sistema
