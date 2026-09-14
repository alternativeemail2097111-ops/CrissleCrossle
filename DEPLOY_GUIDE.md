# CrissleCrossle LIVE — Complete Setup Guide (No Coding Required)

This guide assumes you have never written code and will never touch code
directly. You will do three things: (1) get one free key, (2) upload a
folder to GitHub, (3) click some buttons on Render. That's it.

---

## Part 0 — What you're about to set up

- **GitHub** stores your project's code (think of it as cloud storage for
  code that Render can read from).
- **Render** runs your code 24/7 as a live website/server.
- **EulerStream** is a free service that lets your server reliably listen
  to TikTok LIVE chat. TikTok doesn't offer an official way to do this, so
  everyone doing TikTok LIVE games relies on a "signing" service like this
  one — without it, connections are unreliable and get rate-limited fast.

You will connect them like this:
`GitHub (your code) → Render (runs the code) → EulerStream (talks to TikTok)`

---

## Part 1 — Get your free EulerStream key (do this FIRST)

This is step 4 from the original plan, done first on purpose — trying to
run without this key is the least reliable way to do this, so there's no
reason to postpone it.

1. Go to **https://www.eulerstream.com** and sign up for a free account.
2. Once logged in, find the **API Keys** section of their dashboard and
   create a new key.
3. Copy the key somewhere safe (a Notes app is fine) — it'll look like a
   long random string of letters and numbers. You'll paste it into Render
   in Part 3.

You don't need a paid plan to start. The free tier is enough to test and
run small-to-medium streams; if you outgrow it later, EulerStream's site
shows upgrade options.

---

## Part 2 — Upload the project to GitHub

You already have a GitHub account, so:

1. Go to **https://github.com** and log in.
2. Click the **+** icon in the top-right corner → **New repository**.
3. Name it something like `crisslecrossle-live`. Leave it **Public** or
   **Private**, either works. Do **not** check "Add a README" (we already
   have one). Click **Create repository**.
4. GitHub will show you an empty repository page with a few options. Look
   for a link that says **"uploading an existing file"** and click it.
   (If you don't see that link, click **Add file → Upload files** near the
   top right instead — same thing.)
5. On your computer, unzip the `crisslecrossle-live.zip` file you were
   given. You'll see a folder full of files and sub-folders (`game/`,
   `public/`, `server.js`, etc.).
6. Open that unzipped folder, select **everything inside it** (Ctrl+A on
   Windows, Cmd+A on Mac), and **drag all of it** onto the GitHub upload
   page in your browser. GitHub supports dragging whole folders — the
   `game/` and `public/` sub-folders will come along automatically.
7. Wait for the upload progress bars to finish, scroll down, and click the
   green **Commit changes** button.

You now have a working copy of the project on GitHub. You will come back
here in the future any time you want to change something (see Part 5).

---

## Part 3 — Deploy it on Render

1. Go to **https://render.com** and log in.
2. Click **New +** → **Web Service**.
3. Choose **"Build and deploy from a Git repository"**, then connect your
   GitHub account if you haven't already, and select the
   `crisslecrossle-live` repository you just created.
4. Fill in the settings Render asks for:
   - **Name**: anything you like, e.g. `crisslecrossle-live`.
   - **Region**: pick whichever is closest to you.
   - **Branch**: `main` (this should already be selected).
   - **Runtime**: `Node`.
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: the **Free** tier works for testing. For a real
     broadcast, a paid tier ("Starter" or above) is worth it — the free
     tier "falls asleep" after 15 minutes with no visitors, which would
     disconnect your game mid-stream if nobody has the page open.
5. Scroll down to **Environment Variables** and add one:
   - **Key**: `EULERSTREAM_API_KEY`
   - **Value**: paste the key you copied in Part 1.
6. Click **Create Web Service**.

Render will now install everything and start your server automatically.
This takes a couple of minutes the first time. When it's done, Render
shows you a live URL like `https://crisslecrossle-live.onrender.com` —
that's your game. Open it in a browser tab (or on your phone) and you'll
see the CrissleCrossle screen.

Every time you upload a change to GitHub in the future, Render notices and
redeploys automatically — you never have to repeat these steps.

---

## Part 4 — Using the game

Open your Render URL. You'll see:

- A **diagnostics pill** in the top-right corner (tap it to expand). This
  is your "is it actually working" panel — it shows a live count of chat
  messages received and the last message that came in, so you can tell at
  a glance whether messages are arriving at all, or arriving but not being
  recognized as guesses. You will not need to look at any server logs.
- The **game board** in the middle, where guesses appear as they come in.
- A **leaderboard** and **live chat feed** on the side.
- A **Host Controls** bar at the bottom of the screen that always stays
  visible, even on a phone, even while scrolling.

### Test Mode (try this first, before going live)

1. Tap the **Test Mode** switch in the Host Controls bar.
2. Fake viewers will start "chatting" and guessing automatically. Tap
   **Start Round** to begin a round and watch it play out on its own.
3. This never touches TikTok or the internet — it's purely to prove the
   game itself works, any time, even with no internet connection to
   TikTok. Use it after any future change before you rely on it live.
4. Turn the switch off when you're done testing.

### Going live for real

1. Make sure you're actually LIVE on TikTok first (open the TikTok app and
   start your broadcast).
2. Back in the game screen, type your TikTok **@username** (the one you're
   streaming from) into the "Connect" box in Host Controls and tap
   **Connect**.
3. Watch the diagnostics dot: yellow = connecting, green = connected, red =
   there was a problem (the message next to it explains what, in plain
   language — e.g. "doesn't look like they're LIVE right now").
4. If it fails, it automatically retries a couple of times on its own
   before giving up and showing you an error message.
5. Tap **Start Round** to begin. Tell your viewers to type a 5-letter word
   guess **by itself** in the comments (just `APPLE`, not "I think it's
   apple!") — that's the most reliable way for the game to recognize it.
6. Use **Give Hint** any time you want to help viewers along, **Skip** to
   abandon a round early, or **Reveal Answer** to end it immediately.
7. Use the **Say / Test** box at the bottom to type something yourself —
   it appears in the feed as "HOST" and can also double as a way to
   privately test a guess without waiting for a viewer.

### Screen-sharing this during your broadcast

Share this browser tab/window as your screen or a source in whatever app
you use to go live. If you're viewing it on your own phone during the
broadcast, everything important (the board, the timer, and especially the
Host Controls) is designed to stay on-screen without you needing to scroll
around to find it.

---

## Part 5 — Making changes later

You said you'll never touch code directly, so here's the safe way to make
changes without writing any:

1. Go back to me (Claude) and describe what you want changed.
2. I'll give you the updated file(s).
3. On GitHub, open the file that changed, click the **pencil (edit) icon**,
   delete everything inside, and paste in the new version I gave you.
4. Scroll down and click **Commit changes**.
5. Render will automatically notice and redeploy within a minute or two —
   you don't need to do anything on Render's side.

---

## Troubleshooting (read the on-screen panel, not error messages)

- **Diagnostics says "Events received: 0" and it's not moving** → Chat
  messages aren't arriving at all. Double-check you typed the exact TikTok
  username (no spaces, the `@` is optional) and that you're truly LIVE.
- **Events are climbing but "Recognized" isn't** → Messages are arriving
  fine; people just aren't typing single 5-letter word guesses. That's
  normal for general chit-chat — only clean guesses like `APPLE` count.
- **Status dot is red** → Read the message next to it; it's written in
  plain English on purpose (e.g. rate-limited, account not live, etc.).
  It will already have retried a couple of times automatically.
- **The leaderboard reset unexpectedly** → On Render's free tier, the
  server can restart after periods of inactivity, and a full redeploy
  always starts fresh. The leaderboard is saved to a small file that
  survives ordinary restarts, but not a fresh deploy on the free tier's
  temporary storage. If you want scores to survive forever, ask me about
  adding a small persistent database or a Render persistent disk later —
  it's an easy add-on, just not required to get started.
- **Something looks broken and you don't know why** → Open the
  diagnostics panel and check "Recent errors" — everything is logged there
  in plain terms, and the server is built to never crash from a single bad
  message, so the game keeps running for everyone else even if one thing
  goes wrong.

---

## A note on reliability

TikTok doesn't publish an official way to read LIVE chat, so every tool
that does this (including this one) is built on top of reverse-engineered
access via EulerStream. It's the same approach used by most TikTok LIVE
games and chat bots you've seen, and it works reliably in practice, but
TikTok could technically change something on their end at any time. If a
connection ever behaves strangely after months of working fine, it's
usually a quick library update away from being fixed — just let me know
and I'll update the relevant file for you.
