import { afterEach, describe, expect, it, vi } from 'vitest';
import { getApiBaseUrl } from '../utils/api';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getApiBaseUrl', () => {
  it('uses the configured API URL when provided', () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3001');

    expect(getApiBaseUrl()).toBe('http://localhost:3001');
  });

  it('falls back to the local backend port when no API URL is configured', () => {
    expect(getApiBaseUrl()).toBe('http://localhost:3001');
  });
});
