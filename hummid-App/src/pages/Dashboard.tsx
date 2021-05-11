import {
    IonContent,
    IonHeader,
    IonPage,
    IonToast,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonCardContent,
    IonSpinner,
    IonGrid,
    IonRow,
    IonCol,
    IonToolbar,
    IonIcon,
    IonButton,
} from '@ionic/react';
import React, {useEffect, useState} from "react";
import axios from "axios";
import { fire, db } from "../util/firebase";
import { User, toUser, WeatherData, DeviceModel } from "../util/models";
import { renderIcon, sunrise, sunset, tempIcon, compass, wind} from '../images/icons';
import { power } from 'ionicons/icons';

const Dashboard: React.FC = () => {
    const [data, setData] = React.useState<User>(); // Uses user model from DB to map data to variable
    const [deviceData, setDeviceData] = React.useState<DeviceModel>(); // Uses deviceModel to Map data from variable
    const [weather, setWeather ] = React.useState<WeatherData>(); // Uses weatherData to map data from variable
    const [tempLoading, setTempLoading] = React.useState(true); // Loading State for animation
    const [weatherLoading, setWeatherLoading] = React.useState(true); // Loading State for animation
    const [error, setError] = useState<string>(""); // Error message
    const [showError, setShowError] = useState(false); // Error Display
    const currentUser = fire.auth().currentUser; // Gets current logged in user
    const currentUserEmail = currentUser?.email!; // Gets their email
    const userRef = db.collection('users').doc(currentUserEmail); // Sets the current user users document to variable
    const settingDB = db.collection('settings').doc(currentUserEmail) // Sets the current user settings document to variable
    let tempInterval: any;
    let weatherInterval: any;
    let weatherTemp;
    let celsius;

    useEffect(() => { // Runs when page is entered
            userRef.get().then((doc) => {
                setData(toUser(doc)); // Gets data from document then maps it to user model
            }).catch(err => {
                console.log(err)
            })
    }, [userRef])

    useEffect(() => {
        setInterval (() => {
            fire.auth().currentUser?.getIdToken().then((idToken) => { // Updates firebase token to keep user logged in
                localStorage.setItem('Token', `Bearer ${idToken}`);
            }).catch((error) => {
                console.log(error)
            });
        }, 3300000)
    }, [])

    useEffect(() => {
        tempInterval = setInterval(() => { // Gets temperature from backend every 30 seconds by running getTemps() function
            getTemps()
                .then(data => setDeviceData(data))
                .catch(error => {
                    return error;
                })
        }, 30000);
        return () => clearInterval(tempInterval);
    }, [tempInterval])

    useEffect(() => {
        const getWeather = () => { // Gets weather from backend every 30 seconds below function
            const authToken = localStorage.getItem('Token'); // Adds token to request
            setWeatherLoading(true); // Sets loading to true
            axios({ // Axios request to backend
                url: `https://europe-west1-hummid.cloudfunctions.net/api/weather`, // Weather route
                method: 'POST', // Post method
                data: {
                    city: data?.city ?? 'Dublin', // From user DB send city if not send dublin
                    country: data?.country ?? 'IE' // From user DB send country if not send IE
                },
                headers: {
                    Authorization: `${authToken}` // Send token in header
                },
            }).then(res => { // then
                setWeatherLoading(false); // Set weather loading to false
                setWeather(res.data) // setWeather to the returned data
                return console.log(res)
            }).catch(error => {
                defaultError(error); // Run defaultError function if the catch statement is ran
            })
        }
        weatherInterval = setInterval(() => {
            getWeather(); // Runs weather function every 30 seconds
        }, 30000);
        return () => clearInterval(weatherInterval);
    }, [weatherInterval]);

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
            defaultError(error);
        })
    };

    const heating = (setting: boolean) => {
        const authToken = localStorage.getItem('Token');
        return axios({
            url: `https://europe-west1-hummid.cloudfunctions.net/api/settings`,
            method: 'POST',
            data: {
                messageType: "heatingManual", // Add settings data to the request
                setting: `${setting}` // Add settings data to the request
            },
            headers: {
                Authorization: `${authToken}`
            }
        }).then(res => {
            setError(res.data.message)
            setShowError(true);
            if (setting) { // If true
                return settingDB.update({ // Update settings DB with these values
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
            defaultError(error);
        })
    }

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

    const logout = () => { // Log out user
        setError('Error: Invalid Token Detected.  You will be logged out!');
        setShowError(true);
        setTimeout(() => { // Wait 4 seconds
            localStorage.removeItem('Token'); // Remove token from browser
            fire.auth().signOut().then(() => { // Sign out user
                return; // Return
            });
        }, 4000);
    }

    weatherTemp = weather?.main.temp ?? 2; // Gets weather temperature
    celsius = (weatherTemp - 273.15).toFixed(1); // Convert to celcius

    const getSunrise = () => { // Calculation for sunrise
        const sunriseData = weather?.sys.sunrise ?? 0;
        return new Date(sunriseData * 1000);
    }

    const getSunset = () => { // Calculation for sunset
        const sunsetData = weather?.sys.sunset ?? 0;
        return new Date(sunsetData * 1000);
    }

    return (
    <IonPage>
      <IonHeader className="ion-text-center">
          <IonToolbar>
            <img className="logo-header" src='https://storage.googleapis.com/hummid-pub-imgs/logo.png' alt={"Hummid Logo"}/>
          </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
          <h3 className={"ion-text-center"}>Welcome {data?.fname}</h3>
          <div className={"desktop-version"}>
              <IonGrid>
                  <IonRow>
                      <IonCol>
                          <IonCard className="ion-text-center">
                              <IonCardHeader>
                                  <IonCardTitle>Thermostat</IonCardTitle>
                              </IonCardHeader>
                              <IonCardContent>
                                  <div className="temps">
                                      {tempLoading ? <IonSpinner name="dots" /> :
                                          <div>
                                              <IonGrid className={"weather-col-lg"}>
                                                  <IonRow>
                                                      <IonCol>
                                                          <div>Temperature:</div>
                                                      </IonCol>
                                                      <IonCol className={""}>
                                                          <div className={""}>{deviceData?.temps} &#8451;</div>
                                                      </IonCol>
                                                  </IonRow>
                                                  <IonRow>
                                                      <IonCol>
                                                          <div>Heating:</div>
                                                      </IonCol>
                                                      <IonCol className={""}>
                                                          <div className={""}>{deviceData?.heating ? <IonIcon className={"power-on"} icon={power}/> : <IonIcon className={"power-off"} icon={power}/>}
                                                          </div>
                                                      </IonCol>
                                                  </IonRow>
                                              </IonGrid>
                                              <div>
                                                  {deviceData?.heating ?
                                                      <IonButton fill="outline" expand="block" color="danger" onClick={() => heating(false)}>Turn Off Heating</IonButton> :
                                                      <IonButton fill="outline" expand="block" color="success" onClick={() => heating(true)}>Turn On Heating</IonButton>
                                                  }
                                              </div>
                                          </div>
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
                                  <IonCardTitle>Weather</IonCardTitle>
                                  <IonCardSubtitle>in {data?.city}</IonCardSubtitle>
                              </IonCardHeader>
                              <IonCardContent>
                                  <div className="temps">
                                      {weatherLoading ? <IonSpinner name="dots" /> :
                                          <div>
                                              <div className={"icon"}>
                                                  {renderIcon(weather?.weather[0].icon)}
                                              </div>
                                              <div className={"weather-info"}>
                                                  <IonGrid className={"weather-col-lg"}>
                                                      <IonRow>
                                                          <IonCol>
                                                              <div className={"weather-icon"}>{tempIcon}</div>
                                                          </IonCol>
                                                          <IonCol className={"weather-text"}>
                                                              <div className={"weather-text"}>{celsius}&#8451;</div>
                                                          </IonCol>
                                                      </IonRow>
                                                      <IonRow>
                                                          <IonCol>
                                                              <div className={"weather-icon"}>{sunrise}</div>
                                                          </IonCol>
                                                          <IonCol>
                                                              <div className={"weather-text"}>{getSunrise().toLocaleTimeString()}</div>
                                                          </IonCol>
                                                      </IonRow>
                                                      <IonRow>
                                                          <IonCol>
                                                              <div className={"weather-icon"}>{sunset}</div>
                                                          </IonCol>
                                                          <IonCol>
                                                              <div className={"weather-text"}>{getSunset().toLocaleTimeString()}</div>
                                                          </IonCol>
                                                      </IonRow>
                                                      <IonRow>
                                                          <IonCol>
                                                              <div className={"weather-icon"}>{wind}</div>
                                                          </IonCol>
                                                          <IonCol>
                                                              <div className={"weather-text"}>{weather?.wind.speed} M/S</div>
                                                          </IonCol>
                                                      </IonRow>
                                                      <IonRow>
                                                          <IonCol>
                                                              <div className={"weather-icon"}>{compass}</div>
                                                          </IonCol>
                                                          <IonCol>
                                                              <div className={"weather-text"}>{weather?.wind.deg} &deg;</div>
                                                          </IonCol>
                                                      </IonRow>
                                                  </IonGrid>
                                              </div>
                                          </div>
                                      }
                                  </div>
                              </IonCardContent>
                          </IonCard>
                      </IonCol>
                  </IonRow>
              </IonGrid>
          </div>

      </IonContent>
        <IonToast
            color={"primary"}
            isOpen={showError}
            onDidDismiss={() => setShowError(false)}
            message={error}
            duration={2000}
        />
    </IonPage>
  );
};

export default Dashboard;
