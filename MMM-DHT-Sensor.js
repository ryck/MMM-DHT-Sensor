/* Magic Mirror
 * Module: MMM-DHT-Sensor
 *
 * By Ricardo Gonzalez http://www.github.com/ryck/MMM-DHT-Sensor
 * MIT Licensed.
 */

Module.register("MMM-DHT-Sensor", {
	defaults: {
		updateInterval: 60 * 60 * 1000, // Every hour.
		initialLoadDelay: 0, // No delay/
		animationSpeed: 1000, // One second.
		units: config.units, // Celsius
		relativeScale: 30,
		debug: false,
		sensorPin: 2,
		sensorType: 22,
	},

	start: function () {
		this.temperature = null;
		this.humidity = null;
		this.loaded = false;
		this.updateTimer = null;
		Log.info(`Starting module: ${this.name}`);
		this.scheduleUpdate(this.config.initialLoadDelay);
		this.updateSensorData();
	},

	getStyles: () => ["MMM-DHT-Sensor.css", "font-awesome.css"],

	//Define header for module.
	getHeader: function () {
		return this.data.header;
	},

	// updateSensorData
	updateSensorData: function () {
		if (this.config.debug) {
			Log.info("sendSocketNotification: GET_SENSOR_DATA");
		}
		this.sendSocketNotification("GET_SENSOR_DATA", {
			sensorPin: this.config.sensorPin,
			sensorType: this.config.sensorType,
		});
	},

	/* scheduleUpdate()
	 * Schedule next update.
	 * argument delay number - Milliseconds before next update. If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function (delay) {
		const nextLoad =
			typeof delay === "number" && delay >= 0
				? delay
				: this.config.updateInterval;
		clearTimeout(this.updateTimer);
		this.updateTimer = setTimeout(() => {
			this.updateSensorData();
		}, nextLoad);
	},

	processSensorData: function (data) {
		if (typeof data === "undefined" || data === null) {
			return;
		}

		if (this.config.debug) {
			Log.info(data);
		}

		const rawTemp = Number.parseFloat(data.temperature);
		const rawHumidity = Number.parseFloat(data.humidity);
		if (Number.isNaN(rawTemp) || Number.isNaN(rawHumidity)) {
			Log.warn("MMM-DHT-Sensor: Invalid sensor payload", data);
			return;
		}

		const roundToTwo = (value) => Math.round(value * 100) / 100;
		const celsius = roundToTwo(rawTemp);
		const humidity = roundToTwo(rawHumidity);
		this.temperature =
			this.config.units === "imperial"
				? roundToTwo((celsius * 9) / 5 + 32)
				: celsius;
		this.humidity = humidity;
		this.loaded = true;

		if (this.temperature !== null) {
			this.sendNotification("INDOOR_TEMPERATURE", this.temperature);
		}
		if (this.humidity !== null) {
			this.sendNotification("INDOOR_HUMIDITY", this.humidity);
		}
		this.updateDom(this.config.animationSpeed);
	},

	// Override dom generator.
	getDom: function () {
		const wrapper = document.createElement("div");

		if (this.config.sensorPin === "") {
			wrapper.innerHTML = "Please set the GPIO pin number.";
			wrapper.className = "small";
			return wrapper;
		}

		if (this.config.sensorType === "") {
			wrapper.innerHTML = "Please set the sensor type (11 / 22).";
			wrapper.className = "small";
			return wrapper;
		}

		if (!this.loaded) {
			wrapper.innerHTML = "Loading sensor data...";
			wrapper.className = "small";
			return wrapper;
		}

		// Start building table.
		const dataTable = document.createElement("table");
		dataTable.className = "small";

		const tempRow = document.createElement("tr");
		const humidRow = document.createElement("tr");

		if (this.temperature != null && this.humidity != null) {
			const temperatureCell = document.createElement("td");
			temperatureCell.className = "data temperature ";

			// Get a 40C ratio value to set the thermometer icon scale.
			const temperatureRatio = this.temperature / this.config.relativeScale;

			let degreeLabel = "";
			switch (this.config.units) {
				case "metric":
					degreeLabel = "C";
					break;
				case "imperial":
					degreeLabel = "F";
					break;
				case "default":
					degreeLabel = "C";
					break;
			}
			let temperatureIcon = '<i class="fas fa-thermometer-full"></i>';
			// Asign themomether icon.
			switch (true) {
				case temperatureRatio < 0:
					if (this.config.debug) {
						Log.info(
							"thermometer-empty " +
								this.temperature +
								" - " +
								temperatureRatio,
						);
					}
					temperatureCell.className += "thermometer-empty";
					temperatureIcon = '<i class="fas fa-thermometer-empty"></i>';
					break;
				case temperatureRatio >= 0 && temperatureRatio < 0.25:
					if (this.config.debug) {
						Log.info(
							"thermometer-quarter " +
								this.temperature +
								" - " +
								temperatureRatio,
						);
					}
					temperatureCell.className += "thermometer-quarter";
					temperatureIcon = '<i class="fas fa-thermometer-quarter"></i>';
					break;
				case temperatureRatio >= 0.25 && temperatureRatio < 0.5:
					if (this.config.debug) {
						Log.info(
							"thermometer-half " + this.temperature + " - " + temperatureRatio,
						);
					}
					temperatureCell.className += "thermometer-half";
					temperatureIcon = '<i class="fas fa-thermometer-half"></i>';
					break;
				case temperatureRatio >= 0.5 && temperatureRatio < 0.75:
					if (this.config.debug) {
						Log.info(
							"thermometer-three-quarters " +
								this.temperature +
								" - " +
								temperatureRatio,
						);
					}
					temperatureCell.className += "thermometer-three-quarters";
					temperatureIcon = '<i class="fas fa-thermometer-three-quarters"></i>';
					break;
				case temperatureRatio > 0.75:
					if (this.config.debug) {
						Log.info(
							"thermometer-full " + this.temperature + " - " + temperatureRatio,
						);
					}
					temperatureCell.className += "thermometer-full";
					temperatureIcon = '<i class="fas fa-thermometer-full"></i>';
					break;
			}

			temperatureCell.innerHTML =
				temperatureIcon + this.temperature + " " + degreeLabel;
			tempRow.appendChild(temperatureCell);

			const humidityCell = document.createElement("td");
			humidityCell.className = "data humidity";
			const humidityIcon = '<i class="fas fa-tint"></i>';
			humidityCell.innerHTML = humidityIcon + this.humidity + " %";
			humidRow.appendChild(humidityCell);

			dataTable.appendChild(tempRow);
			dataTable.appendChild(humidRow);
		} else {
			const row1 = document.createElement("tr");
			dataTable.appendChild(row1);

			const messageCell = document.createElement("td");
			messageCell.innerHTML = "No data returned";
			messageCell.className = "bright";
			row1.appendChild(messageCell);
		}
		wrapper.appendChild(dataTable);
		return wrapper;
	},

	socketNotificationReceived: function (notification, payload) {
		if (notification === "SENSOR_DATA") {
			this.processSensorData(payload);
			this.scheduleUpdate(this.config.updateInterval);
			if (this.config.debug) {
				Log.info("socketNotificationReceived: SENSOR_DATA");
			}
		}
	},
});
