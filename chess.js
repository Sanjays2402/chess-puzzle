// Minimal but real chess engine. Validates legal moves incl. check/checkmate.
// Board: 8x8 array. Each cell: null or { type, color } where type = p|n|b|r|q|k, color = w|b
class Chess {
  constructor(fen){
    this.board = this.empty();
    this.turn = 'w';
    this.castling = {w:{k:true,q:true}, b:{k:true,q:true}};
    this.ep = null; // en passant target [r,c]
    this.halfmove = 0;
    this.fullmove = 1;
    this.history = [];
    if(fen) this.fromFEN(fen);
    else this.fromFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  }
  empty(){ return Array.from({length:8},()=>Array(8).fill(null)); }

  fromFEN(fen){
    const [pos, turn, castling, ep, half, full] = fen.trim().split(/\s+/);
    this.board = this.empty();
    const rows = pos.split('/');
    for(let r=0;r<8;r++){
      let c = 0;
      for(const ch of rows[r]){
        if(/\d/.test(ch)) c += +ch;
        else {
          const color = ch === ch.toUpperCase() ? 'w' : 'b';
          this.board[r][c] = { type: ch.toLowerCase(), color };
          c++;
        }
      }
    }
    this.turn = turn || 'w';
    this.castling = {
      w: {k: castling?.includes('K'), q: castling?.includes('Q')},
      b: {k: castling?.includes('k'), q: castling?.includes('q')},
    };
    this.ep = (ep && ep !== '-') ? this.sqToRC(ep) : null;
    this.halfmove = +(half||0);
    this.fullmove = +(full||1);
  }

  sqToRC(sq){ return [8 - +sq[1], sq.charCodeAt(0) - 97]; }
  rcToSq([r,c]){ return String.fromCharCode(97+c) + (8-r); }

  get(r,c){ return this.board[r]?.[c] ?? null; }

  // Get all legal moves for current turn
  legalMoves(){
    const moves = [];
    for(let r=0;r<8;r++) for(let c=0;c<8;c++){
      const p = this.board[r][c];
      if(p && p.color === this.turn){
        moves.push(...this.pieceMoves(r,c));
      }
    }
    // Filter out moves that leave king in check
    return moves.filter(m => {
      const save = this.snap();
      this.apply(m);
      const inCheck = this.isInCheck(this.opp(this.turn));
      this.restore(save);
      return !inCheck;
    });
  }

  pieceMoves(r,c){
    const p = this.board[r][c];
    const moves = [];
    const push = (nr,nc,flags={}) => {
      if(nr<0||nr>7||nc<0||nc>7) return false;
      const tg = this.board[nr][nc];
      if(tg && tg.color === p.color) return false;
      moves.push({from:[r,c], to:[nr,nc], piece:p.type, capture: !!tg, ...flags});
      return !tg;
    };
    const slide = dirs => {
      for(const [dr,dc] of dirs){
        let nr=r+dr, nc=c+dc;
        while(push(nr,nc) && this.board[nr][nc] == null){ nr+=dr; nc+=dc; }
      }
    };
    switch(p.type){
      case 'p': {
        const dir = p.color === 'w' ? -1 : 1;
        const startRow = p.color === 'w' ? 6 : 1;
        const promoRow = p.color === 'w' ? 0 : 7;
        // forward
        if(this.get(r+dir,c) == null){
          if(r+dir === promoRow) for(const pr of ['q','r','b','n']) moves.push({from:[r,c],to:[r+dir,c],piece:'p',promotion:pr});
          else moves.push({from:[r,c],to:[r+dir,c],piece:'p'});
          if(r === startRow && this.get(r+2*dir,c) == null) moves.push({from:[r,c],to:[r+2*dir,c],piece:'p',double:true});
        }
        // captures
        for(const dc of [-1,1]){
          const nr=r+dir, nc=c+dc;
          const tg = this.get(nr,nc);
          if(tg && tg.color !== p.color){
            if(nr === promoRow) for(const pr of ['q','r','b','n']) moves.push({from:[r,c],to:[nr,nc],piece:'p',capture:true,promotion:pr});
            else moves.push({from:[r,c],to:[nr,nc],piece:'p',capture:true});
          }
          // en passant
          if(this.ep && this.ep[0]===nr && this.ep[1]===nc) moves.push({from:[r,c],to:[nr,nc],piece:'p',capture:true,ep:true});
        }
        break;
      }
      case 'n': {
        for(const [dr,dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) push(r+dr,c+dc);
        break;
      }
      case 'b': slide([[-1,-1],[-1,1],[1,-1],[1,1]]); break;
      case 'r': slide([[-1,0],[1,0],[0,-1],[0,1]]); break;
      case 'q': slide([[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]); break;
      case 'k': {
        for(const dr of [-1,0,1]) for(const dc of [-1,0,1]) if(dr||dc) push(r+dr,c+dc);
        // castling (pseudo-legal; check detection filters)
        const side = p.color;
        const row = side === 'w' ? 7 : 0;
        if(r===row && c===4 && !this.isAttacked(r,c,this.opp(side))){
          if(this.castling[side].k && !this.board[row][5] && !this.board[row][6] &&
             !this.isAttacked(row,5,this.opp(side)) && !this.isAttacked(row,6,this.opp(side)) &&
             this.get(row,7)?.type === 'r')
            moves.push({from:[r,c],to:[row,6],piece:'k',castle:'k'});
          if(this.castling[side].q && !this.board[row][3] && !this.board[row][2] && !this.board[row][1] &&
             !this.isAttacked(row,3,this.opp(side)) && !this.isAttacked(row,2,this.opp(side)) &&
             this.get(row,0)?.type === 'r')
            moves.push({from:[r,c],to:[row,2],piece:'k',castle:'q'});
        }
        break;
      }
    }
    return moves;
  }

  opp(c){ return c==='w'?'b':'w'; }

  isAttacked(r,c,byColor){
    // Walk all attackers' pseudo-moves (no check filter)
    for(let rr=0;rr<8;rr++) for(let cc=0;cc<8;cc++){
      const p = this.board[rr][cc];
      if(!p || p.color !== byColor) continue;
      if(p.type === 'p'){
        const dir = byColor === 'w' ? -1 : 1;
        if(rr+dir === r && (cc-1 === c || cc+1 === c)) return true;
        continue;
      }
      const moves = this.pieceMoves(rr,cc);
      if(moves.some(m => m.to[0]===r && m.to[1]===c)) return true;
    }
    return false;
  }

  isInCheck(color){
    for(let r=0;r<8;r++) for(let c=0;c<8;c++){
      const p = this.board[r][c];
      if(p && p.type === 'k' && p.color === color) return this.isAttacked(r,c,this.opp(color));
    }
    return false;
  }

  snap(){ return JSON.stringify({board:this.board,turn:this.turn,castling:this.castling,ep:this.ep}); }
  restore(s){ const o = JSON.parse(s); this.board = o.board; this.turn = o.turn; this.castling = o.castling; this.ep = o.ep; }

  apply(m){
    const p = this.board[m.from[0]][m.from[1]];
    this.board[m.from[0]][m.from[1]] = null;
    this.board[m.to[0]][m.to[1]] = m.promotion ? { type: m.promotion, color: p.color } : p;
    if(m.ep){
      const dir = p.color === 'w' ? 1 : -1;
      this.board[m.to[0]+dir][m.to[1]] = null;
    }
    if(m.castle){
      const row = m.to[0];
      if(m.castle === 'k'){ this.board[row][5] = this.board[row][7]; this.board[row][7] = null; }
      else { this.board[row][3] = this.board[row][0]; this.board[row][0] = null; }
    }
    // Castling rights
    if(p.type === 'k') this.castling[p.color] = {k:false, q:false};
    if(p.type === 'r'){
      const row = p.color === 'w' ? 7 : 0;
      if(m.from[0] === row && m.from[1] === 0) this.castling[p.color].q = false;
      if(m.from[0] === row && m.from[1] === 7) this.castling[p.color].k = false;
    }
    // EP target
    this.ep = m.double ? [(m.from[0]+m.to[0])/2, m.from[1]] : null;
    this.turn = this.opp(this.turn);
  }

  // Returns SAN-ish notation for display
  san(m){
    const p = this.board[m.from[0]][m.from[1]];
    if(m.castle) return m.castle === 'k' ? 'O-O' : 'O-O-O';
    const piece = p.type === 'p' ? '' : p.type.toUpperCase();
    const cap = m.capture ? 'x' : '';
    const to = this.rcToSq(m.to);
    const promo = m.promotion ? '=' + m.promotion.toUpperCase() : '';
    const fromFile = p.type === 'p' && m.capture ? this.rcToSq(m.from)[0] : '';
    return piece + fromFile + cap + to + promo;
  }

  isCheckmate(){ return this.legalMoves().length === 0 && this.isInCheck(this.turn); }
  isStalemate(){ return this.legalMoves().length === 0 && !this.isInCheck(this.turn); }
}
window.Chess = Chess;
