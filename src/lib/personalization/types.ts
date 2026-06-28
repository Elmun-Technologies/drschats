export interface ViewEvent {
  slug: string;
  categorySlug: string;
  price: number;
  ts: number;
}

export interface UserProfile {
  v: 1;
  views: ViewEvent[];
  purchases: string[];
  lastSeen: number;
}
