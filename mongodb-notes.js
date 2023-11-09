/*
    In mongodb, a document is the basic unit where our json data is stored, a collection is above the document, basically a collection of documents,
        the database is a container for collections.
        database -> collections -> documents(BSON) -> fields
        database -> tables      -> rows            -> columns    sql


    primary key - each document in mongodb requires an _id field that acts as the primary key like in sql.
        -> if it does not have an _id field, it automatically creates it for us.

        ObjectID is a unique data type like uuid in sql, if we do not include _id field, ObjectID is used to automatically make a unique value for us
        if we create _id ourselves, we could make it simple like 1,2,3 or a complicated uuid.

    bson - mongodb documents are displayed in json format, but stored in bson. bson has additional data types like numbers, dates, objectID's

    schema - in sql we declared all the column data types and names before inserting, but in mongo, this is not required
        -> documents in the same collection are not required to have the same data types. in sql tables don't have to be the same either in the same db
            -> but the difference is, when we want to change a data type scheme for a document, we don't need to update any other data.
        -> in our relational sql db, it would be more complicated to alter the tables columns after it has been created.

        -> like in sql, we will have our database created and tables created for the general layout. we do this manually on mongodb website, but when we want to record user data
            -> this is when we will use node to make queries to create new documents in the collections

    Data relationship types - data that is accessed together should be stored together.
        One to One - data entity in one set is connected exactly to one data entity in another set
        One to many - data entity in one set is connected to many data entities in another set.. like an array data type holding other objects of people.
        many to many -

        Embedding - when we take data and put it in the same document
            -> like the array as a value with objects of people inside it, would be one to many above
            -> mongodb recommends embedding, remember this is when all data is in the same document, not referencing another with an id.. this makes getting data faster
            -> we avoid application joins which makes it faster to only query 1 document.
        referencing - when we refer to data in another document in our collection.
            -> the same type of array above, but this time there is no data in the array, simply objectID's that reference another document holding the data
            -> no duplication of data, smaller documents, but takes more resources as we must query multiple documents



    Connecting - remember in production no matter the database, we will use an ORM like mongoose for mongodb or knex for sql, to make sure our queries are safe.
        to connect to mongodb in nodejs, make sure we have access to .env file with package :
            require('dotenv').config();
            npm init -y  -> if no package.json
            npm i mongodb
            we go to our cluster -> database -> click connect -> get full code sample from nodejs
            -> now paste the string in our .env file or this would be digitalocean env variables or another way to store
            in .env file..
                MONGODB_URI='mongodb+srv://user:pass@penguincluster1.u1vnogc.mongodb.net/?retryWrites=true&w=majority'

            our connection failed, until we used MONGODB_URI

            we should have a SINGLE mongo client instance for all database request, because starting client instances/ connections are resource intensive.

            -> in our tutorial we created db.js to use a single connection function where we pass a callback , then we do not run the server if db connection failed


            shell - we click connect on mongodb website, and click shell, we install it on our os, then paste the shell link which ask for the password
                -> now we can test mongodb commands without a programming language, simply learn the database language on its own first.

        network errors - if we get a network error on connecting, we should check in atlas, see if our ip is on the allowed list, such as our vps

    Mongodb learn course - crud operations direct from mongodb, not our other courses first
            when inserting a document, if the collection we insert on doesn't exist, mongo will create the collection for us
            -> when searching, this will check the value, and look to see if it's inside an array
                investment: ['bond', 'real estate', 'stock'] would be found the same as investment: 'stock'
                db.sales.find(investment: 'stock')

            What if we specifically want to search inside an array, NO string will be found, this ensures arrays only
                db.sales.find( {items: {$elemMatch: {investment: 'stock'}}} )
                -> multiple filters
                db.sales.find( {items: {$elemMatch: {investment: 'stock', price: {$gt:200} }}} )

            we can make a query with multiple $or statements inside $and statement to give many options.
                db.sales.find({$and: [{$or: [a:1,b:2],},  $or:{ [a:3,b:4]}]})
            -> we can't put multiple $or statements without the $and, because or would be the same property name in the same json, so
                -> the 2nd $or statement would override the first, but if they are inside the $and array, they are in their own object and separated

            updateOne vs replaceOne - update will update values and keep all old properties, where replace will delete old values and bring in the new
                db.name.replaceOne({_id: ObjectId(1234)}, {replace_values: 'bob'})

            update when doesn't exist - we found the upsert option, if no document matches the query, it creates one instead of failing to update
                db.birds.updateOne({common_name: "Robin Redbreast",},{$inc: {"sightings": 1,},$set: {last_updated: new Date(),},},{upsert: true,})

            findAndModify() - updates a document, then reads its new value, this is for things like a like button, we save 2 calls to the database!
                -> normally we update -> find document, BUT the document could have been updated again before we read it again and we could have the wrong value
                -> using findAndModify, we combine the querys to make ONE call to the database
                -> by default the return doc does NOT include the modification made, unless we specify new: true, in the options
                -> we can also set upsert: true, if it does not exist, we create it, then read back the result
                     db.podcast.findAmdModify({query: {_id: ObjectId(1234)}, update: {$inc: {downloads:1}}, new:true})

            Projections - see find() section, these save us bandwidth by not returning all our data every query, only get back properties we want.
                    _id field will always show unless we specify _id:0, to not show
                    we hide nested property names {"address.zip: 0"}
                    inclusion and exclusion statements can't be combined, except for _id:

            count documents  - db.col.find().count() is deprecated and gives approximate value, countDocuments() gives accurate count
                    db.collectionName.countDocuments({value:$gt:100})

            update - when making an update, we aren't reading anything, we get back how many things we modified, this can let us know if errors occurred
                let db = await db.col.updateOne()
                    if(db.modifiedcount === 1) console.log('it worked!')

            transactions - we learned in postgres, these ensure all of our db actions are completed, or none of them are, such as a bank transaction
                -> whenever we transfer one value to another in the database, we need to ensure they will both complete or not at all, to keep integrity of our data.

                when we use updateOne() to update one document,and update multiple fields, it is inherently acid because all fields in that doc will update,
                BUT when we update multiple documents at once, that is not acid because they all might not update, so we need a transaction

                a multi document acid transaction 'locks' the documents for the transaction, so these must only be used when we need acid protection it
                    .startSession() -> .startTransaction() -> .commitTransaction() -> .abortTransaction() if we need to abort everything in the transaction
                        const session = db.getMongo().startSession()
                        session.startTransaction()
                        const account = session.getDatabase('< add database name here>').getCollection('<add collection name here>')
                        //Add database operations like .updateOne() here
                        session.commitTransaction()
                        session.abortTransaction()

            aggregation - we get data from multiple documents to return computed results, we can group values, perform operations on grouped data to
                    -> return a single result, analyze data changes over time
                    -> aggregation has states, each state performs an operation on the documents, such as filter documents, group documents, calculate values..
                    -> documents that are output are passed to the next stage https://www.mongodb.com/docs/manual/core/aggregation-pipeline/#std-label-aggregation-pipeline
                        https://www.mongodb.com/docs/manual/reference/method/db.collection.aggregate/
                    -> basically, filter down data from multiple documents, then group that data into a single document to easily read
                        db.zips.aggregate([
                        {$match: { state: "CA"}},
                        {$group: {_id: "$city",totalZips: { $count : { } }}}])

                    -> sort data by highest population, limit to get top # of results only.
                        db.zips.aggregate([
                        {$sort: {pop: -1}},
                        {$limit:  5}])

                    -> project specifies what field to include: 1, exlude: 0
                        $project: {state:1, zip:1,population:"$pop",_id:0}

                    -> $out -> this goes at the very end because it creates a whole new collection with our returned information that has been filtered, grouped, etc..
                            -> if $out is set to a collection that exist, it will overwrite and delete all its data.

            mongo atlas search - when our users type into our input box and want to search something in our database that is not exact, it's hard to get
                a good algorithm to know what the user is looking for, this is what mongo atlas is for
                -> atlas will index, autocomplete and suggest common results, search across different data types, fine tune relevance

                search index - makes searches more efficient, not to be confused with the database index above, to make querys more efficient
                dynamic mapping - all fields are indexed except booleans, timestamps, id

                on mongo website -> go into database -> atlas tab -> create -> click db and collection -> visual editor -> dynamic mapping auto selected -> save changes

                static mapping - if we have many fields and the user is not always searching by every field, it waste resources to index all of them with dynamic
                    -> un toggle dynamic mapping in atlas visual editor, under field mappings: add field. we will get no results if we search with field not mapped now.

                aggregate compound search - we must already have a search index on our collection, now this is how we rank results ourselves
                    click collections in atlas -> aggregations -> add state, select search -> now this code is where we specify how to rank higher and what

                    in the search stage input box: we use must, mustnot and should to affect the score
                        $search {
                          "compound": {
                            "must": [{
                              "text": {
                                "query": "field", -> array must include
                                "path": "habitat"}}],
                            "should": [{
                              "range": {
                                "gte": 45,
                                "path": "wingspan_cm",
                                "score": {"constant": {"value": 5}}
                              }}]}}

                    facets - we can make searches in a certain time frame  https://www.mongodb.com/docs/atlas/atlas-search/facet/
                        we go into collection -> aggregation -> select searchMeta now : facets will GROUP search results
                            $searchMeta: {
                            "facet": {
                                "operator": {
                                    "text": {
                                    "query": ["Northern Cardinal"],
                                    "path": "common_name"}},
                                "facets": {
                                    "sightingWeekFacet": {
                                        "type": "date",
                                        "path": "sighting",
                                        "boundaries": [ISODate("2022-01-01"),
                                            ISODate("2022-01-08"),
                                            ISODate("2022-01-15"),
                                            ISODate("2022-01-22")],
                                        "default" : "other }}}}



    Compass - is a gui tool for querying, interacting and visualizing our whole database, we can optimize querys and more. this is a local download unlike atlas that is online
        https://www.mongodb.com/try/download/compass

            we can analyze our database, and make validation fields to require some fields on each document
            explain plan tab - will show the speed of our query and how many documents it searches through.
            we can build aggregations then export the code in our language

    shell -  inside the shell to navigate the database without a programming language without node, here are some commands
        show dbs - list all databases
        db - shows current database you are in.
        use (database name) - switch to a certain database to be inside it.
        cls - empty all text on terminal to make room, visual only
        show collections - show all collections of documents inside a database
        exit - exits us out of mongosh, we must input credentials again.
        db.collection_name - input the collection name, after we have already 'use dbName' to go inside the database. this gets us inside a collection
                -> db refers to current database we are in


        Methods - we are testing in the shell, but it translates to any language like nodejs CRUD methods
            CREATE
            nested documents - instead of a normal string or number value, this is just having an object or array of objects as its value
                -> this is like what we call embedding data above, not referencing it to another document.
            insertOne() - db.collection-name.insertOne({name:'mike',age: 40}) insert a document in a collection  - after going into database,

            insertMany([]) - db.collection-name.insertMany([{name:'sara',age: 20}, {name: 'sally', age: 24}]) - same as insertOne, inserts a document,
                -> be inside an array, but we insert multiple at once, so the objects must
                {name: 'sara', age: 24, favColor: 'red}

            READ
            find() - mongodb prints out the first 20 documents it gets in a collection, not specific at all, probably wont use the general way
                -> db.collection-name.find() -> we get an array or object documents data

                filter find() - search by specific property with find()
                    db.collection-name.find({name:'bill'}) -> gives all documents where name is bill exactly, so it filters. we can add multiple properties to filter by
                        db.collection-name.find({name:'bill', age:30})

                    -> Projections - only return specific data properties,simply pass in a second object with what we want returned, we always get id back with it
                        -> we set value:1 to give one property shown, this will only show this property, we must specify what else
                            -> if we set value:0, it shows everything else and removes this property from results
                        db.collection-name.find({name:'bill'}, {shirt_size:1,fav_color:1})

                    -> NO filter, get every document back, but now only properties we want with it
                        db.collection-name.find({},{car:1,shirt_size:1})  -> just leave first object empty for no filtering

            findOne() - find the first document matching filter search, since we could have multiple matching, and we only get the first one
                -> i think we will usually use findOne() with _id search.. since there is only one id per document.
                db.collection-name.findOne({_id:ObjectId("6539d9c7c64d3167e6f1a4ce")}) -> same layout filter as before, gives specific user by id we want

                db.people.findOne({gender:'Male'}) -> simply gives first user in collection that is Male, not very specific or useful..


            sort & method chaining - cursors are what is returned froma query, like db.coll.find() -> now we add cursors -> sort()/limit() to them
                we can add methods on to find, like in sql. we can count the number of results from query
                count -
                    db.collection-name.find().count() -> returns count of all documents in collection
                    db.people.find({car:'Honda'}).count() -> count a filter, gives 3 people with Honda car.

                limit - limit number of results we return
                    db.people.find({car:'Honda'}).limit(2)

                sort - 1 is ascending order, -1 is descending order.  pick property to sort by in object
                    -> notice we change multiple methods to limit the sorted return documents
                    db.people.find().sort({name:1}).limit(3)

            Operators and complex queries - instead of searching for exact values in find(), we can use greator than or less than
                -> and many other dynamic queries,    https://www.mongodb.com/docs/manual/reference/operator/query/
                -> operators start with $ dollar sign, and the search value must be in an object
                Comparison operators:
                    $gt - greator
                    $gte - greator than or equal to
                    $in - matches any values in a range of values or array.
                    $lt - less than
                    $lte - less than or equal to
                    $ne - matches values that are not equal to this value
                    $nin - matches none of the value specified in an array
                Logical operators:
                    $and - joins query clauses, returns all documents that match both conditions
                    $not - inverts the query expression, returns documents that do not match the condition
                    $nor - when condition fails to match both clauses, like or
                    $or - joins query with or, returns all documents that match condition of either clause.
                Element operator
                    $Exists - matches documents that have a specified property, check if property exist on document
                    $type - select document where field is certain type, like number, array, string..
                Evaluation operator
                    $expr - allows aggregation expressions, lets us compare nested data with other nested data https://www.mongodb.com/docs/manual/reference/operator/query/expr/#mongodb-query-op.-expr
                    $regex - selects fields that match a pattern, where specific text is not known
                Array operator
                    $all - check if array contains all searched values, can be rewritten with and, & in other ways as well
                    $elemMatch - match array field with at least one element that matches ALL the specified conditions
                    $size - searches how many items are in an array, array length must match exactly, then returns that item.

                -> $gt search where age is greator than 28
                    db.people.find({age: {$gt: 28} }).limit(3)
                -> $lt , 2 conditions search where age less than 30, and friends less than 100
                    db.people.find({friends: {$lt:100}, age: {$lt:30} }).limit(2)
                -> $or search where either condition might be true, inside the 'or' array are both conditions in an object
                    -> friends less than 10 or age is exactly 25
                    db.people.find({$or: [{friends: {$lt:10}}, {age: 25} ]}).limit(2)
                -> $in search for docs if property value is in the range of values we provide, this simplifies using many 'or' operators
                    db.collection-name.find({ rating: {$in:[7,8,9]} })
                -> $nin search if property value is NOT in the range of values we provide
                    db.collection-name.find({ rating: {$nin:[7,8,9]} })

                Array queries -
                    -> checks the array to see if it includes this value, genre does NOT have to be a string, it's checking the array for this exact string
                        db.books.find({genre: "fantasy"})
                    -> if we want to search, if a value is the ONLY value in an array. this means the array has one item, where above is searching through all items
                        db.books.find({genre: ["fantasy"]})
                    -> $all - search multiple values, search array if it includes multiple values
                        db.books.find({genre: {$all: ["fantasy", "sci-fi"]}})
                    -> $rev query nested documents, array of objects.. reviews: [{name:"luigi"},{body: "it was good"}]
                        -> the array is using dot notation which is odd, and it must be in quotes
                        db.books.find({"reviews.name": "luigi"})

                DELETE - the best way to delete is based on _id, if we use a type of filter, we can delete things we didn't mean to possibly
                    -> by using deleteOne, if we put in a filter condition it would only delete the first document that meets the condition
                          db.people.deleteOne({_id: ObjectId("653a05efc64d3167e6f1a520")})

                    deleteMany() - delete many documents at once that meet a condition
                        db.people.deleteMany( {favorite_color: 'red'} )

                UPDATE - update one document or many at once
                    -> we can update plain fields or nested values like arrays, remember since we are not adding a new document, but updating it
                    -> we have many operators, basic fields first https://www.mongodb.com/docs/manual/reference/operator/update/
                        $set - set value of field in document, overwrites previous value completely
                        $currentDate - set value of field to current date, either as date or timestamp
                        $inc - increment/decrement value of field by specified amount, use negative number to subtract
                        $min - only updates if specified value is less than existing value
                        $max - only updates if specified value is greator than existing value
                        $mul - multiplies value of the field by specified amount
                        $rename - renames the field name
                        $unset - removes specified field from a document

                    Array operators:
                        $addToSet - add elements to array if they do not already exist in the array
                        $pop - removes first or last item of an array
                        $pull - removes all array elements that match specific query
                        $push - adds an item to an array
                        $pullAll - removes all matching values from an array
                        $each - combine items to be added/removed from array instead of just one value, like $push and $addToSet combined
                        $position - like push, but specify position in the array to add elements
                        $slice - limit size of updated arrays
                        $sort - reorder documents stored in an array



                    updateOne
                    -> first argument object is search term, mostly _id for exact match, 2nd arg is object using $set: all properties to change are in here
                        db.people.updateOne({_id: ObjectId("653a05efc64d3167e6f1a53e")},{$set: {favorite_color:'purple',friends:999}})

                    updateMany() - same structure as above, first object is selection, 2nd is what to change using $set
                        db.people.updateMany({favorite_color:'blue'}, {$set: {favorite_color:'teal'}})

                    increment - if we don't know the current value like score, but know we want to add to it
                        -> we no longer use $set, now its $inc to increment, use -2 to decrement and reduce the number
                        db.people.updateOne({_id: ObjectId("653a05efc64d3167e6f1a53e")}, {$inc: {friends: 2}})

                        -> $pull remove array elements/object with specific value
                        db.books.updateOne({_id: ObjectId("653a05efc64d3167e6f1a53e")}, {$pull: {genres: "fantasy"}})
                        -> push add array item with specific value
                        db.books.updateOne({_id: ObjectId("653a05efc64d3167e6f1a53e")}, {$push: {genres: "fantasy"}})
                        -> $each ,
                        db.books.updateOne({_id: ObjectId("653a05efc64d3167e6f1a53e")}, {$push: {genres: {$each:["1", "2"]}}})


                Index - when making a query we search by our property we want, that's not default _id
                    to search, mongodb will look at every document and see if our search matches. With an index it only
                    looks at what index matches the search then gets the result much faster. from sql we remember
                    we should only index what we will be searching by often, because this comes at a cost of more storage to make the index

                    indexes can be single and compound type, which means either one or more properties

                    -> in mongodb shell, this shows us executionStats, which tells us 'nReturned' is the amount of documents returned from search
                        -> totalDocsExamined, is the total amount we looked through, this will be the whole collection with no index.. oof
                        db.collection-name.find({propertyName: value}).explain('executionStatus')

                    create index: creates for certain property that we will constantly search by, to save time. 1 means ascending order, -1 means descending
                            -> we do NOT specify values, we index all values of the property we specify to speed up any filter on that property
                        db.collection-name.createIndex({propertyName: 1})
                        -> we can set {unique:true} which means, if we insert or update a document, and its property like email, is NOT unique,
                            -> it won't let us insert that value because it forces uniqueness on us.
                        db.collection-name.createIndex({propertyName: 1}, {unique:true})
                    search indexes -
                        db.collection-name.getIndexes() -> shows all indexes, _id is default
                    hide index - before deleting we can see the performance impact of not having the index in the future
                    dib.col.hideIndex()
                    delete index -
                        db.collection-name.dropIndex({propertyName: 1})


                    check if index is used on a query - with explain, add it before our query's, winning plan.stage will show 'collscan' if no index, IXscan means index
                        db.customers.explain().find()

                    multikey index - for array field properties to make it faster to search arrays, single array per index

                    compound indexes - when we search by multiple properties then do other things like sort, our first property might be indexed
                        -> but we still have to search by the other ones that aren't, so we combine them in an index if we search it often!
                        db.customers.createIndex({
                          active:1,
                          birthdate:-1,
                          name:1
                        })





































*/









