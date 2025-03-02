const { ElevenLabsClient, play } = require("elevenlabs");
const dotenv = require("dotenv");
const path = require('path');
const { exec, execSync } = require("child_process");
const fs = require('fs');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const client = new ElevenLabsClient({
    apiKey: process.env.ELEVEN_KEY,
});

let audioProcess = null;

async function tts(voiceId, modelId, text) {
  const audioStream = await client.textToSpeech.convert(voiceId, {
    text: text,
    model_id: modelId,
    output_format: "mp3_44100_128",
    voice_settings: {
      stability: 0.5, // Adjust for voice consistency (0.0 = dynamic, 1.0 = stable)
      similarity_boost: 0.75, // Adjust for how close it stays to the original voice
      style: 0.0, // Optional: Controls expressiveness
      use_speaker_boost: true, // Improves quality
      speed: 1.1, //  Adjust speed (1.0 = normal, 1.5 = faster, 2.0 = very fast)
    },
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
  stopAudio(); // Stop any currently playing audio
  const command = process.platform === 'win32' ? `start ${filePath}` : `afplay ${filePath}`;  
  audioProcess = exec(command, (error) => {
    if (error) {
      console.error("Error playing audio:", error);
    }
  });
}

function stopAudio() {
  if (audioProcess) {
    audioProcess.kill(); // Stop the process
    audioProcess = null;
    console.log("Audio stopped.");

    // // Extra: Stop audio manually on macOS & Linux
    // if (process.platform === "darwin") {
    //   execSync("killall afplay"); // Stops all afplay instances
    // }
  } else {
    console.log("No audio is playing.");
  }


}

module.exports = {
  tts,
  playAudio,
  stopAudio,
}


