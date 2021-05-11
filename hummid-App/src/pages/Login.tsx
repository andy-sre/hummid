import {
    IonContent,
    IonHeader,
    IonPage,
    IonButton,
    IonList,
    IonLabel,
    IonItem,
    IonInput,
    IonIcon,
    IonToast, IonRow, IonCol, IonGrid
} from '@ionic/react';
import '../theme/styles.css'
import { useAuth } from "../auth/auth";
import React, {useState} from "react";
import {Redirect} from "react-router-dom";
import {arrowBack} from "ionicons/icons";
import { fire } from "../util/firebase";

const Login: React.FC = () => {
    const { loggedIn } = useAuth(); // Import Use Auth to check Authentication State
    const [email, setEmail ] = useState<string>(""); // Email Value
    const [password, setPassword] = useState<string>(""); // Password Value
    const [error, setError] = useState<string>(""); // Error Message
    const [showError, setShowError] = useState(false); // Error Display

    if (loggedIn) {
        return <Redirect to={"/my/dashboard"} />; // Checks authentication and redirect if not logged in
    }

    const loginUser = async() => {
        setShowError(false);
        if(checkDetails()) {
            if(checkEmail()) {
                fire.auth().signInWithEmailAndPassword(email, password) // Firebase Checks Email & Password Match
                    .then((data: any) => { // Then gets the data
                        return data.user.getIdToken() // Return From Then With Token
                    }).then((token: string) => { // Then Extract Token String
                    return localStorage.setItem('Token', `Bearer ${token}`); // Set Token To Browser Storage
                }).catch(error => { // If An Error
                    setError(error); // Set Error
                    return setShowError(true); // Displays Error
                });
            } else {
                setError("Email is not correctly formatted.  Please format the email like email@email.com");
                setShowError(true)
            }
        }
    };

    const checkDetails = () => {
        if (email === "") { // Checks Login Form Field Are Blank
            setError("Email Should Not Be Blank") // Sets Error
            setShowError(true); // Displays Error
            return false;
        } else if (password === "") {
            setError("Password Should Not Be Blank")
            setShowError(true);
            return false;
        } else {
            return true;
        }
    }

    const checkEmail = () => { // Checks Email Is Formatted Correctly
        const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regex.test(email.toLowerCase());
    }

    return (
        <IonPage>
            <IonHeader className="ion-text-center ion-no-border">
                <img className="logo-header" src='https://storage.googleapis.com/hummid-pub-imgs/logo.png' alt={"Hummid Logo"}/>
            </IonHeader>
            <IonContent fullscreen>
                <div className={"align-center"}>
                <IonGrid>
                        <IonRow>
                            <IonCol>
                                <IonList className="">
                                    <IonItem>
                                        <IonLabel position={"stacked"}>Email</IonLabel>
                                        <IonInput type={"email"} value={email} onIonChange={(event) => setEmail(event.detail.value ?? '')}/>
                                    </IonItem>
                                    <IonItem>
                                        <IonLabel position={"stacked"}>Password</IonLabel>
                                        <IonInput type={"password"} value={password} onIonChange={(event) => setPassword(event.detail.value ?? '')}/>
                                    </IonItem>
                                </IonList>
                            </IonCol>
                        </IonRow>
                        <IonRow>
                            <IonCol>
                                <IonButton onClick={loginUser} expand="block" color="primary">Login</IonButton>
                                <IonButton routerLink="/home" expand="block" color="danger"><IonIcon icon={arrowBack}/>Back</IonButton>
                            </IonCol>
                        </IonRow>
                </IonGrid>
                </div>
                <IonToast
                    color={"danger"}
                    isOpen={showError}
                    onDidDismiss={() => setShowError(false)}
                    message={error}
                    duration={1000}
                />
            </IonContent>
        </IonPage>
    );
};

export default Login;
