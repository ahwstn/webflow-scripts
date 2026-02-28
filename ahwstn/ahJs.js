/**
 * ahJs.js — ahwstn.com Footer JS
 * Version: 1.0.0
 *
 * Loaded with `defer` in footer.
 * Depends on GSAP (loaded via Webflow Site Settings: SplitText, ScrollTrigger).
 *
 * Contents:
 *   - Reduced-motion gate
 *   - Nav scroll observer (IntersectionObserver)
 *   - Mobile nav toggle
 *   - Hero SplitText word cascade
 *   - Physio char-scrub (About page)
 *   - Terminal loading screen (all pages)
 */
(function () {
  var reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===================================================================
  // NAV SCROLL OBSERVER
  // Toggles .is-scrolled on nav_wrapper when hero leaves viewport
  // ===================================================================
  var nav = document.querySelector('.nav_wrapper');
  if (nav) {
    // Create a sentinel element at the top of the page
    var sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none';
    document.body.prepend(sentinel);

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          nav.classList.remove('is-scrolled');
        } else {
          nav.classList.add('is-scrolled');
        }
      });
    }, { threshold: 0 });

    observer.observe(sentinel);
  }

  // ===================================================================
  // MOBILE NAV TOGGLE
  // ===================================================================
  var hamburger = document.querySelector('.nav_hamburger');
  var overlay = document.querySelector('.nav_overlay');

  if (hamburger && overlay) {
    hamburger.addEventListener('click', function () {
      var isOpen = overlay.classList.toggle('is-open');
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';

      // Stagger link entrance
      if (isOpen && !reducedMotion) {
        var links = overlay.querySelectorAll('.nav_link');
        links.forEach(function (link, i) {
          link.style.opacity = '0';
          link.style.transform = 'translateY(20px)';
          setTimeout(function () {
            link.style.transition = 'opacity 400ms cubic-bezier(.22,1,.36,1), transform 400ms cubic-bezier(.22,1,.36,1)';
            link.style.opacity = '1';
            link.style.transform = 'translateY(0)';
          }, 50 * i);
        });
      }
    });

    // Close overlay on link click
    overlay.querySelectorAll('.nav_link').forEach(function (link) {
      link.addEventListener('click', function () {
        overlay.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // ===================================================================
  // HERO SPLITTEXT WORD CASCADE
  // Staggered word reveal: opacity:0, y:40 → visible
  // ===================================================================
  var heroHeading = document.querySelector('.hero_heading');
  var heroSub = document.querySelector('.hero_subheading');
  var heroCta = document.querySelector('.hero_cta');

  if (heroHeading && window.gsap && window.SplitText) {
    document.fonts.ready.then(function () {
      var split = new SplitText(heroHeading, { type: 'words', aria: false });
      gsap.set(split.words, { opacity: 0, y: 40 });
      gsap.set(heroHeading, { opacity: 1 });

      if (reducedMotion) {
        gsap.set(split.words, { opacity: 1, y: 0 });
        if (heroSub) gsap.set(heroSub, { opacity: 1 });
        if (heroCta) gsap.set(heroCta, { opacity: 1 });
        return;
      }

      gsap.to(split.words, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.06,
        ease: 'power4.out',
        delay: 0.3
      });

      if (heroSub) {
        gsap.set(heroSub, { opacity: 0, y: 20 });
        gsap.to(heroSub, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: 0.8,
          ease: 'power3.out'
        });
      }

      if (heroCta) {
        gsap.set(heroCta, { opacity: 0, y: 20 });
        gsap.to(heroCta, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: 1.0,
          ease: 'power3.out'
        });
      }
    });
  }

  // ===================================================================
  // PHYSIO CHAR-SCRUB (About Page)
  // SplitText per-character scrub: opacity 0.15 → 1.0 as section scrolls
  // ===================================================================
  var physioHeading = document.querySelector('.physio_heading');

  if (physioHeading && window.gsap && window.SplitText && window.ScrollTrigger) {
    document.fonts.ready.then(function () {
      var split = new SplitText(physioHeading, { type: 'chars', aria: false });

      if (reducedMotion) {
        gsap.set(split.chars, { opacity: 1 });
        return;
      }

      gsap.set(split.chars, { opacity: 0.15, display: 'inline-block' });
      gsap.set(physioHeading, { opacity: 1 });

      gsap.to(split.chars, {
        opacity: 1,
        stagger: 0.03,
        ease: 'none',
        scrollTrigger: {
          trigger: '.section_about-physio',
          start: 'top 60%',
          end: 'bottom 40%',
          scrub: 1
        }
      });
    });
  }

  // ===================================================================
  // TERMINAL LOADING SCREEN
  // ScrambleText boot sequence — plays once on page load
  // Provides the "code/terminal" atmosphere before content reveals
  // ===================================================================
  var terminal = document.querySelector('.ah-terminal');

  if (terminal) {
    var lines = [
      '> LOADING DESIGN SYSTEM...',
      '> COMPILING COLOUR TOKENS       DONE',
      '> REGISTERING TYPOGRAPHY         DONE',
      '> INITIALISING INTERACTIONS      DONE',
      '> STATUS: ALL SYSTEMS LIVE'
    ];

    terminal.innerHTML = [
      '<div class="ah-terminal_bar">',
        '<span class="ah-terminal_dot ah-terminal_dot--red"></span>',
        '<span class="ah-terminal_dot ah-terminal_dot--yellow"></span>',
        '<span class="ah-terminal_dot ah-terminal_dot--green"></span>',
        '<span class="ah-terminal_title">ahwstn.sh</span>',
      '</div>',
      '<div class="ah-terminal_body">',
        '<p class="ah-terminal_line" data-line="0"></p>',
        '<p class="ah-terminal_line" data-line="1"></p>',
        '<p class="ah-terminal_line" data-line="2"></p>',
        '<p class="ah-terminal_line" data-line="3"></p>',
        '<p class="ah-terminal_line ah-terminal_line--status" data-line="4"></p>',
        '<p class="ah-terminal_line"><span class="ah-terminal_prompt">$ </span><span class="ah-terminal_typed"></span><span class="ah-terminal_cursor"></span></p>',
      '</div>'
    ].join('');

    var terminalLines = terminal.querySelectorAll('.ah-terminal_line[data-line]');
    var typedEl = terminal.querySelector('.ah-terminal_typed');

    if (reducedMotion) {
      // Show all lines immediately
      terminalLines.forEach(function (el, i) { el.textContent = lines[i]; });
      if (typedEl) typedEl.textContent = 'Welcome_';
    } else {
      // Animate with ScrambleText + TextPlugin
      (function tryAnimate() {
        if (window.ScrambleTextPlugin && window.TextPlugin && window.gsap) {
          var tl = gsap.timeline({ delay: 0.2 });

          terminalLines.forEach(function (el, i) {
            tl.to(el, {
              scrambleText: {
                text: lines[i],
                chars: '01!@#$%X><{}[]',
                speed: 0.4,
                revealDelay: 0.2,
                newClass: i === 4 ? 'ah-terminal_revealed' : '',
                oldClass: 'ah-terminal_scrambled'
              },
              duration: 1.0,
              ease: 'none'
            }, 0.5 * i);
          });

          // Highlight "LIVE" in green
          tl.add(function () {
            var statusLine = terminalLines[4];
            if (statusLine && window.SplitText) {
              new SplitText(statusLine, { type: 'words', aria: false }).words.forEach(function (w) {
                if (w.textContent === 'LIVE') {
                  gsap.fromTo(w, { color: '#F2F2F2' }, { color: '#4ADE80', duration: 0.6, ease: 'power2.out' });
                }
              });
            }
          }, '>+0.2');

          // Type the prompt
          if (typedEl) {
            tl.to(typedEl, {
              text: { value: 'Welcome_' },
              duration: 1.0,
              ease: 'none'
            }, '>+0.3');
          }

          // Fade out terminal after sequence completes
          tl.to(terminal, {
            opacity: 0,
            duration: 0.6,
            delay: 0.8,
            ease: 'power2.inOut',
            onComplete: function () {
              terminal.style.display = 'none';
              document.body.style.overflow = '';
            }
          });

        } else {
          // Wait for plugins to load (Webflow loads them async)
          if ((tryAnimate._tries = (tryAnimate._tries || 0) + 1) > 50) {
            // Fallback: show lines without animation
            terminalLines.forEach(function (el, i) { el.textContent = lines[i]; });
            if (typedEl) typedEl.textContent = 'Welcome_';
            setTimeout(function () {
              terminal.style.opacity = '0';
              setTimeout(function () { terminal.style.display = 'none'; document.body.style.overflow = ''; }, 600);
            }, 2000);
            return;
          }
          setTimeout(tryAnimate, 100);
        }
      })();
    }
  }

})();
