import { Redirect, Route } from 'react-router-dom';
import { IonRouterOutlet, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/react';
import { home, cog } from 'ionicons/icons';
import { IonReactRouter } from '@ionic/react-router';
import Dashboard from './pages/Dashboard';
import Settings from "./pages/settings";

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
import {useAuth} from "./auth/auth";

const AppTabs: React.FC = () => {
    const { loggedIn } = useAuth();
    if (!loggedIn) {
        window.location.href = '/';
    }
  return (
        <IonReactRouter>
          <IonTabs>
          <IonRouterOutlet>
            <Route exact path={"/my/dashboard"} >
              <Dashboard/>
            </Route>
            <Route exact path={"/my/settings"} >
              <Settings/>
            </Route>
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
                <IonTabButton tab="dashboard" href={"/my/dashboard"}>
                  <IonIcon icon={home} />
                  <IonLabel>Dashboard</IonLabel>
                </IonTabButton>

                <IonTabButton tab="setting" href={"/my/settings"}>
                  <IonIcon icon={cog} />
                  <IonLabel>Setting</IonLabel>
                </IonTabButton>
              </IonTabBar>
          </IonTabs>
        </IonReactRouter>
  );
}

export default AppTabs;
