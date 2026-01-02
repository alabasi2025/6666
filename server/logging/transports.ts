// server/logging/transports.ts

import * as fs from 'fs';
import * as path from 'path';
import { LogEntry, Transport, FileTransportOptions } from './types';
import { Formatter, createFormatter } from './formatters';

export class ConsoleTransport implements Transport {
  private formatter: Formatter;

  constructor(format: 'json' | 'text' | 'pretty' = 'pretty') {
    this.formatter = createFormatter(format);
  }

  log(entry: LogEntry): void {
    const formatted = this.formatter.format(entry);
    
    if (entry.level === 'error' || entry.level === 'fatal') {
      console.error(formatted);
    } else if (entry.level === 'warn') {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  }
}

export class FileTransport implements Transport {
  private formatter: Formatter;
  private stream: fs.WriteStream | null = null;
  private options: FileTransportOptions;
  private currentSize = 0;

  constructor(options: FileTransportOptions) {
    this.options = {
      maxSize: 10 * 1024 * 1024, // 10MB default
      maxFiles: 5,
      compress: false,
      ...options,
    };
    this.formatter = createFormatter('json');
    this.initStream();
  }

  private initStream(): void {
    const dir = path.dirname(this.options.filename);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    this.stream = fs.createWriteStream(this.options.filename, { flags: 'a' });
    
    if (fs.existsSync(this.options.filename)) {
      this.currentSize = fs.statSync(this.options.filename).size;
    }
  }

  log(entry: LogEntry): void {
    if (!this.stream) return;

    const formatted = this.formatter.format(entry) + '\n';
    const bytes = Buffer.byteLength(formatted);

    if (this.currentSize + bytes > this.options.maxSize!) {
      this.rotate();
    }

    this.stream.write(formatted);
    this.currentSize += bytes;
  }

  private rotate(): void {
    if (!this.stream) return;

    this.stream.end();

    // Rotate files
    for (let i = this.options.maxFiles! - 1; i >= 1; i--) {
      const oldFile = `${this.options.filename}.${i}`;
      const newFile = `${this.options.filename}.${i + 1}`;
      if (fs.existsSync(oldFile)) {
        if (i === this.options.maxFiles! - 1) {
          fs.unlinkSync(oldFile);
        } else {
          fs.renameSync(oldFile, newFile);
        }
      }
    }

    if (fs.existsSync(this.options.filename)) {
      fs.renameSync(this.options.filename, `${this.options.filename}.1`);
    }

    this.initStream();
    this.currentSize = 0;
  }

  async flush(): Promise<void> {
    return new Promise((resolve) => {
      if (this.stream) {
        this.stream.once('drain', resolve);
      } else {
        resolve();
      }
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve) => {
      if (this.stream) {
        this.stream.end(resolve);
      } else {
        resolve();
      }
    });
  }
}

export class MemoryTransport implements Transport {
  private logs: LogEntry[] = [];
  private maxLogs: number;

  constructor(maxLogs = 1000) {
    this.maxLogs = maxLogs;
  }

  log(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
  }
}
