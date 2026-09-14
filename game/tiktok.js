// ============================================================================
// TikTok Live connection manager.
//
// Everything that can throw is wrapped in try/catch. Nothing in this file
// is allowed to crash the process - a bad or unexpected event should be
// logged to diagnostics and ignored, never take down the server.
// ============================================================================

import { TikTokLiveConnection, WebcastEvent, ControlEvent } from 'tiktok-live-connector';
import { extractChatFields } from './diagnostics.js';

const MAX_CONNECT_ATTEMPTS = 3;
const BACKOFF_MS = [2000, 5000, 10000]; // short backoff between retries

export class TikTokManager {
  /**
   * @param {object} opts
   * @param {import('./diagnostics.js').Diagnostics} opts.diagnostics
   * @param {(username:string, text:string, source:string) => void} opts.onComment
   * @param {(status:object) => void} opts.onStatus
   */
  constructor({ diagnostics, onComment, onStatus, signApiKey }) {
    this.diagnostics = diagnostics;
    this.onComment = onComment;
    this.onStatus = onStatus || (() => {});
    this.signApiKey = signApiKey || null;
    this.connection = null;
    this.desiredUsername = null;
    this.manuallyDisconnected = false;
    this._reconnecting = false;
  }

  get isConnected() {
    return !!this.connection && this.connection.isConnected;
  }

  /** Public entry point: (re)connect to a given TikTok @username. */
  async connect(username) {
    this.manuallyDisconnected = false;
    this.desiredUsername = normalizeUsername(username);
    await this._connectWithRetry(this.desiredUsername);
  }

  disconnect() {
    this.manuallyDisconnected = true;
    try {
      if (this.connection) this.connection.disconnect();
    } catch (err) {
      this.diagnostics.logError('tiktok.disconnect', err);
    }
    this._setStatus('idle', 'Disconnected.');
  }

  _setStatus(state, message, attempt = 0) {
    this.diagnostics.setConnectionState(state, message, attempt, this.desiredUsername);
    this.onStatus(this.diagnostics.connection);
  }

  async _connectWithRetry(username) {
    for (let attempt = 1; attempt <= MAX_CONNECT_ATTEMPTS; attempt++) {
      if (this.manuallyDisconnected) return;
      this._setStatus('connecting', `Connecting to @${username} (attempt ${attempt}/${MAX_CONNECT_ATTEMPTS})...`, attempt);
      try {
        await this._attemptConnectOnce(username);
        this._setStatus('connected', `Connected to @${username}.`);
        return; // success
      } catch (err) {
        this.diagnostics.logError('tiktok.connect', err);
        const isLastAttempt = attempt === MAX_CONNECT_ATTEMPTS;
        if (isLastAttempt) {
          this._setStatus('error', friendlyConnectError(err, username));
          return;
        }
        const wait = BACKOFF_MS[attempt - 1] || 8000;
        this._setStatus('connecting', `Attempt ${attempt} failed (${friendlyConnectError(err, username)}). Retrying in ${Math.round(wait / 1000)}s...`, attempt);
        await sleep(wait);
      }
    }
  }

  async _attemptConnectOnce(username) {
    // Tear down any previous connection first.
    if (this.connection) {
      try { this.connection.disconnect(); } catch (_) { /* ignore */ }
      this.connection = null;
    }

    const options = {};
    if (this.signApiKey) options.signApiKey = this.signApiKey;

    const connection = new TikTokLiveConnection(username, options);
    this.connection = connection;

    // ---- Step 1: log the FULL raw shape of the first few events ----------
    connection.on(ControlEvent.DECODED_DATA, (eventName, decodedData) => {
      try {
        if (this.diagnostics.rawSamples.length < 6) {
          this.diagnostics.recordRawSample(String(eventName), decodedData);
        }
      } catch (err) {
        this.diagnostics.logError('tiktok.decodedData', err);
      }
    });

    // ---- Step 2 + 3: fallback-chain field extraction on every chat msg ----
    connection.on(WebcastEvent.CHAT, (data) => {
      try {
        const { username: user, text } = extractChatFields(data);
        this.onComment(user, text, 'tiktok');
      } catch (err) {
        this.diagnostics.logError('tiktok.chatHandler', err);
      }
    });

    connection.on(ControlEvent.ERROR, (info) => {
      try {
        this.diagnostics.logError('tiktok.controlError', (info && info.exception) || info);
      } catch (_) { /* ignore */ }
    });

    connection.on(WebcastEvent.STREAM_END, () => {
      try {
        this._setStatus('idle', 'The TikTok LIVE stream ended.');
      } catch (_) { /* ignore */ }
    });

    connection.on(ControlEvent.DISCONNECTED, () => {
      try {
        if (this.manuallyDisconnected || this._reconnecting) return;
        this._reconnecting = true;
        this._setStatus('reconnecting', 'Connection dropped. Reconnecting...');
        this._connectWithRetry(this.desiredUsername).finally(() => {
          this._reconnecting = false;
        });
      } catch (err) {
        this.diagnostics.logError('tiktok.disconnectedHandler', err);
      }
    });

    await connection.connect();
  }
}

function normalizeUsername(username) {
  return String(username || '').trim().replace(/^@/, '');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function friendlyConnectError(err, username) {
  const msg = (err && err.message) || String(err);
  if (/offline|not.*live|UserOfflineError/i.test(msg)) {
    return `@${username} does not look like they're LIVE right now.`;
  }
  if (/not found|does not exist/i.test(msg)) {
    return `Couldn't find a TikTok account called @${username}.`;
  }
  if (/rate.?limit/i.test(msg)) {
    return 'Rate-limited by the signing service. Add a sign-in key (see setup) or wait a bit.';
  }
  if (/sign/i.test(msg)) {
    return 'The signing service rejected the connection. Double-check your sign API key.';
  }
  return msg || 'Unknown connection error.';
}
