import React, { useState, useEffect } from 'react';
import { 
  X, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Trophy, 
  Award, 
  ShieldCheck, 
  Coins, 
  Bot, 
  User, 
  Sparkles,
  HelpCircle,
  AlertCircle,
  Swords
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/finance';

/* =========================================================================
   AUTHENTIC 16 GUTI (SHOLO GUTI / ১৬ গুটি) BOARD TOPOLOGY
   37 Interconnected Nodes matching real traditional board layout:
   - Top Triangle Castle: Nodes 0..5 (Connected to apex at Node 8)
   - Central 5x5 Grid: Nodes 6..30 (Rows 0 to 4, Cols 0 to 4)
   - Bottom Triangle Castle: Nodes 31..36 (Connected to apex at Node 28)
   ========================================================================= */

export const NODES = [
  // Top Triangle Outer Row (row -2, y = 50)
  { id: 0, x: 104, y: 50, label: 'T0' },
  { id: 1, x: 200, y: 50, label: 'T1' },
  { id: 2, x: 296, y: 50, label: 'T2' },

  // Top Triangle Middle Row (row -1, y = 115)
  { id: 3, x: 152, y: 115, label: 'T3' },
  { id: 4, x: 200, y: 115, label: 'T4' },
  { id: 5, x: 248, y: 115, label: 'T5' },

  // 5x5 Square Grid (r = 0..4, c = 0..4 -> IDs 6 to 30)
  // Row 0: y = 180 (Node 8 is apex where top triangle rays converge)
  { id: 6, x: 60, y: 180, r: 0, c: 0 },
  { id: 7, x: 130, y: 180, r: 0, c: 1 },
  { id: 8, x: 200, y: 180, r: 0, c: 2, isApex: true },
  { id: 9, x: 270, y: 180, r: 0, c: 3 },
  { id: 10, x: 340, y: 180, r: 0, c: 4 },

  // Row 1: y = 250
  { id: 11, x: 60, y: 250, r: 1, c: 0 },
  { id: 12, x: 130, y: 250, r: 1, c: 1 },
  { id: 13, x: 200, y: 250, r: 1, c: 2 },
  { id: 14, x: 270, y: 250, r: 1, c: 3 },
  { id: 15, x: 340, y: 250, r: 1, c: 4 },

  // Row 2 (Middle Neutral Line): y = 320 (Starts completely empty)
  { id: 16, x: 60, y: 320, r: 2, c: 0 },
  { id: 17, x: 130, y: 320, r: 2, c: 1 },
  { id: 18, x: 200, y: 320, r: 2, c: 2 },
  { id: 19, x: 270, y: 320, r: 2, c: 3 },
  { id: 20, x: 340, y: 320, r: 2, c: 4 },

  // Row 3: y = 390
  { id: 21, x: 60, y: 390, r: 3, c: 0 },
  { id: 22, x: 130, y: 390, r: 3, c: 1 },
  { id: 23, x: 200, y: 390, r: 3, c: 2 },
  { id: 24, x: 270, y: 390, r: 3, c: 3 },
  { id: 25, x: 340, y: 390, r: 3, c: 4 },

  // Row 4: y = 460 (Node 28 is apex where bottom triangle rays converge)
  { id: 26, x: 60, y: 460, r: 4, c: 0 },
  { id: 27, x: 130, y: 460, r: 4, c: 1 },
  { id: 28, x: 200, y: 460, r: 4, c: 2, isApex: true },
  { id: 29, x: 270, y: 460, r: 4, c: 3 },
  { id: 30, x: 340, y: 460, r: 4, c: 4 },

  // Bottom Triangle Middle Row (row 5, y = 525)
  { id: 31, x: 152, y: 525, label: 'B3' },
  { id: 32, x: 200, y: 525, label: 'B4' },
  { id: 33, x: 248, y: 525, label: 'B5' },

  // Bottom Triangle Outer Row (row 6, y = 590)
  { id: 34, x: 104, y: 590, label: 'B0' },
  { id: 35, x: 200, y: 590, label: 'B1' },
  { id: 36, x: 296, y: 590, label: 'B2' },
];

// All 76 Undirected Edges on the Board
export const BOARD_EDGES = [
  // Top Triangle Horizontals
  [0, 1], [1, 2],
  [3, 4], [4, 5],

  // Top Triangle Rays (connecting to Apex Node 8)
  [0, 3], [3, 8],
  [1, 4], [4, 8],
  [2, 5], [5, 8],

  // 5x5 Grid Horizontals
  [6, 7], [7, 8], [8, 9], [9, 10],
  [11, 12], [12, 13], [13, 14], [14, 15],
  [16, 17], [17, 18], [18, 19], [19, 20],
  [21, 22], [22, 23], [23, 24], [24, 25],
  [26, 27], [27, 28], [28, 29], [29, 30],

  // 5x5 Grid Verticals
  [6, 11], [11, 16], [16, 21], [21, 26],
  [7, 12], [12, 17], [17, 22], [22, 27],
  [8, 13], [13, 18], [18, 23], [23, 28],
  [9, 14], [14, 19], [19, 24], [24, 29],
  [10, 15], [15, 20], [20, 25], [25, 30],

  // 5x5 Grid Diagonals
  [6, 12], [12, 18], [18, 24], [24, 30],
  [10, 14], [14, 18], [18, 22], [22, 26],
  [8, 12], [12, 16],
  [8, 14], [14, 20],
  [16, 22], [22, 28],
  [20, 24], [24, 28],

  // Bottom Triangle Rays (connecting to Apex Node 28)
  [28, 31], [31, 34],
  [28, 32], [32, 35],
  [28, 33], [33, 36],

  // Bottom Triangle Horizontals
  [31, 32], [32, 33],
  [34, 35], [35, 36]
];

// Straight line triplets for jump captures: [from, over, to]
export const JUMP_LINES = [
  // Top Triangle
  [0, 1, 2],
  [3, 4, 5],
  [0, 3, 8],
  [1, 4, 8],
  [4, 8, 13],
  [2, 5, 8],

  // 5x5 Grid Horizontals
  [6, 7, 8], [7, 8, 9], [8, 9, 10],
  [11, 12, 13], [12, 13, 14], [13, 14, 15],
  [16, 17, 18], [17, 18, 19], [18, 19, 20],
  [21, 22, 23], [22, 23, 24], [23, 24, 25],
  [26, 27, 28], [27, 28, 29], [28, 29, 30],

  // 5x5 Grid Verticals
  [6, 11, 16], [11, 16, 21], [16, 21, 26],
  [7, 12, 17], [12, 17, 22], [17, 22, 27],
  [8, 13, 18], [13, 18, 23], [18, 23, 28],
  [9, 14, 19], [14, 19, 24], [19, 24, 29],
  [10, 15, 20], [15, 20, 25], [20, 25, 30],

  // 5x5 Grid Diagonals
  [6, 12, 18], [12, 18, 24], [18, 24, 30],
  [10, 14, 18], [14, 18, 22], [18, 22, 26],
  [8, 12, 16],
  [8, 14, 20],
  [16, 22, 28],
  [20, 24, 28],

  // Bottom Triangle
  [23, 28, 32],
  [28, 32, 35],
  [28, 31, 34],
  [28, 33, 36],
  [31, 32, 33],
  [34, 35, 36]
];

// Generate bidirectional jump captures
export const JUMP_TABLE = [];
JUMP_LINES.forEach(([a, b, c]) => {
  JUMP_TABLE.push({ from: a, over: b, to: c });
  JUMP_TABLE.push({ from: c, over: b, to: a });
});

/* Synthesized Authentic Audio for Real Board Experience */
const playGutiTone = (type, enabled = true) => {
  if (!enabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'move') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'capture') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.28);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.28);
    } else if (type === 'win') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(554.37, now + 0.12);
      osc.frequency.setValueAtTime(659.25, now + 0.24);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  } catch (e) {
    // Audio fallback
  }
};

export default function Real16GutiModal({ isOpen, onClose }) {
  const { rewardWallet, playSoloSkillGame, showToast, userMembershipTier } = useApp();

  const [entryFee, setEntryFee] = useState(10);
  const [gameState, setGameState] = useState('lobby'); // 'lobby', 'playing', 'gameover'
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Board State: Array of 37 elements: 'player' (Blue), 'bot' (Red), or null
  const [board, setBoard] = useState(Array(37).fill(null));
  const [selectedNode, setSelectedNode] = useState(null);
  const [validMoves, setValidMoves] = useState([]); // [{ to, isJump, over }]

  const [turn, setTurn] = useState('player'); // 'player' (Blue) or 'bot' (Red)
  const [playerCaptured, setPlayerCaptured] = useState(0); // number of bot beads eaten
  const [botCaptured, setBotCaptured] = useState(0); // number of player beads eaten
  const [winner, setWinner] = useState(null);
  const [lastAction, setLastAction] = useState('Select a Blue bead to begin!');

  useEffect(() => {
    if (!isOpen) {
      setGameState('lobby');
      setSelectedNode(null);
      setValidMoves([]);
      setWinner(null);
      setLastAction('Select a Blue bead to begin!');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const grossPot = entryFee * 2;
  const platformCut = +(grossPot * 0.10).toFixed(2);
  const winPrize = +(grossPot - platformCut).toFixed(2);

  // Start Authentic 16 Guti Match
  // Bot (Red): 16 beads (Nodes 0..5 and Nodes 6..15)
  // Player (Blue): 16 beads (Nodes 21..30 and Nodes 31..36)
  // Neutral Line: Nodes 16..20 (Row 2 of 5x5 grid starts empty)
  const handleStartMatch = () => {
    if (rewardWallet < entryFee) {
      showToast(`Insufficient Task Wallet! Entry fee is ${formatINR(entryFee)}. You cannot use locked membership capital.`, 'error');
      return;
    }

    const deducted = playSoloSkillGame({
      gameId: 'real_16_guti',
      gameTitle: '১৬ গুটি (16 Guti / Sholo Guti)',
      entryFee: entryFee,
      rewardAmount: 0,
      won: false
    });

    if (!deducted) return;

    const initialBoard = Array(37).fill(null);
    // Top 16 Red Beads (Bot / Opponent)
    for (let i = 0; i < 6; i++) initialBoard[i] = 'bot';
    for (let i = 6; i <= 15; i++) initialBoard[i] = 'bot';

    // Bottom 16 Blue Beads (Player / You)
    for (let i = 21; i <= 30; i++) initialBoard[i] = 'player';
    for (let i = 31; i <= 36; i++) initialBoard[i] = 'player';

    setBoard(initialBoard);
    setGameState('playing');
    setTurn('player');
    setSelectedNode(null);
    setValidMoves([]);
    setPlayerCaptured(0);
    setBotCaptured(0);
    setWinner(null);
    setLastAction('Your turn! Tap any Blue bead to view valid moves or jump captures.');
  };

  // Find legal moves & jump captures for a selected node
  const getMovesForNode = (nodeId, curBoard, side) => {
    const oppSide = side === 'player' ? 'bot' : 'player';
    const moves = [];

    // 1. Jump captures (jump over adjacent opponent piece to vacant space)
    JUMP_TABLE.forEach(j => {
      if (j.from === nodeId) {
        if (curBoard[j.over] === oppSide && curBoard[j.to] === null) {
          moves.push({ to: j.to, isJump: true, over: j.over });
        }
      }
    });

    // 2. Adjacent regular 1-step moves along board lines
    BOARD_EDGES.forEach(([u, v]) => {
      let target = null;
      if (u === nodeId) target = v;
      else if (v === nodeId) target = u;

      if (target !== null && curBoard[target] === null) {
        moves.push({ to: target, isJump: false, over: null });
      }
    });

    return moves;
  };

  // Handle Player Bead Selection or Target Destination Click
  const handleNodeClick = (nodeId) => {
    if (turn !== 'player' || gameState !== 'playing') return;

    const piece = board[nodeId];

    if (piece === 'player') {
      // Select this piece
      setSelectedNode(nodeId);
      const moves = getMovesForNode(nodeId, board, 'player');
      setValidMoves(moves);
      if (moves.length === 0) {
        setLastAction('That bead has no legal moves! Choose another bead.');
      } else {
        const hasJump = moves.some(m => m.isJump);
        setLastAction(hasJump ? '⚡ JUMP CAPTURE available! Tap the red highlighted node.' : 'Tap any green node to advance 1 step.');
      }
    } else if (selectedNode !== null) {
      // Check if clicked node is an allowed destination
      const validMove = validMoves.find(m => m.to === nodeId);
      if (validMove) {
        executeMove('player', selectedNode, validMove);
      } else {
        setSelectedNode(null);
        setValidMoves([]);
      }
    }
  };

  // Execute Move (Player or Bot)
  const executeMove = (side, from, move) => {
    const oppSide = side === 'player' ? 'bot' : 'player';
    const newBoard = [...board];
    newBoard[from] = null;
    newBoard[move.to] = side;

    let nextCapturedCount = side === 'player' ? playerCaptured : botCaptured;

    if (move.isJump && move.over !== null) {
      newBoard[move.over] = null; // Captured bead removed!
      nextCapturedCount += 1;
      playGutiTone('capture', soundEnabled);

      if (side === 'player') {
        setPlayerCaptured(nextCapturedCount);
        setLastAction('⚔️ You jumped over and captured a Red bead!');
        showToast('⚔️ Captured Red bead! +1 Guti', 'success');
      } else {
        setBotCaptured(nextCapturedCount);
        setLastAction('⚠️ Bot jumped over and captured your Blue bead!');
        showToast('⚠️ Bot captured your Blue bead!', 'warning');
      }
    } else {
      playGutiTone('move', soundEnabled);
      setLastAction(side === 'player' ? 'Moved 1 step.' : 'Bot moved 1 step.');
    }

    setBoard(newBoard);
    setSelectedNode(null);
    setValidMoves([]);

    // Check Victory Condition (All 16 beads captured or opponent locked)
    if (nextCapturedCount >= 16) {
      handleMatchOver(side);
      return;
    }

    // Switch turn
    const nextTurn = side === 'player' ? 'bot' : 'player';
    setTurn(nextTurn);

    if (nextTurn === 'bot') {
      setTimeout(() => executeBotTurn(newBoard), 750);
    }
  };

  // Strategic AI Bot Logic
  const executeBotTurn = (curBoard) => {
    if (gameState !== 'playing') return;

    // Collect all active bot pieces
    const allBotPieces = [];
    curBoard.forEach((p, idx) => {
      if (p === 'bot') allBotPieces.push(idx);
    });

    let bestMove = null;
    let bestFrom = null;

    // Priority 1: Check for any jump captures!
    for (const fromIdx of allBotPieces) {
      const moves = getMovesForNode(fromIdx, curBoard, 'bot');
      const jump = moves.find(m => m.isJump);
      if (jump) {
        bestMove = jump;
        bestFrom = fromIdx;
        break;
      }
    }

    // Priority 2: Regular 1-step move that doesn't walk into immediate capture
    if (!bestMove) {
      const safeMoves = [];
      const anyMoves = [];

      for (const fromIdx of allBotPieces) {
        const moves = getMovesForNode(fromIdx, curBoard, 'bot');
        moves.forEach(m => {
          anyMoves.push({ from: fromIdx, move: m });
          // Check if destination is vulnerable
          const testBoard = [...curBoard];
          testBoard[fromIdx] = null;
          testBoard[m.to] = 'bot';

          // Can player jump this piece on next turn?
          let vulnerable = false;
          JUMP_TABLE.forEach(j => {
            if (j.over === m.to && testBoard[j.from] === 'player' && testBoard[j.to] === null) {
              vulnerable = true;
            }
          });

          if (!vulnerable) {
            safeMoves.push({ from: fromIdx, move: m });
          }
        });
      }

      if (safeMoves.length > 0) {
        const picked = safeMoves[Math.floor(Math.random() * safeMoves.length)];
        bestFrom = picked.from;
        bestMove = picked.move;
      } else if (anyMoves.length > 0) {
        const picked = anyMoves[Math.floor(Math.random() * anyMoves.length)];
        bestFrom = picked.from;
        bestMove = picked.move;
      }
    }

    if (bestMove && bestFrom !== null) {
      executeMove('bot', bestFrom, bestMove);
    } else {
      // Bot has zero legal moves -> Player wins by stalemate lock!
      handleMatchOver('player');
    }
  };

  // Match Over Handler
  const handleMatchOver = (winningSide) => {
    setGameState('gameover');
    setWinner(winningSide);

    if (winningSide === 'player') {
      confetti({ particleCount: 120, spread: 80 });
      playGutiTone('win', soundEnabled);
      showToast(`🏆 VICTORY! You won the ১৬ গুটি match and earned ${formatINR(winPrize)}!`);

      playSoloSkillGame({
        gameId: 'real_16_guti',
        gameTitle: '১৬ গুটি (16 Guti / Sholo Guti)',
        entryFee: 0,
        rewardAmount: winPrize,
        won: true
      });
    } else {
      showToast('Bot captured your army. Better luck next match!', 'error');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: 520, width: '96%', padding: '1.25rem', textAlign: 'center' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ marginBottom: '0.65rem', paddingBottom: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)' }}>
              <Award size={22} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>১৬ গুটি (Sholo Guti Arena)</h2>
                <span className="badge badge-gold" style={{ fontSize: '0.62rem' }}>100% Authentic Board</span>
              </div>
              <p style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                Traditional South Asian Bead War • Jump Captures • 10% Platform Cut
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button 
              type="button" 
              onClick={() => setSoundEnabled(!soundEnabled)} 
              style={{ background: 'transparent', border: 'none', color: soundEnabled ? '#34d399' : '#64748b', cursor: 'pointer', padding: '4px' }}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button className="modal-close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* LOBBY VIEW */}
        {gameState === 'lobby' && (
          <div style={{ padding: '0.5rem 0' }}>
            <div style={{ marginBottom: '1.25rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>Select Boot Amount</h4>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                {[5, 10, 25, 50].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setEntryFee(amt)}
                    style={{
                      padding: '0.55rem 1.1rem',
                      borderRadius: '8px',
                      border: entryFee === amt ? '2px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: entryFee === amt ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                      color: entryFee === amt ? '#fbbf24' : '#cbd5e1',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ₹{amt} Boot
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Winner Takes (90%)</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>{formatINR(winPrize)}</div>
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Platform Rake (10%)</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fbbf24' }}>{formatINR(platformCut)}</div>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, textAlign: 'left', padding: '0.75rem', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px' }}>
              📌 <strong>Authentic ১৬ গুটি Rules:</strong>
              <ul style={{ paddingLeft: '1.2rem', marginTop: '0.3rem' }}>
                <li><strong>You play Blue (bottom army)</strong> vs Bot plays Red (top army).</li>
                <li>Move 1 step along any line to an adjacent empty node.</li>
                <li><strong>Jump & Capture:</strong> If an opponent bead is directly in front and the space behind it is empty, jump over to capture and eliminate it!</li>
                <li>Eliminate all 16 opponent beads or trap the opponent to claim the cash pot!</li>
              </ul>
            </div>

            <button 
              className="btn btn-gold btn-lg" 
              style={{ width: '100%', fontWeight: 800, fontSize: '1rem', boxShadow: '0 4px 18px rgba(245, 158, 11, 0.4)' }}
              onClick={handleStartMatch}
            >
              <Award size={18} /> Start 16 Guti Match (Boot {formatINR(entryFee)})
            </button>
          </div>
        )}

        {/* IN-GAME 16 GUTI BOARD */}
        {(gameState === 'playing' || gameState === 'gameover') && (
          <div>
            {/* Score Strip: Captured Beads */}
            <div style={{ 
              marginBottom: '0.65rem', 
              padding: '0.5rem 0.85rem', 
              borderRadius: '8px', 
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid var(--border-subtle)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              fontSize: '0.82rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#60a5fa', fontWeight: 700 }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#2563eb', display: 'inline-block', boxShadow: '0 0 6px #3b82f6' }} />
                <span>You (Blue): Captured {playerCaptured}/16</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#f87171', fontWeight: 700 }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#dc2626', display: 'inline-block', boxShadow: '0 0 6px #ef4444' }} />
                <span>Bot (Red): Captured {botCaptured}/16</span>
              </div>
            </div>

            {/* Action Guidance Banner */}
            <div style={{
              marginBottom: '0.65rem',
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              background: turn === 'player' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${turn === 'player' ? 'rgba(59, 130, 246, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
              color: turn === 'player' ? '#93c5fd' : '#fca5a5',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}>
              <Swords size={14} />
              <span>{lastAction}</span>
            </div>

            {/* AUTHENTIC WOODEN SHOLO GUTI BOARD (100% Matching Uploaded Image) */}
            <div style={{
              width: '100%',
              maxWidth: '380px',
              margin: '0 auto 0.75rem',
              aspectRatio: '400/640',
              borderRadius: '16px',
              overflow: 'hidden',
              background: '#caa073',
              boxShadow: 'inset 0 0 30px rgba(74, 34, 5, 0.45), 0 10px 32px rgba(0,0,0,0.7)',
              border: '3px solid #6b3f17',
              position: 'relative'
            }}>
              <svg viewBox="0 0 400 640" style={{ width: '100%', height: '100%', display: 'block' }}>
                <defs>
                  {/* Realistic Wood Planks & Grain */}
                  <linearGradient id="woodTable" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#d9ad7c" />
                    <stop offset="35%" stopColor="#c89666" />
                    <stop offset="70%" stopColor="#caa073" />
                    <stop offset="100%" stopColor="#ba8654" />
                  </linearGradient>

                  {/* Red Bead Gradient (3D Glossy Marble) */}
                  <radialGradient id="redBead" cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#ff7b7b" />
                    <stop offset="45%" stopColor="#dc2626" />
                    <stop offset="85%" stopColor="#991b1b" />
                    <stop offset="100%" stopColor="#450a0a" />
                  </radialGradient>

                  {/* Blue Bead Gradient (3D Glossy Marble) */}
                  <radialGradient id="blueBead" cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#93c5fd" />
                    <stop offset="45%" stopColor="#2563eb" />
                    <stop offset="85%" stopColor="#1e40af" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </radialGradient>
                </defs>

                {/* Wood Texture Background */}
                <rect width="400" height="640" fill="url(#woodTable)" />

                {/* Subtle Horizontal Wood Plank Grooves */}
                {[100, 200, 300, 400, 500, 600].map((py, idx) => (
                  <line 
                    key={`plank_${idx}`} 
                    x1="0" 
                    y1={py} 
                    x2="400" 
                    y2={py} 
                    stroke="#8c5828" 
                    strokeWidth="0.8" 
                    opacity="0.25" 
                  />
                ))}

                {/* Traditional Board Dark Brown Lines */}
                {BOARD_EDGES.map(([u, v], idx) => {
                  const nu = NODES[u];
                  const nv = NODES[v];
                  return (
                    <line 
                      key={`edge_${idx}`} 
                      x1={nu.x} 
                      y1={nu.y} 
                      x2={nv.x} 
                      y2={nv.y} 
                      stroke="#4a2205" 
                      strokeWidth="3.4" 
                      strokeLinecap="round" 
                    />
                  );
                })}

                {/* Node Points & Beads */}
                {NODES.map(node => {
                  const piece = board[node.id];
                  const isSelected = selectedNode === node.id;
                  const validMove = validMoves.find(m => m.to === node.id);
                  const isTarget = Boolean(validMove);
                  const isJumpTarget = validMove?.isJump;

                  return (
                    <g 
                      key={`node_${node.id}`} 
                      onClick={() => handleNodeClick(node.id)}
                      style={{ cursor: (piece === 'player' || isTarget) ? 'pointer' : 'default' }}
                    >
                      {/* Node Intersection Anchor Pin */}
                      <circle 
                        cx={node.x} 
                        cy={node.y} 
                        r="3.5" 
                        fill="#3e1d03" 
                        opacity="0.75" 
                      />

                      {/* Valid Move Indicator on Empty Target Node */}
                      {isTarget && (
                        <g>
                          <circle 
                            cx={node.x} 
                            cy={node.y} 
                            r={isJumpTarget ? 18 : 15} 
                            fill={isJumpTarget ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'} 
                            stroke={isJumpTarget ? '#ef4444' : '#10b981'} 
                            strokeWidth="3" 
                            strokeDasharray={isJumpTarget ? '4 2' : 'none'}
                          >
                            <animate attributeName="r" values={isJumpTarget ? "16;20;16" : "13;17;13"} dur="1s" repeatCount="indefinite" />
                          </circle>
                          <circle cx={node.x} cy={node.y} r="5" fill={isJumpTarget ? '#ef4444' : '#10b981'} />
                        </g>
                      )}

                      {/* Red Bead (Bot / Opponent) */}
                      {piece === 'bot' && (
                        <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.55))">
                          <circle 
                            cx={node.x} 
                            cy={node.y} 
                            r="15" 
                            fill="url(#redBead)" 
                            stroke="#7f1d1d" 
                            strokeWidth="1.2" 
                          />
                          {/* Inner Bevel Ring */}
                          <circle 
                            cx={node.x} 
                            cy={node.y} 
                            r="11.5" 
                            fill="none" 
                            stroke="rgba(255,255,255,0.25)" 
                            strokeWidth="1.2" 
                          />
                          {/* Embossed Star Center */}
                          <text 
                            x={node.x} 
                            y={node.y + 4.5} 
                            fontSize="12" 
                            textAnchor="middle" 
                            fill="#fca5a5" 
                            opacity="0.85"
                          >
                            ★
                          </text>
                          {/* Specular Highlight */}
                          <circle cx={node.x - 4} cy={node.y - 4} r="2.8" fill="#ffffff" opacity="0.65" />
                        </g>
                      )}

                      {/* Blue Bead (Player / You) */}
                      {piece === 'player' && (
                        <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.55))">
                          {/* Selection Golden Pulse Halo */}
                          {isSelected && (
                            <circle 
                              cx={node.x} 
                              cy={node.y} 
                              r="20" 
                              fill="none" 
                              stroke="#fbbf24" 
                              strokeWidth="3.5" 
                              opacity="0.95"
                            >
                              <animate attributeName="r" values="18;23;18" dur="1s" repeatCount="indefinite" />
                            </circle>
                          )}
                          <circle 
                            cx={node.x} 
                            cy={node.y} 
                            r={isSelected ? 16.5 : 15} 
                            fill="url(#blueBead)" 
                            stroke={isSelected ? '#fbbf24' : '#1e3a8a'} 
                            strokeWidth={isSelected ? '2.5' : '1.2'} 
                          />
                          {/* Inner Bevel Ring */}
                          <circle 
                            cx={node.x} 
                            cy={node.y} 
                            r="11.5" 
                            fill="none" 
                            stroke="rgba(255,255,255,0.3)" 
                            strokeWidth="1.2" 
                          />
                          {/* Embossed Star Center */}
                          <text 
                            x={node.x} 
                            y={node.y + 4.5} 
                            fontSize="12" 
                            textAnchor="middle" 
                            fill="#93c5fd" 
                            opacity="0.9"
                          >
                            ★
                          </text>
                          {/* Specular Highlight */}
                          <circle cx={node.x - 4} cy={node.y - 4} r="2.8" fill="#ffffff" opacity="0.75" />
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Bottom Match Command Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.8rem' }}>
              <div style={{ fontWeight: 700, color: turn === 'player' ? '#60a5fa' : '#f87171' }}>
                {turn === 'player' ? '👉 Your Turn (Blue Army)' : '⏳ Bot is calculating strategy (Red Army)...'}
              </div>
              <span className="badge badge-gold" style={{ fontSize: '0.68rem' }}>
                Pot: {formatINR(winPrize)}
              </span>
            </div>

            {/* Victory / Defeat Overlay */}
            {gameState === 'gameover' && (
              <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '10px', background: winner === 'player' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', border: `1px solid ${winner === 'player' ? '#10b981' : '#ef4444'}` }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: winner === 'player' ? '#34d399' : '#f87171' }}>
                  {winner === 'player' ? `🏆 VICTORY! You Won ${formatINR(winPrize)}!` : '💔 16 Guti Match Lost!'}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '0.2rem', marginBottom: '0.75rem' }}>
                  {winner === 'player' ? 'All 16 opponent beads captured! Winnings credited to your Task Wallet.' : 'Bot captured your army.'}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <button className="btn btn-gold btn-sm" onClick={() => setGameState('lobby')}>
                    Play Again
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={onClose}>
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
