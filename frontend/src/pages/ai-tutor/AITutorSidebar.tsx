import { MessageSquare, Plus, Trash2 } from 'lucide-react';

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface SidebarProps {
  conversations: Conversation[];
  activeConvId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
}

export const AITutorSidebar = ({
  conversations,
  activeConvId,
  onSelect,
  onNewChat,
  onDelete,
  isOpen
}: SidebarProps) => {
  return (
    <div 
      className={`shrink-0 flex flex-col border-r border-white/[0.06] bg-[#0A0A0A] transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-0 overflow-hidden border-none'
      }`}
    >
      <div className="p-4 flex items-center justify-between border-b border-white/[0.06]">
        <button
          onClick={onNewChat}
          className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary-glow font-medium font-outfit text-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          New Conversation
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`group flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
              activeConvId === conv.id
                ? 'bg-white/[0.08] text-white'
                : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <MessageSquare className="w-4 h-4 shrink-0 opacity-70" />
              <span className="text-sm font-poppins truncate">
                {conv.title || 'New Conversation'}
              </span>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(conv.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
