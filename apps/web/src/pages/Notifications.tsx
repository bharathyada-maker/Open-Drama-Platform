import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Bell, Sparkles, UserPlus, Heart, MessageSquare, AlertCircle } from 'lucide-react';

export const Notifications: React.FC = () => {
  const { user } = useAuth();

  // Seeded realistic notifications
  const [notifications] = useState([
    {
      id: 'notif-1',
      type: 'ai_processed',
      title: 'Gemini AI Enrichment Completed',
      message: 'Subtitles and semantic search embeddings generated for S1 Ep 3: The Encounter.',
      time: '3 hours ago',
      unread: true,
      icon: Sparkles,
      color: 'text-accent-rose bg-accent-rose/10'
    },
    {
      id: 'notif-2',
      type: 'follower',
      title: 'New Follower',
      message: 'Maya Patel (@maya_romance) followed your studio channel.',
      time: '1 day ago',
      unread: false,
      icon: UserPlus,
      color: 'text-accent-purple bg-accent-purple/10'
    },
    {
      id: 'notif-3',
      type: 'comment',
      title: 'Comment Reply Received',
      message: 'Vikram Sen commented on S1 Ep 1: "Outstanding dialog transitions, the suspense peaks perfect!"',
      time: '2 days ago',
      unread: false,
      icon: MessageSquare,
      color: 'text-blue-400 bg-blue-500/10'
    },
    {
      id: 'notif-4',
      type: 'mod_result',
      title: 'Moderation Report Reviewed',
      message: 'Your report on video S1 E1 of Niseedhi has been reviewed and resolved by admins.',
      time: '4 days ago',
      unread: false,
      icon: AlertCircle,
      color: 'text-yellow-400 bg-yellow-500/10'
    }
  ]);

  if (!user) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6 text-slate-100">
        <div className="w-full max-w-sm bg-bg-surface border border-border-dark rounded-2xl p-6 text-center">
          <Bell className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">Access Notifications</h2>
          <p className="text-xs text-text-secondary leading-relaxed mb-4">
            Sign In to review follower activity, video processing alerts, comments replies, and moderation logs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark text-slate-100 pb-24 p-6 animate-fade-in max-w-2xl mx-auto">
      <h1 className="text-2xl font-extrabold text-white flex items-center gap-2 mb-6">
        <Bell className="w-6 h-6 text-accent-rose" />
        <span>Notifications Log</span>
      </h1>

      <div className="space-y-3">
        {notifications.map((notif) => {
          const Icon = notif.icon;
          return (
            <div
              key={notif.id}
              className={`p-4.5 rounded-2xl border transition-all flex gap-4 bg-bg-surface ${
                notif.unread
                  ? 'border-accent-rose/30 shadow shadow-accent-rose/5'
                  : 'border-border-dark/60'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${notif.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-white leading-none">{notif.title}</h4>
                  <span className="text-[9px] text-text-muted font-mono">{notif.time}</span>
                </div>
                <p className="text-[11px] text-text-secondary mt-1.5 leading-relaxed font-light">{notif.message}</p>
              </div>
              
              {/* Unread circle highlight */}
              {notif.unread && (
                <div className="w-2.5 h-2.5 rounded-full bg-accent-rose self-center flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default Notifications;
