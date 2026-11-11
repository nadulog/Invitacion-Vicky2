// Raspadita de la fecha + lluvia de papelitos celestes al descubrirla
(function () {
  var wrap = document.querySelector(".scratch");
  if (!wrap) return;
  var canvas = wrap.querySelector(".scratch__canvas");
  var ctx = canvas.getContext("2d", { willReadFrequently: true });
  var w = 0, h = 0, dpr = 1;
  var started = false, revealed = false, drawing = false, last = null, moves = 0;
  var REVEAL_AT = 0.3; // proporción raspada para descubrir toda la pantalla

  /* ---------- Capa plateada para raspar ---------- */
  function roundRect(x, y, rw, rh, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + rw, y, x + rw, y + rh, r);
    ctx.arcTo(x + rw, y + rh, x, y + rh, r);
    ctx.arcTo(x, y + rh, x, y, r);
    ctx.arcTo(x, y, x + rw, y, r);
    ctx.closePath();
  }

  function paint() {
    var r = wrap.getBoundingClientRect();
    if (!r.width) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";

    // plateado celeste con brillos diagonales (toda la pantalla)
    var g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#e9eff4");
    g.addColorStop(0.18, "#c3d2df");
    g.addColorStop(0.36, "#f3f6f9");
    g.addColorStop(0.52, "#bccddc");
    g.addColorStop(0.7, "#eef3f7");
    g.addColorStop(0.86, "#b6c7d6");
    g.addColorStop(1, "#e1e9f0");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // textura (brillitos)
    for (var i = 0; i < w * h / 40; i++) {
      ctx.fillStyle = Math.random() < 0.5 ? "rgba(255,255,255,.55)" : "rgba(120,145,170,.18)";
      ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }

    // marco interno
    var m = Math.round(w * 0.05), rad = w * 0.06;
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255,255,255,.85)";
    roundRect(m, m, w - m * 2, h - m * 2, rad);
    ctx.stroke();
    ctx.strokeStyle = "rgba(44,85,116,.25)";
    roundRect(m + 5, m + 5, w - m * 2 - 10, h - m * 2 - 10, rad * 0.8);
    ctx.stroke();

    // textos, centrados en la pantalla
    var s = Math.min(w, h * 0.62), cy = h * 0.47;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#2c5574";
    ctx.font = "500 " + Math.round(s * 0.042) + "px 'Cormorant Garamond', serif";
    if ("letterSpacing" in ctx) ctx.letterSpacing = Math.round(s * 0.012) + "px";
    ctx.fillText("MIS XV · VICKY", w / 2, cy - s * 0.27);
    ctx.font = "400 " + Math.round(s * 0.06) + "px 'Cormorant Garamond', serif";
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
    ctx.fillText("✦   ✦   ✦", w / 2, cy - s * 0.17);
    ctx.font = "600 " + Math.round(s * 0.105) + "px 'Cormorant Garamond', serif";
    if ("letterSpacing" in ctx) ctx.letterSpacing = Math.round(s * 0.025) + "px";
    ctx.fillText("RASPÁ ACÁ", w / 2, cy - s * 0.04);
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
    ctx.font = "400 " + Math.round(s * 0.115) + "px 'Pinyon Script', cursive";
    ctx.fillText("y descubrí la fecha", w / 2, cy + s * 0.1);
  }

  /* ---------- Raspar ---------- */
  function point(e) {
    var r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (w / r.width), y: (e.clientY - r.top) * (h / r.height) };
  }

  function scratch(p) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "#000"; // opaco: borra del todo
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = w * 0.2;
    ctx.beginPath();
    ctx.moveTo(last ? last.x : p.x, last ? last.y : p.y);
    ctx.lineTo(p.x + 0.01, p.y);
    ctx.stroke();
    last = p;
  }

  function clearedRatio() {
    var data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    var step = 16 * 4, clear = 0, total = 0;
    for (var i = 3; i < data.length; i += step) { total++; if (data[i] < 40) clear++; }
    return clear / total;
  }

  function reveal() {
    if (revealed) return;
    revealed = true;
    wrap.classList.add("is-revealed");
    document.body.classList.remove("date-locked"); // recién ahora se puede seguir bajando
    var r = wrap.getBoundingClientRect();
    launchConfetti(r.left + r.width / 2, r.top + r.height / 2);
  }

  canvas.addEventListener("pointerdown", function (e) {
    if (revealed) return;
    drawing = true;
    last = null;
    if (!started) { started = true; wrap.classList.add("is-scratching"); }
    try { canvas.setPointerCapture(e.pointerId); } catch (_e) {}
    scratch(point(e));
  });
  canvas.addEventListener("pointermove", function (e) {
    if (!drawing || revealed) return;
    scratch(point(e));
    if (++moves % 12 === 0 && clearedRatio() > REVEAL_AT) reveal();
  });
  function stop() {
    if (!drawing) return;
    drawing = false;
    last = null;
    if (!revealed && clearedRatio() > REVEAL_AT) reveal();
  }
  canvas.addEventListener("pointerup", stop);
  canvas.addEventListener("pointercancel", stop);

  // pintar cuando hay tamaño y las fuentes están listas; repintar solo si no empezaron
  var lastWidth = 0;
  function refresh() {
    var cw = wrap.getBoundingClientRect().width;
    if (started || Math.abs(cw - lastWidth) < 2) return;
    lastWidth = cw;
    paint();
  }
  refresh();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { lastWidth = 0; if (!started) refresh(); });
  window.addEventListener("resize", refresh);
  window.addEventListener("load", function () { lastWidth = 0; refresh(); });

  /* ---------- Papelitos celestes ---------- */
  function launchConfetti(ox, oy) {
    var c = document.createElement("canvas");
    c.className = "confetti";
    c.setAttribute("aria-hidden", "true");
    document.body.appendChild(c);
    var cx = c.getContext("2d");
    var vw = window.innerWidth, vh = window.innerHeight, pr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = vw * pr; c.height = vh * pr;
    cx.setTransform(pr, 0, 0, pr, 0, 0);

    // solo celestes y plateados
    var CELESTES = ["#a9cbe8", "#8db8de", "#bcd8ef", "#7fa6c9", "#9fc3e3"];
    var PLATEADOS = [["#f1f3f5", "#a7b0b9"], ["#e2e6ea", "#959fa9"], ["#d6dbe0", "#8b959f"]];
    var pieces = [];
    function piece(x, y, vx, vy) {
      var silver = Math.random() < 0.5;
      return {
        x: x, y: y, vx: vx, vy: vy,
        w: 6 + Math.random() * 6, h: 9 + Math.random() * 8,
        rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 10,
        flip: Math.random() * Math.PI, vf: 4 + Math.random() * 8,
        silver: silver ? PLATEADOS[Math.floor(Math.random() * PLATEADOS.length)] : null,
        color: CELESTES[Math.floor(Math.random() * CELESTES.length)]
      };
    }
    // explosión desde la tarjeta
    for (var i = 0; i < 120; i++) {
      var a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
      var sp = 380 + Math.random() * 620;
      pieces.push(piece(ox, oy, Math.cos(a) * sp, Math.sin(a) * sp));
    }
    // lluvia desde arriba
    for (var j = 0; j < 90; j++) {
      pieces.push(piece(Math.random() * vw, -20 - Math.random() * vh * 0.6, (Math.random() - 0.5) * 60, 60 + Math.random() * 120));
    }

    var prev = performance.now(), t0 = prev;
    function frame(now) {
      var dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;
      cx.clearRect(0, 0, vw, vh);
      var alive = 0;
      var fade = Math.max(0, Math.min(1, (6.5 - (now - t0) / 1000) / 1.2));
      for (var k = 0; k < pieces.length; k++) {
        var p = pieces[k];
        p.vy += 520 * dt;                  // gravedad
        p.vx *= 0.985; p.vy *= 0.985;     // aire
        if (p.vy > 170) p.vy = 170;        // caen flotando
        p.x += (p.vx + Math.sin(p.flip) * 30) * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        p.flip += p.vf * dt;
        if (p.y > vh + 30) continue;
        alive++;
        cx.save();
        cx.globalAlpha = fade;
        cx.translate(p.x, p.y);
        cx.rotate(p.rot);
        cx.scale(1, Math.cos(p.flip));
        if (p.silver) {
          // brillo metálico que cambia al dar vueltas
          var sg = cx.createLinearGradient(-p.w / 2, -p.h / 2, p.w / 2, p.h / 2);
          var shine = (Math.sin(p.flip * 2) + 1) / 2;
          sg.addColorStop(0, p.silver[1]);
          sg.addColorStop(0.2 + shine * 0.6, p.silver[0]);
          sg.addColorStop(1, p.silver[1]);
          cx.fillStyle = sg;
        } else {
          cx.fillStyle = p.color;
        }
        cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        cx.strokeStyle = "rgba(44,85,116,.15)";
        cx.lineWidth = 0.6;
        cx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);
        cx.restore();
      }
      if (alive && fade > 0) requestAnimationFrame(frame);
      else c.remove();
    }
    requestAnimationFrame(frame);
  }
  window.launchConfetti = launchConfetti;
})();
