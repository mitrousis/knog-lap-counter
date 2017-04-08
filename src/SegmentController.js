'use strict'

const async = require('async')
const term  = require('terminal-kit').terminal
const EventEmitter    = require ('events')

const RelayController = require('./RelayController') 


/* Assumed segment layout
0  1  2  3 4  5  6

00 01 02   13 14 15  0
03    04   16    17  1
05 06 07   18 19 20  2
08    09   21    22  3
10 11 12   23 24 25  4

*/

class SegmentController extends EventEmitter {
  
  constructor (noSerial = false){
    super()

    // Hard-coded per-relay bus. Assume everything is off when started
    // The x and y positions are for information only and for the terminal dump
    this.segStates = [
    // 0-7
      {'state' : 0, 'bus' : 2, 'relay' : 0, 'x' : 0, 'y': 0},
      {'state' : 0, 'bus' : 2, 'relay' : 1, 'x' : 1, 'y': 0},
      {'state' : 0, 'bus' : 2, 'relay' : 2, 'x' : 2, 'y': 0},
      {'state' : 0, 'bus' : 2, 'relay' : 3, 'x' : 0, 'y': 1},
      {'state' : 0, 'bus' : 2, 'relay' : 4, 'x' : 2, 'y': 1},
      {'state' : 0, 'bus' : 2, 'relay' : 5, 'x' : 0, 'y': 2},
      {'state' : 0, 'bus' : 2, 'relay' : 6, 'x' : 1, 'y': 2},
      {'state' : 0, 'bus' : 2, 'relay' : 7, 'x' : 2, 'y': 2},
    // 8-15
      {'state' : 0, 'bus' : 1, 'relay' : 0, 'x' : 0, 'y': 3},
      {'state' : 0, 'bus' : 1, 'relay' : 1, 'x' : 2, 'y': 3},
      {'state' : 0, 'bus' : 1, 'relay' : 2, 'x' : 0, 'y': 4},
      {'state' : 0, 'bus' : 1, 'relay' : 3, 'x' : 1, 'y': 4},
      {'state' : 0, 'bus' : 1, 'relay' : 4, 'x' : 2, 'y': 4},
      {'state' : 0, 'bus' : 1, 'relay' : 5, 'x' : 4, 'y': 0},
      {'state' : 0, 'bus' : 1, 'relay' : 6, 'x' : 5, 'y': 0},
      {'state' : 0, 'bus' : 1, 'relay' : 7, 'x' : 6, 'y': 0},
    // 16 - 23
      {'state' : 0, 'bus' : 0, 'relay' : 0, 'x' : 4, 'y': 1},
      {'state' : 0, 'bus' : 0, 'relay' : 1, 'x' : 6, 'y': 1},
      {'state' : 0, 'bus' : 0, 'relay' : 2, 'x' : 4, 'y': 2},
      {'state' : 0, 'bus' : 0, 'relay' : 3, 'x' : 5, 'y': 2},
      {'state' : 0, 'bus' : 0, 'relay' : 4, 'x' : 6, 'y': 2},
      {'state' : 0, 'bus' : 0, 'relay' : 5, 'x' : 4, 'y': 3},
      {'state' : 0, 'bus' : 0, 'relay' : 6, 'x' : 6, 'y': 3},
      {'state' : 0, 'bus' : 0, 'relay' : 7, 'x' : 4, 'y': 4},
    // 24 - 25
      {'state' : 0, 'bus' : 3, 'relay' : 0, 'x' : 5, 'y': 4},
      {'state' : 0, 'bus' : 3, 'relay' : 1, 'x' : 6, 'y': 4}
    ]

    // Clear terminal output - has nothing to do with serial functionality
    term.clear()
    term.hideCursor()

    this.relayController = new RelayController()
    this.noSerial        = noSerial

    if(!this.noSerial) {
      this.relayController.openDevices()
    }

    // Initial 'zero-ing' of terminal display
    for(let seg of this.segStates){
      this.dumpSegmentState(seg, false)
    }
  }

  updateSegments(segmentsArray) {
    //term('00').styleReset()
    // Run in parallel, but wait until every bus is triggered
    let segsToCycle = []

    // Update only if state has changed
    for(let i=0; i<segmentsArray.length; i++){
      if(this.segStates[i].state !== segmentsArray[i]){
        segsToCycle.push(this.segStates[i])
      }
    }

    async.each(segsToCycle, this.cycleSegmentState.bind(this), (err) => {
      if(err){
        throw(err)
      } else {
        this.emit('update')
      }
    })

  }

  // We don't know if the light is off or on, 
  // so we can just switch states
  cycleSegmentState(segState, callback){
    // Open, then timeout, then close relay

    // First trigger - open
    this.setRelayState(segState, true)

    // Then delay close, 2 seconds. This
    // could be a little cleaner and do an entire state
    // switch across all the pins with one timeout...
    setTimeout( () => {

      // Invert segment state
      segState.state = (segState.state === 0) ? 1 : 0;
      this.setRelayState(segState, false)

      callback()
    }, 1500)

  }

  setRelayState(segState, relayOpen) {
    this.dumpSegmentState(segState, relayOpen)

    // Note that the relay open/closed state is 
    // separate from the segment state
    if(!this.noSerial) {
      let relayState = (relayOpen) ? 1 : 0
      this.relayController.setRelayState(segState.bus, segState.relay, relayState)
    }

    // Do serial call here
  }

  // Used for debugging in terminal
  dumpSegmentState(segState, relayOpen){
    // Show 'transition' if relay is open
    let output = ''

    if(relayOpen) {
      output = '-'
    } else {
      if(segState.state === 0) output = ' '
      if(segState.state === 1) output = '▓'
    }
    
    term.moveTo(segState.x + 2, segState.y + 2, output)

    // Move caret to below output for any logging
    term.moveTo(1, 10)

  }

}

module.exports = SegmentController