  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const html = document.documentElement;
  let isDark = true;

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    html.setAttribute('data-theme', 'light');
    themeIcon.className = 'fa-solid fa-sun';
    isDark = false;
  }

  themeToggle.addEventListener('click', () => {
    isDark = !isDark;
    if (isDark) {
      html.removeAttribute('data-theme');
      themeIcon.className = 'fa-solid fa-moon';
      localStorage.setItem('theme', 'dark');
    } else {
      html.setAttribute('data-theme', 'light');
      themeIcon.className = 'fa-solid fa-sun';
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

  /* ── Parallax ── */
  const parallaxBg = document.getElementById('parallax-bg');
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (parallaxBg && scrollY < window.innerHeight * 1.5) {
      parallaxBg.style.transform = `translateY(${scrollY * 0.3}px)`;
    }
  }, { passive: true });

  /* ── Scroll Fade-in (IntersectionObserver) ── */
  const animatedEls = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');

        /* Animate skill bars */
        const bars = entry.target.querySelectorAll('.skill-level-bar[data-level]');
        bars.forEach(bar => {
          bar.style.width = bar.dataset.level + '%';
        });

        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  animatedEls.forEach(el => observer.observe(el));

  /* Also observe skill bars inside cards that are themselves animated */
  const skillCards = document.querySelectorAll('.skill-card');
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target.querySelector('.skill-level-bar');
        if (bar && bar.dataset.level) {
          setTimeout(() => { bar.style.width = bar.dataset.level + '%'; }, 200);
        }
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  skillCards.forEach(card => skillObserver.observe(card));

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
