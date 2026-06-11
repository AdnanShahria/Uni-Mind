import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, Type, AlignLeft, Tag, Image as ImageIcon, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import { uploadImageToImgbb } from '../../../../utils/imgbbUpload';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityId: string;
  onEventCreated: () => void;
  editEventData?: any;
}

const EVENT_TYPES = [
  { value: 'workshop', label: 'Workshop', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  { value: 'hackathon', label: 'Hackathon', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { value: 'lecture', label: 'Lecture', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { value: 'meetup', label: 'Meetup', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  { value: 'study_session', label: 'Study Session', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  { value: 'general', label: 'General', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
];

export const CreateEventModal = ({ isOpen, onClose, communityId, onEventCreated, editEventData }: CreateEventModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [eventType, setEventType] = useState('general');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editEventData) {
        setTitle(editEventData.title || '');
        setDescription(editEventData.description || '');
        const st = new Date(editEventData.start_time);
        const et = new Date(editEventData.end_time);
        
        // Pad numbers to standard formats
        const pad = (n: number) => n.toString().padStart(2, '0');
        
        setStartDate(`${st.getFullYear()}-${pad(st.getMonth() + 1)}-${pad(st.getDate())}`);
        setStartTime(`${pad(st.getHours())}:${pad(st.getMinutes())}`);
        
        setEndDate(`${et.getFullYear()}-${pad(et.getMonth() + 1)}-${pad(et.getDate())}`);
        setEndTime(`${pad(et.getHours())}:${pad(et.getMinutes())}`);
        
        setLocation(editEventData.location || '');
        setEventType(editEventData.event_type || 'general');
        setCoverFile(null);
        setCoverPreview(editEventData.image_url || null);
      } else {
        resetForm();
      }
    }
  }, [isOpen, editEventData]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStartDate('');
    setStartTime('');
    setEndDate('');
    setEndTime('');
    setLocation('');
    setEventType('general');
    setCoverFile(null);
    setCoverPreview(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Event title is required');
      return;
    }
    if (!startDate || !startTime) {
      toast.error('Start date & time are required');
      return;
    }
    if (!endDate || !endTime) {
      toast.error('End date & time are required');
      return;
    }

    const startISO = new Date(`${startDate}T${startTime}`).toISOString();
    const endISO = new Date(`${endDate}T${endTime}`).toISOString();

    if (new Date(endISO) <= new Date(startISO)) {
      toast.error('End time must be after start time');
      return;
    }

    setIsSubmitting(true);
    try {
      let image_url = null;
      if (coverFile) {
        toast.loading('Uploading image...', { id: 'upload-event' });
        const uploadResult = await uploadImageToImgbb(coverFile, `event-${Date.now()}`);
        if (uploadResult.success) {
          image_url = uploadResult.url;
          toast.success('Image uploaded!', { id: 'upload-event' });
        } else {
          toast.error(`Image upload failed: ${uploadResult.error}`, { id: 'upload-event' });
          image_url = editEventData?.image_url || null; // fallback
        }
      } else if (editEventData && !coverFile && coverPreview === editEventData.image_url) {
        image_url = editEventData.image_url;
      }

      const token = localStorage.getItem('unimind_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const payload: any = {
        title: title.trim(),
        description: description.trim() || null,
        start_time: startISO,
        end_time: endISO,
        location: location.trim() || null,
        event_type: eventType,
        community_id: communityId,
        color: eventType === 'workshop' ? 'purple' :
               eventType === 'hackathon' ? 'emerald' :
               eventType === 'lecture' ? 'blue' :
               eventType === 'meetup' ? 'amber' :
               eventType === 'study_session' ? 'cyan' : 'slate',
        image_url: image_url,
        attendees_count: editEventData ? editEventData.attendees_count : 0,
        updated_at: new Date().toISOString(),
      };

      if (!editEventData) {
        payload.created_at = new Date().toISOString();
      } else {
        payload.id = editEventData.id;
      }

      const method = editEventData ? 'PUT' : 'POST';

      const res = await fetch('/api/dynamic/events', {
        method,
        headers,
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(editEventData ? 'Event updated successfully! 🎉' : 'Event created successfully! 🎉');
        resetForm();
        onEventCreated();
        onClose();
      } else {
        toast.error(json.error || 'Failed to create event');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="w-full max-w-md bg-[#0a0f1d] border border-white/10 rounded-2xl shadow-2xl p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold font-outfit text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                {editEventData ? 'Edit Event' : 'Create Event'}
              </h2>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 max-h-[65vh] overflow-y-auto custom-scrollbar pr-1 pb-2">
              {/* Title */}
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 font-poppins mb-1.5 uppercase tracking-wide">
                  <Type className="w-3 h-3 text-amber-400" /> Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g., Guest Lecture: Advanced AI"
                  className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-3 text-sm text-slate-200 outline-none focus:border-amber-500/50 transition-colors font-poppins"
                />
              </div>

              {/* Event Type */}
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 font-poppins mb-1.5 uppercase tracking-wide">
                  <Tag className="w-3 h-3 text-amber-400" /> Event Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {EVENT_TYPES.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setEventType(t.value)}
                      className={`px-2.5 py-2 rounded-xl text-[11px] font-semibold font-poppins border transition-all ${
                        eventType === t.value
                          ? t.color + ' ring-1 ring-white/20 scale-[1.02]'
                          : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 font-poppins mb-1.5 uppercase tracking-wide">
                  <ImageIcon className="w-3 h-3 text-amber-400" /> Event Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  id="event-image-upload"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="event-image-upload"
                  className="w-full h-16 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center cursor-pointer hover:border-amber-500/50 transition-colors group relative overflow-hidden bg-white/5"
                >
                  {coverPreview ? (
                    <>
                      <img src={coverPreview} alt="Preview" className="w-full h-full object-cover opacity-50" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-white px-3 py-1 bg-black/50 rounded-lg backdrop-blur-sm flex items-center gap-2">
                          <Upload className="w-3 h-3" /> Change Image
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-400 group-hover:text-slate-300 transition-colors">
                      <ImageIcon className="w-5 h-5" />
                      <span className="text-xs font-medium">Click to upload cover image</span>
                    </div>
                  )}
                </label>
              </div>

              {/* Start Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 font-poppins mb-1.5 uppercase tracking-wide">
                    <Calendar className="w-3 h-3 text-amber-400" /> Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => {
                      setStartDate(e.target.value);
                      if (!endDate) setEndDate(e.target.value);
                    }}
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-3 text-sm text-slate-200 outline-none focus:border-amber-500/50 transition-colors font-poppins [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 font-poppins mb-1.5 uppercase tracking-wide">
                    <Clock className="w-3 h-3 text-amber-400" /> Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-3 text-sm text-slate-200 outline-none focus:border-amber-500/50 transition-colors font-poppins [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* End Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 font-poppins mb-1.5 uppercase tracking-wide">
                    <Calendar className="w-3 h-3 text-slate-400" /> End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-3 text-sm text-slate-200 outline-none focus:border-amber-500/50 transition-colors font-poppins [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 font-poppins mb-1.5 uppercase tracking-wide">
                    <Clock className="w-3 h-3 text-slate-400" /> End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-3 text-sm text-slate-200 outline-none focus:border-amber-500/50 transition-colors font-poppins [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 font-poppins mb-1.5 uppercase tracking-wide">
                  <MapPin className="w-3 h-3 text-amber-400" /> Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g., Discord, Room 204, Online"
                  className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-3 text-sm text-slate-200 outline-none focus:border-amber-500/50 transition-colors font-poppins"
                />
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 font-poppins mb-1.5 uppercase tracking-wide">
                  <AlignLeft className="w-3 h-3 text-amber-400" /> Description
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe the event..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-amber-500/50 resize-none transition-colors font-poppins"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 mt-3 disabled:opacity-50 disabled:cursor-not-allowed font-poppins"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {editEventData ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    {editEventData ? 'Update Event' : 'Create Event'}
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};
