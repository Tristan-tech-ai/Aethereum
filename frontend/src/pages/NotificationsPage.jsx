import React, { useEffect, useState } from 'react';
import { Bell, Check, Trash2, Zap, Trophy, Flame, Target, MessageSquare, UserPlus, Loader2 } from 'lucide-react';
import api from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';

const iconMap = {
    xp_awarded: Zap,
    achievement_unlocked: Trophy,
    streak_alert: Flame,
    challenge_goal_reached: Target,
    friend_request: UserPlus,
    comment: MessageSquare,
    default: Bell
};

const colorMap = {
    xp_awarded: 'text-accent bg-accent/10',
    achievement_unlocked: 'text-warning bg-warning/10',
    streak_alert: 'text-danger bg-danger/10',
    challenge_goal_reached: 'text-success bg-success/10',
    friend_request: 'text-primary bg-primary/10',
    comment: 'text-info bg-info/10',
    default: 'text-text-muted bg-dark-secondary'
};

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [markingAll, setMarkingAll] = useState(false);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await api.get('/v1/notifications');
            setNotifications(res.data.data.notifications.data || []);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.patch(`/v1/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const markAllAsRead = async () => {
        setMarkingAll(true);
        try {
            await api.post('/v1/notifications/mark-all-as-read');
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        } finally {
            setMarkingAll(false);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/v1/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = (now - date) / 1000;

        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    const unreadCount = notifications.filter(n => !n.read_at).length;

    return (
        <div className="px-4 lg:px-8 py-6 max-w-page mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="text-h2 font-heading font-bold text-text-primary">Notifications</h1>
                    <p className="text-body-sm text-text-secondary mt-1">Stay updated with your learning progress and social interactions</p>
                </div>
                {unreadCount > 0 && (
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={markAllAsRead}
                        disabled={markingAll}
                    >
                        {markingAll ? <Loader2 size={14} className="animate-spin mr-2" /> : <Check size={14} className="mr-2" />}
                        Mark all as read
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-primary mb-4" size={32} />
                    <p className="text-text-muted text-sm">Loading your notifications...</p>
                </div>
            ) : notifications.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-dark-secondary flex items-center justify-center mb-4">
                        <Bell size={24} className="text-text-muted opacity-50" />
                    </div>
                    <h3 className="text-h4 font-heading text-text-primary">All caught up!</h3>
                    <p className="text-body-sm text-text-muted mt-1">You don't have any new notifications at the moment.</p>
                </Card>
            ) : (
                <div className="space-y-3">
                    {notifications.map((n) => {
                        const Icon = iconMap[n.type] || iconMap.default;
                        const colorClass = colorMap[n.type] || colorMap.default;
                        const isUnread = !n.read_at;

                        return (
                            <div 
                                key={n.id}
                                className={`group relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-fast ${
                                    isUnread 
                                        ? 'bg-primary/5 border-primary/20 hover:border-primary/40' 
                                        : 'bg-dark-card border-border/40 hover:border-border/60'
                                }`}
                            >
                                <div className={`mt-1 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                                    <Icon size={20} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className={`text-sm font-semibold truncate ${isUnread ? 'text-text-primary' : 'text-text-secondary'}`}>
                                            {n.data.title || n.type.replace(/_/g, ' ')}
                                        </h4>
                                        <span className="text-[10px] text-text-muted whitespace-nowrap">{formatTime(n.created_at)}</span>
                                    </div>
                                    <p className="text-body-sm text-text-muted mt-0.5 line-clamp-2">
                                        {n.data.message || n.data.description || ''}
                                    </p>
                                    
                                    <div className="flex items-center gap-3 mt-3">
                                        {isUnread && (
                                            <button 
                                                onClick={() => markAsRead(n.id)}
                                                className="text-[11px] font-bold text-primary-light hover:text-primary transition-colors flex items-center gap-1"
                                            >
                                                <Check size={12} /> Mark as read
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => deleteNotification(n.id)}
                                            className="text-[11px] font-medium text-text-muted hover:text-danger transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={12} /> Delete
                                        </button>
                                    </div>
                                </div>

                                {isUnread && (
                                    <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full ring-4 ring-primary/10" />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
