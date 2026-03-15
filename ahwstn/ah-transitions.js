/**
 * ah-transitions.js — Barba.js Page Transitions
 * @version 1.0.0
 * @cdn https://cdn.ahwstn.com/ahwstn/ah-transitions.min.js
 *
 * Barba.js orchestrator: SPA-like page transitions with GSAP animation.
 * Manages the ah.* module lifecycle — destroy on leave, init on enter.
 *
 * Exit: fade to 0 + scale to 0.97 (0.4s, power2.inOut).
 * Enter: fade in from 0 + slide up from 30px (0.4s, power2.out).
 * Reduced motion: instant swap, no animation.
 *
 * Depends on: Barba.js core, GSAP, window.ah module registry (ahJs.js).
 * Static-first: without this script, standard multi-page navigation works.
 *
 * v1.0.1: Fix: initPage() moved to `after` hook — old container must be removed
 *         before querySelector can find elements in the new container.
 * v1.0.0: Initial build — page transitions, module lifecycle, nav active sync.
 */
(function () {
  'use strict';

  if (!window.barba || !window.gsap) return;
  if (!window.ah) return;

  var rm = matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* Page namespace → modules to destroy/init on transition.
     Nav modules (navTypewriter, navScroll, mobileNav, themeToggle, cursor)
     persist across transitions — they live outside the Barba container. */
  var pageModules = {
    home:      ['lenis', 'hero', 'heroCanvas', 'statement', 'servicePills', 'serviceTilt',
                'workHover', 'workReveal', 'bridgeScramble', 'footerCanvas'],
    about:     ['lenis', 'footerCanvas'],
    services:  ['lenis', 'footerCanvas'],
    work:      ['lenis', 'footerCanvas'],
    casestudy: ['lenis', 'footerCanvas'],
    contact:   ['lenis', 'footerCanvas']
  };

  function destroyPage(ns) {
    var modules = pageModules[ns] || [];
    for (var i = 0; i < modules.length; i++) {
      var m = ah[modules[i]];
      if (m && typeof m.destroy === 'function') m.destroy();
    }
    /* Kill any orphaned ScrollTriggers */
    if (window.ScrollTrigger) {
      ScrollTrigger.getAll().forEach(function (t) { t.kill(); });
    }
  }

  function initPage(ns) {
    var modules = pageModules[ns] || [];
    for (var i = 0; i < modules.length; i++) {
      var m = ah[modules[i]];
      if (m && typeof m.init === 'function') m.init();
    }
    /* Rebind cursor work card listeners */
    if (ah.cursor && typeof ah.cursor.rebind === 'function') ah.cursor.rebind();
    /* Sync nav active link */
    updateNavActive();
    /* Reinit Webflow's own JS (forms, interactions) */
    reinitWebflow();
  }

  function updateNavActive() {
    var path = window.location.pathname;
    document.querySelectorAll('.nav_link').forEach(function (link) {
      var href = link.getAttribute('href');
      link.classList.toggle('w--current', href === path);
    });
    document.querySelectorAll('.nav_overlay-link').forEach(function (link) {
      var href = link.getAttribute('href');
      link.classList.toggle('w--current', href === path);
    });
  }

  function reinitWebflow() {
    if (!window.Webflow) return;
    Webflow.destroy();
    Webflow.ready();
    if (Webflow.require) {
      var ix2 = Webflow.require('ix2');
      if (ix2 && typeof ix2.init === 'function') ix2.init();
    }
  }

  barba.init({
    preventRunning: true,
    transitions: [{
      name: 'default',
      leave: function (data) {
        destroyPage(data.current.namespace);
        if (rm) return; /* instant swap for reduced motion */
        return gsap.to(data.current.container, {
          opacity: 0,
          scale: 0.97,
          duration: 0.4,
          ease: 'power2.inOut'
        });
      },
      enter: function (data) {
        window.scrollTo(0, 0);
        if (window.lenis) {
          window.lenis.scrollTo(0, { immediate: true });
        }
        if (rm) return; /* instant swap for reduced motion */
        gsap.set(data.next.container, { opacity: 0, y: 30 });
        return gsap.to(data.next.container, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out'
        });
      },
      /* after: runs AFTER old container is removed from DOM.
         Critical — querySelector must only find elements in the new container. */
      after: function (data) {
        initPage(data.next.namespace);
      }
    }]
  });

})();
