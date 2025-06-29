/*
  # Fix Group Message Sender Display

  1. Updates
    - Update get_chat_overview function to include sender info for group messages
    - Update group message queries to include sender information
  
  2. Changes
    - Add sender_name, sender_id, sender_avatar_url to chat overview
    - Join with users table for group messages to get sender info
    - Keep individual chat fields as null with proper type casting
*/

-- drop the existing function
drop function if exists get_chat_overview(text);

-- recreate with sender information
create or replace function get_chat_overview(org_id text)
returns table (
  is_group boolean,
  id text,
  name text,
  avatar_url text,
  unread_count bigint,
  typ msg_type,
  data json,
  msg_created_at timestamptz,
  msg_edited_at timestamptz,
  msg_read_at timestamptz,
  sender_name text,
  sender_id text,
  sender_avatar_url text,
  slug text
)
language plpgsql
security definer
as $$
begin
  return query
  with individual_chats as (
    select 
      false as is_group,
      case 
        when m.from_id = auth.uid() then m.to_id
        else m.from_id
      end as chat_id,
      u.name,
      u.avatar_url,
      0::bigint as unread_count,
      m.typ,
      m.data,
      m.created_at as msg_created_at,
      m.edited_at as msg_edited_at,
      null::timestamptz as msg_read_at,
      null::text as sender_name,
      null::text as sender_id,
      null::text as sender_avatar_url,
      '@' || u.username as slug,
      row_number() over (
        partition by case 
          when m.from_id = auth.uid() then m.to_id
          else m.from_id
        end 
        order by m.created_at desc
      ) as rn
    from messages m
    join users u on u.id = case 
      when m.from_id = auth.uid() then m.to_id
      else m.from_id
    end
    where m.org_id = get_chat_overview.org_id
      and (m.from_id = auth.uid() or m.to_id = auth.uid())
  ),
  group_chats as (
    select 
      true as is_group,
      cg.id as chat_id,
      cg.name,
      case 
        when cg.avatar_type is not null then cg.avatar_type::text
        else null
      end as avatar_url,
      0::bigint as unread_count,
      gm.typ,
      gm.data,
      gm.created_at as msg_created_at,
      gm.edited_at as msg_edited_at,
      null::timestamptz as msg_read_at,
      u.name as sender_name,
      u.id as sender_id,
      u.avatar_url as sender_avatar_url,
      '-' || cg.id as slug,
      row_number() over (
        partition by cg.id 
        order by gm.created_at desc
      ) as rn
    from chat_groups cg
    join chat_group_members cgm on cgm.group_id = cg.id
    left join group_messages gm on gm.group_id = cg.id
    left join users u on u.id = gm.by_id
    where cg.org_id = get_chat_overview.org_id
      and cgm.user_id = auth.uid()
  )
  select 
    c.is_group,
    c.chat_id as id,
    c.name,
    c.avatar_url,
    c.unread_count,
    c.typ,
    c.data,
    c.msg_created_at,
    c.msg_edited_at,
    c.msg_read_at,
    c.sender_name,
    c.sender_id,
    c.sender_avatar_url,
    c.slug
  from (
    select * from individual_chats where rn = 1
    union all
    select * from group_chats where rn = 1
  ) c
  order by c.msg_created_at desc nulls last;
end;
$$;