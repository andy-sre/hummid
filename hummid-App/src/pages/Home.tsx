import {IonContent, IonPage, IonButton, IonGrid, IonRow, IonCol} from '@ionic/react';
import '../theme/styles.css'
import React from "react";
import {Redirect} from "react-router-dom";
import {useAuth} from "../auth/auth";

const Home: React.FC = () => {
    const { loggedIn } = useAuth(); // Import useAuth() Function.  Used to Check Login Details
    if(loggedIn) { // Log In Check
        return <Redirect to={"/my/dashboard"} /> // Checks authentication and redirect if not logged in
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
