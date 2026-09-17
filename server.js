// ============================================================================
// CrissleCrossle LIVE - server entry point
//
// This file wires together:
//   - Express (serves the host display page)
//   - Socket.io (pushes live game state to the browser)
//   - GameEngine (game rules, scoring, rounds)
//   - Diagnostics (on-screen "is it actually working" panel)
//   - TikTokManager (real TikTok LIVE chat, with retries)
//   - TestModeSimulator (fake chat, no external connection)
//
// Requirement #5 (never crash the whole server for one bad message): EVERY
// socket handler and EVERY TikTok event handler is wrapped in try/catch
// inside its own module, and on top of that we install process-level
// safety nets below.
// ============================================================================

import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';

import { GameEngine, WORD_LENGTH_OPTIONS, NEXT_ROUND_DELAY_OPTIONS } from './game/engine.js';
import { WORD_LISTS } from './game/words.js';
import { Diagnostics } from './game/diagnostics.js';
import { TikTokManager } from './game/tiktok.js';
import { TestModeSimulator } from './game/testMode.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const SIGN_API_KEY = process.env.EULERSTREAM_API_KEY || process.env.SIGN_API_KEY || '';
const LEADERBOARD_FILE = path.join(__dirname, 'data', 'leaderboard.json');

const diagnostics = new Diagnostics();

// ---------------------------------------------------------------------------
// Process-level safety net. If something we didn't anticipate throws outside
// of our own try/catch blocks, log it and keep the server alive instead of
// taking down every connected viewer.
// ---------------------------------------------------------------------------
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err && err.stack ? err.stack : err);
  try { diagnostics.logError('uncaughtException', err); } catch (_) { /* ignore */ }
});
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
  try { diagnostics.logError('unhandledRejection', reason); } catch (_) { /* ignore */ }
});

// ---------------------------------------------------------------------------
// Core singletons
// ---------------------------------------------------------------------------
const engine = new GameEngine({
  onChange: () => {
    try {
      io.emit('game:update', engine.getPublicState());
    } catch (err) {
      diagnostics.logError('broadcast.gameUpdate', err);
    }
  },
});

loadLeaderboard();

const tiktok = new TikTokManager({
  diagnostics,
  signApiKey: SIGN_API_KEY,
  onComment: handleIncomingComment,
  onStatus: (status) => {
    try {
      io.emit('tiktok:status', status);
    } catch (err) {
      diagnostics.logError('broadcast.tiktokStatus', err);
    }
  },
});

const testMode = new TestModeSimulator(handleIncomingComment, () => WORD_LISTS[engine.round ? engine.round.wordLength : engine.wordLength] || []);
let testModeActive = false;

// ---------------------------------------------------------------------------
// The single funnel every chat message (real or simulated) passes through.
// This is where the on-screen "events received" counter lives - it
// increments no matter what, even if nothing downstream recognizes the
// message as a guess.
// ---------------------------------------------------------------------------
function handleIncomingComment(username, text, source) {
  try {
    diagnostics.recordIncoming({ username, text, source });
    io.emit('diagnostics:update', diagnostics.getPublicState());
    io.emit('chat:new', { username, text, source, ts: Date.now() });

    const result = engine.submitGuess(username, text);
    if (result && result.recognized) {
      diagnostics.recordRecognized();
      io.emit('diagnostics:update', diagnostics.getPublicState());
    } else if (result && result.reason === 'not-a-word') {
      // Specifically the "tried to guess, but it isn't a recognized word"
      // case - worth a brief on-screen explanation. Ordinary chit-chat
      // (which never reaches this branch) stays silent.
      io.emit('guess:rejected', { username, guess: result.guess, ts: Date.now() });
    }
    if (result && (result.correct || result.roundOver)) {
      saveLeaderboard();
    }
  } catch (err) {
    // A single malformed/unexpected comment must never crash the server.
    diagnostics.logError('handleIncomingComment', err);
  }
}

function buildFullState() {
  return {
    game: engine.getPublicState(),
    diagnostics: diagnostics.getPublicState(),
    tiktokStatus: diagnostics.connection,
    testModeActive,
    wordLengthOptions: WORD_LENGTH_OPTIONS,
    nextRoundDelayOptions: NEXT_ROUND_DELAY_OPTIONS,
    signKeyConfigured: !!SIGN_API_KEY,
  };
}

function loadLeaderboard() {
  try {
    if (fs.existsSync(LEADERBOARD_FILE)) {
      const raw = JSON.parse(fs.readFileSync(LEADERBOARD_FILE, 'utf8'));
      if (Array.isArray(raw)) {
        for (const entry of raw) {
          if (entry && entry.username) {
            engine.leaderboard.set(entry.username.toLowerCase(), entry);
          }
        }
      }
    }
  } catch (err) {
    diagnostics.logError('loadLeaderboard', err);
  }
}

function saveLeaderboard() {
  try {
    fs.mkdirSync(path.dirname(LEADERBOARD_FILE), { recursive: true });
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify([...engine.leaderboard.values()]));
  } catch (err) {
    // Non-fatal: the game keeps working with an in-memory leaderboard even
    // if the disk write fails (e.g. a read-only filesystem on some hosts).
    diagnostics.logError('saveLeaderboard', err);
  }
}

// ---------------------------------------------------------------------------
// Express + Socket.io wiring
// ---------------------------------------------------------------------------
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.get('/healthz', (req, res) => res.status(200).send('ok'));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

io.on('connection', (socket) => {
  try {
    socket.emit('state:full', buildFullState());
  } catch (err) {
    diagnostics.logError('socket.onConnectEmit', err);
  }

  // Every handler below is individually wrapped - one bad payload from one
  // host-panel click must never take the socket server down.

  socket.on('tiktok:connect', async (payload) => {
    try {
      const username = payload && payload.username;
      if (!username) return;
      if (testModeActive) {
        testModeActive = false;
        testMode.stop();
        io.emit('testMode:status', { active: false });
      }
      await tiktok.connect(username);
    } catch (err) {
      diagnostics.logError('socket.tiktok:connect', err);
    }
  });

  socket.on('tiktok:disconnect', () => {
    try {
      tiktok.disconnect();
    } catch (err) {
      diagnostics.logError('socket.tiktok:disconnect', err);
    }
  });

  socket.on('testMode:start', () => {
    try {
      testModeActive = true;
      testMode.start(() => (engine.round ? engine.round.answer : null));
      io.emit('testMode:status', { active: true });
    } catch (err) {
      diagnostics.logError('socket.testMode:start', err);
    }
  });

  socket.on('testMode:stop', () => {
    try {
      testModeActive = false;
      testMode.stop();
      io.emit('testMode:status', { active: false });
    } catch (err) {
      diagnostics.logError('socket.testMode:stop', err);
    }
  });

  socket.on('host:say', (payload) => {
    try {
      const text = payload && payload.text;
      if (!text) return;
      handleIncomingComment('HOST', text, 'host');
    } catch (err) {
      diagnostics.logError('socket.host:say', err);
    }
  });

  socket.on('host:startRound', () => {
    try {
      engine.startRound();
    } catch (err) {
      diagnostics.logError('socket.host:startRound', err);
    }
  });

  socket.on('host:skipRound', () => {
    try {
      engine.skipRound('skipped');
    } catch (err) {
      diagnostics.logError('socket.host:skipRound', err);
    }
  });

  socket.on('host:giveHint', () => {
    try {
      engine.giveHint();
    } catch (err) {
      diagnostics.logError('socket.host:giveHint', err);
    }
  });

  socket.on('host:revealAnswer', () => {
    try {
      engine.revealAnswer();
      saveLeaderboard();
    } catch (err) {
      diagnostics.logError('socket.host:revealAnswer', err);
    }
  });

  socket.on('host:setWordLength', (payload) => {
    try {
      const length = payload && payload.length;
      if (length) engine.setWordLength(length);
    } catch (err) {
      diagnostics.logError('socket.host:setWordLength', err);
    }
  });

  socket.on('host:setNextRoundDelay', (payload) => {
    try {
      const seconds = payload && payload.seconds;
      if (seconds) engine.setNextRoundDelay(seconds);
    } catch (err) {
      diagnostics.logError('socket.host:setNextRoundDelay', err);
    }
  });

  socket.on('host:resetLeaderboard', () => {
    try {
      engine.resetLeaderboard();
      saveLeaderboard();
    } catch (err) {
      diagnostics.logError('socket.host:resetLeaderboard', err);
    }
  });

  socket.on('disconnect', () => {
    // Nothing to clean up per-socket - game state is global/shared.
  });
});

server.listen(PORT, () => {
  console.log(`CrissleCrossle LIVE server running on port ${PORT}`);
  console.log(SIGN_API_KEY
    ? 'Sign API key detected.'
    : 'WARNING: No EULERSTREAM_API_KEY set - TikTok connections will use the unreliable free/no-key path.');
});
