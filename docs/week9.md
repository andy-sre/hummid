[Return To Weekly Overview](https://iamandyie.github.io/hummid/)

# Week 9 (12/04/21 - 18/04/21)

```typescript
const Settings: React.FC = () => {
    const [userSettings, setUserSettings] = React.useState<Setting>();
    const [toast, setToast] = React.useState(false);
    const [auto, setAuto] = React.useState(false);
    const [min, setMin] = React.useState(0);
    const [max, setMax] = React.useState(0);
    const [message, setMessage] = React.useState("");
    const currentUser = fire.auth().currentUser;
    const currentUserEmail = currentUser?.email!;
    let doc = db.collection('settings').doc(currentUserEmail);

    useEffect(() => {
            doc.get().then((doc) => {setUserSettings(toSettings(doc));})
    }, [doc]);

    useEffect(() => {
        setTimeout (() => {
            fire.auth().currentUser?.getIdToken().then((idToken) => {
                localStorage.setItem('Token', `Bearer ${idToken}`);
            }).catch((error) => {
                console.log(error)
            });
        }, 3300000)
    }, [])

    const setMinTemp = () => {
        const authToken = localStorage.getItem('Token');
        return axios({
            url: `https://europe-west1-hummid.cloudfunctions.net/api/settings`,
            method: 'POST',
            data: {
                messageType: "minTemp",
                setting: min
            },
            headers: {
                Authorization: `${authToken}`
            }
        }).then(res => {
            setMessage(res.data.message)
            setToast(true);
            setMax(0);
            return doc.update({
                minTemp: min
            })
        }).catch(() => {

        })
    }

    const setMaxTemp = () => {
        const authToken = localStorage.getItem('Token');
        return axios({
            url: `https://europe-west1-hummid.cloudfunctions.net/api/settings`,
            method: 'POST',
            data: {
                messageType: "maxTemp",
                setting: max
            },
            headers: {
                Authorization: `${authToken}`
            }
        }).then(res => {
            setMessage(res.data.message)
            setToast(true);
            setMax(0);
            return doc.update({
                maxTemp: max
            })
        }).catch(() => {

        })
    }

    const logout = () => {
        localStorage.removeItem('Token');
        fire.auth().signOut().then(() => {
            setMessage("Logging You Out");
            return setToast(true);
        });
    }

    const heating = (setting: boolean) => {
        setAuto(setting)
        const authToken = localStorage.getItem('Token');
        return axios({
            url: `https://europe-west1-hummid.cloudfunctions.net/api/settings`,
            method: 'POST',
            data: {
                messageType: "heatingAuto",
                setting: `${setting}`
            },
            headers: {
                Authorization: `${authToken}`
            }
        }).then(res => {
            setMessage(res.data.message)
            return setToast(true);
        }).catch(err => {
            console.log(err)
        })
    }

    return ()
}
```

This week I worked on the settings page.  It was not too hard to impliment as it was similar to the Dashboard page.  I run
another useEffect() to renew the users token every 55 minutes.  I also run a axios request for a minimum, maximum and auto heating
