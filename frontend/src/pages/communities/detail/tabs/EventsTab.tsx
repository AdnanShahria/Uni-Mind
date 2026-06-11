import { motion } from 'framer-motion';
import { Plus, Calendar, Clock, MapPin, Users, CheckCircle2 } from 'lucide-react';

export const EventsTab = () => {
  return (
    <motion.div
      key="events-panel"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-[14px] md:text-base font-bold text-white font-poppins flex items-center gap-2">
            <Calendar className="w-4 h-4 md:w-5 md:h-5 text-amber-400" /> Upcoming Events
          </h3>
          <p className="text-[10px] md:text-[11px] text-slate-400 font-poppins mt-0.5">Stay updated with community activities</p>
        </div>
        <button className="flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-500/20 hover:bg-amber-500 border border-amber-500/30 hover:border-transparent text-amber-300 hover:text-white rounded-xl text-xs font-semibold font-poppins transition-all">
          <Plus className="w-4 h-4" /> Create Event
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Mock Event 1 */}
        <div className="rounded-2xl glass-card p-4 md:p-5 border border-white/[0.06] bg-[#090d16] flex flex-col md:flex-row gap-4 md:gap-5 items-start md:items-center hover:border-amber-500/30 transition-colors cursor-pointer group">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center shrink-0">
            <span className="text-[10px] md:text-xs text-amber-500 font-bold uppercase">Oct</span>
            <span className="text-lg md:text-xl text-white font-black">24</span>
          </div>
          <div className="flex-1 w-full">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h4 className="text-[13px] md:text-sm font-bold text-white font-poppins group-hover:text-amber-400 transition-colors">Guest Lecture: Advanced AI Architectures</h4>
              <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider font-bold">Workshop</span>
            </div>
            <p className="text-[11px] text-slate-400 font-poppins mb-2 line-clamp-2">Join us for a special session with Dr. Smith discussing the latest in neural network design.</p>
            <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-poppins">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400" /> 6:00 PM EST</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> Live Room (Main)</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3 text-slate-400" /> 45 attending</span>
            </div>
          </div>
          <button className="w-full md:w-auto px-4 py-2 mt-2 md:mt-0 bg-white/5 hover:bg-amber-500 text-slate-300 hover:text-white rounded-xl text-xs font-semibold font-poppins transition-colors flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> RSVP
          </button>
        </div>

        {/* Mock Event 2 */}
        <div className="rounded-2xl glass-card p-4 md:p-5 border border-white/[0.06] bg-[#090d16] flex flex-col md:flex-row gap-4 md:gap-5 items-start md:items-center hover:border-blue-500/30 transition-colors cursor-pointer group">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-blue-500/10 border border-blue-500/20 flex flex-col items-center justify-center shrink-0">
            <span className="text-[10px] md:text-xs text-blue-500 font-bold uppercase">Nov</span>
            <span className="text-lg md:text-xl text-white font-black">02</span>
          </div>
          <div className="flex-1 w-full">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h4 className="text-[13px] md:text-sm font-bold text-white font-poppins group-hover:text-blue-400 transition-colors">Weekend Hackathon Kickoff</h4>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider font-bold">Hackathon</span>
            </div>
            <p className="text-[11px] text-slate-400 font-poppins mb-2 line-clamp-2">Form teams and build an MVP over the weekend. Prizes for the top 3 projects.</p>
            <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-poppins">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400" /> 10:00 AM EST</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> Discord</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3 text-slate-400" /> 120 attending</span>
            </div>
          </div>
          <button className="w-full md:w-auto px-4 py-2 mt-2 md:mt-0 bg-blue-500/20 hover:bg-blue-500 border border-blue-500/30 text-blue-300 hover:text-white rounded-xl text-xs font-semibold font-poppins transition-colors flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Going
          </button>
        </div>
      </div>
    </motion.div>
  );
};
