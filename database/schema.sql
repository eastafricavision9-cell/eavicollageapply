-- East Africa Vision Institute - Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Students table
create table if not exists students (
    id uuid default uuid_generate_v4() primary key,
    full_name varchar(255) not null,
    admission_number varchar(100) unique not null,
    email varchar(255) unique,
    phone varchar(50) not null,
    course varchar(255) not null,
    status varchar(50) default 'Pending' check (status in ('Pending', 'Accepted', 'Rejected')),
    kcse_grade varchar(10),
    location varchar(100),
    applied_at timestamp with time zone not null,
    source varchar(50) not null default 'manual',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Courses table
create table if not exists courses (
    id uuid default uuid_generate_v4() primary key,
    name varchar(255) unique not null,
    fee_balance numeric(10,2) default 0,
    fee_per_year numeric(10,2) default 0,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Email logs table
create table if not exists email_logs (
    id uuid default uuid_generate_v4() primary key,
    type varchar(100) not null,
    to_email varchar(255) not null,
    subject varchar(500) not null,
    student_name varchar(255) not null,
    student_id uuid references students(id) on delete set null,
    sent_at timestamp with time zone not null,
    status varchar(50) default 'sent' check (status in ('sent', 'failed')),
    created_at timestamp with time zone default now()
);

-- Settings table for admin configurations
create table if not exists admin_settings (
    id uuid default uuid_generate_v4() primary key,
    key varchar(100) unique not null,
    value text not null,
    description varchar(500),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create indexes for better performance
create index if not exists idx_students_email on students(email);
create index if not exists idx_students_status on students(status);
create index if not exists idx_students_course on students(course);
create index if not exists idx_students_applied_at on students(applied_at desc);
create index if not exists idx_courses_name on courses(name);
create index if not exists idx_email_logs_student_id on email_logs(student_id);
create index if not exists idx_email_logs_sent_at on email_logs(sent_at desc);
create index if not exists idx_admin_settings_key on admin_settings(key);

-- Create a function to update the updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create triggers to automatically update updated_at
create trigger update_students_updated_at
    before update on students
    for each row execute procedure update_updated_at_column();

create trigger update_courses_updated_at
    before update on courses
    for each row execute procedure update_updated_at_column();

create trigger update_admin_settings_updated_at
    before update on admin_settings
    for each row execute procedure update_updated_at_column();

-- Insert default courses
insert into courses (name, fee_balance, fee_per_year) values
    ('Business Administration', 85000, 120000),
    ('Computer Science', 95000, 130000),
    ('Information Technology', 90000, 125000),
    ('Public Health', 80000, 115000),
    ('Education', 75000, 110000),
    ('Engineering', 100000, 140000)
on conflict (name) do nothing;

-- Insert default admin settings
insert into admin_settings (key, value, description) values
    ('reporting_date', '', 'Default reporting date for new students'),
    ('approval_mode', 'manual', 'Approval mode: manual or automatic'),
    ('auto_approval_delay', '5', 'Minutes to wait before auto-approving students')
on conflict (key) do nothing;

-- Row Level Security (RLS) policies
alter table students enable row level security;
alter table courses enable row level security;
alter table email_logs enable row level security;
alter table admin_settings enable row level security;

-- Create policies for public access (you may want to restrict this later)
create policy "Enable read access for all users" on students for select using (true);
create policy "Enable insert access for all users" on students for insert with check (true);
create policy "Enable update access for all users" on students for update using (true);
create policy "Enable delete access for all users" on students for delete using (true);

create policy "Enable read access for all users" on courses for select using (true);
create policy "Enable insert access for all users" on courses for insert with check (true);
create policy "Enable update access for all users" on courses for update using (true);
create policy "Enable delete access for all users" on courses for delete using (true);

create policy "Enable read access for all users" on email_logs for select using (true);
create policy "Enable insert access for all users" on email_logs for insert with check (true);

create policy "Enable read access for all users" on admin_settings for select using (true);
create policy "Enable insert access for all users" on admin_settings for insert with check (true);
create policy "Enable update access for all users" on admin_settings for update using (true);
create policy "Enable delete access for all users" on admin_settings for delete using (true);

-- Create a view for student statistics
create or replace view student_stats as
select 
    count(*) as total_students,
    count(*) filter (where status = 'Pending') as pending_students,
    count(*) filter (where status = 'Accepted') as accepted_students,
    count(*) filter (where status = 'Rejected') as rejected_students,
    count(*) filter (where source = 'online_application') as online_applications,
    count(*) filter (where source = 'manual') as manual_entries
from students;