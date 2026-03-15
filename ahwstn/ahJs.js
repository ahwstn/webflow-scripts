/**
 * ahJs.js — Behavioural JS (Footer, defer)
 * @version 4.0.0
 * @cdn https://cdn.ahwstn.com/ahwstn/ahJs.min.js
 *
 * Vanilla JS + GSAP (loaded via Site Settings: ScrollTrigger, SplitText).
 * Static-first: all content visible and navigable without this script.
 *
 * v4.0.0: Hero entrance choreography — init() sets up SplitText in ready state,
 *         entrance(delay) triggers cascade with custom timing. Auto-plays if
 *         entrance() never called (non-home pages). No visual change on non-home.
 * v3.0.0: Module registry refactor — each feature is ah.{module} with init/destroy
 *         for Barba.js page transition lifecycle management. No behavioural changes.
 *
 * v2.0.0: Work card info panel reveal — mobile tap toggle, keyboard support.
 * v1.9.0: Homepage statement char-scrub (SplitText + ScrollTrigger scrub).
 * v1.8.0: Theme toggle button handler, aria-label update, transition class.
 * v1.7.0: Removed work scroll snap — fought with Lenis, CSS view-timeline is enough.
 * v1.6.0: Lenis smooth scroll init + GSAP ticker sync, nav overlay stop/start.
 * v1.5.1: Snappier scroll snap — 20ms delay, power2.out ease, tighter duration.
 * v1.5.0: Removed work scroll-snap (now CSS view-timeline in ahCss).
 * v1.4.0: Featured work sticky card scroll-snap (ScrollTrigger snap).
 * v1.3.1: GSAP-driven tilt — 0.6s follow lag, 1.2s ambient settle, softer shadow.
 * v1.3.0: Service card 3D tilt (Config E — ±4°, cursor glow, orange shadow).
 * v1.2.0: Service pill cursor-following glow (sets --pill-x/--pill-y).
 * v1.1.0: Work hover image reveal (quickTo cursor-follow),
 *         bridge ScrambleText decode on scroll entry.
 * v1.0.0: Hero SplitText cascade, nav scroll observer, mobile nav toggle.
 */
(function () {
  'use strict';

  window.ah = window.ah || {};

  var rm = matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ===== ah.lenis — Smooth scroll + GSAP ticker sync ===== */
  ah.lenis = {
    instance: null,
    _tickerFn: null,
    init: function () {
      if (!window.Lenis || !window.gsap || !window.ScrollTrigger) return;
      if (this.instance) return;
      this.instance = new Lenis({
        lerp: rm ? 1 : 0.06,
        smoothWheel: !rm,
        smoothTouch: false,
        anchors: true
      });
      this.instance.on('scroll', ScrollTrigger.update);
      this._tickerFn = function (time) { ah.lenis.instance.raf(time * 1000); };
      gsap.ticker.add(this._tickerFn);
      gsap.ticker.lagSmoothing(0);
      window.lenis = this.instance;
    },
    destroy: function () {
      if (this.instance) {
        this.instance.destroy();
        this.instance = null;
      }
      if (this._tickerFn) {
        gsap.ticker.remove(this._tickerFn);
        this._tickerFn = null;
      }
      window.lenis = null;
    }
  };

  /* ===== ah.hero — SplitText word cascade ===== */
  ah.hero = {
    _split: null,
    _ready: false,
    _autoPlay: true,
    _heroSubline: null,

    init: function () {
      var heroHeading = document.querySelector('.home-hero_heading');
      var heroSubline = document.querySelector('.home-hero_subline');
      if (!heroHeading || !window.gsap || !window.SplitText) return;

      this._heroSubline = heroSubline;
      this._ready = false;

      document.fonts.ready.then(function () {
        ah.hero._split = new SplitText(heroHeading, { type: 'words', aria: false });
        gsap.set(ah.hero._split.words, { opacity: 0, y: 40 });
        gsap.set(heroHeading, { opacity: 1 });
        if (heroSubline) gsap.set(heroSubline, { y: 20 });

        if (rm) {
          gsap.set(ah.hero._split.words, { opacity: 1, y: 0 });
          if (heroSubline) gsap.set(heroSubline, { opacity: 1 });
        }

        ah.hero._ready = true;

        /* Auto-play if entrance() was never called (non-choreographed pages) */
        if (ah.hero._autoPlay && !rm) {
          ah.hero._playAnimation(0.3);
        }
      });
    },

    /**
     * entrance(delay) — Trigger the word cascade with a custom delay.
     * Call from transition choreography. Disables auto-play.
     * Returns the tween for timeline chaining (resolves via onComplete).
     */
    entrance: function (delay) {
      this._autoPlay = false;
      if (rm) return null;

      var self = this;
      if (this._ready) {
        return this._playAnimation(delay || 0);
      }
      /* Fonts not ready yet — wait, then play */
      return gsap.delayedCall(0, function checkReady() {
        if (self._ready) {
          self._playAnimation(delay || 0);
        } else {
          gsap.delayedCall(0.05, checkReady);
        }
      });
    },

    _playAnimation: function (delay) {
      if (!this._split) return null;
      var heroSubline = this._heroSubline;
      var tween = gsap.to(this._split.words, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.06,
        ease: 'power4.out',
        delay: delay
      });
      if (heroSubline) {
        gsap.to(heroSubline, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: delay + 0.5,
          ease: 'power3.out'
        });
      }
      return tween;
    },

    destroy: function () {
      if (this._split) {
        this._split.revert();
        this._split = null;
      }
      this._ready = false;
      this._autoPlay = true;
      this._heroSubline = null;
    }
  };

  /* ===== ah.statement — Char-scrub ScrollTrigger ===== */
  ah.statement = {
    _split: null,
    _st: null,
    init: function () {
      var statementText = document.querySelector('.home-statement_text');
      if (!statementText || !window.gsap || !window.SplitText || !window.ScrollTrigger || rm) return;

      document.fonts.ready.then(function () {
        ah.statement._split = new SplitText(statementText, { type: 'words,chars', aria: false });
        gsap.set(ah.statement._split.chars, { opacity: 0.15 });

        var tween = gsap.to(ah.statement._split.chars, {
          opacity: 1,
          stagger: 0.02,
          scrollTrigger: {
            trigger: '.section_home-statement',
            start: 'top 50%',
            end: 'center center',
            scrub: 1
          }
        });
        ah.statement._st = tween.scrollTrigger;
      });
    },
    destroy: function () {
      if (this._st) {
        this._st.kill();
        this._st = null;
      }
      if (this._split) {
        this._split.revert();
        this._split = null;
      }
    }
  };

  /* ===== ah.navScroll — Scroll observer (.is-scrolled class) ===== */
  ah.navScroll = {
    _io: null,
    _sentinel: null,
    init: function () {
      var navWrapper = document.querySelector('.nav_wrapper');
      if (!navWrapper) return;

      this._sentinel = document.createElement('div');
      this._sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none';
      document.body.prepend(this._sentinel);

      this._io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          navWrapper.classList.toggle('is-scrolled', !entry.isIntersecting);
        });
      }, { threshold: 0 });
      this._io.observe(this._sentinel);
    },
    destroy: function () {
      if (this._io) {
        this._io.disconnect();
        this._io = null;
      }
      if (this._sentinel && this._sentinel.parentNode) {
        this._sentinel.parentNode.removeChild(this._sentinel);
        this._sentinel = null;
      }
    }
  };

  /* ===== ah.mobileNav — Hamburger + overlay ===== */
  ah.mobileNav = {
    _isOpen: false,
    _hamburgerHandler: null,
    _linkHandlers: [],
    _escHandler: null,
    init: function () {
      var hamburger = document.querySelector('.nav_hamburger');
      var overlay = document.querySelector('.nav_overlay');
      if (!hamburger || !overlay) return;

      var overlayLinks = overlay.querySelectorAll('.nav_overlay-link');
      var self = this;
      self._isOpen = false;

      overlay.style.display = 'none';
      overlay.style.opacity = '0';
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open menu');

      self._hamburgerHandler = function () {
        self._isOpen = !self._isOpen;
        hamburger.setAttribute('aria-expanded', self._isOpen ? 'true' : 'false');
        hamburger.setAttribute('aria-label', self._isOpen ? 'Close menu' : 'Open menu');

        if (self._isOpen) {
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
      };
      hamburger.addEventListener('click', self._hamburgerHandler);

      overlayLinks.forEach(function (link) {
        var handler = function () { if (self._isOpen) hamburger.click(); };
        link.addEventListener('click', handler);
        self._linkHandlers.push({ el: link, fn: handler });
      });

      self._escHandler = function (e) {
        if (e.key === 'Escape' && self._isOpen) hamburger.click();
      };
      document.addEventListener('keydown', self._escHandler);
    },
    destroy: function () {
      /* Force close if open */
      if (this._isOpen) {
        var overlay = document.querySelector('.nav_overlay');
        if (overlay) {
          overlay.style.display = 'none';
          overlay.style.opacity = '0';
        }
        document.body.style.overflow = '';
        if (window.lenis) window.lenis.start();
        this._isOpen = false;
      }

      var hamburger = document.querySelector('.nav_hamburger');
      if (hamburger && this._hamburgerHandler) {
        hamburger.removeEventListener('click', this._hamburgerHandler);
      }
      this._hamburgerHandler = null;

      this._linkHandlers.forEach(function (h) {
        h.el.removeEventListener('click', h.fn);
      });
      this._linkHandlers = [];

      if (this._escHandler) {
        document.removeEventListener('keydown', this._escHandler);
        this._escHandler = null;
      }
    }
  };

  /* ===== ah.workHover — Cursor-following image reveal ===== */
  ah.workHover = {
    _handlers: [],
    init: function () {
      var workItems = document.querySelectorAll('.home-work_item[data-img]');
      var workImg = document.querySelector('.home-work_image');
      if (!workItems.length || !workImg || !window.gsap || rm) return;

      var xTo = gsap.quickTo(workImg, 'left', { duration: 0.4, ease: 'power3.out' });
      var yTo = gsap.quickTo(workImg, 'top', { duration: 0.4, ease: 'power3.out' });
      var self = this;

      workItems.forEach(function (item) {
        var enter = function () {
          workImg.src = item.dataset.img;
          gsap.to(workImg, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' });
        };
        var leave = function () {
          gsap.to(workImg, { opacity: 0, scale: 0.95, duration: 0.2, ease: 'power2.in' });
        };
        var move = function (e) {
          xTo(e.clientX + 20);
          yTo(e.clientY - 20);
        };

        item.addEventListener('mouseenter', enter);
        item.addEventListener('mouseleave', leave);
        item.addEventListener('mousemove', move);
        self._handlers.push(
          { el: item, ev: 'mouseenter', fn: enter },
          { el: item, ev: 'mouseleave', fn: leave },
          { el: item, ev: 'mousemove', fn: move }
        );
      });
    },
    destroy: function () {
      this._handlers.forEach(function (h) {
        h.el.removeEventListener(h.ev, h.fn);
      });
      this._handlers = [];
    }
  };

  /* ===== ah.servicePills — Cursor-following glow ===== */
  ah.servicePills = {
    _handlers: [],
    init: function () {
      var pillsContainers = document.querySelectorAll('.home-services_pills');
      if (!pillsContainers.length || !matchMedia('(hover:hover)').matches) return;
      var self = this;

      pillsContainers.forEach(function (container) {
        var handler = function (e) {
          var pill = e.target.closest('.home-services_pill');
          if (!pill) return;
          var rect = pill.getBoundingClientRect();
          pill.style.setProperty('--pill-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
          pill.style.setProperty('--pill-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
        };
        container.addEventListener('mousemove', handler);
        self._handlers.push({ el: container, fn: handler });
      });
    },
    destroy: function () {
      this._handlers.forEach(function (h) {
        h.el.removeEventListener('mousemove', h.fn);
      });
      this._handlers = [];
    }
  };

  /* ===== ah.serviceTilt — 3D tilt on service cards ===== */
  ah.serviceTilt = {
    _handlers: [],
    init: function () {
      var tiltGrid = document.querySelector('.home-services_cards');
      var tiltCards = tiltGrid ? tiltGrid.querySelectorAll('.home-services_card') : [];
      if (!tiltCards.length || !window.gsap || !matchMedia('(hover:hover)').matches || rm) return;
      var self = this;

      tiltCards.forEach(function (card) {
        var moveHandler = function (e) {
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
        };
        var leaveHandler = function () {
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
        };

        card.addEventListener('mousemove', moveHandler);
        card.addEventListener('mouseleave', leaveHandler);
        self._handlers.push(
          { el: card, ev: 'mousemove', fn: moveHandler },
          { el: card, ev: 'mouseleave', fn: leaveHandler }
        );
      });
    },
    destroy: function () {
      this._handlers.forEach(function (h) {
        h.el.removeEventListener(h.ev, h.fn);
      });
      this._handlers = [];
    }
  };

  /* ===== ah.themeToggle — Toggle button handler ===== */
  ah.themeToggle = {
    _handler: null,
    init: function () {
      var btn = document.querySelector('.nav_theme-toggle');
      if (!btn || !window.ahTheme) return;

      this._handler = function () {
        document.documentElement.setAttribute('data-theme-transitioning', '');
        window.ahTheme.toggle();
        btn.setAttribute('aria-label',
          'Switch to ' + (window.ahTheme.current === 'dark' ? 'light' : 'dark') + ' mode');
        setTimeout(function () {
          document.documentElement.removeAttribute('data-theme-transitioning');
        }, 400);
      };
      btn.addEventListener('click', this._handler);
    },
    destroy: function () {
      var btn = document.querySelector('.nav_theme-toggle');
      if (btn && this._handler) {
        btn.removeEventListener('click', this._handler);
      }
      this._handler = null;
    }
  };

  /* ===== ah.bridgeScramble — ScrambleText on scroll entry ===== */
  ah.bridgeScramble = {
    _st: null,
    init: function () {
      var bridgeTag = document.querySelector('.bridge_tag');
      if (!bridgeTag || !window.gsap || !window.ScrollTrigger || rm) return;

      var tween;
      if (window.ScrambleTextPlugin) {
        gsap.registerPlugin(ScrambleTextPlugin);
        tween = gsap.from(bridgeTag, {
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
        tween = gsap.from(bridgeTag, {
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
      this._st = tween.scrollTrigger;
    },
    destroy: function () {
      if (this._st) {
        this._st.kill();
        this._st = null;
      }
    }
  };

  /* ===== ah.workReveal — Mobile tap toggle for info panels ===== */
  ah.workReveal = {
    _handlers: [],
    init: function () {
      var revealBtns = document.querySelectorAll('.home-work_reveal-btn');
      var self = this;

      revealBtns.forEach(function (btn) {
        var toggle = function (e) {
          e.preventDefault();
          e.stopPropagation();
          var item = btn.closest('.home-work_item');
          var revealed = item.classList.toggle('is-revealed');
          btn.setAttribute('aria-label', revealed ? 'Hide project details' : 'Show project details');
          btn.setAttribute('aria-expanded', revealed ? 'true' : 'false');
        };

        var keyHandler = function (e) {
          if (e.key === 'Enter' || e.key === ' ') toggle(e);
        };

        btn.addEventListener('click', toggle);
        btn.addEventListener('keydown', keyHandler);
        self._handlers.push(
          { el: btn, ev: 'click', fn: toggle },
          { el: btn, ev: 'keydown', fn: keyHandler }
        );
      });
    },
    destroy: function () {
      /* Remove .is-revealed from any open cards */
      document.querySelectorAll('.home-work_item.is-revealed').forEach(function (item) {
        item.classList.remove('is-revealed');
      });
      this._handlers.forEach(function (h) {
        h.el.removeEventListener(h.ev, h.fn);
      });
      this._handlers = [];
    }
  };

  /* ===== Initial boot — same behaviour as before ===== */
  ah.lenis.init();
  ah.hero.init();
  ah.statement.init();
  ah.navScroll.init();
  ah.mobileNav.init();
  ah.workHover.init();
  ah.servicePills.init();
  ah.serviceTilt.init();
  ah.themeToggle.init();
  ah.bridgeScramble.init();
  ah.workReveal.init();

})();
