import React, { useState, useMemo } from 'react';
import { Search, UserPlus, Check } from 'lucide-react';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

// Demo searchable users
const allUsers = [
  { id: 101, name: 'Lina Kusuma', username: 'lina_k', level: 19, rank: 'Learner', isFriend: false },
  { id: 102, name: 'Rani Putri', username: 'rani_p', level: 27, rank: 'Scholar', isFriend: false },
  { id: 103, name: 'Hendra Wijaya', username: 'hendra_w', level: 34, rank: 'Researcher', isFriend: false },
  { id: 104, name: 'Dewi Sari', username: 'dewi_s', level: 12, rank: 'Seedling', isFriend: false },
  { id: 105, name: 'Budi Santoso', username: 'budi_s', level: 24, rank: 'Scholar', isFriend: true },
  { id: 106, name: 'Yoga Pratama', username: 'yoga_p', level: 41, rank: 'Expert', isFriend: false },
  { id: 107, name: 'Fitri Handayani', username: 'fitri_h', level: 8, rank: 'Seedling', isFriend: false },
  { id: 108, name: 'Reza Mahendra', username: 'reza_m', level: 29, rank: 'Scholar', isFriend: false },
];

const rankColors = {
  Seedling: 'text-rank-seedling',
  Learner: 'text-rank-learner',
  Scholar: 'text-rank-scholar',
  Researcher: 'text-rank-researcher',
  Expert: 'text-rank-expert',
  Sage: 'text-rank-sage',
};

/**
 * Search result user item
 */
const UserItem = ({ user, onSendRequest, sentIds }) => {
  const isSent = sentIds.includes(user.id);

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
      <Avatar name={user.name} size="md" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{user.name}</p>
        <p className="text-caption text-text-muted">
          @{user.username} · <span className={rankColors[user.rank] || 'text-text-muted'}>Lv.{user.level} {user.rank}</span>
        </p>
      </div>
      <div className="shrink-0">
        {user.isFriend ? (
          <span className="flex items-center gap-1 text-caption text-success font-medium px-2.5 py-1 bg-success/10 rounded-full">
            <Check size={12} /> Friends
          </span>
        ) : isSent ? (
          <span className="flex items-center gap-1 text-caption text-text-muted font-medium px-2.5 py-1 bg-dark-secondary rounded-full">
            <Check size={12} /> Sent
          </span>
        ) : (
          <button
            onClick={() => onSendRequest(user.id)}
            className="flex items-center gap-1 text-caption text-primary-light font-medium px-2.5 py-1.5 bg-primary/10 hover:bg-primary/20 rounded-full transition-colors"
          >
            <UserPlus size={12} /> Add
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * AddFriendModal — search users and send friend requests
 */
const AddFriendModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [sentIds, setSentIds] = useState([]);

  const results = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return allUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q)
    );
  }, [query]);

  const handleSendRequest = (userId) => {
    setSentIds((prev) => [...prev, userId]);
    // In real app: API call to send friend request
  };

  // Reset on close
  const handleClose = () => {
    setQuery('');
    setSentIds([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Friend" size="sm">
      {/* Search Input */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search by name or username..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="w-full h-11 bg-dark-secondary text-text-primary text-sm rounded-[8px] pl-10 pr-4 border border-border hover:border-border-hover focus:border-primary focus:outline-none transition-colors"
        />
      </div>

      {/* Results */}
      <div className="max-h-72 overflow-y-auto -mx-6 border-t border-border-subtle">
        {query.length < 2 ? (
          <div className="text-center py-10">
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-body-sm text-text-secondary">Type at least 2 characters to search</p>
            <p className="text-caption text-text-muted mt-1">Find learners by name or username</p>
          </div>
        ) : results.length > 0 ? (
          results.map((user) => (
            <UserItem
              key={user.id}
              user={user}
              onSendRequest={handleSendRequest}
              sentIds={sentIds}
            />
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-3xl mb-3">😕</p>
            <p className="text-body-sm text-text-secondary">No users found for "{query}"</p>
            <p className="text-caption text-text-muted mt-1">Try a different name or username</p>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="mt-4 pt-3 border-t border-border-subtle">
        <p className="text-caption text-text-muted text-center">
          💡 You can also share your profile link to invite friends
        </p>
      </div>
    </Modal>
  );
};

export default AddFriendModal;
