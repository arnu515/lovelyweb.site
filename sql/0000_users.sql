create table users (
  id uuid primary key references auth.users(id) on update cascade on delete cascade,
  name text not null,
  username text not null,
  avatar_url text not null
);

alter table users enable row level security;

create function auth_insert_trigger()
returns trigger as $$
declare
  name text;
  username text;
  avatar_url text;
begin
  if jsonb_typeof(new.raw_user_meta_data->'full_name') = 'string' and new.raw_user_meta_data->>'full_name' <> '' then
    name := new.raw_user_meta_data->>'full_name';
  elsif jsonb_typeof(new.raw_user_meta_data->'name') = 'string' and new.raw_user_meta_data->>'name' <> '' then
    name := new.raw_user_meta_data->>'name';
  end if;

  if jsonb_typeof(new.raw_user_meta_data->'preferred_username') = 'string' and new.raw_user_meta_data->>'preferred_username' <> '' then
    username := new.raw_user_meta_data->>'preferred_username';
  elsif jsonb_typeof(new.raw_user_meta_data->'username') = 'string' and new.raw_user_meta_data->>'username' <> '' then
    username := new.raw_user_meta_data->>'username';
  elsif jsonb_typeof(new.raw_user_meta_data->'user_name') = 'string' and new.raw_user_meta_data->>'user_name' <> '' then
    username := new.raw_user_meta_data->>'user_name';
  end if;

  if jsonb_typeof(new.raw_user_meta_data->'avatar_url') = 'string' and new.raw_user_meta_data->>'avatar_url' <> '' then
    avatar_url := new.raw_user_meta_data->>'avatar_url';
  end if;

  if username is null or avatar_url is null then
    raise exception 'invalid user metadata (%, %, %)', name, username, avatar_url;
  end if;
  
  insert into public.users(id, name, username, avatar_url) values (new.id, name, username, avatar_url);

  return new;
end $$ language plpgsql security definer;

create trigger auth_insert_trigger after insert on auth.users
for each row
execute function auth_insert_trigger();

create function does_user_exist(eml text)
returns boolean
as $$
begin
  return (select exists(select 1 from auth.users where email = eml));
end $$ language plpgsql security definer;
