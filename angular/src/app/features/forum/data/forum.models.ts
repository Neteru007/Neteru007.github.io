export const categories = {
  general: 'Знайомство та спілкування',
  practice: 'Практики й досвід',
  symbols: 'Символи й Таро',
  books: 'Книги та джерела',
} as const;
export type Category = keyof typeof categories;
export interface Profile {
  id: string;
  nickname: string;
  created_at: string;
}
export interface Ban {
  user_id: string;
  until_at: string;
  reason: string;
}
export interface Topic {
  id: string;
  title: string;
  body: string;
  category: Category;
  closed: boolean;
  created_at: string;
  author_id: string;
  forum_profiles: { nickname: string } | null;
}
export interface Reply {
  id: string;
  body: string;
  created_at: string;
  author_id: string;
  forum_profiles: { nickname: string } | null;
}
export interface Identity {
  profile: Profile | null;
  admin: boolean;
  banned: boolean;
}
export function activeBan(ban: Ban | undefined | null, now = Date.now()): boolean {
  return !!ban && (ban.until_at === 'infinity' || new Date(ban.until_at).getTime() > now);
}
export const topicPageSize = 20;
export const replyPageSize = 30;
export const memberPageSize = 30;
