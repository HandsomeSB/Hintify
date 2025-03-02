const { OpenAI } = require("openai");
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Constants
const API_KEY = process.env.OPENAI_KEY || "your-api-key-here"; // Replace with your actual API key
/**
 * OpenAI API instance
 * @type {OpenAIApi}
 */
let openai;

/**
 * Initialize OpenAI with the extension's API key
 */
function initialize() {
  try {
    // Check if we should use environment variables or a local .env file
    let apiKey = API_KEY;

    // If API_KEY is the placeholder, try to load from .env file in the extension directory
    if (apiKey === "your-api-key-here") {
      try {
        // Get extension directory path
        const extensionPath = vscode.extensions.getExtension(
          "yourpublisherid.hintify"
        ).extensionPath;
        const envPath = path.join(extensionPath, ".env");

        if (fs.existsSync(envPath)) {
          // Simple .env file parsing (consider using dotenv package for more robust handling)
          const envContent = fs.readFileSync(envPath, "utf8");
          const envLines = envContent.split("\n");

          for (const line of envLines) {
            const match = line.match(/^OPENAI_API_KEY=(.*)$/);
            if (match) {
              apiKey = match[1].trim();
              break;
            }
          }
        }
      } catch (err) {
        console.error("Failed to load API key from .env file:", err);
      }
    }

    openai = new OpenAI({
      apiKey: apiKey,
    });
  } catch (error) {
    console.error("Failed to initialize OpenAI:", error);
    openai = null;
  }
}

/**
 * Check if OpenAI is properly configured
 * @returns {boolean} True if configured
 */
function isConfigured() {
  return !!openai;
}

/**
 * Get code hints from OpenAI
 * @param {string} code - Code to analyze
 * @param {string} fileName - Name of the file
 * @param {string} fileExtension - Extension of the file
 * @returns {Promise<Array>} Array of hints
 */
async function getCodeHints(code, fileName, fileExtension) {
  if (!isConfigured()) {
    // Initialize if not already done
    initialize();

    if (!isConfigured()) {
      throw new Error(
        "OpenAI could not be initialized. Please check your configuration."
      );
    }
  }

  // Get model from configuration
  const config = vscode.workspace.getConfiguration("hintify");
  const modelName = config.get("openai.model", "gpt-3.5-turbo");
  const verbosityLevel = config.get("analysis.verbosityLevel", "medium");

  // Adjust system prompt based on verbosity level
  let systemPrompt = `You are a coding assistant that helps developers identify potential issues in their code. Your job is to analyze the provided code and point out a single major issue, with a priority on logical bugs. Instead of providing direct fixes, give hints or guiding questions that help the developer think critically about their code.
  Your responses should be concise, to the point, and insightful, similar to a mentor giving subtle nudges. Use natural language like: 'You might wanna think about the synchronous nature of your hello world function.' or 'You should look again at your loop syntax.`;

  if (verbosityLevel === "minimal") {
    systemPrompt += " Be very brief, focusing only on the most critical issue.";
  } else if (verbosityLevel === "detailed") {
    systemPrompt +=
      " Be thorough, including both critical issues and suggestions for code improvement.";
  }

  try {
    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Review this ${fileExtension} code from file ${fileName}:\n\n${code}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    // Parse the response
    const content = response.choices[0].message.content.trim();
    return content;
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
}

/**
 * Ask a question about code
 * @param {string} code - Code to ask about
 * @param {string} fileName - Name of the file
 * @param {string} userQuery - User's question
 * @returns {Promise<string>} LLM response
 */
async function askAboutCode(code, fileName, userQuery) {
  if (!isConfigured()) {
    // Initialize if not already done
    initialize();

    if (!isConfigured()) {
      throw new Error(
        "OpenAI could not be initialized. Please check your configuration."
      );
    }
  }

  // Get model from configuration
  const config = vscode.workspace.getConfiguration("hintify");
  const modelName = config.get("openai.model", "gpt-3.5-turbo");

  try {
    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: "system",
          content: `You are a code review assistant that identifies potential issues or bugs in code without fixing them. Your job isn't not to give direct solutions to coding problem but instead give explanations or hints to the user and direct them in the right path. Focus on providing clear, concise hints that help the developer understand what might be wrong. If it helps, you can use examples of real life to direct the user onto the correct code logic. Majorly be on a lookout for logical error and feel free to avoid small errors. Make sure to respond just about one issue as a response. Only include actual issues - if the code looks good, return an empty array.`,
        },
        {
          role: "user",
          content: `Here is my code in file ${fileName}:\n\n${code}\n\nMy question is: ${userQuery}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
}

async function impersonate(character, context) {
  try {
    const config = vscode.workspace.getConfiguration("hintify");
    const modelName = config.get("openai.model", "gpt-4-turbo");

    let systemPrompt = `You are impersonating ${character}, reviewing code issues in their signature style. You will be given an explanation of a potential issue with the code. Your task is to rephrase it in a way that maintains all the useful information while making it funnier and more aligned with how ${character} would speak. Ensure that:

    The core technical insight remains unchanged.
    The tone, phrasing, and mannerisms match how ${character} naturally speaks.
    The response is engaging, witty, and fun, but still helpful.
    For example, if the original issue is about improper loop syntax, and the character is Deadpool, you might say:
    'Oh boy, that loop is more broken than my moral compass. You might wanna double-check that syntax before it goes rogue.'

    If the character is Yoda:
    'Loop, broken it is. Syntax, check you must.'

    Now, rephrase the given issue in ${character}'s style and make sure your response is full of insights and makes the user think. Give user multiple hints to figure out where they are going wrong`;

    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Here are the issues with the code: ${context}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    // Parse the response
    const content = response.choices[0].message.content.trim();

    return content;
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
}

module.exports = {
  initialize,
  isConfigured,
  getCodeHints,
  askAboutCode,
  impersonate,
};
