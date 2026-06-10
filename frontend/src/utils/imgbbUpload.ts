/**
 * IMGBB Image Upload Utility
 * Replaces all Supabase/R2 storage usage with IMGBB API via Backend Proxy.
 * Supports image files only. For PDFs/notes, file_url is stored as base64 in Turso.
 */

export interface ImgbbUploadResult {
  success: boolean;
  url: string | null;
  deleteUrl?: string;
  error?: string;
}

function getToken() {
  return localStorage.getItem('unimind_token') || '';
}

/**
 * Upload an image file to IMGBB and return the public URL.
 * @param file - The image File object to upload
 * @param name - Optional name for the image
 * @returns ImgbbUploadResult with the public URL or error
 */
export async function uploadImageToImgbb(file: File, name?: string): Promise<ImgbbUploadResult> {
  try {
    const formData = new FormData();
    formData.append('image', file);
    if (name) {
      formData.append('name', name);
    }

    const response = await fetch(`/api/imgbb-proxy`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      body: formData,
    });

    if (!response.ok) {
      const errTxt = await response.text();
      return {
        success: false,
        url: null,
        error: `Proxy upload failed: ${response.status} - ${errTxt}`
      };
    }

    const result = await response.json();

    if (result.success) {
      return {
        success: true,
        url: result.data.display_url || result.data.url,
        deleteUrl: result.data.delete_url,
      };
    } else {
      return {
        success: false,
        url: null,
        error: result.error?.message || 'IMGBB upload failed',
      };
    }
  } catch (err: any) {
    console.error('IMGBB proxy upload error:', err);
    return {
      success: false,
      url: null,
      error: err.message || 'Network error during upload',
    };
  }
}

/**
 * Convert a file to a base64 data URL string.
 * Used as fallback or for non-image files (PDFs, docs) stored in Turso.
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
