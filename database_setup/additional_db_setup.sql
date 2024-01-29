--setting up new database, not the table here, after the original database_setup has been ran
--  find and replace all $db_name

create database db_name owner adminmooselocal encoding "utf8";

\connect db_name postgres
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
grant connect on database db_name to adminmooselocal;
grant connect on database db_name to safemoose;
grant connect on database db_name to readonlymoose;

