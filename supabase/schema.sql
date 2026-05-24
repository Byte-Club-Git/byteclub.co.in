create extension if not exists "pgcrypto";
create extension if not exists "citext";

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  email citext not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id text primary key,
  name text not null unique,
  teams_per_institution integer check (teams_per_institution is null or teams_per_institution > 0),
  min_participants integer not null check (min_participants > 0),
  max_participants integer not null check (max_participants >= min_participants),
  class_label text not null,
  class_min integer,
  class_max integer,
  mode text not null check (mode in ('Hybrid', 'Online', 'Offline')),
  created_at timestamptz not null default now()
);

create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  event_id text not null references public.events(id) on delete restrict,
  team_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.event_registrations(id) on delete cascade,
  name text not null,
  class_label text not null,
  class_number integer,
  contact text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_event_registrations_school on public.event_registrations(school_id);
create index if not exists idx_event_registrations_event on public.event_registrations(event_id);
create index if not exists idx_participants_registration on public.participants(registration_id);

insert into public.events
  (id, name, teams_per_institution, min_participants, max_participants, class_label, class_min, class_max, mode)
values
  ('make-it', 'Make.IT', 1, 2, 4, 'IX-XII', 9, 12, 'Hybrid'),
  ('build-it', 'Build.IT', null, 2, 4, 'Open', null, null, 'Online'),
  ('design-it', 'Design.IT', 1, 2, 2, 'IV-V', 4, 5, 'Offline'),
  ('think-it', 'Think.IT', 1, 2, 4, 'IX-XII', 9, 12, 'Hybrid'),
  ('quiz-it', 'Quiz.IT', 1, 2, 2, 'IX-XII', 9, 12, 'Hybrid'),
  ('code-it', 'Code.IT', 1, 2, 2, 'IX-XII', 9, 12, 'Hybrid'),
  ('snap-it', 'Snap.IT', 2, 2, 2, 'VI-XII', 6, 12, 'Hybrid'),
  ('frag-it', 'Frag.IT', 1, 6, 6, 'IX-XII', 9, 12, 'Online'),
  ('surprise-it', 'Surprise.IT', 1, 2, 2, 'IX-XII', 9, 12, 'Hybrid'),
  ('film-it', 'Film.IT', 1, 2, 4, 'IX-XII', 9, 12, 'Online'),
  ('crypt-it', 'Crypt.IT', null, 1, 3, 'Open', null, null, 'Online')
on conflict (id) do update set
  name = excluded.name,
  teams_per_institution = excluded.teams_per_institution,
  min_participants = excluded.min_participants,
  max_participants = excluded.max_participants,
  class_label = excluded.class_label,
  class_min = excluded.class_min,
  class_max = excluded.class_max,
  mode = excluded.mode;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_schools_updated_at on public.schools;
create trigger trg_schools_updated_at
before update on public.schools
for each row execute function public.set_updated_at();

drop trigger if exists trg_event_registrations_updated_at on public.event_registrations;
create trigger trg_event_registrations_updated_at
before update on public.event_registrations
for each row execute function public.set_updated_at();

create or replace function public.class_label_to_number(label text)
returns integer
language sql
immutable
as $$
  select case upper(trim(label))
    when 'IV' then 4
    when 'V' then 5
    when 'VI' then 6
    when 'VII' then 7
    when 'VIII' then 8
    when 'IX' then 9
    when 'X' then 10
    when 'XI' then 11
    when 'XII' then 12
    else nullif(regexp_replace(label, '[^0-9]', '', 'g'), '')::integer
  end;
$$;

create or replace function public.enforce_team_limit()
returns trigger
language plpgsql
as $$
declare
  team_limit integer;
  current_count integer;
begin
  select teams_per_institution
  into team_limit
  from public.events
  where id = new.event_id;

  if team_limit is null then
    return new;
  end if;

  select count(*)
  into current_count
  from public.event_registrations
  where school_id = new.school_id
    and event_id = new.event_id
    and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid);

  if current_count >= team_limit then
    raise exception 'Team limit reached for this event';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_team_limit on public.event_registrations;
create trigger trg_enforce_team_limit
before insert or update of school_id, event_id on public.event_registrations
for each row execute function public.enforce_team_limit();

create or replace function public.validate_participant_class()
returns trigger
language plpgsql
as $$
declare
  event_record public.events%rowtype;
begin
  new.class_number := public.class_label_to_number(new.class_label);

  select e.*
  into event_record
  from public.events e
  join public.event_registrations r on r.event_id = e.id
  where r.id = new.registration_id;

  if event_record.id is null then
    raise exception 'Registration not found';
  end if;

  if event_record.class_min is not null and (
    new.class_number is null or
    new.class_number < event_record.class_min or
    new.class_number > event_record.class_max
  ) then
    raise exception 'Participant class is not eligible for %', event_record.name;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_validate_participant_class on public.participants;
create trigger trg_validate_participant_class
before insert or update of class_label, registration_id on public.participants
for each row execute function public.validate_participant_class();

create or replace function public.validate_participant_count()
returns trigger
language plpgsql
as $$
declare
  registration_id_to_check uuid;
  count_now integer;
  min_now integer;
  max_now integer;
  event_name text;
begin
  registration_id_to_check := coalesce(new.registration_id, old.registration_id);

  select count(p.id), e.min_participants, e.max_participants, e.name
  into count_now, min_now, max_now, event_name
  from public.event_registrations r
  join public.events e on e.id = r.event_id
  left join public.participants p on p.registration_id = r.id
  where r.id = registration_id_to_check
  group by e.min_participants, e.max_participants, e.name;

  if count_now < min_now or count_now > max_now then
    raise exception '% requires between % and % participants', event_name, min_now, max_now;
  end if;

  return null;
end;
$$;

drop trigger if exists trg_validate_participant_count_insert on public.participants;
create constraint trigger trg_validate_participant_count_insert
after insert or update or delete on public.participants
deferrable initially deferred
for each row execute function public.validate_participant_count();

create or replace function public.save_event_registration(
  p_registration_id uuid,
  p_school_id uuid,
  p_event_id text,
  p_team_name text,
  p_participants jsonb
)
returns uuid
language plpgsql
security invoker
as $$
declare
  registration_id_to_save uuid;
  participant_count integer;
  event_record public.events%rowtype;
begin
  if not exists (
    select 1 from public.schools
    where id = p_school_id
      and user_id = auth.uid()
  ) then
    raise exception 'School account not found';
  end if;

  select *
  into event_record
  from public.events
  where id = p_event_id;

  if event_record.id is null then
    raise exception 'Event not found';
  end if;

  participant_count := jsonb_array_length(p_participants);
  if participant_count < event_record.min_participants or participant_count > event_record.max_participants then
    raise exception '% requires between % and % participants', event_record.name, event_record.min_participants, event_record.max_participants;
  end if;

  if p_registration_id is null then
    insert into public.event_registrations (school_id, event_id, team_name)
    values (p_school_id, p_event_id, p_team_name)
    returning id into registration_id_to_save;
  else
    update public.event_registrations
    set team_name = p_team_name,
        updated_at = now()
    where id = p_registration_id
      and school_id = p_school_id
    returning id into registration_id_to_save;

    if registration_id_to_save is null then
      raise exception 'Registration not found';
    end if;

    delete from public.participants
    where registration_id = registration_id_to_save;
  end if;

  insert into public.participants (registration_id, name, class_label, contact)
  select
    registration_id_to_save,
    trim(value->>'name'),
    trim(value->>'class_label'),
    trim(value->>'contact')
  from jsonb_array_elements(p_participants)
  where trim(coalesce(value->>'name', '')) <> '';

  return registration_id_to_save;
end;
$$;

alter table public.schools enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
alter table public.participants enable row level security;

drop policy if exists "Schools can read their own profile" on public.schools;
create policy "Schools can read their own profile"
on public.schools for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Schools can create their own profile" on public.schools;
create policy "Schools can create their own profile"
on public.schools for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Schools can update their own profile" on public.schools;
create policy "Schools can update their own profile"
on public.schools for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Authenticated schools can read events" on public.events;
create policy "Authenticated schools can read events"
on public.events for select
to authenticated
using (true);

drop policy if exists "Schools manage own event registrations" on public.event_registrations;
create policy "Schools manage own event registrations"
on public.event_registrations for all
to authenticated
using (
  exists (
    select 1 from public.schools s
    where s.id = event_registrations.school_id
      and s.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.schools s
    where s.id = event_registrations.school_id
      and s.user_id = auth.uid()
  )
);

drop policy if exists "Schools manage participants for own registrations" on public.participants;
create policy "Schools manage participants for own registrations"
on public.participants for all
to authenticated
using (
  exists (
    select 1
    from public.event_registrations r
    join public.schools s on s.id = r.school_id
    where r.id = participants.registration_id
      and s.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.event_registrations r
    join public.schools s on s.id = r.school_id
    where r.id = participants.registration_id
      and s.user_id = auth.uid()
  )
);
