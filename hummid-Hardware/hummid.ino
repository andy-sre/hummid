#include <ArduinoJson.h> // Arduino JSON for JSON objects
#include <WiFiNINA.h> // Enables WiFi
#include <SPI.h> // Used for WiFI
#include <ArduinoBearSSL.h> // Enables SSL
#include <ArduinoECCX08.h> // Encryption for Arduino Board
#include <ArduinoMqttClient.h> // MQTT Client
#include <Arduino_MKRIoTCarrier.h> // For Opla Carrier
#include "DHT.h" // DHT Sensor
#include "secrets.h" // Passwords and certs

#define DHTPIN 20 // Enable DHT22 Sensor
#define DHTTYPE DHT22 // Define it as DHT22

DHT dht(DHTPIN, DHTTYPE); // Enable DHT library to PIN and TYPE
MKRIoTCarrier carrier; // Opla Carrier Library

const char ssid[] = SECRET_SSID; // WiFi Name
const char pass[] = SECRET_PASS; // WiFi Password
const char broker[] = AWS_ENDPOINT; // AWS URL For AWS IOT
const char * certificate = SECRET_CERT; // AWS Cert For Authentication
const char thingy[] = AWS_THINGY; // AWS NAME
const char pub[] = AWS_IOT_PUBLISH_TOPIC; // PUBLISH TOPIC
const char sub[] = AWS_IOT_SUBSCRIBE_TOPIC; // SUBSCRIBE TOPIC
const char * messageType = "";
//const char * setting = "";
int minTemp = 0;
int maxTemp = 0;
bool heating = false;
bool test;

WiFiClient wClient; // WiFi Client
BearSSLClient sslClient(wClient); // Enable SSL on WiFi
MqttClient mqttClient(sslClient); // Enable MQTT

unsigned long lastMillis = 0;

int displayScreen = 0;

uint32_t greenColor = carrier.leds.Color(255, 0, 0); // Green LED
uint32_t redColor = carrier.leds.Color(0, 255, 0); // RED LED

int status = WL_IDLE_STATUS; 
int temperature;

void setup() { // Setup
  Serial.begin(9600);
  dht.begin(); // DHT Begin
  ArduinoBearSSL.onGetTime(getTime); // Gets Time for SSL
  mqttClient.setId(thingy); // SET MQTT ID
  mqttClient.onMessage(onMessageReceived); // When message recieved run this function
  sslClient.setEccSlot(0, certificate); // Set Ecc slot with certificate
  connectWIFI(); // Connect to WiFi
  while (!Serial);
  delay(500);
  CARRIER_CASE = false; // If carrier shell is on device set to true
  carrier.begin(); // Begin Opla Carrier Functionality
  carrier.display.setRotation(0); // Only used if upside or sideways
  delay(1500);
}

void loop() {
  if (!mqttClient.connected()) { 
    connectMQTT(); // Connect to AWS if not already
  }
  mqttClient.poll(); // Start Polling
  if (millis() - lastMillis > 30000) { // Every 30 seconds
    lastMillis = millis();
    publishMessage(); // Send temps
  }
  temperature = dht.readTemperature(); // Read temps from DHT22
  if (isnan(temperature)) {
    Serial.println("Failed to read from DHT sensor!"); // Only ran if can't get temp
    return;
  }

  if (temperature < 20) { // Depending on temps it changes background color on screen
    displayScreen = 0; //Blue
  } else if (temperature >= 20 && temperature <= 28) {
    displayScreen = 1; //Green
  } else if (temperature > 28) {
    displayScreen = 2; //Red
  }
  updateScreen(); // Updates screen with new temps
  delay(3000);
}

void updateScreen() {
  if (displayScreen == 0) { 
    carrier.display.fillScreen(ST77XX_BLUE); // Blue Color Background
  } else if (displayScreen == 1) {
    carrier.display.fillScreen(ST77XX_GREEN); // Green Color Background
  } else if (displayScreen == 2) {
    carrier.display.fillScreen(ST77XX_RED); // Red Color Background
  }
  carrier.display.setTextColor(ST77XX_WHITE); // Text White
  carrier.display.setTextSize(8); // Font Size
  carrier.display.setCursor(80, 90); // Set positioning of font
  carrier.display.println(temperature); // Set text to temperature
}

void connectWIFI() { // WiFi Connection
  while (status != WL_CONNECTED) { // While wifi is not connected
    Serial.println("Attempting to connect to network: ");
    Serial.println(SECRET_SSID);
    status = WiFi.begin(SECRET_SSID, SECRET_PASS); // Begin to connect
    delay(10000);
  }
  Serial.println("You're connected to the network");
  Serial.println("----------------------------------------");
  printlnData(); // Print Wifi Info
  Serial.println("----------------------------------------");
}

void printlnData() { // Prints Wifi Info
  Serial.println("Board Information:");
  IPAddress ip = WiFi.localIP();
  Serial.println("IP Address: ");
  Serial.println(ip);
  Serial.println();
  Serial.println("Network Information:");
  Serial.println("SSID: ");
  Serial.println(WiFi.SSID());
  long rssi = WiFi.RSSI();
  Serial.println("signal strength (RSSI):");
  Serial.println(rssi);
}

unsigned long getTime() {
  return WiFi.getTime(); // Used for BearSSL
}

void connectMQTT() { // Connects to MQTT
  Serial.println("Attempting to MQTT broker: ");
  Serial.println(broker);
  Serial.println(" ");

  while (!mqttClient.connect(broker, 8883)) { // Connects to AWS
    Serial.println(".");
    delay(5000);
  }
  Serial.println();
  Serial.println("You're connected to the AWS");
  Serial.println();
  mqttClient.subscribe(sub); // Subscribes to topic
}

void publishMessage() { // Publishes Temperature Info
  Serial.println("Publishing message");
  mqttClient.beginMessage(pub); // Begins message
  StaticJsonDocument < 200 > doc; // Creates JSON object
  doc["temps"] = temperature; // Sets JSON Object
  doc["heating"] = heating; // Sets JSON Object
  serializeJson(doc, mqttClient); // Sends JSOB object
  mqttClient.endMessage(); // Ends send message
}

void onMessageReceived(int messageSize) {
  if (messageSize) { // If we recieved a message
    StaticJsonDocument < 256 > doc; // Begin JSON object
    deserializeJson(doc, mqttClient); // Deserialize JSON from AWS
    messageType = doc["messageType"]; // Set the messageType to messageType from JSON object
    String messageString(messageType); // Set messageType to String
    if (messageString == "heatingManual") { // Checks the message type to see what setting needs to be changes
      const char* setting = doc["setting"]; // Sets the setting depending on the message
      String settingString = String(setting);
      if (settingString == "true") {
        manualHeating(true); // Runs function for manual heating
      } else {
        manualHeating(false);
      }
    } else if (messageString == "heatingAuto") {
      bool setting = doc["setting"];
      autoHeating(test); // Runs function for auto heating
    } else if (messageString == "maxTemp") {
      int setting = doc["setting"];
      maxTemp = setting; // Sets max temp
    } else if (messageString == "minTemp") {
      int setting = doc["setting"];
      minTemp = setting; // Sets min temp
    } else {
      Serial.println("NA");
    }
    carrier.display.println("On");
  }
}

void manualHeating(bool setting) { // Manual Heating on
  Serial.print(setting);
  if (setting == 1) {
    Serial.println("Manual Heating On");
    carrier.leds.fill(greenColor, 0, 5); // Set LED to green to indicate on
    carrier.leds.show();
    heating = true; // Heating on (reflects on front-end)
  }else {
    Serial.println("Manual Heating Off");
    carrier.leds.fill(redColor, 0, 5); // Set LED to red to indicate off
    carrier.leds.show();
    heating = false; // Heating off
  }
}

void autoHeating(bool setting) { // Auto heating function
  if (setting == true) { 
    Serial.println("Auto Heating On");
    if (temperature > maxTemp) { // Runs auto mode based on users desired min max
      carrier.leds.fill(redColor, 0, 5);
      carrier.leds.show();
    } else if (temperature < minTemp) {
      carrier.leds.fill(greenColor, 0, 5);
      carrier.leds.show();
    }
    heating = true; // Indicate heating is on for front end but heating may not be on depending on temps
  } else {
    Serial.println("Auto Heating Off");
    carrier.leds.fill(redColor, 0, 5);
    carrier.leds.show();
    heating = false;
  }
}
