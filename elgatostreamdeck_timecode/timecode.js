const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const jpegJS = require('jpeg-js');
const { openStreamDeck } = require('@elgato-stream-deck/node');
const easymidi = require('easymidi');
const streamDeck = openStreamDeck();

//CONFIG
midi_in = 'MTC';     //set correct midi in device name

HH_Button = 28;     //set button nr for HH , -1 is off
MM_Button = 29;     //set button nr for MM , -1 is off
SS_Button = 30;     //set button nr for SS , -1 is off
FR_Button = 31;    //set button nr for SSS , -1 is off - not finishet


var array = [0, 0, 0, 0, 0, 0, 0, 0];
var array_mem = [-1, -1, -1, -1, -1, -1, -1, -1];
display_timecode();

//display all midi devices
console.log("Midi IN");
console.log(easymidi.getInputs());
console.log("Midi OUT");
console.log(easymidi.getOutputs());

const inputs = easymidi.getInputs();
if (inputs.length <= 0) {
  console.log('No midi device found');
  process.exit(1);
}
console.log('Connecting to: ' + midi_in);
const input = new easymidi.Input(midi_in);



// SMPTE Types
// 0 = 24 fps
// 1 = 25 fps
// 2 = 30 fps (Drop-Frame)
// 3 = 30 fps
input.on('smpte', (smpte) => {
  console.log(`smpte: ${smpte.smpte} – smpteType: ${smpte.smpteType}`);
});


input.on('mtc', function (msg) {
  //console.log(msg.type, msg.value);
  array[msg.type] = msg.value;

  if (msg.type == 7) {
    display_timecode();
    //console.log((array[7]*16 + array[6]), (array[5]*16 + array[4]) ,(array[3]*16 + array[2]), (array[1]*16 + array[0]));
  }
});


input.on('sysex', function (msg) {
  //console.log(msg.bytes);
  if (msg.bytes[0] == 240 && msg.bytes[1] == 127 && msg.bytes[2] == 127 && msg.bytes[3] == 1 && msg.bytes[4] == 1 && msg.bytes[9] == 247) {

    if (FR_Button != -1) {
      generate_pic(FR_Button, msg.bytes[8]);
    }

    if (SS_Button != -1) {
      generate_pic(SS_Button, msg.bytes[7]);
    }

    if (MM_Button != -1) {
      generate_pic(MM_Button, msg.bytes[6]);
    }

    if (HH_Button != -1) {
      generate_pic(HH_Button, msg.bytes[5]);
    }

  }
});


function display_timecode() {

  if (array[0] != array_mem[0] || array[1] != array_mem[1]) {//frame
    array_mem[0] = array[0];
    array_mem[1] = array[1];
    if (FR_Button != -1) {
      generate_pic((FR_Button), (array[1] * 16 + array[0]));
    }
  }

  if (array[2] != array_mem[2] || array[3] != array_mem[3]) {//sec
    array_mem[2] = array[2];
    array_mem[3] = array[3];
    if (SS_Button != -1) {
      generate_pic((SS_Button), (array[3] * 16 + array[2]));
    }
  }

  if (array[4] != array_mem[4] || array[5] != array_mem[5]) {//min
    array_mem[4] = array[4];
    array_mem[5] = array[5];
    if (MM_Button != -1) {
      generate_pic((MM_Button), (array[5] * 16 + array[4]));
    }
  }

  if (array[6] != array_mem[6] || array[7] != array_mem[7]) {//hour
    array_mem[6] = array[6];
    array_mem[7] = array[7];
    if (HH_Button != -1) {
      generate_pic((HH_Button), (array[7] * 16 + array[6]));
    }
  }

}


async function generate_pic(button, text) {
  try {
    const width = streamDeck.ICON_SIZE;
    const height = streamDeck.ICON_SIZE;

    const finalBuffer = await sharp({
      create: {
        width: width,
        height: height,
        channels: 4, // 3 channels for RGB
        background: { r: 0, g: 0, b: 0 }, // Black background color
      },
    })
      .composite([
        {
          input: Buffer.from(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" version="1.1">
                <text
                  font-family="'Digital-7 Mono', 'Arial', monospace"
                  font-size="${0.8 * height}"
                  x="${width / 2}"
                  y="${0.8 * height}"
                  fill="#5f0"
                  text-anchor="middle"
                >${text.toString().padStart(2, '0')}</text>
              </svg>`
          ),
          top: 0,
          left: 0,
        },
      ])
      .flatten()
      .raw()
      .toBuffer();

    await streamDeck.fillKeyBuffer(button, finalBuffer, { format: 'rgba' });
  } catch (error) {
    console.error(error);
  }

  return;
}
