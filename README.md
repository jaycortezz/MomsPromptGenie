# ✨ Prompt Genie

A step-by-step helper that plans a matching clipart kit (or one finished design) and writes every
ChatGPT prompt needed to make it. No logins, no API keys, no cost: the images are made in your own ChatGPT account.

## The steps

1. **Theme:** what it's about, and what it's for (optional)
2. **Format:** Invitation, Postcard, Children's Book, Coloring Book, …
3. **Look:** art style, finish, up to 3 moods, and a color palette
4. **Plan:** what to make, the page size and any must-haves:
   - **Design elements** (default): one sheet of full-color artwork pieces on the theme. Choose 6 to 20 elements,
     what goes on it (people, food & objects, florals, bows & corners, sparkles, animals), an optional description
     of the people, and a white or transparent background
   - **Full page design:** one finished, ready-to-use piece, with a choice of how the page is arranged
   - **Complete kit:** Starter, Bundle or Mega, with a choice of which sheets to include
5. **Build:** a numbered list of prompts
   - **Start in ChatGPT** opens a new chat with prompt 1 filled in (and copies it as a backup)
   - Each next prompt is copied and pasted into the **same chat**, so everything matches
   - **Make full-size pieces:** tap any piece from a sheet to get a prompt that turns it into its own full-size image

**Children's Book** is its own format with picture-book page layouts (full page, double-page spread,
picture above text, side by side, spot illustration), common print trim sizes, and three kits:
a single page, a character set (turnaround, expressions, supporting cast) and a full picture book.
For a full book, the story is typed one line per page, and each line becomes its own page illustration
prompt. The character descriptions are repeated in every prompt so the characters stay consistent.

The **My kit** sidebar shows a summary and can save the ChatGPT chat link, so you can get back to the kit's chat.
Everything is saved in the browser automatically.

## Why it doesn't call ChatGPT directly

A ChatGPT Plus subscription doesn't include API access (that's billed separately and needs a developer key).
So the Genie writes the prompts itself, and the button opens `chatgpt.com/?q=…` with the prompt already filled in.
The images are made in your own logged-in account.

## Fine-tuning

Everything you choose from is in **`config.js`**, with plain-English notes:
- `styles`: art style wording (the `prompt` text goes straight into every prompt)
- `formats`, `compositions`, `finishes`, `moods`, `palettes`, `pageSizes`
- `kits`: what's in Starter, Bundle and Mega (sheets, piece counts, papers, frames, scenes)

The prompt wording itself is in `app.js` (`sheetPrompt`, `singlePrompt`, `finishedPrompt`, `piecePrompt`).

## Putting it online (one-time setup)

1. On GitHub: **Settings → Pages**, then choose *Deploy from a branch*, pick the branch and `/ (root)`, and click **Save**
2. You'll get a link like `https://<username>.github.io/MomsPromptGenie/`. Bookmark it, or use "Add to Home Screen" on a phone.

To try it locally, just open `index.html` in a browser.
