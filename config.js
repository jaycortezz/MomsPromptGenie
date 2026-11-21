/* =====================================================================
   PROMPT GENIE — SETTINGS FILE
   This is the file to edit when you want to fine-tune things.
   Every option on the page comes from the lists below. Add, remove,
   or reword entries and the page updates itself. No other changes needed.
   ===================================================================== */

window.GENIE_CONFIG = {

  /* ---------- STEP 1: LAYOUTS ----------
     id:        short unique name (no spaces)
     label:     what mom sees on the button
     emoji:     little icon on the button
     ratio:     aspect ratio (used for Midjourney --ar and as a size hint)
     shape:     plain-English shape description added to the prompt
     full:      what a "Full Design" of this layout should include
     elements:  what kind of graphics belong on an "Elements" sheet
     lineArt:   true = force black & white outlines (coloring pages)
     hasText:   true = show the "wording" box for this layout
  */
  layouts: [
    {
      id: "invitation", label: "Invitation", emoji: "💌", ratio: "5:7",
      shape: "a 5x7 inch portrait invitation card",
      full: "a complete, print-ready invitation layout with a decorative border or frame, a focal illustration, and a clear, well-balanced area for the event wording",
      elements: "decorative motifs, small spot illustrations, corner flourishes, borders, and accent pieces that could be arranged into an invitation",
      hasText: true
    },
    {
      id: "postcard", label: "Postcard", emoji: "📮", ratio: "3:2",
      shape: "a 6x4 inch landscape postcard front",
      full: "a complete postcard front with one strong scenic or illustrated focal point that fills the card edge to edge, with an optional spot for a short greeting",
      elements: "scenic pieces, landmarks, small objects, and decorative accents that could be combined into a postcard",
      hasText: true
    },
    {
      id: "greeting", label: "Greeting Card", emoji: "🎉", ratio: "5:7",
      shape: "a 5x7 inch portrait folded greeting card front",
      full: "a complete greeting card front with a charming central illustration and a tasteful space for a short headline greeting",
      elements: "cheerful illustrations, small characters, florals, and accents that could decorate a greeting card",
      hasText: true
    },
    {
      id: "coloring", label: "Coloring Book Page", emoji: "🖍️", ratio: "17:22",
      shape: "a US letter (8.5x11 inch) portrait coloring book page",
      full: "a full-page coloring book scene with a clear main subject, a supporting background, and plenty of enclosed areas to color",
      elements: "separate coloring-book line drawings of individual objects and characters",
      lineArt: true, hasText: false
    },
    {
      id: "poster", label: "Poster / Wall Art", emoji: "🖼️", ratio: "4:5",
      shape: "an 8x10 inch portrait art print",
      full: "a complete, frame-worthy art print with a strong composition and a clear focal point",
      elements: "standalone illustrations and decorative accents that could be arranged into wall art",
      hasText: true
    },
    {
      id: "social", label: "Social Media Post", emoji: "📱", ratio: "1:1",
      shape: "a square 1080x1080 social media graphic",
      full: "a complete, eye-catching square social media graphic with a bold focal illustration and room for a short headline",
      elements: "bold, simple graphics and icons that read well at small sizes on a phone screen",
      hasText: true
    },
    {
      id: "stickers", label: "Sticker Sheet", emoji: "⭐", ratio: "1:1",
      shape: "a square sticker sheet",
      full: "a finished sticker sheet layout with die-cut style stickers, each with a thin white border, neatly arranged",
      elements: "die-cut style stickers, each with a thin white outline border",
      hasText: false
    },
    {
      id: "banner", label: "Banner / Header", emoji: "🎀", ratio: "3:1",
      shape: "a wide horizontal banner (3:1)",
      full: "a complete wide banner design with decoration flowing across the width and a clear central space for a title",
      elements: "horizontal border strips, garlands, dividers, and repeating accents",
      hasText: true
    }
  ],

  /* ---------- STEP 2: ART STYLES ----------
     prompt:  the descriptive words added to the prompt for this style.
              This is the main thing to fine-tune later.
     lineArt: how this style should translate when it's a coloring page.
  */
  styles: [
    {
      id: "watercolor", label: "Watercolor", emoji: "🎨",
      prompt: "soft hand-painted watercolor illustration, gentle color washes, visible paper texture, soft blooming edges, delicate layered transparency, light and airy",
      lineArt: "delicate, flowing outlines inspired by watercolor illustration, organic soft shapes"
    },
    {
      id: "painted", label: "Painted", emoji: "🖌️",
      prompt: "rich painted illustration in gouache and acrylic, visible brushstrokes, opaque layered color, warm and handcrafted, painterly depth",
      lineArt: "confident, slightly varied outlines inspired by painted illustration, bold simple shapes"
    },
    {
      id: "drawn", label: "Hand-Drawn", emoji: "✏️",
      prompt: "hand-drawn ink and colored pencil illustration, fine linework, light cross-hatching, sketchbook charm, subtle colored pencil shading",
      lineArt: "fine hand-drawn ink outlines with a charming sketchbook feel"
    },
    {
      id: "playful", label: "Playful", emoji: "🎈",
      prompt: "playful, whimsical cartoon illustration, bright cheerful colors, rounded friendly shapes, cute expressive details, fun and lighthearted",
      lineArt: "thick, rounded, friendly cartoon outlines, simple and cute"
    },
    {
      id: "vintage", label: "Vintage", emoji: "📜",
      prompt: "vintage illustration style inspired by mid-century and antique printed ephemera, slightly muted retro color palette, subtle aged paper texture, classic print grain",
      lineArt: "classic vintage engraving-inspired outlines, ornate yet clean"
    },
    {
      id: "textile", label: "Textile", emoji: "🧵",
      prompt: "textile-inspired artwork that looks like embroidery, stitched fabric, and quilted patchwork, visible thread texture, cozy handmade craft feel",
      lineArt: "outlines inspired by embroidery patterns and quilt blocks, with stitch-like detail lines"
    }
  ],

  /* ---------- STEP 4: DESIGN TYPE ---------- */
  designTypes: [
    { id: "full", label: "Full Design (one finished piece)" },
    { id: "elements", label: "Elements (sheet of graphics)" }
  ],

  /* How many graphics go on an Elements sheet */
  elementCounts: ["6", "9", "12", "16"],

  /* ---------- PLATFORMS ----------
     Where mom will paste the prompt. Changes how the prompt is worded.
       intro:   text placed before the description
       style:   "sentences" = full detailed paragraphs
                "compact"   = one dense comma-separated line (Midjourney)
       openUrl: button link; {prompt} is replaced with the prompt.
                Leave "" to just show the Copy button.
  */
  platforms: [
    {
      id: "chatgpt", label: "ChatGPT", style: "sentences",
      intro: "Please generate an image based on the following detailed description.",
      openUrl: "https://chatgpt.com/?q={prompt}"
    },
    {
      id: "gemini", label: "Google Gemini", style: "sentences",
      intro: "Generate an image based on the following detailed description.",
      openUrl: ""
    },
    {
      id: "canva", label: "Canva (Magic Media)", style: "sentences",
      intro: "",
      openUrl: "https://www.canva.com/ai-image-generator/"
    },
    {
      id: "firefly", label: "Adobe Firefly", style: "sentences",
      intro: "",
      openUrl: "https://firefly.adobe.com/generate/images"
    },
    {
      id: "midjourney", label: "Midjourney", style: "compact",
      intro: "",
      openUrl: "https://www.midjourney.com/imagine"
    }
  ]
};
