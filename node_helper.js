/* Magic Mirror
 * Module: MMM-DHT-Sensor
 *
 * By Ricardo Gonzalez http://www.github.com/ryck/MMM-DHT-Sensor
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
let sensor;

try {
	sensor = require("node-dht-sensor");
} catch (error) {
	console.error("MMM-DHT-Sensor: Failed to load node-dht-sensor", error);
}

module.exports = NodeHelper.create({
	start: function () {
		this.sensorAvailable = Boolean(sensor);
		console.log("MMM-DHT-Sensor helper started ...");
		if (!this.sensorAvailable) {
			console.warn(
				"MMM-DHT-Sensor: node-dht-sensor module unavailable; sending null readings.",
			);
		}
	},
	/**
	 * readSensor()
	 * Requests sensor data.
	 */
	readSensor: function (sensorPin, sensorType) {
		if (!this.sensorAvailable) {
			this.sendSensorData(null, null);
			return;
		}

		if (typeof sensorPin !== "number" || typeof sensorType !== "number") {
			console.warn("MMM-DHT-Sensor: Invalid sensor configuration", {
				sensorPin,
				sensorType,
			});
			this.sendSensorData(null, null);
			return;
		}

		sensor.read(sensorType, sensorPin, (err, temperature, humidity) => {
			if (err) {
				console.error("MMM-DHT-Sensor: Sensor read failed", err);
				this.sendSensorData(null, null);
				return;
			}

			this.sendSensorData(temperature, humidity);
		});
	},

	sendSensorData: function (temperature, humidity) {
		const format = (value) =>
			typeof value === "number" && Number.isFinite(value)
				? value.toFixed(2)
				: null;

		this.sendSocketNotification("SENSOR_DATA", {
			temperature: format(temperature),
			humidity: format(humidity),
		});
	},

	//Subclass socketNotificationReceived received.
	socketNotificationReceived: function (notification, payload) {
		if (notification === "GET_SENSOR_DATA") {
			this.readSensor(payload.sensorPin, payload.sensorType);
		}
	},
});
