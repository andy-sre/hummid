[Return To Weekly Overview](https://iamandyie.github.io/hummid/)

# Week 8 (05/04/21 - 11/04/21)

This week I focused on the dashboard and settings page and getting them to send data to the backend.  I started off with
the dashboard page


```typescript
    const [data, setData] = React.useState<User>();
    const [deviceData, setDeviceData] = React.useState<DeviceModel>();
    const [weather, setWeather ] = React.useState<WeatherData>();
    const [tempLoading, setTempLoading] = React.useState(true);
    const [weatherLoading, setWeatherLoading] = React.useState(true);
    const [error, setError] = useState<string>("");
    const [showError, setShowError] = useState(false);
    const currentUser = fire.auth().currentUser;
    const currentUserEmail = currentUser?.email!;
    const userRef = db.collection('users').doc(currentUserEmail);
    const settingDB = db.collection('settings').doc(currentUserEmail)
    let tempInterval: any;
    let weatherInterval: any;
    let weatherTemp;
    let celsius;
```

The first part of code I worked on was the variable declarations on the useState declarations.  I also set up the Firebase
database to variables too by getting the current logged in users email and getting the document related to their email.

```typescript
   useEffect(() => {
        userRef.get().then((doc) => {
            setData(toUser(doc));
        }).catch(err => {
            console.log(err)
        })
    }, [userRef])

    useEffect(() => {
        setInterval(() => {
            fire.auth().currentUser?.getIdToken().then((idToken) => {
                localStorage.setItem('Token', `Bearer ${idToken}`);
            }).catch((error) => {
                console.log(error)
            });
        }, 3300000)
    }, [])

    useEffect(() => {
        tempInterval = setInterval(() => {
            getTemps()
                .then(data => setDeviceData(data))
                .catch(error => {
                    return error;
                })
        }, 30000);
        return () => clearInterval(tempInterval);
    }, [tempInterval])
```

The first bit of code is using useEffect() hooks.  These run when a user enters the page and stops when the user leaves the page.
the first useEffect is getting the users data from the database and mapping it to the setData and data through useState().
useState() allows us write code without having to create classes. [useState()](https://reactjs.org/docs/hooks-state.html).

Because I want to use the data variable to hold the data from the database I have to build an interface which is a template
that the data will go to.  Then I also have to map the data to the interface so I can access it through the data variable.
For example, data.fname will print the users first name which is from the database.



```typescript
export interface User {
    userId: string;
    fname: string;
    lname: string;
    country: string;
    city: string;
    email: string;
    phone: number;
}

export function toUser(doc: firebase.firestore.DocumentSnapshot): User {
    return {userId: doc.id, ...doc.data()} as User;
}
```

The next useEffect() forces firebase to issue a new token every 55 minutes.  If I did not have this I would risk the user
being forcibly logged out.

The next useEffect() I added was to get the temperatures from the backend every 30 seconds.  This runs this function then 
adds the data to a DeviceModel interface where I can access the temps and the heating status.

```typescript
    const getTemps = () => {
        const authToken = localStorage.getItem('Token');
        setTempLoading(true);
        return axios({
            url: `https://europe-west1-hummid.cloudfunctions.net/api/temps`,
            method: 'POST',
            headers: {
                Authorization: `${authToken}`
            },
        }).then(res => {
            setTempLoading(false);
            console.log(res);
            return res.data;
        }).catch(error => {
            if (!error.response) {
                setError("Server is offline!")
                setShowError(true);
                return;
            }
            if (error.response.status === 403) {
                logout();
                return error;
            }
            setError(error)
            setShowError(true);
            return error;
        })
    };
```

This code begins by getting the users token from the browsers storage then sets the loading animation to true.  It then runs
an axios request the backend with the "/temps" route.  It will be a post request too as we're sending data to the request which 
is the token thats saved on the users browser.

The .then statements are promises that wait to be fulfilled the then statement sets the animation to false as it's recieved
data from the back end.  It then returns from the function with the res (response) data.  Theres also a .catch method that runs
if the .then can't be fulfilled which checks if there was response from the server.  If there wasn't it will
display an error to the user.  If it was and the error was a 403 error it logs the user out by running the logout function
if theres any other error we display it to the user.

I have two other functions similar to the one above such as the below one where we get the weather information from the "/weather"
route:

```typescript
    useEffect(() => {
        const getWeather = () => {
            if (data) {
                const authToken = localStorage.getItem('Token');
                setWeatherLoading(true);
                return axios({
                    url: `https://europe-west1-hummid.cloudfunctions.net/api/weather`,
                    method: 'POST',
                    data: {
                        city: data?.city,
                        country: data?.country
                    },
                    headers: {
                        Authorization: `${authToken}`
                    },
                }).then(res => {
                    setWeatherLoading(false);
                    setWeather(res.data)
                    console.log(res)
                    return res.data;
                }).catch(error => {
                    if (!error.response) {
                        setError("Server is offline!")
                        setShowError(true);
                        return;
                    }
                    if (error.response.status === 403) {
                        logout();
                        return error;
                    }
                    setError(error)
                    setShowError(true);
                    return error;
                })
            }
        }
        weatherInterval = setInterval(() => {
            getWeather();
        }, 30000);
        return () => clearInterval(weatherInterval);
    }, [weatherInterval]);
```

The reason I have this one in a useEffect() is because the users city & country were being sent as undefined.  This is 
because with Typescript I am using data?.city the ? promises the data will be filled.  But to make sure the variables have
been filled I run the function in an if statement that checks that data has been filled with information.

```typescript
   const heating = (setting: boolean) => {
        const authToken = localStorage.getItem('Token');
        return axios({
            url: `https://europe-west1-hummid.cloudfunctions.net/api/settings`,
            method: 'POST',
            data: {
                messageType: "heatingManual",
                setting: `${setting}`
            },
            headers: {
                Authorization: `${authToken}`
            }
        }).then(res => {
            setError(res.data.message)
            setShowError(true);
            if (setting) {
                return settingDB.update({
                    auto: false,
                    manual: true
                })
            } else {
                return settingDB.update({
                    auto: true,
                    manual: false
                })
            }
        }).catch((error) => {
            if (!error.response) {
                setError("Server is offline!")
                setShowError(true);
                return;
            }
            if (error.response.status === 403) {
                logout();
                return error;
            }
            setError(error)
            setShowError(true);
            return error;
        })
    }
```

The heating function is ran if the heating button is pressed by the user it also updates the database settings too so it will
reflect when the user logs in at a later time.

```typescript
    const logout = () => {
        setError('Error: Invalid Token Detected.  You will be logged out!');
        setShowError(true);
        setTimeout(() => {
            localStorage.removeItem('Token');
            fire.auth().signOut().then(() => {
                return;
            });
        }, 4000);
    }
```

The next bit of code I worked on was the logout function.  This sets an error to alert the user the token is invalid.
waits 4 seconds then removed the token from the users browser, runs a Firebase signOut() function then the user is redirected
to the logout page.

```typescript
    weatherTemp = weather?.main.temp ?? 2;
    celsius = (weatherTemp - 273.15).toFixed(1);

    const getSunrise = () => {
        const sunriseData = weather?.sys.sunrise ?? 0;
        return new Date(sunriseData * 1000);
    }

    const getSunset = () => {
        const sunsetData = weather?.sys.sunset ?? 0;
        return new Date(sunsetData * 1000);
    }
```

The first part of the above code was to convert the weather info from kelvin to oC.

The next part was to convert the sunrise from the weather info into a date and time that was readable and to get the correct
date we also had to times the sunrise by 1000.

The last part is similar to the above but for the sunset.
