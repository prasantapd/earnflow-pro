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
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/finance';

/* =========================================================================
   37-NODE AUTHENTIC 16 GUTI (SHOLO GUTI) BOARD TOPOLOGY
   Nodes 0..24: Central 5x5 Square
   Nodes 25..30: Top Triangle Castle
   Nodes 31..36: Bottom Triangle Castle
   ========================================================================= */

export const NODES = [
  // Row 0
  { id: 0, x: 70, y: 200, row: 0, col: 0 },
  { id: 1, x: 160, y: 200, row: 0, col: 1 },
  { id: 2, x: 250, y: 200, row: 0, col: 2 },
  { id: 3, x: 340, y: 200, row: 0, col: 3 },
  { id: 4, x: 430, y: 200, row: 0, col: 4 },
  // Row 1
  { id: 5, x: 70, y: 275, row: 1, col: 0 },
  { id: 6, x: 160, y: 275, row: 1, col: 1 },
  { id: 7, x: 250, y: 275, row: 1, col: 2 },
  { id: 8, x: 340, y: 275, row: 1, col: 3 },
  { id: 9, x: 430, y: 275, row: 1, col: 4 },
  // Row 2 (Middle - Neutral at start)
  { id: 10, x: 70, y: 350, row: 2, col: 0 },
  { id: 11, x: 160, y: 350, row: 2, col: 1 },
  { id: 12, x: 250, y: 350, row: 2, col: 2 },
  { id: 13, x: 340, y: 350, row: 2, col: 3 },
  { id: 14, x: 430, y: 350, row: 2, col: 4 },
  // Row 3
  { id: 15, x: 70, y: 425, row: 3, col: 0 },
  { id: 16, x: 160, y: 425, row: 3, col: 1 },
  { id: 17, x: 250, y: 425, row: 3, col: 2 },
  { id: 18, x: 340, y: 425, row: 3, col: 3 },
  { id: 19, x: 430, y: 425, row: 3, col: 4 },
  // Row 4
  { id: 20, x: 70, y: 500, row: 4, col: 0 },
  { id: 21, x: 160, y: 500, row: 4, col: 1 },
  { id: 22, x: 250, y: 500, row: 4, col: 2 },
  { id: 23, x: 340, y: 500, row: 4, col: 3 },
  { id: 24, x: 430, y: 500, row: 4, col: 4 },

  // Top Castle
  { id: 25, x: 250, y: 50 },  // Apex
  { id: 26, x: 205, y: 100 },
  { id: 27, x: 295, y: 100 },
  { id: 28, x: 160, y: 150 },
  { id: 29, x: 250, y: 150 },
  { id: 30, x: 340, y: 150 },

  // Bottom Castle
  { id: 31, x: 160, y: 550 },
  { id: 32, x: 250, y: 550 },
  { id: 33, x: 340, y: 550 },
  { id: 34, x: 205, y: 600 },
  { id: 35, x: 295, y: 600 },
  { id: 36, x: 250, y: 650 }, // Apex
];

// Graph Adjacency with Jump over relationships: [from, to, jumpedOverNode]
// For standard adjacent moves, jumpedOverNode is null.
// For straight jump captures: { from, to, jumped }
const BOARD_EDGES = [
  // Horizontal 5x5
  [0,1],[1,2],[2,3],[3,4],
  [5,6],[6,7],[7,8],[8,9],
  [10,11],[11,12],[12,13],[13,14],
  [15,16],[16,17],[17,18],[18,19],
  [20,21],[21,22],[22,23],[23,24],

  // Vertical 5x5
  [0,5],[5,10],[10,15],[15,20],
  [1,6],[6,11],[11,16],[16,21],
  [2,7],[7,12],[12,17],[17,22],
  [3,8],[8,13],[13,18],[18,23],
  [4,9],[9,14],[14,19],[19,24],

  // Major Diagonals
  [0,6],[6,12],[12,18],[18,24],
  [4,8],[8,12],[12,16],[16,20],
  [2,6],[6,10],[10,16],[16,22],
  [2,8],[8,14],[14,18],[18,22],
  [0,12],[12,24],[4,12],[12,20],

  // Top Castle Connections
  [25,26],[25,27],[26,27],[26,28],[26,29],[27,29],[27,30],
  [28,29],[29,30],[28,1],[29,2],[30,3],[25,29],[29,2],

  // Bottom Castle Connections
  [36,34],[36,35],[34,35],[34,31],[34,32],[35,32],[35,33],
  [31,32],[32,33],[31,21],[32,22],[33,23],[36,32],[32,22]
];

// Straight jump table for captures: from, over, to
const JUMP_TABLE = [
  // Horizontal 5x5 jumps
  { from: 0, over: 1, to: 2 }, { from: 1, over: 2, to: 3 }, { from: 2, over: 3, to: 4 },
  { from: 4, over: 3, to: 2 }, { from: 3, over: 2, to: 1 }, { from: 2, over: 1, to: 0 },
  { from: 5, over: 6, to: 7 }, { from: 6, over: 7, to: 8 }, { from: 7, over: 8, to: 9 },
  { from: 9, over: 8, to: 7 }, { from: 8, over: 7, to: 6 }, { from: 7, over: 6, to: 5 },
  { from: 10, over: 11, to: 12 }, { from: 11, over: 12, to: 13 }, { from: 12, over: 13, to: 14 },
  { from: 14, over: 13, to: 12 }, { from: 13, over: 12, to: 11 }, { from: 12, over: 11, to: 10 },
  { from: 15, over: 16, to: 17 }, { from: 16, over: 17, to: 18 }, { from: 17, over: 18, to: 19 },
  { from: 19, over: 18, to: 17 }, { from: 18, over: 17, to: 16 }, { from: 17, over: 16, to: 15 },
  { from: 20, over: 21, to: 22 }, { from: 21, over: 22, to: 23 }, { from: 22, over: 23, to: 24 },
  { from: 24, over: 23, to: 22 }, { from: 23, over: 22, to: 21 }, { from: 22, over: 21, to: 20 },

  // Vertical 5x5 jumps
  { from: 0, over: 5, to: 10 }, { from: 5, over: 10, to: 15 }, { from: 10, over: 15, to: 20 },
  { from: 20, over: 15, to: 10 }, { from: 15, over: 10, to: 5 }, { from: 10, over: 5, to: 0 },
  { from: 1, over: 6, to: 11 }, { from: 6, over: 11, to: 16 }, { from: 11, over: 16, to: 21 },
  { from: 21, over: 16, to: 11 }, { from: 16, over: 11, to: 6 }, { from: 11, over: 6, to: 1 },
  { from: 2, over: 7, to: 12 }, { from: 7, over: 12, to: 17 }, { from: 12, over: 17, to: 22 },
  { from: 22, over: 17, to: 12 }, { from: 17, over: 12, to: 7 }, { from: 12, over: 7, to: 2 },
  { from: 3, over: 8, to: 13 }, { from: 8, over: 13, to: 18 }, { from: 13, over: 18, to: 23 },
  { from: 23, over: 18, to: 13 }, { from: 18, over: 13, to: 8 }, { from: 13, over: 8, to: 3 },
  { from: 4, over: 9, to: 14 }, { from: 9, over: 14, to: 19 }, { from: 14, over: 19, to: 24 },
  { from: 24, over: 19, to: 14 }, { from: 19, over: 14, to: 9 }, { from: 14, over: 9, to: 4 },

  // Diagonal jumps
  { from: 0, over: 6, to: 12 }, { from: 6, over: 12, to: 18 }, { from: 12, over: 18, to: 24 },
  { from: 24, over: 18, to: 12 }, { from: 18, over: 12, to: 6 }, { from: 12, over: 6, to: 0 },
  { from: 4, over: 8, to: 12 }, { from: 8, over: 12, to: 16 }, { from: 12, over: 16, to: 20 },
  { from: 20, over: 16, to: 12 }, { from: 16, over: 12, to: 8 }, { from: 12, over: 8, to: 4 },

  // Castle jumps
  { from: 25, over: 29, to: 2 }, { from: 2, over: 29, to: 25 },
  { from: 36, over: 32, to: 22 }, { from: 22, over: 32, to: 36 }
];

export default function Real16GutiModal({ isOpen, onClose }) {
  const { rewardWallet, playSoloSkillGame, showToast, userMembershipTier } = useApp();

  const [entryFee, setEntryFee] = useState(10);
  const [gameState, setGameState] = useState('lobby'); // 'lobby', 'playing', 'gameover'
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Board State: 37 nodes. 'player' (Red/White beads), 'bot' (Green/Black beads), or null
  const [board, setBoard] = useState(Array(37).fill(null));
  const [selectedNode, setSelectedNode] = useState(null);
  const [validMoves, setValidMoves] = useState([]); // [{ to, isJump, over }]

  const [turn, setTurn] = useState('player'); // 'player' or 'bot'
  const [playerCaptured, setPlayerCaptured] = useState(0); // number of bot beads captured
  const [botCaptured, setBotCaptured] = useState(0); // number of player beads captured
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setGameState('lobby');
      setSelectedNode(null);
      setValidMoves([]);
      setWinner(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const grossPot = entryFee * 2;
  const platformCut = +(grossPot * 0.10).toFixed(2);
  const winPrize = +(grossPot - platformCut).toFixed(2);

  // Initialize Authentic 16 Guti Board
  // Bot occupies top 16 nodes (25..30 and 0..9)
  // Player occupies bottom 16 nodes (15..24 and 31..36)
  // Middle row (10..14) starts empty!
  const handleStartMatch = () => {
    if (rewardWallet < entryFee) {
      showToast(`Insufficient Task Wallet! Entry fee is ${formatINR(entryFee)}.`, 'error');
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
    // Top 16 for Bot
    for (let i = 0; i < 10; i++) initialBoard[i] = 'bot';
    for (let i = 25; i <= 30; i++) initialBoard[i] = 'bot';

    // Bottom 16 for Player
    for (let i = 15; i < 25; i++) initialBoard[i] = 'player';
    for (let i = 31; i <= 36; i++) initialBoard[i] = 'player';

    setBoard(initialBoard);
    setGameState('playing');
    setTurn('player');
    setSelectedNode(null);
    setValidMoves([]);
    setPlayerCaptured(0);
    setBotCaptured(0);
    setWinner(null);
  };

  // Find legal moves & jump captures for a selected node
  const getMovesForNode = (nodeId, curBoard, side) => {
    const oppSide = side === 'player' ? 'bot' : 'player';
    const moves = [];

    // 1. Jump captures (higher priority in Sholo Guti)
    JUMP_TABLE.forEach(j => {
      if (j.from === nodeId) {
        if (curBoard[j.over] === oppSide && curBoard[j.to] === null) {
          moves.push({ to: j.to, isJump: true, over: j.over });
        }
      }
    });

    // 2. Adjacent regular 1-step moves
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

  // Handle Player Node Selection
  const handleNodeClick = (nodeId) => {
    if (turn !== 'player' || gameState !== 'playing') return;

    const piece = board[nodeId];

    if (piece === 'player') {
      // Select this piece
      setSelectedNode(nodeId);
      const moves = getMovesForNode(nodeId, board, 'player');
      setValidMoves(moves);
    } else if (selectedNode !== null) {
      // Check if clicked node is a valid move destination
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
      newBoard[move.over] = null; // Captured!
      nextCapturedCount += 1;
      if (side === 'player') {
        setPlayerCaptured(nextCapturedCount);
        showToast('You captured a bead! +1 Guti', 'success');
      } else {
        setBotCaptured(nextCapturedCount);
        showToast('Bot jumped and captured your bead!', 'warning');
      }
    }

    setBoard(newBoard);
    setSelectedNode(null);
    setValidMoves([]);

    // Check Victory condition (16 captures or no opponent moves)
    if (nextCapturedCount >= 16) {
      handleMatchOver(side);
      return;
    }

    // Switch turn
    const nextTurn = side === 'player' ? 'bot' : 'player';
    setTurn(nextTurn);

    if (nextTurn === 'bot') {
      setTimeout(() => executeBotTurn(newBoard), 800);
    }
  };

  // AI Bot Logic
  const executeBotTurn = (curBoard) => {
    if (gameState !== 'playing') return;

    // Collect all valid moves for all bot pieces
    const allBotPieces = [];
    curBoard.forEach((p, idx) => {
      if (p === 'bot') allBotPieces.push(idx);
    });

    let bestMove = null;
    let bestFrom = null;

    // 1. Check for any jump captures first!
    for (const fromIdx of allBotPieces) {
      const moves = getMovesForNode(fromIdx, curBoard, 'bot');
      const jump = moves.find(m => m.isJump);
      if (jump) {
        bestMove = jump;
        bestFrom = fromIdx;
        break;
      }
    }

    // 2. If no jumps, pick any valid regular move
    if (!bestMove) {
      for (const fromIdx of allBotPieces) {
        const moves = getMovesForNode(fromIdx, curBoard, 'bot');
        if (moves.length > 0) {
          bestMove = moves[Math.floor(Math.random() * moves.length)];
          bestFrom = fromIdx;
          break;
        }
      }
    }

    if (bestMove && bestFrom !== null) {
      executeMove('bot', bestFrom, bestMove);
    } else {
      // Bot has no moves left -> Player wins!
      handleMatchOver('player');
    }
  };

  // Match Over Handler
  const handleMatchOver = (winnerSide) => {
    setGameState('gameover');
    setWinner(winnerSide);

    if (winnerSide === 'player') {
      confetti({ particleCount: 120, spread: 80 });
      showToast(`🏆 VICTORY! You defeated the Bot in 16 Guti! Won ${formatINR(winPrize)}!`);

      playSoloSkillGame({
        gameId: 'real_16_guti',
        gameTitle: '১৬ গুটি (16 Guti / Sholo Guti)',
        entryFee: 0,
        rewardAmount: winPrize,
        won: true
      });
    } else {
      showToast('Bot captured your army. Better luck next game!', 'error');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: 680, width: '95%', padding: '1.25rem', textAlign: 'center' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ marginBottom: '0.75rem', paddingBottom: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 4px 12px rgba(217, 119, 6, 0.4)' }}>
              <Award size={22} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>১৬ গুটি (16 Guti / Sholo Guti)</h2>
                <span className="badge badge-gold" style={{ fontSize: '0.62rem' }}>37-Node Board</span>
              </div>
              <p style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                Traditional South Asian Bead Jumping Game • 16 Beads • 10% Platform Rake
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
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
              📌 <strong>16 Guti Traditional Rules:</strong>
              <ul style={{ paddingLeft: '1.2rem', marginTop: '0.3rem' }}>
                <li>Move 1 step along the board lines to any connected empty node.</li>
                <li><strong>Jump & Capture:</strong> If an opponent bead is directly ahead and the space behind it is empty, jump over to capture and eliminate it!</li>
                <li>Capture all 16 opponent beads or block all their moves to win.</li>
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
            {/* Captured Bead Scores */}
            <div style={{ 
              marginBottom: '0.75rem', 
              padding: '0.5rem 0.85rem', 
              borderRadius: '8px', 
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid var(--border-subtle)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              fontSize: '0.82rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', fontWeight: 700 }}>
                <User size={15} /> You Captured: {playerCaptured}/16 Beads
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f87171', fontWeight: 700 }}>
                <Bot size={15} /> Bot Captured: {botCaptured}/16 Beads
              </div>
            </div>

            {/* Traditional Wooden SVG Canvas */}
            <div style={{
              width: '100%',
              maxWidth: '380px',
              margin: '0 auto 1rem',
              aspectRatio: '5/7',
              borderRadius: '16px',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #78350f 0%, #451a03 100%)',
              border: '4px solid #b45309',
              boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8), 0 8px 30px rgba(0,0,0,0.6)',
              position: 'relative'
            }}>
              <svg viewBox="0 0 500 700" style={{ width: '100%', height: '100%', display: 'block' }}>
                {/* Board Lines */}
                {BOARD_EDGES.map(([u, v], idx) => {
                  const nodeU = NODES[u];
                  const nodeV = NODES[v];
                  return (
                    <line 
                      key={`edge_${idx}`} 
                      x1={nodeU.x} 
                      y1={nodeU.y} 
                      x2={nodeV.x} 
                      y2={nodeV.y} 
                      stroke="#fde68a" 
                      strokeWidth="2.5" 
                      opacity="0.85"
                    />
                  );
                })}

                {/* 37 Board Nodes */}
                {NODES.map(node => {
                  const piece = board[node.id];
                  const isSelected = selectedNode === node.id;
                  const isValidTarget = validMoves.some(m => m.to === node.id);

                  return (
                    <g 
                      key={`node_${node.id}`} 
                      onClick={() => handleNodeClick(node.id)}
                      style={{ cursor: (piece === 'player' || isValidTarget) ? 'pointer' : 'default' }}
                    >
                      {/* Node Point Anchor */}
                      <circle 
                        cx={node.x} 
                        cy={node.y} 
                        r="7" 
                        fill="#fde68a" 
                        opacity="0.9"
                      />

                      {/* Valid Move Highlight Aura */}
                      {isValidTarget && (
                        <circle 
                          cx={node.x} 
                          cy={node.y} 
                          r="18" 
                          fill="none" 
                          stroke="#34d399" 
                          strokeWidth="3.5" 
                          strokeDasharray="4 2"
                        />
                      )}

                      {/* Player Bead (Red/White) */}
                      {piece === 'player' && (
                        <g>
                          <circle 
                            cx={node.x} 
                            cy={node.y} 
                            r={isSelected ? 17 : 14} 
                            fill="radial-gradient(circle, #ffffff 0%, #cbd5e1 100%)" 
                            stroke={isSelected ? '#38bdf8' : '#334155'} 
                            strokeWidth={isSelected ? '3.5' : '2'}
                            filter="drop-shadow(0 3px 6px rgba(0,0,0,0.6))"
                          />
                          <circle cx={node.x} cy={node.y} r="5" fill="#38bdf8" opacity="0.8" />
                        </g>
                      )}

                      {/* Bot Bead (Black/Gold) */}
                      {piece === 'bot' && (
                        <g>
                          <circle 
                            cx={node.x} 
                            cy={node.y} 
                            r="14" 
                            fill="radial-gradient(circle, #475569 0%, #0f172a 100%)" 
                            stroke="#f59e0b" 
                            strokeWidth="2"
                            filter="drop-shadow(0 3px 6px rgba(0,0,0,0.6))"
                          />
                          <circle cx={node.x} cy={node.y} r="5" fill="#f59e0b" opacity="0.8" />
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Turn Status Command Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.8rem' }}>
              <div style={{ fontWeight: 700, color: turn === 'player' ? '#38bdf8' : '#f59e0b' }}>
                {turn === 'player' ? '👉 Your Turn: Tap a white bead to move/jump' : '⏳ Bot is calculating strategy...'}
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
                  {winner === 'player' ? 'All opponent beads captured! Prize credited to your Task Wallet.' : 'Bot captured your army.'}
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
