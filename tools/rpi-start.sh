#!/bin/bash
# start the screen
screen -d -R knog

# disable module items
sudo rmmod ftdi_sio
sudo rmmod usbserial

sudo node ~/knog-lap-counter/index.js

