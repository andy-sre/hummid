[Return To Weekly Overview](https://iamandyie.github.io/hummid/)

# Week 10 (19/04/21 - 25/04/21)

This week I focused on my UI/UX I went through the pages and placed them within the Ionic grid system where needed, I 
created my own CSS rules to adjust how it looks on the mobile version and the desktop version.

```CSS
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP&display=swap');

.header {
    margin-top: 10%;
    font-family: 'Noto Sans JP', sans-serif;
    color: rgba(96, 165, 250, 1);
    font-weight: 700;
    font-size: 40px;
}

.header-other {
    font-family: 'Noto Sans JP', sans-serif;
    color: rgba(96, 165, 250, 1);
    font-weight: 700;
    font-size: 30px;
}

.logo {
    max-width: 500px;
}
.logo-header {
    max-width: 170px;
}
.temps {
    font-size: 25px;
}
.power-on {
    color: #00a03d;
    font-size: 40px;
    font-weight: bold;
}

.power-off {
    color: #ca001a;
    font-size: 40px;
    font-weight: bold;
}

ion-select-settings {
    width: 100%;
    justify-content: center;
}

.align-center {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}

@media only screen and (max-width: 600px) {
    .header {
        margin-top: 50%;
    }
    .login-form {
        margin-top: 50%;
    }
    .logo {
        max-width: 300px;
    }
    .logo-header {
        max-width: 170px;
    }
    .icon {
        max-width: 180px;
        margin: auto;
    }
    .weather-icon {
        max-width: 60%;
        margin-top: -20%;
    }
    .weather-info {
        font-size: 80%;
    }

    .heating-icon {
        max-width: 50px;
    }
}

@media only screen and (min-width: 1000px) {
    .test {
        max-width: 30%;
        margin: auto;
    }
    .icon {
        max-width: 180px;
        margin: auto;
    }
    .weather-icon {
        margin-left: 35%;
        max-width: 30%;
    }
    .weather-info {
        font-size: 100%;
    }
    .weather-text {
        padding-top: 40px;
    }
    .align-center {
        margin: auto;
        max-width: 40%;
    }
    .desktop-version {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: auto;
        max-width: 50%;
    }
}
```

I also added the final checks to the Arduino board so when the users settings comes in I parse the data using ArduinoJSON
and run an if else statement to check the message type and the settings.  I only included the code that was adjusted below
and not the whole file.

```
void onMessageReceived(int messageSize) {
  if (messageSize) {
    StaticJsonDocument < 256 > doc;
    deserializeJson(doc, mqttClient);
    messageType = doc["messageType"];
    String messageString(messageType);
    if (messageString == "heatingManual") {
      const char* setting = doc["setting"];
      String settingString = String(setting);
      if (settingString == "true") {
        manualHeating(true);
      } else {
        manualHeating(false);
      }
    } else if (messageString == "heatingAuto") {
      bool setting = doc["setting"];
      autoHeating(test);
    } else if (messageString == "maxTemp") {
      int setting = doc["setting"];
      maxTemp = setting;
    } else if (messageString == "minTemp") {
      int setting = doc["setting"];
      minTemp = setting;
    } else {
      Serial.println("NA");
    }
    carrier.display.println("On");
  }
}

void manualHeating(bool setting) {
  Serial.print(setting);
  if (setting == 1) {
    Serial.println("Manual Heating On");
    carrier.leds.fill(greenColor, 0, 5);
    carrier.leds.show();
    heating = true;
  }else {
    Serial.println("Manual Heating Off");
    carrier.leds.fill(redColor, 0, 5);
    carrier.leds.show();
    heating = false;
  }
}

void autoHeating(bool setting) {
  manualHeating(false);
  if (setting == true) {
    Serial.println("Auto Heating On");
    if (temperature > maxTemp) {
      carrier.leds.fill(redColor, 0, 5);
      carrier.leds.show();
    } else if (temperature < minTemp) {
      carrier.leds.fill(greenColor, 0, 5);
      carrier.leds.show();
    }
    heating = true;
  } else {
    Serial.println("Auto Heating Off");
    carrier.leds.fill(redColor, 0, 5);
    carrier.leds.show();
    heating = false;
  }
}
```
