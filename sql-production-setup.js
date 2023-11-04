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

sudo -u postgres psql

# in psql:
create role $ROLE_LOCAL login createdb;
\password $ROLE_LOCAL
create role $ROLE_REMOTE login;
\password $ROLE_REMOTE

create database $DB owner $ROLE_LOCAL encoding "utf8";
\connect $DB $ROLE_LOCAL

# Create all tables and objects, and after that:

\connect $DB postgres

revoke connect on database $DB from public;
revoke all on schema public from public;
revoke all on all tables in schema public from public;

grant connect on database $DB to $ROLE_LOCAL;
grant all on schema public to $ROLE_LOCAL;
grant all on all tables in schema public to $ROLE_LOCAL;
grant all on all sequences in schema public to $ROLE_LOCAL;
grant all on all functions in schema public to $ROLE_LOCAL;

grant connect on database $DB to $ROLE_REMOTE;
grant usage on schema public to $ROLE_REMOTE;
grant select, insert, update, delete on all tables in schema public to $ROLE_REMOTE;
grant usage, select on all sequences in schema public to $ROLE_REMOTE;
grant execute on all functions in schema public to $ROLE_REMOTE;

alter default privileges for role $ROLE_LOCAL in schema public
    grant all on tables to $ROLE_LOCAL;

alter default privileges for role $ROLE_LOCAL in schema public
    grant all on sequences to $ROLE_LOCAL;

alter default privileges for role $ROLE_LOCAL in schema public
    grant all on functions to $ROLE_LOCAL;

alter default privileges for role $ROLE_REMOTE in schema public
    grant select, insert, update, delete on tables to $ROLE_REMOTE;

alter default privileges for role $ROLE_REMOTE in schema public
    grant usage, select on sequences to $ROLE_REMOTE;

alter default privileges for role $ROLE_REMOTE in schema public
    grant execute on functions to $ROLE_REMOTE;

# CTRL+D*/
