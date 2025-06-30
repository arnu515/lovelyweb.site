/*
  # Voice Messages Support

  1. RPC Functions
    - `send_voice_message` - Send individual voice message
    - `send_group_voice_message` - Send group voice message
  
  2. Security
    - Functions are defined as SECURITY INVOKER
    - Proper authentication and authorization checks
    - Realtime notifications for voice messages
*/

-- Function to send individual voice messages
CREATE OR REPLACE FUNCTION send_voice_message(
  msg_id text,
  to_id uuid,
  org_id text,
  from_id uuid,
  time_sec numeric,
  size_bytes bigint,
  blob_path text
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  message_data jsonb;
  msg_record record;
BEGIN
  -- Verify both users are in the same organization
  IF NOT EXISTS (
    SELECT 1 FROM organisations_users ou1
    JOIN organisations_users ou2 ON ou1.organisation_id = ou2.organisation_id
    WHERE ou1.user_id = from_id 
    AND ou2.user_id = to_id 
    AND ou1.organisation_id = org_id
  ) THEN
    RAISE EXCEPTION 'Users not in same organization';
  END IF;

  -- Create message data
  message_data := jsonb_build_object(
    'time', time_sec,
    'size', size_bytes,
    'url', blob_path
  );

  -- Insert the message
  INSERT INTO messages (id, from_id, to_id, org_id, typ, data, created_at)
  VALUES (msg_id, from_id, to_id, org_id, 'voice', message_data, now())
  returning * into msg_record;

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
END;
$$;

-- Function to send group voice messages
CREATE OR REPLACE FUNCTION send_group_voice_message(
  msg_id text,
  group_id text,
  org_id text,
  by_id uuid,
  time_sec numeric,
  size_bytes bigint,
  blob_path text
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  message_data jsonb;
  msg_record RECORD;
BEGIN
  -- Verify the user is a member of the group
  IF NOT EXISTS (
    SELECT 1 FROM chat_group_members cgm
    JOIN chat_groups cg ON cgm.group_id = cg.id
    WHERE cgm.group_id = send_group_voice_message.group_id
    AND cgm.user_id = by_id
    AND cg.org_id = send_group_voice_message.org_id
  ) THEN
    RAISE EXCEPTION 'User not a member of this group';
  END IF;

  -- Create message data
  message_data := jsonb_build_object(
    'time', time_sec,
    'size', size_bytes,
    'url', blob_path
  );

  -- Insert the message
  INSERT INTO group_messages (id, by_id, group_id, org_id, typ, data, created_at)
  VALUES (msg_id, by_id, send_group_voice_message.group_id, org_id, 'voice', message_data, now());
  select m.*, u.id as sender_id, u.name as sender_name, u.avatar_url as sender_avatar_url
    into msg_record
    from group_messages m
    inner join users u on u.id = m.by_id
    where m.id = msg_id;

  perform realtime.broadcast_changes(
    'chat-group:' || org_id || ':' || group_id::text,
    'INSERT',
    'INSERT',
    'group_messages',
    'public',
    msg_record,
    null
  );
END;
$$;
