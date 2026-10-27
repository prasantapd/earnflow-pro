import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Clock, 
  Award, 
  RotateCw, 
  Trophy, 
  AlertCircle, 
  CheckCircle2, 
  Grid,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/finance';

export default function SlidePuzzleModal({ isOpen, onClose }) {
  const { rewardWallet, playSoloSkillGame, showToast } = useApp();

  const [gridSize, setGridSize] = useState(3); // 3 for 3x3 (8-puzzle), 4 for 4x4 (15-puzzle)
  const [tiles, setTiles] = useState([]);
  const [emptyIndex, setEmptyIndex] = useState(8);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const entryFee = gridSize === 3 ? 5 : 10;
  const rewardAmount = gridSize === 3 ? 8 : 16;
  const initialDuration = gridSize === 3 ? 60 : 120;

  // Initialize a guaranteed solvable puzzle by randomly sliding from solved state
  const initializeSolvableBoard = (size) => {
    const totalTiles = size * size;
    let board = Array.from({ length: totalTiles - 1 }, (_, i) => i + 1);
    board.push(null); // empty space at the end
    let emptyPos = totalTiles - 1;

    // Perform 40-50 random valid slides to ensure it is 100% solvable
    const numShuffles = size === 3 ? 45 : 70;
    for (let i = 0; i < numShuffles; i++) {
      const validNeighbors = [];
      const row = Math.floor(emptyPos / size);
      const col = emptyPos % size;

      if (row > 0) validNeighbors.push(emptyPos - size); // Up
      if (row < size - 1) validNeighbors.push(emptyPos + size); // Down
      if (col > 0) validNeighbors.push(emptyPos - 1); // Left
      if (col < size - 1) validNeighbors.push(emptyPos + 1); // Right

      const randomNeighbor = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
      // Swap empty with neighbor
      board[emptyPos] = board[randomNeighbor];
      board[randomNeighbor] = null;
      emptyPos = randomNeighbor;
    }

    setTiles(board);
    setEmptyIndex(emptyPos);
    setMoves(0);
    setIsWon(false);
    setIsGameOver(false);
    setTimeLeft(size === 3 ? 60 : 120);
  };

  // Start new paid game match
  const handleStartGame = () => {
    if (rewardWallet < entryFee) {
      showToast(`Insufficient Task Wallet! Entry fee is ${formatINR(entryFee)}. You cannot use membership capital.`, 'error');
      return;
    }

    // Deduct fee and start timer
    const feeDeducted = playSoloSkillGame({
      gameId: `puzzle_${gridSize}x${gridSize}`,
      gameTitle: `${gridSize}x${gridSize} Slide Number Puzzle`,
      entryFee: entryFee,
      rewardAmount: rewardAmount,
      won: false,
    });

    if (!feeDeducted) return;

    initializeSolvableBoard(gridSize);
    setIsPlaying(true);
  };

  // Handle tile slide
  const handleTileClick = (index) => {
    if (!isPlaying || isWon || isGameOver) return;

    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const emptyRow = Math.floor(emptyIndex / gridSize);
    const emptyCol = emptyIndex % gridSize;

    // Check if adjacent (same row and col dist 1, or same col and row dist 1)
    const isAdjacent = 
      (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
      (col === emptyCol && Math.abs(row - emptyRow) === 1);

    if (!isAdjacent) return;

    // Slide tile
    const newTiles = [...tiles];
    newTiles[emptyIndex] = newTiles[index];
    newTiles[index] = null;

    setTiles(newTiles);
    setEmptyIndex(index);
    setMoves((prev) => prev + 1);

    // Check if solved: [1, 2, ..., N-1, null]
    const isSolved = newTiles.every((val, i) => {
      if (i === newTiles.length - 1) return val === null;
      return val === i + 1;
    });

    if (isSolved) {
      setIsWon(true);
      setIsPlaying(false);
      // Credit prize
      playSoloSkillGame({
        gameId: `puzzle_${gridSize}x${gridSize}`,
        gameTitle: `${gridSize}x${gridSize} Slide Number Puzzle`,
        entryFee: 0, // already paid
        rewardAmount: rewardAmount,
        won: true,
      });
      showToast(`🏆 Genius! Puzzle solved in ${moves + 1} moves! +${formatINR(rewardAmount)} won!`);
    }
  };

  // Countdown timer
  useEffect(() => {
    if (!isPlaying || isWon || isGameOver) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsGameOver(true);
          setIsPlaying(false);
          showToast('Time is up! You ran out of time on the puzzle.', 'warning');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, isWon, isGameOver]);

  // Reset when modal closes or switches grid
  useEffect(() => {
    if (isOpen) {
      initializeSolvableBoard(gridSize);
      setIsPlaying(false);
    }
  }, [isOpen, gridSize]);

  if (!isOpen) return null;

  const timePercent = Math.round((timeLeft / initialDuration) * 100);

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520, textAlign: 'center' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
              <Grid size={22} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Slide Number Puzzle</h2>
                <span className="badge badge-emerald" style={{ fontSize: '0.62rem' }}>100% Skill</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Arrange numbers in ascending order before the countdown expires
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Grid Size & Difficulty Selector */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', justifyContent: 'center' }}>
          <button
            className={`btn ${gridSize === 3 ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            disabled={isPlaying}
            onClick={() => { setGridSize(3); initializeSolvableBoard(3); }}
          >
            3×3 Grid (Entry {formatINR(5)} • Win {formatINR(8)})
          </button>
          <button
            className={`btn ${gridSize === 4 ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            disabled={isPlaying}
            onClick={() => { setGridSize(4); initializeSolvableBoard(4); }}
          >
            4×4 Grid (Entry {formatINR(10)} • Win {formatINR(16)})
          </button>
        </div>

        {/* Gameplay Stats Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <div className="glass-card" style={{ padding: '0.6rem' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase' }}>Time Left</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: timeLeft <= 15 ? '#ef4444' : '#fbbf24' }}>
              {timeLeft}s
            </div>
          </div>

          <div className="glass-card" style={{ padding: '0.6rem' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase' }}>Moves</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#60a5fa' }}>
              {moves}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '0.6rem' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase' }}>Prize Pool</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399' }}>
              {formatINR(rewardAmount)}
            </div>
          </div>
        </div>

        {/* Time Progress Bar */}
        <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden', marginBottom: '1.25rem' }}>
          <div 
            style={{ 
              height: '100%', 
              width: `${timePercent}%`, 
              background: timeLeft <= 15 ? '#ef4444' : 'linear-gradient(90deg, #10b981, #fbbf24)', 
              transition: 'width 1s linear' 
            }} 
          />
        </div>

        {/* The Slide Puzzle Board */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`, 
            gap: '8px', 
            maxWidth: gridSize === 3 ? 320 : 360, 
            margin: '0 auto 1.5rem',
            padding: '12px',
            background: 'rgba(15, 23, 42, 0.8)',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid rgba(99, 102, 241, 0.3)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
          }}
        >
          {tiles.map((val, idx) => {
            const isTarget = val !== null && val === idx + 1;
            return (
              <button
                key={idx}
                type="button"
                disabled={!isPlaying || val === null || isWon || isGameOver}
                onClick={() => handleTileClick(idx)}
                style={{
                  aspectRatio: '1',
                  borderRadius: '10px',
                  border: val === null ? 'none' : isTarget ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(99, 102, 241, 0.35)',
                  background: val === null 
                    ? 'transparent' 
                    : isTarget 
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(6, 182, 212, 0.2) 100%)' 
                      : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                  color: isTarget ? '#34d399' : '#f8fafc',
                  fontSize: gridSize === 3 ? '1.5rem' : '1.2rem',
                  fontWeight: 800,
                  cursor: (isPlaying && val !== null) ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                  boxShadow: val === null ? 'none' : '0 4px 10px rgba(0, 0, 0, 0.3)'
                }}
              >
                {val}
              </button>
            );
          })}
        </div>

        {/* Win / Loss Overlay Alert */}
        {isWon && (
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#34d399', fontWeight: 800, fontSize: '1.05rem' }}>
              <Trophy size={20} />
              <span>Solved Successfully! You Won {formatINR(rewardAmount)}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
              Winnings credited instantly to your Task Wallet.
            </div>
          </div>
        )}

        {isGameOver && !isWon && (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
            <div style={{ color: '#f87171', fontWeight: 800 }}>Time Expired!</div>
            <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
              You can retry anytime by paying the {formatINR(entryFee)} task wallet fee.
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {!isPlaying ? (
            <button
              type="button"
              className="btn btn-primary btn-lg"
              style={{ flex: 1, fontWeight: 800 }}
              onClick={handleStartGame}
            >
              <Zap size={18} /> Play Game ({formatINR(entryFee)} Entry Fee)
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-secondary btn-lg"
              style={{ flex: 1 }}
              onClick={() => {
                if (window.confirm('Surrender current match? Entry fee will be forfeited.')) {
                  setIsPlaying(false);
                  setIsGameOver(true);
                }
              }}
            >
              Surrender Match
            </button>
          )}
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>

        {/* Strict Wallet Protection Notice */}
        <div style={{ marginTop: '1rem', fontSize: '0.72rem', color: '#94a3b8' }}>
          🔒 <strong>Wallet Separation:</strong> Entry fees are deducted strictly from your Task Earnings Wallet. Locked deposit capital is 100% protected and cannot be gambled.
        </div>
      </div>
    </div>
  );
}
