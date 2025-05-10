
import { Content, ContentType } from '../types/content-types';

const isValidContentType = (type: any): type is ContentType => {
  return ['article', 'news', 'guide'].includes(type);
};

/**
 * Parse and validate content data from the database
 */
export function parseContent(data: any): Content {
  if (!data) {
    throw new Error('Cannot parse null or undefined content');
  }

  return {
    id: data.id || '',
    title: data.title || '',
    slug: data.slug || '',
    body: data.body || null,
    type: isValidContentType(data.type) ? data.type : 'article',
    published: !!data.published,
    published_at: data.published_at || null,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
    created_by: data.created_by || '',
  };
}
