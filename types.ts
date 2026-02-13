
export type Language = 'de' | 'en' | 'fr' | 'it' | 'tr';

export type Category = 'Vorspeise' | 'Salate' | 'Hauptgang' | 'Dessert' | 'Getränke' | 'Frühstück' | 'Alle';

export const DEFAULT_CATEGORIES: Category[] = [
  'Frühstück',
  'Vorspeise',
  'Salate',
  'Hauptgang',
  'Dessert',
  'Getränke'
];

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  available: boolean;
  image: string;
  translations?: Record<string, { name: string; description: string }>;
}

export interface GuestPermissions {
  readProfile: boolean;
  postToFeed: boolean;
  manageMedia: boolean;
}

export interface GuestUser {
  id: string;
  name: string;
  instagramHandle?: string;
  profilePicture?: string;
  isActivated: boolean;
  permissions: GuestPermissions;
  isVIP?: boolean;
}

export interface Reservation {
  id: string;
  name: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  vipToken: string;
  status: 'active' | 'checked-in' | 'cancelled';
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  isRead: boolean;
}

export type PostStatus = 'pending' | 'approved' | 'rejected';

export interface SocialPost {
  id: string;
  platform: 'instagram' | 'facebook' | 'tiktok' | 'whatsapp' | 'hafen_internal';
  content: string;
  date: string;
  image?: string;
  isGuestPost?: boolean;
  guestName?: string;
  guestHandle?: string;
  guestAvatar?: string;
  status?: PostStatus;
  likes?: number;
}
