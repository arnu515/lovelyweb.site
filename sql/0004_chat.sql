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
alter table group_messages enable row level security;

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

create policy "Participants can delete their messages"
on messages
for delete
to authenticated
using (
  from_id = (select auth.uid()) or
  to_id = (select auth.uid())
);

create policy "Group message sender can delete"
on group_messages
for delete
to authenticated
using (
  by_id = (select auth.uid())
);

create function get_chat_overview(org_id text)
returns table (
  is_group boolean,
  id text,
  name text,
  avatar_url text,
  unread_count int4,
  typ msg_type,
  data jsonb,
  msg_created_at timestamptz,
  msg_edited_at timestamptz,
  msg_read_at timestamptz,
  sender_id uuid,
  sender_name text,
  sender_avatar_url text
) as $$
  -- TODO: online and typing
  select * from (
    (select false, u.id::text, u.name, u.avatar_url, 0, -- temp
      m.typ, m.data, m.created_at, m.edited_at,
      null::timestamptz, -- temp
      null::uuid as sender_id,
      null::text as sender_name,
      null::text as sender_avatar_url
    from users u
    inner join organisations_users o
      on o.user_id = u.id and o.organisation_id = $1
    inner join lateral (
      select m.typ, m.data, m.created_at, m.edited_at
      from messages m
      where m.org_id = $1 and (
        m.from_id = u.id and m.to_id = (select auth.uid()) or
        m.to_id = u.id and m.from_id = (select auth.uid()))
      order by m.created_at desc
      limit 1
    ) as m on true)
  union all
    (select true, g.id, g.name, g.avatar_type::text, 0, -- temp
      m.typ, m.data, m.created_at, m.edited_at,
      null::timestamptz, -- temp
      u.id as sender_id,
      u.name as sender_name,
      u.avatar_url as sender_avatar_url
    from chat_groups g
    left join lateral (
      select m.typ, m.data, m.created_at, m.edited_at, m.by_id
      from group_messages m
      where m.org_id = $1 and m.group_id = g.id
      order by m.created_at desc
      limit 1
    ) as m on true
    left join users u on u.id = m.by_id
    )
  ) as a order by a.created_at desc
$$ language sql security invoker;
