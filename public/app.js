// ============================================================================
// CrissleCrossle LIVE - front-end
// Renders whatever the server sends. All game logic lives server-side; this
// file is purely presentation + host input wiring.
// ============================================================================

(function () {
  'use strict';

  // --------------------------------------------------------------------
  // Mobile viewport height fix: measure the REAL visible height instead
  // of trusting raw 100vh, which lies on mobile browsers because of the
  // address bar. Re-measured on resize/orientation change.
  // --------------------------------------------------------------------
  function setAppHeight() {
    document.documentElement.style.setProperty('--app-height', window.innerHeight + 'px');
  }
  setAppHeight();
  window.addEventListener('resize', setAppHeight);
  window.addEventListener('orientationchange', setAppHeight);

  // --------------------------------------------------------------------
  // DOM references
  // --------------------------------------------------------------------
  const el = (id) => document.getElementById(id);

  const diagToggle = el('diagToggle');
  const diagPanel = el('diagPanel');
  const diagDot = el('diagDot');
  const diagSummary = el('diagSummary');
  const diagConnState = el('diagConnState');
  const diagSignKey = el('diagSignKey');
  const diagEvents = el('diagEvents');
  const diagRecognized = el('diagRecognized');
  const diagLast = el('diagLast');
  const diagRawSamples = el('diagRawSamples');
  const diagErrors = el('diagErrors');

  const roundPill = el('roundPill');
  const difficultyPill = el('difficultyPill');
  const timerBar = el('timerBar');
  const timerText = el('timerText');

  const board = el('board');
  const boardEmpty = el('boardEmpty');
  const roundBanner = el('roundBanner');
  const hintsRow = el('hintsRow');
  const hintsTiles = el('hintsTiles');

  const leaderboardList = el('leaderboardList');
  const chatFeed = el('chatFeed');

  const hostFab = el('hostFab');
  const hostPanelOverlay = el('hostPanelOverlay');
  const hostPanelClose = el('hostPanelClose');

  const tiktokUsernameInput = el('tiktokUsernameInput');
  const connectBtn = el('connectBtn');
  const disconnectBtn = el('disconnectBtn');
  const testModeToggle = el('testModeToggle');

  const startRoundBtn = el('startRoundBtn');
  const skipRoundBtn = el('skipRoundBtn');
  const hintBtn = el('hintBtn');
  const revealBtn = el('revealBtn');
  const difficultySelect = el('difficultySelect');
  const nextRoundDelaySelect = el('nextRoundDelaySelect');
  const resetLeaderboardBtn = el('resetLeaderboardBtn');

  const hostSayInput = el('hostSayInput');
  const hostSayBtn = el('hostSayBtn');

  const howToPlayBtn = el('howToPlayBtn');
  const howToPlayModal = el('howToPlayModal');
  const howToPlayClose = el('howToPlayClose');

  const MAX_DISPLAYED_ROWS = 60; // unlimited guesses server-side; the board only *renders* the most recent N for a smooth UI

  // --------------------------------------------------------------------
  // Diagnostics ribbon toggle
  // --------------------------------------------------------------------
  diagToggle.addEventListener('click', () => diagPanel.classList.toggle('hidden'));

  // --------------------------------------------------------------------
  // Host control panel: opened on demand from the floating button, closed
  // by the X, tapping the backdrop, or Escape. Nothing about it occupies
  // permanent screen space, so the board stays uncluttered by default.
  // --------------------------------------------------------------------
  function openHostPanel() { hostPanelOverlay.classList.remove('hidden'); }
  function closeHostPanel() { hostPanelOverlay.classList.add('hidden'); }
  hostFab.addEventListener('click', openHostPanel);
  hostPanelClose.addEventListener('click', closeHostPanel);
  hostPanelOverlay.addEventListener('click', (e) => {
    if (e.target === hostPanelOverlay) closeHostPanel();
  });

  // --------------------------------------------------------------------
  // How to Play modal
  // --------------------------------------------------------------------
  function openHowToPlay() {
    howToPlayModal.classList.remove('hidden');
  }
  function closeHowToPlay() {
    howToPlayModal.classList.add('hidden');
  }
  howToPlayBtn.addEventListener('click', openHowToPlay);
  howToPlayClose.addEventListener('click', closeHowToPlay);
  howToPlayModal.addEventListener('click', (e) => {
    if (e.target === howToPlayModal) closeHowToPlay();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeHowToPlay();
      closeHostPanel();
    }
  });

  // Build the worked example in the modal using the SAME tile markup as the
  // real board, so it's a live, on-brand example rather than a static image.
  (function buildExample() {
    const guessTiles = el('exampleGuessTiles');
    const decoyTiles = el('exampleDecoyTiles');
    const guess = ['c', 'l', 'a', 'i', 'm'];
    const guessColors = ['green', 'yellow', 'grey', 'yellow', 'green'];
    const decoy = ['c', 'r', 'i', 'm', 'e'];
    guess.forEach((letter, i) => {
      const t = document.createElement('div');
      t.className = `tile tile-${guessColors[i]}`;
      t.textContent = letter;
      guessTiles.appendChild(t);
    });
    decoy.forEach((letter) => {
      const t = document.createElement('div');
      t.className = 'tile tile-decoy';
      t.textContent = letter;
      decoyTiles.appendChild(t);
    });
  })();

  // --------------------------------------------------------------------
  // Socket.io connection
  // --------------------------------------------------------------------
  const socket = io();

  socket.on('state:full', (state) => {
    renderDiagnostics(state.diagnostics);
    renderTiktokStatus(state.tiktokStatus);
    renderGame(state.game);
    diagSignKey.textContent = state.signKeyConfigured ? 'yes ✅' : 'NO ⚠️ (see setup step 4)';
    testModeToggle.checked = !!state.testModeActive;
    if (state.game && state.game.difficultyKey) difficultySelect.value = state.game.difficultyKey;
    if (state.game && state.game.nextRoundDelayMs) {
      nextRoundDelaySelect.value = String(Math.round(state.game.nextRoundDelayMs / 1000));
    }
  });

  socket.on('game:update', renderGame);
  socket.on('diagnostics:update', renderDiagnostics);
  socket.on('tiktok:status', renderTiktokStatus);
  socket.on('testMode:status', (s) => { testModeToggle.checked = !!s.active; });
  socket.on('chat:new', appendChatLine);

  socket.on('connect_error', () => {
    diagSummary.textContent = 'Cannot reach the server socket. Reload the page.';
  });

  // --------------------------------------------------------------------
  // Diagnostics rendering
  // --------------------------------------------------------------------
  function renderDiagnostics(d) {
    if (!d) return;
    diagEvents.textContent = d.eventsReceived;
    diagRecognized.textContent = d.recognizedCount;
    diagSummary.textContent = `Events: ${d.eventsReceived} · Accepted: ${d.recognizedCount}`;

    if (d.lastReceived) {
      const { username, text, source } = d.lastReceived;
      diagLast.textContent = `[${source}] ${username}: ${truncate(text, 80)}`;
    }

    if (d.rawSamples && d.rawSamples.length) {
      diagRawSamples.textContent = d.rawSamples.map((s) => `--- ${s.eventName} ---\n${s.text}`).join('\n\n');
    }

    diagErrors.textContent = d.errors && d.errors.length
      ? d.errors.map((e) => `[${new Date(e.ts).toLocaleTimeString()}] ${e.context}: ${e.message}`).join('\n')
      : 'No errors logged.';

    if (d.connection) renderTiktokStatus(d.connection);
  }

  function renderTiktokStatus(status) {
    if (!status) return;
    diagConnState.textContent = `${status.state}${status.username ? ' (@' + status.username + ')' : ''} - ${status.message || ''}`;
    diagDot.className = 'status-dot status-' + (status.state || 'idle');
  }

  // --------------------------------------------------------------------
  // Chat feed
  // --------------------------------------------------------------------
  const MAX_CHAT_LINES = 40;
  function appendChatLine(msg) {
    const empty = chatFeed.querySelector('.empty-note');
    if (empty) empty.remove();

    const line = document.createElement('div');
    line.className = `chat-line source-${msg.source}`;
    const userSpan = document.createElement('span');
    userSpan.className = 'cu';
    userSpan.textContent = msg.username + ': ';
    line.appendChild(userSpan);
    line.appendChild(document.createTextNode(msg.text));
    chatFeed.appendChild(line);

    while (chatFeed.children.length > MAX_CHAT_LINES) chatFeed.removeChild(chatFeed.firstChild);
    chatFeed.scrollTop = chatFeed.scrollHeight;
  }

  // --------------------------------------------------------------------
  // Game state rendering
  // --------------------------------------------------------------------
  let tickerInterval = null;
  // Fingerprint of the last attempts array we actually rendered, so a
  // broadcast that doesn't change the attempts (e.g. a difficulty change)
  // never rebuilds - and re-triggers CSS animations on - tiles that were
  // already on screen. This is the fix for the "letters keep flickering"
  // bug: previously the board was fully rebuilt on every state push.
  let lastRenderedRoundNumber = null;
  let lastRenderedAttemptCount = 0;

  function renderGame(game) {
    if (!game) return;

    roundPill.textContent = game.roundNumber ? `Round ${game.roundNumber}` : 'Round —';
    if (game.difficulty) difficultyPill.textContent = game.difficulty.label;

    renderLeaderboard(game.leaderboard || []);

    const round = game.round;

    if (!round) {
      boardEmpty.classList.remove('hidden');
      board.querySelectorAll('.attempt-row').forEach((n) => n.remove());
      roundBanner.classList.add('hidden');
      hintsRow.classList.add('hidden');
      stopTicker();
      timerText.textContent = '--';
      timerBar.style.width = '0%';
      lastRenderedRoundNumber = null;
      lastRenderedAttemptCount = 0;
      return;
    }

    boardEmpty.classList.add('hidden');

    const isNewRound = round.number !== lastRenderedRoundNumber;
    const attemptCountChanged = round.attempts.length !== lastRenderedAttemptCount;

    // Only touch the board DOM when the round changed or new attempts came
    // in - never on an unrelated broadcast (difficulty change, settings
    // change, etc.), so existing tiles are never re-animated needlessly.
    if (isNewRound || attemptCountChanged) {
      renderBoard(round, isNewRound);
      lastRenderedRoundNumber = round.number;
      lastRenderedAttemptCount = round.attempts.length;
    }

    renderHints(round);
    renderBanner(round);
    startTicker(round);
  }

  function renderBoard(round, fullRebuild) {
    if (fullRebuild) {
      board.querySelectorAll('.attempt-row').forEach((n) => n.remove());
      const attempts = round.attempts.slice(-MAX_DISPLAYED_ROWS).reverse();
      for (const attempt of attempts) board.appendChild(buildAttemptRow(attempt, false));
      return;
    }
    // Same round, just new attempt(s): insert only the new rows at the top
    // instead of rebuilding everything, so existing tiles are never
    // recreated (and never re-trigger their entrance animation).
    const freshOnes = round.attempts.slice(lastRenderedAttemptCount);
    for (const attempt of freshOnes.slice().reverse()) {
      board.insertBefore(buildAttemptRow(attempt, true), board.firstChild);
    }
    // Trim overly long boards for performance.
    while (board.querySelectorAll('.attempt-row').length > MAX_DISPLAYED_ROWS) {
      board.removeChild(board.lastChild);
    }
  }

  function buildAttemptRow(attempt, animateIn) {
    const row = document.createElement('div');
    row.className = 'attempt-row' + (attempt.correct ? ' attempt-correct' : '');

    const userDiv = document.createElement('div');
    userDiv.className = 'attempt-user';
    userDiv.textContent = attempt.username;
    row.appendChild(userDiv);

    const guessSet = document.createElement('div');
    guessSet.className = 'tile-set';
    for (let i = 0; i < attempt.guess.length; i++) {
      const tile = document.createElement('div');
      tile.className = `tile tile-${attempt.colors[i]}` + (animateIn ? ' tile-new' : '');
      tile.textContent = attempt.guess[i];
      guessSet.appendChild(tile);
    }
    row.appendChild(guessSet);

    const decoySet = document.createElement('div');
    decoySet.className = 'tile-set';
    for (let i = 0; i < attempt.decoy.length; i++) {
      const tile = document.createElement('div');
      tile.className = 'tile tile-decoy' + (animateIn ? ' tile-new' : '');
      tile.textContent = attempt.decoy[i];
      decoySet.appendChild(tile);
    }
    row.appendChild(decoySet);

    return row;
  }

  function renderHints(round) {
    if (!round.hints || round.hints.length === 0) {
      hintsRow.classList.add('hidden');
      return;
    }
    hintsRow.classList.remove('hidden');
    hintsTiles.innerHTML = '';
    const sorted = [...round.hints].sort((a, b) => a.index - b.index);
    for (const h of sorted) {
      const tile = document.createElement('div');
      tile.className = 'hint-tile';
      tile.textContent = h.letter;
      tile.title = `Position ${h.index + 1}`;
      hintsTiles.appendChild(tile);
    }
  }

  let lastBannerStatus = null;
  function renderBanner(round) {
    if (round.status === 'active') {
      roundBanner.classList.add('hidden');
      lastBannerStatus = null;
      return;
    }
    const changed = lastBannerStatus !== `${round.number}:${round.status}`;
    roundBanner.classList.remove('hidden');

    if (round.status === 'solved') {
      roundBanner.className = 'round-banner win';
      const quickTag = round.quickSolve ? ' ⚡ Quick solve!' : '';
      roundBanner.textContent = `🎉 ${round.solvedBy} solved it! The word was "${(round.revealAnswer || '').toUpperCase()}" (+${round.solveBonus} pts).${quickTag} Next round starting soon…`;
      if (changed) fireConfetti();
    } else {
      roundBanner.className = 'round-banner lose';
      const reason = round.status === 'timeout' ? 'Time ran out!' : 'Round ended.';
      roundBanner.textContent = `${reason} The word was "${(round.revealAnswer || '').toUpperCase()}". Next round starting soon…`;
    }
    lastBannerStatus = `${round.number}:${round.status}`;
  }

  function fireConfetti() {
    const colors = ['#ff3f9e', '#8a5cff', '#2fd4ff', '#4fae5c', '#dbb23e'];
    for (let i = 0; i < 18; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.background = colors[i % colors.length];
      piece.style.animationDelay = Math.random() * 0.3 + 's';
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      roundBanner.appendChild(piece);
      setTimeout(() => piece.remove(), 2200);
    }
  }

  function startTicker(round) {
    stopTicker();
    tickerInterval = setInterval(() => updateTimerDisplay(round), 250);
    updateTimerDisplay(round);
  }
  function stopTicker() {
    if (tickerInterval) clearInterval(tickerInterval);
    tickerInterval = null;
  }
  function updateTimerDisplay(round) {
    if (round.status === 'active') {
      const remainingMs = Math.max(0, round.endsAt - Date.now());
      const totalMs = round.endsAt - round.startedAt;
      const pct = totalMs > 0 ? Math.max(0, Math.min(100, (remainingMs / totalMs) * 100)) : 0;
      timerBar.style.width = pct + '%';
      timerText.textContent = `${Math.ceil(remainingMs / 1000)}s`;
    } else if (round.nextRoundAt) {
      const remainingMs = Math.max(0, round.nextRoundAt - Date.now());
      timerBar.style.width = '100%';
      timerText.textContent = `next in ${Math.ceil(remainingMs / 1000)}s`;
      if (remainingMs <= 0) stopTicker();
    } else {
      timerText.textContent = '--';
    }
  }

  // --------------------------------------------------------------------
  // Leaderboard rendering
  // --------------------------------------------------------------------
  function renderLeaderboard(top) {
    leaderboardList.innerHTML = '';
    if (!top.length) {
      const li = document.createElement('li');
      li.className = 'empty-note';
      li.textContent = 'No scores yet - guesses earn points!';
      leaderboardList.appendChild(li);
      return;
    }
    const medals = ['🥇', '🥈', '🥉'];
    top.forEach((entry, i) => {
      const li = document.createElement('li');
      if (i === 0) li.classList.add('top1');
      if (i === 1) li.classList.add('top2');
      if (i === 2) li.classList.add('top3');
      const rank = document.createElement('span');
      rank.className = 'rank';
      rank.textContent = medals[i] || `${i + 1}.`;
      const name = document.createElement('span');
      name.textContent = entry.username;
      const score = document.createElement('span');
      score.className = 'lb-score';
      score.textContent = entry.score;
      const left = document.createElement('span');
      left.appendChild(rank);
      left.appendChild(name);
      li.appendChild(left);
      li.appendChild(score);
      leaderboardList.appendChild(li);
    });
  }

  // --------------------------------------------------------------------
  // Host control wiring
  // --------------------------------------------------------------------
  connectBtn.addEventListener('click', () => {
    const username = tiktokUsernameInput.value.trim();
    if (!username) { tiktokUsernameInput.focus(); return; }
    socket.emit('tiktok:connect', { username });
  });

  disconnectBtn.addEventListener('click', () => socket.emit('tiktok:disconnect'));

  testModeToggle.addEventListener('change', () => {
    socket.emit(testModeToggle.checked ? 'testMode:start' : 'testMode:stop');
  });

  startRoundBtn.addEventListener('click', () => socket.emit('host:startRound'));
  skipRoundBtn.addEventListener('click', () => socket.emit('host:skipRound'));
  hintBtn.addEventListener('click', () => socket.emit('host:giveHint'));
  revealBtn.addEventListener('click', () => socket.emit('host:revealAnswer'));
  resetLeaderboardBtn.addEventListener('click', () => {
    if (confirm('Reset the leaderboard for everyone? This cannot be undone.')) {
      socket.emit('host:resetLeaderboard');
    }
  });

  difficultySelect.addEventListener('change', () => {
    socket.emit('host:setDifficulty', { key: difficultySelect.value });
  });

  nextRoundDelaySelect.addEventListener('change', () => {
    socket.emit('host:setNextRoundDelay', { seconds: Number(nextRoundDelaySelect.value) });
  });

  function sendHostSay() {
    const text = hostSayInput.value.trim();
    if (!text) return;
    socket.emit('host:say', { text });
    hostSayInput.value = '';
    hostSayInput.focus();
  }
  hostSayBtn.addEventListener('click', sendHostSay);
  hostSayInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendHostSay(); });
  tiktokUsernameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') connectBtn.click(); });

  // --------------------------------------------------------------------
  // Small helpers
  // --------------------------------------------------------------------
  function truncate(str, n) {
    if (!str) return '';
    return str.length > n ? str.slice(0, n) + '…' : str;
  }
})();
