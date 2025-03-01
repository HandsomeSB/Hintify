const { OpenAI } = require('openai');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class TTS {
    constructor(apiKey) {
        this.openai = new OpenAI({
            apiKey: apiKey,
        });
    }

    async sendRequest(text) {
        try {
            const response = await this.openai.audio.speech.create({
                model: "tts-1",
                voice: "alloy",
                input: text
              });

            const speechFile = path.join(__dirname, 'speech.mp3');
            const buffer = Buffer.from(await response.arrayBuffer());
            await fs.promises.writeFile(speechFile, buffer);
            this.playAudio(speechFile);
        } catch (error) {
            console.error('Error sending TTS request:', error);
        }
    }

    playAudio(filePath) {
        const command = process.platform === 'win32' ? `start ${filePath}` : `afplay ${filePath}`;
        exec(command, (error) => {
            if (error) {
                console.error('Error playing audio:', error);
            }
        });
    }
}

module.exports = TTS;