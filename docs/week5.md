[Return To Weekly Overview](https://iamandyie.github.io/hummid/)

# Week 5 (15/03/21 - 21/03/21)

This week I focused on getting the backend started of the app.  I set out the goal to be able to send and recieve data
from my backend to the hardware (Arduino MKR1010).  I also wanted to host the backend on Firebase Functions to do this
I read the official Firebase documentation for Firebase Functions below:

>[Get started: write, test, and deploy your first functions](https://firebase.google.com/docs/functions/get-started)

Once I had initialized Functions it automatically created a directory with NodeJS enabled for me to begin development.
I started by installing the packages I needed.  The first one I used is called express. 
[express](https://www.npmjs.com/package/express) this allowed me to create the API routes for the app.  
I also needed [cors](https://www.npmjs.com/package/cors) to enable cors on the app & 
[body-parser](https://www.npmjs.com/package/body-parser) for me to be able to read data coming from the client.  I also
used [mqtt](https://www.npmjs.com/package/mqtt) to be able to communicate to the AWS server.

```javascript
const functions = require('firebase-functions');
const app = require('express')();
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(cors({ origin: true }));
app.use(bodyParser.json());

app.post('/weather');
app.post('/temps');
app.post('/settings');
exports.api = functions.region("europe-west1").https.onRequest(app);
```

Above is the start of the API.  All the above code did was enable the routes, enable cors and body-parser and enabled
the all the express API routes as a single cloud function.

The next thing I did was begin adding in the MQTT routes which are '/temps' & '/settings'

```javascript
const mqtt = require('mqtt');
const keys = require('../keys/keys')

const options = {
    key: keys.PrivateKey,
    cert: keys.Cert,
    ca: keys.Root,
    clientId: 'hummidApp',
};

const client  = mqtt.connect('mqtt://a3lfz3n96qnmr7-ats.iot.eu-west-1.amazonaws.com', options);

let temps;
let obj = {}

client.on('connect', () => {
    client.subscribe('hummid/temperatures');
});

client.on('message', (topic, message) => {
    temps = message.toString();
    obj = JSON.parse(temps);
});

exports.temperature = (req, res) => {
    res.status(200).json({
        temps: obj.temps,
        heating: obj.heating
    })
};

exports.settings =  (req, res) => {
    let messageType = req.body.messageType
    let settings = req.body.setting
    console.log(messageType + " " + settings);
    client.publish('hummid/settings', JSON.stringify({messageType: messageType, setting: settings}));
    res.status(201).json({ message: "Setting Sent To Device Successfully"});
};
```

The above code imports the mqtt module and all the AWS IoT Authentication keys.  We then connect to the AWS broker with
the keys and certificates added to the end of the connection.  Once we do this we subscribe to the 'hummid/temperatures'
route and listen to messages coming in.  From there set the variable temps to the message we recieved from AWS.  We then
parse it into JSON and hold it within an object.

We then export the temperature route with the response status of 200 and attach on create a json object containing 
the temps and heating status with the values taken from the object.

To be able to send settings to AWS I also had to create route I could publish to.  To do this I read in the messageType
and setting being sent to the API from the front-end and published it to the 'hummid/settings' topic and sent it in a 
JSON object and returned a 201 message to let the user know the message was sent.

```javascript
const axios = require('axios');
const API_URL       = 'https://api.openweathermap.org/data/2.5/weather';
const API_KEY       = '##############################';

exports.weather = (req, res) => {
    let country = req.body.country;
    let city = req.body.city;
    const url  = `${API_URL}?q=${city},${country}&appid=${API_KEY}`;
    return axios.get(url)
        .then(response => {
            return res.status(200).json(response.data);
        })
        .catch(error => {
            console.log(error);
        });
}
```

The last part to getting the routes up and running was setting up the Weather route.  This was not too hard to set up
I was given an API url from OpenWeatherMap and a API key to authenticate myself with.  From there I requested the city
and country from the request and created a URL with the data then made an axios request to that URL.  If I was able
to get data I returned a 200 message with the response data in a JSON object and if there was an issue I would print
it to the console.

```javascript
const functions = require('firebase-functions');
const app = require('express')();
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(cors({ origin: true }));
app.use(bodyParser.json());

const {
    weather
} = require('./API/weather');

const {
    temperature,
    settings,
} = require('./API/device')

app.post('/weather', weather);
app.post('/temps', temperature);
app.post('/settings', settings);
exports.api = functions.region("europe-west1").https.onRequest(app);
```

At the end my final product looked like this.  I was able to use a program called [Insomnia](https://insomnia.rest/)
this allowed me to test all my API routes by sending static data to the routes.  For example, below I show me using
insomnia to test the "/weather" route.  As you can see I posted the city and country to the route and it returned a JSON
object with the weather information for that country and city.

![image](https://storage.googleapis.com/hummid-pub-imgs/insomnia)
