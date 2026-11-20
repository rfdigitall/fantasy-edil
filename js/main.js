(function () {
  "use strict";
  var d = document, root = d.documentElement, body = d.body, WA = "393393159782";
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  /* caricamento */
  var loader = $("#loader");
  function ready() { body.classList.add("ready"); if (loader) { loader.classList.add("out"); setTimeout(function () { loader.hidden = true; }, 1100); } }
  if (reduce || !loader) { if (loader) loader.hidden = true; body.classList.add("ready"); }
  else { var img = $(".hero-media img"), go = function () { setTimeout(ready, 250); }; if (img.complete) setTimeout(ready, 700); else { img.addEventListener("load", go); setTimeout(ready, 2500); } }

  /* aperto ora (orario di Roma) */
  var HOURS = { 1: [8, 19], 2: [8, 19], 3: [8, 19], 4: [8, 18], 5: [8, 19] };
  var DAYS = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
  function romeNow() {
    try {
      var o = {};
      new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Rome", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
      return { day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday), h: parseInt(o.hour, 10) % 24 + parseInt(o.minute, 10) / 60 };
    } catch (e) { var n = new Date(); return { day: n.getDay(), h: n.getHours() + n.getMinutes() / 60 }; }
  }
  function openState() {
    var n = romeNow(), t = HOURS[n.day], el = $("[data-open]"), txt = $("[data-open-txt]");
    $$("#hours tr").forEach(function (r) { r.classList.toggle("today", +r.getAttribute("data-d") === n.day); });
    var open = t && n.h >= t[0] && n.h < t[1];
    el.classList.toggle("on", !!open);
    if (open) { txt.textContent = "Aperto ora · fino alle " + t[1] + ":00"; return; }
    if (t && n.h < t[0]) { txt.textContent = "Chiuso · apre alle 8:00"; return; }
    var nd = n.day, k = 0; do { nd = (nd + 1) % 7; k++; } while (!HOURS[nd] && k < 8);
    txt.textContent = "Chiuso · apre " + (k === 1 ? "domani" : DAYS[nd]) + " alle 8:00";
  }
  openState(); setInterval(openState, 60000);

  /* cursore, magneti */
  var cur = $("#cur");
  if (fine && !reduce) {
    root.classList.add("has-cur");
    var cx = -99, cy = -99, tx = -99, ty = -99;
    addEventListener("pointermove", function (e) {
      tx = e.clientX; ty = e.clientY; cur.classList.remove("hide");
      var t = e.target.closest ? e.target : null;
      cur.classList.toggle("view", !!(t && t.closest(".r-card")));
      cur.classList.toggle("big", !!(t && !t.closest(".r-card") && t.closest("a,button,summary,label")));
    }, { passive: true });
    d.addEventListener("pointerleave", function () { cur.classList.add("hide"); });
    $$(".mag").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * .18) + "px," + ((e.clientY - r.top - r.height / 2) * .3) + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  /* foto che segue il mouse sui servizi */
  var fl = $("#svcFloat"), flImg = fl && $("img", fl), fx = 0, fy = 0, ftx = 0, fty = 0, lastX = 0;
  if (fl && fine && !reduce) {
    $$("#svc a").forEach(function (a) {
      a.addEventListener("pointerenter", function () { flImg.src = a.getAttribute("data-img"); fl.classList.add("on"); });
      a.addEventListener("pointerleave", function () { fl.classList.remove("on"); });
    });
    addEventListener("pointermove", function (e) { ftx = e.clientX; fty = e.clientY; }, { passive: true });
  }
  (function loop() {
    if (cur && fine && !reduce) { cx += (tx - cx) * .2; cy += (ty - cy) * .2; cur.style.transform = "translate(" + cx + "px," + cy + "px)"; }
    if (fl && fine && !reduce) {
      fx += (ftx - fx) * .12; fy += (fty - fy) * .12;
      var rot = clamp((ftx - lastX) * .4, -10, 10); lastX += (ftx - lastX) * .1;
      fl.style.left = fx + "px"; fl.style.top = fy + "px"; fl.style.setProperty("--rot", rot.toFixed(1) + "deg");
    }
    requestAnimationFrame(loop);
  })();

  /* menu */
  var drawer = $("#drawer"), mb = $("#menuBtn");
  function menu(open) {
    drawer.classList.toggle("open", open); body.classList.toggle("menu-open", open); body.classList.toggle("lock", open);
    drawer.setAttribute("aria-hidden", open ? "false" : "true"); mb.setAttribute("aria-expanded", open ? "true" : "false");
    mb.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
  }
  mb.addEventListener("click", function () { menu(!drawer.classList.contains("open")); });
  $$("#drawer a").forEach(function (a) { a.addEventListener("click", function () { menu(false); }); });
  d.addEventListener("keydown", function (e) { if (e.key === "Escape") menu(false); });

  /* comparsa */
  var rv = $$(".rv");
  if (reduce || !("IntersectionObserver" in window)) rv.forEach(function (e) { e.classList.add("in"); });
  else {
    var io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -10% 0px" });
    rv.forEach(function (e) { io.observe(e); });
  }

  /* testo che si colora */
  var say = $("#say"), words = [];
  if (say) {
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var f = d.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return; if (/^\s+$/.test(w)) { f.appendChild(d.createTextNode(" ")); return; }
            var s = d.createElement("span"); s.className = "w"; s.textContent = w; f.appendChild(s); words.push(s);
          });
          n.parentNode.replaceChild(f, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(say);
  }

  /* progresso di una sezione "lunga" (0..1) */
  function prog(track) {
    var r = track.getBoundingClientRect(), range = Math.max(1, r.height - innerHeight);
    return clamp(-r.top / range, 0, 1);
  }

  var hero = $("#hero"), mTrack = $("#mTrack"), mImgs = $$("#mFrame img"), mSteps = $$("#mSteps .m-step"), mNum = $("#mNum"), mBar = $("#mBar"), mCur = -1;
  var rTrack = $("#rTrack"), rRow = $("#rRow"), pars = $$(".par");
  function sizeRooms() {
    if (!rTrack) return;
    var extra = Math.max(0, rRow.scrollWidth - innerWidth);
    rTrack.style.height = (innerHeight + extra) + "px";
    rTrack._extra = extra;
  }

  var header = $("#header"), dock = $("#dock"), q = $("#preventivo"), lastY = 0, tick = false;
  function frame() {
    var y = pageYOffset, vh = innerHeight;
    header.classList.toggle("scrolled", y > 20);
    var goingDown = y > lastY + 4;
    if (y > 500 && goingDown && !drawer.classList.contains("open")) header.classList.add("hide");
    else if (y < lastY - 4 || y < 500) header.classList.remove("hide");
    lastY = y;
    var qr = q.getBoundingClientRect();
    dock.classList.toggle("on", y > hero.offsetHeight - vh * .3 &&!(qr.top < vh && qr.bottom > 0));

    if (!reduce) {
      /* eroe */
      var hp = prog(hero); hero.style.setProperty("--p", (1 - Math.pow(1 - hp, 2)).toFixed(4));
      /* testo */
      if (say) {
        var sr = say.getBoundingClientRect(), sp = clamp((vh * .85 - sr.top) / (sr.height + vh * .35), 0, 1), lit = Math.floor(sp * words.length * 1.05);
        words.forEach(function (w, i) { w.classList.toggle("on", i < lit); });
      }
      /* parallasse */
      pars.forEach(function (im) {
        var r = im.parentNode.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var p = (r.top + r.height / 2 - vh / 2) / (vh + r.height);
        im.style.transform = "translate3d(0," + (p * -18).toFixed(2) + "%,0)";
      });
      /* stanze in orizzontale */
      if (rTrack && rTrack._extra) rRow.style.transform = "translate3d(" + (-prog(rTrack) * rTrack._extra).toFixed(1) + "px,0,0)";
    }
    /* metodo */
    if (mTrack) {
      var mp = prog(mTrack), i = Math.min(3, Math.floor(mp * 4));
      mBar.style.setProperty("--mp", mp.toFixed(3));
      if (i !== mCur) {
        mCur = i;
        mImgs.forEach(function (im, k) { im.classList.toggle("on", k === i); im.classList.toggle("past", k < i); });
        mSteps.forEach(function (s, k) { s.classList.toggle("on", k === i); });
        mNum.textContent = "0" + (i + 1);
      }
    }
  }
  addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(function () { frame(); tick = false; }); } }, { passive: true });
  addEventListener("resize", function () { sizeRooms(); frame(); });
  addEventListener("load", function () { sizeRooms(); frame(); });
  sizeRooms(); frame();
  if (reduce) { hero.style.setProperty("--p", 1); words.forEach(function (w) { w.classList.add("on"); }); }

  /* form verso WhatsApp */
  var form = $("#form"), err = $("#err");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var bad = null;
    ["nome", "tel"].forEach(function (k) {
      var el = form.elements[k], v = el.value.trim(), no = k === "tel" ? v.replace(/\D/g, "").length < 6 : v.length < 2;
      el.classList.toggle("bad", no); if (no && !bad) bad = el;
    });
    if (bad) { err.textContent = "Scrivi il tuo nome e un numero di telefono, così ti ricontattiamo."; bad.focus(); return; }
    err.textContent = "";
    var s = form.querySelector('input[name="s"]:checked');
    var m = "Buongiorno, sono " + form.elements.nome.value.trim() + " (tel. " + form.elements.tel.value.trim() + ").";
    m += s ? " Vorrei un preventivo per " + s.value + "." : " Vorrei un preventivo.";
    var t = form.elements.msg.value.trim(); if (t) m += " " + t;
    window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(m), "_blank", "noopener");
  });
  ["nome", "tel"].forEach(function (k) { form.elements[k].addEventListener("input", function () { this.classList.remove("bad"); }); });

  $$(".faq details").forEach(function (el) { el.addEventListener("toggle", function () { if (el.open) $$(".faq details").forEach(function (o) { if (o !== el) o.open = false; }); }); });
  $("#yr").textContent = new Date().getFullYear();
})();
