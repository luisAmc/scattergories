-- Scattergories tables and Realtime
create table public.games (
  id uuid primary key default gen_random_uuid (),
  code text not null unique,
  host_id uuid,
  phase text not null default 'lobby' check (
    phase in (
      'lobby',
      'preparing',
      'playing',
      'voting',
      'results',
      'finished'
    )
  ),
  round_category_ids uuid[] default '{}',
  round_number int not null default 0,
  voting_category_index int not null default 0,
  round_duration_seconds int not null default 90,
  letter text,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.players (
  id uuid primary key default gen_random_uuid (),
  game_id uuid not null references public.games (id) on delete cascade,
  name text not null,
  score int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.games
add constraint fk_host foreign key (host_id) references public.players (id) on delete set null;

create table public.categories (
  id uuid primary key default gen_random_uuid (),
  game_id uuid not null references public.games (id) on delete cascade,
  name text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table public.answers (
  id uuid primary key default gen_random_uuid (),
  game_id uuid not null references public.games (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  round_number int not null,
  value text,
  created_at timestamptz not null default now(),
  unique (game_id, player_id, category_id, round_number)
);

create table public.answer_votes (
  id uuid primary key default gen_random_uuid(),
  answer_id uuid not null references public.answers(id) on delete cascade,
  voter_player_id uuid not null references public.players(id) on delete cascade,
  value boolean not null default true,
  created_at timestamptz not null default now(),
  unique (answer_id, voter_player_id)
);

alter table public.answer_votes replica identity FULL;

-- Realtime: add tables to publication (Supabase dashboard also has this under Database → Replication)
alter publication supabase_realtime
add table public.games;

alter publication supabase_realtime
add table public.players;

alter publication supabase_realtime
add table public.answers;

alter publication supabase_realtime
add table public.categories;

alter publication supabase_realtime
add table public.answer_votes;


-- RLS (permissive for game; tighten in production)
alter table public.games enable row level security;

alter table public.players enable row level security;

alter table public.answers enable row level security;

alter table public.categories enable row level security;

alter table public.answer_votes enable row level security;

create policy "Allow all on games" on public.games for all using (true)
with
  check (true);

create policy "Allow all on players" on public.players for all using (true)
with
  check (true);

create policy "Allow all on answers" on public.answers for all using (true)
with
  check (true);

create policy "Allow all on categories" on public.categories for all using (true)
with
  check (true);

create policy "Allow all on answer_votes" on public.answer_votes for all using (true)
with
  check (true);

-- Indexes for common queries
create index idx_players_game_id on public.players (game_id);

create index idx_answers_game_round on public.answers (game_id, round_number);

create index idx_categories_game_id on public.categories(game_id);

create index idx_answer_votes_answer_id on public.answer_votes(answer_id);
