/**
 * ah-footer.js — Canvas CTA Footer + Hover Spotlight
 * @version 3.0.0
 * @cdn https://cdn.ahwstn.com/ahwstn/ah-footer.min.js
 *
 * Canvas-based flickering dot-grid with multiline text mask ("Let's\nconnect"
 * in Space Grotesk 700). Cursor-following spotlight raises the flicker ceiling
 * and rate in a wide radius around the mouse.
 *
 * Static-first: footer bar (social links + legal) is fully functional
 * without JS. JS adds: flickering canvas with text mask.
 *
 * Accessibility: canvas is aria-hidden (decorative). Hidden H2 heading
 * in DOM provides text alternative for screen readers (Query-AH-001).
 *
 * v3.0.0: Module pattern — ah.footerCanvas with init/destroy for Barba lifecycle.
 *         DOM-gated: exits silently if .footer_canvas-wrap is absent.
 * v2.1.0: Theme-aware — reads dot/text colour from window.ahTheme, listens for themechange.
 * v2.0.0: Hover spotlight — lerped cursor tracking, boosted flicker ceiling + rate.
 * v1.0.0: Initial build — standalone (no AMH.register dependency).
 */
(function () {
  'use strict';

  window.ah = window.ah || {};

  ah.footerCanvas = {
    _canvas: null,
    _ctx: null,
    _wrap: null,
    _cols: 0,
    _rows: 0,
    _grid: null,
    _textMask: null,
    _spotMap: null,
    _animId: null,
    _lastTime: 0,
    _isVisible: false,
    _io: null,
    _ro: null,
    _themeHandler: null,
    _mouseHandlers: [],
    _fontLink: null,
    _mouseX: -9999,
    _mouseY: -9999,
    _isHovered: false,
    _smoothX: -9999,
    _smoothY: -9999,
    _colorR: 242,
    _colorG: 242,
    _colorB: 242,
    _textColor: '#fff',

    /* Constants */
    SQ: 3,
    GAP: 5,
    FLICKER: 0.3,
    BASE_ALPHA: 0.1,
    MASK_BOOST: 2,
    MASK_FLOOR: 0.15,
    TEXT: "Let's\nconnect",
    FONT_WEIGHT: '700',
    FONT_FAMILY: '"Space Grotesk"',
    LETTER_SPACING: '-0.05em',
    LINE_HEIGHT: 0.6,
    TEXT_X_PAD: 38,
    TEXT_Y_PCT: 0.78,
    HOVER_RADIUS: 500,
    HOVER_ALPHA: 0.25,
    HOVER_FALLOFF: 3,
    LERP_SPEED: 0.05,
    HOVER_FLICKER_MULT: 4,

    init: function () {
      var wrap = document.querySelector('.footer_canvas-wrap');
      if (!wrap || wrap.querySelector('canvas')) return;
      this._wrap = wrap;

      var tc = window.ahTheme ? window.ahTheme.colors[window.ahTheme.current] : null;
      this._colorR = tc ? tc.dotR : 242;
      this._colorG = tc ? tc.dotG : 242;
      this._colorB = tc ? tc.dotB : 242;
      this._textColor = tc ? tc.text : '#fff';

      /* Canvas setup */
      this._canvas = document.createElement('canvas');
      this._canvas.setAttribute('aria-hidden', 'true');
      this._canvas.style.cssText = 'position:absolute;inset:0;pointer-events:none';
      this._ctx = this._canvas.getContext('2d');
      wrap.appendChild(this._canvas);

      /* Mouse listeners */
      var self = this;
      var enterFn = function () { self._isHovered = true; };
      var leaveFn = function () { self._isHovered = false; };
      var moveFn = function (e) {
        var rect = wrap.getBoundingClientRect();
        self._mouseX = e.clientX - rect.left;
        self._mouseY = e.clientY - rect.top;
      };
      wrap.addEventListener('mouseenter', enterFn);
      wrap.addEventListener('mouseleave', leaveFn);
      wrap.addEventListener('mousemove', moveFn);
      this._mouseHandlers = [
        { ev: 'mouseenter', fn: enterFn },
        { ev: 'mouseleave', fn: leaveFn },
        { ev: 'mousemove', fn: moveFn }
      ];

      /* Load Space Grotesk 700 for canvas rendering */
      var fontLink = document.querySelector('link[href*="Space+Grotesk"]');
      if (!fontLink) {
        fontLink = document.createElement('link');
        fontLink.rel = 'stylesheet';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=swap';
        document.head.appendChild(fontLink);
        this._fontLink = fontLink;
      }

      var rm = matchMedia('(prefers-reduced-motion:reduce)').matches;

      document.fonts.load(this.FONT_WEIGHT + ' 224px ' + this.FONT_FAMILY).then(function () {
        self._resize();

        if (rm) {
          self._draw();
          return;
        }

        /* IntersectionObserver: pause when off-screen */
        self._io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) { self._start(); }
            else { self._stop(); }
          });
        }, { threshold: 0 });
        self._io.observe(wrap);

        /* ResizeObserver */
        self._ro = new ResizeObserver(function () {
          self._stop();
          self._resize();
          if (self._isVisible) self._start();
        });
        self._ro.observe(wrap);

        /* Theme change */
        self._themeHandler = function () {
          var c = window.ahTheme.colors[window.ahTheme.current];
          self._colorR = c.dotR; self._colorG = c.dotG; self._colorB = c.dotB;
          self._textColor = c.text;
          self._resize();
        };
        document.documentElement.addEventListener('themechange', self._themeHandler);
      });
    },

    destroy: function () {
      this._stop();

      if (this._io) { this._io.disconnect(); this._io = null; }
      if (this._ro) { this._ro.disconnect(); this._ro = null; }

      if (this._themeHandler) {
        document.documentElement.removeEventListener('themechange', this._themeHandler);
        this._themeHandler = null;
      }

      var wrap = this._wrap;
      if (wrap) {
        this._mouseHandlers.forEach(function (h) {
          wrap.removeEventListener(h.ev, h.fn);
        });
      }
      this._mouseHandlers = [];

      if (this._canvas && this._canvas.parentNode) {
        this._canvas.parentNode.removeChild(this._canvas);
      }
      this._canvas = null;
      this._ctx = null;
      this._wrap = null;
      this._grid = null;
      this._textMask = null;
      this._spotMap = null;
      this._mouseX = -9999;
      this._mouseY = -9999;
      this._smoothX = -9999;
      this._smoothY = -9999;
      this._isHovered = false;
    },

    _resize: function () {
      var wrap = this._wrap;
      if (!wrap || !this._canvas) return;
      var STEP = this.SQ + this.GAP;
      var w = wrap.clientWidth;
      var h = wrap.clientHeight;
      if (!w || !h) return; /* Element not laid out yet — RO will retry */
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

      this._buildTextMask(w, h);
      this._draw();
    },

    _buildTextMask: function (w, h) {
      var STEP = this.SQ + this.GAP;
      this._textMask = new Uint8Array(this._cols * this._rows);

      var off = document.createElement('canvas');
      off.width = w;
      off.height = h;
      var oc = off.getContext('2d');

      oc.fillStyle = '#000';
      oc.fillRect(0, 0, w, h);
      var fontSize = Math.min(224, Math.max(64, Math.round(w * 0.25)));
      var font = this.FONT_WEIGHT + ' ' + fontSize + 'px ' + this.FONT_FAMILY;
      oc.font = font;
      oc.letterSpacing = this.LETTER_SPACING;
      oc.fillStyle = '#fff';
      oc.textAlign = 'left';
      oc.textBaseline = 'middle';

      var lines = this.TEXT.split('\n');
      var lineHeight = fontSize * this.LINE_HEIGHT;
      var totalHeight = lines.length * lineHeight;
      var xPos = w < 768 ? 8 : this.TEXT_X_PAD;
      var yCenter = h * (w < 768 ? 0.82 : this.TEXT_Y_PCT);
      var startY = yCenter - totalHeight / 2 + lineHeight / 2;

      for (var l = 0; l < lines.length; l++) {
        oc.fillText(lines[l], xPos, startY + l * lineHeight);
      }

      var imgData = oc.getImageData(0, 0, w, h).data;

      for (var r = 0; r < this._rows; r++) {
        for (var c = 0; c < this._cols; c++) {
          var px = Math.floor(c * STEP + this.SQ / 2);
          var py = Math.floor(r * STEP + this.SQ / 2);
          if (px < w && py < h) {
            var idx = (py * w + px) * 4;
            this._textMask[r * this._cols + c] = imgData[idx] > 128 ? 1 : 0;
          }
        }
      }

      for (var i = 0; i < this._grid.length; i++) {
        if (this._textMask[i]) {
          this._grid[i] = Math.random() * (this.BASE_ALPHA * this.MASK_BOOST) + this.MASK_FLOOR;
        }
      }
    },

    _draw: function () {
      var wrap = this._wrap;
      if (!wrap || !this._ctx) return;
      var STEP = this.SQ + this.GAP;
      var w = wrap.clientWidth;
      var h = wrap.clientHeight;
      this._ctx.clearRect(0, 0, w, h);

      for (var r = 0; r < this._rows; r++) {
        for (var c = 0; c < this._cols; c++) {
          var i = r * this._cols + c;
          var alpha = this._grid[i];
          if (alpha < 0.01) continue;
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

        if (Math.random() < flickerRate * deltaTime) {
          if (this._textMask && this._textMask[i]) {
            var maskCeiling = this.BASE_ALPHA * this.MASK_BOOST + (this.HOVER_ALPHA - this.BASE_ALPHA) * t;
            this._grid[i] = Math.random() * maskCeiling + this.MASK_FLOOR;
          } else {
            var alphaCeiling = this.BASE_ALPHA + (this.HOVER_ALPHA - this.BASE_ALPHA) * t;
            this._grid[i] = Math.random() * alphaCeiling;
          }
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
  ah.footerCanvas.init();

})();
