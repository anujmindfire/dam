import { describe, it, expect } from 'vitest';
import { RelativeTimePipe } from './relative-time.pipe';

describe('RelativeTimePipe', () => {
  const pipe = new RelativeTimePipe();

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return "—" for null', () => {
    expect(pipe.transform(null)).toBe('—');
  });

  it('should return "—" for undefined', () => {
    expect(pipe.transform(undefined)).toBe('—');
  });

  it('should return "just now" for current time', () => {
    expect(pipe.transform(new Date())).toBe('just now');
  });

  it('should return "Xm ago" for minutes-old timestamps', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(pipe.transform(fiveMinutesAgo)).toBe('5m ago');
  });

  it('should return "Xh ago" for hours-old timestamps', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(pipe.transform(threeHoursAgo)).toBe('3h ago');
  });

  it('should return "X days ago" for day-old timestamps', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    expect(pipe.transform(twoDaysAgo)).toBe('2 days ago');
  });

  it('should use singular "1 day ago"', () => {
    const oneDayAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);
    expect(pipe.transform(oneDayAgo)).toBe('1 day ago');
  });

  it('should return formatted date for items older than 7 days', () => {
    const oldDate = new Date('2020-01-15');
    expect(pipe.transform(oldDate)).toContain('2020');
  });

  it('should accept ISO string input', () => {
    const iso = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    expect(pipe.transform(iso)).toBe('10m ago');
  });
});
