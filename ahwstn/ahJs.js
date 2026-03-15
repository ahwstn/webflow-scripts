/**
 * ahJs.js — Behavioural JS (Footer, defer)
 * @version 1.9.0
 * @cdn https://cdn.jsdelivr.net/gh/ahwstn/webflow-scripts@main/ahwstn/ahJs.min.js
 *
 * Vanilla JS + GSAP (loaded via Site Settings: ScrollTrigger, SplitText).
 * Static-first: all content visible and navigable without this script.
 *
 * v1.0.0: Hero SplitText cascade, nav scroll observer, mobile nav toggle.
 * v1.1.0: Work hover image reveal (quickTo cursor-follow),
 *         bridge ScrambleText decode on scroll entry.
 * v1.2.0: Service pill cursor-following glow (sets --pill-x/--pill-y).
 * v1.3.0: Service card 3D tilt (Config E — ±4°, cursor glow, orange shadow).
 * v1.3.1: GSAP-driven tilt — 0.6s follow lag, 1.2s ambient settle, softer shadow.
 * v1.4.0: Featured work sticky card scroll-snap (ScrollTrigger snap).
 * v1.5.0: Removed work scroll-snap (now CSS view-timeline in ahCss).
 * v1.5.1: Snappier scroll snap — 20ms delay, power2.out ease, tighter duration.
 * v1.6.0: Lenis smooth scroll init + GSAP ticker sync, nav overlay stop/start.
 * v1.7.0: Removed work scroll snap — fought with Lenis, CSS view-timeline is enough.
 * v1.8.0: Theme toggle button handler, aria-label update, transition class.
 * v1.9.0: Homepage statement char-scrub (SplitText + ScrollTrigger scrub).
 */
(function () {
  'use strict';

  var rm = matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ===== Lenis smooth scroll ===== */
  if (window.Lenis && window.gsap && window.ScrollTrigger) {
    var lenis = new Lenis({
      lerp: rm ? 1 : 0.06,
      smoothWheel: !rm,
      smoothTouch: false,
      anchors: true
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    window.lenis = lenis;
  }

  /* ===== Hero SplitText word cascade ===== */
  var heroHeading = document.querySelector('.home-hero_heading');
  var heroSubline = document.querySelector('.home-hero_subline');

  if (heroHeading && window.gsap && window.SplitText) {
    document.fonts.ready.then(function () {
      var split = new SplitText(heroHeading, { type: 'words', aria: false });
      gsap.set(split.words, { opacity: 0, y: 40 });
      gsap.set(heroHeading, { opacity: 1 });
      if (heroSubline) gsap.set(heroSubline, { y: 20 });

      if (!rm) {
        gsap.to(split.words, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.06,
          ease: 'power4.out',
          delay: 0.3
        });
        if (heroSubline) {
          gsap.to(heroSubline, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: 0.8,
            ease: 'power3.out'
          });
        }
      } else {
        gsap.set(split.words, { opacity: 1, y: 0 });
        if (heroSubline) gsap.set(heroSubline, { opacity: 1 });
      }
    });
  }

  /* ===== Statement char-scrub ===== */
  /* Each character fades from 0.15 to 1.0 opacity as you scroll through the section.
     SplitText splits into chars, ScrollTrigger scrubs the timeline. */
  var statementText = document.querySelector('.home-statement_text');

  if (statementText && window.gsap && window.SplitText && window.ScrollTrigger && !rm) {
    document.fonts.ready.then(function () {
      var split = new SplitText(statementText, { type: 'words,chars', aria: false });
      gsap.set(split.chars, { opacity: 0.15 });

      gsap.to(split.chars, {
        opacity: 1,
        stagger: 0.02,
        scrollTrigger: {
          trigger: '.section_home-statement',
          start: 'top 50%',
          end: 'center center',
          scrub: 1
        }
      });
    });
  }

  /* ===== Nav scroll observer ===== */
  /* Adds .is-scrolled to nav_wrapper when page is scrolled past the first
     section. Prepares for future logo collapse (</ahwstn> → </>). */
  var navWrapper = document.querySelector('.nav_wrapper');
  if (navWrapper) {
    var sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none';
    document.body.prepend(sentinel);

    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        navWrapper.classList.toggle('is-scrolled', !entry.isIntersecting);
      });
    }, { threshold: 0 });
    navIO.observe(sentinel);
  }

  /* ===== Mobile nav toggle ===== */
  var hamburger = document.querySelector('.nav_hamburger');
  var overlay = document.querySelector('.nav_overlay');

  if (hamburger && overlay) {
    var overlayLinks = overlay.querySelectorAll('.nav_overlay-link');
    var isOpen = false;

    /* Set initial states */
    overlay.style.display = 'none';
    overlay.style.opacity = '0';
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');

    hamburger.addEventListener('click', function () {
      isOpen = !isOpen;
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      hamburger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');

      if (isOpen) {
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        if (window.lenis) window.lenis.stop();

        if (!rm && window.gsap) {
          gsap.to(overlay, { opacity: 1, duration: 0.3, ease: 'power2.out' });
          gsap.fromTo(overlayLinks,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power3.out', delay: 0.15 }
          );
        } else {
          overlay.style.opacity = '1';
          overlayLinks.forEach(function (link) {
            link.style.opacity = '1';
            link.style.transform = 'none';
          });
        }
      } else {
        document.body.style.overflow = '';
        if (window.lenis) window.lenis.start();

        if (!rm && window.gsap) {
          gsap.to(overlay, {
            opacity: 0,
            duration: 0.25,
            ease: 'power2.in',
            onComplete: function () { overlay.style.display = 'none'; }
          });
        } else {
          overlay.style.opacity = '0';
          overlay.style.display = 'none';
        }
      }
    });

    /* Close overlay when a link is clicked */
    overlayLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        if (isOpen) hamburger.click();
      });
    });

    /* Close on Escape key */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) hamburger.click();
    });
  }

  /* ===== Work hover image reveal ===== */
  /* Project image follows cursor on hover via gsap.quickTo for spring feel.
     Desktop only — touch devices get no hover, image stays hidden. */
  var workItems = document.querySelectorAll('.home-work_item[data-img]');
  var workImg = document.querySelector('.home-work_image');

  if (workItems.length && workImg && window.gsap && !rm) {
    var xTo = gsap.quickTo(workImg, 'left', { duration: 0.4, ease: 'power3.out' });
    var yTo = gsap.quickTo(workImg, 'top', { duration: 0.4, ease: 'power3.out' });

    workItems.forEach(function (item) {
      item.addEventListener('mouseenter', function () {
        workImg.src = item.dataset.img;
        gsap.to(workImg, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' });
      });
      item.addEventListener('mouseleave', function () {
        gsap.to(workImg, { opacity: 0, scale: 0.95, duration: 0.2, ease: 'power2.in' });
      });
      item.addEventListener('mousemove', function (e) {
        xTo(e.clientX + 20);
        yTo(e.clientY - 20);
      });
    });
  }

  /* ===== Service pill cursor glow ===== */
  /* Sets --pill-x / --pill-y on each pill so the CSS radial-gradient
     follows the cursor. Delegated listener on each pills container. */
  var pillsContainers = document.querySelectorAll('.home-services_pills');

  if (pillsContainers.length && matchMedia('(hover:hover)').matches) {
    pillsContainers.forEach(function (container) {
      container.addEventListener('mousemove', function (e) {
        var pill = e.target.closest('.home-services_pill');
        if (!pill) return;
        var rect = pill.getBoundingClientRect();
        pill.style.setProperty('--pill-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
        pill.style.setProperty('--pill-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
      });
    });
  }

  /* ===== Service card 3D tilt ===== */
  var tiltGrid = document.querySelector('.home-services_cards');
  var tiltCards = tiltGrid ? tiltGrid.querySelectorAll('.home-services_card') : [];

  if (tiltCards.length && window.gsap && matchMedia('(hover:hover)').matches && !rm) {
    tiltCards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width;
        var y = (e.clientY - r.top) / r.height;
        var rx = (0.5 - y) * 8;
        var ry = (x - 0.5) * 8;
        var sx = (x - 0.5) * 12;
        var sy = (y - 0.5) * 12;
        var accent = getComputedStyle(card).getPropertyValue('--card-accent').trim() || '232,93,4';
        gsap.to(card, {
          rotateX: rx,
          rotateY: ry,
          boxShadow: sx + 'px ' + sy + 'px 80px rgba(' + accent + ',.06)',
          duration: 0.6,
          ease: 'power2.out',
          overwrite: 'auto'
        });
        card.style.setProperty('--card-glow-x', (x * 100) + '%');
        card.style.setProperty('--card-glow-y', (y * 100) + '%');
      });
      card.addEventListener('mouseleave', function () {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          boxShadow: '0px 0px 80px rgba(0,0,0,0)',
          duration: 1.2,
          ease: 'power3.out',
          overwrite: 'auto'
        });
        card.style.setProperty('--card-glow-x', '50%');
        card.style.setProperty('--card-glow-y', '50%');
      });
    });
  }

  /* ===== Theme toggle ===== */
  var themeToggle = document.querySelector('.nav_theme-toggle');
  if (themeToggle && window.ahTheme) {
    themeToggle.addEventListener('click', function () {
      document.documentElement.setAttribute('data-theme-transitioning', '');
      window.ahTheme.toggle();
      themeToggle.setAttribute('aria-label',
        'Switch to ' + (window.ahTheme.current === 'dark' ? 'light' : 'dark') + ' mode');
      setTimeout(function () {
        document.documentElement.removeAttribute('data-theme-transitioning');
      }, 400);
    });
  }

  /* ===== Bridge ScrambleText ===== */
  /* Decodes </ahwstn> from random terminal chars on scroll entry.
     Falls back gracefully — text is already visible without this. */
  var bridgeTag = document.querySelector('.bridge_tag');

  if (bridgeTag && window.gsap && window.ScrollTrigger && !rm) {
    /* ScrambleTextPlugin is a Club plugin — check availability */
    if (window.ScrambleTextPlugin) {
      gsap.registerPlugin(ScrambleTextPlugin);
      gsap.from(bridgeTag, {
        scrambleText: {
          text: bridgeTag.textContent,
          chars: '/<>{}[]|\\:;=+_-~`!@#$%^&*()',
          speed: 0.4,
          revealDelay: 0.3
        },
        scrollTrigger: {
          trigger: bridgeTag,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });
    } else {
      /* Fallback: simple opacity + y entrance via ScrollTrigger */
      gsap.from(bridgeTag, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: bridgeTag,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });
    }
  }

})();
