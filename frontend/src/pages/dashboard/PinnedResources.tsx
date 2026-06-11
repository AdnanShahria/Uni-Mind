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

      <div className="p-4">
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[88px] rounded-xl bg-white/[0.02] border border-white/[0.04] animate-pulse" />
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div
            onClick={() => navigate('/app/notes')}
            className="py-10 text-center border border-dashed border-white/[0.1] rounded-xl cursor-pointer hover:border-emerald-500/30 hover:bg-white/[0.02] transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-500/20 transition-colors">
              <Upload className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-sm text-slate-400 font-poppins">No resources yet</p>
            <p className="text-xs text-slate-600 font-poppins mt-1">Upload notes to see them here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {resources.slice(0, 6).map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.05 }}
                onClick={() => navigate(item.path || '/app/notes')}
                className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] hover:border-emerald-500/30 rounded-xl p-3 cursor-pointer transition-all group relative overflow-hidden flex items-center gap-3 h-[88px]"
              >
                {/* Hover glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 relative z-10">
                  {item.type === 'audio' ? <FileAudio className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0 relative z-10 flex flex-col justify-center h-full">
                  <div className="flex justify-between items-start mb-0.5">
                    <h4 className="text-[13px] font-semibold text-white font-poppins truncate pr-2 group-hover:text-emerald-300 transition-colors">
                      {item.title}
                    </h4>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 transition-colors shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-500 font-poppins truncate mb-2">
                    {item.snippet || 'No description available'}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[9px] font-medium px-1.5 py-0.5 bg-white/[0.05] rounded text-slate-400 capitalize">
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
