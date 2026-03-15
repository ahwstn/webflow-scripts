/**
 * ah-nav.js — Logo Typewriter + Nav Enhancements
 * @version 2.0.0
 * @cdn https://cdn.ahwstn.com/ahwstn/ah-nav.min.js
 *
 * Human typewriter: </ahwstn> collapses to </> on scroll, re-expands on hover.
 * Per-char max-width with randomised intervals (L→R type, R→L delete).
 *
 * Expects Webflow DOM:
 *   .nav_logo > .nav_logo-bracket(<) + .nav_logo-slash(/) + .nav_logo-text(ahwstn) + .nav_logo-bracket(>)
 *
 * Static-first: logo is fully readable without this script.
 *
 * v2.0.0: Module pattern — ah.navTypewriter with init/destroy for Barba lifecycle.
 *         Nav persists across transitions; rarely destroyed.
 * v1.0.0: Typewriter scroll collapse, hover re-expand, reduced-motion.
 */
(function () {
  'use strict';

  window.ah = window.ah || {};

  ah.navTypewriter = {
    _style: null,
    _chars: [],
    _charWidths: [],
    _typeTimers: [],
    _io: null,
    _sentinel: null,
    _isScrolled: false,
    _enterHandler: null,
    _leaveHandler: null,
    _originalHTML: null,
    _logoText: null,

    init: function () {
      var rm = matchMedia('(prefers-reduced-motion:reduce)').matches;
      var nav = document.querySelector('.nav_wrapper');
      var logoText = document.querySelector('.nav_logo-text');
      if (!nav || !logoText) return;
      this._logoText = logoText;

      /* Save original HTML for destroy */
      this._originalHTML = logoText.innerHTML;

      /* CSS injection for per-char control */
      this._style = document.createElement('style');
      this._style.textContent = ''
        + '.nav_logo-char{'
        +   'display:inline-block;'
        +   'overflow-x:clip;'
        +   'white-space:nowrap;'
        +   'transition:max-width .15s cubic-bezier(.22,1,.36,1)'
        + '}'
        + '.nav_logo-char.is-instant{transition:none}';
      document.head.appendChild(this._style);

      /* Wrap each character in a span */
      var word = logoText.textContent.trim();
      var charSpans = '';
      for (var i = 0; i < word.length; i++) {
        charSpans += '<span class="nav_logo-char">' + word[i] + '</span>';
      }
      logoText.innerHTML = charSpans;

      this._chars = Array.from(logoText.querySelectorAll('.nav_logo-char'));
      this._charWidths = [];
      var self = this;

      /* Wait for fonts before measuring natural widths */
      document.fonts.ready.then(function () {
        for (var i = 0; i < self._chars.length; i++) {
          self._charWidths[i] = self._chars[i].getBoundingClientRect().width;
          self._chars[i].style.maxWidth = self._charWidths[i] + 'px';
        }
      });

      if (rm) return; /* Reduced motion: logo stays static */

      /* Scroll sentinel */
      this._sentinel = document.createElement('div');
      this._sentinel.setAttribute('aria-hidden', 'true');
      this._sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none';
      document.body.insertBefore(this._sentinel, document.body.firstChild);

      var firstIO = true;
      this._isScrolled = false;

      this._io = new IntersectionObserver(function (entries) {
        var scrolled = !entries[0].isIntersecting;

        if (firstIO) {
          firstIO = false;
          self._isScrolled = scrolled;
          if (scrolled) self._snapOut();
          return;
        }

        self._isScrolled = scrolled;
        if (scrolled) { self._typeOut(); }
        else { self._typeIn(); }
      }, { root: null, threshold: 0 });
      this._io.observe(this._sentinel);

      /* Hover: re-expand when anywhere on nav is hovered */
      this._enterHandler = function () { if (self._isScrolled) self._typeIn(); };
      this._leaveHandler = function () { if (self._isScrolled) self._typeOut(); };
      nav.addEventListener('mouseenter', this._enterHandler);
      nav.addEventListener('mouseleave', this._leaveHandler);
    },

    destroy: function () {
      this._clearTimers();

      if (this._io) { this._io.disconnect(); this._io = null; }

      if (this._sentinel && this._sentinel.parentNode) {
        this._sentinel.parentNode.removeChild(this._sentinel);
        this._sentinel = null;
      }

      var nav = document.querySelector('.nav_wrapper');
      if (nav) {
        if (this._enterHandler) nav.removeEventListener('mouseenter', this._enterHandler);
        if (this._leaveHandler) nav.removeEventListener('mouseleave', this._leaveHandler);
      }
      this._enterHandler = null;
      this._leaveHandler = null;

      /* Restore original logo HTML */
      if (this._logoText && this._originalHTML !== null) {
        this._logoText.innerHTML = this._originalHTML;
      }
      this._logoText = null;
      this._originalHTML = null;

      if (this._style && this._style.parentNode) {
        this._style.parentNode.removeChild(this._style);
        this._style = null;
      }

      this._chars = [];
      this._charWidths = [];
      this._isScrolled = false;
    },

    _clearTimers: function () {
      for (var i = 0; i < this._typeTimers.length; i++) clearTimeout(this._typeTimers[i]);
      this._typeTimers = [];
    },

    _typeIn: function () {
      this._clearTimers();
      var elapsed = 0;
      var self = this;
      for (var i = 0; i < this._chars.length; i++) {
        elapsed += 50 + Math.random() * 140;
        (function (idx, delay) {
          self._typeTimers.push(setTimeout(function () {
            self._chars[idx].classList.remove('is-instant');
            self._chars[idx].style.maxWidth = self._charWidths[idx] + 'px';
          }, delay));
        })(i, elapsed);
      }
    },

    _typeOut: function () {
      this._clearTimers();
      var elapsed = 0;
      var self = this;
      for (var i = this._chars.length - 1; i >= 0; i--) {
        elapsed += 35 + Math.random() * 90;
        (function (idx, delay) {
          self._typeTimers.push(setTimeout(function () {
            self._chars[idx].classList.remove('is-instant');
            self._chars[idx].style.maxWidth = '0px';
          }, delay));
        })(i, elapsed);
      }
    },

    _snapOut: function () {
      this._clearTimers();
      for (var i = 0; i < this._chars.length; i++) {
        this._chars[i].classList.add('is-instant');
        this._chars[i].style.maxWidth = '0px';
      }
    }
  };

  /* Boot on load */
  ah.navTypewriter.init();

})();
