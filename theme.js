/* ==========================================================================
   Marmotte – Hell/Dunkel-Umschaltung
   Im <head> OHNE defer/async einbinden, damit beim Laden nichts aufblitzt.

   - Ohne manuelle Wahl folgt die App der Systemeinstellung.
   - Die Wahl wird gespeichert und gilt für alle Marmotte-Apps auf dieser Adresse.
   - Jeder Button mit dem Attribut data-theme-toggle schaltet um und
     zeigt automatisch Sonne bzw. Mond (braucht icons.js).

   Für eigenen Code: MarmotteTheme.isDark(), .set("light"|"dark"|"auto"), .toggle()
   ========================================================================== */
(function () {
  var KEY = "marmotte-theme";
  var root = document.documentElement;
  var media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function stored() {
    try { return localStorage.getItem(KEY) || "auto"; } catch (e) { return "auto"; }
  }
  function isDark() {
    var s = stored();
    if (s === "dark") return true;
    if (s === "light") return false;
    return !!(media && media.matches);
  }
  function apply() {
    var s = stored();
    root.classList.toggle("dark", s === "dark");
    root.classList.toggle("light", s === "light");
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", isDark() ? "#1c1917" : "#f5f4f2");
    updateButtons();
  }
  function set(mode) {
    try {
      if (mode === "auto") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, mode);
    } catch (e) { /* Speicher gesperrt: Wahl gilt nur bis zum Neuladen */ }
    if (mode !== "auto") { root.classList.toggle("dark", mode === "dark"); root.classList.toggle("light", mode === "light"); }
    apply();
  }
  function toggle() { set(isDark() ? "light" : "dark"); }

  function updateButtons() {
    if (!document.body) return;
    var dark = isDark();
    document.querySelectorAll("[data-theme-toggle]").forEach(function (b) {
      b.innerHTML = '<i data-icon="' + (dark ? "sun" : "moon") + '"></i>';
      b.setAttribute("aria-label", dark ? "Heller Modus" : "Dunkler Modus");
      if (window.MarmotteIcons) window.MarmotteIcons.render(b);
    });
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-theme-toggle]");
    if (b) { e.preventDefault(); toggle(); }
  });
  if (media && media.addEventListener) media.addEventListener("change", apply);
  window.addEventListener("storage", function (e) { if (e.key === KEY) apply(); });
  document.addEventListener("DOMContentLoaded", apply);

  window.MarmotteTheme = { isDark: isDark, set: set, toggle: toggle, refresh: apply };
  apply();
})();
