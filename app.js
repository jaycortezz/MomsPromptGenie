/* Prompt Genie — page logic. Options live in config.js. */
(() => {
  const C = window.GENIE_CONFIG;
  const KEY = "prompt-genie-v2";
  const STEPS = ["Theme", "Layout", "Look", "Plan", "Build"];
  const CHATGPT = "https://chatgpt.com/";

  const DEFAULTS = {
    step: 1, maxStep: 1,
    theme: "", occasion: "",
    format: "invitation", composition: "genie",
    style: "", finish: "polished", moods: [], palette: "genie", customPalette: "",
    kit: "starter", size: "5x7", incl: {}, mustHaves: "",
    textMode: "blank", wording: "",
    chatLink: "", done: {}, picked: {}
  };

  // ---------- state & storage ----------
  let S = load();
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return Object.assign({}, DEFAULTS, JSON.parse(raw));
    } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULTS));
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  // ---------- helpers ----------
  const $ = (sel) => document.querySelector(sel);
  const byId = (list, id) => list.find((x) => x.id === id) || list[0];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = () => byId(C.formats, S.format);
  const comp = () => byId(C.compositions, S.composition);
  const style = () => C.styles.find((s) => s.id === S.style);
  const finish = () => byId(C.finishes, S.finish);
  const palette = () => byId(C.palettes, S.palette);
  const kit = () => byId(C.kits, S.kit);
  const lineArt = () => !!fmt().lineArt;

  function plural(name) {
    for (const sep of [" (", " in "]) {
      const i = name.indexOf(sep);
      if (i > 0) return name.slice(0, i) + "s" + name.slice(i);
    }
    return name + "s";
  }
  const pieceLabel = ([name, n]) => (n === 1 ? name : `${n} ${plural(name)}`);

  function piecesOf(item) {
    const out = [];
    item.pieces.forEach((p) => (p === "@framing" ? comp().framing.forEach((f) => out.push(f)) : out.push(p)));
    return out;
  }
  function itemCounts(item) {
    if (item.kind === "sheet") return { pieces: piecesOf(item).reduce((a, p) => a + p[1], 0), images: 1 };
    return { pieces: item.variants.length, images: item.variants.length };
  }
  const inclKey = (k, item) => `${k.id}.${item.id}`;
  function included(k, item) {
    const v = S.incl[inclKey(k, item)];
    return v === undefined ? !item.optional : v;
  }
  function kitCounts(k, onlyIncluded) {
    if (k.finished) return { pieces: 1, images: 1 };
    return k.items.reduce((a, it) => {
      if (onlyIncluded && !included(k, it)) return a;
      const c = itemCounts(it);
      return { pieces: a.pieces + c.pieces, images: a.images + c.images };
    }, { pieces: 0, images: 0 });
  }
  function sizeText() {
    const p = byId(C.pageSizes, S.size);
    if (p.fixed) return p.fixed;
    if (p.square) return `square, ${p.label.replace(/^Square /, "")}`;
    return `${p.label}, ${fmt().landscape ? "landscape" : "portrait"}`;
  }
  function paletteWords() {
    const p = palette();
    if (p.id === "custom") return S.customPalette.trim() || "a harmonious palette that suits the theme";
    return p.words;
  }
  function lookLabel() {
    const s = style();
    if (!s) return "Not chosen yet";
    return lineArt() ? `${s.label} coloring line art` : `${finish().word} ${s.label.toLowerCase()}`;
  }

  // ---------- prompt building ----------
  function lookBlock() {
    const s = style();
    const lines = [];
    if (lineArt()) {
      lines.push(`Style: black-and-white coloring book line art only, with ${s.lineArt}. Clean, bold, fully closed outlines on a pure white background. No color, no shading, no grey tones, no gradients. Leave spaces large enough to color in comfortably.`);
    } else {
      lines.push(`Style: ${s.prompt}; ${finish().prompt}.`);
    }
    if (S.moods.length) lines.push(`Mood: ${S.moods.join(", ").toLowerCase()}.`);
    if (!lineArt()) lines.push(`Color palette: ${paletteWords()}.`);
    return lines.join("\n");
  }
  function themePhrase() {
    return `"${S.theme.trim()}"` + (S.occasion.trim() ? ` (for a ${S.occasion.trim()})` : "");
  }
  function mustLine() {
    return S.mustHaves.trim() ? `Where it fits, be sure to include: ${S.mustHaves.trim()}.` : "";
  }
  const QUALITY = "High resolution, crisp clean edges, no watermarks, no signatures.";
  const join = (parts) => parts.filter(Boolean).join("\n\n");

  function consistencyLine(isFirst) {
    return isFirst
      ? "I'm making a matching clipart kit, one image at a time in this chat. Every image must share exactly the same art style, colors, line quality and character designs, so please keep them consistent from here on."
      : "Next image for the same kit. Match the earlier images in this chat exactly: same art style, colors, line quality and character designs.";
  }

  function sheetPrompt(item, n, total, isFirst) {
    const list = piecesOf(item).map((p) => `- ${pieceLabel(p)}`).join("\n");
    const count = itemCounts(item).pieces;
    return join([
      "Please create an image.",
      consistencyLine(isFirst),
      `Image ${n} of ${total}: a clipart sheet called "${item.title}" for a ${themePhrase()} kit.\nDraw these ${count} separate pieces:\n${list}`,
      "Arrange them in a tidy grid on a plain white background, as a landscape 3:2 image. Each piece must be complete and clearly separated with space around it so it can be cut out: no overlapping, nothing cropped, no labels and no text.",
      lookBlock(),
      mustLine(),
      `The pieces will be used to build ${fmt().shape} (${sizeText()}) with ${comp().describe}.`,
      QUALITY
    ]);
  }

  function singlePrompt(item, variant, n, total, isFirst) {
    const t = themePhrase();
    let what;
    switch (item.kind) {
      case "paper":
        what = `Image ${n} of ${total}: a background paper for the ${t} kit: ${variant}, using motifs and colors from the kit. Fill the entire image edge to edge as a flat, seamless pattern. No characters, no single focal object, no border, no text. Size: ${sizeText()}.`;
        break;
      case "frame":
        what = `Image ${n} of ${total}: a decorative frame for the ${t} kit: ${variant} built from the kit's motifs, laid out as ${comp().describe}. Leave the centre completely empty and plain white so wording or a photo can go there. No text. Size: ${sizeText()}.`;
        break;
      case "scene":
        what = `Image ${n} of ${total}: a background scene for the ${t} kit: ${variant}. Leave it free of characters so pieces can be placed on top, with open space in the middle. No text. Size: ${sizeText()}.`;
        break;
      default:
        what = `Image ${n} of ${total}: ${variant} for the ${t} kit, decorated with the kit's motifs and isolated on a plain white background. Leave it blank (no letters or words) so a title can be added later. Landscape 3:2.`;
    }
    return join(["Please create an image.", consistencyLine(isFirst), what, lookBlock(), QUALITY]);
  }

  function finishedPrompt() {
    let words = "";
    if (S.textMode === "include" && S.wording.trim()) {
      words = `Include this wording exactly as written, spelled correctly, in elegant, highly legible lettering that suits the style:\n"${S.wording.trim()}"`;
    } else if (S.textMode === "none") {
      words = "Do not include any text, letters or numbers anywhere in the image.";
    } else {
      words = "Do not include any text, letters or numbers. Leave a clean, open area where wording can be added later.";
    }
    return join([
      "Please create an image.",
      `A complete, ready-to-use ${fmt().shape} (${sizeText()}) with a ${themePhrase()} theme.`,
      `Layout: ${comp().describe}. Use a balanced, professional composition with a clear focal point, and keep important details away from the edges so nothing is cut off when printed.`,
      lookBlock(),
      mustLine(),
      words,
      QUALITY
    ]);
  }

  function piecePrompt(sheet, name) {
    return join([
      "Please create an image.",
      `Make the ${name.replace(/^(.*) #(\d+)$/, (m, n, d) => `${n} that appears number ${d} on the sheet (counting left to right, top to bottom)`)} from the "${sheet.title}" sheet above as its own full-size image. Show only that single piece, centered and large, on a plain white background (transparent if you can).`,
      "Keep its design, colors and style exactly as they are on the sheet. No other pieces, no text. Square 1:1.",
      QUALITY
    ]);
  }

  // All the prompts for the Build step, in order
  function buildList() {
    const k = kit();
    if (k.finished) return [{ key: "finished", title: "Finished design", sub: `${fmt().label} · ${sizeText()}`, prompt: finishedPrompt() }];
    const jobs = [];
    k.items.filter((it) => included(k, it)).forEach((it) => {
      if (it.kind === "sheet") jobs.push({ item: it });
      else it.variants.forEach((v, i) => jobs.push({ item: it, variant: v, i }));
    });
    return jobs.map((j, idx) => {
      const n = idx + 1, first = idx === 0, it = j.item;
      if (it.kind === "sheet") {
        const c = itemCounts(it).pieces;
        return { key: `${k.id}.${it.id}`, title: it.title, sub: `Sheet of ${c}: ${piecesOf(it).map(pieceLabel).join(", ")}`,
                 prompt: sheetPrompt(it, n, jobs.length, first) };
      }
      const multi = it.variants.length > 1 ? ` ${j.i + 1} of ${it.variants.length}` : "";
      return { key: `${k.id}.${it.id}.${j.i}`, title: it.title + multi, sub: j.variant.replace(/^an? /, ""),
               prompt: singlePrompt(it, j.variant, n, jobs.length, first) };
    });
  }

  // ---------- rendering ----------
  function render() {
    renderStepper();
    renderMain();
    renderSidebar();
    save();
  }

  function renderStepper() {
    $("#stepper").innerHTML = STEPS.map((name, i) => {
      const n = i + 1;
      const cls = n === S.step ? "current" : n <= S.maxStep ? "reachable" : "";
      return `<li><button type="button" class="${cls}" data-act="goto" data-n="${n}" ${n > S.maxStep ? "disabled" : ""}
        ${n === S.step ? 'aria-current="step"' : ""}><span class="dot">${n < S.step || (n <= S.maxStep && n !== S.step) ? "✓" : n}</span>${name}</button></li>`;
    }).join("");
  }

  const card = (act, id, selected, inner, extraCls = "") =>
    `<button type="button" class="choice ${extraCls}" data-act="${act}" data-id="${esc(id)}" aria-pressed="${selected}">${inner}</button>`;
  const chip = (act, id, selected, label) =>
    `<button type="button" class="chip" data-act="${act}" data-id="${esc(id)}" aria-pressed="${selected}">${esc(label)}</button>`;

  function renderMain() {
    const views = [null, viewTheme, viewLayout, viewLook, viewPlan, viewBuild];
    const nextLabel = ["", "Next: layout →", "Next: look →", "Next: plan my kit →", "Looks good: build my kit →", ""][S.step];
    $("#main").innerHTML = views[S.step]() + `
      <p class="error" id="error" role="alert"></p>
      <div class="nav">
        ${S.step > 1 ? '<button type="button" class="link" data-act="back">← Back</button>' : "<span></span>"}
        ${S.step < 5 ? `<button type="button" class="btn" data-act="next">${nextLabel}</button>`
                     : '<button type="button" class="link" data-act="reset">Start a new kit</button>'}
      </div>`;
  }

  function viewTheme() {
    const ideas = ["Spa day", "Lemons and bees", "Under the sea", "Woodland friends", "Christmas cardinals", "Garden tea party"];
    return `
      <h1>What's the theme?</h1>
      <p class="lead">Describe it in a few words. You can be as simple or as specific as you like.</p>
      <label class="field" for="f-theme">Theme</label>
      <input type="text" id="f-theme" data-field="theme" value="${esc(S.theme)}" placeholder="e.g. Spa day, Woodland friends">
      <div class="ideas"><span>Ideas:</span>${ideas.map((t) => `<button type="button" class="chip small" data-act="idea" data-id="${esc(t)}">${esc(t)}</button>`).join("")}</div>
      <label class="field" for="f-occ">What's it for? <small>(optional)</small></label>
      <input type="text" id="f-occ" data-field="occasion" value="${esc(S.occasion)}" placeholder="e.g. teen birthday, baby shower, wedding, classroom">`;
  }

  function viewLayout() {
    return `
      <h1>Choose a layout</h1>
      <p class="lead">What are we making, and how should it be arranged?</p>
      <h3 class="label">Format</h3>
      <div class="grid">${C.formats.map((f) => card("format", f.id, f.id === S.format,
        `<span class="em">${f.emoji}</span><span>${esc(f.label)}</span>`)).join("")}</div>
      ${lineArt() ? '<p class="note">Coloring book pages are always made as black-and-white line art.</p>' : ""}
      <h3 class="label">Arrangement</h3>
      <div class="grid wide">${C.compositions.map((c) => card("composition", c.id, c.id === S.composition,
        `<strong>${esc(c.label)}</strong><small>${esc(c.hint)}</small>`, "text")).join("")}</div>`;
  }

  function viewLook() {
    const moodsFull = S.moods.length >= C.maxMoods;
    return `
      <h1>Choose the look</h1>
      <p class="lead">Pick an art style, then fine-tune the finish, mood and colors.</p>
      <h3 class="label">Art style</h3>
      <div class="grid">${C.styles.map((s) => card("style", s.id, s.id === S.style,
        `<span class="em">${s.emoji}</span><span>${esc(s.label)}</span>`)).join("")}</div>
      ${lineArt() ? "" : `<h3 class="label">Finish</h3>
      <div class="chips">${C.finishes.map((f) => chip("finish", f.id, f.id === S.finish, f.label)).join("")}</div>`}
      <h3 class="label">Mood <small>· pick up to ${C.maxMoods}</small></h3>
      <div class="chips">${C.moods.map((m) => {
        const on = S.moods.includes(m);
        return `<button type="button" class="chip" data-act="mood" data-id="${esc(m)}" aria-pressed="${on}" ${!on && moodsFull ? "disabled" : ""}>${esc(m)}</button>`;
      }).join("")}</div>
      ${lineArt() ? "" : `<h3 class="label">Color palette</h3>
      <div class="grid wide">${C.palettes.map((p) => card("palette", p.id, p.id === S.palette,
        `<strong>${esc(p.label)}</strong>${swatches(p)}`, "text")).join("")}</div>
      ${S.palette === "custom" ? `<label class="field" for="f-pal">Your colors</label>
        <input type="text" id="f-pal" data-field="customPalette" value="${esc(S.customPalette)}" placeholder="e.g. lavender, mint and silver">` : ""}`}`;
  }

  function swatches(p) {
    if (p.id === "genie") return '<span class="swatches"><span class="sw genie">✨</span></span>';
    if (p.id === "custom") return '<span class="swatches"><span class="sw genie">✏️</span></span>';
    return `<span class="swatches">${p.colors.map((c) => `<span class="sw" style="background:${c}"></span>`).join("")}</span>`;
  }

  function viewPlan() {
    const k = kit();
    const sizes = C.pageSizes.map((p) => chip("size", p.id, p.id === S.size, p.label)).join("");
    const kits = C.kits.map((kk) => {
      const c = kitCounts(kk, false);
      return card("kit", kk.id, kk.id === S.kit, `
        <span class="kit-head"><strong>${esc(kk.label)}</strong>${kk.tag ? `<span class="tag">${esc(kk.tag)}</span>` : ""}</span>
        <span class="counts">${kk.finished ? "1 image" : `${c.pieces} pieces · ${c.images} images`}</span>
        <small>${esc(kk.blurb)}</small>`, "text kit");
    }).join("");

    let contents;
    if (k.finished) {
      const tm = (v, label, hint) => `<label class="radio"><input type="radio" name="textMode" data-field="textMode" value="${v}" ${S.textMode === v ? "checked" : ""}>
        <span>${label}<small>${hint}</small></span></label>`;
      contents = `
        <h3 class="label">Words on the design</h3>
        <div class="radios">
          ${tm("blank", "Leave a blank space for words", "Recommended: add your text afterwards in Canva so it's spelled perfectly.")}
          ${tm("include", "Put my words on it", "AI sometimes misspells words, so double-check the result.")}
          ${tm("none", "No words at all", "")}
        </div>
        ${S.textMode === "include" ? `<label class="field" for="f-words">Your wording</label>
          <textarea id="f-words" data-field="wording" placeholder="You're invited!&#10;Emma's 13th Birthday Spa Day&#10;Saturday, June 8 at 2 PM">${esc(S.wording)}</textarea>` : ""}`;
    } else {
      contents = `
        <h3 class="label">Your ${esc(k.label.toLowerCase())} kit <small>· ${esc(comp().label)} arrangement</small></h3>
        <div class="items">${k.items.map((it) => {
          const c = itemCounts(it);
          const on = included(k, it);
          const desc = it.kind === "sheet"
            ? `One sheet of ${c.pieces}: ${piecesOf(it).map(pieceLabel).join(", ")}`
            : `${c.images} separate image${c.images > 1 ? "s" : ""}: ${it.variants.map((v) => v.replace(/^an? /, "")).join(", ")}`;
          return `<label class="item ${on ? "" : "off"}">
            <span class="badge">${it.kind === "sheet" ? c.pieces : "✦"}</span>
            <span class="item-body"><strong>${esc(it.title)}</strong>${it.optional ? ' <span class="opt">optional</span>' : ""}<small>${esc(desc)}</small></span>
            <span class="incl"><input type="checkbox" data-act="incl" data-id="${esc(it.id)}" ${on ? "checked" : ""}> Include</span>
          </label>`;
        }).join("")}</div>`;
    }

    return `
      <h1>Plan my kit</h1>
      <p class="lead">${k.finished ? "You'll get one prompt for a complete design."
        : "Your kit is made as sheets of pieces first, so you can see everything in ChatGPT. Afterwards you choose which pieces to make as separate full-size images."}</p>
      <h3 class="label">Kit size</h3>
      <div class="grid kits">${kits}</div>
      <h3 class="label">Page size</h3>
      <div class="chips">${sizes}</div>
      ${contents}
      <label class="field" for="f-must">Must-haves <small>(optional)</small></label>
      <textarea id="f-must" data-field="mustHaves" placeholder="e.g. a fox with a lantern, a little bridge">${esc(S.mustHaves)}</textarea>`;
  }

  function viewBuild() {
    const list = buildList();
    const k = kit();
    const cards = list.map((p, i) => `
      <article class="pcard ${S.done[p.key] ? "is-done" : ""}">
        <header>
          <span class="badge">${i + 1}</span>
          <span class="item-body"><strong>${esc(p.title)}</strong><small>${esc(p.sub)}</small></span>
          <label class="incl"><input type="checkbox" data-act="done" data-id="${esc(p.key)}" ${S.done[p.key] ? "checked" : ""}> Done</label>
        </header>
        <details ${i === 0 && !S.done[p.key] ? "open" : ""}><summary>See prompt</summary><pre>${esc(p.prompt)}</pre></details>
        <div class="actions">
          ${i === 0 ? `<a class="btn" href="${CHATGPT}?q=${encodeURIComponent(p.prompt)}" target="_blank" rel="noopener" data-act="copy" data-i="${i}">Start in ChatGPT ↗</a>` : ""}
          <button type="button" class="btn ${i === 0 ? "secondary" : ""}" data-act="copy" data-i="${i}">📋 Copy prompt</button>
        </div>
      </article>`).join("");

    let pieces = "";
    if (!k.finished) {
      const sheets = k.items.filter((it) => it.kind === "sheet" && included(k, it));
      const picks = [];
      const groups = sheets.map((sh) => {
        const names = [];
        piecesOf(sh).forEach(([name, n]) => {
          for (let j = 1; j <= n; j++) names.push(n > 1 ? `${name} #${j}` : name);
        });
        return `<div class="pgroup"><strong>${esc(sh.title)}</strong><div class="chips">${names.map((nm) => {
          const key = `${k.id}.${sh.id}.${nm}`;
          const on = !!S.picked[key];
          if (on) picks.push({ key, sheet: sh, name: nm });
          return `<button type="button" class="chip small" data-act="pick" data-id="${esc(key)}" aria-pressed="${on}">${esc(nm)}</button>`;
        }).join("")}</div></div>`;
      }).join("");
      window.__picks = picks;
      pieces = `
        <h2 class="section">Make full-size pieces</h2>
        <p class="lead">Once your sheets look right, tap the pieces you'd like as separate, full-size images. Paste each prompt into the same chat.</p>
        ${groups}
        ${picks.length ? `<div class="pieces">${picks.map((p, i) => `
          <article class="pcard small">
            <header><span class="badge">✦</span><span class="item-body"><strong>${esc(p.name)}</strong><small>from ${esc(p.sheet.title)}</small></span>
            <button type="button" class="btn secondary" data-act="copy-piece" data-i="${i}">📋 Copy</button></header>
          </article>`).join("")}</div>` : '<p class="note">No pieces picked yet.</p>'}`;
    }
    window.__list = list;

    return `
      <h1>Build my kit</h1>
      <ol class="howto">
        <li>Press <strong>Start in ChatGPT</strong> on prompt 1. It opens a new chat with the prompt filled in (it's also copied, in case you need to paste it).</li>
        ${list.length > 1 ? `<li>Save that chat's link under <strong>Save my chat link</strong>, so you can always get back to it.</li>
        <li>Copy each next prompt and paste it into the <strong>same chat</strong>, so everything matches. Tick <strong>Done</strong> as you go.</li>` :
        "<li>Don't love it? Reply in the chat with a tweak, like “softer colors” or “add more flowers”.</li>"}
      </ol>
      <div class="pcards">${cards}</div>
      ${pieces}`;
  }

  function renderSidebar() {
    const k = kit();
    const p = palette();
    const c = kitCounts(k, true);
    $("#summary").innerHTML = `
      <div class="sum-head"><h2>My kit</h2><span class="tag">Saved in this browser</span></div>
      <dl>
        <dt>Theme</dt><dd><strong>${esc(S.theme.trim() || "Not chosen yet")}</strong>${S.occasion.trim() ? `<small>${esc(S.occasion)}</small>` : ""}</dd>
        <dt>Layout</dt><dd><strong>${esc(fmt().label)} · ${esc(comp().label)}</strong><small>${esc(comp().hint)}</small></dd>
        <dt>Look</dt><dd><strong>${esc(lookLabel())}</strong>${S.moods.length ? `<small>${esc(S.moods.join(" · "))}</small>` : ""}</dd>
        ${lineArt() ? "" : `<dt>Palette · ${esc(p.label)}</dt><dd>${p.colors.length ? `<span class="swatches big">${p.colors.map((x) => `<span class="sw" style="background:${x}"></span>`).join("")}</span>`
          : `<small>${esc(paletteWords())}</small>`}</dd>`}
        <dt>Pieces</dt><dd><strong>${S.maxStep >= 4 ? (k.finished ? "1 finished design" : `${c.pieces} pieces · ${c.images} images`) : "Planned in step 4"}</strong>
          ${S.maxStep >= 4 ? `<small>${esc(byId(C.pageSizes, S.size).label)}</small>` : ""}</dd>
      </dl>`;
    $("#openChat").href = S.chatLink.trim() || CHATGPT;
    $("#openChat").textContent = S.chatLink.trim() ? "Open my kit chat ↗" : "Open ChatGPT ↗";
    if (document.activeElement !== $("#chatLink")) $("#chatLink").value = S.chatLink;
  }

  // ---------- actions ----------
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => t.classList.remove("show"), 1800);
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); }
    catch (e) {
      const ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (e2) {}
      ta.remove();
    }
    toast("Copied! Now paste it into ChatGPT.");
  }

  function validate() {
    if (S.step === 1 && !S.theme.trim()) return "Please type a theme first.";
    if (S.step === 3 && !S.style) return "Please pick an art style.";
    return "";
  }
  function go(n) {
    S.step = n;
    S.maxStep = Math.max(S.maxStep, n);
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-act]");
    if (!el) return;
    const act = el.dataset.act, id = el.dataset.id;
    switch (act) {
      case "next": {
        const err = validate();
        if (err) { $("#error").textContent = err; return; }
        return go(S.step + 1);
      }
      case "back": return go(S.step - 1);
      case "goto": return go(+el.dataset.n);
      case "reset":
        if (!el.dataset.armed) {
          el.dataset.armed = "1";
          el.textContent = "Tap again to clear everything";
          setTimeout(() => { if (el.isConnected) { delete el.dataset.armed; el.textContent = "Start a new kit"; } }, 4000);
          return;
        }
        S = JSON.parse(JSON.stringify(DEFAULTS));
        return render();
      case "idea": S.theme = id; break;
      case "format": S.format = id; S.size = fmt().size; break;
      case "composition": S.composition = id; break;
      case "style": S.style = id; break;
      case "finish": S.finish = id; break;
      case "mood":
        S.moods = S.moods.includes(id) ? S.moods.filter((m) => m !== id)
          : S.moods.length < C.maxMoods ? [...S.moods, id] : S.moods;
        break;
      case "palette": S.palette = id; break;
      case "kit": S.kit = id; break;
      case "size": S.size = id; break;
      case "incl": S.incl[`${S.kit}.${id}`] = el.checked; break;
      case "done": S.done[id] = el.checked; break;
      case "pick": S.picked[id] = !S.picked[id]; break;
      case "copy": copy(window.__list[+el.dataset.i].prompt); return; // link still opens
      case "copy-piece": { const p = window.__picks[+el.dataset.i]; copy(piecePrompt(p.sheet, p.name)); return; }
      default: return;
    }
    render();
  });

  document.addEventListener("input", (e) => {
    const f = e.target.dataset.field;
    if (!f) return;
    S[f] = e.target.value;
    renderSidebar();
    save();
    if (f === "textMode") render();
  });

  render();
})();
