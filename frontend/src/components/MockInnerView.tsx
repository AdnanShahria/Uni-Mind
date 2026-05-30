import { motion } from 'framer-motion';
import { Home, Users, MessageSquare, BookOpen, BrainCircuit, Search, Bell, Sparkles, TrendingUp, Clock, FileText } from 'lucide-react';

export const MockInnerView = () => {
  return (
    <div className="w-full h-[600px] bg-[#0A0D1A] flex overflow-hidden rounded-b-xl border-t border-white/5 font-poppins relative">
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Sidebar */}
      <div className="w-64 border-r border-white/5 bg-slate-900/40 backdrop-blur-md flex flex-col z-10 hidden md:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold tracking-wide">UniMind</span>
        </div>
        
        <div className="px-4 space-y-1 mt-4 flex-1">
          {[
            { icon: Home, label: 'Dashboard', active: true },
            { icon: Users, label: 'Communities' },
            { icon: BookOpen, label: 'Research Lab' },
            { icon: MessageSquare, label: 'Messages' },
            { icon: Sparkles, label: 'AI Tutor' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${
                item.active 
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        
        {/* Header */}
        <div className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-slate-900/20 backdrop-blur-sm">
          <div className="w-96 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center px-4 gap-3">
            <Search className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-500 font-medium">Search papers, notes, or communities...</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative">
              <Bell className="w-5 h-5 text-slate-400" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-ping" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 border-2 border-[#0A0D1A]" />
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Welcome back, Alex 👋</h1>
              <p className="text-slate-400 text-sm">Here's what's happening in your academic network.</p>
            </div>
            <button className="px-4 py-2 bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              <Sparkles className="w-4 h-4" />
              Generate Study Plan
            </button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Stat Cards */}
            {[
              { label: 'Study Hours', value: '24.5h', trend: '+12%', icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
              { label: 'Papers Read', value: '12', trend: '+3', icon: FileText, color: 'text-purple-400', bg: 'bg-purple-400/10' },
              { label: 'Knowledge Score', value: '984', trend: '+45', icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] relative overflow-hidden group hover:border-white/10 transition-colors"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} rounded-full blur-[50px] -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity`} />
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                    <div className="flex items-end gap-2">
                      <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                      <span className={`text-xs font-semibold ${stat.color} mb-1.5`}>{stat.trend}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Active Workspaces / Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-purple-400" />
                Active Knowledge Graphs
              </h3>
              <div className="space-y-4">
                {[
                  { title: 'Quantum Computing Fundamentals', nodes: 142, progress: 78 },
                  { title: 'Neuroscience Literature Review', nodes: 89, progress: 45 },
                  { title: 'Advanced Machine Learning', nodes: 256, progress: 92 },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-900/50 border border-white/5 hover:bg-slate-900/80 transition-colors cursor-pointer">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-sm text-slate-200">{item.title}</span>
                      <span className="text-xs text-slate-500">{item.nodes} nodes</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        transition={{ delay: 0.8 + i * 0.2, duration: 1 }}
                        className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-6 relative overflow-hidden"
            >
               {/* Decorative floating blur inside the card */}
               <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-[60px] pointer-events-none" />
               
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                Live Research Discussions
              </h3>
              <div className="space-y-4 relative z-10">
                {[
                  { name: 'Dr. Sarah Jenkins', action: 'shared a new paper in', target: 'AI Ethics Group', time: '2m ago' },
                  { name: 'Michael Chen', action: 'replied to your thread in', target: 'Quantum ML', time: '15m ago' },
                  { name: 'Elena Rodriguez', action: 'highlighted a section in', target: 'Neuroplasticity Notes', time: '1h ago' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 shrink-0" />
                    <div>
                      <p className="text-sm text-slate-300">
                        <span className="font-semibold text-white">{item.name}</span> {item.action} <span className="text-primary hover:underline cursor-pointer">{item.target}</span>
                      </p>
                      <span className="text-[10px] text-slate-500">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
