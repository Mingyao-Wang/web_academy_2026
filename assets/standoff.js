// Pixel-art western standoff ("Author" vs "Reviewer Comments") shown along the
// bottom of the homepage after the bouncing square is caught. Decorative only;
// this file is loaded on demand by the homepage script.
(function () {
  if (window.showStandoff) return;

  var LH = 40; // scene height in art pixels; scaled up by an integer factor

  var C = {
    sky: ["#e8935a", "#ec9f63", "#efac6e", "#f2b97a", "#f4c588", "#f6d197", "#f7dba6"],
    sun: "#fff1c9", sunRing: "#fbe0a0",
    mesa: "#c77850", mesaDark: "#b56a46",
    bld: "#8b5434", bldLight: "#9d633f", roof: "#6e3f26", win: "#4b2a17",
    ground: "#d9a467", groundLine: "#c08450", speck: "#bf8550",
    cactus: "#5d7a3a", cactusDark: "#4b6430",
    tumble: "#9b6b3a", tumbleDark: "#7d5430", dust: "#efd2a4",
    plate: "#2a1c12", plateText: "#f7ead0"
  };
  var RIDERS = [
    { tag: "P1", name: "AUTHOR", tagColor: "#7fd0ee",
      pal: { H: "#4a2e1c", b: "#a2522a", S: "#e3ab7d", s: "#c78f62", E: "#1d1410", K: "#d8b25a",
             C: "#3f6e8f", c: "#335a75", G: "#2b1b10", g: "#7a7a7a", P: "#5a4636", O: "#2e1f15", A: "#e3ab7d" } },
    { tag: "P2", name: "REVIEWER COMMENTS", tagColor: "#f39a88",
      pal: { H: "#1f1915", b: "#5b2a1a", S: "#d79f72", s: "#bb8458", E: "#1d1410", K: "#2f3b46",
             C: "#7a3328", c: "#622920", G: "#2b1b10", g: "#7a7a7a", P: "#3d342e", O: "#22170f", A: "#d79f72" } }
  ];
  // 12x22 cowboy facing right. A = hand hovering over the holster (g).
  var SPRITE = [
    "....HHHH....",
    "...HHHHHH...",
    "...bbbbbb...",
    ".HHHHHHHHHH.",
    "....SSSSS...",
    "....SSSSES..",
    "....SSSSSSS.",
    "....sSSSS...",
    "....KKKKK...",
    "...CCCCCCC..",
    "..CCCCCCCCC.",
    "..CcCCCCCCC.",
    "..CcCCCCCCC.",
    "..CcGGGGGGC.",
    "..CcPPPPPgA.",
    "..CcPPPPPg..",
    "..Cc.PP.PP..",
    "..C..PP.PP..",
    ".....PP.PP..",
    ".....PP.PP..",
    "....OOO.OOO.",
    "....OOO.OOO."
  ];
  var TUMBLE = [
    [".TTT.", "T.t.T", "TtTtT", "T.t.T", ".TTT."],
    [".TTT.", "TtT.T", "T.t.T", "T.TtT", ".TTT."]
  ];
  // Tiny pixel font (5 rows tall).
  var FONT = {
    A: [".#.", "#.#", "###", "#.#", "#.#"], C: ["###", "#..", "#..", "#..", "###"],
    E: ["###", "#..", "##.", "#..", "###"], H: ["#.#", "#.#", "###", "#.#", "#.#"],
    I: ["###", ".#.", ".#.", ".#.", "###"], L: ["#..", "#..", "#..", "#..", "###"],
    M: ["#...#", "##.##", "#.#.#", "#...#", "#...#"], N: ["#..#", "##.#", "#.##", "#..#", "#..#"],
    O: ["###", "#.#", "#.#", "#.#", "###"], P: ["##.", "#.#", "##.", "#..", "#.."],
    R: ["##.", "#.#", "##.", "#.#", "#.#"], S: ["###", "#..", "###", "..#", "###"],
    T: ["###", ".#.", ".#.", ".#.", ".#."], U: ["#.#", "#.#", "#.#", "#.#", "###"],
    V: ["#.#", "#.#", "#.#", "#.#", ".#."], W: ["#...#", "#...#", "#.#.#", "#.#.#", ".#.#."],
    "1": [".#.", "##.", ".#.", ".#.", "###"], "2": ["##.", "..#", ".#.", "#..", "###"],
    " ": ["..", "..", "..", "..", ".."]
  };

  function textWidth(str) {
    var w = 0;
    for (var i = 0; i < str.length; i++) w += FONT[str[i]][0].length + 1;
    return w - 1;
  }
  function drawText(ctx, str, x, y, color) {
    ctx.fillStyle = color;
    for (var i = 0; i < str.length; i++) {
      var g = FONT[str[i]];
      for (var r = 0; r < 5; r++)
        for (var c = 0; c < g[r].length; c++)
          if (g[r][c] === "#") ctx.fillRect(x + c, y + r, 1, 1);
      x += g[0].length + 1;
    }
  }
  function rng(seed) { // small deterministic PRNG so the town looks the same on resize
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var HORIZON = 29, FEET = 38;
  var box, canvas, ctx, bg, closeBtn, LW = 0, S = 2, cx = 0, riderX = [0, 0], raf = null, t0 = 0;

  function layout() {
    var W = document.documentElement.clientWidth;
    var target = Math.min(120, Math.max(64, window.innerHeight * 0.1));
    S = Math.max(2, Math.floor(target / LH));
    LW = Math.ceil(W / S);
    canvas.width = LW; canvas.height = LH;
    canvas.style.width = LW * S + "px"; canvas.style.height = LH * S + "px";
    box.style.height = LH * S + "px";
    if (box.classList.contains("show")) document.body.style.paddingBottom = LH * S + "px";
    cx = Math.round(LW / 2);
    var d = Math.round(Math.min(LW * 0.3, 70));
    riderX = [cx - d - 6, cx + d - 6];
    paintBackground();
  }

  function paintBackground() {
    bg = document.createElement("canvas");
    bg.width = LW; bg.height = LH;
    var g = bg.getContext("2d"), r = rng(7), x, y;
    // sky bands with a dithered seam between them
    var band = Math.ceil((HORIZON + 1) / C.sky.length);
    for (y = 0; y <= HORIZON; y++) {
      var i = Math.min(C.sky.length - 1, Math.floor(y / band));
      g.fillStyle = C.sky[i]; g.fillRect(0, y, LW, 1);
      if (y % band === band - 1 && i + 1 < C.sky.length) {
        g.fillStyle = C.sky[i + 1];
        for (x = (y % 2); x < LW; x += 2) g.fillRect(x, y, 1, 1);
      }
    }
    // low sun between the two riders
    for (y = -7; y <= 7; y++) for (x = -7; x <= 7; x++) {
      var dd = x * x + y * y, sy = 23 + y;
      if (sy > HORIZON) continue;
      if (dd <= 30) { g.fillStyle = C.sun; g.fillRect(cx + x, sy, 1, 1); }
      else if (dd <= 46) { g.fillStyle = C.sunRing; g.fillRect(cx + x, sy, 1, 1); }
    }
    // distant mesas
    for (x = -10; x < LW; ) {
      var w = 16 + Math.floor(r() * 22), h = 3 + Math.floor(r() * 4);
      if (Math.abs(x + w / 2 - cx) > 16) {
        g.fillStyle = C.mesa; g.fillRect(x + 2, HORIZON - h, w - 4, h + 1);
        g.fillRect(x, HORIZON - h + 2, w, h - 1);
        g.fillStyle = C.mesaDark; g.fillRect(x + 2, HORIZON - h, w - 4, 1);
      }
      x += w + 6 + Math.floor(r() * 18);
    }
    // frontier town, leaving the centre open for the sun
    var gapL = cx - 15, gapR = cx + 15;
    for (x = 1; x < LW; ) {
      var bw = 9 + Math.floor(r() * 9), bh = 8 + Math.floor(r() * 7), top = HORIZON - bh + 1;
      if (x + bw > gapL && x < gapR) { x = gapR + 1; continue; }
      if (r() < 0.18) { // water tower
        g.fillStyle = C.roof;
        g.fillRect(x + 1, top + 5, 1, bh - 5); g.fillRect(x + 5, top + 5, 1, bh - 5); g.fillRect(x + 1, top + 8, 5, 1);
        g.fillStyle = C.bld; g.fillRect(x, top, 7, 5);
        g.fillStyle = C.roof; g.fillRect(x, top - 1, 7, 1); g.fillRect(x + 1, top - 2, 5, 1);
        x += 14 + Math.floor(r() * 12); continue;
      }
      g.fillStyle = C.bld; g.fillRect(x, top, bw, bh);
      g.fillStyle = C.bldLight; g.fillRect(x, top, 1, bh);
      g.fillStyle = C.roof; g.fillRect(x - 1, top - 1, bw + 2, 1);
      if (r() < 0.6) { // false front
        g.fillStyle = C.bld; g.fillRect(x + 2, top - 3, bw - 4, 3);
        g.fillStyle = C.roof; g.fillRect(x + 2, top - 3, bw - 4, 1);
      }
      g.fillStyle = C.win;
      for (var wx = x + 2; wx + 2 <= x + bw - 1; wx += 4) g.fillRect(wx, top + 2, 2, 2);
      g.fillRect(x + Math.floor(bw / 2) - 1, HORIZON - 3, 2, 4); // door
      g.fillStyle = C.roof; g.fillRect(x - 1, HORIZON - 4, bw + 2, 1); // porch roof
      x += bw + 6 + Math.floor(r() * 16);
    }
    // ground
    g.fillStyle = C.ground; g.fillRect(0, HORIZON + 1, LW, LH - HORIZON - 1);
    g.fillStyle = C.groundLine; g.fillRect(0, HORIZON + 1, LW, 1);
    g.fillStyle = C.speck;
    for (var k = 0; k < LW * 0.6; k++) g.fillRect(Math.floor(r() * LW), HORIZON + 2 + Math.floor(r() * (LH - HORIZON - 2)), 1, 1);
    // a couple of saguaros near the edges
    [[Math.round(LW * 0.06), 1], [Math.round(LW * 0.93), -1]].forEach(function (p) {
      var bx = p[0], base = HORIZON + 6;
      g.fillStyle = C.cactus; g.fillRect(bx, base - 9, 2, 9);
      g.fillRect(bx - 2, base - 6, 1, 3); g.fillRect(bx - 2, base - 4, 2, 1);
      g.fillRect(bx + 3, base - 7, 1, 3); g.fillRect(bx + 2, base - 5, 2, 1);
      g.fillStyle = C.cactusDark; g.fillRect(bx + 1, base - 9, 1, 9);
    });
  }

  function drawRider(i, t) {
    var p = RIDERS[i].pal, ox = riderX[i], oy = FEET - SPRITE.length + 1, mirror = i === 1;
    var phase = i * 1.3;
    var blink = (t + phase) % 3.7 < 0.14;
    var twitch = (t + phase * 0.7) % 2.9 < 0.22;
    var flutter = Math.floor((t + phase) * 2) % 2 === 1;
    for (var r = 0; r < SPRITE.length; r++) {
      for (var c = 0; c < 12; c++) {
        var ch = SPRITE[r][c];
        if (ch === "E" && blink) ch = "S";
        if (ch === "A" && twitch) ch = "."; // hand lifts one pixel
        if (r === 13 && c === 10 && twitch) ch = "A";
        if (flutter && r === 17 && c === 2) ch = ".";
        if (flutter && r === 17 && c === 1) ch = "C";
        if (ch === ".") continue;
        ctx.fillStyle = p[ch];
        ctx.fillRect(ox + (mirror ? 11 - c : c), oy + r, 1, 1);
      }
    }
    // bandana tail in the wind (behind the neck)
    ctx.fillStyle = p.K;
    var nx = mirror ? ox + 8 : ox + 3, back = mirror ? 1 : -1;
    ctx.fillRect(nx + back, oy + 8 + (flutter ? 1 : 0), 1, 1);
  }

  function drawLabel(i) {
    var rd = RIDERS[i], label = rd.tag + " " + rd.name;
    var tw = textWidth(label), w = tw + 4, h = 9, top = 2;
    var head = riderX[i] + 6;
    var left = Math.max(1, Math.min(LW - w - 1, head - Math.floor(w / 2)));
    ctx.fillStyle = C.plateText; ctx.fillRect(left, top, w, h);
    ctx.fillStyle = C.plate; ctx.fillRect(left + 1, top + 1, w - 2, h - 2);
    var tagW = textWidth(rd.tag);
    drawText(ctx, rd.tag, left + 2, top + 2, rd.tagColor);
    drawText(ctx, rd.name, left + 2 + tagW + 3, top + 2, C.plateText);
    ctx.fillStyle = C.plateText; // pointer down to the rider
    ctx.fillRect(head - 1, top + h, 3, 1); ctx.fillRect(head, top + h + 1, 1, 1);
  }

  function frame(now) {
    if (!t0) t0 = now;
    var t = (now - t0) / 1000;
    ctx.drawImage(bg, 0, 0);
    // drifting dust
    ctx.fillStyle = C.dust;
    for (var k = 0; k < 4; k++) {
      var dx = Math.floor((t * (6 + k * 3) + k * 57) % (LW + 20)) - 10;
      ctx.fillRect(dx, HORIZON + 3 + ((k * 3) % 6), 2, 1);
    }
    // tumbleweed rolls across between the riders every ~11 s
    var cyc = (t + 2) % 11;
    if (cyc < 7) {
      var tx = Math.floor(-6 + (LW + 12) * (cyc / 7));
      var spr = TUMBLE[Math.floor(tx / 3) % 2 === 0 ? 0 : 1];
      var ty = FEET - 4 - (Math.floor(tx / 5) % 3 === 0 ? 1 : 0);
      for (var r = 0; r < 5; r++) for (var c = 0; c < 5; c++) {
        var ch = spr[r][c]; if (ch === ".") continue;
        ctx.fillStyle = ch === "T" ? C.tumble : C.tumbleDark;
        ctx.fillRect(tx + c, ty + r, 1, 1);
      }
    }
    drawRider(0, t); drawRider(1, t);
    drawLabel(0); drawLabel(1);
    raf = requestAnimationFrame(frame);
  }

  function build() {
    var style = document.createElement("style");
    style.textContent =
      ".standoff{position:fixed;left:0;right:0;bottom:0;z-index:80;overflow:hidden;background:#d9a467;" +
      "transform:translateY(100%);transition:transform .6s ease;box-shadow:0 -1px 0 rgba(0,0,0,.18)}" +
      ".standoff.show{transform:translateY(0)}" +
      ".standoff canvas{display:block;image-rendering:pixelated;image-rendering:crisp-edges}" +
      ".standoff-close{position:absolute;bottom:4px;right:6px;border:0;padding:0 5px;cursor:pointer;" +
      "font:13px/18px ui-monospace,Menlo,monospace;color:#f7ead0;background:rgba(42,28,18,.8)}" +
      ".standoff-close:hover{background:#2a1c12}" +
      "body{transition:padding-bottom .6s ease}";
    document.head.appendChild(style);
    box = document.createElement("div");
    box.className = "standoff";
    box.setAttribute("role", "img");
    box.setAttribute("aria-label", "Pixel-art western standoff in a desert town: Author versus Reviewer Comments");
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");
    closeBtn = document.createElement("button");
    closeBtn.className = "standoff-close";
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.textContent = "✕";
    closeBtn.addEventListener("click", hide);
    box.appendChild(canvas); box.appendChild(closeBtn);
    document.body.appendChild(box);
    window.addEventListener("resize", layout);
    layout();
  }

  function show() {
    if (!box) build();
    if (box.classList.contains("show")) return;
    requestAnimationFrame(function () {
      box.classList.add("show");
      document.body.style.paddingBottom = LH * S + "px";
    });
    if (!raf) raf = requestAnimationFrame(frame);
  }
  function hide() {
    box.classList.remove("show");
    document.body.style.paddingBottom = "";
    setTimeout(function () {
      if (!box.classList.contains("show") && raf) { cancelAnimationFrame(raf); raf = null; }
    }, 650);
  }

  window.showStandoff = show;
})();
