'use strict'

const ChildProcess = require('child_process')
const EventEmitter = require('events')

class RelayController extends EventEmitter {
  
  constructor() {
    super()

    // In order by serial
    this.devices = {
      'AI050LQL' : {
        'bus' : 0,
        'connected' : true,
        'state' : [0,0,0,0,0,0,0,0]
      },
      'AI050LZZ' : {
        'bus' : 1,
        'connected' : false,
        'state' : [0,0,0,0,0,0,0,0]
      },
      'AI050LMX' : {
        'bus' : 2,
        'connected' : false,
        'state' : [0,0,0,0,0,0,0,0]
      },
      'AI050LQN' : {
        'bus' : 3,
        'connected' : false,
        'state' : [0,0,0,0,0,0,0,0]
      }
    }
  }

  // useFTDI uses the node module vs
  // the CLI tool "crelay"
  init(useFTDI){

    this.useFTDI = (useFTDI === true)

    if(this.useFTDI){
      const ftdi = require('ftdi')

      ftdi.find(1027, 24577, (err, deviceList) => {

        for(let i=0; i<deviceList.length; i++){
          let ftdiDevice    = new ftdi.FtdiDevice(deviceList[i])
          let serial        = deviceList[i].serialNumber

          let device        = this.devices[serial]
          device.ftdiDevice = ftdiDevice
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
    } else {
      // Use the command line tool
    }
  }

  // Keeping buses numbered 0-3, will create a
  // lookup table if we need to map "bus" to specific port
  storeRelayState(busNum, relayNum, state){
    for(let d in this.devices){
      let dev = this.devices[d]

      if(dev.bus === busNum){
        dev.state[relayNum] = state
      }
    }
  }

  // Update all relays at once. Reset sets every relay to "off"
  // without affecting the state stored here
  sendRelayStates(reset){
    for(let devSerial in this.devices){
      let dev       = this.devices[devSerial]

      if(dev.connected){
        for(let relayNum in dev.state){
          let relayState = (dev.state[relayNum] === 0 || reset === true) ? 'OFF' : 'ON'

          // TODO - run this async
          ChildProcess.execFileSync(
            __dirname + '/bin/crelay', 
            ['-s', devSerial, relayNum, relayState], 
            {}, 
            function(err, stdout) { 
              console.log(err)
            }
          )

        }
      }
    }


    /*for(let d in this.devices){
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
    }*/
    
  }



  getDeviceState(busNum){
    return this.devices[busNum].state
  }

}


module.exports = RelayController