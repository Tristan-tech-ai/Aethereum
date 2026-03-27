import React, { useState, useEffect } from 'react';
import { Swords, Users, MessageSquare, MoreHorizontal, Search, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { useFriendStore } from '../../stores/friendStore';

const rankColors = {
  Bronze:   'text-rank-bronze',
  Silver:   'text-rank-silver',
  Gold:     'text-rank-gold',
  Platinum: 'text-rank-platinum',
  Emerald:  'text-rank-emerald',
  Diamond:  'text-rank-diamond',
};

/**
 * Mini profile popover shown on hover
 */
const MiniProfilePopover = ({ friend, position = 'right' }) => {
  const posClass = position === 'right'
    ? 'left-full top-0 ml-2'
    : 'right-full top-0 mr-2';

  return (
    <div className={`absolute ${posClass} z-50 w-64 pointer-events-none`}>
      <div className="bg-dark-elevated border border-border rounded-md-drd shadow-lg-drd p-4 pointer-events-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar name={friend.name} src={friend.avatar_url} size="lg" online={friend.online ?? friend.is_learning_now} />
          <div className="min-w-0">
            <Link to={`/profile/${friend.username}`} className="text-sm font-semibold text-text-primary truncate hover:underline block">
              {friend.name}
            </Link>
            <p className="text-caption text-text-muted">@{friend.username}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-caption font-medium ${rankColors[friend.rank] || 'text-text-muted'}`}>
                Lv.{friend.level} · {friend.rank}
              </span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mb-3 text-caption">
          {(friend.online || friend.is_learning_now) ? (
            friend.studying ? (
              <div className="flex items-center gap-1.5 text-success">
                <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                <span>Studying: <span className="text-text-primary font-medium">{friend.studying}</span></span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-success">
                <span className="w-1.5 h-1.5 bg-success rounded-full" />
                <span>Online</span>
              </div>
            )
          ) : (
            <span className="text-text-muted">Last seen {friend.lastSeen || 'recently'}</span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-caption font-medium text-primary-light bg-primary/10 hover:bg-primary/20 rounded-sm-drd transition-colors">
            <Swords size={13} /> Duel
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-caption font-medium text-secondary bg-secondary/10 hover:bg-secondary/20 rounded-sm-drd transition-colors">
            <Users size={13} /> Raid
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Individual friend list item
 */
const FriendItem = ({ friend }) => {
  const [showPopover, setShowPopover] = useState(false);

  return (
    <div
      className="relative flex items-center gap-3 px-3 py-2.5 rounded-sm-drd hover:bg-white/[0.03] transition-colors group cursor-pointer"
      onMouseEnter={() => setShowPopover(true)}
      onMouseLeave={() => setShowPopover(false)}
    >
      <Link to={`/profile/${friend.username}`} className="shrink-0">
        <Avatar name={friend.name} src={friend.avatar_url} size="sm" online={friend.online ?? friend.is_learning_now} />
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/profile/${friend.username}`} className="text-sm text-text-primary font-medium truncate hover:underline block">
          {friend.name}
        </Link>
        {(friend.online || friend.is_learning_now) && friend.studying ? (
          <p className="text-[11px] text-success truncate">📖 {friend.studying}</p>
        ) : (friend.online || friend.is_learning_now) ? (
          <p className="text-[11px] text-success">Online</p>
        ) : (
          <p className="text-[11px] text-text-muted">{friend.lastSeen || 'Offline'}</p>
        )}
      </div>

      {/* Quick action on hover */}
      <div className="hidden group-hover:flex items-center gap-1 shrink-0">
        <button
          className="p-1.5 text-text-muted hover:text-primary-light transition-colors rounded-sm-drd hover:bg-primary/10"
          title="Challenge to Duel"
        >
          <Swords size={14} />
        </button>
        <button
          className="p-1.5 text-text-muted hover:text-secondary transition-colors rounded-sm-drd hover:bg-secondary/10"
          title="Invite to Raid"
        >
          <Users size={14} />
        </button>
      </div>

      {/* Mini Profile Popover */}
      {showPopover && <MiniProfilePopover friend={friend} />}
    </div>
  );
};

/**
 * FriendsList — sidebar/collapsible panel showing all friends
 */
const FriendsList = ({
  className = '',
  collapsed = false,
  onAddFriend,
}) => {
  const { friends, loading, fetchFriends } = useFriendStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'online'

  useEffect(() => {
      fetchFriends();
  }, [fetchFriends]);

  const onlineFriends = friends.filter((f) => f.online || f.is_learning_now);
  const offlineFriends = friends.filter((f) => !f.online && !f.is_learning_now);

  const filteredOnline = onlineFriends.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredOffline = filter === 'online'
    ? []
    : offlineFriends.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.username.toLowerCase().includes(searchQuery.toLowerCase())
      );

  if (loading) {
    return (
      <div className={`bg-dark-card border border-border rounded-md-drd overflow-hidden p-6 flex justify-center ${className}`}>
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={`bg-dark-card border border-border rounded-md-drd overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border-subtle">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-heading font-semibold text-text-primary flex items-center gap-2">
            <Users size={16} className="text-text-muted" />
            Friends
            <span className="text-caption text-text-muted font-normal">({friends.length})</span>
          </h3>
          {onAddFriend && (
            <button
              onClick={onAddFriend}
              className="p-1.5 text-text-muted hover:text-primary-light hover:bg-primary/10 rounded-sm-drd transition-colors"
              title="Add Friend"
            >
              <Users size={14} />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 bg-dark-secondary text-text-primary text-caption rounded-sm-drd pl-8 pr-3 border border-border-subtle focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        {/* Filter */}
        <div className="flex gap-1 mt-2">
          {['all', 'online'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full transition-colors ${
                filter === f
                  ? 'bg-primary/15 text-primary-light'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {f === 'all' ? `All (${friends.length})` : `Online (${onlineFriends.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Friends List */}
      <div className="max-h-[400px] overflow-y-auto">
        {/* Online section */}
        {filteredOnline.length > 0 && (
          <div>
            <p className="px-4 py-1.5 text-overline text-success uppercase tracking-wider">
              Online — {filteredOnline.length}
            </p>
            {filteredOnline.map((friend) => (
              <FriendItem key={friend.id} friend={friend} />
            ))}
          </div>
        )}

        {/* Offline section */}
        {filteredOffline.length > 0 && (
          <div>
            <p className="px-4 py-1.5 text-overline text-text-muted uppercase tracking-wider">
              Offline — {filteredOffline.length}
            </p>
            {filteredOffline.map((friend) => (
              <FriendItem key={friend.id} friend={friend} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {filteredOnline.length === 0 && filteredOffline.length === 0 && (
          <div className="text-center py-8 px-4">
            <p className="text-2xl mb-2">👥</p>
            <p className="text-caption text-text-muted">
              {searchQuery ? 'No friends found' : 'No friends yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsList;
