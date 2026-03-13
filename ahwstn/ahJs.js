/**
 * ahJs.js — Behavioural JS (Footer, defer)
 * @version 1.0.0
 * @cdn https://cdn.jsdelivr.net/gh/ahwstn/webflow-scripts@main/ahwstn/ahJs.min.js
 *
 * Vanilla JS + GSAP (loaded via Site Settings: ScrollTrigger, SplitText).
 * Static-first: all content visible and navigable without this script.
 *
 * v1.0.0: Hero SplitText cascade, nav scroll observer, mobile nav toggle.
 */
(function () {
  'use strict';

  var rm = matchMedia('(prefers-reduced-motion:reduce)').matches;

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

})();
