/**
 * sgmNav.js — Right-Side Panel Navigation Overlay
 * @version 2.0.0
 * @cdn https://cdn.ahwstn.com/sgm/sgmNav.min.js
 *
 * Right-side panel overlay with 3-layer clip-path wipe animation.
 * 50% width, max 600px, clips in from right.
 *
 * Expects sgmCore.js to be loaded first (window.sgm namespace).
 * Nav lives outside [data-barba="container"] to persist across transitions.
 *
 * DOM structure:
 *   <div class="nav-overlay_component" data-sidenav-wrap data-nav-state="closed">
 *     <div class="nav-overlay_bg">
 *       <div class="nav-overlay_panel" data-sidenav-panel></div> (x3)
 *     </div>
 *     <nav class="nav-overlay_menu" data-sidenav-menu>
 *       <ul class="nav-overlay_list" data-sidenav-list>
 *         <li class="nav-overlay_item">
 *           <a class="nav-overlay_link" data-sidenav-link href="/">
 *             <span class="nav-overlay_link-num">00</span>
 *             <span class="nav-overlay_link-heading">Home</span>
 *           </a>
 *         </li>
 *         ...
 *       </ul>
 *       <div class="nav-overlay_details">...</div>
 *     </nav>
 *     <div class="nav-overlay_scrim" data-nav-scrim></div>
 *   </div>
 *
 * Static-first: nav links are in the DOM and navigable without JS.
 *
 * v2.0.0: Full rewrite — right-side panel (was fullscreen top-down wipe).
 * v1.0.0: Fullscreen top-down wipe, Escape key, Barba-aware.
 */
(function () {
  'use strict';

  window.sgm = window.sgm || {};

  sgm.nav = {
    _navWrap: null,
    _isOpen: false,
    _isAnimating: false,

    init: function () {
      var self = this;

      var navWrap = document.querySelector('[data-sidenav-wrap]');
      if (!navWrap) return;

      self._navWrap = navWrap;

      // Bind toggle buttons
      document.querySelectorAll('[data-sidenav-toggle]').forEach(function (toggle) {
        toggle.addEventListener('click', function () {
          if (self._isAnimating) return;
          self._isOpen ? self.close() : self.open();
        });
      });

      // Scrim click closes nav
      var scrim = document.querySelector('[data-nav-scrim]');
      if (scrim) {
        scrim.addEventListener('click', function () {
          if (self._isOpen) self.close();
        });
      }

      // Click anywhere outside overlay closes nav
      document.addEventListener('click', function (e) {
        if (!self._isOpen) return;
        if (navWrap.contains(e.target)) return;
        if (e.target.closest('[data-sidenav-toggle]')) return;
        self.close();
      });

      // Escape key closes nav
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && self._isOpen) {
          self.close();
        }
      });

      // Nav links: close nav then let Barba handle navigation
      navWrap.querySelectorAll('[data-sidenav-link]').forEach(function (link) {
        link.addEventListener('click', function () {
          if (self._isOpen) self.close();
        });
      });
    },

    open: function () {
      var self = this;
      var navWrap = self._navWrap;
      if (!navWrap) return;

      self._isAnimating = true;
      self._isOpen = true;

      // Stop Lenis while nav is open
      var lenis = sgm._lenis ? sgm._lenis() : null;
      if (lenis && typeof lenis.stop === 'function') lenis.stop();

      var overlay = navWrap;
      var panels = navWrap.querySelectorAll('[data-sidenav-panel]');
      var links = navWrap.querySelectorAll('[data-sidenav-link]');
      var details = navWrap.querySelector('.nav-overlay_details');
      var scrim = document.querySelector('[data-nav-scrim]');
      var menuBtn = document.querySelector('[data-sidenav-toggle]');
      var menuLabels = menuBtn ? menuBtn.querySelectorAll('.header_menu-label') : [];

      navWrap.setAttribute('data-nav-state', 'open');

      var tl = gsap.timeline({ onComplete: function () { self._isAnimating = false; } });

      // Show overlay before animating
      tl.set(overlay, { display: 'flex', flexDirection: 'column' }, 0);

      // Menu text: "Menu" → "Close" (slide labels up within clip container)
      if (menuLabels.length) {
        tl.to(menuLabels, { yPercent: -100, duration: 0.3, ease: 'power2.inOut' }, 0);
      }

      // Show scrim
      if (scrim) {
        tl.call(function () { scrim.classList.add('is-visible'); }, null, 0);
      }

      // Overlay clips in from right
      tl.to(overlay, {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.5,
        ease: 'power3.inOut'
      }, 0.05);

      // Panels clip in staggered
      if (panels.length) {
        tl.to(panels, {
          clipPath: 'inset(0% 0% 0% 0%)',
          stagger: 0.08,
          duration: 0.55,
          ease: 'power3.inOut'
        }, 0);
      }

      // Nav links enter from below
      if (links.length) {
        tl.fromTo(links,
          { yPercent: 110 },
          { yPercent: 0, stagger: 0.08, duration: 0.5, ease: 'power3.out' },
          0.3
        );
      }

      // Details fade in
      if (details) {
        tl.fromTo(details,
          { opacity: 0, yPercent: 10 },
          { opacity: 1, yPercent: 0, duration: 0.3, ease: 'power2.out' },
          0.45
        );
      }
    },

    close: function () {
      var self = this;
      var navWrap = self._navWrap;
      if (!navWrap) return;

      self._isAnimating = true;
      self._isOpen = false;

      var overlay = navWrap;
      var panels = navWrap.querySelectorAll('[data-sidenav-panel]');
      var scrim = document.querySelector('[data-nav-scrim]');
      var menuBtn = document.querySelector('[data-sidenav-toggle]');
      var menuLabels = menuBtn ? menuBtn.querySelectorAll('.header_menu-label') : [];

      navWrap.setAttribute('data-nav-state', 'closed');

      var tl = gsap.timeline({
        onComplete: function () {
          // Reset clip-paths and hide for next open
          gsap.set(overlay, { clipPath: 'inset(0% 0% 0% 100%)', display: 'none' });
          gsap.set(panels, { clipPath: 'inset(0% 0% 0% 100%)' });
          if (scrim) scrim.classList.remove('is-visible');

          // Restart Lenis
          var lenis = sgm._lenis ? sgm._lenis() : null;
          if (lenis && typeof lenis.start === 'function') lenis.start();

          self._isAnimating = false;
        }
      });

      // Menu text returns
      if (menuLabels.length) {
        tl.to(menuLabels, { yPercent: 0, duration: 0.3, ease: 'power2.inOut' }, 0);
      }

      // Overlay clips out to right
      tl.to(overlay, {
        clipPath: 'inset(0% 0% 0% 100%)',
        duration: 0.5,
        ease: 'power3.inOut'
      }, 0);

      // Panels clip out staggered (reverse order)
      if (panels.length) {
        tl.to(panels, {
          clipPath: 'inset(0% 0% 0% 100%)',
          stagger: -0.05,
          duration: 0.45,
          ease: 'power3.inOut'
        }, 0.05);
      }

      // Scrim fades
      if (scrim) {
        tl.call(function () { scrim.classList.remove('is-visible'); }, null, 0.2);
      }
    }
  };

})();
