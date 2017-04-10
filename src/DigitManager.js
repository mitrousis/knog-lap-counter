'use strict'

/* Assumed digit layout

00 01 02
03    04
05 06 07
08    09
10 11 12

*/

class DigitManager {
  
  constructor(){

    this.digits = {
      //     00 01 02 03 04 05 06 07 08 09 10 11 12  
      '0' : [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
      '1' : [0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1],
      '2' : [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1],
      '3' : [1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1],
      '4' : [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1],
      '5' : [1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1],
      '6' : [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1],
      '7' : [1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1],
      '8' : [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      '9' : [1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1]
    }

    this.currValue = 0

  }

  set value(v){
    // Don't exceed 99 since that's all the digits we have
    this.currValue = v
    this.currValue %= 100

    // And loop around if < 0
    if(this.currValue < 0) this.currValue += 100

  }

  get value(){
    return this.currValue
  }

  get segments(){
    let padded = ('00' + this.currValue.toString()).substring(this.currValue.toString().length)

    let dig0 = this.digits[padded.charAt(0)]
    let dig1 = this.digits[padded.charAt(1)]

    return dig0.concat(dig1)
  }

  increment(){
    this.value = this.currValue + 1
  }

  decrement(){
    this.value = this.currValue - 1
  }


}

module.exports = DigitManager