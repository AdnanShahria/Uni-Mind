import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, FolderOpen, Sparkles, Loader2, UploadCloud, CheckCircle2, PenLine } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { turso } from '../../utils/tursoClient';
import { toast } from 'react-hot-toast';
import { extractFileContent as extractFile, getTitleFromFilename, ACCEPTED_FILE_TYPES } from './fileExtractor';

const NOTE_COLORS = [
  { label: 'Blue', value: 'text-blue-400' },
  { label: 'Emerald', value: 'text-emerald-400' },
  { label: 'Purple', value: 'text-purple-400' },
  { label: 'Amber', value: 'text-amber-400' },
  { label: 'Rose', value: 'text-rose-400' },
  { label: 'Cyan', value: 'text-cyan-400' },
];

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newNoteId?: string | number) => void;
  initialContent?: string;
  initialTitle?: string;
  currentFolderId: string | null;
  communityId?: string;
}

export const CreateNoteModal = ({
  isOpen,
  onClose,
  onCreated,
  initialContent = '',
  initialTitle = '',
  currentFolderId,
  communityId,
}: CreateNoteModalProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [selectedFolder, setSelectedFolder] = useState(currentFolderId || '');
  const [folders, setFolders] = useState<{ id: string; name: string }[]>([]);
  const [color, setColor] = useState('text-blue-400');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [creationMode, setCreationMode] = useState<'upload' | 'manual'>('upload');

  // File Upload States
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setContent(initialContent);
      setUploadedFile(null);
      setIsExtracting(false);
      setSelectedFolder(currentFolderId || '');
      setCreationMode(initialContent ? 'manual' : 'upload');
      fetchFolders();
    }
  }, [isOpen, initialTitle, initialContent, currentFolderId]);

  const fetchFolders = async () => {
    const { data: { user } } = await turso.auth.getUser();
    if (!user) return;
    let query = turso.from('folders').select('id, name').eq('user_id', user.id);
    if (communityId) query = query.eq('community_id', communityId);
    else query = query.is('community_id', null);
    const { data } = await query;
    if (data) setFolders(data);
  };

  // Store a blob URL for iframe-viewable files (PDF, DOCX, images)
  const [fileBlobUrl, setFileBlobUrl] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setUploadedFile(file);
    setIsExtracting(true);
    setTitle(getTitleFromFilename(file.name));

    try {
      const result = await extractFile(file);
      setContent(result.content);
      setFileBlobUrl(result.blobUrl);

      const label = result.fileType === 'pdf' && result.pageCount
        ? `Extracted ${result.pageCount} PDF pages!`
        : result.fileType === 'image'
          ? 'Image loaded!'
          : 'File content loaded!';
      toast.success(label);
    } catch (err) {
      console.error('File extraction error:', err);
      setContent(`[Error extracting ${file.name}]`);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter a note title');
      return;
    }
    setIsSubmitting(true);

    try {
      const { data: { user } } = await turso.auth.getUser();
      if (!user) { toast.error('Please sign in first'); return; }

      const folderId: string | null = selectedFolder || currentFolderId;

      const { error, data } = await turso.from('notes').insert([{
        author_id: user.id,
        title: title.trim(),
        content: content.trim(),
        folder_id: folderId,
        community_id: communityId || null,
        file_url: fileBlobUrl || (uploadedFile ? uploadedFile.name : null),
        is_starred: false,
        is_ai_summarized: false,
      }]);

      if (error) throw error;

      toast.success('Note created!');
      setTitle('');
      setContent('');
      setSelectedFolder(currentFolderId || '');
      setUploadedFile(null);
      const newId = data?.id || (Array.isArray(data) && data[0]?.id);
      onCreated(newId);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create note');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-2xl bg-[#0d1526] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#0A0D1A]">
            <h2 className="text-base font-semibold text-white font-outfit flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-glow" />
              Smart Note Upload
            </h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/[0.06] transition-colors text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
            
            {/* Mode Toggle */}
            <div className="flex bg-[#0A0D1A] p-1 rounded-xl w-full max-w-[400px] mx-auto border border-white/[0.08]">
              <button 
                onClick={() => setCreationMode('upload')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${creationMode === 'upload' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'}`}
              >
                <UploadCloud className="w-4 h-4" />
                Upload Document
              </button>
              <button 
                onClick={() => setCreationMode('manual')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${creationMode === 'manual' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'}`}
              >
                <PenLine className="w-4 h-4" />
                Write Manually
              </button>
            </div>

            {/* Drag and Drop Zone */}
            {creationMode === 'upload' && (
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isExtracting && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer overflow-hidden ${
                  isDragging ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
                }`}
              >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept={ACCEPTED_FILE_TYPES}
                onChange={(e) => e.target.files && handleFile(e.target.files[0])}
              />
              
              {isExtracting ? (
                <div className="flex flex-col items-center gap-4 z-10">
                  <div className="relative">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <Sparkles className="w-4 h-4 text-purple-400 absolute top-0 right-0 animate-ping" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">AI Cognitive Engine Scanning...</h3>
                    <p className="text-[11px] text-slate-400">Extracting text, formulas, and concepts using OCR</p>
                  </div>
                  {/* Fake progress bar */}
                  <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden mt-2">
                    <motion.div 
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2.5, ease: "easeInOut" }}
                      className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                    />
                  </div>
                </div>
              ) : uploadedFile ? (
                <div className="flex flex-col items-center gap-3 z-10">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{uploadedFile.name}</h3>
                    <p className="text-[11px] text-emerald-400">Successfully processed. Content auto-filled below.</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 z-10">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">Drag & Drop Any Document</h3>
                    <p className="text-[11px] text-slate-500 mt-1">or click to browse local files. Supports PDF, Word, Code, Text, Images & more.</p>
                  </div>
                </div>
              )}
            </div>
            )}

            <div className={`grid gap-5 ${creationMode === 'upload' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {/* Left Column */}
              <div className="space-y-5">
                {/* Title */}
                <div>
                  <label className="text-[10px] text-slate-500 font-poppins uppercase tracking-wider font-semibold mb-1.5 block">Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Quantum Mechanics Chapter 5"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-slate-100 font-poppins placeholder-slate-600 outline-none focus:border-primary/40 transition-colors"
                  />
                </div>

                {/* Folder */}
                <div>
                  <label className="text-[10px] text-slate-500 font-poppins uppercase tracking-wider font-semibold mb-1.5 block flex items-center gap-1">
                    <FolderOpen className="w-3 h-3" /> Save to Folder
                  </label>
                  <select
                    value={selectedFolder}
                    onChange={e => setSelectedFolder(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-slate-300 font-poppins outline-none focus:border-primary/40 transition-colors"
                  >
                    <option value="">Home (Root)</option>
                    {folders.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>

                {/* Color tag */}
                <div>
                  <label className="text-[10px] text-slate-500 font-poppins uppercase tracking-wider font-semibold mb-2 block">Color Tag</label>
                  <div className="flex gap-2">
                    {NOTE_COLORS.map(c => (
                      <button
                        key={c.value}
                        onClick={() => setColor(c.value)}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${c.value.replace('text-', 'bg-').replace('-400', '-500/60')} ${
                          color === c.value ? 'border-white scale-110' : 'border-transparent opacity-60'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column (Content) */}
              {creationMode === 'upload' ? (
                <div className="flex flex-col h-full">
                  <label className="text-[10px] text-slate-500 font-poppins uppercase tracking-wider font-semibold mb-1.5 block">
                    Extracted Content
                  </label>
                  <textarea
                    placeholder="Content will appear here after AI parsing..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="w-full h-full min-h-[250px] bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-slate-300 font-poppins placeholder-slate-600 resize-none outline-none focus:border-primary/40 transition-colors"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[200px] bg-white/[0.02] border border-white/[0.05] rounded-xl p-6 text-center border-dashed">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">Ready for Deep Work</h3>
                  <p className="text-xs text-slate-400">
                    Your note will be created empty. Click "Create & Enter Workspace" below to open the rich text editor and start writing.
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/[0.06] bg-[#0A0D1A] flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-poppins">
              {content.length > 0 ? `${content.length} characters extracted` : 'No content'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !title.trim() || isExtracting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-glow text-white text-sm font-semibold font-poppins transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {isSubmitting ? 'Saving...' : (creationMode === 'manual' ? 'Create & Enter Workspace' : 'Save Document')}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
