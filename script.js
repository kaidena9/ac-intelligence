/* =========================================================
   AC Intelligence — script.js
   Nav scroll state · mobile menu · scroll reveals · hero parallax
   No localStorage / sessionStorage.
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Sticky nav: transparent -> dark on scroll ---- */
  var nav = document.getElementById("nav");
  var onScroll = function () {
    if (window.scrollY > 24) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Mobile hamburger menu ---- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");

  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.hidden = !open;
  }

  toggle.addEventListener("click", function () {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });
  menu.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });
  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setMenu(false);
      toggle.focus();
    }
  });
  window.addEventListener("resize", function () {
    if (window.innerWidth > 940) setMenu(false);
  });

  /* ---- Scroll reveals via IntersectionObserver ---- */
  var revealEls = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---- Hero device parallax (pointer-driven; sets CSS vars only) ---- */
  var stage = document.getElementById("heroStage");
  if (stage && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    var devices = stage.querySelectorAll(".device");
    var raf = null, targetX = 0, targetY = 0, curX = 0, curY = 0;

    function loop() {
      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;
      devices.forEach(function (d) {
        var depth = parseFloat(d.getAttribute("data-depth")) || 0.5;
        d.style.setProperty("--px", (curX * depth * 14).toFixed(2) + "px");
        d.style.setProperty("--py", (curY * depth * 10).toFixed(2) + "px");
      });
      if (Math.abs(targetX - curX) > 0.001 || Math.abs(targetY - curY) > 0.001) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = null;
      }
    }

    window.addEventListener("pointermove", function (e) {
      targetX = (e.clientX / window.innerWidth) * 2 - 1;
      targetY = (e.clientY / window.innerHeight) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
  }
})();
