[Return To Weekly Overview](https://iamandyie.github.io/hummid/)

### Week 12 (03/05/2021 - 09/05/2021)

This week I focused on fixing a bug to make sure the min temp was not higher than the max temp.  To do this I added the following code to the set temperature functions.  It's the simple if else statement to make sure the values are not higher/lower than the set temperture depending the type

```typescript
    const setMaxTemp = () => {
        let checkMin = userSettings?.minTemp;
        if (max < checkMin!) {
            setMessage("Max can't be less than minimum temperature")
            setToast(true);
        } else {
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
            }).catch((err) => {
                defaultError(err);
            })
        }
    }
```

I also added in error checking on the registration and login page to make sure the entered values are not blank.

```typescript
    const checkDetails = () => { // Checks Form For Blanks & If Passwords Match
        if (values.fname === "") { // If blank
            setError("First name Must Not Be Blank!"); // Set Error
            setShowError(true); // Display Error
            return false; // Return False
        } else if (values.lname === "") {
            setError("Last name Must Not Be Blank!");
            setShowError(true);
            return false;
        } else if (values.country === "") {
            setError("Country Must Not Be Blank!");
            setShowError(true);
            return false;
        } else if (values.city === "") {
            setError("City Must Not Be Blank!");
            setShowError(true);
            return false;
        } else if (values.phone === "") {
            setError("Phone Number Must Not Be Blank!");
            setShowError(true);
            return false;
        } else if (values.email === "") {
            setError("Email Must Not Be Blank!");
            setShowError(true);
            return false;
        } else if (values.password === "") {
            setError("Password Must Not Be Blank!");
            setShowError(true);
            return false;
        } else if (values.cpassword === "") {
            setError("Confirm Password Must Not Be Blank!");
            setShowError(true);
            return false;
        } else if (values.cpassword !== values.password) {
            setError("Passwords must match!");
            setShowError(true);
            return false;
        } else {
            return true; // If all ok return true
        }
    }

    const checkEmail = () => { // Tests email is formatted correctly
        const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // Email Regex
        return regex.test(values.email.toLowerCase()); // Tests email string to regex
    }
```

The final thing I done this week is refactoring my code.  For my errors in all my functions were essentially the same.  So what I did was made a global function and it passed in the error message to the function and did the normal checks.

```typescript
    const defaultError = (error: any) => { // Default error to run on pages.
        if (!error.response) { // Checks theres a response from server
            setError("Server is offline!")
            setShowError(true);
            return;
        }
        if (error.response.status === 403) { // If 403 error log user out
            logout();
            return error;
        }
        setError(error) // Set error
        setShowError(true); // Show error
        return error;
    }
```
