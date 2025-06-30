create function rt_org()
returns trigger
as $$
begin
  perform realtime.broadcast_changes(
    'org:' || coalesce(new.id, old.id),
    TG_OP,
    TG_OP,
    'org',
    'public',
    new,
    old
  );
  return new;
end $$ language plpgsql security definer;

create trigger rt_org
after update or delete on organisations
for each row
execute function rt_org();

create policy "Organisations"
on realtime.messages
for select to authenticated
using (
  split_part((select realtime.topic()), ':', '1') = 'org'
  and exists(select 1 from organisations_users o where
    o.user_id = (select auth.uid()) and
    o.organisation_id = split_part((select realtime.topic()), ':', '2'))
);

