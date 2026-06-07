/* =========================================================
   AC Intelligence — script.js
   Nav scroll state · mobile menu · scroll reveals
   No localStorage / sessionStorage.
   ========================================================= */
(function () {
  "use strict";

  /* ---- Sticky nav: transparent -> dark on scroll ---- */
  var nav = document.getElementById("nav");
  var onScroll = function () {
    if (window.scrollY > 24) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Mobile hamburger menu ---- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");

  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (open) {
      menu.hidden = false;
    } else {
      menu.hidden = true;
    }
  }

  toggle.addEventListener("click", function () {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });

  // Close menu when a link is tapped or on resize to desktop
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
    if (window.innerWidth > 768) setMenu(false);
  });

  /* ---- Scroll reveals via IntersectionObserver ---- */
  var revealEls = document.querySelectorAll(".reveal");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el) { io.observe(el); });
  }
})();
