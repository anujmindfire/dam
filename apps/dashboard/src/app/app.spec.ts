// app.spec.ts — intentionally minimal
// The main application bootstrapping is tested via integration/e2e tests.
// Unit tests for specific services, pipes, guards and components are in their
// respective *.spec.ts files.
import { describe, it, expect } from 'vitest';

describe('DAM Application', () => {
  it('should have a test environment set up', () => {
    expect(true).toBe(true);
  });
});
