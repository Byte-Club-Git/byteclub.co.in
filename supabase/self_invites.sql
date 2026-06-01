create table if not exists public.self_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null default 'self-invite',
  created_at timestamptz not null default now(),
  constraint self_invites_email_format check (
    email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  )
);

create unique index if not exists self_invites_email_key
  on public.self_invites (lower(email));

alter table public.self_invites enable row level security;

drop policy if exists "Allow public self invite inserts" on public.self_invites;
create policy "Allow public self invite inserts"
  on public.self_invites
  for insert
  to anon
  with check (
    email is not null
    and source = 'self-invite'
  );

drop policy if exists "Block public self invite reads" on public.self_invites;
create policy "Block public self invite reads"
  on public.self_invites
  for select
  to anon
  using (false);
