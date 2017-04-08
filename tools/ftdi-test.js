var ftdi = require('ftdi');

ftdi.find(function(err, devices) {
  //console.log(devices);

  var device = new ftdi.FtdiDevice(devices[0]);

  console.log(device);

  device.on('error', function(err) {
    console.log("error", err)
  });

  device.open({
    baudrate: 9600,
    databits: 8,
    stopbits: 1,
    parity: 'none',
    bitmode: 'sync',
    bitmask: 0xff
  },
  function(err) {

    device.on('data', function(data) {
      //console.log(data)
    });

  
    var state = "00000000";
    //var stateHex = parseInt(state, 2).toString(16);

    var stateChar = String.fromCharCode(parseInt(state, 2))

    //device.write(parseInt(state, 2).toString(16), function(err) {
    device.write(stateChar, function(err) {
      console.log(err)
    });

  });

});
