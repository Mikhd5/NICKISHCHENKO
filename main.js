(() => {
  'use strict';

  // Enable reveal-only styles only after this script is successfully running.
  document.documentElement.classList.add('js');

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  // Premium ferry preloader: never block the page indefinitely.
  const pageLoader = $('#siteLoader');
  let loaderDismissed = false;
  const loaderStartedAt = performance.now();
  const dismissLoader = () => {
    if (!pageLoader || loaderDismissed) return;
    loaderDismissed = true;
    const wait = Math.max(0, 620 - (performance.now() - loaderStartedAt));
    window.setTimeout(() => {
      pageLoader.classList.add('is-hidden');
      pageLoader.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('is-loading');
      window.setTimeout(() => pageLoader.remove(), 650);
    }, wait);
  };
  window.addEventListener('load', dismissLoader, { once: true });
  window.setTimeout(dismissLoader, 2800);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const saveData = Boolean(navigator.connection && (navigator.connection.saveData || /(^|-)2g$/.test(navigator.connection.effectiveType || '')));

  // Hero video: only download/play when motion is allowed and the hero is in view.
  const heroVideo = $('.hero-video');
  if (heroVideo) {
    const heroSection = $('.hero');
    const setStaticHero = () => {
      heroVideo.pause();
      heroVideo.removeAttribute('autoplay');
      heroVideo.preload = 'none';
      heroSection?.classList.add('video-static');
    };
    if (reduceMotion.matches || saveData) {
      setStaticHero();
    } else {
      let heroInView = true;
      const tryPlay = () => {
        if (document.hidden || !heroInView || reduceMotion.matches || saveData) return;
        heroSection?.classList.remove('video-static');
        const promise = heroVideo.play();
        if (promise && typeof promise.then === 'function') {
          promise.then(() => heroSection?.classList.remove('video-static'))
            .catch(() => heroSection?.classList.add('video-static'));
        }
      };
      if ('IntersectionObserver' in window && heroSection) {
        const videoObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            heroInView = entry.isIntersecting;
            if (heroInView) tryPlay(); else heroVideo.pause();
          });
        }, { threshold: 0.08 });
        videoObserver.observe(heroSection);
      } else {
        tryPlay();
      }
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) heroVideo.pause(); else tryPlay();
      });
      heroVideo.addEventListener('error', () => heroSection?.classList.add('video-static'), { once: true });
      reduceMotion.addEventListener?.('change', (event) => { if (event.matches) setStaticHero(); else tryPlay(); });
    }
  }

  // Image fallback for intermittent third-party image CDN failures.
  $$('img').forEach((image) => {
    image.addEventListener('error', () => {
      image.classList.add('image-unavailable');
      image.setAttribute('aria-hidden', 'true');
    }, { once: true });
  });

  // In-view reveals. Content remains visible when IntersectionObserver is unavailable.
  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -36px 0px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('visible'));
  }

  // Scroll progress without doing layout work on every scroll event.
  const progressBar = $('#scrollProgress');
  let progressQueued = false;
  const updateProgress = () => {
    if (!progressBar || progressQueued) return;
    progressQueued = true;
    window.requestAnimationFrame(() => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      progressBar.value = progress * 100;
      progressQueued = false;
    });
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();

  // Mobile navigation with Escape, outside click, and accessible state.
  const menuToggle = $('#menuToggle');
  const navLinks = $('#navLinks');
  const closeMenu = () => {
    navLinks?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Відкрити меню');
    const icon = $('span', menuToggle || document.createElement('div'));
    if (icon) icon.textContent = '☰';
  };
  menuToggle?.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
    const icon = $('span', menuToggle);
    if (icon) icon.textContent = open ? '×' : '☰';
  });
  $$('#navLinks a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('click', (event) => {
    if (navLinks?.classList.contains('open') && !event.target.closest('.nav')) closeMenu();
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });

  // Scroll spy for section navigation.
  const navAnchors = $$('#navLinks a[href^="#"]');
  const navTargets = navAnchors.map((link) => $(link.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && navTargets.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navAnchors.forEach((link) => {
          if (link.getAttribute('href') === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-28% 0px -62% 0px', threshold: 0 });
    navTargets.forEach((target) => sectionObserver.observe(target));
  }

  // Catalog filters use the hidden attribute, retaining keyboard and screen-reader semantics.
  const filterButtons = $$('[data-filter]');
  const carCards = $$('.car-card');
  filterButtons.forEach((button) => button.addEventListener('click', () => {
    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    const filter = button.dataset.filter;
    carCards.forEach((card) => {
      const categories = (card.dataset.category || '').split(/\s+/);
      card.hidden = filter !== 'all' && !categories.includes(filter);
    });
  }));
  filterButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.classList.contains('active'))));

  // Lead modal with focus restoration and a keyboard focus trap.
  const modal = $('#leadModal');
  const modalCard = $('.modal-card', modal || document);
  const modalClose = $('#modalClose');
  const modalService = $('#modalService');
  let previouslyFocused = null;
  const focusableSelector = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  const openModal = (service) => {
    if (!modal) return;
    previouslyFocused = document.activeElement;
    if (service && modalService) {
      const option = Array.from(modalService.options).find((item) => item.value === service || item.textContent.trim() === service);
      if (option) modalService.value = option.value;
    }
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    window.requestAnimationFrame(() => modalClose?.focus());
  };
  const closeModal = () => {
    if (!modal || !modal.classList.contains('open')) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (previouslyFocused && typeof previouslyFocused.focus === 'function') previouslyFocused.focus();
  };
  $$('[data-open-modal]').forEach((button) => button.addEventListener('click', () => openModal(button.dataset.service || '')));
  $$('#services [data-service-link]').forEach((link) => link.addEventListener('click', () => {
    const service = link.dataset.serviceLink;
    const select = $('#service');
    if (!select) return;
    const option = Array.from(select.options).find((item) => item.value === service || item.textContent.trim() === service);
    if (option) select.value = option.value;
  }));
  modalClose?.addEventListener('click', closeModal);
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal(); });
  modal?.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
  modal?.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab' || !modalCard) return;
    const focusable = $$(focusableSelector, modalCard).filter((el) => el.offsetParent !== null);
    if (!focusable.length) { event.preventDefault(); modalCard.focus(); return; }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  // Safe text-only lead preparation. Nothing is sent to a server by this static site.
  const clean = (value, max = 1200) => String(value || '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
  const buildMessage = (lines) => [
    'Вітаю! Мене цікавить співпраця з NICKISHCHENKO.',
    ...lines.map((line) => clean(line, 1200)).filter(Boolean)
  ].join('\n');
  const showPrepared = (previewId, resultId, message) => {
    const preview = $(`#${previewId}`);
    const result = $(`#${resultId}`);
    if (preview && result) {
      preview.textContent = message;
      result.classList.add('show');
      result.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'nearest' });
    }
  };
  async function copyText(text, button) {
    const original = button.textContent;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.className = 'clipboard-fallback';
        document.body.appendChild(area);
        area.select();
        const copied = document.execCommand('copy');
        area.remove();
        if (!copied) throw new Error('Clipboard unavailable');
      }
      button.textContent = 'Скопійовано ✓';
    } catch (error) {
      button.textContent = 'Не вдалося скопіювати';
    }
    window.setTimeout(() => { button.textContent = original; }, 2200);
  }

  let mainMessage = '';
  const mainForm = $('#mainForm');
  const mainContact = $('#contact');
  const modalContact = $('#modalContact');
  [mainContact, modalContact].filter(Boolean).forEach((field) => {
    field.addEventListener('input', () => field.setCustomValidity(''));
  });
  mainForm?.addEventListener('submit', (event) => {
    if (mainContact) mainContact.setCustomValidity(mainContact.value.trim() ? '' : 'Вкажіть телефон або Instagram для зв’язку.');
    event.preventDefault();
    if (!mainForm.reportValidity()) return;
    const data = new FormData(mainForm);
    mainMessage = buildMessage([
      `Послуга: ${data.get('service')}`,
      data.get('carName') ? `Авто: ${data.get('carName')}` : '',
      data.get('carYear') ? `Рік: ${data.get('carYear')}` : '',
      data.get('budget') ? `Бюджет / бажана ціна: ${data.get('budget')}` : '',
      data.get('contactName') ? `Ім’я: ${data.get('contactName')}` : '',
      `Контакт: ${data.get('contact')}`,
      data.get('details') ? `Деталі: ${data.get('details')}` : ''
    ]);
    showPrepared('messagePreview', 'formResult', mainMessage);
  });
  $('#copyMessage')?.addEventListener('click', (event) => copyText(mainMessage, event.currentTarget));

  let modalMessage = '';
  const modalForm = $('#modalForm');
  modalForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (modalContact) modalContact.setCustomValidity(modalContact.value.trim() ? '' : 'Вкажіть телефон або Instagram для зв’язку.');
    if (!modalForm.reportValidity()) return;
    modalMessage = buildMessage([
      `Послуга: ${modalService?.value || 'Консультація'}`,
      $('#modalName')?.value ? `Ім’я: ${$('#modalName').value}` : '',
      `Контакт: ${$('#modalContact')?.value || ''}`,
      $('#modalNote')?.value ? `Запит: ${$('#modalNote').value}` : ''
    ]);
    showPrepared('modalPreview', 'modalResult', modalMessage);
  });
  $('#modalCopy')?.addEventListener('click', (event) => copyText(modalMessage, event.currentTarget));

  // Forms are enabled only after the local-only handlers are registered.
  const mainSubmit = $('#mainForm button[type="submit"]');
  const modalSubmit = $('#modalForm button[type="submit"]');
  if (mainForm && mainSubmit) mainSubmit.disabled = false;
  if (modalForm && modalSubmit) modalSubmit.disabled = false;

  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
