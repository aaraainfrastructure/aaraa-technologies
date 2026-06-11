/* =================================================================
   animations.js — AARAA Technologies
   Scroll reveal (IntersectionObserver) · animated counters ·
   subtle hero parallax. Fully respects prefers-reduced-motion.
   ================================================================= */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var reveals = document.querySelectorAll(".reveal");
  var counters = document.querySelectorAll("[data-counter]");

  function runCounter(el) {
    var target = parseFloat((el.getAttribute("data-counter") || "0").replace(/[^0-9.]/g, ""));
    var suffix = el.getAttribute("data-suffix") || "";
    var prefix = el.getAttribute("data-prefix") || "";
    if (isNaN(target)) { return; }
    if (reduce) { el.textContent = prefix + target + suffix; return; }
    var dur = 1700, t0 = null;
    function frame(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var v = target * eased;
      var out = (target % 1 === 0) ? Math.round(v).toLocaleString() : v.toFixed(1);
      el.textContent = prefix + out + suffix;
      if (p < 1) window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }

  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        if (entry.target.hasAttribute("data-counter")) runCounter(entry.target);
        obs.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

    reveals.forEach(function (el) { io.observe(el); });
    counters.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
    counters.forEach(runCounter);
  }

  /* Hero parallax — transform only (no layout shift) */
  var glow = document.querySelector(".hero-glow");
  if (glow && !reduce) {
    window.addEventListener("scroll", function () {
      window.requestAnimationFrame(function () {
        var sy = window.scrollY || 0;
        glow.style.transform = "translateY(" + sy * 0.18 + "px)";
      });
    }, { passive: true });
  }
})();
