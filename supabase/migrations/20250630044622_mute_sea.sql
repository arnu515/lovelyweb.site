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
BEGIN
  -- Verify the sender is authenticated and matches from_id
  IF auth.uid() IS NULL OR auth.uid() != from_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

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
  VALUES (msg_id, from_id, to_id, org_id, 'voice', message_data, now());

  -- Send realtime notification
  PERFORM pg_notify(
    'chat:' || org_id || ':' || to_id,
    json_build_object(
      'event', 'INSERT',
      'payload', json_build_object(
        'operation', 'INSERT',
        'table', 'messages',
        'record', json_build_object(
          'id', msg_id,
          'from_id', from_id,
          'to_id', to_id,
          'org_id', org_id,
          'typ', 'voice',
          'data', message_data,
          'created_at', extract(epoch from now()) * 1000,
          'edited_at', null
        )
      )
    )::text
  );

  -- Also notify the sender
  PERFORM pg_notify(
    'chat:' || org_id || ':' || from_id,
    json_build_object(
      'event', 'INSERT',
      'payload', json_build_object(
        'operation', 'INSERT',
        'table', 'messages',
        'record', json_build_object(
          'id', msg_id,
          'from_id', from_id,
          'to_id', to_id,
          'org_id', org_id,
          'typ', 'voice',
          'data', message_data,
          'created_at', extract(epoch from now()) * 1000,
          'edited_at', null
        )
      )
    )::text
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
  member_record RECORD;
BEGIN
  -- Verify the sender is authenticated and matches by_id
  IF auth.uid() IS NULL OR auth.uid() != by_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

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

  -- Send realtime notifications to all group members
  FOR member_record IN 
    SELECT cgm.user_id
    FROM chat_group_members cgm
    WHERE cgm.group_id = send_group_voice_message.group_id
  LOOP
    PERFORM pg_notify(
      'chat-group:' || org_id || ':' || send_group_voice_message.group_id,
      json_build_object(
        'event', 'INSERT',
        'payload', json_build_object(
          'operation', 'INSERT',
          'table', 'group_messages',
          'record', json_build_object(
            'id', msg_id,
            'by_id', by_id,
            'group_id', send_group_voice_message.group_id,
            'org_id', org_id,
            'typ', 'voice',
            'data', message_data,
            'created_at', extract(epoch from now()) * 1000,
            'edited_at', null
          )
        )
      )::text
    );
  END LOOP;
END;
$$;