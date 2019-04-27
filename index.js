'use strict'

const net = require('net');

let Service, Characteristic;

module.exports = homebridge => {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerAccessory('homebridge-lights-tcp', 'TCPLightbulbAccessory', LightbulbAccessory);
}

class LightbulbAccessory {
  constructor (log, config) {
    this.log = log
    this.config = config

    this.service = new Service.Lightbulb(this.config.name);
    this.client = new net.Socket();

    this.client.connect(this.config.port || 80, this.config.ip, function() {
      console.log('Connected');
      this.client.write('/heartbeat');

      setInterval(() => this.client.write('/heartbeat'), 10000);
    });
  }

  getServices () {
    const informationService = new Service.AccessoryInformation()
        .setCharacteristic(Characteristic.Manufacturer, 'Ryzzzen Enterprises LTD')
        .setCharacteristic(Characteristic.Model, 'TCP-Light')
        .setCharacteristic(Characteristic.SerialNumber, 'THI-SAI-NT-ITC-H-IEF');

    /*
     * For each of the service characteristics we need to register setters and getter functions
     * 'get' is called when HomeKit wants to retrieve the current state of the characteristic
     * 'set' is called when HomeKit wants to update the value of the characteristic
     */
    this.service.getCharacteristic(Characteristic.On)
      .on('get', this.getOnCharacteristicHandler.bind(this))
      .on('set', this.setOnCharacteristicHandler.bind(this))

      if (this.config.hasBrightness) {
          this.log('... Adding Brightness');
          lightbulbService
              .addCharacteristic(new Characteristic.Brightness())
              .on('get', this.getBrightnessCharacteristicHandler.bind(this))
              .on('set', this.setBrightnessCharacteristicHandler.bind(this));
      }

      /*
      if (this.config.hasColors) {
          this.log('... Adding colors');
          lightbulbService
              .addCharacteristic(new Characteristic.Hue())
              .on('get', api.getHue.bind(this))
              .on('set', api.setHue.bind(this));

          lightbulbService
              .addCharacteristic(new Characteristic.Saturation())
              .on('get', api.getSaturation.bind(this))
              .on('set', api.setSaturation.bind(this));
      }*/

    /* Return both the main service (this.service) and the informationService */
    return [informationService, this.service];
  }

  setOnCharacteristicHandler (value, callback) {
    this.isOn = value;
    this.client.write('/api/set/state/' + value ? 1 : 0);

    this.log(`calling setOnCharacteristicHandler`, value);
    callback(null);
  }

  getOnCharacteristicHandler (callback) {
    this.log(`calling getOnCharacteristicHandler`, this.isOn);
    callback(null, this.isOn);
  }

  setBrightnessCharacteristicHandler (value, callback) {
    this.brightness = value;
    this.client.write('/api/set/brightness/' + value);


    this.log(`calling setBrightnessCharacteristicHandler`, value);
    callback(null);
  }

  getBrightnessCharacteristicHandler (callback) {
    this.log(`calling getBrightnessCharacteristicHandler`, this.isBrightness);
    callback(null, this.isBrightness);
  }
};
