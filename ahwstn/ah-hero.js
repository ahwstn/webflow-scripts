/**
 * ah-hero.js — Ambient Dot-Grid Hero Background
 * @version 1.0.0
 * @cdn https://cdn.jsdelivr.net/gh/ahwstn/webflow-scripts@main/ahwstn/ah-hero.min.js
 *
 * Flickering dot-grid canvas behind hero text. Same visual DNA as the
 * footer (ah-footer.js) but without the text mask — just ambient texture
 * with a subtle radial falloff (brighter centre, fading edges).
 *
 * Static-first: hero content is fully readable without JS. Canvas is
 * purely decorative (aria-hidden).
 *
 * v1.0.0: Initial build — radial vignette, IO pause, RO resize, reduced-motion.
 */
(function () {
  'use strict';

  var hero = document.querySelector('.section_home-hero');
  if (!hero || hero.querySelector('canvas')) return;

  /* --- Configuration --- */
  var SQ = 3;            /* square size px */
  var GAP = 5;           /* gap between squares px */
  var STEP = SQ + GAP;
  var FLICKER = 0.3;     /* flicker rate (multiplied by deltaTime) */
  var BASE_ALPHA = 0.06;
  var VIGNETTE_POWER = 2.2;  /* radial falloff curve — higher = tighter spotlight */
  var VIGNETTE_FLOOR = 0.15; /* minimum alpha multiplier at edges (0 = fully dark) */
  var COLOR_R = 242, COLOR_G = 242, COLOR_B = 242; /* Off-White #F2F2F2 */

  /* --- Canvas setup --- */
  var canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:0';
  var ctx = canvas.getContext('2d');

  /* Insert canvas as first child so hero content sits on top */
  hero.style.position = 'relative';
  hero.insertBefore(canvas, hero.firstChild);

  var cols, rows, grid, vignette;
  var animId = null;
  var lastTime = 0;
  var isVisible = false;
  var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    /* Build radial vignette map — multiplier per cell based on distance from centre */
    vignette = new Float32Array(cols * rows);
    var cx = w / 2;
    var cy = h / 2;
    var maxDist = Math.sqrt(cx * cx + cy * cy);

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var px = c * STEP + SQ / 2;
        var py = r * STEP + SQ / 2;
        var dx = px - cx;
        var dy = py - cy;
        var dist = Math.sqrt(dx * dx + dy * dy) / maxDist; /* 0 at centre, 1 at corners */
        /* Smooth falloff: 1.0 at centre → VIGNETTE_FLOOR at edges */
        var falloff = 1 - Math.pow(dist, VIGNETTE_POWER) * (1 - VIGNETTE_FLOOR);
        vignette[r * cols + c] = Math.max(falloff, VIGNETTE_FLOOR);
      }
    }

    /* Initialise opacity grid with vignette applied */
    grid = new Float32Array(cols * rows);
    for (var i = 0; i < grid.length; i++) {
      grid[i] = Math.random() * BASE_ALPHA * vignette[i];
    }

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

  function animate(timestamp) {
    if (!isVisible) return;

    if (!lastTime) lastTime = timestamp;
    var deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    if (deltaTime > 0.1) deltaTime = 0.1;

    for (var i = 0; i < grid.length; i++) {
      if (Math.random() < FLICKER * deltaTime) {
        grid[i] = Math.random() * BASE_ALPHA * vignette[i];
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

})();
