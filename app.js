/* Prompt Genie — page logic. Options live in config.js. */
(() => {
  const C = window.GENIE_CONFIG;
  const KEY = "prompt-genie-v2";
  const STEPS = ["Theme", "Format", "Look", "Plan", "Build"];
  const CHATGPT = "https://chatgpt.com/";

  const DEFAULTS = {
    step: 1, maxStep: 1,
    theme: "", occasion: "",
    format: "invitation", composition: "genie",
    style: "", finish: "polished", moods: [], palette: "genie", customPalette: "",
    kit: "starter", size: "5x7", incl: {}, mustHaves: "",
    textMode: "blank", wording: "",
    output: "elements", elemCount: 12, bg: "white",
    mix: C.elementMix.filter((m) => m.on).map((m) => m.id), peopleDesc: "",
    bookTitle: "", mainChar: "", otherChars: "", story: "",
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
  const isBook = () => !!fmt().book;
  const compsFor = () => C.compositions.filter((c) => !!c.bookOnly === isBook());
  const sizesFor = () => C.pageSizes.filter((p) => !!p.bookOnly === isBook());
  const kitsFor = () => (isBook() ? C.bookKits : C.kits);
  const comp = () => byId(compsFor(), S.composition);
  const style = () => C.styles.find((s) => s.id === S.style);
  const finish = () => byId(C.finishes, S.finish);
  const palette = () => byId(C.palettes, S.palette);
  // What's being made: a full page, one elements sheet, or a bigger kit
  function kit() {
    if (S.output === "full") return kitsFor().find((k) => k.finished);
    if (S.output === "elements") return elementsKit();
    return byId(kitsFor().filter((k) => !k.finished), S.kit);
  }
  function elementsKit() {
    const n = +S.elemCount || 12;
    return { id: "elements", label: "Design elements",
             items: [{ id: "elements", kind: "sheet", elements: true, title: "Design elements", pieces: [["element", n]] }] };
  }
  const transparentBg = () => S.output === "elements" && S.bg === "transparent";
  const lineArt = () => !!fmt().lineArt;

  function plural(name) {
    let at = -1;
    for (const sep of [" (", " in ", ", "]) {
      const i = name.indexOf(sep);
      if (i > 0 && (at < 0 || i < at)) at = i;
    }
    return at > 0 ? name.slice(0, at) + "s" + name.slice(at) : name + "s";
  }
  const pieceLabel = ([name, n]) => (n === 1 ? name : `${n} ${plural(name)}`);

  function piecesOf(item) {
    const out = [];
    item.pieces.forEach((p) => (p === "@framing" ? (comp().framing || []).forEach((f) => out.push(f)) : out.push(p)));
    return out;
  }
  // One line of the story = one page. Strips "Page 3:", "3." or "-" from the start of a line.
  function storyLines() {
    return S.story.split("\n")
      .map((l) => l.replace(/^\s*(page\s*\d+\s*[:.)\-–]?|\d+\s*[:.)\-–]|[-•*])\s*/i, "").trim())
      .filter(Boolean);
  }
  const variantsOf = (item) => (item.kind === "pages" ? storyLines() : item.variants);
  function itemCounts(item) {
    if (item.kind === "sheet") return { pieces: piecesOf(item).reduce((a, p) => a + p[1], 0), images: 1 };
    const n = variantsOf(item).length;
    return { pieces: n, images: n };
  }
  function hasPages(k) { return !k.finished && k.items.some((it) => it.kind === "pages" && included(k, it)); }
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
  function sizeText(singlePage) {
    const p = byId(C.pageSizes, S.size);
    if (!singlePage && comp().spread) return `a double-page spread: two ${p.label.replace(/ \(.*\)$/, "")} pages side by side, so twice as wide as one page`;
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
    if (isBook()) lines.push("Full-color illustration throughout.");
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
  // Children's books: the same character description goes into every prompt
  function castBlock() {
    if (!isBook()) return "";
    const main = S.mainChar.trim() || "design an appealing, memorable main character that suits the story";
    return `Characters (draw them exactly like this every time):\n- Main character: ${main}` +
      (S.otherChars.trim() ? `\n- Other characters: ${S.otherChars.trim()}` : "");
  }
  const bookName = () => (S.bookTitle.trim() ? `the children's picture book "${S.bookTitle.trim()}"` : "a children's picture book");
  const kitWord = () => (isBook() ? "book" : "kit");
  const QUALITY = "High resolution, crisp clean edges, no watermarks, no signatures.";
  const join = (parts) => parts.filter(Boolean).join("\n\n");

  function consistencyLine(isFirst) {
    if (isBook()) return isFirst
      ? `I'm illustrating ${bookName()}, one image at a time in this chat. Every image must share exactly the same full-color art style, palette and character designs, and each character must look identical every time they appear.`
      : "Next image for the same picture book. Match the earlier images in this chat exactly: same art style and colors, with every character drawn exactly as in the character sheets above.";
    return isFirst
      ? "I'm making a matching clipart kit, one image at a time in this chat. Every image must share exactly the same art style, colors, line quality and character designs, so please keep them consistent from here on."
      : "Next image for the same kit. Match the earlier images in this chat exactly: same art style, colors, line quality and character designs.";
  }

  function sheetPrompt(item, n, total, isFirst) {
    const list = piecesOf(item).map((p) => `- ${pieceLabel(p)}`).join("\n");
    const count = itemCounts(item).pieces;
    if (item.elements) return elementsPrompt(count);
    if (item.ref) {
      return join([
        "Please create an image.",
        consistencyLine(isFirst),
        `Image ${n} of ${total}: a character reference sheet called "${item.title}" for ${bookName()} about ${themePhrase()}.\nDraw these ${count} separate figures:\n${list}`,
        "Draw every figure at the same scale, side by side in a tidy grid on a plain white background, as a landscape 3:2 image. Each figure must be complete and clearly separated: no overlapping, nothing cropped, no labels and no text.",
        castBlock(),
        lookBlock(),
        "These are the reference drawings for the whole book, so keep the designs clear and simple enough to repeat exactly on every page.",
        QUALITY
      ]);
    }
    return join([
      "Please create an image.",
      total > 1 ? consistencyLine(isFirst) : "",
      `${total > 1 ? `Image ${n} of ${total}: a` : "A"} clipart sheet called "${item.title}" for a ${themePhrase()} kit.\nDraw these ${count} separate pieces:\n${list}`,
      item.id === "elements" ? `Choose the elements yourself so they clearly say "${S.theme.trim()}" at a glance: a varied mix of the most recognisable objects, motifs and details for this theme, with no two the same.` : "",
      `Arrange them in a tidy grid ${transparentBg() ? "on a transparent background (a PNG with no background at all)" : "on a plain white background"}, as a landscape 3:2 image. Each piece must be complete and clearly separated with space around it so it can be cut out: no overlapping, nothing cropped, no labels and no text.`,
      castBlock(),
      lookBlock(),
      mustLine(),
      isBook() ? `The pieces will be used in the illustrations for ${bookName()}.`
               : `The pieces will be used to build ${fmt().shape} (${sizeText()}) with ${comp().describe}.`,
      QUALITY
    ]);
  }

  // The main "Design elements" sheet
  function elementsPrompt(count) {
    const mix = C.elementMix.filter((m) => S.mix.includes(m.id));
    const people = S.mix.includes("people") && S.peopleDesc.trim() ? `People or characters to include: ${S.peopleDesc.trim()}.` : "";
    const color = lineArt() ? "black-and-white line art" : "full-color";
    return join([
      "Please create an image.",
      `A clipart sheet of ${count} separate, ${color} design elements for a ${themePhrase()} theme.`,
      `Include a varied mix of:\n${mix.map((m) => `- ${m.prompt}`).join("\n")}`,
      `Choose the specific elements yourself so they clearly say "${S.theme.trim()}" at a glance, with no two the same. Make some pieces larger and some smaller, like a professional clipart set.`,
      people,
      castBlock(),
      `Arrange them in a tidy grid ${transparentBg() ? "on a transparent background (a PNG with no background at all)" : "on a plain white background"}, as a landscape 3:2 image. Each element must be complete and clearly separated with space around it so it can be cut out: no overlapping, nothing cropped, no labels and no text.`,
      lookBlock(),
      mustLine(),
      `They'll be used to make ${isBook() ? bookName() : fmt().shape}, so every piece must share the same style and colors.`,
      QUALITY
    ]);
  }

  function singlePrompt(item, variant, n, total, isFirst, vi, vcount) {
    const t = themePhrase();
    const kw = kitWord();
    let what;
    switch (item.kind) {
      case "pages":
        what = `Image ${n} of ${total}: the illustration for page ${vi + 1} of ${vcount} of ${bookName()} about ${t}.\nScene: ${variant}\nLayout: ${comp().describe}. Size: ${sizeText()}.\nDo not include any text, letters or words: the story text will be added later.`;
        break;
      case "cover":
        what = `Image ${n} of ${total}: the front cover of ${bookName()} about ${t}. Show the main character in an inviting scene that captures the story. Leave a clear, calm area across the top third for the title, with no lettering (the title will be added later). Size: ${sizeText(true)}.`;
        break;
      case "paper":
        what = `Image ${n} of ${total}: a background paper for the ${t} ${kw}: ${variant}, using motifs and colors from the ${kw}. Fill the entire image edge to edge as a flat, seamless pattern. No characters, no single focal object, no border, no text. Size: ${sizeText()}.`;
        break;
      case "frame":
        what = `Image ${n} of ${total}: a decorative frame for the ${t} ${kw}: ${variant} built from the ${kw}'s motifs, laid out as ${comp().describe}. Leave the centre completely empty and plain white so wording or a photo can go there. No text. Size: ${sizeText()}.`;
        break;
      case "scene":
        what = `Image ${n} of ${total}: a background scene for the ${t} ${kw}: ${variant}. Leave it free of characters so pieces can be placed on top, with open space in the middle. No text. Size: ${sizeText()}.`;
        break;
      default:
        what = `Image ${n} of ${total}: ${variant} for the ${t} ${kw}, decorated with the ${kw}'s motifs and isolated on a plain white background. Leave it blank (no letters or words) so a title can be added later. Landscape 3:2.`;
    }
    return join(["Please create an image.", consistencyLine(isFirst), what,
      item.kind === "paper" ? "" : castBlock(), lookBlock(), item.kind === "pages" ? mustLine() : "", QUALITY]);
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
      isBook() ? `A finished full-color page illustration for ${bookName()} about ${themePhrase()} (${sizeText()}).`
               : `A complete, ready-to-use ${fmt().shape} (${sizeText()}) with a ${themePhrase()} theme.`,
      castBlock(),
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
      castBlock(),
      QUALITY
    ]);
  }

  // All the prompts for the Build step, in order
  function buildList() {
    const k = kit();
    if (k.finished) return [{ key: "finished", title: "Full page design", sub: `${fmt().label} · ${sizeText()}`, prompt: finishedPrompt() }];
    const jobs = [];
    k.items.filter((it) => included(k, it)).forEach((it) => {
      if (it.kind === "sheet") jobs.push({ item: it });
      else variantsOf(it).forEach((v, i) => jobs.push({ item: it, variant: v, i }));
    });
    return jobs.map((j, idx) => {
      const n = idx + 1, first = idx === 0, it = j.item;
      if (it.kind === "sheet") {
        const c = itemCounts(it).pieces;
        return { key: `${k.id}.${it.id}`, title: it.title, sub: `Sheet of ${c}: ${piecesOf(it).map(pieceLabel).join(", ")}`,
                 prompt: sheetPrompt(it, n, jobs.length, first) };
      }
      const vs = variantsOf(it);
      const title = it.kind === "pages" ? `Page ${j.i + 1}` : it.title + (vs.length > 1 ? ` ${j.i + 1} of ${vs.length}` : "");
      return { key: `${k.id}.${it.id}.${j.i}` + (it.kind === "pages" ? `.${j.variant}` : ""), title, sub: j.variant.replace(/^an? /, ""),
               prompt: singlePrompt(it, j.variant, n, jobs.length, first, j.i, vs.length) };
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
    const nextLabel = ["", "Next: format →", "Next: look →", "Next: plan my kit →", "Looks good: make my prompts →", ""][S.step];
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
      <h1>What are you making?</h1>
      <p class="lead">Pick the kind of project. You'll choose what to create from it in step 4.</p>
      <h3 class="label">Format</h3>
      <div class="grid">${C.formats.map((f) => card("format", f.id, f.id === S.format,
        `<span class="em">${f.emoji}</span><span>${esc(f.label)}</span>`)).join("")}</div>
      ${lineArt() ? '<p class="note">Coloring book pages are always made as black-and-white line art.</p>' : ""}
      ${isBook() ? '<p class="note">Children\'s book pages are always full color.</p>' : ""}`;
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
    const sizes = sizesFor().map((p) => chip("size", p.id, p.id === S.size, p.label)).join("");
    const outs = C.outputs.map((o) => card("output", o.id, o.id === S.output,
      `<span class="em">${o.emoji}</span><span class="kit-head"><strong>${esc(o.label)}</strong>${o.tag ? `<span class="tag">${esc(o.tag)}</span>` : ""}</span><small>${esc(isBook() && o.bookBlurb ? o.bookBlurb : o.blurb)}</small>`, "text out")).join("");
    const kits = kitsFor().filter((kk) => !kk.finished).map((kk) => {
      const c = kitCounts(kk, false);
      return card("kit", kk.id, kk.id === k.id, `
        <span class="kit-head"><strong>${esc(kk.label)}</strong>${kk.tag ? `<span class="tag">${esc(kk.tag)}</span>` : ""}</span>
        <span class="counts">${kk.finished ? "1 image" : `${c.pieces} pieces · ${c.images} images`}</span>
        <small>${esc(kk.blurb)}</small>`, "text kit");
    }).join("");

    let contents;
    if (S.output === "elements") {
      contents = `
        <h3 class="label">How many elements?</h3>
        <div class="chips">${C.elementCounts.map((n) => chip("count", n, +S.elemCount === n, `${n} elements`)).join("")}</div>
        <h3 class="label">What should be on the sheet? <small>· tap to turn on or off</small></h3>
        <div class="chips">${C.elementMix.map((m) => chip("mix", m.id, S.mix.includes(m.id), m.label)).join("")}</div>
        ${S.mix.includes("people") ? `<label class="field" for="f-people">Describe the people <small>(optional)</small></label>
        <input type="text" id="f-people" data-field="peopleDesc" value="${esc(S.peopleDesc)}" placeholder="e.g. a grandmother with silver curls and glasses, a young woman with curly hair, a young man with a beard">` : ""}
        <p class="note">ChatGPT picks the exact pieces to match your theme. Anything specific you want goes in Must-haves below.</p>
        ${S.mix.some((m) => ["backgrounds", "scenepieces", "frames"].includes(m)) ? '<p class="note">Backgrounds, scene pieces and frames come out small on a sheet. To use one at full size, tap its number under "Make full-size pieces" on the next screen.</p>' : ""}
        <h3 class="label">Background</h3>
        <div class="chips">${chip("bg", "white", S.bg !== "transparent", "Plain white")}${chip("bg", "transparent", S.bg === "transparent", "Transparent (PNG)")}</div>
        <p class="note">Transparent is easiest for dropping elements straight into Canva.</p>`;
    } else if (k.finished) {
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
        <h3 class="label">${isBook() ? `Your ${esc(k.label.toLowerCase())}` : `Your ${esc(k.label.toLowerCase())} kit`} <small>· ${esc(comp().label)} ${isBook() ? "layout" : "arrangement"}</small></h3>
        <div class="items">${k.items.map((it) => {
          const c = itemCounts(it);
          const on = included(k, it);
          const desc = it.kind === "sheet"
            ? `One sheet of ${c.pieces}: ${piecesOf(it).map(pieceLabel).join(", ")}`
            : it.kind === "pages"
              ? (c.images ? `${c.images} illustration${c.images > 1 ? "s" : ""}, one for each line of your story` : "One illustration per line of your story (type it below)")
              : `${c.images} separate image${c.images > 1 ? "s" : ""}: ${it.variants.map((v) => v.replace(/^an? /, "")).join(", ")}`;
          return `<label class="item ${on ? "" : "off"}">
            <span class="badge">${it.kind === "sheet" ? c.pieces : it.kind === "pages" ? "📖" : "✦"}</span>
            <span class="item-body"><strong>${esc(it.title)}</strong>${it.optional ? ' <span class="opt">optional</span>' : ""}<small>${esc(desc)}</small></span>
            <span class="incl"><input type="checkbox" data-act="incl" data-id="${esc(it.id)}" ${on ? "checked" : ""}> Include</span>
          </label>`;
        }).join("")}</div>`;
    }

    const pageCount = storyLines().length;
    const story = !isBook() ? "" : `
      <h3 class="label">Your story</h3>
      ${k.finished ? "" : `<label class="field" for="f-title">Book title <small>(optional)</small></label>
      <input type="text" id="f-title" data-field="bookTitle" value="${esc(S.bookTitle)}" placeholder="e.g. Benny and the Big Snow Day">`}
      <label class="field" for="f-main">Main character <small>(describe how they look, so they match on every page)</small></label>
      <textarea id="f-main" data-field="mainChar" placeholder="e.g. Benny, a small brown bunny with floppy ears, a blue striped scarf and round glasses">${esc(S.mainChar)}</textarea>
      <label class="field" for="f-others">Other characters <small>(optional)</small></label>
      <textarea id="f-others" data-field="otherChars" placeholder="e.g. Grandma Owl, a plump grey owl in a lilac shawl; Pip, a tiny yellow chick">${esc(S.otherChars)}</textarea>
      ${hasPages(k) ? `<label class="field" for="f-story">Story pages <small>· one line per page · <span id="storyCount">${pageCount} page${pageCount === 1 ? "" : "s"}</span></small></label>
      <textarea id="f-story" class="tall" data-field="story" placeholder="Benny wakes up and sees snow outside his window.&#10;He races outside and slides down the big hill.&#10;He finds Pip shivering under a bush.&#10;Benny gives Pip his blue scarf.">${esc(S.story)}</textarea>
      <p class="note">Describe what happens in the picture on each page. You'll add the actual story text later in Canva or your book software.</p>` : ""}`;

    return `
      <h1>${S.output === "full" ? "Plan my design" : S.output === "elements" ? "Plan my elements" : `Plan my ${isBook() ? "book" : "kit"}`}</h1>
      <p class="lead">${k.finished ? "You'll get one prompt for a complete, ready-to-use design."
        : S.output === "elements" ? "You'll get one sheet of separate graphics based on your theme. Afterwards you can turn any of them into its own full-size image."
        : isBook() ? "Make the character sheets first so your characters look the same on every page. Then each page of your story gets its own prompt."
        : "Your kit is made as sheets of pieces first, so you can see everything in ChatGPT. Afterwards you choose which pieces to make as separate full-size images."}</p>
      <h3 class="label">What would you like?</h3>
      <div class="grid kits">${outs}</div>
      ${S.output === "kit" ? `<h3 class="label">Kit size</h3>
      <div class="grid kits">${kits}</div>` : ""}
      ${S.output === "elements" ? "" : `<h3 class="label">${isBook() ? "Page layout" : "How should the page be arranged?"}</h3>
      <div class="grid wide">${compsFor().map((c) => card("composition", c.id, c.id === S.composition,
        `<strong>${esc(c.label)}</strong><small>${esc(c.hint)}</small>`, "text")).join("")}</div>
      ${isBook() ? '<p class="note">Every layout leaves room for your story words.</p>' : ""}`}
      ${S.output === "elements" ? "" : `<h3 class="label">Page size</h3>
      <div class="chips">${sizes}</div>
      ${isBook() ? '<p class="note">Common print-on-demand trim sizes (like Amazon KDP).</p>' : ""}`}
      ${contents}
      ${story}
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
        <dt>Making</dt><dd><strong>${esc(fmt().label)}</strong>${S.output === "elements" ? "" : `<small>${esc(comp().label)}: ${esc(comp().hint.toLowerCase())}</small>`}</dd>
        <dt>Look</dt><dd><strong>${esc(lookLabel())}</strong>${S.moods.length ? `<small>${esc(S.moods.join(" · "))}</small>` : ""}</dd>
        ${lineArt() ? "" : `<dt>Palette · ${esc(p.label)}</dt><dd>${p.colors.length ? `<span class="swatches big">${p.colors.map((x) => `<span class="sw" style="background:${x}"></span>`).join("")}</span>`
          : `<small>${esc(paletteWords())}</small>`}</dd>`}
        <dt>Output</dt><dd><strong>${S.maxStep >= 4 ? (k.finished ? "1 full page design" : S.output === "elements" ? `${c.pieces} elements on 1 sheet` : `${c.pieces} pieces · ${c.images} images`) : "Planned in step 4"}</strong>
          ${S.maxStep >= 4 && S.output !== "elements" ? `<small>${esc(byId(C.pageSizes, S.size).label)}</small>` : ""}</dd>
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
    if (S.step === 4 && hasPages(kit()) && !storyLines().length) return "Type at least one story page (one line per page), or untick Story pages.";
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
      case "format":
        S.format = id;
        S.size = fmt().size;
        if (!compsFor().some((c) => c.id === S.composition)) S.composition = compsFor()[0].id;
        if (!kitsFor().some((k) => k.id === S.kit && !k.finished)) S.kit = kitsFor()[1].id;
        break;
      case "composition": S.composition = id; break;
      case "style": S.style = id; break;
      case "finish": S.finish = id; break;
      case "mood":
        S.moods = S.moods.includes(id) ? S.moods.filter((m) => m !== id)
          : S.moods.length < C.maxMoods ? [...S.moods, id] : S.moods;
        break;
      case "palette": S.palette = id; break;
      case "kit": S.kit = id; break;
      case "output": S.output = id; break;
      case "count": S.elemCount = +id; break;
      case "bg": S.bg = id; break;
      case "mix":
        if (S.mix.includes(id)) { if (S.mix.length > 1) S.mix = S.mix.filter((m) => m !== id); }
        else S.mix = [...S.mix, id];
        break;
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
    if ($("#error")) $("#error").textContent = "";
    if (f === "story" && $("#storyCount")) { const n = storyLines().length; $("#storyCount").textContent = `${n} page${n === 1 ? "" : "s"}`; }
    renderSidebar();
    save();
    if (f === "textMode") render();
  });

  render();
})();
