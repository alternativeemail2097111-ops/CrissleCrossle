// ============================================================================
// CrissleCrossle game engine
// ----------------------------------------------------------------------------
// This file has NO knowledge of TikTok, sockets, or HTTP. It is a pure,
// self-contained game state machine. That separation is what makes Test Mode
// possible: the exact same functions run whether a "guess" came from a real
// TikTok viewer or from the built-in simulator.
// ============================================================================

import { WORDS, isKnownWord } from './words.js';

const WORD_LENGTH = 5;

// Difficulty presets. Guessing is unlimited at every level - difficulty
// only tunes how long a round runs for and how often free hints appear.
export const DIFFICULTIES = {
  easy: { label: 'Easy', roundSeconds: 180, hintEvery: 5 },
  normal: { label: 'Normal', roundSeconds: 120, hintEvery: 4 },
  hard: { label: 'Hard', roundSeconds: 75, hintEvery: 6 },
};

// How long after a round ends before the next one auto-starts. Defaults to
// 3 seconds per the host's chosen default; adjustable live via
// setNextRoundDelay() / the host panel's "Next round" selector.
export const NEXT_ROUND_DELAY_OPTIONS = [3, 5, 10, 15, 30, 60];
const DEFAULT_NEXT_ROUND_DELAY_MS = 3000;

const SOLVE_BASE_SCORE = 100;
const SOLVE_SCORE_STEP = 6;
const SOLVE_SCORE_MIN = 25;
const PARTICIPATION_SCORE = 2;

/**
 * Classic Wordle-style two-pass color comparison of `guess` against a single
 * `target` word. Returns an array of 'green' | 'yellow' | 'grey', one per
 * letter position. Handles duplicate letters correctly.
 */
function colorsAgainst(guess, target) {
  const result = new Array(WORD_LENGTH).fill('grey');
  const targetLetters = target.split('');
  const guessLetters = guess.split('');

  // Pass 1: greens (exact position matches), consuming those target letters.
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      result[i] = 'green';
      targetLetters[i] = null;
    }
  }

  // Count remaining (unconsumed) target letters for the yellow pass.
  const remaining = {};
  for (let i = 0; i < WORD_LENGTH; i++) {
    const l = targetLetters[i];
    if (l) remaining[l] = (remaining[l] || 0) + 1;
  }

  // Pass 2: yellows.
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === 'green') continue;
    const l = guessLetters[i];
    if (remaining[l] > 0) {
      result[i] = 'yellow';
      remaining[l]--;
    }
  }

  return result;
}

const RANK = { green: 2, yellow: 1, grey: 0 };

/**
 * Merges two color arrays position-by-position, keeping whichever color
 * ranks higher (green beats yellow beats grey). This is the "ambiguous
 * Wordle" trick that makes CrissleCrossle interesting: a tile can be green
 * because of the REAL answer, or because of the DECOY word, and the player
 * can't always tell which one caused it.
 */
function mergeColors(a, b) {
  return a.map((c, i) => (RANK[c] >= RANK[b[i]] ? c : b[i]));
}

/** Computes the final on-screen colors for one guess row. */
export function computeRowColors(guess, answer, decoy) {
  return mergeColors(colorsAgainst(guess, answer), colorsAgainst(guess, decoy));
}

// Ordinary conversational 5-letter words that show up constantly in chat
// chit-chat ("guess", "hello", "there", "first"...) and would otherwise get
// mistaken for deliberate guesses. Excluding this short list is a deliberate
// design trade-off: it costs a handful of legitimate answer words but
// removes the most common source of false-positive "guesses".
const CHAT_NOISE_WORDS = new Set([
  'guess', 'guess.', 'hello', 'there', 'where', 'which', 'their', 'would',
  'could', 'should', 'right', 'still', 'other', 'after', 'about', 'above',
  'first', 'great', 'every', 'maybe', 'think', 'video', 'super', 'doing',
  'going', 'being', 'while', 'again', 'watch', 'check', 'plzzz', 'pleas',
  'thank', 'sorry', 'today', 'later', 'never', 'these', 'those', 'youre',
]);

// The secret answer / decoy pool must NEVER include a word from the noise
// list above - otherwise a round could pick a secret word that viewers are
// structurally prevented from ever successfully guessing. This filtered
// pool (not the raw WORDS list) is what rounds actually draw from.
const PLAYABLE_WORDS = WORDS.filter((w) => !CHAT_NOISE_WORDS.has(w));

function pickWord(exclude = []) {
  const ex = new Set(exclude);
  let w;
  let guard = 0;
  do {
    w = PLAYABLE_WORDS[Math.floor(Math.random() * PLAYABLE_WORDS.length)];
    guard++;
  } while (ex.has(w) && guard < 200);
  return w;
}

/**
 * Pulls a 5-letter guess word out of a free-form chat message, while
 * deliberately erring on the side of NOT recognizing a message rather than
 * misreading ordinary chatter as a guess. TikTok comments are messy
 * ("ITS APPLE!!", "guess: apple", "apple?", "hi there how's it going") so:
 *   1. Very long messages (more than 6 words) are treated as chatter, not a
 *      one-word guess wrapped in a sentence.
 *   2. If MORE THAN ONE distinct 5-letter word appears, the message is
 *      ambiguous - we skip it rather than risk grabbing the wrong one
 *      (e.g. "guess: apple" contains both "guess" and "apple").
 *   3. Common conversational 5-letter words ("guess", "hello", "there"...)
 *      are ignored so ordinary chatting doesn't flood the board.
 */
export function extractGuessWord(text) {
  if (!text || typeof text !== 'string') return null;
  const tokens = text.match(/[a-zA-Z]+/g);
  if (!tokens || tokens.length === 0 || tokens.length > 6) return null;

  const fiveLetterTokens = [...new Set(tokens.filter((t) => t.length === WORD_LENGTH).map((t) => t.toLowerCase()))];
  if (fiveLetterTokens.length !== 1) return null;

  const candidate = fiveLetterTokens[0];
  if (CHAT_NOISE_WORDS.has(candidate)) return null;
  return candidate;
}

/**
 * Requirement: unlimited guesses, but only guesses that are an actual "fit"
 * (a real word from our dictionary) get tested and added to the board.
 * Random keyboard-mash or a 5-letter non-word never becomes a row.
 */
export function isAcceptableGuess(word) {
  return isKnownWord(word);
}

function scoreForSolve(attemptCountIncludingSolve) {
  const score = SOLVE_BASE_SCORE - SOLVE_SCORE_STEP * (attemptCountIncludingSolve - 1);
  return Math.max(SOLVE_SCORE_MIN, score);
}

/**
 * GameEngine holds one live round at a time plus the persistent leaderboard.
 * `onChange(reason)` is called after every mutation so the host layer can
 * decide what to broadcast.
 */
export class GameEngine {
  constructor({ onChange } = {}) {
    this.onChange = onChange || (() => {});
    this.difficultyKey = 'normal';
    this.leaderboard = new Map(); // username -> { username, score, solves }
    this.round = null;
    this.roundNumber = 0;
    this.tickTimer = null;
    this._nextRoundAt = null;
    this.nextRoundDelayMs = DEFAULT_NEXT_ROUND_DELAY_MS;
  }

  get difficulty() {
    return DIFFICULTIES[this.difficultyKey];
  }

  setDifficulty(key) {
    if (!DIFFICULTIES[key]) return;
    this.difficultyKey = key;
    this.onChange('difficulty');
  }

  /** Host-adjustable delay (in whole seconds) before the next round auto-starts. */
  setNextRoundDelay(seconds) {
    const n = Number(seconds);
    if (!Number.isFinite(n) || n < 1 || n > 600) return;
    this.nextRoundDelayMs = Math.round(n * 1000);
    this.onChange('settings');
  }

  /** Starts a fresh round, replacing any round currently in progress. */
  startRound() {
    this._clearTimers();
    this.roundNumber += 1;
    const d = this.difficulty;
    this.round = {
      number: this.roundNumber,
      answer: pickWord(),
      attempts: [], // { username, guess, colors, decoy, ts } - unlimited length
      hintEvery: d.hintEvery,
      hints: [], // revealed positions, e.g. [{ index, letter }]
      solved: false,
      solvedBy: null,
      startedAt: Date.now(),
      endsAt: Date.now() + d.roundSeconds * 1000,
      participants: new Set(),
      status: 'active', // active | solved | timeout | skipped | revealed
      revealAnswer: null, // set when round ends
    };
    this._nextRoundAt = null;
    this.tickTimer = setInterval(() => this._tick(), 1000);
    this.onChange('roundStart');
  }

  /** Ends the round early and schedules the next one (host "skip" action). */
  skipRound(status = 'skipped') {
    if (!this.round || this.round.status !== 'active') return;
    this._endRound(status);
  }

  /** Immediately reveals the answer to end the round (host action). */
  revealAnswer() {
    if (!this.round || this.round.status !== 'active') return;
    this._endRound('revealed');
  }

  /** Force-reveals the next hint letter (host action, independent of the timer). */
  giveHint() {
    if (!this.round || this.round.status !== 'active') return;
    this._revealNextHint();
    this.onChange('hint');
  }

  _revealNextHint() {
    const { answer, hints } = this.round;
    const revealedIdx = new Set(hints.map((h) => h.index));
    const candidates = [];
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (!revealedIdx.has(i)) candidates.push(i);
    }
    if (candidates.length <= 1) return; // never give away the whole word
    const idx = candidates[Math.floor(Math.random() * candidates.length)];
    hints.push({ index: idx, letter: answer[idx] });
  }

  // NOTE: this fires every second but deliberately does NOT call onChange()
  // for the common case. onChange() triggers a full state broadcast, which
  // the browser used to turn into a full board re-render every second -
  // that's what caused every tile to flicker non-stop. The on-screen
  // countdown is computed independently on the client from `endsAt`
  // (see public/app.js), so this timer only needs to broadcast when
  // something actually changes: a round ending or the next one starting.
  _tick() {
    if (!this.round) return;
    if (this.round.status === 'active') {
      if (Date.now() >= this.round.endsAt) {
        this._endRound('timeout');
      }
    } else if (this._nextRoundAt && Date.now() >= this._nextRoundAt) {
      this.startRound();
    }
  }

  _endRound(status) {
    this.round.status = status;
    this.round.revealAnswer = this.round.answer;
    this._nextRoundAt = Date.now() + this.nextRoundDelayMs;
    this.onChange('roundEnd');
  }

  _clearTimers() {
    if (this.tickTimer) clearInterval(this.tickTimer);
    this.tickTimer = null;
  }

  stop() {
    this._clearTimers();
  }

  _bumpScore(username, delta) {
    const key = username.toLowerCase();
    const existing = this.leaderboard.get(key) || { username, score: 0, solves: 0 };
    existing.score += delta;
    existing.username = username; // keep latest display casing
    this.leaderboard.set(key, existing);
  }

  getLeaderboardTop(n = 10) {
    return [...this.leaderboard.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, n);
  }

  resetLeaderboard() {
    this.leaderboard.clear();
    this.onChange('leaderboard');
  }

  /**
   * The heart of the game: called for EVERY chat message (real or simulated)
   * that has already been through diagnostics counting. Returns a small
   * result object describing what happened - the actual state change is
   * applied internally and broadcast via onChange.
   */
  submitGuess(username, rawText) {
    const guess = extractGuessWord(rawText);
    if (!guess) return { recognized: false };
    if (!this.round || this.round.status !== 'active') return { recognized: false, reason: 'no-active-round' };

    // Unlimited guessing, but only a real dictionary word is "fit" enough
    // to be tested against the answer and added to the board. A 5-letter
    // non-word is quietly ignored rather than wasting a board row.
    if (!isAcceptableGuess(guess)) return { recognized: false, reason: 'not-a-word' };

    const decoy = pickWord([this.round.answer, guess]);
    const colors = computeRowColors(guess, this.round.answer, decoy);
    const isCorrect = guess === this.round.answer;

    const attempt = {
      username,
      guess,
      decoy,
      colors,
      correct: isCorrect,
      ts: Date.now(),
    };
    this.round.attempts.push(attempt);

    const key = username.toLowerCase();
    if (!this.round.participants.has(key)) {
      this.round.participants.add(key);
      this._bumpScore(username, PARTICIPATION_SCORE);
    }

    if (isCorrect) {
      const bonus = scoreForSolve(this.round.attempts.length);
      this._bumpScore(username, bonus);
      const entry = this.leaderboard.get(key);
      if (entry) entry.solves = (entry.solves || 0) + 1;
      this.round.solved = true;
      this.round.solvedBy = username;
      this.round.solveBonus = bonus;
      this._endRound('solved');
      this.onChange('solved');
      return { recognized: true, correct: true, bonus };
    }

    // Reveal a hint every N attempts (unlimited guessing means this is the
    // only thing that paces the round besides the clock).
    if (this.round.attempts.length % this.round.hintEvery === 0) {
      this._revealNextHint();
    }

    this.onChange('attempt');
    return { recognized: true, correct: false };
  }

  /** Serializes state safely for the client - the secret answer is NEVER
   *  included unless the round has actually ended. */
  getPublicState() {
    const r = this.round;
    return {
      roundNumber: this.roundNumber,
      difficultyKey: this.difficultyKey,
      difficulty: this.difficulty,
      nextRoundDelayMs: this.nextRoundDelayMs,
      leaderboard: this.getLeaderboardTop(10),
      round: r && {
        number: r.number,
        attempts: r.attempts,
        hints: r.hints,
        wordLength: WORD_LENGTH,
        solved: r.solved,
        solvedBy: r.solvedBy,
        solveBonus: r.solveBonus,
        status: r.status,
        startedAt: r.startedAt,
        endsAt: r.endsAt,
        revealAnswer: r.status === 'active' ? null : r.revealAnswer,
        nextRoundAt: this._nextRoundAt,
      },
    };
  }
}

export { WORD_LENGTH, WORDS, PLAYABLE_WORDS, DEFAULT_NEXT_ROUND_DELAY_MS };
