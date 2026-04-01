/**
 * sgmCore.js — Barba + Lenis + GSAP + Homepage Animations
 * @version 2.0.0
 * @cdn https://cdn.ahwstn.com/sgm/sgmCore.min.js
 *
 * Foundation script for Sam George Media.
 * Handles smooth scroll (Lenis), page transitions (Barba.js),
 * custom cursor, hero carousel, parallax, showreel iris,
 * text reveals, and infinite scroll loop.
 *
 * Dependencies (load before this script):
 *   - Lenis CSS: unpkg.com/lenis@1.3.17/dist/lenis.css (head)
 *   - sgmCss.js: cdn.ahwstn.com/sgm/sgmCss.min.js (head)
 *   - Barba.js: cdn.jsdelivr.net/npm/@barba/core@2.10.3/dist/barba.umd.min.js
 *   - Lenis JS: cdn.jsdelivr.net/npm/lenis@1.3.17/dist/lenis.min.js
 *   - GSAP: Webflow Site Settings (v3.14.2)
 *   - CustomEase: cdn.jsdelivr.net/npm/gsap@3.14.1/dist/CustomEase.min.js
 *
 * DOM structure expected:
 *   <body data-barba="wrapper">
 *     <div data-transition-wrap>
 *       <div data-transition-panel></div>
 *       <div data-transition-label></div>
 *     </div>
 *     <header data-sgm-nav>...</header>
 *     <div class="page-wrapper">
 *       <section class="section_hero" id="heroCarousel">...</section>
 *       <div class="main-wrapper" data-barba="container" data-barba-namespace="home">
 *         ...page content...
 *         <div class="loop-buffer" id="loopBuffer"></div>
 *       </div>
 *     </div>
 *   </body>
 *
 * Static-first: all content is readable without this script.
 *
 * v2.0.0: Full rewrite from prototype app.js.
 * v1.0.0: Initial build — Barba + Lenis + stacked cards transition.
 */
(function () {
  'use strict';

  window.sgm = window.sgm || {};

  // -----------------------------------------
  // CONFIG
  // -----------------------------------------

  gsap.registerPlugin(CustomEase, ScrollTrigger);
  CustomEase.create('sgm', '0.625, 0.05, 0, 1');
  gsap.defaults({ ease: 'sgm', duration: 0.6 });
  history.scrollRestoration = 'manual';

  var lenis = null;
  var onceFunctionsInitialized = false;

  var hasLenis = typeof window.Lenis !== 'undefined';
  var hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined';

  var rmMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reducedMotion = rmMQ.matches;
  if (rmMQ.addEventListener) {
    rmMQ.addEventListener('change', function (e) { reducedMotion = e.matches; });
  }

  // Expose for other modules
  sgm._lenis = function () { return lenis; };
  sgm._reducedMotion = function () { return reducedMotion; };


  // -----------------------------------------
  // CUSTOM CURSOR (deferred — elements injected by sgmCss on DOMContentLoaded)
  // -----------------------------------------

  var dot = null;
  var ring = null;
  var mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  var dotX = mouseX, dotY = mouseY, ringX = mouseX, ringY = mouseY;
  var cursorInitialized = false;

  function initCursor() {
    if (cursorInitialized) return;

    // Create cursor elements if they don't exist yet
    if (!document.getElementById('cursorDot')) {
      var d = document.createElement('div');
      d.className = 'cursor-dot';
      d.id = 'cursorDot';
      d.innerHTML = '<div class="cursor__icon"><div class="cursor__play"></div><div class="cursor__pause"><span></span><span></span></div><div class="cursor__label">View</div><div class="cursor__arrow-left">\u2190</div><div class="cursor__arrow-right">\u2192</div></div>';
      document.body.appendChild(d);

      var r = document.createElement('div');
      r.className = 'cursor-ring';
      r.id = 'cursorRing';
      document.body.appendChild(r);
    }

    dot = document.getElementById('cursorDot');
    ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;

    cursorInitialized = true;

    document.addEventListener('mousemove', function (e) { mouseX = e.clientX; mouseY = e.clientY; });
    document.addEventListener('mouseleave', function () { gsap.to([dot, ring], { opacity: 0, duration: 0.2 }); });
    document.addEventListener('mouseenter', function () { gsap.to([dot, ring], { opacity: 1, duration: 0.2 }); });

    (function updateCursor() {
      dotX += (mouseX - dotX) * 0.35;
      dotY += (mouseY - dotY) * 0.35;
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      gsap.set(dot, { x: dotX, y: dotY });
      gsap.set(ring, { x: ringX, y: ringY });
      requestAnimationFrame(updateCursor);
    })();
  }

  function setCursorState(state, vState) {
    if (!dot || !ring) return;
    dot.classList.remove('is-hovering', 'is-video', 'is-view', 'is-paused', 'is-playing', 'is-arrow-left', 'is-arrow-right');
    ring.classList.remove('is-hovering', 'is-video', 'is-view', 'is-paused', 'is-playing', 'is-arrow-left', 'is-arrow-right');
    if (state === 'hovering') { ring.classList.add('is-hovering'); }
    else if (state === 'arrow-left') { dot.classList.add('is-arrow-left'); ring.classList.add('is-arrow-left'); }
    else if (state === 'arrow-right') { dot.classList.add('is-arrow-right'); ring.classList.add('is-arrow-right'); }
    else if (state === 'video') {
      dot.classList.add('is-video'); ring.classList.add('is-video');
      dot.classList.add((vState || 'paused') === 'playing' ? 'is-playing' : 'is-paused');
    }
    else if (state === 'view') { dot.classList.add('is-view'); ring.classList.add('is-view'); }
  }

  function bindCursorEvents(scope) {
    if (!dot || !ring) return;
    var root = scope || document;
    root.querySelectorAll('a, button, [data-cursor="hover"]').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        if (!el.closest('[data-cursor="video"]') && !el.closest('[data-cursor="view"]')) setCursorState('hovering');
      });
      el.addEventListener('mouseleave', function () {
        var p = el.closest('[data-cursor]');
        if (p) {
          var t = p.getAttribute('data-cursor');
          if (t === 'video') setCursorState('video', p.getAttribute('data-video-state') || 'paused');
          else if (t === 'view') setCursorState('view');
          else setCursorState('default');
        } else setCursorState('default');
      });
    });
    root.querySelectorAll('[data-cursor="video"]').forEach(function (el) {
      el.addEventListener('mouseenter', function () { setCursorState('video', el.getAttribute('data-video-state') || 'paused'); });
      el.addEventListener('mouseleave', function () { setCursorState('default'); });
    });
    root.querySelectorAll('[data-cursor="view"]').forEach(function (el) {
      el.addEventListener('mouseenter', function () { setCursorState('view'); });
      el.addEventListener('mouseleave', function () { setCursorState('default'); });
    });
    root.querySelectorAll('[data-cursor="arrow-left"]').forEach(function (el) {
      el.addEventListener('mouseenter', function () { setCursorState('arrow-left'); });
      el.addEventListener('mouseleave', function () { setCursorState('default'); });
    });
    root.querySelectorAll('[data-cursor="arrow-right"]').forEach(function (el) {
      el.addEventListener('mouseenter', function () { setCursorState('arrow-right'); });
      el.addEventListener('mouseleave', function () { setCursorState('default'); });
    });
  }


  // -----------------------------------------
  // FUNCTION REGISTRY
  // -----------------------------------------

  function initOnceFunctions() {
    initLenis();

    if (onceFunctionsInitialized) return;
    onceFunctionsInitialized = true;

    initCursor();
    bindCursorEvents(document);
    initHeroLoop();

    // Nav overlay (persists across transitions)
    if (typeof sgm.nav !== 'undefined' && sgm.nav.init) {
      sgm.nav.init();
    }
  }

  function initBeforeEnterFunctions() {
  }

  function initAfterEnterFunctions(next) {
    bindCursorEvents(next);
    initHeroCarousel();
    initTextReveals(next);
    initParallax(next);
    initShowreel(next);

    if (hasLenis) lenis.resize();
    if (hasScrollTrigger) ScrollTrigger.refresh();
  }


  // -----------------------------------------
  // PAGE TRANSITIONS — Page Name Wipe
  // -----------------------------------------

  function runPageOnceAnimation(next) {
    var tl = gsap.timeline();
    tl.call(function () { resetPage(next); }, null, 0);
    return tl;
  }

  function runPageLeaveAnimation(current, next) {
    var transitionPanel = document.querySelector('[data-transition-panel]');
    var transitionLabel = document.querySelector('[data-transition-label]');

    // Set label to destination page name
    var pageName = next.getAttribute('data-page-name') || 'Sam George';
    var labelText = transitionLabel.querySelector('span:nth-child(2)');
    if (labelText) labelText.textContent = ' ' + pageName + ' ';

    var tl = gsap.timeline({
      onComplete: function () { current.remove(); }
    });

    if (reducedMotion) {
      return tl.set(current, { autoAlpha: 0 });
    }

    // Reset panel state
    tl.set(transitionPanel, { visibility: 'visible' }, 0);
    tl.set(next, { visibility: 'hidden' }, 0);
    tl.set(transitionLabel, { visibility: 'visible' }, 0);

    // Panel slides UP from bottom to cover the screen
    tl.fromTo(transitionPanel,
      { yPercent: 0 },
      { yPercent: -100, duration: 0.8, ease: 'sgm' },
      0
    );

    // Current page shifts up slightly (depth effect)
    tl.fromTo(current,
      { y: '0vh' },
      { y: '-15vh', duration: 0.8, ease: 'sgm' },
      0
    );

    return tl;
  }

  function runPageEnterAnimation(next) {
    var transitionPanel = document.querySelector('[data-transition-panel]');
    var transitionLabel = document.querySelector('[data-transition-label]');

    var tl = gsap.timeline();

    if (reducedMotion) {
      tl.set(next, { autoAlpha: 1 });
      tl.add('pageReady');
      tl.call(resetPage, [next], 'pageReady');
      return new Promise(function (resolve) { tl.call(resolve, null, 'pageReady'); });
    }

    // Hold on the label briefly, then reveal
    tl.add('startEnter', 1.25);

    // Show next page
    tl.set(next, { visibility: 'visible' }, 'startEnter');

    // Panel continues UP and out (reveals new page)
    tl.fromTo(transitionPanel,
      { yPercent: -100 },
      { yPercent: -200, duration: 1, ease: 'sgm', overwrite: 'auto', immediateRender: false },
      'startEnter'
    );

    // Reset panel off-screen after exit
    tl.set(transitionPanel, { visibility: 'hidden', yPercent: 0 }, '>');
    tl.set(transitionLabel, { visibility: 'hidden' }, '<');

    // New page rises from below
    tl.from(next, { y: '15vh', duration: 1, ease: 'sgm' }, 'startEnter');

    tl.add('pageReady');
    tl.call(resetPage, [next], 'pageReady');

    return new Promise(function (resolve) {
      tl.call(resolve, null, 'pageReady');
    });
  }


  // -----------------------------------------
  // BARBA HOOKS + INIT
  // -----------------------------------------

  barba.hooks.beforeEnter(function (data) {
    gsap.set(data.next.container, { position: 'fixed', top: 0, left: 0, right: 0 });
    if (lenis) lenis.stop();
    initBeforeEnterFunctions(data.next.container);
  });

  barba.hooks.afterLeave(function () {
    if (hasScrollTrigger) {
      ScrollTrigger.getAll().forEach(function (trigger) { trigger.kill(); });
    }
  });

  barba.hooks.afterEnter(function (data) {
    initAfterEnterFunctions(data.next.container);
    if (hasLenis) { lenis.resize(); lenis.start(); }
    if (hasScrollTrigger) ScrollTrigger.refresh();
  });

  barba.init({
    debug: false,
    timeout: 7000,
    preventRunning: true,
    transitions: [{
      name: 'page-wipe',
      sync: true,

      once: function (data) {
        initOnceFunctions();
        initAfterEnterFunctions(data.next.container);
        return runPageOnceAnimation(data.next.container);
      },

      leave: function (data) {
        return runPageLeaveAnimation(data.current.container, data.next.container);
      },

      enter: function (data) {
        return runPageEnterAnimation(data.next.container);
      }
    }]
  });


  // -----------------------------------------
  // HELPERS
  // -----------------------------------------

  function initLenis() {
    if (lenis) return;
    if (!hasLenis) return;

    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1.15 });
    if (hasScrollTrigger) lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  function resetPage(container) {
    window.scrollTo(0, 0);
    gsap.set(container, { clearProps: 'position,top,left,right' });
    if (hasLenis) { lenis.resize(); lenis.start(); }
  }


  // -----------------------------------------
  // HERO CAROUSEL (homepage only)
  // -----------------------------------------

  function initHeroCarousel() {
    var carousel = document.querySelector('#heroCarousel');
    if (!carousel) return;

    var slides = carousel.querySelectorAll('.hero_slide');
    var nums = carousel.querySelectorAll('.hero_timeline-num');
    var fills = carousel.querySelectorAll('[data-timeline-fill]');
    var current = 0;
    var total = slides.length;
    var DURATION = 6;

    if (!slides.length) return;

    // Each slide is self-contained: bg image + title lines + subtitle
    // Read text elements from within each slide
    function getSlideText(slide) {
      return {
        lines: slide.querySelectorAll('.hero_title-text'),
        subtitle: slide.querySelector('.hero_subtitle')
      };
    }

    var progressTween = null;

    function updateTimeline() {
      fills.forEach(function (f) { gsap.set(f, { width: '0%' }); });
      for (var i = 0; i < current; i++) {
        if (fills[i]) gsap.set(fills[i], { width: '100%' });
      }
      nums.forEach(function (n, i) {
        n.classList.toggle('is-active', i <= current);
      });
    }

    function startProgress() {
      if (progressTween) progressTween.kill();
      updateTimeline();

      var fillIndex = current;
      if (fillIndex >= fills.length) {
        progressTween = gsap.delayedCall(DURATION, function () {
          goTo(0, true);
        });
        return;
      }

      progressTween = gsap.to(fills[fillIndex], {
        width: '100%',
        duration: DURATION,
        ease: 'none',
        onComplete: function () {
          goTo((current + 1) % total, true);
        }
      });
    }

    function goTo(index, isAuto) {
      if (index === current && slides[current].classList.contains('is-active')) return;
      var prev = current;
      var dir = index > prev || (prev === total - 1 && index === 0) ? 1 : -1;
      current = index;

      if (progressTween) progressTween.kill();

      var prevText = getSlideText(slides[prev]);
      var nextText = getSlideText(slides[current]);

      var exitY = dir === 1 ? -110 : 110;
      var enterFrom = dir === 1 ? 110 : -110;

      // Set next slide's text to enter position before it becomes visible
      nextText.lines.forEach(function (el) { gsap.set(el, { yPercent: enterFrom }); });
      if (nextText.subtitle) gsap.set(nextText.subtitle, { yPercent: enterFrom });

      var tl = gsap.timeline();

      // Animate out all text (title lines + subtitle, sequential stagger)
      var prevEls = Array.from(prevText.lines);
      if (prevText.subtitle) prevEls.push(prevText.subtitle);
      tl.to(prevEls, { yPercent: exitY, duration: 0.35, ease: 'power3.in', stagger: 0.04 }, 0);

      // Crossfade slides
      tl.call(function () {
        slides[prev].classList.remove('is-active');
        slides[current].classList.add('is-active');
      }, null, 0.2);

      // Animate in all text (title lines + subtitle, sequential stagger)
      var nextEls = Array.from(nextText.lines);
      if (nextText.subtitle) nextEls.push(nextText.subtitle);
      tl.to(nextEls, { yPercent: 0, duration: 0.4, ease: 'power3.out', stagger: 0.04 }, 0.3);

      // Timeline progress
      if (isAuto) {
        startProgress();
      } else if (dir === 1) {
        var fastTl = gsap.timeline({ onComplete: startProgress });
        for (var i = prev; i < current; i++) {
          if (fills[i]) fastTl.to(fills[i], { width: '100%', duration: 0.25, ease: 'power2.inOut' }, i === prev ? 0 : '>-0.1');
        }
        nums.forEach(function (n, j) { n.classList.toggle('is-active', j <= current); });
      } else {
        var reverseTl = gsap.timeline({ onComplete: startProgress });
        if (fills[prev]) reverseTl.to(fills[prev], { width: '0%', duration: 0.2, ease: 'power2.inOut' }, 0);
        for (var i = prev - 1; i >= current; i--) {
          if (fills[i]) reverseTl.to(fills[i], { width: '0%', duration: 0.2, ease: 'power2.inOut' }, '>-0.1');
        }
        nums.forEach(function (n, j) { n.classList.toggle('is-active', j <= current); });
      }
    }

    // Nav zones — click + cursor state
    var prevZone = carousel.querySelector('[data-hero-prev]');
    var nextZone = carousel.querySelector('[data-hero-next]');

    if (nextZone) {
      nextZone.addEventListener('click', function () { goTo((current + 1) % total); });
      nextZone.addEventListener('mouseenter', function () { setCursorState('arrow-right'); });
      nextZone.addEventListener('mouseleave', function () { setCursorState('default'); });
    }
    if (prevZone) {
      prevZone.addEventListener('click', function () { goTo((current - 1 + total) % total); });
      prevZone.addEventListener('mouseenter', function () { setCursorState('arrow-left'); });
      prevZone.addEventListener('mouseleave', function () { setCursorState('default'); });
    }

    // Kick off — first slide visible, text at resting position
    if (slides.length) slides[0].classList.add('is-active');
    if (nums.length) nums[0].classList.add('is-active');
    startProgress();
  }


  // -----------------------------------------
  // TEXT REVEAL
  // -----------------------------------------

  function initTextReveals(scope) {
    var root = scope || document;

    var revealEls = root.querySelectorAll('.footer_cta-text, .footer_nav-link, .footer_col-heading, .footer_col-link, .footer_copy, .footer_bottom-link');

    revealEls.forEach(function (el) {
      if (el.closest('#heroCarousel')) return;
      if (el.closest('.nav-overlay_component')) return;
      if (el.closest('.section_poster')) return;
      if (el.closest('.section_clients')) return;
      if (el.closest('.section_showreel')) return;

      if (!el.querySelector('.reveal-inner')) {
        var inner = document.createElement('span');
        inner.className = 'reveal-inner';
        while (el.firstChild) inner.appendChild(el.firstChild);
        el.appendChild(inner);
        el.style.overflow = 'hidden';
      }

      var inner = el.querySelector('.reveal-inner');

      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        gsap.fromTo(inner, { yPercent: 110 }, { yPercent: 0, duration: 0.5, ease: 'power3.out', delay: 0.1 });
      } else {
        gsap.set(inner, { yPercent: 110 });
        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          once: true,
          onEnter: function () {
            gsap.to(inner, { yPercent: 0, duration: 0.5, ease: 'power3.out' });
          }
        });
      }
    });
  }


  // -----------------------------------------
  // PARALLAX
  // -----------------------------------------

  function initParallax(scope) {
    var root = scope || document;

    // Background parallax
    root.querySelectorAll('[data-parallax]').forEach(function (section) {
      var bg = section.querySelector('.poster_bg');
      if (!bg) return;

      gsap.fromTo(bg, { yPercent: -12 }, {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });

    // Content text parallax
    root.querySelectorAll('[data-parallax] .poster_content').forEach(function (content) {
      gsap.fromTo(content, { yPercent: 10 }, {
        yPercent: -10,
        ease: 'none',
        scrollTrigger: {
          trigger: content.closest('[data-parallax]'),
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });

    // Poster heading lines — scrubbed reveal
    root.querySelectorAll('.poster_heading').forEach(function (heading) {
      var section = heading.closest('.section_poster');
      var btn = section ? section.querySelector('.poster_btn') : null;

      if (!heading.querySelector('.poster_heading-line')) {
        var lines = heading.innerHTML.split('<br>');
        heading.innerHTML = lines.map(function (line) {
          return '<span style="display:block;overflow:hidden;"><span class="poster_heading-line" style="display:block;">' + line.trim() + '</span></span>';
        }).join('');
      }

      var lineEls = heading.querySelectorAll('.poster_heading-line');

      lineEls.forEach(function (el, i) {
        gsap.fromTo(el, { yPercent: 110 }, {
          yPercent: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top ' + (80 - i * 3) + '%',
            end: 'top ' + (55 - i * 3) + '%',
            scrub: 1
          }
        });
      });

      if (btn) {
        gsap.fromTo(btn, { yPercent: 50, opacity: 0 }, {
          yPercent: 0, opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top 65%',
            end: 'top 45%',
            scrub: 1
          }
        });
      }
    });

    // Label lines
    root.querySelectorAll('.poster_label-line').forEach(function (line) {
      var section = line.closest('.section_poster, .section_showreel, .section_clients');
      if (!section) return;

      gsap.fromTo(line, { scaleX: 0, opacity: 0 }, {
        scaleX: 1, opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top 100%',
          end: 'top 85%',
          scrub: 1
        }
      });
    });

    // Label text
    root.querySelectorAll('.poster_label-text').forEach(function (text) {
      var section = text.closest('.section_poster, .section_showreel, .section_clients');
      if (!section) return;

      gsap.fromTo(text, { yPercent: 110, opacity: 0 }, {
        yPercent: 0, opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top 100%',
          end: 'top 85%',
          scrub: 1
        }
      });
    });
  }


  // -----------------------------------------
  // SHOWREEL — clip-path iris reveal
  // -----------------------------------------

  function initShowreel(scope) {
    var root = scope || document;
    var wrap = root.querySelector('#showreelWrap');
    if (!wrap) return;
    var section = wrap.closest('.section_showreel');
    var text = section.querySelector('[data-showreel-text]');

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1
      }
    });

    // Act 1 (0–20%): Text clips in from below
    tl.fromTo(text, { yPercent: 110 }, {
      yPercent: 0,
      duration: 0.2,
      ease: 'power3.out'
    }, 0);

    // Act 2 (20–35%): Hold

    // Act 3 (35–90%): Video iris opens from centre slit
    tl.fromTo(wrap,
      { clipPath: 'inset(0% 50% 0% 50%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.55,
        ease: 'power2.inOut'
      }, 0.35
    );

    // Text clips back down as video opens
    tl.to(text, {
      yPercent: 110,
      duration: 0.2,
      ease: 'power3.in'
    }, 0.3);
  }


  // -----------------------------------------
  // INFINITE SCROLL LOOP
  // -----------------------------------------

  function initHeroLoop() {
    var loopBuffer = document.querySelector('#loopBuffer');
    if (!loopBuffer || !hasLenis || !lenis) return;
    var resetting = false;

    lenis.on('scroll', function () {
      if (resetting) return;
      var bufferRect = loopBuffer.getBoundingClientRect();
      if (bufferRect.top < 0) {
        resetting = true;

        ScrollTrigger.getAll().forEach(function (st) { st.kill(); });

        // Reset showreel
        var showreelWrap = document.querySelector('#showreelWrap');
        var showreelText = document.querySelector('[data-showreel-text]');
        if (showreelWrap) gsap.set(showreelWrap, { clipPath: 'inset(0% 50% 0% 50%)' });
        if (showreelText) gsap.set(showreelText, { yPercent: 110, opacity: 1 });

        // Reset text reveals
        document.querySelectorAll('.reveal-inner').forEach(function (inner) {
          gsap.set(inner, { yPercent: 110 });
        });

        // Reset poster heading lines
        document.querySelectorAll('.poster_heading-line').forEach(function (el) {
          gsap.set(el, { yPercent: 110 });
        });

        // Reset poster buttons
        document.querySelectorAll('.section_poster .poster_btn').forEach(function (el) {
          gsap.set(el, { yPercent: 50, opacity: 0 });
        });

        // Reset label lines and text
        document.querySelectorAll('.poster_label-line').forEach(function (el) {
          gsap.set(el, { scaleX: 0, opacity: 0 });
        });
        document.querySelectorAll('.poster_label-text').forEach(function (el) {
          gsap.set(el, { yPercent: 110, opacity: 0 });
        });

        lenis.scrollTo(0, {
          immediate: true,
          onComplete: function () {
            var main = document.querySelector('[data-barba="container"]');
            initTextReveals(main);
            initParallax(main);
            initShowreel(main);
            ScrollTrigger.refresh();
            resetting = false;
          }
        });
      }
    });
  }

})();
