// Hand-picked tactical puzzles. Each has a winning line.
// { fen, solution: [uci-style moves], theme, hint }
const PUZZLES = [
  {
    fen: 'r1bqkbnr/ppp2ppp/2np4/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4',
    solution: ['f3e5','d6e5','d1h5'],
    theme: 'Fried Liver attack idea',
    hint: 'Strike at the weak f7 pawn — the knight sacrifice opens up mate threats.',
  },
  {
    fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',
    solution: ['a1a8'],
    theme: 'Back-rank mate',
    hint: 'The enemy king has no escape. Find the one move.',
  },
  {
    fen: 'r3k2r/pp3ppp/8/8/8/8/PP3PPP/R3K2R w KQkq - 0 1',
    solution: ['e1g1'],
    theme: 'Castling',
    hint: 'Time to get the king safe.',
  },
  {
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
    solution: ['f3g5'],
    theme: 'Fork attempt',
    hint: 'Threaten the weak f7 square with a knight leap.',
  },
  {
    fen: '2r3k1/5ppp/p7/1p6/8/1P6/P4PPP/3R2K1 w - - 0 1',
    solution: ['d1d8'],
    theme: 'Back-rank rook invasion',
    hint: 'Find the invading move. The 8th rank is weak.',
  },
  {
    fen: '4r1k1/ppp2ppp/8/8/8/8/PPP2PPP/4R1K1 w - - 0 1',
    solution: ['e1e8'],
    theme: 'Rook trade',
    hint: 'Simplify into an equal endgame.',
  },
  {
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    solution: ['g1f3'],
    theme: 'Opening development',
    hint: 'Develop a knight to a natural square.',
  },
];
window.PUZZLES = PUZZLES;

const UNICODE = {
  w: {k:'♔',q:'♕',r:'♖',b:'♗',n:'♘',p:'♙'},
  b: {k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'},
};

const $ = id => document.getElementById(id);
let game = null, puzzleIdx = 0, userMoves = [], selected = null, lastMove = null;
let solved = +localStorage.getItem('chess:solved')||0;
let streak = +localStorage.getItem('chess:streak')||0;

function loadPuzzle(i){
  puzzleIdx = i % PUZZLES.length;
  const p = PUZZLES[puzzleIdx];
  game = new Chess(p.fen);
  userMoves = [];
  selected = null; lastMove = null;
  $('puzzle-num').textContent = puzzleIdx+1;
  $('puzzle-side').textContent = (game.turn === 'w' ? 'White' : 'Black') + ' to move';
  $('puzzle-hint').textContent = p.theme;
  $('feedback').className = 'feedback'; $('feedback').textContent = '';
  $('next-btn').disabled = true;
  render();
  renderMoves();
}

function render(){
  const board = $('board');
  board.innerHTML = '';
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    const sq = document.createElement('div');
    sq.className = `square ${(r+c)%2===0?'light':'dark'}`;
    sq.dataset.r = r; sq.dataset.c = c;
    const p = game.board[r][c];
    if(p) sq.innerHTML = `<span class="piece">${UNICODE[p.color][p.type]}</span>`;
    if(c===0) sq.innerHTML += `<span class="coord rank">${8-r}</span>`;
    if(r===7) sq.innerHTML += `<span class="coord file">${String.fromCharCode(97+c)}</span>`;
    if(lastMove && ((lastMove.from[0]===r&&lastMove.from[1]===c) || (lastMove.to[0]===r&&lastMove.to[1]===c))) sq.classList.add('last');
    if(selected && selected[0]===r && selected[1]===c) sq.classList.add('selected');
    if(selected){
      const legal = game.legalMoves().filter(m => m.from[0]===selected[0] && m.from[1]===selected[1] && m.to[0]===r && m.to[1]===c);
      if(legal.length){ sq.classList.add('legal'); if(legal[0].capture) sq.classList.add('capture'); }
    }
    if(p && p.type==='k' && p.color===game.turn && game.isInCheck(game.turn)) sq.classList.add('check');
    sq.onclick = () => handleClick(r,c);
    board.appendChild(sq);
  }
}
function renderMoves(){
  const ml = $('move-list');
  if(!userMoves.length) ml.innerHTML = '<span class="empty">No moves yet…</span>';
  else ml.innerHTML = userMoves.map((m,i) => `<span class="move ${m.correct?'correct':''}">${i+1}. ${m.san}</span>`).join('');
}

function handleClick(r,c){
  if($('next-btn').disabled === false) return;
  const p = game.board[r][c];
  if(selected){
    if(selected[0]===r && selected[1]===c){ selected=null; render(); return; }
    const legal = game.legalMoves().filter(m => m.from[0]===selected[0] && m.from[1]===selected[1] && m.to[0]===r && m.to[1]===c);
    if(legal.length){
      let move = legal[0];
      if(move.promotion){ // auto-queen for simplicity
        move = legal.find(m => m.promotion === 'q') || move;
      }
      playMove(move);
      return;
    }
  }
  if(p && p.color === game.turn){ selected = [r,c]; render(); }
  else { selected = null; render(); }
}

function moveToUCI(m){
  const from = game.rcToSq(m.from);
  const to = game.rcToSq(m.to);
  return from + to + (m.promotion || '');
}

function playMove(move){
  const uci = moveToUCI(move);
  const san = game.san(move);
  const expected = PUZZLES[puzzleIdx].solution[userMoves.filter(m=>m.byPlayer).length];
  const correct = uci === expected;

  game.apply(move);
  lastMove = move; selected = null;
  userMoves.push({san, uci, correct, byPlayer:true});
  render(); renderMoves();

  if(!correct){
    showFeedback('Not the best move. Try again.', 'bad');
    streak = 0; localStorage.setItem('chess:streak',streak); $('streak').textContent = streak;
    // revert
    setTimeout(()=>{
      const p = PUZZLES[puzzleIdx];
      game = new Chess(p.fen);
      userMoves = userMoves.slice(0,-1);
      lastMove = null;
      render(); renderMoves();
      $('feedback').textContent = ''; $('feedback').className = 'feedback';
    }, 1200);
    return;
  }

  const sol = PUZZLES[puzzleIdx].solution;
  const playerCount = userMoves.filter(m=>m.byPlayer).length;
  if(playerCount >= Math.ceil(sol.length/2) && playerCount*2-1 >= sol.length-1 || playerCount === sol.length){
    // puzzle solved
    showFeedback('✓ Solved! Nice.', 'good');
    solved++; streak++;
    localStorage.setItem('chess:solved',solved); localStorage.setItem('chess:streak',streak);
    $('solved').textContent = solved; $('streak').textContent = streak;
    $('next-btn').disabled = false;
    return;
  }
  // Opponent response
  setTimeout(()=>{
    const respUci = sol[playerCount*2 - 1] || sol[playerCount];
    if(!respUci){
      showFeedback('✓ Solved!', 'good');
      $('next-btn').disabled = false;
      return;
    }
    const legal = game.legalMoves();
    const respMove = legal.find(m => moveToUCI(m) === respUci);
    if(respMove){
      const san = game.san(respMove);
      game.apply(respMove);
      lastMove = respMove;
      userMoves.push({san, uci:respUci, correct:true, byPlayer:false});
      render(); renderMoves();
    } else {
      // No matching opponent move — puzzle complete
      showFeedback('✓ Solved!', 'good');
      $('next-btn').disabled = false;
    }
  }, 500);
}

function showFeedback(msg, kind){
  const f = $('feedback');
  f.textContent = msg;
  f.className = 'feedback ' + kind;
}

$('next-btn').onclick = () => loadPuzzle(puzzleIdx+1);
$('reset-btn').onclick = () => loadPuzzle(puzzleIdx);
$('hint-btn').onclick = () => {
  const p = PUZZLES[puzzleIdx];
  showFeedback(p.hint, 'good');
  streak = 0; localStorage.setItem('chess:streak',streak); $('streak').textContent = streak;
};

$('solved').textContent = solved;
$('streak').textContent = streak;
loadPuzzle(0);
