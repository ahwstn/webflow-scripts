/**
 * ah-footer.js — Canvas CTA Footer + Hover Spotlight
 * @version 2.1.0
 * @cdn https://cdn.jsdelivr.net/gh/ahwstn/webflow-scripts@main/ahwstn/ah-footer.min.js
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
 * v1.0.0: Initial build — standalone (no AMH.register dependency).
 * v2.0.0: Hover spotlight — lerped cursor tracking, boosted flicker ceiling + rate.
 * v2.1.0: Theme-aware — reads dot/text colour from window.ahTheme, listens for themechange.
 */
(function () {
  'use strict';

  var wrap = document.querySelector('.footer_canvas-wrap');
  if (!wrap || wrap.querySelector('canvas')) return;

  /* --- Configuration --- */
  var SQ = 3;            /* square size px */
  var GAP = 5;           /* gap between squares px */
  var STEP = SQ + GAP;
  var FLICKER = 0.3;     /* base flicker rate (multiplied by deltaTime) */
  var BASE_ALPHA = 0.1;
  var MASK_BOOST = 2;
  var MASK_FLOOR = 0.15;
  var TEXT = "Let's\nconnect";
  var FONT = '700 224px "Space Grotesk"';
  var LETTER_SPACING = '-0.05em';
  var LINE_HEIGHT = 0.6;
  var TEXT_X_PAD = 38;   /* left padding to align with footer bar */
  var TEXT_Y_PCT = 0.78; /* vertical position as fraction */
  var tc = window.ahTheme ? window.ahTheme.colors[window.ahTheme.current] : null;
  var COLOR_R = tc ? tc.dotR : 242;
  var COLOR_G = tc ? tc.dotG : 242;
  var COLOR_B = tc ? tc.dotB : 242;
  var TEXT_COLOR = tc ? tc.text : '#fff';

  /* Hover spotlight */
  var HOVER_RADIUS = 500;     /* px — spotlight radius */
  var HOVER_ALPHA = 0.25;     /* peak alpha boost at cursor centre */
  var HOVER_FALLOFF = 3;      /* spotlight edge curve (higher = tighter) */
  var LERP_SPEED = 0.05;      /* cursor tracking smoothness (lower = more lag) */
  var HOVER_FLICKER_MULT = 4; /* flicker rate multiplier inside spotlight */

  /* --- Canvas setup --- */
  var canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;inset:0;pointer-events:none';
  var ctx = canvas.getContext('2d');
  wrap.appendChild(canvas);

  var cols, rows, grid, textMask, spotMap;
  var animId = null;
  var lastTime = 0;
  var isVisible = false;
  var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Mouse state */
  var mouseX = -9999, mouseY = -9999;
  var isHovered = false;
  var smoothX = -9999, smoothY = -9999;

  wrap.addEventListener('mouseenter', function () { isHovered = true; });
  wrap.addEventListener('mouseleave', function () { isHovered = false; });
  wrap.addEventListener('mousemove', function (e) {
    var rect = wrap.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  function resize() {
    var w = wrap.clientWidth;
    var h = wrap.clientHeight;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cols = Math.ceil(w / STEP);
    rows = Math.ceil(h / STEP);

    /* Initialise opacity grid */
    grid = new Float32Array(cols * rows);
    for (var i = 0; i < grid.length; i++) {
      grid[i] = Math.random() * BASE_ALPHA;
    }

    spotMap = new Float32Array(cols * rows);

    buildTextMask(w, h);
    draw();
  }

  function buildTextMask(w, h) {
    textMask = new Uint8Array(cols * rows);

    /* Offscreen canvas to render text */
    var off = document.createElement('canvas');
    off.width = w;
    off.height = h;
    var oc = off.getContext('2d');

    oc.fillStyle = '#000';
    oc.fillRect(0, 0, w, h);
    oc.font = FONT;
    oc.letterSpacing = LETTER_SPACING;
    oc.fillStyle = '#fff'; /* always white — mask detection only, not display colour */
    oc.textAlign = 'left';
    oc.textBaseline = 'middle';

    /* Multiline text: split on \n, draw each line */
    var lines = TEXT.split('\n');
    var fontSize = 224;
    var lineHeight = fontSize * LINE_HEIGHT;
    var totalHeight = lines.length * lineHeight;
    var xPos = TEXT_X_PAD;
    var yCenter = h * TEXT_Y_PCT;
    var startY = yCenter - totalHeight / 2 + lineHeight / 2;

    for (var l = 0; l < lines.length; l++) {
      oc.fillText(lines[l], xPos, startY + l * lineHeight);
    }

    var imgData = oc.getImageData(0, 0, w, h).data;

    /* Sample pixel at centre of each grid cell */
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var px = Math.floor(c * STEP + SQ / 2);
        var py = Math.floor(r * STEP + SQ / 2);
        if (px < w && py < h) {
          var idx = (py * w + px) * 4;
          textMask[r * cols + c] = imgData[idx] > 128 ? 1 : 0;
        }
      }
    }

    /* Boost opacity for text-masked squares */
    for (var i = 0; i < grid.length; i++) {
      if (textMask[i]) {
        grid[i] = Math.random() * (BASE_ALPHA * MASK_BOOST) + MASK_FLOOR;
      }
    }
  }

  function draw() {
    var w = wrap.clientWidth;
    var h = wrap.clientHeight;
    ctx.clearRect(0, 0, w, h);

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var i = r * cols + c;
        var alpha = grid[i];
        if (alpha < 0.01) continue;
        ctx.fillStyle = 'rgba(' + COLOR_R + ',' + COLOR_G + ',' + COLOR_B + ',' + alpha.toFixed(3) + ')';
        ctx.fillRect(c * STEP, r * STEP, SQ, SQ);
      }
    }
  }

  function updateSpotMap() {
    var active = smoothX > -999;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var i = r * cols + c;
        if (!active) { spotMap[i] = 0; continue; }
        var px = c * STEP + SQ / 2;
        var py = r * STEP + SQ / 2;
        var dx = px - smoothX;
        var dy = py - smoothY;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist >= HOVER_RADIUS) { spotMap[i] = 0; continue; }
        spotMap[i] = 1 - Math.pow(dist / HOVER_RADIUS, HOVER_FALLOFF);
      }
    }
  }

  function animate(timestamp) {
    if (!isVisible) return;

    /* Time-based flicker — frame-rate independent */
    if (!lastTime) lastTime = timestamp;
    var deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    if (deltaTime > 0.1) deltaTime = 0.1;

    /* Lerp smoothed mouse towards actual mouse */
    if (isHovered) {
      if (smoothX < -999) { smoothX = mouseX; smoothY = mouseY; }
      smoothX += (mouseX - smoothX) * LERP_SPEED;
      smoothY += (mouseY - smoothY) * LERP_SPEED;
    } else {
      smoothX += (-9999 - smoothX) * 0.02;
      smoothY += (-9999 - smoothY) * 0.02;
    }

    /* Update spotlight intensity map */
    updateSpotMap();

    /* Flicker: spotlight boosts ceiling + rate, stacking with text mask */
    for (var i = 0; i < grid.length; i++) {
      var t = spotMap[i];
      var flickerRate = FLICKER + (FLICKER * (HOVER_FLICKER_MULT - 1)) * t;

      if (Math.random() < flickerRate * deltaTime) {
        if (textMask && textMask[i]) {
          /* Text-masked: higher base + spotlight boost on top */
          var maskCeiling = BASE_ALPHA * MASK_BOOST + (HOVER_ALPHA - BASE_ALPHA) * t;
          grid[i] = Math.random() * maskCeiling + MASK_FLOOR;
        } else {
          /* Background: same as hero spotlight */
          var alphaCeiling = BASE_ALPHA + (HOVER_ALPHA - BASE_ALPHA) * t;
          grid[i] = Math.random() * alphaCeiling;
        }
      }
    }

    draw();
    animId = requestAnimationFrame(animate);
  }

  function start() {
    if (animId) return;
    isVisible = true;
    lastTime = 0;
    requestAnimationFrame(animate);
  }

  function stop() {
    isVisible = false;
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }

  /* Load Space Grotesk 700 for canvas rendering.
     Must use document.fonts.load() — not document.fonts.ready —
     because canvas-only fonts aren't triggered by DOM references (DEC-026). */
  var fontLink = document.querySelector('link[href*="Space+Grotesk"]');
  if (!fontLink) {
    fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=swap';
    document.head.appendChild(fontLink);
  }

  document.fonts.load(FONT).then(function () {
    resize();

    if (rm) {
      /* Reduced motion: static grid, no animation */
      draw();
      return;
    }

    /* IntersectionObserver: pause when off-screen */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          start();
        } else {
          stop();
        }
      });
    }, { threshold: 0 });
    io.observe(wrap);

    /* ResizeObserver: re-draw on viewport resize */
    var ro = new ResizeObserver(function () {
      stop();
      resize();
      if (isVisible) start();
    });
    ro.observe(wrap);

    /* Theme change: update dot + text colours, rebuild mask */
    document.documentElement.addEventListener('themechange', function () {
      var c = window.ahTheme.colors[window.ahTheme.current];
      COLOR_R = c.dotR; COLOR_G = c.dotG; COLOR_B = c.dotB;
      TEXT_COLOR = c.text;
      resize(); /* rebuilds text mask with new TEXT_COLOR */
    });
  });

})();
