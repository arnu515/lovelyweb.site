create table chat_groups (
  id text primary key,
  name text not null,
  description text,
  avatar_url text,
  org_id text not null references organisations(id),
  owner_id uuid not null references users(id)
);

create table chat_group_members (
  user_id uuid not null references users(id),
  group_id text not null references chat_groups(id),
  created_at timestamptz not null default now(),
  primary key (user_id, group_id)
);

create index idx_cgmem_group_id on chat_group_members (group_id);
create index idx_cgmem_user_id on chat_group_members (user_id);

create or replace function owner_part_of_group_trigger()
returns trigger
as $$
begin
  insert into chat_group_members (group_id, user_id) values (new.id, new.owner_id);
  return new;
end $$ language plpgsql security definer;

create trigger after_group_insert
after insert on chat_groups for each row
execute function owner_part_of_group_trigger();

create or replace function private.is_user_part_of_group(gid text, uid uuid)
returns boolean
as $$
begin
  return exists(
    select 1 from chat_group_members
    where group_id = gid and user_id = uid
  );
end $$ language plpgsql security definer;

alter table chat_groups enable row level security;
alter table chat_group_members enable row level security;

create policy "Members can see groups"
on chat_groups
for select
to authenticated
using (
  (owner_id = (select auth.uid())) or
  (select private.is_user_part_of_group(id, (select auth.uid())))
);

create policy "Org members can create groups"
on chat_groups
for insert
to authenticated
with check (
  owner_id = (select auth.uid()) and
  exists(select 1 from organisations_users where
    organisation_id = org_id and user_id = owner_id)
);

create policy "Members can see other members"
on chat_group_members
for select
to authenticated
using (
  (select private.is_user_part_of_group(group_id, (select auth.uid())))
);
