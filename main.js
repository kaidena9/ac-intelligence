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

  /* mobile: tap a circle to flip it (scroll-driven flip is desktop-only) */
  if (window.matchMedia("(max-width:860px)").matches) {
    document.querySelectorAll("#showcaseCards .fcard.flip").forEach(function (card) {
      card.addEventListener("click", function () { card.classList.toggle("flipped"); });
    });
  }

  /* ---- capability chips: clustered seed → bloom outward (used by both paths) ---- */
  var chipLayout = (function () {
    var field = document.getElementById("chipField");
    var copy = document.querySelector(".chips-copy");
    if (!field) return null;
    var chips = Array.prototype.slice.call(field.querySelectorAll(".chip"));
    var ring = chips.filter(function (c) { return !c.classList.contains("big-chip"); });
    ring.forEach(function (c, i) {
      c._ca = (i / ring.length) * Math.PI * 2 - Math.PI / 2;   // cluster ring angle
      c._delay = (i % 4) * 0.05;                                // stagger → parallax depth
    });
    chips.forEach(function (c) {
      c._fx = parseFloat(c.dataset.fx); c._fy = parseFloat(c.dataset.fy);
      c._fr = parseFloat(c.dataset.r) || 0;
      if (c.classList.contains("big-chip")) { c._big = true; c._ca = 0; c._delay = 0; }
    });
    function ez(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function cl(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    return function (p, spin) {
      spin = spin || 0;
      var vw = field.clientWidth, vh = field.clientHeight;
      var cx = vw / 2, cy = vh * 0.44, R = Math.min(vw, vh) * 0.12;
      chips.forEach(function (c) {
        var t = ez(cl((p - c._delay) / (1 - c._delay)));
        var s = 1 - t;                                   // spin only while balled up, fades out on bloom
        var ang = c._ca + spin * s;                      // orbit around the centre
        var clx = c._big ? cx : cx + Math.cos(ang) * R;
        var cly = c._big ? cy : cy + Math.sin(ang) * R;
        var x = clx + (c._fx / 100 * vw - clx) * t;
        var y = cly + (c._fy / 100 * vh - cly) * t;
        var rot = c._fr * t;                            // centre chip stays still; ring orbits it
        c.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) +
          "px) translate(-50%,-50%) rotate(" + rot.toFixed(2) + "deg) scale(" + (0.84 + 0.16 * t).toFixed(3) + ")";
      });
      if (copy) copy.style.opacity = cl((p - 0.12) / 0.4).toFixed(3);
    };
  })();

  /* ---- graceful fallback: no GSAP or reduced-motion → static, readable ---- */
  if (reduce || !hasGSAP) {
    var hw = document.querySelector(".hero-window"); if (hw) { hw.style.setProperty("--ws", "1"); hw.style.setProperty("--wx", "0px"); hw.style.setProperty("--fill", "1"); hw.style.opacity = "1"; }
    var hi = document.getElementById("heroInner"); if (hi) hi.style.opacity = "1";
    var hcp = document.getElementById("heroCopy"); if (hcp) { hcp.style.opacity = "1"; hcp.style.transform = "none"; }
    var scF = document.getElementById("scrollCue"); if (scF) scF.style.display = "none";
    if (chipLayout) chipLayout(1);
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
  var heroInner = document.getElementById("heroInner");
  var terrain = document.getElementById("heroTerrain");
  var scrollCue = document.getElementById("scrollCue");
  var heroCopy = document.getElementById("heroCopy");

  /* KPI count-up: numbers tick from 0 to target as the dashboard fills in */
  var kpiItems = (function () {
    var out = [];
    document.querySelectorAll(".hero-window .kpi b").forEach(function (b) {
      var raw = b.textContent.trim();
      var num = parseInt(raw.replace(/[^0-9]/g, ""), 10);
      if (isNaN(num)) { out.push(null); return; }
      var pre = /^[−-]/.test(raw) ? "−" : "";
      var suf = raw.replace(/^[−-]?[0-9,]+/, "");
      b.dataset.t = num; b.dataset.pre = pre; b.dataset.suf = suf;
      b.textContent = pre + "0" + suf;
      out.push(b);
    });
    return out;
  })();
  // count-up driven by scroll progress: numbers tick from 0 → target as the parallax scrolls in
  function setCountUp(kp) {
    var e = 1 - Math.pow(1 - kp, 3); // ease-out
    kpiItems.forEach(function (b) {
      if (!b) return;
      b.textContent = b.dataset.pre + Math.round((+b.dataset.t) * e) + b.dataset.suf;
    });
  }
  setCountUp(0);

  if (heroWindow && window.matchMedia("(max-width:860px)").matches) {
    // mobile: static hero (headline + dashboard stacked, no pinned scrub)
    if (heroInner) heroInner.style.opacity = "1";
    heroWindow.style.opacity = "1";
    heroWindow.style.setProperty("--ws", "1");
    heroWindow.style.setProperty("--wx", "0px");
    heroWindow.style.setProperty("--fill", "1");
    if (scrollCue) scrollCue.style.display = "none";
  } else if (heroWindow) {
    ScrollTrigger.create({
      trigger: ".hero-stage",
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: function (self) {
        var p = self.progress;
        // Beat 1: centered headline fades out
        if (heroInner) {
          heroInner.style.opacity = clamp(0, 1, 1 - p / 0.26).toFixed(3);
          heroInner.style.pointerEvents = p > 0.24 ? "none" : "auto";
        }
        // Beat 2: dashboard scales in, then slides to the left
        heroWindow.style.setProperty("--ws", (0.64 + clamp(0, 1, (p - 0.06) / 0.42) * 0.06).toFixed(4));
        heroWindow.style.opacity = clamp(0, 1, (p - 0.06) / 0.22).toFixed(3);
        var mv = clamp(0, 1, (p - 0.34) / 0.28);
        heroWindow.style.setProperty("--wx", (mv * -0.15 * window.innerWidth).toFixed(1) + "px");
        // final scroll: frosted glass solidifies into an opaque app window
        heroWindow.style.setProperty("--fill", clamp(0, 1, (p - 0.70) / 0.22).toFixed(3));
        // Beat 3: OneHub copy slides in from the right
        if (heroCopy) {
          var cp = clamp(0, 1, (p - 0.48) / 0.30);
          heroCopy.style.opacity = cp.toFixed(3);
          heroCopy.style.transform = "translateY(-50%) translateX(" + ((1 - cp) * 44).toFixed(1) + "px)";
        }
        // slow Ken-Burns zoom on the backdrop image
        if (terrain) gsap.set(terrain, { scale: 1.05 + p * 0.10, yPercent: -p * 6 });
        if (scrollCue) scrollCue.style.opacity = clamp(0, 1, 1 - p * 4).toString();
        setCountUp(clamp(0, 1, (p - 0.12) / 0.38));
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

  /* ============================================================
     Showcase — pinned scroll story (fully scrubbed, reverses on scroll-up):
       1. copy slides in from the left; cards deal in from the right
       2. all cards FLIP to their info backs, hold, then flip back to front
       3. cards gather into a fanned pile at centre + closing heading rises
     ============================================================ */
  (function () {
    var stage = document.querySelector(".showcase-stage");
    var pin = document.querySelector(".showcase-pin");
    var copy = document.querySelector(".showcase-copy");
    var gHead = document.querySelector(".gather-head");
    var envBack = document.querySelector(".env-back");
    var envFront = document.querySelector(".env-front");
    var cards = gsap.utils.toArray("#showcaseCards .fcard");
    if (!stage || !pin || !copy || !cards.length) return;
    if (window.matchMedia("(max-width:860px)").matches) return; // mobile: static grid

    function ss(t) { return t * t * (3 - 2 * t); }            // smoothstep
    function ph(p, start, win) { return ss(clamp(0, 1, (p - start) / win)); }
    var PILE = 0.5;                                           // circle size once tucked into the envelope
    cards.forEach(function (el, i) {
      el._inner = el.querySelector(".flip-inner");
      el._fanRot = (i - 2.5) * 8;                             // fanned spread, like a hand of cards
      el._fanX = (i - 2.5) * 30;                              // wider spread to fill the envelope lip
      el._fanY = (i - 2.5) * (i - 2.5) * 1.6 - 3;             // edges arc down into the pocket
      el._depth = 0.7 + (i % 3) * 0.18;                       // varied rise distance → parallax
    });
    // per-card offset from its grid spot to the pin centre (layout delta, scroll-independent)
    function measure() {
      cards.forEach(function (el) { gsap.set(el, { x: 0, y: 0, rotation: 0, scale: 1 }); });
      var pr = pin.getBoundingClientRect();
      var pcx = pr.left + pr.width / 2, pcy = pr.top + pr.height / 2;
      cards.forEach(function (el) {
        var r = el.getBoundingClientRect();
        el._hx = pcx - (r.left + r.width / 2);
        el._hy = pcy - (r.top + r.height / 2);
      });
    }
    measure();
    ScrollTrigger.addEventListener("refresh", measure);
    // circles + text are ALREADY present (the curtain reveals them, not a black screen)
    copy.style.opacity = "1";
    if (gHead) gHead.style.opacity = "0";

    // phase windows (progress 0→1) — no deal-in; the reveal shows content at rest
    var FLIP_START = 0.34, FLIP_WIN = 0.13, FLIP_STAG = 0.012;   // flip to back
    var UNFLIP_START = 0.56;                                     // flip back to front
    var GATHER_START = 0.76, GATHER_WIN = 0.20;

    ScrollTrigger.create({
      trigger: ".showcase-stage", start: "top top", end: "bottom bottom", scrub: true,
      onUpdate: function (self) {
        var p = self.progress;
        // copy: sits centred and present, fades out only as the gather begins
        var cout = ph(p, 0.72, 0.08);
        copy.style.opacity = (1 - cout).toFixed(3);
        gsap.set(copy, { x: 0, y: -cout * 24, xPercent: -50, yPercent: -50 });
        // gather progress
        var g = ph(p, GATHER_START, GATHER_WIN);
        // the folder (back wall + front pocket) fades in as the circles tuck into it
        var eo = ph(p, GATHER_START + 0.03, 0.16).toFixed(3);
        if (envBack) envBack.style.opacity = eo;
        if (envFront) envFront.style.opacity = eo;
        cards.forEach(function (el, i) {
          var gx = el._hx + el._fanX, gy = el._hy + el._fanY;   // sit at centre; pocket covers ~70%
          gsap.set(el, {
            x: gx * g,
            y: gy * g,
            rotation: el._fanRot * g,
            scale: 1 - (1 - PILE) * g
          });
          el.style.opacity = "1";
          // stronger, fully-black rim as they seat into the envelope
          el.style.setProperty("--rim", (0.6 + g * 0.4).toFixed(3));
          el.style.setProperty("--rimw", (1.5 + g * 1.6).toFixed(2) + "px");
          // scroll-driven flip: 0 → 180 (show back) → 360 (front again)
          if (el._inner) {
            var fb = ph(p, FLIP_START + i * FLIP_STAG, FLIP_WIN);
            var uf = ph(p, UNFLIP_START + i * FLIP_STAG, FLIP_WIN);
            el._inner.style.transform = "rotateY(" + (fb * 180 + uf * 180).toFixed(2) + "deg)";
          }
        });
        // closing heading rises in above the pile
        if (gHead) {
          var hin = ph(p, 0.82, 0.13);
          gHead.style.opacity = hin.toFixed(3);
          gHead.style.transform = "translateY(" + ((1 - hin) * 20).toFixed(1) + "px)";
        }
      }
    });
  })();

  /* ---- Approach: Find→Build→Run — the connecting line draws in, steps light up ---- */
  (function () {
    var proc = document.getElementById("processPath");
    if (!proc) return;
    var steps = Array.prototype.slice.call(proc.querySelectorAll(".pstep"));
    ScrollTrigger.create({
      trigger: "#contact", start: "top 72%", end: "center 42%", scrub: true,
      onUpdate: function (self) {
        var f = self.progress;
        proc.style.setProperty("--fill", f.toFixed(3));
        steps.forEach(function (s, i) {
          var th = steps.length > 1 ? (i / (steps.length - 1)) * 0.92 : 0;
          s.classList.toggle("active", f >= th);
        });
      }
    });
  })();

  /* capability chips: clustered seed blooms outward, pinned in one frame */
  if (chipLayout) {
    var chipP = 0, chipSpin = 0;
    chipLayout(0, 0);
    // continuous slow spin while balled up; scroll drives the bloom (spin fades out on bloom)
    gsap.ticker.add(function () { chipSpin += 0.006; chipLayout(chipP, chipSpin); });
    ScrollTrigger.create({
      trigger: ".chips", start: "top top", end: "bottom bottom", scrub: true,
      onUpdate: function (self) { chipP = self.progress; }
    });
    window.addEventListener("resize", function () { chipLayout(chipP, chipSpin); });
  }

  /* ---- cursor-reactive life: hero window tilt + magnetic buttons ---- */
  if (window.matchMedia("(pointer:fine)").matches) {
    if (heroWindow) {
      window.addEventListener("mousemove", function (e) {
        var nx = e.clientX / window.innerWidth - 0.5;
        var ny = e.clientY / window.innerHeight - 0.5;
        heroWindow.style.setProperty("--ty", (nx * 6).toFixed(2) + "deg");
        heroWindow.style.setProperty("--tx", (-ny * 5).toFixed(2) + "deg");
      }, { passive: true });
    }
    document.querySelectorAll(".btn").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        b.style.transform = "translate(" + (dx * 8).toFixed(1) + "px," + (dy * 6 - 4).toFixed(1) + "px) scale(1.035)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  ScrollTrigger.refresh();
})();
