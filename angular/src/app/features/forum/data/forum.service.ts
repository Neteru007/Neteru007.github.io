import { Injectable } from '@angular/core';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../../core/auth/supabase-client';
import {
  Profile,
  Ban,
  Topic,
  Reply,
  Identity,
  Category,
  activeBan,
  topicPageSize,
  replyPageSize,
  memberPageSize,
} from './forum.models';
@Injectable({ providedIn: 'root' })
export class ForumService {
  async identity(user: User): Promise<Identity> {
    const [p, a, b] = await Promise.all([
      supabase.from('forum_profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('forum_admins').select('user_id').eq('user_id', user.id).maybeSingle(),
      supabase.from('forum_bans').select('*').eq('user_id', user.id).maybeSingle(),
    ]);
    if (p.error) throw p.error;
    if (a.error) throw a.error;
    if (b.error) throw b.error;
    let profile = p.data as Profile | null;
    const banned = activeBan(b.data);
    if (!profile && !banned) {
      const proposed = String(user.user_metadata['nickname'] || 'Учасник')
        .trim()
        .slice(0, 40);
      const result = await supabase
        .from('forum_profiles')
        .upsert(
          { id: user.id, nickname: proposed.length >= 2 ? proposed : 'Учасник' },
          { onConflict: 'id', ignoreDuplicates: true },
        );
      if (result.error) throw result.error;
      const fetched = await supabase.from('forum_profiles').select('*').eq('id', user.id).single();
      if (fetched.error) throw fetched.error;
      profile = fetched.data as Profile;
    }
    return { profile, admin: !!a.data, banned };
  }
  async topics(
    page: number,
    category: string,
    search: string,
    signal?: AbortSignal,
  ): Promise<Topic[]> {
    let q = supabase
      .from('forum_topics')
      .select('id,title,category,closed,created_at,forum_profiles(nickname)')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .range(page * topicPageSize, page * topicPageSize + topicPageSize - 1);
    if (category !== 'all') q = q.eq('category', category);
    const term = search.trim().replace(/[\%_]/g, '');
    if (term) q = q.ilike('title', '%' + term + '%');
    if (signal) q = q.abortSignal(signal);
    const { data, error } = await q;
    if (error) throw error;
    return data as unknown as Topic[];
  }
  async topic(id: string): Promise<Topic | null> {
    const { data, error } = await supabase
      .from('forum_topics')
      .select('*,forum_profiles(nickname)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as unknown as Topic | null;
  }
  async replies(id: string, page: number): Promise<Reply[]> {
    const { data, error } = await supabase
      .from('forum_replies')
      .select('id,body,created_at,author_id,forum_profiles(nickname)')
      .eq('topic_id', id)
      .order('created_at')
      .order('id')
      .range(page * replyPageSize, page * replyPageSize + replyPageSize - 1);
    if (error) throw error;
    return data as unknown as Reply[];
  }
  async createTopic(
    author_id: string,
    title: string,
    body: string,
    category: Category,
  ): Promise<string> {
    const { data, error } = await supabase
      .from('forum_topics')
      .insert({ author_id, title: title.trim(), body: body.trim(), category })
      .select('id')
      .single();
    if (error) throw error;
    return data.id;
  }
  async reply(topic_id: string, author_id: string, body: string) {
    const { error } = await supabase
      .from('forum_replies')
      .insert({ topic_id, author_id, body: body.trim() });
    if (error) throw error;
  }
  async deleteReply(id: string) {
    const { error } = await supabase.from('forum_replies').delete().eq('id', id);
    if (error) throw error;
  }
  async closeTopic(id: string, closed: boolean) {
    const { error } = await supabase.from('forum_topics').update({ closed }).eq('id', id);
    if (error) throw error;
  }
  async deleteTopic(id: string) {
    const { error } = await supabase.from('forum_topics').delete().eq('id', id);
    if (error) throw error;
  }
  async rename(id: string, nickname: string) {
    const { error } = await supabase
      .from('forum_profiles')
      .update({ nickname: nickname.trim() })
      .eq('id', id);
    if (error) throw error;
  }
  async members(page: number): Promise<{ profiles: Profile[]; bans: Ban[] }> {
    const [p, b] = await Promise.all([
      supabase
        .from('forum_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .order('id')
        .range(page * memberPageSize, page * memberPageSize + memberPageSize - 1),
      supabase.from('forum_bans').select('*'),
    ]);
    if (p.error) throw p.error;
    if (b.error) throw b.error;
    return { profiles: p.data, bans: b.data };
  }
  async ban(user_id: string, until_at: string, reason: string) {
    const { error } = await supabase
      .from('forum_bans')
      .upsert({ user_id, until_at, reason: reason.slice(0, 500) });
    if (error) throw error;
  }
  async unban(id: string) {
    const { error } = await supabase.from('forum_bans').delete().eq('user_id', id);
    if (error) throw error;
  }
}
