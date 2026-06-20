/**
 * Serenity Hotel Demo — loads content from JSON, resolves images (local → placeholder)
 */
(function () {
  const html = document.documentElement;
  const lang = html.getAttribute('lang') || 'vi';
  const page = document.body.dataset.page || 'home';
  const basePath = '../';
  const THEME_KEY = 'hotel-theme';

  let content = null;
  let dotsContainer = null;

  const LANGUAGES = [
    { code: 'vi', abbr: 'VN', label: 'Tiếng Việt', available: true },
    { code: 'en', abbr: 'EN', label: 'English', available: true },
  ];

  const ICONS = {
    globe: `<svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c3.87 3.13 3.87 14.87 0 18"/><path d="M12 3c-3.87 3.13-3.87 14.87 0 18"/></svg>`,
    moon: `<svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M21 14.5A8.5 8.5 0 1 1 9.5 3a7 7 0 0 0 11.5 11.5z"/></svg>`,
    sun: `<svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>`,
  };

  function getTheme() {
    return html.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function setTheme(theme) {
    const next = theme === 'light' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);
    applySiteColors();
    updateThemeSwitchUI();
  }

  function updateThemeSwitchUI() {
    const current = getTheme();
    const trigger = document.getElementById('theme-trigger');
    if (trigger) trigger.innerHTML = current === 'dark' ? ICONS.moon : ICONS.sun;
    document.querySelectorAll('[data-theme-set]').forEach((btn) => {
      const active = btn.dataset.themeSet === current;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function closeHeaderDropdowns() {
    document.querySelectorAll('.header-dropdown.is-open').forEach((dropdown) => {
      dropdown.classList.remove('is-open');
      dropdown.querySelector('.header-icon-btn')?.setAttribute('aria-expanded', 'false');
    });
  }

  let headerDropdownGlobalsBound = false;

  function initHeaderDropdowns() {
    document.querySelectorAll('.header-dropdown').forEach((dropdown) => {
      const btn = dropdown.querySelector('.header-icon-btn');
      const popup = dropdown.querySelector('.header-popup');

      btn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const wasOpen = dropdown.classList.contains('is-open');
        closeHeaderDropdowns();
        if (!wasOpen) {
          dropdown.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });

      popup?.addEventListener('click', (e) => e.stopPropagation());
    });

    if (!headerDropdownGlobalsBound) {
      document.addEventListener('click', closeHeaderDropdowns);
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeHeaderDropdowns();
      });
      headerDropdownGlobalsBound = true;
    }

    document.querySelectorAll('[data-theme-set]').forEach((btn) => {
      btn.addEventListener('click', () => {
        setTheme(btn.dataset.themeSet);
        closeHeaderDropdowns();
      });
    });
  }

  function renderLangMenu(currentFile) {
    const soon = lang === 'vi' ? 'Sắp có' : 'Coming soon';
    return LANGUAGES.map((item) => {
      const inner = `<span class="header-popup__abbr">${item.abbr} ${item.label}</span>`;
      if (!item.available) {
        return `<li><span class="header-popup__item is-soon" title="${soon}">${inner}</span></li>`;
      }
      const isActive = item.code === lang;
      const href = isActive ? '#' : `../${item.code}/${currentFile}`;
      return `<li><a href="${href}" class="header-popup__item${isActive ? ' is-active' : ''}"${isActive ? ' aria-current="true"' : ''}>${inner}</a></li>`;
    }).join('');
  }

  async function loadContent() {
    const res = await fetch(`${basePath}content/${lang}.json`);
    if (!res.ok) throw new Error('Cannot load content');
    content = await res.json();
    applySiteColors();
    return content;
  }

  function applySiteColors() {
    if (getTheme() === 'light') {
      html.style.setProperty('--color-accent', '#15243d');
      html.style.setProperty('--color-accent-warm', '#6b542f');
      html.style.setProperty('--color-accent-hover', '#243a5c');
      return;
    }
    const accent = content?.site?.colors?.accent || '#8b7355';
    html.style.setProperty('--color-accent', accent);
    html.style.setProperty('--color-accent-warm', accent);
    html.style.setProperty('--color-accent-hover', '#9d8468');
  }

  /** Use local path; on 404 fallback to Unsplash placeholder via setBg */
  function imageUrl(localPath, placeholderKey) {
    return localPath || content?.placeholders?.[placeholderKey] || '';
  }

  function setBg(el, localPath, placeholderKey) {
    if (!el) return;
    const ph = content?.placeholders?.[placeholderKey] || '';
    if (!localPath) { el.style.backgroundImage = `url('${ph}')`; return; }
    const tryLocal = `../${localPath.replace(/^\//, '')}`;
    const img = new Image();
    img.onload = () => { el.style.backgroundImage = `url('${tryLocal}')`; };
    img.onerror = () => { el.style.backgroundImage = `url('${ph}')`; };
    img.src = tryLocal;
  }

  function renderHeader() {
    const header = document.getElementById('site-header');
    if (!header || !content) return;

    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    const themeLabel = lang === 'vi' ? 'Giao diện' : 'Theme';
    const langLabel = lang === 'vi' ? 'Ngôn ngữ' : 'Language';
    const darkLabel = lang === 'vi' ? 'Tối' : 'Dark';
    const lightLabel = lang === 'vi' ? 'Sáng' : 'Light';

    const navLinks = content.nav
      .map((item) => {
        const active = item.href === currentFile ? ' class="active"' : '';
        return `<a href="${item.href}"${active}>${item.label}</a>`;
      })
      .join('');

    header.innerHTML = `
      <a href="index.html" class="logo">${content.site.name}</a>
      <nav class="nav-desktop">${navLinks}</nav>
      <div class="header-actions">
        <div class="header-dropdown" data-dropdown="lang">
          <button type="button" class="header-icon-btn" aria-label="${langLabel}" aria-haspopup="true" aria-expanded="false">
            ${ICONS.globe}
          </button>
          <div class="header-popup" role="menu">
            <ul class="header-popup__list">${renderLangMenu(currentFile)}</ul>
          </div>
        </div>
        <div class="header-dropdown" data-dropdown="theme">
          <button type="button" class="header-icon-btn" id="theme-trigger" aria-label="${themeLabel}" aria-haspopup="true" aria-expanded="false">
            ${getTheme() === 'dark' ? ICONS.moon : ICONS.sun}
          </button>
          <div class="header-popup" role="menu">
            <ul class="header-popup__list">
              <li>
                <button type="button" class="header-popup__item${getTheme() === 'dark' ? ' is-active' : ''}" data-theme-set="dark" aria-pressed="${getTheme() === 'dark'}">
                  ${ICONS.moon}<span class="header-popup__abbr">${darkLabel}</span>
                </button>
              </li>
              <li>
                <button type="button" class="header-popup__item${getTheme() === 'light' ? ' is-active' : ''}" data-theme-set="light" aria-pressed="${getTheme() === 'light'}">
                  ${ICONS.sun}<span class="header-popup__abbr">${lightLabel}</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
        <a href="booking.html" class="btn-book">${lang === 'vi' ? 'Đặt phòng' : 'Book'}</a>
        <button class="menu-toggle" aria-label="Menu" type="button">
          <span></span><span></span><span></span>
        </button>
      </div>
    `;

    const mobileNav = document.getElementById('nav-mobile');
    if (mobileNav) {
      mobileNav.innerHTML = content.nav
        .map((item) => {
          const active = item.href === currentFile ? ' class="active"' : '';
          return `<a href="${item.href}"${active}>${item.label}</a>`;
        })
        .join('');
    }

    const toggle = header.querySelector('.menu-toggle');
    toggle?.addEventListener('click', () => {
      const isOpen = mobileNav?.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.classList.toggle('nav-open', isOpen);
    });

    mobileNav?.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        toggle?.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
      });
    });

    // Close mobile nav on outside click
    mobileNav?.addEventListener('click', (e) => {
      if (e.target === mobileNav) {
        mobileNav.classList.remove('open');
        toggle?.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
      }
    });

    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 40);
    });

    initHeaderDropdowns();
    updateThemeSwitchUI();
  }

  function renderFooter() {
    const footer = document.getElementById('site-footer');
    if (!footer || !content) return;
    const { brand, columns, copyright } = content.footer || {};
    const socialCol = (columns || []).find((col) => !col.links || col.links.length === 0);
    const regularCols = (columns || []).filter((col) => col !== socialCol);
    const socialTitle = socialCol?.title || (lang === 'vi' ? 'Theo dõi chúng tôi' : 'Follow us');
    footer.innerHTML = `
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="index.html" class="logo">${brand?.name || content.site.name}</a>
          <div class="footer-info">
            <p>${brand?.address || content.site.address}</p>
            <p><a href="tel:${(brand?.phone || content.site.phone).replace(/\s/g, '')}">${brand?.phone || content.site.phone}</a></p>
            <p><a href="mailto:${brand?.email || content.site.email}">${brand?.email || content.site.email}</a></p>
          </div>
        </div>
        <div class="footer-cols">
          ${regularCols
            .map(
              (col) => `
            <div class="footer-col">
              <h4>${col.title}</h4>
              <ul>
                ${(col.links || [])
                  .map(
                    (link) => `
                  <li><a href="${link.href}">${link.label}</a></li>
                `
                  )
                  .join('')}
              </ul>
            </div>
          `
            )
            .join('')}
          <div class="footer-col">
            <h4>${socialTitle}</h4>
            <ul class="social-list">
              <li class="social-item"><a class="social-link" href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" width="24" height="24" style="display:block;width:100%;height:100%" fill="currentColor" aria-hidden="true"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg></a></li>
              <li class="social-item"><a class="social-link" href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" width="24" height="24" style="display:block;width:100%;height:100%" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg></a></li>
              <li class="social-item"><a class="social-link" href="#" aria-label="TikTok"><svg viewBox="0 0 24 24" width="24" height="24" style="display:block;width:100%;height:100%" fill="currentColor" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2 6.34 6.34 0 0 0 9.49 21.54a6.34 6.34 0 0 0 6.34-6.34V8.69a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.12z"/></svg></a></li>
              <li class="social-item"><a class="social-link" href="#" aria-label="Zalo"><svg viewBox="0 0 24 24" width="24" height="20" style="display:block;width:100%;height:100%" fill="currentColor" aria-hidden="true"><path d="M12 2C6.477 2 2 5.813 2 10.5c0 2.612 1.386 4.93 3.5 6.5l-.9 3.25 3.6-1.8c1.25.45 2.6.7 4 .7 5.523 0 10-3.813 10-8.5S17.523 2 12 2z"/></svg></a></li>
            </ul>
          </div>
        </div>
      </div>
      <p class="footer-copy">${copyright || ''}</p>
    `;
  }

  function renderSectionHead(el, section) {
    if (!el || !section) return;
    el.innerHTML = `
      <div class="section-head__text">
        <span class="section-label">${section.label}</span>
        <h2>${section.title}</h2>
      </div>
      <a href="${section.href}" class="section-head__link">${section.linkText}</a>
    `;
  }

  function bindCardImages(root) {
    root?.querySelectorAll('[data-img]').forEach((el) => {
      setBg(el, el.dataset.img, el.dataset.ph);
    });
  }

  function renderHome() {
    const h = content.home;
    document.getElementById('hero-title').textContent = h.heroTitle;
    document.getElementById('hero-subtitle').textContent = h.heroSubtitle;
    const introLabel = document.getElementById('intro-label');
    if (introLabel) introLabel.textContent = h.introLabel || content.site.name;
    document.getElementById('intro-title').textContent = h.introTitle;
    document.getElementById('intro-text').textContent = h.introText;
    document.getElementById('cta-rooms').textContent = h.ctaRooms;
    document.getElementById('cta-booking').textContent = h.ctaBooking;
    setBg(document.getElementById('hero-bg'), content.images.homeHero, 'homeHero');

    const highlightsEl = document.getElementById('home-highlights');
    if (highlightsEl && h.highlights?.length) {
      highlightsEl.innerHTML = h.highlights
        .map(
          (item) => `
        <div class="highlight">
          <h3 class="highlight__text">${item.title}</h3>
          <p class="highlight__text">${item.text}</p>
        </div>
      `
        )
        .join('');
    }

    renderSectionHead(document.getElementById('rooms-section-head'), h.roomsSection);

    const roomsGrid = document.getElementById('rooms-preview');
    if (roomsGrid) {
      roomsGrid.innerHTML = content.rooms
        .map(
          (room) => `
        <a href="rooms.html#${room.id}" class="card card--link">
          <div class="card__img" data-img="${room.image}" data-ph="${room.imageKey}"></div>
          <div class="card__overlay">
            <h3>${room.name}</h3>
            <span class="price">${lang === 'vi' ? 'Từ' : 'From'} ${room.priceFrom} ${room.currency}</span>
          </div>
        </a>
      `
        )
        .join('');
      bindCardImages(roomsGrid);
    }

    const diningWrap = document.getElementById('home-dining-wrap');
    const d = h.diningSpot;
    if (diningWrap && d) {
      const firstImage = d.images?.[0] || { src: '', key: '' };
      diningWrap.innerHTML = `
        <div class="split">
          <div class="split__image" data-img="${firstImage.src}" data-ph="${firstImage.key}"></div>
          <div class="split__text">
            <span class="section-label">${d.label}</span>
            <h3>${d.title}</h3>
            <p>${d.text}</p>
            <a href="${d.href}" class="btn btn--primary" style="margin-top:1.5rem;align-self:flex-start">${d.cta}</a>
          </div>
        </div>
      `;
      bindCardImages(diningWrap);
    }

    renderSectionHead(document.getElementById('exp-section-head'), h.experiencesSection);

    const expGrid = document.getElementById('home-experiences');
    if (expGrid) {
      expGrid.innerHTML = content.experiences
        .map(
          (item) => `
        <a href="experiences.html" class="card card--link">
          <div class="card__img" data-img="${item.image}" data-ph="${item.imageKey}"></div>
          <div class="card__overlay">
            <h3>${item.name}</h3>
            <span class="price">${item.description}</span>
          </div>
        </a>
      `
        )
        .join('');
      bindCardImages(expGrid);
    }

    const quoteEl = document.getElementById('home-quote');
    if (quoteEl && h.quote) {
      quoteEl.innerHTML = `<p>${h.quote.text}</p><cite>${h.quote.cite}</cite>`;
    }

    const ctaEl = document.getElementById('home-cta');
    const band = h.ctaBand;
    if (ctaEl && band) {
      ctaEl.innerHTML = `
        <div class="cta-band__inner">
          <span class="section-label">${content.site.name}</span>
          <h2>${band.title}</h2>
          <p>${band.text}</p>
          <a href="${band.href}" class="btn btn--primary">${band.cta}</a>
        </div>
      `;
    }
  }

  function renderRooms() {
    setBg(document.getElementById('hero-bg'), content.images.roomsHero, 'roomsHero');
    const pt = content.pageTitles.rooms;
    const h1 = document.getElementById('rooms-hero-title');
    const sub = document.getElementById('rooms-hero-subtitle');
    if (h1) h1.textContent = pt.title;
    if (sub) sub.textContent = pt.subtitle;

    const rp = content.roomsPage;
    const introLabel = document.getElementById('rooms-intro-label');
    if (introLabel) introLabel.textContent = rp.introLabel;
    document.getElementById('rooms-intro-title').textContent = rp.introTitle;
    document.getElementById('rooms-intro-text').textContent = rp.introText;

    const whyLabel = document.getElementById('rooms-why-label');
    if (whyLabel) whyLabel.textContent = rp.whyLabel;
    document.getElementById('rooms-why-title').textContent = rp.whyTitle;
    const whyGrid = document.getElementById('rooms-why-grid');
    if (whyGrid) {
      whyGrid.innerHTML = rp.whyItems
        .map(
          (item) => `
        <div class="highlight">
          <h3 class="highlight__text">${item.title}</h3>
          <p class="highlight__text">${item.text}</p>
        </div>
      `
        )
        .join('');
    }

    const ctaEl = document.getElementById('rooms-cta');
    if (ctaEl) {
      ctaEl.innerHTML = `
        <div class="cta-band__inner">
          <h2>${rp.ctaTitle}</h2>
          <p>${rp.ctaText}</p>
          <a href="${rp.ctaHref}" class="btn btn--primary">${rp.ctaBtn}</a>
        </div>
      `;
    }

    const grid = document.getElementById('rooms-grid');
    if (!grid) return;
    grid.innerHTML = `<div class="rooms-grid">` + content.rooms
      .map(
        (room, i) => {
          return `
      <div class="room-card">
        <div class="room-card__gallery" id="main-${room.id}">
          <img class="room-card__img" src="${content.placeholders[room.images[0].key] || room.images[0].src}" alt="${room.name}">
          <button class="room-card__nav room-card__nav--prev" data-room="${room.id}" aria-label="Trước">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <div class="room-card__dots" id="dots-${room.id}">
            ${room.images.map((_, idx) => `<span class="room-card__dot ${idx === 0 ? 'active' : ''}" data-index="${idx}"></span>`).join('')}
          </div>
          <button class="room-card__nav room-card__nav--next" data-room="${room.id}" aria-label="Sau">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
        <div class="room-card__info">
          <span class="section-label" style="margin-bottom:0.5rem">${lang === 'vi' ? 'Phòng' : 'Room'}</span>
          <h3>${room.name}</h3>
          <p class="room-card__desc">${room.description}</p>
          <div class="room-card__actions">
            <p class="room-card__price">${lang === 'vi' ? 'Từ' : 'From'} <span>${room.priceFrom} ${room.currency}</span></p>
            <a href="booking.html?room=${room.id}" class="btn btn--primary btn--sm">${lang === 'vi' ? 'Đặt phòng' : 'Book'}</a>
          </div>
          <ul class="room-card__amenities">${room.amenities.map((a) => `<li>${a}</li>`).join('')}</ul>
        </div>
      </div>
    `;
        }
      )
      .join('') + `</div>`;
    initRoomGalleries();
  }

  const roomGalleryState = {};

  function initRoomGalleries() {
    content.rooms.forEach((room) => {
      const state = { current: 0 };
      roomGalleryState[room.id] = state;

      const main = document.getElementById(`main-${room.id}`);
      if (!main) return;

      const allImages = room.images.map(img => content.placeholders[img.key] || img.src);

      function setActive(idx) {
        state.current = idx;
        const dots = main.querySelectorAll('.room-card__dot');
        dots.forEach((dot, i) => dot.classList.toggle('active', i === idx));
        const img = main.querySelector('.room-card__img');
        img.src = allImages[idx];
      }

      function next() {
        setActive((state.current + 1) % room.images.length);
      }

      function prev() {
        setActive((state.current - 1 + room.images.length) % room.images.length);
      }

      // Click on image opens lightbox (not on nav buttons or dots)
      main.addEventListener('click', (e) => {
        if (e.target.closest('.room-card__nav') || e.target.closest('.room-card__dots')) return;
        openLightbox(allImages, state.current);
      });

      // Touch swipe
      let touchStartX = 0;
      main.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
      main.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 40) { dx > 0 ? prev() : next(); }
      });

      main.querySelector('.room-card__nav--next')?.addEventListener('click', (e) => { e.stopPropagation(); next(); });
      main.querySelector('.room-card__nav--prev')?.addEventListener('click', (e) => { e.stopPropagation(); prev(); });
      main.querySelectorAll('.room-card__dot').forEach((dot) => {
        dot.addEventListener('click', (e) => { e.stopPropagation(); setActive(parseInt(dot.dataset.index)); });
      });
    });
  }

  let lightboxOpen = false;
  let lightboxIdx = 0;
  let lightboxImages = [];

  function openLightbox(images, index) {
    lightboxImages = images;
    lightboxIdx = index;
    lightboxOpen = true;
    const lb = document.getElementById('lightbox');
    if (!lb) return;
    lb.querySelector('.lightbox__img').src = images[index];
    lb.querySelector('.lightbox__counter').textContent = `${index + 1} / ${images.length}`;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightboxOpen = false;
    const lb = document.getElementById('lightbox');
    if (lb) {
      lb.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  function initLightbox() {
    const lb = document.getElementById('lightbox');
    if (!lb) return;
    lb.addEventListener('click', (e) => {
      if (e.target === lb.querySelector('.lightbox__content') || e.target === lb) { closeLightbox(); return; }
    });
    lb.addEventListener('keydown', (e) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') { lightboxIdx = (lightboxIdx + 1) % lightboxImages.length; lb.querySelector('.lightbox__img').src = lightboxImages[lightboxIdx]; lb.querySelector('.lightbox__counter').textContent = `${lightboxIdx + 1} / ${lightboxImages.length}`; }
      if (e.key === 'ArrowLeft') { lightboxIdx = (lightboxIdx - 1 + lightboxImages.length) % lightboxImages.length; lb.querySelector('.lightbox__img').src = lightboxImages[lightboxIdx]; lb.querySelector('.lightbox__counter').textContent = `${lightboxIdx + 1} / ${lightboxImages.length}`; }
    });
    lb.querySelector('.lightbox__close')?.addEventListener('click', closeLightbox);
    lb.querySelector('.lightbox__prev')?.addEventListener('click', () => {
      lightboxIdx = (lightboxIdx - 1 + lightboxImages.length) % lightboxImages.length;
      lb.querySelector('.lightbox__img').src = lightboxImages[lightboxIdx];
      lb.querySelector('.lightbox__counter').textContent = `${lightboxIdx + 1} / ${lightboxImages.length}`;
    });
    lb.querySelector('.lightbox__next')?.addEventListener('click', () => {
      lightboxIdx = (lightboxIdx + 1) % lightboxImages.length;
      lb.querySelector('.lightbox__img').src = lightboxImages[lightboxIdx];
      lb.querySelector('.lightbox__counter').textContent = `${lightboxIdx + 1} / ${lightboxImages.length}`;
    });
    // Touch swipe on lightbox
    let lbTouchStartX = 0;
    lb.addEventListener('touchstart', (e) => { lbTouchStartX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', (e) => {
      if (!lightboxOpen) return;
      const dx = e.changedTouches[0].clientX - lbTouchStartX;
      if (Math.abs(dx) > 40) {
        if (dx > 0) {
          lightboxIdx = (lightboxIdx - 1 + lightboxImages.length) % lightboxImages.length;
        } else {
          lightboxIdx = (lightboxIdx + 1) % lightboxImages.length;
        }
        lb.querySelector('.lightbox__img').src = lightboxImages[lightboxIdx];
        lb.querySelector('.lightbox__counter').textContent = `${lightboxIdx + 1} / ${lightboxImages.length}`;
      }
    });
  }

  function renderDining() {
    setBg(document.getElementById('hero-bg'), content.images.diningHero, 'diningHero');
    const pt = content.pageTitles.dining;
    const h1 = document.getElementById('dining-hero-title');
    const sub = document.getElementById('dining-hero-subtitle');
    if (h1) h1.textContent = pt.title;
    if (sub) sub.textContent = pt.subtitle;

    const container = document.getElementById('dining-sections');
    if (!container) return;

    const ICONS_DINING = {
      clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
      expand: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" width="14" height="14"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`,
    };

    container.innerHTML = content.dining
      .map(
        (item, i) => `
      <section class="dining-feature" data-gallery="${i}">
        <div class="dining-feature__image">
          <div class="dining-feature__bg" data-img="${item.images[0].src}" data-ph="${item.images[0].key}"></div>
          <div class="dining-feature__image-overlay"></div>
          <div class="dining-feature__click-hint">
            ${ICONS_DINING.expand}
            <span>${lang === 'vi' ? 'Xem ảnh' : 'View photos'}</span>
          </div>
        </div>
        <div class="dining-feature__content">
          <div class="dining-feature__number">0${i + 1}</div>
          <h2 class="dining-feature__name">${item.name}</h2>
          <p class="dining-feature__desc">${item.description}</p>
          <div class="dining-feature__meta">
            <div class="dining-feature__hours">
              ${ICONS_DINING.clock}
              <span>${item.hours}</span>
            </div>
          </div>
          <div class="dining-feature__gallery" id="dining-gallery-${i}">
            ${item.images
              .map(
                (img, idx) => `
              <img
                class="dining-feature__gallery-thumb${idx === 0 ? ' active' : ''}"
                src="${content.placeholders[img.key] || img.src}"
                alt="${item.name} — ${lang === 'vi' ? 'Ảnh' : 'Photo'} ${idx + 1}"
                data-gallery="${i}"
                data-index="${idx}"
              />
            `
              )
              .join('')}
          </div>
        </div>
      </section>${i < content.dining.length - 1 ? '<div class="dining-divider"><span class="dining-divider__dot"></span></div>' : ''}`
      )
      .join('');

    bindCardImages(container);
    initDiningFeatureGallery();
  }

  function initDiningFeatureGallery() {
    content.dining.forEach((item, i) => {
      const allImages = item.images.map((img) => content.placeholders[img.key] || img.src);

      document.querySelectorAll(`[data-gallery="${i}"]`).forEach((el) => {
        if (el.classList.contains('dining-feature__gallery-thumb')) {
          el.addEventListener('click', () => {
            const idx = parseInt(el.dataset.index);
            document.querySelectorAll(`[data-gallery="${i}"]`).forEach((t) => {
              t.classList.toggle('active', t.dataset.index === String(idx));
            });
            const feature = document.querySelector(`.dining-feature[data-gallery="${i}"]`);
            const bg = feature?.querySelector('.dining-feature__bg');
            if (bg) bg.style.backgroundImage = `url('${allImages[idx]}')`;
          });
        }
      });

      const feature = document.querySelector(`.dining-feature[data-gallery="${i}"]`);
      feature?.querySelector('.dining-feature__image')?.addEventListener('click', () => {
        const activeIdx = parseInt(
          document.querySelector(`.dining-feature[data-gallery="${i}"] .dining-feature__gallery-thumb.active`)?.dataset.index || '0'
        );
        openLightbox(allImages, activeIdx);
      });
    });
  }

  function renderExperiences() {
    setBg(document.getElementById('hero-bg'), content.images.experiencesHero, 'experiencesHero');
    const pt = content.pageTitles.experiences;
    const h1 = document.getElementById('exp-hero-title');
    const sub = document.getElementById('exp-hero-subtitle');
    if (h1) h1.textContent = pt.title;
    if (sub) sub.textContent = pt.subtitle;

    const container = document.getElementById('exp-carousel-wrap');
    if (!container) return;

    container.innerHTML = `
      <div class="exp-tabs" id="exp-tabs"></div>
      <div class="exp-carousel">
        <div class="exp-carousel__track" id="exp-carousel-track"></div>
        <div class="exp-carousel__dots" id="exp-carousel-dots"></div>
      </div>
    `;

    // Exp tabs nav
    const tabsEl = document.getElementById('exp-tabs');
    tabsEl.innerHTML = content.experiences
      .map((item, i) => `<button class="exp-tab${i === 0 ? ' active' : ''}" data-slide="${i}">${item.name}</button>`)
      .join('');

    const track = document.getElementById('exp-carousel-track');
    track.innerHTML = content.experiences
      .map(
        (item, i) => `
        <div class="exp-slide" data-index="${i}">
          <div class="exp-slide__img-wrap">
            <img class="exp-slide__img" src="${content.placeholders[item.images[0].key] || item.images[0].src}" alt="${item.name}" />
          </div>
          <div class="exp-slide__content">
            <span class="section-label">${lang === 'vi' ? 'Trải nghiệm' : 'Experience'}</span>
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <button class="btn btn--outline-light">${lang === 'vi' ? 'Khám phá' : 'Explore'}</button>
          </div>
        </div>
      `
      )
      .join('');

    // Build dots
    dotsContainer = document.getElementById('exp-carousel-dots');
    dotsContainer.innerHTML = content.experiences
      .map((_, i) => `<button class="exp-carousel__dot${i === 0 ? ' active' : ''}" data-slide="${i}" aria-label="${lang === 'vi' ? 'Trải nghiệm' : 'Experience'} ${i + 1}"></button>`)
      .join('');

    initExpCarousel();
  }

  const expCarouselState = { current: 0 };

  function initExpCarousel() {
    const track = document.getElementById('exp-carousel-track');
    if (!track) return;
    const slides = track.querySelectorAll('.exp-slide');
    const total = slides.length;
    dotsContainer = document.getElementById('exp-carousel-dots');

    function goTo(idx) {
      expCarouselState.current = ((idx % total) + total) % total;
      track.style.transform = `translateX(-${expCarouselState.current * 100}%)`;

      // Update dots
      track.querySelectorAll('.exp-carousel__dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === expCarouselState.current);
      });
      // Update tab nav
      document.querySelectorAll('.exp-tab').forEach((tab, i) => {
        tab.classList.toggle('active', i === expCarouselState.current);
      });
    }

    dotsContainer?.querySelectorAll('.exp-carousel__dot').forEach((dot) => {
      dot.addEventListener('click', () => goTo(parseInt(dot.dataset.slide)));
    });
    document.getElementById('exp-tabs')?.querySelectorAll('.exp-tab').forEach((tab) => {
      tab.addEventListener('click', () => goTo(parseInt(tab.dataset.slide)));
    });

    // Image arrows per slide
    slides.forEach((slide) => {
      const expIdx = parseInt(slide.dataset.index);
      const item = content.experiences[expIdx];
      if (!item || item.images.length <= 1) return;

      let imgIdx = 0;
      const mainImg = slide.querySelector('.exp-slide__img');
      const totalImgs = item.images.length;

      function setImg(idx) {
        imgIdx = ((idx % totalImgs) + totalImgs) % totalImgs;
        mainImg.src = content.placeholders[item.images[imgIdx].key] || item.images[imgIdx].src;
      }

      slide.querySelector('.exp-slide__arrow--prev')?.addEventListener('click', (e) => {
        e.stopPropagation();
        setImg(imgIdx - 1);
      });
      slide.querySelector('.exp-slide__arrow--next')?.addEventListener('click', (e) => {
        e.stopPropagation();
        setImg(imgIdx + 1);
      });
    });
  }

  function renderAbout() {
    setBg(document.getElementById('hero-bg'), content.images.aboutHero, 'aboutHero');
    const pt = content.pageTitles.about;
    const h1 = document.getElementById('about-hero-title');
    const sub = document.getElementById('about-hero-subtitle');
    if (h1) h1.textContent = pt.title;
    if (sub) sub.textContent = pt.subtitle;
    const a = content.about;
    document.getElementById('about-title').textContent = a.title;
    const paras = document.getElementById('about-paras');
    if (paras) paras.innerHTML = a.paragraphs.map((p) => `<p>${p}</p>`).join('');
    setBg(document.getElementById('about-image'), a.image, a.imageKey);
    const loc = document.getElementById('about-location');
    if (loc) loc.textContent = content.site.address;
  }

  function renderContact() {
    setBg(document.getElementById('hero-bg'), content.images.contactHero, 'contactHero');
    document.getElementById('contact-title').textContent = content.contact.title;
  }

  function renderBooking() {
    setBg(document.getElementById('hero-bg'), content.images.bookingHero, 'bookingHero');
    const bookingTitle = document.getElementById('booking-title');
    if (bookingTitle && !bookingTitle.textContent.trim()) {
      bookingTitle.textContent = lang === 'vi' ? 'Đặt phòng' : 'Reservation';
    }
    document.getElementById('booking-note').textContent = content.booking.note;
    const select = document.getElementById('room-type');
    if (select) {
      const opt0 = lang === 'vi' ? 'Chọn loại phòng' : 'Select room type';
      select.innerHTML = `<option value="">${opt0}</option>${content.rooms
        .map((r) => `<option value="${r.id}">${r.name}</option>`)
        .join('')}`;
      const params = new URLSearchParams(window.location.search);
      const room = params.get('room');
      if (room) select.value = room;
    }
  }

  async function apiFetch(path, options = {}) {
    const base = window.__API_URL__ || 'http://localhost:3001';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const opts = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      signal: controller.signal,
    };
    try {
      return await fetch(`${base}${path}`, opts).finally(() => clearTimeout(timeout));
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw error;
    }
  }

  function setupForms() {
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
      bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const success = document.getElementById('booking-success');
        const error = document.getElementById('booking-error');
        if (success) {
          success.textContent = '';
          success.classList.remove('show');
        }
        if (error) {
          error.textContent = '';
          error.classList.remove('show');
        }
        const payload = {
          checkin: bookingForm.querySelector('#checkin')?.value || '',
          checkout: bookingForm.querySelector('#checkout')?.value || '',
          guests: Number(bookingForm.querySelector('#guests')?.value || 1),
          roomType: bookingForm.querySelector('#room-type')?.value || '',
          name: bookingForm.querySelector('#b-name')?.value || '',
          email: bookingForm.querySelector('#b-email')?.value || '',
          phone: bookingForm.querySelector('#b-phone')?.value || '',
          notes: bookingForm.querySelector('#notes')?.value || '',
        };
        try {
          const res = await apiFetch('/api/bookings', { method: 'POST', body: JSON.stringify(payload) });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data?.error || 'Đặt phòng không thành công. Vui lòng thử lại sau.');
          }
          if (success) {
            success.textContent = content.booking.success;
            success.classList.add('show');
          }
          bookingForm.reset();
        } catch (err) {
          console.error('[BOOKING ERROR]', err);
          if (error) {
            error.textContent = err.message || 'Đặt phòng không thành công. Vui lòng thử lại sau.';
            error.classList.add('show');
          }
        }
      });
    }
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const success = document.getElementById('contact-success');
        const error = document.getElementById('contact-error');
        if (success) {
          success.textContent = '';
          success.classList.remove('show');
        }
        if (error) {
          error.textContent = '';
          error.classList.remove('show');
        }
        const payload = {
          name: contactForm.querySelector('#name')?.value || '',
          email: contactForm.querySelector('#email')?.value || '',
          message: contactForm.querySelector('#message')?.value || '',
        };
        try {
          const res = await apiFetch('/api/messages', { method: 'POST', body: JSON.stringify(payload) });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data?.error || 'Gửi tin nhắn không thành công. Vui lòng thử lại sau.');
          }
          if (success) {
            success.textContent = content.contact.formSuccess;
            success.classList.add('show');
          }
          contactForm.reset();
        } catch (err) {
          console.error('[CONTACT ERROR]', err);
          if (error) {
            error.textContent = err.message || 'Gửi tin nhắn không thành công. Vui lòng thử lại sau.';
            error.classList.add('show');
          }
        }
      });
    }
  }

  const pageRenderers = {
    home: renderHome,
    rooms: renderRooms,
    dining: renderDining,
    experiences: renderExperiences,
    about: renderAbout,
    contact: renderContact,
    booking: renderBooking,
  };

  async function init() {
    try {
      await loadContent();
      renderHeader();
      renderFooter();
      pageRenderers[page]?.();
      initLightbox();
      setupForms();
    } catch (err) {
      console.error(err);
      document.body.innerHTML += `<p style="padding:2rem;color:red">Lỗi tải nội dung. Hãy chạy qua local server (xem README).</p>`;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
