import React, { useState, useRef, useEffect } from 'react';
import { Bell, UserPlus, Check, X } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

// Demo friend requests
const demoRequests = [
  { id: 1, name: 'Rizki Aditya', username: 'rizki_a', level: 22, mutualFriends: 3, time: '5m ago' },
  { id: 2, name: 'Nadia Putri', username: 'nadia_p', level: 15, mutualFriends: 1, time: '2h ago' },
  { id: 3, name: 'Ahmad Fauzan', username: 'ahmad_f', level: 31, mutualFriends: 5, time: '1d ago' },
];

/**
 * Individual friend request item
 */
const RequestItem = ({ request, onAccept, onDecline }) => (
  <div className="flex items-start gap-3 p-3 hover:bg-white/[0.02] transition-colors rounded-sm-drd">
    <Avatar name={request.name} size="sm" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-text-primary truncate">{request.name}</p>
      <p className="text-[11px] text-text-muted">
        @{request.username} · Lv.{request.level}
        {request.mutualFriends > 0 && ` · ${request.mutualFriends} mutual`}
      </p>
      <p className="text-[10px] text-text-muted mt-0.5">{request.time}</p>
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
  requests = demoRequests,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localRequests, setLocalRequests] = useState(requests);
  const dropdownRef = useRef(null);

  const unreadCount = localRequests.length;

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

  const handleAccept = (id) => {
    setLocalRequests((prev) => prev.filter((r) => r.id !== id));
    // In real app: API call to accept friend request
  };

  const handleDecline = (id) => {
    setLocalRequests((prev) => prev.filter((r) => r.id !== id));
    // In real app: API call to decline friend request
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
            {localRequests.length > 0 ? (
              localRequests.map((req) => (
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
          {localRequests.length > 0 && (
            <div className="px-4 py-2 border-t border-border-subtle">
              <button className="w-full text-caption text-primary-light hover:text-primary font-medium py-1 transition-colors">
                View All Requests
              </button>
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
