/*
 * Applies the stored theme before first paint, so there is no flash of the wrong
 * theme on load.
 *
 * This lives in a static file rather than an inline <script> for two reasons:
 * KB/security.md §4.2 rule 8 bans dangerouslySetInnerHTML, which is how inline
 * scripts are normally injected in React; and an external script needs no nonce
 * or hash, which keeps the Phase 2 Content-Security-Policy straightforward.
 *
 * Absence of a stored value is meaningful: it means "follow the system", which
 * the CSS already handles via prefers-color-scheme. So only an explicit choice
 * sets the attribute.
 */
(function () {
  try {
    var stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      document.documentElement.dataset.theme = stored;
    }
  } catch {
    // localStorage can throw in private-browsing modes. Falling through leaves
    // the system preference in effect, which is a fine default.
  }
})();
