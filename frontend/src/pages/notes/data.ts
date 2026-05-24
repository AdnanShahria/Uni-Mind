import { NoteType } from './types';

// Removed hardcoded defaultFolders, these are now loaded from the database

export const recentNotes: NoteType[] = [
  {
    id: 1,
    title: 'Quantum Entanglement Notes',
    course: 'Physics 301',
    pages: 24,
    lastEdited: '10 min ago',
    starred: true,
    color: 'text-blue-400',
    aiSummary: true,
  },
  {
    id: 2,
    title: 'Data Structures - Trees & Graphs',
    course: 'Computer Science',
    pages: 18,
    lastEdited: '2h ago',
    starred: false,
    color: 'text-emerald-400',
    aiSummary: true,
  },
  {
    id: 3,
    title: 'Linear Algebra Formulas',
    course: 'Mathematics',
    pages: 6,
    lastEdited: '1 day ago',
    starred: true,
    color: 'text-purple-400',
    aiSummary: false,
  },
  {
    id: 4,
    title: 'Research Methodology Guide',
    course: 'Research Papers',
    pages: 32,
    lastEdited: '3 days ago',
    starred: false,
    color: 'text-amber-400',
    aiSummary: true,
  },
  {
    id: 5,
    title: 'Neural Network Architecture',
    course: 'Computer Science',
    pages: 15,
    lastEdited: '5 days ago',
    starred: true,
    color: 'text-rose-400',
    aiSummary: false,
  },
  {
    id: 6,
    title: 'Thermodynamics Summary',
    course: 'Physics 301',
    pages: 10,
    lastEdited: '1 week ago',
    starred: false,
    color: 'text-cyan-400',
    aiSummary: true,
  },
];

export const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};
