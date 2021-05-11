const mqtt = require('mqtt');
const keys = require('../keys/keys')

const options = { // Keys to be able to connect to AWS
    key: keys.PrivateKey,
    cert: keys.Cert,
    ca: keys.Root,
    clientId: 'hummidApp',
};

const client  = mqtt.connect('mqtt://a3lfz3n96qnmr7-ats.iot.eu-west-1.amazonaws.com', options); // Connect to AWS

let temps;
let obj = {}

client.on('connect', () => {
    client.subscribe('hummid/temperatures'); // Subscribe to topic
});

client.on('message', (topic, message) => {
    temps = message.toString(); // Convert message recieved to string
    obj = JSON.parse(temps); // Parse Data to JSON into the object
});

exports.temperature = (req, res) => { // Temps Function
    res.status(200).json({ // Return response with 200 OK and with the below data
        temps: obj.temps,
        heating: obj.heating
    })
};

exports.settings =  (req, res) => { // Settings Function
    let messageType = req.body.messageType // Gets messageType from the body of the request
    let settings = req.body.setting // Gets settings from the body of the request
    client.publish('hummid/settings', JSON.stringify({messageType: messageType, setting: settings})); // Send data to topic
    res.status(201).json({ message: "Setting Sent To Device Successfully"}); // Return Response to let user know settings were sent
};