/* =================================================================
   theme.js — AARAA Technologies
   Accessible light/dark theme switcher.
   • Persists choice in localStorage ('aaraa-theme')
   • Falls back to system preference when no choice stored
   • Keeps aria-checked in sync · keyboard accessible (native button)
   The no-flash boot is inlined in <head>; this wires the toggle.
   ================================================================= */
(function () {
  "use strict";
  var KEY = "aaraa-theme";
  var root = document.documentElement;
  var media = window.matchMedia("(prefers-color-scheme: dark)");

  function current() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function sync(theme) {
    var toggles = document.querySelectorAll("[data-theme-toggle]");
    for (var i = 0; i < toggles.length; i++) {
      toggles[i].setAttribute("aria-checked", theme === "dark" ? "true" : "false");
      toggles[i].setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      );
    }
  }

  function apply(theme, persist) {
    root.setAttribute("data-theme", theme);
    sync(theme);
    if (persist) {
      try { localStorage.setItem(KEY, theme); } catch (e) {}
    }
  }

  // Initialise toggle state to whatever the boot script set.
  sync(current());

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-theme-toggle]");
    if (!btn) return;
    apply(current() === "dark" ? "light" : "dark", true);
  });

  // Respond to OS changes only when the user has not chosen explicitly.
  media.addEventListener("change", function (e) {
    var stored = null;
    try { stored = localStorage.getItem(KEY); } catch (err) {}
    if (!stored) apply(e.matches ? "dark" : "light", false);
  });
})();
