/**
 * Configuração central do site.
 * Tudo que é dado da empresa (contatos, redes, SEO) mora aqui — os componentes só leem.
 *
 * ⚠️ Campos marcados com TODO ainda precisam dos dados reais do cliente.
 *    O site antigo (WordPress) só tinha dados de template — telefone 98765-4321,
 *    endereços fictícios, redes sem perfil — por isso nada disso foi reaproveitado.
 *
 * WhatsApp vazio = o site funciona só com e-mail: botões de contato abrem o e-mail,
 * e o botão flutuante e os rótulos "WhatsApp" ficam ocultos até o número ser preenchido.
 */
export interface SiteConfig {
  name: string;
  shortName: string;
  url: string;
  tagline: string;
  description: string;
  contact: {
    whatsapp: string;
    phoneDisplay: string;
    email: string;
    location: string;
  };
  social: {
    instagram: string;
    facebook: string;
    linkedin: string;
  };
  legal: {
    cnpj: string;
  };
  seo: {
    title: string;
    ogImage: string;
    locale: string;
  };
}

export const site: SiteConfig = {
  name: 'J&E Soluções',
  shortName: 'J&E',
  url: 'https://jesolution.com.br',
  tagline: 'Automação comercial para o varejo',
  description:
    'Sistemas de gestão e automação comercial para supermercados e lojas de materiais de construção. Implantação acompanhada, suporte humanizado e soluções sob medida.',

  contact: {
    /** Somente dígitos, com DDI 55 + DDD. Ex.: 5511912345678. Vazio = sem WhatsApp. */
    whatsapp: '', // TODO: número do WhatsApp comercial
    /** Como o telefone aparece na tela. Ex.: (11) 91234-5678 */
    phoneDisplay: '', // TODO
    email: 'contato@jesolucoes.com.br',
    /** Cidade/UF exibida no rodapé. Deixe vazio para ocultar. */
    location: '', // TODO: ex. "São Paulo, SP"
  },

  /** Deixe a string vazia para ocultar o ícone. */
  social: {
    instagram: '', // TODO: https://instagram.com/...
    facebook: '', // TODO
    linkedin: '', // TODO
  },

  /** Exibido no rodapé quando preenchido. */
  legal: {
    cnpj: '', // TODO: 00.000.000/0000-00
  },

  seo: {
    title: 'J&E Soluções | Automação comercial para supermercados e materiais de construção',
    ogImage: '/og.png',
    locale: 'pt_BR',
  },
};

export const nav = [
  { label: 'Soluções', href: '#solucoes' },
  { label: 'Segmentos', href: '#segmentos' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Dúvidas', href: '#duvidas' },
] as const;

export const messages = {
  demo: 'Olá, J&E Soluções! Vim pelo site e quero agendar uma demonstração.',
  talk: 'Olá, J&E Soluções! Vim pelo site e quero falar com um especialista.',
  custom: 'Olá, J&E Soluções! Tenho uma demanda específica e quero falar sobre um desenvolvimento sob medida.',
  segment: (segment: string) =>
    `Olá, J&E Soluções! Tenho um(a) ${segment.toLowerCase()} e quero ver o sistema funcionando na prática.`,
} as const;

/** true quando há um número de WhatsApp válido configurado (DDI + DDD + número). */
export const hasWhatsapp = /^55\d{10,11}$/.test(site.contact.whatsapp);

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${site.contact.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function mailtoLink(subject?: string, body?: string): string {
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  // URLSearchParams codifica espaço como "+", que clientes de e-mail não decodificam
  const query = params.toString().replace(/\+/g, '%20');
  return `mailto:${site.contact.email}${query ? `?${query}` : ''}`;
}

/** Canal principal de contato: WhatsApp quando configurado; senão, e-mail com a mensagem pronta. */
export function contactLink(message: string): string {
  return hasWhatsapp ? whatsappLink(message) : mailtoLink('Contato pelo site', message);
}
