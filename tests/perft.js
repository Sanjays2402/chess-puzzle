// Perft: enumerate move tree and count leaf nodes at given depth.
// This is the canonical correctness test for chess move generators:
// if our counts match published reference values for these positions,
// the legal-move generator is provably correct for all pieces, castling,
// en passant, promotion, check, and pin handling.
//
// Reference values: https://www.chessprogramming.org/Perft_Results
//
// Run:  node tests/perft.js

const Chess = require('../chess.js');

function perft(game, depth) {
  if (depth === 0) return 1;
  const moves = game.legalMoves();
  if (depth === 1) return moves.length;
  let nodes = 0;
  for (const m of moves) {
    const snap = game.snap();
    game.apply(m);
    nodes += perft(game, depth - 1);
    game.restore(snap);
  }
  return nodes;
}

// Each case: [name, FEN, [depth1, depth2, depth3, ...]] reference node counts.
const CASES = [
  [
    'Initial position',
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    [20, 400, 8902, 197281],
  ],
  [
    'Kiwipete (Peter McKenzie, dense tactics)',
    'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1',
    [48, 2039, 97862],
  ],
  [
    'Position 3 (en passant + promotion stress)',
    '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1',
    [14, 191, 2812, 43238],
  ],
  [
    'Position 4 (mirror; checks & promotions)',
    'r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1',
    [6, 264, 9467],
  ],
  [
    'Position 5 (tricky castling rights on capture)',
    'rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8',
    [44, 1486, 62379],
  ],
];

let pass = 0;
let fail = 0;
const start = Date.now();

for (const [name, fen, expected] of CASES) {
  console.log(`\n${name}`);
  console.log(`  fen: ${fen}`);
  for (let d = 1; d <= expected.length; d++) {
    const game = new Chess(fen);
    const t0 = Date.now();
    const got = perft(game, d);
    const dt = Date.now() - t0;
    const want = expected[d - 1];
    const ok = got === want;
    if (ok) pass++; else fail++;
    const tag = ok ? '\u2713' : '\u2717';
    console.log(
      `  ${tag} depth ${d}: got ${got.toLocaleString()} want ${want.toLocaleString()}  (${dt}ms)`
    );
    if (!ok) break; // deeper depths inherit the bug; stop drilling.
  }
}

const total = Date.now() - start;
console.log(`\n${pass} passed, ${fail} failed in ${total}ms`);
process.exit(fail ? 1 : 0);
