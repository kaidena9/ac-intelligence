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

  /* divider — glowing particles drifting out of the wave (canvas, additive glow) */
  (function dividerParticles(){
    var sep = document.querySelector(".curve-sep");
    var cv = document.querySelector(".divider-canvas");
    if (!sep || !cv || reduce) return;
    var ctx = cv.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0;
    function resize(){
      var r = sep.getBoundingClientRect();
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });
    // hue follows the wave: teal -> blue/violet -> magenta across the width
    function hueAt(x){
      var t = x / (W || 1);
      if (t < 0.4) return [70, 222, 210];
      if (t < 0.7) return [120, 112, 236];
      return [226, 92, 202];
    }
    function rand(a, b){ return a + Math.random() * (b - a); }
    function spawn(p){
      p.x = rand(0, W);
      p.y = H * rand(0.42, 0.58);            // emerge from the wave's core
      var up = Math.random() < 0.62 ? -1 : 1; // mostly drift upward, some down
      p.vy = up * rand(0.10, 0.42);
      p.vx = rand(-0.18, 0.18);
      p.r = rand(0.5, 2.0);
      p.life = 0; p.max = rand(120, 260);
      p.c = hueAt(p.x);
      return p;
    }
    var N = Math.max(40, Math.min(120, Math.round(W / 13)));
    var ps = [];
    for (var i = 0; i < N; i++){ ps.push(spawn({})); ps[i].life = Math.random() * ps[i].max; }
    function frame(){
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      for (var i = 0; i < ps.length; i++){
        var p = ps[i];
        p.x += p.vx; p.y += p.vy; p.life++;
        var lf = p.life / p.max;
        if (lf >= 1 || p.y < -4 || p.y > H + 4){ spawn(p); p.life = 0; continue; }
        var a = Math.sin(lf * Math.PI) * 0.6;          // fade in then out
        ctx.shadowColor = "rgba(" + p.c[0] + "," + p.c[1] + "," + p.c[2] + "," + a.toFixed(3) + ")";
        ctx.shadowBlur = 7;
        ctx.fillStyle = "rgba(" + p.c[0] + "," + p.c[1] + "," + p.c[2] + "," + a.toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
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
