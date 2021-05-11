[Return To Weekly Overview](https://iamandyie.github.io/hummid/)

# Week 2 (22/02/21 - 28/02/21)

This week I focused on getting my MKR1010 connected onto my WiFi at home.  I firstly created a secrets.h page which 
contains my SSID & Password for my home network.  I used the WiFiNINA package 
[WiFiNINA](https://www.arduino.cc/en/Reference/WiFiNINA) to connect to the WiFi.  When I included the library I used
one of the guides on the website here:

>[Connect With WPA](https://www.arduino.cc/en/Tutorial/LibraryExamples/WiFiNINAConnectWithWPA)

to connect the device to my home WiFi.  There was a few issued I faced such as my home WiFi network havin spaces in the
name which caused issue.  So I had to modify my home WiFi to include no spaces.

Once I worked the above out the resulting code was this:

```markdown
#include <Arduino_MKRIoTCarrier.h>
#include <WiFiNINA.h>
#include <SPI.h>

#include "DHT.h"

#define DHTPIN 20
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);
MKRIoTCarrier carrier;

const char ssid[]        = SECRET_SSID;
const char pass[]        = SECRET_PASS;

WiFiClient wClient;


int displayScreen = 0;
 
uint32_t greenColor = carrier.leds.Color( 255, 0, 0);
uint32_t redColor = carrier.leds.Color( 0, 255, 0);
uint32_t blueColor = carrier.leds.Color( 0, 0, 255);
uint32_t noColor = carrier.leds.Color( 0, 0, 0);

int temperature;
void setup() {
  Serial.begin(9600);
  dht.begin();
  connectWIFI();
  while (!Serial);
  delay(500);
  CARRIER_CASE = false;
  carrier.begin();
  carrier.display.setRotation(0);
  delay(1500);
}

void loop() {
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
```
