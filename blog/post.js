
const SANITY_PROJECT_ID = 'x7p9jbkl';
const SANITY_DATASET    = 'production';
const SANITY_API_URL    = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2023-05-03/data/query/${SANITY_DATASET}`;

const CATEGORIAS = {
  'presenca-digital': 'Presença digital',
  'captacao':         'Captação',
  'site':             'Site',
  'redes-sociais':    'Redes sociais',
  'carreira':         'Carreira',
};

// ── Inicialização ──────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMenu();
  carregarArtigo();
});

// ── Busca e renderização do artigo ─────────────────────────

function carregarArtigo() {
  const params = new URLSearchParams(window.location.search);
  const slug   = params.get('slug');

  if (!slug) {
    mostrarErro();
    return;
  }

  const query = `*[_type == "post" && slug.current == $slug && publicado == true][0] {
    titulo,
    "slug": slug.current,
    resumo,
    categoria,
    tempoLeitura,
    dataPublicacao,
    "imagemUrl": imagemCapa.asset->url,
    "imagemAlt": imagemCapa.alt,
    conteudo
  }`;

  const url = new URL(SANITY_API_URL);
  url.searchParams.set('query', query);
  url.searchParams.set('$slug', JSON.stringify(slug));

  fetch(url.toString())
    .then(res => {
      if (!res.ok) throw new Error('Erro na API');
      return res.json();
    })
    .then(({ result }) => {
      if (!result) {
        mostrarErro();
        return;
      }
      renderizarArtigo(result);
    })
    .catch(() => mostrarErro());
}

function renderizarArtigo(post) {
  document.getElementById('postLoading').hidden = true;
  document.getElementById('postArtigo').hidden  = false;

  // ── Meta tags dinâmicas (SEO) ──
  const pageUrl = `https://www.chaysouza.com.br/blog/post.html?slug=${post.slug}`;

  document.title = `${post.titulo} | Chayene de Souza`;
  setMeta('description', post.resumo);
  setMeta('robots', 'index, follow');
  setLink('canonical', pageUrl);

  setOG('og:title',       post.titulo);
  setOG('og:description', post.resumo);
  setOG('og:url',         pageUrl);
  if (post.imagemUrl) {
    setOG('og:image', `${post.imagemUrl}?w=1200&auto=format`);
    setMeta('twitter:image', `${post.imagemUrl}?w=1200&auto=format`);
  }
  setMeta('twitter:title',       post.titulo);
  setMeta('twitter:description', post.resumo);

  injetarSchemaArticle(post, pageUrl);

  // ── Breadcrumb ──
  document.getElementById('postBreadcrumbTitulo').textContent = post.titulo;

  // ── Cabeçalho ──
  document.getElementById('postCategoria').textContent =
    CATEGORIAS[post.categoria] || post.categoria || '';

  document.getElementById('postTitulo').textContent = post.titulo;
  document.getElementById('postResumo').textContent = post.resumo;

  document.getElementById('postData').querySelector('span').textContent =
    formatarData(post.dataPublicacao);

  document.getElementById('postTempo').querySelector('span').textContent =
    `${post.tempoLeitura} min de leitura`;

  // ── Imagem de capa ──
  if (post.imagemUrl) {
    const capaEl  = document.getElementById('postCapa');
    const imgEl   = document.getElementById('postCapaImg');
    imgEl.src     = `${post.imagemUrl}?w=1200&auto=format`;
    imgEl.alt     = post.imagemAlt || post.titulo;
    capaEl.hidden = false;
  }

  // ── Conteúdo (Portable Text → HTML) ──
  const conteudoEl = document.getElementById('postConteudo');
  conteudoEl.innerHTML = portableTextToHtml(post.conteudo || []);
} 


// ── Portable Text → HTML ───────────────────────────────────

function portableTextToHtml(blocks) {
  return blocks.map(block => {
    if (block._type === 'image') {
      const src     = block.asset?.url || '';
      const alt     = block.alt || '';
      const caption = block.caption || '';
      if (!src) return '';
      return `
        <figure>
          <img src="${src}?w=900&auto=format" alt="${alt}" loading="lazy">
          ${caption ? `<figcaption>${caption}</figcaption>` : ''}
        </figure>
      `;
    }

    if (block._type === 'block') {
      const html = (block.children || [])
        .map(span => {
          let text = escapeHtml(span.text || '');

          (span.marks || []).forEach(mark => {
            if (mark === 'strong') text = `<strong>${text}</strong>`;
            if (mark === 'em')     text = `<em>${text}</em>`;
          });

          if (span.marks?.length && block.markDefs?.length) {
            block.markDefs.forEach(def => {
              if (span.marks.includes(def._key) && def._type === 'link') {
                const target = def.blank ? ' target="_blank" rel="noopener noreferrer"' : '';
                text = `<a href="${def.href}"${target}>${text}</a>`;
              }
            });
          }

          return text;
        })
        .join('');

      switch (block.style) {
        case 'h2':         return `<h2>${html}</h2>`;
        case 'h3':         return `<h3>${html}</h3>`;
        case 'blockquote': return `<blockquote><p>${html}</p></blockquote>`;
        default:           return `<p>${html}</p>`;
      }
    }

    return '';
  }).join('\n');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Schema Article ─────────────────────────────────────────

function injetarSchemaArticle(post, url) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': post.titulo,
    'description': post.resumo,
    'url': url,
    'datePublished': post.dataPublicacao,
    'author': {
      '@type': 'Person',
      'name': 'Chayene de Souza',
      'url': 'https://www.chaysouza.com.br'
    },
    'publisher': {
      '@type': 'Person',
      'name': 'Chayene de Souza',
      'url': 'https://www.chaysouza.com.br'
    },
    ...(post.imagemUrl && {
      'image': {
        '@type': 'ImageObject',
        'url': `${post.imagemUrl}?w=1200&auto=format`
      }
    })
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

// ── Helpers ────────────────────────────────────────────────

function mostrarErro() {
  document.getElementById('postLoading').hidden = true;
  document.getElementById('postErro').hidden    = false;
}

function formatarData(isoDate) {
  if (!isoDate) return '';
  return new Date(isoDate).toLocaleDateString('pt-BR', {
    day:   '2-digit',
    month: 'long',
    year:  'numeric',
  });
}

function setMeta(name, content) {
  const el = document.querySelector(`meta[name="${name}"]`);
  if (el) el.setAttribute('content', content);
}

function setOG(property, content) {
  const el = document.querySelector(`meta[property="${property}"]`);
  if (el) el.setAttribute('content', content);
}

function setLink(rel, href) {
  const el = document.querySelector(`link[rel="${rel}"]`);
  if (el) el.setAttribute('href', href);
}

// ── Tema ───────────────────────────────────────────────────

function initTheme() {
  const toggleBtn   = document.getElementById('themeToggle');
  const html        = document.documentElement;
  const saved       = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isLight     = saved === 'light' || (!saved && !prefersDark);

  if (isLight) html.classList.add('light');
  renderThemeIcon(toggleBtn, isLight);
  toggleBtn.setAttribute('aria-pressed', String(isLight));

  toggleBtn.addEventListener('click', () => {
    html.classList.toggle('light');
    const nowLight = html.classList.contains('light');
    renderThemeIcon(toggleBtn, nowLight);
    toggleBtn.setAttribute('aria-pressed', String(nowLight));
    localStorage.setItem('theme', nowLight ? 'light' : 'dark');
  });
}

function renderThemeIcon(btn, isLight) {
  btn.innerHTML = `<i data-lucide="${isLight ? 'sun' : 'moon'}"></i>`;
  if (window.lucide) lucide.createIcons();
}

// ── Menu mobile ────────────────────────────────────────────

function initMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const nav        = document.querySelector('.nav');

  if (!menuToggle || !nav) return;

  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = nav.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.innerHTML = `<i data-lucide="${isOpen ? 'x' : 'menu'}"></i>`;
    if (window.lucide) lucide.createIcons();
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (e) => {
    if (nav.classList.contains('active') && !nav.contains(e.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('active')) {
      closeMenu();
      menuToggle.focus();
    }
  });

  function closeMenu() {
    nav.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.innerHTML = `<i data-lucide="menu"></i>`;
    if (window.lucide) lucide.createIcons();
  }
}