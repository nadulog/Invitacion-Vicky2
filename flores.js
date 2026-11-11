// Florcitas que caen suavemente al hacer scroll: fotos de flores celestes recortadas
// (assets/flor-1.webp, flor-2.webp, flor-3.webp), chiquitas para que no tapen el contenido.
// Solo aparecen en las secciones marcadas con data-flores (Invitados y Dress code).
(function () {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var MAX_ALIVE = 12;      // pocas: algo delicado
  var EVERY_S = 0.9;       // una florcita nueva cada tantos segundos mientras se ve la sección
  var SEED = 4;            // cuántas ya están en pantalla al llegar a la sección

  var sprites = [];
  ["assets/flor-1.webp", "assets/flor-2.webp", "assets/flor-3.webp"].forEach(function (src) {
    var im = new Image();
    im.decoding = "async";
    im.onload = function () { sprites.push(im); };
    im.src = src;
  });

  /* ---------- Lienzo a pantalla completa ---------- */
  var canvas = document.createElement("canvas");
  canvas.className = "falling-flowers";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  var ctx = canvas.getContext("2d");
  var vw = 0, vh = 0, dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    vw = window.innerWidth; vh = window.innerHeight;
    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  var flowers = [], running = false, prev = 0;

  /* ---------- Solo en las secciones con data-flores ---------- */
  var zones = Array.prototype.slice.call(document.querySelectorAll("[data-flores]"));
  function inZone() {
    for (var i = 0; i < zones.length; i++) {
      var r = zones[i].getBoundingClientRect();
      if (r.top < vh * 0.65 && r.bottom > vh * 0.35) return true;   // la sección se ve en buena parte de la pantalla
    }
    return false;
  }
  var zoneFade = 1; // se apaga suave al salir de la sección

  function spawn(anywhere) {
    if (flowers.length >= MAX_ALIVE || !sprites.length) return;
    var size = 8 + Math.random() * 6;       // radio en px: flores de ~16 a 28 px
    flowers.push({
      x: Math.random() * vw,
      // al entrar a la sección algunas ya están en pantalla; después caen desde arriba
      y: anywhere ? Math.random() * vh * 0.8 : -size - Math.random() * 40,
      size: size,
      vy: 32 + Math.random() * 30,                 // caen despacito
      sway: 14 + Math.random() * 22,               // vaivén lateral
      swaySpeed: 0.6 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 1.4,
      tilt: Math.random() * Math.PI * 2,           // giro "en 3D"
      vt: 0.8 + Math.random() * 1.4,
      alpha: 0,
      maxAlpha: 0.8 + Math.random() * 0.2,
      sprite: sprites[Math.floor(Math.random() * sprites.length)],
      t: 0
    });
  }

  var wasActive = false, spawnAcc = 0;
  function start() {
    if (running) return;
    running = true; prev = performance.now(); requestAnimationFrame(frame);
  }

  function frame(now) {
    var dt = Math.min((now - prev) / 1000, 0.05);
    prev = now;
    ctx.clearRect(0, 0, vw, vh);
    var active = !document.body.classList.contains("intro-open") && inZone();
    if (active && !wasActive) { zoneFade = 1; for (var s = 0; s < SEED; s++) spawn(true); }
    wasActive = active;
    if (active) {
      spawnAcc += dt;
      while (spawnAcc >= EVERY_S) { spawnAcc -= EVERY_S; spawn(false); }
    } else {
      zoneFade = Math.max(0, zoneFade - dt * 2.5);
      if (zoneFade === 0) flowers.length = 0;
    }
    for (var i = flowers.length - 1; i >= 0; i--) {
      var f = flowers[i];
      f.t += dt;
      f.y += f.vy * dt;
      f.rot += f.vr * dt;
      f.tilt += f.vt * dt;
      var x = f.x + Math.sin(f.phase + f.t * f.swaySpeed) * f.sway;
      // aparece suave y se desvanece cerca del final
      f.alpha = Math.min(f.maxAlpha, f.alpha + dt * 1.2);
      var fadeOut = Math.max(0, Math.min(1, (vh + f.size - f.y) / (vh * 0.25)));
      if (f.y > vh + f.size * 2) { flowers.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = f.alpha * fadeOut * zoneFade;
      ctx.translate(x, f.y);
      ctx.rotate(f.rot);
      ctx.scale(1, 0.55 + 0.45 * Math.abs(Math.cos(f.tilt)));
      ctx.drawImage(f.sprite, -f.size, -f.size, f.size * 2, f.size * 2);
      ctx.restore();
    }
    if (active || flowers.length) requestAnimationFrame(frame);
    else running = false;
  }

  /* ---------- Se activa al llegar a Invitados o Dress code ---------- */
  function check() { if (!running && inZone() && !document.body.classList.contains("intro-open")) start(); }
  window.addEventListener("scroll", check, { passive: true });
  window.addEventListener("resize", check);
  document.addEventListener("click", function () { setTimeout(check, 300); });
  check();
})();
