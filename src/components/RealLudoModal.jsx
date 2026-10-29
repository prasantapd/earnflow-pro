import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Trophy, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  Zap, 
  Coins, 
  Dice5, 
  Users, 
  Bot,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/finance';

/* =========================================================================
   STANDARD 15x15 LUDO BOARD COORDINATE MAPPING & PATH CONSTANTS
   ========================================================================= */

// Standard 52-square perimeter path in (row, col) coordinates (0 to 14)
export const LUDO_TRACK = [
  { r: 6, c: 1, isSafe: true },   // 0: Red Start (Safe)
  { r: 6, c: 2 },                 // 1
  { r: 6, c: 3 },                 // 2
  { r: 6, c: 4 },                 // 3
  { r: 6, c: 5 },                 // 4
  { r: 5, c: 6 },                 // 5
  { r: 4, c: 6 },                 // 6
  { r: 3, c: 6 },                 // 7
  { r: 2, c: 6, isSafe: true },   // 8: Safe Star
  { r: 1, c: 6 },                 // 9
  { r: 0, c: 6 },                 // 10
  { r: 0, c: 7 },                 // 11
  { r: 0, c: 8 },                 // 12
  { r: 1, c: 8, isSafe: true },   // 13: Green Start (Safe)
  { r: 2, c: 8 },                 // 14
  { r: 3, c: 8 },                 // 15
  { r: 4, c: 8 },                 // 16
  { r: 5, c: 8 },                 // 17
  { r: 6, c: 9 },                 // 18
  { r: 6, c: 10 },                // 19
  { r: 6, c: 11 },                // 20
  { r: 6, c: 12, isSafe: true },  // 21: Safe Star
  { r: 6, c: 13 },                // 22
  { r: 6, c: 14 },                // 23
  { r: 7, c: 14 },                // 24
  { r: 8, c: 14 },                // 25
  { r: 8, c: 13, isSafe: true },  // 26: Yellow Start (Safe)
  { r: 8, c: 12 },                // 27
  { r: 8, c: 11 },                // 28
  { r: 8, c: 10 },                // 29
  { r: 8, c: 9 },                 // 30
  { r: 9, c: 8 },                 // 31
  { r: 10, c: 8 },                // 32
  { r: 11, c: 8 },                // 33
  { r: 12, c: 8, isSafe: true },  // 34: Safe Star
  { r: 13, c: 8 },                // 35
  { r: 14, c: 8 },                // 36
  { r: 14, c: 7 },                // 37
  { r: 14, c: 6 },                // 38
  { r: 13, c: 6, isSafe: true },  // 39: Blue Start (Safe)
  { r: 12, c: 6 },                // 40
  { r: 11, c: 6 },                // 41
  { r: 10, c: 6 },                // 42
  { r: 9, c: 6 },                 // 43
  { r: 8, c: 5 },                 // 44
  { r: 8, c: 4 },                 // 45
  { r: 8, c: 3 },                 // 46
  { r: 8, c: 2, isSafe: true },   // 47: Safe Star
  { r: 8, c: 1 },                 // 48
  { r: 8, c: 0 },                 // 49
  { r: 7, c: 0 },                 // 50
  { r: 6, c: 0 },                 // 51
];

// Home runways for Red and Yellow (5 steps + Home Center at index 56)
export const RED_RUNWAY = [
  { r: 7, c: 1 }, { r: 7, c: 2 }, { r: 7, c: 3 }, { r: 7, c: 4 }, { r: 7, c: 5 }, { r: 7, c: 6, isHome: true }
];

export const YELLOW_RUNWAY = [
  { r: 7, c: 13 }, { r: 7, c: 12 }, { r: 7, c: 11 }, { r: 7, c: 10 }, { r: 7, c: 9 }, { r: 7, c: 8, isHome: true }
];

// Base positions inside the 6x6 corners for red and yellow tokens
export const RED_BASE_POS = [
  { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 3, c: 2 }, { r: 3, c: 3 }
];

export const YELLOW_BASE_POS = [
  { r: 11, c: 11 }, { r: 11, c: 12 }, { r: 12, c: 11 }, { r: 12, c: 12 }
];

/* Web Audio Synthesizer for Authentic Game Sounds */
const playLudoTone = (type, enabled = true) => {
  if (!enabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'dice') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'step') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'cut') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.3);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'home') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      osc.frequency.setValueAtTime(783.99, now + 0.2);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch (e) {
    // Audio context fallback
  }
};

export default function RealLudoModal({ isOpen, onClose }) {
  const { rewardWallet, playSoloSkillGame, showToast, userMembershipTier } = useApp();

  const [entryFee, setEntryFee] = useState(10); // ₹10 boot amount
  const [tokensCount, setTokensCount] = useState(2); // 2 tokens for fast competitive match
  const [gameState, setGameState] = useState('lobby'); // 'lobby', 'playing', 'gameover'
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Turn: 'red' (You) or 'yellow' (AI Bot)
  const [currentTurn, setCurrentTurn] = useState('red');
  const [diceVal, setDiceVal] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Roll the dice to start!');
  const [hasBonusRoll, setHasBonusRoll] = useState(false);

  // Tokens State: steps = -1 (in base), 0..50 (on perimeter), 51..55 (runway), 56 (HOME)
  const [redTokens, setRedTokens] = useState([-1, -1]);
  const [yellowTokens, setYellowTokens] = useState([-1, -1]);
  const [winner, setWinner] = useState(null);

  // Reset lobby
  useEffect(() => {
    if (!isOpen) {
      setGameState('lobby');
      setRedTokens([-1, -1]);
      setYellowTokens([-1, -1]);
      setDiceVal(null);
      setWinner(null);
      setCurrentTurn('red');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Boot calculations: 10% platform commission, 90% goes to winner
  const grossPot = entryFee * 2;
  const platformCut = +(grossPot * 0.10).toFixed(2);
  const winPrize = +(grossPot - platformCut).toFixed(2);

  // Start match
  const handleStartMatch = () => {
    if (rewardWallet < entryFee) {
      showToast(`Insufficient Task Wallet! Entry fee is ${formatINR(entryFee)}. You cannot use locked membership capital.`, 'error');
      return;
    }

    const deducted = playSoloSkillGame({
      gameId: 'real_ludo',
      gameTitle: 'Real Ludo PvP Arena',
      entryFee: entryFee,
      rewardAmount: 0,
      won: false
    });

    if (!deducted) return;

    const initialTokens = Array(tokensCount).fill(-1);
    setRedTokens(initialTokens);
    setYellowTokens(initialTokens);
    setGameState('playing');
    setCurrentTurn('red');
    setDiceVal(null);
    setWinner(null);
    setStatusMsg('Your turn! Tap the Red Dice to roll (Roll 6 to open token).');
  };

  // Convert step progress (0 to 56) to (row, col)
  const getTokenCoords = (color, step, tokenIdx) => {
    if (step === -1) {
      return color === 'red' ? RED_BASE_POS[tokenIdx] : YELLOW_BASE_POS[tokenIdx];
    }
    if (color === 'red') {
      if (step <= 50) return LUDO_TRACK[step];
      const runwayIdx = step - 51;
      return RED_RUNWAY[Math.min(runwayIdx, RED_RUNWAY.length - 1)];
    } else {
      // Yellow enters at track index 26
      if (step <= 50) {
        const trackIdx = (26 + step) % 52;
        return LUDO_TRACK[trackIdx];
      }
      const runwayIdx = step - 51;
      return YELLOW_RUNWAY[Math.min(runwayIdx, YELLOW_RUNWAY.length - 1)];
    }
  };

  // Check if track square is safe star
  const isSquareSafe = (trackIdx) => {
    const safeIndices = [0, 8, 13, 21, 26, 34, 39, 47];
    return safeIndices.includes(trackIdx);
  };

  // Roll Dice
  const handleRollDice = () => {
    if (isRolling || currentTurn !== 'red' || diceVal !== null || gameState !== 'playing') return;

    setIsRolling(true);
    playLudoTone('dice', soundEnabled);

    let rollCount = 0;
    const interval = setInterval(() => {
      setDiceVal(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      if (rollCount > 6) {
        clearInterval(interval);
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setDiceVal(finalRoll);
        setIsRolling(false);
        checkValidMoves('red', finalRoll, redTokens);
      }
    }, 60);
  };

  // Check valid moves for active player
  const checkValidMoves = (color, roll, tokens) => {
    const validTokenIndices = [];

    tokens.forEach((step, idx) => {
      if (step === -1 && roll === 6) {
        validTokenIndices.push(idx); // Can open from base
      } else if (step >= 0 && step < 56) {
        if (step + roll <= 56) {
          validTokenIndices.push(idx); // Can advance
        }
      }
    });

    if (validTokenIndices.length === 0) {
      setStatusMsg(`${color === 'red' ? 'You' : 'Bot'} rolled ${roll}. No valid moves available!`);
      setTimeout(() => {
        passTurn(color === 'red' ? 'yellow' : 'red');
      }, 1000);
    } else if (validTokenIndices.length === 1 && color === 'red') {
      // Auto-move if only 1 choice
      setTimeout(() => {
        executeMove('red', validTokenIndices[0], roll);
      }, 350);
    } else {
      setStatusMsg(color === 'red' ? `You rolled ${roll}! Select a highlighted token to move.` : `Bot rolled ${roll}...`);
    }
  };

  // Execute Move
  const executeMove = (color, tokenIdx, roll) => {
    const isRed = color === 'red';
    const currentTokens = isRed ? [...redTokens] : [...yellowTokens];
    const opponentTokens = isRed ? [...yellowTokens] : [...redTokens];
    let newStep = currentTokens[tokenIdx];
    let earnedBonus = roll === 6;

    if (newStep === -1) {
      newStep = 0; // Open from base to start
      playLudoTone('step', soundEnabled);
    } else {
      newStep += roll;
      playLudoTone('step', soundEnabled);
    }

    currentTokens[tokenIdx] = newStep;

    if (newStep === 56) {
      playLudoTone('home', soundEnabled);
      earnedBonus = true; // Bonus roll for reaching home!
    }

    // Check cutting opponent (if on perimeter and not safe)
    if (newStep >= 0 && newStep <= 50) {
      const myTrackIdx = isRed ? newStep : (26 + newStep) % 52;
      const onSafeSquare = isSquareSafe(myTrackIdx);

      if (!onSafeSquare) {
        opponentTokens.forEach((oppStep, oppIdx) => {
          if (oppStep >= 0 && oppStep <= 50) {
            const oppTrackIdx = !isRed ? oppStep : (26 + oppStep) % 52;
            if (oppTrackIdx === myTrackIdx) {
              // CAPTURE!
              opponentTokens[oppIdx] = -1; // Send back to base
              earnedBonus = true;
              playLudoTone('cut', soundEnabled);
              showToast(`${isRed ? 'You' : 'Bot'} cut an opponent pawn back to base! +Bonus Roll!`, 'success');
            }
          }
        });
      }
    }

    // Update tokens state
    if (isRed) {
      setRedTokens(currentTokens);
      setYellowTokens(opponentTokens);
    } else {
      setYellowTokens(currentTokens);
      setRedTokens(opponentTokens);
    }

    // Check Victory
    const allHome = currentTokens.every((s) => s === 56);
    if (allHome) {
      handleGameOver(color);
      return;
    }

    // Next turn or bonus roll
    if (earnedBonus) {
      setDiceVal(null);
      setStatusMsg(isRed ? 'Bonus roll awarded! Roll again.' : 'Bot earned a bonus roll!');
      if (!isRed) {
        setTimeout(handleBotTurn, 1000);
      }
    } else {
      passTurn(isRed ? 'yellow' : 'red');
    }
  };

  // Pass Turn
  const passTurn = (nextTurn) => {
    setCurrentTurn(nextTurn);
    setDiceVal(null);
    if (nextTurn === 'yellow') {
      setStatusMsg('Bot is thinking...');
      setTimeout(handleBotTurn, 1000);
    } else {
      setStatusMsg('Your turn! Roll the dice.');
    }
  };

  // AI Bot Turn Execution
  const handleBotTurn = () => {
    if (gameState !== 'playing') return;

    setIsRolling(true);
    playLudoTone('dice', soundEnabled);

    setTimeout(() => {
      const botRoll = Math.floor(Math.random() * 6) + 1;
      setDiceVal(botRoll);
      setIsRolling(false);

      // AI Decision Logic:
      // Priority 1: Cut player pawn
      // Priority 2: Move into Home
      // Priority 3: Open token on 6
      // Priority 4: Advance furthest active token
      const validIndices = [];
      yellowTokens.forEach((step, idx) => {
        if (step === -1 && botRoll === 6) validIndices.push(idx);
        else if (step >= 0 && step + botRoll <= 56) validIndices.push(idx);
      });

      if (validIndices.length === 0) {
        setStatusMsg(`Bot rolled ${botRoll}. No moves possible.`);
        setTimeout(() => passTurn('red'), 1000);
        return;
      }

      // Check if any move cuts player
      let chosenIdx = validIndices[0];
      let foundCut = false;

      for (const idx of validIndices) {
        const testStep = yellowTokens[idx] === -1 ? 0 : yellowTokens[idx] + botRoll;
        if (testStep <= 50) {
          const testTrackIdx = (26 + testStep) % 52;
          if (!isSquareSafe(testTrackIdx)) {
            const cutsPlayer = redTokens.some(rStep => rStep >= 0 && rStep <= 50 && rStep === testTrackIdx);
            if (cutsPlayer) {
              chosenIdx = idx;
              foundCut = true;
              break;
            }
          }
        }
      }

      if (!foundCut) {
        // Prefer opening a 6
        const baseIdx = validIndices.find(idx => yellowTokens[idx] === -1);
        if (baseIdx !== undefined && botRoll === 6) {
          chosenIdx = baseIdx;
        } else {
          // Advance furthest token
          chosenIdx = validIndices.reduce((best, curr) => (yellowTokens[curr] > yellowTokens[best] ? curr : best), validIndices[0]);
        }
      }

      setTimeout(() => {
        executeMove('yellow', chosenIdx, botRoll);
      }, 700);
    }, 500);
  };

  // Game Over Handler
  const handleGameOver = (winningColor) => {
    setGameState('gameover');
    setWinner(winningColor);

    if (winningColor === 'red') {
      confetti({ particleCount: 120, spread: 80 });
      playLudoTone('home', soundEnabled);
      showToast(`🏆 VICTORY! You won the Ludo match and earned ${formatINR(winPrize)}!`);

      // Credit wallet
      playSoloSkillGame({
        gameId: 'real_ludo',
        gameTitle: 'Real Ludo PvP Arena',
        entryFee: 0,
        rewardAmount: winPrize,
        won: true
      });
    } else {
      showToast('Bot reached Home first. Better luck next match!', 'error');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: 650, width: '95%', padding: '1.25rem', textAlign: 'center' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ marginBottom: '0.75rem', paddingBottom: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)' }}>
              <Dice5 size={22} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Real Ludo PvP Arena</h2>
                <span className="badge badge-gold" style={{ fontSize: '0.62rem' }}>100% Authentic Rules</span>
              </div>
              <p style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                Roll 6 to open • Safe stars • Cut opponent pawns • 10% Platform Rake
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
              <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Platform Rake (10%)</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#60a5fa' }}>{formatINR(platformCut)}</div>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, textAlign: 'left', padding: '0.75rem', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px' }}>
              📌 <strong>Real Ludo Rules:</strong>
              <ul style={{ paddingLeft: '1.2rem', marginTop: '0.3rem' }}>
                <li>Roll a <strong>6</strong> to bring a token out of base to the starting star square.</li>
                <li>Rolling a 6 grants an immediate <strong>Bonus Roll</strong>!</li>
                <li>Landing on an opponent pawn outside safe star squares <strong>cuts them back to base</strong> and grants you a bonus roll!</li>
                <li>First player to navigate both tokens safely into Home wins the pot.</li>
              </ul>
            </div>

            <button 
              className="btn btn-gold btn-lg" 
              style={{ width: '100%', fontWeight: 800, fontSize: '1rem', boxShadow: '0 4px 18px rgba(245, 158, 11, 0.4)' }}
              onClick={handleStartMatch}
            >
              <Dice5 size={18} /> Start Match (Boot {formatINR(entryFee)})
            </button>
          </div>
        )}

        {/* IN-GAME BOARD VIEW */}
        {(gameState === 'playing' || gameState === 'gameover') && (
          <div>
            {/* Status Command Strip */}
            <div style={{ 
              marginBottom: '0.75rem', 
              padding: '0.6rem 0.85rem', 
              borderRadius: '8px', 
              background: currentTurn === 'red' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              border: `1px solid ${currentTurn === 'red' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              fontSize: '0.82rem',
              fontWeight: 700
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ 
                  width: 10, 
                  height: 10, 
                  borderRadius: '50%', 
                  background: currentTurn === 'red' ? '#ef4444' : '#f59e0b',
                  boxShadow: `0 0 8px ${currentTurn === 'red' ? '#ef4444' : '#f59e0b'}` 
                }} />
                <span>{statusMsg}</span>
              </div>
              <span className="badge badge-gold" style={{ fontSize: '0.68rem' }}>
                Pot: {formatINR(winPrize)}
              </span>
            </div>

            {/* 15x15 SVG GRAPHICAL LUDO BOARD */}
            <div style={{ 
              width: '100%', 
              maxWidth: '380px', 
              margin: '0 auto 1rem', 
              aspectRatio: '1/1',
              position: 'relative',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7)',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              background: '#0f172a'
            }}>
              <svg viewBox="0 0 15 15" style={{ width: '100%', height: '100%', display: 'block' }}>
                {/* 4 Quadrant Bases */}
                {/* Red Base (Top Left: rows 0-5, cols 0-5) */}
                <rect x="0" y="0" width="6" height="6" fill="#dc2626" />
                <rect x="1" y="1" width="4" height="4" fill="#ffffff" rx="0.5" />
                <circle cx="2" cy="2" r="0.6" fill="#dc2626" />
                <circle cx="4" cy="2" r="0.6" fill="#dc2626" />
                <circle cx="2" cy="4" r="0.6" fill="#dc2626" />
                <circle cx="4" cy="4" r="0.6" fill="#dc2626" />

                {/* Green Base (Top Right: rows 0-5, cols 9-14) */}
                <rect x="9" y="0" width="6" height="6" fill="#16a34a" />
                <rect x="10" y="1" width="4" height="4" fill="#ffffff" rx="0.5" />
                <circle cx="11" cy="2" r="0.6" fill="#16a34a" />
                <circle cx="13" cy="2" r="0.6" fill="#16a34a" />
                <circle cx="11" cy="4" r="0.6" fill="#16a34a" />
                <circle cx="13" cy="4" r="0.6" fill="#16a34a" />

                {/* Blue Base (Bottom Left: rows 9-14, cols 0-5) */}
                <rect x="0" y="9" width="6" height="6" fill="#2563eb" />
                <rect x="1" y="10" width="4" height="4" fill="#ffffff" rx="0.5" />
                <circle cx="2" cy="11" r="0.6" fill="#2563eb" />
                <circle cx="4" cy="11" r="0.6" fill="#2563eb" />
                <circle cx="2" cy="13" r="0.6" fill="#2563eb" />
                <circle cx="4" cy="13" r="0.6" fill="#2563eb" />

                {/* Yellow Base (Bottom Right: rows 9-14, cols 9-14) */}
                <rect x="9" y="9" width="6" height="6" fill="#ca8a04" />
                <rect x="10" y="10" width="4" height="4" fill="#ffffff" rx="0.5" />
                <circle cx="11" cy="11" r="0.6" fill="#ca8a04" />
                <circle cx="13" cy="11" r="0.6" fill="#ca8a04" />
                <circle cx="11" cy="13" r="0.6" fill="#ca8a04" />
                <circle cx="13" cy="13" r="0.6" fill="#ca8a04" />

                {/* Center Home Triangle */}
                <polygon points="6,6 9,6 7.5,7.5" fill="#16a34a" />
                <polygon points="9,6 9,9 7.5,7.5" fill="#ca8a04" />
                <polygon points="9,9 6,9 7.5,7.5" fill="#2563eb" />
                <polygon points="6,9 6,6 7.5,7.5" fill="#dc2626" />

                {/* Perimeter 52 Cells */}
                {LUDO_TRACK.map((sq, idx) => {
                  let cellBg = '#1e293b';
                  if (sq.r === 6 && sq.c === 1) cellBg = '#ef4444'; // Red start
                  else if (sq.r === 1 && sq.c === 8) cellBg = '#22c55e'; // Green start
                  else if (sq.r === 8 && sq.c === 13) cellBg = '#eab308'; // Yellow start
                  else if (sq.r === 13 && sq.c === 6) cellBg = '#3b82f6'; // Blue start
                  else if (sq.isSafe) cellBg = 'rgba(255, 255, 255, 0.15)';

                  return (
                    <g key={idx}>
                      <rect 
                        x={sq.c} 
                        y={sq.r} 
                        width="1" 
                        height="1" 
                        fill={cellBg} 
                        stroke="#0f172a" 
                        strokeWidth="0.04" 
                      />
                      {sq.isSafe && (
                        <text 
                          x={sq.c + 0.5} 
                          y={sq.r + 0.68} 
                          fontSize="0.5" 
                          textAnchor="middle" 
                          fill="#ffffff" 
                          opacity="0.8"
                        >
                          ★
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Red Home Runway */}
                {RED_RUNWAY.slice(0, 5).map((sq, i) => (
                  <rect key={`red_run_${i}`} x={sq.c} y={sq.r} width="1" height="1" fill="#ef4444" stroke="#0f172a" strokeWidth="0.04" />
                ))}

                {/* Yellow Home Runway */}
                {YELLOW_RUNWAY.slice(0, 5).map((sq, i) => (
                  <rect key={`yel_run_${i}`} x={sq.c} y={sq.r} width="1" height="1" fill="#eab308" stroke="#0f172a" strokeWidth="0.04" />
                ))}

                {/* Interactive Tokens Overlay */}
                {/* Red Player Tokens */}
                {redTokens.map((step, idx) => {
                  if (step === 56) return null; // In Home
                  const coords = getTokenCoords('red', step, idx);
                  const canMove = currentTurn === 'red' && diceVal !== null && (
                    (step === -1 && diceVal === 6) || (step >= 0 && step + diceVal <= 56)
                  );

                  return (
                    <g 
                      key={`red_tok_${idx}`} 
                      style={{ cursor: canMove ? 'pointer' : 'default' }}
                      onClick={() => {
                        if (canMove) executeMove('red', idx, diceVal);
                      }}
                    >
                      <circle 
                        cx={coords.c + 0.5} 
                        cy={coords.r + 0.5} 
                        r={canMove ? 0.44 : 0.38} 
                        fill="#ef4444" 
                        stroke={canMove ? '#ffffff' : '#991b1b'} 
                        strokeWidth={canMove ? '0.08' : '0.05'}
                      />
                      <circle cx={coords.c + 0.5} cy={coords.r + 0.5} r="0.18" fill="#ffffff" opacity="0.9" />
                      {canMove && (
                        <circle cx={coords.c + 0.5} cy={coords.r + 0.5} r="0.5" fill="none" stroke="#fbbf24" strokeWidth="0.06" opacity="0.8" />
                      )}
                    </g>
                  );
                })}

                {/* Yellow Bot Tokens */}
                {yellowTokens.map((step, idx) => {
                  if (step === 56) return null; // In Home
                  const coords = getTokenCoords('yellow', step, idx);
                  return (
                    <g key={`yel_tok_${idx}`}>
                      <circle 
                        cx={coords.c + 0.5} 
                        cy={coords.r + 0.5} 
                        r="0.38" 
                        fill="#eab308" 
                        stroke="#854d0e" 
                        strokeWidth="0.05"
                      />
                      <circle cx={coords.c + 0.5} cy={coords.r + 0.5} r="0.18" fill="#ffffff" opacity="0.9" />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Controls Bar: Dice Roll & Token Counters */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Red (You) Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ textAlign: 'left', fontSize: '0.75rem' }}>
                  <div style={{ fontWeight: 700, color: '#fca5a5' }}>You (Red)</div>
                  <div style={{ color: '#94a3b8' }}>Home: {redTokens.filter(s => s === 56).length}/{tokensCount}</div>
                </div>
              </div>

              {/* Dice Action Box */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  disabled={isRolling || currentTurn !== 'red' || diceVal !== null || gameState !== 'playing'}
                  onClick={handleRollDice}
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '12px',
                    background: currentTurn === 'red' ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : '#334155',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    fontSize: '1.4rem',
                    fontWeight: 900,
                    cursor: (currentTurn === 'red' && diceVal === null) ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: currentTurn === 'red' ? '0 0 16px rgba(239, 68, 68, 0.5)' : 'none',
                    transform: isRolling ? 'rotate(360deg)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isRolling ? '🎲' : (diceVal !== null ? diceVal : '🎲')}
                </button>
                <div style={{ textAlign: 'left', fontSize: '0.75rem' }}>
                  <div style={{ fontWeight: 700, color: currentTurn === 'red' ? '#fbbf24' : '#94a3b8' }}>
                    {currentTurn === 'red' ? (diceVal ? 'Pick Token!' : 'Tap to Roll!') : 'Bot Rolling...'}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    Roll 6 for Bonus
                  </div>
                </div>
              </div>

              {/* Yellow (Bot) Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '8px', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#eab308' }} />
                <div style={{ textAlign: 'left', fontSize: '0.75rem' }}>
                  <div style={{ fontWeight: 700, color: '#fef08a' }}>AI Bot (Yellow)</div>
                  <div style={{ color: '#94a3b8' }}>Home: {yellowTokens.filter(s => s === 56).length}/{tokensCount}</div>
                </div>
              </div>
            </div>

            {/* Victory / Defeat Overlay */}
            {gameState === 'gameover' && (
              <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '10px', background: winner === 'red' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', border: `1px solid ${winner === 'red' ? '#10b981' : '#ef4444'}` }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: winner === 'red' ? '#34d399' : '#f87171' }}>
                  {winner === 'red' ? `🏆 VICTORY! You Won ${formatINR(winPrize)}!` : '💔 Match Lost!'}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '0.2rem', marginBottom: '0.75rem' }}>
                  {winner === 'red' ? 'All your tokens safely reached Home first. Prize deposited into Task Wallet!' : 'Bot tokens reached Home first.'}
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
