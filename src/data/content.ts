/**
 * Conteúdo editorial do site.
 * Separado dos componentes para que textos possam ser ajustados sem mexer em layout.
 */
import type { IconName } from '@/lib/icons';

/* -------------------------------------------------------------------------- */
/* Faixa de segmentos (marquee)                                                */
/* -------------------------------------------------------------------------- */

export const marqueeSegments = [
  'Supermercados',
  'Atacarejos',
  'Mercearias',
  'Hortifrútis',
  'Padarias',
  'Açougues',
  'Materiais de construção',
  'Home centers',
  'Elétrica e hidráulica',
  'Tintas',
  'Ferragens',
  'Madeireiras',
] as const;

/* -------------------------------------------------------------------------- */
/* Soluções (bento)                                                            */
/* -------------------------------------------------------------------------- */

export type FeatureVisual =
  | 'pdv'
  | 'stock'
  | 'fiscal'
  | 'finance'
  | 'reports'
  | 'custom'
  | 'cloud'
  | 'support';

export interface Feature {
  id: string;
  title: string;
  description: string;
  visual: FeatureVisual;
  /** Classes de grid do bento (desktop) */
  span?: string;
}

export const features: Feature[] = [
  {
    id: 'pdv',
    title: 'Frente de caixa ágil',
    description:
      'Venda com leitor, balança e todas as formas de pagamento — PIX, cartão e crediário. A fila anda e o cliente sai satisfeito.',
    visual: 'pdv',
    span: 'sm:col-span-2 lg:row-span-2',
  },
  {
    id: 'estoque',
    title: 'Estoque em tempo real',
    description: 'Entradas, saídas e inventário sempre atualizados, com alerta de reposição antes de faltar na prateleira.',
    visual: 'stock',
  },
  {
    id: 'fiscal',
    title: 'Fiscal em dia',
    description: 'NFC-e, NF-e e obrigações fiscais integradas à operação, sem retrabalho e sem susto.',
    visual: 'fiscal',
  },
  {
    id: 'financeiro',
    title: 'Financeiro organizado',
    description: 'Contas a pagar e a receber, fluxo de caixa e conciliação num só lugar.',
    visual: 'finance',
  },
  {
    id: 'relatorios',
    title: 'Relatórios que orientam',
    description: 'Vendas, margem e ticket médio na tela para decidir com dados — não com achismo.',
    visual: 'reports',
  },
  {
    id: 'sob-medida',
    title: 'Desenvolvimento sob medida',
    description:
      'Tem um processo que só a sua empresa tem? Criamos módulos, integrações e automações específicas para ele.',
    visual: 'custom',
    span: 'sm:col-span-2',
  },
  {
    id: 'nuvem',
    title: 'Acesse de onde estiver',
    description: 'Acompanhe a loja pelo computador, tablet ou celular, com backup automático dos dados.',
    visual: 'cloud',
  },
  {
    id: 'suporte',
    title: 'Suporte humanizado',
    description: 'Atendimento próximo, de quem conhece a sua operação e fala a sua língua.',
    visual: 'support',
  },
];

/* -------------------------------------------------------------------------- */
/* Segmentos (abas)                                                            */
/* -------------------------------------------------------------------------- */

export interface Segment {
  id: 'supermercados' | 'construcao';
  icon: IconName;
  tab: string;
  /** Rótulo curto da aba em telas estreitas */
  tabShort: string;
  title: string;
  description: string;
  bullets: string[];
  cta: string;
}

export const segments: Segment[] = [
  {
    id: 'supermercados',
    icon: 'shopping-basket',
    tab: 'Supermercados',
    tabShort: 'Supermercados',
    title: 'Do hortifrúti ao caixa rápido, a operação inteira na mão.',
    description:
      'Supermercado vive de giro, margem apertada e fila curta. O sistema acompanha esse ritmo — e mostra onde dá para ganhar mais.',
    bullets: [
      'PDV integrado à balança e ao leitor de código de barras',
      'Etiquetas de gôndola, preços e ofertas sempre sincronizados',
      'Controle de validade, perdas e quebras',
      'Compras e reposição guiadas pela curva ABC',
      'PIX e cartão integrados direto no caixa',
    ],
    cta: 'Supermercado',
  },
  {
    id: 'construcao',
    icon: 'hard-hat',
    tab: 'Materiais de construção',
    tabShort: 'Construção',
    title: 'Do orçamento à entrega, sem perder nenhuma venda.',
    description:
      'Loja de material de construção tem venda consultiva, produto fracionado e entrega agendada. O sistema já nasce entendendo isso.',
    bullets: [
      'Orçamentos que viram pedido em um clique',
      'Venda fracionada e conversão de unidades (m², m³, saco, barra, milheiro)',
      'Agenda de entregas e retiradas',
      'Crediário e contas a receber por cliente',
      'Tabelas de preço e comissão de vendedores',
    ],
    cta: 'Loja de materiais de construção',
  },
];

/* -------------------------------------------------------------------------- */
/* Como funciona                                                               */
/* -------------------------------------------------------------------------- */

export const steps = [
  {
    icon: 'search',
    title: 'Diagnóstico',
    description: 'Uma conversa para entender sua operação, seus gargalos e o que precisa mudar.',
  },
  {
    icon: 'settings',
    title: 'Implantação',
    description: 'Instalamos, configuramos e deixamos cadastros e equipamentos prontos para vender.',
  },
  {
    icon: 'rocket',
    title: 'Treinamento',
    description: 'Sua equipe aprende na prática, no ritmo da loja, sem parar o atendimento.',
  },
  {
    icon: 'handshake',
    title: 'Acompanhamento',
    description: 'Suporte próximo e melhorias contínuas, conforme o seu negócio cresce.',
  },
] as const satisfies ReadonlyArray<{ icon: IconName; title: string; description: string }>;

/* -------------------------------------------------------------------------- */
/* Sobre / integrações                                                         */
/* -------------------------------------------------------------------------- */

export const hubNodes = [
  { icon: 'scan-barcode', label: 'PDV' },
  { icon: 'boxes', label: 'Estoque' },
  { icon: 'receipt-text', label: 'Fiscal' },
  { icon: 'wallet', label: 'Financeiro' },
  { icon: 'credit-card', label: 'Pagamentos' },
  { icon: 'weight', label: 'Balança' },
  { icon: 'store', label: 'E-commerce' },
  { icon: 'chart-column', label: 'Relatórios' },
] as const satisfies ReadonlyArray<{ icon: IconName; label: string }>;

export const benefits = [
  { icon: 'clock', title: 'Menos fila, mais venda', text: 'Caixa rápido e estável, do primeiro ao último cliente do dia.' },
  { icon: 'package-check', title: 'Estoque sem ruptura', text: 'Reposição no momento certo, sem excesso parado.' },
  { icon: 'shield-check', title: 'Fiscal sem dor de cabeça', text: 'Documentos emitidos e organizados junto com a venda.' },
  { icon: 'chart-line', title: 'Decisão com dados', text: 'Indicadores claros para ajustar preço, mix e compras.' },
  { icon: 'puzzle', title: 'Feito para o seu jeito', text: 'O sistema se adapta à loja — não o contrário.' },
  { icon: 'headset', title: 'Gente de verdade', text: 'Suporte que entende o problema e resolve.' },
] as const satisfies ReadonlyArray<{ icon: IconName; title: string; text: string }>;

/* -------------------------------------------------------------------------- */
/* Depoimentos                                                                 */
/* -------------------------------------------------------------------------- */

export interface Testimonial {
  company: string;
  /** Ex.: "Supermercado • Campinas, SP" */
  context: string;
  quote: string;
  author?: string;
  role?: string;
  /** Caminho em /public, ex.: "/depoimentos/mercado-x.mp4" (vertical 9:16) */
  video?: string;
  /** Poster do vídeo em /public */
  poster?: string;
}

/**
 * A seção de depoimentos só aparece quando houver itens aqui.
 * Os depoimentos do site antigo eram de template (nomes e fotos de banco de imagem),
 * por isso não foram migrados. Preencha com depoimentos reais de clientes.
 */
export const testimonials: Testimonial[] = [];

/* -------------------------------------------------------------------------- */
/* FAQ                                                                         */
/* -------------------------------------------------------------------------- */

export const faq = [
  {
    q: 'Quais segmentos vocês atendem?',
    a: 'Somos especializados em supermercados e lojas de materiais de construção, e também atendemos outros negócios do varejo. Se a sua operação tem particularidades, adaptamos a solução a ela.',
  },
  {
    q: 'O sistema se adapta às necessidades da minha empresa?',
    a: 'Sim. Configuramos o sistema para a realidade da sua loja e, quando a demanda é muito específica, desenvolvemos módulos, integrações e relatórios sob medida.',
  },
  {
    q: 'Como funciona a implantação?',
    a: 'Começamos com um diagnóstico da operação, configuramos o sistema e os equipamentos, treinamos a equipe e acompanhamos de perto os primeiros dias de uso.',
  },
  {
    q: 'Quais são os principais benefícios?',
    a: 'Processos mais rápidos, menos retrabalho, estoque sob controle e informação confiável para decidir — o que se traduz em custos menores e mais eficiência no dia a dia.',
  },
  {
    q: 'Vocês oferecem suporte depois da implantação?',
    a: 'Sim. O suporte é feito por uma equipe dedicada, que conhece a sua operação e acompanha a evolução do seu negócio.',
  },
  {
    q: 'Como posso falar com a J&E Soluções?',
    a: 'Pelo formulário desta página ou pelos canais de contato no rodapé. Respondemos e agendamos uma demonstração no melhor horário para você.',
  },
] as const;
