function inicializarMenuMobile() {
  const botaoMenu = document.querySelector('[data-menu-toggle]');
  const listaNav = document.getElementById('menu-principal');

  if (!botaoMenu || !listaNav) return;

  botaoMenu.addEventListener('click', () => {
    const estaAberto = botaoMenu.getAttribute('aria-expanded') === 'true';
    alternarMenu(botaoMenu, listaNav, !estaAberto);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      alternarMenu(botaoMenu, listaNav, false);
    }
  });

  document.addEventListener('click', (e) => {
    const clicouFora = !e.target.closest('.nav-principal');
    const menuAberto = listaNav.classList.contains('menu--aberto');
    if (clicouFora && menuAberto) {
      alternarMenu(botaoMenu, listaNav, false);
    }
  });

  listaNav.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      alternarMenu(botaoMenu, listaNav, false);
    });
  });
}

function alternarMenu(botao, lista, abrir) {
  botao.setAttribute('aria-expanded', String(abrir));
  lista.classList.toggle('menu--aberto', abrir);
}

function validarCampo(campo, mensagem) {
  const grupo = campo.closest('.campo-grupo');
  const erroExistente = grupo.querySelector('.campo-erro');

  if (!campo.value.trim()) {
    campo.classList.add('campo-input--erro');
    if (!erroExistente) {
      const erro = document.createElement('span');
      erro.className = 'campo-erro';
      erro.setAttribute('role', 'alert');
      erro.textContent = mensagem;
      grupo.appendChild(erro);
    }
    return false;
  }

  campo.classList.remove('campo-input--erro');
  if (erroExistente) erroExistente.remove();
  return true;
}

function limparErro(campo) {
  const grupo = campo.closest('.campo-grupo');
  campo.classList.remove('campo-input--erro');
  const erro = grupo.querySelector('.campo-erro');
  if (erro) erro.remove();
}

function inicializarFormulario() {
  const form = document.getElementById('form-contato');
  if (!form) return;

  const campoPorNome = (nome) => form.querySelector(`[name="${nome}"]`);

  ['nome', 'whatsapp'].forEach((nome) => {
    campoPorNome(nome).addEventListener('input', function () {
      limparErro(this);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const campoNome = campoPorNome('nome');
    const campoWhatsapp = campoPorNome('whatsapp');

    const nomeValido = validarCampo(campoNome, 'Por favor, informe seu nome.');
    const whatsappValido = validarCampo(campoWhatsapp, 'Por favor, informe seu WhatsApp.');

    if (!nomeValido) { campoNome.focus(); return; }
    if (!whatsappValido) { campoWhatsapp.focus(); return; }

    const nome = campoNome.value.trim();
    const whatsapp = campoWhatsapp.value.trim();
    const instagram = form.instagram.value.trim();
    const desafio = form.desafio.value;

    const linhaInstagram = instagram ? `\nInstagram: ${instagram}` : '';
    const mensagem = `Olá! Me chamo *${nome}*.\nMeu WhatsApp: ${whatsapp}${linhaInstagram}\nMeu principal desafio: ${desafio}\n\nGostaria de solicitar um diagnóstico gratuito!`;
    const url = `https://wa.me/5541992866626?text=${encodeURIComponent(mensagem)}`;

    window.open(url, '_blank', 'noopener,noreferrer');
  });
}

const LP_SANITY_URL = 'https://x7p9jbkl.api.sanity.io/v2023-05-03/data/query/production';

const LP_CATEGORIAS = {
  'presenca-digital': 'Presença digital',
  'captacao':         'Captação',
  'site':             'Site',
  'redes-sociais':    'Redes sociais',
  'carreira':         'Carreira',
};

function inicializarBlog() {
  const loading  = document.getElementById('lpBlogLoading');
  const erro     = document.getElementById('lpBlogErro');
  const conteudo = document.getElementById('lpBlogConteudo');

  if (!loading) return;

  const query = encodeURIComponent(`
    *[_type == "post" && publicado == true] | order(dataPublicacao desc) [0...4] {
      titulo,
      "slug": slug.current,
      resumo,
      categoria,
      tempoLeitura,
      dataPublicacao,
      "imagemUrl": imagemCapa.asset->url,
      "imagemAlt": imagemCapa.alt
    }
  `);

  fetch(`${LP_SANITY_URL}?query=${query}`)
    .then(res => {
      if (!res.ok) throw new Error('Erro na API');
      return res.json();
    })
    .then(({ result }) => {
      loading.hidden = true;

      if (!result || result.length === 0) {
        erro.hidden = false;
        erro.querySelector('p').textContent = 'Nenhum artigo publicado ainda.';
        return;
      }

      renderBlog(result);
      conteudo.hidden = false;
    })
    .catch(() => {
      loading.hidden = true;
      erro.hidden = false;
    });
}

function renderBlog(posts) {
  const [destaque, ...demais] = posts;

  const linkDestaque = document.getElementById('lpBlogDestaque');
  linkDestaque.href = `../blog/post.html?slug=${destaque.slug}`;

  const imgContainer = document.getElementById('lpBlogDestaqueImg');
  if (destaque.imagemUrl) {
    imgContainer.innerHTML = `<img src="${destaque.imagemUrl}?w=800&auto=format" alt="${destaque.imagemAlt || destaque.titulo}" loading="lazy">`;
  }

  document.getElementById('lpBlogDestaqueCategoria').textContent =
    LP_CATEGORIAS[destaque.categoria] || destaque.categoria || '';
  document.getElementById('lpBlogDestaqueTitulo').textContent = destaque.titulo;
  document.getElementById('lpBlogDestaqueResumo').textContent = destaque.resumo;

  document.getElementById('lpBlogDestaqueData').querySelector('span').textContent =
    formatarData(destaque.dataPublicacao);
  document.getElementById('lpBlogDestaqueTempo').querySelector('span').textContent =
    `${destaque.tempoLeitura} min de leitura`;

  document.getElementById('lpBlogGrade').innerHTML = demais.map(post => `
    <a href="../blog/post.html?slug=${post.slug}" class="blog-card">
      <div class="blog-card__img">
        ${post.imagemUrl
          ? `<img src="${post.imagemUrl}?w=600&auto=format" alt="${post.imagemAlt || post.titulo}" loading="lazy">`
          : `<div class="blog-img-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`
        }
      </div>
      <div class="blog-card__body">
        <span class="blog-categoria">${LP_CATEGORIAS[post.categoria] || post.categoria || ''}</span>
        <h3 class="blog-card__titulo">${post.titulo}</h3>
        <p class="blog-card__resumo">${post.resumo}</p>
        <div class="blog-meta" style="margin-top:auto;padding-top:12px">
          <span class="blog-meta__item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${post.tempoLeitura} min de leitura
          </span>
        </div>
      </div>
    </a>
  `).join('');
}

function formatarData(isoDate) {
  if (!isoDate) return '';
  return new Date(isoDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
}

function inicializarCookieBanner() {
  const CHAVE = 'cs_cookie_consent';
  const banner = document.getElementById('cookie-banner');

  if (!banner) return;

  function ativarAnalytics() {
    const ANALYTICS_ID = 'G-YTP4M87RPT';
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + ANALYTICS_ID;
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', ANALYTICS_ID, { anonymize_ip: true });
  }

  function ocultarBanner() { banner.setAttribute('hidden', ''); }

  function salvar(aceito) {
    localStorage.setItem(CHAVE, aceito ? 'aceito' : 'recusado');
    ocultarBanner();
    if (aceito) ativarAnalytics();
  }

  const decisao = localStorage.getItem(CHAVE);
  if (decisao) {
    if (decisao === 'aceito') ativarAnalytics();
    return;
  }

  setTimeout(() => banner.removeAttribute('hidden'), 1000);

  document.getElementById('cookie-aceitar').addEventListener('click', () => salvar(true));
  document.getElementById('cookie-recusar').addEventListener('click', () => salvar(false));
}

document.addEventListener('DOMContentLoaded', () => {
  inicializarMenuMobile();
  inicializarFormulario();
  inicializarBlog();
  inicializarCookieBanner();
});
