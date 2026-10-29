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
  Globe,
  Lock,
  ShieldCheck,
  ArrowRight,
  Wallet
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/finance';

export default function SlidePuzzleModal({ 
  isOpen, 
  onClose, 
  isDailyTask = false, 
  task = null,
  onOpenDeposit = null,
  setActiveTab = null 
}) {
  const { 
    rewardWallet, 
    totalLockedPrincipal, 
    tasksCompletedToday, 
    activePlan, 
    playSoloSkillGame, 
    completeTask, 
    showToast, 
    userMembershipTier 
  } = useApp();

  // Mode can be 'daily' or 'arena'
  const [currentMode, setCurrentMode] = useState(isDailyTask ? 'daily' : 'arena');
  const [gridSize, setGridSize] = useState(isDailyTask ? 3 : 4); // Daily is strictly 3x3; Arena defaults to 4x4
  const [tiles, setTiles] = useState([]);
  const [emptyIndex, setEmptyIndex] = useState(8);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Sync mode when modal opens or isDailyTask changes
  useEffect(() => {
    if (isOpen) {
      const mode = isDailyTask ? 'daily' : 'arena';
      setCurrentMode(mode);
      const size = mode === 'daily' ? 3 : 4;
      setGridSize(size);
      initializeSolvableBoard(size);
      setIsPlaying(false);
    }
  }, [isOpen, isDailyTask]);

  const isDaily = currentMode === 'daily';
  const taskId = task?.id || 'slide3_1';
  const isAlreadyCompletedToday = isDaily && Boolean(tasksCompletedToday?.[taskId]);

  // Economics
  const entryFee = isDaily ? 0 : (gridSize === 3 ? 5 : 10);
  const taskMultiplier = userMembershipTier?.taskMultiplier || 1.0;
  const rewardAmount = isDaily 
    ? (Number(task?.reward) || Math.round(40 * taskMultiplier)) 
    : (gridSize === 3 ? 8 : 16);
  const initialDuration = isDaily ? (task?.duration || 60) : (gridSize === 3 ? 60 : 120);

  // Solvable board initialization: Start from solved state and apply random valid moves
  const initializeSolvableBoard = (size) => {
    const totalTiles = size * size;
    let board = Array.from({ length: totalTiles - 1 }, (_, i) => i + 1);
    board.push(null);
    let emptyPos = totalTiles - 1;

    const numShuffles = size === 3 ? 42 : 75;
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
    setTimeLeft(size === 3 ? (isDaily ? (task?.duration || 60) : 60) : 120);
  };

  // Switch to Arena Mode
  const handleSwitchToArena = () => {
    setCurrentMode('arena');
    setGridSize(4);
    initializeSolvableBoard(4);
    setIsPlaying(false);
  };

  // Start game match
  const handleStartGame = () => {
    if (isDaily) {
      if (!activePlan) {
        showToast('Active membership plan required! Subscribe to earn daily task rewards.', 'error');
        if (onOpenDeposit) onOpenDeposit();
        else if (setActiveTab) setActiveTab('plans');
        return;
      }
      if (isAlreadyCompletedToday) {
        showToast('You have already completed the Daily 3×3 challenge today! Play 4×4 Arena mode instead.', 'warning');
        return;
      }
    } else {
      // Arena mode: strictly check Task Wallet winnings
      if (rewardWallet < entryFee) {
        showToast(`Insufficient Task Wallet! Entry fee is ${formatINR(entryFee)}. Membership capital is 100% locked and cannot be wagered.`, 'error');
        return;
      }

      const feeDeducted = playSoloSkillGame({
        gameId: `puzzle_${gridSize}x${gridSize}`,
        gameTitle: `${gridSize}×${gridSize} Slide Number Puzzle Arena`,
        entryFee: entryFee,
        rewardAmount: rewardAmount,
        won: false,
      });

      if (!feeDeducted) return;
    }

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

      if (isDaily) {
        completeTask({
          taskId: taskId,
          taskTitle: task?.title || '3×3 Slide Number Puzzle Challenge',
          rewardAmount: rewardAmount,
          meta: `Solved 3×3 daily slide puzzle in ${moves + 1} moves within countdown!`,
        });
      } else {
        playSoloSkillGame({
          gameId: `puzzle_${gridSize}x${gridSize}`,
          gameTitle: `${gridSize}×${gridSize} Slide Number Puzzle Arena`,
          entryFee: 0,
          rewardAmount: rewardAmount,
          won: true,
        });
      }
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

  if (!isOpen) return null;

  const hasSufficientWinnings = rewardWallet >= entryFee;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540, textAlign: 'center' }}>
        
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: 42, height: 42, borderRadius: '12px', background: isDaily ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDaily ? '#34d399' : '#818cf8' }}>
              <Grid size={24} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                  {isDaily ? 'Daily Task: 3×3 Slide Puzzle' : '4×4 Slide Number Puzzle Arena'}
                </h2>
                <span className={`badge ${isDaily ? 'badge-emerald' : 'badge-indigo'}`} style={{ fontSize: '0.62rem' }}>
                  {isDaily ? '1 Play / Day' : 'Unlimited Skill Matches'}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                {isDaily 
                  ? 'Complete your single daily 3×3 puzzle task to claim today\'s task reward' 
                  : 'Play unlimited 4×4 matches using Task Wallet winnings • Principal 100% Protected'}
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* FINANCIAL SAFETY & WALLET BREAKDOWN BADGE */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1rem', textAlign: 'left' }}>
          <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Wallet size={12} color="#34d399" /> Task Wallet (Winnings)
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399', marginTop: '0.15rem' }}>
              {formatINR(rewardWallet)}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#cbd5e1' }}>
              {isDaily ? 'Daily rewards credit here' : 'Wagered for entry fees'}
            </div>
          </div>

          <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(59, 130, 246, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Lock size={12} color="#60a5fa" /> Membership Principal
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#60a5fa', marginTop: '0.15rem' }}>
              {formatINR(totalLockedPrincipal)}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#93c5fd', fontWeight: 600 }}>
              🔒 100% Locked & Protected
            </div>
          </div>
        </div>

        {/* CONDITION 1: DAILY TASK WITHOUT ACTIVE MEMBERSHIP PLAN */}
        {isDaily && !activePlan && (
          <div style={{ padding: '2rem 1.5rem', background: 'rgba(239, 68, 68, 0.08)', border: '1.5px solid rgba(239, 68, 68, 0.35)', borderRadius: 'var(--radius-lg)', marginBottom: '1.25rem' }}>
            <Lock size={42} color="#f87171" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fca5a5', marginBottom: '0.4rem' }}>
              Membership Plan Required
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, maxWidth: '420px', margin: '0 auto 1.25rem auto' }}>
              Daily tasks and verified monetary rewards are strictly reserved for active plan subscribers (min ₹2,000). You cannot play daily tasks without an active membership.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button 
                className="btn btn-primary btn-md"
                style={{ fontWeight: 800 }}
                onClick={() => {
                  onClose();
                  if (onOpenDeposit) onOpenDeposit();
                  else if (setActiveTab) setActiveTab('plans');
                }}
              >
                View Plans & Subscribe (Min ₹2,000) →
              </button>
              <button className="btn btn-secondary btn-md" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        )}

        {/* CONDITION 2: DAILY TASK ALREADY COMPLETED TODAY (1 PLAY LIMIT) */}
        {isDaily && activePlan && isAlreadyCompletedToday && (
          <div style={{ padding: '1.75rem 1.5rem', background: 'rgba(16, 185, 129, 0.08)', border: '1.5px solid rgba(16, 185, 129, 0.35)', borderRadius: 'var(--radius-lg)', marginBottom: '1.25rem' }}>
            <CheckCircle2 size={42} color="#34d399" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399', marginBottom: '0.35rem' }}>
              ✓ Daily 3×3 Challenge Completed Today!
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, maxWidth: '440px', margin: '0 auto 1rem auto' }}>
              You have already completed today's 3×3 sliding puzzle and claimed <strong style={{ color: '#34d399' }}>+{formatINR(rewardAmount)}</strong> in your Task Wallet! Daily tasks can only be played <strong>once per day</strong> and reset at 00:00 midnight.
            </p>

            {/* Prompt to switch to unlimited Arena Mode */}
            <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <Zap size={18} color="#818cf8" />
                <strong style={{ color: '#c7d2fe', fontSize: '0.9rem' }}>Want to keep playing puzzle games?</strong>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: 0 }}>
                Enter the <strong>4×4 Slide Puzzle Arena</strong> to play unlimited matches using your Task Wallet winnings! Win ₹16 every match!
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button 
                className="btn btn-primary btn-md"
                style={{ fontWeight: 800, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
                onClick={handleSwitchToArena}
              >
                <Grid size={16} /> Enter 4×4 Slide Arena (Unlimited) →
              </button>
              <button className="btn btn-secondary btn-md" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        )}

        {/* CONDITION 3: ACTIVE PLAYABLE PUZZLE (DAILY UNPLAYED OR ARENA MODE) */}
        {(!isDaily || (activePlan && !isAlreadyCompletedToday)) && (
          <div>
            {/* Arena Grid Size Selector (Only in Arena Mode) */}
            {!isDaily && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <button
                    className={`btn ${gridSize === 4 ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    disabled={isPlaying}
                    onClick={() => { setGridSize(4); initializeSolvableBoard(4); }}
                    style={{ fontWeight: gridSize === 4 ? 800 : 500 }}
                  >
                    ⭐ 4×4 Arena Grid (Boot {formatINR(10)} • Win {formatINR(16)})
                  </button>
                  <button
                    className={`btn ${gridSize === 3 ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    disabled={isPlaying}
                    onClick={() => { setGridSize(3); initializeSolvableBoard(3); }}
                    style={{ fontWeight: gridSize === 3 ? 800 : 500 }}
                  >
                    3×3 Quick Match (Boot {formatINR(5)} • Win {formatINR(8)})
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
                Grid: <strong style={{ color: '#ffffff' }}>{gridSize}×{gridSize}</strong> • Moves: <strong style={{ color: '#ffffff' }}>{moves}</strong>
              </div>
              <div style={{ fontWeight: 800, color: '#34d399' }}>
                Prize: {formatINR(rewardAmount)}
              </div>
            </div>

            {/* Puzzle Board */}
            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`, 
                gap: '8px', 
                width: gridSize === 3 ? 290 : 340, 
                height: gridSize === 3 ? 290 : 340, 
                margin: '0 auto 1.25rem auto',
                background: 'rgba(15, 23, 42, 0.85)',
                padding: 10,
                borderRadius: '16px',
                border: '2px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                opacity: isPlaying ? 1 : 0.65,
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
                          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.45) 0%, rgba(5, 150, 105, 0.8) 100%)' 
                          : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                      border: val === null ? 'none' : isCorrect ? '1.5px solid #34d399' : '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: gridSize === 3 ? '1.8rem' : '1.35rem',
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

            {/* Victory Banner */}
            {isWon && (
              <div style={{ padding: '1.25rem', background: 'rgba(16, 185, 129, 0.15)', border: '1.5px solid #10b981', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                <Trophy size={32} color="#34d399" style={{ margin: '0 auto 0.4rem auto' }} />
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>
                  🏆 Puzzle Solved in {moves} Moves!
                </div>
                <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                  +{formatINR(rewardAmount)} credited instantly to your Task Wallet.
                </div>
                {!isDaily && (
                  <div style={{ fontSize: '0.78rem', color: '#a7f3d0', marginTop: '0.4rem', fontWeight: 600 }}>
                    ✨ Play again as many times as you like with your winnings!
                  </div>
                )}
              </div>
            )}

            {/* Game Over Banner */}
            {isGameOver && !isWon && (
              <div style={{ padding: '1.25rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                <div style={{ color: '#f87171', fontWeight: 800, fontSize: '1.05rem' }}>Time Expired! (Task Failed)</div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                  {isDaily 
                    ? 'You did not arrange the numbers within the countdown timer. Daily task resets at 00:00 midnight.' 
                    : `You can replay anytime using your Task Wallet winnings (${formatINR(entryFee)} boot fee).`}
                </div>
              </div>
            )}

            {/* Insufficient Balance Notice for Arena Mode */}
            {!isDaily && !isPlaying && !hasSufficientWinnings && (
              <div style={{ padding: '0.85rem 1rem', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fca5a5', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                  <AlertCircle size={16} /> Insufficient Task Wallet Balance
                </div>
                <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: 0 }}>
                  Match boot fee is <strong>{formatINR(entryFee)}</strong>, but your Task Wallet balance is <strong>{formatINR(rewardWallet)}</strong>. Complete daily tasks to earn more! 
                  <br />
                  <span style={{ color: '#60a5fa', fontWeight: 600 }}>
                    🔒 Principal Protection: Your membership investment ({formatINR(totalLockedPrincipal)}) is 100% locked and cannot be wagered.
                  </span>
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {!isPlaying ? (
                <>
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    style={{ flex: 1, fontWeight: 800 }}
                    onClick={handleStartGame}
                    disabled={!isDaily && !hasSufficientWinnings}
                  >
                    <Zap size={18} /> {
                      isDaily 
                        ? 'Start 60s Daily Challenge (Free)' 
                        : (isWon || isGameOver)
                          ? `Play Again (Boot ${formatINR(entryFee)})` 
                          : `Start ${gridSize}×${gridSize} Match (Boot ${formatINR(entryFee)})`
                    }
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={onClose}>
                    Close
                  </button>
                </>
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
                </>
              )}
            </div>

            {/* Strict Wallet Protection Notice */}
            <div style={{ marginTop: '1rem', fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4 }}>
              🔒 <strong>Capital Protection Guarantee:</strong> Under no circumstance can membership capital be wagered. All arena matches are strictly powered by earned Task Wallet winnings.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
