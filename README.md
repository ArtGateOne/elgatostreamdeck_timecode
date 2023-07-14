# elgatostreamdeck_timecode
Show MTC midi timecode on Elgato Stream Deck


nodejs code to control display MTC on Elgato Stream Deck

to send mtc - use virtual midi device - loop midi - name "MTC"

Download and instal NODEJS version 14.17 from https://nodejs.org/dist/v14.17.0/node-v14.17.0-x64.msi

Download my code.

Instal fonts from fonts folder

----------

To run

Start virtual midi

Set node.exe as default tool to open .js files

Double click on timecode.js

------------

CONFIG

open timecode.js file in notepad


default settings for XL 

//CONFIG

midi_in = 'MTC';     //set correct midi in device name

HH_Button = 28;     //set button nr for HH , -1 is off

MM_Button = 29;     //set button nr for MM , -1 is off

SS_Button = 30;     //set button nr for SS , -1 is off

FR_Button = 31;    //set button nr for SSS , -1 is off



U can set button number to display hour minutest etc buttons

set -1 to nodisplay button
