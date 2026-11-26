/**
 * Formulário de contato sem backend: valida e abre o WhatsApp (quando configurado)
 * ou o e-mail do visitante com a mensagem já formatada.
 * Nada é armazenado nem enviado a terceiros pelo site.
 */
export function initContactForm() {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  if (!form) return;

  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const name = form.elements.namedItem('nome') as HTMLInputElement;
  const whatsapp = form.dataset.whatsapp ?? '';
  const email = form.dataset.email ?? '';

  const setInvalid = (invalid: boolean) => {
    if (invalid) {
      name.setAttribute('aria-invalid', 'true');
      name.setAttribute('aria-describedby', 'erro-nome');
    } else {
      name.removeAttribute('aria-invalid');
      name.removeAttribute('aria-describedby');
    }
  };

  name.addEventListener('input', () => {
    if (name.value.trim()) setInvalid(false);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const get = (key: string) => String(data.get(key) ?? '').trim();

    const nome = get('nome');
    if (!nome) {
      setInvalid(true);
      name.focus();
      return;
    }

    const fields = (
      [
        ['Nome', nome],
        ['Empresa', get('empresa')],
        ['WhatsApp/telefone', get('telefone')],
        ['Segmento', get('segmento')],
        ['Mensagem', get('mensagem')],
      ] as const
    ).filter(([, value]) => value);

    const intro = 'Olá, J&E Soluções! Vim pelo site e quero agendar uma demonstração.';

    if (whatsapp) {
      const text = [intro, '', ...fields.map(([label, value]) => `*${label}:* ${value}`)].join('\n');
      window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
      if (status) status.textContent = 'Pronto! Abrimos o WhatsApp em uma nova aba com a sua mensagem.';
    } else {
      const body = [intro, '', ...fields.map(([label, value]) => `${label}: ${value}`)].join('\n');
      const subject = `Demonstração — ${nome}`;
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      if (status) status.textContent = 'Pronto! Abrimos o seu aplicativo de e-mail com a mensagem.';
    }
  });
}
