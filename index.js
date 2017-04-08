'use strict'

const DigitManager      = require('./src/DigitManager.js')
const SegmentController = require('./src/SegmentController.js')

class LapCounter {
  
  constructor(){
    this.runSequence  = false
    this.noSerial     = false
    this.runDecrement = false

    for(let arg of process.argv){
      if(arg === 'sequence') this.runSequence   = true
      if(arg === 'noserial') this.noSerial      = true
      if(arg === 'decrement') this.runDecrement = true
    }

    this.digitManager      = new DigitManager()
    this.segmentController = new SegmentController(this.noSerial)

    // For testing - keep incrementing
    this.segmentController.on('update', () => {
      // sequence run for testing
      if(this.runSequence){
        setTimeout(() => {
          this.sequenceNext()
        }, 3000)
        
      }

    })

    // Putting a delay in for any relays to init. 
    // could be better handled by 'ready' event
    setTimeout( () => {
      // Initial value display
      this.segmentController.updateSegments(this.digitManager.segments)
    },
    2000)
  }

  triggerIncrement() {
    this.digitManager.increment()
    this.segmentController.updateSegments(this.digitManager.segments)
  }

  triggerDecrement(){
    this.digitManager.decrement()
    this.segmentController.updateSegments(this.digitManager.segments)
  }

  sequenceNext(){
    if(this.runDecrement){
      this.triggerDecrement()
    } else {
      this.triggerIncrement()
    } 
    
  }

}


let lapCounter = new LapCounter()

