import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Check, Loader2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import api from '../../services/api';

const rankColors = {
  Bronze:   'text-rank-bronze',
  Silver:   'text-rank-silver',
  Gold:     'text-rank-gold',
  Platinum: 'text-rank-platinum',
  Emerald:  'text-rank-emerald',
  Diamond:  'text-rank-diamond',
};

/**
 * Search result user item
 */
const UserItem = ({ user, onSendRequest, sentIds }) => {
  const isSent = sentIds.includes(user.id);

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
      <Avatar name={user.name} src={user.avatar_url} size="md" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{user.name}</p>
        <p className="text-caption text-text-muted">
          @{user.username} · <span className={rankColors[user.rank?.name || 'Silver'] || 'text-text-muted'}>Lv.{user.level || 1} {user.rank?.name || 'Silver'}</span>
        </p>
      </div>
      <div className="shrink-0">
        {user.is_friend || user.friendship_status === 'accepted' ? (
          <span className="flex items-center gap-1 text-caption text-success font-medium px-2.5 py-1 bg-success/10 rounded-full">
            <Check size={12} /> Friends
          </span>
        ) : isSent || user.friendship_status === 'pending' ? (
          <span className="flex items-center gap-1 text-caption text-text-muted font-medium px-2.5 py-1 bg-dark-secondary rounded-full">
            <Check size={12} /> Sent
          </span>
        ) : (
          <button
            onClick={() => onSendRequest(user)}
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
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get('/api/v1/users/search', { params: { q: query } });
        setResults(res.data?.data?.users || []);
      } catch (err) {
        console.error(err);
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(t);
  }, [query]);

  const handleSendRequest = async (user) => {
    setSentIds((prev) => [...prev, user.id]);
    try {
      await api.post(`/api/v1/friends/request/${user.username}`);
    } catch {
      // Revert optimistic update
      setSentIds((prev) => prev.filter((id) => id !== user.id));
    }
  };

  // Reset on close
  const handleClose = () => {
    setQuery('');
    setSentIds([]);
    setResults([]);
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
          autoFocus={isOpen}
          className="w-full h-11 bg-dark-secondary text-text-primary text-sm rounded-[8px] pl-10 pr-4 border border-border hover:border-border-hover focus:border-primary focus:outline-none transition-colors"
        />
      </div>

      {/* Results */}
      <div className="max-h-72 overflow-y-auto -mx-6 border-t border-border-subtle min-h-[160px]">
        {query.trim().length < 2 ? (
          <div className="text-center py-10">
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-body-sm text-text-secondary">Type at least 2 characters to search</p>
            <p className="text-caption text-text-muted mt-1">Find learners by name or username</p>
          </div>
        ) : searching ? (
          <div className="flex justify-center items-center h-full py-12">
            <Loader2 size={24} className="animate-spin text-primary" />
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
