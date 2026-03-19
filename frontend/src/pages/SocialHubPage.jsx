import React, { useState } from 'react';
import { Swords, Timer, Brain, BookOpen, Repeat, Users, Heart, Plus, Copy, Clock } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import FriendsList from '../components/social/FriendsList';
import AddFriendModal from '../components/social/AddFriendModal';
import ChallengeDuelModal from '../components/social/ChallengeDuelModal';
import PendingDuels from '../components/social/PendingDuels';
import DuelInProgress from '../components/social/DuelInProgress';
import DuelResults from '../components/social/DuelResults';
import StudyRoomBrowser from '../components/social/StudyRoomBrowser';
import StudyRoomView from '../components/social/StudyRoomView';

const tabs = [
  { key: 'raids', label: '⚔️ Study Raids', icon: Swords },
  { key: 'duels', label: '🥊 Focus Duels', icon: Timer },
  { key: 'arena', label: '🧠 Quiz Arena', icon: Brain },
  { key: 'rooms', label: '📖 Study Rooms', icon: BookOpen },
  { key: 'relay', label: '🏃 Relay', icon: Repeat },
  { key: 'community', label: '🎯 Community', icon: Users },
];

const activeRaids = [
  { id: 1, title: 'Data Structures Raid', host: 'Andi', players: ['Andi', 'Budi', 'Siti'], max: 5, progress: 45, subject: 'Computer Science' },
  { id: 2, title: 'Algorithm Mastery', host: 'Budi', players: ['Budi', 'Arief', 'Maya', 'Dian', 'Eka'], max: 5, progress: 72, subject: 'Computer Science' },
];

const pastRaids = [
  { id: 3, title: 'Calculus Challenge', teamScore: 92, xp: '+75 XP', date: 'Mar 14' },
  { id: 4, title: 'Physics Raid', teamScore: 88, xp: '+65 XP', date: 'Mar 12' },
  { id: 5, title: 'React Patterns', teamScore: 95, xp: '+80 XP', date: 'Mar 10' },
];

const pendingDuelsData = [
  { id: 1, challenger: 'Budi', duration: 25, time: '5 min ago', online: true, level: 24 },
  { id: 2, challenger: 'Maya', duration: 50, time: '1 hour ago', online: false, level: 35 },
];

const studyRooms = [
  { id: 1, name: 'Late Night Study', host: 'Community', members: 12, max: 20, subject: 'General', music: 'Lo-fi', active: true },
  { id: 2, name: 'CS Focus Room', host: 'Andi', members: 5, max: 10, subject: 'Computer Science', music: 'Classical', active: true },
  { id: 3, name: 'Exam Prep Zone', host: 'Siti', members: 8, max: 15, subject: 'Mathematics', music: 'Nature', active: true },
];

const feedEvents = [
  { id: 1, user: 'Andi', emoji: '🎓', message: 'ranked up to Scholar!', time: '2h ago', likes: 12, type: 'rankup' },
  { id: 2, user: 'Budi', emoji: '💯', message: 'earned Quiz Master badge!', time: '3h ago', likes: 8, type: 'achievement' },
  { id: 3, user: 'Siti', emoji: '🔥', message: 'reached 30-day streak!', time: '5h ago', likes: 24, type: 'streak' },
  { id: 4, user: 'Arief', emoji: '⚔️', message: 'completed Study Raid with 95% team score!', time: '1d ago', likes: 15, type: 'raid' },
  { id: 5, user: 'Maya', emoji: '💎', message: 'earned a Diamond card in Molecular Biology!', time: '1d ago', likes: 31, type: 'card' },
  { id: 6, user: 'Community', emoji: '🎯', message: 'Weekly Challenge "Read-a-thon" reached 80%!', time: '2d ago', likes: 56, type: 'challenge' },
];

const SocialHubPage = () => {
  const [activeTab, setActiveTab] = useState('raids');
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [duelPhase, setDuelPhase] = useState('idle'); // 'idle' | 'inProgress' | 'results'
  const [duelOpponent, setDuelOpponent] = useState(null);
  const [duelDuration, setDuelDuration] = useState(25);
  const [pendingDuels, setPendingDuels] = useState(pendingDuelsData);
  const [roomPhase, setRoomPhase] = useState('browse'); // 'browse' | 'inRoom'
  const [activeRoom, setActiveRoom] = useState(null);

  return (
    <div className="px-4 lg:px-8 py-6 max-w-page mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-h2 font-heading text-text-primary">Social Hub</h1>
          <p className="text-body-sm text-text-secondary">Learn together, grow together</p>
        </div>
        <Button onClick={() => setShowAddFriend(true)} variant="secondary" size="sm" className="hidden lg:flex">
          <Plus size={14} className="mr-1.5" /> Add Friend
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-primary text-primary-light'
                : 'border-transparent text-text-muted hover:text-text-secondary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Two-column layout: Main content + Friends sidebar */}
      <div className="flex gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0">

      {/* ── Study Raids ── */}
      {activeTab === 'raids' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-h3 font-heading text-text-primary">Active Raids</h2>
            <Button><Plus size={16} className="mr-1.5" /> Create Raid</Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeRaids.map((raid) => (
              <Card key={raid.id} hover>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary">{raid.title}</h4>
                    <p className="text-caption text-text-muted">by @{raid.host} · {raid.subject}</p>
                  </div>
                  {raid.players.length >= raid.max ? (
                    <Badge variant="danger">FULL</Badge>
                  ) : (
                    <Badge variant="success">OPEN</Badge>
                  )}
                </div>

                {/* Avatars */}
                <div className="flex items-center gap-1 mb-3">
                  {raid.players.map((p, i) => (
                    <Avatar key={i} name={p} size="xs" />
                  ))}
                  <span className="text-caption text-text-muted ml-1">{raid.players.length}/{raid.max}</span>
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-caption mb-1">
                    <span className="text-text-muted">Team Progress</span>
                    <span className="text-text-secondary">{raid.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-dark-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{ width: `${raid.progress}%` }} />
                  </div>
                </div>

                <Button variant={raid.players.length >= raid.max ? 'ghost' : 'secondary'} size="sm" className="w-full" disabled={raid.players.length >= raid.max}>
                  {raid.players.length >= raid.max ? 'Full' : 'Join Raid'}
                </Button>
              </Card>
            ))}
          </div>

          {/* Past Raids */}
          <div>
            <h3 className="text-h4 font-heading text-text-primary mb-3">Past Raids</h3>
            <Card>
              <div className="space-y-0">
                {pastRaids.map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-2.5 border-b border-border-subtle last:border-0">
                    <span className="text-sm text-text-primary">{r.title}</span>
                    <div className="flex items-center gap-4">
                      <Badge variant={r.teamScore >= 90 ? 'success' : 'primary'}>{r.teamScore}%</Badge>
                      <span className="text-caption text-success font-semibold">{r.xp}</span>
                      <span className="text-caption text-text-muted">{r.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── Focus Duels ── */}
      {activeTab === 'duels' && (
        <div className="space-y-6">
          {duelPhase === 'idle' && (
            <>
              {/* Challenge CTA */}
              <div className="flex items-center justify-between">
                <h2 className="text-h3 font-heading text-text-primary">🥊 Focus Duels</h2>
                <Button onClick={() => setShowChallenge(true)}>
                  <Swords size={16} className="mr-1.5" /> Challenge
                </Button>
              </div>

              {/* Pending Duels */}
              <div>
                <h3 className="text-h4 font-heading text-text-primary mb-3">Pending Challenges</h3>
                <PendingDuels
                  duels={pendingDuels}
                  onAccept={(id) => {
                    const duel = pendingDuels.find((d) => d.id === id);
                    setDuelOpponent({ name: duel.challenger, level: duel.level || 20 });
                    setDuelDuration(duel.duration);
                    setPendingDuels((p) => p.filter((d) => d.id !== id));
                    setDuelPhase('inProgress');
                  }}
                  onDecline={(id) => setPendingDuels((p) => p.filter((d) => d.id !== id))}
                />
              </div>
            </>
          )}

          {duelPhase === 'inProgress' && (
            <DuelInProgress
              opponent={duelOpponent}
              duration={duelDuration}
              onComplete={() => setDuelPhase('results')}
            />
          )}

          {duelPhase === 'results' && (
            <DuelResults
              opponent={duelOpponent}
              onClose={() => { setDuelPhase('idle'); setDuelOpponent(null); }}
              onRematch={() => setDuelPhase('inProgress')}
            />
          )}
        </div>
      )}

      {/* ── Quiz Arena ── */}
      {activeTab === 'arena' && (
        <div className="space-y-6">
          <Card padding="spacious" className="text-center">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-h3 font-heading text-text-primary mb-2">Quiz Arena</h3>
            <p className="text-text-secondary mb-6">Host a quiz game with 2-8 players from your learning materials</p>

            <div className="inline-flex items-center gap-3 bg-dark-card border border-border rounded-md-drd px-4 py-3 mb-6">
              <span className="text-h3 font-mono text-text-primary tracking-widest">AXKM42</span>
              <button className="p-1.5 text-text-muted hover:text-primary-light transition-colors">
                <Copy size={16} />
              </button>
            </div>

            <div className="flex gap-3 justify-center">
              <Button>Host New Arena</Button>
              <Button variant="secondary">Join with Code</Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── Study Rooms ── */}
      {activeTab === 'rooms' && (
        <div>
          {roomPhase === 'browse' && (
            <StudyRoomBrowser
              onJoin={(room) => {
                setActiveRoom(room);
                setRoomPhase('inRoom');
              }}
              onCreate={() => {}}
            />
          )}

          {roomPhase === 'inRoom' && activeRoom && (
            <StudyRoomView
              room={activeRoom}
              onLeave={() => {
                setRoomPhase('browse');
                setActiveRoom(null);
              }}
            />
          )}
        </div>
      )}

      {/* ── Learning Relay ── */}
      {activeTab === 'relay' && (
        <div className="space-y-6">
          <Card padding="spacious" className="text-center">
            <div className="text-4xl mb-4">🏃</div>
            <h3 className="text-h3 font-heading text-text-primary mb-2">Learning Relay</h3>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              Split a long material between 2-7 friends. Each person learns one section, writes a summary, then everyone takes the full quiz.
            </p>
            <Button>Create Relay</Button>
          </Card>
        </div>
      )}

      {/* ── Community Feed ── */}
      {activeTab === 'community' && (
        <div className="space-y-4 max-w-2xl">
          <h2 className="text-h3 font-heading text-text-primary mb-4">Community Feed</h2>

          {feedEvents.map((event) => (
            <Card key={event.id} className="flex items-start gap-3">
              <Avatar name={event.user} size="sm" />
              <div className="flex-1">
                <p className="text-sm text-text-secondary">
                  <span className="font-semibold text-text-primary">{event.user}</span>{' '}
                  {event.emoji} {event.message}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <button className="flex items-center gap-1 text-caption text-text-muted hover:text-danger transition-colors">
                    <Heart size={14} />
                    <span>{event.likes}</span>
                  </button>
                  <span className="text-caption text-text-muted">{event.time}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

        </div>{/* end main content */}

        {/* Friends Sidebar */}
        <div className="hidden lg:block w-72 shrink-0">
          <FriendsList onAddFriend={() => setShowAddFriend(true)} />
        </div>
      </div>{/* end two-column */}

      {/* Add Friend Modal */}
      <AddFriendModal isOpen={showAddFriend} onClose={() => setShowAddFriend(false)} />

      {/* Challenge Duel Modal */}
      <ChallengeDuelModal
        isOpen={showChallenge}
        onClose={() => setShowChallenge(false)}
        onSendChallenge={({ friend, duration }) => {
          setDuelOpponent({ name: friend.name, level: friend.level || 20 });
          setDuelDuration(duration);
          setActiveTab('duels');
          setDuelPhase('inProgress');
        }}
      />
    </div>
  );
};

export default SocialHubPage;
