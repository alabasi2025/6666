// server/uploads/types.ts

export interface FileInfo {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  uploadedBy?: number;
  businessId?: number;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

export interface UploadConfig {
  maxFileSize: number; // bytes
  allowedMimeTypes: string[];
  uploadDir: string;
  generateThumbnails: boolean;
  thumbnailSizes?: ThumbnailSize[];
}

export interface ThumbnailSize {
  name: string;
  width: number;
  height: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ProcessedFile {
  original: FileInfo;
  thumbnails?: FileInfo[];
}

export type FileCategory = 'image' | 'document' | 'video' | 'audio' | 'other';

export const MIME_TYPE_CATEGORIES: Record<FileCategory, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ],
  video: ['video/mp4', 'video/webm', 'video/avi'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  other: [],
};
