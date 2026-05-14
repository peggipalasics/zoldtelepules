/* Silver Klíma animated logo — vanilla JS port of SilverLogoAnimation.jsx
   Usage: SilverLogoAnimation.mount(containerEl, { logoSrc, logoTextSrc, variant: 'zoldTelepules' }) */
(function () {
  'use strict';

  var STAGE_W = 1920, STAGE_H = 1080;
  var LOGO_W = 1180;
  var LOGO_H = (LOGO_W * 413) / 1000;
  var LOGO_X = (STAGE_W - LOGO_W) / 2;
  var LOGO_Y = (STAGE_H - LOGO_H) / 2 + 30;
  var SCALE_K = LOGO_W / 1000;
  var DOT_R  = 59.5 * SCALE_K;
  var DOT_Y  = LOGO_Y + 77.5 * SCALE_K;
  var DOT_X1 = LOGO_X + 75.5 * SCALE_K;
  var DOT_X2 = LOGO_X + 231.5 * SCALE_K;
  var DOT_X3 = LOGO_X + 387.5 * SCALE_K;
  var CLIP_TOP = 152 * SCALE_K;
  var DOT_GRAY  = '#676767';
  var DOT_CYAN  = '#72CCD7';
  var DOT_LIGHT = '#D9D9D8';
  var ORIGIN_X = LOGO_X + LOGO_W / 2;
  var ORIGIN_Y = LOGO_Y + LOGO_H / 2;

  function hexToRgb(hex) {
    var m = hex.replace('#', '');
    return [parseInt(m.slice(0, 2), 16), parseInt(m.slice(2, 4), 16), parseInt(m.slice(4, 6), 16)];
  }
  function mixColor(a, b, t) {
    var A = hexToRgb(a), B = hexToRgb(b);
    return 'rgb(' + Math.round(A[0] + (B[0] - A[0]) * t) + ',' +
                    Math.round(A[1] + (B[1] - A[1]) * t) + ',' +
                    Math.round(A[2] + (B[2] - A[2]) * t) + ')';
  }
  function easeSoftLand(k) {
    if (k >= 1) return 1;
    var base = 1 - Math.pow(1 - k, 3);
    var damp = Math.exp(-4 * k);
    return base + Math.sin(k * Math.PI * 2.4) * 0.06 * damp;
  }

  function mount(container, opts) {
    opts = opts || {};
    var isZold = opts.variant === 'zoldTelepules';
    var cfg = {
      logoSrc: opts.logoSrc,
      logoTextSrc: opts.logoTextSrc || opts.logoSrc,
      variant: opts.variant || 'default',
      greenColor: opts.greenColor || '#5DAA52',
      transitionStart: opts.transitionStart != null ? opts.transitionStart : 1.9,
      transitionDuration: opts.transitionDuration != null ? opts.transitionDuration : 1.2,
      bloomStrength: opts.bloomStrength != null ? opts.bloomStrength : 0.9,
      duration: opts.duration != null ? opts.duration : (isZold ? 6.0 : 5.0),
      loop: opts.loop !== false,
      play: opts.play !== false,
      background: opts.background || '#ffffff',
      titleText: opts.titleText || 'Zöld Település Program',
      pillText: opts.pillText || '1 klíma = 1 fa'
    };

    // outer
    container.style.position = 'relative';
    if (!container.style.width) container.style.width = '100%';
    if (!container.style.aspectRatio) container.style.aspectRatio = '16 / 9';
    container.style.overflow = 'hidden';
    container.style.background = cfg.background;

    var stage = document.createElement('div');
    stage.style.cssText = 'position:absolute;left:50%;top:50%;width:' + STAGE_W + 'px;height:' + STAGE_H + 'px;transform-origin:center;';
    container.appendChild(stage);

    var inner = document.createElement('div');
    inner.style.cssText = 'position:absolute;inset:0;transform-origin:' + ORIGIN_X + 'px ' + ORIGIN_Y + 'px;';
    stage.appendChild(inner);

    // halo
    var haloPad = 200;
    var halo = document.createElement('div');
    halo.style.cssText = 'position:absolute;left:' + (LOGO_X - haloPad) + 'px;top:' + (LOGO_Y - haloPad) + 'px;width:' + (LOGO_W + haloPad * 2) + 'px;height:' + (LOGO_H + haloPad * 2) + 'px;transform-origin:center;pointer-events:none;overflow:visible;';
    var haloImg = document.createElement('img');
    haloImg.src = cfg.logoTextSrc;
    haloImg.alt = '';
    haloImg.draggable = false;
    haloImg.style.cssText = 'position:absolute;left:' + haloPad + 'px;top:' + haloPad + 'px;width:' + LOGO_W + 'px;height:' + LOGO_H + 'px;display:block;pointer-events:none;';
    halo.appendChild(haloImg);
    inner.appendChild(halo);

    // dot glows
    function makeGlow(x) {
      var el = document.createElement('div');
      el.style.cssText = 'position:absolute;left:' + (x - DOT_R) + 'px;top:' + (DOT_Y - DOT_R) + 'px;width:' + (DOT_R * 2) + 'px;height:' + (DOT_R * 2) + 'px;border-radius:50%;pointer-events:none;will-change:transform,opacity,filter;';
      inner.appendChild(el);
      return el;
    }
    var glow1 = makeGlow(DOT_X1), glow2 = makeGlow(DOT_X2), glow3 = makeGlow(DOT_X3);

    // wordmark
    var wordmark = document.createElement('div');
    wordmark.style.cssText = 'position:absolute;left:' + LOGO_X + 'px;top:' + LOGO_Y + 'px;width:' + LOGO_W + 'px;height:' + LOGO_H + 'px;will-change:transform,opacity,clip-path;';
    var wordImg = document.createElement('img');
    wordImg.src = cfg.logoSrc;
    wordImg.alt = 'Silver Klíma';
    wordImg.draggable = false;
    wordImg.style.cssText = 'width:100%;height:100%;display:block;pointer-events:none;';
    wordmark.appendChild(wordImg);
    inner.appendChild(wordmark);

    // dots
    function makeDot(x, color) {
      var el = document.createElement('div');
      el.style.cssText = 'position:absolute;left:' + (x - DOT_R) + 'px;top:' + (DOT_Y - DOT_R) + 'px;width:' + (DOT_R * 2) + 'px;height:' + (DOT_R * 2) + 'px;border-radius:50%;background:' + color + ';will-change:transform,opacity;';
      inner.appendChild(el);
      return el;
    }
    var dot1 = makeDot(DOT_X1, DOT_GRAY);
    var dot2 = makeDot(DOT_X2, DOT_CYAN);
    var dot3 = makeDot(DOT_X3, DOT_LIGHT);

    // tagline (zoldTelepules only)
    var tagline = null, title = null, pill = null;
    if (isZold) {
      tagline = document.createElement('div');
      tagline.style.cssText = 'position:absolute;left:0;right:0;top:' + (LOGO_Y + LOGO_H - 6) + 'px;display:flex;flex-direction:column;align-items:center;gap:26px;';
      title = document.createElement('div');
      title.textContent = cfg.titleText;
      title.style.cssText = 'font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;font-size:56px;font-weight:700;letter-spacing:0.16em;color:' + cfg.greenColor + ';text-transform:uppercase;line-height:1;';
      pill = document.createElement('div');
      var parts = cfg.pillText.split('=');
      if (parts.length === 2) {
        pill.innerHTML = '';
        pill.appendChild(document.createTextNode(parts[0]));
        var eq = document.createElement('span');
        eq.style.cssText = 'opacity:0.85;margin:0 0.4em';
        eq.textContent = '=';
        pill.appendChild(eq);
        pill.appendChild(document.createTextNode(parts[1]));
      } else {
        pill.textContent = cfg.pillText;
      }
      pill.style.cssText = 'background:' + cfg.greenColor + ';color:#fff;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;font-size:38px;font-weight:600;letter-spacing:0.04em;padding:18px 42px;border-radius:999px;box-shadow:0 8px 28px ' + cfg.greenColor + '40,0 2px 6px rgba(0,0,0,0.08);white-space:nowrap;';
      tagline.appendChild(title);
      tagline.appendChild(pill);
      inner.appendChild(tagline);
    }

    // fit scale
    var scale = 1;
    function measure() {
      var s = Math.min(container.clientWidth / STAGE_W, container.clientHeight / STAGE_H);
      scale = Math.max(0.05, s);
      stage.style.transform = 'translate(-50%, -50%) scale(' + scale + ')';
    }
    measure();
    var ro = (typeof ResizeObserver !== 'undefined') ? new ResizeObserver(measure) : null;
    if (ro) ro.observe(container);
    window.addEventListener('resize', measure);

    var DOT_DELAYS = [0.55, 0.85, 1.15];
    var dotEls = [dot1, dot2, dot3];
    var glowEls = [glow1, glow2, glow3];

    function render(time) {
      // halo
      var fadeIn = Math.min(1, time / 0.6);
      var haloBloom = Math.min(1, time / 4.0);
      var haloBlur = 26 + haloBloom * 14;
      var haloOp = (0.18 + haloBloom * 0.06) * fadeIn;
      var haloScale = 1.03 + haloBloom * 0.04;
      halo.style.transform = 'scale(' + haloScale + ')';
      halo.style.filter = 'blur(' + haloBlur + 'px)';
      halo.style.opacity = haloOp;

      // wordmark
      var wmP = Math.min(1, time / 0.7);
      var wmE = 1 - Math.pow(1 - wmP, 3);
      wordmark.style.clipPath = 'inset(' + CLIP_TOP + 'px 0 0 0)';
      wordmark.style.opacity = wmE;
      wordmark.style.transform = 'translateY(' + ((1 - wmE) * 18) + 'px)';

      // color progression
      var colorP = isZold ? Math.max(0, Math.min(1, (time - cfg.transitionStart) / cfg.transitionDuration)) : 0;
      var colorEased = colorP < 0.5 ? 2 * colorP * colorP : 1 - Math.pow(-2 * colorP + 2, 2) / 2;
      var middleColor = isZold ? mixColor(DOT_CYAN, cfg.greenColor, colorEased) : DOT_CYAN;
      var middleGlowColor = isZold ? mixColor('#9aa0a4', cfg.greenColor, Math.min(1, colorP * 1.2)) : '#9aa0a4';
      var bloomBell = Math.sin(Math.max(0, Math.min(1, colorP)) * Math.PI);
      var extraGlowOp    = isZold ? bloomBell * 0.35 * cfg.bloomStrength : 0;
      var extraGlowBlur  = isZold ? bloomBell * 18   * cfg.bloomStrength : 0;
      var extraGlowScale = isZold ? bloomBell * 0.18 * cfg.bloomStrength : 0;

      // master zoom
      var zoomProg = Math.min(1, time / (isZold ? 5.5 : 4.6));
      var zoomEased = 1 - Math.pow(1 - zoomProg, 2.4);
      var masterScale = 0.93 + zoomEased * 0.12;
      inner.style.transform = 'scale(' + masterScale + ')';

      // glows
      for (var i = 0; i < 3; i++) {
        var delay = DOT_DELAYS[i];
        var t = time - delay;
        var el = glowEls[i];
        if (t < -0.001) { el.style.opacity = 0; continue; }
        var p = Math.min(1, t / 1.1);
        var yOff = (1 - easeSoftLand(p)) * -520;
        var bloom = Math.min(1, t / 3.0);
        var color = (i === 1) ? middleGlowColor : '#9aa0a4';
        var blurPx = 26 + bloom * 10 + (i === 1 ? extraGlowBlur : 0);
        var glowOp = Math.min(1, t / 0.4) * (0.18 + bloom * 0.04 + (i === 1 ? extraGlowOp : 0));
        var glowScale = 1.35 + bloom * 0.08 + (i === 1 ? extraGlowScale : 0);
        el.style.background = color;
        el.style.transform = 'translate3d(0,' + yOff + 'px,0) scale(' + glowScale + ')';
        el.style.filter = 'blur(' + blurPx + 'px)';
        el.style.opacity = glowOp;
      }

      // dots
      var pulseScale = 1;
      if (time > 2.4) {
        var pt = (time - 2.4) % 3.6;
        pulseScale = 1 + Math.sin((pt / 3.6) * Math.PI * 2) * 0.012;
      }
      var bloomScale = 1;
      if (isZold) {
        var bt = time - cfg.transitionStart;
        if (bt > 0 && bt < 1.0) {
          bloomScale = 1 + Math.sin((bt / 1.0) * Math.PI) * 0.12 * cfg.bloomStrength;
        }
      }
      for (var j = 0; j < 3; j++) {
        var dDelay = DOT_DELAYS[j];
        var dt = time - dDelay;
        var de = dotEls[j];
        if (dt < -0.001) { de.style.opacity = 0; continue; }
        var dp = Math.min(1, dt / 1.1);
        var dyOff = (1 - easeSoftLand(dp)) * -520;
        var dop = Math.min(1, dt / 0.28);
        var sp = Math.min(1, dt / 0.6);
        var baseScale = 0.94 + 0.06 * (1 - Math.pow(1 - sp, 2));
        var thisBloom = (j === 1) ? bloomScale : 1;
        var shadow = 0.12 + 0.10 * (1 - dp);
        var dcolor = (j === 1) ? middleColor : (j === 0 ? DOT_GRAY : DOT_LIGHT);
        de.style.background = dcolor;
        de.style.transform = 'translate3d(0,' + dyOff + 'px,0) scale(' + (baseScale * pulseScale * thisBloom) + ')';
        de.style.opacity = dop;
        de.style.boxShadow = '0 ' + (6 + (1 - dp) * 24) + 'px ' + (22 + (1 - dp) * 36) + 'px rgba(20,30,40,' + (shadow * 0.5) + ')';
      }

      // tagline
      if (isZold && tagline) {
        var start = cfg.transitionStart + cfg.transitionDuration * 0.4;
        var titleP = Math.max(0, Math.min(1, (time - start) / 0.9));
        var titleE = 1 - Math.pow(1 - titleP, 3);
        var pillStart = start + 0.35;
        var pillP = Math.max(0, Math.min(1, (time - pillStart) / 0.7));
        var pillE = 1 - Math.pow(1 - pillP, 3);
        var c = 1.7;
        var eb = pillP > 0 ? (1 + (c + 1) * Math.pow(pillP - 1, 3) + c * Math.pow(pillP - 1, 2)) : 0;
        var pillScale = pillP > 0 ? 0.85 + 0.15 * eb : 0.85;
        if (titleP <= 0) {
          tagline.style.display = 'none';
        } else {
          tagline.style.display = 'flex';
          title.style.opacity = titleE;
          title.style.transform = 'translateY(' + ((1 - titleE) * 12) + 'px)';
          if (pillP > 0) {
            pill.style.display = 'block';
            pill.style.opacity = pillE;
            pill.style.transform = 'translateY(' + ((1 - pillE) * 10) + 'px) scale(' + pillScale + ')';
          } else {
            pill.style.display = 'none';
          }
        }
      }
    }

    var startTs = null;
    var rafId = null;
    var timeoutId = null;
    var stopped = false;
    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var now = (typeof performance !== 'undefined' && performance.now) ? function () { return performance.now(); } : function () { return Date.now(); };

    // Schedule next tick via BOTH rAF and setTimeout. Whichever fires first wins
    // and cancels the other. rAF gives 60fps in normal tabs; setTimeout is a
    // safety net for headless / heavily throttled environments where rAF can stall.
    function schedule() {
      if (stopped) return;
      var done = false;
      function fire() { if (done || stopped) return; done = true; cancelAnimationFrame(rafId); clearTimeout(timeoutId); tick(); }
      if (typeof requestAnimationFrame !== 'undefined') rafId = requestAnimationFrame(fire);
      timeoutId = setTimeout(fire, 50);
    }

    function tick() {
      if (stopped) return;
      var ts = now();
      if (startTs == null) startTs = ts;
      var t = (ts - startTs) / 1000;
      if (t >= cfg.duration) {
        if (cfg.loop) { t = t % cfg.duration; }
        else { render(cfg.duration); return; }
      }
      render(t);
      schedule();
    }

    if (reducedMotion) {
      render(cfg.duration);
    } else if (cfg.play) {
      tick();
    } else {
      render(0);
    }

    return {
      destroy: function () {
        stopped = true;
        if (rafId) cancelAnimationFrame(rafId);
        if (timeoutId) clearTimeout(timeoutId);
        if (ro) ro.disconnect();
        window.removeEventListener('resize', measure);
        container.innerHTML = '';
      }
    };
  }

  // Auto-mount: any [data-silver-anim] element with data-logo-src / data-logo-text-src attrs
  function autoInit() {
    var els = document.querySelectorAll('[data-silver-anim]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.__silverMounted) continue;
      el.__silverMounted = true;
      mount(el, {
        logoSrc: el.getAttribute('data-logo-src'),
        logoTextSrc: el.getAttribute('data-logo-text-src') || null,
        variant: el.getAttribute('data-variant') || 'default',
        greenColor: el.getAttribute('data-green-color') || undefined,
        titleText: el.getAttribute('data-title') || undefined,
        pillText: el.getAttribute('data-pill') || undefined,
        background: el.getAttribute('data-background') || undefined
      });
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

  window.SilverLogoAnimation = { mount: mount };
})();
