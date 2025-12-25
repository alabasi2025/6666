// server/uploads/file-processor.ts

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { FileInfo, ProcessedFile, ThumbnailSize } from './types';
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

export class FileProcessor {
  private uploadDir: string;

  constructor(uploadDir = './uploads') {
    this.uploadDir = uploadDir;
    this.ensureUploadDir();
  }

  /**
   * التأكد من وجود مجلد الرفع
   */
  private ensureUploadDir(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * معالجة ملف مرفوع
   */
  async process(
    file: MulterFile,
    options: { userId?: number; businessId?: number } = {}
  ): Promise<ProcessedFile> {
    const fileId = this.generateFileId();
    const ext = path.extname(file.originalname);
    const fileName = `${fileId}${ext}`;
    const filePath = path.join(this.uploadDir, fileName);

    // نقل الملف إلى المجلد النهائي
    fs.writeFileSync(filePath, file.buffer);

    const fileInfo: FileInfo = {
      id: fileId,
      originalName: file.originalname,
      fileName,
      mimeType: file.mimetype,
      size: file.size,
      path: filePath,
      url: `/uploads/${fileName}`,
      uploadedBy: options.userId,
      businessId: options.businessId,
      createdAt: new Date(),
      metadata: {
        encoding: file.encoding,
      },
    };

    const result: ProcessedFile = {
      original: fileInfo,
    };

    // إنشاء thumbnails للصور
    if (fileValidator.isImage(file.mimetype)) {
      result.thumbnails = await this.generateThumbnails(fileInfo);
    }

    return result;
  }

  /**
   * إنشاء thumbnails للصور
   */
  private async generateThumbnails(fileInfo: FileInfo): Promise<FileInfo[]> {
    // ملاحظة: في الإنتاج، استخدم مكتبة مثل sharp
    // هنا نقوم بمحاكاة العملية
    const config = fileValidator.getConfig();
    const thumbnails: FileInfo[] = [];

    for (const size of config.thumbnailSizes || []) {
      const thumbId = `${fileInfo.id}_${size.name}`;
      const ext = path.extname(fileInfo.fileName);
      const thumbFileName = `${thumbId}${ext}`;
      const thumbPath = path.join(this.uploadDir, 'thumbnails', thumbFileName);

      // إنشاء مجلد thumbnails
      const thumbDir = path.dirname(thumbPath);
      if (!fs.existsSync(thumbDir)) {
        fs.mkdirSync(thumbDir, { recursive: true });
      }

      // محاكاة إنشاء thumbnail
      // في الإنتاج: استخدم sharp لتغيير حجم الصورة
      fs.copyFileSync(fileInfo.path, thumbPath);

      thumbnails.push({
        id: thumbId,
        originalName: fileInfo.originalName,
        fileName: thumbFileName,
        mimeType: fileInfo.mimeType,
        size: fileInfo.size, // في الإنتاج: الحجم الفعلي للـ thumbnail
        path: thumbPath,
        url: `/uploads/thumbnails/${thumbFileName}`,
        createdAt: new Date(),
        metadata: {
          width: size.width,
          height: size.height,
          type: 'thumbnail',
        },
      });
    }

    return thumbnails;
  }

  /**
   * حذف ملف
   */
  async delete(fileInfo: FileInfo): Promise<boolean> {
    try {
      if (fs.existsSync(fileInfo.path)) {
        fs.unlinkSync(fileInfo.path);
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * الحصول على معلومات ملف
   */
  getFileInfo(fileName: string): FileInfo | null {
    const filePath = path.join(this.uploadDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const stats = fs.statSync(filePath);
    const ext = path.extname(fileName);
    const id = path.basename(fileName, ext);

    return {
      id,
      originalName: fileName,
      fileName,
      mimeType: this.getMimeType(ext),
      size: stats.size,
      path: filePath,
      url: `/uploads/${fileName}`,
      createdAt: stats.birthtime,
    };
  }

  /**
   * توليد معرف فريد للملف
   */
  private generateFileId(): string {
    return `file_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * الحصول على نوع MIME من الامتداد
   */
  private getMimeType(ext: string): string {
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
    };
    return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
  }
}

export const fileProcessor = new FileProcessor();
