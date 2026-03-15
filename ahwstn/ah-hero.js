/**
 * ah-hero.js — Ambient Dot-Grid Hero Background + Hover Spotlight
 * @version 3.0.0
 * @cdn https://cdn.ahwstn.com/ahwstn/ah-hero.min.js
 *
 * Flickering dot-grid canvas behind hero text. Cursor-following spotlight
 * raises the flicker ceiling and rate in a wide radius around the mouse,
 * with lerped tracking for an organic, trailing feel.
 *
 * Static-first: hero content is fully readable without JS. Canvas is
 * purely decorative (aria-hidden).
 *
 * v3.0.0: Module pattern — ah.heroCanvas with init/destroy for Barba lifecycle.
 *         DOM-gated: exits silently if .section_home-hero is absent.
 * v2.1.0: Theme-aware — reads dot colour from window.ahTheme, listens for themechange.
 * v2.0.0: Hover spotlight — lerped cursor tracking, boosted flicker ceiling + rate.
 * v1.0.0: Initial build — radial vignette, IO pause, RO resize, reduced-motion.
 */
(function () {
  'use strict';

  window.ah = window.ah || {};

  ah.heroCanvas = {
    _canvas: null,
    _ctx: null,
    _hero: null,
    _cols: 0,
    _rows: 0,
    _grid: null,
    _spotMap: null,
    _animId: null,
    _lastTime: 0,
    _isVisible: false,
    _io: null,
    _ro: null,
    _themeHandler: null,
    _mouseHandlers: [],
    _mouseX: -9999,
    _mouseY: -9999,
    _isHovered: false,
    _smoothX: -9999,
    _smoothY: -9999,
    _colorR: 242,
    _colorG: 242,
    _colorB: 242,

    /* Constants */
    SQ: 3,
    GAP: 5,
    FLICKER: 0.3,
    BASE_ALPHA: 0.1,
    HOVER_RADIUS: 500,
    HOVER_ALPHA: 0.25,
    HOVER_FALLOFF: 3,
    LERP_SPEED: 0.05,
    HOVER_FLICKER_MULT: 4,

    init: function () {
      var hero = document.querySelector('.section_home-hero');
      if (!hero || hero.querySelector('canvas')) return;
      this._hero = hero;

      var rm = matchMedia('(prefers-reduced-motion:reduce)').matches;
      var tc = window.ahTheme ? window.ahTheme.colors[window.ahTheme.current] : null;
      this._colorR = tc ? tc.dotR : 242;
      this._colorG = tc ? tc.dotG : 242;
      this._colorB = tc ? tc.dotB : 242;

      /* Canvas setup */
      this._canvas = document.createElement('canvas');
      this._canvas.setAttribute('aria-hidden', 'true');
      this._canvas.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:0';
      this._ctx = this._canvas.getContext('2d');

      hero.style.position = 'relative';
      hero.insertBefore(this._canvas, hero.firstChild);

      /* Mouse listeners */
      var self = this;
      var enterFn = function () { self._isHovered = true; };
      var leaveFn = function () { self._isHovered = false; };
      var moveFn = function (e) {
        var rect = hero.getBoundingClientRect();
        self._mouseX = e.clientX - rect.left;
        self._mouseY = e.clientY - rect.top;
      };
      hero.addEventListener('mouseenter', enterFn);
      hero.addEventListener('mouseleave', leaveFn);
      hero.addEventListener('mousemove', moveFn);
      this._mouseHandlers = [
        { ev: 'mouseenter', fn: enterFn },
        { ev: 'mouseleave', fn: leaveFn },
        { ev: 'mousemove', fn: moveFn }
      ];

      this._resize();

      if (rm) {
        this._draw();
        return;
      }

      /* IntersectionObserver: pause when off-screen */
      this._io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { self._start(); }
          else { self._stop(); }
        });
      }, { threshold: 0 });
      this._io.observe(hero);

      /* ResizeObserver */
      this._ro = new ResizeObserver(function () {
        self._stop();
        self._resize();
        if (self._isVisible) self._start();
      });
      this._ro.observe(hero);

      /* Theme change */
      this._themeHandler = function () {
        var c = window.ahTheme.colors[window.ahTheme.current];
        self._colorR = c.dotR; self._colorG = c.dotG; self._colorB = c.dotB;
        self._draw();
      };
      document.documentElement.addEventListener('themechange', this._themeHandler);
    },

    destroy: function () {
      this._stop();

      if (this._io) { this._io.disconnect(); this._io = null; }
      if (this._ro) { this._ro.disconnect(); this._ro = null; }

      if (this._themeHandler) {
        document.documentElement.removeEventListener('themechange', this._themeHandler);
        this._themeHandler = null;
      }

      var hero = this._hero;
      if (hero) {
        this._mouseHandlers.forEach(function (h) {
          hero.removeEventListener(h.ev, h.fn);
        });
      }
      this._mouseHandlers = [];

      if (this._canvas && this._canvas.parentNode) {
        this._canvas.parentNode.removeChild(this._canvas);
      }
      this._canvas = null;
      this._ctx = null;
      this._hero = null;
      this._grid = null;
      this._spotMap = null;
      this._mouseX = -9999;
      this._mouseY = -9999;
      this._smoothX = -9999;
      this._smoothY = -9999;
      this._isHovered = false;
    },

    _resize: function () {
      var hero = this._hero;
      if (!hero || !this._canvas) return;
      var STEP = this.SQ + this.GAP;
      var w = hero.clientWidth;
      var h = hero.clientHeight;
      var dpr = window.devicePixelRatio || 1;
      this._canvas.width = w * dpr;
      this._canvas.height = h * dpr;
      this._canvas.style.width = w + 'px';
      this._canvas.style.height = h + 'px';
      this._ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      this._cols = Math.ceil(w / STEP);
      this._rows = Math.ceil(h / STEP);

      this._grid = new Float32Array(this._cols * this._rows);
      for (var i = 0; i < this._grid.length; i++) {
        this._grid[i] = Math.random() * this.BASE_ALPHA;
      }
      this._spotMap = new Float32Array(this._cols * this._rows);
      this._draw();
    },

    _draw: function () {
      var hero = this._hero;
      if (!hero || !this._ctx) return;
      var STEP = this.SQ + this.GAP;
      var w = hero.clientWidth;
      var h = hero.clientHeight;
      this._ctx.clearRect(0, 0, w, h);

      for (var r = 0; r < this._rows; r++) {
        for (var c = 0; c < this._cols; c++) {
          var i = r * this._cols + c;
          var alpha = this._grid[i];
          if (alpha < 0.005) continue;
          this._ctx.fillStyle = 'rgba(' + this._colorR + ',' + this._colorG + ',' + this._colorB + ',' + alpha.toFixed(3) + ')';
          this._ctx.fillRect(c * STEP, r * STEP, this.SQ, this.SQ);
        }
      }
    },

    _updateSpotMap: function () {
      var STEP = this.SQ + this.GAP;
      var active = this._smoothX > -999;
      for (var r = 0; r < this._rows; r++) {
        for (var c = 0; c < this._cols; c++) {
          var i = r * this._cols + c;
          if (!active) { this._spotMap[i] = 0; continue; }
          var px = c * STEP + this.SQ / 2;
          var py = r * STEP + this.SQ / 2;
          var dx = px - this._smoothX;
          var dy = py - this._smoothY;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist >= this.HOVER_RADIUS) { this._spotMap[i] = 0; continue; }
          this._spotMap[i] = 1 - Math.pow(dist / this.HOVER_RADIUS, this.HOVER_FALLOFF);
        }
      }
    },

    _animate: function (timestamp) {
      if (!this._isVisible) return;
      var self = this;

      if (!this._lastTime) this._lastTime = timestamp;
      var deltaTime = (timestamp - this._lastTime) / 1000;
      this._lastTime = timestamp;
      if (deltaTime > 0.1) deltaTime = 0.1;

      if (this._isHovered) {
        if (this._smoothX < -999) { this._smoothX = this._mouseX; this._smoothY = this._mouseY; }
        this._smoothX += (this._mouseX - this._smoothX) * this.LERP_SPEED;
        this._smoothY += (this._mouseY - this._smoothY) * this.LERP_SPEED;
      } else {
        this._smoothX += (-9999 - this._smoothX) * 0.02;
        this._smoothY += (-9999 - this._smoothY) * 0.02;
      }

      this._updateSpotMap();

      for (var i = 0; i < this._grid.length; i++) {
        var t = this._spotMap[i];
        var flickerRate = this.FLICKER + (this.FLICKER * (this.HOVER_FLICKER_MULT - 1)) * t;
        var alphaCeiling = this.BASE_ALPHA + (this.HOVER_ALPHA - this.BASE_ALPHA) * t;
        if (Math.random() < flickerRate * deltaTime) {
          this._grid[i] = Math.random() * alphaCeiling;
        }
      }

      this._draw();
      this._animId = requestAnimationFrame(function (ts) { self._animate(ts); });
    },

    _start: function () {
      if (this._animId) return;
      this._isVisible = true;
      this._lastTime = 0;
      var self = this;
      requestAnimationFrame(function (ts) { self._animate(ts); });
    },

    _stop: function () {
      this._isVisible = false;
      if (this._animId) {
        cancelAnimationFrame(this._animId);
        this._animId = null;
      }
    }
  };

  /* Boot on load */
  ah.heroCanvas.init();

})();
