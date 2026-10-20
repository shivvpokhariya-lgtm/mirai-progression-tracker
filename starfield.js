/* Mirai Progression Tracker — ambient starfield background.
   Ported from the SkillBridge canvas starfield engine (same star texture,
   twinkle, drift and scroll parallax), with Mirai light-blue stars mixed in.
   Self-initializing: creates its own fixed canvas behind page content.
   Usage: <script src="starfield.js"></script> — no HTML/CSS changes needed. */
(function () {
  'use strict';

  var OPT = window.MIRAI_STARS || {};
  var BLUE_RATIO = typeof OPT.blueRatio === 'number' ? OPT.blueRatio : 0.30;
  var PARALLAX = typeof OPT.parallax === 'number' ? OPT.parallax : 0.35;
  var DENSITY = typeof OPT.density === 'number' ? OPT.density : 8500;

  // Mirai accent blues — light blues to match the brand gradient
  var BLUES = ['#7DD3FC', '#38BDF8', '#22D3EE', '#00F9FF'];
  var WHITE = '#FFFFFF';

  function makeCanvas() {
    var c = document.createElement('canvas');
    c.id = 'mirai-stars';
    c.setAttribute('aria-hidden', 'true');
    c.style.position = 'fixed';
    c.style.inset = '0';
    c.style.width = '100%';
    c.style.height = '100%';
    c.style.zIndex = '0';
    c.style.pointerEvents = 'none';
    // Insert as the very first body child so it paints behind
    // the existing #sky canvas and all page content.
    if (document.body.firstChild) {
      document.body.insertBefore(c, document.body.firstChild);
    } else {
      document.body.appendChild(c);
    }
    return c;
  }

  function hexToRgba(hex, a) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a.toFixed(3) + ')';
  }

  function init() {
    var canvas = makeCanvas();
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, stars = [];
    var scrollP = 0, scrollT = 0;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      seed();
    }

    function seed() {
      stars = [];
      var count = Math.min(240, Math.floor((W * H) / DENSITY));
      for (var i = 0; i < count; i++) {
        var isBlue = Math.random() < BLUE_RATIO;
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.6 + 0.3,
          depth: 0.25 + Math.random() * 0.75,
          tw: Math.random() * Math.PI * 2,
          ts: 0.4 + Math.random() * 1.4,
          drift: 0.06 + Math.random() * 0.22,
          color: isBlue ? BLUES[(Math.random() * BLUES.length) | 0] : WHITE
        });
      }
    }

    function onScroll() {
      scrollT = window.scrollY || window.pageYOffset || 0;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    function draw(now, dt) {
      // Smooth-scroll parallax: the field lags behind the page,
      // nearer (higher-depth) stars travel further — same feel as SkillBridge.
      scrollP += (scrollT - scrollP) * Math.min(1, dt * 3.2);
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        s.tw += dt * s.ts;
        s.y += s.drift * dt * 12;
        if (s.y > H + 4) { s.y = -4; s.x = Math.random() * W; }
        var alpha = 0.28 + 0.72 * (0.5 + 0.5 * Math.sin(s.tw));
        var y = (s.y - scrollP * s.depth * PARALLAX) % H;
        if (y < 0) y += H;
        var R = s.r * 4;
        var g = ctx.createRadialGradient(s.x, y, 0, s.x, y, R);
        g.addColorStop(0, hexToRgba(s.color, alpha * 0.9));
        g.addColorStop(0.35, hexToRgba(s.color, alpha * 0.28));
        g.addColorStop(1, hexToRgba(s.color, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(s.x, y, R, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    var last = performance.now();
    var running = true;

    function frame(now) {
      if (!running) return;
      var dt = Math.min(50, now - last) / 1000;
      last = now;
      draw(now, dt);
      requestAnimationFrame(frame);
    }

    // Pause when the tab is hidden — saves battery, resumes cleanly.
    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
      if (running) {
        last = performance.now();
        requestAnimationFrame(frame);
      }
    });

    // Reduced motion: render one static frame, no loop.
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      draw(performance.now(), 0.016);
    } else {
      window.addEventListener('resize', resize);
      resize();
      requestAnimationFrame(frame);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
