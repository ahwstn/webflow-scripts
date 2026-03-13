/**
 * ahCss.js — CSS Injection (Header)
 * @version 1.0.0
 * @cdn https://cdn.jsdelivr.net/gh/ahwstn/webflow-scripts@main/ahwstn/ahCss.min.js
 *
 * JS-injected <style> for things the Webflow Designer genuinely cannot do:
 * - Custom properties (easing vars)
 * - ::before / ::after pseudo-elements
 * - @keyframes
 * - @media (prefers-reduced-motion)
 * - clamp() values
 * - Complex selectors
 *
 * Rule 6 compliant — every rule here is on the allowed list.
 * Static-first: all content readable without this script.
 *
 * v1.0.0: Easing vars, nav slash hover, button fills, card hovers,
 *         view-timeline entrances, FOUC prevention, reduced-motion.
 */
(function () {
  'use strict';

  var s = document.createElement('style');
  s.textContent = ''

  /* === Easing custom properties === */
  + ':root{'
  +   '--expo-out:cubic-bezier(.22,1,.36,1);'
  +   '--spring-smooth:linear(0,0.002,0.008,0.018,0.032,0.05,0.071,0.096,0.124,0.154,0.187,0.222,0.259,0.297,0.337,0.378,0.42,0.462,0.504,0.546,0.587,0.628,0.667,0.705,0.741,0.775,0.808,0.838,0.866,0.891,0.914,0.934,0.952,0.967,0.98,0.99,0.998,1.003,1.006,1.007,1.006,1.004,1.001,0.998,0.996,0.995,0.994,0.994,0.995,0.997,0.998,1);'
  +   '--spring-active:linear(0,0.004,0.016,0.035,0.063,0.098,0.141,0.19,0.245,0.305,0.37,0.438,0.509,0.581,0.654,0.726,0.796,0.863,0.926,0.985,1.038,1.085,1.126,1.159,1.185,1.204,1.216,1.221,1.22,1.213,1.201,1.185,1.166,1.145,1.122,1.099,1.076,1.054,1.033,1.014,0.998,0.984,0.974,0.966,0.961,0.959,0.96,0.963,0.967,0.973,0.979,0.986,0.993,0.999,1.004,1.008,1.01,1.011,1.01,1.008,1.006,1.003,1)'
  + '}'
  /* Fallback for browsers without linear() support */
  + '@supports not (transition-timing-function:linear(0,1)){'
  +   ':root{--spring-smooth:cubic-bezier(.4,0,.2,1);--spring-active:cubic-bezier(.175,.885,.32,1.275)}'
  + '}'

  /* === Page-wrapper overflow-x:clip (prevents horizontal scroll, keeps sticky working) === */
  + '.page-wrapper{overflow-x:clip!important;overflow-y:visible!important}'

  /* === FOUC prevention — hero elements hidden until GSAP reveals them === */
  + '.home-hero_heading,.home-hero_subline{opacity:0}'

  /* === Nav link forward slash ::before (terminal motif) === */
  + '.nav_link{position:relative}'
  + '.nav_link::before{'
  +   'content:"/";'
  +   'display:inline-block;'
  +   'width:0;'
  +   'overflow:hidden;'
  +   'opacity:0;'
  +   'color:#E85D04;'
  +   'font-weight:600;'
  +   'vertical-align:text-bottom;'
  +   'transition:width .3s var(--expo-out),opacity .2s var(--expo-out)'
  + '}'
  + '.nav_link:hover::before,'
  + '.nav_link.is-active::before{'
  +   'width:.65em;'
  +   'opacity:1'
  + '}'
  /* Active link text colour */
  + '.nav_link.is-active{color:#F2F2F2}'

  /* === Nav overlay links — forward slash for active overlay link too === */
  + '.nav_overlay-link{position:relative}'
  + '.nav_overlay-link::before{'
  +   'content:"/";'
  +   'display:inline-block;'
  +   'width:0;'
  +   'overflow:hidden;'
  +   'opacity:0;'
  +   'color:#E85D04;'
  +   'font-weight:600;'
  +   'vertical-align:text-bottom;'
  +   'transition:width .3s var(--expo-out),opacity .2s var(--expo-out)'
  + '}'
  + '.nav_overlay-link:hover::before,'
  + '.nav_overlay-link.is-active::before{'
  +   'width:.65em;'
  +   'opacity:1'
  + '}'

  /* === Button hover — is-primary diagonal fill ::before === */
  + '.button.is-primary{position:relative;z-index:1;overflow:hidden}'
  + '.button.is-primary::before{'
  +   'content:"";'
  +   'position:absolute;'
  +   'top:0;left:0;'
  +   'width:100%;height:100%;'
  +   'background:#F07020;'
  +   'z-index:-1;'
  +   'transform:translateX(-101%);'
  +   'transition:transform .4s var(--expo-out)'
  + '}'
  + '.button.is-primary:hover::before{transform:translateX(0)}'

  /* === Button hover — is-ghost underline slide-in ::after === */
  + '.button.is-ghost{position:relative}'
  + '.button.is-ghost::after{'
  +   'content:"";'
  +   'position:absolute;'
  +   'bottom:0;left:0;'
  +   'width:0;height:2px;'
  +   'background:#E85D04;'
  +   'transition:width .3s var(--expo-out)'
  + '}'
  + '.button.is-ghost:hover::after{width:100%}'

  /* === Frosted glass card hover effects === */
  + '.card_wrapper{'
  +   'transition:border-color .4s var(--expo-out),box-shadow .4s var(--expo-out),transform .5s var(--spring-smooth)'
  + '}'
  + '.card_wrapper:hover{'
  +   'border-color:rgba(232,93,4,.3);'
  +   'box-shadow:0 8px 32px rgba(0,0,0,.4);'
  +   'transform:translateY(-4px)'
  + '}'

  /* === View-timeline section entrance reveals === */
  + '@keyframes ahReveal{'
  +   'from{opacity:0;transform:translateY(20px)}'
  +   'to{opacity:1;transform:translateY(0)}'
  + '}'
  + '[data-ah-reveal]{'
  +   'opacity:0;'
  +   'animation:ahReveal .6s var(--expo-out) forwards;'
  +   'animation-timeline:view();'
  +   'animation-range:entry 10% entry 40%'
  + '}'
  /* Stagger children with nth-child delays */
  + '[data-ah-reveal="stagger"] > :nth-child(1){animation-delay:0s}'
  + '[data-ah-reveal="stagger"] > :nth-child(2){animation-delay:.1s}'
  + '[data-ah-reveal="stagger"] > :nth-child(3){animation-delay:.2s}'
  + '[data-ah-reveal="stagger"] > :nth-child(4){animation-delay:.3s}'
  + '[data-ah-reveal="stagger"] > :nth-child(5){animation-delay:.4s}'

  /* === Bridge text gradient sweep === */
  + '.bridge_tag{'
  +   'background:linear-gradient(90deg,#F2F2F2 0%,#E85D04 50%,#F2F2F2 100%);'
  +   'background-size:200% 100%;'
  +   '-webkit-background-clip:text;'
  +   'background-clip:text;'
  +   '-webkit-text-fill-color:transparent;'
  +   'animation:ahGradientSweep 8s ease infinite'
  + '}'
  + '@keyframes ahGradientSweep{'
  +   '0%{background-position:200% 50%}'
  +   '100%{background-position:-200% 50%}'
  + '}'

  /* === Service includes list — orange dot bullets ::before === */
  + '.service_includes li{position:relative;padding-left:1.25rem}'
  + '.service_includes li::before{'
  +   'content:"";'
  +   'position:absolute;'
  +   'left:0;top:.65em;'
  +   'width:6px;height:6px;'
  +   'border-radius:50%;'
  +   'background:#E85D04'
  + '}'

  /* === Blockquote orange left border === */
  + 'blockquote{'
  +   'border-left:3px solid #E85D04;'
  +   'padding-left:1.5rem;'
  +   'background:rgba(232,93,4,.04)'
  + '}'

  /* === Form focus — orange border + glow === */
  + '.form_input:focus,.form_textarea:focus,.form_select:focus{'
  +   'border-color:#E85D04;'
  +   'outline:none;'
  +   'box-shadow:0 0 0 3px rgba(232,93,4,.15)'
  + '}'

  /* === Reduced motion: disable all animations === */
  + '@media(prefers-reduced-motion:reduce){'
  +   '.home-hero_heading,.home-hero_subline{opacity:1}'
  +   + '[data-ah-reveal]{opacity:1;animation:none;transform:none}'
  +   + '.bridge_tag{animation:none;background:none;-webkit-text-fill-color:#F2F2F2}'
  +   + '.card_wrapper{transition:none}'
  +   + '.nav_link::before,.nav_overlay-link::before{transition:none}'
  +   + '.button.is-primary::before,.button.is-ghost::after{transition:none}'
  + '}'

  ;
  document.head.appendChild(s);
})();
