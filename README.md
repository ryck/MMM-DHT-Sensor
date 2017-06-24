# MMM-Temperature-Humidity
Temperature and Humidity monitoring Module for MagicMirror<sup>2</sup>
This module works for DHT11, DHT22 and AM2302 sensors.

## Dependencies
  * An installation of [MagicMirror<sup>2</sup>](https://github.com/MichMich/MagicMirror)
  * npm
  * [rpi-dht-sensor](https://www.npmjs.com/package/rpi-dht-sensor)

## Installation
 1. Clone this repo into `~/MagicMirror/modules` directory.
 2. Configure your `~/MagicMirror/config/config.js`:

    ```
    {
        module: 'MMM-Temperature-Humidity',
        position: 'top_right',
        config: {
            ...
        }
    }
    ```
 3. Run command `npm install` in `~/MagicMirror/modules/MMM-STT` directory.
 4. Run command `sudo apt-get install rpi-dht-sensor`.
 5. sudo npm start in `~/MagicMirror`.

## Config Options
| **Option** | **Default** | **Description** |
| --- | --- | --- |
| `refreshInterval` | `50000` | Time in milli seconds before successive readings are taken. |
| `temperaturePrefix` | `'Room temperature: '` | Text to display as prefix of Temperature Reading |
| `temperatureSuffix` | `'°C'` | Text to display as suffix of Temperature Reading |
| `humidityPrefix` | `'Humidity: '` | Text to display as prefix of Humidity Reading |
| `humiditySuffix` | `'%'` | Text to display as suffix of Humidity Reading |

## For Developers
Principle is to poll the sensor every set time period for a reading and display the same to the mirror
Note :  This module uses the BCM2835 library that requires access to /open/mem. Because of this, you will typically run node with admin privileges.
Also, these values are hard coded in node_helper.js
sensorType and Pin Number-
var dht = new rpiDhtSensor.DHT11(2);

USAGE :
var dht = new rpiDhtSensor.DHT22(pinNumber);//For DHT22 Type sensor
var dht = new rpiDhtSensor.DHT11(pinNumber);
