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

  /* ------------------------------------------------------------------------
     Zurück zum Dashboard: Logo und App-Name in der Kopfzeile (.topbar .brand)
     antippen. Gilt automatisch für alle Apps mit dieser Kopfzeile.
     - Ausschalten für eine einzelne Kopfzeile: <div class="brand" data-kein-dashboard>
     - Eine App kann das Verlassen verhindern (z.B. ungespeicherte Eingaben):
         window.addEventListener("marmotte:verlassen", function (e) {
           if (!confirm("…")) e.preventDefault();
         });
     ------------------------------------------------------------------------ */
  var DASHBOARD = "https://bakerymarmotte-cmyk.github.io/marmotte-dashboard/";

  function dashboardLinks() {
    if (location.href.indexOf(DASHBOARD) === 0) return;   // im Dashboard selbst nicht
    document.querySelectorAll(".topbar .brand").forEach(function (b) {
      if (b.hasAttribute("data-kein-dashboard") || b.hasAttribute("data-dashboard")) return;
      b.setAttribute("data-dashboard", "");
      b.setAttribute("role", "link");
      b.setAttribute("tabindex", "0");
      b.setAttribute("title", "Zum Dashboard");
      b.setAttribute("aria-label", "Zum Dashboard");
    });
  }
  function zumDashboard() {
    var ev;
    try { ev = new CustomEvent("marmotte:verlassen", { cancelable: true }); }
    catch (e) { ev = document.createEvent("CustomEvent"); ev.initCustomEvent("marmotte:verlassen", false, true, null); }
    if (!window.dispatchEvent(ev)) return;               // App hat abgebrochen
    location.href = DASHBOARD;
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-dashboard]");
    if (b) { e.preventDefault(); zumDashboard(); }
  });
  document.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.hasAttribute && e.target.hasAttribute("data-dashboard")) {
      e.preventDefault(); zumDashboard();
    }
  });
  document.addEventListener("DOMContentLoaded", dashboardLinks);

  window.MarmotteTheme = { isDark: isDark, set: set, toggle: toggle, refresh: apply, zumDashboard: zumDashboard };
  apply();
})();
