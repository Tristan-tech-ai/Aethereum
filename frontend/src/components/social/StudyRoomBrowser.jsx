import React from 'react';
import { BookOpen, Users, Music, Plus, Wifi } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';

// Demo rooms
const demoRooms = [
  { id: 1, name: 'Late Night Study', host: 'Community', members: 12, max: 20, subject: 'General', music: 'Lo-fi', active: true, participants: ['Andi', 'Budi', 'Siti', 'Maya'] },
  { id: 2, name: 'CS Focus Room', host: 'Andi', members: 5, max: 10, subject: 'Computer Science', music: 'Classical', active: true, participants: ['Andi', 'Budi', 'Siti'] },
  { id: 3, name: 'Exam Prep Zone', host: 'Siti', members: 8, max: 15, subject: 'Mathematics', music: 'Nature', active: true, participants: ['Siti', 'Arief', 'Maya', 'Dian'] },
  { id: 4, name: 'Chill & Learn', host: 'Maya', members: 3, max: 8, subject: 'Biology', music: 'Lo-fi', active: true, participants: ['Maya', 'Eka'] },
  { id: 5, name: 'Morning Grind', host: 'Arief', members: 0, max: 10, subject: 'Physics', music: 'Silence', active: false, participants: [] },
];

const musicIcons = {
  'Lo-fi': '🎵',
  'Classical': '🎻',
  'Nature': '🌿',
  'Silence': '🔇',
};

const subjectColors = {
  'General': 'bg-primary/15 text-primary-light',
  'Computer Science': 'bg-info/15 text-info',
  'Mathematics': 'bg-warning/15 text-warning',
  'Biology': 'bg-success/15 text-success',
  'Physics': 'bg-secondary/15 text-secondary',
};

/**
 * StudyRoomBrowser — list of public study rooms with capacity, subject, music type
 */
const StudyRoomBrowser = ({
  rooms = demoRooms,
  onJoin,
  onCreate,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-h3 font-heading text-text-primary">📖 Study Rooms</h2>
          <p className="text-caption text-text-muted mt-0.5">
            {rooms.filter(r => r.active).length} active rooms
          </p>
        </div>
        <Button onClick={onCreate}>
          <Plus size={16} className="mr-1.5" /> Create Room
        </Button>
      </div>

      {/* Room List */}
      <div className="space-y-3">
        {rooms.map((room) => (
          <Card
            key={room.id}
            hover
            className={`transition-all ${!room.active ? 'opacity-50' : ''}`}
          >
            <div className="flex items-center gap-4">
              {/* Room Icon */}
              <div className="w-12 h-12 rounded-md-drd bg-dark-secondary flex items-center justify-center shrink-0 relative">
                <BookOpen size={22} className="text-secondary" />
                {room.active && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-dark-card" />
                )}
              </div>

              {/* Room Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-text-primary truncate">{room.name}</h4>
                  {room.active && <Badge variant="success">LIVE</Badge>}
                </div>
                <div className="flex items-center gap-3 text-caption text-text-muted flex-wrap">
                  {/* Capacity */}
                  <span className="flex items-center gap-1">
                    <Users size={11} /> {room.members}/{room.max}
                  </span>
                  {/* Subject */}
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${subjectColors[room.subject] || 'bg-dark-secondary text-text-muted'}`}>
                    {room.subject}
                  </span>
                  {/* Music */}
                  <span className="flex items-center gap-1">
                    {musicIcons[room.music] || '🎵'} {room.music}
                  </span>
                  {/* Host */}
                  <span>by @{room.host}</span>
                </div>

                {/* Participant Avatars */}
                {room.participants.length > 0 && (
                  <div className="flex items-center mt-2 -space-x-1.5">
                    {room.participants.slice(0, 5).map((p, i) => (
                      <Avatar key={i} name={p} size="xs" className="ring-2 ring-dark-card" />
                    ))}
                    {room.participants.length > 5 && (
                      <span className="text-[10px] text-text-muted ml-2">
                        +{room.participants.length - 5} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Capacity bar + Join */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                {/* Capacity indicator */}
                <div className="w-16">
                  <div className="w-full h-1.5 bg-dark-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        room.members / room.max > 0.8 ? 'bg-danger' :
                        room.members / room.max > 0.5 ? 'bg-warning' : 'bg-success'
                      }`}
                      style={{ width: `${(room.members / room.max) * 100}%` }}
                    />
                  </div>
                </div>
                <Button
                  variant={room.active && room.members < room.max ? 'secondary' : 'ghost'}
                  size="sm"
                  disabled={!room.active || room.members >= room.max}
                  onClick={() => onJoin?.(room)}
                >
                  {!room.active ? 'Closed' : room.members >= room.max ? 'Full' : 'Join'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudyRoomBrowser;
