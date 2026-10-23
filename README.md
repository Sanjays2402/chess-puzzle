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

## Terms & Disclaimer

By using this project you agree to the following.

- **No warranty.** This software is provided "as is", without warranty of any kind, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.
- **No liability.** To the maximum extent permitted by law, the author and contributors are not liable for any claim, loss, or damage (direct, indirect, incidental, or consequential, including lost data or profits) arising from its use.
- **Your responsibility.** You use it at your own risk and are responsible for complying with the laws that apply to you.
- **Game.** Provided for entertainment. Take breaks; it is not designed for people with photosensitive epilepsy, and flashing effects may occur.
- **Third parties.** Names, logos, APIs, and services of others belong to their owners and are used for identification only; no affiliation or endorsement is implied.
- **Your statutory rights.** Nothing here limits rights that cannot be waived by agreement, including under consumer-protection laws in the USA, Canada (including Quebec), and India (Consumer Protection Act, 2019).
- **License.** Use, copying, and distribution are governed by the [LICENSE](LICENSE) file; if anything here conflicts with it, the license controls.

## Content, Assets & Fair Use

- **Original work.** Unless noted otherwise (including below), the code, text, design, and images in this repository were created by the author.
- **Libraries, fonts, and icons.** Third-party libraries, fonts (for example Google Fonts), and icon sets belong to their creators and are used under their own licenses; see the dependency manifests and each source for terms.
- **Logos, brands, and screenshots.** Third-party names, logos, and screenshots appear only to identify or describe their products (nominative use). They remain the property of their owners and do not imply affiliation or endorsement.
- **Ideas and inspiration.** Where this project is inspired by another product, game, or idea, it is an independent implementation. It borrows only general ideas, mechanics, or styles, which are not anyone's exclusive property, and is meant to contain no third-party code or artwork used without permission.
- **Fair use and fair dealing.** Any third-party material is used in limited ways for purposes such as education, research, review, commentary, or identification, relying on fair use in the USA (17 U.S.C. § 107), fair dealing in Canada (Copyright Act, ss. 29–29.2), and fair dealing in India (Copyright Act, 1957, s. 52), where they apply.
- **Concerns and takedown requests.** If you own rights in something here and believe it is used improperly, [open an issue](https://github.com/Sanjays2402/chess-puzzle/issues) or contact the author through their GitHub profile with a link to the material and your claim. It will be reviewed promptly and credited, changed, or removed as appropriate. You may also use GitHub's DMCA process.
- **Contributions.** By contributing, you confirm you have the right to submit your contribution and agree it is licensed under this repository's license.
- **Website.** The project site has its own [Terms](https://sanjays2402.github.io/chess-puzzle/terms.html) and [Fair Use](https://sanjays2402.github.io/chess-puzzle/fair-use.html) pages.
