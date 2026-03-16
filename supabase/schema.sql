-- Common tables (shared across DAWN SERIES)
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  created_at timestamptz default now()
);

create table if not exists staff (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id),
  user_id uuid references auth.users(id),
  name text not null,
  role text default 'member',
  created_at timestamptz default now()
);

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id),
  name text not null,
  email text,
  phone text,
  company text,
  created_at timestamptz default now()
);

-- HR-specific tables
create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id),
  user_id uuid references auth.users(id),
  name text not null,
  email text not null,
  role text,
  department text,
  employment_type text check (employment_type in ('full_time','part_time','contract')),
  hourly_wage numeric,
  monthly_salary numeric,
  join_date date,
  created_at timestamptz default now()
);

create table if not exists attendance_logs (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id),
  date date not null,
  clock_in timestamptz,
  clock_out timestamptz,
  break_minutes integer default 0,
  work_minutes integer,
  overtime_minutes integer default 0,
  status text default 'present' check (status in ('present','absent','late','leave')),
  notes text
);

create table if not exists leave_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id),
  type text check (type in ('paid','unpaid','sick','special')),
  start_date date not null,
  end_date date not null,
  reason text,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  approved_by uuid references employees(id)
);

create table if not exists shifts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id),
  employee_id uuid references employees(id),
  date date not null,
  start_time time,
  end_time time
);

-- RLS policies
alter table organizations enable row level security;
alter table staff enable row level security;
alter table contacts enable row level security;
alter table employees enable row level security;
alter table attendance_logs enable row level security;
alter table leave_requests enable row level security;
alter table shifts enable row level security;

create policy "staff_org_access" on organizations for all using (
  id in (select organization_id from staff where user_id = auth.uid())
);

create policy "staff_self_access" on staff for all using (
  user_id = auth.uid()
);

create policy "staff_insert" on staff for insert with check (true);

create policy "org_insert" on organizations for insert with check (true);

create policy "employees_org_access" on employees for all using (
  organization_id in (select organization_id from staff where user_id = auth.uid())
);

create policy "attendance_org_access" on attendance_logs for all using (
  employee_id in (
    select id from employees where organization_id in (
      select organization_id from staff where user_id = auth.uid()
    )
  )
);

create policy "leaves_org_access" on leave_requests for all using (
  employee_id in (
    select id from employees where organization_id in (
      select organization_id from staff where user_id = auth.uid()
    )
  )
);

create policy "shifts_org_access" on shifts for all using (
  organization_id in (select organization_id from staff where user_id = auth.uid())
);
