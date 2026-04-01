import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileUploadService {
  private readonly uploadDir = './uploads/products';

  constructor() {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  getFilePath(filename: string): string {
    return path.join(this.uploadDir, filename);
  }

  getFileUrl(filename: string): string {
    const baseUrl = process.env.API_URL || 'http://64.112.127.107:3000';
    return `${baseUrl}/uploads/products/${filename}`;
  }
}
