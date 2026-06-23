-- ============================================================
-- LEMBREI VOCE - Schema completo e consolidado
-- Pronto para rodar em um projeto Supabase novo do zero.
-- Basta copiar e executar no SQL Editor do Supabase.
-- ============================================================

-- Habilitar extensão de UUID
create extension if not exists "uuid-ossp";

-- Tabela de perfis
create table if not exists profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  nome text not null,
  telefone text,
  whatsapp text,
  cpf text,
  data_nascimento text,
  avatar_url text,
  notif_whatsapp boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de contas (representa o banco/credor)
create table if not exists contas (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  nome_banco text not null,
  categoria text not null default 'Outro',
  dia_vencimento integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de compras (vinculadas a uma conta/banco)
create table if not exists compras (
  id uuid default gen_random_uuid() primary key,
  conta_id uuid references contas(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  descricao text not null,
  valor numeric(10,2) not null,
  parcela_atual integer not null default 1,
  total_parcelas integer not null default 1,
  created_at timestamptz default now()
);

-- Tabela de salários
create table if not exists salarios (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  valor numeric(12, 2) not null default 0,
  mes_referencia text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, mes_referencia)
);

-- Row Level Security (RLS)
alter table profiles enable row level security;
alter table contas enable row level security;
alter table compras enable row level security;
alter table salarios enable row level security;

-- Políticas para profiles
create policy "Usuários veem apenas seu próprio perfil"
  on profiles for select
  using (auth.uid() = user_id);

create policy "Usuários inserem apenas seu próprio perfil"
  on profiles for insert
  with check (auth.uid() = user_id);

create policy "Usuários atualizam apenas seu próprio perfil"
  on profiles for update
  using (auth.uid() = user_id);

-- Políticas para contas
create policy "Usuários veem apenas suas próprias contas"
  on contas for select
  using (auth.uid() = user_id);

create policy "Usuários inserem apenas suas próprias contas"
  on contas for insert
  with check (auth.uid() = user_id);

create policy "Usuários atualizam apenas suas próprias contas"
  on contas for update
  using (auth.uid() = user_id);

create policy "Usuários deletam apenas suas próprias contas"
  on contas for delete
  using (auth.uid() = user_id);

-- Políticas para compras
create policy "compras: own data" on compras
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Políticas para salários
create policy "Usuários veem apenas seus próprios salários"
  on salarios for select
  using (auth.uid() = user_id);

create policy "Usuários inserem apenas seus próprios salários"
  on salarios for insert
  with check (auth.uid() = user_id);

create policy "Usuários atualizam apenas seus próprios salários"
  on salarios for update
  using (auth.uid() = user_id);

create policy "Usuários deletam apenas seus próprios salários"
  on salarios for delete
  using (auth.uid() = user_id);

-- Trigger para criar perfil automaticamente ao registrar usuário
create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, nome, whatsapp, telefone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', new.email),
    new.raw_user_meta_data->>'whatsapp',
    new.raw_user_meta_data->>'telefone'
  );
  return new;
end;
$$ language plpgsql;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
