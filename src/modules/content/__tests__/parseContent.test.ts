
import { describe, it, expect } from 'vitest';
import { parseContent } from '../utils/parseContent';
import { Content } from '../types/content-types';

describe('parseContent', () => {
  it('should correctly parse valid content data', () => {
    const mockData = {
      id: '123',
      title: 'Test Article',
      slug: 'test-article',
      body: 'This is test content',
      type: 'article',
      published: true,
      published_at: '2023-01-01T00:00:00Z',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      created_by: 'user123',
    };

    const result = parseContent(mockData);
    expect(result).toEqual(mockData);
  });

  it('should provide default values for missing fields', () => {
    const mockData = {
      id: '123',
      title: 'Test Article',
      slug: 'test-article',
    };

    const result = parseContent(mockData);
    
    expect(result.id).toBe('123');
    expect(result.title).toBe('Test Article');
    expect(result.slug).toBe('test-article');
    expect(result.body).toBe(null);
    expect(result.type).toBe('article');
    expect(result.published).toBe(false);
    expect(result.published_at).toBe(null);
    expect(result.created_at).toBeTruthy();
    expect(result.updated_at).toBeTruthy();
    expect(result.created_by).toBe('');
  });

  it('should default to article type for invalid types', () => {
    const mockData = {
      id: '123',
      title: 'Test Article',
      slug: 'test-article',
      type: 'invalid-type',
    };

    const result = parseContent(mockData);
    expect(result.type).toBe('article');
  });

  it('should throw an error for null data', () => {
    expect(() => parseContent(null)).toThrow('Cannot parse null or undefined content');
  });
});
