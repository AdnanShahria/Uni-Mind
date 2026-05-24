import { Users } from 'lucide-react';

export const CollaboratorsList = ({ collaborators }: { collaborators: any[] }) => {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold text-white font-poppins flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          Collaborators
        </h3>
      </div>
      <div className="p-3 space-y-1">
        {collaborators.length === 0 ? (
          <div className="p-4 text-center text-slate-500 text-xs font-poppins">No collaborators yet.</div>
        ) : (
          collaborators.map((c, i) => (
            <div key={c.id || i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-colors">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.color || 'from-emerald-500 to-teal-500'} flex items-center justify-center text-white text-[10px] font-bold font-poppins`}>
                {c.avatar}
              </div>
              <div>
                <p className="text-[12px] font-medium text-slate-200 font-poppins">{c.name}</p>
                <p className="text-[10px] text-slate-500 font-poppins">{c.role}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
