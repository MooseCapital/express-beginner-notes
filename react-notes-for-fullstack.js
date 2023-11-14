/*
    React notes - mistakes junior devs make  https://www.youtube.com/watch?v=-yIsQPp31L0

        1) don't set state with setState(newState) -> remember these update on the next render
            -> and it's state is not up to date if we set multiple times in a row
            * setState(prev => prev + 1)  -> this gets the most up to date value, before render

        2) conditionally render components, the ternary is fine to use for this is a prop is passed or not
            id ? <div>we got it</div> : 'we don't got it';


        3) setting object state should use spread operator to get all object properties!
            -> if we do setUser({name: e.target.value})   , then we override all properties.. oof
            const [user, setUser] = useState({name: "", city: ""})
            function handleChange(e) {
                setUser(prev => ({
                        ..prev,
                        name:e.target.value
                    })
                )
            }
                -> here we spread the previous object like bob Zirolls react course taught us

        4) use object instead of multiple states, for all form values, a state with many inputs like 4+
            -> it would be too complicated to make multiple states for each input, so make one state object
            -> for the entire form

            const [form, setForm] = useState({name:"", email:"",password:"",zip:""})
                function handleChange(e) {
                setForm(prev => ({
                        ...prev,
                        [e.target.name]:e.target.value
                    }))}

          5) when we derive or calculate a value from another state, we don't need additional state, just plain variables can calculate!
                -> to force another re-render
                -> we might be tempted to use a state for totalPrice, but it's unnecessary, it will calculate the same on render
                const [quantity, setQuantity] = useState(1);
                const totalPrice = quantity * PRICE_PER_ITEM;
                    <div>{totalPrice} </div>


        6) don't forget referential equality, when setting primitives.. strings.. numbers to the same value, our component will not re-render
            -> if we set an OBJECT to the same values, it will re-render because the objects are not the same even though they are the same values
            -> remember the objects, arrays compare by reference, so when we optimize performance, use shallow comparison. instead of object comparison
            * this is most important for useEffect, our dependency array should not use the object.. because it'll run each time, instead use the property!
                useEffect(() => {

                },[obj.name])

        7) trying to render an undefined object before we have fetched it, our api call might take a few seconds, and our react div is trying to
            -> put an undefined objects data on the page, to prevent an error from reading an undefined object, we must do this
            -> put optional chaining on the object below, with question mark: post?.body
            *** the best solution is to not even render the object properties until it is loaded, with conditional rendering

                    const [post, setPost] = useState(null)
                    const [loading, setLoading] = useState(true)
                    useEffect(() => {
                       fetch('link_here').then((res) => res.json())
                           .then((data) => {
                                setPost(data);
                           })
                    },[])
                    <article>
                        {loading ? <div>loading...</div> :
                            <>
                                <div>{post?.title}</div>
                                <div>{post?.body}</div>
                            </>  }</article>



















        state - we can pass down props on the route and access them or use a state management like redux, use context..
            * remember, when we switched routes by clicking the about, home, testing links, it was like our local testing state disappeared, and we had to call the db
                -> again when we went back to it, so we must put state at a higher level to prevent calling the db again when not even refreshing the page
            -> redux will only add 12kb or so to our build, it is not the size, just the complexity, where passing props will be very easy
            <Route path="/testing"  element={<Testing state={{testFetch,setTestFetch,loading,setLoading}} />}/>
                props.state.loading
            -> this is not one size fit all, if we have a very big website, simply having all the state on app.jsx and passing it down, and potentially prop drilling
                -> 4 levels deep, is not very good. but if we have a basic saas, then it should not get too complicated and can stick with this.

        refresh - when refreshing in react, we lose all state values, like a reset, unless we use redux persist, or other things like localStorage, sessionStorage
            -> we can keep calling our database each refresh, but that's expensive, a cheaper option is use cache db that is safest, or sessionStorage, best of both
                https://tanstack.com/query/latest/docs/react/overview
            react-query is getting popular over redux now-a-days, but people still recommend we try using sessionStorage for data between refreshes.
                -> then react-query has in 'memory' storage, and also persistence, which is too complicated, over simple sessionStorage,
                -> but this in memory storage, means, we no longer have to raise our state up to App.jsx just so it's not lost when we click a different route
                -> remember navigating from testing to home components. our fetched data is instantly lost, and we didn't even refresh!, useQuery fixes this in memory
                    -> now our state can be held at the component level and prevent drilling

                https://www.w3schools.com/jsref/prop_win_sessionstorage.asp
            *when deciding to use something like sessionStorage, or a cache, like https://polyscale.ai/ , it depends on if our data is the same to everyone like a message board
                -> but user specific data won't benefit as much, so for this we can use sessionStorage.

*/


