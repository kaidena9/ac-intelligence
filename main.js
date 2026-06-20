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
