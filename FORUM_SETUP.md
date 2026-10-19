# magic_gallery forum

Frontend: `forum.html`, `forum.css`, `forum.js`. Hosted with GitHub Pages. Supabase project: `xvisvzpxxmidkvvemltu` (Frankfurt). The browser contains only the publishable API key; it is safe for public use with the deployed row-level security policies.

## Remaining owner setup

1. In Supabase Authentication > URL Configuration, set Site URL to `https://neteru007.github.io` and allow `https://neteru007.github.io/forum.html` as a redirect URL.
2. Configure a custom SMTP service in Authentication > SMTP. Supabase's default sender only supports organization team addresses. Keep email confirmation enabled. Google sign-in is not configured yet.
3. Register and confirm the owner's email on the forum. Grant admin rights only to the verified owner's account, using its exact `auth.users.id`, by inserting it into `public.forum_admins` through the trusted dashboard or connector. Never expose admin/secret API keys. No user is automatically made admin.

## Access model

Anyone can read topics, replies and public nicknames. Authenticated, unbanned users can create a profile, start a topic and reply to open topics. Admins can delete topics/replies, close/reopen topics and manage timed or permanent posting bans. Banned users may still read. Admin membership cannot be changed from the client. Bans are checked in the database on each write, including with an existing session.

User content is rendered with `textContent`, not injected HTML. Topics and replies have length limits, pagination and database-enforced posting intervals (30s/topics, 10s/replies). The Supabase JS dependency is pinned to 2.57.4. Schema snapshot: `database/forum-schema.sql`, already applied to the hosted project; do not run blindly on an existing database.

## Validation

Database transaction tests verified ordinary profile/topic/reply creation, blocked admin self-promotion, admin ban/closure, and blocked posting eligibility after a ban. Test data was rolled back. Supabase security advisor reported no findings at initial setup. Full email delivery and owner moderation require the setup steps above.
