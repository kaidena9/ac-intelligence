/* AC Intelligence — nav scroll · mobile menu · scroll reveals */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var nav = document.getElementById("nav");
  function onScroll(){ nav.classList.toggle("scrolled", window.scrollY > 20); }
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

  var btn = document.getElementById("menuBtn");
  var menu = document.getElementById("mobile");
  function setMenu(open){
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.classList.toggle("open", open);
    menu.hidden = !open;
  }
  if (btn) {
    btn.addEventListener("click", function(){ setMenu(btn.getAttribute("aria-expanded") !== "true"); });
    menu.addEventListener("click", function(e){ if (e.target.closest("a")) setMenu(false); });
    window.addEventListener("keydown", function(e){ if (e.key === "Escape") setMenu(false); });
    window.addEventListener("resize", function(){ if (window.innerWidth > 780) setMenu(false); });
  }

  /* cursor-following glass sheen on buttons + nav bar */
  document.querySelectorAll(".btn, .nav-bar, .nav-cta, .svc").forEach(function(el){
    el.addEventListener("pointermove", function(e){
      var r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (e.clientX - r.left) + "px");
      el.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* divider — pause its CSS drift animation while it is off-screen (perf) */
  (function dividerAnim(){
    var sep = document.querySelector(".curve-sep");
    if (!sep || reduce || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ sep.classList.toggle("div-off", !en.isIntersecting); });
    }, { rootMargin: "140px 0px 140px 0px" });
    io.observe(sep);
  })();

  /* hero background parallax (translate the bg layer slower than scroll) */
  (function heroParallax(){
    var bg = document.querySelector(".hero-bg");
    if (!bg || reduce) return;
    var ticking = false;
    function update(){ bg.style.transform = "translate3d(0," + (window.scrollY * 0.14) + "px,0)"; ticking = false; }
    window.addEventListener("scroll", function(){ if (!ticking){ requestAnimationFrame(update); ticking = true; } }, { passive: true });
    update();
  })();

  /* hero — soft particles falling down the right side from the top.
     Sprite-based + additive (no shadowBlur), paused off-screen, so it stays cheap. */
  (function heroParticles(){
    var hero = document.querySelector(".hero");
    var cv = document.querySelector(".hero-particles");
    if (!hero || !cv || reduce) return;
    var ctx = cv.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, running = true;
    function makeSprite(rgb){
      var c = document.createElement("canvas"), S = 32; c.width = c.height = S;
      var x = c.getContext("2d");
      var g = x.createRadialGradient(S/2, S/2, 0, S/2, S/2, S/2);
      g.addColorStop(0, "rgba(" + rgb + ",1)");
      g.addColorStop(0.35, "rgba(" + rgb + ",0.5)");
      g.addColorStop(1, "rgba(" + rgb + ",0)");
      x.fillStyle = g; x.fillRect(0, 0, S, S); return c;
    }
    var sprites = [makeSprite("90,230,220"), makeSprite("70,200,235"), makeSprite("150,120,235")];
    function resize(){
      var r = hero.getBoundingClientRect(); W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize(); window.addEventListener("resize", resize, { passive: true });
    function rand(a, b){ return a + Math.random() * (b - a); }
    function spawn(p){
      p.x = W * rand(0.58, 1.0);            // right side
      p.y = -rand(0, H * 0.18);            // start above the top
      p.vx = rand(-0.10, 0.10);
      p.vy = rand(0.35, 1.0);              // fall straight down
      p.size = rand(4, 11);
      p.spr = sprites[(Math.random() * sprites.length) | 0];
      p.a = rand(0.72, 1.0);
      return p;
    }
    var N = Math.max(44, Math.min(84, Math.round((window.innerWidth || W) / 18)));
    var ps = [];
    for (var i = 0; i < N; i++){ ps.push(spawn({})); ps[i].y = Math.random() * H; }  // pre-fill the column
    function frame(){
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      for (var i = 0; i < ps.length; i++){
        var p = ps[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.0006;
        if (p.y > H + 14){ spawn(p); continue; }
        var t = p.y / H;                                   // fade in at top, out near bottom
        var fade = p.a * (t < 0.03 ? Math.max(0, t) / 0.03 : t > 0.9 ? Math.max(0, (1 - t) / 0.1) : 1);
        ctx.globalAlpha = fade;
        ctx.drawImage(p.spr, p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);   // start immediately, don't depend on the observer
    if ("IntersectionObserver" in window){
      new IntersectionObserver(function(es){
        es.forEach(function(e){
          if (e.isIntersecting){ if (!running){ running = true; requestAnimationFrame(frame); } }
          else running = false;
        });
      }).observe(hero);
    }
  })();

  /* global cursor-following light (single GPU-translated blob, screen-blended) */
  (function cursorGlow(){
    if (reduce || !window.matchMedia || !window.matchMedia("(pointer:fine)").matches) return;
    var el = document.createElement("div");
    el.className = "cursor-glow"; el.setAttribute("aria-hidden", "true");
    document.body.appendChild(el);
    var x = window.innerWidth / 2, y = window.innerHeight / 2, tick = false;
    function move(){ el.style.transform = "translate3d(" + x + "px," + y + "px,0)"; tick = false; }
    move();
    window.addEventListener("pointermove", function(e){
      x = e.clientX; y = e.clientY;
      if (!el.classList.contains("on")) el.classList.add("on");
      if (!tick){ requestAnimationFrame(move); tick = true; }
    }, { passive: true });
    document.addEventListener("mouseleave", function(){ el.classList.remove("on"); });
    window.addEventListener("blur", function(){ el.classList.remove("on"); });
  })();

  var els = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    els.forEach(function(el){ el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function(entries, obs){
      entries.forEach(function(en){ if (en.isIntersecting){ en.target.classList.add("in"); obs.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function(el){ io.observe(el); });
  }
})();
