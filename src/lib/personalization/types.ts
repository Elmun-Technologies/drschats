export interface ViewEvent {
  slug: string;
  categorySlug: string;
  price: number;
  ts: number;
}

export interface PurchaseEvent {
  slug: string;
  /** Copied from the cart line so a reorder reminder can name the product. */
  name?: string;
  ts: number;
}

export interface UserProfile {
  v: 1;
  views: ViewEvent[];
  purchases: string[];
  /**
   * The same purchases with their dates.
   *
   * Optional because profiles written before reorder reminders existed have
   * only the slug list, and dropping those visitors' history to gain a field
   * would be a poor trade. Absent history simply produces no reminder.
   */
  purchaseEvents?: PurchaseEvent[];
  lastSeen: number;
}
