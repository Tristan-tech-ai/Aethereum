import React, { useState, useRef, useEffect } from 'react';
import { UserPlus, Check, X, Loader2 } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { useFriendStore } from '../../stores/friendStore';

const timeAgo = (value) => {
  if (!value) return '';
  const diffMs = Date.now() - new Date(value).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}h ago`;
  const day = Math.floor(hour / 24);
  return `${day}d ago`;
};

/**
 * Individual friend request item
 */
const RequestItem = ({ request, onAccept, onDecline }) => (
  <div className="flex items-start gap-3 p-3 hover:bg-white/[0.02] transition-colors rounded-sm-drd">
    <Avatar name={request.user?.name} src={request.user?.avatar_url} size="sm" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-text-primary truncate">{request.user?.name}</p>
      <p className="text-[11px] text-text-muted">
        @{request.user?.username} · Lv.{request.user?.level ?? 1}
      </p>
      <p className="text-[10px] text-text-muted mt-0.5">{timeAgo(request.created_at)}</p>
    </div>
    <div className="flex gap-1 shrink-0 mt-0.5">
      <button
        onClick={() => onAccept(request.id)}
        className="p-1.5 text-success hover:bg-success/10 rounded-sm-drd transition-colors"
        title="Accept"
      >
        <Check size={14} />
      </button>
      <button
        onClick={() => onDecline(request.id)}
        className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-sm-drd transition-colors"
        title="Decline"
      >
        <X size={14} />
      </button>
    </div>
  </div>
);

/**
 * FriendRequestNotification — navbar bell/badge with dropdown panel
 */
const FriendRequestNotification = ({
  className = '',
}) => {
  const { friendRequests, loading, fetchRequests, acceptRequest, declineRequest } = useFriendStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = friendRequests.length;

  useEffect(() => {
    fetchRequests();
    const id = setInterval(() => fetchRequests(), 30000);
    return () => clearInterval(id);
  }, [fetchRequests]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleAccept = async (id) => {
    await acceptRequest(id);
  };

  const handleDecline = async (id) => {
    await declineRequest(id);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-text-muted hover:text-text-primary transition-colors duration-fast"
        title="Friend Requests"
        aria-label={`Friend requests: ${unreadCount} pending`}
      >
        <UserPlus size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-bold text-white bg-danger rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-dark-elevated border border-border rounded-md-drd shadow-lg-drd z-50 overflow-hidden friend-request-dropdown">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">Friend Requests</h3>
            {unreadCount > 0 && (
              <span className="text-caption text-primary-light font-medium">{unreadCount} pending</span>
            )}
          </div>

          {/* Request List */}
          <div className="max-h-72 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 size={18} className="animate-spin text-text-muted" /></div>
            ) : friendRequests.length > 0 ? (
              friendRequests.map((req) => (
                <RequestItem
                  key={req.id}
                  request={req}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-2xl mb-2">✉️</p>
                <p className="text-caption text-text-muted">No pending requests</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {friendRequests.length > 0 && (
            <div className="px-4 py-2 border-t border-border-subtle">
              <div className="w-full text-center text-caption text-text-muted py-1">
                Requests update automatically
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        .friend-request-dropdown {
          animation: dropdownFadeIn 200ms ease-out;
        }
        @keyframes dropdownFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default FriendRequestNotification;
