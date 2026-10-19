create schema if not exists forum_private;
revoke all on schema forum_private from public;
grant usage on schema forum_private to anon, authenticated;
create table public.forum_admins(user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.forum_admins enable row level security;
revoke all on public.forum_admins from anon,authenticated;
grant select on public.forum_admins to authenticated;
create policy admin_self_read on public.forum_admins for select to authenticated using(user_id=(select auth.uid()));
create function forum_private.is_admin() returns boolean language sql stable security definer set search_path='' as $$
select auth.uid() is not null and exists(select 1 from public.forum_admins where user_id=auth.uid())
$$;
revoke all on function forum_private.is_admin() from public;
grant execute on function forum_private.is_admin() to anon,authenticated;
create table public.forum_profiles(id uuid primary key references auth.users(id) on delete cascade, nickname text not null check(length(trim(nickname)) between 2 and 40),created_at timestamptz not null default now());
create table public.forum_bans(user_id uuid primary key references public.forum_profiles(id) on delete cascade,until_at timestamptz not null default 'infinity',reason text not null default '' check(length(reason)<=500));
create function forum_private.can_post() returns boolean language sql stable security definer set search_path='' as $$
select auth.uid() is not null and not exists(select 1 from public.forum_bans where user_id=auth.uid() and until_at>now())
$$;
revoke all on function forum_private.can_post() from public;
grant execute on function forum_private.can_post() to authenticated;
create table public.forum_topics(id uuid primary key default gen_random_uuid(),author_id uuid not null references public.forum_profiles(id),title text not null check(length(trim(title)) between 3 and 160),body text not null check(length(trim(body)) between 3 and 12000),category text not null check(category in ('general','practice','symbols','books')),closed boolean not null default false,created_at timestamptz not null default now());
create table public.forum_replies(id uuid primary key default gen_random_uuid(),topic_id uuid not null references public.forum_topics(id) on delete cascade,author_id uuid not null references public.forum_profiles(id),body text not null check(length(trim(body)) between 1 and 8000),created_at timestamptz not null default now());
create index forum_topics_created_idx on public.forum_topics(created_at desc);
create index forum_topics_author_idx on public.forum_topics(author_id);
create index forum_topics_category_idx on public.forum_topics(category,created_at desc);
create index forum_replies_topic_idx on public.forum_replies(topic_id,created_at);
create index forum_replies_author_idx on public.forum_replies(author_id);
alter table public.forum_profiles enable row level security;
alter table public.forum_bans enable row level security;
alter table public.forum_topics enable row level security;
alter table public.forum_replies enable row level security;
revoke all on public.forum_profiles,public.forum_bans,public.forum_topics,public.forum_replies from anon,authenticated;
grant select on public.forum_profiles,public.forum_topics,public.forum_replies to anon,authenticated;
grant insert(id,nickname),update(nickname) on public.forum_profiles to authenticated;
grant select,insert,update,delete on public.forum_bans to authenticated;
grant insert(author_id,title,body,category),update(closed),delete on public.forum_topics to authenticated;
grant insert(topic_id,author_id,body),delete on public.forum_replies to authenticated;
create policy profiles_read on public.forum_profiles for select to anon,authenticated using(true);
create policy profiles_create on public.forum_profiles for insert to authenticated with check(id=(select auth.uid()) and (select forum_private.can_post()));
create policy profiles_edit on public.forum_profiles for update to authenticated using(id=(select auth.uid()) and (select forum_private.can_post())) with check(id=(select auth.uid()) and (select forum_private.can_post()));
create policy bans_read on public.forum_bans for select to authenticated using(user_id=(select auth.uid()) or (select forum_private.is_admin()));
create policy bans_insert on public.forum_bans for insert to authenticated with check((select forum_private.is_admin()) and user_id<>(select auth.uid()));
create policy bans_update on public.forum_bans for update to authenticated using((select forum_private.is_admin()) and user_id<>(select auth.uid())) with check((select forum_private.is_admin()) and user_id<>(select auth.uid()));
create policy bans_delete on public.forum_bans for delete to authenticated using((select forum_private.is_admin()));
create policy topics_read on public.forum_topics for select to anon,authenticated using(true);
create policy topics_insert on public.forum_topics for insert to authenticated with check(author_id=(select auth.uid()) and not closed and (select forum_private.can_post()));
create policy topics_close on public.forum_topics for update to authenticated using((select forum_private.is_admin())) with check((select forum_private.is_admin()));
create policy topics_delete on public.forum_topics for delete to authenticated using((select forum_private.is_admin()));
create policy replies_read on public.forum_replies for select to anon,authenticated using(true);
create policy replies_insert on public.forum_replies for insert to authenticated with check(author_id=(select auth.uid()) and (select forum_private.can_post()) and exists(select 1 from public.forum_topics t where t.id=topic_id and not t.closed));
create policy replies_delete on public.forum_replies for delete to authenticated using((select forum_private.is_admin()));
create function forum_private.post_guard() returns trigger language plpgsql security invoker set search_path='' as $$
begin
perform pg_advisory_xact_lock(hashtext(auth.uid()::text));
if TG_TABLE_NAME='forum_topics' then
if exists(select 1 from public.forum_topics where author_id=auth.uid() and created_at>now()-interval '30 seconds') then raise exception 'Зачекайте 30 секунд між новими темами'; end if;
else
if not exists(select 1 from public.forum_topics where id=new.topic_id and not closed) then raise exception 'Тему закрито'; end if;
if exists(select 1 from public.forum_replies where author_id=auth.uid() and created_at>now()-interval '10 seconds') then raise exception 'Зачекайте 10 секунд між відповідями'; end if;
end if;
return new;
end;$$;
revoke all on function forum_private.post_guard() from public;
create trigger topic_guard before insert on public.forum_topics for each row execute function forum_private.post_guard();
create trigger reply_guard before insert on public.forum_replies for each row execute function forum_private.post_guard();