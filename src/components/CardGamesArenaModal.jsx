import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trophy, 
  Award, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Club, 
  Heart, 
  Spade, 
  Diamond,
  Globe
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/finance';

const CARD_OPPONENTS_POOL = [
  { name: 'Vikram_CardKing', tier: '💎 Diamond VIP' },
  { name: 'Ankit_29Master', tier: '🥉 Starter Sprint' },
  { name: 'Suresh_CallPro', tier: '🚀 Growth Alpha' },
  { name: 'Deepak_Bridge', tier: '⚡ Alpha VIP' }
];

export default function CardGamesArenaModal({ isOpen, onClose }) {
  const { rewardWallet, playMultiplayerPvPMatch, showToast, userMembershipTier } = useApp();

  const [selectedGame, setSelectedGame] = useState('29_cards'); // '29_cards' or 'call_bridge'
  const [entryFee, setEntryFee] = useState(5); // ₹5, ₹10, ₹25, ₹50
  const [gameState, setGameState] = useState('lobby'); // 'lobby', 'bidding', 'playing', 'finished'
  const [currentRound, setCurrentRound] = useState(1);
  const [userScore, setUserScore] = useState(0);
  const [oppScores, setOppScores] = useState([0, 0, 0]);
  const [trumpSuit, setTrumpSuit] = useState('Spades');
  const [handCards, setHandCards] = useState([
    { rank: 'J', suit: '♠', points: 3 },
    { rank: '9', suit: '♠', points: 2 },
    { rank: 'A', suit: '♥', points: 1 },
    { rank: '10', suit: '♦', points: 1 },
    { rank: 'K', suit: '♣', points: 0 },
    { rank: 'Q', suit: '♣', points: 0 }
  ]);
  const [winnerInfo, setWinnerInfo] = useState(null);

  // Financial calculations
  const totalPlayers = 4;
  const grossPot = entryFee * totalPlayers;
  const platformCommission = +(grossPot * 0.10).toFixed(2); // 10% platform cut
  const netPool = +(grossPot - platformCommission).toFixed(2);
  const rank1Prize = +(netPool * 0.75).toFixed(2); // 75% of net pool
  const rank2Prize = +(netPool * 0.25).toFixed(2); // 25% of net pool

  useEffect(() => {
    if (!isOpen) {
      setGameState('lobby');
      setUserScore(0);
      setOppScores([0, 0, 0]);
      setWinnerInfo(null);
      setCurrentRound(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartTournament = () => {
    if (rewardWallet < entryFee) {
      showToast(`Insufficient Task Wallet! Entry fee is ${formatINR(entryFee)}. You cannot use locked membership capital.`, 'error');
      return;
    }

    setGameState('bidding');
    setTimeout(() => {
      setGameState('playing');
      setUserScore(12);
      setOppScores([10, 8, 6]);
      setCurrentRound(1);
    }, 1800);
  };

  const handlePlayCard = (cardIdx) => {
    if (gameState !== 'playing') return;

    const played = handCards[cardIdx];
    const newHand = handCards.filter((_, i) => i !== cardIdx);
    setHandCards(newHand);

    // Increase score based on trick win
    const wonPoints = played.points + Math.floor(Math.random() * 3) + 2;
    const newUserScore = userScore + wonPoints;
    setUserScore(newUserScore);

    const newOppScores = oppScores.map((s) => s + Math.floor(Math.random() * 4) + 1);
    setOppScores(newOppScores);

    if (newHand.length <= 1) {
      finishCardMatch(newUserScore, newOppScores);
    } else {
      setCurrentRound((prev) => prev + 1);
    }
  };

  const finishCardMatch = (finalUserScore, finalOppScores) => {
    const standings = [
      { name: `You (${userMembershipTier?.tierBadge || 'Starter'})`, score: finalUserScore, isUser: true, tier: userMembershipTier?.tierBadge || 'Starter' },
      { name: `Vikram (${CARD_OPPONENTS_POOL[0].tier})`, score: finalOppScores[0], isUser: false, tier: CARD_OPPONENTS_POOL[0].tier },
      { name: `Ankit (${CARD_OPPONENTS_POOL[1].tier})`, score: finalOppScores[1], isUser: false, tier: CARD_OPPONENTS_POOL[1].tier },
      { name: `Suresh (${CARD_OPPONENTS_POOL[2].tier})`, score: finalOppScores[2], isUser: false, tier: CARD_OPPONENTS_POOL[2].tier }
    ].sort((a, b) => b.score - a.score);

    const userRank = standings.findIndex((p) => p.isUser) + 1;
    const isRank1 = userRank === 1;
    const prizeWon = isRank1 ? rank1Prize : userRank === 2 ? rank2Prize : 0;

    setGameState('finished');
    setWinnerInfo({
      userRank,
      isRank1,
      prizeWon,
      standings,
      grossPot,
      platformCommission
    });

    playMultiplayerPvPMatch({
      gameTitle: selectedGame === '29_cards' ? '29 Cards Championship' : 'Call Bridge Masters Arena',
      playersCount: 4,
      entryFee: entryFee,
      userRank: userRank
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580, textAlign: 'center' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
              <Spade size={22} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                  {selectedGame === '29_cards' ? '29 Cards Championship' : 'Call Bridge Masters'}
                </h2>
                <span className="badge badge-emerald" style={{ fontSize: '0.62rem' }}>10% House Rake</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                4-Player trick-taking tournament. 1st Rank takes 75% of net pot; 2nd Rank takes 25%.
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
            {/* Open Matchmaking Info */}
            <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(59, 130, 246, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59, 130, 246, 0.25)', display: 'flex', alignItems: 'center', gap: '0.65rem', textAlign: 'left' }}>
              <Globe size={18} color="#60a5fa" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                <strong style={{ color: '#60a5fa' }}>🌐 Open-Tier Matchmaking:</strong> Any membership plan level (Starter to Diamond VIP) can battle together on this table! Only the <strong>Boot Amount ({formatINR(entryFee)})</strong> from your Task Wallet is matched.
              </div>
            </div>

            {/* Game Selector */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', justifyContent: 'center' }}>
              <button
                type="button"
                className={`btn ${selectedGame === '29_cards' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                style={{ flex: 1 }}
                onClick={() => setSelectedGame('29_cards')}
              >
                ♠ 29 Cards (Twenty-Nine)
              </button>
              <button
                type="button"
                className={`btn ${selectedGame === 'call_bridge' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                style={{ flex: 1 }}
                onClick={() => setSelectedGame('call_bridge')}
              >
                ♣ Call Bridge Tournament
              </button>
            </div>

            {/* Entry Fee (Boot Amount) Selection */}
            <div style={{ marginBottom: '1.25rem' }}>
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
                      borderColor: entryFee === fee ? '#3b82f6' : 'var(--border-subtle)',
                      background: entryFee === fee ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Boot Amt</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#60a5fa' }}>
                      {formatINR(fee)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Pot & Rank Breakdown */}
            <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem', background: 'rgba(15, 23, 42, 0.6)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', fontSize: '0.8rem' }}>
                <div>
                  <div style={{ color: '#94a3b8' }}>Total Pot:</div>
                  <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '1rem' }}>{formatINR(grossPot)}</div>
                </div>
                <div>
                  <div style={{ color: '#94a3b8' }}>10% Cut:</div>
                  <div style={{ fontWeight: 800, color: '#22d3ee', fontSize: '1rem' }}>-{formatINR(platformCommission)}</div>
                </div>
                <div>
                  <div style={{ color: '#34d399', fontWeight: 700 }}>1st Rank:</div>
                  <div style={{ fontWeight: 800, color: '#34d399', fontSize: '1.1rem' }}>{formatINR(rank1Prize)}</div>
                </div>
                <div>
                  <div style={{ color: '#fbbf24', fontWeight: 700 }}>2nd Rank:</div>
                  <div style={{ fontWeight: 800, color: '#fbbf24', fontSize: '1.1rem' }}>{formatINR(rank2Prize)}</div>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', fontWeight: 800, fontSize: '1rem' }}
              onClick={handleStartTournament}
            >
              <Zap size={18} /> Join 4-Player Table ({formatINR(entryFee)} Boot)
            </button>
          </div>
        )}

        {/* BIDDING & TRUMP PHASE */}
        {gameState === 'bidding' && (
          <div style={{ padding: '2.5rem 1rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>♠ ♥ ♦ ♣</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              Dealing 4 Hands & Setting Trump Suit...
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              Matched Opponents: Vikram (Diamond VIP), Ankit (Starter Sprint) & Suresh (Growth Alpha)
            </p>
          </div>
        )}

        {/* PLAYING PHASE */}
        {gameState === 'playing' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.82rem' }}>
              <span style={{ color: '#94a3b8' }}>Round: <strong>{currentRound} of 6</strong> • Trump: <strong style={{ color: '#60a5fa' }}>{trumpSuit}</strong></span>
              <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>1st Rank: {formatINR(rank1Prize)}</span>
            </div>

            {/* Scorecard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', marginBottom: '1.25rem' }}>
              <div className="glass-card" style={{ padding: '0.55rem', border: '1.5px solid #34d399', background: 'rgba(16, 185, 129, 0.08)' }}>
                <div style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 700 }}>You</div>
                <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>{userMembershipTier?.tierBadge || 'Starter'}</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{userScore} pts</div>
              </div>
              <div className="glass-card" style={{ padding: '0.55rem' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>Vikram</div>
                <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Diamond VIP</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{oppScores[0]} pts</div>
              </div>
              <div className="glass-card" style={{ padding: '0.55rem' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>Ankit</div>
                <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Starter</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{oppScores[1]} pts</div>
              </div>
              <div className="glass-card" style={{ padding: '0.55rem' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>Suresh</div>
                <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Growth Alpha</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{oppScores[2]} pts</div>
              </div>
            </div>

            {/* Card Table Visual */}
            <div style={{ padding: '1.25rem', background: 'radial-gradient(circle, #064e3b 0%, #022c22 100%)', borderRadius: 'var(--radius-lg)', border: '2px solid rgba(16, 185, 129, 0.4)', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', color: '#a7f3d0', marginBottom: '0.75rem', fontWeight: 600 }}>
                Tap a card from your hand to play this trick round:
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {handCards.map((card, i) => (
                  <button
                    key={i}
                    type="button"
                    className="card-interactive"
                    onClick={() => handlePlayCard(i)}
                    style={{
                      width: 52,
                      height: 74,
                      background: '#ffffff',
                      borderRadius: '8px',
                      color: card.suit === '♥' || card.suit === '♦' ? '#dc2626' : '#0f172a',
                      fontWeight: 900,
                      fontSize: '1.1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      border: '1px solid #cbd5e1',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    <div>{card.rank}</div>
                    <div style={{ fontSize: '1.2rem' }}>{card.suit}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FINISHED STATE */}
        {gameState === 'finished' && winnerInfo && (
          <div style={{ padding: '1rem 0' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: winnerInfo.prizeWon > 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: winnerInfo.prizeWon > 0 ? '#34d399' : '#f87171' }}>
              <Trophy size={30} />
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: winnerInfo.prizeWon > 0 ? '#34d399' : '#f87171', marginBottom: '0.25rem' }}>
              {winnerInfo.isRank1 
                ? '🏆 1st Rank Champion!' 
                : winnerInfo.prizeWon > 0 
                  ? '🥈 2nd Rank Runner-up!' 
                  : `Tournament Finished (Rank #${winnerInfo.userRank})`}
            </h3>

            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              {winnerInfo.prizeWon > 0 
                ? `+${formatINR(winnerInfo.prizeWon)} prize payout credited directly to your Task Wallet!` 
                : 'Play again to improve your trick ranking and take the pot!'}
            </p>

            {/* Standings */}
            <div className="glass-card" style={{ padding: '0.85rem', marginBottom: '1.25rem', textAlign: 'left' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                Final Table Rankings
              </div>
              {winnerInfo.standings.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 800, color: idx === 0 ? '#34d399' : idx === 1 ? '#fbbf24' : '#94a3b8' }}>#{idx + 1}</span>
                    <span style={{ fontWeight: item.isUser ? 700 : 500, color: item.isUser ? '#34d399' : '#f8fafc' }}>
                      {item.name}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#cbd5e1', marginRight: '0.5rem' }}>{item.score} pts</span>
                    {idx === 0 && <span className="badge badge-emerald" style={{ fontSize: '0.62rem' }}>+{formatINR(rank1Prize)}</span>}
                    {idx === 1 && <span className="badge badge-gold" style={{ fontSize: '0.62rem' }}>+{formatINR(rank2Prize)}</span>}
                  </div>
                </div>
              ))}
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
                Close
              </button>
            </div>
          </div>
        )}

        <div style={{ marginTop: '1.25rem', fontSize: '0.72rem', color: '#64748b' }}>
          🔒 <strong>Wallet Shield:</strong> Entry fees come strictly from Task Earnings. Membership principal is locked and untouched.
        </div>
      </div>
    </div>
  );
}
