import {
    IonContent,
    IonHeader,
    IonPage,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardContent,
    IonItem,
    IonSelectOption,
    IonSelect,
    IonButton,
    IonToast,
    IonToolbar, IonGrid, IonRow, IonCol,
} from '@ionic/react';
import React, {useEffect} from "react";
import temps from "../util/temps";
import {db, fire} from "../util/firebase";
import { Setting, toSettings } from "../util/models";
import axios from "axios";

const Settings: React.FC = () => {
    const [userSettings, setUserSettings] = React.useState<Setting>(); // Uses settings model from DB to map data to variable
    const [toast, setToast] = React.useState(false); // Message Display
    const [auto, setAuto] = React.useState(false); // Auto Heating Mode
    const [min, setMin] = React.useState(0); // Min Temp
    const [max, setMax] = React.useState(0); // Max Temp
    const [message, setMessage] = React.useState(""); // Message value
    const currentUser = fire.auth().currentUser; // Gets current user
    const currentUserEmail = currentUser?.email!; // Gets current users email
    let doc = db.collection('settings').doc(currentUserEmail); // Sets current users settings doc to variable

    useEffect(() => {
            doc.get().then((doc) => {setUserSettings(toSettings(doc));}) // Sends data from db to model
    }, [doc]);

    useEffect(() => {
        setInterval (() => {
            fire.auth().currentUser?.getIdToken().then((idToken) => { // Updates firebase token to keep user logged in
                localStorage.setItem('Token', `Bearer ${idToken}`);
            }).catch((error) => {
                console.log(error)
            });
        }, 3300000)
    }, [])

    const heating = (setting: boolean) => {
        setAuto(setting)
        const authToken = localStorage.getItem('Token'); // Adds token to request
        return axios({ // Axios request to backend
            url: `https://europe-west1-hummid.cloudfunctions.net/api/settings`, // Settings Route
            method: 'POST',
            data: {
                messageType: "heatingAuto", // Sends this as messageType
                setting: `${setting}` // Sends this setting
            },
            headers: {
                Authorization: `${authToken}` // Sends token as header
            }
        }).then(res => {
            setMessage(res.data.message) // Set message
            return setToast(true); // Show message
        }).catch(err => {
            defaultError(err); // If error is caught run defaultError function
        })
    }

    const setMinTemp = () => {
        let checkMax = userSettings?.maxTemp;
        if (min > checkMax!) {
            setMessage("Min can't be more than maximum temperature")
            setToast(true);
        } else {
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
                setMin(0);
                return doc.update({
                    minTemp: min
                })
            }).catch((err) => {
                defaultError(err);
            })
        }
    }

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

    const defaultError = (error: any) => {
        if (!error.response) {
            setMessage("Server is offline!")
            setToast(true);
            return;
        }
        if (error.response.status === 403) {
            logout();
            return error;
        }
        setMessage(error)
        setToast(true);
        return error;
    }

    const logout = () => { // Log out user
        localStorage.removeItem('Token'); // Remove token from users browser
        fire.auth().signOut().then(() => { // Sign user out
            setMessage("Logging You Out"); // Set message
            return setToast(true); // Show message
        });
    }

    return (
    <IonPage>
        <IonHeader className="ion-text-center">
            <IonToolbar>
                <img className="logo-header" src='https://storage.googleapis.com/hummid-pub-imgs/logo.png' alt={"Hummid Logo"}/>
            </IonToolbar>
        </IonHeader>
      <IonContent fullscreen>
          <div className={"align-center"}>
              <IonGrid>
                  <IonRow>
                      <IonCol>
                          <IonCard className="ion-text-center">
                              <IonCardHeader>
                                  <IonCardSubtitle>Automatic Mode</IonCardSubtitle>
                              </IonCardHeader>
                              <IonCardContent>
                                  Status: {auto ? "Currently On" : "Currently Off"}
                                  <div className={"ion-padding-top"}>
                                      { auto ?
                                          <IonButton expand="block" fill="outline" color="danger" onClick={() => heating(false)}>Turn off</IonButton> :
                                          <IonButton expand="block" fill="outline" color="success" onClick={() => heating(true )}>Turn on</IonButton>
                                      }
                                  </div>
                              </IonCardContent>
                          </IonCard>
                      </IonCol>
                  </IonRow>
                  <IonRow>
                      <IonCol>
                          <IonCard className="ion-text-center">
                              <IonCardHeader>
                                  <IonCardSubtitle>Min Temp</IonCardSubtitle>
                              </IonCardHeader>
                              <IonCardContent >
                                  <IonItem>
                                      <IonSelect interface="popover" value={min} name="country" placeholder={`Current Min Temperature: ${userSettings?.minTemp} ℃`} onIonChange={e => setMin(e.detail.value)}>
                                          {temps.map((temp) => (
                                              <IonSelectOption className="ion-text-center" value={temp.temp} key={temp.temp}>{temp.temp} &#8451;</IonSelectOption>
                                          ))};
                                      </IonSelect>
                                  </IonItem>
                                  {min ? <IonButton onClick={setMinTemp} fill="outline" color="warning" expand="block">Update Minimum Temperature</IonButton> : ""}
                              </IonCardContent>
                          </IonCard>
                      </IonCol>
                  </IonRow>
                  <IonRow>
                      <IonCol>
                          <IonCard className="ion-text-center">
                              <IonCardHeader>
                                  <IonCardSubtitle>Max Temp</IonCardSubtitle>
                              </IonCardHeader>
                              <IonCardContent>
                                  <IonItem>
                                      <IonSelect interface="popover" value={max} name="country" placeholder={`Current Max Temperature: ${userSettings?.maxTemp} ℃`} onIonChange={e => setMax(e.detail.value)}>
                                          {temps.map((temp) => (
                                              <IonSelectOption className={"ion-select-center"} value={temp.temp} key={temp.number}>{temp.temp} &#8451;</IonSelectOption>
                                          ))};
                                      </IonSelect>
                                  </IonItem>
                                  {max ? <IonButton onClick={setMaxTemp} fill="outline" color="warning" expand="block">Update Maximum Temperature</IonButton> : ""}
                              </IonCardContent>
                          </IonCard>
                      </IonCol>
                  </IonRow>
                  <IonRow>
                      <IonCol>
                          <IonButton onClick={logout} color="danger" expand="block">Sign out</IonButton>
                      </IonCol>
                  </IonRow>
              </IonGrid>
          </div>
      </IonContent>
        <IonToast
            color={"primary"}
            isOpen={toast}
            onDidDismiss={() => setToast(false)}
            message={message}
            duration={2000}
        />
    </IonPage>
  );
};

export default Settings;
