# ♟️ Chess Puzzle

A tactics trainer with a real chess engine (custom, ~250 lines).

- Legal move validation (incl. castling, en passant, promotion)
- Check / checkmate / stalemate detection
- 7 hand-picked puzzles with themed hints
- Automatic opponent responses through the solution line
- Click-to-move UI with legal-move highlights
- Streak & total-solved tracking (localStorage)

## Run
Open `index.html`. Zero dependencies.

## Tests
```
npm test
```

Runs [perft](https://www.chessprogramming.org/Perft_Results) against five standard reference positions — the initial board, Kiwipete, and three edge-case positions covering en passant, promotion, double check, and rook-capture castling-rights. 17 leaf-node counts match published values, which verifies legal move generation, check/pin detection, castling rules, and en-passant handling.

## Engine notes
- ~210 lines, no dependencies.
- Pseudo-legal generation + king-safety filter for legality.
- Castling rights are dropped when our king or rook moves, **and** when an enemy rook on its home square is captured.
- `isAttacked` skips the king's castling moves to avoid mutual recursion.
