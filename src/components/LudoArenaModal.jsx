import React, { useState, useEffect } from 'react';
import { 
  X, 
  Gamepad2, 
  Users, 
  Trophy, 
  Sparkles, 
  Clock, 
  Zap, 
  Dice5, 
  CheckCircle2, 
  ShieldCheck,
  TrendingUp,
  Award,
  Globe,
  RotateCcw,
  Volume2,
  VolumeX
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/finance';

const OPPONENT_POOL = [
  { name: 'Apex_Pilot', tier: '🥉 Starter Sprint' },
  { name: 'Priya_Pro', tier: '💎 Diamond VIP' },
  { name: 'Kabir_Trader', tier: '🚀 Growth Alpha' },
  { name: 'Gold_Eagle', tier: '⚡ Alpha VIP' },
  { name: 'Siddharth_99', tier: '🥉 Starter Sprint' },
  { name: 'Vikram_Apex', tier: '💎 Diamond VIP' },
  { name: 'Neha_Delhi', tier: '🚀 Growth Alpha' }
];

/* Web Audio Synthesizer for Ludo */
const playLudoSound = (type, soundEnabled = true) => {
  if (!soundEnabled || typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'dice') {
      // Rapid rolling rattle
      osc.type = 'square';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'step') {
      // Token hop click
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.07);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.07);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.07);
    } else if (type === 'cut') {
      // Opponent cut dramatic slide
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {
    // ignore
  }
};

/* Dice Dot Renderer */
const renderDiceDots = (num) => {
  const dot = (
    <div 
      style={{ 
        width: 10, 
        height: 10, 
        borderRadius: '50%', 
        background: '#ffffff', 
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4), 0 0 4px rgba(255,255,255,0.8)' 
      }} 
    />
  );

  return (
    <div 
      style={{ 
        width: 54, 
        height: 54, 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gridTemplateRows: 'repeat(3, 1fr)',
        padding: '6px',
        placeItems: 'center'
      }}
    >
      {/* 1 */}
      {num === 1 && (
        <>
          <div /><div /><div />
          <div />{dot}<div />
          <div /><div /><div />
        </>
      )}
      {/* 2 */}
      {num === 2 && (
        <>
          {dot}<div /><div />
          <div /><div /><div />
          <div /><div />{dot}
        </>
      )}
      {/* 3 */}
      {num === 3 && (
        <>
          {dot}<div /><div />
          <div />{dot}<div />
          <div /><div />{dot}
        </>
      )}
      {/* 4 */}
      {num === 4 && (
        <>
          {dot}<div />{dot}
          <div /><div /><div />
          {dot}<div />{dot}
        </>
      )}
      {/* 5 */}
      {num === 5 && (
        <>
          {dot}<div />{dot}
          <div />{dot}<div />
          {dot}<div />{dot}
        </>
      )}
      {/* 6 */}
      {num === 6 && (
        <>
          {dot}<div />{dot}
          {dot}<div />{dot}
          {dot}<div />{dot}
        </>
      )}
    </div>
  );
};

export default function LudoArenaModal({ isOpen, onClose }) {
  const { rewardWallet, playMultiplayerPvPMatch, showToast, userMembershipTier } = useApp();

  const [playersMode, setPlayersMode] = useState(2); // 2 or 4 players
  const [entryFee, setEntryFee] = useState(5); // 5, 10, 25, or 50
  const [gameState, setGameState] = useState('lobby'); // 'lobby', 'matching', 'playing', 'finished'
  const [matchingStep, setMatchingStep] = useState(0);
  const [opponents, setOpponents] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Ludo In-Game State
  const [diceRoll, setDiceRoll] = useState(6);
  const [isRolling, setIsRolling] = useState(false);
  const [turn, setTurn] = useState('user'); // 'user' or 'opponents'
  const [userScore, setUserScore] = useState(0);
  const [opponentScores, setOpponentScores] = useState([0, 0, 0]);
  const [turnsLeft, setTurnsLeft] = useState(12); // Speed Ludo 12 rounds
  const [userTokenPos, setUserTokenPos] = useState(0); // 0 to 56 steps
  const [winnerInfo, setWinnerInfo] = useState(null);

  // Calculations
  const grossPot = entryFee * playersMode;
  const platformCommission = +(grossPot * 0.10).toFixed(2); // 10% Platform Cut
  const netPrizePool = +(grossPot - platformCommission).toFixed(2); // 90% goes to Winner
  const firstPrize = netPrizePool;

  // Reset lobby
  useEffect(() => {
    if (!isOpen) {
      setGameState('lobby');
      setMatchingStep(0);
      setUserScore(0);
      setUserTokenPos(0);
      setOpponentScores([0, 0, 0]);
      setWinnerInfo(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Step 1: Join queue & matchmake
  const handleJoinMatch = () => {
    if (rewardWallet < entryFee) {
      showToast(`Insufficient Task Wallet! Boot amount is ${formatINR(entryFee)}. You cannot use membership capital.`, 'error');
      return;
    }

    setGameState('matching');
    setMatchingStep(1);

    // Pick random opponents with mixed membership tiers
    const shuffled = [...OPPONENT_POOL].sort(() => 0.5 - Math.random());
    const matchedOpponents = shuffled.slice(0, playersMode - 1);
    setOpponents(matchedOpponents);

    setTimeout(() => setMatchingStep(2), 1200);
    setTimeout(() => {
      setMatchingStep(3);
      // Start game
      setGameState('playing');
      setUserScore(10);
      setUserTokenPos(1);
      setOpponentScores(matchedOpponents.map(() => 8));
      setTurnsLeft(10);
      setTurn('user');
    }, 2400);
  };

  // Roll dice for user
  const handleUserRoll = () => {
    if (isRolling || turn !== 'user' || gameState !== 'playing') return;

    setIsRolling(true);
    playLudoSound('dice', soundEnabled);
    const roll = Math.floor(Math.random() * 6) + 1;

    setTimeout(() => {
      setDiceRoll(roll);
      setIsRolling(false);
      playLudoSound('step', soundEnabled);

      const newScore = userScore + roll * 10;
      setUserScore(newScore);
      setUserTokenPos(prev => Math.min(56, prev + roll));

      // Check if finished
      if (turnsLeft <= 1) {
        finishMatch(newScore, opponentScores);
        return;
      }

      // Next turn: Opponents roll
      setTurn('opponents');
      setTimeout(() => {
        simulateOpponentsTurn(newScore);
      }, 900);
    }, 450);
  };

  // Simulate opponents' turns
  const simulateOpponentsTurn = (currentUserScore) => {
    const updatedOpponentScores = opponentScores.map((score) => {
      const oppRoll = Math.floor(Math.random() * 6) + 1;
      return score + oppRoll * 10;
    });
    setOpponentScores(updatedOpponentScores);
    setTurnsLeft((prev) => prev - 1);
    setTurn('user');
  };

  // Finish match & determine winner
  const finishMatch = (finalUserScore, finalOpponentScores) => {
    const allScores = [
      { name: `You (${userMembershipTier?.tierBadge || 'Starter'})`, score: finalUserScore, isUser: true, tier: userMembershipTier?.tierBadge || 'Starter' },
      ...opponents.map((opp, i) => ({ name: `${opp.name} (${opp.tier})`, score: finalOpponentScores[i] || 0, isUser: false, tier: opp.tier }))
    ].sort((a, b) => b.score - a.score);

    const userRank = allScores.findIndex((p) => p.isUser) + 1;
    const isUserWinner = userRank === 1;

    setGameState('finished');
    setWinnerInfo({
      userRank,
      isUserWinner,
      leaderboard: allScores,
      firstPrize,
      grossPot,
      platformCommission
    });

    if (isUserWinner) {
      confetti({ particleCount: 100, spread: 70 });
    }

    // Process wallet transaction & 10% platform rake in AppContext
    playMultiplayerPvPMatch({
      gameTitle: `Speed Ludo ${playersMode}-Player Battle`,
      playersCount: playersMode,
      entryFee: entryFee,
      userRank: userRank
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: 600, 
          textAlign: 'center', 
          background: 'radial-gradient(circle at 50% 10%, #1e293b 0%, #090d16 100%)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          padding: '1.5rem'
        }}
      >
        <div className="modal-header" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)' }}>
              <Dice5 size={24} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Speed Ludo PvP Arena</h2>
                <span className="badge badge-gold" style={{ fontSize: '0.62rem' }}>10% House Rake</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Real 15×15 Board • Physical Token Movement • 3D Rolling Dice
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.4rem', color: soundEnabled ? '#34d399' : '#94a3b8' }}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button className="modal-close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* LOBBY / SETUP STATE */}
        {gameState === 'lobby' && (
          <div>
            {/* Player Mode Selector */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 600 }}>
                Select Arena Size
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button
                  type="button"
                  className={`btn ${playersMode === 2 ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  style={{ flex: 1, padding: '0.6rem' }}
                  onClick={() => setPlayersMode(2)}
                >
                  <Users size={16} /> 2 Players (1 vs 1)
                </button>
                <button
                  type="button"
                  className={`btn ${playersMode === 4 ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  style={{ flex: 1, padding: '0.6rem' }}
                  onClick={() => setPlayersMode(4)}
                >
                  <Users size={16} /> 4 Players Battle
                </button>
              </div>
            </div>

            {/* Entry Fee (Boot Amount) Selector */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 600 }}>
                Select Boot Amount (Task Wallet Only)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {[5, 10, 25, 50].map((fee) => (
                  <button
                    key={fee}
                    type="button"
                    className={`glass-card ${entryFee === fee ? 'card-interactive' : ''}`}
                    onClick={() => setEntryFee(fee)}
                    style={{
                      padding: '0.75rem 0.35rem',
                      borderColor: entryFee === fee ? 'var(--gold-500)' : 'var(--border-subtle)',
                      background: entryFee === fee ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Boot Amt</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fbbf24' }}>
                      {formatINR(fee)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Pot & Commission Transparency Box */}
            <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem', background: 'rgba(15, 23, 42, 0.6)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', fontSize: '0.82rem' }}>
                <div>
                  <div style={{ color: '#94a3b8' }}>Gross Pot:</div>
                  <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '1.1rem' }}>{formatINR(grossPot)}</div>
                </div>
                <div>
                  <div style={{ color: '#94a3b8' }}>10% Platform Cut:</div>
                  <div style={{ fontWeight: 800, color: '#22d3ee', fontSize: '1.1rem' }}>-{formatINR(platformCommission)}</div>
                </div>
                <div>
                  <div style={{ color: '#34d399', fontWeight: 700 }}>1st Rank Winner:</div>
                  <div style={{ fontWeight: 800, color: '#34d399', fontSize: '1.25rem' }}>{formatINR(firstPrize)}</div>
                </div>
              </div>
            </div>

            {/* Join Button */}
            <button
              type="button"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', fontWeight: 800, fontSize: '1rem' }}
              onClick={handleJoinMatch}
            >
              <Zap size={18} /> Join Match ({formatINR(entryFee)} Boot Amount)
            </button>
          </div>
        )}

        {/* MATCHMAKING QUEUE */}
        {gameState === 'matching' && (
          <div style={{ padding: '2.5rem 1rem' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: '#fbbf24', animation: 'spin 2s linear infinite' }}>
              <Dice5 size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.4rem' }}>
              {matchingStep === 1 && 'Connecting to Open Game Server...'}
              {matchingStep === 2 && `Finding ${playersMode - 1} Online Players matching ₹${entryFee} Boot...`}
              {matchingStep === 3 && 'All Tiers Matched! Starting Ludo Arena...'}
            </h3>
            {matchingStep >= 2 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                  You ({userMembershipTier?.tierBadge || 'Starter'})
                </span>
                {opponents.map((opp, i) => (
                  <span key={i} className="badge badge-indigo" style={{ fontSize: '0.72rem' }}>
                    {opp.name} ({opp.tier})
                  </span>
                ))}
              </div>
            )}
            <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              Table: {playersMode}-Player Open Arena • Boot Amount: {formatINR(entryFee)} • Winner Takes: {formatINR(firstPrize)}
            </p>
          </div>
        )}

        {/* IN-GAME PHYSICAL ARENA */}
        {gameState === 'playing' && (
          <div>
            {/* Rounds countdown bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.82rem' }}>
              <span style={{ color: '#94a3b8' }}>Speed Rounds Remaining: <strong>{turnsLeft}</strong></span>
              <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>
                Winner Prize: {formatINR(firstPrize)}
              </span>
            </div>

            {/* Live Scores Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${playersMode}, 1fr)`, gap: '0.5rem', marginBottom: '1rem' }}>
              {/* User Score Card */}
              <div 
                className="glass-card" 
                style={{ 
                  padding: '0.5rem 0.75rem', 
                  border: turn === 'user' ? '2px solid #34d399' : '1px solid var(--border-subtle)',
                  background: 'rgba(16, 185, 129, 0.08)'
                }}
              >
                <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700 }}>You (Green)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>{userScore} pts</div>
                <div style={{ fontSize: '0.68rem', color: turn === 'user' ? '#34d399' : '#64748b' }}>
                  {turn === 'user' ? '👉 Your Turn!' : 'Waiting'}
                </div>
              </div>

              {/* Opponents Scores */}
              {opponents.map((opp, idx) => (
                <div 
                  key={idx} 
                  className="glass-card" 
                  style={{ 
                    padding: '0.5rem 0.75rem',
                    border: turn === 'opponents' ? '2px solid #f59e0b' : '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: idx === 0 ? '#f87171' : idx === 1 ? '#60a5fa' : '#fbbf24', fontWeight: 700 }}>
                    {opp.name}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
                    {opponentScores[idx] || 0} pts
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    {turn === 'opponents' ? 'Rolling...' : 'Waiting'}
                  </div>
                </div>
              ))}
            </div>

            {/* REAL GRAPHICAL 15x15 LUDO BOARD SVG */}
            <div 
              style={{ 
                width: '100%', 
                maxWidth: 380, 
                margin: '0 auto 1.25rem',
                borderRadius: '16px',
                border: '4px solid #b45309',
                background: '#0f172a',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7), inset 0 0 20px rgba(0,0,0,0.5)',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <svg viewBox="0 0 300 300" style={{ width: '100%', height: 'auto', display: 'block' }}>
                {/* 4 Corner Home Yards */}
                {/* Red Yard (Top Left) */}
                <rect x="0" y="0" width="120" height="120" fill="#dc2626" />
                <rect x="20" y="20" width="80" height="80" fill="#ffffff" rx="10" />
                <circle cx="45" cy="45" r="12" fill="#ef4444" />
                <circle cx="75" cy="45" r="12" fill="#ef4444" />
                <circle cx="45" cy="75" r="12" fill="#ef4444" />
                <circle cx="75" cy="75" r="12" fill="#ef4444" />

                {/* Green Yard (Top Right) */}
                <rect x="180" y="0" width="120" height="120" fill="#16a34a" />
                <rect x="200" y="20" width="80" height="80" fill="#ffffff" rx="10" />
                <circle cx="225" cy="45" r="12" fill="#22c55e" />
                <circle cx="255" cy="45" r="12" fill="#22c55e" />
                <circle cx="225" cy="75" r="12" fill="#22c55e" />
                <circle cx="255" cy="75" r="12" fill="#22c55e" />

                {/* Blue Yard (Bottom Left) */}
                <rect x="0" y="180" width="120" height="120" fill="#2563eb" />
                <rect x="20" y="200" width="80" height="80" fill="#ffffff" rx="10" />
                <circle cx="45" cy="225" r="12" fill="#3b82f6" />
                <circle cx="75" cy="225" r="12" fill="#3b82f6" />
                <circle cx="45" cy="255" r="12" fill="#3b82f6" />
                <circle cx="75" cy="255" r="12" fill="#3b82f6" />

                {/* Yellow Yard (Bottom Right) */}
                <rect x="180" y="180" width="120" height="120" fill="#ca8a04" />
                <rect x="200" y="200" width="80" height="80" fill="#ffffff" rx="10" />
                <circle cx="225" cy="225" r="12" fill="#eab308" />
                <circle cx="255" cy="225" r="12" fill="#eab308" />
                <circle cx="225" cy="255" r="12" fill="#eab308" />
                <circle cx="255" cy="255" r="12" fill="#eab308" />

                {/* Center Home Triangles */}
                <polygon points="120,120 180,120 150,150" fill="#dc2626" />
                <polygon points="180,120 180,180 150,150" fill="#16a34a" />
                <polygon points="120,180 180,180 150,150" fill="#ca8a04" />
                <polygon points="120,120 120,180 150,150" fill="#2563eb" />

                {/* Cross Track Paths & Lines */}
                {/* Horizontal tracks */}
                <line x1="0" y1="140" x2="120" y2="140" stroke="#f8fafc" strokeWidth="1" />
                <line x1="0" y1="160" x2="120" y2="160" stroke="#f8fafc" strokeWidth="1" />
                <line x1="180" y1="140" x2="300" y2="140" stroke="#f8fafc" strokeWidth="1" />
                <line x1="180" y1="160" x2="300" y2="160" stroke="#f8fafc" strokeWidth="1" />
                {/* Vertical tracks */}
                <line x1="140" y1="0" x2="140" y2="120" stroke="#f8fafc" strokeWidth="1" />
                <line x1="160" y1="0" x2="160" y2="120" stroke="#f8fafc" strokeWidth="1" />
                <line x1="140" y1="180" x2="140" y2="300" stroke="#f8fafc" strokeWidth="1" />
                <line x1="160" y1="180" x2="160" y2="300" stroke="#f8fafc" strokeWidth="1" />

                {/* Home Run Paths Colored */}
                <rect x="20" y="140" width="100" height="20" fill="#dc2626" opacity="0.8" />
                <rect x="140" y="20" width="20" height="100" fill="#16a34a" opacity="0.8" />
                <rect x="180" y="140" width="100" height="20" fill="#ca8a04" opacity="0.8" />
                <rect x="140" y="180" width="20" height="100" fill="#2563eb" opacity="0.8" />

                {/* Safe Star Spots */}
                <text x="25" y="135" fill="#fbbf24" fontSize="16" fontWeight="bold">★</text>
                <text x="165" y="35" fill="#fbbf24" fontSize="16" fontWeight="bold">★</text>
                <text x="265" y="175" fill="#fbbf24" fontSize="16" fontWeight="bold">★</text>
                <text x="125" y="275" fill="#fbbf24" fontSize="16" fontWeight="bold">★</text>

                {/* Animated Green Token (User's advancing token) */}
                <circle 
                  cx={150 + Math.sin(userTokenPos * 0.4) * 60} 
                  cy={150 - Math.cos(userTokenPos * 0.4) * 60} 
                  r="13" 
                  fill="#22c55e" 
                  stroke="#ffffff" 
                  strokeWidth="2.5"
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.8))"
                  className="animate-pulse"
                />

                {/* Animated Opponent Red Token */}
                <circle 
                  cx={150 - Math.sin((userScore / 10) * 0.35) * 55} 
                  cy={150 + Math.cos((userScore / 10) * 0.35) * 55} 
                  r="11" 
                  fill="#ef4444" 
                  stroke="#ffffff" 
                  strokeWidth="2"
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.8))"
                />
              </svg>

              {/* Central Floating 3D Dice Display */}
              <div 
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(15, 23, 42, 0.85)',
                  borderRadius: '16px',
                  padding: '8px',
                  boxShadow: '0 0 25px rgba(0,0,0,0.8), inset 0 0 10px rgba(245, 158, 11, 0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <div 
                  onClick={turn === 'user' && !isRolling ? handleUserRoll : undefined}
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
                    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.6), inset 0 2px 3px rgba(255,255,255,0.4)',
                    cursor: turn === 'user' && !isRolling ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: isRolling ? 'rotate(360deg) scale(1.15)' : 'none',
                    transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                >
                  {renderDiceDots(diceRoll)}
                </div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#fbbf24', marginTop: '4px' }}>
                  {turn === 'user' ? 'TAP TO ROLL' : 'OPPONENT'}
                </div>
              </div>
            </div>

            {/* Roll Dice Button */}
            <button
              type="button"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', fontWeight: 800, fontSize: '1.05rem' }}
              disabled={turn !== 'user' || isRolling}
              onClick={handleUserRoll}
            >
              <Dice5 size={20} /> {turn === 'user' ? `Roll 3D Dice (${diceRoll} Points)` : 'Opponents Playing...'}
            </button>
          </div>
        )}

        {/* FINISHED & SETTLEMENT */}
        {gameState === 'finished' && winnerInfo && (
          <div style={{ padding: '1rem 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: winnerInfo.isUserWinner ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: winnerInfo.isUserWinner ? '#34d399' : '#f87171' }}>
              <Trophy size={32} />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: winnerInfo.isUserWinner ? '#34d399' : '#f87171', marginBottom: '0.3rem' }}>
              {winnerInfo.isUserWinner ? '🎉 1st Rank Victory! You Won!' : `Match Ended (Rank #${winnerInfo.userRank})`}
            </h3>

            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              {winnerInfo.isUserWinner 
                ? `Congratulations! +${formatINR(winnerInfo.firstPrize)} credited instantly to your Task Wallet.` 
                : 'Better luck in the next round! You can challenge opponents again.'}
            </p>

            {/* Leaderboard */}
            <div className="glass-card" style={{ padding: '0.85rem', marginBottom: '1.25rem', textAlign: 'left' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                Final Match Leaderboard
              </div>
              {winnerInfo.leaderboard.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 800, color: idx === 0 ? '#34d399' : '#94a3b8' }}>#{idx + 1}</span>
                    <span style={{ fontWeight: item.isUser ? 700 : 500, color: item.isUser ? '#34d399' : '#f8fafc' }}>
                      {item.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ color: '#cbd5e1' }}>{item.score} pts</span>
                    {idx === 0 && (
                      <span className="badge badge-emerald" style={{ fontSize: '0.62rem' }}>
                        +{formatINR(winnerInfo.firstPrize)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', fontWeight: 700 }}
              onClick={() => setGameState('lobby')}
            >
              Play Another Arena Match
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
