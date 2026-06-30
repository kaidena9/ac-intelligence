/* AC Intelligence — scroll engine (GSAP ScrollTrigger + Lenis) */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = !!(window.gsap && window.ScrollTrigger);

  /* ---- reveals (always on, independent of GSAP) ---- */
  var reveals = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); } });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---- nav solid-on-scroll ---- */
  var nav = document.getElementById("nav");
  function navScroll(y) { if (nav) nav.classList.toggle("scrolled", (y || window.scrollY) > 30); }
  navScroll();

  /* ---- graceful fallback: no GSAP or reduced-motion → static, readable ---- */
  if (reduce || !hasGSAP) {
    var hw = document.querySelector(".hero-window"); if (hw) hw.style.setProperty("--ws", "1");
    // lazy images still load
    document.querySelectorAll("img[data-src]").forEach(function (im) { im.src = im.getAttribute("data-src"); });
    window.addEventListener("scroll", function () { navScroll(); }, { passive: true });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---- Lenis smooth scroll wired to ScrollTrigger ---- */
  var lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 1 });
    window.__lenis = lenis;
    lenis.on("scroll", function (e) { ScrollTrigger.update(); navScroll(e.scroll); });
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  } else {
    window.addEventListener("scroll", function () { navScroll(); }, { passive: true });
  }

  /* lazy-load card images */
  document.querySelectorAll("img[data-src]").forEach(function (im) {
    var src = im.getAttribute("data-src");
    var pre = new Image(); pre.onload = function () { im.src = src; }; pre.src = src;
  });

  var clamp = gsap.utils.clamp;
  function rot(el) { var r = parseFloat(getComputedStyle(el).getPropertyValue("--r")) || 0; return r; }

  /* ============================================================
     HERO: window scales up + pins over parallax terrain, word cycle
     ============================================================ */
  var heroWindow = document.querySelector(".hero-window");
  var terrain = document.getElementById("heroTerrain");
  var stageWords = document.getElementById("stageWords");
  var swRot = document.getElementById("swRot");
  var scrollCue = document.getElementById("scrollCue");
  var heroWinBody = document.getElementById("heroWinBody");
  var words = ["automations", "dashboards", "agents", "lead gen", "strategy"];
  var lastIdx = -1;

  if (heroWindow) {
    ScrollTrigger.create({
      trigger: ".hero-stage",
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: function (self) {
        var p = self.progress;
        heroWindow.style.setProperty("--ws", (0.66 + p * 0.34).toFixed(4));
        if (terrain) gsap.set(terrain, { yPercent: -p * 16 });
        if (scrollCue) scrollCue.style.opacity = clamp(0, 1, 1 - p * 4).toString();
        // word overlay appears once the window has mostly filled
        var wp = clamp(0, 1, (p - 0.5) / 0.45);
        if (stageWords) stageWords.style.opacity = wp.toString();
        if (heroWinBody) heroWinBody.querySelector(".dash").style.opacity = (1 - wp).toString();
        if (wp > 0 && swRot) {
          var idx = Math.min(words.length - 1, Math.floor(wp * words.length));
          if (idx !== lastIdx) { swRot.textContent = words[idx]; lastIdx = idx; }
        }
      }
    });
  }

  /* ============================================================
     Parallax drift for a set of elements within a trigger section
     ============================================================ */
  function parallaxGroup(selector, triggerSel) {
    var els = Array.prototype.slice.call(document.querySelectorAll(selector));
    if (!els.length) return;
    els.forEach(function (el) {
      gsap.set(el, { rotation: rot(el) });
      el._setY = gsap.quickSetter(el, "y", "px");
      el._sp = parseFloat(el.dataset.speed) || 0;
    });
    ScrollTrigger.create({
      trigger: triggerSel,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      onUpdate: function (self) {
        var p = self.progress - 0.5; // -0.5 .. 0.5
        els.forEach(function (el) { el._setY(p * el._sp); });
      }
    });
  }

  parallaxGroup(".float-cards .fcard", ".scatter-stage");
  parallaxGroup(".chip-field .chip", ".chips");

  /* small entrance for floating cards / chips when section enters */
  gsap.utils.toArray(".float-cards .fcard").forEach(function (c, i) {
    gsap.from(c, { autoAlpha: 0, scale: 0.85, duration: 0.7, ease: "power2.out",
      scrollTrigger: { trigger: ".scatter-stage", start: "top 75%" }, delay: i * 0.05 });
  });
  gsap.utils.toArray(".chip-field .chip").forEach(function (c, i) {
    gsap.from(c, { autoAlpha: 0, y: 18, duration: 0.6, ease: "power2.out",
      scrollTrigger: { trigger: ".chips", start: "top 70%" }, delay: i * 0.04 });
  });

  ScrollTrigger.refresh();
})();
