create type group_avatar_type as enum ('webp', 'svg');

create table chat_groups (
  id text primary key,
  name text not null,
  description text,
  avatar_type group_avatar_type,
  org_id text not null references organisations(id) on update cascade on delete cascade,
  owner_id uuid not null references users(id) on update cascade on delete cascade,
  created_at timestamptz not null default now()
);

create table chat_group_members (
  user_id uuid not null references users(id) on update cascade on delete cascade,
  group_id text not null references chat_groups(id) on update cascade on delete cascade,
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

create policy "Group owner can add members"
on chat_group_members
for insert
to authenticated
with check (
  exists(select 1 from chat_groups g where
    g.owner_id = (select auth.uid()) and
    g.id = chat_group_members.group_id and
    g.org_id = (select organisation_id
      from organisations_users o
      where o.user_id = chat_group_members.user_id)
  )
);

create policy "Group owner can remove member and member can remove themself"
on chat_group_members
for delete
to authenticated
using (
  (select auth.uid()) = user_id or
  (select auth.uid()) = (select owner_id from chat_groups where id = group_id)
);

