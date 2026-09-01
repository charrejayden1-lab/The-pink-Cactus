/* THE PINK CACTUS — site interactions */
(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  var hamburger = document.querySelector('.hamburger');
  var mobileNav = document.querySelector('.mobile-nav');
  var body = document.body;

  /* header scroll state */
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 24) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* mobile nav */
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      hamburger.classList.toggle('is-open', open);
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      body.classList.toggle('nav-open', open);
    });
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileNav.classList.remove('is-open');
        hamburger.classList.remove('is-open');
        body.classList.remove('nav-open');
      });
    });
  }

  /* mark active nav bubble by current page */
  var path = (window.location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('[data-nav-link]').forEach(function (link) {
    var target = link.getAttribute('data-nav-link');
    if (target === path || (target === 'index.html' && path === '')) {
      link.classList.add('is-active');
    }
  });

  /* scroll reveal */
  var revealEls = document.querySelectorAll('.reveal, .reveal-zoom');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* footer year */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* gallery filters */
  var filterBtns = document.querySelectorAll('.gallery-filters button');
  var galleryItems = document.querySelectorAll('.masonry-item');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      var filter = btn.getAttribute('data-filter');
      galleryItems.forEach(function (item) {
        var cat = item.getAttribute('data-category');
        var show = filter === 'all' || filter === cat;
        item.style.display = show ? '' : 'none';
      });
    });
  });

  /* lightbox */
  var lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    var lbLabel = lightbox.querySelector('.lightbox-label');
    var lbClose = lightbox.querySelector('.lightbox-close');
    document.querySelectorAll('[data-lightbox-trigger]').forEach(function (item) {
      item.addEventListener('click', function () {
        var k = item.querySelector('.k') ? item.querySelector('.k').textContent : '';
        var c = item.querySelector('.c') ? item.querySelector('.c').textContent : '';
        var tone = Array.from(item.classList).find(function (cl) { return /^g-\d/.test(cl); });
        var box = lightbox.querySelector('.lightbox-box');
        if (box) {
          box.className = 'lightbox-box';
          if (tone) box.classList.add(tone);
        }
        if (lbLabel) lbLabel.innerHTML = '<div class="k" style="font-family:var(--font-display);font-size:2rem;color:#fff;">' + k + '</div><div class="c" style="color:var(--teal);letter-spacing:.12em;text-transform:uppercase;font-size:.75rem;margin-top:8px;">' + c + '</div>';
        lightbox.classList.add('is-open');
        body.style.overflow = 'hidden';
      });
    });
    function closeLightbox() {
      lightbox.classList.remove('is-open');
      body.style.overflow = '';
    }
    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLightbox(); });
  }

  /* order online modal */
  var orderModal = document.querySelector('.order-modal');
  if (orderModal) {
    var orderModalClose = orderModal.querySelector('.order-modal-close');
    var orderModalLastFocus = null;

    function openOrderModal(e) {
      if (e) e.preventDefault();
      orderModalLastFocus = document.activeElement;
      orderModal.classList.add('is-open');
      body.classList.add('order-modal-open');
      if (orderModalClose) orderModalClose.focus();
    }
    function closeOrderModal() {
      orderModal.classList.remove('is-open');
      body.classList.remove('order-modal-open');
      if (orderModalLastFocus && typeof orderModalLastFocus.focus === 'function') {
        orderModalLastFocus.focus();
      }
    }

    document.querySelectorAll('[data-order-modal]').forEach(function (el) {
      el.addEventListener('click', openOrderModal);
    });
    if (orderModalClose) orderModalClose.addEventListener('click', closeOrderModal);
    orderModal.addEventListener('click', function (e) {
      if (e.target === orderModal) closeOrderModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && orderModal.classList.contains('is-open')) closeOrderModal();
    });
  }

  /* on the table: 3D coverflow carousel */
  var coverflow = document.querySelector('[data-coverflow]');
  if (coverflow) {
    var cfStage = coverflow.querySelector('[data-coverflow-stage]');
    var cfItems = Array.prototype.slice.call(coverflow.querySelectorAll('[data-coverflow-item]'));
    var cfDots = Array.prototype.slice.call(coverflow.querySelectorAll('[data-coverflow-dot]'));
    var cfPrev = coverflow.querySelector('[data-coverflow-prev]');
    var cfNext = coverflow.querySelector('[data-coverflow-next]');
    var cfTitle = coverflow.querySelector('[data-coverflow-title]');
    var cfDesc = coverflow.querySelector('[data-coverflow-desc]');
    var cfCount = cfItems.length;
    var cfActive = 0;

    function cfRender() {
      cfItems.forEach(function (item, i) {
        var raw = i - cfActive;
        if (raw > cfCount / 2) raw -= cfCount;
        if (raw < -cfCount / 2) raw += cfCount;
        item.setAttribute('data-pos', String(raw));
        item.setAttribute('aria-hidden', raw === 0 ? 'false' : 'true');
        var card = item.querySelector('.coverflow-card');
        if (card) card.tabIndex = raw === 0 ? 0 : -1;
      });
      cfDots.forEach(function (dot, i) {
        var isActive = i === cfActive;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
      var activeItem = cfItems[cfActive];
      if (activeItem && cfTitle && cfDesc) {
        cfTitle.textContent = activeItem.getAttribute('data-title') || '';
        cfDesc.textContent = activeItem.getAttribute('data-desc') || '';
      }
    }

    function cfGoTo(index) {
      cfActive = ((index % cfCount) + cfCount) % cfCount;
      cfRender();
    }

    if (cfPrev) cfPrev.addEventListener('click', function () { cfGoTo(cfActive - 1); });
    if (cfNext) cfNext.addEventListener('click', function () { cfGoTo(cfActive + 1); });
    cfDots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { cfGoTo(i); });
    });
    cfItems.forEach(function (item, i) {
      var card = item.querySelector('.coverflow-card');
      if (card) card.addEventListener('click', function () { cfGoTo(i); });
    });

    if (cfStage) {
      cfStage.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); cfGoTo(cfActive - 1); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); cfGoTo(cfActive + 1); }
      });

      var cfStartX = null;
      var cfStartY = null;
      var cfDragging = false;
      cfStage.addEventListener('pointerdown', function (e) {
        cfStartX = e.clientX;
        cfStartY = e.clientY;
        cfDragging = true;
      });
      cfStage.addEventListener('pointerup', function (e) {
        if (!cfDragging || cfStartX === null) { cfDragging = false; return; }
        var dx = e.clientX - cfStartX;
        var dy = e.clientY - cfStartY;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
          if (dx < 0) cfGoTo(cfActive + 1); else cfGoTo(cfActive - 1);
        }
        cfDragging = false;
        cfStartX = null;
      });
      cfStage.addEventListener('pointercancel', function () { cfDragging = false; cfStartX = null; });
    }

    cfRender();
  }

  /* menu page: scrollspy + smooth jump */
  var menuNavLinks = document.querySelectorAll('.menu-nav a');
  var menuSections = document.querySelectorAll('.menu-category');
  if (menuNavLinks.length && menuSections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute('id');
            menuNavLinks.forEach(function (l) {
              l.classList.toggle('is-active', l.getAttribute('href') === '#' + id);
            });
          }
        });
      },
      { rootMargin: '-40% 0px -50% 0px' }
    );
    menuSections.forEach(function (s) { spy.observe(s); });
  }
})();
