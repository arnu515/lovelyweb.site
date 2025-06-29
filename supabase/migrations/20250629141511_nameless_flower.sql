/*
  # Chat Message Editing and Deleting

  1. Functions
    - `edit_chat_message` - Edit individual chat messages
    - `edit_group_chat_message` - Edit group chat messages
  
  2. Security
    - Users can only edit their own messages
    - Messages can only be edited if they are text type
    - Automatic broadcasting via realtime triggers
*/

-- Function to edit individual chat messages
CREATE OR REPLACE FUNCTION edit_chat_message(
  msg_id text,
  new_data json
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the message with new data and set edited_at timestamp
  UPDATE messages 
  SET 
    data = new_data,
    edited_at = now()
  WHERE 
    id = msg_id 
    AND from_id = auth.uid()
    AND typ = 'text';
    
  -- Check if any row was updated
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Message not found or you do not have permission to edit it';
  END IF;
END;
$$;

-- Function to edit group chat messages
CREATE OR REPLACE FUNCTION edit_group_chat_message(
  msg_id text,
  new_data json
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the message with new data and set edited_at timestamp
  UPDATE group_messages 
  SET 
    data = new_data,
    edited_at = now()
  WHERE 
    id = msg_id 
    AND by_id = auth.uid()
    AND typ = 'text';
    
  -- Check if any row was updated
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Message not found or you do not have permission to edit it';
  END IF;
END;
$$;