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

    // Initial value display
    this.segmentController.updateSegments(this.digitManager.segments)

    // For testing - keep incrementing
    this.segmentController.on('update', () => {

      //console.log(this.digitManager.segments)

      // sequence run for testing
      if(this.runSequence){
        setTimeout(() => {
          this.sequenceNext()
        }, 1000)
        
      }

    })

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

