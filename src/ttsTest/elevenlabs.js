const { ElevenLabsClient, play } = require("elevenlabs");
const dotenv = require("dotenv");
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const client = new ElevenLabsClient({
    apiKey: process.env.ELEVEN_KEY,
});

async function tts(voiceId, modelId, text) {
  const audioStream = await client.textToSpeech.convert(voiceId, {
    text: text,
    model_id: modelId,
    output_format: "mp3_44100_128",
  });

  const speechFile = path.join(__dirname, 'speech.mp3');
  const fileStream = fs.createWriteStream(speechFile);

  audioStream.on('error', (err) => {
    console.error('Error in audio stream:', err);
  });

  fileStream.on('error', (err) => {
    console.error('Error writing file:', err);
  });

  fileStream.on('finish', () => {
    console.log('File saved successfully');
    playAudio(speechFile);
  });

  audioStream.pipe(fileStream);
}

function playAudio(filePath) {
  const command = process.platform === 'win32' ? `start ${filePath}` : `afplay ${filePath}`;
  exec(command, (error) => {
      if (error) {
          console.error('Error playing audio:', error);
      }
  });
}

module.exports = {
  tts
}


