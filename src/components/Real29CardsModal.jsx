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
  HelpCircle,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/finance';

/* =========================================================================
   29 CARDS (TWENTY-NINE) CONSTANTS & AUTHENTIC POINT HIERARCHY
   Jack = 3, Nine = 2, Ace = 1, Ten = 1, King = 0, Queen = 0, 8 = 0, 7 = 0
   Total Card Points = 28 + 1 (last trick) = 29
   ========================================================================= */

const SUITS = [
  { name: 'Spades', symbol: '♠', color: '#60a5fa' },
  { name: 'Hearts', symbol: '♥', color: '#f87171' },
  { name: 'Diamonds', symbol: '♦', color: '#fb923c' },
  { name: 'Clubs', symbol: '♣', color: '#34d399' }
];

const RANKS = [
  { rank: 'J', points: 3, power: 8, name: 'Jack' },
  { rank: '9', points: 2, power: 7, name: 'Nine' },
  { rank: 'A', points: 1, power: 6, name: 'Ace' },
  { rank: '10', points: 1, power: 5, name: 'Ten' },
  { rank: 'K', points: 0, power: 4, name: 'King' },
  { rank: 'Q', points: 0, power: 3, name: 'Queen' },
  { rank: '8', points: 0, power: 2, name: 'Eight' },
  { rank: '7', points: 0, power: 1, name: 'Seven' },
];

// Generate 32-card 29 deck
const create29Deck = () => {
  const deck = [];
  SUITS.forEach(suit => {
    RANKS.forEach(rank => {
      deck.push({
        id: `${rank.rank}_${suit.name}`,
        rank: rank.rank,
        suit: suit.name,
        symbol: suit.symbol,
        color: suit.color,
        points: rank.points,
        power: rank.power
      });
    });
  });
  // Shuffle
  return deck.sort(() => Math.random() - 0.5);
};

export default function Real29CardsModal({ isOpen, onClose }) {
  const { rewardWallet, playSoloSkillGame, showToast, userMembershipTier } = useApp();

  const [entryFee, setEntryFee] = useState(10);
  const [gameState, setGameState] = useState('lobby'); // 'lobby', 'bidding', 'trump_selection', 'playing', 'gameover'
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Players: 0 = You (South), 1 = East (Bot), 2 = North (Your Partner Bot), 3 = West (Bot)
  // Teams: Team 1 (You & North) vs Team 2 (East & West)
  const [hands, setHands] = useState([[], [], [], []]);
  const [bidLeader, setBidLeader] = useState(0); // 0, 1, 2, or 3
  const [currentBid, setCurrentBid] = useState(16);
  const [myBidChoice, setMyBidChoice] = useState(16);

  // Trump card state
  const [trumpSuit, setTrumpSuit] = useState(null);
  const [isTrumpRevealed, setIsTrumpRevealed] = useState(false);
  const [trumpRevealer, setTrumpRevealer] = useState(null);

  // Trick Play State
  const [trickCards, setTrickCards] = useState([]); // [{ player: 0, card }, ...]
  const [turn, setTurn] = useState(0); // 0 to 3
  const [tricksPlayed, setTricksPlayed] = useState(0); // 0 to 8
  const [team1Points, setTeam1Points] = useState(0); // You & Partner
  const [team2Points, setTeam2Points] = useState(0); // Opponents
  const [statusMsg, setStatusMsg] = useState('');
  const [gameResult, setGameResult] = useState(null);

  // Reset on open/close
  useEffect(() => {
    if (!isOpen) {
      setGameState('lobby');
      setHands([[], [], [], []]);
      setTrumpSuit(null);
      setIsTrumpRevealed(false);
      setTrickCards([]);
      setGameResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const grossPot = entryFee * 4;
  const platformCut = +(grossPot * 0.10).toFixed(2);
  const winPrize = +(grossPot - platformCut).toFixed(2);

  // Phase 1: Start Game & Deal First 4 Cards
  const handleStartGame = () => {
    if (rewardWallet < entryFee) {
      showToast(`Insufficient Task Wallet! Entry fee is ${formatINR(entryFee)}.`, 'error');
      return;
    }

    const deducted = playSoloSkillGame({
      gameId: 'real_29_cards',
      gameTitle: '29 Cards Championship',
      entryFee: entryFee,
      rewardAmount: 0,
      won: false
    });

    if (!deducted) return;

    const fullDeck = create29Deck();
    // Deal 4 cards each initially
    const dealtHands = [
      fullDeck.slice(0, 4),
      fullDeck.slice(4, 8),
      fullDeck.slice(8, 12),
      fullDeck.slice(12, 16)
    ];

    // Store remaining deck in ref or state for second deal
    window._remaining29Deck = fullDeck.slice(16, 32);

    setHands(dealtHands);
    setGameState('bidding');
    setCurrentBid(16);
    setMyBidChoice(16);
    setBidLeader(0);
    setStatusMsg('Bidding Round (16-28): Place your bid or Pass.');
  };

  // Phase 2: Bidding Handling
  const handlePlayerBid = (bidAmt) => {
    if (bidAmt === 'pass') {
      // Player passes, let East or West take bid
      const oppBid = 16 + Math.floor(Math.random() * 2);
      setCurrentBid(oppBid);
      setBidLeader(1); // East takes bid
      const randomSuit = SUITS[Math.floor(Math.random() * 4)].name;
      setTrumpSuit(randomSuit);
      dealSecondFourCards(1, randomSuit);
    } else {
      setCurrentBid(bidAmt);
      setBidLeader(0);
      setGameState('trump_selection');
      setStatusMsg(`You won the bid at ${bidAmt}! Select your Secret Trump Suit.`);
    }
  };

  // Phase 3: Player Selects Secret Trump
  const handleSelectTrump = (suitName) => {
    setTrumpSuit(suitName);
    showToast(`Trump set secretly to ${suitName}! Dealing remaining 4 cards...`, 'success');
    dealSecondFourCards(0, suitName);
  };

  // Deal second 4 cards to complete 8-card hands
  const dealSecondFourCards = (finalBidLeader, finalTrumpSuit) => {
    const remaining = window._remaining29Deck || [];
    setHands(prev => [
      [...prev[0], ...remaining.slice(0, 4)].sort(sortCards),
      [...prev[1], ...remaining.slice(4, 8)],
      [...prev[2], ...remaining.slice(8, 12)],
      [...prev[3], ...remaining.slice(12, 16)]
    ]);

    setIsTrumpRevealed(false);
    setGameState('playing');
    setTricksPlayed(0);
    setTeam1Points(0);
    setTeam2Points(0);
    setTrickCards([]);
    setTurn(finalBidLeader);
    setStatusMsg(`8 Cards Dealt. ${finalBidLeader === 0 ? 'You lead the first trick!' : 'Lead player playing...'}`);

    if (finalBidLeader !== 0) {
      setTimeout(() => executeBotPlay(finalBidLeader, []), 1000);
    }
  };

  const sortCards = (a, b) => {
    if (a.suit !== b.suit) return a.suit.localeCompare(b.suit);
    return b.power - a.power;
  };

  // Phase 4: Playing Cards & Following Suit
  const handlePlayCard = (cardIdx) => {
    if (turn !== 0 || gameState !== 'playing') return;

    const myHand = hands[0];
    const card = myHand[cardIdx];

    // Check must follow suit
    if (trickCards.length > 0) {
      const leadSuit = trickCards[0].card.suit;
      const hasLeadSuit = myHand.some(c => c.suit === leadSuit);
      if (hasLeadSuit && card.suit !== leadSuit) {
        showToast(`Must follow suit! Play a ${leadSuit} card.`, 'warning');
        return;
      }
    }

    // Play card
    const newHand = myHand.filter((_, i) => i !== cardIdx);
    setHands(prev => [newHand, prev[1], prev[2], prev[3]]);

    const newTrick = [...trickCards, { player: 0, card }];
    setTrickCards(newTrick);

    if (newTrick.length === 4) {
      setTimeout(() => resolveTrick(newTrick), 1200);
    } else {
      setTurn(1);
      setTimeout(() => executeBotPlay(1, newTrick), 800);
    }
  };

  // Reveal Trump Button for Player (When player has no lead suit and trump is hidden)
  const handleRevealTrump = () => {
    if (isTrumpRevealed || trickCards.length === 0) return;
    setIsTrumpRevealed(true);
    setTrumpRevealer(0);
    showToast(`Trump revealed: ${trumpSuit}! Must play trump if you have one.`, 'info');
  };

  // AI Bot Play Logic
  const executeBotPlay = (botIdx, currentTrick) => {
    setHands(prevHands => {
      const botHand = [...prevHands[botIdx]];
      if (botHand.length === 0) return prevHands;

      let chosenIdx = 0;

      if (currentTrick.length === 0) {
        // Leading: Play high card or Jack
        chosenIdx = Math.floor(Math.random() * botHand.length);
      } else {
        const leadSuit = currentTrick[0].card.suit;
        const matchingSuitIndices = [];
        botHand.forEach((c, i) => {
          if (c.suit === leadSuit) matchingSuitIndices.push(i);
        });

        if (matchingSuitIndices.length > 0) {
          // Must follow suit! Play highest or lowest matching
          chosenIdx = matchingSuitIndices[0];
        } else {
          // Has no lead suit: Can trump if trump is revealed
          if (!isTrumpRevealed && Math.random() > 0.4) {
            setIsTrumpRevealed(true);
            setTrumpRevealer(botIdx);
          }
          chosenIdx = 0;
        }
      }

      const playedCard = botHand[chosenIdx];
      const updatedBotHand = botHand.filter((_, i) => i !== chosenIdx);
      const newTrick = [...currentTrick, { player: botIdx, card: playedCard }];
      setTrickCards(newTrick);

      const nextPlayer = (botIdx + 1) % 4;

      if (newTrick.length === 4) {
        setTimeout(() => resolveTrick(newTrick), 1200);
      } else {
        setTurn(nextPlayer);
        if (nextPlayer !== 0) {
          setTimeout(() => executeBotPlay(nextPlayer, newTrick), 700);
        } else {
          setStatusMsg('Your turn! Play a card to the table.');
        }
      }

      const updatedAllHands = [...prevHands];
      updatedAllHands[botIdx] = updatedBotHand;
      return updatedAllHands;
    });
  };

  // Resolve Completed 4-Card Trick
  const resolveTrick = (fullTrick) => {
    const leadSuit = fullTrick[0].card.suit;
    let winningPlay = fullTrick[0];

    fullTrick.forEach(play => {
      const { card } = play;
      const isWinnerTrump = isTrumpRevealed && winningPlay.card.suit === trumpSuit;
      const isCurrTrump = isTrumpRevealed && card.suit === trumpSuit;

      if (isCurrTrump && !isWinnerTrump) {
        winningPlay = play;
      } else if (isCurrTrump && isWinnerTrump) {
        if (card.power > winningPlay.card.power) winningPlay = play;
      } else if (!isWinnerTrump && card.suit === leadSuit) {
        if (card.power > winningPlay.card.power) winningPlay = play;
      }
    });

    // Calculate trick points: J=3, 9=2, A=1, 10=1
    let trickPoints = fullTrick.reduce((acc, p) => acc + p.card.points, 0);
    const nextTricksCount = tricksPlayed + 1;

    // +1 point for 8th (last) trick
    if (nextTricksCount === 8) {
      trickPoints += 1;
    }

    const winnerIsTeam1 = winningPlay.player === 0 || winningPlay.player === 2; // You or North Partner
    if (winnerIsTeam1) {
      setTeam1Points(prev => prev + trickPoints);
    } else {
      setTeam2Points(prev => prev + trickPoints);
    }

    const winnerName = winningPlay.player === 0 ? 'You' : winningPlay.player === 2 ? 'Your Partner' : `Bot ${winningPlay.player}`;
    setStatusMsg(`${winnerName} won trick (+${trickPoints} pts)! Leading next trick...`);

    setTricksPlayed(nextTricksCount);
    setTrickCards([]);

    if (nextTricksCount >= 8) {
      finishGame(winnerIsTeam1 ? team1Points + trickPoints : team1Points, !winnerIsTeam1 ? team2Points + trickPoints : team2Points);
    } else {
      setTurn(winningPlay.player);
      if (winningPlay.player !== 0) {
        setTimeout(() => executeBotPlay(winningPlay.player, []), 1000);
      } else {
        setStatusMsg('You won the trick! Lead the next card.');
      }
    }
  };

  // Finish Match & Check Bidding Target
  const finishGame = (finalTeam1Pts, finalTeam2Pts) => {
    setGameState('gameover');
    const isBiddingTeam1 = bidLeader === 0 || bidLeader === 2;
    const team1WonBid = isBiddingTeam1 ? finalTeam1Pts >= currentBid : finalTeam1Pts > (29 - currentBid);

    setGameResult({
      team1Points: finalTeam1Pts,
      team2Points: finalTeam2Pts,
      targetBid: currentBid,
      isUserWinner: team1WonBid,
      prizeWon: team1WonBid ? winPrize : 0
    });

    if (team1WonBid) {
      confetti({ particleCount: 120, spread: 80 });
      showToast(`🏆 VICTORY! Team 1 achieved target with ${finalTeam1Pts} points! Won ${formatINR(winPrize)}!`);

      playSoloSkillGame({
        gameId: 'real_29_cards',
        gameTitle: '29 Cards Championship',
        entryFee: 0,
        rewardAmount: winPrize,
        won: true
      });
    } else {
      showToast(`Team 2 took ${finalTeam2Pts} points. Target bid ${currentBid} not reached!`, 'error');
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
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.4)' }}>
              <Trophy size={22} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>29 Cards Championship</h2>
                <span className="badge badge-emerald" style={{ fontSize: '0.62rem' }}>Traditional South Asian Rules</span>
              </div>
              <p style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                32 Cards (J=3, 9=2, A=1, 10=1) • Bidding 16-28 • Hidden Trump • 10% Rake
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
                      border: entryFee === amt ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: entryFee === amt ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                      color: entryFee === amt ? '#34d399' : '#cbd5e1',
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
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Winning Team Pot (90%)</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>{formatINR(winPrize)}</div>
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Platform Cut (10%)</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#60a5fa' }}>{formatINR(platformCut)}</div>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, textAlign: 'left', padding: '0.75rem', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px' }}>
              📌 <strong>Authentic 29 Cards Rules:</strong>
              <ul style={{ paddingLeft: '1.2rem', marginTop: '0.3rem' }}>
                <li>Card Values: <strong>J = 3 pts, 9 = 2 pts, A = 1 pt, 10 = 1 pt</strong>. K, Q, 8, 7 = 0 pts. Total 28 pts + 1 pt for final trick = 29 points!</li>
                <li>First 4 cards dealt, then Bidding (16-28). Highest bidder sets Secret Trump.</li>
                <li>Second 4 cards dealt. Players must follow lead suit. If you have no lead suit, you can <strong>Ask to Reveal Trump</strong> to cut!</li>
              </ul>
            </div>

            <button 
              className="btn btn-primary btn-lg" 
              style={{ width: '100%', fontWeight: 800, fontSize: '1rem', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}
              onClick={handleStartGame}
            >
              Deal 29 Cards Match (Boot {formatINR(entryFee)})
            </button>
          </div>
        )}

        {/* PHASE 2: BIDDING ROUND */}
        {gameState === 'bidding' && (
          <div style={{ padding: '1rem 0' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', color: '#34d399' }}>
              Bidding Phase (Initial 4 Cards)
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '1.25rem' }}>
              Inspect your first 4 cards and choose your bid (16 to 28) or Pass.
            </p>

            {/* Display Player's 4 Hand Cards */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {hands[0].map((card, i) => (
                <div 
                  key={card.id}
                  style={{
                    width: 60,
                    height: 85,
                    borderRadius: '8px',
                    background: '#ffffff',
                    color: card.color === '#f87171' || card.color === '#fb923c' ? '#dc2626' : '#0f172a',
                    border: '2px solid #cbd5e1',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '6px',
                    fontWeight: 800,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                  }}
                >
                  <div style={{ textAlign: 'left', fontSize: '0.85rem' }}>{card.rank}{card.symbol}</div>
                  <div style={{ fontSize: '1.4rem' }}>{card.symbol}</div>
                  <div style={{ textAlign: 'right', fontSize: '0.7rem', color: '#64748b' }}>{card.points}pt</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {[16, 17, 18, 19, 20].map((b) => (
                <button
                  key={b}
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.5rem 1rem', fontWeight: 700 }}
                  onClick={() => handlePlayerBid(b)}
                >
                  Bid {b}
                </button>
              ))}
              <button
                type="button"
                className="btn btn-danger btn-sm"
                style={{ padding: '0.5rem 1rem', fontWeight: 700 }}
                onClick={() => handlePlayerBid('pass')}
              >
                Pass
              </button>
            </div>
          </div>
        )}

        {/* PHASE 3: SECRET TRUMP SELECTION */}
        {gameState === 'trump_selection' && (
          <div style={{ padding: '1rem 0' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fbbf24' }}>
              Set Secret Trump Card
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '1.25rem' }}>
              You won the bid at <strong>{currentBid}</strong>! Choose the Trump Suit (kept face down until revealed).
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              {SUITS.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => handleSelectTrump(s.name)}
                  style={{
                    padding: '1rem 0.5rem',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: '2rem', color: s.color }}>{s.symbol}</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>{s.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PHASE 4: IN-GAME TRICK TAKING */}
        {(gameState === 'playing' || gameState === 'gameover') && (
          <div>
            {/* Status & Point Score Strip */}
            <div style={{ 
              marginBottom: '0.75rem', 
              padding: '0.6rem 0.85rem', 
              borderRadius: '8px', 
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid var(--border-subtle)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              fontSize: '0.82rem'
            }}>
              <div>
                <span style={{ color: '#34d399', fontWeight: 700 }}>Team 1 (You & Partner): {team1Points} pts</span>
                <span style={{ margin: '0 8px', color: '#64748b' }}>|</span>
                <span style={{ color: '#f87171', fontWeight: 700 }}>Team 2: {team2Points} pts</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="badge badge-gold" style={{ fontSize: '0.68rem' }}>
                  Target: {currentBid} Pts
                </span>
                <span className="badge badge-indigo" style={{ fontSize: '0.68rem' }}>
                  Trick {tricksPlayed + 1}/8
                </span>
              </div>
            </div>

            {/* Central Playing Table Arena */}
            <div style={{
              minHeight: '230px',
              background: 'radial-gradient(circle, #064e3b 0%, #022c22 100%)',
              borderRadius: '16px',
              border: '3px solid #047857',
              padding: '1rem',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              boxShadow: 'inset 0 0 30px rgba(0,0,0,0.6)'
            }}>
              {/* Partner (North) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#a7f3d0', fontSize: '0.78rem', fontWeight: 700 }}>
                <Bot size={15} /> Partner (North) • {hands[2].length} cards
              </div>

              {/* Table Center (Played Cards & Trump Slot) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', margin: '0.5rem 0' }}>
                {/* Secret Trump Card Indicator */}
                <div style={{ textAlign: 'center' }}>
                  <div 
                    style={{
                      width: 50,
                      height: 70,
                      borderRadius: '6px',
                      background: isTrumpRevealed ? '#ffffff' : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                      border: '2px solid #fbbf24',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isTrumpRevealed ? '#dc2626' : '#fbbf24',
                      fontSize: isTrumpRevealed ? '1.5rem' : '0.85rem',
                      fontWeight: 800,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
                    }}
                  >
                    {isTrumpRevealed ? (
                      SUITS.find(s => s.name === trumpSuit)?.symbol || '♠'
                    ) : (
                      '🂠'
                    )}
                  </div>
                  <span style={{ fontSize: '0.62rem', color: '#cbd5e1', fontWeight: 700, marginTop: '2px', display: 'block' }}>
                    {isTrumpRevealed ? `Trump: ${trumpSuit}` : 'Hidden Trump'}
                  </span>
                </div>

                {/* Active Trick Cards on Table */}
                <div style={{ display: 'flex', gap: '0.5rem', minHeight: '75px', alignItems: 'center' }}>
                  {trickCards.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: '#6ee7b7', fontStyle: 'italic' }}>
                      {statusMsg}
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
                          border: '2px solid #cbd5e1',
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
                          {play.player === 0 ? 'You' : `P${play.player}`}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Reveal Trump Action Button */}
              {!isTrumpRevealed && trickCards.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-gold btn-sm"
                    style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem', fontWeight: 700 }}
                    onClick={handleRevealTrump}
                  >
                    <Eye size={13} /> Ask to Reveal Trump
                  </button>
                </div>
              )}
            </div>

            {/* Player Hand Cards (South: You) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700 }}>
                  Your Hand ({hands[0].length} cards remaining) • {turn === 0 ? 'Your Turn (Tap card to play)' : 'Waiting...'}
                </span>
                <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                  South (You)
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
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
                        width: 54,
                        height: 78,
                        borderRadius: '6px',
                        background: isPlayable ? '#ffffff' : '#94a3b8',
                        color: card.color === '#f87171' || card.color === '#fb923c' ? '#dc2626' : '#0f172a',
                        border: isPlayable ? '2px solid #10b981' : '1px solid #475569',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '4px',
                        fontWeight: 800,
                        cursor: isPlayable ? 'pointer' : 'not-allowed',
                        transform: isPlayable ? 'translateY(-4px)' : 'none',
                        boxShadow: isPlayable ? '0 4px 12px rgba(16, 185, 129, 0.4)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ textAlign: 'left', fontSize: '0.75rem' }}>{card.rank}{card.symbol}</div>
                      <div style={{ fontSize: '1.2rem', textAlign: 'center' }}>{card.symbol}</div>
                      <div style={{ textAlign: 'right', fontSize: '0.62rem', color: '#64748b' }}>{card.points}pt</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Victory / Defeat Overlay */}
            {gameState === 'gameover' && gameResult && (
              <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '10px', background: gameResult.isUserWinner ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', border: `1px solid ${gameResult.isUserWinner ? '#10b981' : '#ef4444'}` }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: gameResult.isUserWinner ? '#34d399' : '#f87171' }}>
                  {gameResult.isUserWinner ? `🏆 VICTORY! Team 1 Won ${formatINR(winPrize)}!` : '💔 Target Bid Failed!'}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '0.2rem', marginBottom: '0.75rem' }}>
                  Team 1 (You & Partner): <strong>{gameResult.team1Points} pts</strong> • Team 2: <strong>{gameResult.team2Points} pts</strong> (Target: {gameResult.targetBid} pts)
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
