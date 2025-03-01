const { OpenAI } = require('openai');
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Constants
const API_KEY = process.env.OPENAI_KEY || 'your-api-key-here'; // Replace with your actual API key
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
        if (apiKey === 'your-api-key-here') {
            try {
                // Get extension directory path
                const extensionPath = vscode.extensions.getExtension('yourpublisherid.hintify').extensionPath;
                const envPath = path.join(extensionPath, '.env');
                
                if (fs.existsSync(envPath)) {
                    // Simple .env file parsing (consider using dotenv package for more robust handling)
                    const envContent = fs.readFileSync(envPath, 'utf8');
                    const envLines = envContent.split('\n');
                    
                    for (const line of envLines) {
                        const match = line.match(/^OPENAI_API_KEY=(.*)$/);
                        if (match) {
                            apiKey = match[1].trim();
                            break;
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to load API key from .env file:', err);
            }
        }
        
        openai = new OpenAI({
            apiKey: apiKey,
        });
    } catch (error) {
        console.error('Failed to initialize OpenAI:', error);
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
            throw new Error('OpenAI could not be initialized. Please check your configuration.');
        }
    }
    
    // Get model from configuration
    const config = vscode.workspace.getConfiguration('hintify');
    const modelName = config.get('openai.model', 'gpt-4-turbo');
    const verbosityLevel = config.get('analysis.verbosityLevel', 'medium');
    
    // Adjust system prompt based on verbosity level
    let systemPrompt = `You are a code review assistant that identifies potential issues or bugs in code without fixing them. 
                Focus on providing clear, concise hints that help the developer understand what might be wrong.`;
                
    if (verbosityLevel === 'minimal') {
        systemPrompt += ' Be very brief, focusing only on the most critical issues.';
    } else if (verbosityLevel === 'detailed') {
        systemPrompt += ' Be thorough, including both critical issues and suggestions for code improvement.';
    }
    
    systemPrompt += `
    Format your response as a JSON array of objects, where each object has:
    1. "line": the approximate line number of the issue
    2. "severity": either "info", "warning", or "error"
    3. "message": a brief description of the potential issue
    4. "hint": a helpful nudge on how to fix it without giving the exact solution
    Only include actual issues - if the code looks good, return an empty array.`;
    
    try {
        const response = await openai.chat.completions.create({
            model: modelName,
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: `Review this ${fileExtension} code from file ${fileName}:\n\n${code}`
                }
            ],
            temperature: 0.3,
            max_tokens: 500
        });
        
        // Parse the response
        const content = response.choices[0].message.content.trim();
        return content
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
            throw new Error('OpenAI could not be initialized. Please check your configuration.');
        }
    }
    
    // Get model from configuration
    const config = vscode.workspace.getConfiguration('hintify');
    const modelName = config.get('openai.model', 'gpt-3.5-turbo');
    
    try {
        const response = await openai.chat.completions.create({
            model: modelName,
            messages: [
                {
                    role: "system",
                    content: `You are a helpful coding assistant that helps developers understand their code and provides guidance.
                    Give clear, concise answers to questions about code.
                    Where appropriate, suggest improvements or best practices, but don't rewrite the entire file.`
                },
                {
                    role: "user",
                    content: `Here is my code in file ${fileName}:\n\n${code}\n\nMy question is: ${userQuery}`
                }
            ],
            temperature: 0.7,
            max_tokens: 1000
        });
        
        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error("OpenAI API error:", error);
        throw error;
    }
}

async function impersonate(character, context) {
    try {
        const config = vscode.workspace.getConfiguration('hintify');
        const modelName = config.get('openai.model', 'gpt-4-turbo');

        let systemPrompt = `You are ${character}, trying to fix my code. You will be given a JSON object of all potential issues of the code. Phrase the issues the same way your character would.`;

        const response = await openai.chat.completions.create({
            model: modelName,
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: `Here are the issues with the code: ${context}`
                }
            ],
            temperature: 0.3,
            max_tokens: 500
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
    impersonate
};