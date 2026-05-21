import { describe, it, expect } from 'vitest';
import { MimeLabelPipe } from './mime-label.pipe';

describe('MimeLabelPipe', () => {
  const pipe = new MimeLabelPipe();

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return "Image" for image/jpeg', () => {
    expect(pipe.transform('image/jpeg')).toBe('Image');
  });

  it('should return "Image" for image/png', () => {
    expect(pipe.transform('image/png')).toBe('Image');
  });

  it('should return "Image" for image/webp', () => {
    expect(pipe.transform('image/webp')).toBe('Image');
  });

  it('should return "Video" for video/mp4', () => {
    expect(pipe.transform('video/mp4')).toBe('Video');
  });

  it('should return "Audio" for audio/mpeg', () => {
    expect(pipe.transform('audio/mpeg')).toBe('Audio');
  });

  it('should return "PDF" for application/pdf', () => {
    expect(pipe.transform('application/pdf')).toBe('PDF');
  });

  it('should return "Archive" for application/zip', () => {
    expect(pipe.transform('application/zip')).toBe('Archive');
  });

  it('should return "File" for unknown types', () => {
    expect(pipe.transform('application/x-unknown')).toBe('File');
  });

  it('should return "File" for null', () => {
    expect(pipe.transform(null)).toBe('File');
  });

  it('should return "File" for undefined', () => {
    expect(pipe.transform(undefined)).toBe('File');
  });
});
