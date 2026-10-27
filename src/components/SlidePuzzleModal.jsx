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
  Zap,
  Globe
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/finance';

export default function SlidePuzzleModal({ isOpen, onClose, isDailyTask = false, task = null }) {
  const { rewardWallet, playSoloSkillGame, completeTask, showToast, userMembershipTier } = useApp();

  const [gridSize, setGridSize] = useState(3); // 3 for 3x3 (8-puzzle), 4 for 4x4 (15-puzzle)
  const [tiles, setTiles] = useState([]);
  const [emptyIndex, setEmptyIndex] = useState(8);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // If daily task, fee is 0, reward is task.reward
  const entryFee = isDailyTask ? 0 : (gridSize === 3 ? 5 : 10);
  const rewardAmount = isDailyTask ? (task?.reward || 40) : (gridSize === 3 ? 8 : 16);
  const initialDuration = isDailyTask ? (task?.duration || 60) : (gridSize === 3 ? 60 : 120);

  // Initialize a guaranteed solvable puzzle by randomly sliding from solved state
  const initializeSolvableBoard = (size) => {
    const totalTiles = size * size;
    let board = Array.from({ length: totalTiles - 1 }, (_, i) => i + 1);
    board.push(null); // empty space at the end
    let emptyPos = totalTiles - 1;

    // Perform random valid slides to ensure it is 100% solvable
    const numShuffles = size === 3 ? 40 : 65;
    for (let i = 0; i < numShuffles; i++) {
      const validNeighbors = [];
      const row = Math.floor(emptyPos / size);
      const col = emptyPos % size;

      if (row > 0) validNeighbors.push(emptyPos - size); // Up
      if (row < size - 1) validNeighbors.push(emptyPos + size); // Down
      if (col > 0) validNeighbors.push(emptyPos - 1); // Left
      if (col < size - 1) validNeighbors.push(emptyPos + 1); // Right

      const randomNeighbor = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
      board[emptyPos] = board[randomNeighbor];
      board[randomNeighbor] = null;
      emptyPos = randomNeighbor;
    }

    setTiles(board);
    setEmptyIndex(emptyPos);
    setMoves(0);
    setIsWon(false);
    setIsGameOver(false);
    setTimeLeft(initialDuration);
  };

  // Start game match
  const handleStartGame = () => {
    if (!isDailyTask) {
      if (rewardWallet < entryFee) {
        showToast(`Insufficient Task Wallet! Entry fee is ${formatINR(entryFee)}. You cannot use membership capital.`, 'error');
        return;
      }

      const feeDeducted = playSoloSkillGame({
        gameId: `puzzle_${gridSize}x${gridSize}`,
        gameTitle: `${gridSize}x${gridSize} Slide Number Puzzle`,
        entryFee: entryFee,
        rewardAmount: rewardAmount,
        won: false,
      });

      if (!feeDeducted) return;
    }

    initializeSolvableBoard(gridSize);
    setIsPlaying(true);
  };

  // Auto-solve demo trigger for testing
  const handleAutoSolve = () => {
    const totalTiles = gridSize * gridSize;
    let solved = Array.from({ length: totalTiles - 1 }, (_, i) => i + 1);
    solved.push(null);
    setTiles(solved);
    setEmptyIndex(totalTiles - 1);
    setIsWon(true);
    setIsPlaying(false);

    if (isDailyTask) {
      completeTask({
        taskId: task?.id || 'slide3_1',
        taskTitle: task?.title || '3×3 Slide Number Puzzle Challenge',
        rewardAmount: rewardAmount,
        meta: `Solved 3×3 slide puzzle in ${moves + 1} moves within countdown!`,
      });
    } else {
      playSoloSkillGame({
        gameId: `puzzle_${gridSize}x${gridSize}`,
        gameTitle: `${gridSize}x${gridSize} Slide Number Puzzle`,
        entryFee: 0,
        rewardAmount: rewardAmount,
        won: true,
      });
    }
    showToast(`🏆 Puzzle Solved! +${formatINR(rewardAmount)} awarded!`);
  };

  // Handle tile slide
  const handleTileClick = (index) => {
    if (!isPlaying || isWon || isGameOver) return;

    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const emptyRow = Math.floor(emptyIndex / gridSize);
    const emptyCol = emptyIndex % gridSize;

    // Check if adjacent
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

    // Check if solved
    const isSolved = newTiles.every((val, i) => {
      if (i === newTiles.length - 1) return val === null;
      return val === i + 1;
    });

    if (isSolved) {
      setIsWon(true);
      setIsPlaying(false);

      if (isDailyTask) {
        completeTask({
          taskId: task?.id || 'slide3_1',
          taskTitle: task?.title || '3×3 Slide Number Puzzle Challenge',
          rewardAmount: rewardAmount,
          meta: `Solved 3×3 slide puzzle in ${moves + 1} moves within countdown!`,
        });
      } else {
        playSoloSkillGame({
          gameId: `puzzle_${gridSize}x${gridSize}`,
          gameTitle: `${gridSize}x${gridSize} Slide Number Puzzle`,
          entryFee: 0,
          rewardAmount: rewardAmount,
          won: true,
        });
      }
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
          showToast('Time is up! Puzzle unsolved within countdown.', 'warning');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, isWon, isGameOver]);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setGridSize(3);
      initializeSolvableBoard(3);
      setIsPlaying(false);
    }
  }, [isOpen]);

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
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                  {isDailyTask ? 'Daily Task: 3×3 Slide Puzzle' : 'Slide Number Puzzle'}
                </h2>
                <span className="badge badge-emerald" style={{ fontSize: '0.62rem' }}>100% Skill</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Arrange numbers 1 to {gridSize * gridSize - 1} before the countdown expires
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Grid Size Selector (only for solo arena) */}
        {!isDailyTask && (
          <div>
            <div style={{ marginBottom: '1rem', padding: '0.65rem 0.85rem', background: 'rgba(59, 130, 246, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59, 130, 246, 0.25)', display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'left' }}>
              <Globe size={16} color="#60a5fa" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                <strong style={{ color: '#60a5fa' }}>🌐 Open to All Members ({userMembershipTier?.tierBadge || 'Starter'}):</strong> Any membership tier can play solo wager matches by matching the Boot Amount from Task Wallet!
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', justifyContent: 'center' }}>
              <button
                className={`btn ${gridSize === 3 ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                disabled={isPlaying}
                onClick={() => { setGridSize(3); initializeSolvableBoard(3); }}
              >
                3×3 Grid (Boot {formatINR(5)} • Win {formatINR(8)})
              </button>
              <button
                className={`btn ${gridSize === 4 ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                disabled={isPlaying}
                onClick={() => { setGridSize(4); initializeSolvableBoard(4); }}
              >
                4×4 Grid (Boot {formatINR(10)} • Win {formatINR(16)})
              </button>
            </div>
          </div>
        )}

        {/* Status Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: timeLeft <= 15 ? '#f87171' : '#fbbf24', fontWeight: 700 }}>
            <Clock size={16} /> {timeLeft}s Left
          </div>
          <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            Moves: <strong style={{ color: '#ffffff' }}>{moves}</strong>
          </div>
          <div style={{ fontWeight: 800, color: '#34d399' }}>
            Win: {formatINR(rewardAmount)}
          </div>
        </div>

        {/* Puzzle Board */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`, 
            gap: '8px', 
            width: gridSize === 3 ? 300 : 340, 
            height: gridSize === 3 ? 300 : 340, 
            margin: '0 auto 1.5rem auto',
            background: 'rgba(15, 23, 42, 0.8)',
            padding: 10,
            borderRadius: '16px',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            opacity: isPlaying ? 1 : 0.6,
            pointerEvents: isPlaying ? 'auto' : 'none'
          }}
        >
          {tiles.map((val, idx) => {
            const isCorrect = val === idx + 1;
            return (
              <div
                key={idx}
                onClick={() => handleTileClick(idx)}
                style={{
                  background: val === null 
                    ? 'transparent' 
                    : isCorrect 
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.4) 0%, rgba(5, 150, 105, 0.7) 100%)' 
                      : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                  border: val === null ? 'none' : isCorrect ? '1.5px solid #34d399' : '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: gridSize === 3 ? '1.8rem' : '1.4rem',
                  fontWeight: 900,
                  color: val === null ? 'transparent' : '#ffffff',
                  cursor: val === null ? 'default' : 'pointer',
                  userSelect: 'none',
                  transition: 'all 0.15s ease',
                  boxShadow: val === null ? 'none' : '0 4px 10px rgba(0,0,0,0.3)'
                }}
              >
                {val}
              </div>
            );
          })}
        </div>

        {/* Victory Card */}
        {isWon && (
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
            <Trophy size={28} color="#34d399" style={{ margin: '0 auto 0.4rem auto' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399' }}>
              Puzzle Solved in {moves} Moves!
            </div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
              +{formatINR(rewardAmount)} credited instantly to your wallet.
            </div>
          </div>
        )}

        {isGameOver && !isWon && (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
            <div style={{ color: '#f87171', fontWeight: 800 }}>Time Expired! (Task Failed)</div>
            <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
              {isDailyTask ? 'You did not arrange the numbers within 60s. Task reward forfeited for today.' : `You can retry anytime by paying the ${formatINR(entryFee)} fee.`}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {!isPlaying ? (
            <button
              type="button"
              className="btn btn-primary btn-lg"
              style={{ flex: 1, fontWeight: 800 }}
              onClick={handleStartGame}
            >
              <Zap size={18} /> {isDailyTask ? 'Start 60s Daily Challenge' : `Play Game (${formatINR(entryFee)} Entry Fee)`}
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => {
                  setIsPlaying(false);
                  setIsGameOver(true);
                }}
              >
                Surrender
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAutoSolve}
                title="Demo quick test solve"
                style={{ fontSize: '0.75rem' }}
              >
                ⚡ Demo Auto-Solve
              </button>
            </>
          )}
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>

        {/* Strict Wallet Protection Notice */}
        <div style={{ marginTop: '1rem', fontSize: '0.72rem', color: '#94a3b8' }}>
          🔒 <strong>Fair Skill Rule:</strong> Strictly time-bounded. Only valid cognitive solutions completed before the countdown qualify for rewards.
        </div>
      </div>
    </div>
  );
}
