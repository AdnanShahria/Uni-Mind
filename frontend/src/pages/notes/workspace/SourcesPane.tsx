import { motion } from 'framer-motion';
import { Plus, Search, FileText, Check, File, Globe, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { NoteType } from '../types';

interface SourcesPaneProps {
  note: NoteType;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const SourcesPane = ({ note, isCollapsed, onToggleCollapse }: SourcesPaneProps) => {
  return (
    <motion.div
      className="bg-[#111418] border-r border-white/[0.06] flex flex-col shrink-0 overflow-hidden relative hidden md:flex"
      animate={{ width: isCollapsed ? 52 : 260 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
    >
      {/* Collapse / Expand Toggle */}
      <div className={`flex items-center p-3 border-b border-white/[0.06] ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sources</h3>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Collapsed State — Icon strip */}
      {isCollapsed ? (
        <div className="flex-1 flex flex-col items-center py-3 gap-2">
          <button
            className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Add source"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="w-6 h-px bg-white/[0.06] my-1" />
          {note.fileUrl ? (
            <div
              className="p-2 rounded-lg bg-rose-500/10 text-rose-400 cursor-pointer"
              title={note.title || (note.fileUrl?.split('/').pop()) || 'Document'}
            >
              <FileText className="w-4 h-4" />
            </div>
          ) : (
            <div
              className="p-2 rounded-lg bg-blue-500/10 text-blue-400 cursor-pointer"
              title={`${note.title} (Text)`}
            >
              <File className="w-4 h-4" />
            </div>
          )}

          {/* Bottom globe icon */}
          <div className="mt-auto">
            <button
              className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors"
              title="Fast Research"
            >
              <Globe className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Expanded State — Full sources list */
        <>
          <div className="flex-1 overflow-y-auto">
            <div className="p-3">
              {/* Add Source Button */}
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-dashed border-white/10 text-xs text-slate-400 hover:text-white transition-colors mb-3">
                <Plus className="w-3.5 h-3.5" />
                Add Source
              </button>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  type="text"
                  placeholder="Search sources..."
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg pl-8 pr-3 py-1.5 text-[11px] text-white placeholder-slate-600 outline-none focus:border-white/20 transition-colors"
                />
              </div>

              {/* Documents Section */}
              <div className="space-y-1">
                <div className="flex items-center px-1 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Documents</span>
                </div>

                {note.fileUrl ? (
                  <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] cursor-pointer group">
                    <div className="w-6 h-6 rounded bg-rose-500/15 flex items-center justify-center shrink-0">
                      <FileText className="w-3 h-3 text-rose-400" />
                    </div>
                    <span className="text-[11px] font-medium truncate flex-1 text-slate-300">
                      {note.title || (note.fileUrl?.split('/').pop()) || 'Document.pdf'}
                    </span>
                    <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.04] cursor-pointer transition-colors group">
                    <div className="w-6 h-6 rounded bg-blue-500/15 flex items-center justify-center shrink-0">
                      <File className="w-3 h-3 text-blue-400" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 group-hover:text-white truncate flex-1">
                      {note.title} (Text)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Action */}
          <div className="p-3 border-t border-white/[0.06]">
            <button className="w-full py-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-2 text-slate-400 hover:text-white">
              <Globe className="w-3.5 h-3.5" />
              Fast Research
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
};
