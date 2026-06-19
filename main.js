/* AC Intelligence — scroll reveals · play button · contact form */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* scroll reveals */
  var els = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    els.forEach(function(el){ el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function(entries, obs){
      entries.forEach(function(en){ if (en.isIntersecting){ en.target.classList.add("in"); obs.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function(el){ io.observe(el); });
  }

  /* play button (reel placeholder until the motion video is added) */
  var play = document.getElementById("playBtn");
  if (play) play.addEventListener("click", function(){
    /* hook the fluid-AI reel here when the video is ready */
  });

  /* contact form */
  var form = document.getElementById("contactForm");
  if (form) {
    var note = document.getElementById("cformNote");
    form.addEventListener("submit", function(e){
      e.preventDefault();
      var name = (document.getElementById("cf-name").value || "").trim();
      var email = (document.getElementById("cf-email").value || "").trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!name || !ok) { note.textContent = "Add your name and a valid email."; return; }
      note.textContent = "Thanks " + name + " — we'll be in touch shortly.";
      form.reset();
    });
  }
})();
