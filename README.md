# CrissleCrossle LIVE

A fully automated TikTok LIVE game overlay based on [CrissleCrossle](https://crisslecrossle.com/)
(an "ambiguous Wordle" with a decoy word every guess). Your TikTok LIVE chat
**is** the controller — viewers type 5-letter word guesses in your comments,
and this app turns them into a live, scored game on screen.

👉 **New here and not a developer?** Read [`DEPLOY_GUIDE.md`](./DEPLOY_GUIDE.md)
first — it walks through everything in plain language, from creating a free
sign-in key to putting this live on Render.

## What's inside

- `server.js` — the whole backend (Express + Socket.io + TikTok connection).
- `game/engine.js` — the CrissleCrossle rules: scoring, hints, rounds, the
  color logic (a tile is green if it matches the real answer **or** the
  decoy word — that ambiguity is the whole game).
- `game/tiktok.js` — connects to TikTok LIVE chat, with automatic retries
  and full raw-event logging.
- `game/diagnostics.js` — the "is this actually working" black box: a
  fallback chain that extracts the username/text from a chat event no
  matter which field names TikTok/the library happen to use this week.
- `game/testMode.js` — a fake chat generator so you can test the whole game
  without ever going live.
- `public/` — the on-screen display + host control panel (one page).

## Running it locally (optional — most people can skip straight to Render)

```bash
npm install
cp .env.example .env   # then paste your EulerStream key into .env
npm start
```

Then open `http://localhost:3000` in a browser.

## Deploying for real

See [`DEPLOY_GUIDE.md`](./DEPLOY_GUIDE.md).
