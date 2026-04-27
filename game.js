const WINNING_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

const state = {
  board: Array(9).fill(null),
  current: 'X',
  scores: { X: 0, O: 0, draw: 0 },
  gameOver: false,
  mode: 'pvp'
};

const cells      = document.querySelectorAll('.cell');
const statusEl   = document.getElementById('status');
const xScoreEl   = document.getElementById('x-score');
const oScoreEl   = document.getElementById('o-score');
const drawScoreEl= document.getElementById('draw-score');
const scoreX     = document.getElementById('score-x');
const scoreO     = document.getElementById('score-o');

document.getElementById('reset-btn').addEventListener('click', newGame);
document.getElementById('reset-scores-btn').addEventListener('click', resetAll);
document.querySelectorAll('input[name="mode"]').forEach(r =>
  r.addEventListener('change', e => { state.mode = e.target.value; newGame(); })
);

cells.forEach(cell => cell.addEventListener('click', () => handleMove(+cell.dataset.index)));

function handleMove(idx) {
  if (state.gameOver || state.board[idx]) return;
  place(idx, state.current);

  const result = checkResult();
  if (result) { endGame(result); return; }

  state.current = state.current === 'X' ? 'O' : 'X';
  updateStatus();
  highlightActivePlayer();

  if (state.mode === 'ai' && state.current === 'O' && !state.gameOver) {
    setTimeout(aiMove, 350);
  }
}

function place(idx, player) {
  state.board[idx] = player;
  const cell = cells[idx];
  cell.textContent = player;
  cell.classList.add(player.toLowerCase());
  cell.disabled = true;
}

function checkResult() {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (state.board[a] && state.board[a] === state.board[b] && state.board[a] === state.board[c]) {
      return { winner: state.board[a], line };
    }
  }
  if (state.board.every(Boolean)) return { winner: null };
  return null;
}

function endGame(result) {
  state.gameOver = true;
  cells.forEach(c => c.disabled = true);

  if (result.winner) {
    result.line.forEach(i => cells[i].classList.add('winning'));
    state.scores[result.winner]++;
    updateScoreboard();
    statusEl.textContent = `${result.winner === 'O' && state.mode === 'ai' ? 'Gép' : result.winner} nyert!`;
    statusEl.classList.add('winner');
  } else {
    state.scores.draw++;
    drawScoreEl.textContent = state.scores.draw;
    statusEl.textContent = 'Döntetlen!';
    statusEl.classList.add('winner');
  }
}

function updateScoreboard() {
  xScoreEl.textContent = state.scores.X;
  oScoreEl.textContent = state.scores.O;
  drawScoreEl.textContent = state.scores.draw;
}

function updateStatus() {
  const label = (state.mode === 'ai' && state.current === 'O') ? 'Gép' : state.current;
  statusEl.textContent = `${label} játékos következik`;
  statusEl.classList.remove('winner');
}

function highlightActivePlayer() {
  scoreX.classList.toggle('active-player', state.current === 'X');
  scoreO.classList.toggle('active-player', state.current === 'O');
}

function newGame() {
  state.board.fill(null);
  state.current = 'X';
  state.gameOver = false;
  cells.forEach(cell => {
    cell.textContent = '';
    cell.className = 'cell';
    cell.disabled = false;
  });
  statusEl.classList.remove('winner');
  updateStatus();
  highlightActivePlayer();
}

function resetAll() {
  state.scores = { X: 0, O: 0, draw: 0 };
  updateScoreboard();
  newGame();
}

/* --- AI (minimax) --- */
function aiMove() {
  const idx = bestMove();
  handleMove(idx);
}

function bestMove() {
  let best = -Infinity, move = -1;
  for (let i = 0; i < 9; i++) {
    if (!state.board[i]) {
      state.board[i] = 'O';
      const score = minimax(state.board, 0, false);
      state.board[i] = null;
      if (score > best) { best = score; move = i; }
    }
  }
  return move;
}

function minimax(board, depth, isMax) {
  const winner = getWinner(board);
  if (winner === 'O') return 10 - depth;
  if (winner === 'X') return depth - 10;
  if (board.every(Boolean)) return 0;

  if (isMax) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'O';
        best = Math.max(best, minimax(board, depth + 1, false));
        board[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'X';
        best = Math.min(best, minimax(board, depth + 1, true));
        board[i] = null;
      }
    }
    return best;
  }
}

function getWinner(board) {
  for (const [a,b,c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

newGame();
