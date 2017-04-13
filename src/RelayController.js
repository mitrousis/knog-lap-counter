'use strict'

const ftdi = require('ftdi')
const EventEmitter = require('events')

class RelayController extends EventEmitter {
  
  constructor() {
    super()

    // In order by serial
    this.devices = {
      'AI050LQL' : {
        'bus' : 0,
        'connected' : false
      },
      'AI050LZZ' : {
        'bus' : 1,
        'connected' : false
      },
      'AI050LMX' : {
        'bus' : 2,
        'connected' : false
      },
      'AI050LQN' : {
        'bus' : 3,
        'connected' : false
      }
    }
  }

  openDevices(){
    ftdi.find(1027, 24577, (err, deviceList) => {

      for(let i=0; i<deviceList.length; i++){
        let ftdiDevice    = new ftdi.FtdiDevice(deviceList[i])
        let serial        = deviceList[i].serialNumber

        let device        = this.devices[serial]
        device.ftdiDevice = ftdiDevice
        device.state      = [0,0,0,0,0,0,0,0]
        device.connected  = true

        console.log(`Found FTDI device ${serial}`)

        ftdiDevice.on('error', function(err) {
          console.log('FTDI error ${serial}', err)
        })

        ftdiDevice.on('data', function(data) {
          console.log('FTDI data ${serial}', data)
        })

        // Basic settings to connect to Sainsmart relay
        // not the bit band bitmode, which allows us to simply trigger pins
        ftdiDevice.open({
          baudrate: 9600,
          databits: 8,
          stopbits: 1,
          parity: 'none',
          bitmode: 'sync', // async dies right away, sync works for a while then dies
          bitmask: 0xff
        },
        function(err) {
          if(err){
            console.log('FTDI Open Error ${serial}', err)
          }
        })
      }

    })
  }

  // Keeping buses numbered 0-3, will create a
  // lookup table if we need to map "bus" to specific port
  storeRelayState(busNum, relayNum, state){
    for(let d in this.devices){
      let dev = this.devices[d]

      if(dev.connected && dev.bus === busNum){
        dev.state[relayNum] = state
      }
    }
  }

  // Update all relays at once. Reset sets every relay to "off"
  // without affecting the state stored here
  sendRelayStates(reset){
    for(let d in this.devices){

      let dev       = this.devices[d]

      if(dev.connected){  

        let stateChar = ''

        if(reset === true){
          stateChar = String.fromCharCode(0)

        } else {
          // Binary endian is reversed from array
          let binaryString = dev.state.slice().reverse().join('')
          stateChar        = String.fromCharCode(parseInt(binaryString, 2))
        }

        // Should add an event on complete
        dev.ftdiDevice.write(stateChar, function(err) {
          if(err){
            console.log(`FTDI Write Error ${d}`, err)
          }
        })
      }
    }
    
  }

  getDeviceState(busNum){
    return this.devices[busNum].state
  }

}


module.exports = RelayController