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
  Globe
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/finance';

const OPPONENT_POOL = [
  { name: 'Rohan_M99', tier: '🥉 Starter Sprint' },
  { name: 'Priya_Pro', tier: '💎 Diamond VIP' },
  { name: 'Kabir_Trader', tier: '🚀 Growth Alpha' },
  { name: 'Ananya_K', tier: '⚡ Alpha VIP' },
  { name: 'Siddharth_99', tier: '🥉 Starter Sprint' },
  { name: 'Vikram_Apex', tier: '💎 Diamond VIP' },
  { name: 'Neha_Delhi', tier: '🚀 Growth Alpha' }
];

export default function LudoArenaModal({ isOpen, onClose }) {
  const { rewardWallet, playMultiplayerPvPMatch, showToast, userMembershipTier } = useApp();

  const [playersMode, setPlayersMode] = useState(2); // 2 or 4 players
  const [entryFee, setEntryFee] = useState(5); // 5, 10, 25, or 50
  const [gameState, setGameState] = useState('lobby'); // 'lobby', 'matching', 'playing', 'finished'
  const [matchingStep, setMatchingStep] = useState(0);
  const [opponents, setOpponents] = useState([]);
  
  // Ludo In-Game State
  const [diceRoll, setDiceRoll] = useState(6);
  const [isRolling, setIsRolling] = useState(false);
  const [turn, setTurn] = useState('user'); // 'user' or opponent index
  const [userScore, setUserScore] = useState(0);
  const [opponentScores, setOpponentScores] = useState([0, 0, 0]);
  const [turnsLeft, setTurnsLeft] = useState(12); // Speed Ludo 12 rounds
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
      setOpponentScores(matchedOpponents.map(() => 8));
      setTurnsLeft(10);
      setTurn('user');
    }, 2400);
  };

  // Roll dice for user
  const handleUserRoll = () => {
    if (isRolling || turn !== 'user' || gameState !== 'playing') return;

    setIsRolling(true);
    const roll = Math.floor(Math.random() * 6) + 1;

    setTimeout(() => {
      setDiceRoll(roll);
      setIsRolling(false);
      const newScore = userScore + roll * 10;
      setUserScore(newScore);

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
    }, 500);
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580, textAlign: 'center' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
              <Dice5 size={22} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Speed Ludo P2P Arena</h2>
                <span className="badge badge-gold" style={{ fontSize: '0.62rem' }}>10% House Rake</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Live online multiplayer. 1st Rank takes 90% of the pot; platform retains 10% commission.
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* LOBBY STATE */}
        {gameState === 'lobby' && (
          <div>
            {/* Open-Tier Matchmaking Banner */}
            <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(59, 130, 246, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59, 130, 246, 0.25)', display: 'flex', alignItems: 'center', gap: '0.65rem', textAlign: 'left' }}>
              <Globe size={18} color="#60a5fa" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                <strong style={{ color: '#60a5fa' }}>🌐 Open-Tier Matchmaking:</strong> Any membership plan level (from Starter to Diamond VIP) can battle together on this table! Only the <strong>Boot Amount ({formatINR(entryFee)})</strong> from your Task Wallet is matched.
              </div>
            </div>

            {/* Player Mode Selector */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 600 }}>
                Select Table Size
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

        {/* IN-GAME ARENA */}
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
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${playersMode}, 1fr)`, gap: '0.5rem', marginBottom: '1.25rem' }}>
              {/* User Score Card */}
              <div 
                className="glass-card" 
                style={{ 
                  padding: '0.75rem', 
                  border: turn === 'user' ? '2px solid #34d399' : '1px solid var(--border-subtle)',
                  background: 'rgba(16, 185, 129, 0.08)'
                }}
              >
                <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700 }}>You (Green)</div>
                <div style={{ fontSize: '0.62rem', color: '#94a3b8', marginBottom: '0.15rem' }}>{userMembershipTier?.tierBadge || 'Starter'}</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>{userScore} pts</div>
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
                    padding: '0.75rem',
                    border: turn === 'opponents' ? '2px solid #f59e0b' : '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: idx === 0 ? '#f87171' : idx === 1 ? '#60a5fa' : '#fbbf24', fontWeight: 700 }}>
                    {opp.name}
                  </div>
                  <div style={{ fontSize: '0.62rem', color: '#94a3b8', marginBottom: '0.15rem' }}>
                    {opp.tier}
                  </div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>
                    {opponentScores[idx] || 0} pts
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    {turn === 'opponents' ? 'Playing...' : 'Waiting'}
                  </div>
                </div>
              ))}
            </div>

            {/* Simulated Ludo Board Graphic */}
            <div 
              style={{ 
                width: '100%', 
                maxWidth: 320, 
                height: 220, 
                margin: '0 auto 1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: '2px solid rgba(245, 158, 11, 0.4)',
                background: 'radial-gradient(circle, #1e293b 0%, #090d16 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              <div 
                style={{ 
                  width: 72, 
                  height: 72, 
                  borderRadius: '16px', 
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 25px rgba(245, 158, 11, 0.4)',
                  fontSize: '2.2rem',
                  fontWeight: 900,
                  color: '#ffffff',
                  marginBottom: '0.5rem',
                  transform: isRolling ? 'rotate(180deg) scale(1.1)' : 'none',
                  transition: 'transform 0.3s ease'
                }}
              >
                {diceRoll}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1' }}>
                {turn === 'user' ? 'Click Roll Dice below!' : 'Opponents are making moves...'}
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
              <Dice5 size={20} /> {turn === 'user' ? 'Roll Dice (1-6)' : 'Opponent Moving...'}
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
                      <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                        +{formatINR(winnerInfo.firstPrize)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Transparency Note */}
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Gross Pot: {formatINR(winnerInfo.grossPot)} • 10% Platform House Rake: {formatINR(winnerInfo.platformCommission)} • Winner Payout: {formatINR(winnerInfo.firstPrize)}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1, fontWeight: 700 }}
                onClick={() => setGameState('lobby')}
              >
                Play Another Match
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Close Arena
              </button>
            </div>
          </div>
        )}

        {/* Footer Wallet Rule Reminder */}
        <div style={{ marginTop: '1.25rem', fontSize: '0.72rem', color: '#64748b', textAlign: 'center' }}>
          🛡️ <strong>Compliance Shield:</strong> 100% Skill-based game. Fees are deducted only from task earnings. Deposit membership capital cannot be used.
        </div>
      </div>
    </div>
  );
}
