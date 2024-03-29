/*
    A single table will NOT have all our information in 1
    we will split up big data groups in its own table and match them by id's
        This means users will have some id for their car and pc. we do NOT show all details of their car and pc in the user's row
        That would be crazy complicated, we're going another table deep. the id of users car and pc will be in their own car table and pc table.
        Then the car table would have a column for model, year, miles.. etc. we separate the data!


        database - structured set of data in a computer;

        relational db - database organized according to the relational model of data. In simple terms, the relational model defines a set of relations
            for tables. These use a Relational Database management system (RDBMS) EX. mysql, sqlite, postgresql.

        Primary key - table can only have a single primary key, must be unique. used to identity each row data in the database.

        SQL - structured query language, programming language used to communicate with relational databases.
        https://www.w3schools.com/sql/default.asp

        https://www.postgresqltutorial.com/postgresql-getting-started/what-is-postgresql/

    To connect sql to nodejs, we have something like np for postgresql, https://node-postgres.com/ for raw queries.
        npm install np

    Objection js will use the knex ORM, using ORMS, we still need to install the node/sql connection for the sql db were using like mysql, postgresql, sqllite..
        npm install np or mysql or mysql2 or sqlite3
    Knex js if we don't need more powerful objection js https://knexjs.org/
    or we let an ORM make them for us, but we still need to know sql https://vincit.github.io/objection.js/guide/getting-started.html
            npm install objection knex


SQL CODE:
      TABLE creating / modifying
        create table - Note instead of making an id ourselves, we can set it to auto increment, it means id starts at 1,
            then counts when new rows get added, 1,2,3..

                CREATE TABLE people (id PRIMARY KEY, name varchar(255), age int)
                CREATE TABLE people (id PRIMARY KEY AUTO_INCREMENT, name varchar(255), age int)

        Table data types -
            BLOB - binary data type
            INTEGER - number
            DECIMAL - for decimal numbers like money, pick decimal places, shorthand DEC(2,10)
            DATE - YYYY-MM-DD , TIMESTAMP/DATETIME just adds time YYYY-MM-DD HH:MI:SS
            NUMERIC - date/time in standardized format, YYYY-MM-DD
            REAL - decimal point number
            VARCHAR - can select limit with (), will adjust space down to length it uses, for unknown lengths VARCHAR(20)
            CHAR - strict character limit that will use the entire space we pick, only for known text lengths CHAR(10)
            TEXT - string text

            constraints:
            UUID - type in PostgreSQL for uuids - https://www.cockroachlabs.com/docs/stable/uuid#create-a-table-with-auto-generated-unique-row-ids
            NOT NULL - will give error if we don't input value or put in null when inserting, this helps if cell can NOT be blank
            UNIQUE - when we want to make sure any value in column is truly unique, like email address, ssn.. etc https://www.cockroachlabs.com/docs/v23.1/unique
            DEFAULT - set default value if none is written, we can put UUID function as default to generate it.
            CHECK - warranty_period INT CHECK (warranty_period BETWEEN 0 AND 24) -> ensure a value is in a range of vlaues or equal to a value
            PRIMARY KEY - constraint uniquely identifies each record in a table. no null values
                -> inserting in table could look like, ID int NOT NULL PRIMARY KEY,

            FOREIGN KEY - field in 1 table that references a PRIMARY KEY in another table
                FOREIGN KEY (PersonID) REFERENCES Persons(PersonID)
                ->Using a foreign key constraint helps us ensure that only data that can be linked to the
                    -> referenced table can be entered into our database.
                -> if we do NOT use foreign keys and need matching tables to connect data. we could mistype text and it would be inserted
                    ->where a foreign key will make sure the data is EXACTLY in the other table to insert

        insert new row into table -
             INSERT INTO table_name (id_num, 'bob', 33, 'cool')

            -> we do not need to say the column names, but the values must be in the correct order, we can also say the columns though, we are repeating ourselves.
                INSERT INTO table_name (column_id, name, age , isLame) VALUES (10, 'gary', 34, 'lame')

            -> when inserting with AUTO_INCREMENT, we don't need to name the primary key column if using column names to insert.
                INSERT INTO table_name (name, age , isLame) VALUES (10, 'gary', 34, 'lame')

            -> when inserting, but we DONT have data for all columns, we can just leave it out when naming columns or not. the empty cells simply say "NULL"
               -> see how it's auto incrementing ID, and we left out the 'lame' column value

                INSERT INTO table_name (name, age) VALUES ('gary', 34)

            -> insert multiple rows at once, if we have our format right, no need to retype INSERT INTO again.. simply repeat the values data, separate by comma,
                -> then end with semicolon like always.

                INSERT INTO table_name (name, age , isLame)
                VALUES
                    ( 'gary', 34, 'lame'),
                    ( 'bob', 44, 'cool'),
                    ( 'sara', 24, 'lame');



        Table db design - determine if we have 1 to 1 relationship, 1 to many, many to many etc..
            we use multiple tables when a cell might need more than 1 value, such as the imdb example in cs50.
            an actor/person has 1 id, if we put shows as a column then we only have room for 1 tv show/person.
            -> but if we make shows it's own table, we can have the show info and show id
            -> then in another star table, match show id to many person id, this way, we're not repeating show info.
            -> of course, in stars table, we are repeating tv shows id, to many person_id, since many people are in the show to match with it.
                -> doing this, the stars table has 2 columns, it simply exist to match show_id to person_id,

            the teacher now uses sub queries from multiple databases, since we must query data from multiple dbs, we search all comedy id's
                -> then must search those show table by show_id's to get the shows title column for all comedies.
                    SELECT title from shows where id IN(SELECT show_id FROM genres WHERE genre = 'comedy')
                -> good practice is to never type in any id's or anything, we should always be querying/searching, not hard coding values in a search

                -> 1) we perform 3 query's in 1 to match foreign keys in tables. That finally gets us a column with text that is NOT an id. woo
                    SELECT title FROM shows WHERE id IN (SELECT show_id FROM stars WHERE person_id = (SELECT id FROM people WHERE name = 'Steve Carell'))

                -> 2) we can repeat the query above in another way, using JOINS basically joining, people id, stars id, show id columns
                    -> Implicit way, tell sql join and it does, next is explicit, where we match the data exactly, not JOIN for us..
                        SELECT title FROM people
                            JOIN stars ON people.id = stars.person_id
                            JOIN shows on stars.show_id = shows.id
                            WHERE name = 'Steve Carel';

                -> 3) Explicit way, we tell sql exactly where to select title column, and to match id = other tables id
                        -> we will mostly be using INNER JOIN rather than this explicit way, because JOINS are easier to read when the query gets very long
                            SELECT title from people, stars, shows
                                WHERE people.id = stars.person_id
                                AND stars.show_id = shows.id
                                AND name = 'Steve Carell';


        id random number - for our primary key every row must be unique, if we autoincrement, then we get 1,2,3.. but we don't want the first users to see in
            the pages route that they are user number 5.. oof. so we generate big numbers with almost infinite combinations using UUID.v4()
            "we have X users, store Y documents and this specific medical function has been called Z number of times".
            You use random IDs (normally UUIDs) to avoid leaking data you don't intend to share publicly.
            UUIDv4 - npm i uuid   https://www.npmjs.com/package/uuid
            https://www.cockroachlabs.com/blog/what-is-a-uuid/
            -> when connecting multiple tables, those ids when AUTOINCREMENT will overlap.. not good


        CHAR vs VARCHAR - the type of data into the column for sql, Character vs variable character
            CHAR - fixed length, if we have CHAR(10) and "mike" goes in there, it uses 6 empty bytes of space.. oof.
                storage size is of length we set in CHAR(#)
            VARCHAR - variable length, if we have VARCHAR(10) and "bob" goes inserted, it uses only 3 bytes of space.
                storage size is the actual length of string inputted.

                use CHAR when we expect the same length every time like preset form options. such as state codes, always 2: CA,AL,TX..
                VARCHAR without () parenthesis will give us 8000 byte max for data.

                we can NOT simply always use VARCHAR since it uses more cpu cycles, it will slow us down more than CHAR when we can use it
                    -> this means the database must check the data's length as well as content when searching. vs CHAR() telling the db its length.


        TABLE - add, rename, update, delete/drop https://www.w3schools.com/sql/sql_alter.asp
                ALTER TABLE table_name ADD column_name datatype;


    Column creating / modifying

        SELECT columns - SELECT * -> star/asterisk means all columns, basically select the entire db
                SELECT * FROM table_name
            -> since we know we can select individual columns, we get first_name column only and all its rows
                SELECT first_name FROM people

        Most useful SQL functions - must call var inside their parenthesis COUNT(*)
            AVG - gets average of all numbers in column, if any text it gives 0
            COUNT - count all rows in a column or entire db * (same number)
            DISTINCT - gets all unique values, and puts overlaps them into columns, basically filters down and combines
            LOWER
            MAX - gives largest number value in a column, if text only, it gives alphabetical order closest to Z.
            MIN - gives smallest number value in column, if text only, it gives alphabetical order closest to A.
            UPPER
            Length() - get the length of letters in text



        DISTINCT - gives each Unique value in a column, the country gave us 40 rows, so we know there are 40 countries
            -> but we want to COUNT that in the future, remember distinct is counting overlapping unique values
            SELECT DISTINCT (country) FROM people

        COUNT - counts the number of rows in a column, combine with filtered data or we will always get the total
           -> number of rows in the db.. not that useful. so we combine with DISTINCT!
            SELECT count(country) FROM people  -> asterisk and any column gives the SAME amount, need to filter!!
            SELECT COUNT(DISTINCT(country)) FROM people -> instead of the a big row of 40 countries listed, we now count 40 unique countries

            -> since we are counting the column header is our query - Count(Distinct(country)) we can rename this using "as"
                SELECT COUNT(DISTINCT(country)) AS countryCount FROM people




        AS - rename your column name in query, technically creates alias for the column
            SELECT COUNT(DISTINCT(country)) AS countryCount FROM people

        WHERE - lets us filter data WHERE a condition is true, Distinct only got unique values, now we PICK what value to filter by!
        LIKE - instead of searching exactly, we can search for starting letter etc.. like regex pattern in javascript
        ORDER BY - sorting use, ORDER BY (column_name) ASC if going to biggest, or DESC if starting big to smallest.
        LIMIT - limit number of rows we get back, if its large amount.. get smaller amount
        GROUP BY - how to group calculated data from a single or multiple tables. ex count the # of all post, group by its id or name etc.

        WHERE - filter values specifically, put in single quotes for comparing text values. Operators used with 'WHERE' -> =, >, <, >=, <= , <>
        <>  - means not equal, some sql versions use js standard !=   , BETWEEN -> between a certain range, between seems to simplify using a combination > and <
        LIKE -> search for a pattern,  IN ->to specify multiple possible values for a column
        SELECT * FROM people WHERE favorite_color = 'blue'; -> we get every row that has 'blue' for favorite color,  26 rows listed
        SELECT COUNT(*) FROM people WHERE favorite_color = 'blue'; -> count how many rows count 'blue' for favorite color - 26

        BETWEEN - gives values within a range
            SELECT column_name(s) FROM table_name WHERE column_name BETWEEN value1 AND value2;
            -> example query, we can also use NOT, so it's outside the range, not inside it.. or between it
                SELECT * FROM Products WHERE Price NOT BETWEEN 10 AND 20;
            -> we combine a between query and 'IN' for multiple options, ages 20-40 while checking for favorite colors that aren't purple or blue.
                SELECT * FROM people WHERE age BETWEEN 20 AND 40 AND favorite_color NOT IN ('purple', 'blue');

        IS - IS NULL lets us select NULL items or when its empty. we can NOT do where item = NULL -> item IS NULL


        IN - lets us select multiple values in a WHERE condition, so we have more options easily
            -> it's a shorthand for 'or' operator,
                SELECT * FROM people WHERE country = 'Russia' OR country = 'China';
                SELECT * FROM people WHERE country IN ('Russia', 'China');
            -> notice we are typing out all the options inside IN.. we can make this even simpler using sub-query, query inside query
                -> notice we are checking the orders table if our customer is in there, to see if they have ordered. works with multiple tables only.
                    -> to check if our data is somewhere else,
                SELECT * FROM Customers WHERE CustomerID IN (SELECT CustomerID FROM Orders);



        LIKE - pattern for searching not exact values, such as city names starting with B. https://www.w3schools.com/sql/sql_like.asp
            -> use in combination with wildcards for more regex like patterns https://www.w3schools.com/sql/sql_wildcards.asp
            -> percent % sign can represent, 0,1, or more character,
            -> _ underscore sign can represent only one character

            -> this simply searches for country starting with C, no defined length
                SELECT * FROM people WHERE country LIKE 'C%';
            -> if we put % in front of search term, it can be any length, so 'cat' search could be anywhere in the sentence, where __ defines length
                SELECT * FROM animals WHERE animal LIKE '%cat%'     -> gray shorthair cat
            -> underscore can define a max length for us, here we don't search exact names, but first names with 4 letters only
                SELECT * FROM people WHERE first_name LIKE '____';

        SUBSTR - similar to LIKE, but now we can define a start/end index for the text search,
            this is like in js, grab letters in index position of a string
                SUBSTR(column_name, startindex, number_of_characters_tocount) -> SUBSTR(name,1)  -> we start at one and count whole string

        LEFT -  similar to substr except we start at index and count to left instead of right
            -> if our name is moose, we start at index 3, count left and get 'Moo'
                LEFT(name, 3)

        CASE - is the equivalent to the "switch" statement in js, or if,else.. when it finds a true statement, it stops. if none are found. it goes to 'else'
                 -> if there is no else part, it stops and returns null
                 -> we select our table or columns, then make a new column with these values matching up with the others
                    -> this is a temporary change, we can probably use case to update columns as well
                        SELECT *,
                        CASE WHEN species = 'human' THEN "talk"
                        CASE WHEN species = 'cat' THEN "meow"
                        CASE WHEN species = 'dog' THEN "bark"
                        ELSE NULL
                        END AS sound
                        FROM friends_of_pickles;


        Coalesce - returns the first item in all columns that is NOT null, https://www.w3schools.com/sql/func_sqlserver_coalesce.asp
            SELECT name, COALESCE(gun, sword) AS weapon FROM fighters;

        GROUP BY - we select multiple columns and group it by one, earlier if we SELECT COUNT(color) -> we simply get 1 columns with counts of all colors
            -> this data does NOT tell us much because we get the counts but I don't know which colors have the counts, so i need another column to tell me
                -> we must GROUP BY the same column we select to get relevant data, or else were shown data that is not the same column we select, not useful..
                SELECT gender, count(*) FROM people GROUP BY gender;

            -> above is only counting / grouping data in a single table. below is combing multiple
            -> when joining tables, we need to group by a certain column, such as when getting the count of all post a users id has, group by user id/name
                SELECT users.id, users.name, COUNT(posts.id) AS posts_written
                  FROM users
                  JOIN posts ON users.id = posts.user_id
                  GROUP BY users.id;
            -> we use GROUP BY to group the row data by a certain column first, then can set a condition on top of that with having, not where.
            select count(customerid), state from customers
            group by state
            having count(customerid) > 1;


        Having - is essentially the WHERE for aggregates. Conditionally retrieve records from aggregate functions,
            -> when using the count of a columns data from joining 2 tables, then group BY..
            -> we can NOT simply use where to get a specific users aggregated data form 2 table joins. HAVING replaces where for this!
                 SELECT users.id, users.name, COUNT(posts.id) AS posts_written
                  FROM users
                  JOIN posts ON users.id = posts.user_id
                  GROUP BY users.id
                  HAVING posts_written >= 10;

        ORDER BY - sort a list, used when we want largest number in a column and need the rest of a rows data. order by largest then LIMIT 1, get all its data.
            -> we get 2 columns, gender and the count of each in 2nd column, then order least to greatest count.
            -> we could also order by gender, going from a-z, but the numbers are now no longer least to greatest..
            SELECT gender, count(*) FROM people GROUP BY gender ORDER BY count(*);

        LIMIT - we saw how to sort columns above with order by, now LIMIT simply limits the amount of results back
            -> we would likely want to sort before limiting such as, big to small, now limit 1 gives us the row with highest number in something.. etc
            -> not DESC order and LIMIT 1, top gender counted
            SELECT gender, count(*) FROM people GROUP BY gender ORDER BY count(*) DESC LIMIT 1;

            SELECT * FROM friends_of_pickles ORDER BY height DESC;

        UPDATE - almost what it says it is. we update values. **NOTE this is destructive we are replacing values in the DB, we should have backups  https://www.w3schools.com/sql/sql_update.asp
                    UPDATE table_name SET column 1 = value, column2 = value, WHERE condition = otherValue;
            -> basically select rows where certain condition, now overwrite certain column data on these selected rows, its a "find and replace"
            -> if we omit the WHERE clause, all records will be updated!
            **ALWAYS BACK UP data since we can override data if we forget WHERE condition!

            -> we set all favorite_color to purple, on only female genders * we typed 'female' first, case-sensitive always!
                UPDATE people SET favorite_color = 'purple' WHERE gender = 'Female';

        DELETE - delete records like UPDATE updates them.
            -> this deletes ALL records where condition is true, if condition is omitted, ALL records will be deleted
                -> **always make backups, usually you will probably not delete a users row, but simply updated some "isDeleted" column to true/false
            DELETE FROM table_name WHERE condition;
            DELETE FROM people WHERE id = 1;

            Delete entire table - DROP TABLE table_name

        AND - just like the && javascript, both checks 2 statements now instead of only one in where
            -> we combine 2 conditions with where
                SELECT * FROM people WHERE favorite_color = 'red' AND gender = 'Female';
            -> we now combine 3 conditions with WHERE and multiple operators
                SELECT * FROM people WHERE favorite_color = 'red' AND gender = 'Female' AND age > 50;

        OR - same as || 'or' in js, gives us multiple different conditions, where AND requires multiple conditions to be true;
                SELECT * FROM friends_of_pickles WHERE height_cm > 25 OR species = 'cat';

        XOR - combination of or & and, where it works like or, but if both conditions are true it is excluded
                -> here china is excluded, since its population is over 250m and area over 300km, other countries meeting one condition are included though
                select name, population, area from world
                where population > 250000000 xor area > 3000000

        UNION - combine results from two or more SELECT statements and get the column in common from them
            this is NOT like join, joins gets us the columns we want to combine from multiple tables
            -> where UNION gives us only the matching data columns from both tables.
                SELECT City FROM Customers UNION ALL SELECT City FROM Suppliers;

        EXIST - The EXISTS operator checks whether a subquery is empty or not, instead of checking whether values are in the subquery.
            SELECT column_name(s) FROM table_name WHERE EXISTS (SELECT column_name FROM table_name WHERE condition);


        All - instead of seeing if a value is 'in' or not in another subquery search etc.. must satisfy condition with ALL the data in the set
            -> likely used with other operates that aren't necessarily equal to, but greator/lesser
                SELECT mID, Rating
                FROM Review
                WHERE Rating >= all (SELECT Rating FROM Review);

        Any - like 'all' above, but does NOT have to satisfy condition with all elements, it only needs to meet the condition with one element in the data
                -> this would return lots of values, since many have year above any movie values.
                SELECT Title, Year
                FROM Movie
                WHERE Year > ANY (SELECT Year FROM Movie);


        JOIN - combine rows from 2 or more columns based on data between them, likely the primary key/ foreign key that matches and other stuff
              -> here we combine data with the same id, but we select everything, so there are 2 columns showing same id, peoplehalf1.id & peoplehalf2.id
                    SELECT * FROM peoplehalf1 JOIN peoplehalf2 on peoplehalf1.id = peoplehalf2.id;
              -> combine same data now both tables are joined, filter it down by shirt size
                    SELECT * FROM peoplehalf1 JOIN peoplehalf2 on peoplehalf1.id = peoplehalf2.id WHERE shirt_size = 'M';
              -> make a join that might need 2 conditions, see buyers price range and homes for sale table..
                    -> we've joined 2 tables by BETWEEN condition, not id = id,
                    -> we also used table alias's to save a lot of typing. write the alias letter after JOIN and FROM table name
                    SELECT h.price, h.id FROM buyers b JOIN houses h ON h.price BETWEEN b.min_price AND b.max_price

              -> column alias, since inner JOINS will give us multiple id columns when matching by id, we either select * simply,
                -> or select each individual column we want. we select each column which is longer, and also use alias to reduce typing.
                -> we exclude the duplicate 2nd id, then rename table 1 id to simply 'id' and not peoplehalf1.id
                     SELECT p1.id AS id, p1.first_name, p1.gender, p1.country, p1.race,
                            p2.color, p2.icecream, p2.shirt_size, p2.car
                         FROM peoplehalf1 p1
                         JOIN peoplehalf2 p2
                            ON p1.id = p2.id;

            self JOINS - joining 2 copies of the same table, some use cases are parent child / hierarchical relationships in the same table,
                -> in the users table, we have column for employees, normal staff, managers, supervisors etc..
                -> the manager would be a foreign key to the staff id in the same table, it would not make sense to have a whole new table for a category of employee
                     ***   -> note we use alias for manager MAN that IS in the employee table -> simply treat the self join as a different table, join itself

                        SELECT EMP.Name  AS Employee_Name, EMP.Title AS Emplyee_Title,
                        MAN.Name AS Manager_Name, MAN.Title AS Manager_Title
                        FROM Employees AS EMP
                        LEFT JOIN Employees AS MAN
                        ON EMP.Manager_Employee_ID = MAN.Employee_ID
                                -> see how we join on the manager id vs employee id, this is where the data is different, likely null for normal employees

                -> a persons example used self join to see if any accounts have duplicate emails, so we join these accounts into one id row
                    SELECT a.id, b.id FROM account a
                    JOIN account b on b.email = a.email
                    WHERE b.id != a.id

                    -> of course this use case is good for self joining, but in the referral case, we could have a new table matching each refer id to users

            Outer joins -we will maybe use these 1% of the time, since a join is joining matching rows together all outer joins or not matched,
                -> basically get which rows match between tables, and full outer, gets the rest. basically combine everything no matter what,
                -> left/right outer join will only get from the left/right side that doesn't match etc..
                -> when a table has no value or null value and we try to join by it, it will not be included, but we might want to include all the data
                    -> so we would do a left/right join to get all data from the side we want or do OUTER join to get the other sides data as well
                        SELECT teacher.name, dept.name
                         FROM teacher LEFT JOIN dept
                                   ON (teacher.dept=dept.id)


        INDEX - makes searching in the db more quickly, by turning our data from a list, to a node tree https://use-the-index-luke.com/
            -> the tradeoffs are more storage space to create this, and it slows down writes, in a big db, this storage space can be too expensive
            ->
                CREATE INDEX index_name ON table_name (column1, column2);
            -> delete index
                DROP INDEX index_name ON table_name;

            ->crdb will make the primary key auto index, so our UUID key will be auto indexed since we search by it most often

        TRANSACTION - multiple queries that must happen after another and not be interrupted such as bank deposit/withdraw https://www.cockroachlabs.com/docs/stable/transactions
                        https://www.postgresqltutorial.com/postgresql-tutorial/postgresql-transaction/
                    -> we want to be assured, either ALL of these transactions happen or NONE of them do, or.. we might have money doubling errors OOF!
                -> any time during the transaction, we can ROLLBACK before COMMIT, to undo everything. Potentially useful with IF conditions or others
                -> we ROLLBACK to a set savepoint, this can be at start or after we do certain things, this runs on database error, also on errors the entire
                -> transaction would not complete either so that is good, no changes can be seen inside the transaction until AFTER COMMIT

                -> if we do not have COMMIT, nothing will save to the database, postgres guarantees it will save to db on commit, even if crash happens right after
                    BEGIN TRANSACTION;
                        SAVEPOINT foo;
                        INSERT INTO kv VALUES (5,5);
                        SAVEPOINT bar;
                        INSERT INTO kv VALUES (6,6);
                        ROLLBACK TO SAVEPOINT foo;
                    COMMIT;

        CSV to postgres - https://www.postgresqltutorial.com/postgresql-tutorial/import-csv-file-into-posgresql-table/

        Injection attacks - https://www.w3schools.com/sql/sql_injection.asp
            using single quotes to input variables leaves room for the user to input email in single quotes
            -> then the attacker can put sql code to run in single quotes.
                https://www.comparitech.com/blog/information-security/sql-injection-prevention-tips-for-web-programmers/
                https://snyk.io/blog/sql-injection-cheat-sheet/
            -> using placeholders combined with server size text validation will help big.

        CHAR vs VARCHAR - the type of data into the column for sql, Character vs variable character
            CHAR - fixed length, if we have CHAR(10) and "mike" goes in there, it uses 6 empty bytes of space.. oof.
                storage size is of length we set in CHAR(#)
            VARCHAR - variable length, if we have VARCHAR(10) and "bob" goes inserted, it uses only 3 bytes of space.
                storage size is the actual length of string inputted.

                use CHAR when we expect the same length every time like preset form options. such as state codes, always 2: CA,AL,TX..
                VARCHAR without () parenthesis will give us 8000 byte max for data.

                we can NOT simply always use VARCHAR since it uses more cpu cycles, it will slow us down more than CHAR when we can use it
                    -> this means the database must check the data's length as well as content when searching. vs CHAR() telling the db its length.



        CockroachLabs DB - settings up and important things to remember
            JSON data in a column - https://www.cockroachlabs.com/docs/v23.1/jsonb#create-a-table-with-a-jsonb-column

            Default values constraint(like foreign key constraint) - when creating the table, this is a constraint, so if we forget a value our set default goes in it's place, but if
                -> we explicitly set NULL value, it can still be null. usually, if we forget a value then NULL will be the value https://www.cockroachlabs.com/docs/v23.1/default-value

            CHECK constraint - we can make sure a value going into column is a certain value or between a range, etc.. we probably want to validate in nodejs before this
                -> but can also use this validation for certain values as well https://www.cockroachlabs.com/docs/v23.1/check
                    warranty_period INT CHECK (warranty_period BETWEEN 0 AND 24)

            serverless functions - since we might not have our own server, these functions need to reconnect again and again, so the solution might be a pool
                -> this will help serverless stay connected to cockroachdb https://www.cockroachlabs.com/docs/stable/serverless-function-best-practices

            CASCADE - when using foreign key references to ids in other tables, we might update or delete these values. Cascade lets us
                -> update/delete all matching values, when one is changed/deleted  https://www.cockroachlabs.com/blog/what-is-a-foreign-key/#so-what-is-the-actual-benefit-of-using-foreign-keys

            Performance main read -> https://www.cockroachlabs.com/docs/stable/make-queries-fast
            performance -> NOT NULL Joining foreign keys -when joining we can add NOT NULL for performance gains https://www.cockroachlabs.com/blog/performance-benefits-of-not-null-constraints/
             UUID -> generate UUID when making the table,    id UUID NOT NULL DEFAULT gen_random_uuid()

            Regions -regions are used to make sure we have our database close to us as possible, also cockroachdb gives us backups in case the db goes offline so
                there is never any downtime
                -> check regions for cluster or database  https://www.cockroachlabs.com/docs/v23.1/show-regions#response
                    -> we only specified 1 region when making the cluster, and nothing special when making our tables.
                    -> and we get this back from cluster region search gcp-us-east1 ["gcp-us-east1-b","gcp-us-east1-c","gcp-us-east1-d"]

                Global tables -  will reduce reads as it gives us regions everwhere but now.. every time we write data we have to write to every db everywhere
                    -> basically use global if we rarely have to write data and need it available to all regions. https://www.cockroachlabs.com/docs/v23.1/table-localities
                    cons: writes incur higher latencies from any given region

                regional table - when application requires low latency reads from a single region. Think about where the customers for our product are,
                    -> if they are US only, then global doesn't make sense.

                *set Regions - Cockroachdb gives us 3 zones where our db is stored, if there are any failures, our data is act risk.
                    -> in production we might want to up the amount of regions our data is stored   https://www.cockroachlabs.com/docs/v23.1/multiregion-survival-goals#when-to-use-zone-vs-region-survival-goals
                    cons: increases write time, since we now have 9 instead of 3, ou will pay additional write latency in exchange for the increased resiliency.
                    pros: we get more stability

                    -> our cluster MUST have multi regions before we can add this to the databases in the cluster
                        -> determine if we will have global customers or us only.
                            https://www.cockroachlabs.com/blog/build-a-highly-available-multi-region-database/
                            https://www.cockroachlabs.com/docs/v23.1/alter-database#set-secondary-region
                            https://www.cockroachlabs.com/docs/stable/show-regions

                         1) we need multiple regions on a cluster, preferably pick 3 when creating it
                         2) now we add a primary region from cluster to db, and add other 2 regions to the db
                                ALTER DATABASE defaultdb PRIMARY REGION "gcp-us-east1";
                                ALTER DATABASE defaultdb ADD REGION "gcp-us-west2";
                                ALTER DATABASE defaultdb ADD REGION "gcp-us-central1";
                                ALTER DATABASE defaultdb SET SECONDARY REGION "gcp-us-central1";
                                SHOW REGIONS FROM DATABASE defaultdb;

                            -> now regions should show up in the database
                                 https://www.cockroachlabs.com/docs/stable/multiregion-survival-goals
                            Zone failures - the default for multi region dbs are zone survival, which means if one zone fails, we use another, potentially go down if multiple
                                zones in a region fail as well. we can choose region survival, but this makes writes much slower as we now write to many different regions
                        3) ALTER DATABASE db_name SURVIVE REGION FAILURE/ zone failure;
                            -> now we have 2 backups on primary region, 2 on secondary and 1 on 3rd
                                https://www.cockroachlabs.com/blog/build-a-highly-available-multi-region-database/

                                SHOW SURVIVAL GOAL FROM DATABASE db_name

                        4) when we now have different regions, by default our tables locality is region by table, that means people closer
                            -> to our main table will load faster, we can use region by row, so each individual row query loads from database closer to the user
                                -> global region makes every region in the db 'home', this makes writes much slower, since ALL regions must be written to every time
                                -> use this for low writing/editing websites.. but it gives fast reads anywhere in our region list

                                -> we will likely use regional table, NO regional by row it is very hard setup, OR global tables
                                    -> where writes are stored to every region
                                    https://www.cockroachlabs.com/docs/stable/table-localities
                                    https://www.cockroachlabs.com/blog/regional-by-row/
                    -> You can add up to six regions at a time and change your primary region through the Cloud Console. You cannot currently edit the region
                        -> configuration for a single-region cluster once it has been created, and you cannot remove a region once it has been added


                Backups of our own db - https://www.cockroachlabs.com/docs/cockroachcloud/take-and-restore-customer-owned-backups
                    -> make sure to have self backup schedule to s3 bucket, not a one time backup
                        https://www.cockroachlabs.com/docs/v23.1/manage-a-backup-schedule#create-a-new-backup-schedule

        connecting to db in jetbrains - we must not use sslverify
            postgresql://USERNAME:<PASSWORDHERE>@<clustername>-442.jxf.cockroachlabs.cloud:26257/defaultdb


                                                        CockroachDB end
        _______________________________________________________________________________________________________________________________

        IF - not exactly like js, but similar to a ternary, giving us 2 options in parenthesis https://www.w3schools.com/sql/func_mysql_if.asp
                    IF(condition, value_if_true, value_if_false)
                    -> we combine to validate if table exist, if not, then create it
                CREATE TABLE IF NOT EXISTS accounts (id INT8 PRIMARY KEY, balance DECIMAL);


             MYSQL vs Postgres - https://www.reddit.com/r/SQL/comments/exrc9s/postgres_vs_mysql/
                -> when trying to insert the same sql file to planetscale that worked perfectly with cockroachdb, we had insert error at position 120, no matter what
                -> there was no syntax error. it is just not worth the time unless cockroachdb gets too expensive.




        Cache vs nosql database - like redis or kafka https://upstash.com/, polyscale.ai these are NOT our main sql database, these reduce main load from our database
            -> redis is often used as cache or session storage. meaning a call to the main sql db once, then everything is in redis now to reduce main sql db load
            -> if we have many blog post, we don't want to simply type our text in the react elements in HTML,
            -> by putting our data in the database, no matter what front-end we use, simply call the data from db for our new front-end and get our blog post.
            -> now our data is saved and backed up.
            -> we use redis/ cache databases for things common to ALL users, not user specific.
            -> we could have user logs in redis maybe, and use it like mongodb, hold documents.
            -> in sql we can have an id for our json document/logs that are user specific. after sql query for user document id, query redis/nosql db for actual json doc
            -> redis is mostly for cache that we might not do, whereas the json document store for blog post and other frequent big data like user logs, can be in mongodb serverless
            -> we could have a table matching uuid user id, to a log id, with timestamp, we find users most recent log, then lookup all data we have on them in mongodb query
                -> some startup forced to use sql, simply put json data in columns which we can use rather than learning mongodb.
            NOSQL Database -
            -> ** we only need to cache data so our main db isnt being hit, if we have MANY concurrent users.


        Math - we can calculate like in javascript, but most things will be server calculated and validated
            this could be for calculating some new column on the fly etc..
            + - addition, - Subtraction, * multiplication, / division, % modulus remainder
            round(x, d) rounds x value to d decimal places.. omit d for simple round, sqrt(x) square root

        Pagination - in mongodb we used .skip() for amount of pages to skip, and limit() to limit number of rows per page
                Offset - says to skip that many rows before beginning to return rows. OFFSET 0 -> is the same as omitting offset
                Limit - limit the number of rows we get returned
                *mongodb
                    //if there is no query 'p', we default to zero. p is page number
                      const page  = req.query.p || 0;
                      const peoplePerPage = 4;
                      let people1 = []
                   //user picks what page, then skip x number per page -> now limit to the page number limit above
                      const data = await db.collection('people').find().skip(page * peoplePerPage).limit(peoplePerPage).forEach(person => people1.push(person))
                      res.status(200).json(people1)

                *postgres pagination -> the concept above is shown because it is similar to what we will be doing, we want the user to pick a page inside query 'p'
                            -> then we pick amount of rows per page -> offset the 'peoplePerPage' amount * page -> now limit to 'peoplePerPage'
                        * we will look into more ways besides offset, because OFFSET can be slow, as it needs to count 100k rows or so, just to get to our page
                            -> and only access 10 records. if we have 100k rows or a lot of data, this can take many seconds to read over

                         Solution - we need some sort of column that is sortable and unique, like created_date_time, because uuid is only random in no order https://www.youtube.com/watch?v=WDJRRNCGIRs&t=535
                            -> once we get the first page with 10 rows, we get the created_date_time from the last record in this page. now next time
                            -> simply sort and filter out all rows below the previous column value.. now our database doesn't need to search 100k records. it's filtered!
                                SELECT title, id FROM news ORDER BY id DESC LIMIT 10   -> page 1
                                SELECT title, id FROM news WHERE id < 10909008 ORDER BY id DESC LIMIT 10
                            -> with knex
                                await knex('news').select('title', 'id').where('id', '<', '10909008').orderBy('id', 'desc').limit(10)

                         offset based pagination example: only for LOW amount of records, will make database read all records to offset unlike above solution
                                '/people?page=3'
                              const page  = req.query.page || 0;
                              const rowsPerPage = 10;

                              const data = await knex('people').select('*').orderBy('sortable_column_here').offset(page * rowsPerPage).limit(rowsPerPage)
                              res.status(200).json(data)

                          Cursor pagination: we must make a request to tell the db whether to get rows before or after it, this is faster than offset,
                                -> because now, we've filtered all rows before our page we don't need to read, where offset has to read all rows.
                                 * sort users only by a unique sequential column, such as uuid's, usernames , emails, timestamp, creation_time..

                                -> here we see the time difference, as records go up, offset gets MASSIVELY slower, where as cursor always stays fast https://medium.com/swlh/how-to-implement-cursor-pagination-like-a-pro-513140b65f32
                                    -> many times, we can be completely fine with offset, because our users will mostly see the first pages anyways! until we have 100k records
                                    SELECT title, id FROM news WHERE id < 10909008 ORDER BY id DESC LIMIT 10

                                How it works - were making a GET request with cursor in the req.body, remember our response is with data from our db  https://betterprogramming.pub/understanding-the-offset-and-cursor-pagination-8ddc54d10d98
                                    -> we will send the last item on the page and the first, inside a cursor object with the request.
                                    -> theoretically, instead of query search, we could put page number and rowsPerPages in the req.body and leave query blank..
                                    -> but we will use query for pages and rowsPerPage, while request is strictly for the last/first id,email,username.. to find our spot
                                    -> our request body data
                                        “cursor”: {
                                            “previous_page”: "prev___Crouch" ,
                                            “next_page”: "next___Dumbledore"
                                        }




        Neon.tech postgres database serverless pricing -

            setup project in nodejs - https://neon.tech/docs/guides/node
            Quick start setup - we see, by putting DEFAULT we can have default values not needing to insert it, such as booleans that will be useful if account is deleted
                -> and user membership levels default to 'free' tier etc..

                CREATE TABLE contacts (
                        id uuid DEFAULT uuid_generate_v4 (),
                        first_name VARCHAR(50) NOT NULL,
                        age INT,
                        favorite_color VARCHAR(5),
                        birthdate DATE,
                        PRIMARY KEY (contact_id),
                        UNIQUE(phone)
                    );
                insert into people (first_name, age, favorite_color, birthdate) values ('Arlene', 19, 'green', '6/1/1997');

            Auto-suspend - we can configure the time our server is inactive before it scales resources to zero or better performance(never scaling down)https://neon.tech/docs/guides/auto-suspend-guide
                    -> this is 5 min by default, once we make money, we might want 1 hour.
            Autoscale - combine auto-suspend with autoscale here, we set a minimal compute size, then autoscale up to be big as we need
            region - place database and app(backend server) in the same region, since we are using digital ocean, we can't pick the same aws region as the db

            Branching - the same way we can branch our code repo to not edit the main branch, we can do without database. we can quickly branch our db for testing
                    -> branches can be from current or past state, data up to current time or an earlier time,
                    -> branch is isolated from originating data, changes to branches are independent, does not affect parent branch performance load
                    -> testing - test schema changes, validate new queries, or test potentially destructive queries, as to not affect the main db, even though we should always have backups
                    -> lost data - like backups, if we have unintended deletion, we make new branch from past data, before the data loss
                    point in time restore - neon keeps 7 days for free users, and up to 30 days for paid, to restore from https://neon.tech/docs/guides/branching-pitr
                    read replica - put data in one spot that is only for reading, such as when users will never write to it.

            connection - IPv4 only, on dashboard, select the branch, compute, database and role, we get a string. we might pass the string in .env file
                        DATABASE_URL="postgres://alex:AbC123dEf@ep-cool-darkness-123456.us-east-2.aws.neon.tech/dbname"
                        PGPORT=5432
                        -> we always use sll when connection, we might use a parameter, ?sslmode=verify-full
                        driver:  npm install @neondatabase/serverless

                    Maximum request/response size over HTTp is 10MB, and 15 second proxy timeout for request.

            Query results & options - by default the query function returned by neon() returns the rows from the sql query as an array of objects
                        -> where the keys are column names

                        we can customize this to choose fullResults and arrayMode.
                            arrayMode - rows are returned as array of arrays.
                            fullResults - additional metadata like datatype is returned alongside the result rows, which are in the rows property of the return value
                            fetchoptions - can be passed to neon() or query function, we can increase the priority of every database request const sql = neon(process.env.DATABASE_URL, { fetchOptions: { priority: 'high' } });



            cache - poly-scale is a better ai version of redis, it easily integrates into neon.tech, and lets us cache queries across the world https://neon.tech/docs/guides/polyscale#create-a-polyscale-cache

            backups - no auto backups are available now, but neon gives us 30 day point in time restore, we can do a manual pg_dump https://neon.tech/docs/manage/backups
            uuid - we can generate uuid in node and postgres has uuid package, neon shows us all the packages natively in postgres here https://neon.tech/docs/extensions/pg-extensions
                  https://www.postgresqltutorial.com/postgresql-tutorial/postgresql-uuid/
                install extension:   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

                -> because we have DEFAULT, when we don't specify a value for 'id' on insert, it defaults to generating a uuid v4
                    -> remember our constraints, NOT NULL, DEFAULT, UNIQUE to ensure uniqueness, PRIMARY KEY, FOREIGN KEY, CHECK..
                        -> UNIQUE will reject with an error if the value exist in the database already. it will make postgres create an index, PRIMARY KEY
                            -> already contains a UNIQUE constraint on it
                        -> CHECK will check a value against a condition, usually simple like greator/lesser than a value: salary numeric CHECK(salary > 0)
                    CREATE TABLE contacts (
                        id uuid DEFAULT uuid_generate_v4 (),
                        PRIMARY KEY (contact_id),
                        UNIQUE(id, phone)
                    );

            Jsonb - this is json data, so we can use postgres like a mongodb data store, however it will be a little more complicated to access inside the object with queries
                    -> but this will make the database simpler with one location for data combined with a cache.
                json functions - https://www.postgresql.org/docs/9.3/functions-json.html

                We can do many things like take users profile data into a jsonb column, then get something like birthday and run it through data format to another column
                
                create table with jsonb
                        CREATE TABLE journal (
                          id Int NOT NULL PRIMARY KEY,
                          diary_information JSONB
                        )
                insert into table jsonb
                        INSERT INTO journal (id, diary_information) VALUES
                          (1,  '{"title": "My first day at work", "Feeling": "Mixed feeling"}' );

                extract specific value, -> from jsonb.. we don't get the whole object, just the feeling property - we extract the property with quotes around it
                        SELECT Id, diary_information -> 'Feeling' AS Feeling FROM journal;

                extract specific data not in quotes, ->>   we get back Mixed feeling in cell
                        SELECT Id, diary_information ->> 'Feeling' AS Feeling FROM journal;

                jsonb_set() - set property of json, update feeling property with value of 'Excited'
                        UPDATE journal
                            SET diary_information = jsonb_set(diary_information, '{Feeling}', '"Excited"')
                            WHERE id = 1;

                json arrays -
                    INSERT INTO employees (id, name, skills)
                    VALUES (1, 'John', '[{"name": "Python", "level": "Intermediate"}, {"name":   "JavaScript", "level": "Expert"}]');

                extract values from json arrays,  @> searches the array for a value pair
                    SELECT name FROM employees WHERE skills @ > '[{"name": "Python"}]' :: jsonb



        Knex ORM for postgres -  https://knexjs.org/guide/
                The important thing to remember is most anything we want to do has a raw query builder
                -> such as, we must remember our injection prevention, knex does this for us auto, when not using raw
                knex('tableName').select('*').whereRaw('id = ?', [req.params.id])

                Insert data
                    .insert(data, [returning], [options])
                    -> we can put a single insert or an array or inserts as a single command
                    -> when we insert, we can choose what data to return back, if we set nothing, we get [] back
                        -> the 2nd parameter is what we want to return, as in column names
                    knex('tableName').insert({title: 'book club'})

                    -> multi insert - we get
                    knex.insert(
                        [
                          { title: 'Great Gatsby' },
                          { title: 'Fahrenheit 451' }
                        ],
                        ['id']).into('books')

                        Returning - the 2nd parameter returning, above will do the same thing as this below
                            knex('books').returning('id').insert({title: 'Slaughterhouse Five'})

                Get / read data
                    -> column name first, then search value 2nd
                    knex('tableName').select('*').where('key','bob')

                    -> use operator comparisons in the middle
                    knex('tableName').select('*').where('num','>',5)
                    -> add multiple where clauses, for multiple comparisons AND - both are true
                    knex('tableName').select('*').where('num','>',5).where('num', '<',10)
                    -> add orWhere comparison, either can be true
                    knex('tableName').select('*').where('num','>',5).orWhere('num', '<',2)

                    sort - order by (columnName, order)
                        knex('users').orderBy('name', 'desc')

                    count data of a column using alias, then group by that column and sort it. for one table
                        knex('users').count('first_name AS name_count').groupBy('first_name').orderBy('name_count', 'desc')

                    joins - our films and category table has a middle table that matches filmID and categoryID together, so we join them
                        knex('users').select('category.name').count('category AS category_count').innerJoin('film_category',film.film_id,film_category,film_id)
                        .innerJoin('category','film_category.category_id','category.category_id').groupBy('category.name').orderBy('category_count', 'desc')

                    -> Object syntax, we could do this for a single column search, BUT when knex sees object format, it assumes we have multiple. so it uses AND
                    knex('tableName').select('*').where({key: 'bob', 'id': 123})

                    -> operator like, with string format search
                    knex('tableName').select('*').where('name', 'like', '%rowlikeme%')

                Update data
                    knex('books').where('published_date', '<', 2000)
                      .update({
                        status: 'archived',
                        thisKeyIsSkipped: undefined
                      })

                alter & delete columns -
                    it would be far simpler to build out all columns and data types in our tables and db, then insert.. everything in knex
                        raw sql ->
                        ALTER TABLE table_name ADD column_name data_type(VARCHAR(50)
                        ALTER TABLE people ADD isDeleted BOOLEAN DEFAULT FALSE

                Delete data - we will restrict delete access for safety, but this is how it's done, if a user wants to be deleted, we usually change
                    -> some isDeleted column value to true, then safely delete every x months, like 6 months.
                    -> this is also table specific, users should not be deleted, but possibly some records we no longer need, this should be table by table
                    knex('accounts').where('activated', false).del()

                JSON data - we can insert with plain insert above using object
                    Extract json
                        -> knex lets us use raw queries, so if we don't want to use the .json extract, we can try
                            -> remember, the arrow -> will get a properties data inside an object
                              knex.raw('select person -> 'age' from users where id = ?', [1]).then(function(resp) { })

                        knex way    - knex('table').jsonExtract(column|builder|raw|array[], path, [alias], [singleValue]) -> we can use alias for the property below
                            knex('accounts').jsonExtract('json_col', '$.name')

                    Update json - knex('table').jsonSet(column|builder|raw, path, value, [alias])
                        knex('accounts').jsonInsert('json_col', '$.name', 'newName', 'newNameCol')

                        -> here with no alias and array for the value
                        knex('accounts').jsonInsert('json_col', '$.pets', ['fluffy', 'mittens'])

                        knex('accounts').jsonInsert('json_col', '$.name', { "name": "newName" }, 'newNameCol')


                .toString & .toSQL() - these attached to the end of our knex query, will give us the raw sql query it is sending to the server
                    -> these will make the actual query never hit the database, it's only for getting RAW sql formats out we might need.

                TRANSACTION - when we want to do potentially database breaking things like delete or update, when we don't specify the 'where', these operations
                    can delete or override every single record in our database, so we need a transaction to list out everything we do, we should not have delete
                    access in our account, so that leaves transactions for updates and using transactions for important operations that we must be assured they either
                    all completed or none complete.  https://knexjs.org/guide/transactions.html#transaction-modes
                    -> this example shows moving a bank balance transaction, but ours will usually just be updating one record and using transaction for safety and accountability
                        -> don't forget savepoints and rollback on error,SAVEPOINT FOO; ROLLBACK TO SAVEPOINT foo;
                        BEGIN TRANSACTION;
                            UPDATE accounts_table SET balance = balance - 1000 WHERE id = 1;
                            UPDATE accounts_table SET balance = balance + 1000 WHERE id = 2;
                            SELECT id, name, balance FROM accounts;
                        COMMIT TRANSACTION;

                        ** note we combine node and pg to make conditions to rollback the transaction. if we throw an error on a condition below, then we never commit
                            -> the beautiful part of this, is we can make many conditions that throw an error when we want. this does NOT rollback itself
                            -> these thrown errors flow to our catch block, since trx.rollback() is in our catch block. now it rollback because, if not, we'd need a
                                -> rollback() in every single if statement! phew, way to make it easy
                    -> knex format
                         const trxProvider = knex.transactionProvider();
                        const trx = await trxProvider();
                        try {
                            //pick what column specifically * to return, to save data we get from the database means saving $$
                            const data = await trx('people').where({id: id}).update({favorite_color: 'yellow'}).returning('id');
                            if (handleEmptyDatabase(res, data)) return; //check if database is empty
                            await trx.commit();
                            console.log(data[0]);
                            return res.status(200).json(data[0]);

                        } catch (e) {
                            console.error(e)
                            await trx.rollback();
                            return res.status(500).json({Error: 'Internal server error'})
                        }


                Knex.raw -  we can do raw sql queries, such as transactions that might be difficult
                    knex.raw('select * from users where id = ?', [1]).then(function(resp) {  });


        Check table & user privileges - create a new user for each new database   https://www.postgresqltutorial.com/postgresql-administration/postgresql-grant/

                roles: are at the cluster level, and own database objects, like the table, functions..
                    **The end goal is to make access to a database without the ability to delete or drop for safety and security in production
                    -> roles have made users obsolete.. roles are made when creating these under the hood
                    -> roles that can log in are the same as user accounts in other databases,
                    CREATE ROLE user1 WITH LOGIN PASSWORD 'abc123' INHERIT;


                we created our user with login, password only, now we see no attributes like create role, create db, that neon gives by default, seen with postgres=# \du

                Attributes: these define privileges for a role, and come after WITH above on creation, our production database won't need all of these attributes https://www.postgresql.org/docs/current/sql-createrole.html
                        LOGIN, SUPERUSER, CREATEROLE, CREATEDB, PASSWORD, INHERIT, BYPASSRLS, CONNECTIONLIMIT

                Privileges - similar to attributes: SELECT, INSERT, UPDATE, DELETE, TRUNCATE, or ALL (includes everything)
                    -> after creating a login role, it can not even select from our table yet, we need to grant it privileges
                    -> we see privileges are table by table, not on the entire database
                        GRANT privilege_here ON table_name TO  role_name;

                    * we tried selecting from our table with no roles on safeuser, and got 'permission denied for table people'

                    -> since testing, we were unable to delete any records or tables
                        GRANT SELECT, INSERT,UPDATE ON people TO  safeuser;

                    ->instead of making it for each table, we do this for all tables, and this way we can have read only users etc..
                        GRANT SELECT, INSERT,UPDATE ON ALL TABLES IN SCHEMA "public" TO user_here;

                    * beware if we need advanced things like triggers, execution etc.. we need the TRIGGER privilege on our role


                Groups - groups are not obsolete, they are simply the same name as roles, but groups don't have LOGIN privilege.  https://www.postgresqltutorial.com/postgresql-administration/postgresql-role-membership/
                    -> a role with the INHERIT attribute will automatically have privileges of the group roles of which it is the member
                    1)    CREATE ROLE group_name WITH NOLOGIN NOINHERIT;
                        -> for safety we can make a select only role when we won't update or insert,
                        ** this is only for the tables at this point in time, new tables won't have this groups privileges
                    2)    GRANT INSERT, UPDATE, SELECT ON ALL TABLES IN SCHEMA public TO safe_group
                    3)    GRAND safe_group TO safe_user


                see privileges for all roles in a table
                    SELECT grantee, privilege_type FROM information_schema.role_table_grants WHERE table_name='people';

                This gives privilege_type of all tables in the database, and to what user/grantee
                SELECT * FROM information_schema.role_table_grants WHERE table_name='putTableNameHere';

                postgres in terminal connection
                in our terminal, type: psql 'connection string here'
                get list of roles:  postgres=# \du

                in sql view schemas
                SELECT schema_name FROM information_schema.schemata;

                in psql show default privileges
                    postgres=# \ddp

                SCHEMA: check our sql-production-setup.js file for good setup from StackOverflow
                    * no matter what we grant, it is only for what currently exist, if we create a new table, then our role will have no select, insert privilege on it
                    postgres calls them namespaces internally, if we have many tables like 300, we need to group things together in a schema
                    -> Any of the objects defined in a database (tables, views, indexes, sequences, etc.) are defined within a schema within the database
                    -> when we create a table in a database, postgres automatically puts that table in the 'public' schema,
                    -> schemas enable multiple users to use a database without interfering with another
                    -> creating our table without a schema is the same as making it like this
                        CREATE TABLE public.table_name(...);
                    -> we can alter a table to change schema
                        alter table ... set schema ...

                    The important thing to remember is, this is for BIG databases, or separation of tables in one database.
                        -> for different projects it would be better to make a whole new database, but even for the same project/app
                        -> we might need restrictions on some tables, and group those tables in its own schema, so we set privileges by schema
                        GRANT ALL ON ALL TABLES IN SCHEMA schema_name TO user;
                    -> give privilege at schema level, only create and usage are allowed for schema privileges, the rest are at table level
                        GRANT USAGE,CREATE in SCHEMA schema_name TO role_name

                    production - we should not be using the public schema, but make our own with the right restrictions, then grant user privilege on
                            that schema only.


            backup - pg_dump -Fc -v -d <source_database_connection_string> -f <dump_file_name>

        steps for new database - ***remember all privileges apply to what objects/tables currently exist, we must grant privileges to our group/user each time
            -> or we create all tables then grant limited privileges, or the BEST way is to make default privileges so we grant one time only
                ALTER DEFAULT PRIVILEGES IN SCHEMA schema_name GRANT SELECT,INSERT,UPDATE ON TABLES TO role_here;
                -> this is tables only, but we should do schema wide above
                    ALTER DEFAULT PRIVILEGES GRANT SELECT,INSERT,UPDATE ON TABLES TO role_here
                -> to see default privileges, go into psql -> \ddp
            1) create user with only safe roles above for all tables, insert, update, select
                -> GRANT TRIGGER, REFERENCES, INSERT, UPDATE, SELECT ON ALL TABLES IN SCHEMA "public" TO safeuser;
            2) when creating table, use DEFAULT for id, default to uuid, and use DEFAULT for user roles etc..
            3) to be able to use uuid default generate, id uuid DEFAULT uuid_generate_v4 () : we will need to download uuid-ossp in postgres
                Install --> CREATE EXTENSION uuid-ossp

            4)



        Sql injection prevention -

            we should be testing all values before they make a server query, this will save so much server time and resources/money. But also
                by checking values, we make sure there is nothing funny going into our query like potential injection

                * we no longer need uuid-validate package, we can validate uuid in main validator.js package
                    uuid validation - https://www.npmjs.com/package/uuid-validate
                    const validate = require('uuid-validate');
                -> we can in general validate a uuid without specifying version, or we can specify. we can check a uuid version,
                    validate('95ecc380-afe9-11e4-9b6c-751b66dd541e'); // => true


                general validator - https://github.com/validatorjs/validator.js
                -> this is an easy way to validate email format, password length, credit card format etc..
                    npm i validator
                    const validator = require('validator');
                    validator.isEmail('foo@bar.com'); //=> true
                *** uuid validation with validator.js
                    if (validator.isUUID(paramID, [4])) { } -> validator.isUUID(string,[uuid version])

                after validating data is in the right format, we will want to make sure all usernames/email and strings are in all lowercase then
                 we will want to trim all strings before putting them into the database. this is after we even trim on client side, for extra safety.

                Ways injections happen:
                    1) adding booleans to where clause that is always true,  ' OR 1=1
                    2) escaping part of query by comments, --
                    3) ending initial query and starting new query, '; DROP TABLE USERS;
                    4) connecting data from multiple tables using UNION

                injection Prevent steps:
                    1) do not rely on client side input validation, validate on client and server, such as validator.isEmail() with trim(),
                        -> and remember to put it in all lowercase for storage
                    2) restrict database users privileges, so they can't easily drop or delete a database/table https://neon.tech/docs/manage/roles
                        ->  https://www.crunchydata.com/blog/safer-application-users-in-postgres
                    3) use prepared statements and query parameters, don't concatenate user input with template strings in the query
                        -> use real prepared statements if possible, add untrusted input as parameters, like we did in knex with ?
                    4) scan our code for injection vulnerabilities like https://snyk.io/plans/
                    5) use an ORM layer like knex, the ORM will map database results to objects and this prevents many explicit sql queries
                    6) don't rely on blocklisting like blocking users, some keywords and chars can be real names.
                    7) stored database procedures are not safe by default. can be vulnerable to injections when implemented wrong. check docs if we need.


          returning in knex - specifies which column should be returned by the insert, update, delete methods https://knexjs.org/guide/query-builder.html#returning
                -> when we select, we get data back, when we do crud operations like above.. we just get a 1 or 0 if it worked or failed
                -> this isn't useful, so on updates, we want to return the updated data like a select would

                the returning, can contain a single value column in quotes or an array of column values
                    knex('books').returning(['id','title']).insert({title: 'Slaughterhouse Five'})

                -> our transaction returns all columns. Note this returns an array, since we usually update, create, delete 1 record at a time
                    -> we can almost always use data[0] to only get the first record -> which is probably the only one, unless were selecting, which won't be returning!
                    const data = await trx('people').where({id: id }).update({favorite_color: 'yellow' }).returning('*')
                    console.log(data[0])


        junction table - this is how we link up 2 tables to form a many to many relationship and prevents us from repeating ourself,
                -> without this junction table or 'linking' table in table 2, would repeat its column values over and over for each new row from table 1
                -> the table uses foreign keys, and references the values from table 1 & 2. we can put this in one line

                -> a standard would be combining table 1 & 2's names like: grocereries_categories
                CREATE TABLE junction_table (
                    table1_uuid UUID REFERENCES table1(uuid),
                    table2_uuid UUID REFERENCES table2(uuid),
                    PRIMARY KEY(table1_uuid, table2_uuid)
                );

            -> when table one needs its column value that we stored in a junction or linking table, we just make a join between both tables, now we haven't repeated ourself!!

            *** to determine if we need a junction table in the middle of 2 tables, we need to ask ourself if we have one to many, or many to many relationship

              -> if each user can have multiple notes, but each note is associated with only one user, then we can simply use a foreign key in the notes table
                    -> that references the user id in table 1, the users table. this creates a one to many relationship between users and notes
                    CREATE TABLE users (
                        id UUID PRIMARY KEY,
                        -- other columns for user information
                    );

                    CREATE TABLE notes (
                        id UUID PRIMARY KEY,
                        user_id UUID REFERENCES users(id),
                        note_text TEXT
                        -- other columns for note information
                    );

                -> you only need a junction table if you had a many-to-many relationship, if each note had multiple users. we would make something like this junction below
                    CREATE TABLE users_notes (
                    users_uuid UUID REFERENCES users(uuid),
                    notes_uuid UUID REFERENCES notes(uuid),
                    PRIMARY KEY(table1_uuid, table2_uuid)
                );






*/






