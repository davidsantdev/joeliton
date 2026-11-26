/**
 * Dá vida ao painel ilustrativo do hero: novas vendas entram no feed a cada poucos segundos
 * e os KPIs (faturamento, nº de vendas, ticket médio e variação vs. ontem) são recalculados.
 * Só roda com o painel visível, a aba ativa e sem `prefers-reduced-motion`.
 */
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const pct = (n: number) =>
  `${n >= 0 ? '▲' : '▼'} ${Math.abs(n).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

type Sale = { doc: 'NFC-e' | 'NF-e'; pay: string; amount: number };

const POOL: Sale[] = [
  { doc: 'NFC-e', pay: 'PIX', amount: 37.8 },
  { doc: 'NFC-e', pay: 'Crédito', amount: 86.45 },
  { doc: 'NFC-e', pay: 'Débito', amount: 19.9 },
  { doc: 'NFC-e', pay: 'PIX', amount: 254.1 },
  { doc: 'NF-e', pay: 'Boleto', amount: 2140 },
  { doc: 'NFC-e', pay: 'Dinheiro', amount: 12.35 },
  { doc: 'NFC-e', pay: 'Crédito', amount: 148.72 },
  { doc: 'NFC-e', pay: 'PIX', amount: 64.9 },
];

export function initDashboard() {
  const root = document.querySelector<HTMLElement>('[data-dash]');
  const list = root?.querySelector<HTMLUListElement>('[data-feed]');
  if (!root || !list) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const base = JSON.parse(root.dataset.base ?? '{}') as { revenue: number; sales: number };
  const baseTicket = base.revenue / base.sales;

  const el = (key: string) => root.querySelector<HTMLElement>(`[data-kpi="${key}"]`);
  const delta = (key: string) => root.querySelector<HTMLElement>(`[data-kpi-delta="${key}"]`);

  // estado inicial lido do HTML renderizado no build
  const parseBRL = (s: string) => Number(s.replace(/[^\d,]/g, '').replace(',', '.'));
  const state = {
    revenue: parseBRL(el('revenue')?.textContent ?? '0'),
    sales: Number(el('sales')?.textContent?.trim() ?? 0),
    nfce: 4912,
    nfe: 1207,
    minutes: 18 * 60 + 39,
    i: 0,
  };

  const bump = (node: HTMLElement | null, text: string) => {
    if (!node) return;
    node.textContent = text;
    node.classList.remove('is-bump');
    void node.offsetWidth; // reinicia a transição de cor
    node.classList.add('is-bump');
    requestAnimationFrame(() => requestAnimationFrame(() => node.classList.remove('is-bump')));
  };

  const renderKpis = () => {
    const ticket = state.revenue / state.sales;
    bump(el('revenue'), brl.format(state.revenue));
    bump(el('sales'), String(state.sales));
    bump(el('ticket'), brl.format(ticket));
    const d1 = delta('revenue');
    const d2 = delta('sales');
    const d3 = delta('ticket');
    if (d1) d1.textContent = pct((state.revenue / base.revenue - 1) * 100);
    if (d2) d2.textContent = pct((state.sales / base.sales - 1) * 100);
    if (d3) d3.textContent = pct((ticket / baseTicket - 1) * 100);
  };

  const template = list.firstElementChild as HTMLLIElement | null;
  if (!template) return;

  const addSale = () => {
    const sale = POOL[state.i++ % POOL.length];
    state.minutes += 1 + (state.i % 2);
    const hh = String(Math.floor(state.minutes / 60) % 24).padStart(2, '0');
    const mm = String(state.minutes % 60).padStart(2, '0');
    const number = sale.doc === 'NF-e' ? ++state.nfe : ++state.nfce;

    const row = template.cloneNode(true) as HTMLLIElement;
    const [title, meta] = row.querySelectorAll<HTMLElement>('.f-main > *');
    const [amount] = row.querySelectorAll<HTMLElement>('.f-side > b');
    title.textContent = `${sale.doc} ${number.toLocaleString('pt-BR')}`;
    meta.textContent = `${hh}:${mm} · ${sale.pay}`;
    amount.textContent = brl.format(sale.amount);
    row.classList.add('is-new');

    list.prepend(row);
    list.lastElementChild?.remove();

    state.revenue += sale.amount;
    state.sales += 1;
    renderKpis();
  };

  let timer = 0;
  let visible = false;
  const schedule = () => {
    window.clearInterval(timer);
    if (visible && !document.hidden && !reduce.matches) timer = window.setInterval(addSale, 3200);
  };

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    schedule();
  }).observe(root);
  document.addEventListener('visibilitychange', schedule);
  reduce.addEventListener('change', schedule);
}
