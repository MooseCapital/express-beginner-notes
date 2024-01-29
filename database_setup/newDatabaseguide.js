/*
    New postgres database setup guide -

    1) we will need the uuid extension to create uuid's when inserting rows
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    2) open database_setup.sql and run it in psql or in intelij/vscode with database connected
        -> remember to type in the passwords for users

    3) when making new databases, follow the additional_db_setup.sql file

    4) to create tables and insert, remember some basic columns
        CREATE TABLE people (
            id uuid DEFAULT uuid_generate_v4(),
            first_name character varying(50),
            age integer,
            favorite_color character varying(5),
            birthdate date,
            primary key(id)
        );



    5) if we get an error when accessing table it means we set privileges before the table was created so they don't apply
        -> we must set the privileges to all future tables on the same user we will be using, if we create it on adminmooselocal
        -> that has delete privileges, we don't have all our safe privileges on safemoose, so we should give safemoose create
        -> privileges, then use it daily and switch to adminmooselocal when we need a delete OR we can create all our tables
        -> and grant again below which applies to all current tables only

        grant all on all tables in schema public to adminmooselocal;
        grant select, insert, update, references, trigger on all tables in schema public to safemoose;
        grant select on all tables in schema public to readonlymoose;

        alter default privileges for role adminmooselocal in schema public
            grant all on tables to adminmooselocal;

        alter default privileges for role safemoose in schema public
            grant select, insert, update, references, trigger on tables to safemoose;

        alter default privileges for role readonlymoose in schema public
            grant select on tables to readonlymoose;


    6) we may or may not backup the database with role passwords stored, so we need to set them on restore
        ALTER ROLE username WITH PASSWORD 'password';


    7) cockroachlabs db setup - since we can't easily set default privileges on our users, when we make a new table, set it
        GRANT SELECT,INSERT,UPDATE ON TABLE * TO safemoose;
        GRANT SELECT ON TABLE * TO readonlymoose;
        GRANT All ON TABLE * TO adminmooselocal;

*/












