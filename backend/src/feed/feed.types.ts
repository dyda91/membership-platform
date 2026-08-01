export interface FeedMedia {
  id: string;
  type: 'IMAGE' | 'VIDEO';
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  duration: number | null;
  position: number;
  locked: boolean;
  url?: string;
}

export interface FeedAuthor {
  id: string;
  name: string | null;
}

export interface FeedTier {
  id: string;
  name: string;
  priority: number;
}

export interface FeedPost {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: FeedAuthor;
  requiredTier: FeedTier | null;
  mediaAccess: boolean;
  media: FeedMedia[];
}

export interface FeedResponse {
  items: FeedPost[];
  page: number;
  limit: number;
  total: number;
}
