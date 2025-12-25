// server/uploads/upload-middleware.ts

import { Request, Response, NextFunction } from 'express';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const multer = require('multer');
import { fileValidator } from './file-validator';
import { storageService } from './storage-service';


// تعريف نوع الملف
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

// إعداد multer
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: fileValidator.getConfig().maxFileSize,
  },
  fileFilter: (_req: Request, file: MulterFile, cb: (error: Error | null, acceptFile: boolean) => void) => {
    const validation = fileValidator.validate(file);
    if (validation.valid) {
      cb(null, true);
    } else {
      cb(new Error(validation.errors.join(', ')), false);
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
        const file = (req as Request & { file?: MulterFile }).file;
        if (!file) {
          return res.status(400).json({ error: 'لم يتم رفع أي ملف' });
        }

        const userId = (req as any).user?.id;
        const businessId = (req as any).user?.businessId;

        const processed = await storageService.upload(file, {
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
        const files = (req as Request & { files?: MulterFile[] }).files;
        if (!files || files.length === 0) {
          return res.status(400).json({ error: 'لم يتم رفع أي ملفات' });
        }

        const userId = (req as any).user?.id;
        const businessId = (req as any).user?.businessId;

        const processed = await Promise.all(
          files.map((file: MulterFile) =>
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
  _req: Request,
  res: Response,
  next: NextFunction
) {
  if ((error as any).code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'حجم الملف كبير جداً' });
  }
  if ((error as any).code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ error: 'عدد الملفات كبير جداً' });
  }
  
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  
  next();
}
