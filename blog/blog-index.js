/**
 * blog-index.js — Listagem de todos os artigos
 * Localização: blog/blog-index.js
 * Depende de: Lucide Icons
 */

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

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMenu();
  carregarTodosArtigos();
});

// ── Busca todos os posts publicados ───────────────────────

function carregarTodosArtigos() {
  const query = `*[_type == "post" && publicado == true] | order(dataPublicacao desc) {
    titulo,
    "slug": slug.current,
    resumo,
    categoria,
    tempoLeitura,
    dataPublicacao,
    "imagemUrl": imagemCapa.asset->url,
    "imagemAlt": imagemCapa.alt
  }`;

  const url = new URL(SANITY_API_URL);
  url.searchParams.set('query', query);

  fetch(url.toString())
    .then(res => {
      if (!res.ok) throw new Error('Erro na API');
      return res.json();
    })
    .then(({ result }) => {
      document.getElementById('blogLoading').hidden = true;

      if (!result || result.length === 0) {
        document.getElementById('blogVazio').hidden = false;
        return;
      }

      renderizarGrid(result);
      document.getElementById('blogGrid').hidden = false;
    })
    .catch(() => {
      document.getElementById('blogLoading').hidden = true;
      document.getElementById('blogErro').hidden    = false;
    });
}

// ── Renderiza o grid de cards ─────────────────────────────

function renderizarGrid(posts) {
  const grid = document.getElementById('blogGrid');

  grid.innerHTML = posts.map(post => `
    <a href="post.html?slug=${post.slug}" class="blog-index-card">

      <div class="blog-index-card__img">
        ${post.imagemUrl
          ? `<img
               src="${post.imagemUrl}?w=700&auto=format"
               alt="${post.imagemAlt || post.titulo}"
               loading="lazy"
             >`
          : `<div class="blog-index-card__img-placeholder">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                 <rect x="3" y="3" width="18" height="18" rx="2"/>
                 <circle cx="8.5" cy="8.5" r="1.5"/>
                 <polyline points="21 15 16 10 5 21"/>
               </svg>
             </div>`
        }
      </div>

      <div class="blog-index-card__body">
        <span class="blog-index-card__categoria">
          ${CATEGORIAS[post.categoria] || post.categoria || ''}
        </span>
        <h2 class="blog-index-card__titulo">${post.titulo}</h2>
        <p class="blog-index-card__resumo">${post.resumo}</p>
        <div class="blog-index-card__meta">
          <span class="blog-index-card__meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            ${formatarData(post.dataPublicacao)}
          </span>
          <span class="blog-index-card__meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            ${post.tempoLeitura} min de leitura
          </span>
        </div>
      </div>

    </a>
  `).join('');
}

// ── Helpers ───────────────────────────────────────────────

function formatarData(isoDate) {
  if (!isoDate) return '';
  return new Date(isoDate).toLocaleDateString('pt-BR', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  });
}

// ── Tema ──────────────────────────────────────────────────

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

// ── Menu mobile ───────────────────────────────────────────

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