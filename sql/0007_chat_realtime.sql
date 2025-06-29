create function public.send_chat_message(
  msg_id text,
  to_id uuid,
  org_id text,
  typ msg_type,
  data jsonb
)
returns void
as $$
declare
  from_id uuid;
  msg_record messages%rowtype;
begin
  from_id := (select auth.uid());

  if (
    select count(*) from organisations_users
    where organisation_id = org_id
      and user_id in (from_id, to_id)
  ) <> 2 then
    raise exception 'Sender and Recepient must be members of this org.';
  end if;

  if typ = 'text' then
    if jsonb_typeof(data) <> 'string' then
      raise exception 'Text message data must be a JSONB string';
    end if;

    insert into messages(id, from_id, to_id, org_id, typ, data)
      values (msg_id, from_id, to_id, org_id, typ, data)
      returning * into msg_record;
  else
    raise exception 'Message type "%" not implemented', typ;
  end if;

  perform realtime.broadcast_changes(
    'chat:' || org_id || ':' || from_id::text,
    'INSERT',
    'INSERT',
    'messages',
    'public',
    msg_record,
    null
  );
  perform realtime.broadcast_changes(
    'chat:' || org_id || ':' || to_id::text,
    'INSERT',
    'INSERT',
    'messages',
    'public',
    msg_record,
    null
  );
end
$$ language plpgsql security definer;

create function public.send_group_chat_message(
  msg_id text,
  group_id text,
  org_id text,
  typ msg_type,
  data jsonb
)
returns void
as $$
declare
  by_id uuid;
  msg_record group_messages%rowtype;
begin
  by_id := (select auth.uid());

  if (
    select count(*) from chat_group_members m
    inner join chat_groups g on g.org_id = $3
    where m.group_id = $2 and user_id = by_id
  ) <> 2 then
    raise exception 'You are not a member of this group';
  end if;

  if typ = 'text' then
    if jsonb_typeof(data) <> 'string' then
      raise exception 'Text message data must be a JSONB string';
    end if;

    insert into group_messages(id, group_id, by_id, org_id, typ, data)
      values (msg_id, group_id, by_id, org_id, typ, data)
      returning * into msg_record;
  else
    raise exception 'Message type "%" not implemented', typ;
  end if;

  perform realtime.broadcast_changes(
    'chat-group:' || org_id || ':' || group_id::text,
    'INSERT',
    'INSERT',
    'group_messages',
    'public',
    msg_record,
    null
  );
end
$$ language plpgsql security definer;
