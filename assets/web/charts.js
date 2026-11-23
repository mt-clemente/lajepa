/* Interactive figures for the La-JEPA page. Data: assets/web/charts_data.js (generated from the paper's figure data). */
(function () {
  const C = { ours: "#2a78d6", GEN: "#eb6834", VLM: "#1baf7a" };            // validated categorical slots 1-3
  const GROUP_NAME = { ours: "La-JEPA (trained from scratch, ours)", GEN: "Generator-initialized", VLM: "VLM-initialized" };
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const txt = (s, attrs, parent) => { const e = el("text", attrs, parent); e.textContent = s; return e; };

  function tooltip(host) {
    const t = document.createElement("div"); t.className = "chart-tip"; t.hidden = true; host.appendChild(t);
    return {
      show(html, ev) { t.innerHTML = html; t.hidden = false; const b = host.getBoundingClientRect();
        let x = ev.clientX - b.left + 14, y = ev.clientY - b.top + 12; if (x > b.width - 230) x -= 250; t.style.left = x + "px"; t.style.top = y + "px"; },
      hide() { t.hidden = true; }
    };
  }

  /* ---------------- Fig. 1: success vs deployed parameters, one panel per tab ---------------- */
  const PANELS = {
    libero_ood: { title: "LIBERO-Plus, corrected instructions", y: [70, 90, 5], note: "" },
    robotwin_ood: { title: "RoboTwin 2.0, clean training (mean of clean and randomized scenes)", y: [30, 70, 10], note: "* JEPA-WAM estimated from its 20-task results." },
    robotwin_full: { title: "RoboTwin 2.0, full training (mean of clean and randomized scenes)", y: [88, 95, 1], note: "La-JEPA full-training values use one training seed." }
  };
  // label offsets (px) for points that would otherwise collide; default is to the right
  const OFF = {
    libero_ood: { ours_libero_s: [0, 16, "middle"], ours_libero_b: [-9, 0, "end"], ours_libero_l: [9, -2, "start"], nowwam: [9, -7, "start"], cosmos: [9, 6, "start"], fastwam: [-9, 0, "end"], fasterwam: [-9, 0, "end"] },
    robotwin_ood: { ours_robotwin_s: [0, 17, "middle"], ours_robotwin_b: [0, -11, "middle"], ours_robotwin_l: [10, 0, "start"], fastwam: [-9, 0, "end"], fasterwam: [-9, 0, "end"] },
    robotwin_full: { ours_full_xl: [0, -12, "middle"], imagewam: [0, -12, "middle"], fastwam: [0, -12, "middle"], fasterwam: [-9, 0, "end"], leapbot: [-9, 6, "end"], qwen: [9, 0, "start"], qwen_scratch: [9, 0, "start"] }
  };

  function drawFig1(host, panel) {
    host.querySelector("svg")?.remove();
    const P = PANELS[panel], pts = FIG1.filter(p => p.panel === panel);
    const W = 820, H = 430, L = 58, R = 24, T = 18, B = 52, xmax = 14;
    const [y0, y1, ys] = P.y;
    const X = v => L + v / xmax * (W - L - R), Y = v => T + (1 - (v - y0) / (y1 - y0)) * (H - T - B);
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, width: "100%", role: "img", "aria-label": P.title });
    for (let v = y0; v <= y1 + 1e-9; v += ys) { el("line", { x1: L, x2: W - R, y1: Y(v), y2: Y(v), class: "grid" }, svg); txt(String(v), { x: L - 10, y: Y(v) + 4, "text-anchor": "end", class: "tick" }, svg); }
    for (let v = 0; v <= xmax; v += 2) { txt(String(v), { x: X(v), y: H - B + 20, "text-anchor": "middle", class: "tick" }, svg); }
    txt("Deployed parameters (billions, including frozen encoders)", { x: (L + W - R) / 2, y: H - 10, "text-anchor": "middle", class: "axis" }, svg);
    txt("Success (%)", { x: 16, y: (T + H - B) / 2, "text-anchor": "middle", class: "axis", transform: `rotate(-90 16 ${(T + H - B) / 2})` }, svg);
    const ours = pts.filter(p => p.group === "ours").sort((a, b) => a.x - b.x);
    el("polyline", { points: ours.map(p => `${X(p.x)},${Y(p.y)}`).join(" "), class: "ours-line", stroke: C.ours }, svg);
    const tip = host._tip || (host._tip = tooltip(host));
    pts.forEach(p => {
      const g = el("g", { class: "pt", tabindex: 0 }, svg), cx = X(p.x), cy = Y(p.y);
      el("circle", { cx, cy, r: 16, class: "hit" }, g);
      el("circle", { cx, cy, r: p.group === "ours" ? 7 : 6, fill: C[p.group], class: "mark" + (p.group === "ours" ? " ours" : "") }, g);
      const o = (OFF[panel] || {})[p.method] || [10, 0, "start"];
      txt(p.short + (p.estimate ? "*" : "") + (p.embodied ? " †" : ""), { x: cx + o[0], y: cy + o[1] + 4, "text-anchor": o[2], class: "lab" + (p.group === "ours" ? " ours" : "") }, g);
      const html = `<strong>${p.label}${p.embodied ? " †" : ""}</strong><br>${p.y.toFixed(1)}% success · ${p.x.toFixed(2)}B deployed<br><span>${GROUP_NAME[p.group]}${p.embodied ? ", embodied pretraining" : ""}${p.estimate ? ", estimated" : ""}</span>`;
      g.addEventListener("mousemove", e => tip.show(html, e)); g.addEventListener("mouseleave", () => tip.hide());
      g.addEventListener("focus", () => { const r = g.getBoundingClientRect(); tip.show(html, { clientX: r.right, clientY: r.top }); }); g.addEventListener("blur", () => tip.hide());
    });
    host.insertBefore(svg, host.firstChild);
    document.getElementById("fig1-note").textContent = ["†: embodied pretraining.", P.note].filter(Boolean).join(" ");
    document.getElementById("fig1-tbody").innerHTML = pts.slice().sort((a, b) => b.y - a.y).map(p =>
      `<tr><td>${p.label}${p.embodied ? " †" : ""}${p.estimate ? " *" : ""}</td><td>${GROUP_NAME[p.group]}</td><td>${p.x.toFixed(2)}</td><td>${p.y.toFixed(1)}</td></tr>`).join("");
  }

  const fig1 = document.getElementById("fig1-chart");
  if (fig1) {
    const tabs = document.querySelectorAll("#fig1-tabs button");
    const select = id => { tabs.forEach(b => b.setAttribute("aria-selected", String(b.dataset.panel === id))); drawFig1(fig1, id); };
    tabs.forEach(b => b.addEventListener("click", () => select(b.dataset.panel)));
    document.querySelectorAll("[data-show-panel]").forEach(a => a.addEventListener("click", () => select(a.dataset.showPanel)));
    select(new URLSearchParams(location.search).get("panel") || "robotwin_full");
  }

  /* ---------------- Ablation: loss when each component is removed ---------------- */
  const abl = document.getElementById("abl-chart");
  if (abl) {
    const BENCH = [["LIBERO", "#1baf7a", false], ["LIBERO-Plus", "#1baf7a", true], ["RoboTwin clean", "#eb6834", false], ["RoboTwin randomized", "#eb6834", true]];
    const W = 820, H = 380, L = 52, R = 16, T = 16, B = 64, ymax = 30;
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, width: "100%", role: "img", "aria-label": "Loss in success when each component is removed" });
    const defs = el("defs", {}, svg);
    BENCH.forEach(([n, c, hatch], i) => { if (!hatch) return; const pat = el("pattern", { id: "hatch" + i, width: 6, height: 6, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, defs);
      el("rect", { width: 6, height: 6, fill: "#fff" }, pat); el("line", { x1: 0, y1: 0, x2: 0, y2: 6, stroke: c, "stroke-width": 3 }, pat); });
    const Y = v => T + (1 - v / ymax) * (H - T - B);
    for (let v = 0; v <= ymax; v += 10) { el("line", { x1: L, x2: W - R, y1: Y(v), y2: Y(v), class: "grid" }, svg); txt(String(v), { x: L - 10, y: Y(v) + 4, "text-anchor": "end", class: "tick" }, svg); }
    txt("Loss in success (points)", { x: 14, y: (T + H - B) / 2, "text-anchor": "middle", class: "axis", transform: `rotate(-90 14 ${(T + H - B) / 2})` }, svg);
    const gw = (W - L - R) / ABL.length, bw = Math.min(30, (gw - 40) / 4);
    const tip = tooltip(abl);
    ABL.forEach(([name, how, vals], gi) => {
      const gx = L + gi * gw + (gw - 4 * bw - 3 * 4) / 2;
      txt(name, { x: L + gi * gw + gw / 2, y: H - B + 22, "text-anchor": "middle", class: "glab" }, svg);
      txt(how, { x: L + gi * gw + gw / 2, y: H - B + 40, "text-anchor": "middle", class: "gsub" }, svg);
      vals.forEach(([v, lo, hi], bi) => {
        const [bn, c, hatch] = BENCH[bi], x = gx + bi * (bw + 4), g = el("g", { class: "bar", tabindex: 0 }, svg);
        el("rect", { x: x - 2, y: T, width: bw + 4, height: H - T - B, class: "hit" }, g);
        el("rect", { x, y: Y(v), width: bw, height: Y(0) - Y(v), rx: 3, fill: hatch ? `url(#hatch${bi})` : c, stroke: c, "stroke-width": 1.5 }, g);
        if (lo !== null) { el("line", { x1: x + bw / 2, x2: x + bw / 2, y1: Y(hi), y2: Y(lo), class: "err" }, g);
          [lo, hi].forEach(e => el("line", { x1: x + bw / 2 - 4, x2: x + bw / 2 + 4, y1: Y(e), y2: Y(e), class: "err" }, g)); }
        const html = `<strong>${name}</strong> (${how})<br>${bn}: −${v.toFixed(1)} points${lo !== null ? ` [95% interval −${hi.toFixed(1)}, −${lo.toFixed(1)}]` : ""}<br><span>Reference S recipe: ${ABL_REF[bi].toFixed(1)}%</span>`;
        g.addEventListener("mousemove", e => tip.show(html, e)); g.addEventListener("mouseleave", () => tip.hide());
      });
    });
    el("line", { x1: L, x2: W - R, y1: Y(0), y2: Y(0), class: "base" }, svg);
    abl.insertBefore(svg, abl.firstChild);
    document.getElementById("abl-tbody").innerHTML = ABL.map(([n, how, vals]) => `<tr><td>${n} <span class="muted">(${how})</span></td>` +
      vals.map(([v, lo, hi]) => `<td>−${v.toFixed(1)}${lo !== null ? ` <span class="muted">[−${hi.toFixed(1)}, −${lo.toFixed(1)}]</span>` : ""}</td>`).join("") + "</tr>").join("");
  }
})();
