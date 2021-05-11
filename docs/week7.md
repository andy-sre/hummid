[Return To Weekly Overview](https://iamandyie.github.io/hummid/)

# Week 7 (29/03/21 - 04/04/21)

This week I focused on authentication on the routes.  To do this I used a tutorial [Ionic React: Cross-Platform Mobile Development with Ionic 5
](https://www.udemy.com/course/ionic-react/) this shows a very good guide on using a inbuilt feature called [context](https://reactjs.org/docs/context.html)

```typescript
import React, {useContext} from 'react';
import {fire as firebaseAuth} from "../util/firebase";

interface Auth {
    loggedIn: boolean;
}

interface AuthInit {
    loading: boolean
    loggedIn: boolean;
}

export const AuthContext = React.createContext<Auth>({loggedIn: false});

export function useAuth(): Auth {
    return useContext(AuthContext);
}

export function useAuthInit(): AuthInit {
    const [authInit, setAuthInit] = React.useState<AuthInit>({loading: true, loggedIn: false});
    React.useEffect(() => {
        firebaseAuth.auth().onAuthStateChanged((user) => {
            setAuthInit({loading: false, loggedIn: Boolean(user)})
        })
    }, []);
    return authInit;
}
```

On each page I import the useAuth() function and check the loggedIn boolean this is a simple check to make sure 
unauthorized users can view routes that are meant for authorized users.  I use the useAuthInit() to monitor the users
authorization state and if it changes.  Firebase has a method to check if the users state has changed and if it does I
can update the loggedIn boolean from false to true and the user can then access the private routes.

I also implimented the middleware on the backend for the API routes.  this is ran in the API routes before the designated functions
for those routes.

What the below code does is firstly runs an if statement that checks there is a header with authorization data and also
it begins with the string 'Bearer ' if it does not it returns a 403 error to the user which displays an error to the
front-end and logs the user out as it's unauthorized.  Within the if statement I split the string and access just the token
itself

```
Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjRlOWRmNWE0ZjI4YWQwMjUwNjRkNjY1NTNiY2I5YjMzOTY4NWVmOTQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOi
JodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vaHVtbWlkIiwiYXVkIjoiaHVtbWlkIiwiYXV0aF90aW1lIjoxNjE5NzA5NjE2LCJ1c2VyX2lkIjoia1
VVY2RTakI4YVR3U3hsY0xIbGxFRjkyRUV4MiIsInN1YiI6ImtVVWNkU2pCOGFUd1N4bGNMSGxsRUY5MkVFeDIiLCJpYXQiOjE2MTk3MDk2MTYsImV4cCI6MT
YxOTcxMzIxNiwiZW1haWwiOiJpYW1zcGVuZGxvdmVAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIj
p7ImVtYWlsIjpbImlhbXNwZW5kbG92ZUBnbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.M6FdXqdiSNIj_yfKdlmyqr2N8hU
bcYhSRUpMsLbMraFIOPi8GeHlND39EMiUz0qVjO3Kl_fZ_eo2s2Kce1NUzBvf-SVVrwsCKNryeRoswr-g6F1PWFxjmRUd8bD_akl63rvo6Jzs2YwA15pldfA
gp8B8byGEa1oCvEH63DZbXYM8X9Tsr-zIGZlVCuWJU_ecjGdKhlZoH_ezLr-lwnJHfxMnLFLwGoJIkBZSfci9uH5IrJJkCRbZ1dpFwipmO_4TWiyV_bND9KL
xkFdMu_dnhqX5dWiDxwBy8rVx-1PtefC5Jx_EZqOfc7ojpVgPKwIss-RAeEZcOWxJ600xUOrXbQ
```

I then use an Firebase method that verifies the sent token against the one Firebase issued initially and if does not match
it returns a 403 error to the user and logs them out.

If all checks pass it runs next() what this does is runs the next function in the API route which is the specific function
for that route.

```javascript
const { admin } = require('./config');

module.exports = async(request, response, next) => {
    let idToken;
    if (request.headers.authorization && request.headers.authorization.startsWith('Bearer ')) {
        idToken = request.headers.authorization.split('Bearer ')[1];
        console.log('Received: ' + idToken)
        try {
            const verify = await admin.auth().verifyIdToken(idToken)
        } catch (err) {
            console.error('Error while verifying token', err);
            return response.status(403).json(err);
        }
    } else {
        console.error('No token found');
        return response.status(403).json({error: 'Unauthorized'});
    }
    next();
}


```
