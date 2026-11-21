/* =====================================================================
   PROMPT GENIE — SETTINGS FILE
   Everything mom picks from comes from the lists below. Reword, add or
   remove entries and the page updates itself. No other changes needed.
   ===================================================================== */

window.GENIE_CONFIG = {

  /* ---------- STEP 2: FORMATS ----------
     shape:       plain-English description used in prompts
     size:        default page size id (see pageSizes below)
     landscape:   true = page sizes are used sideways
     lineArt:     true = everything becomes black & white coloring line art
  */
  formats: [
    { id: "invitation", label: "Invitation", emoji: "💌", shape: "an invitation card", size: "5x7" },
    { id: "postcard", label: "Postcard", emoji: "📮", shape: "a postcard front", size: "4x6", landscape: true },
    { id: "greeting", label: "Greeting Card", emoji: "🎉", shape: "a folded greeting card front", size: "5x7" },
    { id: "coloring", label: "Coloring Book", emoji: "🖍️", shape: "a coloring book page", size: "letter", lineArt: true },
    { id: "poster", label: "Wall Art", emoji: "🖼️", shape: "a framed art print", size: "8x10" },
    { id: "social", label: "Social Post", emoji: "📱", shape: "a social media graphic", size: "sq5" },
    { id: "stickers", label: "Stickers", emoji: "⭐", shape: "a sheet of die-cut stickers", size: "letter" },
    { id: "banner", label: "Banner", emoji: "🎀", shape: "a wide banner or shop header", size: "banner" }
  ],

  /* ---------- STEP 2: COMPOSITION ----------
     describe: how a finished design is laid out
     framing:  the framing pieces this adds to the kit's sheets
  */
  compositions: [
    { id: "genie", label: "Genie's choice", hint: "Shaped frame, topper and corners",
      describe: "a shaped decorative frame with an arch topper and matching corner pieces around a clear centre",
      framing: [["arch topper", 1], ["corner piece", 1]] },
    { id: "corners", label: "Frame & corners", hint: "Classic frame with corner flourishes",
      describe: "a classic frame with ornate corner flourishes and an open centre",
      framing: [["corner piece", 2]] },
    { id: "topper", label: "Arch topper", hint: "Decoration across the top",
      describe: "a decorative arch of elements across the top with a lighter accent along the bottom",
      framing: [["arch topper", 1], ["bottom border", 1]] },
    { id: "wreath", label: "Wreath", hint: "A circle of elements",
      describe: "a circular wreath of elements surrounding a clear centre",
      framing: [["wreath half", 1], ["small wreath", 1]] },
    { id: "scene", label: "Full scene", hint: "An illustrated scene edge to edge",
      describe: "a full illustrated scene filling the page, with a calm area for wording",
      framing: [["ground strip", 1], ["sky piece", 1]] },
    { id: "border", label: "Border", hint: "Decoration all the way around",
      describe: "a decorative border running around all four edges with an open centre",
      framing: [["border strip", 1], ["corner piece", 1]] }
  ],

  /* ---------- STEP 3: ART STYLES ----------
     prompt:  descriptive words added to every prompt (fine-tune these!)
     lineArt: how the style translates into coloring book outlines
  */
  styles: [
    { id: "watercolor", label: "Watercolor", emoji: "🎨",
      prompt: "hand-painted watercolor illustration, gentle color washes, visible paper texture, soft blooming edges, delicate layered transparency",
      lineArt: "delicate, flowing outlines with organic soft shapes" },
    { id: "painted", label: "Painted", emoji: "🖌️",
      prompt: "painted gouache and acrylic illustration, visible brushstrokes, opaque layered color, warm painterly depth",
      lineArt: "confident, slightly varied outlines with bold simple shapes" },
    { id: "drawn", label: "Hand-Drawn", emoji: "✏️",
      prompt: "hand-drawn ink and colored pencil illustration, fine linework, light cross-hatching, sketchbook charm",
      lineArt: "fine hand-drawn ink outlines with a sketchbook feel" },
    { id: "playful", label: "Playful", emoji: "🎈",
      prompt: "whimsical cartoon illustration, bright cheerful colors, rounded friendly shapes, cute expressive details",
      lineArt: "thick, rounded, friendly cartoon outlines, simple and cute" },
    { id: "vintage", label: "Vintage", emoji: "📜",
      prompt: "vintage illustration inspired by antique printed ephemera, slightly muted retro colors, subtle aged paper texture and print grain",
      lineArt: "classic engraving-inspired outlines, ornate yet clean" },
    { id: "textile", label: "Textile", emoji: "🧵",
      prompt: "textile-inspired artwork that looks like embroidery, stitched fabric and quilted patchwork, visible thread texture, cozy handmade feel",
      lineArt: "outlines inspired by embroidery patterns and quilt blocks, with stitch-like detail lines" }
  ],

  /* ---------- STEP 3: FINISH ---------- */
  finishes: [
    { id: "soft", label: "Soft & loose", word: "Soft", prompt: "loose and airy, soft edges, plenty of breathing room" },
    { id: "polished", label: "Polished & solid", word: "Polished", prompt: "polished storybook finish, clean solid shapes, refined details" },
    { id: "textured", label: "Textured & handmade", word: "Textured", prompt: "rich surface texture, visible handmade marks, tactile feel" }
  ],

  /* ---------- STEP 3: MOOD (pick up to 3) ---------- */
  moods: ["Whimsical", "Elegant", "Glam", "Cozy", "Celestial", "Rustic", "Boho", "Modern",
          "Romantic", "Bold & bright", "Dreamy", "Festive"],
  maxMoods: 3,

  /* ---------- STEP 3: PALETTES ----------
     colors: swatches shown on screen (hex codes)
     words:  how the palette is described in the prompt
  */
  palettes: [
    { id: "genie", label: "Genie's choice", colors: [], words: "a harmonious palette that suits the theme" },
    { id: "rose", label: "Rose petal", colors: ["#e8b4bc", "#f3d9dc", "#c9737f", "#fbf3f2", "#5e4352", "#d4a85a"],
      words: "dusty rose, pale blush, deep rose, soft cream, plum and antique gold" },
    { id: "sage", label: "Sage garden", colors: ["#a8b89a", "#dfe5d5", "#6f8263", "#f7f3ea", "#c98b6b"],
      words: "sage green, pale eucalyptus, olive, warm cream and terracotta" },
    { id: "ocean", label: "Seaside", colors: ["#2f4b6e", "#8fb8d8", "#b9e0d6", "#efe3cc", "#ffffff"],
      words: "navy, sky blue, seafoam, warm sand and white" },
    { id: "sunshine", label: "Sunshine", colors: ["#f6d55c", "#f4a259", "#f7c6a3", "#b5dfc9", "#fffaf0"],
      words: "lemon yellow, marigold, peach, mint and warm white" },
    { id: "berry", label: "Berry jam", colors: ["#b23a6b", "#6b2d5c", "#f29cb7", "#fde8ef", "#3d1f33"],
      words: "raspberry, plum, candy pink, pale pink and deep aubergine" },
    { id: "autumn", label: "Harvest", colors: ["#b7553b", "#d9a441", "#7a2e3a", "#f3e6cf", "#5a3e2b"],
      words: "rust, mustard, burgundy, cream and chestnut brown" },
    { id: "frost", label: "Winter frost", colors: ["#a9c7e0", "#d9e6f0", "#9aa5b1", "#ffffff", "#24395a"],
      words: "icy blue, frost white, silver grey and midnight navy" },
    { id: "rainbow", label: "Rainbow", colors: ["#e85d5d", "#f2a541", "#f5d547", "#6cc08b", "#5b8def", "#9b6ad6"],
      words: "cheerful rainbow brights: red, orange, yellow, green, blue and purple" },
    { id: "linen", label: "Neutral linen", colors: ["#e9e1d4", "#cbbca6", "#9a8873", "#fbf8f2", "#3b3632"],
      words: "oatmeal, taupe, warm grey, ivory and charcoal" },
    { id: "custom", label: "My own colors", colors: [], words: "" }
  ],

  /* ---------- STEP 4: PAGE SIZES ---------- */
  pageSizes: [
    { id: "5x7", label: "5 × 7 in" },
    { id: "4x6", label: "4 × 6 in" },
    { id: "a5", label: "A5" },
    { id: "sq5", label: "Square 5 × 5 in", square: true },
    { id: "a4", label: "A4" },
    { id: "letter", label: "US Letter" },
    { id: "8x10", label: "8 × 10 in" },
    { id: "phone", label: "Phone 9:16", fixed: "tall 9:16 phone screen" },
    { id: "banner", label: "Banner 3:1", fixed: "wide 3:1 banner" }
  ],

  /* ---------- STEP 4: KITS ----------
     Each kit is a list of items. Every item becomes one or more images.
       kind "sheet":  one image with several pieces. pieces = [name, count].
                      "@framing" is replaced by the chosen composition's framing pieces.
       kind "paper" / "frame" / "scene" / "title": one image per variant.
       optional: true = starts unticked
  */
  kits: [
    {
      id: "finished", label: "Finished design", tag: "",
      blurb: "One complete, ready-to-use design. Quickest option.",
      finished: true
    },
    {
      id: "starter", label: "Starter", tag: "",
      blurb: "One sheet of core pieces plus a paper and a frame: enough to build a simple design.",
      items: [
        { id: "core", kind: "sheet", title: "Starter scene set",
          pieces: [["hero character", 1], ["companion character", 2], ["story prop", 3], ["supporting piece", 2],
                   ["foreground piece", 1], "@framing", ["sparkle set", 1]] },
        { id: "paper", kind: "paper", title: "Paper", variants: ["a soft all-over pattern"] },
        { id: "frame", kind: "frame", title: "Frame", variants: ["a shaped frame"] }
      ]
    },
    {
      id: "bundle", label: "Bundle", tag: "Best for selling",
      blurb: "A full matching bundle: characters, props, scenery, accents, framing, papers and scenes.",
      items: [
        { id: "chars", kind: "sheet", title: "Characters",
          pieces: [["hero character", 1], ["hero character in a second pose", 1], ["hero character in a third pose", 1],
                   ["companion character", 4], ["little critter", 2]] },
        { id: "props", kind: "sheet", title: "Story props", pieces: [["story prop", 6], ["supporting piece", 3]] },
        { id: "scenery", kind: "sheet", title: "Scenery pieces",
          pieces: [["ground piece", 2], ["foreground plant", 3], ["tall piece (tree or building)", 2], ["sky piece", 2]] },
        { id: "accents", kind: "sheet", title: "Accents", pieces: [["small accent", 6], ["sparkle set", 2], ["tiny icon", 4]] },
        { id: "framing", kind: "sheet", title: "Framing & flourishes",
          pieces: ["@framing", ["flourish", 2], ["divider", 2], ["ribbon banner", 2]] },
        { id: "papers", kind: "paper", title: "Papers",
          variants: ["a soft all-over pattern", "a coordinating small print", "a subtle texture", "a simple stripe or check"] },
        { id: "frames", kind: "frame", title: "Frames", variants: ["a shaped frame", "a rectangular frame"] },
        { id: "scenes", kind: "scene", title: "Background scenes", optional: true,
          variants: ["a wide outdoor scene", "a cozy close-up scene", "a simple sky and landscape backdrop"] },
        { id: "title", kind: "title", title: "Title plaque", optional: true, variants: ["a blank decorative title plaque"] }
      ]
    },
    {
      id: "mega", label: "Mega", tag: "",
      blurb: "Everything in the Bundle plus extra characters, props, icons, papers, frames and scenes.",
      items: [
        { id: "chars", kind: "sheet", title: "Characters",
          pieces: [["hero character", 1], ["hero character in a second pose", 1], ["hero character in a third pose", 1],
                   ["companion character", 4], ["little critter", 2]] },
        { id: "chars2", kind: "sheet", title: "More characters",
          pieces: [["companion character in a new pose", 6], ["little critter", 3]] },
        { id: "props", kind: "sheet", title: "Story props", pieces: [["story prop", 6], ["supporting piece", 3]] },
        { id: "props2", kind: "sheet", title: "More props", pieces: [["story prop", 8], ["supporting piece", 4]] },
        { id: "scenery", kind: "sheet", title: "Scenery pieces",
          pieces: [["ground piece", 2], ["foreground plant", 3], ["tall piece (tree or building)", 2], ["sky piece", 2]] },
        { id: "accents", kind: "sheet", title: "Accents", pieces: [["small accent", 6], ["sparkle set", 2], ["tiny icon", 4]] },
        { id: "icons", kind: "sheet", title: "Mini icons", optional: true, pieces: [["mini icon", 16]] },
        { id: "framing", kind: "sheet", title: "Framing & flourishes",
          pieces: ["@framing", ["flourish", 2], ["divider", 2], ["ribbon banner", 2]] },
        { id: "papers", kind: "paper", title: "Papers",
          variants: ["a soft all-over pattern", "a coordinating small print", "a subtle texture", "a simple stripe or check",
                     "a scattered motif pattern", "a solid color with fine texture"] },
        { id: "frames", kind: "frame", title: "Frames", variants: ["a shaped frame", "a rectangular frame", "a round frame"] },
        { id: "scenes", kind: "scene", title: "Background scenes", optional: true,
          variants: ["a wide outdoor scene", "a cozy close-up scene", "a simple sky and landscape backdrop",
                     "a night-time version of the main scene", "a seasonal variation of the main scene"] },
        { id: "title", kind: "title", title: "Title plaques", optional: true,
          variants: ["a blank decorative title plaque", "a blank ribbon-style title banner"] }
      ]
    }
  ],

  /* Shown in the sidebar */
  aiNote: "Artwork made this way is AI-generated. If you sell it, check each platform's rules: some (like Etsy) ask you to say when AI was used, and buyers should be able to see exactly what's included."
};
