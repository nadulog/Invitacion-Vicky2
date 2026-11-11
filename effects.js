(function () {
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Intro + música ---------- */
  var intro = document.querySelector(".intro");
  var audio = document.getElementById("backgroundMusic");
  var toggle = document.querySelector(".audio-toggle");
  var wantsMusic = false;

  function setPlaying(on) {
    toggle.classList.toggle("is-playing", on);
    toggle.setAttribute("aria-pressed", String(on));
    toggle.setAttribute("aria-label", on ? "Pausar música" : "Reproducir música");
  }

  function play() {
    var p = audio.play();
    if (p && p.then) p.then(function () { setPlaying(true); }, function () { setPlaying(false); });
    else setPlaying(true);
  }

  function enter(withMusic) {
    if (intro.classList.contains("is-leaving")) return;
    wantsMusic = withMusic;
    if (withMusic) play(); // dentro del click: los celulares lo permiten
    window.scrollTo(0, 0);
    intro.classList.add("is-leaving");
    setTimeout(function () { document.body.classList.remove("intro-open"); }, 300);
    setTimeout(function () { intro.classList.add("is-gone"); }, 1100);
  }

  intro.querySelector("[data-enter-with-music]").addEventListener("click", function () { enter(true); });
  intro.querySelector("[data-enter-without-music]").addEventListener("click", function () { enter(false); });

  toggle.addEventListener("click", function () {
    if (audio.paused) { wantsMusic = true; play(); }
    else { wantsMusic = false; audio.pause(); setPlaying(false); }
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { if (!audio.paused) { audio.pause(); setPlaying(false); } }
    else if (wantsMusic) { play(); }
  });

  /* ---------- Aparición de invitados y cuenta regresiva ---------- */
  if (!reduceMotion && "IntersectionObserver" in window) {
    document.documentElement.classList.add("js-reveal");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-revealed"); io.unobserve(e.target); }
      });
    }, { threshold: 0.35 });
    document.querySelectorAll(".guests, .countdown").forEach(function (el) {
      io.observe(el.classList.contains("countdown") ? el.parentElement : el);
    });

    /* parpadeo suave al cambiar cada número */
    document.querySelectorAll(".countdown strong").forEach(function (el) {
      new MutationObserver(function () {
        el.classList.remove("flick");
        void el.offsetWidth;
        el.classList.add("flick");
      }).observe(el, { childList: true, characterData: true, subtree: true });
    });
  }
})();
