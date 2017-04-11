'use strict'

const ftdi = require('ftdi')
const EventEmitter = require('events')

class RelayController extends EventEmitter {
  
  constructor() {
    super()

    this.devices = []
  }

  openDevices(){
    ftdi.find(1027, 24577, (err, deviceList) => {

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
  storeRelayState(busNum, relayNum, state){
    if(this.devices[busNum] === undefined){
      //console.log(`FTDI device on bus ${busNum} not found.`)

    } else {
      this.devices[busNum].state[relayNum] = state
    
    }
  }

  // Update all relays at once. Reset sets every relay to "off"
  // without affecting the state stored here
  sendRelayStates(reset = false){
    for(let busNum=0; busNum < this.devices.length; busNum++){

      let stateChar    = String.fromCharCode(0)

      if(reset === false){
        // Binary endian is reversed from array
        let binaryString = this.devices[busNum].state.slice().reverse().join('')
        stateChar    = String.fromCharCode(parseInt(binaryString, 2))
      }

      // Should add an event on complete
      this.devices[busNum].ftdi.write(stateChar, function(err) {
        if(err){
          console.log('FTDI Write Error', err, this)
        } else {
          
        }
      })
    }
    
  }

  getDeviceState(busNum){
    return this.devices[busNum].state
  }

}


module.exports = RelayController