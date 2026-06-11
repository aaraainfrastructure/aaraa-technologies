/* =================================================================
   main.js — AARAA Technologies
   UI behaviour: sticky header · mobile nav · scroll progress ·
   back-to-top · sticky CTA · accordion · hero slider ·
   testimonial slider · contact form · footer year.
   No dependencies. All listeners passive where possible.
   ================================================================= */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Sticky header / scroll progress / back-to-top / sticky CTA ---------- */
  var header = document.getElementById("siteHeader");
  var bar = document.getElementById("scrollProgress");
  var toTop = document.getElementById("backToTop");
  var stickyCta = document.getElementById("stickyCta");
  var ticking = false;

  function onScroll() {
    var sy = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle("is-scrolled", sy > 8);
    if (bar) {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (sy / max) * 100 : 0) + "%";
    }
    if (toTop) toTop.classList.toggle("show", sy > 600);
    if (stickyCta) stickyCta.classList.toggle("show", sy > 700);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  if (toTop) toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });

  /* ---------- Mobile navigation ---------- */
  var navToggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNav");
  function closeNav() {
    if (!navToggle || !mobileNav) return;
    navToggle.setAttribute("aria-expanded", "false");
    mobileNav.classList.remove("open");
    document.body.style.overflow = "";
  }
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      mobileNav.classList.toggle("open", !open);
      document.body.style.overflow = open ? "" : "hidden";
    });
    mobileNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---------- Accordion (FAQ) ---------- */
  var triggers = document.querySelectorAll(".accordion-trigger");
  triggers.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var expanded = btn.getAttribute("aria-expanded") === "true";
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      btn.setAttribute("aria-expanded", String(!expanded));
      if (panel) panel.classList.toggle("open", !expanded);
    });
  });

  /* ---------- Generic fade slider factory ---------- */
  function fadeSlider(rootEl, opts) {
    opts = opts || {};
    var slides = rootEl.querySelectorAll("[data-slide]");
    if (slides.length < 2 && !opts.alwaysDots) {
      // still expose for single slide
    }
    var dotsWrap = rootEl.querySelector("[data-dots]");
    var prev = rootEl.querySelector("[data-prev]");
    var next = rootEl.querySelector("[data-next]");
    var idx = 0, timer = null;
    var count = slides.length;

    if (dotsWrap) {
      for (var i = 0; i < count; i++) {
        var d = document.createElement("button");
        d.type = "button";
        d.setAttribute("role", "tab");
        d.setAttribute("aria-label", "Show slide " + (i + 1));
        d.dataset.idx = i;
        dotsWrap.appendChild(d);
      }
    }
    var dots = dotsWrap ? dotsWrap.children : [];

    function show(n) {
      idx = (n + count) % count;
      for (var s = 0; s < count; s++) slides[s].classList.toggle("active", s === idx);
      for (var k = 0; k < dots.length; k++) dots[k].setAttribute("aria-selected", k === idx ? "true" : "false");
      if (opts.translate) {
        var track = rootEl.querySelector("[data-track]");
        if (track) track.style.transform = "translateX(-" + idx * 100 + "%)";
      }
    }
    function go(n) { show(n); restart(); }
    function start() { if (!reduce && opts.autoplay && count > 1) timer = window.setInterval(function () { show(idx + 1); }, opts.interval || 6000); }
    function stop() { window.clearInterval(timer); }
    function restart() { stop(); start(); }

    if (next) next.addEventListener("click", function () { go(idx + 1); });
    if (prev) prev.addEventListener("click", function () { go(idx - 1); });
    if (dotsWrap) dotsWrap.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (b) go(parseInt(b.dataset.idx, 10));
    });

    // Pause on hover & focus
    rootEl.addEventListener("mouseenter", stop);
    rootEl.addEventListener("mouseleave", restart);
    rootEl.addEventListener("focusin", stop);
    rootEl.addEventListener("focusout", restart);

    // Keyboard
    rootEl.setAttribute("tabindex", rootEl.getAttribute("tabindex") || "0");
    rootEl.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); go(idx + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); go(idx - 1); }
    });

    // Touch swipe
    var x0 = null;
    rootEl.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; stop(); }, { passive: true });
    rootEl.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) { dx < 0 ? go(idx + 1) : go(idx - 1); }
      else restart();
      x0 = null;
    }, { passive: true });

    show(0); start();
  }

  /* ---------- Hero slider ---------- */
  var hero = document.getElementById("heroSlider");
  if (hero) fadeSlider(hero, { autoplay: true, interval: 6500 });

  /* ---------- Testimonial slider ---------- */
  var tst = document.getElementById("testimonialSlider");
  if (tst) fadeSlider(tst, { autoplay: true, interval: 7000, translate: true, alwaysDots: true });

  /* ---------- Contact form (placeholder handler) ---------- */
  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var ok = document.getElementById("formSuccess");
      // Submit endpoint: wire this to your email service or CRM (e.g. /api/contact).
      if (ok) ok.classList.add("show");
      form.reset();
    });
  }
})();
