import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Calendar, Clock, MapPin, Users, Trash2, Pencil } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { CreateEventModal } from './CreateEventModal';

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  event_type: string;
  color: string;
  community_id: string;
  user_id: string;
  attendees_count: number;
  created_at: string;
  image_url?: string | null;
}

const TYPE_STYLES: Record<string, { bg: string; text: string; border: string; hoverBorder: string }> = {
  workshop: { bg: 'bg-purple-500/10', text: 'text-purple-300', border: 'border-purple-500/20', hoverBorder: 'hover:border-purple-500/30' },
  hackathon: { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/20', hoverBorder: 'hover:border-emerald-500/30' },
  lecture: { bg: 'bg-blue-500/10', text: 'text-blue-300', border: 'border-blue-500/20', hoverBorder: 'hover:border-blue-500/30' },
  meetup: { bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/20', hoverBorder: 'hover:border-amber-500/30' },
  study_session: { bg: 'bg-cyan-500/10', text: 'text-cyan-300', border: 'border-cyan-500/20', hoverBorder: 'hover:border-cyan-500/30' },
  general: { bg: 'bg-slate-500/10', text: 'text-slate-300', border: 'border-slate-500/20', hoverBorder: 'hover:border-slate-500/30' },
};

const DATE_COLOR: Record<string, { bg: string; border: string; text: string }> = {
  workshop: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-500' },
  hackathon: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-500' },
  lecture: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-500' },
  meetup: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-500' },
  study_session: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-500' },
  general: { bg: 'bg-slate-500/10', border: 'border-slate-500/20', text: 'text-slate-500' },
};

export const EventsTab = ({ communityId, userRole }: { communityId: string; userRole?: string | null }) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventItem | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const token = localStorage.getItem('unimind_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/dynamic/events?eq_community_id=${communityId}&order=start_time&dir=asc`, { headers });
      const json = await res.json();
      if (json.success) {
        setEvents(json.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setIsLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const token = localStorage.getItem('unimind_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/dynamic/events?eq_id=${eventId}`, {
        method: 'DELETE',
        headers,
      });
      const json = await res.json();
      if (json.success) {
        setEvents(prev => prev.filter(e => e.id !== eventId));
        toast.success('Event deleted');
      } else {
        toast.error('Failed to delete event');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete event');
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return { month: d.toLocaleString('default', { month: 'short' }), day: d.getDate() };
  };

  const canManageEvents = userRole === 'owner' || userRole === 'admin' || userRole === 'moderator' || userRole === 'elder';

  return (
    <motion.div
      key="events-panel"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="flex flex-row items-center justify-between gap-3">
        <div>
          <h3 className="text-[13px] md:text-base font-bold text-white font-poppins flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 md:w-5 md:h-5 text-amber-400" /> Upcoming Events
          </h3>
          <p className="text-[9px] md:text-[11px] text-slate-400 font-poppins mt-0.5">Stay updated with activities</p>
        </div>
        {canManageEvents && (
          <button
            onClick={() => { setEventToEdit(null); setShowCreateModal(true); }}
            className="shrink-0 flex items-center justify-center gap-1 md:gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-amber-500/20 hover:bg-amber-500 border border-amber-500/30 hover:border-transparent text-amber-300 hover:text-white rounded-lg md:rounded-xl text-[10px] md:text-xs font-semibold font-poppins transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Create Event</span>
            <span className="sm:hidden">Create</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="relative w-10 h-10">
            <div className="w-10 h-10 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
            <Calendar className="w-7 h-7 text-amber-500/50" />
          </div>
          <p className="text-sm text-slate-400 font-poppins mb-1">No upcoming events</p>
          <p className="text-xs text-slate-500 font-poppins">
            {canManageEvents ? 'Click "Create Event" to schedule one!' : 'Check back later for new events.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {events.map((event) => {
            const style = TYPE_STYLES[event.event_type] || TYPE_STYLES.general;
            const dateColor = DATE_COLOR[event.event_type] || DATE_COLOR.general;
            const { month, day } = formatDate(event.start_time);

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl glass-card p-4 md:p-5 border border-white/[0.06] bg-[#090d16] flex flex-row gap-4 md:gap-5 items-center ${style.hoverBorder} transition-colors cursor-pointer group`}
              >
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-xl ${dateColor.bg} border ${dateColor.border} flex flex-col items-center justify-center shrink-0 overflow-hidden relative`}>
                  {event.image_url ? (
                    <img src={event.image_url} alt={event.title} className="w-full h-full object-cover absolute inset-0" />
                  ) : (
                    <>
                      <span className={`text-[10px] md:text-xs ${dateColor.text} font-bold uppercase`}>{month}</span>
                      <span className="text-lg md:text-xl text-white font-black">{day}</span>
                    </>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className={`text-[13px] md:text-sm font-bold text-white font-poppins group-hover:${style.text.replace('text-', 'text-')} transition-colors truncate`}>
                      {event.title}
                    </h4>
                    <span className={`text-[9px] ${style.bg} ${style.text} px-1.5 py-0.5 rounded font-mono uppercase tracking-wider font-bold border ${style.border}`}>
                      {(event.event_type || 'general').replace('_', ' ')}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-[11px] text-slate-400 font-poppins mb-2 line-clamp-2">{event.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-poppins">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> {formatTime(event.start_time)} – {formatTime(event.end_time)}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" /> {event.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" /> {event.attendees_count || 0} attending
                    </span>
                  </div>
                </div>

                {canManageEvents && (
                  <div className="shrink-0 flex flex-col gap-2 ml-auto">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEventToEdit(event); setShowCreateModal(true); }}
                      className="w-8 h-8 md:w-auto md:h-auto md:px-3 md:py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 border border-blue-500/20 hover:border-blue-500/30 rounded-xl text-xs font-semibold font-poppins transition-colors flex items-center justify-center md:gap-1.5"
                      title="Edit event"
                    >
                      <Pencil className="w-4 h-4 md:w-3.5 md:h-3.5" /> <span className="hidden md:inline">Edit</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }}
                      className="w-8 h-8 md:w-auto md:h-auto md:px-3 md:py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/30 rounded-xl text-xs font-semibold font-poppins transition-colors flex items-center justify-center md:gap-1.5"
                      title="Delete event"
                    >
                      <Trash2 className="w-4 h-4 md:w-3.5 md:h-3.5" /> <span className="hidden md:inline">Delete</span>
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); setEventToEdit(null); }}
        communityId={communityId}
        onEventCreated={fetchEvents}
        editEventData={eventToEdit}
      />
    </motion.div>
  );
};
