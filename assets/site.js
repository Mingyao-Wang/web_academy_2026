// Site-wide extras, loaded on every page:
//  1. a greeting for anyone who opens the browser console;
//  2. the Konami code (↑ ↑ ↓ ↓ ← → ← → B A) sends a pixel-art sharknado across the page.
(function () {
  // ---------- 1. console greeting ----------
  try {
    var cowboy = [
      "         _______",
      "      __|_______|__",
      "         ( o_o )",
      "          \\ - /",
      "       ---|---|---",
      "          |   |",
      "         _/   \\_"
    ].join("\n");
    console.log("%c" + cowboy, "font-family: Menlo, monospace; color: #7c2128; line-height: 1.25;");
    console.log("%cHowdy, fellow empiricist 🤠", "font: 600 16px Georgia, serif; color: #7c2128;");
    console.log("%cThanks for looking under the hood. CV: https://mingyaowang.com/cv/\n" +
                "Try ↑ ↑ ↓ ↓ ← → ← → B A somewhere on this site.",
                "font: 13px Georgia, serif; color: #5c5b56; line-height: 1.5;");
  } catch (e) { /* console unavailable */ }

  // ---------- 2. Konami code ----------
  var CODE = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  var pos = 0, running = false;
  document.addEventListener("keydown", function (e) {
    var k = e.key && e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (k === CODE[pos]) {
      pos++;
      if (pos === CODE.length) { pos = 0; sharknado(); }
    } else {
      pos = k === CODE[0] ? 1 : 0;
    }
  });

  function toast(msg) {
    var el = document.createElement("div");
    el.setAttribute("role", "status");
    el.textContent = msg;
    el.style.cssText = "position:fixed;top:72px;left:50%;transform:translate(-50%,-6px);z-index:130;" +
      "max-width:90vw;padding:.55rem .95rem;background:#fff;border:1px solid #1a1a1a;" +
      "box-shadow:0 4px 14px rgba(0,0,0,.12);font:1rem/1.4 'EB Garamond',Georgia,serif;color:#7c2128;" +
      "opacity:0;transition:opacity .25s,transform .25s;pointer-events:none";
    document.body.appendChild(el);
    el.getBoundingClientRect();
    el.style.opacity = "1"; el.style.transform = "translate(-50%,0)";
    setTimeout(function () { el.style.opacity = "0"; }, 3000);
    setTimeout(function () { el.remove(); }, 3400);
  }

  var SHARK = { G: "#8d99a6", D: "#5c6773", E: "#111111", W: "#e8ecef" };
  var MINI = ["...D...", "D.GGGG.", "DGGGGEG", "D.WWWW."]; // small shark facing right

  function sharknado() {
    toast("Cheat code accepted 🦈🌪️ Sharknado incoming!");
    if (running || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    running = true;
    var LH = 64, S = Math.max(3, Math.floor(window.innerHeight * 0.75 / LH));
    var LW = Math.ceil(document.documentElement.clientWidth / S), DUR = 4.5;
    var c = document.createElement("canvas");
    c.width = LW; c.height = LH;
    c.setAttribute("aria-hidden", "true");
    c.style.cssText = "position:fixed;left:0;bottom:0;width:" + LW * S + "px;height:" + LH * S + "px;" +
      "z-index:120;pointer-events:none;opacity:.93;image-rendering:pixelated;image-rendering:crisp-edges";
    document.body.appendChild(c);
    var g = c.getContext("2d"), t0 = null, done = false;
    function finish() { if (done) return; done = true; c.remove(); running = false; }
    setTimeout(finish, (DUR + 1) * 1000); // safety net if frames stop (e.g. background tab)

    function frame(now) {
      if (done) return;
      if (t0 === null) t0 = now;
      var t = (now - t0) / 1000, k = Math.min(1, t / DUR), top = 2, bottom = LH - 1;
      var tx = -22 + (LW + 44) * k;
      g.clearRect(0, 0, LW, LH);
      for (var y = top; y <= bottom; y++) { // swirling funnel
        var w = Math.round(3 + (bottom - y) / (bottom - top) * 26);
        var x0 = Math.round(tx + Math.sin(y * 0.3 + t * 9) * 2.5 - w / 2);
        for (var x = 0; x <= w; x++) {
          g.fillStyle = (x === 0 || x === w) ? "#5d6670" : ((x + y + Math.floor(t * 20)) % 5 < 2 ? "#aab3bb" : "#7f8992");
          g.fillRect(x0 + x, y, 1, 1);
        }
      }
      g.fillStyle = "#8a6a45"; // dust at the base
      for (var d = 0; d < 10; d++) {
        var da = t * 7 + d * 0.63;
        g.fillRect(Math.round(tx + Math.cos(da) * (6 + d % 4 * 2)), bottom - (d % 3), 1, 1);
      }
      for (var s = 0; s < 6; s++) { // sharks caught in the wind
        var a = t * 4 + s * 1.05, yy = 6 + s * 9;
        var half = (3 + (bottom - yy) / (bottom - top) * 26) / 2 + 4;
        var sx = Math.round(tx + Math.cos(a) * half) - 3, sy = yy + Math.round(Math.sin(a * 2) * 2), flip = Math.sin(a) > 0;
        for (var r = 0; r < MINI.length; r++) for (var q = 0; q < 7; q++) {
          var ch = MINI[r][q]; if (ch === ".") continue;
          g.fillStyle = SHARK[ch]; g.fillRect(sx + (flip ? 6 - q : q), sy + r, 1, 1);
        }
      }
      if (t < DUR) requestAnimationFrame(frame); else finish();
    }
    requestAnimationFrame(frame);
  }
})();
