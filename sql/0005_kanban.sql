create type kanban_priority as enum ('low', 'medium', 'high');

create table kanban_boards (
  id text primary key,
  name text not null,
  org_id text not null references organisations(id) on update cascade on delete cascade,
  owner_id uuid not null references users(id) on update cascade on delete cascade,
  created_at timestamptz not null default now()
);

create table kanban_board_members (
  board_id text not null references kanban_boards(id) on update cascade on delete cascade,
  user_id uuid not null references users(id) on update cascade on delete cascade,
  created_at timestamptz not null default now(),
  primary key (board_id, user_id)
);

create index idx_kbmem_board_id on kanban_board_members (board_id);
create index idx_kbmem_user_id on kanban_board_members (user_id);

create table kanban_categories (
  id text primary key,
  name text not null,
  color text not null check (color ~ '^#[0-9a-fA-F]{6}$'),
  position int not null,
  board_id text not null references kanban_boards(id) on update cascade on delete cascade,
  created_at timestamptz not null default now()
);

create table kanban_cards (
  id text primary key,
  title text not null,
  description text,
  priority kanban_priority,
  due_date date,
  tags text[] not null default '{}' check (coalesce(array_length(tags, 1), 0) < 5),
  position int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  category_id text not null references kanban_categories(id) on update cascade on delete cascade,
  board_id text not null references kanban_boards(id) on update cascade on delete cascade,
  created_by uuid not null references users(id) on update cascade on delete cascade
);

create index idx_kanban_boards_org_id on kanban_boards(org_id);
create index idx_kanban_categories_board_id on kanban_categories(board_id);
create index idx_kanban_cards_board_id_category_id on kanban_cards(board_id, category_id);

alter table kanban_boards enable row level security;
alter table kanban_board_members enable row level security;
alter table kanban_categories enable row level security;
alter table kanban_cards enable row level security;

create or replace function add_board_owner_as_member()
returns trigger as $$
begin
  insert into kanban_board_members (board_id, user_id) values (new.id, new.owner_id);
  return new;
end $$ language plpgsql security definer;

create trigger after_kanban_board_insert
after insert on kanban_boards for each row
execute function add_board_owner_as_member();

create or replace function private.is_kanban_board_member(board_id text, uid uuid)
returns boolean
as $$
begin
  return exists(
    select 1 from kanban_board_members b
    where b.board_id = $1 and user_id = uid
  );
end $$ language plpgsql security definer;

create or replace function private.is_org_member(org_id text, uid uuid)
returns boolean
as $$
begin
  return exists(
    select 1 from organisations_users
    where organisation_id = org_id and user_id = uid
  );
end $$ language plpgsql security invoker;

create policy "Board members can select boards"
on kanban_boards
for select
to authenticated
using (
  (select private.is_kanban_board_member(kanban_boards.id, (select auth.uid())))
);

create policy "Org members can create boards"
on kanban_boards
for insert
to authenticated
with check (
  owner_id = (select auth.uid()) and
  exists(
    select 1 from organisations_users o
    where organisation_id = org_id and o.user_id = kanban_boards.owner_id
  )
);

create policy "Board owner can delete"
on kanban_boards
for delete
to authenticated
using (
  owner_id = (select auth.uid())
);

create policy "Board members can see their board members"
on kanban_board_members
for select
to authenticated
using (
  user_id = (select auth.uid()) or
  (select private.is_kanban_board_member(board_id, (select auth.uid())))
);

create policy "Board owner can add members of their own org"
on kanban_board_members
for insert
to authenticated
with check (
  (select owner_id from kanban_boards k where id = board_id and
    k.org_id = (select o.organisation_id from organisations_users o where o.user_id = kanban_board_members.user_id)
  ) = (select auth.uid())
);

create policy "Board owner or member can remove membership"
on kanban_board_members
for delete
to authenticated
using (
  user_id = (select auth.uid()) or
  (select owner_id from kanban_boards where id = board_id) = (select auth.uid())
);

create policy "Board members can select categories"
on kanban_categories
for select
to authenticated
using (
  (select private.is_kanban_board_member(board_id, (select auth.uid())))
);

create policy "Board members can insert categories"
on kanban_categories
for insert
to authenticated
with check (
  (select private.is_kanban_board_member(board_id, (select auth.uid())))
);

create policy "Board members can update categories"
on kanban_categories
for update
to authenticated
using (
  (select private.is_kanban_board_member(board_id, (select auth.uid())))
);
create policy "Board members can delete categories"
on kanban_categories
for delete
to authenticated
using (
  (select private.is_kanban_board_member(board_id, (select auth.uid())))
);

create policy "Board members can select cards"
on kanban_cards
for select
to authenticated
using (
  (select private.is_kanban_board_member(board_id, (select auth.uid())))
);

create policy "Board members can insert cards"
on kanban_cards
for insert
to authenticated
with check (
  (created_by = (select auth.uid())) and
  exists(select 1 from kanban_categories c where c.id = category_id and c.board_id = kanban_cards.board_id) and
  (select private.is_kanban_board_member(board_id, (select auth.uid())))
);

create policy "Board members can update cards"
on kanban_cards
for update
to authenticated
using (
  exists(select 1 from kanban_categories c where c.id = category_id and c.board_id = kanban_cards.board_id) and
  (select private.is_kanban_board_member(board_id, (select auth.uid())))
) with check (
  exists(select 1 from kanban_categories c where c.id = category_id and c.board_id = kanban_cards.board_id) and
  (select private.is_kanban_board_member(board_id, (select auth.uid())))
);

create policy "Board members can delete cards"
on kanban_cards
for delete
to authenticated
using (
  (select private.is_kanban_board_member(board_id, (select auth.uid())))
);

create or replace function create_board(id text, board_name text, org_id text)
returns void
as $$
declare
  auth_uid uuid;
  planned uuid;
  doing uuid;
  done uuid;
begin
  auth_uid := (select auth.uid());
  planned := gen_random_uuid();
  doing := gen_random_uuid();
  done := gen_random_uuid();

  insert into public.kanban_boards(id, name, org_id, owner_id) values (id, board_name, org_id, auth_uid);

  insert into public.kanban_categories (id, name, color, position, board_id)
    values (planned, 'Planned', '#f59e0b', 0, id);
  insert into public.kanban_categories (id, name, color, position, board_id)
    values (doing, 'Doing', '#0ea5e9', 1, id);
  insert into public.kanban_categories (id, name, color, position, board_id)
    values (done, 'Done', '#22c55e', 2, id);

  insert into public.kanban_cards
    (id, title, description, tags, position, category_id, board_id, created_by)
  values (
    gen_random_uuid(),
    'Welcome to Lovely Kanban!',
    'A very simple-to-use yet powerful Kanban tool',
    '{kanban}',
    0,
    planned,
    id,
    auth_uid
  );
  insert into public.kanban_cards
    (id, title, description, tags, priority, position, category_id, board_id, created_by)
  values (
    gen_random_uuid(),
    'Drag this card around',
    'Drag this card around to change its position/category',
    '{kanban,cards}',
    'high',
    1,
    planned,
    id,
    auth_uid
  );
  insert into public.kanban_cards
    (id, title, description, tags, priority, position, category_id, board_id, created_by)
  values (
    gen_random_uuid(),
    'Edit this card',
    'Right-click/Long-press this card and press the Edit button to edit this card',
    '{kanban,cards}',
    'medium',
    2,
    planned,
    id,
    auth_uid
  );
  insert into public.kanban_cards
    (id, title, description, tags, priority, position, category_id, board_id, created_by)
  values (
    gen_random_uuid(),
    'Refine a card',
    'Open a card''s context menu and press refine with AI. Try it with the below card',
    '{kanban,cards,ai}',
    'medium',
    0,
    doing,
    id,
    auth_uid
  );
  insert into public.kanban_cards
    (id, title, description, due_date, tags, position, category_id, board_id, created_by)
  values (
    gen_random_uuid(),
    'Paris Trip Plan',
    'Create a travel itenary for a trip to Paris for five days.',
    current_date + interval '1 month',
    '{france}',
    1,
    doing,
    id,
    auth_uid
  );
  insert into public.kanban_cards
    (id, title, description, tags, priority, position, category_id, board_id, created_by)
  values (
    gen_random_uuid(),
    'Change board settings',
    'Use the cog icon in the header bar to change the board''s name and add/remove members',
    '{kanban,cards}',
    'low',
    2,
    doing,
    id,
    auth_uid
  );
  insert into public.kanban_cards
    (id, title, description, tags, priority, position, category_id, board_id, created_by)
  values (
    gen_random_uuid(),
    'Move this card to another board',
    'Open a card''s context menu and press move to another board. You may have to create another board if you only have one.',
    '{kanban,cards}',
    'low',
    0,
    done,
    id,
    auth_uid
  );
  insert into public.kanban_cards
    (id, title, description, tags, priority, position, category_id, board_id, created_by)
  values (
    gen_random_uuid(),
    'Delete these cards',
    'You can delete these cards (and categories) if you wish. Open the card''s context menu to do so.',
    '{kanban,cards}',
    'low',
    1,
    done,
    id,
    auth_uid
  );
end $$ language plpgsql security invoker;

create function update_board_name(new_name text, board_id text)
returns void
as $$
  update kanban_boards set name = new_name where id = board_id and owner_id = (select auth.uid());
$$ language sql security definer;
