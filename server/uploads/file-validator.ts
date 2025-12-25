// server/uploads/file-validator.ts

import { UploadConfig, ValidationResult, MIME_TYPE_CATEGORIES, FileCategory } from './types';

const DEFAULT_CONFIG: UploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    ...MIME_TYPE_CATEGORIES.image,
    ...MIME_TYPE_CATEGORIES.document,
  ],
  uploadDir: './uploads',
  generateThumbnails: true,
  thumbnailSizes: [
    { name: 'thumb', width: 150, height: 150 },
    { name: 'medium', width: 400, height: 400 },
  ],
};

export class FileValidator {
  private config: UploadConfig;

  constructor(config: Partial<UploadConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * التحقق من صحة الملف
   */
  validate(file: Express.Multer.File): ValidationResult {
    const errors: string[] = [];

    // التحقق من الحجم
    if (file.size > this.config.maxFileSize) {
      const maxSizeMB = this.config.maxFileSize / (1024 * 1024);
      errors.push(`حجم الملف يتجاوز الحد الأقصى (${maxSizeMB}MB)`);
    }

    // التحقق من نوع الملف
    if (!this.config.allowedMimeTypes.includes(file.mimetype)) {
      errors.push(`نوع الملف غير مسموح: ${file.mimetype}`);
    }

    // التحقق من اسم الملف
    if (!this.isValidFileName(file.originalname)) {
      errors.push('اسم الملف يحتوي على أحرف غير مسموحة');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * التحقق من صحة اسم الملف
   */
  private isValidFileName(fileName: string): boolean {
    // منع الأحرف الخطرة
    const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
    return !dangerousChars.test(fileName);
  }

  /**
   * الحصول على فئة الملف
   */
  getFileCategory(mimeType: string): FileCategory {
    for (const [category, types] of Object.entries(MIME_TYPE_CATEGORIES)) {
      if (types.includes(mimeType)) {
        return category as FileCategory;
      }
    }
    return 'other';
  }

  /**
   * التحقق من أن الملف صورة
   */
  isImage(mimeType: string): boolean {
    return MIME_TYPE_CATEGORIES.image.includes(mimeType);
  }

  /**
   * التحقق من أن الملف مستند
   */
  isDocument(mimeType: string): boolean {
    return MIME_TYPE_CATEGORIES.document.includes(mimeType);
  }

  /**
   * الحصول على الإعدادات
   */
  getConfig(): UploadConfig {
    return { ...this.config };
  }
}

export const fileValidator = new FileValidator();
