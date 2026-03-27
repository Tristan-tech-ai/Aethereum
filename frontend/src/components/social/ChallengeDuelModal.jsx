import React, { useState, useEffect } from 'react';
import { Swords, Clock, Search, Loader2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { useFriendStore } from '../../stores/friendStore';

const durations = [
  { value: 25, label: '25 min', desc: 'Quick focus' },
  { value: 50, label: '50 min', desc: 'Standard' },
  { value: 90, label: '90 min', desc: 'Deep work' },
];

const ChallengeDuelModal = ({ isOpen, onClose, onSendChallenge }) => {
  const { friends, loading, fetchFriends } = useFriendStore();
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) fetchFriends();
  }, [isOpen, fetchFriends]);

  const filtered = friends.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = () => {
    if (!selectedFriend) return;
    onSendChallenge?.({ friend: selectedFriend, duration: selectedDuration });
    handleClose();
  };

  const handleClose = () => {
    setSelectedFriend(null);
    setSelectedDuration(25);
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="🥊 Challenge to Focus Duel" size="md">
      {/* Step 1: Select Friend */}
      <div className="mb-5">
        <label className="block text-body-sm font-medium text-text-secondary mb-2">Select Opponent</label>
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 bg-dark-secondary text-text-primary text-sm rounded-[8px] pl-9 pr-4 border border-border focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        <div className="max-h-44 overflow-y-auto space-y-1 -mx-1 px-1">
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 size={20} className="animate-spin text-text-muted" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-caption text-text-muted py-4">
              {searchQuery ? 'No friends found' : 'No friends yet — add friends first!'}
            </p>
          ) : filtered.map((friend) => (
            <button
              key={friend.id}
              onClick={() => setSelectedFriend(friend)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm-drd transition-all ${
                selectedFriend?.id === friend.id
                  ? 'bg-primary/15 ring-1 ring-primary/40'
                  : 'hover:bg-white/[0.03]'
              }`}
            >
              <Avatar name={friend.name} size="sm" online={friend.online} />
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{friend.name}</p>
                <p className="text-[11px] text-text-muted">@{friend.username} · Lv.{friend.level}</p>
              </div>
              {!friend.online && (
                <span className="text-[10px] text-text-muted bg-dark-secondary px-2 py-0.5 rounded-full">Offline</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Choose Duration */}
      <div className="mb-6">
        <label className="block text-body-sm font-medium text-text-secondary mb-2">
          <Clock size={14} className="inline mr-1.5 -mt-0.5" />
          Duration
        </label>
        <div className="grid grid-cols-3 gap-3">
          {durations.map((d) => (
            <button
              key={d.value}
              onClick={() => setSelectedDuration(d.value)}
              className={`flex flex-col items-center gap-1 p-3 rounded-md-drd border transition-all ${
                selectedDuration === d.value
                  ? 'bg-primary/15 border-primary/40 text-primary-light'
                  : 'bg-dark-card border-border text-text-secondary hover:border-border-hover'
              }`}
            >
              <span className="text-lg font-bold">{d.value}</span>
              <span className="text-[10px] uppercase tracking-wide">{d.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Summary + CTA */}
      {selectedFriend && (
        <div className="bg-dark-card border border-border-subtle rounded-md-drd p-3 mb-4 flex items-center gap-3">
          <Avatar name={selectedFriend.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-text-primary font-medium truncate">
              Challenge {selectedFriend.name}
            </p>
            <p className="text-caption text-text-muted">{selectedDuration} min focus duel</p>
          </div>
          <Swords size={18} className="text-primary-light shrink-0" />
        </div>
      )}

      <Button
        className="w-full"
        disabled={!selectedFriend}
        onClick={handleSend}
      >
        <Swords size={16} className="mr-2" />
        Send Challenge
      </Button>
    </Modal>
  );
};

export default ChallengeDuelModal;
