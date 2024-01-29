create role adminmooselocal login createdb password 'same_pass_here';
create role safemoose login password 'same_pass_here';
create role readonlymoose login password 'same_pass_here';

create database maindb owner adminmooselocal encoding "utf8";
\connect maindb adminmooselocal;

GRANT ALL ON DATABASE maindb TO adminmooselocal;


REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO adminmooselocal;
GRANT USAGE ON SCHEMA public TO safemoose;
GRANT USAGE ON SCHEMA public TO readonlymoose;


 GRANT SELECT,INSERT,UPDATE ON TABLE * TO safemoose;
        GRANT SELECT ON TABLE * TO readonlymoose;
        GRANT All ON TABLE * TO adminmooselocal;