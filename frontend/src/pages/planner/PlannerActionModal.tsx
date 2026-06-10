import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Target, Layers, Calendar, Mountain, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CustomDatePicker } from './CustomDatePicker';
import { CustomSelect } from '../../components/CustomSelect';

export interface EditItemProps {
  id: string;
  type: 'task' | 'weekly' | 'long-term';
  title: string;
  parentId?: string;
  parentType?: 'weekly' | 'long-term' | '';
  date?: Date;
  estimated_hours?: number;
}

interface PlannerActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  weeklyGoals: any[];
  longTermGoals: any[];
  onSubmit: (type: 'task' | 'weekly' | 'long-term', data: any) => void;
  editItem?: EditItemProps | null;
  defaultDate?: Date;
}

export const PlannerActionModal = ({ isOpen, onClose, weeklyGoals, longTermGoals, onSubmit, editItem, defaultDate }: PlannerActionModalProps) => {
  const [activeTab, setActiveTab] = useState<'task' | 'weekly' | 'long-term'>('task');
  const [title, setTitle] = useState('');
  const [selectedParentId, setSelectedParentId] = useState('');
  const [selectedParentType, setSelectedParentType] = useState<'weekly' | 'long-term' | ''>('');
  const [taskDate, setTaskDate] = useState<Date>(new Date());
  const [taskTime, setTaskTime] = useState<string>('09:00 AM');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Generate time options
  const timeOptions = Array.from({ length: 48 }).map((_, i) => {
    const hours = Math.floor(i / 2);
    const mins = i % 2 === 0 ? '00' : '30';
    const ampm = hours < 12 ? 'AM' : 'PM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    const formatted = `${displayHours.toString().padStart(2, '0')}:${mins} ${ampm}`;
    return { value: formatted, label: formatted };
  });

  useEffect(() => {
    if (editItem) {
      setActiveTab(editItem.type);
      setTitle(editItem.title);
      setSelectedParentId(editItem.parentId || '');
      setSelectedParentType(editItem.parentType || '');
      if (editItem.date) {
        const d = new Date(editItem.date);
        setTaskDate(d);
        // Extract time
        let h = d.getHours();
        const m = d.getMinutes() < 30 ? '00' : '30';
        const ampm = h < 12 ? 'AM' : 'PM';
        h = h % 12 || 12;
        setTaskTime(`${h.toString().padStart(2, '0')}:${m} ${ampm}`);
      } else {
        setTaskDate(defaultDate || new Date());
        setTaskTime('09:00 AM');
      }
      if (editItem.estimated_hours !== undefined) {
        setEstimatedHours(editItem.estimated_hours.toString());
      } else {
        setEstimatedHours('');
      }
    } else {
      setActiveTab('task');
      setTitle('');
      setSelectedParentId('');
      setSelectedParentType('');
      setTaskDate(defaultDate || new Date());
      setTaskTime('09:00 AM');
      setEstimatedHours('');
    }
  }, [editItem, isOpen, defaultDate]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      let finalDate = taskDate;
      if (activeTab === 'task' && taskTime) {
        finalDate = new Date(taskDate);
        const [timeMatch, hoursStr, minsStr, ampm] = taskTime.match(/(\d+):(\d+) (AM|PM)/) || [];
        if (timeMatch) {
          let h = parseInt(hoursStr, 10);
          if (ampm === 'PM' && h < 12) h += 12;
          if (ampm === 'AM' && h === 12) h = 0;
          finalDate.setHours(h, parseInt(minsStr, 10), 0, 0);
        }
      }
      
      onSubmit(activeTab, { 
        id: editItem?.id, 
        title, 
        parentId: selectedParentId,
        parentType: selectedParentType || undefined,
        date: activeTab === 'task' ? finalDate : undefined,
        estimated_hours: activeTab === 'task' ? parseFloat(estimatedHours) || 0 : undefined
      });
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#030712]/60 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-full max-w-lg relative group"
        >
          {/* Animated gradient border effect */}
          <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/50 via-purple-500/50 to-primary/50 rounded-2xl opacity-50 blur-[2px] group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative bg-[#0f172a]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-xl border border-primary/30 relative overflow-hidden">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(59,130,246,0.5)_360deg)] opacity-50"
                  />
                  <Sparkles className="w-5 h-5 text-primary-400 relative z-10" />
                </div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent font-outfit">
                  {editItem ? `Edit ${activeTab === 'task' ? 'Task' : activeTab === 'weekly' ? 'Weekly Goal' : 'Long-Term Goal'}` : 'Add New Objective'}
                </h2>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 rounded-xl hover:bg-white/[0.08] hover:scale-105 transition-all duration-300 text-slate-400 hover:text-white active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 relative z-20">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 rounded-full blur-[60px] pointer-events-none" />
              
              <div className="space-y-5 relative z-10">
                {/* Tabs */}
                {!editItem && (
                  <div className="flex bg-white/[0.03] p-1 rounded-xl">
                    <button 
                      onClick={() => { setActiveTab('task'); setSelectedParentId(''); setSelectedParentType('weekly'); }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-poppins font-medium transition-all ${activeTab === 'task' ? 'bg-primary/20 text-primary-300 shadow-md border border-primary/20' : 'text-slate-400 hover:text-slate-300 hover:bg-white/[0.02]'}`}
                    >
                      <Calendar className="w-3.5 h-3.5" /> Task (Segment)
                    </button>
                    <button 
                      onClick={() => { setActiveTab('weekly'); setSelectedParentId(''); setSelectedParentType('long-term'); }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-poppins font-medium transition-all ${activeTab === 'weekly' ? 'bg-rose-500/20 text-rose-300 shadow-md border border-rose-500/20' : 'text-slate-400 hover:text-slate-300 hover:bg-white/[0.02]'}`}
                    >
                      <Target className="w-3.5 h-3.5" /> Weekly Goal
                    </button>
                    <button 
                      onClick={() => { setActiveTab('long-term'); setSelectedParentId(''); }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-poppins font-medium transition-all ${activeTab === 'long-term' ? 'bg-purple-500/20 text-purple-300 shadow-md border border-purple-500/20' : 'text-slate-400 hover:text-slate-300 hover:bg-white/[0.02]'}`}
                    >
                      <Mountain className="w-3.5 h-3.5" /> Long-Term Goal
                    </button>
                  </div>
                )}

                <div className={`relative transition-all duration-300 rounded-xl p-[1px] ${isFocused ? 'bg-gradient-to-r from-primary/50 to-purple-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]' : 'bg-white/[0.06]'}`}>
                  <textarea
                    placeholder={`Enter ${activeTab} details...`}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="w-full min-h-[100px] bg-[#0f172a]/90 backdrop-blur-sm rounded-xl px-4 py-3 text-sm text-slate-200 font-poppins placeholder-slate-500 resize-none outline-none transition-all"
                  />
                </div>

                {/* Parent Selection & Calendar Placement Repositioned */}
                {activeTab === 'task' && (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Link To Type Selector */}
                      <div className="flex flex-col gap-2 p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                        <label className="text-[11px] text-slate-400 font-poppins flex items-center gap-1 shrink-0">
                          <Layers className="w-3.5 h-3.5 text-primary-400" /> Link To:
                        </label>
                        <CustomSelect 
                          value={selectedParentType}
                          onChange={(val) => { setSelectedParentType(val as 'weekly' | 'long-term' | ''); setSelectedParentId(''); }}
                          options={[
                            { value: '', label: 'None' },
                            { value: 'weekly', label: 'Weekly Goal' },
                            { value: 'long-term', label: 'Long-Term Goal' }
                          ]}
                          placeholder="Select Type"
                        />
                      </div>

                      {/* Due Date Calendar Picker */}
                      <div className="flex flex-col gap-2 p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                        <label className="text-[11px] text-slate-400 font-poppins flex items-center gap-1 shrink-0">
                          <Calendar className="w-3.5 h-3.5 text-orange-400" /> Date & Time:
                        </label>
                        <div className="flex flex-col gap-2">
                          <CustomDatePicker 
                            selectedDate={taskDate}
                            onDateChange={setTaskDate}
                          />
                          <CustomSelect 
                            value={taskTime}
                            onChange={setTaskTime}
                            options={timeOptions}
                            placeholder="Select Time"
                          />
                        </div>
                      </div>
                    </div>

                    <div className={`transition-all duration-300 ${!selectedParentType ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                      <CustomSelect 
                        value={selectedParentId}
                        onChange={setSelectedParentId}
                        options={
                          selectedParentType === 'weekly' 
                            ? weeklyGoals.map(wg => ({ value: wg.id, label: wg.goal || wg.title }))
                            : selectedParentType === 'long-term'
                            ? longTermGoals.map(ltg => ({ value: ltg.id, label: ltg.title }))
                            : []
                        }
                        placeholder={selectedParentType ? "Select Target Objective" : "Select Link To First"}
                        disabled={!selectedParentType}
                      />
                    </div>

                    {/* Estimated Hours Selection */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-slate-400 font-poppins flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-400" /> Est. Time (Hours):
                      </label>
                      <input 
                        type="number"
                        step="0.5"
                        min="0"
                        value={estimatedHours}
                        onChange={(e) => setEstimatedHours(e.target.value)}
                        placeholder="e.g. 1.5 hours"
                        className="w-full bg-[#0f172a]/90 border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-slate-200 font-poppins outline-none focus:border-primary/50 transition-all focus:shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'weekly' && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-400 font-poppins flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" /> Link to Long-Term Goal (Optional)
                    </label>
                    <CustomSelect 
                      value={selectedParentId}
                      onChange={setSelectedParentId}
                      options={[
                        { value: '', label: 'None' },
                        ...longTermGoals.map(ltg => ({ value: ltg.id, label: ltg.title }))
                      ]}
                      placeholder="Select Long-Term Goal"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-5 border-t border-white/[0.06] bg-black/20 flex items-center justify-end gap-3 relative z-10 rounded-b-2xl">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !title.trim()}
                className={`relative flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r text-white text-sm font-semibold font-poppins transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden ${
                  activeTab === 'task' ? 'from-primary to-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.4)]' :
                  activeTab === 'weekly' ? 'from-rose-500 to-rose-700 shadow-[0_0_20px_rgba(244,63,94,0.4)]' :
                  'from-purple-500 to-indigo-600 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                }`}
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <Send className="w-4 h-4 relative z-10" />
                )}
                <span className="relative z-10">{isSubmitting ? 'Processing...' : editItem ? 'Save Changes' : 'Create Objective'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
