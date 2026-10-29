import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trophy, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ShieldCheck, 
  Coins, 
  Users, 
  Bot, 
  Spade,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/finance';

/* =========================================================================
   STANDARD 52-CARD CALL BRIDGE ENGINE
   Spades (♠) are Permanent Trump
   Each player gets 13 cards. 13 trick rounds.
   Score = Bid + (Tricks - Bid)*0.1 if made; -Bid if failed.
   ========================================================================= */

const SUIT_ORDER = ['Spades', 'Hearts', 'Clubs', 'Diamonds'];

const SUITS = [
  { name: 'Spades', symbol: '♠', color: '#60a5fa', isTrump: true },
  { name: 'Hearts', symbol: '♥', color: '#f87171' },
  { name: 'Diamonds', symbol: '♦', color: '#fb923c' },
  { name: 'Clubs', symbol: '♣', color: '#34d399' }
];

const CARD_RANKS = [
  { rank: 'A', value: 14 },
  { rank: 'K', value: 13 },
  { rank: 'Q', value: 12 },
  { rank: 'J', value: 11 },
  { rank: '10', value: 10 },
  { rank: '9', value: 9 },
  { rank: '8', value: 8 },
  { rank: '7', value: 7 },
  { rank: '6', value: 6 },
  { rank: '5', value: 5 },
  { rank: '4', value: 4 },
  { rank: '3', value: 3 },
  { rank: '2', value: 2 }
];

const create52Deck = () => {
  const deck = [];
  SUITS.forEach(suit => {
    CARD_RANKS.forEach(r => {
      deck.push({
        id: `${r.rank}_${suit.name}`,
        rank: r.rank,
        value: r.value,
        suit: suit.name,
        symbol: suit.symbol,
        color: suit.color,
        isTrump: suit.isTrump
      });
    });
  });
  return deck.sort(() => Math.random() - 0.5);
};

export default function RealCallBridgeModal({ isOpen, onClose }) {
  const { rewardWallet, playSoloSkillGame, showToast, userMembershipTier } = useApp();

  const [entryFee, setEntryFee] = useState(10);
  const [gameState, setGameState] = useState('lobby'); // 'lobby', 'bidding', 'playing', 'gameover'
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 4 Players: 0 = You (South), 1 = East (Bot), 2 = North (Bot), 3 = West (Bot)
  const [hands, setHands] = useState([[], [], [], []]);
  const [bids, setBids] = useState([2, 3, 3, 2]); // Calls by each player (1 to 8)
  const [tricksWon, setTricksWon] = useState([0, 0, 0, 0]);

  // Trick Play State
  const [trickCards, setTrickCards] = useState([]); // [{ player: 0, card }, ...]
  const [turn, setTurn] = useState(0); // 0 to 3
  const [roundNum, setRoundNum] = useState(1); // 1 to 13
  const [statusMsg, setStatusMsg] = useState('');
  const [leaderboard, setLeaderboard] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setGameState('lobby');
      setHands([[], [], [], []]);
      setTrickCards([]);
      setLeaderboard(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const grossPot = entryFee * 4;
  const platformCut = +(grossPot * 0.10).toFixed(2);
  const winPrize = +(grossPot - platformCut).toFixed(2);

  // Start Call Bridge Match & Deal 13 Cards to each player
  const handleStartMatch = () => {
    if (rewardWallet < entryFee) {
      showToast(`Insufficient Task Wallet! Entry fee is ${formatINR(entryFee)}.`, 'error');
      return;
    }

    const deducted = playSoloSkillGame({
      gameId: 'real_call_bridge',
      gameTitle: 'Call Bridge Masters Arena',
      entryFee: entryFee,
      rewardAmount: 0,
      won: false
    });

    if (!deducted) return;

    const deck = create52Deck();
    // Deal 13 cards each
    const dealtHands = [
      deck.slice(0, 13).sort(sortBridgeHand),
      deck.slice(13, 26).sort(sortBridgeHand),
      deck.slice(26, 39).sort(sortBridgeHand),
      deck.slice(39, 52).sort(sortBridgeHand)
    ];

    // Estimate realistic bot calls based on High Card Points and Spades
    const botBids = [2, 0, 0, 0];
    for (let p = 1; p <= 3; p++) {
      const pHand = dealtHands[p];
      let estimate = 0;
      pHand.forEach(c => {
        if (c.rank === 'A') estimate += 1;
        if (c.rank === 'K' && Math.random() > 0.3) estimate += 0.7;
        if (c.isTrump && c.value >= 10) estimate += 0.5;
      });
      botBids[p] = Math.max(1, Math.min(6, Math.round(estimate)));
    }

    setHands(dealtHands);
    setBids(botBids);
    setTricksWon([0, 0, 0, 0]);
    setGameState('bidding');
    setStatusMsg('Select your Bid (Call between 1 and 8 tricks).');
  };

  const sortBridgeHand = (a, b) => {
    const suitDiff = SUIT_ORDER.indexOf(a.suit) - SUIT_ORDER.indexOf(b.suit);
    if (suitDiff !== 0) return suitDiff;
    return b.value - a.value;
  };

  // Submit Player Call
  const handlePlayerCall = (myCall) => {
    const newBids = [myCall, bids[1], bids[2], bids[3]];
    setBids(newBids);
    setGameState('playing');
    setRoundNum(1);
    setTurn(0);
    setTrickCards([]);
    setStatusMsg(`Calls locked! You called ${myCall}. Lead your first card.`);
  };

  // Play a Card from Hand
  const handlePlayCard = (cardIdx) => {
    if (turn !== 0 || gameState !== 'playing') return;

    const myHand = hands[0];
    const card = myHand[cardIdx];

    // Check must follow suit rule
    if (trickCards.length > 0) {
      const leadSuit = trickCards[0].card.suit;
      const hasLeadSuit = myHand.some(c => c.suit === leadSuit);
      if (hasLeadSuit && card.suit !== leadSuit) {
        showToast(`Must follow suit! Play a ${leadSuit} card.`, 'warning');
        return;
      }
    }

    const newHand = myHand.filter((_, i) => i !== cardIdx);
    setHands(prev => [newHand, prev[1], prev[2], prev[3]]);

    const newTrick = [...trickCards, { player: 0, card }];
    setTrickCards(newTrick);

    if (newTrick.length === 4) {
      setTimeout(() => resolveBridgeTrick(newTrick), 1200);
    } else {
      setTurn(1);
      setTimeout(() => executeBotTurn(1, newTrick), 750);
    }
  };

  // Execute Bot Turn
  const executeBotTurn = (botIdx, currentTrick) => {
    setHands(prevHands => {
      const botHand = [...prevHands[botIdx]];
      if (botHand.length === 0) return prevHands;

      let chosenIdx = 0;

      if (currentTrick.length === 0) {
        // Leading: Play random non-trump or high card
        chosenIdx = Math.floor(Math.random() * botHand.length);
      } else {
        const leadSuit = currentTrick[0].card.suit;
        const matchingSuitIndices = [];
        botHand.forEach((c, i) => {
          if (c.suit === leadSuit) matchingSuitIndices.push(i);
        });

        if (matchingSuitIndices.length > 0) {
          // Must follow suit!
          chosenIdx = matchingSuitIndices[0];
        } else {
          // Can trump with Spade if has Spade!
          const spadeIdx = botHand.findIndex(c => c.isTrump);
          if (spadeIdx !== -1) {
            chosenIdx = spadeIdx;
          } else {
            chosenIdx = 0;
          }
        }
      }

      const playedCard = botHand[chosenIdx];
      const updatedBotHand = botHand.filter((_, i) => i !== chosenIdx);
      const newTrick = [...currentTrick, { player: botIdx, card: playedCard }];
      setTrickCards(newTrick);

      const nextPlayer = (botIdx + 1) % 4;

      if (newTrick.length === 4) {
        setTimeout(() => resolveBridgeTrick(newTrick), 1200);
      } else {
        setTurn(nextPlayer);
        if (nextPlayer !== 0) {
          setTimeout(() => executeBotTurn(nextPlayer, newTrick), 750);
        } else {
          setStatusMsg('Your turn! Play a card to follow suit.');
        }
      }

      const updatedAll = [...prevHands];
      updatedAll[botIdx] = updatedBotHand;
      return updatedAll;
    });
  };

  // Resolve 4-Card Trick: Highest Spade wins; else highest lead suit wins
  const resolveBridgeTrick = (fullTrick) => {
    const leadSuit = fullTrick[0].card.suit;
    let winningPlay = fullTrick[0];

    fullTrick.forEach(play => {
      const { card } = play;
      const isWinnerSpade = winningPlay.card.isTrump;
      const isCurrSpade = card.isTrump;

      if (isCurrSpade && !isWinnerSpade) {
        winningPlay = play;
      } else if (isCurrSpade && isWinnerSpade) {
        if (card.value > winningPlay.card.value) winningPlay = play;
      } else if (!isWinnerSpade && card.suit === leadSuit) {
        if (card.value > winningPlay.card.value) winningPlay = play;
      }
    });

    const winningPlayer = winningPlay.player;
    setTricksWon(prev => {
      const updated = [...prev];
      updated[winningPlayer] += 1;
      return updated;
    });

    const winnerName = winningPlayer === 0 ? 'You' : `Bot ${winningPlayer}`;
    setStatusMsg(`${winnerName} won the trick with ${winningPlay.card.rank}${winningPlay.card.symbol}!`);

    const nextRound = roundNum + 1;
    setRoundNum(nextRound);
    setTrickCards([]);

    if (nextRound > 13) {
      setTimeout(finishMatch, 1000);
    } else {
      setTurn(winningPlayer);
      if (winningPlayer !== 0) {
        setTimeout(() => executeBotTurn(winningPlayer, []), 1000);
      } else {
        setStatusMsg('You won the trick! Lead next card.');
      }
    }
  };

  // Calculate Final Scores (Formula: Bid + (Won-Bid)*0.1 if won>=bid; else -Bid)
  const finishMatch = () => {
    setGameState('gameover');

    const results = [0, 1, 2, 3].map(p => {
      const bid = bids[p];
      const won = tricksWon[p];
      let score = 0;
      if (won >= bid) {
        score = +(bid + (won - bid) * 0.1).toFixed(1);
      } else {
        score = -bid;
      }
      return {
        player: p,
        name: p === 0 ? 'You' : `Bot ${p}`,
        bid,
        won,
        score
      };
    }).sort((a, b) => b.score - a.score);

    setLeaderboard(results);
    const isPlayerWinner = results[0].player === 0;

    if (isPlayerWinner) {
      confetti({ particleCount: 120, spread: 80 });
      showToast(`🏆 VICTORY! Rank 1 with ${results[0].score} points! Won ${formatINR(winPrize)}!`);

      playSoloSkillGame({
        gameId: 'real_call_bridge',
        gameTitle: 'Call Bridge Masters Arena',
        entryFee: 0,
        rewardAmount: winPrize,
        won: true
      });
    } else {
      showToast(`Rank ${results.findIndex(r => r.player === 0) + 1}. Better luck in the next tournament!`, 'warning');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: 700, width: '95%', padding: '1.25rem', textAlign: 'center' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ marginBottom: '0.75rem', paddingBottom: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)' }}>
              <Spade size={22} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Call Bridge Masters Arena</h2>
                <span className="badge badge-indigo" style={{ fontSize: '0.62rem' }}>13-Hand Spades Trump</span>
              </div>
              <p style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                Standard 52 Cards • Call Bidding (1-8) • Spades Always Trump • 10% Platform Rake
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
                      border: entryFee === amt ? '2px solid #8b5cf6' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: entryFee === amt ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                      color: entryFee === amt ? '#c084fc' : '#cbd5e1',
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
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Rank 1 Net Pot (90%)</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>{formatINR(winPrize)}</div>
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '10px', border: '1px solid rgba(139, 92, 246, 0.25)' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Platform Rake (10%)</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#c084fc' }}>{formatINR(platformCut)}</div>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, textAlign: 'left', padding: '0.75rem', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px' }}>
              📌 <strong>Real Call Bridge Rules:</strong>
              <ul style={{ paddingLeft: '1.2rem', marginTop: '0.3rem' }}>
                <li>All 52 cards are dealt (13 cards to each of 4 players).</li>
                <li><strong>Spades (♠) are permanent trump</strong>.</li>
                <li>Each player calls their estimated tricks (1 to 8). If you win &gt;= your call, Score = Call + 0.1 per extra trick. If you win &lt; your call, Score = -Call!</li>
                <li>Highest score at the end of 13 rounds takes 1st prize.</li>
              </ul>
            </div>

            <button 
              className="btn btn-primary btn-lg" 
              style={{ width: '100%', fontWeight: 800, fontSize: '1rem', background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}
              onClick={handleStartMatch}
            >
              Deal Call Bridge Hands (Boot {formatINR(entryFee)})
            </button>
          </div>
        )}

        {/* PHASE 2: BIDDING (CALL) */}
        {gameState === 'bidding' && (
          <div style={{ padding: '1rem 0' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', color: '#c084fc' }}>
              Inspect 13 Cards & Place Your Call
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '1.25rem' }}>
              Estimate how many tricks you can win out of 13 rounds. (Spades ♠ are Trump).
            </p>

            {/* Display Player Hand Cards */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1.5rem', maxHeight: '180px', overflowY: 'auto' }}>
              {hands[0].map((card) => (
                <div 
                  key={card.id}
                  style={{
                    width: 46,
                    height: 68,
                    borderRadius: '6px',
                    background: '#ffffff',
                    color: card.color === '#f87171' || card.color === '#fb923c' ? '#dc2626' : '#0f172a',
                    border: card.isTrump ? '2px solid #8b5cf6' : '1px solid #cbd5e1',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '3px',
                    fontWeight: 800,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
                  }}
                >
                  <div style={{ textAlign: 'left', fontSize: '0.72rem' }}>{card.rank}{card.symbol}</div>
                  <div style={{ fontSize: '1.1rem', textAlign: 'center' }}>{card.symbol}</div>
                  <div style={{ textAlign: 'right', fontSize: '0.55rem', color: card.isTrump ? '#8b5cf6' : '#64748b' }}>
                    {card.isTrump ? 'TRUMP' : ''}
                  </div>
                </div>
              ))}
            </div>

            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Choose Your Call:</h4>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <button
                  key={num}
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.5rem 0.9rem', fontWeight: 800 }}
                  onClick={() => handlePlayerCall(num)}
                >
                  Call {num}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PHASE 3: 13 TRICK PLAY */}
        {(gameState === 'playing' || gameState === 'gameover') && (
          <div>
            {/* Live Scores & Calls Strip */}
            <div style={{ 
              marginBottom: '0.75rem', 
              padding: '0.5rem 0.75rem', 
              borderRadius: '8px', 
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid var(--border-subtle)',
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.4rem',
              fontSize: '0.75rem',
              textAlign: 'center'
            }}>
              <div style={{ color: '#c084fc', fontWeight: 700 }}>
                You: {tricksWon[0]}/{bids[0]}
              </div>
              <div style={{ color: '#cbd5e1' }}>
                East: {tricksWon[1]}/{bids[1]}
              </div>
              <div style={{ color: '#cbd5e1' }}>
                North: {tricksWon[2]}/{bids[2]}
              </div>
              <div style={{ color: '#cbd5e1' }}>
                West: {tricksWon[3]}/{bids[3]}
              </div>
            </div>

            {/* Central Green Baize Table Arena */}
            <div style={{
              minHeight: '230px',
              background: 'radial-gradient(circle, #1e1b4b 0%, #0f172a 100%)',
              borderRadius: '16px',
              border: '3px solid #6366f1',
              padding: '1rem',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              boxShadow: 'inset 0 0 30px rgba(0,0,0,0.6)'
            }}>
              {/* North Player */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#cbd5e1', fontSize: '0.75rem', fontWeight: 700 }}>
                <Bot size={14} /> North • {hands[2].length} cards
              </div>

              {/* Table Center (Played Cards) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', margin: '0.5rem 0', minHeight: '80px' }}>
                {trickCards.length === 0 ? (
                  <div style={{ fontSize: '0.8rem', color: '#a5b4fc', fontStyle: 'italic' }}>
                    Round {roundNum}/13 • {statusMsg}
                  </div>
                ) : (
                  trickCards.map((play, idx) => (
                    <div 
                      key={idx}
                      style={{
                        width: 52,
                        height: 75,
                        borderRadius: '6px',
                        background: '#ffffff',
                        color: play.card.color === '#f87171' || play.card.color === '#fb923c' ? '#dc2626' : '#0f172a',
                        border: play.card.isTrump ? '2px solid #8b5cf6' : '2px solid #cbd5e1',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '4px',
                        fontWeight: 800,
                        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                        transform: 'scale(1.05)'
                      }}
                    >
                      <div style={{ textAlign: 'left', fontSize: '0.75rem' }}>{play.card.rank}{play.card.symbol}</div>
                      <div style={{ fontSize: '1.2rem', textAlign: 'center' }}>{play.card.symbol}</div>
                      <div style={{ textAlign: 'right', fontSize: '0.62rem', color: '#64748b' }}>
                        {play.player === 0 ? 'You' : `Bot ${play.player}`}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', padding: '0 0.5rem' }}>
                <span>♠ Spades are Permanent Trump</span>
                <span>Round {Math.min(13, roundNum)} of 13</span>
              </div>
            </div>

            {/* Player Hand Cards (South: You) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700 }}>
                  Your Hand ({hands[0].length} cards) • {turn === 0 ? 'Your Turn (Tap card to play)' : 'Waiting for bots...'}
                </span>
                <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>
                  Target Call: {bids[0]}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
                {hands[0].map((card, idx) => {
                  const leadSuit = trickCards[0]?.card?.suit;
                  const hasLeadSuit = leadSuit && hands[0].some(c => c.suit === leadSuit);
                  const isPlayable = turn === 0 && (!hasLeadSuit || card.suit === leadSuit);

                  return (
                    <button
                      key={card.id}
                      type="button"
                      disabled={!isPlayable}
                      onClick={() => handlePlayCard(idx)}
                      style={{
                        width: 48,
                        height: 72,
                        borderRadius: '6px',
                        background: isPlayable ? '#ffffff' : '#94a3b8',
                        color: card.color === '#f87171' || card.color === '#fb923c' ? '#dc2626' : '#0f172a',
                        border: isPlayable ? (card.isTrump ? '2px solid #8b5cf6' : '2px solid #10b981') : '1px solid #475569',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '3px',
                        fontWeight: 800,
                        cursor: isPlayable ? 'pointer' : 'not-allowed',
                        transform: isPlayable ? 'translateY(-3px)' : 'none',
                        boxShadow: isPlayable ? '0 3px 10px rgba(139, 92, 246, 0.4)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ textAlign: 'left', fontSize: '0.72rem' }}>{card.rank}{card.symbol}</div>
                      <div style={{ fontSize: '1.1rem', textAlign: 'center' }}>{card.symbol}</div>
                      <div style={{ textAlign: 'right', fontSize: '0.55rem', color: card.isTrump ? '#8b5cf6' : '#64748b' }}>
                        {card.isTrump ? '♠' : ''}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Victory / Defeat Overlay */}
            {gameState === 'gameover' && leaderboard && (
              <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '10px', background: leaderboard[0].player === 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', border: `1px solid ${leaderboard[0].player === 0 ? '#10b981' : '#ef4444'}` }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: leaderboard[0].player === 0 ? '#34d399' : '#f87171' }}>
                  {leaderboard[0].player === 0 ? `🏆 VICTORY! 1st Rank Won ${formatINR(winPrize)}!` : 'Tournament Completed!'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', margin: '0.75rem 0', fontSize: '0.78rem' }}>
                  {leaderboard.map((r, i) => (
                    <div key={r.player} style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                      <div style={{ fontWeight: 800, color: i === 0 ? '#fbbf24' : '#cbd5e1' }}>#{i+1} {r.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Call: {r.bid} | Won: {r.won}</div>
                      <div style={{ fontWeight: 800, color: r.score >= 0 ? '#34d399' : '#f87171' }}>{r.score} Pts</div>
                    </div>
                  ))}
                </div>
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
