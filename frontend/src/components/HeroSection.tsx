import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Search, Layout, Database, Sparkles, ChevronRight, FileText, Users, Brain, Server, HardDrive, Activity } from 'lucide-react';

export const HeroSection = () => {
  const [isSynthesized, setIsSynthesized] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'database'>('files');
  const [isClosed, setIsClosed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  return (
    <section className="relative min-h-screen flex flex-col items-center pt-32 pb-20 overflow-hidden bg-[#030712]">
      {/* Elegant Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-b from-primary/10 to-transparent blur-[120px]" />
        <div className="absolute top-[40%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-secondary/10 to-transparent blur-[120px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
      </div>

      <div className="max-w-[90rem] mx-auto px-6 lg:px-12 xl:px-20 relative z-10 w-full grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-start"
        >
          {/* Subtle elegant badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium tracking-wide text-slate-300">Introducing UniMind 2.0</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-medium font-garamond leading-[1.15] mb-6 text-white tracking-tight">
            The Platform For <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-300 to-slate-400 italic font-semibold">
              DeepWork
            </span>
          </h1>
          
          <p className="text-lg lg:text-xl text-slate-400 mb-10 max-w-xl leading-relaxed font-poppins font-light">
            A meticulously crafted environment where research, writing, and knowledge organization happen seamlessly. Designed for clarity, built for speed.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button className="group relative px-6 py-3.5 bg-white text-black font-medium rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              Start building free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="group px-6 py-3.5 bg-white/5 text-white font-medium rounded-lg border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
              Explore features
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
            </button>
          </div>
        </motion.div>

        {/* Right Content - Stylish UI Mockup */}
        <motion.div
          initial={{ opacity: 0, x: 40, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="relative lg:h-[650px] flex justify-center items-center w-full"
          style={{ perspective: '1000px' }}
        >
          <AnimatePresence mode="wait">
            {!isClosed ? (
              <motion.div
                key="workspace-dashboard"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className={`w-full max-w-[600px] min-h-[520px] lg:h-[540px] rounded-2xl bg-[#0B0F19]/90 border transition-all duration-700 ease-out flex flex-col overflow-hidden backdrop-blur-2xl transform ${
                  isMaximized 
                    ? 'scale-105 rotate-y-0 rotate-x-0 border-purple-500/40 shadow-[0_0_50px_rgba(139,92,246,0.35)] z-30' 
                    : 'rotate-y-[-5deg] rotate-x-[5deg] hover:rotate-y-0 hover:rotate-x-0 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
                }`}
              >
                
                {/* macOS style header */}
                <div className="h-12 border-b border-white/5 flex items-center px-4 bg-[#0B0F19]">
                  <div className="flex gap-2 group/dots">
                    {/* Red Close Button */}
                    <button 
                      onClick={() => setIsClosed(true)}
                      className="w-3 h-3 rounded-full bg-[#FF5F56] hover:bg-[#E0443E] flex items-center justify-center text-black/60 font-bold transition-all duration-200 cursor-pointer select-none active:scale-90"
                      title="Close Session"
                    >
                      <span className="opacity-0 group-hover/dots:opacity-100 transition-opacity duration-150 text-[7px] leading-none mb-[0.5px]">×</span>
                    </button>
                    {/* Yellow Minimize Button */}
                    <button 
                      onClick={() => setIsMinimized(true)}
                      className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:bg-[#DEA123] flex items-center justify-center text-black/60 font-bold transition-all duration-200 cursor-pointer select-none active:scale-90"
                      title="Minimize Session"
                    >
                      <span className="opacity-0 group-hover/dots:opacity-100 transition-opacity duration-150 text-[7px] leading-none mb-[2px]">−</span>
                    </button>
                    {/* Green Maximize Button */}
                    <button 
                      onClick={() => setIsMaximized(!isMaximized)}
                      className="w-3 h-3 rounded-full bg-[#27C93F] hover:bg-[#1AAB2E] flex items-center justify-center text-black/60 font-bold transition-all duration-200 cursor-pointer select-none active:scale-90"
                      title={isMaximized ? "Restore Window" : "Maximize Window"}
                    >
                      <span className="opacity-0 group-hover/dots:opacity-100 transition-opacity duration-150 text-[7px] leading-none mb-[0.5px]">+</span>
                    </button>
                  </div>
                  <div className="mx-auto h-6 w-64 bg-[#151B2B] rounded flex items-center px-3 justify-between border border-white/5">
                     <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <Search className="w-3 h-3" />
                        <span>Search projects...</span>
                     </div>
                     <span className="text-[9px] text-slate-600 border border-slate-700/50 rounded px-1">⌘K</span>
                  </div>
                </div>
                
                {/* Minimalist Dashboard Body */}
                <div className="flex-1 flex bg-[#050810] relative">
                  {/* Thin Sidebar */}
                  <div className="w-16 border-r border-white/5 flex flex-col items-center py-6 gap-6 bg-[#080C16]">
                    {/* Files Tab Button */}
                    <button 
                      onClick={() => {
                        setActiveTab('files');
                        setIsSynthesized(false); // Reset synthesis for clean tab switch
                      }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-300 cursor-pointer ${
                        activeTab === 'files' 
                          ? 'bg-primary/20 text-primary border-primary/20 shadow-[0_0_10px_rgba(59,130,246,0.25)]' 
                          : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/5'
                      }`}
                      title="Files Explorer"
                    >
                      <Layout className="w-4 h-4" />
                    </button>

                    {/* Database Tab Button */}
                    <button 
                      onClick={() => {
                        setActiveTab('database');
                        setIsSynthesized(false); // Reset synthesis for clean tab switch
                      }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-300 cursor-pointer ${
                        activeTab === 'database' 
                          ? 'bg-secondary/20 text-secondary border-secondary/20 shadow-[0_0_10px_rgba(139,92,246,0.25)]' 
                          : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/5'
                      }`}
                      title="Semantic Databases"
                    >
                      <Database className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Content Area */}
                  <div className="flex-1 p-6 lg:p-8 flex flex-col gap-4 relative overflow-hidden">
                    <AnimatePresence mode="wait">
                      {activeTab === 'files' ? (
                        <motion.div
                          key="files-tab"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.2 }}
                          className="flex-1 flex flex-col gap-4"
                        >
                          {/* Simulated clean document/canvas header with clickable Synthesis button */}
                          <div className="flex justify-between items-center">
                            <div className="w-24 h-4 rounded bg-slate-800/50"></div>
                            
                            {/* Synthesis Pulse Button */}
                            <button 
                              onClick={() => setIsSynthesized(!isSynthesized)}
                              className="relative group overflow-hidden px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] cursor-pointer active:scale-95 z-20"
                            >
                              <Sparkles className={`w-3.5 h-3.5 text-violet-200 transition-transform duration-700 ${isSynthesized ? 'rotate-180 text-teal-300 font-bold' : 'animate-pulse'}`} />
                              <span>{isSynthesized ? 'Reset Workspace' : 'Synthesize AI'}</span>
                              <span className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-500 opacity-20 blur-sm group-hover:opacity-40 transition-opacity"></span>
                            </button>
                          </div>
                          
                          <div className="space-y-2 mt-2 relative">
                            {/* Item 1 */}
                            <div className={`w-full h-11 rounded-xl bg-[#0F1423] border border-white/5 flex items-center px-4 gap-4 transition-all duration-500 ${isSynthesized ? 'border-blue-500/30 bg-blue-950/10 shadow-[0_0_15px_rgba(59,130,246,0.05)]' : ''}`}>
                               <div className={`w-7 h-7 rounded bg-blue-500/20 flex items-center justify-center text-blue-400 transition-colors duration-500 ${isSynthesized ? 'bg-blue-500/30 text-blue-300' : ''}`}><FileText className="w-3.5 h-3.5" /></div>
                               <div className="flex-1 flex justify-between items-center">
                                  <span className="text-xs font-medium text-slate-200">Quantum Computing Research</span>
                                  <span className="text-[10px] text-slate-500">Just now</span>
                               </div>
                            </div>

                            {/* Connective Linker (Visible when Synthesized) */}
                            <AnimatePresence>
                              {isSynthesized && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 16, opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="flex justify-center items-center overflow-hidden my-0.5"
                                >
                                  <div className="w-0.5 h-full bg-gradient-to-b from-blue-500/50 via-violet-500 to-purple-500/50 relative">
                                    <motion.div 
                                      animate={{ y: [0, 16], opacity: [0, 1, 0] }}
                                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                      className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white shadow-[0_0_6px_#fff]"
                                    />
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Item 2 */}
                            <div className={`w-full h-11 rounded-xl bg-[#0F1423] border border-white/5 flex items-center px-4 gap-4 transition-all duration-500 ${isSynthesized ? 'border-purple-500/30 bg-purple-950/10 shadow-[0_0_15px_rgba(139,92,246,0.05)]' : ''}`}>
                               <div className={`w-7 h-7 rounded bg-purple-500/20 flex items-center justify-center text-purple-400 transition-colors duration-500 ${isSynthesized ? 'bg-purple-500/30 text-purple-300' : ''}`}><Database className="w-3.5 h-3.5" /></div>
                               <div className="flex-1 flex justify-between items-center">
                                  <span className="text-xs font-medium text-slate-200">Neural Network Datasets</span>
                                  <span className="text-[10px] text-slate-500">2h ago</span>
                                </div>
                            </div>

                            {/* Connecting Sparkle Linker (Visible when Synthesized) */}
                            <AnimatePresence>
                              {isSynthesized && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 16, opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="flex justify-center items-center overflow-hidden my-0.5"
                                >
                                  <div className="w-0.5 h-full bg-gradient-to-b from-purple-500/50 via-violet-500 to-indigo-500/50 relative">
                                    <motion.div 
                                      animate={{ y: [0, 16], opacity: [0, 1, 0] }}
                                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.75 }}
                                      className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white shadow-[0_0_6px_#fff]"
                                    />
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* AI Generated Content (Appears when Synthesized) */}
                            <AnimatePresence mode="wait">
                              {isSynthesized ? (
                                <motion.div
                                  key="synthesis-card"
                                  initial={{ opacity: 0, scale: 0.92, y: 10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.92, y: 10 }}
                                  transition={{ type: "spring", stiffness: 120, damping: 14 }}
                                  className="relative p-3.5 rounded-xl bg-gradient-to-r from-violet-950/40 via-indigo-950/30 to-slate-950/50 border border-violet-500/40 shadow-[0_8px_24px_rgba(139,92,246,0.15)] flex flex-col gap-2 overflow-hidden"
                                >
                                  {/* Background light glow */}
                                  <div className="absolute top-0 right-0 w-20 h-20 bg-violet-500/10 rounded-full blur-xl pointer-events-none" />
                                  
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6.5 h-6.5 rounded bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
                                        <Brain className="w-3.5 h-3.5 animate-pulse" />
                                      </div>
                                      <div>
                                        <h4 className="text-[8px] font-bold tracking-widest text-violet-400 uppercase font-poppins">UniMind AI • Synthesis</h4>
                                        <h3 className="text-[11px] font-semibold text-slate-100 font-poppins">Quantum Neural Networks</h3>
                                      </div>
                                    </div>
                                    <span className="text-[8px] bg-violet-500/20 text-violet-300 border border-violet-500/30 px-1.5 py-0.5 rounded-full font-medium font-poppins">98% Match</span>
                                  </div>
                                  
                                  <p className="text-[10px] text-slate-300 leading-relaxed font-poppins font-light">
                                    Discovered structural similarities between <span className="text-blue-300 font-normal">quantum state vectors</span> and <span className="text-purple-300 font-normal">neural network attention weights</span>.
                                  </p>
                                  
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[8px] text-slate-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-poppins">#Physics</span>
                                    <span className="text-[8px] text-slate-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-poppins">#MachineLearning</span>
                                    <span className="text-[8px] text-violet-300 bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5 font-poppins">
                                      <Sparkles className="w-2.5 h-2.5 text-violet-300" /> New Connection
                                    </span>
                                  </div>
                                </motion.div>
                              ) : (
                                /* Study Group Alpha is shown when NOT synthesized */
                                <motion.div 
                                  key="normal-card"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 0.7 }}
                                  className="w-full h-11 rounded-xl bg-[#0F1423] border border-white/5 flex items-center px-4 gap-4 hover:opacity-100 transition-opacity cursor-pointer animate-fade-in"
                                >
                                   <div className="w-7 h-7 rounded bg-slate-700/50 flex items-center justify-center text-slate-400"><Users className="w-3.5 h-3.5" /></div>
                                   <div className="flex-1 flex justify-between items-center">
                                      <span className="text-xs font-medium text-slate-400">Study Group Alpha</span>
                                      <span className="text-[10px] text-slate-600">Yesterday</span>
                                   </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      ) : (
                        /* DATABASE VIEW */
                        <motion.div
                          key="database-tab"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="flex-1 flex flex-col gap-4"
                        >
                          {/* Database Explorer Header */}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest font-poppins">Live Schema Explorer</span>
                            </div>
                            
                            {/* Database Synthesis button */}
                            <button 
                              onClick={() => setIsSynthesized(!isSynthesized)}
                              className="relative group overflow-hidden px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 via-violet-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer active:scale-95 z-20"
                            >
                              <Sparkles className={`w-3.5 h-3.5 text-cyan-200 transition-transform duration-700 ${isSynthesized ? 'rotate-180 text-teal-300 font-bold' : 'animate-pulse'}`} />
                              <span>{isSynthesized ? 'Reset Registry' : 'Synthesize AI'}</span>
                              <span className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 opacity-20 blur-sm group-hover:opacity-40 transition-opacity"></span>
                            </button>
                          </div>
                          
                          <div className="space-y-2 mt-2 relative">
                            {/* Database 1 */}
                            <div className={`w-full h-11 rounded-xl bg-[#0F1423] border border-white/5 flex items-center px-4 gap-4 transition-all duration-500 ${isSynthesized ? 'border-cyan-500/30 bg-cyan-950/10 shadow-[0_0_15px_rgba(6,182,212,0.05)]' : ''}`}>
                               <div className={`w-7 h-7 rounded bg-cyan-500/20 flex items-center justify-center text-cyan-400 transition-colors duration-500 ${isSynthesized ? 'bg-cyan-500/30 text-cyan-300' : ''}`}><Server className="w-3.5 h-3.5" /></div>
                               <div className="flex-1 flex justify-between items-center">
                                  <span className="text-xs font-medium text-slate-200">Knowledge Graph DB</span>
                                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 1.2M Nodes
                                  </span>
                               </div>
                            </div>

                            {/* Connective Linker */}
                            <AnimatePresence>
                              {isSynthesized && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 16, opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="flex justify-center items-center overflow-hidden my-0.5"
                                >
                                  <div className="w-0.5 h-full bg-gradient-to-b from-cyan-500/50 via-violet-500 to-purple-500/50 relative">
                                    <motion.div 
                                      animate={{ y: [0, 16], opacity: [0, 1, 0] }}
                                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                      className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white shadow-[0_0_6px_#fff]"
                                    />
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Database 2 */}
                            <div className={`w-full h-11 rounded-xl bg-[#0F1423] border border-white/5 flex items-center px-4 gap-4 transition-all duration-500 ${isSynthesized ? 'border-purple-500/30 bg-purple-950/10 shadow-[0_0_15px_rgba(139,92,246,0.05)]' : ''}`}>
                               <div className={`w-7 h-7 rounded bg-purple-500/20 flex items-center justify-center text-purple-400 transition-colors duration-500 ${isSynthesized ? 'bg-purple-500/30 text-purple-300' : ''}`}><HardDrive className="w-3.5 h-3.5" /></div>
                               <div className="flex-1 flex justify-between items-center">
                                  <span className="text-xs font-medium text-slate-200">Vector Space Index</span>
                                  <span className="text-[10px] text-purple-400 flex items-center gap-1 animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> 450K Dim
                                  </span>
                               </div>
                            </div>

                            {/* Connecting Sparkle Linker */}
                            <AnimatePresence>
                              {isSynthesized && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 16, opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="flex justify-center items-center overflow-hidden my-0.5"
                                >
                                  <div className="w-0.5 h-full bg-gradient-to-b from-purple-500/50 via-violet-500 to-cyan-500/50 relative">
                                    <motion.div 
                                      animate={{ y: [0, 16], opacity: [0, 1, 0] }}
                                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.75 }}
                                      className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white shadow-[0_0_6px_#fff]"
                                    />
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Database AI Generated Result */}
                            <AnimatePresence mode="wait">
                              {isSynthesized ? (
                                <motion.div
                                  key="schema-synthesis"
                                  initial={{ opacity: 0, scale: 0.92, y: 10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.92, y: 10 }}
                                  transition={{ type: "spring", stiffness: 120, damping: 14 }}
                                  className="relative p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-violet-950/30 to-purple-950/40 border border-cyan-500/40 shadow-[0_8px_24px_rgba(6,182,212,0.2)] flex flex-col gap-2 overflow-hidden"
                                >
                                  {/* Background light glow */}
                                  <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
                                  
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6.5 h-6.5 rounded bg-gradient-to-tr from-cyan-500 to-violet-500 flex items-center justify-center text-white shadow-md">
                                        <Brain className="w-3.5 h-3.5 animate-pulse" />
                                      </div>
                                      <div>
                                        <h4 className="text-[8px] font-bold tracking-widest text-cyan-400 uppercase font-poppins">UniMind AI • Vector Bridge</h4>
                                        <h3 className="text-[11px] font-semibold text-slate-100 font-poppins">Dimensional Vector Alignment</h3>
                                      </div>
                                    </div>
                                    <span className="text-[8px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded-full font-medium font-poppins">99.1% Align</span>
                                  </div>
                                  
                                  <p className="text-[10px] text-slate-300 leading-relaxed font-poppins font-light">
                                    Aligned structural nodes inside <span className="text-cyan-300 font-normal">academic_knowledge_graph</span> to dense embeddings in <span className="text-purple-300 font-normal">dense_vector_space_128d</span>.
                                  </p>
                                  
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[8px] text-slate-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-poppins">#VectorDB</span>
                                    <span className="text-[8px] text-slate-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-poppins">#SemanticSearch</span>
                                    <span className="text-[8px] text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5 font-poppins">
                                      <Sparkles className="w-2.5 h-2.5 text-cyan-300" /> +4,200 Bridges
                                    </span>
                                  </div>
                                </motion.div>
                              ) : (
                                /* Cognitive Cache is shown when NOT synthesized */
                                <motion.div 
                                  key="normal-db-card"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 0.7 }}
                                  className="w-full h-11 rounded-xl bg-[#0F1423] border border-white/5 flex items-center px-4 gap-4 hover:opacity-100 transition-opacity cursor-pointer animate-fade-in"
                                >
                                   <div className="w-7 h-7 rounded bg-slate-700/50 flex items-center justify-center text-slate-400"><Activity className="w-3.5 h-3.5" /></div>
                                   <div className="flex-1 flex justify-between items-center">
                                      <span className="text-xs font-medium text-slate-400">Cognitive Cache Index</span>
                                      <span className="text-[10px] text-slate-600">98.2K entries</span>
                                   </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Elegant graph or visualization placeholder */}
                    <div className="mt-auto h-24 rounded-xl border border-white/5 bg-gradient-to-b from-[#0F1423] to-transparent relative overflow-hidden transition-all duration-700">
                       <div className={`absolute inset-0 bg-gradient-to-t transition-colors duration-700 ${isSynthesized ? (activeTab === 'database' ? 'from-cyan-500/15' : 'from-violet-500/15') : 'from-primary/10'} to-transparent`}></div>
                       <svg className={`absolute bottom-0 w-full h-full transition-colors duration-700 ${isSynthesized ? (activeTab === 'database' ? 'text-cyan-500/40' : 'text-violet-500/40') : 'text-primary/30'}`} preserveAspectRatio="none" viewBox="0 0 100 100">
                         {isSynthesized ? (
                           <>
                             <path d="M0,100 L0,40 Q25,80 50,30 T100,50 L100,100 Z" fill="currentColor" opacity="0.3"></path>
                             <path d="M0,100 L0,60 Q30,20 60,80 T100,20 L100,100 Z" fill="currentColor" opacity="0.5"></path>
                           </>
                         ) : (
                           <>
                             <path d="M0,100 L0,50 Q25,20 50,60 T100,30 L100,100 Z" fill="currentColor" opacity="0.3"></path>
                             <path d="M0,100 L0,70 Q30,40 60,70 T100,40 L100,100 Z" fill="currentColor" opacity="0.5"></path>
                           </>
                         )}
                       </svg>
                    </div>
                  </div>

                  {/* Frost-glass Minimization Pane */}
                  <AnimatePresence>
                    {isMinimized && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMinimized(false)}
                        className="absolute inset-0 z-50 bg-[#050810]/70 backdrop-blur-md flex flex-col items-center justify-center cursor-pointer group hover:bg-[#050810]/60 transition-colors"
                      >
                        <motion.div
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.95, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 120, damping: 14 }}
                          className="px-6 py-4 rounded-xl bg-white/5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-lg flex items-center gap-3 group-hover:border-amber-500/30 group-hover:bg-white/10 transition-all duration-300"
                        >
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                          <span className="text-xs font-semibold font-poppins text-slate-300 tracking-wide">
                            Workspace Minimized • Click to Expand
                          </span>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              /* System Standby / Offline Card */
              <motion.div
                key="offline-card"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="w-full max-w-[450px] min-h-[300px] rounded-2xl bg-[#0B0F19]/95 border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.15)] overflow-hidden backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center relative"
              >
                {/* Cyberpunk grid background in red */}
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
                {/* Red gradient radial background */}
                <div className="absolute -top-[10%] w-[50%] h-[50%] rounded-full bg-red-500/10 blur-[60px] pointer-events-none" />
                
                <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center mb-6 relative group cursor-pointer" onClick={() => setIsClosed(false)}>
                  <div className="absolute inset-0 rounded-full bg-red-500/20 blur-md animate-pulse" />
                  <Activity className="w-7 h-7 text-red-500 relative animate-pulse" />
                </div>

                <h3 className="text-lg font-bold font-poppins text-red-400 tracking-wider mb-2 uppercase">System Standby / Offline</h3>
                <p className="text-xs text-slate-400 max-w-xs mb-6 font-poppins leading-relaxed">
                  The active workspace session has been terminated. Core processes are in sleep mode.
                </p>

                <button 
                  onClick={() => setIsClosed(false)}
                  className="group relative px-6 py-2.5 bg-gradient-to-r from-red-600 to-violet-600 hover:from-red-500 hover:to-violet-500 text-white text-xs font-semibold rounded-lg shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_25px_rgba(239,68,68,0.45)] transition-all duration-300 active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Restore Workspace
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Subtle backdrop elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/5 via-transparent to-secondary/5 blur-3xl -z-10 rounded-full" />
        </motion.div>

      </div>
    </section>
  );
};

