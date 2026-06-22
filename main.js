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

  /* hero — soft particles falling down the right side (CSS-animated DOM dots, universally reliable) */
  (function heroParticles(){
    if (reduce) return;
    var box = document.querySelector(".hero-particles");
    if (!box) return;
    var colors = ["90,230,220", "70,200,235", "55,105,230", "140,110,235", "120,60,205"];
    var N = Math.max(36, Math.min(72, Math.round((window.innerWidth || 1200) / 22)));
    var html = "";
    for (var i = 0; i < N; i++){
      var c = colors[i % colors.length];
      var size = (4 + Math.random() * 9).toFixed(1);
      var left = (58 + Math.random() * 42).toFixed(2);
      var dur = (18 + Math.random() * 16).toFixed(2);
      var delay = (-Math.random() * dur).toFixed(2);
      var op = (0.5 + Math.random() * 0.45).toFixed(2);
      html += '<span class="p" style="left:' + left + '%;width:' + size + 'px;height:' + size + 'px;'
            + 'background:radial-gradient(circle,rgba(' + c + ',' + op + ') 0%,rgba(' + c + ',0) 70%);'
            + 'animation-duration:' + dur + 's;animation-delay:' + delay + 's"></span>';
    }
    box.innerHTML = html;
    if ("IntersectionObserver" in window){
      new IntersectionObserver(function(es){
        es.forEach(function(e){ box.classList.toggle("paused", !e.isIntersecting); });
      }).observe(document.querySelector(".hero"));
    }
  })();

  /* falling orbs inside the How-It-Works circles (CSS-animated DOM dots) */
  (function hiwParticles(){
    if (reduce) return;
    document.querySelectorAll(".hiw-particles").forEach(function(box){
      var card = box.closest(".hiw-card");
      var rgb = (card ? getComputedStyle(card).getPropertyValue("--crgb").trim() : "") || "95,235,225";
      var cols = [rgb];
      var html = "";
      for (var i = 0; i < 16; i++){
        var c = cols[i % cols.length];
        var size = (2 + Math.random() * 4.5).toFixed(1);
        var left = (6 + Math.random() * 88).toFixed(1);
        var dur = (6 + Math.random() * 8).toFixed(2);
        var delay = (-Math.random() * dur).toFixed(2);
        var op = (0.4 + Math.random() * 0.5).toFixed(2);
        html += '<span class="p" style="left:' + left + '%;width:' + size + 'px;height:' + size + 'px;'
              + 'background:radial-gradient(circle,rgba(' + c + ',' + op + ') 0%,rgba(' + c + ',0) 70%);'
              + 'animation-duration:' + dur + 's;animation-delay:' + delay + 's"></span>';
      }
      box.innerHTML = html;
      box.style.setProperty("--fall", ((box.clientHeight || 300) + 26) + "px");
    });
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
