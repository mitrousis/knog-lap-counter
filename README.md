# knog-lap-counter
A lap counter with Knog bike lights

Made to run on a Raspberry Pi, node version 4.6.2

1) npm install
2) node index.js [sequence] [decrement] [noserial] [startat=x]

options, in any order:
sequence = runs a count up/down
decrement = runs the sequece down
noserial = disables serial comms
startat=[x] = starts the digits at provided x value. defaults to 0



installing node on raspberry pi

get version 5.x (hope this helps ftdi lib erros)

$ curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash -

$ sudo apt-get install nodejs

-- need to get FTDI drivers ---

$ npm install


might need to disable some modules on pi before each run

If the message "FT_Open failed" appears:
    Perhaps the kernel automatically loaded another driver for the 
    FTDI USB device.

    sudo lsmod

    If "ftdi_sio" is listed:
        Unload it (and its helper module, usbserial), as follows.

sudo rmmod ftdi_sio
sudo rmmod usbserial

    Otherwise, it's possible that libftd2xx does not recognise your 
    device's Vendor and Product Identifiers.  Call FT_SetVIDPID before
    calling FT_Open/FT_OpenEx/FT_ListDevices.


