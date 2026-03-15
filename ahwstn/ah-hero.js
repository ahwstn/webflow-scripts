/**
 * ah-hero.js — Ambient Dot-Grid Hero Background + Hover Spotlight
 * @version 2.1.0
 * @cdn https://cdn.jsdelivr.net/gh/ahwstn/webflow-scripts@main/ahwstn/ah-hero.min.js
 *
 * Flickering dot-grid canvas behind hero text. Cursor-following spotlight
 * raises the flicker ceiling and rate in a wide radius around the mouse,
 * with lerped tracking for an organic, trailing feel.
 *
 * Static-first: hero content is fully readable without JS. Canvas is
 * purely decorative (aria-hidden).
 *
 * v1.0.0: Initial build — radial vignette, IO pause, RO resize, reduced-motion.
 * v2.0.0: Hover spotlight — lerped cursor tracking, boosted flicker ceiling + rate.
 * v2.1.0: Theme-aware — reads dot colour from window.ahTheme, listens for themechange.
 */
(function () {
  'use strict';

  var hero = document.querySelector('.section_home-hero');
  if (!hero || hero.querySelector('canvas')) return;

  /* --- Configuration --- */
  var SQ = 3;            /* square size px */
  var GAP = 5;           /* gap between squares px */
  var STEP = SQ + GAP;
  var FLICKER = 0.3;     /* base flicker rate (multiplied by deltaTime) */
  var BASE_ALPHA = 0.1;
  var tc = window.ahTheme ? window.ahTheme.colors[window.ahTheme.current] : null;
  var COLOR_R = tc ? tc.dotR : 242;
  var COLOR_G = tc ? tc.dotG : 242;
  var COLOR_B = tc ? tc.dotB : 242;

  /* Hover spotlight */
  var HOVER_RADIUS = 500;     /* px — spotlight radius */
  var HOVER_ALPHA = 0.25;     /* peak alpha at cursor centre */
  var HOVER_FALLOFF = 3;      /* spotlight edge curve (higher = tighter) */
  var LERP_SPEED = 0.05;      /* cursor tracking smoothness (lower = more lag) */
  var HOVER_FLICKER_MULT = 4; /* flicker rate multiplier inside spotlight */

  /* --- Canvas setup --- */
  var canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:0';
  var ctx = canvas.getContext('2d');

  /* Insert canvas as first child so hero content sits on top */
  hero.style.position = 'relative';
  hero.insertBefore(canvas, hero.firstChild);

  var cols, rows, grid, spotMap;
  var animId = null;
  var lastTime = 0;
  var isVisible = false;
  var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Mouse state */
  var mouseX = -9999, mouseY = -9999;
  var isHovered = false;
  var smoothX = -9999, smoothY = -9999;

  hero.addEventListener('mouseenter', function () { isHovered = true; });
  hero.addEventListener('mouseleave', function () { isHovered = false; });
  hero.addEventListener('mousemove', function (e) {
    var rect = hero.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  function resize() {
    var w = hero.clientWidth;
    var h = hero.clientHeight;
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

    draw();
  }

  function draw() {
    var w = hero.clientWidth;
    var h = hero.clientHeight;
    ctx.clearRect(0, 0, w, h);

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var i = r * cols + c;
        var alpha = grid[i];
        if (alpha < 0.005) continue;
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
      /* Fade out: drift smooth position off-screen gradually */
      smoothX += (-9999 - smoothX) * 0.02;
      smoothY += (-9999 - smoothY) * 0.02;
    }

    /* Update spotlight intensity map */
    updateSpotMap();

    /* Flicker: dots inside spotlight get boosted ceiling + faster rate */
    for (var i = 0; i < grid.length; i++) {
      var t = spotMap[i];
      var flickerRate = FLICKER + (FLICKER * (HOVER_FLICKER_MULT - 1)) * t;
      var alphaCeiling = BASE_ALPHA + (HOVER_ALPHA - BASE_ALPHA) * t;

      if (Math.random() < flickerRate * deltaTime) {
        grid[i] = Math.random() * alphaCeiling;
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

  /* --- Init --- */
  resize();

  if (rm) {
    draw();
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        start();
      } else {
        stop();
      }
    });
  }, { threshold: 0 });
  io.observe(hero);

  var ro = new ResizeObserver(function () {
    stop();
    resize();
    if (isVisible) start();
  });
  ro.observe(hero);

  /* Theme change: update dot colours */
  document.documentElement.addEventListener('themechange', function () {
    var c = window.ahTheme.colors[window.ahTheme.current];
    COLOR_R = c.dotR; COLOR_G = c.dotG; COLOR_B = c.dotB;
    draw();
  });

})();
