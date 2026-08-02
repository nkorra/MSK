/*!
 * MSK Anti-Spam Telemetry (Phase 3)
 * ---------------------------------
 * SITE COPY NOTE (mskprecisiongroup.com / MSK-Website repo):
 * This file is a direct port of the reference implementation from the ERP
 * repo (MSK_ERP/anti_spam/static/anti_spam/telemetry.js), with exactly one
 * addition: a `telemetry_id` (random per-page-load correlation token, not a
 * persistent identifier — regenerated on every load like everything else
 * here) added to `collect()`'s output and to the hidden-field injection list
 * below. Everything else is unchanged from the ERP source, so future updates
 * can be re-synced by diffing against that file. If re-syncing, re-apply the
 * `telemetry_id` addition (search "SITE ADDITION" below).
 * ---------------------------------
 * Reusable, dependency-free client telemetry for PUBLIC forms (contact/enquiry,
 * job application, RFQ/quote, vendor registration, internship, chatbot).
 *
 * It collects two security-only signals and attaches them to a submission:
 *   1. A browser/device fingerprint (browser, OS, language, timezone, screen,
 *      colour depth, platform, + optional canvas/WebGL) used by the backend
 *      ONLY to correlate abusive devices.
 *   2. Behaviour timing (page-load / first-interaction / submit timestamps and
 *      keyboard/mouse/scroll flags) used ONLY to tell humans from bots.
 *
 * PRIVACY (by design):
 *   - No cookies, no localStorage, no persistent identifiers.
 *   - Nothing is stored or read across page loads; every signal is recomputed
 *     fresh per page and used solely for anti-spam/security scoring.
 *   - No browsing history, page content, keystroke content or mouse paths are
 *     captured — only boolean "did any interaction happen" flags and timings.
 *
 * GRACEFUL DEGRADATION:
 *   - Every collector is wrapped so it can never throw into your form submit.
 *   - If JavaScript is disabled the form still submits with no telemetry; the
 *     backend treats absent telemetry as NEUTRAL (never as spam).
 *
 * USAGE:
 *   Auto-attach (recommended): add `data-msk-antispam` to each public form, and
 *   include this script once:
 *       <script src="/static/anti_spam/telemetry.js" defer></script>
 *       <form data-msk-antispam action="/website-chatbot/api/enquiry/" method="post"> ... </form>
 *   Or attach every form on the page:
 *       <script src="/static/anti_spam/telemetry.js" data-attach="all" defer></script>
 *
 *   Manual / AJAX forms:
 *       const payload = Object.assign({}, formData, window.MSKAntiSpam.collect());
 */
(function (global) {
  "use strict";

  var HONEYPOT_NAME = "company_website";
  var pageLoadTs = Date.now();
  var firstInteractionTs = null;
  var hadKeyboard = false;
  var hadMouse = false;
  var hadScroll = false;

  // SITE ADDITION: one random correlation id per page load (not persisted,
  // not a tracking identifier — regenerated on every navigation, same as
  // every other signal in this file).
  function generateTelemetryId() {
    try {
      if (global.crypto && typeof global.crypto.randomUUID === "function") {
        return global.crypto.randomUUID();
      }
    } catch (e) { /* fall through */ }
    return "tid-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
  }
  var telemetryId = generateTelemetryId();

  function markInteraction() {
    if (firstInteractionTs === null) firstInteractionTs = Date.now();
  }

  function bindInteractionListeners() {
    try {
      var opts = { passive: true, capture: true };
      global.addEventListener("keydown", function () { hadKeyboard = true; markInteraction(); }, opts);
      global.addEventListener("mousemove", function () { hadMouse = true; markInteraction(); }, opts);
      global.addEventListener("pointermove", function () { hadMouse = true; markInteraction(); }, opts);
      global.addEventListener("scroll", function () { hadScroll = true; markInteraction(); }, opts);
      global.addEventListener("wheel", function () { hadScroll = true; markInteraction(); }, opts);
      global.addEventListener("touchmove", function () { hadScroll = true; hadMouse = true; markInteraction(); }, opts);
    } catch (e) { /* never block */ }
  }

  function safe(fn, fallback) {
    try { return fn(); } catch (e) { return fallback; }
  }

  function detectBrowser(ua) {
    ua = ua || "";
    if (/Edg\//.test(ua)) return "Edge";
    if (/OPR\//.test(ua) || /Opera/.test(ua)) return "Opera";
    if (/Firefox\//.test(ua)) return "Firefox";
    if (/Chrome\//.test(ua)) return "Chrome";
    if (/Safari\//.test(ua)) return "Safari";
    if (/MSIE|Trident/.test(ua)) return "IE";
    return "Other";
  }

  function detectOS(ua, platform) {
    ua = ua || ""; platform = platform || "";
    if (/Windows/.test(ua)) return "Windows";
    if (/Android/.test(ua)) return "Android";
    if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
    if (/Mac/.test(ua) || /Mac/.test(platform)) return "macOS";
    if (/Linux/.test(ua) || /Linux/.test(platform)) return "Linux";
    return "Other";
  }

  function canvasHash() {
    return safe(function () {
      var canvas = document.createElement("canvas");
      var ctx = canvas.getContext("2d");
      if (!ctx) return "";
      ctx.textBaseline = "top";
      ctx.font = "14px 'Arial'";
      ctx.fillStyle = "#069";
      ctx.fillText("msk-antispam", 2, 2);
      var data = canvas.toDataURL();
      var h = 0;
      for (var i = 0; i < data.length; i++) {
        h = (h * 31 + data.charCodeAt(i)) | 0;
      }
      return String(h >>> 0);
    }, "");
  }

  function webglRenderer() {
    return safe(function () {
      var canvas = document.createElement("canvas");
      var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) return "";
      var info = gl.getExtension("WEBGL_debug_renderer_info");
      if (!info) return "";
      return String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL) || "");
    }, "");
  }

  function timezone() {
    return safe(function () {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    }, "");
  }

  function screenResolution() {
    return safe(function () {
      return (global.screen.width || 0) + "x" + (global.screen.height || 0);
    }, "");
  }

  function buildFingerprint() {
    var nav = global.navigator || {};
    var ua = nav.userAgent || "";
    var platform = nav.platform || "";
    return {
      browser: detectBrowser(ua),
      os: detectOS(ua, platform),
      language: nav.language || "",
      timezone: timezone(),
      screen_resolution: screenResolution(),
      color_depth: safe(function () { return String(global.screen.colorDepth || ""); }, ""),
      platform: platform,
      canvas: canvasHash(),
      webgl: webglRenderer()
    };
  }

  /**
   * Collect the full telemetry payload. Returns a flat object whose keys match
   * exactly what the anti_spam backend reads.
   */
  function collect() {
    return safe(function () {
      var nav = global.navigator || {};
      var now = Date.now();
      var fp = buildFingerprint();
      return {
        browser_fingerprint: fp,
        telemetry_id: telemetryId, // SITE ADDITION
        page_load_ts: pageLoadTs,
        first_interaction_ts: firstInteractionTs,
        submit_ts: now,
        time_on_page: now - pageLoadTs,
        had_keyboard: hadKeyboard,
        had_mouse: hadMouse,
        had_scroll: hadScroll,
        // Convenience duplicates at the top level (also present in fingerprint).
        timezone: fp.timezone,
        language: fp.language,
        screen_resolution: fp.screen_resolution,
        color_depth: fp.color_depth,
        platform: fp.platform
      };
    }, {});
  }

  function setHidden(form, name, value) {
    var field = form.querySelector('input[type="hidden"][name="' + name + '"]');
    if (!field) {
      field = document.createElement("input");
      field.type = "hidden";
      field.name = name;
      form.appendChild(field);
    }
    field.value = value == null ? "" : String(value);
  }

  function ensureHoneypot(form) {
    if (form.querySelector('[name="' + HONEYPOT_NAME + '"]')) return;
    var wrap = document.createElement("div");
    wrap.setAttribute("aria-hidden", "true");
    wrap.style.cssText = "position:absolute;left:-10000px;top:auto;width:1px;height:1px;overflow:hidden;";
    var hp = document.createElement("input");
    hp.type = "text";
    hp.name = HONEYPOT_NAME;
    hp.tabIndex = -1;
    hp.setAttribute("autocomplete", "off");
    wrap.appendChild(hp);
    form.appendChild(wrap);
  }

  /**
   * Inject telemetry into a standard (non-AJAX) form just before it submits.
   */
  function injectIntoForm(form) {
    var data = collect();
    setHidden(form, "browser_fingerprint", JSON.stringify(data.browser_fingerprint || {}));
    var flat = ["telemetry_id", "page_load_ts", "first_interaction_ts", "submit_ts", "time_on_page",
      "had_keyboard", "had_mouse", "had_scroll", "timezone", "language",
      "screen_resolution", "color_depth", "platform"];
    for (var i = 0; i < flat.length; i++) {
      setHidden(form, flat[i], data[flat[i]]);
    }
  }

  /**
   * Attach to a standard HTML form: ensures a honeypot exists and fills the
   * telemetry hidden fields synchronously on submit (so a non-prevented submit
   * still carries them). Never blocks or cancels the submission.
   */
  function attach(form) {
    if (!form || form.__mskAntiSpamAttached) return;
    form.__mskAntiSpamAttached = true;
    try { ensureHoneypot(form); } catch (e) { /* ignore */ }
    form.addEventListener("submit", function () {
      try { injectIntoForm(form); } catch (e) { /* never block submit */ }
    }, true);
  }

  /**
   * Merge telemetry into a plain object for AJAX / fetch submitters.
   */
  function applyTo(payload) {
    payload = payload || {};
    var data = collect();
    for (var key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key) && !(key in payload)) {
        payload[key] = data[key];
      }
    }
    return payload;
  }

  function autoAttach() {
    var script = document.currentScript ||
      document.querySelector('script[data-msk-antispam-telemetry]');
    var attachAll = script && script.getAttribute("data-attach") === "all";
    var forms = document.querySelectorAll(attachAll ? "form" : "form[data-msk-antispam]");
    for (var i = 0; i < forms.length; i++) attach(forms[i]);
  }

  bindInteractionListeners();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoAttach);
  } else {
    autoAttach();
  }

  global.MSKAntiSpam = {
    collect: collect,
    attach: attach,
    applyTo: applyTo,
    fingerprint: buildFingerprint,
    HONEYPOT_NAME: HONEYPOT_NAME
  };
})(typeof window !== "undefined" ? window : this);
