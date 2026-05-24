export interface FolderType {
  name: string;
  count: number;
  color: string;
  borderColor: string;
}

export interface NoteType {
  id: string | number;
  title: string;
  course: string;
  pages: number;
  lastEdited: string;
  starred: boolean;
  color: string;
  aiSummary: boolean;
}
