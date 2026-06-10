export interface FolderType {
  id: string;
  name: string;
  count: number;
  color: string;
  borderColor: string;
  parent_id?: string | null;
}

export interface NoteType {
  id: string | number;
  folder_id?: string | null;
  title: string;
  course: string;
  pages: number;
  lastEdited: string;
  createdAt?: string;
  starred: boolean;
  color: string;
  aiSummary: boolean;
  visibility?: 'private' | 'class' | 'public';
  sharedLinkToken?: string;
  fileUrl?: string | null;
}

export interface FlashcardType {
  id: string;
  note_id: string;
  question: string;
  answer: string;
  status: 'new' | 'learning' | 'mastered';
}
