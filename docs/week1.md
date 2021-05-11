[Return To Weekly Overview](https://iamandyie.github.io/hummid/)

# Week 1 (15/02/21 - 21/02/21)

This week I focused on getting the hardware & DHT22 sensor working.  The issue I faced was that DHT22 sensor is a digital
sensor and the MKR1010 board only has Analogue ports printed on the board but as was pointed out that the Analogue 
inputs on the MKR1010 board can also double up as a digital input.  When I found this out I had to figure out what
the equivalent digital port was where the analogue was labled.  I used the below diagram to achieve this.

![Image](https://storage.googleapis.com/hummid-pub-imgs/ArduinoLabels.png)

SRC: [MKR1010](https://content.arduino.cc/assets/Pinout-MKRwifi1010_latest.pdf)

Once I got the temperature printing on the console I had to then get it printing to the small screen that is on board 
the Opla carrier I used the guide on the Arduino Opla website here:
>[THERMOSTAT CONTROL](https://opla.arduino.cc/opla/module/iot-starter-kit-maker/lesson/07-thermostat-control)

and modified it for my own usage 
to display the temperatures for my project.

The above resulted in the below code:

```markdown
#include <Arduino_MKRIoTCarrier.h>

#include "DHT.h"

#define DHTPIN 20
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);
MKRIoTCarrier carrier;

int displayScreen = 0;
 
uint32_t greenColor = carrier.leds.Color( 60,179,113);
uint32_t redColor = carrier.leds.Color( 220,20,60);
uint32_t blueColor = carrier.leds.Color( 65,105,225);
uint32_t noColor = carrier.leds.Color( 0, 0, 0);

int temperature;
void setup() {
  Serial.begin(9600);
  dht.begin();
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
```
