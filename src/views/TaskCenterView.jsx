import React, { useState } from 'react';
import { 
  PlayCircle, 
  Video, 
  Music, 
  Gamepad2, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  RotateCw, 
  Gift, 
  Brain,
  Wallet,
  ArrowDownCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/finance';
import VideoTaskModal from '../components/VideoTaskModal';
import MusicTaskModal from '../components/MusicTaskModal';
import SpinWheelModal from '../components/SpinWheelModal';
import ScratchCardModal from '../components/ScratchCardModal';
import MemoryGameModal from '../components/MemoryGameModal';
import DailyStreakWidget from '../components/DailyStreakWidget';

const VIDEO_TASKS = [
  {
    id: 'video_1',
    title: 'How Global Yield Funds Generate 10% Monthly Returns',
    category: 'Video',
    reward: 35.00,
    duration: 20,
    youtubeId: 'y9u2eQy5fmg',
    description: 'Learn about algorithmic liquidity, treasury arbitrage, and low-risk yields.',
  },
  {
    id: 'video_2',
    title: 'Compound Interest: The 8th Wonder of the World',
    category: 'Video',
    reward: 50.00,
    duration: 25,
    youtubeId: 'OQznqM_9k8I',
    description: 'See how consistent compounding turns modest capital into massive wealth.',
  },
  {
    id: 'video_3',
    title: 'Smart Wealth Psychology & Daily Habits',
    category: 'Video',
    reward: 40.00,
    duration: 20,
    youtubeId: 'wfOkm4D04rU',
    description: 'Master the habits of high-performing investors.',
  },
];

const MUSIC_TASKS = [
  {
    id: 'music_1',
    title: 'Deep Alpha Mindset Lo-Fi Chill',
    category: 'Music',
    reward: 30.00,
    duration: 20,
    description: 'Listen to 432Hz ambient frequency synthesized chords for focus.',
  },
  {
    id: 'music_2',
    title: 'Cyberpunk Wealth Synthwave Beat',
    category: 'Music',
    reward: 45.00,
    duration: 25,
    description: 'High-energy electronic synthesizer track designed for productive mornings.',
  },
];

const GAME_TASKS = [
  {
    id: 'spin_1',
    title: 'Lucky Wealth Spin Wheel',
    category: 'Game',
    reward: 50.00, // sample
    type: 'spin',
    rewardRange: '₹15 - ₹200',
    description: 'Spin the high-tech wheel to land on instant cash prizes.',
  },
  {
    id: 'scratch_1',
    title: 'Golden Scratch & Win Card',
    category: 'Game',
    reward: 45.00,
    type: 'scratch',
    rewardRange: 'Win up to ₹45',
    description: 'Drag cursor or finger to scratch metallic foil and uncover rewards.',
  },
  {
    id: 'memory_1',
    title: 'Wealth Icon Memory Match',
    category: 'Game',
    reward: 50.00,
    type: 'memory',
    rewardRange: 'Win up to ₹50',
    description: 'Test your brain and match 6 wealth symbol pairs within 60s.',
  },
];

export default function TaskCenterView({ onOpenWithdraw }) {
  const { rewardWallet, tasksCompletedToday, totalDailyQuota, isWithdrawalAllowed } = useApp();

  // Active modals
  const [activeVideoTask, setActiveVideoTask] = useState(null);
  const [activeMusicTask, setActiveMusicTask] = useState(null);
  const [activeSpinTask, setActiveSpinTask] = useState(null);
  const [activeScratchTask, setActiveScratchTask] = useState(null);
  const [activeMemoryTask, setActiveMemoryTask] = useState(null);

  const allTasks = [...VIDEO_TASKS, ...MUSIC_TASKS, ...GAME_TASKS];
  const completedCount = allTasks.filter((t) => tasksCompletedToday[t.id]).length;
  const totalCount = allTasks.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div>
      {/* Header Banner */}
      <div 
        className="glass-card" 
        style={{ 
          padding: '2rem', 
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(16, 185, 129, 0.1) 50%, rgba(99, 102, 241, 0.08) 100%)',
          borderColor: 'rgba(245, 158, 11, 0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-gold">Daily Reward Engine</span>
              <span className="badge badge-emerald">⚡ 24/7 Payouts</span>
            </div>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 800 }}>Task Earning Center</h2>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', maxWidth: '650px', marginTop: '0.3rem' }}>
              Complete tasks (watch videos, listen to music, play casual mini-games) to claim your daily monetary rewards. Rewards accumulate continuously in your wallet and can be withdrawn anytime 24/7 (Min. ₹100)!
            </p>
          </div>

          <div 
            className="glass-card" 
            style={{ 
              padding: '1rem 1.5rem', 
              background: 'rgba(15, 23, 42, 0.75)', 
              border: '1.5px solid rgba(16, 185, 129, 0.4)',
              minWidth: '220px'
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              Reward Wallet
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', margin: '0.2rem 0' }}>
              {formatINR(rewardWallet)}
            </div>
            <button 
              className="btn btn-primary btn-sm"
              style={{ width: '100%', fontSize: '0.8rem' }}
              onClick={onOpenWithdraw}
              disabled={rewardWallet < 100}
            >
              <ArrowDownCircle size={14} /> Withdraw (Min ₹100)
            </button>
          </div>
        </div>

        {/* Progress Tracker Bar */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.45rem' }}>
            <span style={{ color: '#cbd5e1' }}>
              Today's Task Completion: <strong>{completedCount} / {totalCount} Done</strong>
            </span>
            <span style={{ fontWeight: 700, color: '#34d399' }}>
              {progressPercent}% Complete
            </span>
          </div>

          <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${progressPercent}%`, 
                background: 'linear-gradient(90deg, #f59e0b, #10b981)',
                borderRadius: '4px',
                transition: 'width 0.5s ease'
              }}
            />
          </div>
        </div>
      </div>

      {/* Daily Login Streak Attendance Bonus Widget */}
      <DailyStreakWidget />

      {/* Section 1: YouTube Video Tasks */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
            <Video size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Watch YouTube Videos</h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Watch curated educational videos to claim cash rewards</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {VIDEO_TASKS.map((task) => {
            const isDone = tasksCompletedToday[task.id];
            return (
              <div 
                key={task.id} 
                className="glass-card card-interactive"
                style={{ 
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: isDone ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                  background: isDone ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-card)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="badge badge-gold" style={{ fontSize: '0.68rem' }}>
                      <Clock size={11} /> {task.duration}s Watch
                    </span>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>
                      +{formatINR(task.reward)}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem', color: '#f8fafc' }}>
                    {task.title}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: '1.25rem' }}>
                    {task.description}
                  </p>
                </div>

                {isDone ? (
                  <button 
                    className="btn btn-secondary btn-sm" 
                    style={{ width: '100%', color: '#34d399', cursor: 'default' }}
                    disabled
                  >
                    <CheckCircle2 size={16} /> Completed & Credited (+{formatINR(task.reward)})
                  </button>
                ) : (
                  <button 
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => setActiveVideoTask(task)}
                  >
                    <PlayCircle size={16} /> Watch & Earn {formatINR(task.reward)}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Music Listening Tasks */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
            <Music size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Listen to Focus Music</h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Synthesized ambient focus audio tracks with instant payouts</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {MUSIC_TASKS.map((task) => {
            const isDone = tasksCompletedToday[task.id];
            return (
              <div 
                key={task.id} 
                className="glass-card card-interactive"
                style={{ 
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: isDone ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                  background: isDone ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-card)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="badge badge-indigo" style={{ fontSize: '0.68rem' }}>
                      <Clock size={11} /> {task.duration}s Audio
                    </span>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>
                      +{formatINR(task.reward)}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem', color: '#f8fafc' }}>
                    {task.title}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: '1.25rem' }}>
                    {task.description}
                  </p>
                </div>

                {isDone ? (
                  <button 
                    className="btn btn-secondary btn-sm" 
                    style={{ width: '100%', color: '#34d399', cursor: 'default' }}
                    disabled
                  >
                    <CheckCircle2 size={16} /> Completed & Credited (+{formatINR(task.reward)})
                  </button>
                ) : (
                  <button 
                    className="btn btn-primary"
                    style={{ width: '100%', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
                    onClick={() => setActiveMusicTask(task)}
                  >
                    <PlayCircle size={16} /> Listen & Earn {formatINR(task.reward)}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Simple Interactive Mini-Games */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
            <Gamepad2 size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Play Simple Games</h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Interactive casual games with instant monetary rewards</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {GAME_TASKS.map((task) => {
            const isDone = tasksCompletedToday[task.id];
            return (
              <div 
                key={task.id} 
                className="glass-card card-interactive"
                style={{ 
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: isDone ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                  background: isDone ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-card)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="badge badge-gold" style={{ fontSize: '0.68rem' }}>
                      <Sparkles size={11} /> {task.rewardRange}
                    </span>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fbbf24' }}>
                      {task.rewardRange}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem', color: '#f8fafc' }}>
                    {task.title}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: '1.25rem' }}>
                    {task.description}
                  </p>
                </div>

                {isDone ? (
                  <button 
                    className="btn btn-secondary btn-sm" 
                    style={{ width: '100%', color: '#34d399', cursor: 'default' }}
                    disabled
                  >
                    <CheckCircle2 size={16} /> Completed & Credited
                  </button>
                ) : (
                  <button 
                    className="btn btn-gold"
                    style={{ width: '100%' }}
                    onClick={() => {
                      if (task.type === 'spin') setActiveSpinTask(task);
                      else if (task.type === 'scratch') setActiveScratchTask(task);
                      else if (task.type === 'memory') setActiveMemoryTask(task);
                    }}
                  >
                    <Gamepad2 size={16} /> Play Game & Win Cash
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <VideoTaskModal
        isOpen={Boolean(activeVideoTask)}
        onClose={() => setActiveVideoTask(null)}
        task={activeVideoTask}
      />

      <MusicTaskModal
        isOpen={Boolean(activeMusicTask)}
        onClose={() => setActiveMusicTask(null)}
        task={activeMusicTask}
      />

      <SpinWheelModal
        isOpen={Boolean(activeSpinTask)}
        onClose={() => setActiveSpinTask(null)}
        task={activeSpinTask}
      />

      <ScratchCardModal
        isOpen={Boolean(activeScratchTask)}
        onClose={() => setActiveScratchTask(null)}
        task={activeScratchTask}
      />

      <MemoryGameModal
        isOpen={Boolean(activeMemoryTask)}
        onClose={() => setActiveMemoryTask(null)}
        task={activeMemoryTask}
      />
    </div>
  );
}
