import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  ArrowDownCircle, 
  Sparkles, 
  Flame, 
  Gamepad2, 
  TrendingUp, 
  ShieldCheck,
  CheckCircle2,
  Zap,
  Radio
} from 'lucide-react';
import { formatINR } from '../utils/finance';

const INITIAL_ACTIVITIES = [
  {
    id: 'act_1',
    user: 'xyzz',
    action: 'won',
    amount: 20.00,
    target: 'in Call Bridge Game Arena',
    type: 'game_win',
    icon: Gamepad2,
    color: '#34d399',
    badge: 'Game Win',
  },
  {
    id: 'act_2',
    user: 'yyzz',
    action: 'withdrew',
    amount: 230.45,
    target: 'via Instant UPI Payout',
    type: 'withdraw',
    icon: ArrowDownCircle,
    color: '#38bdf8',
    badge: 'Withdrawal',
  },
  {
    id: 'act_3',
    user: 'ffssj',
    action: 'received incentive of',
    amount: 6.00,
    target: 'for Daily Video Task',
    type: 'task',
    icon: Sparkles,
    color: '#fbbf24',
    badge: 'Task Reward',
  },
  {
    id: 'act_4',
    user: 'User_9821',
    action: 'claimed',
    amount: 12.00,
    target: 'Day 30 Login Grand Finish',
    type: 'streak',
    icon: Flame,
    color: '#f97316',
    badge: '30D Streak',
  },
  {
    id: 'act_5',
    user: 'Investor_44',
    action: 'won',
    amount: 45.00,
    target: 'in 29 Cards Game Arena',
    type: 'game_win',
    icon: Trophy,
    color: '#34d399',
    badge: '1st Rank',
  },
  {
    id: 'act_6',
    user: 'Priya_P',
    action: 'won',
    amount: 36.00,
    target: 'in 4-Player Live Ludo Arena',
    type: 'game_win',
    icon: Gamepad2,
    color: '#a855f7',
    badge: 'PvP Ludo',
  },
  {
    id: 'act_7',
    user: 'Vikram_S',
    action: 'received incentive of',
    amount: 35.00,
    target: 'YouTube Video & Facebook Share',
    type: 'task',
    icon: Sparkles,
    color: '#fbbf24',
    badge: 'Task Share',
  },
  {
    id: 'act_8',
    user: 'Kiran_T',
    action: 'withdrew',
    amount: 1450.00,
    target: 'to HDFC Bank Account',
    type: 'withdraw',
    icon: ArrowDownCircle,
    color: '#38bdf8',
    badge: 'Bank Payout',
  },
  {
    id: 'act_9',
    user: 'Dev_Pro',
    action: 'solved & won',
    amount: 40.00,
    target: '3×3 Slide Puzzle within 60s',
    type: 'game_win',
    icon: Zap,
    color: '#34d399',
    badge: 'Logic Puzzle',
  },
  {
    id: 'act_10',
    user: 'Sunita_R',
    action: 'earned',
    amount: 150.00,
    target: 'MLM Binary Pair Match Bonus',
    type: 'mlm',
    icon: TrendingUp,
    color: '#ec4899',
    badge: 'Binary Match',
  },
];

const RANDOM_NAMES = ['xyzz', 'yyzz', 'ffssj', 'amit_k', 'neha_r', 'rajesh99', 'pooja_v', 'sneha_b', 'kunal_m', 'suresh_p'];
const RANDOM_GAMES = ['Call Bridge Arena', '29 Cards Game', '3×3 Slide Puzzle', '4-Player Live Ludo', 'Memory Match Arena'];

export default function LiveActivityTicker() {
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);

  // Periodically inject a new live simulated player action
  useEffect(() => {
    const interval = setInterval(() => {
      const randomUser = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)] + Math.floor(Math.random() * 90 + 10);
      const isWin = Math.random() > 0.45;
      const isWithdraw = !isWin && Math.random() > 0.5;

      let newAct;
      if (isWin) {
        const game = RANDOM_GAMES[Math.floor(Math.random() * RANDOM_GAMES.length)];
        const amt = [18.00, 20.00, 36.00, 45.00, 50.00][Math.floor(Math.random() * 5)];
        newAct = {
          id: `act_${Date.now()}`,
          user: randomUser,
          action: 'won',
          amount: amt,
          target: `in ${game}`,
          type: 'game_win',
          icon: Gamepad2,
          color: '#34d399',
          badge: 'Game Win',
        };
      } else if (isWithdraw) {
        const amt = +(Math.random() * 350 + 100).toFixed(2);
        newAct = {
          id: `act_${Date.now()}`,
          user: randomUser,
          action: 'withdrew',
          amount: amt,
          target: 'via Instant UPI',
          type: 'withdraw',
          icon: ArrowDownCircle,
          color: '#38bdf8',
          badge: 'Withdrawal',
        };
      } else {
        const amt = [6.00, 10.00, 25.00, 35.00, 50.00][Math.floor(Math.random() * 5)];
        newAct = {
          id: `act_${Date.now()}`,
          user: randomUser,
          action: 'received incentive of',
          amount: amt,
          target: 'for Daily Task',
          type: 'task',
          icon: Sparkles,
          color: '#fbbf24',
          badge: 'Task Reward',
        };
      }

      setActivities(prev => [newAct, ...prev.slice(0, 14)]);
    }, 9000);

    return () => clearInterval(interval);
  }, []);

  // Double the list for seamless continuous infinite CSS loop
  const loopActivities = [...activities, ...activities];

  return (
    <div 
      style={{
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(245, 158, 11, 0.2)',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        height: '30px',
        overflow: 'hidden',
        position: 'relative',
        marginBottom: '1rem',
        userSelect: 'none'
      }}
    >
      {/* Left Badge: Live Activity Status Indicator */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0 0.75rem',
          background: 'rgba(244, 63, 94, 0.15)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          height: '100%',
          flexShrink: 0,
          zIndex: 2
        }}
      >
        <span 
          className="live-pulse-dot" 
          style={{ 
            width: 6, 
            height: 6, 
            borderRadius: '50%', 
            background: '#ef4444',
            boxShadow: '0 0 8px #ef4444' 
          }} 
        />
        <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.5px', color: '#f8fafc', textTransform: 'uppercase' }}>
          Live Stream
        </span>
      </div>

      {/* Center: Infinite Marquee Scrolling Track */}
      <div className="marquee-container" style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'center' }}>
        <div className="marquee-track" style={{ display: 'flex', alignItems: 'center', gap: '2rem', paddingLeft: '1rem' }}>
          {loopActivities.map((act, index) => {
            const Icon = act.icon || Sparkles;
            return (
              <div 
                key={`${act.id}-${index}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.78rem',
                  whiteSpace: 'nowrap',
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <div 
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: `${act.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: act.color
                  }}
                >
                  <Icon size={12} />
                </div>

                <span style={{ color: '#94a3b8' }}>
                  Player <strong style={{ color: '#f1f5f9' }}>{act.user}</strong>
                </span>

                <span style={{ color: '#cbd5e1' }}>
                  {act.action}
                </span>

                <strong style={{ color: act.color, fontWeight: 800, fontSize: '0.82rem' }}>
                  {formatINR(act.amount)}
                </strong>

                <span style={{ color: '#94a3b8', fontSize: '0.74rem' }}>
                  {act.target}
                </span>

                <span 
                  style={{
                    fontSize: '0.62rem',
                    padding: '1px 6px',
                    borderRadius: '8px',
                    background: `${act.color}15`,
                    color: act.color,
                    fontWeight: 700,
                    border: `1px solid ${act.color}40`,
                    marginLeft: '0.2rem'
                  }}
                >
                  {act.badge}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
