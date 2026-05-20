# Project T.I.T.A.N - Tech HUD AI Companion

A GitHub Pages-ready AI companion website with a futuristic HUD interface.

This repo is designed for your Minecraft Bedrock addon/project so users can ask questions like:

- How does flight work?
- How do I obtain a power?
- What item gives this ability?
- What script controls beams?
- What files mention injections, suits, speed, or cooldowns?

The site works immediately without a backend using local searchable data.

## Upload to GitHub

1. Unzip this folder.
2. Create a new GitHub repo.
3. Upload **all files inside this folder**.
4. Go to **Settings → Pages**.
5. Set:

```txt
Source: Deploy from a branch
Branch: main
Folder: /root
```

6. Save.

Your site will publish at:

```txt
https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/
```

## Open on PC without GitHub

You can try double-clicking:

```txt
index.html
```

If the data does not load, open Command Prompt in this folder and run:

```bash
python -m http.server 8080
```

Then open:

```txt
http://localhost:8080
```

## Important files

```txt
index.html                 Main website layout
style.css                  Tech HUD visuals
script.js                  Companion logic/search/Q&A
data/pack_knowledge.json   Extracted pack knowledge
companion.json             Companion personality/settings
backend/server.js          Optional real AI backend template
```

## Real AI backend

The website works without a real AI API.

When you are ready for real AI responses, deploy the `backend` folder to a backend host and then edit `script.js`:

```js
const USE_BACKEND = true;
const BACKEND_URL = "https://your-backend-url.com/chat";
```

Never put API keys inside `script.js`.
