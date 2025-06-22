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

create policy "Org Owner can invite"
on org_invites
for insert
to authenticated
with check (
  (select private.is_org_owner(org_id, (select auth.uid())))
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
