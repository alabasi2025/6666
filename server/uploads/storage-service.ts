// server/uploads/storage-service.ts

import { FileInfo, ProcessedFile } from './types';
import { fileProcessor } from './file-processor';
import { fileValidator } from './file-validator';

// تعريف نوع الملف
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

interface StorageStats {
  totalFiles: number;
  totalSize: number;
  byCategory: Record<string, { count: number; size: number }>;
}

class StorageService {
  private files: Map<string, FileInfo> = new Map();

  /**
   * رفع ملف
   */
  async upload(
    file: MulterFile,
    options: { userId?: number; businessId?: number } = {}
  ): Promise<ProcessedFile> {
    // التحقق من صحة الملف
    const validation = fileValidator.validate(file);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // معالجة الملف
    const processed = await fileProcessor.process(file, options);

    // تخزين معلومات الملف
    this.files.set(processed.original.id, processed.original);
    
    if (processed.thumbnails) {
      for (const thumb of processed.thumbnails) {
        this.files.set(thumb.id, thumb);
      }
    }

    return processed;
  }

  /**
   * الحصول على ملف
   */
  getFile(fileId: string): FileInfo | undefined {
    return this.files.get(fileId);
  }

  /**
   * حذف ملف
   */
  async deleteFile(fileId: string): Promise<boolean> {
    const file = this.files.get(fileId);
    if (!file) return false;

    const deleted = await fileProcessor.delete(file);
    if (deleted) {
      this.files.delete(fileId);
    }
    return deleted;
  }

  /**
   * الحصول على ملفات المستخدم
   */
  getUserFiles(userId: number): FileInfo[] {
    return Array.from(this.files.values()).filter(
      (f) => f.uploadedBy === userId
    );
  }

  /**
   * الحصول على ملفات الشركة
   */
  getBusinessFiles(businessId: number): FileInfo[] {
    return Array.from(this.files.values()).filter(
      (f) => f.businessId === businessId
    );
  }

  /**
   * الحصول على إحصائيات التخزين
   */
  getStats(businessId?: number): StorageStats {
    let files = Array.from(this.files.values());
    
    if (businessId) {
      files = files.filter((f) => f.businessId === businessId);
    }

    const stats: StorageStats = {
      totalFiles: files.length,
      totalSize: 0,
      byCategory: {},
    };

    for (const file of files) {
      stats.totalSize += file.size;
      
      const category = fileValidator.getFileCategory(file.mimeType);
      if (!stats.byCategory[category]) {
        stats.byCategory[category] = { count: 0, size: 0 };
      }
      stats.byCategory[category].count++;
      stats.byCategory[category].size += file.size;
    }

    return stats;
  }

  /**
   * تنظيف الملفات القديمة
   */
  async cleanupOldFiles(maxAgeDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

    let deletedCount = 0;
    const entries = Array.from(this.files.entries());
    
    for (const [id, file] of entries) {
      if (file.createdAt < cutoffDate) {
        const deleted = await fileProcessor.delete(file);
        if (deleted) {
          this.files.delete(id);
          deletedCount++;
        }
      }
    }

    return deletedCount;
  }
}

export const storageService = new StorageService();
