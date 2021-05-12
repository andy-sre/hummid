## Welcome To hummid

This is my final year project for DT080B/TU819.  The below is a documentation/log of all changes I have done from the 
beginning to the final stages.

The project is the FERN stack (Firebase, ExpressJS, React, Node) & Ionic to create a IoT Smart Thermostat system named 
**hummid**.

## Hardware

I use an Arduino MKR1010 in an Opla chassis with a DHT22 sensor to collect temperature information and send it to AWS IoT 
where I have 2 two-way sub/pub topics.

One of the topics is temps and this contains the temperatures that sends to the front end and to the database.  
The second topic is settings this will contain the settings sent from the front end to the backend such as temperatures 
or times the heating can be turned on.

## Backend

For the backend I have created an API that will allow the front-end to communicate with the AWS IoT portal but also will 
make sure only the correct users are allowed to access these routes by using Tokens set by firebase and stored in the 
browser and then checked in the backend via a middleware before the temperatures are set, and the settings are deployed 
to the device

The backend is also ran in the cloud on Google Firebase Functions which is a serveless platform.  This means all I have 
to focus on is the code and not the server itself as that's all preconfigured by Google.

## Frontend

For the frontend I will be using Ionic and Firebase.  Firebase is used in the front-end as the Firebase package contains 
the HTTP requests to the Firebase API for us.  If we were to use Firebase in the backend it would be cumbersome as it 
would be making two HTTP requests for the same thing.

I will also be using Ionic to create the app as I can create an app on all 3 platforms (Web, iOS & Android) then compile
it using capacitor.  Ionic contains a library of elements that will enable the app to look like a native app but is a
webview within the app.

## Architecture
![Image](https://storage.googleapis.com/hummid-pub-imgs/Picture1.png)

## Changes

[Week 1 (15/02/21 - 21/02/21)](https://iamandyie.github.io/hummid/week1)

[Week 2 (22/02/21 - 28/02/21)](https://iamandyie.github.io/hummid/week2)

[Week 3 (01/03/21 - 07/03/21)](https://iamandyie.github.io/hummid/week3)

[Week 4 (08/03/21 - 14/03/21)](https://iamandyie.github.io/hummid/week4)

[Week 5 (15/03/21 - 21/03/21)](https://iamandyie.github.io/hummid/week5)

[Week 6 (22/03/21 - 28/03/21)](https://iamandyie.github.io/hummid/week6)

[Week 7 (29/03/21 - 04/04/21)](https://iamandyie.github.io/hummid/week7)

[Week 8 (05/04/21 - 11/04/21)](https://iamandyie.github.io/hummid/week8)

[Week 9 (12/04/21 - 18/04/21)](https://iamandyie.github.io/hummid/week9)

[Week 10 (19/04/21 - 25/04/21)](https://iamandyie.github.io/hummid/week10)

[Week 11 (26/04/2021 - 02/05/2021)](https://iamandyie.github.io/hummid/week11)

[Week 12 (03/05/2021 - 09/05/2021)](https://iamandyie.github.io/hummid/week12)
