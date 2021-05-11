[Return To Weekly Overview](https://iamandyie.github.io/hummid/)

# Week 3 (01/03/21 - 07/03/21)

This week I focused on getting my Arduino board connected to the AWS IoT cloud.  I found this fantastic guide on the
Arduino Project Hub website here:

>[Securely Connecting an Arduino MKR WiFi 1010 to AWS IoT Core](https://create.arduino.cc/projecthub/Arduino_Genuino/securely-connecting-an-arduino-mkr-wifi-1010-to-aws-iot-core-a9f365)

This laid out the steps needed to be able to connect your board to AWS IoT.  Because the connection between AWS IoT
and my Arduino board has to be secured by TLS and I have to use X.509 certificates for the authentication.  To do this
I needed to encrypt the board via the [ATECC608A](https://www.microchip.com/wwwproducts/en/ATECC608A) crypto element
chip which provides us with a CSR I can upload to Amazon.  When doing this users need to be aware this is a permananet
change to the board and cannot be reversed as when the MKR1010 is shipped the chip is not locked and configured.

Once I did this I was able to upload the CSR key to Amazon which provided me with a certificate which I put in the
secrets.h file along with the SSID and Password.

The one thing the tutorial did not show is setting up the policy on AWS IoT.  This is basically like a firewall where
you have to name the devices allowed to connect and what topics they can subscribe and publish to.  I have included
mine below for reference

```markdown
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "iot:Connect",
      "Resource": "arn:aws:iot:eu-west-1:568122077415:client/hummid"
    },
    {
      "Effect": "Allow",
      "Action": "iot:Connect",
      "Resource": "arn:aws:iot:eu-west-1:568122077415:client/hummidApp"
    },
    {
      "Effect": "Allow",
      "Action": "iot:Publish",
      "Resource": "arn:aws:iot:eu-west-1:568122077415:topic/hummid/temperatures"
    },
    {
      "Effect": "Allow",
      "Action": "iot:Receive",
      "Resource": "arn:aws:iot:eu-west-1:568122077415:topic/hummid/temperatures"
    },
    {
      "Effect": "Allow",
      "Action": "iot:Subscribe",
      "Resource": "arn:aws:iot:eu-west-1:568122077415:topicfilter/hummid/temperatures"
    },
    {
      "Effect": "Allow",
      "Action": "iot:Publish",
      "Resource": "arn:aws:iot:eu-west-1:568122077415:topic/hummid/settings"
    },
    {
      "Effect": "Allow",
      "Action": "iot:Receive",
      "Resource": "arn:aws:iot:eu-west-1:568122077415:topic/hummid/settings"
    },
    {
      "Effect": "Allow",
      "Action": "iot:Subscribe",
      "Resource": "arn:aws:iot:eu-west-1:568122077415:topicfilter/hummid/settings"
    }
  ]
}
```

You can see I allow two devices to connect which will be the backend and my Arduino board which they can subscribe and 
publish to `/hummid/temperatures` & `/hummid/settings`.  I tested it via Amazons IoT test area:

![Image](https://storage.googleapis.com/hummid-pub-imgs/AWSPortal.png)

I also set up ArduinoJSON so that the Arduino board could differentiate the settings that are sent from the frontend
as I will send them like this: `{ messageType: "heating", setting: "on" }` so I have set it up that I can break up the
JSON message and put the messageType and setting in a variable then run an if/else block to check the setting and run
the setting function.

Once I worked the above out the resulting code was this:

```
#include <ArduinoJson.h>

#include <WiFiNINA.h>
#include <SPI.h>
#include <ArduinoBearSSL.h>
#include <ArduinoECCX08.h>
#include <ArduinoMqttClient.h>

#include <Arduino_MKRIoTCarrier.h>

#include "DHT.h"

#include "secrets.h"

#define DHTPIN 20
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);
MKRIoTCarrier carrier;

const char ssid[]        = SECRET_SSID;
const char pass[]        = SECRET_PASS;
const char broker[]      = AWS_ENDPOINT;
const char* certificate  = SECRET_CERT;
const char thingy[]      = AWS_THINGY;
const char pub[]         = AWS_IOT_PUBLISH_TOPIC;
const char sub[]         = AWS_IOT_SUBSCRIBE_TOPIC;
const char* messageType  = "";
const char* setting  = "";


WiFiClient wClient;
BearSSLClient sslClient(wClient);
MqttClient mqttClient(sslClient);

unsigned long lastMillis = 0;

int displayScreen = 0;
 
uint32_t greenColor = carrier.leds.Color( 255, 0, 0);
uint32_t redColor = carrier.leds.Color( 0, 255, 0);
uint32_t blueColor = carrier.leds.Color( 0, 0, 255);
uint32_t noColor = carrier.leds.Color( 0, 0, 0);

int status = WL_IDLE_STATUS;
int temperature;
void setup() {
  Serial.begin(9600);
  dht.begin();
  ArduinoBearSSL.onGetTime(getTime);
  mqttClient.setId(thingy);
  mqttClient.onMessage(onMessageReceived);
  sslClient.setEccSlot(0, certificate);
  connectWIFI();
  while (!Serial);
  delay(500);
  CARRIER_CASE = false;
  carrier.begin();
  carrier.display.setRotation(0);
  delay(1500);
}

void loop() {
    if (!mqttClient.connected()) {
    connectMQTT();
  }
  mqttClient.poll();
  if (millis() - lastMillis > 30000) {
    lastMillis = millis();
    publishMessage();
  }
  temperature = dht.readTemperature();
   if (isnan(temperature)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }
  Serial.print("|  Temperature: ");
  Serial.print(temperature);
  Serial.print("°C \n");
  
  if (temperature < 20) {
    carrier.leds.fill(blueColor, 0, 5);
    carrier.leds.show();
    displayScreen = 0;
  } else if (temperature >= 20 && temperature <= 28) {
    carrier.leds.fill(greenColor, 0, 5);
    carrier.leds.show();
    displayScreen = 1;
  } else if (temperature > 28) {
    carrier.leds.fill(redColor, 0, 5);
    carrier.leds.show();
    displayScreen = 2;
  }
  updateScreen();
  delay(3000);
}

void updateScreen() {
  if (displayScreen == 0) {
    carrier.display.fillScreen(ST77XX_BLUE);
  }
  else if (displayScreen == 1) {
    carrier.display.fillScreen(ST77XX_GREEN);
  }
  else if (displayScreen == 2) {
    carrier.display.fillScreen(ST77XX_RED);
  }
  carrier.display.setTextColor(ST77XX_WHITE);
  carrier.display.setTextSize(8);
  carrier.display.setCursor(80, 90);
  carrier.display.print(temperature);
 }

 void connectWIFI() {
  while (status != WL_CONNECTED) {
    Serial.print("Attempting to connect to network: ");
    Serial.println(SECRET_SSID);
    status = WiFi.begin(SECRET_SSID, SECRET_PASS);
    delay(10000);
  }
  Serial.println("You're connected to the network");
  Serial.println("----------------------------------------");
  printData();
  Serial.println("----------------------------------------");
}

 void printData() {
  Serial.println("Board Information:");
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);
  Serial.println();
  Serial.println("Network Information:");
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());
  long rssi = WiFi.RSSI();
  Serial.print("signal strength (RSSI):");
  Serial.println(rssi);
}

unsigned long getTime() {
  return WiFi.getTime();
}

void connectMQTT() {
  Serial.print("Attempting to MQTT broker: ");
  Serial.print(broker);
  Serial.println(" ");
  
  while (!mqttClient.connect(broker, 8883)) {
    Serial.print(".");
    delay(5000);
  }
  Serial.println();
  Serial.println("You're connected to the MQTT broker");
  Serial.println();
  mqttClient.subscribe(sub);
}

void publishMessage() {
  Serial.println("Publishing message");
  mqttClient.beginMessage(pub);
  mqttClient.print(temperature);
  mqttClient.endMessage();
}

void onMessageReceived(int messageSize) {
  Serial.print("Received a message with topic '");
  Serial.print(mqttClient.messageTopic());
  Serial.println("");
  if (messageSize) {
    StaticJsonDocument<256> doc;
    deserializeJson(doc, mqttClient);
    messageType = doc["messageType"];  
    setting = doc["setting"];      
    Serial.print(messageType);
    Serial.println("");
    Serial.print(setting);
    Serial.println("");
    carrier.display.print("On");
  }
}
```
