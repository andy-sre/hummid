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