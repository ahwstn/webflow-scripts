/**
 * sgmCss.js — CSS Injection for SGM Homepage
 * @version 2.0.0
 * @cdn https://cdn.ahwstn.com/sgm/sgmCss.min.js
 *
 * Injects CSS that Webflow Designer cannot set (Rule 6 allowed):
 *   - @keyframes (grain, marquee)
 *   - clip-path initial states
 *   - will-change on animated elements
 *   - filter: brightness/grayscale
 *   - Custom cursor styles
 *   - ::before/::after pseudo-elements
 *   - @media (prefers-reduced-motion)
 *   - Custom properties (easings, teal gradient)
 *   - Complex selectors (.is-active, .is-visible)
 *
 * Loads in <head> to prevent FOUC.
 *
 * v2.0.0: Full rewrite from prototype — homepage animations, cursor, grain.
 * v1.0.0: Initial build — nav overlay + transition CSS only.
 */
(function () {
  'use strict';

  var css = [

    // -----------------------------------------
    // CUSTOM PROPERTIES
    // -----------------------------------------

    ':root {',
    '  --sgm-ease: cubic-bezier(0.625, 0.05, 0, 1);',
    '  --ease-quart-out: cubic-bezier(0.25, 1, 0.5, 1);',
    '  --sgm-teal: #2A6B6B;',
    '  --sgm-teal-dark: #1A3F3F;',
    '}',


    // -----------------------------------------
    // GLOBAL
    // -----------------------------------------

    'html, body, a, button, .w-inline-block, .w-button, [class*="header_"], [class*="footer_"], [class*="poster_"], [class*="nav-overlay_"] { cursor: none !important; }',

    /* Hide scrollbar — Lenis handles scroll */
    'html { scrollbar-width: none; }',
    'html::-webkit-scrollbar { display: none; }',


    // -----------------------------------------
    // GRAIN OVERLAY (fully injected)
    // -----------------------------------------

    '.sgm-grain {',
    '  position: fixed;',
    '  top: -50%;',
    '  left: -50%;',
    '  width: 200%;',
    '  height: 200%;',
    '  z-index: 9998;',
    '  pointer-events: none;',
    '  opacity: 0.018;',
    "  background-image: url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='6' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\");",
    '  animation: grain-shift 1.2s steps(4) infinite;',
    '}',

    '@keyframes grain-shift {',
    '  0% { transform: translate(0,0) scale(1); }',
    '  25% { transform: translate(-3%,-4%) scale(1.02); }',
    '  50% { transform: translate(4%,1%) scale(0.98); }',
    '  75% { transform: translate(-2%,3%) scale(1.01); }',
    '  100% { transform: translate(0,0) scale(1); }',
    '}',


    // -----------------------------------------
    // CUSTOM CURSOR
    // -----------------------------------------

    '.cursor-dot, .cursor-ring {',
    '  position: fixed;',
    '  top: 0;',
    '  left: 0;',
    '  z-index: 9999;',
    '  pointer-events: none;',
    '  border-radius: 50%;',
    '}',

    '.cursor-dot {',
    '  width: 4px;',
    '  height: 4px;',
    '  background: #FFFFFF;',
    '  transform: translate(-50%,-50%);',
    '  z-index: 10000;',
    '  transition: width 0.25s var(--ease-quart-out), height 0.25s var(--ease-quart-out), background 0.25s var(--ease-quart-out), border-radius 0.25s var(--ease-quart-out), opacity 0.2s ease;',
    '}',

    /* Ring hover: clockwise sweep fill */
    '@property --ring-sweep {',
    '  syntax: "<angle>";',
    '  initial-value: 0deg;',
    '  inherits: false;',
    '}',

    '.cursor-ring {',
    '  width: 28px;',
    '  height: 28px;',
    '  border: 1px dotted rgba(255,255,255,0.4);',
    '  background: transparent;',
    '  transform: translate(-50%,-50%);',
    '  --ring-sweep: 0deg;',
    '  transition: width 0.3s var(--ease-quart-out), height 0.3s var(--ease-quart-out), border-color 0.3s var(--ease-quart-out), --ring-sweep 0.35s ease, opacity 0.2s ease;',
    '}',

    '.cursor-ring.is-hovering {',
    '  width: 36px;',
    '  height: 36px;',
    '  border-color: transparent;',
    '  background: conic-gradient(rgba(255,255,255,0.8) var(--ring-sweep), transparent var(--ring-sweep));',
    '  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1.5px));',
    '  mask: radial-gradient(farthest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1.5px));',
    '  --ring-sweep: 360deg;',
    '}',
    '.cursor-ring.is-video { width: 56px; height: 56px; border-color: rgba(255,255,255,0.8); }',
    '.cursor-dot.is-video { width: 20px; height: 20px; background: transparent; border-radius: 0; }',
    '.cursor-ring.is-view { width: 72px; height: 72px; border-color: #FFFFFF; }',
    '.cursor-dot.is-view { width: auto; height: auto; background: transparent; border-radius: 0; }',
    '.cursor-dot.is-arrow-left, .cursor-dot.is-arrow-right { width: 20px; height: 20px; background: transparent; border-radius: 0; }',
    '.cursor-ring.is-arrow-left, .cursor-ring.is-arrow-right { width: 48px; height: 48px; border-color: rgba(255,255,255,0.4); }',

    '.cursor__icon {',
    '  position: absolute;',
    '  top: 50%;',
    '  left: 50%;',
    '  transform: translate(-50%,-50%);',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  opacity: 0;',
    '  transition: opacity 0.2s ease;',
    '}',

    '.cursor-dot.is-video .cursor__icon,',
    '.cursor-dot.is-view .cursor__icon,',
    '.cursor-dot.is-arrow-left .cursor__icon,',
    '.cursor-dot.is-arrow-right .cursor__icon { opacity: 1; }',

    '.cursor__play {',
    '  width: 0; height: 0;',
    '  border-style: solid;',
    '  border-width: 6px 0 6px 10px;',
    '  border-color: transparent transparent transparent #FFFFFF;',
    '  margin-left: 2px;',
    '  display: none;',
    '}',

    '.cursor__pause { display: none; gap: 2px; }',
    '.cursor__pause span { width: 2.5px; height: 12px; background: #FFFFFF; border-radius: 0.5px; }',

    '.cursor__label {',
    '  font-size: 9px; font-weight: 600; letter-spacing: 0.1em;',
    '  text-transform: uppercase; color: #FFFFFF; white-space: nowrap; display: none;',
    '}',

    '.cursor-dot.is-video.is-paused .cursor__play { display: block; }',
    '.cursor-dot.is-video.is-playing .cursor__pause { display: flex; }',
    '.cursor-dot.is-view .cursor__label { display: block; }',
    '.cursor-dot.is-arrow-left .cursor__arrow-left { display: block; }',
    '.cursor-dot.is-arrow-right .cursor__arrow-right { display: block; }',
    '.cursor__arrow-left, .cursor__arrow-right { display: none; font-family: "Inter", sans-serif; font-size: 16px; color: #FFFFFF; }',


    // -----------------------------------------
    // TRANSITION LAYER
    // -----------------------------------------

    '[data-transition-wrap] {',
    '  position: fixed;',
    '  top: 0;',
    '  left: 0;',
    '  right: 0;',
    '  bottom: 0;',
    '  z-index: 100;',
    '  pointer-events: none;',
    '  overflow-x: clip;',
    '  overflow-y: clip;',
    '}',

    '[data-transition-panel] {',
    '  width: 100%;',
    '  height: 100%;',
    '  position: absolute;',
    '  top: 100%;',
    '  left: 0;',
    '  display: flex;',
    '  justify-content: center;',
    '  align-items: center;',
    '  visibility: hidden;',
    '}',

    '[data-transition-label] {',
    '  visibility: hidden;',
    '}',


    // -----------------------------------------
    // HERO CAROUSEL
    // -----------------------------------------

    /* Slide crossfade via CSS transition */
    '.hero_slide {',
    '  transition: opacity 0.8s var(--ease-quart-out);',
    '}',

    '.hero_slide.is-active {',
    '  opacity: 1;',
    '}',

    /* Video/image filters (Rule 6: filter not available in Designer) */
    '.hero_slide-video {',
    '  filter: brightness(0.4) grayscale(0.3);',
    '}',

    /* Timeline active state */
    '.hero_timeline-num.is-active {',
    '  color: #FFFFFF;',
    '}',

    /* Hide text on non-active slides to prevent overlap during crossfade */
    '.hero_slide:not(.is-active) .hero_title-text,',
    '.hero_slide:not(.is-active) .hero_subtitle {',
    '  visibility: hidden;',
    '}',


    // -----------------------------------------
    // POSTER SECTIONS
    // -----------------------------------------

    /* Background image filters */
    '.poster_bg-img {',
    '  filter: brightness(0.35) grayscale(0.5);',
    '}',

    /* Label line transform origin */
    '.poster_label-line {',
    '  transform: scaleX(0);',
    '  transform-origin: center;',
    '}',


    // -----------------------------------------
    // NAV OVERLAY
    // -----------------------------------------

    '.nav-overlay_component {',
    '  clip-path: inset(0% 0% 0% 100%);',
    '}',

    '.nav-overlay_panel {',
    '  clip-path: inset(0% 0% 0% 100%);',
    '}',

    '.nav-overlay_scrim.is-visible {',
    '  display: block;',
    '  opacity: 0.6;',
    '  pointer-events: auto;',
    '}',

    /* Nav link — highlight sweep on parent, text inverts via blend */
    '.nav-overlay_link {',
    '  position: relative;',
    '  width: fit-content;',
    '}',

    '.nav-overlay_link::before {',
    '  content: "";',
    '  position: absolute;',
    '  top: 0;',
    '  left: -0.15em;',
    '  right: -0.15em;',
    '  bottom: 0;',
    '  background: #FFFFFF;',
    '  transform: scaleX(0);',
    '  transform-origin: left;',
    '  transition: transform 0.4s var(--ease-quart-out);',
    '}',

    '.nav-overlay_link:hover::before {',
    '  transform: scaleX(1);',
    '}',

    '.nav-overlay_link-heading,',
    '.nav-overlay_link-num {',
    '  position: relative;',
    '  z-index: 1;',
    '  mix-blend-mode: difference;',
    '  color: #FFFFFF !important;',
    '  padding-left: 0.15em;',
    '  padding-right: 0.15em;',
    '}',

    /* Ensure menu content sits above panels and scrim */
    '[data-sidenav-menu] {',
    '  z-index: 10 !important;',
    '}',


    // -----------------------------------------
    // SHOWREEL
    // -----------------------------------------

    '.showreel_wrap {',
    '  clip-path: inset(0% 50% 0% 50%);',
    '  background: radial-gradient(ellipse at center, var(--sgm-teal-dark) 0%, #111111 70%);',
    '}',


    // -----------------------------------------
    // MARQUEE
    // -----------------------------------------

    '.marquee_component {',
    '  width: max-content;',
    '}',

    '.marquee_inner {',
    '  animation: marquee-scroll 25s linear infinite;',
    '}',

    '@keyframes marquee-scroll {',
    '  0% { transform: translateX(0); }',
    '  100% { transform: translateX(-50%); }',
    '}',


    // -----------------------------------------
    // BUTTON HOVER — CLIP-PATH FILL
    // -----------------------------------------

    '.poster_btn {',
    '  position: relative;',
    '  transition: color 0.3s var(--ease-quart-out);',
    '}',

    '.poster_btn::before {',
    '  content: "";',
    '  position: absolute;',
    '  top: 0;',
    '  left: 0;',
    '  right: 0;',
    '  bottom: 0;',
    '  z-index: -1;',
    '  background-color: rgba(255,255,255,0.8);',
    '  clip-path: inset(30% 50%);',
    '  transition: clip-path 0.3s var(--ease-quart-out);',
    '}',

    '.poster_btn:hover::before {',
    '  clip-path: inset(0%);',
    '}',

    '.poster_btn:hover {',
    '  color: #111111;',
    '}',


    // -----------------------------------------
    // TEXT REVEAL HELPER
    // -----------------------------------------

    '.reveal-inner {',
    '  display: block;',
    '}',


    // -----------------------------------------
    // RESPONSIVE
    // -----------------------------------------

    '@media (max-width: 768px) {',
    '  .cursor-dot, .cursor-ring { display: none; }',
    '  html, body, a, button { cursor: auto; }',
    '}',


    // -----------------------------------------
    // REDUCED MOTION
    // -----------------------------------------

    '@media (prefers-reduced-motion: reduce) {',
    '  .hero_slide,',
    '  .nav-overlay_component,',
    '  .nav-overlay_panel,',
    '  .nav-overlay_link-heading,',
    '  .poster_btn,',
    '  .poster_btn::before,',
    '  .cursor-dot,',
    '  .cursor-ring,',
    '  .sgm-grain,',
    '  .marquee_inner,',
    '  [data-transition-panel] {',
    '    transition: none !important;',
    '    animation: none !important;',
    '  }',
    '}'

  ].join('\n');

  var style = document.createElement('style');
  style.id = 'sgm-css';
  style.textContent = css;
  document.head.appendChild(style);

  // Inject grain into body once it exists (cursor handled by sgmCore.js)
  document.addEventListener('DOMContentLoaded', function () {
    var grain = document.createElement('div');
    grain.className = 'sgm-grain';
    document.body.appendChild(grain);
  });

})();
