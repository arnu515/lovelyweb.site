create table users (
  id uuid primary key references auth.users(id) on update cascade on delete cascade,
  name text not null,
  username text not null unique,
  avatar_url text not null,
  created_at timestamptz not null default now()
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

create function get_user_provider(email text)
returns text
as $$
declare
  u record;
begin
  select * from auth.users into u where auth.users.email = $1 limit 1;
  if not found then 
    return null;
  elsif u.encrypted_password is not null then
    return 'password';
  elsif u.raw_app_meta_data ? 'provider' and u.raw_app_meta_data->>'provider' <> 'email' then
    return u.raw_app_meta_data->>'provider';
  else
    return 'password';
  end if;
end $$ language plpgsql security definer;

create policy "Enable read access for all users (TODO: clamp down on org members)"
on "public"."users"
as PERMISSIVE
for SELECT
to authenticated
using ( true );

create or replace function get_user_by_email(email text)
returns setof public.users
as $$
declare
  au record;
begin
  select u.id from auth.users u into au where u.email = $1;
  if not found then
    return;
  end if;
  return query
    select * from public.users where id = au.id;
end $$ language plpgsql security definer
set search_path = 'public';
