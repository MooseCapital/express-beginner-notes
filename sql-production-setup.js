/*
# Read this before!
#
# * roles in postgres are users, and can be used also as group of users
# * $ROLE_LOCAL will be the user that access the db for maintenance and
#   administration. $ROLE_REMOTE will be the user that access the db from the webapp
# * you have to change '$ROLE_LOCAL', '$ROLE_REMOTE' and '$DB'
#   strings with your desired names
# * it's preferable that $ROLE_LOCAL == $DB

#-------------------------------------------------------------------------------

//----------- SKIP THIS PART UNTIL POSTGRES JDBC ADDS SCRAM - START ----------//

cd /etc/postgresql/$VERSION/main
sudo cp pg_hba.conf pg_hba.conf_bak
sudo -e pg_hba.conf

# change all `md5` with `scram-sha-256`
# save and exit

//------------ SKIP THIS PART UNTIL POSTGRES JDBC ADDS SCRAM - END -----------//


--connect to psql or run with db connected

--in psql: *** must type in passwords below
create role adminmooselocal login createdb password 'i7Vp0H0bArQrwZvMbDfX';
create role safemoose login password 'U26zHJ9B0Pl9IQVzDPag';
create role readonlymoose login password 'p6pb0VxYCQ69TpC0Fs4S';
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
grant select, insert, update on all tables in schema public to safemoose;
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
    grant select, insert, update on tables to safemoose;

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






*/
