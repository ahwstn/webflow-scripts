/**
 * ahCss.js — CSS Injection (Header)
 * @version 1.7.1
 * @cdn https://cdn.jsdelivr.net/gh/ahwstn/webflow-scripts@main/ahwstn/ahCss.min.js
 *
 * JS-injected <style> for things the Webflow Designer genuinely cannot do:
 * - Custom properties (easing vars)
 * - ::before / ::after pseudo-elements
 * - @keyframes
 * - @media (prefers-reduced-motion)
 * - @media (hover: hover)
 * - clamp() values
 * - Complex selectors (:has(), :nth-child)
 *
 * Rule 6 compliant — every rule here is on the allowed list.
 * Static-first: all content readable without this script.
 *
 * v1.0.0: Easing vars, nav slash hover, button fills, card hovers,
 *         view-timeline entrances, FOUC prevention, reduced-motion.
 * v1.1.0: Nav glass backdrop-filter, step line draw animation.
 * v1.2.0: Services + work sibling dim (:has() hover), work hover
 *         image styles, bridge clamp sizing, process slash colour.
 *         Removed step_line (no longer used).
 * v1.3.0: Service tags — squared off, pixelated orb glow hover (dot-grid
 *         texture + orange radial glow), staggered scroll entrance.
 * v1.4.0: Service tilt cards — frosted glass, perspective, dot-grid surface,
 *         cursor-following orange glow, sibling dim, container flex ordering.
 * v1.4.1: Dropped custom-tools card accent (two cards only: Shopify + Webflow).
 *         Toned down cursor glow (.04) + border hover (.15), slower transitions.
 * v1.5.0: Smooth scroll, removed work sibling dim (now fullscreen sticky cards).
 * v1.6.0: Work horizontal scroll — CSS view-timeline, sticky viewport,
 *         Firefox scroll-snap fallback, reduced motion. Replaces stacking cards.
 * v1.7.0: Lenis smooth scroll CSS rules, removed native scroll-behavior:smooth.
 * v1.7.1: Scroll progress indicator — ::after on nav_wrapper, mix-blend-mode:difference.
 */
(function () {
  'use strict';

  var s = document.createElement('style');
  s.textContent = ''

  /* === Easing custom properties === */
  + ':root{'
  +   '--expo-out:cubic-bezier(.22,1,.36,1);'
  +   '--spring-smooth:linear(0,0.002,0.008,0.018,0.032,0.05,0.071,0.096,0.124,0.154,0.187,0.222,0.259,0.297,0.337,0.378,0.42,0.462,0.504,0.546,0.587,0.628,0.667,0.705,0.741,0.775,0.808,0.838,0.866,0.891,0.914,0.934,0.952,0.967,0.98,0.99,0.998,1.003,1.006,1.007,1.006,1.004,1.001,0.998,0.996,0.995,0.994,0.994,0.995,0.997,0.998,1);'
  +   '--spring-active:linear(0,0.004,0.016,0.035,0.063,0.098,0.141,0.19,0.245,0.305,0.37,0.438,0.509,0.581,0.654,0.726,0.796,0.863,0.926,0.985,1.038,1.085,1.126,1.159,1.185,1.204,1.216,1.221,1.22,1.213,1.201,1.185,1.166,1.145,1.122,1.099,1.076,1.054,1.033,1.014,0.998,0.984,0.974,0.966,0.961,0.959,0.96,0.963,0.967,0.973,0.979,0.986,0.993,0.999,1.004,1.008,1.01,1.011,1.01,1.008,1.006,1.003,1);'
  +   '--nav-height:4.0625rem'
  + '}'
  /* Fallback for browsers without linear() support */
  + '@supports not (transition-timing-function:linear(0,1)){'
  +   ':root{--spring-smooth:cubic-bezier(.4,0,.2,1);--spring-active:cubic-bezier(.175,.885,.32,1.275)}'
  + '}'

  /* === Lenis smooth scroll === */
  + 'html.lenis,html.lenis body{height:auto}'
  + '.lenis.lenis-smooth{scroll-behavior:auto}'
  + '.lenis.lenis-smooth [data-lenis-prevent]{overscroll-behavior:contain}'
  + '.lenis.lenis-stopped{overflow:hidden}'
  + '.lenis.lenis-scrolling iframe{pointer-events:none}'

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

  /* === Nav glass backdrop-filter === */
  + '.nav_wrapper{'
  +   'backdrop-filter:blur(12px);'
  +   '-webkit-backdrop-filter:blur(12px)'
  + '}'

  /* === Nav scroll progress indicator === */
  + '.nav_wrapper::after{'
  +   'content:"";'
  +   'position:absolute;'
  +   'inset:0;'
  +   'background:rgba(255,255,255,.05);'
  +   'transform-origin:left;'
  +   'transform:scaleX(0);'
  +   'pointer-events:none;'
  +   'animation:ahNavProgress linear both;'
  +   'animation-timeline:scroll()'
  + '}'
  + '@keyframes ahNavProgress{to{transform:scaleX(1)}}'
  /* Mobile: thin line at bottom */
  + '@media(max-width:991px){'
  +   '.nav_wrapper::after{'
  +     'top:auto;'
  +     'bottom:0;'
  +     'height:2px;'
  +     'background:#F2F2F2'
  +   '}'
  + '}'

  /* === Services list — sibling dim on hover === */
  + '@media(hover:hover){'
  +   '.home-services_item{transition:opacity .4s var(--expo-out);border-left:2px solid transparent;padding-left:1.5rem}'
  +   '.home-services_list:has(.home-services_item:hover) .home-services_item{opacity:.4}'
  +   '.home-services_list:has(.home-services_item:hover) .home-services_item:hover{opacity:1;border-left-color:#E85D04}'
  + '}'

  /* === Work horizontal scroll — view-timeline + animation (Designer can't do these) === */
  + '.home-work_wrapper{'
  +   'view-timeline-name:--ah-work-scroll;'
  +   'view-timeline-axis:block'
  + '}'
  + '.home-work_viewport .w-dyn-list{flex:1;min-height:0;display:flex;align-items:stretch}'
  + '.home-work_list{'
  +   'animation:ahWorkScroll linear both;'
  +   'animation-timeline:--ah-work-scroll;'
  +   'animation-range:contain 0% contain 100%'
  + '}'
  + '@keyframes ahWorkScroll{'
  +   'from{transform:translateX(0)}'
  +   'to{transform:translateX(calc(-100% + 100vw - 5rem))}'
  + '}'
  /* Firefox fallback — no view-timeline support */
  + '@supports not (view-timeline-name:--test){'
  +   '.home-work_wrapper{height:auto}'
  +   '.home-work_viewport{position:static;height:auto;overflow:visible}'
  +   '.home-work_list{animation:none;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch}'
  +   '.home-work_item{scroll-snap-align:start}'
  + '}'

  /* === Work hover image — cursor-following reveal (saved for /work listing page) === */
  + '.home-work_image{'
  +   'position:fixed;'
  +   'top:0;left:0;'
  +   'width:400px;height:250px;'
  +   'object-fit:cover;'
  +   'border-radius:.5rem;'
  +   'pointer-events:none;'
  +   'opacity:0;'
  +   'transform:scale(.95);'
  +   'z-index:100;'
  +   'will-change:transform,opacity'
  + '}'

  /* === Bridge tag — viewport-filling clamp === */
  + '.bridge_tag{'
  +   'font-size:clamp(4rem,15vw,10rem);'
  +   'line-height:1;'
  +   'text-align:center'
  + '}'

  /* === Service tags — pixelated orb glow hover === */
  + '.home-services_pill{'
  +   'position:relative;'
  +   '--pill-x:50%;--pill-y:50%;'
  +   'background-image:radial-gradient(circle,rgba(255,255,255,.05) 1px,transparent 1px);'
  +   'background-size:4px 4px;'
  +   'transition:border-color .3s var(--expo-out),color .3s var(--expo-out),box-shadow .3s var(--expo-out)'
  + '}'
  + '@media(hover:hover){'
  +   '.home-services_pill:hover{'
  +     'border-color:rgba(232,93,4,.3);'
  +     'color:#F2F2F2;'
  +     'background-image:'
  +       'radial-gradient(circle at var(--pill-x) var(--pill-y),rgba(232,93,4,.12) 0%,transparent 70%),'
  +       'radial-gradient(circle,rgba(255,255,255,.07) 1px,transparent 1px);'
  +     'background-size:100% 100%,4px 4px;'
  +     'box-shadow:0 0 12px rgba(232,93,4,.08)'
  +   '}'
  + '}'

  /* === Service tags — staggered scroll entrance === */
  + '.home-services_pill{'
  +   'opacity:0;'
  +   'animation:ahReveal .5s var(--expo-out) forwards;'
  +   'animation-timeline:view();'
  +   'animation-range:entry 5% entry 35%'
  + '}'
  + '.home-services_pill:nth-child(2){animation-range:entry 8% entry 38%}'
  + '.home-services_pill:nth-child(3){animation-range:entry 11% entry 41%}'
  + '.home-services_pill:nth-child(4){animation-range:entry 14% entry 44%}'
  + '.home-services_pill:nth-child(5){animation-range:entry 17% entry 47%}'

  /* === Services container — flex column for DOM ordering === */
  + '.section_home-services .container-large{display:flex;flex-direction:column}'
  + '.home-services_list{order:0}'
  + '.home-services_cards{order:1}'
  + '.section_home-services .button.is-ghost{order:2}'

  /* === Service tilt cards — frosted glass + perspective === */
  + '.home-services_cards{perspective:900px}'
  + '.home-services_card{'
  +   'transform-style:preserve-3d;'
  +   'will-change:transform;'
  +   '--card-glow-x:50%;--card-glow-y:50%;'
  +   '--card-accent:232,93,4;'
  +   'backdrop-filter:blur(16px);'
  +   '-webkit-backdrop-filter:blur(16px);'
  +   'transition:border-color .8s var(--expo-out),'
  +     'opacity .6s var(--expo-out)'
  + '}'
  /* Per-card accent colours */
  + '.home-services_card.is-shopify{--card-accent:232,93,4}'
  + '.home-services_card.is-webflow{--card-accent:107,70,193}'

  /* === Service card surface — dot-grid texture === */
  + '.home-services_card-surface{'
  +   'background-image:radial-gradient(circle,rgba(255,255,255,.05) 1px,transparent 1px);'
  +   'background-size:4px 4px'
  + '}'

  /* === Service card — cursor-following glow on hover (uses --card-accent) === */
  + '@media(hover:hover){'
  +   '.home-services_card:hover .home-services_card-surface{'
  +     'background-image:'
  +       'radial-gradient(circle at var(--card-glow-x) var(--card-glow-y),rgba(var(--card-accent),.015) 0%,rgba(var(--card-accent),.008) 40%,transparent 80%),'
  +       'radial-gradient(circle,rgba(255,255,255,.05) 1px,transparent 1px);'
  +     'background-size:100% 100%,4px 4px'
  +   '}'
  +   '.home-services_card:hover{border-color:rgba(var(--card-accent),.15)}'
  + '}'

  /* === Service cards — sibling dim on hover === */
  + '@media(hover:hover){'
  +   '.home-services_cards:has(.home-services_card:hover) .home-services_card{opacity:.4}'
  +   '.home-services_cards:has(.home-services_card:hover) .home-services_card:hover{opacity:1}'
  + '}'

  /* === Process line — orange slash separators === */
  + '.home-proof_slash{color:#E85D04;font-weight:600}'

  /* === Custom cursor — hide system cursor immediately (header script, no flash) === */
  + '@media(hover:hover) and (prefers-reduced-motion:no-preference){'
  +   'body,body *{cursor:none!important}'
  + '}'

  /* === Reduced motion: disable all animations === */
  + '@media(prefers-reduced-motion:reduce){'
  +   'html{scroll-behavior:auto}'
  +   '.home-hero_heading,.home-hero_subline{opacity:1}'
  +   + '[data-ah-reveal]{opacity:1;animation:none;transform:none}'
  +   + '.bridge_tag{animation:none;background:none;-webkit-text-fill-color:#F2F2F2}'
  +   + '.card_wrapper{transition:none}'
  +   + '.home-work_wrapper{height:auto}'
  +   + '.home-work_viewport{position:static;height:auto;overflow:visible}'
  +   + '.home-work_list{animation:none!important;flex-direction:column}'
  +   + '.home-work_item{width:100%;max-width:none}'
  +   + '.home-services_item,.home-work_item,.home-services_card{transition:none}'
  +   + '.home-services_card{transform:none!important;will-change:auto}'
  +   + '.home-services_pill{opacity:1;animation:none}'
  +   + '.home-services_pill{background-image:none}'
  +   + '.nav_link::before,.nav_overlay-link::before{transition:none}'
  +   + '.button.is-primary::before,.button.is-ghost::after{transition:none}'
  +   + '.nav_wrapper::after{animation:none;opacity:0}'
  + '}'

  ;
  document.head.appendChild(s);
})();
