[Return To Weekly Overview](https://iamandyie.github.io/hummid/)

# Week 4 (08/03/21 - 14/03/21)

Today I began working on the front-end of the application.  I used the following guide:

>[Your First Ionic App: React](https://ionicframework.com/docs/react/your-first-app)

To begin building out the webpages.  I started off building the pages themselves such as the home, login and registration 
pages.  I added the fields I wanted to add to them such as first name, last name, city, etc... and did some basic
UI/UX design to the pages.

Here's an example of the homepage with the two login and registration buttons:

```typescript
import {IonContent, IonPage, IonButton, IonGrid, IonRow, IonCol} from '@ionic/react';
import '../theme/styles.css'
import React from "react";
import {Redirect} from "react-router-dom";
import {useAuth} from "../auth/auth";

const Home: React.FC = () => {
    const { loggedIn } = useAuth();
    if(loggedIn) {
        return <Redirect to={"/my/dashboard"} />
    }

    return (
        <IonPage>
            <IonContent fullscreen>
                <div className="ion-text-center header">
                    <img className="logo" src='https://storage.googleapis.com/hummid-pub-imgs/Ab_hummid1-01.png' alt={"Logo"}/>
                    <IonGrid>
                        <IonRow>
                            <IonCol className="test">
                                <IonButton routerLink="/login" expand="block" color="primary">Login</IonButton>
                                <IonButton routerLink="/register" expand="block" color="primary">Register</IonButton>
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </div>
            </IonContent> 
        </IonPage>
);
};

export default Home;

```

I also set up the routing of the pages for the app.  I used the following guide to understand how Ionic routing works

>[React Navigation](https://ionicframework.com/docs/react/navigation)

```typescript
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
```

For the routes to work correctly I had to set them up as above using the exact paths.  Also I had to make sure when
creating the pages all the page names were correct, or the routing would not work.
