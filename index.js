'use strict'

const DigitManager      = require('./src/DigitManager.js')
const SegmentController = require('./src/SegmentController.js')
const readline          = require('readline')

class LapCounter {
  
  constructor(){
    this.runSequence  = false
    this.noSerial     = false
    this.runDecrement = false
    this.startAt      = 0

    for(let arg of process.argv){
      if(arg === 'sequence') this.runSequence   = true
      if(arg === 'noserial') this.noSerial      = true
      if(arg === 'decrement') this.runDecrement = true
      if(arg.indexOf('startat') === 0) this.startAt = parseInt(arg.split('=')[1])
    }

    this.digitManager      = new DigitManager()
    this.segmentController = new SegmentController(this.noSerial)

    this.digitManager.value = this.startAt
    //this.preUpdateValue     = this.digitManager.value

    // For testing - keep incrementing
    this.segmentController.on('update', () => {
    
      // sequence run for testing
      if(this.runSequence){
        setTimeout(() => {
          this.sequenceNext()
        }, 2200)
        
      } else {
        // Could add hook to allow changes to value while updating
        //this.preUpdateValue 
      }

    })

    // Putting a delay in for any relays to init. 
    // could be better handled by 'ready' event
    //setTimeout( () => {
      // Initial value display
    this.segmentController.updateSegments(this.digitManager.segments)
    //},
    //2000)


    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.on('keypress', (str, key) => {
      if (key.ctrl && key.name === 'c') {
        process.exit();
      } else {
        // TODO
        // Up
        if(key.sequence == '\u001b[A'){
          this.triggerIncrement()
        // Down
        } else if(key.sequence == '\u001b[B'){
          this.triggerDecrement()
        }
    // Using preso controller
	  // page up
        if(key.sequence == '\u001b[6~'){
          this.triggerIncrement()
        // page down
        } else if(key.sequence == '\u001b[5~'){
          this.triggerDecrement()
        }
      }
    });

  }

  triggerIncrement() {
    if(!this.segmentController.isUpdating){
      this.digitManager.increment()
      this.segmentController.updateSegments(this.digitManager.segments)
    }
  }

  triggerDecrement(){
    if(!this.segmentController.isUpdating){
      this.digitManager.decrement()
      this.segmentController.updateSegments(this.digitManager.segments)
    }
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

