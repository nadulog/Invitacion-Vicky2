// Cuenta regresiva (hora Argentina) — 23 de enero de 2027, 22:00
(function () {
  var EVENT_DATE = new Date(document.body.getAttribute("data-event-date") || "2027-01-23T22:00:00-03:00").getTime();
  var els = {};
  ["days", "hours", "minutes", "seconds"].forEach(function (unit) {
    els[unit] = document.querySelector('[data-unit="' + unit + '"]');
  });

  function pad(n) { return String(n).padStart(2, "0"); }
  function set(el, value) { if (el.textContent !== value) el.textContent = value; }

  function tick() {
    var s = Math.floor(Math.max(0, EVENT_DATE - Date.now()) / 1000);
    set(els.days, pad(Math.floor(s / 86400)));
    set(els.hours, pad(Math.floor((s % 86400) / 3600)));
    set(els.minutes, pad(Math.floor((s % 3600) / 60)));
    set(els.seconds, pad(s % 60));
  }

  tick();
  setInterval(tick, 1000);
})();

// Copiar al portapapeles con aviso
function copyText(text, toast, message) {
  function done() {
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toast.classList.remove("is-visible"); }, 2200);
  }
  function fallback() {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    (toast.closest("dialog") || document.body).appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); done(); } catch (_e) { toast.textContent = "No se pudo copiar"; toast.classList.add("is-visible"); }
    ta.remove();
  }
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback);
  else fallback();
}

// Modales: abrir, cerrar con X o tocando afuera
function setupModal(modal, openSelector, closeSelector) {
  document.querySelector(openSelector).addEventListener("click", function () { modal.showModal(); });
  modal.querySelector(closeSelector).addEventListener("click", function () { modal.close(); });
  modal.addEventListener("click", function (e) {
    var r = modal.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) modal.close();
  });
}

(function () {
  var modal = document.querySelector(".location-modal");
  setupModal(modal, "[data-open-location]", "[data-close-location]");
  modal.querySelector("[data-copy-location]").addEventListener("click", function () {
    copyText("Salón Mega Eventos Sur – Av. Rodríguez Peña 1799, Santos Lugares, Buenos Aires", modal.querySelector(".toast"), "¡Dirección copiada!");
  });
})();

(function () {
  var modal = document.querySelector(".gift-modal");
  setupModal(modal, "[data-open-gifts]", "[data-close-gifts]");
  modal.querySelector("[data-copy-alias]").addEventListener("click", function () {
    copyText("VICKY.FERNANDEZ24MP", modal.querySelector(".toast"), "¡Alias copiado!");
  });
})();

// Vinilo: el disco que gira se muestra recién cuando también cargó el brazo que va encima
(function () {
  var vinyl = document.querySelector(".vinyl");
  if (!vinyl) return;
  var imgs = [vinyl.querySelector(".vinyl__disc"), document.querySelector(".vinyl-arm")];
  var left = imgs.length;
  function done() { if (--left === 0) vinyl.classList.add("is-ready"); }
  imgs.forEach(function (im) {
    if (!im || (im.complete && im.naturalWidth)) done();
    else { im.addEventListener("load", done); im.addEventListener("error", done); }
  });
})();
