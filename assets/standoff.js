// Pixel-art western standoff ("Author" vs "Reviewer Comments") shown along the
// bottom of the homepage after the bouncing square is caught. Decorative only;
// this file is loaded on demand by the homepage script.
//
// Background cycle (~27 s): dusk -> a nine-headed shark swallows the sun and
// spits out the moon -> night -> a sharknado sucks up the moon and spits the
// sun back out -> dusk.
(function () {
  if (window.showStandoff) return;

  var LH = 40;                      // scene height in art pixels; scaled up by an integer factor
  var HORIZON = 29, FEET = 38, SUN_Y = 23, MOON_Y = 12;
  var PHASES = [["dusk", 6], ["shark", 7], ["night", 8], ["nado", 6]];
  var CYCLE = 27;

  var DUSK = {
    sky: ["#e8935a", "#ec9f63", "#efac6e", "#f2b97a", "#f4c588", "#f6d197", "#f7dba6"],
    mesa: "#c77850", mesaDark: "#b56a46", bld: "#8b5434", bldLight: "#9d633f", roof: "#6e3f26",
    win: "#4b2a17", ground: "#d9a467", groundLine: "#c08450", speck: "#bf8550",
    cactus: "#5d7a3a", cactusDark: "#4b6430"
  };
  var NIGHT = {
    sky: ["#121833", "#161e3c", "#1a2545", "#1f2c4f", "#263659", "#304363", "#3b506d"],
    mesa: "#3b3a55", mesaDark: "#33334b", bld: "#2e2638", bldLight: "#3a3046", roof: "#231c2b",
    win: "#f4c95d", ground: "#5b5468", groundLine: "#4e475b", speck: "#4a4456",
    cactus: "#2f4232", cactusDark: "#263627"
  };
  var C = {
    sun: "#fff1c9", sunRing: "#fbe0a0", moon: "#f1efd8", crater: "#d3d0b4", star: "#fdf6dc",
    tumble: "#9b6b3a", tumbleDark: "#7d5430", dust: "#efd2a4",
    plate: "#2a1c12", plateText: "#f7ead0",
    nadoLight: "#aab3bb", nadoMid: "#7f8992", nadoEdge: "#5d6670", debris: "#8a6a45"
  };
  var SHARK = { G: "#8d99a6", D: "#5c6773", E: "#111111", W: "#e8ecef", R: "#b3263a" };

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
    "....HHHH....", "...HHHHHH...", "...bbbbbb...", ".HHHHHHHHHH.", "....SSSSS...",
    "....SSSSES..", "....SSSSSSS.", "....sSSSS...", "....KKKKK...", "...CCCCCCC..",
    "..CCCCCCCCC.", "..CcCCCCCCC.", "..CcCCCCCCC.", "..CcGGGGGGC.", "..CcPPPPPgA.",
    "..CcPPPPPg..", "..Cc.PP.PP..", "..C..PP.PP..", ".....PP.PP..", ".....PP.PP..",
    "....OOO.OOO.", "....OOO.OOO."
  ];
  var MINI_SHARK = ["..D..", "DGGEG", ".WWW."]; // tiny sharks orbiting the sharknado
  var TUMBLE = [
    [".TTT.", "T.t.T", "TtTtT", "T.t.T", ".TTT."],
    [".TTT.", "TtT.T", "T.t.T", "T.TtT", ".TTT."]
  ];
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

  // ---------- helpers ----------
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function ease(k) { k = clamp(k, 0, 1); return k * k * (3 - 2 * k); }
  function rgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function mix(a, b, k) {
    var x = rgb(a), y = rgb(b);
    return "rgb(" + Math.round(x[0] + (y[0] - x[0]) * k) + "," + Math.round(x[1] + (y[1] - x[1]) * k) + "," + Math.round(x[2] + (y[2] - x[2]) * k) + ")";
  }
  function rng(seed) { // deterministic PRNG so the town looks the same on resize
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function textWidth(str) {
    var w = 0;
    for (var i = 0; i < str.length; i++) w += FONT[str[i]][0].length + 1;
    return w - 1;
  }
  function drawText(g, str, x, y, color) {
    g.fillStyle = color;
    for (var i = 0; i < str.length; i++) {
      var f = FONT[str[i]];
      for (var r = 0; r < 5; r++) for (var c = 0; c < f[r].length; c++)
        if (f[r][c] === "#") g.fillRect(x + c, y + r, 1, 1);
      x += f[0].length + 1;
    }
  }
  function sprite(g, rows, pal, x, y, flip) {
    var w = rows[0].length;
    for (var r = 0; r < rows.length; r++) for (var c = 0; c < w; c++) {
      var ch = rows[r][c]; if (ch === ".") continue;
      g.fillStyle = pal[ch]; g.fillRect(x + (flip ? w - 1 - c : c), y + r, 1, 1);
    }
  }

  // ---------- state ----------
  var box, canvas, ctx, closeBtn, LW = 0, S = 2, cx = 0, riderX = [0, 0], raf = null, t0 = 0;
  var skyCache = [], townDusk, townNight, stars = [];

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
    paintLayers();
  }

  // Sky at five darkness levels (0 = dusk ... 4 = night), cached.
  function paintSky(level) {
    var c = document.createElement("canvas"); c.width = LW; c.height = HORIZON + 1;
    var g = c.getContext("2d"), k = level / 4, n = DUSK.sky.length, band = Math.ceil((HORIZON + 1) / n);
    for (var y = 0; y <= HORIZON; y++) {
      var i = Math.min(n - 1, Math.floor(y / band));
      g.fillStyle = mix(DUSK.sky[i], NIGHT.sky[i], k); g.fillRect(0, y, LW, 1);
      if (y % band === band - 1 && i + 1 < n) {
        g.fillStyle = mix(DUSK.sky[i + 1], NIGHT.sky[i + 1], k);
        for (var x = y % 2; x < LW; x += 2) g.fillRect(x, y, 1, 1);
      }
    }
    return c;
  }

  // Mesas, town and ground on a transparent sky, in one palette.
  function paintTown(P) {
    var c = document.createElement("canvas"); c.width = LW; c.height = LH;
    var g = c.getContext("2d"), r = rng(7), x;
    for (x = -10; x < LW; ) { // distant mesas
      var w = 16 + Math.floor(r() * 22), h = 3 + Math.floor(r() * 4);
      if (Math.abs(x + w / 2 - cx) > 16) {
        g.fillStyle = P.mesa; g.fillRect(x + 2, HORIZON - h, w - 4, h + 1); g.fillRect(x, HORIZON - h + 2, w, h - 1);
        g.fillStyle = P.mesaDark; g.fillRect(x + 2, HORIZON - h, w - 4, 1);
      }
      x += w + 6 + Math.floor(r() * 18);
    }
    var gapL = cx - 15, gapR = cx + 15; // keep the centre open for the sun and the shark
    for (x = 1; x < LW; ) {
      var bw = 9 + Math.floor(r() * 9), bh = 8 + Math.floor(r() * 7), top = HORIZON - bh + 1;
      if (x + bw > gapL && x < gapR) { x = gapR + 1; continue; }
      if (r() < 0.18) { // water tower
        g.fillStyle = P.roof;
        g.fillRect(x + 1, top + 5, 1, bh - 5); g.fillRect(x + 5, top + 5, 1, bh - 5); g.fillRect(x + 1, top + 8, 5, 1);
        g.fillStyle = P.bld; g.fillRect(x, top, 7, 5);
        g.fillStyle = P.roof; g.fillRect(x, top - 1, 7, 1); g.fillRect(x + 1, top - 2, 5, 1);
        x += 14 + Math.floor(r() * 12); continue;
      }
      g.fillStyle = P.bld; g.fillRect(x, top, bw, bh);
      g.fillStyle = P.bldLight; g.fillRect(x, top, 1, bh);
      g.fillStyle = P.roof; g.fillRect(x - 1, top - 1, bw + 2, 1);
      if (r() < 0.6) { g.fillStyle = P.bld; g.fillRect(x + 2, top - 3, bw - 4, 3); g.fillStyle = P.roof; g.fillRect(x + 2, top - 3, bw - 4, 1); }
      g.fillStyle = P.win;
      for (var wx = x + 2; wx + 2 <= x + bw - 1; wx += 4) g.fillRect(wx, top + 2, 2, 2);
      g.fillRect(x + Math.floor(bw / 2) - 1, HORIZON - 3, 2, 4);
      g.fillStyle = P.roof; g.fillRect(x - 1, HORIZON - 4, bw + 2, 1);
      x += bw + 6 + Math.floor(r() * 16);
    }
    g.fillStyle = P.ground; g.fillRect(0, HORIZON + 1, LW, LH - HORIZON - 1);
    g.fillStyle = P.groundLine; g.fillRect(0, HORIZON + 1, LW, 1);
    g.fillStyle = P.speck;
    for (var k = 0; k < LW * 0.6; k++) g.fillRect(Math.floor(r() * LW), HORIZON + 2 + Math.floor(r() * (LH - HORIZON - 2)), 1, 1);
    [[Math.round(LW * 0.06)], [Math.round(LW * 0.93)]].forEach(function (p) {
      var bx = p[0], base = HORIZON + 6;
      g.fillStyle = P.cactus; g.fillRect(bx, base - 9, 2, 9);
      g.fillRect(bx - 2, base - 6, 1, 3); g.fillRect(bx - 2, base - 4, 2, 1);
      g.fillRect(bx + 3, base - 7, 1, 3); g.fillRect(bx + 2, base - 5, 2, 1);
      g.fillStyle = P.cactusDark; g.fillRect(bx + 1, base - 9, 1, 9);
    });
    return c;
  }

  function paintLayers() {
    skyCache = [0, 1, 2, 3, 4].map(paintSky);
    townDusk = paintTown(DUSK); townNight = paintTown(NIGHT);
    var r = rng(99); stars = [];
    for (var i = 0; i < Math.round(LW / 9); i++) stars.push([Math.floor(r() * LW), Math.floor(r() * (HORIZON - 8)), r() * 6]);
  }

  // ---------- sky objects ----------
  function drawSun(x, y, s) {
    if (s <= 0.05) return;
    var R1 = 30 * s * s, R2 = 46 * s * s, m = Math.ceil(7 * s);
    for (var dy = -m; dy <= m; dy++) for (var dx = -m; dx <= m; dx++) {
      var d = dx * dx + dy * dy, py = Math.round(y) + dy;
      if (py > HORIZON) continue;
      if (d <= R1) ctx.fillStyle = C.sun; else if (d <= R2) ctx.fillStyle = C.sunRing; else continue;
      ctx.fillRect(Math.round(x) + dx, py, 1, 1);
    }
  }
  function drawMoon(x, y, s) {
    if (s <= 0.05) return;
    var R = 17 * s * s, m = Math.ceil(5 * s);
    ctx.fillStyle = C.moon;
    for (var dy = -m; dy <= m; dy++) for (var dx = -m; dx <= m; dx++)
      if (dx * dx + dy * dy <= R) ctx.fillRect(Math.round(x) + dx, Math.round(y) + dy, 1, 1);
    if (s > 0.7) {
      ctx.fillStyle = C.crater;
      ctx.fillRect(Math.round(x) - 1, Math.round(y) - 2, 2, 1); ctx.fillRect(Math.round(x) + 1, Math.round(y) + 1, 1, 1);
      ctx.fillRect(Math.round(x) - 2, Math.round(y) + 1, 1, 1);
    }
  }
  function drawStars(k, t) {
    if (k <= 0) return;
    ctx.fillStyle = C.star;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      if (((t * 1.5 + s[2]) % 6) < 0.4) continue; // twinkle
      if (k < 1 && (i % 4) >= k * 4) continue;    // stars come out gradually
      ctx.fillRect(s[0], s[1], 1, 1);
    }
  }

  // The nine-headed shark: nine heads joined on one shared body, radiating
  // outward (no necks), and moving as a single creature. u = seconds into the
  // shark phase.
  var BODY_R = 5, HEAD_L = 9, HEAD_GAP = 26.25 * Math.PI / 180, HEAD_ANG = [];
  for (var hi = 0; hi < 9; hi++) HEAD_ANG.push((195 - hi * 26.25) * Math.PI / 180); // left, over the top, to right
  var CLUSTER_HIDDEN = HORIZON + BODY_R + HEAD_L + 2; // centre low enough to be fully behind the ground
  function clusterY(u) {
    var low = HORIZON + 1;
    if (u < 1.6) return CLUSTER_HIDDEN + (low - CLUSTER_HIDDEN) * ease(u / 1.6);       // emerges
    if (u < 2.6) return low;                                                          // thrashes
    if (u < 3.2) return low + (SUN_Y - low) * ease((u - 2.6) / 0.6);                   // lunges over the sun
    if (u < 3.8) return SUN_Y + Math.sin((u - 3.2) * 20) * 0.6;                        // chews
    if (u < 4.8) return SUN_Y + (HORIZON + 3 - SUN_Y) * ease((u - 3.8) / 1.0);         // drops back
    return HORIZON + 3 + (CLUSTER_HIDDEN - HORIZON - 3) * ease((u - 4.8) / 2.2);       // sinks away
  }
  function clusterOpen(u, t, i) {
    if (u < 1.6) return Math.sin(t * 9 + i * 1.3) > 0.2;     // snapping at random
    if (u < 3.05) return true;                               // all jaws wide open
    if (u < 3.8) return Math.floor(u / 0.15) % 2 === 0;      // chewing
    if (i === 4 && u >= 3.95 && u < 4.4) return true;        // top head spits the moon
    if (u >= 4.8) return Math.sin(t * 9 + i * 1.3) > 0.4;
    return false;
  }
  function headHalf(rr) { // half-width of a head at distance rr past the body edge: wide, blunt snout
    var cap = HEAD_L - 3;
    if (rr <= cap) return 3.1;
    var k = rr - cap; return Math.sqrt(Math.max(0, 9.6 - k * k));
  }
  function drawCluster(x0, y0, u, t) {
    x0 = Math.round(x0); y0 = Math.round(y0);
    var M = BODY_R + HEAD_L + 1;
    for (var dy = -M; dy <= M; dy++) {
      var py = y0 + dy;
      if (py < 0 || py > HORIZON + 1) continue; // the ground covers the rest
      for (var dx = -M; dx <= M; dx++) {
        var r = Math.sqrt(dx * dx + dy * dy), col = null;
        if (r <= BODY_R + 0.5) col = r > BODY_R - 0.7 ? SHARK.D : SHARK.G; // shared body
        else {
          var th = Math.atan2(-dy, dx), best = 0, bd = 9;
          for (var i = 0; i < 9; i++) {
            var d = th - HEAD_ANG[i]; d = Math.atan2(Math.sin(d), Math.cos(d));
            if (Math.abs(d) < Math.abs(bd)) { bd = d; best = i; }
          }
          var rr = r - BODY_R, half = headHalf(rr), side = bd * r; // side > 0: back/eye, < 0: belly
          if (rr <= HEAD_L + 0.5 && Math.abs(side) <= half) {
            var seam = Math.abs(side) > half - 0.8 || Math.abs(bd) * r > HEAD_GAP / 2 * r - 0.8; // outline between heads
            var open = clusterOpen(u, t, best), m = side + 0.3;
            col = SHARK.G;
            if (side < -1.2 && rr < HEAD_L - 2) col = SHARK.W; // pale belly
            if (open && rr > HEAD_L - 4.2) {
              var mh = (rr - (HEAD_L - 4.2)) * 0.55;       // jaws widen toward the snout
              if (Math.abs(m) < mh) col = SHARK.R;
              else if (Math.abs(m) < mh + 0.9) col = SHARK.W; // teeth
            } else if (!open && rr > HEAD_L - 3 && Math.abs(m) < 0.5) col = SHARK.D; // closed mouth line
            if (rr > HEAD_L - 6 && rr < HEAD_L - 4.8 && side > 0.8 && side < 2.2) col = SHARK.E; // eye
            if (seam && col === SHARK.G) col = SHARK.D;
          }
        }
        if (col) { ctx.fillStyle = col; ctx.fillRect(x0 + dx, py, 1, 1); }
      }
    }
  }

  // The sharknado. u is seconds into the sharknado phase; returns the funnel x.
  function nadoX(u) {
    if (u < 2) return -10 + (cx + 10) * ease(u / 2);
    if (u < 3) return cx;
    return cx + (LW + 14 - cx) * ease((u - 3) / 3);
  }
  function drawNado(u, t) {
    var tx = nadoX(u), top = 6;
    for (var y = top; y <= FEET; y++) {
      var w = Math.round(2 + (FEET - y) / (FEET - top) * 13), mid = tx + Math.sin(y * 0.45 + t * 9) * 1.4;
      var x0 = Math.round(mid - w / 2);
      for (var x = 0; x <= w; x++) {
        ctx.fillStyle = (x === 0 || x === w) ? C.nadoEdge : ((x + y + Math.floor(t * 18)) % 4 < 2 ? C.nadoLight : C.nadoMid);
        ctx.fillRect(x0 + x, y, 1, 1);
      }
    }
    ctx.fillStyle = C.debris; // dust kicked up at the base
    for (var d = 0; d < 6; d++) {
      var ang = t * 7 + d * 1.05;
      ctx.fillRect(Math.round(tx + Math.cos(ang) * (4 + d % 3)), FEET - 1 - (d % 3), 1, 1);
    }
    for (var k = 0; k < 3; k++) { // sharks caught in the wind
      var a = t * 4 + k * 2.1, yy = 10 + k * 8, half = (2 + (FEET - yy) / (FEET - top) * 13) / 2 + 3;
      sprite(ctx, MINI_SHARK, SHARK, Math.round(tx + Math.cos(a) * half) - 2, yy + Math.round(Math.sin(a * 2)), Math.sin(a) > 0);
    }
  }

  // ---------- riders and labels ----------
  function drawRider(i, t) {
    var p = RIDERS[i].pal, ox = riderX[i], oy = FEET - SPRITE.length + 1, mirror = i === 1, phase = i * 1.3;
    var blink = (t + phase) % 3.7 < 0.14, twitch = (t + phase * 0.7) % 2.9 < 0.22, flutter = Math.floor((t + phase) * 2) % 2 === 1;
    for (var r = 0; r < SPRITE.length; r++) for (var c = 0; c < 12; c++) {
      var ch = SPRITE[r][c];
      if (ch === "E" && blink) ch = "S";
      if (ch === "A" && twitch) ch = ".";
      if (r === 13 && c === 10 && twitch) ch = "A";
      if (flutter && r === 17 && c === 2) ch = ".";
      if (flutter && r === 17 && c === 1) ch = "C";
      if (ch === ".") continue;
      ctx.fillStyle = p[ch]; ctx.fillRect(ox + (mirror ? 11 - c : c), oy + r, 1, 1);
    }
    ctx.fillStyle = p.K; // bandana tail in the wind
    ctx.fillRect((mirror ? ox + 8 : ox + 3) + (mirror ? 1 : -1), oy + 8 + (flutter ? 1 : 0), 1, 1);
  }
  function drawLabel(i) {
    var rd = RIDERS[i], label = rd.tag + " " + rd.name, w = textWidth(label) + 4, h = 9, top = 2, head = riderX[i] + 6;
    var left = Math.max(1, Math.min(LW - w - 1, head - Math.floor(w / 2)));
    ctx.fillStyle = C.plateText; ctx.fillRect(left, top, w, h);
    ctx.fillStyle = C.plate; ctx.fillRect(left + 1, top + 1, w - 2, h - 2);
    drawText(ctx, rd.tag, left + 2, top + 2, rd.tagColor);
    drawText(ctx, rd.name, left + 2 + textWidth(rd.tag) + 3, top + 2, C.plateText);
    ctx.fillStyle = C.plateText;
    ctx.fillRect(head - 1, top + h, 3, 1); ctx.fillRect(head, top + h + 1, 1, 1);
  }

  // ---------- frame ----------
  function phaseAt(t) {
    var m = t % CYCLE;
    for (var i = 0; i < PHASES.length; i++) { if (m < PHASES[i][1]) return { name: PHASES[i][0], u: m }; m -= PHASES[i][1]; }
    return { name: "dusk", u: 0 };
  }

  function frame(now) {
    if (!t0) t0 = now;
    var t = (now - t0) / 1000, ph = phaseAt(t), u = ph.u;
    var night = 0, sun = null, moon = null, k;

    if (ph.name === "dusk") { sun = [cx, SUN_Y, 1]; }
    else if (ph.name === "shark") {
      night = u < 3 ? 0 : u < 4.6 ? (u - 3) / 1.6 : 1;
      if (u < 3.2) sun = [cx, SUN_Y, u < 2.6 ? 1 : 1 - (u - 2.6) / 0.6];
      if (u >= 4.0) { // the top head spits the moon up into the sky
        k = ease((u - 4.0) / 1.0);
        var tipY = clusterY(4.0) - BODY_R - HEAD_L;
        moon = [cx, tipY + (MOON_Y - tipY) * k - Math.sin(Math.PI * k) * 6, 0.3 + 0.7 * k];
      }
    }
    else if (ph.name === "night") { night = 1; moon = [cx, MOON_Y, 1]; }
    else { // sharknado
      night = u < 2 ? 1 : u < 4 ? 1 - (u - 2) / 2 : 0;
      if (u < 2) moon = [cx, MOON_Y, 1];
      else if (u < 3) { k = u - 2; moon = [cx, MOON_Y + (7 - MOON_Y) * k, 1 - k]; }
      if (u >= 3) { // sun flies out of the funnel and settles back on the horizon
        k = ease((u - 3) / 1.2);
        sun = [cx - Math.sin(Math.PI * k) * 8, 7 + (SUN_Y - 7) * k - Math.sin(Math.PI * k) * 5, 0.4 + 0.6 * k];
      }
    }
    var level = Math.round(clamp(night, 0, 1) * 4);

    ctx.clearRect(0, 0, LW, LH);
    ctx.drawImage(skyCache[level], 0, 0);
    drawStars(level / 4, t);
    if (sun) drawSun(sun[0], sun[1], sun[2]);
    if (ph.name === "shark") drawCluster(cx + (u < 2.6 ? Math.round(Math.sin(t * 13)) : 0), clusterY(u), u, t);
    if (moon) drawMoon(moon[0], moon[1], moon[2]);
    ctx.drawImage(townDusk, 0, 0);
    if (level > 0) { ctx.globalAlpha = level / 4; ctx.drawImage(townNight, 0, 0); ctx.globalAlpha = 1; }
    if (ph.name === "nado") drawNado(u, t);

    ctx.fillStyle = C.dust; // drifting dust
    for (var d = 0; d < 4; d++) ctx.fillRect(Math.floor((t * (6 + d * 3) + d * 57) % (LW + 20)) - 10, HORIZON + 3 + ((d * 3) % 6), 2, 1);
    var cyc = (t + 2) % 11; // tumbleweed between the riders every ~11 s
    if (cyc < 7) {
      var tx = Math.floor(-6 + (LW + 12) * (cyc / 7));
      var spr = TUMBLE[Math.floor(tx / 3) % 2 === 0 ? 0 : 1], ty = FEET - 4 - (Math.floor(tx / 5) % 3 === 0 ? 1 : 0);
      sprite(ctx, spr, { T: C.tumble, t: C.tumbleDark }, tx, ty, false);
    }
    drawRider(0, t); drawRider(1, t);
    drawLabel(0); drawLabel(1);
    raf = requestAnimationFrame(frame);
  }

  // ---------- show / hide ----------
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
    box.setAttribute("aria-label", "Pixel-art western standoff in a desert town: Author versus Reviewer Comments, while a nine-headed shark and a sharknado trade the sun and the moon");
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");
    closeBtn = document.createElement("button");
    closeBtn.className = "standoff-close"; closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Close"); closeBtn.textContent = "✕";
    closeBtn.addEventListener("click", hide);
    box.appendChild(canvas); box.appendChild(closeBtn);
    document.body.appendChild(box);
    window.addEventListener("resize", layout);
    layout();
  }
  function show() {
    if (!box) build();
    if (box.classList.contains("show")) return;
    box.getBoundingClientRect(); // commit the off-screen start so the slide-in transition still runs
    box.classList.add("show");
    document.body.style.paddingBottom = LH * S + "px";
    if (!raf) { t0 = 0; frame(performance.now()); } // draw the first frame right away
  }
  function hide() {
    box.classList.remove("show");
    document.body.style.paddingBottom = "";
    setTimeout(function () {
      if (!box.classList.contains("show") && raf) { cancelAnimationFrame(raf); raf = null; }
    }, 650);
  }

  // For checking the scene at a given moment: showStandoff.debugAt(seconds) freezes it there.
  show.debugAt = function (sec) {
    if (!box) build();
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    t0 = 0; frame(0); cancelAnimationFrame(raf); raf = null;
    t0 = -sec * 1000; frame(0); cancelAnimationFrame(raf); raf = null;
  };
  window.showStandoff = show;
})();
