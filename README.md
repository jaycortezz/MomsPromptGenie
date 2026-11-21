# ✨ Prompt Genie

A simple web page that turns a few choices into a detailed AI art prompt for invitations, postcards, coloring pages and more.

**How it works for the user:**
1. Pick a layout (Invitation, Postcard, Coloring Book Page, …)
2. Pick an art style (Watercolor, Painted, Hand-Drawn, Playful, Vintage, Textile)
3. Type a theme (plus optional colors and extra details)
4. Choose **Full Design** (one finished piece) or **Elements** (a sheet of separate graphics)
5. Choose a platform, click **Make my prompt**, then **Open ChatGPT** or **Copy**

## Uses her own ChatGPT account

The Genie writes the prompt itself with plain templates, so it needs no AI, no API key and costs nothing.
The **Open ChatGPT** button opens `chatgpt.com/?q=…` with the prompt already filled in, so the image is made
in her own logged-in ChatGPT account and counts against her plan's limits. Clicking the button also copies
the prompt, in case the ChatGPT phone app opens without filling it in.

(A ChatGPT Plus subscription doesn't include API access. Calling OpenAI directly from the page would need a separately billed API key, so this setup avoids that.)

## Fine-tuning

Everything she sees comes from **`config.js`**. Edit that file to:
- reword an art style's description (the `prompt` field is what goes into the prompt)
- add or remove layouts and styles, or change their emoji
- change sizes and aspect ratios
- add platforms

The logic that builds the prompt is `buildPrompt()` in `index.html`.

## Putting it online (one-time setup)

1. On GitHub, go to the repo's **Settings → Pages**
2. Under *Source*, pick **Deploy from a branch**, then pick the branch and the `/ (root)` folder, and click **Save**
3. After a minute you get a link like `https://<username>.github.io/MomsPromptGenie/`. Send it to her and have her
   bookmark it, or use "Add to Home Screen" on her phone.

To try it locally, just double-click `index.html`.
