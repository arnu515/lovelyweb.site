/*
  # Notes Feature Implementation

  1. New Tables
    - `notebooks`
      - `id` (uuid, primary key)
      - `name` (text, notebook name)
      - `description` (text, optional description)
      - `color` (text, hex color code)
      - `owner_id` (uuid, foreign key to users)
      - `org_id` (uuid, foreign key to organisations)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `notebook_pages`
      - `id` (uuid, primary key)
      - `notebook_id` (uuid, foreign key to notebooks)
      - `title` (text, page title)
      - `content` (text, page content in markdown/html)
      - `position` (integer, for ordering pages)
      - `created_by` (uuid, foreign key to users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for CRUD operations based on organisation membership
*/

-- Create notebooks table
create table if not exists notebooks (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) >= 1 and length(name) <= 100),
  description text check (length(description) <= 500),
  color text not null default '#8b5cf6' check (color ~ '^#[0-9a-fA-F]{6}$'),
  owner_id uuid not null references users(id) on delete cascade,
  org_id uuid not null references organisations(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create notebook_pages table
create table if not exists notebook_pages (
  id uuid primary key default gen_random_uuid(),
  notebook_id uuid not null references notebooks(id) on delete cascade,
  title text not null default 'Untitled Page' check (length(title) >= 1 and length(title) <= 200),
  content text default '',
  position integer not null default 0,
  created_by uuid not null references users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table notebooks enable row level security;
alter table notebook_pages enable row level security;

-- Create indexes for better performance
create index if not exists notebooks_org_id_idx on notebooks(org_id);
create index if not exists notebooks_owner_id_idx on notebooks(owner_id);
create index if not exists notebook_pages_notebook_id_idx on notebook_pages(notebook_id);
create index if not exists notebook_pages_position_idx on notebook_pages(notebook_id, position);

-- RLS Policies for notebooks
create policy "Users can view notebooks in their organisation"
  on notebooks
  for select
  to authenticated
  using (
    org_id in (
      select organisation_id 
      from organisations_users 
      where user_id = auth.uid()
    )
  );

create policy "Users can insert notebooks in their organisation"
  on notebooks
  for insert
  to authenticated
  with check (
    owner_id = auth.uid() and
    org_id in (
      select organisation_id 
      from organisations_users 
      where user_id = auth.uid()
    )
  );

create policy "Notebook owners can delete their notebooks"
  on notebooks
  for delete
  to authenticated
  using (owner_id = auth.uid());

-- RLS Policies for notebook_pages
create policy "Users can view pages in accessible notebooks"
  on notebook_pages
  for select
  to authenticated
  using (
    notebook_id in (
      select id from notebooks
      where org_id in (
        select organisation_id 
        from organisations_users 
        where user_id = auth.uid()
      )
    )
  );

create policy "Users can insert pages in accessible notebooks"
  on notebook_pages
  for insert
  to authenticated
  with check (
    created_by = auth.uid() and
    notebook_id in (
      select id from notebooks
      where org_id in (
        select organisation_id 
        from organisations_users 
        where user_id = auth.uid()
      )
    )
  );

create policy "Users can update pages in accessible notebooks"
  on notebook_pages
  for update
  to authenticated
  using (
    notebook_id in (
      select id from notebooks
      where org_id in (
        select organisation_id 
        from organisations_users 
        where user_id = auth.uid()
      )
    )
  );

create policy "Users can delete pages in accessible notebooks"
  on notebook_pages
  for delete
  to authenticated
  using (
    notebook_id in (
      select id from notebooks
      where org_id in (
        select organisation_id 
        from organisations_users 
        where user_id = auth.uid()
      )
    )
  );

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger update_notebooks_updated_at
  before update on notebooks
  for each row execute function update_updated_at_column();

create trigger update_notebook_pages_updated_at
  before update on notebook_pages
  for each row execute function update_updated_at_column();