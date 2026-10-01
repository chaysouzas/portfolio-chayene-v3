  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon').querySelector('use');
  const setThemeIcon = name => themeIcon.setAttribute('href', `#i-${name}`);
  const html = document.documentElement;
  let isDark = true;

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    html.setAttribute('data-theme', 'light');
    setThemeIcon('sun');
    isDark = false;
  }

  themeToggle.addEventListener('click', () => {
    isDark = !isDark;
    if (isDark) {
      html.removeAttribute('data-theme');
      setThemeIcon('moon');
      localStorage.setItem('theme', 'dark');
    } else {
      html.setAttribute('data-theme', 'light');
      setThemeIcon('sun');
      localStorage.setItem('theme', 'light');
    }
  });

  /* ── Hamburger & Mobile Menu ── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* ── Scroll: Navbar + Active Links ── */
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  function onScroll() {
    const scrollY = window.scrollY;

    /* Navbar shadow */
    navbar.classList.toggle('scrolled', scrollY > 60);

    /* Back to top */
    document.getElementById('back-to-top').classList.toggle('visible', scrollY > 400);

    /* Active nav link */
    let current = '';
    sections.forEach(section => {
      if (scrollY >= section.offsetTop - 140) {
        current = section.id;
      }
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Scroll Fade-in (IntersectionObserver) ── */
  const animatedEls = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  animatedEls.forEach(el => observer.observe(el));

  /* ── Back to Top ── */
  document.getElementById('back-to-top').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── Lightbox ── */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');

  function openLightbox(src, caption, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightboxCaption.textContent = caption || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* Attach to project cards */
  document.querySelectorAll('.project-card').forEach(card => {
    const btn = card.querySelector('.lightbox-trigger');
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const src = card.dataset.img || card.querySelector('img').src;
      const caption = card.dataset.caption || '';
      const alt = card.querySelector('img')?.alt || '';
      openLightbox(src, caption, alt);
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  /* ── Contact Form ── */
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = contactForm.nome.value.trim();
    const email = contactForm.email.value.trim();
    const mensagem = contactForm.mensagem.value.trim();

    if (!nome || !email || !mensagem) {
      /* Simple shake animation on empty fields */
      [contactForm.nome, contactForm.email, contactForm.mensagem].forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = 'var(--accent)';
          field.style.boxShadow = '0 0 0 3px rgba(255,16,16,0.15)';
          setTimeout(() => {
            field.style.borderColor = '';
            field.style.boxShadow = '';
          }, 2000);
        }
      });
      return;
    }

    /* Simulate submission */
    const btn = contactForm.querySelector('.form-submit');
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    setTimeout(() => {
      contactForm.style.display = 'none';
      formSuccess.style.display = 'block';
    }, 1200);
  });

  /* ── Projects Carousel: scroll-snap no mobile, palco 3D no desktop ── */
  const projectsSection = document.getElementById('projetos');
  const projectsRest = document.getElementById('projects-rest');
  const projectsInfo = document.getElementById('projects-info');
  const projectCards = [...projectsRest.querySelectorAll('.project-card')];
  const desktop3d = window.matchMedia('(min-width: 901px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeProject = 0;

  const wrapProject = i => (i % projectCards.length + projectCards.length) % projectCards.length;
  const is3d = () => projectsSection.classList.contains('projects-3d');

  /* Mobile: posição calculada a partir da rolagem horizontal */
  function projectStep() {
    const gap = parseFloat(getComputedStyle(projectsRest).columnGap) || 0;
    return projectCards[0].offsetWidth + gap;
  }

  function scrolledProject() {
    const maxScroll = projectsRest.scrollWidth - projectsRest.clientWidth;
    if (projectsRest.scrollLeft >= maxScroll - 2) return projectCards.length - 1;
    return Math.round(projectsRest.scrollLeft / projectStep());
  }

  /* Desktop: cada card se posiciona pela distância até o ativo (caminho circular) */
  function layoutProjects3d() {
    const n = projectCards.length;
    projectCards.forEach((card, i) => {
      let d = i - activeProject;
      if (d > n / 2) d -= n;
      if (d < -n / 2) d += n;
      const abs = Math.abs(d);
      const isActive = d === 0;

      const spread = [0, 74, 128, 160][Math.min(abs, 3)] * Math.sign(d); // % da largura do card

      card.style.transform =
        `translate(-50%, -50%) translateX(${spread}%) translateY(${abs * 3}%) ` +
        `translateZ(${-abs * 200}px) rotateY(${-d * 30}deg) rotateZ(${d * 3}deg)`;
      card.style.opacity = abs > 2 ? 0 : 1 - abs * 0.25;
      card.style.zIndex = n - abs;
      card.style.filter = isActive ? '' : `brightness(${1 - abs * 0.22})`;
      card.classList.toggle('is-active', isActive);
      card.setAttribute('aria-hidden', String(!isActive));
      card.querySelectorAll('a, button').forEach(el => { el.tabIndex = isActive ? 0 : -1; });
    });

    const info = projectCards[activeProject].querySelector('.project-info');
    projectsInfo.innerHTML = info.innerHTML;
    if (!reducedMotion.matches) {
      projectsInfo.animate(
        [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }],
        { duration: 450, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' }
      );
    }
  }

  function resetProjects3d() {
    projectCards.forEach(card => {
      card.style.transform = card.style.opacity = card.style.zIndex = card.style.filter = '';
      card.classList.remove('is-active');
      card.removeAttribute('aria-hidden');
      card.querySelectorAll('a, button').forEach(el => el.removeAttribute('tabindex'));
    });
  }

  function applyProjectsMode() {
    projectsSection.classList.toggle('projects-3d', desktop3d.matches);
    projectsInfo.hidden = !desktop3d.matches;
    if (desktop3d.matches) {
      layoutProjects3d();
    } else {
      resetProjects3d();
      activeProject = 0;
      projectsRest.scrollLeft = 0;
    }
  }

  function goToProject(index) {
    activeProject = wrapProject(index);
    if (is3d()) {
      layoutProjects3d();
    } else {
      projectsRest.scrollTo({ left: activeProject * projectStep(), behavior: 'smooth' });
    }
  }

  function currentProject() {
    return is3d() ? activeProject : scrolledProject();
  }

  document.querySelector('.projects-prev').addEventListener('click', () => goToProject(currentProject() - 1));
  document.querySelector('.projects-next').addEventListener('click', () => goToProject(currentProject() + 1));

  /* Clique num card lateral traz ele para o centro (em vez de abrir o lightbox) */
  let projectDragged = false;
  projectsRest.addEventListener('click', e => {
    if (!is3d()) return;
    const card = e.target.closest('.project-card');
    if (projectDragged || (card && !card.classList.contains('is-active'))) {
      e.preventDefault();
      e.stopPropagation();
      if (!projectDragged && card) goToProject(projectCards.indexOf(card));
    }
  }, true);

  /* Arrastar com mouse/caneta no desktop */
  let dragStartX = null;
  projectsRest.addEventListener('pointerdown', e => {
    if (!is3d() || e.pointerType === 'touch') return;
    dragStartX = e.clientX;
  });
  window.addEventListener('pointerup', e => {
    if (dragStartX === null) return;
    const diff = dragStartX - e.clientX;
    dragStartX = null;
    if (Math.abs(diff) > 50) {
      projectDragged = true; // o click que vem logo depois do arraste é ignorado
      setTimeout(() => { projectDragged = false; }, 0);
      goToProject(activeProject + (diff > 0 ? 1 : -1));
    }
  });

  projectsSection.addEventListener('keydown', e => {
    if (!is3d() || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
    if (!e.target.closest('#projects-rest, .projects-controls')) return;
    e.preventDefault();
    goToProject(activeProject + (e.key === 'ArrowRight' ? 1 : -1));
  });

  desktop3d.addEventListener('change', applyProjectsMode);
  applyProjectsMode();

  /* ── Testimonials Carousel ── */
  const carouselTrack = document.querySelector('.depoimentos-grid');
  const carouselCards = carouselTrack.querySelectorAll('.depoimento-card');
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');
  let currentSlide = 0;

  function goToSlide(index) {
    const perView = parseInt(getComputedStyle(carouselTrack).getPropertyValue('--per-view'), 10) || 1;
    const lastSlide = Math.max(carouselCards.length - perView, 0);
    currentSlide = index > lastSlide ? 0 : index < 0 ? lastSlide : index;
    carouselTrack.style.transform = `translateX(-${carouselCards[currentSlide].offsetLeft}px)`;
  }

  prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
  nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
  window.addEventListener('resize', () => goToSlide(currentSlide));

  let touchStartX = 0;
  carouselTrack.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  carouselTrack.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goToSlide(currentSlide + (diff > 0 ? 1 : -1));
  }, { passive: true });

  /* ── Smooth scroll for all anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = target.getBoundingClientRect().top + window.scrollY - (window.innerWidth < 900 ? 70 : 60);
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
    });
  });
