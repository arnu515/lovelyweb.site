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
      values (msg_id, group_id, by_id, org_id, typ, data);
    select m.*, u.id as sender_id, u.name as sender_name, u.avatar_url as sender_avatar_url
      into msg_record
      from group_messages m
      inner join users u on u.id = m.by_id
      where m.id = msg_id;
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

create function rt_chat_group_members()
returns trigger
as $$
declare
  group_ record;
begin
  if TG_OP = 'INSERT' then
    (select g.id, g.name, g.avatar_type::text as avatar_url, 0 as unread_count, -- temp
      m.typ, m.data, m.created_at, m.edited_at,
      null::timestamptz as read_at -- temp
    into group_
    from chat_groups g
    left join lateral (
      select m.typ, m.data, m.created_at, m.edited_at
      from group_messages m
      where m.org_id = $1 and m.group_id = g.id
      order by m.created_at desc
      limit 1
    ) as m on true
    where g.id = new.group_id)
    perform realtime.broadcast_changes(
      'chat-group-members:' || coalesce(new.user_id, old.user_id),
      TG_OP,
      TG_OP,
      '',
      'public',
      group_,
      null
    );
  else
    perform realtime.broadcast_changes(
      'chat-group-members:' || coalesce(new.user_id, old.user_id),
      TG_OP,
      TG_OP,
      '',
      'public',
      null,
      old
    );
  end if;
  return new;
end $$ language plpgsql security definer;

create trigger rt_chat_group_members
after insert or delete on chat_group_members
for each row
execute function rt_chat_group_members();

create policy "Chat Group Members"
on realtime.messages
for select to authenticated
using (
  split_part((select realtime.topic()), ':', '1') = 'chat-group-members'
  and split_part((select realtime.topic()), ':', '2')::uuid = (select auth.uid())
);

-- Function to edit individual chat messages
CREATE OR REPLACE FUNCTION edit_chat_message(
  msg_id text,
  new_data json
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  msg_record messages%rowtype;
  msg_typ msg_type;
  to_id uuid;
  org_id text;
  from_id uuid;
BEGIN
  -- Get message type, to_id, org_id, from_id
  SELECT messages.typ, messages.to_id, messages.org_id, messages.from_id
    INTO msg_typ, to_id, org_id, from_id
  FROM messages
  WHERE messages.id = msg_id AND messages.from_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Message not found or you do not have permission to edit it';
  END IF;

  IF msg_typ = 'text' THEN
    IF jsonb_typeof(new_data::jsonb) <> 'string' THEN
      RAISE EXCEPTION 'Text message data must be a JSONB string';
    END IF;

    UPDATE messages
    SET
      data = new_data,
      edited_at = now()
    WHERE
      messages.id = msg_id
      AND messages.from_id = auth.uid()
      AND messages.typ = 'text'
    RETURNING * INTO msg_record;
  ELSE
    RAISE EXCEPTION 'Message type "%" not implemented', msg_typ;
  END IF;

  -- Broadcast the update to both sender and recipient
  PERFORM realtime.broadcast_changes(
    'chat:' || org_id || ':' || from_id::text,
    'UPDATE',
    'UPDATE',
    'messages',
    'public',
    msg_record,
    NULL
  );
  PERFORM realtime.broadcast_changes(
    'chat:' || org_id || ':' || to_id::text,
    'UPDATE',
    'UPDATE',
    'messages',
    'public',
    msg_record,
    NULL
  );
END;
$$;

-- Trigger function for broadcasting deleted messages
CREATE OR REPLACE FUNCTION rt_message_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Broadcast to sender
  PERFORM realtime.broadcast_changes(
    'chat:' || OLD.org_id || ':' || OLD.from_id::text,
    'DELETE',
    'DELETE',
    'messages',
    'public',
    NULL,
    OLD
  );
  -- Broadcast to recipient
  PERFORM realtime.broadcast_changes(
    'chat:' || OLD.org_id || ':' || OLD.to_id::text,
    'DELETE',
    'DELETE',
    'messages',
    'public',
    NULL,
    OLD
  );
  RETURN OLD;
END;
$$;

CREATE TRIGGER rt_message_delete
AFTER DELETE ON messages
FOR EACH ROW
EXECUTE FUNCTION rt_message_delete();

-- Trigger function for broadcasting deleted group messages
CREATE OR REPLACE FUNCTION rt_group_message_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM realtime.broadcast_changes(
    'chat-group:' || OLD.org_id || ':' || OLD.group_id::text,
    'DELETE',
    'DELETE',
    'group_messages',
    'public',
    NULL,
    OLD
  );
  RETURN OLD;
END;
$$;

CREATE TRIGGER rt_group_message_delete
AFTER DELETE ON group_messages
FOR EACH ROW
EXECUTE FUNCTION rt_group_message_delete();

-- RLS policy for message delete broadcasts
CREATE POLICY "Chat Message Delete"
ON realtime.messages
FOR SELECT TO authenticated
USING (
  split_part((select realtime.topic()), ':', 1) = 'chat'
  AND split_part((select realtime.topic()), ':', 3)::uuid = (select auth.uid())
  AND EXISTS (
    SELECT 1 FROM organisations_users
    WHERE organisation_id = split_part((select realtime.topic()), ':', 2)
      AND user_id = (select auth.uid())
  )
);

-- RLS policy for group message delete broadcasts
CREATE POLICY "Chat Group Message Delete"
ON realtime.group_messages
FOR SELECT TO authenticated
USING (
  split_part((select realtime.topic()), ':', 1) = 'chat-group'
  AND EXISTS (
    SELECT 1 FROM chat_group_members
    WHERE group_id = split_part((select realtime.topic()), ':', 3)
      AND user_id = (select auth.uid())
  )
);

-- Function to edit group chat messages
CREATE OR REPLACE FUNCTION edit_group_chat_message(
  msg_id text,
  new_data json
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  msg_record group_messages%rowtype;
  msg_typ msg_type;
  group_id text;
  org_id text;
BEGIN
  -- Get message type, group_id, org_id
  SELECT group_messages.typ, group_messages.group_id, group_messages.org_id
    INTO msg_typ, group_id, org_id
  FROM group_messages
  WHERE group_messages.id = msg_id AND group_messages.by_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Message not found or you do not have permission to edit it';
  END IF;

  IF msg_typ = 'text' THEN
    IF jsonb_typeof(new_data::jsonb) <> 'string' THEN
      RAISE EXCEPTION 'Text message data must be a JSONB string';
    END IF;

    UPDATE group_messages
    SET
      data = new_data,
      edited_at = now()
    WHERE
      group_messages.id = msg_id
      AND group_messages.by_id = auth.uid()
      AND group_messages.typ = 'text'
    RETURNING * INTO msg_record;
  ELSE
    RAISE EXCEPTION 'Message type "%" not implemented', msg_typ;
  END IF;

  -- Broadcast the update to the group channel
  PERFORM realtime.broadcast_changes(
    'chat-group:' || org_id || ':' || group_id::text,
    'UPDATE',
    'UPDATE',
    'group_messages',
    'public',
    msg_record,
    NULL
  );
END;
$$;
