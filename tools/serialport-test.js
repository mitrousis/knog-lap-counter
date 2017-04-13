'use strict'

var SerialPort = require('serialport');
var port = new SerialPort('/dev/ttyUSB0');
 
port.on('open', function() {
  let binaryString = "01010101"
  let stateChar    = String.fromCharCode(parseInt(binaryString, 2))

  port.write(stateChar, function(err) {
    if (err) {
      return console.log('Error on write: ', err.message);
    }
    console.log('message written');
  });
});