-- ============================================================
-- SISTEMA DE CONTROL - PELUQUERÍA
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- Catálogo de servicios
create table if not exists servicios_catalogo (
  id         uuid default gen_random_uuid() primary key,
  nombre     text not null,
  precio     decimal(12,0) not null,
  activo     boolean default true,
  created_at timestamptz default now()
);

-- Cajas diarias
create table if not exists cajas (
  id             uuid default gen_random_uuid() primary key,
  fecha          date not null unique,
  hora_apertura  time,
  hora_cierre    time,
  monto_inicial  decimal(12,0) default 0,
  estado         text default 'abierta' check (estado in ('abierta', 'cerrada')),
  notas          text,
  created_at     timestamptz default now()
);

-- Atenciones (servicios realizados)
create table if not exists atenciones (
  id              uuid default gen_random_uuid() primary key,
  fecha           date not null,
  servicio_nombre text not null,
  precio          decimal(12,0) not null,
  notas           text,
  created_at      timestamptz default now()
);

-- Gastos
create table if not exists gastos (
  id          uuid default gen_random_uuid() primary key,
  fecha       date not null,
  categoria   text not null check (categoria in ('productos','alquiler','luz','agua','salarios','otros')),
  descripcion text not null,
  monto       decimal(12,0) not null,
  created_at  timestamptz default now()
);

-- ============================================================
-- Políticas de seguridad (RLS abierto para uso sin usuarios)
-- ============================================================
alter table servicios_catalogo enable row level security;
alter table cajas              enable row level security;
alter table atenciones         enable row level security;
alter table gastos             enable row level security;

create policy "allow_all" on servicios_catalogo for all using (true) with check (true);
create policy "allow_all" on cajas              for all using (true) with check (true);
create policy "allow_all" on atenciones         for all using (true) with check (true);
create policy "allow_all" on gastos             for all using (true) with check (true);

-- ============================================================
-- Datos iniciales del catálogo
-- ============================================================
insert into servicios_catalogo (nombre, precio) values
  ('Corte de cabello', 25000),
  ('Barba',            15000),
  ('Corte + Barba',    35000),
  ('Tintura',          60000),
  ('Tintura + Corte',  80000),
  ('Afeitado clásico', 12000),
  ('Mechas',           70000),
  ('Alisado',          80000)
on conflict do nothing;
