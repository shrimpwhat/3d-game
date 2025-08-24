CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

create table users(
    id uuid primary key default uuid_generate_v4(),
    login char(255),
    password varchar default 123
)