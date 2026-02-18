-- Create the bookmarks table (if it doesn't already exist)
create table if not exists public.bookmarks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  url text not null,
  user_id uuid default auth.uid() not null
);

-- Enable Row Level Security (RLS)
alter table public.bookmarks enable row level security;

-- Create policies (drop first to handle reruns safely)

-- Policy: Users can view their own bookmarks
drop policy if exists "Users can view their own bookmarks" on bookmarks;
create policy "Users can view their own bookmarks"
  on public.bookmarks for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own bookmarks
drop policy if exists "Users can insert their own bookmarks" on bookmarks;
create policy "Users can insert their own bookmarks"
  on public.bookmarks for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own bookmarks
drop policy if exists "Users can update their own bookmarks" on bookmarks;
create policy "Users can update their own bookmarks"
  on public.bookmarks for update
  using (auth.uid() = user_id);

-- Policy: Users can delete their own bookmarks
drop policy if exists "Users can delete their own bookmarks" on bookmarks;
create policy "Users can delete their own bookmarks"
  on public.bookmarks for delete
  using (auth.uid() = user_id);

-- Enable Realtime
-- Add the table to the publication used by the Realtime API
alter publication supabase_realtime add table public.bookmarks;
