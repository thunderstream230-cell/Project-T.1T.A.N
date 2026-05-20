# Project T.I.T.A.N - AI Companion Website

A ready-to-import GitHub repo for a browser-based AI companion website.

This repo includes:

- A working GitHub Pages frontend
- A polished chat UI
- Local companion memory saved in the browser
- Companion personality settings
- A safe backend template for connecting to an AI API later
- No exposed API keys

## How to use this repo on GitHub

1. Download and unzip this project.
2. Go to GitHub.
3. Create a new repository.
4. Upload all files from this folder.
5. Go to:

```txt
Settings → Pages
```

6. Set:

```txt
Source: Deploy from a branch
Branch: main
Folder: /root
```

7. Save.

Your site should publish at:

```txt
https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/
```

## Important

The website works immediately with a local demo AI mode.

For real AI responses, do not put your API key in `script.js`.

Use the included backend template in:

```txt
backend/server.js
```

That backend is meant for Vercel, Render, Railway, or another server host.

## File structure

```txt
Project-TITAN-ai-companion/
│
├─ index.html
├─ style.css
├─ script.js
├─ companion.json
├─ README.md
├─ .gitignore
│
└─ backend/
   ├─ package.json
   ├─ server.js
   └─ .env.example
```

## Frontend demo mode

By default, the website uses local demo responses.

To connect your own backend later, open `script.js` and set:

```js
const USE_BACKEND = true;
const BACKEND_URL = "https://your-backend-url.com/chat";
```

## Backend setup

Inside the `backend` folder:

```bash
npm install
npm start
```

Create a `.env` file based on `.env.example`:

```txt
OPENAI_API_KEY=your_api_key_here
PORT=3000
```

Then your backend endpoint will be:

```txt
http://localhost:3000/chat
```

## Notes

This is a starter project. It is designed to be easy to edit, upload, and expand.
