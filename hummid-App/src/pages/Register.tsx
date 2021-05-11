import {
    IonContent,
    IonHeader,
    IonPage,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonSelectOption,
    IonSelect,
    IonIcon,
    IonToast,
    IonGrid,
    IonRow,
    IonCol
} from '@ionic/react';

import React, {useState} from "react";
import {Redirect} from "react-router-dom";
import {useAuth} from "../auth/auth";
import countries from "../util/countries"
import { fire, db } from "../util/firebase";
import {arrowBack} from "ionicons/icons";

const initialValues = {
    fname: "",
    lname: "",
    country: "",
    city: "",
    phone: "",
    email: "",
    password: "",
    cpassword: ""
};

const Register: React.FC = () => {
    const { loggedIn } = useAuth(); // Import Use Auth to check Authentication State
    const [values, setValues] = useState(initialValues); // Sets variable to object
    const [error, setError] = useState<string>(""); // Error Message
    const [showError, setShowError] = useState(false); // Error Display
    const [regions, setRegions] = useState<any>([]) // Array of Countries & Cities

    if(loggedIn) {
        return <Redirect to={"/my/dashboard"} /> // Checks authentication and redirect if not logged in
    }

    const handleInputChange = (e: any) => { // Handles Form Input
        const { name, value } = e.target; // Gets values from form
        setValues({ // Maps values to object so we can access it through values.fname for firstname
            ...values,
            [name]: value,
        });
        if (name === 'country') { // Enables Cities Once A Country Is Selected
            let selectedCounty = countries.find(country => country.countryShortCode === value);
            setRegions(selectedCounty?.regions);
        }
    };

    const registerUser = async () => {
        let token: string;
        let userId: string;
        if(checkDetails()) { // Checks Form For Blanks & If Passwords Match
            if(checkEmail()) { // Checks Email Formatting Correct
                db
                    .doc(`/users/${values.email}`)
                    .get() // Gets document from /users/ table with the entered users email
                    .then((doc) => {
                        if (doc.exists) { // If the doc exists
                            setError('User already exists') // Sets error
                            setShowError(true); // Displays error
                            return; // Return
                        } else { // If it doesn't exit
                            return fire
                                .auth() // Create an account with entered user email & Password
                                .createUserWithEmailAndPassword(
                                    values.email,
                                    values.password
                                );
                        }
                    })
                    .then((data: any) => { // Then use the returned email to
                        userId = data.user.uid; // Get unique user ID firebase gives us
                        return data.user.getIdToken(); // Return the user ID token for authorization
                    })
                    .then((idtoken: string) => {
                        token = idtoken; // Set returned token to variable
                        const userCredentials = { // Create userCredentials object from user details from form
                            fname: values.fname,
                            lname: values.lname,
                            phone: values.phone,
                            country: values.country,
                            city: values.city,
                            email: values.email,
                            createdAt: new Date().toISOString(),
                            userId
                        };
                        return db // Return by creating a document in the users collection
                            .doc(`/users/${values.email}`) // With the users email as the id
                            .set(userCredentials); // And details from the object above
                    }).then(() => {
                    const userSettings = { // create userSettings object with these default settings
                        userId,
                        auto: false,
                        manual: true,
                        minTemp: 10,
                        maxTemp: 20,
                    };
                    return db // Return by creating a document in /settings/ collection
                        .doc(`/settings/${values.email}`) // With the users email as the unique ID
                        .set(userSettings) // Add details from above object
                })
                    .then(() => {
                        return localStorage.setItem('Token', `Bearer ${token}`); // Set token to users browser storage
                    })
                    .catch(err => { // If theres an error display is below
                        console.log(error)
                        setError(err)
                        return setShowError(true);
                    });
            } else {
                setError("Email is not correctly formatted.  Please format the email like email@email.com");
                setShowError(true)
            }
        }
    }

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
                          <IonList>
                              <IonItem>
                                  <IonLabel position={"stacked"}>First Name</IonLabel>
                                  <IonInput type={"text"} name="fname" value={values.fname} placeholder="Enter Your First Name" onIonChange={handleInputChange}/>
                              </IonItem>
                              <IonItem>
                                  <IonLabel position={"stacked"}>Last Name</IonLabel>
                                  <IonInput type={"text"} name="lname" value={values.lname} placeholder="Enter Your Last Name" onIonChange={handleInputChange}/>
                              </IonItem>
                              <IonItem>
                                  <IonLabel position={"stacked"}>Country</IonLabel>
                                  <IonSelect interface="popover" value={values.country} name="country" placeholder="Select A Country" onIonChange={handleInputChange}>
                                      {countries.map((country) => (
                                          <IonSelectOption value={country.countryShortCode} key={country.countryShortCode}>{country.countryName}</IonSelectOption>
                                      ))};
                                  </IonSelect>
                              </IonItem>
                              <IonItem>
                                  <IonLabel position={"stacked"}>City</IonLabel>
                                  {values.country ? <IonSelect interface="popover" value={values.city} name="city" placeholder="Select A City" onIonChange={handleInputChange}>
                                      {regions.map((region: any) => (
                                          <IonSelectOption value={region.name} key={region.shortCode}>{region.name}</IonSelectOption>
                                      ))};
                                  </IonSelect> : <div><p>Please Select A Country First</p></div>}
                              </IonItem>
                              <IonItem>
                                  <IonLabel position={"stacked"}>Phone Number</IonLabel>
                                  <IonInput type={"tel"} name="phone" value={values.phone} placeholder="Enter Your Phone Number" onIonChange={handleInputChange}/>
                              </IonItem>
                              <IonItem>
                                  <IonLabel position={"stacked"}>Email</IonLabel>
                                  <IonInput type={"email"} name="email" value={values.email} placeholder="Enter Your Email" onIonChange={handleInputChange}/>
                              </IonItem>
                              <IonItem>
                                  <IonLabel position={"stacked"}>Password</IonLabel>
                                  <IonInput type={"password"} name="password" value={values.password} placeholder="Enter Your Password" onIonChange={handleInputChange}/>
                              </IonItem>
                              <IonItem>
                                  <IonLabel position={"stacked"}>Confirm Password</IonLabel>
                                  <IonInput type={"password"} name="cpassword" value={values.cpassword} placeholder="Please Confirm Your Password" onIonChange={handleInputChange}/>
                              </IonItem>
                          </IonList>
                      </IonCol>
                  </IonRow>
                  <IonRow>
                      <IonCol>
                          <IonButton onClick={registerUser} expand="block" color="primary">Submit</IonButton>
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
              duration={2000}
          />
      </IonContent>
    </IonPage>
  );
};

export default Register;
