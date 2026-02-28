/**
 * ahCss.js — ahwstn.com Header CSS Injection
 * Version: 1.0.0
 *
 * Injected in <head> to prevent FOUC.
 * Contents:
 *   - @property registrations (orb animation)
 *   - Custom easing properties
 *   - Section background colours
 *   - Frosted glass card styles
 *   - Gradient orb @keyframes
 *   - View-timeline section entrances
 *   - Link underline variants
 *   - Button fill/sweep effects
 *   - Card hover effects
 *   - Nav scroll transition
 *   - Form focus styles
 *   - Reduced-motion overrides
 */
(function () {
  // === @property registrations for animated orbs ===
  if (CSS.registerProperty) {
    try {
      CSS.registerProperty({ name: '--orb1-x', syntax: '<percentage>', inherits: false, initialValue: '25%' });
      CSS.registerProperty({ name: '--orb1-y', syntax: '<percentage>', inherits: false, initialValue: '30%' });
      CSS.registerProperty({ name: '--orb2-x', syntax: '<percentage>', inherits: false, initialValue: '65%' });
      CSS.registerProperty({ name: '--orb2-y', syntax: '<percentage>', inherits: false, initialValue: '60%' });
      CSS.registerProperty({ name: '--orb3-x', syntax: '<percentage>', inherits: false, initialValue: '45%' });
      CSS.registerProperty({ name: '--orb3-y', syntax: '<percentage>', inherits: false, initialValue: '75%' });
    } catch (e) { /* unsupported — orbs stay static */ }
  }

  var s = document.createElement('style');
  s.textContent = [

    // === Custom Properties ===
    ':root{',
      '--expo-out:cubic-bezier(.22,1,.36,1);',
      '--spring-smooth:linear(0,0.006,0.025,0.056,0.1,0.152,0.212,0.278,0.344,0.411,0.476,0.538,0.598,0.65,0.698,0.741,0.778,0.81,0.838,0.861,0.881,0.898,0.912,0.924,0.934,0.943,0.95,0.956,0.961,0.966,0.97,0.973,0.976,0.979,0.981,0.983,0.985,0.987,0.988,0.99,0.991,0.992,0.993,0.994,0.994,0.995,0.996,0.996,0.997,0.997,0.998,0.998,0.998,0.999,0.999,0.999,0.999,1);',
      '--ah-black:#0A0A0A;',
      '--ah-charcoal:#141414;',
      '--ah-surface:#1A1A1A;',
      '--ah-off-white:#F2F2F2;',
      '--ah-grey-400:#999;',
      '--ah-grey-600:#666;',
      '--ah-grey-800:#333;',
      '--ah-orange:#E85D04;',
      '--ah-orange-hover:#F07020;',
      '--ah-orange-glow:rgba(232,93,4,0.15);',
      '--ah-purple:#9F7AEA;',
      '--ah-border:rgba(255,255,255,0.08);',
      '--ah-border-hover:rgba(255,255,255,0.15);',
    '}',

    // === FOUC Prevention ===
    '.page-wrapper{opacity:1}',

    // === Section Backgrounds ===
    // Homepage
    '.section_home-hero{background-color:var(--ah-black);min-height:100dvh;position:relative;overflow-x:clip;overflow-y:visible}',
    '.section_home-services{background-color:var(--ah-charcoal)}',
    '.section_home-bridge{background-color:var(--ah-black)}',
    '.section_home-work{background-color:var(--ah-charcoal)}',
    '.section_home-process{background-color:var(--ah-black)}',
    '.section_home-testimonial{background-color:var(--ah-charcoal)}',
    '.section_home-cta{background-color:var(--ah-black);position:relative;overflow-x:clip;overflow-y:visible}',
    // About
    '.section_about-hero{background-color:var(--ah-black)}',
    '.section_about-story{background-color:var(--ah-charcoal)}',
    '.section_about-principles{background-color:var(--ah-black)}',
    '.section_about-physio{background-color:var(--ah-black);position:relative}',
    '.section_about-kubix{background-color:var(--ah-charcoal)}',
    '.section_about-cta{background-color:var(--ah-black)}',
    // Services
    '.section_services-hero{background-color:var(--ah-black)}',
    '.section_services-shopify{background-color:var(--ah-charcoal)}',
    '.section_services-webflow{background-color:var(--ah-black)}',
    '.section_services-apps{background-color:var(--ah-charcoal)}',
    '.section_services-included{background-color:var(--ah-black)}',
    '.section_services-pricing{background-color:var(--ah-charcoal)}',
    '.section_services-maintenance{background-color:var(--ah-black)}',
    '.section_services-cta{background-color:var(--ah-black)}',
    // Work
    '.section_work-hero{background-color:var(--ah-black)}',
    '.section_work-grid{background-color:var(--ah-charcoal)}',
    '.section_work-cta{background-color:var(--ah-black)}',
    // Case study
    '.section_casestudy-hero{background-color:var(--ah-black)}',
    '.section_casestudy-facts{background-color:var(--ah-charcoal)}',
    '.section_casestudy-challenge{background-color:var(--ah-black)}',
    '.section_casestudy-approach{background-color:var(--ah-charcoal)}',
    '.section_casestudy-result{background-color:var(--ah-black)}',
    '.section_casestudy-testimonial{background-color:var(--ah-charcoal)}',
    '.section_casestudy-cta{background-color:var(--ah-black)}',
    '.section_casestudy-more{background-color:var(--ah-charcoal)}',
    // Contact
    '.section_contact-hero{background-color:var(--ah-black)}',
    '.section_contact-next{background-color:var(--ah-charcoal)}',
    '.section_contact-faq{background-color:var(--ah-black)}',

    // === Hero Gradient Orbs ===
    '.hero_orbs{position:absolute;inset:0;pointer-events:none;z-index:0}',
    '.hero_orbs::before,.hero_orbs::after,.hero_orb-3{',
      'content:"";position:absolute;border-radius:50%;filter:blur(40px);will-change:transform;',
    '}',
    '.hero_orbs::before{',
      'width:45%;height:45%;',
      'background:radial-gradient(circle,rgba(232,93,4,0.12) 0%,transparent 70%);',
      'top:var(--orb1-y);left:var(--orb1-x);',
      'animation:ahOrb1 20s ease-in-out infinite;',
    '}',
    '.hero_orbs::after{',
      'width:35%;height:35%;',
      'background:radial-gradient(circle,rgba(232,93,4,0.08) 0%,transparent 70%);',
      'top:var(--orb2-y);left:var(--orb2-x);',
      'animation:ahOrb2 27s ease-in-out infinite;',
    '}',
    '.hero_orb-3{',
      'width:40%;height:40%;',
      'background:radial-gradient(circle,rgba(159,122,234,0.06) 0%,transparent 70%);',
      'top:var(--orb3-y);left:var(--orb3-x);',
      'animation:ahOrb3 33s ease-in-out infinite;',
    '}',

    // === Orb Keyframes ===
    '@keyframes ahOrb1{0%,100%{--orb1-x:25%;--orb1-y:30%}33%{--orb1-x:60%;--orb1-y:20%}66%{--orb1-x:40%;--orb1-y:65%}}',
    '@keyframes ahOrb2{0%,100%{--orb2-x:65%;--orb2-y:60%}33%{--orb2-x:30%;--orb2-y:40%}66%{--orb2-x:70%;--orb2-y:25%}}',
    '@keyframes ahOrb3{0%,100%{--orb3-x:45%;--orb3-y:75%}33%{--orb3-x:20%;--orb3-y:50%}66%{--orb3-x:65%;--orb3-y:35%}}',

    // === CTA Banner Orbs (dimmer) ===
    '.cta_orbs{position:absolute;inset:0;pointer-events:none;z-index:0;opacity:0.6}',
    '.cta_orbs::before,.cta_orbs::after{',
      'content:"";position:absolute;border-radius:50%;filter:blur(40px);will-change:transform;',
    '}',
    '.cta_orbs::before{',
      'width:40%;height:40%;',
      'background:radial-gradient(circle,rgba(232,93,4,0.1) 0%,transparent 70%);',
      'top:30%;left:20%;animation:ahOrb1 20s ease-in-out infinite;',
    '}',
    '.cta_orbs::after{',
      'width:30%;height:30%;',
      'background:radial-gradient(circle,rgba(159,122,234,0.05) 0%,transparent 70%);',
      'top:50%;left:60%;animation:ahOrb3 33s ease-in-out infinite;',
    '}',

    // === Physio Principle Glow ===
    '.section_about-physio::before{',
      'content:"";position:absolute;inset:0;',
      'background:radial-gradient(ellipse at center,rgba(232,93,4,0.06) 0%,transparent 70%);',
      'pointer-events:none;z-index:0;',
    '}',

    // === Frosted Glass Card ===
    '.card_wrapper{',
      'backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);',
      'background-color:rgba(255,255,255,0.03);',
      'border:1px solid var(--ah-border);',
      'border-radius:0.75rem;',
      'transition:border-color 400ms var(--expo-out),box-shadow 500ms var(--spring-smooth),transform 500ms var(--spring-smooth);',
    '}',
    '.card_wrapper:hover{',
      'border-color:rgba(232,93,4,0.3);',
      'box-shadow:0 8px 32px rgba(0,0,0,0.4);',
      'transform:translateY(-4px);',
    '}',

    // === Testimonial Block ===
    '.testimonial_wrapper{',
      'border-left:3px solid var(--ah-orange);',
      'background-color:rgba(232,93,4,0.04);',
      'padding-left:2rem;',
    '}',

    // === Buttons ===
    // Primary — diagonal fill sweep
    '.button.is-primary{',
      'position:relative;overflow-x:clip;overflow-y:clip;',
      'background-color:var(--ah-orange);color:var(--ah-black);',
      'transition:background-color 400ms var(--expo-out);',
    '}',
    '.button.is-primary::before{',
      'content:"";position:absolute;inset:0;',
      'background-color:var(--ah-orange-hover);',
      'transform:translateX(-101%) skewX(-15deg);',
      'transition:transform 500ms var(--expo-out);',
      'z-index:0;',
    '}',
    '.button.is-primary:hover::before{transform:translateX(0) skewX(-15deg)}',
    '.button.is-primary:hover{box-shadow:0 4px 20px var(--ah-orange-glow)}',
    '.button.is-primary>*{position:relative;z-index:1}',

    // Secondary — bg fill + border brighten
    '.button.is-secondary{',
      'background-color:transparent;color:var(--ah-off-white);',
      'border:1px solid var(--ah-border);',
      'transition:background-color 500ms var(--expo-out),border-color 500ms var(--expo-out);',
    '}',
    '.button.is-secondary:hover{',
      'background-color:rgba(255,255,255,0.05);',
      'border-color:var(--ah-border-hover);',
    '}',

    // Ghost — orange underline slide-in
    '.button.is-ghost{',
      'position:relative;background-color:transparent;color:var(--ah-off-white);',
      'border:none;padding-left:0;padding-right:0;',
    '}',
    '.button.is-ghost::after{',
      'content:"";position:absolute;bottom:0;left:0;width:100%;height:2px;',
      'background-color:var(--ah-orange);',
      'transform:scaleX(0);transform-origin:left;',
      'transition:transform 400ms var(--expo-out);',
    '}',
    '.button.is-ghost:hover::after{transform:scaleX(1)}',

    // === Link Hover — orange + underline slide ===
    'a:not(.button):not(.nav_link):not(.nav_logo){',
      'position:relative;color:var(--ah-orange);text-decoration:none;',
      'transition:color 400ms var(--expo-out);',
    '}',
    'a:not(.button):not(.nav_link):not(.nav_logo)::after{',
      'content:"";position:absolute;bottom:-2px;left:0;width:100%;height:1px;',
      'background-color:var(--ah-orange);',
      'transform:scaleX(0);transform-origin:left;',
      'transition:transform 400ms var(--expo-out);',
    '}',
    'a:not(.button):not(.nav_link):not(.nav_logo):hover::after{transform:scaleX(1)}',

    // === Nav ===
    '.nav_wrapper{',
      'position:fixed;top:0;left:0;right:0;z-index:1000;',
      'height:4.5rem;',
      'background-color:transparent;',
      'transition:background-color 500ms var(--expo-out),border-color 500ms var(--expo-out);',
      'border-bottom:1px solid transparent;',
    '}',
    '.nav_wrapper.is-scrolled{',
      'background-color:rgba(10,10,10,0.95);',
      'backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);',
      'border-bottom-color:rgba(255,255,255,0.06);',
    '}',
    '.nav_link{',
      'color:var(--ah-grey-400);text-decoration:none;',
      'transition:color 400ms var(--expo-out);',
    '}',
    '.nav_link:hover,.nav_link.is-active{color:var(--ah-off-white)}',
    '.nav_link.is-active{',
      'text-decoration:underline;text-decoration-color:var(--ah-orange);',
      'text-underline-offset:6px;text-decoration-thickness:2px;',
    '}',

    // === Mobile Nav Overlay ===
    '.nav_overlay{',
      'position:fixed;inset:0;z-index:999;',
      'background-color:var(--ah-black);',
      'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2rem;',
      'opacity:0;visibility:hidden;pointer-events:none;',
      'transition:opacity 400ms var(--expo-out),visibility 400ms var(--expo-out);',
    '}',
    '.nav_overlay.is-open{opacity:1;visibility:visible;pointer-events:auto}',

    // === Steps ===
    '.step_number{',
      'width:40px;height:40px;border-radius:50%;',
      'background-color:var(--ah-orange);color:var(--ah-black);',
      'display:flex;align-items:center;justify-content:center;',
      'font-weight:600;font-size:0.875rem;flex-shrink:0;',
    '}',
    '.step_line{',
      'width:2px;background-color:var(--ah-border);',
    '}',

    // === Service Price ===
    '.service_price{color:var(--ah-orange);font-weight:600}',

    // === Service Includes Bullets ===
    '.service_includes li::before{',
      'content:"";display:inline-block;width:6px;height:6px;border-radius:50%;',
      'background-color:var(--ah-orange);margin-right:0.75rem;vertical-align:middle;',
    '}',
    '.service_includes li{list-style:none}',

    // === Maintenance "Popular" Badge ===
    '.card_badge{',
      'display:inline-block;padding:0.25rem 0.75rem;border-radius:1rem;',
      'background-color:var(--ah-orange);color:var(--ah-black);',
      'font-size:0.75rem;font-weight:600;letter-spacing:0.02em;',
    '}',

    // === Quick Facts Bar (case study) ===
    '.facts_item{',
      'background-color:var(--ah-surface);',
      'padding:1.5rem;border-radius:0.5rem;',
    '}',
    '.facts_label{color:var(--ah-grey-600);font-size:0.8125rem;text-transform:uppercase;letter-spacing:0.08em}',
    '.facts_value{color:var(--ah-off-white);font-weight:500}',

    // === Gallery Horizontal Scroll ===
    '.gallery_track{',
      'display:flex;gap:1rem;overflow-x:auto;',
      'scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;',
    '}',
    '.gallery_track::-webkit-scrollbar{display:none}',
    '.gallery_item{scroll-snap-align:start;flex-shrink:0}',

    // === Rich Text (case study) ===
    '.w-richtext{color:var(--ah-off-white)}',
    '.w-richtext a{color:var(--ah-orange)}',
    '.w-richtext strong{font-weight:600}',
    '.w-richtext blockquote{border-left:3px solid var(--ah-orange);padding-left:1.5rem;font-style:italic}',

    // === Form ===
    '.form_wrapper{background-color:var(--ah-surface);border-radius:0.75rem;padding:2.5rem}',
    '.form_input,.form_select,.form_textarea{',
      'background-color:var(--ah-charcoal);color:var(--ah-off-white);',
      'border:1px solid var(--ah-border);border-radius:0.375rem;',
      'padding:0.75rem 1rem;width:100%;',
      'transition:border-color 300ms var(--expo-out),box-shadow 300ms var(--expo-out);',
    '}',
    '.form_input:focus,.form_select:focus,.form_textarea:focus{',
      'outline:none;border-color:var(--ah-orange);',
      'box-shadow:0 0 0 3px rgba(232,93,4,0.15);',
    '}',
    '.form_input.is-error,.form_textarea.is-error{',
      'border-color:#E53E3E;',
    '}',
    '.form_error{color:#FC8181;font-size:0.875rem;margin-top:0.25rem}',

    // === Bridge Text Gradient Mask ===
    '.bridge_tag{',
      'background:linear-gradient(90deg,var(--ah-off-white),var(--ah-orange),var(--ah-purple),var(--ah-off-white));',
      'background-size:300% 100%;',
      '-webkit-background-clip:text;background-clip:text;',
      '-webkit-text-fill-color:transparent;',
      'animation:ahTextMask 8s ease infinite;',
    '}',
    '@keyframes ahTextMask{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}',

    // === Focus Visible ===
    ':focus-visible{outline:2px solid var(--ah-orange);outline-offset:3px;transition:outline-offset 150ms}',

    // === View-Timeline Section Entrances ===
    '@supports(animation-timeline:view()){',
      '[data-reveal]{',
        'opacity:0;transform:translateY(24px);',
        'animation:ahReveal 800ms var(--expo-out) both;',
        'animation-timeline:view();',
        'animation-range:entry 0% entry 30%;',
      '}',
      '[data-reveal="stagger-1"]{animation-delay:0s}',
      '[data-reveal="stagger-2"]{animation-delay:0.08s}',
      '[data-reveal="stagger-3"]{animation-delay:0.16s}',
      '[data-reveal="stagger-4"]{animation-delay:0.24s}',
      '[data-reveal="stagger-5"]{animation-delay:0.32s}',
    '}',
    '@keyframes ahReveal{to{opacity:1;transform:translateY(0)}}',

    // === Terminal Loading Screen ===
    '.ah-terminal{',
      'position:fixed;inset:0;z-index:9999;',
      'background-color:var(--ah-black);',
      'display:flex;align-items:center;justify-content:center;',
    '}',
    '.ah-terminal_bar{',
      'display:flex;align-items:center;gap:6px;',
      'padding:0.75rem 1rem;',
      'border-bottom:1px solid var(--ah-border);',
    '}',
    '.ah-terminal_dot{width:10px;height:10px;border-radius:50%}',
    '.ah-terminal_dot--red{background:#FF5F57}',
    '.ah-terminal_dot--yellow{background:#FEBC2E}',
    '.ah-terminal_dot--green{background:#28C840}',
    '.ah-terminal_title{',
      'margin-left:auto;color:var(--ah-grey-600);',
      'font-family:monospace;font-size:0.75rem;',
    '}',
    '.ah-terminal_body{padding:1.5rem;font-family:monospace;font-size:0.875rem;line-height:1.8}',
    '.ah-terminal_line{color:var(--ah-grey-400);min-height:1.4em}',
    '.ah-terminal_line--status{color:var(--ah-off-white)}',
    '.ah-terminal_revealed{color:#4ADE80}',
    '.ah-terminal_scrambled{color:var(--ah-grey-600)}',
    '.ah-terminal_prompt{color:var(--ah-orange)}',
    '.ah-terminal_typed{color:var(--ah-off-white)}',
    '.ah-terminal_cursor{',
      'display:inline-block;width:8px;height:1em;',
      'background-color:var(--ah-orange);margin-left:2px;',
      'animation:ahBlink 1s step-end infinite;vertical-align:text-bottom;',
    '}',
    '@keyframes ahBlink{0%,100%{opacity:1}50%{opacity:0}}',
    // Terminal inner wrapper (centred box)
    '.ah-terminal>div{',
      'width:min(600px,90vw);',
      'background-color:var(--ah-surface);',
      'border:1px solid var(--ah-border);',
      'border-radius:0.75rem;overflow:hidden;',
    '}',

    // === Reduced Motion ===
    '@media(prefers-reduced-motion:reduce){',
      '*,*::before,*::after{',
        'animation-duration:0.01ms!important;',
        'animation-iteration-count:1!important;',
        'transition-duration:0.01ms!important;',
      '}',
      '.hero_orbs,.hero_orb-3,.cta_orbs{animation:none!important}',
      '[data-reveal]{opacity:1!important;transform:none!important}',
      '.bridge_tag{animation:none!important;background-position:0% 50%!important}',
      '.ah-terminal_cursor{animation:none!important}',
    '}',

  ''].join('');

  document.head.appendChild(s);
})();
