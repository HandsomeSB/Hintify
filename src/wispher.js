const axios = require("axios");
const fs = require("fs").promises;
const FormData = require("form-data");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

//transcribe function needs a file path that it needs to transcribe.
async function transcribe(filePath) {
  try {
    const apiKey = process.env.OPENAI_KEY; // Get API key from .env

    if (!apiKey) {
      throw new Error("OPENAI_KEY is not set in the .env file.");
    }
    const formData = new FormData();
    const fileName = path.basename(filePath); // Get the actual file name
    formData.append("file", await fs.readFile(filePath), fileName); // Use the actual file name
    formData.append("model", "whisper-1");
    formData.append("response_format", "verbose_json"); // Request verbose JSON response

    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${apiKey}`, // Replace with your API key
        },
      }
    );

    // console.log("language: ", response.data.language);

    return {
      text: response.data.text,
      language: response.data.language,
    };
  } catch (error) {
    console.error(
      "Whisper API error:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

module.exports = {
  transcribe,
};
