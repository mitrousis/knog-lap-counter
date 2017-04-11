'use strict'

const ftdi = require('ftdi')

class RelayController {
  
  constructor() {
    this.devices = []
  }

  openDevices(){
    ftdi.find( (err, deviceList) => {

      console.log('FTDI device list', deviceList)

      for(let i=0; i<deviceList.length; i++){
        let device = new ftdi.FtdiDevice(deviceList[i])
        this.devices.push({
          ftdi  : device,
          state : [0,0,0,0,0,0,0,0]
        })

        device.on('error', function(err) {
          console.log('FTDI Find Error', err, this)
        })

        device.on('data', function(data) {
          // Ignore any data from device
        })

        // Basic settings to connect to Sainsmart relay
        // not the bit band bitmode, which allows us to simply trigger pins
        device.open({
          baudrate: 9600,
          databits: 8,
          stopbits: 1,
          parity: 'none',
          bitmode: 'sync',
          bitmask: 0xff
        },
        function(err) {
          if(err){
            console.log('FTDI Open Error', err, this)
          } else {

          }
        })
      }

    })
  }

  // Keeping buses numbered 0-3, will create a
  // lookup table if we need to map "bus" to specific port
  setRelayState(busNum, relayNum, state){
    if(this.devices[busNum] === undefined){
      //console.log(`FTDI device on bus ${busNum} not found.`)

    } else {
      this.devices[busNum].state[relayNum] = state
    
      // Binary endian is reversed from array
      let binaryString = this.devices[busNum].state.slice().reverse().join('')
      let stateChar    = String.fromCharCode(parseInt(binaryString, 2))

      //console.log(binaryString)

      this.devices[busNum].ftdi.write(stateChar, function(err) {
        if(err){
          console.log('FTDI Write Error', err, this)
        }
      })
    }
  }

  getDeviceState(busNum){
    return this.devices[busNum].state
  }

}

module.exports = RelayController