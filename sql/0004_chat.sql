create type msg_type as enum ('text', 'attachment', 'voice');

create table messages (
  id text primary key,
  from_id uuid not null references users(id),
  to_id uuid not null references users(id),
  org_id text not null references organisations(id),
  typ msg_type not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  edited_at timestamptz
);

create index idx_messages_from_to_in_org on messages (from_id, to_id, org_id);

create table group_messages (
  id text primary key,
  group_id text not null references chat_groups(id),
  by_id uuid not null references users(id),
  org_id text not null references organisations(id),
  typ msg_type not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  edited_at timestamptz
);

create index idx_group_messages on group_messages (group_id, org_id);

alter table messages enable row level security;

create policy "Participants can see their messages"
on messages
for select
to authenticated
using (
  from_id = (select auth.uid()) or
  to_id = (select auth.uid())
);

create policy "Group members can see messages"
on group_messages
for select
to authenticated
using (
  (select private.is_user_part_of_group(group_id, (select auth.uid())))
);
