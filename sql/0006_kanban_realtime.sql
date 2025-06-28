create function rt_kanban_board_membership()
returns trigger
as $$
begin
  perform realtime.broadcast_changes(
    'kanban-board-membership:' || coalesce(new.user_id, old.user_id),
    TG_OP,
    TG_OP,
    'kanban_board_members',
    'public',
    new,
    old
  );
  return new;
end $$ language plpgsql security definer;

create trigger rt_kanban_board_membership
after insert or delete on kanban_board_members
for each row
execute function rt_kanban_board_membership();

create policy "Kanban Board Memberships"
on realtime.messages
for select to authenticated
using (
  split_part((select realtime.topic()), ':', '1') = 'kanban-board-membership' and
  split_part((select realtime.topic()), ':', '2')::uuid = (select auth.uid())
);

create function rt_kanban_categories()
returns trigger
as $$
begin
  if TG_OP = 'UPDATE' and new.board_id <> old.board_id then
    perform realtime.broadcast_changes(
      'kanban-cat:' || old.board_id,
      'DELETE',
      'DELETE',
      'kanban_categories',
      'public',
      null,
      old
    );
    perform realtime.broadcast_changes(
      'kanban-cat:' || new.board_id,
      'INSERT',
      'INSERT',
      'kanban_categories',
      'public',
      new,
      null
    );
  else
    perform realtime.broadcast_changes(
      'kanban-cat:' || coalesce(new.board_id, old.board_id),
      TG_OP,
      TG_OP,
      'kanban_categories',
      'public',
      new,
      old
    );
  end if;
  return new;
end $$ language plpgsql security definer;

create trigger rt_kanban_categories
after insert or update or delete on kanban_categories
for each row
execute function rt_kanban_categories();

create policy "Kanban Categories"
on realtime.messages
for select to authenticated
using (
  split_part((select realtime.topic()), ':', '1') = 'kanban-cat'
  and exists(select 1 from kanban_board_members b where
    b.user_id = (select auth.uid()) and
    b.board_id = split_part((select realtime.topic()), ':', '2'))
);

create function rt_kanban_cards()
returns trigger
as $$
begin
  if TG_OP = 'UPDATE' and new.board_id <> old.board_id then
    perform realtime.broadcast_changes(
      'kanban-cards:' || old.board_id,
      'DELETE',
      'DELETE',
      'kanban_cards',
      'public',
      null,
      old
    );
    perform realtime.broadcast_changes(
      'kanban-cards:' || new.board_id,
      'INSERT',
      'INSERT',
      'kanban_cards',
      'public',
      new,
      null
    );
  else
    perform realtime.broadcast_changes(
      'kanban-cards:' || coalesce(new.board_id, old.board_id),
      TG_OP,
      TG_OP,
      'kanban_cards',
      'public',
      new,
      old
    );
  end if;
  return new;
end $$ language plpgsql security definer;

create trigger rt_kanban_cards
after insert or update or delete on kanban_cards
for each row
execute function rt_kanban_cards();

create policy "Kanban Cards"
on realtime.messages
for select to authenticated
using (
  split_part((select realtime.topic()), ':', '1') = 'kanban-cards'
  and exists(select 1 from kanban_board_members b where
    b.user_id = (select auth.uid()) and
    b.board_id = split_part((select realtime.topic()), ':', '2'))
);
