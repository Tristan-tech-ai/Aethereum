import React from 'react';
import { Check, X, Clock, Swords } from 'lucide-react';
import Card from '../ui/Card';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

const PendingDuels = ({
  duels = [],
  onAccept,
  onDecline,
  className = '',
}) => {
  if (duels.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-3xl mb-3">🥊</p>
        <p className="text-text-secondary text-sm">No pending challenges</p>
        <p className="text-text-muted text-caption mt-1">Challenge a friend to a Focus Duel!</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {duels.map((duel) => (
        <Card key={duel.id} className="group hover:border-primary/20 transition-colors">
          <div className="flex items-center gap-4">
            {/* Challenger Avatar */}
            <div className="relative shrink-0">
              <Avatar name={duel.challenger} size="md" online={duel.online} />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-danger rounded-full flex items-center justify-center">
                <Swords size={10} className="text-white" />
              </div>
            </div>

            {/* Challenger Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-primary font-semibold">
                {duel.challenger} <span className="text-text-muted font-normal">challenged you!</span>
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-caption text-text-muted">
                  <Clock size={12} /> {duel.duration} min
                </span>
                {duel.level && (
                  <span className="text-caption text-text-muted">Lv.{duel.level}</span>
                )}
                <span className="text-caption text-text-muted">{duel.time}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDecline?.(duel.id)}
                className="!text-text-muted hover:!text-danger"
              >
                <X size={14} className="mr-1" /> Decline
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={() => onAccept?.(duel.id)}
              >
                <Check size={14} className="mr-1" /> Accept
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PendingDuels;
