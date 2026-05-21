import { describe, it, expect } from 'vitest';
import { FileSizePipe } from './file-size.pipe';

describe('FileSizePipe', () => {
  const pipe = new FileSizePipe();

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return "—" for null', () => {
    expect(pipe.transform(null)).toBe('—');
  });

  it('should return "—" for undefined', () => {
    expect(pipe.transform(undefined)).toBe('—');
  });

  it('should return "0 B" for zero bytes', () => {
    expect(pipe.transform(0)).toBe('0 B');
  });

  it('should format bytes correctly', () => {
    expect(pipe.transform(512)).toBe('512 B');
  });

  it('should format kilobytes correctly', () => {
    expect(pipe.transform(1024)).toBe('1.0 KB');
    expect(pipe.transform(1536)).toBe('1.5 KB');
  });

  it('should format megabytes correctly', () => {
    expect(pipe.transform(1_048_576)).toBe('1.0 MB');
    expect(pipe.transform(5_242_880)).toBe('5.0 MB');
  });

  it('should format gigabytes correctly', () => {
    expect(pipe.transform(1_073_741_824)).toBe('1.00 GB');
    expect(pipe.transform(2_147_483_648)).toBe('2.00 GB');
  });
});
