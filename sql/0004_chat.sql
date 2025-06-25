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

create function get_chat_overview(org_id text)
returns table (
  is_group boolean,
  id text,
  name text,
  slug text,
  avatar_url text,
  unread_count int4,
  typ msg_type,
  data jsonb,
  msg_created_at timestamptz,
  msg_edited_at timestamptz,
  msg_read_at timestamptz
) as $$
  -- TODO: online and typing
  select * from (
    (select false, u.id::text, u.name,
      concat('@', u.username), u.avatar_url, 0, -- temp
      m.typ, m.data, m.created_at, m.edited_at,
      null::timestamptz -- temp
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
    (select true, g.id, g.name, concat('-', g.id),
      g.avatar_type::text, 0, -- temp
      m.typ, m.data, m.created_at, m.edited_at,
      null::timestamptz -- temp
    from chat_groups g
    left join lateral (
      select m.typ, m.data, m.created_at, m.edited_at
      from group_messages m
      where m.org_id = $1 and m.group_id = g.id
      order by m.created_at desc
      limit 1
    ) as m on true)
  ) as a order by a.created_at desc
$$ language sql security invoker;

create function get_messages(slug text)
returns table (
  id text,
  from_id text,
  to_id text,
  org_id text,
  typ msg_type,
  data jsonb,
  created_at timestamptz,
  edited_at timestamptz
) as $$
declare
  uid uuid;
  xid uuid := null::uuid;
  prefix text := substring(slug, 1, 1);
begin
  uid := (select auth.uid());
  if prefix = '@' then
    xid := (select users.id from users where username = substring(slug, 2));
    if xid is not null then
      return query (
        select m.id, m.from_id::text, m.to_id::text, m.org_id, m.typ, m.data, m.created_at, m.edited_at
        from messages m where m.from_id = uid and m.to_id = xid or m.from_id = xid and m.to_id = uid
      );
    end if;
  elsif prefix = '-' then
    return query (
      select g.id, by_id::text, group_id, g.org_id, g.typ, g.data, g.created_at, g.edited_at
      from group_messages g where group_id = substring(slug, 2)
    );
  else
    return;
  end if;
end $$ language plpgsql security invoker;
