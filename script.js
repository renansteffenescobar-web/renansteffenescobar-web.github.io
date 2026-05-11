/* ============================================================
   COSAOGE Coworking — script.js
   Funcionalidades: EmailJS, validação, nav scroll, animações
   ============================================================ */

// ── Configuração EmailJS ──────────────────────────────────────
// 1. Acesse https://www.emailjs.com e crie uma conta gratuita
// 2. Crie um "Email Service" conectando seu Gmail
// 3. Crie um "Email Template" e copie o Template ID
// 4. Substitua os valores abaixo pelos seus dados reais:
const EMAILJS_SERVICE_ID  = 'SEU_SERVICE_ID';   // ex: 'service_abc123'
const EMAILJS_TEMPLATE_ID = 'SEU_TEMPLATE_ID';  // ex: 'template_xyz789'
const EMAILJS_PUBLIC_KEY  = 'SUA_PUBLIC_KEY';   // ex: 'abcDEFghiJKL'

// Template sugerido no EmailJS (variáveis que serão enviadas):
// {{nome}}, {{email}}, {{telefone}}, {{empresa}}, {{plano}}, {{necessidade}}
// Para: renan.steffen.escobar@gmail.com

(function () {

  // ── Inicializa EmailJS ──
  if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  // ── Ano no footer ──
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ── Navbar scroll ──
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── Scroll reveal ──
  const revealEls = document.querySelectorAll(
    '.beneficio-card, .sobre__text, .sobre__img-wrap, .form-info, .contact-form, .cliente-item, .info-item'
  );

  revealEls.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach(el => observer.observe(el));

  // ── Máscara telefone ──
  const telInput = document.getElementById('telefone');
  if (telInput) {
    telInput.addEventListener('input', () => {
      let v = telInput.value.replace(/\D/g, '');
      if (v.length > 11) v = v.slice(0, 11);
      if (v.length > 6) {
        v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
      } else if (v.length > 2) {
        v = `(${v.slice(0,2)}) ${v.slice(2)}`;
      } else if (v.length > 0) {
        v = `(${v}`;
      }
      telInput.value = v;
    });
  }

  // ── Validação ──
  function validate(form) {
    let ok = true;
    form.querySelectorAll('[required]').forEach(el => {
      el.classList.remove('error');
      const isEmpty = el.type === 'checkbox' ? !el.checked : !el.value.trim();
      if (isEmpty) { el.classList.add('error'); ok = false; }
    });

    const emailEl = form.querySelector('#email');
    if (emailEl && emailEl.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
      emailEl.classList.add('error');
      ok = false;
    }

    return ok;
  }

  // ── Formulário ──
  const form     = document.getElementById('contactForm');
  const btn      = document.getElementById('submitBtn');
  const btnText  = btn && btn.querySelector('.btn-text');
  const btnLoad  = btn && btn.querySelector('.btn-loading');
  const msgEl    = document.getElementById('formMsg');

  function showMsg(type, text) {
    if (!msgEl) return;
    msgEl.className = `form-msg ${type}`;
    msgEl.textContent = text;
  }

  function setLoading(loading) {
    if (!btn) return;
    btn.disabled = loading;
    if (btnText) btnText.hidden = loading;
    if (btnLoad) btnLoad.hidden = !loading;
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!validate(form)) {
        showMsg('error', 'Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      setLoading(true);
      showMsg('', '');

      const params = {
        nome:        document.getElementById('nome')?.value || '',
        email:       document.getElementById('email')?.value || '',
        telefone:    document.getElementById('telefone')?.value || '',
        empresa:     document.getElementById('empresa')?.value || 'Não informado',
        plano:       document.getElementById('plano')?.value || '',
        necessidade: document.getElementById('necessidade')?.value || 'Não informado',
        reply_to:    document.getElementById('email')?.value || '',
      };

      // Envia via EmailJS
      if (
        typeof emailjs !== 'undefined' &&
        EMAILJS_SERVICE_ID  !== 'SEU_SERVICE_ID' &&
        EMAILJS_TEMPLATE_ID !== 'SEU_TEMPLATE_ID'
      ) {
        try {
          await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
          showMsg('success', '✅ Perfeito! Recebemos seu interesse. Em breve entraremos em contato pelo WhatsApp e e-mail.');
          form.reset();
        } catch (err) {
          console.error('EmailJS error:', err);
          // Fallback: redireciona para WhatsApp
          abrirWhatsapp(params);
          showMsg('success', '✅ Redirecionando para o WhatsApp...');
          form.reset();
        }
      } else {
        // Sem EmailJS configurado: usa fallback WhatsApp
        abrirWhatsapp(params);
        showMsg('success', '✅ Abrindo WhatsApp com suas informações. Entraremos em contato em breve!');
        form.reset();
      }

      setLoading(false);
    });
  }

  // ── Fallback WhatsApp ──
  function abrirWhatsapp(p) {
    const planoLabels = {
      'hot-desk':       'Mesa avulsa (Hot Desk)',
      'fixo':           'Mesa fixa (Dedicada)',
      'sala-privativa': 'Sala privativa',
      'virtual':        'Escritório virtual',
      'evento':         'Espaço para eventos',
      'nao-sei':        'Ainda não sei, quero mais informações',
    };

    const msg = [
      `Olá! Tenho interesse no COSAOGE. Segue meu contato:`,
      `👤 Nome: ${p.nome}`,
      `📧 E-mail: ${p.email}`,
      `📞 WhatsApp: ${p.telefone}`,
      `🏢 Empresa/Área: ${p.empresa}`,
      `📋 Plano de interesse: ${planoLabels[p.plano] || p.plano}`,
      `💬 Necessidade: ${p.necessidade}`,
    ].join('\n');

    window.open(`https://wa.me/5551991627975?text=${encodeURIComponent(msg)}`, '_blank');
  }

})();
