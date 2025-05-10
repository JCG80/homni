
export type ContentType = 'article' | 'news' | 'guide';

export interface Content {
  id: string;
  title: string;
  slug: string;
  body: string | null;
  type: ContentType;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface ContentFormValues {
  title: string;
  slug: string;
  body: string;
  type: ContentType;
  published: boolean;
  published_at: string | null;
}
