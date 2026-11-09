/* Last Round at the Copper Kettle — a hidden pixel tavern game on mingyaowang.com.
   Slide ales down four counters, catch the empties, keep the adventurers from reaching the bar.
   Everything is drawn with fillRect on a 320x200 canvas that the page scales up. */
(function () {
  "use strict";

  var W = 320, H = 200, BAND = 72, LANE_H = 32, NL = 4;
  var LANE_START = [22, 38, 30, 46], LANE_END = 282;
  var laneY = function (i) { return BAND + i * LANE_H; };

  var canvas = document.getElementById("game");
  var ctx = canvas.getContext("2d");
  canvas.width = W; canvas.height = H;
  var bg = document.createElement("canvas"); bg.width = W; bg.height = H;
  var fg = document.createElement("canvas"); fg.width = W; fg.height = H;
  var C = ctx; // current drawing target

  function R(x, y, w, h, c) { C.fillStyle = c; C.fillRect(Math.round(x), Math.round(y), w, h); }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function seeded(seed) {
    return function () {
      seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- tavern folk ---------- */
  var SKIN = ["#f8dcc4", "#f1c7a3", "#e2b088", "#c48a5e", "#9a6644", "#fbe6d4"];
  var HAIR = ["#2b2220", "#5a3a24", "#8a5a2b", "#d9a441", "#f1e2a8", "#b8463a", "#e6e6ee", "#6c7bd1", "#d88fb5", "#3f6b4a", "#9b6bd0"];
  var CLOTH = ["#3f6fb0", "#b0473f", "#4f8a4a", "#7d5aa6", "#c98a2e", "#2f6f73", "#8c3a5e", "#5b6470", "#a0763c", "#d8c9a8", "#e07a5f", "#6a9fb5"];
  var CLOAK = ["#3b4f7a", "#6b2f3a", "#3e5b3a", "#4a3b5e", "#7a5a2e", "#2f4f55"];
  var HATS = [null, null, null, "wizard", "hood", "helm", "cap", "ribbon", "flower"];
  var STYLES = ["short", "long", "bun", "spiky", "twin", "short"];
  var INK = "#2a1f1d", BOOT = "#3a2a22";

  function makeLook(r, extra) {
    var p = function (a) { return a[Math.floor(r() * a.length)]; };
    var L = {
      skin: p(SKIN), hair: p(HAIR), top: p(CLOTH), accent: p(CLOTH), hatColor: p(CLOTH),
      cloak: r() < 0.35 ? p(CLOAK) : null, style: p(STYLES), hat: p(HATS),
      elf: r() < 0.25, beard: r() < 0.12, giant: r() < 0.12
    };
    if (L.elf) L.beard = false;
    if (L.giant) { L.elf = false; if (L.hat === "ribbon" || L.hat === "flower") L.hat = null; }
    if (extra) for (var k in extra) L[k] = extra[k];
    return L;
  }

  // Chibi villager: big head, short body. x = left edge, yb = feet line.
  function chibi(x, yb, L, o) {
    o = o || {};
    var g = L.giant ? 1 : 0;
    var hw = 8 + 2 * g, hh = 7 + g, bw = 8 + 4 * g, bh = 6 + 3 * g;
    var lh = o.seated ? 0 : 3 + g;
    var cx = x + 6 + 2 * g;
    var y = yb - lh - bh - hh - (o.bob ? 1 : 0) - (o.hop || 0);
    var hx = cx - hw / 2, bx = cx - bw / 2, by = y + hh;
    var fx = o.face || 0;
    var hatHidesHair = L.hat === "hood" || L.hat === "helm";

    if (L.style === "long" && !hatHidesHair) R(hx - 1, y + 2, hw + 2, hh + 2, L.hair);
    if (L.cloak) R(bx - 1, by, bw + 2, bh + (o.seated ? 0 : 2), L.cloak);
    if (!o.seated) {
      R(bx + 1, by + bh, 2 + g, lh - (o.step === 1 ? 1 : 0), BOOT);
      R(bx + bw - 3 - g, by + bh, 2 + g, lh - (o.step === 2 ? 1 : 0), BOOT);
    }
    R(bx, by, bw, bh, L.top);
    if (o.apron) {
      R(bx, by, 2, bh - 1, L.accent); R(bx + bw - 2, by, 2, bh - 1, L.accent);
      R(cx - 1, by, 2, 1, L.accent);
      R(bx + 1, by + bh - 3, bw - 2, 3 + Math.max(0, lh - 1), "#fbfaf6");
    } else {
      R(bx, by + bh - 2, bw, 1, L.accent);
    }
    var armH = bh - 2;
    R(bx - 2, by + 1, 2, armH, L.top); R(bx - 2, by + 1 + armH, 2, 1, L.skin);
    if (o.pour) {
      R(bx + bw, by + 2, 4, 2, L.top); R(bx + bw + 4, by + 2, 1, 2, L.skin);
    } else if (o.mug) {
      R(bx + bw, by - 1, 2, 3, L.top);
      R(bx + bw + 1, by - 4, 4, 5, "#e9b949"); R(bx + bw + 1, by - 5, 4, 1, "#fff6d8"); R(bx + bw + 5, by - 3, 1, 2, "#f1d98a");
    } else {
      R(bx + bw, by + 1, 2, armH, L.top); R(bx + bw, by + 1 + armH, 2, 1, L.skin);
    }

    R(hx, y, hw, hh, L.skin);
    if (!hatHidesHair) {
      R(hx - 1, y - 1, hw + 2, 3, L.hair);
      R(hx - 1, y + 2, 1, 3, L.hair); R(hx + hw, y + 2, 1, 3, L.hair);
      R(hx + 1, y + 2, 2, 1, L.hair); R(hx + hw - 3, y + 2, 1, 1, L.hair);
      if (L.style === "spiky") { R(hx, y - 2, 1, 1, L.hair); R(hx + 3, y - 2, 2, 1, L.hair); R(hx + hw - 1, y - 2, 1, 1, L.hair); }
      if (L.style === "bun") R(cx - 2, y - 3, 4, 2, L.hair);
      if (L.style === "twin") { R(hx - 3, y + 2, 2, 5, L.hair); R(hx + hw + 1, y + 2, 2, 5, L.hair); }
    }
    if (L.elf) {
      R(hx - 2, y + 3, 1, 2, L.skin); R(hx - 3, y + 2, 1, 1, L.skin);
      R(hx + hw + 1, y + 3, 1, 2, L.skin); R(hx + hw + 2, y + 2, 1, 1, L.skin);
    }
    var ey = y + 3 + g;
    if (o.blink) { R(hx + 2 + fx, ey + 1, 1, 1, INK); R(hx + hw - 3 + fx, ey + 1, 1, 1, INK); }
    else { R(hx + 2 + fx, ey, 1, 2, INK); R(hx + hw - 3 + fx, ey, 1, 2, INK); }
    R(hx + 1 + fx, ey + 2, 1, 1, "#f0a0a0"); R(hx + hw - 2 + fx, ey + 2, 1, 1, "#f0a0a0");
    if (L.beard) R(hx + 1, y + hh - 2, hw - 2, 3, L.hair);

    var hc = L.hatColor;
    switch (L.hat) {
      case "wizard":
        R(hx - 2, y, hw + 4, 1, hc); R(hx, y - 2, hw, 2, hc); R(hx + 1, y - 4, hw - 2, 2, hc);
        R(hx + 2, y - 6, hw - 4, 2, hc); R(hx + 4, y - 8, 2, 2, hc); R(hx + 6, y - 9, 2, 1, hc);
        R(hx, y - 1, hw, 1, "#e8c95a"); break;
      case "hood":
        R(hx - 1, y - 2, hw + 2, 3, hc); R(hx - 1, y + 1, 1, hh, hc); R(hx + hw, y + 1, 1, hh, hc); R(hx, y + 1, hw, 1, hc); break;
      case "helm":
        R(hx - 1, y - 2, hw + 2, 4, "#a7b0ba"); R(hx - 1, y + 1, hw + 2, 1, "#6f7882");
        R(hx - 1, y + 2, 1, 3, "#a7b0ba"); R(hx + hw, y + 2, 1, 3, "#a7b0ba"); R(cx - 1, y - 3, 2, 1, "#c4473f"); break;
      case "cap":
        R(hx - 1, y - 2, hw + 1, 2, hc); R(hx + hw - 2, y - 1, 3, 1, hc); break;
      case "ribbon":
        R(hx + hw - 3, y - 2, 2, 2, hc); R(hx + hw - 1, y - 3, 2, 2, hc); R(hx + hw - 5, y - 3, 2, 2, hc); break;
      case "flower":
        R(hx + hw - 2, y - 1, 3, 3, "#f7a8c4"); R(hx + hw - 1, y, 1, 1, "#ffe27a"); break;
    }
  }
  var spriteW = function (L) { return L.giant ? 16 : 12; };

  /* ---------- background folk (fixed every visit) ---------- */
  var rs = seeded(20261109);
  var TABLES = [44, 98, 250];
  var folk = [];
  TABLES.forEach(function (tc) {
    folk.push({ kind: "seat", x: tc - 6, yb: 55, L: makeLook(rs, { giant: false }), face: 0 });
    folk.push({ kind: "seat", x: tc - 21, yb: 60, L: makeLook(rs, { giant: false }), face: 1 });
    folk.push({ kind: "seat", x: tc + 9, yb: 60, L: makeLook(rs, { giant: false }), face: -1 });
  });
  var bard = { kind: "bard", x: 176, yb: 56, L: makeLook(rs, { giant: false, hat: "cap", hatColor: "#3f6f4a", cloak: "#7a3b2e", elf: true, beard: false }) };
  var dancers = [
    { kind: "dance", x: 196, yb: 63, L: makeLook(rs, { giant: false, hat: "flower", style: "twin", top: "#e07a5f" }) },
    { kind: "dance", x: 211, yb: 63, L: makeLook(rs, { giant: false, hat: null, style: "spiky", top: "#3f6fb0" }) }
  ];
  var giant = { kind: "giant", x: 286, yb: 62, L: makeLook(rs, { giant: true, hat: null, beard: true, top: "#5b6470", cloak: "#3e5b3a" }) };
  var server = { x: 70, dir: 1, L: makeLook(rs, { giant: false, hat: "ribbon", hatColor: "#c4473f", style: "bun", top: "#3f6b4a", cloak: null }) };
  folk.concat([bard, giant], dancers).forEach(function (n, i) {
    n.phase = i * 1.37; n.sip = 0; n.next = 1 + rs() * 5;
  });

  /* ---------- static layers ---------- */
  var WIN1 = { x: 12, y: 10, w: 26, h: 22 }, WIN2 = { x: 200, y: 10, w: 26, h: 22 };
  function mullions(wn) {
    R(wn.x + (wn.w >> 1) - 1, wn.y, 2, wn.h, "#3b2a1f");
    R(wn.x, wn.y + (wn.h >> 1) - 1, wn.w, 2, "#3b2a1f");
  }
  function drawStatic() {
    var r = seeded(7), i, x, y;
    C = bg.getContext("2d");
    // plaster wall, beams, wainscot, floor
    R(0, 0, W, BAND, "#6e5441");
    for (i = 0; i < 520; i++) R(r() * W, 5 + r() * 39, r() < 0.3 ? 2 : 1, 1, r() < 0.5 ? "#634a39" : "#7a5f4a");
    R(0, 0, W, 4, "#3b2a1f"); R(0, 4, W, 1, "#2c1d14");
    R(0, 44, W, 16, "#5a3d29");
    for (x = 0; x < W; x += 8) R(x, 46, 1, 14, "#4a3122");
    R(0, 44, W, 2, "#3b2a1f");
    R(0, 60, W, 12, "#7a5535"); R(0, 60, W, 1, "#4a3122");
    for (y = 63; y < 72; y += 3) R(0, y, W, 1, "#6a4a2e");
    for (y = 61, i = 0; y < 72; y += 3, i++) for (x = (i % 2) * 13; x < W; x += 26) R(x, y, 1, 2, "#5e4129");
    [0, 70, 234, 316].forEach(function (bx) { R(bx, 5, 4, 39, "#3b2a1f"); R(bx + 1, 5, 1, 39, "#4a3626"); });

    // windows: night sky, moon, rooftops
    [WIN1, WIN2].forEach(function (wn, k) {
      R(wn.x - 2, wn.y - 2, wn.w + 4, wn.h + 4, "#3b2a1f");
      R(wn.x, wn.y, wn.w, wn.h, "#1d2b4d");
      for (i = 0; i < 10; i++) R(wn.x + 1 + r() * (wn.w - 2), wn.y + 1 + r() * (wn.h - 9), 1, 1, r() < 0.5 ? "#f4efcf" : "#9fb3d9");
      if (k === 1) { R(wn.x + wn.w - 9, wn.y + 3, 5, 7, "#f4efcf"); R(wn.x + wn.w - 10, wn.y + 4, 7, 5, "#f4efcf"); R(wn.x + wn.w - 7, wn.y + 5, 1, 1, "#d9d3ac"); }
      R(wn.x, wn.y + wn.h - 4, wn.w, 4, "#141c33");
      R(wn.x + 3, wn.y + wn.h - 8, 7, 4, "#141c33"); R(wn.x + 5, wn.y + wn.h - 10, 3, 2, "#141c33");
      R(wn.x + 16, wn.y + wn.h - 7, 6, 3, "#141c33"); R(wn.x + 7, wn.y + wn.h - 6, 1, 1, "#ffcf6a");
      mullions(wn);
      R(wn.x - 3, wn.y + wn.h + 2, wn.w + 6, 2, "#5a3d29");
    });

    // banner
    R(48, 8, 12, 17, "#7c2128"); R(48, 25, 5, 2, "#7c2128"); R(55, 25, 5, 2, "#7c2128");
    R(48, 8, 12, 1, "#a8343c"); R(52, 12, 4, 6, "#e0b84d"); R(51, 14, 6, 2, "#e0b84d"); R(47, 7, 14, 1, "#2c1d14");

    // chandelier frame (flames are animated)
    R(98, 5, 1, 7, "#2c1d14"); R(88, 12, 21, 2, "#2c1d14"); R(88, 11, 1, 1, "#2c1d14"); R(108, 11, 1, 1, "#2c1d14");
    [89, 97, 105].forEach(function (cx) { R(cx, 9, 2, 3, "#f3ead0"); });

    // pennant garland
    for (x = 112; x < 196; x += 7) {
      var sag = Math.round(3 * Math.sin((x - 112) / 84 * Math.PI));
      var col = ["#c4473f", "#e9b949", "#3f6fb0", "#4f8a4a"][((x - 112) / 7) % 4];
      R(x, 6 + sag, 7, 1, "#2c1d14");
      R(x + 1, 7 + sag, 5, 1, col); R(x + 2, 8 + sag, 3, 1, col); R(x + 3, 9 + sag, 1, 1, col);
    }

    // fireplace
    R(122, 25, 36, 35, "#77716b");
    for (i = 0; i < 44; i++) R(122 + r() * 33, 25 + r() * 33, 3, 2, r() < 0.5 ? "#6a645e" : "#87827c");
    R(118, 22, 44, 3, "#5a3a24"); R(118, 22, 44, 1, "#7a5535");
    R(128, 36, 24, 24, "#1b0f0a"); R(130, 34, 20, 2, "#1b0f0a"); R(133, 33, 14, 1, "#1b0f0a");
    R(130, 56, 20, 3, "#5a3a24"); R(132, 55, 6, 1, "#6e4a2e"); R(142, 55, 6, 1, "#6e4a2e");
    R(124, 17, 2, 5, "#f3ead0"); R(154, 17, 2, 5, "#f3ead0");
    R(137, 17, 6, 5, "#4f8a4a"); R(138, 15, 1, 2, "#6fb36a"); R(141, 14, 1, 3, "#6fb36a");

    // shelves with bottles
    [15, 29].forEach(function (sy) {
      R(252, sy, 54, 2, "#5a3a24"); R(254, sy + 2, 2, 3, "#3b2a1f"); R(302, sy + 2, 2, 3, "#3b2a1f");
      for (x = 255; x < 302; x += 6) {
        var hgt = 5 + Math.floor(r() * 4), c = ["#4f8a4a", "#7a4a2a", "#7d5aa6", "#c98a2e", "#2f6f73"][Math.floor(r() * 5)];
        R(x, sy - hgt, 4, hgt, c); R(x + 1, sy - hgt - 2, 2, 2, c); R(x + 1, sy - hgt + 2, 1, 2, "rgba(255,255,255,0.35)");
      }
    });

    // bard's crate
    R(172, 56, 20, 6, "#6e4328"); R(172, 56, 20, 1, "#8a5a34"); R(181, 57, 1, 5, "#5a361f");

    // counters: back wall, doors, decor, kegs
    for (i = 0; i < NL; i++) {
      var y0 = laneY(i), ls = LANE_START[i];
      R(0, y0, W, 20, "#4b3324");
      for (x = (i * 5) % 10; x < W; x += 10) R(x, y0 + 1, 1, 19, "#412c1f");
      R(0, y0, W, 1, "#2a1b12"); R(0, y0 + 19, W, 1, "#3a281b");
      R(0, y0 + 20, W, 12, "#7a5535");
      R(0, y0 + 26, W, 1, "#6a4a2e");
      for (x = (i % 2) * 11; x < W; x += 22) R(x, y0 + 21, 1, 5, "#5e4129");

      var dx = ls - 18;
      R(dx - 1, y0 + 2, 16, 18, "#2a1b12");
      R(dx + 1, y0 + 4, 12, 16, "#6a4426"); R(dx + 2, y0 + 3, 10, 1, "#6a4426");
      for (var k = 1; k < 4; k++) R(dx + 1 + k * 3, y0 + 4, 1, 16, "#573620");
      R(dx + 10, y0 + 12, 1, 1, "#e0b84d");

      [92 + i * 37, 214 - i * 23].forEach(function (lx) {
        var grd = C.createRadialGradient(lx + 2, y0 + 8, 1, lx + 2, y0 + 8, 11);
        grd.addColorStop(0, "rgba(255,207,106,0.35)"); grd.addColorStop(1, "rgba(255,207,106,0)");
        C.fillStyle = grd; C.fillRect(lx - 10, y0 + 1, 24, 19);
        R(lx + 1, y0 + 2, 2, 2, "#2a1b12"); R(lx, y0 + 4, 4, 7, "#2a1b12"); R(lx + 1, y0 + 5, 2, 5, "#ffcf6a");
      });
      if (i === 0) { R(150, y0 + 4, 16, 11, "#c9a24a"); R(151, y0 + 5, 14, 9, "#4f7a9a"); R(151, y0 + 10, 14, 4, "#4f8a4a"); R(160, y0 + 6, 3, 2, "#f4efcf"); }
      if (i === 1) { R(160, y0 + 4, 18, 12, "#9a6b3e"); R(162, y0 + 5, 5, 6, "#efe6cf"); R(169, y0 + 6, 6, 4, "#efe6cf"); R(170, y0 + 11, 5, 4, "#f2d0d0"); R(164, y0 + 12, 4, 3, "#efe6cf"); }
      if (i === 2) { R(140, y0 + 4, 10, 9, "#2f5a8a"); R(141, y0 + 13, 8, 1, "#2f5a8a"); R(143, y0 + 14, 4, 1, "#2f5a8a"); R(144, y0 + 5, 2, 9, "#e0b84d"); R(141, y0 + 8, 8, 2, "#e0b84d"); }
      if (i === 3) { R(165, y0 + 4, 17, 12, "#5a3a24"); R(166, y0 + 5, 15, 10, "#2b3330"); R(168, y0 + 7, 10, 1, "#ddd8c8"); R(168, y0 + 10, 7, 1, "#ddd8c8"); R(168, y0 + 13, 11, 1, "#ddd8c8"); }

      R(303, y0 + 3, 14, 17, "#7a4a2a"); R(303, y0 + 3, 14, 1, "#94603a");
      R(302, y0 + 6, 16, 1, "#3d3d3d"); R(302, y0 + 15, 16, 1, "#3d3d3d"); R(308, y0 + 9, 4, 4, "#94603a");
      R(299, y0 + 9, 4, 2, "#cfcfcf"); R(299, y0 + 11, 1, 2, "#cfcfcf"); R(300, y0 + 6, 1, 3, "#7c2128");
    }

    // counters live on their own layer so patrons stand behind them
    C = fg.getContext("2d");
    for (i = 0; i < NL; i++) {
      var yy = laneY(i), s = LANE_START[i], len = LANE_END - s;
      R(s, yy + 20, len, 4, "#a5703f"); R(s, yy + 20, len, 1, "#c99158"); R(s, yy + 23, len, 1, "#8a5a30");
      R(s, yy + 24, len, 8, "#6e4328");
      for (x = s + 6; x < LANE_END - 18; x += 22) { R(x, yy + 25, 16, 6, "#7a4c2e"); R(x, yy + 25, 16, 1, "#5a361f"); }
      R(s, yy + 31, len, 1, "#4a2c19");
      R(s - 1, yy + 20, 2, 12, "#5a361f"); R(LANE_END - 1, yy + 20, 2, 12, "#5a361f");
    }
    C = ctx;
  }

  /* ---------- tiny pixel digits for score pops ---------- */
  var FONT = {
    "0": "111101101101111", "1": "010110010010111", "2": "111001111100111", "3": "111001111001111",
    "4": "101101111001001", "5": "111100111001111", "6": "111100111101111", "7": "111001010010010",
    "8": "111101111101111", "9": "111101111001111", "+": "000010111010000", "!": "010010010000010"
  };
  function pixText(s, x, y, c) {
    for (var n = 0; n < s.length; n++) {
      var f = FONT[s[n]];
      if (f) for (var k = 0; k < 15; k++) if (f[k] === "1") R(x + (k % 3), y + ((k / 3) | 0), 1, 1, c);
      x += 4;
    }
  }

  /* ---------- sound ---------- */
  var AC = null, muted = false;
  try { muted = localStorage.getItem("tavernMute") === "1"; } catch (e) { /* storage blocked */ }
  function audio() {
    if (!AC) { var A = window.AudioContext || window.webkitAudioContext; if (!A) return null; AC = new A(); }
    if (AC.state === "suspended") AC.resume();
    return AC;
  }
  function tone(f, d, type, vol, f2, delay) {
    var a = audio(); if (!a || muted) return;
    var t0 = a.currentTime + (delay || 0), o = a.createOscillator(), gn = a.createGain();
    o.type = type || "square"; o.frequency.setValueAtTime(f, t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + d);
    gn.gain.setValueAtTime(vol || 0.04, t0); gn.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    o.connect(gn); gn.connect(a.destination); o.start(t0); o.stop(t0 + d + 0.02);
  }
  function noise(d, vol) {
    var a = audio(); if (!a || muted) return;
    var buf = a.createBuffer(1, Math.floor(a.sampleRate * d), a.sampleRate), ch = buf.getChannelData(0);
    for (var i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / ch.length);
    var src = a.createBufferSource(), flt = a.createBiquadFilter(), gn = a.createGain();
    src.buffer = buf; flt.type = "highpass"; flt.frequency.value = 1800; gn.gain.value = vol;
    src.connect(flt); flt.connect(gn); gn.connect(a.destination); src.start();
  }
  var SFX = {
    pour: function () { tone(300, 0.12, "triangle", 0.05, 620); },
    blink: function () { tone(1200, 0.12, "sine", 0.03, 2400); },
    move: function () { tone(220, 0.04, "square", 0.02); },
    grab: function () { tone(660, 0.05, "square", 0.03); },
    clink: function () { tone(1568, 0.08, "triangle", 0.05); tone(2093, 0.1, "triangle", 0.035, null, 0.04); },
    out: function () { tone(523, 0.07, "square", 0.03); tone(784, 0.09, "square", 0.03, null, 0.07); },
    coin: function () { tone(988, 0.07, "square", 0.04); tone(1319, 0.18, "square", 0.04, null, 0.07); },
    smash: function () { noise(0.28, 0.14); tone(180, 0.2, "sawtooth", 0.035, 60); },
    clear: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.13, "square", 0.04, null, i * 0.1); }); },
    over: function () { [392, 330, 262, 196].forEach(function (f, i) { tone(f, 0.2, "triangle", 0.05, null, i * 0.17); }); }
  };
  function sfx(n) { try { SFX[n](); } catch (e) { /* audio unavailable */ } }

  /* ---------- music: an original jig in D, synthesized live (no samples, no borrowed tunes) ---------- */
  var musicOn = true;
  try { musicOn = localStorage.getItem("tavernMusic") !== "0"; } catch (e) { /* storage blocked */ }
  // 6/8 jig, AABB. Each bar is six eighth notes as MIDI numbers; "-" holds the previous note.
  var TUNE_A = ["74 69 66 69 66 62", "64 66 67 69 71 69", "74 69 66 69 74 76", "78 76 74 76 - -",
                "74 69 66 69 66 62", "67 71 67 66 69 66", "64 67 71 69 66 64", "62 66 69 74 - -"];
  var TUNE_B = ["78 - 81 78 76 74", "76 74 71 69 - 66", "67 71 74 79 78 76", "78 74 69 69 71 73",
                "74 - 78 81 78 74", "73 76 81 79 76 73", "74 71 67 64 66 67", "69 66 64 62 - -"];
  var ROOT_A = [50, 55, 50, 57, 50, 55, 57, 50], ROOT_B = [50, 59, 55, 57, 50, 57, 55, 50];
  var SCALE = [62, 64, 66, 67, 69, 71, 73, 74, 76, 78, 79, 81, 83, 85, 86];
  var MEL = [], ROOTS = [];
  [TUNE_A, TUNE_A, TUNE_B, TUNE_B].forEach(function (part, pi) {
    part.forEach(function (bar, bi) {
      bar.split(" ").forEach(function (n) { MEL.push(n === "-" ? 0 : +n); });
      ROOTS.push((pi < 2 ? ROOT_A : ROOT_B)[bi]);
    });
  });
  var M = { playing: false, step: 0, next: 0, timer: null, out: null, drone: null, noise: null };
  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function musicLevel() { return musicOn && !muted ? 0.55 : 0; }
  function eighth() {
    var bpm = Math.min(100 + (S.level - 1) * 3, 124) * (S.jig > 0 ? 1.08 : 1);
    return 60 / (bpm * 3);
  }
  function musicStart(fromTop) {
    var a = audio(); if (!a) return;
    if (!M.out) {
      M.out = a.createGain(); M.out.gain.value = 0; M.out.connect(a.destination);
      M.noise = a.createBuffer(1, Math.floor(a.sampleRate * 0.05), a.sampleRate);
      var ch = M.noise.getChannelData(0);
      for (var i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
    }
    if (fromTop) M.step = 0;
    M.out.gain.cancelScheduledValues(a.currentTime);
    M.out.gain.setTargetAtTime(musicLevel(), a.currentTime, 0.3);
    if (M.playing) return;
    M.playing = true; M.next = a.currentTime + 0.12;
    var f = a.createBiquadFilter(), g = a.createGain();
    f.type = "lowpass"; f.frequency.value = 480; g.gain.value = 0.03;
    f.connect(g); g.connect(M.out);
    M.drone = [38, 45, 50].map(function (m, k) {
      var o = a.createOscillator(); o.type = "sawtooth"; o.frequency.value = hz(m); o.detune.value = (k - 1) * 5;
      o.connect(f); o.start(); return o;
    });
    M.timer = setInterval(schedule, 25);
  }
  function musicStop(fade) {
    if (!M.playing) return;
    M.playing = false; clearInterval(M.timer);
    if (AC && M.out) { M.out.gain.cancelScheduledValues(AC.currentTime); M.out.gain.setTargetAtTime(0, AC.currentTime, fade || 0.12); }
    var d = M.drone; M.drone = null;
    setTimeout(function () { (d || []).forEach(function (o) { try { o.stop(); } catch (e) { /* already stopped */ } }); }, 2500);
  }
  function musicRefresh() {
    if (AC && M.out) { M.out.gain.cancelScheduledValues(AC.currentTime); M.out.gain.setTargetAtTime(M.playing ? musicLevel() : 0, AC.currentTime, 0.2); }
  }
  function schedule() {
    if (!AC || !M.playing) return;
    while (M.next < AC.currentTime + 0.12) {
      playStep(M.step, M.next);
      M.next += eighth();
      M.step = (M.step + 1) % MEL.length;
    }
  }
  function playStep(i, t) {
    var e = eighth(), pos = i % 6, bar = Math.floor(i / 6), n = MEL[i];
    if (n) {
      var len = 1;
      while (len < 6 && MEL[(i + len) % MEL.length] === 0) len++;
      var dur = len * e;
      if ((pos === 0 && bar % 2 === 1) || len >= 3) { // a quick "cut" grace note above, as fiddlers and pipers do
        var up = SCALE[SCALE.indexOf(n) + 1] || n + 2;
        voice(up, t, 0.04, 0.55, false); voice(n, t + 0.04, dur - 0.04, 1, false);
      } else voice(n, t, dur, pos === 0 || pos === 3 ? 1 : 0.78, false);
      if (Math.floor(i / 48) % 2 === 1) { // second time through each part: add a harmony line a third below
        var si = SCALE.indexOf(n);
        if (si >= 2) voice(SCALE[si - 2], t, dur, 0.5, true);
      }
    }
    if (pos === 0) { bass(ROOTS[bar], t, e * 2.4); drum(t, 1); }
    else if (pos === 3) { bass(ROOTS[bar] + 7, t, e * 2.4); drum(t, 0.7); }
    else drum(t, pos === 5 ? 0.32 : 0.18);
  }
  function voice(m, t, dur, vel, harmony) {
    var a = AC, o = a.createOscillator(), g = a.createGain(), f = a.createBiquadFilter();
    o.type = harmony ? "triangle" : "square"; o.frequency.value = hz(m);
    f.type = "lowpass"; f.frequency.value = harmony ? 1800 : 2600;
    var peak = (harmony ? 0.05 : 0.04) * vel;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.01);
    g.gain.exponentialRampToValueAtTime(peak * 0.6, t + Math.max(0.02, dur * 0.6));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.03);
    if (dur > 0.3 && !harmony) { // gentle vibrato on held notes
      var lfo = a.createOscillator(), lg = a.createGain();
      lfo.frequency.value = 5.5; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(hz(m) * 0.007, t + dur);
      lfo.connect(lg); lg.connect(o.frequency); lfo.start(t); lfo.stop(t + dur + 0.05);
    }
    o.connect(f); f.connect(g); g.connect(M.out);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function bass(m, t, dur) {
    var a = AC, o = a.createOscillator(), g = a.createGain();
    o.type = "triangle"; o.frequency.value = hz(m - 12);
    g.gain.setValueAtTime(0.11, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(M.out); o.start(t); o.stop(t + dur + 0.02);
  }
  function drum(t, vel) { // bodhran-ish: a pitched thump plus a short skin noise
    var a = AC, o = a.createOscillator(), g = a.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(52, t + 0.12);
    g.gain.setValueAtTime(0.2 * vel, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.connect(g); g.connect(M.out); o.start(t); o.stop(t + 0.18);
    var s = a.createBufferSource(), f = a.createBiquadFilter(), ng = a.createGain();
    s.buffer = M.noise; f.type = "bandpass"; f.frequency.value = 900; ng.gain.value = 0.06 * vel;
    s.connect(f); f.connect(ng); ng.connect(M.out); s.start(t);
  }

  /* ---------- game state ---------- */
  var AT_TAP = 286;
  var S = {
    mode: "title", level: 1, score: 0, lives: 3, best: 0, quota: 0, served: 0, toSpawn: 0, spawnT: 0,
    patrons: [], fulls: [], empties: [], parts: [], pops: [], coins: [], tips: [], notes: [],
    timer: 0, jig: 0, dance: 0, combo: 0, t: 0, sharkT: 12, noteT: 0, chatT: 1.5, convoT: 5, convo: null,
    bt: { lane: 1, x: AT_TAP, cd: 0, pourT: 0, target: null, anim: 0, walking: false }
  };
  var keys = { left: false, right: false };
  try { S.best = parseInt(localStorage.getItem("tavernBest") || "0", 10) || 0; } catch (e) { /* storage blocked */ }
  var bartenderLook = { skin: "#f3d2b3", hair: "#1d1816", top: "#f3efe6", accent: "#7c2128", style: "short", hat: null, cloak: null };

  // Kinds of patron, introduced one per round from round 2.
  var KINDS = {
    regular: { speed: 1, need: 1, drink: [1.0, 1.6] },
    giant: { speed: 0.75, need: 2, drink: [1.4, 2.0], from: 2, name: "THE GIANT", blurb: "Big and thirsty: they need two ales before they leave the counter." },
    rogue: { speed: 1.5, need: 1, drink: [0.7, 1.1], from: 3, name: "THE ROGUE", blurb: "Quick on their feet, and they hardly ever stop to look around." },
    wizard: { speed: 0.9, need: 1, drink: [1.0, 1.6], from: 4, name: "THE WIZARD", blurb: "Every few seconds they blink a few steps closer. Keep an eye on the sparkles." }
  };
  var REG_HATS = [null, null, "helm", "cap", "ribbon", "flower"];
  function lookFor(kind) {
    var r = Math.random;
    if (kind === "giant") return makeLook(r, { giant: true, hat: null, elf: false });
    if (kind === "rogue") return makeLook(r, { giant: false, hat: "hood", hatColor: "#2f2f3c", cloak: "#262630", top: "#3a3a48" });
    if (kind === "wizard") return makeLook(r, { giant: false, hat: "wizard", hatColor: ["#5a3fa0", "#2f4f9a", "#7a2f6a"][Math.floor(r() * 3)], cloak: "#3b3170" });
    return makeLook(r, { giant: false, hat: REG_HATS[Math.floor(r() * REG_HATS.length)] });
  }
  function pickKind() {
    var pool = ["regular", "regular", "regular"];
    ["giant", "rogue", "wizard"].forEach(function (k) { if (S.level >= KINDS[k].from) pool.push(k); });
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function params() {
    var L = S.level;
    return {
      speed: Math.min(8 + 2.2 * L, 30),
      interval: Math.max(1.1, 3.8 - 0.32 * L),
      perLane: Math.min(2 + (L >> 1), 5),
      mug: 118 + 4 * L,
      empty: 44 + 2 * L
    };
  }
  function mult() { return Math.min(4, 1 + Math.floor(S.combo / 5)); }
  function award(base, x, y, c) {
    var v = base * mult();
    S.score += v; S.combo++; pop(x, y, "+" + v, c); hud();
  }

  function clearCounters() {
    S.patrons = []; S.fulls = []; S.empties = []; S.tips = []; S.dance = 0;
    clearBubbles(true);
    S.bt.x = AT_TAP; S.bt.target = null;
  }
  function startLevel() {
    S.quota = Math.min(6 + 3 * S.level, 36);
    S.served = 0; S.toSpawn = S.quota; S.spawnT = 1.2;
    clearCounters();
    var fresh = null;
    for (var k in KINDS) if (KINDS[k].from === S.level) fresh = KINDS[k];
    if (fresh) {
      S.mode = "intro"; S.timer = 3.6;
      showOverlay("<h2>ROUND " + S.level + "</h2><p>A new regular walks in: " + fresh.name + "</p><p class='small'>" + fresh.blurb + "</p><p class='small'>SPACE or tap to start</p>", true);
    } else { S.mode = "play"; hideOverlay(); }
  }
  function startGame() {
    S.level = 1; S.score = 0; S.lives = 3; S.combo = 0; S.bt.lane = 1;
    startLevel(); hud(); musicStart(true);
  }
  function beginRound() { if (S.mode === "intro") { S.mode = "play"; hideOverlay(); } }

  function spawnPatron(p) {
    var open = [];
    for (var i = 0; i < NL; i++) {
      var n = 0, blocked = false;
      S.patrons.forEach(function (c) {
        if (c.lane !== i || c.state === "exit") return;
        n++; if (c.x < LANE_START[i] + 6) blocked = true;
      });
      if (n < p.perLane && !blocked) open.push(i);
    }
    if (!open.length) return false;
    var lane = open[Math.floor(Math.random() * open.length)], kind = pickKind(), L = lookFor(kind);
    var np = { lane: lane, kind: kind, x: LANE_START[lane] - 16, L: L, w: spriteW(L), state: "walk", go: true, gt: rand(0.9, 1.8), anim: 0, target: 0, drinkT: 0, blinkT: rand(2.5, 4.5), need: KINDS[kind].need };
    S.patrons.push(np);
    if (Math.random() < (kind === "regular" ? 0.4 : 0.8)) patronSay(np, LINES.enter[kind]);
    return true;
  }

  function shatter(x, y, beer) {
    for (var i = 0; i < 9; i++) S.parts.push({ x: x + 2, y: y, vx: rand(-40, 40), vy: rand(-70, -20), t: rand(0.4, 0.8), c: i < 3 && beer ? "#e9b949" : (i % 2 ? "#cfe6ee" : "#9fc4cf") });
  }
  function sparkle(x, y) {
    for (var i = 0; i < 7; i++) S.parts.push({ x: x, y: y, vx: rand(-30, 30), vy: rand(-60, -10), t: rand(0.3, 0.6), c: i % 2 ? "#c9a8ff" : "#fff3b0" });
  }
  function pop(x, y, s, c) { S.pops.push({ x: x, y: y, s: s, t: 0.9, c: c || "#ffe27a" }); }

  function lose(msg) {
    S.lives--; S.combo = 0; S.mode = "lost"; S.timer = 2.0; sfx("smash"); hud();
    showOverlay("<h2>OOPS!</h2><p>" + msg + "</p><p class='small'>" + (S.lives > 0 ? "Lives left: " + S.lives : "That was the last one…") + "</p>", true);
  }

  function update(dt) {
    S.t += dt;
    updateFolk(dt);
    S.parts.forEach(function (q) { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 220 * dt; q.t -= dt; });
    S.parts = S.parts.filter(function (q) { return q.t > 0; });
    S.pops.forEach(function (q) { q.y -= 14 * dt; q.t -= dt; });
    S.pops = S.pops.filter(function (q) { return q.t > 0; });
    S.coins.forEach(function (q) { q.y += q.vy * dt; q.vy += 90 * dt; q.t -= dt; });
    S.coins = S.coins.filter(function (q) { return q.t > 0; });

    if (S.mode === "intro") { S.timer -= dt; if (S.timer <= 0) beginRound(); return; }
    if (S.mode === "lost") {
      S.timer -= dt;
      if (S.timer <= 0) {
        if (S.lives <= 0) return gameOver();
        S.toSpawn = S.quota - S.served; S.spawnT = 1.2;
        clearCounters();
        S.mode = "play"; hideOverlay();
      }
      return;
    }
    if (S.mode === "clear") {
      S.timer -= dt;
      if (S.timer <= 0) { S.level++; startLevel(); hud(); }
      return;
    }
    if (S.mode !== "play") return;

    var p = params(), bt = S.bt, i, c;
    bt.cd -= dt; bt.pourT -= dt;
    if (S.dance > 0) S.dance -= dt;

    // bartender walks along the counter (arrow keys, or towards a tapped spot)
    var dir = (keys.left ? -1 : 0) + (keys.right ? 1 : 0);
    if (dir) bt.target = null;
    else if (bt.target !== null) {
      var gap = bt.target - bt.x;
      dir = Math.abs(gap) < 1.5 ? 0 : (gap < 0 ? -1 : 1);
      if (!dir) bt.target = null;
    }
    bt.x = Math.max(LANE_START[bt.lane] + 2, Math.min(AT_TAP, bt.x + dir * 95 * dt));
    bt.walking = dir !== 0 && bt.x > LANE_START[bt.lane] + 2 && bt.x < AT_TAP;
    if (bt.walking) bt.anim += dt;
    for (i = 0; i < S.tips.length; i++) {
      var tp = S.tips[i];
      if (tp.lane === bt.lane && Math.abs(tp.x + 2 - (bt.x + 6)) < 7) {
        tp.dead = true; sfx("coin");
        award(100, tp.x - 4, laneY(tp.lane) + 4, "#9fe08a");
        S.coins.push({ x: tp.x, y: laneY(tp.lane) + 14, vy: -70, t: 1.0 });
        S.dance = 3; S.jig = 3.5;
        say(pickLine(LINES.thanks), bt.x + 6, laneY(bt.lane) + 4, { owner: "bartender", cap: 6, t: 1.8 });
        S.patrons.filter(function (q) { return q.state === "walk"; }).slice(0, 2).forEach(function (q) { patronSay(q, LINES.jig, { t: 2.2, cap: 7 }); });
      }
    }

    if (S.toSpawn > 0) {
      S.spawnT -= dt;
      if (S.spawnT <= 0) {
        if (spawnPatron(p)) S.toSpawn--;
        S.spawnT = p.interval * rand(0.6, 1.3);
      }
    }

    for (i = 0; i < S.patrons.length; i++) {
      c = S.patrons[i];
      var ls = LANE_START[c.lane], K = KINDS[c.kind];
      if (c.state === "walk") {
        if (S.dance > 0) { c.anim += dt; continue; } // everyone stops to dance
        c.gt -= dt;
        if (c.gt <= 0) {
          c.go = !c.go;
          c.gt = c.kind === "rogue" ? (c.go ? rand(0.9, 1.5) : rand(0.15, 0.35)) : (c.go ? rand(0.9, 1.8) : rand(0.3, 0.8));
        }
        if (c.go) { c.x += p.speed * K.speed * dt; c.anim += dt; }
        if (c.kind === "wizard") {
          c.blinkT -= dt;
          if (c.blinkT <= 0) {
            sparkle(c.x + c.w / 2, laneY(c.lane) + 10);
            c.x += 18; c.blinkT = rand(3, 5);
            sparkle(c.x + c.w / 2, laneY(c.lane) + 10); sfx("blink");
          }
        }
        if (!c.warned && c.x + c.w > LANE_END - 64) { c.warned = true; if (Math.random() < 0.6) patronSay(c, LINES.hurry, { cls: "shout", t: 2.2, cap: 6 }); }
        if (c.x + c.w >= LANE_END - 2) return lose("A thirsty adventurer stormed the bar!");
      } else if (c.state === "drink") {
        c.drinkT -= dt;
        if (c.drinkT <= 0) {
          S.empties.push({ lane: c.lane, x: c.x + c.w });
          if (c.need > 0) { c.state = "walk"; c.go = false; c.gt = 0.5; } // still thirsty
          else { // off to find a table
            c.state = "exit"; S.served++; sfx("out");
            if (Math.random() < 0.3) say(pickLine(LINES.leave), c.x + c.w / 2, laneY(c.lane) + (c.L.giant ? -3 : 4), { owner: c, cap: 6, t: 1.8 });
          }
        }
      } else if (c.state === "exit") {
        c.x -= 60 * dt;
        if (c.x < ls - 30) c.dead = true;
      }
    }

    for (i = 0; i < S.fulls.length; i++) {
      var m = S.fulls[i], nx = m.x - p.mug * dt, hit = null;
      S.patrons.forEach(function (q) {
        if (q.lane === m.lane && q.state === "walk" && q.x + q.w - 1 >= nx && (!hit || q.x > hit.x)) hit = q;
      });
      if (hit) {
        hit.state = "drink"; hit.drinkT = rand(KINDS[hit.kind].drink[0], KINDS[hit.kind].drink[1]); hit.need--;
        m.dead = true; sfx("grab"); award(50, hit.x + 2, laneY(hit.lane) - 2);
        if (Math.random() < 0.35) patronSay(hit, LINES.cheers, { t: 1.6 });
        if (S.tips.length < 2 && Math.random() < 0.2) S.tips.push({ lane: m.lane, x: Math.min(hit.x + hit.w + 2, LANE_END - 28), t: 0 });
      } else {
        m.x = nx;
        if (m.x < LANE_START[m.lane] - 3) { m.dead = true; shatter(m.x, laneY(m.lane) + 18, true); return lose("An ale slid off the end of the counter!"); }
      }
    }

    for (i = 0; i < S.empties.length; i++) {
      var e = S.empties[i];
      e.x += p.empty * dt;
      var reach = bt.lane === e.lane ? Math.min(bt.x + 2, LANE_END) : LANE_END;
      if (e.x + 5 >= reach) {
        e.dead = true;
        if (bt.lane === e.lane) { sfx("clink"); award(10, Math.min(e.x, LANE_END - 10), laneY(e.lane) + 6); }
        else { shatter(LANE_END, laneY(e.lane) + 18, false); return lose("An empty mug crashed to the floor!"); }
      }
    }

    var alive = function (q) { return !q.dead; };
    S.patrons = S.patrons.filter(alive); S.fulls = S.fulls.filter(alive); S.empties = S.empties.filter(alive); S.tips = S.tips.filter(alive);

    if (S.toSpawn === 0 && !S.patrons.length && !S.fulls.length && !S.empties.length) {
      var bonus = 100 * S.level;
      S.score += bonus; S.mode = "clear"; S.timer = 2.6; sfx("clear"); hud();
      showOverlay("<h2>ROUND " + S.level + " CLEARED</h2><p>Every adventurer served.</p><p class='small'>Round bonus +" + bonus + "</p>", true);
    }
  }

  /* ---------- chatter: speech bubbles over the canvas ---------- */
  var LINES = window.TAVERN_LINES || { folk: ["..."], convo: [], bard: ["..."], giant: ["..."], server: ["..."], dance: ["..."], cat: ["..."],
    enter: { regular: ["Ale, please!"], giant: ["Ale!"], rogue: ["Ale."], wizard: ["Ale?"] }, cheers: ["Cheers!"], hurry: ["Hey!"], jig: ["Woo!"], thanks: ["Thanks!"], leave: ["Bye!"] };
  var bubbleLayer = document.getElementById("bubbles"), bubbles = [];
  // Shuffle bag per pool: every line is used once before the pool is reshuffled.
  var bags = [];
  function pickLine(pool) {
    var bag = null;
    for (var i = 0; i < bags.length; i++) if (bags[i].pool === pool) { bag = bags[i]; break; }
    if (!bag) { bag = { pool: pool, left: [], last: null }; bags.push(bag); }
    if (!bag.left.length) {
      bag.left = pool.slice();
      for (var j = bag.left.length - 1; j > 0; j--) { var k = Math.floor(Math.random() * (j + 1)), tmp = bag.left[j]; bag.left[j] = bag.left[k]; bag.left[k] = tmp; }
      if (bag.left.length > 1 && bag.left[bag.left.length - 1] === bag.last) bag.left.unshift(bag.left.pop());
    }
    bag.last = bag.left.pop();
    return bag.last;
  }
  function say(text, x, y, o) {
    o = o || {};
    if (!bubbleLayer) return;
    if (o.owner && bubbles.some(function (b) { return b.owner === o.owner; })) return;
    if (bubbles.length >= (o.cap || 4)) return;
    var el = document.createElement("div");
    el.className = "bubble" + (o.cls ? " " + o.cls : "");
    el.textContent = text;
    bubbleLayer.appendChild(el);
    void el.offsetWidth; el.classList.add("show");
    var b = { el: el, x: x, y: y, t: o.t || 2.6, owner: o.owner || o.follow, follow: o.follow };
    bubbles.push(b); placeBubble(b);
  }
  function placeBubble(b) {
    b.el.style.left = (b.x / W * 100) + "%";
    b.el.style.top = (b.y / H * 100) + "%";
    b.el.classList.toggle("l", b.x < 60);
    b.el.classList.toggle("r", b.x > 262);
  }
  function updateBubbles(dt) {
    bubbles.forEach(function (b) {
      b.t -= dt;
      if (b.follow) {
        if (b.follow.dead || b.follow.state === "exit") b.t = Math.min(b.t, 0.25);
        else b.x = b.follow.x + b.follow.w / 2;
      }
      if (b.t <= 0.25) b.el.classList.remove("show");
      if (b.t <= 0) { b.el.remove(); b.dead = true; } else placeBubble(b);
    });
    bubbles = bubbles.filter(function (b) { return !b.dead; });
  }
  function clearBubbles(patronsOnly) {
    bubbles.forEach(function (b) { if (!patronsOnly || b.follow) { b.el.remove(); b.dead = true; } });
    bubbles = bubbles.filter(function (b) { return !b.dead; });
  }
  function patronSay(c, pool, o) {
    o = o || {};
    o.follow = c; o.cap = o.cap || 5;
    say(pickLine(pool), c.x + c.w / 2, laneY(c.lane) + (c.L.giant ? -3 : 4), o);
  }
  function bandSpeakers() {
    var list = [];
    folk.forEach(function (n, i) { list.push({ who: n, pool: LINES.folk, x: n.x + 6, y: n.yb - 16, w: 10, table: Math.floor(i / 3) }); });
    list.push({ who: bard, pool: LINES.bard, x: bard.x + 6, y: bard.yb - 19, w: 3, cls: "song" });
    list.push({ who: giant, pool: LINES.giant, x: giant.x + 8, y: giant.yb - 23, w: 2.5 });
    list.push({ who: server, pool: LINES.server, x: server.x + 6, y: 48, w: 2.5 });
    dancers.forEach(function (n) { list.push({ who: n, pool: LINES.dance, x: n.x + 6, y: n.yb - 19, w: 1 }); });
    list.push({ who: "cat", pool: LINES.cat, x: 168, y: 53, w: 0.8 });
    return list;
  }
  function crowded(x) {
    return bubbles.some(function (b) { return !b.follow && b.y < BAND && Math.abs(b.x - x) < 70; });
  }
  function folkChatter() {
    var list = bandSpeakers().filter(function (sp) {
      return !(S.convo && sp.table === S.convo.table) && !crowded(sp.x) && !bubbles.some(function (b) { return b.owner === sp.who; });
    });
    if (!list.length) return;
    var total = list.reduce(function (a, sp) { return a + sp.w; }, 0), r = Math.random() * total, sp = list[0];
    for (var i = 0; i < list.length; i++) { r -= list[i].w; if (r <= 0) { sp = list[i]; break; } }
    say(pickLine(sp.pool), sp.x, sp.y, { owner: sp.who, cls: sp.cls || "", cap: 3, t: 3.2 });
  }
  // two neighbours at one table trade lines; each line replaces the previous one
  function startConvo() {
    if (!LINES.convo || !LINES.convo.length) return;
    var table = Math.floor(Math.random() * TABLES.length), seats = [0, 1, 2].map(function (k) { return folk[table * 3 + k]; });
    var a = Math.floor(Math.random() * 3), b = (a + 1 + Math.floor(Math.random() * 2)) % 3;
    S.convo = { table: table, lines: pickLine(LINES.convo), i: 0, t: 0, who: [seats[a], seats[b]], prev: null };
  }
  function stepConvo(dt) {
    var c = S.convo;
    c.t -= dt;
    if (c.t > 0) return;
    if (c.i >= c.lines.length) { S.convo = null; return; }
    var n = c.who[c.i % 2];
    if (c.prev) c.prev.t = Math.min(c.prev.t, 0.25);
    bubbles.forEach(function (bb) { if (bb.owner === n) bb.t = 0; });
    updateBubbles(0);
    say(c.lines[c.i], n.x + 6, n.yb - 16, { owner: n, cap: 8, t: 2.8, cls: "talk" });
    c.prev = bubbles[bubbles.length - 1];
    c.i++; c.t = 2.3;
  }

  function updateFolk(dt) {
    folk.concat([bard, giant]).forEach(function (n) {
      n.sip -= dt; n.next -= dt;
      if (n.next <= 0) { n.sip = 0.8; n.next = rand(2.5, 6.5); }
    });
    if (S.jig > 0) S.jig -= dt;
    if (S.mode !== "paused") {
      updateBubbles(dt);
      S.chatT -= dt;
      if (S.chatT <= 0) { folkChatter(); S.chatT = rand(2.2, 4.8); }
      if (S.convo) stepConvo(dt);
      else { S.convoT -= dt; if (S.convoT <= 0) { startConvo(); S.convoT = rand(9, 16); } }
    }
    S.noteT -= dt;
    if (S.noteT <= 0) {
      S.notes.push({ x: bard.x + 11, y: bard.yb - 12, t: 2.2, ph: Math.random() * 6 });
      S.noteT = S.jig > 0 ? 0.28 : rand(0.7, 1.2);
    }
    S.notes.forEach(function (q) { q.y -= 9 * dt; q.t -= dt; });
    S.notes = S.notes.filter(function (q) { return q.t > 0; });
    server.x += server.dir * 13 * dt;
    if (server.x > 300) server.dir = -1;
    if (server.x < 66) server.dir = 1;
    S.sharkT -= dt;
    if (S.sharkT < -4.5) S.sharkT = rand(35, 55);
  }

  /* ---------- drawing ---------- */
  function flick(a, b) { return Math.sin(S.t * a + b) + Math.sin(S.t * a * 1.71 + b * 2.3); }

  function drawFolk() {
    var t = S.t, jig = S.jig > 0, i;
    // fireplace glow and flames
    var grd = ctx.createRadialGradient(140, 50, 4, 140, 50, 46 + flick(7, 0) * 2);
    grd.addColorStop(0, "rgba(255,170,70,0.28)"); grd.addColorStop(1, "rgba(255,170,70,0)");
    ctx.fillStyle = grd; ctx.fillRect(90, 10, 100, 62);
    for (i = 0; i < 9; i++) {
      var fh = 7 + Math.round(2.5 * flick(9, i * 1.3) + 3);
      R(131 + i * 2, 56 - fh, 2, fh, "#e8642c");
      R(131 + i * 2, 56 - Math.round(fh * 0.6), 2, Math.round(fh * 0.6), "#f7a531");
      R(131 + i * 2, 56 - Math.round(fh * 0.3), 2, Math.round(fh * 0.3), "#ffe27a");
    }
    [89, 97, 105, 124, 154].forEach(function (cx, k) {
      var cy = k < 3 ? 7 : 15;
      R(cx + (flick(11, k) > 1 ? 1 : 0), cy, 1, 2, "#ffd45a");
    });

    // a small shark sometimes swims past the left window
    if (S.sharkT < 0) {
      var sx = WIN1.x - 10 + (-S.sharkT) * 10, sy = WIN1.y + 7 + Math.round(Math.sin(t * 3) * 2);
      ctx.save(); ctx.beginPath(); ctx.rect(WIN1.x, WIN1.y, WIN1.w, WIN1.h); ctx.clip();
      R(sx, sy, 8, 3, "#8a9bb0"); R(sx + 3, sy - 2, 2, 2, "#8a9bb0"); R(sx - 2, sy - 1, 2, 2, "#8a9bb0"); R(sx - 2, sy + 2, 2, 2, "#8a9bb0");
      R(sx + 1, sy + 2, 6, 1, "#c9d3df"); R(sx + 6, sy + 1, 1, 1, INK);
      ctx.restore(); mullions(WIN1);
    }

    // seated folk, then tables in front of them
    folk.forEach(function (n) {
      chibi(n.x, n.yb, n.L, { seated: true, face: n.face, mug: n.sip > 0 || jig, bob: Math.sin(t * 2 + n.phase) > 0.75, blink: (t + n.phase) % 4.2 < 0.12 });
    });
    TABLES.forEach(function (tc) {
      R(tc - 13, 53, 26, 3, "#8a5a34"); R(tc - 13, 53, 26, 1, "#a8744a"); R(tc - 12, 56, 24, 1, "#5e3a20");
      R(tc - 1, 57, 3, 6, "#5e3a20"); R(tc - 4, 62, 9, 1, "#4a2c19");
      R(tc - 8, 50, 3, 3, "#e9b949"); R(tc - 8, 49, 3, 1, "#fff6d8"); R(tc + 5, 50, 3, 3, "#e9b949"); R(tc + 5, 49, 3, 1, "#fff6d8");
    });

    // bard with lute
    var strum = Math.floor(t * (jig ? 12 : 5)) % 2;
    chibi(bard.x, bard.yb, bard.L, { face: 1, bob: strum === 1, blink: (t + 1) % 3.7 < 0.12 });
    var by = bard.yb - 9;
    R(bard.x + 2, by + 1, 6, 4, "#c07a3a"); R(bard.x + 3, by, 4, 1, "#c07a3a"); R(bard.x + 4, by + 2, 1, 1, "#3a2418");
    R(bard.x + 8, by + 1, 3, 1, "#6b4423"); R(bard.x + 11, by, 3, 1, "#6b4423");
    R(bard.x + 4 + strum, by + 3, 2, 1, bard.L.skin);
    S.notes.forEach(function (q) {
      var nx = q.x + Math.sin(S.t * 2 + q.ph) * 3, a = Math.min(1, q.t);
      ctx.globalAlpha = a;
      R(nx, q.y, 2, 2, "#ffe9a8"); R(nx + 1, q.y - 4, 1, 4, "#ffe9a8"); R(nx + 2, q.y - 4, 1, 1, "#ffe9a8");
      ctx.globalAlpha = 1;
    });

    // dancers
    dancers.forEach(function (n, k) {
      var sp = jig ? 10 : 4, hop = Math.round(Math.abs(Math.sin(t * sp + k * 1.6)) * (jig ? 4 : 1.4));
      chibi(n.x, n.yb, n.L, { hop: hop, step: 1 + (Math.floor(t * sp / 2 + k) % 2), face: k ? -1 : 1, mug: jig && k === 1 });
    });

    // the giant by the shelves
    chibi(giant.x, giant.yb, giant.L, { face: -1, mug: giant.sip > 0 || jig, blink: (t + 2) % 5 < 0.14 });

    // sleepy cat
    var tail = Math.floor(t * 1.5) % 4 === 0 ? -1 : 0;
    R(160, 58, 9, 4, "#d6913f"); R(162, 58, 1, 2, "#b06f2a"); R(165, 58, 1, 2, "#b06f2a");
    R(167, 56, 5, 5, "#d6913f"); R(167, 55, 1, 1, "#d6913f"); R(171, 55, 1, 1, "#d6913f");
    R(168, 58, 1, 1, INK); R(170, 58, 1, 1, INK); R(158, 60 + tail, 2, 1, "#d6913f");
    if (t % 5 < 2.5) { var zz = (t % 5) * 4; ctx.globalAlpha = 1 - (t % 5) / 2.5; R(172 + zz / 2, 52 - zz, 2, 1, "#f3ead0"); R(173 + zz / 2, 53 - zz, 1, 1, "#f3ead0"); R(172 + zz / 2, 54 - zz, 2, 1, "#f3ead0"); ctx.globalAlpha = 1; }

    // server weaving between tables with a tray
    var face = server.dir > 0 ? 1 : -1, sxp = Math.round(server.x);
    chibi(sxp, 67, server.L, { face: face, step: 1 + (Math.floor(t * 6) % 2) });
    var tx = face > 0 ? sxp + 11 : sxp - 6;
    R(tx, 56, 8, 1, "#cfcfcf"); R(tx + 1, 53, 2, 3, "#e9b949"); R(tx + 5, 53, 2, 3, "#e9b949"); R(tx + 1, 52, 2, 1, "#fff6d8"); R(tx + 5, 52, 2, 1, "#fff6d8");
  }

  function drawMug(x, y0, full) {
    if (full) {
      R(x, y0 + 15, 5, 6, "#e9b949"); R(x, y0 + 14, 5, 2, "#fff6d8"); R(x + 1, y0 + 16, 1, 4, "#f6d77a");
      R(x + 5, y0 + 16, 1, 3, "#d9c58a");
    } else {
      R(x, y0 + 15, 5, 6, "#bcd6dd"); R(x + 1, y0 + 16, 3, 4, "#8fb3bd"); R(x, y0 + 15, 5, 1, "#e8f2f0");
      R(x - 1, y0 + 16, 1, 3, "#bcd6dd");
    }
  }

  function render() {
    C = ctx;
    ctx.drawImage(bg, 0, 0);
    drawFolk();
    var t = S.t, bt = S.bt;
    for (var i = 0; i < NL; i++) {
      var y0 = laneY(i), ls = LANE_START[i];
      ctx.save(); ctx.beginPath(); ctx.rect(ls - 17, 0, W, H); ctx.clip();
      S.patrons.filter(function (c) { return c.lane === i; }).sort(function (a, b) { return a.x - b.x; }).forEach(function (c) {
        var dancing = c.state === "walk" && S.dance > 0;
        var moving = c.state === "walk" && c.go && !dancing;
        chibi(Math.round(c.x), y0 + 22, c.L, {
          face: c.state === "exit" ? -1 : (dancing ? (Math.floor(t * 4 + c.x) % 2 ? 1 : -1) : 1),
          step: dancing ? 1 + (Math.floor(t * 8) % 2) : moving ? 1 + (Math.floor(c.anim * 7) % 2) : (c.state === "exit" ? 1 + (Math.floor(t * 7) % 2) : 0),
          hop: dancing ? Math.round(Math.abs(Math.sin(t * 9 + c.x)) * 3) : 0,
          mug: c.state === "drink",
          bob: c.state === "drink" && Math.floor(t * 4) % 2 === 0
        });
        if (c.state === "walk" && !dancing && c.x + c.w > LANE_END - 52 && Math.floor(t * 4) % 2 === 0) pixText("!", c.x + c.w / 2 - 1, y0 - 9 - (c.L.giant ? 6 : 0), "#ff5a4a");
      });
      ctx.restore();
      var here = bt.lane === i && S.mode !== "title", away = bt.x < AT_TAP - 3;
      if (here && away) chibi(Math.round(bt.x), y0 + 22, bartenderLook, { face: keys.right || (bt.target !== null && bt.target > bt.x) ? 1 : -1, apron: true, step: bt.walking ? 1 + (Math.floor(bt.anim * 8) % 2) : 0 });
      ctx.drawImage(fg, 0, y0 + 20, W, 12, 0, y0 + 20, W, 12);
      S.tips.forEach(function (tp) {
        if (tp.lane !== i) return;
        R(tp.x, y0 + 16, 4, 4, "#f2c94c"); R(tp.x + 1, y0 + 17, 2, 2, "#c9971f"); R(tp.x, y0 + 16, 1, 1, "#fff3b0");
        if (Math.floor(t * 3 + tp.x) % 3 === 0) { R(tp.x + 5, y0 + 13, 1, 1, "#fff3b0"); R(tp.x - 2, y0 + 15, 1, 1, "#fff3b0"); }
      });
      S.fulls.forEach(function (m) { if (m.lane === i) drawMug(m.x, y0, true); });
      S.empties.forEach(function (m) { if (m.lane === i) drawMug(m.x, y0, false); });
      if (here && !away) {
        var pouring = bt.pourT > 0;
        chibi(AT_TAP, y0 + 24, bartenderLook, { face: pouring ? 1 : -1, apron: true, pour: pouring, blink: t % 3.3 < 0.12 });
        if (pouring) { R(300, y0 + 13, 1, 3, "#e9b949"); R(298, y0 + 16, 4, 5, "#e9b949"); R(298, y0 + 15, 4, 1, "#fff6d8"); }
      }
    }
    if (S.mode === "title") chibi(286, laneY(1) + 24, bartenderLook, { face: -1, apron: true, blink: t % 3.3 < 0.12 });
    S.coins.forEach(function (q) { R(q.x, q.y, 4, 4, "#f2c94c"); R(q.x + 1, q.y + 1, 2, 2, "#c9971f"); R(q.x, q.y, 1, 1, "#fff3b0"); });
    S.parts.forEach(function (q) { R(q.x, q.y, 1, 1, q.c); });
    S.pops.forEach(function (q) { ctx.globalAlpha = Math.min(1, q.t * 2); pixText(q.s, q.x, q.y, q.c); ctx.globalAlpha = 1; });
  }

  /* ---------- UI ---------- */
  var overlay = document.getElementById("overlay");
  var $ = function (id) { return document.getElementById(id); };
  var lastHud = "";
  function hud() {
    var key = [S.level, S.score, S.best, S.lives, mult()].join("|");
    if (key === lastHud) return; lastHud = key;
    $("hRound").textContent = S.level;
    $("hScore").textContent = S.score;
    $("hBest").textContent = Math.max(S.best, S.score);
    $("hCombo").textContent = "x" + mult();
    $("hCombo").parentNode.classList.toggle("hot", mult() > 1);
    $("hLives").textContent = new Array(Math.max(0, S.lives) + 1).join("🍺");
  }
  function showOverlay(html, soft) {
    overlay.innerHTML = html;
    overlay.classList.toggle("soft", !!soft);
    overlay.hidden = false;
  }
  function hideOverlay() { overlay.hidden = true; }

  function titleScreen() {
    S.mode = "title";
    showOverlay(
      "<h2>LAST ROUND</h2>" +
      "<p>The seminar is over and the tavern is packed. Slide ales down the counters, catch the empty mugs, and don't let anyone reach the bar.</p>" +
      "<p class='small opt'>Coins left on the counter? Walk over and grab them &mdash; the bard strikes up a jig and everyone stops to dance.</p>" +
      "<div class='row'><button class='btn' id='startBtn' type='button'>OPEN THE TAVERN</button></div>" +
      "<p class='small opt'>&uarr; &darr; switch counters &middot; &larr; &rarr; walk &middot; SPACE pour</p>"
    );
    $("startBtn").addEventListener("click", function () { audio(); startGame(); });
  }
  function gameOver() {
    S.mode = "over"; musicStop(0.5); sfx("over");
    var isBest = S.score > S.best;
    if (isBest) { S.best = S.score; try { localStorage.setItem("tavernBest", String(S.best)); } catch (e) { /* storage blocked */ } }
    hud();
    showOverlay(
      "<h2>CLOSING TIME</h2>" +
      "<p>You reached round " + S.level + " and earned " + S.score + " coins." + (isBest ? " A new house record!" : "") + "</p>" +
      "<p class='small'>Hope your paper gets accepted.</p>" +
      "<div class='row'><button class='btn' id='againBtn' type='button'>ANOTHER ROUND</button><a class='btn ghost' href='/'>LEAVE</a></div>"
    );
    $("againBtn").addEventListener("click", startGame);
  }
  function togglePause() {
    if (S.mode === "play") { S.mode = "paused"; keys.left = keys.right = false; musicStop(); showOverlay("<h2>PAUSED</h2><p class='small'>Press P or tap to keep pouring</p>", true); }
    else if (S.mode === "paused") { S.mode = "play"; hideOverlay(); musicStart(false); }
  }

  function move(d) {
    if (S.mode !== "play") return;
    S.bt.lane = (S.bt.lane + d + NL) % NL; S.bt.x = AT_TAP; S.bt.target = null; sfx("move");
  }
  function pour() {
    if (S.mode !== "play" || S.bt.cd > 0) return;
    S.bt.x = AT_TAP; S.bt.target = null; // dash back to the tap
    S.fulls.push({ lane: S.bt.lane, x: LANE_END - 8 });
    S.bt.cd = 0.24; S.bt.pourT = 0.18; sfx("pour");
  }
  // the one "do something" action: start, resume, skip the intro, or pour
  function act() {
    audio();
    if (S.mode === "title" || S.mode === "over") startGame();
    else if (S.mode === "paused") togglePause();
    else if (S.mode === "intro") beginRound();
    else pour();
  }

  document.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "ArrowUp" || k === "w" || k === "W") { move(-1); e.preventDefault(); }
    else if (k === "ArrowDown" || k === "s" || k === "S") { move(1); e.preventDefault(); }
    else if (k === "ArrowLeft" || k === "a" || k === "A") { keys.left = true; e.preventDefault(); }
    else if (k === "ArrowRight" || k === "d" || k === "D") { keys.right = true; e.preventDefault(); }
    else if (k === " " || k === "Enter") { e.preventDefault(); if (!e.repeat) act(); }
    else if (k === "p" || k === "P" || k === "Escape") togglePause();
    else if (k === "m" || k === "M") toggleMusic();
  });
  document.addEventListener("keyup", function (e) {
    var k = e.key;
    if (k === "ArrowLeft" || k === "a" || k === "A") keys.left = false;
    else if (k === "ArrowRight" || k === "d" || k === "D") keys.right = false;
  });
  window.addEventListener("blur", function () { keys.left = keys.right = false; });

  // Tap a counter: another counter = go there; far along your counter = walk there; near the tap = pour.
  canvas.addEventListener("pointerdown", function (e) {
    e.preventDefault();
    if (S.mode !== "play") return act();
    var rect = canvas.getBoundingClientRect();
    var x = (e.clientX - rect.left) / rect.width * W, y = (e.clientY - rect.top) / rect.height * H;
    if (y < BAND) return;
    var lane = Math.min(NL - 1, Math.floor((y - BAND) / LANE_H));
    if (lane !== S.bt.lane) { S.bt.lane = lane; S.bt.x = AT_TAP; S.bt.target = null; sfx("move"); }
    else if (x < AT_TAP - 18) S.bt.target = Math.max(LANE_START[lane] + 2, x - 6);
    else pour();
  });
  overlay.addEventListener("pointerdown", function (e) {
    if ((S.mode === "paused" || S.mode === "intro") && e.target.tagName !== "BUTTON" && e.target.tagName !== "A") act();
  });

  Array.prototype.forEach.call(document.querySelectorAll("#pad button"), function (b) {
    var k = b.getAttribute("data-k");
    b.addEventListener("pointerdown", function (e) {
      e.preventDefault(); audio();
      if (k === "up") move(-1);
      else if (k === "down") move(1);
      else if (k === "left") keys.left = true;
      else if (k === "right") keys.right = true;
      else act();
    });
    if (k === "left" || k === "right") ["pointerup", "pointercancel", "pointerleave"].forEach(function (ev) {
      b.addEventListener(ev, function () { keys[k] = false; });
    });
  });

  var muteBtn = $("mute"), musicBtn = $("music");
  function paintAudio() {
    muteBtn.textContent = muted ? "SOUND OFF" : "SOUND ON"; muteBtn.setAttribute("aria-pressed", muted ? "true" : "false");
    musicBtn.textContent = musicOn ? "MUSIC ON" : "MUSIC OFF"; musicBtn.setAttribute("aria-pressed", musicOn ? "false" : "true");
  }
  function toggleMute() { muted = !muted; try { localStorage.setItem("tavernMute", muted ? "1" : "0"); } catch (e) { /* storage blocked */ } paintAudio(); musicRefresh(); }
  function toggleMusic() { musicOn = !musicOn; try { localStorage.setItem("tavernMusic", musicOn ? "1" : "0"); } catch (e) { /* storage blocked */ } paintAudio(); musicRefresh(); }
  muteBtn.addEventListener("click", toggleMute);
  musicBtn.addEventListener("click", toggleMusic);
  paintAudio();

  document.addEventListener("visibilitychange", function () { if (document.hidden && S.mode === "play") togglePause(); });

  // Size the frame to the largest whole-number zoom that fits, so pixels stay square.
  var frame = $("frame");
  function fit() {
    var maxW = Math.min(document.documentElement.clientWidth - 40, 1280);
    var reserved = window.matchMedia("(pointer: coarse)").matches ? 300 : 250;
    var maxH = Math.max(200, window.innerHeight - reserved);
    var s = Math.floor(Math.min(maxW / W, maxH / H));
    var px = s >= 2 ? s * W : Math.min(maxW, W * 2);
    frame.style.width = px + 8 + "px";
    frame.style.setProperty("--bf", Math.max(6, Math.round(px / W * 3.4)) + "px");
  }
  window.addEventListener("resize", fit);
  fit();

  drawStatic();
  hud();
  titleScreen();

  var last = 0;
  function loop(ts) {
    var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0;
    last = ts;
    update(dt); render();
    requestAnimationFrame(loop);
  }
  render();
  requestAnimationFrame(loop);

  // handle for testing from the console
  window.__tavern = { state: S, step: function (dt) { update(dt); render(); }, start: startGame, music: M };
})();
