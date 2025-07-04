create type plan_enum as enum ('free', 'basic', 'pro');

create table organisations (
  id text primary key,
  name text not null,
  description text,
  link text,
  plan plan_enum not null default 'free'::plan_enum,
  owner_id uuid not null references users(id) on update cascade on delete cascade,
  created_at timestamptz not null default now()
);

create table organisations_users (
  organisation_id text not null references organisations (id) on delete cascade on update cascade,
  user_id uuid not null references users (id) on delete cascade on update cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, organisation_id)
);

create index idx_organisation_id on organisations_users (organisation_id);

create index idx_user_id on organisations_users (user_id);

alter table public.organisations enable row level security;

alter table public.organisations_users enable row level security;

create or replace function owner_part_of_org_trigger()
returns trigger
as $$
begin
  insert into organisations_users (organisation_id, user_id) values (new.id, new.owner_id);
  return new;
end $$ language plpgsql security definer;

create trigger after_organisation_insert
after insert on organisations for each row
execute function owner_part_of_org_trigger();

create policy "Org members can select their org"
on organisations
for select
to authenticated
using (
  exists(select 1 from organisations_users as ou
  where (ou.user_id = (select auth.uid()))
  and ou.organisation_id = organisations.id)
);

create policy "Everyone can select"
on organisations_users
for select
to authenticated
using (true);

create function check_if_org_exists(id text)
returns boolean
as $$
begin
  return exists(select 1 from organisations o where o.id = $1);
end $$ language plpgsql security definer;
