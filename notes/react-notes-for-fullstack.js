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


        8) custom hooks, don't be afraid to make them and use them, we need custom hooks to avoid duplication when using the same code, like get fetch.
            -> and we reduce the lines in each component, no more scrolling 50 lines down, it's much cleaner!

                    function userScrollPosition(pageName) {
                        const [userEvent, setUserEvent] = useState(JSON.parse(sessionStorage.getItem(pageName)) || 1);

                        useEffect(() => {
                            sessionStorage.setItem(pageName, JSON.stringify(userEvent))
                            return () => {
                            }
                        },[userEvent])

                        useEffect(() => {
                            let subscribed = true;
                            handleUserEvent = () => {
                                setUserEvent(prevState => window.scrollY)
                            }
                            try {
                                if (subscribed) {
                                    window.addEventListener("scroll", handleUserEvent)
                                }
                            } catch (e) {
                                console.log(e)
                            }
                            return () => {
                                console.log("clean up function")
                                window.removeEventListener("scroll", handleUserEvent)
                                subscribed = false;
                            }
                        }, [])
                        return [userEvent, setUserEvent]
                    }
                    export {userScrollPosition}

                -> in the component using our custom hook:
                    const [userEvent, setUserEvent] = userScrollPosition('about-page')



            9) use most up-to-date state with prev always!, we know using an interval breaks and skips numbers unless we clean up the interval.
                -> and it happens because if we simply setCount(count+1) -> we don't get the most up to date interval, so it messes up
                        useEffect(() => {
                          setInterval(() => {
                                setCount(prevState => prevState + 1)
                          },1000)
                        },[])










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

            react-query vs redux - since query is a server cache state tool, while redux is local state management, these work together, since react-query manages api calls
                -> and caches them for us, then re-renders the component, so local values, non api, aren't much use. but as we have seen, some reddit users said
                -> they try and use react-query for one size fits all and keep most of their state on the server side https://tanstack.com/query/v4/docs/react/guides/does-this-replace-client-state
                * if we are unable to use react-query as global state, and server only cache, it seems we will need redux or context again.


            Simple option - as we saw redux was not easy to use at all, the option to prevent losing state on route changes are move it up to app.jsx.. BUT this could mean
                -> lots of prop drilling, so we can try react-query, if query doesn't work out. we have another option we knew all along.. sessionStorage.

                we put state at the local component level -> we click another route and our state disappears -> now we must refetch our db which cost us money :(
                OR, we simply hold those states in sessionStorage, so when we click back, we don't build a new state, we simply get the values from storage
                -> now it's not held at the app.jsx level, it's in local components, and we prevented a database call AND we use this on refreshes as well!!
                        const [testingComp, setTestingComp] = useState(JSON.parse(sessionStorage.getItem("testingComp")) || {
                                fetchData: null,
                                loading: true,
                                fetchRan: false,
                                count: 0
                            });

                        useEffect(() => {
                            sessionStorage.setItem("testingComp", JSON.stringify(testingComp))
                            return () => {
                            }
                        },[testingComp])


        Fetch vs axios in react - https://blog.logrocket.com/axios-vs-fetch-best-http-requests/    https://blog.logrocket.com/how-to-make-http-requests-like-a-pro-with-axios/#monitoring
            Axios has some features fetch does not have in react, and we need a polyfill for the 3% of users with old browsers that don't have fetch built in.

            Axios does not only give the server response like fetch, it responds with the headers content type, the content-length of our data in bytes..
                the request state object, status code, and of course a property with our data array

            1) when we make a get request, content-type defaults to application/json, charset=utf-8, so we don't need to configure further for all request
                const axiosResponse = await axios.get(`${import.meta.env.VITE_API_LINK}/store/test`)
                console.log(axiosResponse.data)

                -> post request auto convert to json as well! if we only put text, it sets content-type to text instead of application/json
                    await axios
                      .post('localhost:3000/api', {name:'bob'}, {
                        headers: {
                          Accept: "application/json",
                          "Content-Type": "application/json;charset=UTF-8",
                        },
                      })

            2) response timeout - if we want to abort a request on error, we use abort controller like in fetch, but our error did not flow to our catch statement
                -> in the actual request we put timeout to say how long to ask for a response before cancel.
                    timeout: 4000
                -> so we need to put our own axios.interceptor error handler here
                axios.interceptors.response.use(
                    (response) => response,
                    (error) => {
                        if (error.code === "ERR_CANCELED") {
                            console.error('request canceled')
                            return Promise.resolve({status: 499})
                        }
                        return Promise.reject((error.response && error.response.data) || 'Error')
                    }
                );

            3) we can get download progress of file with axios easily, where we can't with fetch

            4) simultaneous request like promise.all() -> axios can start many request at one time
                axios.all([
                  axios.get('https://api.github.com/users/iliakan'),
                  axios.get('https://api.github.com/users/taylorotwell')
                ])








*/


