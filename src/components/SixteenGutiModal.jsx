import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, 
  Trophy, 
  RotateCcw, 
  Users, 
  Bot, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Zap, 
  ShieldCheck, 
  Coins, 
  Award,
  ChevronRight,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/finance';

/* =========================================================================
   37-NODE SHOLO GUTI (16 GUTI) TOPOLOGY & COORDINATES
   5x5 Central Grid (Nodes 0..24) + Top Castle (25..30) + Bottom Castle (31..36)
   ========================================================================= */

// Node layout on a 500 x 700 SVG canvas
export const NODES = [
  // Central 5x5 Square: Row 0 to 4 (Indices 0 to 24)
  // Row 0 (Square Top)
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

  // Row 2 (Middle Row - Empty at start)
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

  // Row 4 (Square Bottom)
  { id: 20, x: 70, y: 500, row: 4, col: 0 },
  { id: 21, x: 160, y: 500, row: 4, col: 1 },
  { id: 22, x: 250, y: 500, row: 4, col: 2 },
  { id: 23, x: 340, y: 500, row: 4, col: 3 },
  { id: 24, x: 430, y: 500, row: 4, col: 4 },

  // Top Triangle Extension (6 Nodes: 25 to 30)
  // Apex
  { id: 25, x: 250, y: 50, isCastle: 'top' },
  // Row -2
  { id: 26, x: 205, y: 100, isCastle: 'top' },
  { id: 27, x: 295, y: 100, isCastle: 'top' },
  // Row -1
  { id: 28, x: 160, y: 150, isCastle: 'top' },
  { id: 29, x: 250, y: 150, isCastle: 'top' },
  { id: 30, x: 340, y: 150, isCastle: 'top' },

  // Bottom Triangle Extension (6 Nodes: 31 to 36)
  // Row +1
  { id: 31, x: 160, y: 550, isCastle: 'bottom' },
  { id: 32, x: 250, y: 550, isCastle: 'bottom' },
  { id: 33, x: 340, y: 550, isCastle: 'bottom' },
  // Row +2
  { id: 34, x: 205, y: 600, isCastle: 'bottom' },
  { id: 35, x: 295, y: 600, isCastle: 'bottom' },
  // Apex
  { id: 36, x: 250, y: 650, isCastle: 'bottom' },
];

// Straight lines for rendering the traditional board aesthetic
export const BOARD_LINES = [
  // Central 5x5 horizontal lines
  [0, 4], [5, 9], [10, 14], [15, 19], [20, 24],
  // Central 5x5 vertical lines
  [0, 20], [1, 21], [2, 22], [3, 23], [4, 24],
  // Central 5x5 major diagonals
  [0, 24], [4, 20],
  // Diamond & secondary diagonals
  [2, 10], [10, 22], [22, 14], [14, 2],
  [0, 12], [12, 24], [4, 12], [12, 20],
  [1, 5], [3, 9], [15, 21], [19, 23],
  [1, 9], [15, 23], [5, 21], [3, 19],

  // Top Triangle lines
  [25, 28], [25, 30], [25, 2], // Apex to triangle base
  [26, 27], // Midline 1
  [28, 30], // Midline 2
  [28, 1], [29, 2], [30, 3], // Connect to square row 0
  [26, 1], [27, 3],

  // Bottom Triangle lines
  [36, 31], [36, 33], [36, 22], // Apex to triangle base
  [34, 35], // Midline 1
  [31, 33], // Midline 2
  [31, 21], [32, 22], [33, 23], // Connect to square row 4
  [34, 21], [35, 23]
];

// Build adjacency list for adjacent 1-step moves
const buildAdjacency = () => {
  const adj = Array.from({ length: 37 }, () => new Set());
  BOARD_LINES.forEach(([a, b]) => {
    // If a and b are directly adjacent on this line segment
    // We break long lines into individual adjacent segments
  });

  // Direct adjacency segments (1-step connected pairs)
  const segments = [
    // Square horizontals
    [0, 1], [1, 2], [2, 3], [3, 4],
    [5, 6], [6, 7], [7, 8], [8, 9],
    [10, 11], [11, 12], [12, 13], [13, 14],
    [15, 16], [16, 17], [17, 18], [18, 19],
    [20, 21], [21, 22], [22, 23], [23, 24],

    // Square verticals
    [0, 5], [5, 10], [10, 15], [15, 20],
    [1, 6], [6, 11], [11, 16], [16, 21],
    [2, 7], [7, 12], [12, 17], [17, 22],
    [3, 8], [8, 13], [13, 18], [18, 23],
    [4, 9], [9, 14], [14, 19], [19, 24],

    // Square diagonals (Alquerque diagonal points where (row+col)%2 === 0)
    [0, 6], [6, 12], [12, 18], [18, 24],
    [4, 8], [8, 12], [12, 16], [16, 20],
    [2, 6], [6, 10], [10, 16], [16, 22],
    [2, 8], [8, 14], [14, 18], [18, 22],

    // Top Triangle connections
    [25, 26], [25, 27], [25, 29],
    [26, 27], [26, 28], [26, 29],
    [27, 29], [27, 30],
    [28, 29], [29, 30],
    [28, 1], [29, 2], [30, 3],
    [28, 0], [30, 4],

    // Bottom Triangle connections
    [21, 31], [22, 32], [23, 33],
    [20, 31], [24, 33],
    [31, 32], [32, 33],
    [31, 34], [32, 34], [32, 35], [33, 35],
    [34, 35],
    [34, 36], [35, 36], [32, 36]
  ];

  segments.forEach(([u, v]) => {
    adj[u].add(v);
    adj[v].add(u);
  });

  return adj.map(s => Array.from(s));
};

const ADJACENCY = buildAdjacency();

// Build collinear jump paths (A -> jumps over B -> lands on C)
const buildJumps = () => {
  const jumps = Array.from({ length: 37 }, () => []);

  // For every node u and its neighbor v, check if there's a collinear node w such that vector(u, v) === vector(v, w)
  for (let u = 0; u < 37; u++) {
    const neighbors = ADJACENCY[u];
    for (const v of neighbors) {
      const vNeighbors = ADJACENCY[v];
      const dx1 = NODES[v].x - NODES[u].x;
      const dy1 = NODES[v].y - NODES[u].y;

      for (const w of vNeighbors) {
        if (w === u) continue;
        const dx2 = NODES[w].x - NODES[v].x;
        const dy2 = NODES[w].y - NODES[v].y;

        // Check if u, v, w are along the exact straight line and distances match reasonably
        const dot = dx1 * dx2 + dy1 * dy2;
        const cross = dx1 * dy2 - dy1 * dx2;
        const len1 = Math.hypot(dx1, dy1);
        const len2 = Math.hypot(dx2, dy2);

        if (Math.abs(cross) < 80 && dot > 0 && Math.abs(len1 - len2) < 45) {
          jumps[u].push({ over: v, to: w });
        }
      }
    }
  }
  return jumps;
};

const JUMP_PATHS = buildJumps();

/* =========================================================================
   SYNTHESIZED SOUND GENERATOR (Web Audio API - No MP3s required!)
   ========================================================================= */
const playAudioSound = (type, soundEnabled = true) => {
  if (!soundEnabled || typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'move') {
      // Warm acoustic wood click
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'capture') {
      // Hollow pop / snap
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.6, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'win') {
      // Fanfare chord
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = 'triangle';
        o.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        g.gain.setValueAtTime(0.3, ctx.currentTime + idx * 0.1);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
        o.start(ctx.currentTime + idx * 0.1);
        o.stop(ctx.currentTime + 0.5);
      });
    }
  } catch (e) {
    // Ignore audio autoplay restrictions
  }
};

/* =========================================================================
   SIXTEEN GUTI ARENA MODAL COMPONENT
   ========================================================================= */
export default function SixteenGutiModal({ isOpen, onClose }) {
  const { rewardWallet, playSoloSkillGame, showToast, userMembershipTier } = useApp();

  const [gameMode, setGameMode] = useState('ai'); // 'ai' or 'pvp' (pass & play)
  const [entryFee, setEntryFee] = useState(5); // 0 (practice), 5, 10, 25
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Board State: 37 elements array
  // 'P1' (Red / Top), 'P2' (Green / Bottom), or null (empty)
  const [board, setBoard] = useState(() => initializeBoard());
  const [selectedNode, setSelectedNode] = useState(null);
  const [currentTurn, setCurrentTurn] = useState('P2'); // 'P2' starts (User/Green), 'P1' (Red/Opponent)
  const [winner, setWinner] = useState(null);
  const [moveCount, setMoveCount] = useState(0);
  const [isBotThinking, setIsBotThinking] = useState(false);

  // Financial calculations
  const grossPot = entryFee * 2;
  const platformCommission = +(grossPot * 0.10).toFixed(2);
  const winReward = entryFee > 0 ? +(grossPot - platformCommission).toFixed(2) : 0;

  // Count remaining beads
  const p1Count = board.filter(b => b === 'P1').length;
  const p2Count = board.filter(b => b === 'P2').length;

  function initializeBoard() {
    // Initial Setup:
    // P1 (Red): Top Castle (25..30) + Row 0 (0..4) + Row 1 (5..9) = 16 beads
    // Empty: Row 2 (10..14) = 5 nodes
    // P2 (Green): Row 3 (15..19) + Row 4 (20..24) + Bottom Castle (31..36) = 16 beads
    const b = Array(37).fill(null);
    // P1
    for (let i = 0; i < 10; i++) b[i] = 'P1';
    for (let i = 25; i <= 30; i++) b[i] = 'P1';
    // P2
    for (let i = 15; i <= 24; i++) b[i] = 'P2';
    for (let i = 31; i <= 36; i++) b[i] = 'P2';
    return b;
  }

  // Reset or restart game
  const handleRestart = () => {
    setBoard(initializeBoard());
    setSelectedNode(null);
    setCurrentTurn('P2');
    setWinner(null);
    setMoveCount(0);
  };

  useEffect(() => {
    if (isOpen) {
      handleRestart();
    }
  }, [isOpen]);

  // Compute valid moves for currently selected node
  const validMoves = useMemo(() => {
    if (selectedNode === null) return { normal: [], jumps: [] };
    const piece = board[selectedNode];
    if (!piece) return { normal: [], jumps: [] };

    // Normal 1-step moves to adjacent empty nodes
    const normal = (ADJACENCY[selectedNode] || []).filter(n => board[n] === null);

    // Jump captures
    const opponent = piece === 'P1' ? 'P2' : 'P1';
    const jumps = (JUMP_PATHS[selectedNode] || []).filter(
      j => board[j.over] === opponent && board[j.to] === null
    );

    return { normal, jumps };
  }, [selectedNode, board]);

  // Check victory conditions
  const checkWinner = (newBoard) => {
    const p1 = newBoard.filter(b => b === 'P1').length;
    const p2 = newBoard.filter(b => b === 'P2').length;

    if (p1 === 0) {
      setWinner('P2');
      playAudioSound('win', soundEnabled);
      confetti({ particleCount: 90, spread: 65 });
      if (entryFee > 0) {
        playSoloSkillGame({
          gameId: '16_guti',
          gameTitle: '16 Guti (Sholo Guti) Championship',
          won: true,
          score: 16,
          rewardAmount: winReward
        });
      }
      return 'P2';
    }
    if (p2 === 0) {
      setWinner('P1');
      return 'P1';
    }
    return null;
  };

  // User click on a board node
  const handleNodeClick = (nodeId) => {
    if (winner || (gameMode === 'ai' && currentTurn === 'P1') || isBotThinking) return;

    const piece = board[nodeId];

    // If clicking own piece, select it
    if (piece === currentTurn) {
      setSelectedNode(nodeId);
      return;
    }

    // If a piece is already selected, check if clicked node is a valid move
    if (selectedNode !== null) {
      const isNormal = validMoves.normal.includes(nodeId);
      const jumpMove = validMoves.jumps.find(j => j.to === nodeId);

      if (isNormal) {
        // Execute normal move
        const newBoard = [...board];
        newBoard[nodeId] = currentTurn;
        newBoard[selectedNode] = null;
        setBoard(newBoard);
        setSelectedNode(null);
        setMoveCount(m => m + 1);
        playAudioSound('move', soundEnabled);

        const win = checkWinner(newBoard);
        if (!win) {
          const nextTurn = currentTurn === 'P2' ? 'P1' : 'P2';
          setCurrentTurn(nextTurn);
        }
      } else if (jumpMove) {
        // Execute jump capture
        const newBoard = [...board];
        newBoard[nodeId] = currentTurn;
        newBoard[selectedNode] = null;
        newBoard[jumpMove.over] = null; // Captured opponent bead!
        setBoard(newBoard);
        setSelectedNode(null);
        setMoveCount(m => m + 1);
        playAudioSound('capture', soundEnabled);

        const win = checkWinner(newBoard);
        if (!win) {
          const nextTurn = currentTurn === 'P2' ? 'P1' : 'P2';
          setCurrentTurn(nextTurn);
        }
      } else {
        // Deselect if clicking elsewhere
        setSelectedNode(null);
      }
    }
  };

  // Bot AI Turn execution
  useEffect(() => {
    if (!isOpen || gameMode !== 'ai' || currentTurn !== 'P1' || winner) return;

    setIsBotThinking(true);
    const botTimer = setTimeout(() => {
      // Find all P1 pieces
      const p1Indices = [];
      board.forEach((val, idx) => {
        if (val === 'P1') p1Indices.push(idx);
      });

      // 1. Priority: Find any jump capture move
      let availableJumps = [];
      p1Indices.forEach(idx => {
        const jumps = (JUMP_PATHS[idx] || []).filter(
          j => board[j.over] === 'P2' && board[j.to] === null
        );
        jumps.forEach(j => {
          availableJumps.push({ from: idx, over: j.over, to: j.to });
        });
      });

      if (availableJumps.length > 0) {
        // Take the jump move!
        const chosen = availableJumps[Math.floor(Math.random() * availableJumps.length)];
        const newBoard = [...board];
        newBoard[chosen.to] = 'P1';
        newBoard[chosen.from] = null;
        newBoard[chosen.over] = null;
        setBoard(newBoard);
        setMoveCount(m => m + 1);
        playAudioSound('capture', soundEnabled);
        setIsBotThinking(false);
        const win = checkWinner(newBoard);
        if (!win) setCurrentTurn('P2');
        return;
      }

      // 2. Otherwise find a valid forward or lateral move
      let availableNormal = [];
      p1Indices.forEach(idx => {
        const moves = (ADJACENCY[idx] || []).filter(n => board[n] === null);
        moves.forEach(toNode => {
          // Weight towards moving downwards toward opponent
          const forwardBonus = NODES[toNode].y > NODES[idx].y ? 3 : 1;
          availableNormal.push({ from: idx, to: toNode, weight: forwardBonus });
        });
      });

      if (availableNormal.length > 0) {
        // Weighted pick
        availableNormal.sort((a, b) => b.weight - a.weight);
        const bestPool = availableNormal.slice(0, Math.min(3, availableNormal.length));
        const chosen = bestPool[Math.floor(Math.random() * bestPool.length)];

        const newBoard = [...board];
        newBoard[chosen.to] = 'P1';
        newBoard[chosen.from] = null;
        setBoard(newBoard);
        setMoveCount(m => m + 1);
        playAudioSound('move', soundEnabled);
        setIsBotThinking(false);
        const win = checkWinner(newBoard);
        if (!win) setCurrentTurn('P2');
      } else {
        // No moves left for P1, P2 wins
        setWinner('P2');
        setIsBotThinking(false);
        playAudioSound('win', soundEnabled);
        confetti();
      }
    }, 700);

    return () => clearTimeout(botTimer);
  }, [currentTurn, gameMode, board, winner, soundEnabled]);

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '0.75rem',
        overflowY: 'auto'
      }}
    >
      <div 
        className="glass-card"
        style={{
          maxWidth: '560px',
          width: '100%',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'radial-gradient(circle at 50% 20%, #1e293b 0%, #0b0f19 100%)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
          position: 'relative',
          padding: '1.25rem',
          overflow: 'hidden'
        }}
      >
        {/* Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)' }}>
              <Award size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  ১৬ গুটি (16 Guti / Sholo Guti)
                </h3>
                <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>Traditional Arena</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                Classic 37-Point Board • Real Bead Jump & Eat Physics
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.4rem', color: soundEnabled ? '#34d399' : '#94a3b8' }}
              title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button
              type="button"
              onClick={handleRestart}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.4rem' }}
              title="Restart Board"
            >
              <RotateCcw size={16} />
            </button>
            <button 
              type="button"
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.4rem', lineHeight: 1 }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Mode & Wager Switchers */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '0.2rem', flex: 1 }}>
            <button
              type="button"
              onClick={() => { setGameMode('ai'); handleRestart(); }}
              style={{
                flex: 1,
                padding: '0.35rem 0.5rem',
                border: 'none',
                borderRadius: '6px',
                background: gameMode === 'ai' ? 'var(--primary-600)' : 'transparent',
                color: gameMode === 'ai' ? '#fff' : '#94a3b8',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem'
              }}
            >
              <Bot size={13} /> Vs Smart Bot
            </button>
            <button
              type="button"
              onClick={() => { setGameMode('pvp'); handleRestart(); }}
              style={{
                flex: 1,
                padding: '0.35rem 0.5rem',
                border: 'none',
                borderRadius: '6px',
                background: gameMode === 'pvp' ? 'var(--primary-600)' : 'transparent',
                color: gameMode === 'pvp' ? '#fff' : '#94a3b8',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem'
              }}
            >
              <Users size={13} /> 2-Player Local
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>
            <Coins size={14} color="#fbbf24" />
            <span style={{ color: '#94a3b8' }}>Wager:</span>
            <select
              value={entryFee}
              onChange={(e) => setEntryFee(Number(e.target.value))}
              style={{ background: 'transparent', border: 'none', color: '#fbbf24', fontWeight: 800, cursor: 'pointer', outline: 'none' }}
            >
              <option value={0} style={{ background: '#0f172a' }}>Practice (Free)</option>
              <option value={5} style={{ background: '#0f172a' }}>₹5 Stake (Win ₹9)</option>
              <option value={10} style={{ background: '#0f172a' }}>₹10 Stake (Win ₹18)</option>
              <option value={25} style={{ background: '#0f172a' }}>₹25 Stake (Win ₹45)</option>
            </select>
          </div>
        </div>

        {/* Players Indicator & Bead Counts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
          {/* Top Player (Red) */}
          <div 
            className="glass-card"
            style={{
              padding: '0.5rem 0.75rem',
              border: currentTurn === 'P1' ? '2px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.08)',
              background: currentTurn === 'P1' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f87171' }}>
                  {gameMode === 'ai' ? 'Bot Master (Red)' : 'Player 1 (Red)'}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                  {currentTurn === 'P1' ? (isBotThinking ? 'Thinking...' : '👉 Turn to move') : 'Waiting'}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#f87171' }}>{p1Count}</div>
              <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>beads left</div>
            </div>
          </div>

          {/* Bottom Player (Green / User) */}
          <div 
            className="glass-card"
            style={{
              padding: '0.5rem 0.75rem',
              border: currentTurn === 'P2' ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
              background: currentTurn === 'P2' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#34d399' }}>
                  {gameMode === 'ai' ? 'You (Green)' : 'Player 2 (Green)'}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                  {currentTurn === 'P2' ? '👉 Your Turn to Play!' : 'Waiting'}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#34d399' }}>{p2Count}</div>
              <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>beads left</div>
            </div>
          </div>
        </div>

        {/* 16 Guti Traditional SVG Board Canvas */}
        <div 
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            background: 'linear-gradient(145deg, #2a1810 0%, #170d08 100%)',
            borderRadius: '16px',
            border: '3px solid #854d0e',
            boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.8), 0 10px 30px rgba(0, 0, 0, 0.5)',
            padding: '0.5rem',
            overflow: 'hidden'
          }}
        >
          <svg 
            viewBox="0 0 500 700" 
            style={{ width: '100%', height: 'auto', maxHeight: '56vh', display: 'block' }}
          >
            {/* Wooden Texture subtle background lines */}
            <defs>
              <linearGradient id="woodLine" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0.85" />
              </linearGradient>

              <radialGradient id="redGuti" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#fca5a5" />
                <stop offset="40%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#7f1d1d" />
              </radialGradient>

              <radialGradient id="greenGuti" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#6ee7b7" />
                <stop offset="40%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#064e3b" />
              </radialGradient>

              <radialGradient id="nodeHole" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0b0805" />
                <stop offset="80%" stopColor="#2c1a11" />
                <stop offset="100%" stopColor="#78350f" />
              </radialGradient>
            </defs>

            {/* Traditional Board Groove Lines */}
            {BOARD_LINES.map(([u, v], idx) => (
              <line
                key={`line-${idx}`}
                x1={NODES[u].x}
                y1={NODES[u].y}
                x2={NODES[v].x}
                y2={NODES[v].y}
                stroke="url(#woodLine)"
                strokeWidth="3.5"
                strokeLinecap="round"
                opacity="0.8"
              />
            ))}

            {/* Nodes (Holes) on the board */}
            {NODES.map((node) => {
              const isSelected = selectedNode === node.id;
              const isNormalTarget = validMoves.normal.includes(node.id);
              const isJumpTarget = validMoves.jumps.some(j => j.to === node.id);

              return (
                <g key={`node-${node.id}`} onClick={() => handleNodeClick(node.id)} style={{ cursor: 'pointer' }}>
                  {/* Outer groove ring */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? 18 : 11}
                    fill="url(#nodeHole)"
                    stroke={isSelected ? '#fbbf24' : '#78350f'}
                    strokeWidth={isSelected ? '3' : '1.5'}
                    style={{ transition: 'all 0.2s ease' }}
                  />

                  {/* Pulsating valid destination target highlight */}
                  {(isNormalTarget || isJumpTarget) && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="16"
                      fill={isJumpTarget ? 'rgba(239, 68, 68, 0.35)' : 'rgba(52, 211, 153, 0.35)'}
                      stroke={isJumpTarget ? '#f87171' : '#34d399'}
                      strokeWidth="2.5"
                      strokeDasharray={isJumpTarget ? '3,3' : 'none'}
                      className="animate-pulse"
                    />
                  )}

                  {/* Red Beads (P1) */}
                  {board[node.id] === 'P1' && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="14"
                      fill="url(#redGuti)"
                      stroke="#fecaca"
                      strokeWidth="1.5"
                      filter="drop-shadow(0 4px 6px rgba(0,0,0,0.6))"
                      style={{
                        transform: isSelected ? 'scale(1.15)' : 'none',
                        transformOrigin: `${node.x}px ${node.y}px`,
                        transition: 'transform 0.15s ease'
                      }}
                    />
                  )}

                  {/* Green Beads (P2) */}
                  {board[node.id] === 'P2' && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="14"
                      fill="url(#greenGuti)"
                      stroke="#a7f3d0"
                      strokeWidth="1.5"
                      filter="drop-shadow(0 4px 6px rgba(0,0,0,0.6))"
                      style={{
                        transform: isSelected ? 'scale(1.15)' : 'none',
                        transformOrigin: `${node.x}px ${node.y}px`,
                        transition: 'transform 0.15s ease'
                      }}
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Winner Banner Overlay */}
          {winner && (
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(5px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                textAlign: 'center'
              }}
            >
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: winner === 'P2' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: winner === 'P2' ? '#34d399' : '#f87171', marginBottom: '1rem' }}>
                <Trophy size={36} />
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: winner === 'P2' ? '#34d399' : '#f87171', marginBottom: '0.4rem' }}>
                {winner === 'P2' ? (gameMode === 'ai' ? '🎉 আপনি ১৬ গুটিতে জয়ী হয়েছেন!' : '🏆 Player 2 (Green) Won!') : 'Bot Master Won!'}
              </h2>

              <p style={{ fontSize: '0.88rem', color: '#cbd5e1', marginBottom: '1.5rem', maxWidth: '320px' }}>
                {winner === 'P2' && entryFee > 0
                  ? `অভিনন্দন! ১৬ গুটি চ্যাম্পিয়নশিপে জয়লাভ করে +${formatINR(winReward)} আপনার ওয়ালেটে জমা হয়েছে!`
                  : `সবগুলো গুটি দখল সম্পন্ন হয়েছে! মোট ${moveCount} চালে খেলা শেষ হয়েছে।`}
              </p>

              <button
                type="button"
                className="btn btn-primary btn-lg"
                style={{ fontWeight: 800, padding: '0.75rem 2rem' }}
                onClick={handleRestart}
              >
                <RotateCcw size={18} /> নতুন খেলা শুরু করুন (Play Again)
              </button>
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Info size={14} color="#fbbf24" />
            <span>নিয়ম: নিজের গুটি সিলেক্ট করে ফাঁকা ঘরে চাল দিন বা প্রতিপক্ষের গুটির উপর দিয়ে লাফিয়ে কেটে ফেলুন।</span>
          </div>
          <div>Moves: <strong>{moveCount}</strong></div>
        </div>
      </div>
    </div>
  );
}
