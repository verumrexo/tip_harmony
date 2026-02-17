import { describe, it, expect } from 'vitest';
import { buildUrl } from './routes';

describe('buildUrl', () => {
  it('should return the original path if no params are provided', () => {
    const path = '/api/calculations';
    expect(buildUrl(path)).toBe(path);
  });

  it('should replace a single parameter in the path', () => {
    const path = '/api/calculations/:id';
    const params = { id: 123 };
    expect(buildUrl(path, params)).toBe('/api/calculations/123');
  });

  it('should replace multiple parameters in the path', () => {
    const path = '/api/users/:userId/posts/:postId';
    const params = { userId: 1, postId: 42 };
    expect(buildUrl(path, params)).toBe('/api/users/1/posts/42');
  });

  it('should ignore parameters not present in the path', () => {
    const path = '/api/calculations/:id';
    const params = { id: 123, other: 'ignored' };
    expect(buildUrl(path, params)).toBe('/api/calculations/123');
  });

  it('should not modify the path if parameters are missing from the params object', () => {
    const path = '/api/users/:userId/posts/:postId';
    const params = { userId: 1 };
    expect(buildUrl(path, params)).toBe('/api/users/1/posts/:postId');
  });

  it('should handle numeric values correctly', () => {
    const path = '/api/items/:itemId';
    const params = { itemId: 0 };
    expect(buildUrl(path, params)).toBe('/api/items/0');
  });

  it('should handle string values with special characters', () => {
    const path = '/search/:query';
    const params = { query: 'hello-world' };
    expect(buildUrl(path, params)).toBe('/search/hello-world');
  });

  it('should replace only the first occurrence of a parameter in the path', () => {
    const path = '/api/:id/sub/:id';
    const params = { id: 123 };
    expect(buildUrl(path, params)).toBe('/api/123/sub/:id');
  });
});
