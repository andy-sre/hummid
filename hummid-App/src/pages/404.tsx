import {
    IonContent,
    IonPage,
    IonGrid,
    IonRow,
    IonCol
} from '@ionic/react';
import React from "react";

const NotFound: React.FC = () => {
    return (
        <IonPage>
            <IonContent fullscreen>
                <div className="ion-text-center header">
                    <img className="logo" src='https://storage.googleapis.com/hummid-pub-imgs/Ab_hummid1-01.png' alt={"Logo"}/>
                    <IonGrid>
                        <IonRow>
                            <IonCol className="test">
                                404 Error
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default NotFound;
