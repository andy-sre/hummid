import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonLoading, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { AuthContext, useAuthInit } from "./auth/auth";
import AppTabs from "./AppTabs";
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import React from "react";
import NotFound from "./pages/404";

const App: React.FC = () => {
  const authState = useAuthInit();

  if (authState.loading) {
    return <IonLoading isOpen/>
  }

  return (
      <IonApp>
        <AuthContext.Provider value={{ loggedIn: authState.loggedIn }}>
          <IonReactRouter>
            <IonRouterOutlet>
              <Route exact path={"/home"}>
                <Home />
              </Route>
              <Route exact path={"/login"}>
                <Login />
              </Route>
              <Route exact path={"/register"}>
                <Register />
              </Route>
              <Route path={"/my"}>
                <AppTabs />
              </Route>
              <Route>
                <NotFound />
              </Route>
              <Redirect exact path={"/"} to={"/home"}/>
            </IonRouterOutlet>
          </IonReactRouter>
        </AuthContext.Provider>
      </IonApp>
  );
}

export default App;
