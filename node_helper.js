"use strict";

/* Magic Mirror
 * Module: MMM-DHT-Sensor
 *
 * By Ricardo Gonzalez http://www.github.com/ryck/MMM-DHT-Sensor
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
const sensor = require("node-dht-sensor");

module.exports = NodeHelper.create({

	start: function() {
		console.log("MMM-DHT-Sensor helper started ...");
	},
	/**
	 * readSensor()
	 * Requests sensor data.
	 */
	readSensor: function(sensorPin, sensorType) {
		var self = this;
		sensor.read(sensorType, sensorPin, function(err, temperature, humidity) {
		  if (!err) {
				self.sendSocketNotification("SENSOR_DATA", {"temperature": temperature.toFixed(1), "humidity": humidity.toFixed(1) });
			} else {
				self.sendSocketNotification("SENSOR_DATA", {"temperature": null, "humidity": null });
				console.log(err);
			}
		});
	},

	//Subclass socketNotificationReceived received.
	socketNotificationReceived: function(notification, payload) {
		if (notification === "GET_SENSOR_DATA") {
			this.readSensor(payload.sensorPin, payload.sensorType);
		}
	}
});
