'use strict'

const udp = require('dgram');

let Service, Characteristic;

module.exports = homebridge => {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerAccessory('homebridge-lights-udp', 'UDPLightbulbAccessory', LightbulbAccessory);
}

class LightbulbAccessory {
  constructor (log, config) {
    this.log = log
    this.config = config

    this.service = new Service.Lightbulb(this.config.name);
    this.client = new net.Socket();

    this.client = udp.createSocket('udp4');

    this.context = { brightness: 0, on: false };
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
          this.service
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
    this.client.send('/api/set/state/' + value ? 1 : 0, this.config.port, this.config.ip, err => {
      if (err) return callback(err);
      callback(null, this.context.on = value);
    });

    this.log(`calling setOnCharacteristicHandler`, value);
  }

  getOnCharacteristicHandler (callback) {
    this.log(`calling getOnCharacteristicHandler`, this.context.on);
    callback(null, this.context.on);
  }

  setBrightnessCharacteristicHandler (value, callback) {
    this.client.send('/api/set/brightness/' + value, this.config.port, this.config.ip, err => {
      if (err) return callback(err);
      callback(null, this.context.brightness = value);
    });
  }

  getBrightnessCharacteristicHandler (callback) {
    this.log(`calling getBrightnessCharacteristicHandler`, this.context.brightness);
    callback(null, this.context.brightness);
  }
};
