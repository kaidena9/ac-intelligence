/* AC Intelligence — scroll engine (GSAP ScrollTrigger + Lenis) */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = !!(window.gsap && window.ScrollTrigger);
  var isMobile = window.matchMedia("(max-width:860px)").matches;

  /* Booking endpoint: set to a Calendly/Cal.com URL when ready; mailto fallback stays otherwise. */
  var BOOKING_URL = "";
  var bookBtn = document.getElementById("bookBtn");
  if (bookBtn && BOOKING_URL) {
    bookBtn.href = BOOKING_URL;
    bookBtn.target = "_blank";
    bookBtn.rel = "noopener";
  }

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

  /* ---- mobile menu ---- */
  var menuBtn = document.getElementById("menuBtn");
  var mobileMenu = document.getElementById("mobileMenu");
  function setMenu(open) {
    if (!menuBtn || !mobileMenu) return;
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      mobileMenu.hidden = false;
      requestAnimationFrame(function () { mobileMenu.classList.add("open"); });
      document.body.style.overflow = "hidden";
      if (window.__lenis) window.__lenis.stop();
      var first = mobileMenu.querySelector("a"); if (first) first.focus();
    } else {
      mobileMenu.classList.remove("open");
      document.body.style.overflow = "";
      if (window.__lenis) window.__lenis.start();
      window.setTimeout(function () { mobileMenu.hidden = true; }, 320);
      menuBtn.focus();
    }
  }
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", function () {
      setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
    });
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") setMenu(false);
    });
  }

  /* ---- smooth anchor scrolling that respects the fixed nav ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      if (window.__lenis) {
        e.preventDefault();
        window.__lenis.scrollTo(target, { offset: -84, duration: 1.15 });
      }
    });
  });

  /* ---- stats count-up (runs once when the CTA scrolls in) ---- */
  (function () {
    var stats = document.querySelector(".stats");
    if (!stats) return;
    var nums = Array.prototype.slice.call(stats.querySelectorAll("b[data-count]"));
    if (reduce || !("IntersectionObserver" in window)) return; // markup already holds final values
    var done = false;
    var sio = new IntersectionObserver(function (entries) {
      if (done || !entries.some(function (e) { return e.isIntersecting; })) return;
      done = true; sio.disconnect();
      var t0 = null;
      function tick(ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / 1100);
        var e = 1 - Math.pow(1 - p, 3);
        nums.forEach(function (b) { b.textContent = Math.round(+b.dataset.count * e); });
        if (p < 1) requestAnimationFrame(tick);
      }
      nums.forEach(function (b) { b.textContent = "0"; });
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    sio.observe(stats);
  })();

  /* mobile: tap a circle to flip it (scroll-driven flip is desktop-only) */
  if (isMobile) {
    document.querySelectorAll("#showcaseCards .fcard.flip").forEach(function (card) {
      card.addEventListener("click", function () { card.classList.toggle("flipped"); });
    });
  }

  /* ---- graceful fallback: no GSAP or reduced-motion → static, readable ---- */
  if (reduce || !hasGSAP) {
    var hw = document.querySelector(".hero-window"); if (hw) { hw.style.setProperty("--ws", "1"); hw.style.setProperty("--wx", "0px"); hw.style.opacity = "1"; }
    var hi = document.getElementById("heroInner"); if (hi) hi.style.opacity = "1";
    var hcp = document.getElementById("heroCopy"); if (hcp) { hcp.style.opacity = "1"; hcp.style.transform = "none"; }
    var scF = document.getElementById("scrollCue"); if (scF) scF.style.display = "none";
    var proc = document.getElementById("processPath");
    if (proc) {
      proc.style.setProperty("--fill", "1");
      proc.querySelectorAll(".pstep").forEach(function (s) { s.classList.add("active"); });
    }
    window.addEventListener("scroll", function () { navScroll(); }, { passive: true });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ---- Lenis smooth scroll wired to ScrollTrigger (single rAF source) ---- */
  var lenis = null;
  if (window.Lenis && !isMobile) {
    lenis = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 1 });
    window.__lenis = lenis;
    lenis.on("scroll", function (e) { ScrollTrigger.update(); navScroll(e.scroll); });
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  } else {
    window.addEventListener("scroll", function () { navScroll(); }, { passive: true });
  }

  var clamp = gsap.utils.clamp;

  /* ============================================================
     HERO: dashboard scales in over the skyfield, slides left,
     ops-hub copy enters. scrub is numeric for a soft catch-up feel.
     ============================================================ */
  var heroWindow = document.querySelector(".hero-window");
  var heroInner = document.getElementById("heroInner");
  var terrain = document.getElementById("heroTerrain");
  var scrollCue = document.getElementById("scrollCue");
  var heroCopy = document.getElementById("heroCopy");

  if (heroWindow && isMobile) {
    if (heroInner) heroInner.style.opacity = "1";
    heroWindow.style.opacity = "1";
    heroWindow.style.setProperty("--ws", "1");
    heroWindow.style.setProperty("--wx", "0px");
    if (scrollCue) scrollCue.style.display = "none";
  } else if (heroWindow) {
    var setTerY = terrain ? gsap.quickSetter(terrain, "yPercent") : null;
    var setTerS = terrain ? gsap.quickSetter(terrain, "scale") : null;
    // final scale must keep the window inside the band below the nav (96px)
    // and above the viewport bottom (28px). 1 when it already fits → crisp text.
    var fitScale = 1;
    function measureFit() {
      var h = heroWindow.offsetHeight;
      fitScale = h > 0 ? Math.min(1, (window.innerHeight - 124) / h) : 1;
    }
    measureFit();
    window.addEventListener("resize", measureFit, { passive: true });
    window.addEventListener("load", measureFit);
    ScrollTrigger.create({
      trigger: ".hero-stage",
      start: "top top",
      end: "bottom bottom",
      scrub: 0.7,
      onUpdate: function (self) {
        var p = self.progress;
        // Beat 1: centered headline fades out
        if (heroInner) {
          heroInner.style.opacity = clamp(0, 1, 1 - p / 0.26).toFixed(3);
          heroInner.style.pointerEvents = p > 0.24 ? "none" : "auto";
        }
        // Beat 2: dashboard scales in, then slides left.
        // Ends at exactly scale(1) with integer x so the text rasterizes crisp.
        heroWindow.style.setProperty("--ws", ((0.9 + clamp(0, 1, (p - 0.06) / 0.42) * 0.1) * fitScale).toFixed(4));
        var mv = clamp(0, 1, (p - 0.34) / 0.28);
        heroWindow.style.setProperty("--wx", Math.round(mv * -0.17 * window.innerWidth) + "px");
        // Beat 3: ops-hub copy slides in from the right
        // Beat 4: console + copy drift up and dim as the pin hands off — no dead scroll
        var fo = clamp(0, 1, (p - 0.86) / 0.14);
        var fy = (fo * -46).toFixed(1);
        heroWindow.style.opacity = (clamp(0, 1, (p - 0.06) / 0.22) * (1 - fo * 0.85)).toFixed(3);
        heroWindow.style.setProperty("--wy", fy + "px");
        if (heroCopy) {
          var cp = clamp(0, 1, (p - 0.48) / 0.30);
          heroCopy.style.opacity = (cp * (1 - fo * 0.85)).toFixed(3);
          heroCopy.style.transform = "translateY(calc(-50% + " + fy + "px)) translateX(" + ((1 - cp) * 44).toFixed(1) + "px)";
        }
        // slow Ken-Burns drift on the landscape
        if (setTerY) setTerY(-p * 6);
        if (setTerS) setTerS(1.05 + p * 0.1);
        if (scrollCue) scrollCue.style.opacity = clamp(0, 1, 1 - p * 4).toString();
      }
    });
  }

  /* ============================================================
     Showcase — pinned scroll story (scrubbed, reverses cleanly):
       1. discs flip to their info backs, hold, flip forward again
       2. discs gather into a fanned pile tucked into the envelope
     ============================================================ */
  (function () {
    var stage = document.querySelector(".showcase-stage");
    var pin = document.querySelector(".showcase-pin");
    var copy = document.querySelector(".showcase-copy");
    var gHead = document.querySelector(".gather-head");
    var ring = document.getElementById("orbitRing");
    var core = document.getElementById("orbitCore");
    var cards = gsap.utils.toArray("#showcaseCards .fcard");
    if (!stage || !pin || !copy || !cards.length) return;
    if (isMobile) return; // mobile: static grid + tap to flip

    function ss(t) { return t * t * (3 - 2 * t); }
    function ph(p, start, win) { return ss(clamp(0, 1, (p - start) / win)); }
    var PILE = 0.36;                       // disc size once in orbit
    var R = 200, OY = 0;                   // orbit radius + center offset (measured)
    cards.forEach(function (el, i) {
      el._inner = el.querySelector(".flip-inner");
      el._a0 = -Math.PI / 2 + (i / cards.length) * Math.PI * 2;  // even spacing, first at 12 o'clock
    });
    function measure() {
      cards.forEach(function (el) { gsap.set(el, { x: 0, y: 0, rotation: 0, scale: 1 }); });
      var pr = pin.getBoundingClientRect();
      var pcx = pr.left + pr.width / 2, pcy = pr.top + pr.height / 2;
      R = Math.min(pr.width, pr.height) * 0.19;
      // Keep the TOP of the orbit a clear gap below the gather-head text so the two
      // never overlap, at any viewport height. Drop the center down as far as needed.
      var GAP = 36;
      var cardHalf = (cards[0] ? cards[0].offsetWidth : 180) * PILE / 2;
      var ghBottom = pr.height * 0.30;
      if (gHead) ghBottom = gHead.getBoundingClientRect().bottom - pr.top;
      var centerY = Math.max(pr.height * 0.54, ghBottom + GAP + R + cardHalf);
      centerY = Math.min(centerY, pr.height - (R + cardHalf) - 28); // stay off the bottom edge
      OY = centerY - pr.height / 2;        // orbit center offset from the pin's vertical middle
      if (ring)  { ring.style.width = (R * 2) + "px"; ring.style.height = (R * 2) + "px"; ring.style.top = centerY + "px"; }
      if (core)  core.style.top = centerY + "px";
      cards.forEach(function (el) {
        var r = el.getBoundingClientRect();
        el._hx = pcx - (r.left + r.width / 2);
        el._hy = pcy + OY - (r.top + r.height / 2);
      });
    }
    measure();
    ScrollTrigger.addEventListener("refresh", measure);
    copy.style.opacity = "0"; /* fades in once the curtain has cleared the hero */
    if (gHead) gHead.style.opacity = "0";

    var FLIP_START = 0.34, FLIP_WIN = 0.13, FLIP_STAG = 0.012;
    var UNFLIP_START = 0.56;
    var GATHER_START = 0.76, GATHER_WIN = 0.20;
    var spinT = 0, lastP = 0;

    function apply(p) {
      var cout = ph(p, 0.72, 0.08);
      var cin = ph(p, 0.01, 0.06);
      copy.style.opacity = (cin * (1 - cout)).toFixed(3);
      gsap.set(copy, { x: 0, y: -cout * 24, xPercent: -50, yPercent: -50 });
      var g = ph(p, GATHER_START, GATHER_WIN);
      var oo = ph(p, GATHER_START + 0.03, 0.16).toFixed(3);
      if (ring) ring.style.opacity = oo;
      if (core) core.style.opacity = oo;
      cards.forEach(function (el, i) {
        // orbit target: even spacing around the core, drifting with spinT
        var ang = el._a0 + spinT;
        var gx = el._hx + Math.cos(ang) * R;
        var gy = el._hy + Math.sin(ang) * R;
        gsap.set(el, {
          x: gx * g,
          y: gy * g,
          rotation: 0,
          scale: 1 - (1 - PILE) * g
        });
        el.style.setProperty("--rim", (0.9 + g * 0.1).toFixed(3));
        el.style.setProperty("--rimw", (2.2 + g * 1.2).toFixed(2) + "px");
        if (el._inner) {
          var fb = ph(p, FLIP_START + i * FLIP_STAG, FLIP_WIN);
          var uf = ph(p, UNFLIP_START + i * FLIP_STAG, FLIP_WIN);
          el._inner.style.transform = "rotateY(" + (fb * 180 + uf * 180).toFixed(2) + "deg)";
        }
      });
      if (gHead) {
        var hin = ph(p, 0.78, 0.10);
        gHead.style.opacity = hin.toFixed(3);
        gHead.style.transform = "translateY(" + ((1 - hin) * 20).toFixed(1) + "px)";
      }
    }

    // the orbit keeps drifting while gathered, even with no scroll input
    gsap.ticker.add(function (t, dt) {
      if (ph(lastP, GATHER_START, GATHER_WIN) > 0) {
        spinT += (dt / 1000) * 0.22;
        apply(lastP);
      }
    });

    ScrollTrigger.create({
      trigger: ".showcase-stage", start: "top top", end: "bottom bottom", scrub: 0.7,
      onUpdate: function (self) { lastP = self.progress; apply(lastP); }
    });
  })();

  /* ---- live work embeds: scale the desktop-width iframes to their cards ---- */
  (function () {
    if (isMobile) return;
    var lives = document.querySelectorAll(".wc-live");
    if (!lives.length) return;
    function scaleAll() {
      lives.forEach(function (wrap) {
        var f = wrap.querySelector("iframe");
        if (!f) return;
        var s = wrap.clientWidth / 1200;
        var y = parseInt(f.dataset.y || "0", 10);   // crop offset into the page (at 1200px width)
        // fixed render height (data-h) keeps vh-based layouts stable while we crop;
        // without it, render just enough to fill the card.
        var rh = parseInt(f.dataset.h || "0", 10) || (y + Math.ceil(wrap.clientHeight / s));
        f.style.transform = "scale(" + s.toFixed(4) + ")";
        f.style.top = (-y * s).toFixed(1) + "px";
        f.style.height = rh + "px";
      });
    }
    lives.forEach(function (wrap) {
      var f = wrap.querySelector("iframe");
      if (f) f.addEventListener("load", function () { scaleAll(); f.classList.add("ready"); });
    });
    // load the heavy live embeds only when the reader is actually heading toward them
    if ("IntersectionObserver" in window) {
      var lio = new IntersectionObserver(function (en) {
        en.forEach(function (e) {
          if (!e.isIntersecting) return;
          var f = e.target.querySelector("iframe");
          if (f && f.dataset.src && !f.src) f.src = f.dataset.src;
          lio.unobserve(e.target);
        });
      }, { rootMargin: "1200px 0px" });
      lives.forEach(function (wrap) { lio.observe(wrap); });
    } else {
      lives.forEach(function (wrap) {
        var f = wrap.querySelector("iframe");
        if (f && f.dataset.src && !f.src) f.src = f.dataset.src;
      });
    }
    scaleAll();
    window.addEventListener("resize", scaleAll, { passive: true });
    window.addEventListener("load", scaleAll);
  })();

  /* ---- Approach: Find→Build→Run — the line draws in, steps light up ---- */
  (function () {
    var proc = document.getElementById("processPath");
    if (!proc) return;
    var steps = Array.prototype.slice.call(proc.querySelectorAll(".pstep"));
    ScrollTrigger.create({
      trigger: "#approach", start: "top 70%", end: "center 42%", scrub: 0.6,
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

  /* ---- why-us code window: lines boot in on first view ---- */
  (function () {
    var pre = document.querySelector(".why .code-block") || document.querySelector(".code-block");
    if (!pre || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    pre.innerHTML = pre.innerHTML.split("\n").map(function (l) {
      return '<span class="cl-line">' + (l || " ") + "</span>";
    }).join("\n");
    var lines = pre.querySelectorAll(".cl-line");
    var cio = new IntersectionObserver(function (en) {
      if (!en.some(function (e) { return e.isIntersecting; })) return;
      cio.disconnect();
      lines.forEach(function (l, i) { setTimeout(function () { l.classList.add("lit"); }, 90 * i); });
    }, { threshold: 0.35 });
    cio.observe(pre);
  })();

  /* ---- cursor-reactive life: magnetic buttons ---- */
  if (window.matchMedia("(pointer:fine)").matches) {
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

  /* layout settles after fonts/images: re-measure all triggers */
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  ScrollTrigger.refresh();
})();
