const functions = require('firebase-functions'); // Firebase Functions Provides Serverless Hosting
const app = require('express')(); // Enables API routes
const cors = require('cors'); // Cross Origin Resource Sharing
const bodyParser = require('body-parser'); // Body Parser to get data from requests
const authentication = require('./middleware/auth'); // Middleware for authorization

app.use(cors({ origin: true })); // Enable cors on API
app.use(bodyParser.json()); // Enable body-parser on API

const {
    weather // Weather Function to get weather from OpenWeatherMap
} = require('./API/weather');

const {
    temperature, // Temperature Function to get temperatures from AWS
    settings, // Settings Function to send settings to AWS
} = require('./API/device')

app.post('/weather', authentication, weather); // Weather API Route
app.post('/temps', authentication, temperature); // Temps API Route
app.post('/settings', authentication, settings); // Settings API Route
exports.api = functions.region("europe-west1").https.onRequest(app); // Exports API to firebase functions.