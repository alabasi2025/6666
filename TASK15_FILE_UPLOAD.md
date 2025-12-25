# 📋 المهمة 15: إنشاء نظام رفع الملفات

## 🎯 الهدف
إنشاء نظام رفع ملفات متكامل يدعم أنواع متعددة من الملفات مع التحقق والضغط.

## 📁 الفرع
```
feature/task15-file-upload
```

## ⏱️ الوقت المتوقع
3-4 ساعات

---

## 📂 الملفات المطلوب إنشاؤها

```
server/uploads/
├── types.ts              # أنواع TypeScript
├── file-validator.ts     # التحقق من الملفات
├── file-processor.ts     # معالجة الملفات
├── storage-service.ts    # خدمة التخزين
├── upload-middleware.ts  # Middleware للرفع
└── index.ts              # ملف التصدير
```

## 🚫 الملفات الممنوع تعديلها
- `server/*Router.ts`
- `drizzle/schema.ts`
- `client/src/**/*`

---

## 📝 خطوات التنفيذ

### الخطوة 1: استنساخ المستودع والانتقال للفرع
```bash
gh repo clone alabasi2025/6666
cd 6666
git checkout feature/task15-file-upload
```

### الخطوة 2: إنشاء المجلد
```bash
mkdir -p server/uploads
```

### الخطوة 3: إنشاء ملف types.ts
```typescript
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
```

### الخطوة 4: إنشاء ملف file-validator.ts
```typescript
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
```

### الخطوة 5: إنشاء ملف file-processor.ts
```typescript
// server/uploads/file-processor.ts

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { FileInfo, ProcessedFile, ThumbnailSize } from './types';
import { fileValidator } from './file-validator';

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
    file: Express.Multer.File,
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
```

### الخطوة 6: إنشاء ملف storage-service.ts
```typescript
// server/uploads/storage-service.ts

import { FileInfo, ProcessedFile } from './types';
import { fileProcessor } from './file-processor';
import { fileValidator } from './file-validator';

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
    file: Express.Multer.File,
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
    
    for (const [id, file] of this.files.entries()) {
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
```

### الخطوة 7: إنشاء ملف upload-middleware.ts
```typescript
// server/uploads/upload-middleware.ts

import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { fileValidator } from './file-validator';
import { storageService } from './storage-service';

// إعداد multer
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: fileValidator.getConfig().maxFileSize,
  },
  fileFilter: (req, file, cb) => {
    const validation = fileValidator.validate(file as any);
    if (validation.valid) {
      cb(null, true);
    } else {
      cb(new Error(validation.errors.join(', ')));
    }
  },
});

/**
 * Middleware لرفع ملف واحد
 */
export const uploadSingle = (fieldName: string) => {
  return [
    upload.single(fieldName),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: 'لم يتم رفع أي ملف' });
        }

        const userId = (req as any).user?.id;
        const businessId = (req as any).user?.businessId;

        const processed = await storageService.upload(req.file, {
          userId,
          businessId,
        });

        (req as any).uploadedFile = processed;
        next();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'خطأ في رفع الملف';
        res.status(400).json({ error: message });
      }
    },
  ];
};

/**
 * Middleware لرفع ملفات متعددة
 */
export const uploadMultiple = (fieldName: string, maxCount: number) => {
  return [
    upload.array(fieldName, maxCount),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
          return res.status(400).json({ error: 'لم يتم رفع أي ملفات' });
        }

        const userId = (req as any).user?.id;
        const businessId = (req as any).user?.businessId;

        const processed = await Promise.all(
          files.map((file) =>
            storageService.upload(file, { userId, businessId })
          )
        );

        (req as any).uploadedFiles = processed;
        next();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'خطأ في رفع الملفات';
        res.status(400).json({ error: message });
      }
    },
  ];
};

/**
 * معالج أخطاء الرفع
 */
export function uploadErrorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'حجم الملف كبير جداً' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'عدد الملفات كبير جداً' });
    }
    return res.status(400).json({ error: error.message });
  }
  
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  
  next();
}
```

### الخطوة 8: إنشاء ملف index.ts
```typescript
// server/uploads/index.ts

export * from './types';
export * from './file-validator';
export * from './file-processor';
export * from './storage-service';
export * from './upload-middleware';

export { fileValidator } from './file-validator';
export { fileProcessor } from './file-processor';
export { storageService } from './storage-service';
```

### الخطوة 9: رفع التغييرات
```bash
git add server/uploads/
git commit -m "feat(uploads): إضافة نظام رفع ملفات متكامل

- إضافة التحقق من الملفات (الحجم، النوع، الاسم)
- إضافة معالجة الملفات وإنشاء thumbnails
- إضافة خدمة التخزين
- إضافة Middleware للرفع"

git push origin feature/task15-file-upload
```

---

## ✅ قائمة التحقق النهائية

- [ ] إنشاء مجلد `server/uploads/`
- [ ] إنشاء ملف `types.ts`
- [ ] إنشاء ملف `file-validator.ts`
- [ ] إنشاء ملف `file-processor.ts`
- [ ] إنشاء ملف `storage-service.ts`
- [ ] إنشاء ملف `upload-middleware.ts`
- [ ] إنشاء ملف `index.ts`
- [ ] التأكد من عدم وجود أخطاء TypeScript
- [ ] رفع التغييرات إلى الفرع
