-- Dabhade PG database
create extension if not exists "pgcrypto";

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  room_no text unique not null,
  floor text default 'Ground',
  capacity integer default 1,
  rent numeric(10,2) default 0,
  status text default 'Available' check (status in ('Available','Occupied','Maintenance')),
  created_at timestamptz default now()
);

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  email text,
  aadhaar text,
  room_no text,
  address text,
  parent_name text,
  parent_phone text,
  security_deposit numeric(10,2) default 0,
  join_date date default current_date,
  status text default 'Active' check (status in ('Active','Inactive')),
  document_path text,
  created_at timestamptz default now()
);

create table if not exists public.rents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  month date not null,
  amount numeric(10,2) not null,
  status text default 'Pending' check (status in ('Paid','Pending')),
  payment_method text check (payment_method in ('Cash','UPI','Bank')) default 'UPI',
  paid_at timestamptz,
  created_at timestamptz default now()
);

alter table public.rooms enable row level security;
alter table public.tenants enable row level security;
alter table public.rents enable row level security;

-- For the first private admin deployment, these policies allow authenticated admins.
create policy "authenticated rooms" on public.rooms for all to authenticated using (true) with check (true);
create policy "authenticated tenants" on public.tenants for all to authenticated using (true) with check (true);
create policy "authenticated rents" on public.rents for all to authenticated using (true) with check (true);

insert into public.rooms (room_no,floor,capacity,rent,status)
values ('101','1st Floor',2,6500,'Available'),
       ('102','1st Floor',2,6500,'Available'),
       ('201','2nd Floor',3,6000,'Available')
on conflict (room_no) do nothing;

-- Create a Storage bucket named "tenant-documents" in Supabase Storage.
-- Keep the bucket PRIVATE and use authenticated access policies.
