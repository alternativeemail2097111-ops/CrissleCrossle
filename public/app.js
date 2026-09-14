// ============================================================================
// CrissleCrossle LIVE - front-end
// Renders whatever the server sends. All game logic lives server-side; this
// file is purely presentation + host input wiring.
// ============================================================================

(function () {
  'use strict';

  // --------------------------------------------------------------------
  // Requirement #7: real mobile viewport height, not raw 100vh.
  // Mobile browser chrome (address bar, etc.) makes 100vh lie about how
  // much space is actually visible. We measure window.innerHeight and
  // re-measure on resize/orientation change/keyboard open.
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

  const hostBar = el('hostBar');
  const hostBarHandle = el('hostBarHandle');
  const hostBarHandleText = el('hostBarHandleText');

  const tiktokUsernameInput = el('tiktokUsernameInput');
  const connectBtn = el('connectBtn');
  const disconnectBtn = el('disconnectBtn');
  const testModeToggle = el('testModeToggle');

  const startRoundBtn = el('startRoundBtn');
  const skipRoundBtn = el('skipRoundBtn');
  const hintBtn = el('hintBtn');
  const revealBtn = el('revealBtn');
  const difficultySelect = el('difficultySelect');
  const resetLeaderboardBtn = el('resetLeaderboardBtn');

  const hostSayInput = el('hostSayInput');
  const hostSayBtn = el('hostSayBtn');

  // --------------------------------------------------------------------
  // Diagnostics ribbon toggle
  // --------------------------------------------------------------------
  diagToggle.addEventListener('click', () => {
    diagPanel.classList.toggle('hidden');
  });

  // --------------------------------------------------------------------
  // Host control bar collapse/expand drawer (mobile only - CSS makes the
  // handle invisible on wider screens where the bar is always fully shown).
  // --------------------------------------------------------------------
  hostBarHandle.addEventListener('click', () => {
    const expanded = hostBar.classList.toggle('expanded');
    hostBarHandleText.textContent = expanded ? '▼ Hide Controls' : '▲ Host Controls';
  });

  // --------------------------------------------------------------------
  // Socket.io connection
  // --------------------------------------------------------------------
  const socket = io();

  let lastKnownRound = null;

  socket.on('state:full', (state) => {
    renderDiagnostics(state.diagnostics);
    renderTiktokStatus(state.tiktokStatus);
    renderGame(state.game);
    diagSignKey.textContent = state.signKeyConfigured ? 'yes ✅' : 'NO ⚠️ (see setup step 4)';
    testModeToggle.checked = !!state.testModeActive;
    if (state.game && state.game.difficultyKey) difficultySelect.value = state.game.difficultyKey;
  });

  socket.on('game:update', renderGame);
  socket.on('diagnostics:update', renderDiagnostics);
  socket.on('tiktok:status', renderTiktokStatus);
  socket.on('testMode:status', (s) => { testModeToggle.checked = !!s.active; });
  socket.on('chat:new', appendChatLine);

  socket.on('connect_error', (err) => {
    diagSummary.textContent = 'Cannot reach the server socket. Reload the page.';
  });

  // --------------------------------------------------------------------
  // Diagnostics rendering
  // --------------------------------------------------------------------
  function renderDiagnostics(d) {
    if (!d) return;
    diagEvents.textContent = d.eventsReceived;
    diagRecognized.textContent = d.recognizedCount;
    diagSummary.textContent = `Events: ${d.eventsReceived} · Recognized: ${d.recognizedCount}`;

    if (d.lastReceived) {
      const { username, text, source } = d.lastReceived;
      diagLast.textContent = `[${source}] ${username}: ${truncate(text, 80)}`;
    }

    if (d.rawSamples && d.rawSamples.length) {
      diagRawSamples.textContent = d.rawSamples
        .map((s) => `--- ${s.eventName} ---\n${s.text}`)
        .join('\n\n');
    }

    if (d.errors && d.errors.length) {
      diagErrors.textContent = d.errors
        .map((e) => `[${new Date(e.ts).toLocaleTimeString()}] ${e.context}: ${e.message}`)
        .join('\n');
    } else {
      diagErrors.textContent = 'No errors logged.';
    }

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
    const classes = ['chat-line', `source-${msg.source}`];
    line.className = classes.join(' ');
    const userSpan = document.createElement('span');
    userSpan.className = 'cu';
    userSpan.textContent = msg.username + ': ';
    line.appendChild(userSpan);
    line.appendChild(document.createTextNode(msg.text));
    chatFeed.appendChild(line);

    while (chatFeed.children.length > MAX_CHAT_LINES) {
      chatFeed.removeChild(chatFeed.firstChild);
    }
    chatFeed.scrollTop = chatFeed.scrollHeight;
  }

  // --------------------------------------------------------------------
  // Game state rendering
  // --------------------------------------------------------------------
  let tickerInterval = null;

  function renderGame(game) {
    if (!game) return;

    roundPill.textContent = game.roundNumber ? `Round ${game.roundNumber}` : 'Round —';
    if (game.difficulty) difficultyPill.textContent = game.difficulty.label;

    renderLeaderboard(game.leaderboard || []);

    const round = game.round;
    lastKnownRound = round;

    if (!round) {
      boardEmpty.classList.remove('hidden');
      board.querySelectorAll('.attempt-row').forEach((n) => n.remove());
      roundBanner.classList.add('hidden');
      hintsRow.classList.add('hidden');
      stopTicker();
      timerText.textContent = '--';
      timerBar.style.width = '0%';
      return;
    }

    boardEmpty.classList.add('hidden');
    renderBoard(round);
    renderHints(round);
    renderBanner(round);
    startTicker(round);
  }

  function renderBoard(round) {
    // Simple full re-render - attempt counts per round are small (<= 12),
    // so this stays cheap and keeps the code easy to reason about.
    board.querySelectorAll('.attempt-row').forEach((n) => n.remove());

    // Newest attempt first, so the most recent action is always visible
    // without needing to scroll on a small phone screen.
    const attempts = [...round.attempts].reverse();
    for (const attempt of attempts) {
      board.appendChild(buildAttemptRow(attempt));
    }
  }

  function buildAttemptRow(attempt) {
    const row = document.createElement('div');
    row.className = 'attempt-row';

    const userDiv = document.createElement('div');
    userDiv.className = 'attempt-user';
    userDiv.textContent = attempt.username;
    row.appendChild(userDiv);

    const guessSet = document.createElement('div');
    guessSet.className = 'tile-set';
    for (let i = 0; i < attempt.guess.length; i++) {
      const tile = document.createElement('div');
      tile.className = `tile tile-${attempt.colors[i]}`;
      tile.textContent = attempt.guess[i];
      guessSet.appendChild(tile);
    }
    row.appendChild(guessSet);

    const decoySet = document.createElement('div');
    decoySet.className = 'tile-set';
    for (let i = 0; i < attempt.decoy.length; i++) {
      const tile = document.createElement('div');
      tile.className = 'tile tile-decoy';
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

  function renderBanner(round) {
    if (round.status === 'active') {
      roundBanner.classList.add('hidden');
      return;
    }
    roundBanner.classList.remove('hidden');
    if (round.status === 'solved') {
      roundBanner.className = 'round-banner win';
      roundBanner.textContent = `🎉 ${round.solvedBy} solved it! The word was "${(round.revealAnswer || '').toUpperCase()}" (+${round.solveBonus} pts). Next round starting soon…`;
    } else {
      roundBanner.className = 'round-banner lose';
      const reason = round.status === 'timeout' ? 'Time ran out!' : round.status === 'exhausted' ? 'Out of attempts!' : 'Round ended.';
      roundBanner.textContent = `${reason} The word was "${(round.revealAnswer || '').toUpperCase()}". Next round starting soon…`;
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
    top.forEach((entry, i) => {
      const li = document.createElement('li');
      if (i === 0) li.classList.add('top1');
      if (i === 1) li.classList.add('top2');
      if (i === 2) li.classList.add('top3');
      const rank = document.createElement('span');
      rank.className = 'rank';
      rank.textContent = `${i + 1}.`;
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
    if (!username) {
      tiktokUsernameInput.focus();
      return;
    }
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

  function sendHostSay() {
    const text = hostSayInput.value.trim();
    if (!text) return;
    socket.emit('host:say', { text });
    hostSayInput.value = '';
    hostSayInput.focus();
  }
  hostSayBtn.addEventListener('click', sendHostSay);
  hostSayInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendHostSay();
  });
  tiktokUsernameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') connectBtn.click();
  });

  // --------------------------------------------------------------------
  // Small helpers
  // --------------------------------------------------------------------
  function truncate(str, n) {
    if (!str) return '';
    return str.length > n ? str.slice(0, n) + '…' : str;
  }
})();
