

export type Language = 'de' | 'en' | 'fr' | 'it' | 'tr';

export type Category = string;

export const DEFAULT_CATEGORIES: string[] = [
  'Vorspeise',
  'Hauptgang',
  'Dessert',
  'Getränke'
];

export interface Reservation {
  id: string;
  name: string;
  date: string;
  time: string;
  guests: number;
  phone?: string;
  notes?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  available: boolean;
  image?: string;
  // Cache translations to save API calls
  translations?: {
    [key in Language]?: {
      name: string;
      description: string;
    }
  };
}

export interface SocialPost {
  id: string;
  platform: 'instagram' | 'facebook' | 'tiktok';
  content: string;
  date: string;
  image?: string;
}

export interface AppState {
  menu: MenuItem[];
  posts: SocialPost[];
  userMode: 'customer' | 'staff';
  language: Language;
}