
--connect to psql or run with db connected

--in psql: *** must type in passwords below
create role adminmooselocal login createdb password 'same_pass_here';
create role safemoose login password 'same_pass_here';
create role readonlymoose login password 'same_pass_here';
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

create database maindb owner adminmooselocal encoding "utf8";
\connect maindb adminmooselocal

-- Create all tables and objects, and after that:

\connect maindb postgres

--revoke connect on database maindb from public;
revoke all on schema public from public;
revoke all on all tables in schema public from public;

--local only user with all privileges
grant connect on database maindb to adminmooselocal;
grant all on schema public to adminmooselocal;
grant all on all tables in schema public to adminmooselocal;
grant all on all sequences in schema public to adminmooselocal;
grant all on all functions in schema public to adminmooselocal;

--normal external user with select, update, insert
grant connect on database maindb to safemoose;
grant usage on schema public to safemoose;
grant select, insert, update, references, trigger on all tables in schema public to safemoose;
grant usage, select on all sequences in schema public to safemoose;
grant execute on all functions in schema public to safemoose;

--read only user
grant connect on database maindb to readonlymoose;
grant usage on schema public to readonlymoose;
grant select on all tables in schema public to readonlymoose;
grant usage, select on all sequences in schema public to readonlymoose;
grant execute on all functions in schema public to readonlymoose;

--admin local user
alter default privileges for role adminmooselocal in schema public
    grant all on tables to adminmooselocal;

alter default privileges for role adminmooselocal in schema public
    grant all on sequences to adminmooselocal;

alter default privileges for role adminmooselocal in schema public
    grant all on functions to adminmooselocal;

--normal user
alter default privileges for role safemoose in schema public
    grant select, insert, update, references, trigger on tables to safemoose;

alter default privileges for role safemoose in schema public
    grant usage, select on sequences to safemoose;

alter default privileges for role safemoose in schema public
    grant execute on functions to safemoose;

-- read only user
alter default privileges for role readonlymoose in schema public
    grant select on tables to readonlymoose;

alter default privileges for role readonlymoose in schema public
    grant usage, select on sequences to readonlymoose;

alter default privileges for role readonlymoose in schema public
    grant execute on functions to readonlymoose;

