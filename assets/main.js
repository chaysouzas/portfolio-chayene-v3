const WHATSAPP_NUMBER = "5541997596312";

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initMenu();
  initFadeObserver();
  initHeaderScroll();
  initActiveNavLink();
  initContatoRotas();
  initFiltroProjetos();
  initBlog()
});


/* =============================================
   1. TEMA — Dark / Light com persistência
   ============================================= */

function initTheme() {
  const toggleBtn = document.getElementById("themeToggle");
  const html      = document.documentElement;

  if (!toggleBtn) return;

  const saved       = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isLight     = saved === "light" || (!saved && !prefersDark);

  if (isLight) html.classList.add("light");
  renderThemeIcon(toggleBtn, isLight);
  toggleBtn.setAttribute("aria-pressed", String(isLight));

  toggleBtn.addEventListener("click", () => {
    html.classList.toggle("light");
    const nowLight = html.classList.contains("light");
    renderThemeIcon(toggleBtn, nowLight);
    toggleBtn.setAttribute("aria-pressed", String(nowLight));
    localStorage.setItem("theme", nowLight ? "light" : "dark");
  });
}

function renderThemeIcon(btn, isLight) {
  btn.innerHTML = `<i data-lucide="${isLight ? "sun" : "moon"}"></i>`;
  if (window.lucide) lucide.createIcons();
}


/* =============================================
   2. MENU MOBILE — Hamburguer + fechar ao clicar fora
   ============================================= */

function initMenu() {
  const menuToggle = document.querySelector(".menu-toggle");
  const nav        = document.querySelector(".nav");

  if (!menuToggle || !nav) return;

  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation(); // impede o click de subir ao document e fechar o menu imediatamente
    const isOpen = nav.classList.toggle("active");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.innerHTML = `<i data-lucide="${isOpen ? "x" : "menu"}"></i>`;
    if (window.lucide) lucide.createIcons();
  });

  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (e) => {
    if (
      nav.classList.contains("active") &&
      !nav.contains(e.target)
    ) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("active")) {
      closeMenu();
      menuToggle.focus();
    }
  });

  function closeMenu() {
    nav.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.innerHTML = `<i data-lucide="menu"></i>`;
    if (window.lucide) lucide.createIcons();
  }
}


/* =============================================
   3. FADE-UP — Animação de entrada por scroll
   ============================================= */

function initFadeObserver() {
  const elements = document.querySelectorAll(".fade-up");
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  elements.forEach((el) => observer.observe(el));
}


/* =============================================
   4. HEADER — Sombra ao rolar
   ============================================= */

function initHeaderScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 20);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}


/* =============================================
   5. NAV LINK ATIVO — Destaca seção visível
   ============================================= */

function initActiveNavLink() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-list a[href^='#']");

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          navLinks.forEach((link) => {
            const isActive = link.getAttribute("href") === `#${id}`;
            link.classList.toggle("active", isActive);
            link.setAttribute("aria-current", isActive ? "true" : "false");
          });
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
}


/* =============================================
   6. CONTATO — Alternância de rotas + envio Instagram
   ============================================= */

function initContatoRotas() {
  const rotaBtns = document.querySelectorAll(".rota-btn");
  const paineis  = document.querySelectorAll(".contato-painel");
  const form     = document.getElementById("instagramForm");
  const input    = document.getElementById("instagramHandle");

  if (!rotaBtns.length) return;

  rotaBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const rota = btn.dataset.rota;

      rotaBtns.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });

      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");

      paineis.forEach((painel) => {
        const isTarget = painel.id === `rota-${rota}`;
        painel.hidden = !isTarget;
        isTarget
          ? painel.classList.add("active")
          : painel.classList.remove("active");
      });
    });
  });

  if (!form || !input) return;
 
  let ultimoEnvio = 0;
  const INTERVALO_MINIMO = 5000; // 5 segundos entre envios
 
  form.addEventListener('submit', (e) => {
    e.preventDefault();
 
    const agora = Date.now();
 
    // Bloqueia envios em menos de 5 segundos
    if (agora - ultimoEnvio < INTERVALO_MINIMO) {
      const restante = Math.ceil((INTERVALO_MINIMO - (agora - ultimoEnvio)) / 1000);
      input.placeholder = `Aguarde ${restante}s...`;
      setTimeout(() => { input.placeholder = 'seu.perfil'; }, INTERVALO_MINIMO);
      return;
    }
 
    const handle = input.value.trim().replace(/^@/, '').replace(/\s+/g, '');
 
    if (!handle) {
      input.classList.add('error');
      input.focus();
      return;
    }
 
    // Validação básica do formato do @ (só letras, números, _ e .)
    const formatoValido = /^[a-zA-Z0-9_.]{1,30}$/.test(handle);
    if (!formatoValido) {
      input.classList.add('error');
      input.focus();
      return;
    }
 
    input.classList.remove('error');
    ultimoEnvio = agora;
 
    const msg = `Olá, Chay! Tenho interesse em criar meu site. Meu Instagram é: @${handle}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });
 
  input.addEventListener('input', () => {
    input.classList.remove('error');
  });
}
 

/* =============================================
   7. FILTRO DE PROJETOS — Filtra por categoria
   ============================================= */

function initFiltroProjetos() {
  const filtros  = document.querySelectorAll(".filtro-btn");
  const projetos = document.querySelectorAll("#gridProjetos .projeto");
  const vazio    = document.getElementById("projetosVazio");

  if (!filtros.length || !projetos.length) return;

  filtros.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Atualiza botão ativo
      filtros.forEach((b) => b.classList.remove("filtro-btn--active"));
      btn.classList.add("filtro-btn--active");

      const filtro = btn.dataset.filtro;
      let visiveis = 0;

      projetos.forEach((projeto) => {
        const categoria = projeto.dataset.categoria;
        const mostrar   = filtro === "todos" || categoria === filtro;

        projeto.classList.toggle("oculto", !mostrar);
        if (mostrar) visiveis++;
      });

      if (vazio) vazio.hidden = visiveis > 0;
    });
  });
}

const SANITY_PROJECT_ID = 'x7p9jbkl';
const SANITY_DATASET    = 'production';
const SANITY_API_URL    = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2023-05-03/data/query/${SANITY_DATASET}`;
 
// Mapa de categorias para exibição
const CATEGORIAS = {
  'presenca-digital': 'Presença digital',
  'captacao':         'Captação',
  'site':             'Site',
  'redes-sociais':    'Redes sociais',
  'carreira':         'Carreira',
};
 
function initBlog() {
  const loading  = document.getElementById('blogLoading');
  const erro     = document.getElementById('blogErro');
  const conteudo = document.getElementById('blogConteudo');
 
  if (!loading) return;
 
  // Query GROQ — busca posts publicados, ordenados por data
  const query = encodeURIComponent(`
    *[_type == "post" && publicado == true] | order(dataPublicacao desc) [0...6] {
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
 
  fetch(`${SANITY_API_URL}?query=${query}`)
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
 
  // ── Renderiza o card destaque ──
  const linkDestaque = document.getElementById('blogDestaque');
  linkDestaque.href  = `blog/${destaque.slug}.html`;
 
  // Imagem
  const imgContainer = document.getElementById('blogDestaqueImg');
  if (destaque.imagemUrl) {
    imgContainer.innerHTML = `
      <img
        src="${destaque.imagemUrl}?w=800&auto=format"
        alt="${destaque.imagemAlt || destaque.titulo}"
        loading="lazy"
      >
    `;
  }
 
  // Categoria
  document.getElementById('blogDestaqueCategoria').textContent =
    CATEGORIAS[destaque.categoria] || destaque.categoria || '';
 
  // Título e resumo
  document.getElementById('blogDestaqueTitulo').textContent = destaque.titulo;
  document.getElementById('blogDestaqueResumo').textContent = destaque.resumo;
 
  // Data
  const dataEl = document.getElementById('blogDestaqueData').querySelector('span');
  dataEl.textContent = formatarData(destaque.dataPublicacao);
 
  // Tempo de leitura
  const tempoEl = document.getElementById('blogDestaqueTempo').querySelector('span');
  tempoEl.textContent = `${destaque.tempoLeitura} min de leitura`;
 
  // ── Renderiza os cards do grid ──
  const grid = document.getElementById('blogGrid');
  grid.innerHTML = demais.map(post => `
    <a href="blog/${post.slug}.html" class="blog-card">
      <div class="blog-card__img">
        ${post.imagemUrl
          ? `<img src="${post.imagemUrl}?w=600&auto=format" alt="${post.imagemAlt || post.titulo}" loading="lazy">`
          : `<div class="blog-img-placeholder">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                 <rect x="3" y="3" width="18" height="18" rx="2"/>
                 <circle cx="8.5" cy="8.5" r="1.5"/>
                 <polyline points="21 15 16 10 5 21"/>
               </svg>
             </div>`
        }
      </div>
      <div class="blog-card__body">
        <span class="blog-categoria">${CATEGORIAS[post.categoria] || post.categoria || ''}</span>
        <h3 class="blog-card__titulo">${post.titulo}</h3>
        <p class="blog-card__resumo">${post.resumo}</p>
        <div class="blog-meta" style="margin-top: auto; padding-top: 12px;">
          <span class="blog-meta__item">
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
 
function formatarData(isoDate) {
  if (!isoDate) return '';
  return new Date(isoDate).toLocaleDateString('pt-BR', {
    month: 'short',
    year:  'numeric',
  });
}
 