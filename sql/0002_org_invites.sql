create table org_invites (
  invitee uuid not null references users(id),
  org_id text not null references organisations(id),
  message text,
  created_at timestamptz not null default now(),
  primary key (invitee, org_id)
);

alter table org_invites enable row level security;

create index idx_org_invites_invitee on org_invites(invitee);
create index idx_org_invites_org_id on org_invites(org_id);

create schema if not exists private;

create function private.is_org_owner(org_id text, owner_id uuid)
returns boolean
as $$
begin
  return exists(
    select 1 from organisations o
    where o.id = $1 and o.owner_id = $2
  );
end $$ language plpgsql security definer;

create policy "Inviter and Org Owner can select"
on org_invites
for select
to authenticated
using (
  (invitee = (select auth.uid())) or
  (select private.is_org_owner(org_id, (select auth.uid())))
);

create policy "Org Owner can invite a user not in the org"
on org_invites
for insert
to authenticated
with check (
  (select private.is_org_owner(org_id, (select auth.uid())))
  and invitee not in
    ( select user_id from organisations_users where organisation_id = org_id)
);

create policy "Invitee and Org Owner can delete"
on org_invites
for delete
to authenticated
using (
  (invitee = (select auth.uid())) or
  (select private.is_org_owner(org_id, (select auth.uid())))
);

create policy "Invitee can select organisation"
on organisations
for select
to authenticated 
using (
  (select invitee from org_invites where org_id = id) = (select auth.uid())
);

create function accept_invite(org_id text)
returns void
as $$
declare
  uid uuid;
begin
  uid := (select auth.uid());
  if not exists(select 1 from org_invites i where i.org_id = $1 and invitee = uid) then
    raise exception 'You are not invited to this organisation';
  end if;

  delete from org_invites i where i.org_id = $1 and i.invitee = uid;
  insert into organisations_users (organisation_id, user_id) values
    (org_id, uid);
end $$ language plpgsql
security definer
set search_path = 'public';
