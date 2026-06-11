import { motion } from 'framer-motion';
import { Bookmark, ChevronRight, FileText, FileAudio, ExternalLink, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export const PinnedResources = ({ resources, isLoading }: { resources: any[], isLoading: boolean }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={fadeIn}
      className="rounded-2xl glass-card overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold text-white font-poppins flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-emerald-400" />
          Pinned Resources
        </h3>
        <button
          onClick={() => navigate('/app/notes')}
          className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold font-poppins flex items-center gap-1 transition-colors"
        >
          View Library <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-5">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-36 rounded-xl bg-white/[0.02] border border-white/[0.04] animate-pulse" />
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div
            onClick={() => navigate('/app/notes')}
            className="py-14 text-center border border-dashed border-white/[0.1] rounded-xl cursor-pointer hover:border-emerald-500/30 hover:bg-white/[0.02] transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-500/20 transition-colors">
              <Upload className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-sm text-slate-400 font-poppins">No resources yet</p>
            <p className="text-xs text-slate-600 font-poppins mt-1">Upload notes to see them here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {resources.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                onClick={() => navigate(item.path || '/app/notes')}
                className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] hover:border-emerald-500/30 rounded-xl p-4 cursor-pointer transition-all group relative overflow-hidden flex flex-col"
              >
                {/* Hover glow */}
                <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="flex items-start justify-between mb-3 relative z-10">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    {item.type === 'audio' ? <FileAudio className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} /> : <FileText className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />}
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                </div>

                <div className="relative z-10 flex-1 flex flex-col">
                  <h4 className="text-[13px] font-semibold text-white font-poppins mb-1 line-clamp-1 group-hover:text-emerald-300 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-poppins line-clamp-2 flex-1">
                    {item.snippet}
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.05]">
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-white/[0.05] rounded-md text-slate-400 capitalize">
                      {item.type || 'document'}
                    </span>
                    <span className="text-[10px] text-slate-600 font-poppins">
                      {item.time}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
