/*
    validator - we need to validate data in many places, on the frontend and our nodejs backend
        -> client api request, third-party api, user input form data, localstorage instead of cache, query params in the api request
            -> since the api url params are external the user can input what they want,
            -> so we need to ensure we have a number when we expect it
        -> we see above, there are many external sources of data we need to validate! especially before we send it to our database

        zod - we will use zod because it's much easier to import one object with everything, but this adds about 15kb to our entire package sent to our users
            -> zod is much slower than others, so if we ever notice significant slowdowns, we should try valibot which is 4x faster
            -> we can use zod to validate on the client and server, we will ALWAYS validate on the server for safety
            -> this is RUNTIME dependency, so it checks while our front and backend are in production

        before, we used validator.js that made checking uuid, alpha a-z checking easy. Now we can use zod with regex patterns
            to do the same in 1 smaller package, along with all our object schemas.

        typescript - since this is ran at compile time and not runtime, it won't help us with outside data validation
        option chaining - ?, since this doesn't validate types, we could be using methods on a wrong type and get another error
                -> chaining will prevent errors when we are unsure if a property exists, but we want to send the user useful errors
                -> and not crash our entire app

        zod learning - https://zod.dev/?id=table-of-contents

                primitives - we can set the string scheme in a variable then parse it or do in 1 line, if we are re-using it
                uuid - remember this will validate uuid v1 and v4, but this is safe enough for us, even though we will never use v1
                    since it is based on the computers mac address and not truly random
                        const uuid = z.string().uuid();
                        if(!uuid.parse(id)
                    -> in 1 line
                        if(!z.string().uuid().parse(id)

                when the uuid above fails, it will parse an error that flows to our catch block, the user receives
                        {error: 'could not get data'}
                    -> this is not useful at all, we might want the user to know what went wrong, so we can use safeparse

                parse vs safeparse - parse will throw an error, safeparse will return an object with success:true/false, the data and an error
                    .safeParse(data:unknown): { success: true; data: T; } | { success: false; error: ZodError; }

                Safeparse - now with this, we don't throw an error, but return what we want to the user in the response, of course
                    -> we could use parse and throw the error we want, but this is better

                zod is for advanced object schemas and strings, if we use it for simple number ranges then we are using processing power for no reason
                        const limitValidate = z.number().int().min(1, {message: "the limit is too small"})
                        .max(100, {message: "the limit is too big"}).safeParse(limit);
                    -> we turn our long zod validator into simple if statements, first make sure the number is NOT 0, since a zero is falsy and goes past if(limit)

                    ->here we cover most cases, if the user inputs no number, zero, or a number outside our range
                        -> make sure to parse only inside the if statement, if it's not undefined or we skip over other routes
                        -> when checking first, we never do !limit because a 0 or false will get past that
                        const {limit} = req.query;
                        if (limit !== undefined) { //0 can get past if(limit)
                            const numLimit = parseInt(limit);
                            if (isNaN(numLimit)) {
                                return res.status(400).json({message: "That is not a number"})
                            }
                            if (numLimit < 1) {
                                return res.status(400).json({message: "the limit is too small"})
                            }
                            if (numLimit > 100) {
                                return res.status(400).json({message: "the limit is too big"})
                            }

                            const data = await knex('people').select('*').limit(numLimit)
                            if (handleEmptyDatabase(res, data)) return; //check if database is empty
                            return res.status(200).json(data)
                        }

                    -> here for a string not a number, we have different checks
                    -> first to make sure its not undefined, then !name, checks null, NaN, false and empty strings
                    -> next we can set minimum string length and our zod regex pattern for only lower and uppercase no symbols
                        if (name !== undefined) {
                            if (!name  || name.length < 1 || !z.string().regex(/^[A-Za-z]+$/).safeParse(name).success){
                                return res.status(400).json({msg: 'that is not a valid name'})
                            }

                enum - these are like an array of strings, and we could use the array methods includes() or find() to search for our value
                         const letterEnum = z.enum(['a', 'b', 'c', 'd'])
                         letterEnum.safeParse('e').success // false
                    -> we can extract values from an enum or exclude, so filter it down or get everything but what we exclude
                        const noAB = letterEnum.exclude(['a', 'b'])
                        console.log(noAB.safeParse('a').success); //false, c,d still gives true

                    -> these enums are for we need specific constraints and all values are known at runtime

             Native enum - these are for objects only, so we can check if the value is in the keys
                       const Fruits = {
                            Apple: "apple",
                            Banana: "banana",
                        }

                        const FruitsEnum = z.nativeEnum(Fruits);
                        console.log(FruitsEnum.safeParse('apple').success); //true
                        console.log(FruitsEnum.safeParse(Fruits.Apple).success); //true

            nullable - when we intentionally set an empty value, now null wont give an error
                        const FruitsEnum = z.string().nullable();
                        console.log(FruitsEnum.safeParse(null).success); //true

            optional - lets our scheme pass if the value is undefined

                        -> it could prove useful when we need a string or undefined but not another data type
                            const stringOrUndefined = z.string().optional();

                            console.log(stringOrUndefined.safeParse('hello').success); // true
                            console.log(stringOrUndefined.safeParse(undefined).success); // true
                            console.log(stringOrUndefined.safeParse(123).success); // false

                        -> but we will typically use it to make a data type optional in our object/array schema
                            const user = z.object({
                              username: z.string().optional(),
                              age: z.number()
                            });

                            console.log(user.safeParse({age: 23}).success); //true - because string is optional

            Objects - we have many methods for objects, above we said we don't need zod to validate numbers like .min() because it waste processing power.
                    -> inside our objects this is way more useful to validaiton specific numbers and strings in an object, where most our data will be.

                        const user = z.object({
                          username: z.string().optional(),
                          age: z.number()
                        });

                    .keyof() - make our z.object into a enum, so we can search if it includes a property, but NOT a key because its a schema type, not key values
                                user.keyof().safeParse('username').success //true,
                    .extend() - add more properties to the z.object schema
                    .merge() - merge 2 z.object schemas together
                    .partial - make all properties optional, or some, if we need a standard scheme and another schema with optional properties
                        .deepPartial - partial is 1 level deep, deepPartial is for nested objects properties and making them optional
                    .required - opposite of partial, make all properties required, if we need 2 schemas, make one with z.object().partial()
                            -> properties will be optional, then user.required() to make a copy that has all required properties
                            -> we can specify what property are required,  user.required({email: true})
                            -> makes optional properties required again.

                    .passthrough - we safeParse data with our object schema and get back an object with {success: true, data: {user:'b',age:22} }
                            -> if we have extra properties, but still have all required properties listed in the schema, we will be successful
                            -> the issue is, these extra properties won't be listed in the return data property
                                user.safeParse({user:'b',age:22,name:'a'})  -> {success: true, data: {user:'b',age:22} }
                                user.passthrough().safeParse({user:'b',age:22,name:'a'}  -> {success: true, data: {user:'b',age:22, name:'a'} }
                            * we will usually test the success, and use our original data.
                    .strict - on our object schema, this throws an error if we ever have extra properties on the object, past our required ones
                            const user = z.object({user: z.string(),  age: z.number()}).strict;
                            user.passthrough().safeParse({user:'b',age:22,name:'a'}) // error, passthrough doesn't matter here
                            * strict is very breaking, so we probably will not use it and only care about our listed properties

                    .catchall - put type requirements on any extra properties
                            const user = z.object({user: z.string(),age: z.number()}).catchall(z.number());
                            user.safeParse({user:'b',age:22,name:'b'}) //success: false,  extra property is not a number
                            * if we use .strict, catchall() makes it so we can have any extra properties of this type only

            Arrays - create a schema for arrays
                            const stringArray = z.array(z.string()); -> same as below
                            const stringArray = z.string().array();

                    .nonempty() - make sure the array is not empty
                        z.array(z.string()).nonempty

                    arrays can only have one type inside, we have others like tuples, union for multiple types
                        const t  = z.array(z.string(),z.number()).nonempty()
                        console.log(t.safeParse([2])) //false because string is first and can only have 1 type

                        -> this array schema works if we have an array of the same objects from our db
                       * -> remember from postgres, we default items to NULL and our db can't have undefined items like javascript can, so we use
                            .nullable() on schema FROM the database, but will use .optional() on the schema to the database
                                const arr = z.array(
                                    z.object({
                                  user: z.string().nullable(),
                                  age: z.number()
                                }))
                            arr.safeParse([{user: 'landon', age: 30 },{user: 'landon', age: 30,n:'d' }]) //true

                    .min() - z.string().array().min(5); // must contain 5 or more items
                    .max() - z.string().array().max(5); // must contain 5 or fewer items
                    .length - z.string().array().length(5); // must contain 5 items exactly



            Tuples - unlike arrays, tuples can have multiple types in the same array, order matters. Above we have an object with string, number..
                        -> but that object is the only type in the array, further up we show without an object, only the first type will take affect in arrays
                        -> tuples have FIXED number of elements, vs arrays can have unlimited if the types match

                    Array example above: one type, unlimited elements
                        const t  = z.array(z.string(),z.number()).nonempty() //fails because only the string is checked
                     tuple
                        const arr = z.tuple([ z.string(),z.number()])
                        console.log(arr.safeParse(['bob', 3,5])) //false, more items than tuple schema has.
                        console.log(arr.safeParse(['bob', 3])) //true

                    .rest() - lets us have more than fixed amount of elements in a tuple, of the same type
                        const arr = z.tuple([z.string(),]).rest(z.number())
                        console.log(arr.safeParse(['bob', 3,5])) // true

            Unions - lets us have multiple options for a schema, like OR ||

                    const u = z.union([z.string(), z.number()])
                        console.log(u.safeParse(2)) //true
                        console.log(u.safeParse({})) //false
                .or() - does the same as union
                        const u = z.string().or(z.number())
                        console.log(u.safeParse(3)) // true

                forms - in react forms, we usually set the initial values to empty strings "", or we can set it to NULL
                        we will usually use empty strings to show that we want a string there. this is important

                        Empty strings are NOT the same as getting undefined, we must check this in our zod schema

                        -> we have a url format, if not url then it fails, but if empty string, it passes, like from an empty form input
                            const u = z.string().url().or(z.literal(''))
                            console.log(u.safeParse('')) // true

                        * -> literal means any type, but it must pass for that EXACT value, so z.literal('cat') means only string of 'cat' will pass


                function  - we can test a functions output with certain input requirements
                            -> we won't be doing this because we make unit test for testing what we expect a function to output,
                            -> in production we dont need to validate what types a function will return each time, that's a big waste of processing power


            schema methods -

                    parse - z.string().parse(123) -> throws error
                    safeParse - z.string().safeParse(123) -> returns object with {success: false, data}
                                -> we check the return object to give the user a response instead of throwing errors
                    refine & super refine - we can add Custom validation, someone like, is the first letter of the word capitalized
                                -> most things will be covered with regex and our methods we have on string(), so our uses for refine are rare
                                -> a potential use is async, we can call custom validation on a string that calls the database and checks if it's unique
                                -> we can of course do this outside of zod as well
                                    const userId = z.string().refine(async (id) => {
                                      // verify that ID exists in database
                                      return true; });
                                    userID.safeParseAsync('123') //ALWAYS use async parse with async refine or you will get an error

                    transform - transform data after it's parsed, but not too useful to us since we don't use the returned values, we parse and use our original value
                                -> zod is trying to combine 2 steps in 1, where we want to only use zod for validation, and not data manipulation like below
                                const stringToNumber = z.string().transform((val) => val.length);
                                stringToNumber.parse("string"); // => 6


























































*/
























