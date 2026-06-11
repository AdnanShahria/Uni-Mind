/**
 * Universal File Extractor
 * Handles text extraction and blob URL creation for all common file types.
 */

export interface ExtractionResult {
  /** Extracted plain text content from the file */
  content: string;
  /** Blob URL for iframe/image preview (PDF, images, etc.) — null for text-only files */
  blobUrl: string | null;
  /** Detected file category */
  fileType: 'text' | 'pdf' | 'document' | 'spreadsheet' | 'presentation' | 'image' | 'code' | 'data' | 'unknown';
  /** MIME type */
  mimeType: string;
  /** Number of pages (PDFs) or sheets (spreadsheets), if applicable */
  pageCount?: number;
}

// ── File type classification ────────────────────────────────────────────────

const TEXT_EXTENSIONS = ['txt', 'md', 'markdown', 'csv', 'tsv', 'log', 'ini', 'cfg', 'conf', 'env', 'gitignore', 'editorconfig'];
const CODE_EXTENSIONS = ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'h', 'hpp', 'cs', 'go', 'rs', 'rb', 'php', 'swift', 'kt', 'scala', 'r', 'sql', 'sh', 'bash', 'zsh', 'ps1', 'bat', 'cmd', 'lua', 'perl', 'pl', 'dart', 'vue', 'svelte'];
const MARKUP_EXTENSIONS = ['html', 'htm', 'xml', 'xhtml', 'svg', 'xsl', 'xslt'];
const STYLE_EXTENSIONS = ['css', 'scss', 'sass', 'less', 'styl'];
const DATA_EXTENSIONS = ['json', 'yaml', 'yml', 'toml', 'graphql', 'gql', 'proto', 'avro'];
const PDF_EXTENSIONS = ['pdf'];
const DOCUMENT_EXTENSIONS = ['doc', 'docx', 'odt', 'rtf'];
const SPREADSHEET_EXTENSIONS = ['xls', 'xlsx', 'ods'];
const PRESENTATION_EXTENSIONS = ['ppt', 'pptx', 'odp'];
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'ico', 'tiff', 'tif', 'avif', 'heic', 'heif'];

function getExtension(filename: string): string {
  return (filename.split('.').pop() || '').toLowerCase();
}

function isTextReadable(ext: string): boolean {
  return [
    ...TEXT_EXTENSIONS,
    ...CODE_EXTENSIONS,
    ...MARKUP_EXTENSIONS,
    ...STYLE_EXTENSIONS,
    ...DATA_EXTENSIONS,
  ].includes(ext);
}

function getFileCategory(ext: string): ExtractionResult['fileType'] {
  if (TEXT_EXTENSIONS.includes(ext)) return 'text';
  if (CODE_EXTENSIONS.includes(ext) || MARKUP_EXTENSIONS.includes(ext) || STYLE_EXTENSIONS.includes(ext)) return 'code';
  if (DATA_EXTENSIONS.includes(ext)) return 'data';
  if (PDF_EXTENSIONS.includes(ext)) return 'pdf';
  if (DOCUMENT_EXTENSIONS.includes(ext)) return 'document';
  if (SPREADSHEET_EXTENSIONS.includes(ext)) return 'spreadsheet';
  if (PRESENTATION_EXTENSIONS.includes(ext)) return 'presentation';
  if (IMAGE_EXTENSIONS.includes(ext)) return 'image';
  return 'unknown';
}

// ── Extraction functions ────────────────────────────────────────────────────

async function extractText(file: File): Promise<string> {
  return await file.text();
}

// Disable automatic LlamaParse by commenting out the unused extraction function to resolve TS warning
// async function extractPdfWithLlamaParse(file: File): Promise<string> {
//   const formData = new FormData();
//   formData.append('file', file);
//   
//   const token = localStorage.getItem('unimind_token') || '';
//   const res = await fetch('/api/llamaparse/extract-start', {
//     method: 'POST',
//     headers: {
//       'Authorization': `Bearer ${token}`
//     },
//     body: formData
//   });
// 
//   if (!res.ok) {
//     const errData = await res.json().catch(() => ({}));
//     throw new Error(errData.error || `LlamaParse extract-start failed: ${res.status}`);
//   }
// 
//   const startData = await res.json();
//   if (!startData.success) throw new Error(startData.error || 'LlamaParse upload unsuccessful');
// 
//   const jobId = startData.jobId;
//   let attempts = 0;
//   
//   while (attempts < 60) {
//     await new Promise(resolve => setTimeout(resolve, 2000));
//     
//     const statusRes = await fetch(`/api/llamaparse/extract-status?jobId=${jobId}`, {
//       headers: {
//         'Authorization': `Bearer ${token}`
//       }
//     });
// 
//     if (!statusRes.ok) {
//       console.warn(`[LlamaParse] Status check failed: ${statusRes.status}`);
//       attempts++;
//       continue;
//     }
// 
//     const statusData = await statusRes.json();
//     if (statusData.success && statusData.status === 'SUCCESS') {
//       return statusData.markdown || '';
//     } else if (!statusData.success || (statusData.status && statusData.status !== 'PENDING')) {
//       throw new Error(statusData.error || `LlamaParse extraction unsuccessful (${statusData.status})`);
//     }
// 
//     attempts++;
//   }
// 
//   throw new Error('LlamaParse extraction timed out');
// }

async function extractPdf(file: File): Promise<{ text: string; pageCount: number }> {
  try {
    // Note: Automatic LlamaParse API call has been disabled to prevent unwanted costs.
    // Falls back directly to the local basic PDF extractor.

    const pdfjsLib = await import('pdfjs-dist');
    // Use Vite's worker URL import to bundle the worker properly
    const workerSrc = await import('pdfjs-dist/build/pdf.worker.mjs?url');
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc.default;
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += `--- Page ${i} ---\n${pageText}\n\n`;
    }
    
    return {
      text: fullText.trim() || `[PDF: ${file.name} — ${pdf.numPages} pages, no extractable text]`,
      pageCount: pdf.numPages,
    };
  } catch (err) {
    console.error('PDF extraction failed:', err);
    return {
      text: `[PDF: ${file.name}]\n\nCould not extract text. The file is available for viewing in the document pane.`,
      pageCount: 0,
    };
  }
}

async function extractDocx(file: File): Promise<string> {
  try {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value || `[Document: ${file.name}] — no text content extracted.`;
  } catch (err) {
    console.error('DOCX extraction failed:', err);
    return `[Document: ${file.name}]\n\nCould not extract text from this document format.`;
  }
}

function generateImageDescription(file: File): string {
  return `[Image: ${file.name}]\nType: ${file.type}\nSize: ${(file.size / 1024).toFixed(1)} KB\n\nImage uploaded successfully. The file is available for viewing in the document pane.\n\n💡 Add a Groq/OpenAI API key for AI-powered image analysis and OCR.`;
}

function generateSpreadsheetDescription(file: File): string {
  return `[Spreadsheet: ${file.name}]\nType: ${file.type}\nSize: ${(file.size / 1024).toFixed(1)} KB\n\nSpreadsheet uploaded. Raw data viewing is available.\n\n💡 For full spreadsheet parsing, consider exporting as CSV first.`;
}

function generatePresentationDescription(file: File): string {
  return `[Presentation: ${file.name}]\nType: ${file.type}\nSize: ${(file.size / 1024).toFixed(1)} KB\n\nPresentation uploaded. The file is available for download.\n\n💡 For text extraction, consider exporting slides as PDF first.`;
}

function generateUnknownDescription(file: File): string {
  return `[File: ${file.name}]\nType: ${file.type || 'unknown'}\nSize: ${(file.size / 1024).toFixed(1)} KB\n\nThis file type is not supported for text extraction. You can still reference it in your notes.`;
}

// ── Main extraction entry point ─────────────────────────────────────────────

export async function extractFileContent(file: File): Promise<ExtractionResult> {
  const ext = getExtension(file.name);
  const fileType = getFileCategory(ext);
  const mimeType = file.type || 'application/octet-stream';

  // Text-readable files (code, config, data, plain text)
  if (isTextReadable(ext)) {
    const content = await extractText(file);
    const blobUrl = URL.createObjectURL(file);
    return { content, blobUrl, fileType: fileType === 'unknown' ? 'text' : fileType, mimeType };
  }

  // PDF files
  if (fileType === 'pdf') {
    const blobUrl = URL.createObjectURL(file);
    const { text, pageCount } = await extractPdf(file);
    return { content: text, blobUrl, fileType: 'pdf', mimeType, pageCount };
  }

  // Word documents
  if (DOCUMENT_EXTENSIONS.includes(ext)) {
    const content = await extractDocx(file);
    // Only create blob URL for DOCX (browser can sometimes preview)
    const blobUrl = ext === 'docx' ? URL.createObjectURL(file) : null;
    return { content, blobUrl, fileType: 'document', mimeType };
  }

  // Images
  if (IMAGE_EXTENSIONS.includes(ext)) {
    const blobUrl = URL.createObjectURL(file);
    const content = generateImageDescription(file);
    return { content, blobUrl, fileType: 'image', mimeType };
  }

  // Spreadsheets — try reading as CSV if possible, else show description
  if (SPREADSHEET_EXTENSIONS.includes(ext)) {
    if (ext === 'csv' || ext === 'tsv') {
      const content = await extractText(file);
      return { content, blobUrl: null, fileType: 'spreadsheet', mimeType };
    }
    const content = generateSpreadsheetDescription(file);
    return { content, blobUrl: null, fileType: 'spreadsheet', mimeType };
  }

  // Presentations
  if (PRESENTATION_EXTENSIONS.includes(ext)) {
    const content = generatePresentationDescription(file);
    return { content, blobUrl: null, fileType: 'presentation', mimeType };
  }

  // Fallback: try reading as text (many files are text-based)
  try {
    const text = await extractText(file);
    // If the text contains lots of null bytes, it's likely binary
    if (text.includes('\0') || text.length === 0) {
      return { content: generateUnknownDescription(file), blobUrl: null, fileType: 'unknown', mimeType };
    }
    return { content: text, blobUrl: null, fileType: 'text', mimeType };
  } catch {
    return { content: generateUnknownDescription(file), blobUrl: null, fileType: 'unknown', mimeType };
  }
}

// ── Utility: get a suggested title from filename ────────────────────────────

export function getTitleFromFilename(filename: string): string {
  return filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
}

// ── Utility: accepted file input string ─────────────────────────────────────

export const ACCEPTED_FILE_TYPES = [
  '.pdf',
  '.doc', '.docx', '.odt', '.rtf',
  '.txt', '.md', '.csv', '.tsv', '.log',
  '.json', '.yaml', '.yml', '.toml', '.xml',
  '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.c', '.cpp', '.h', '.cs', '.go', '.rs', '.rb', '.php', '.swift', '.kt',
  '.html', '.htm', '.css', '.scss', '.sql', '.sh',
  '.xls', '.xlsx', '.ods',
  '.ppt', '.pptx', '.odp',
  'image/*',
].join(',');
