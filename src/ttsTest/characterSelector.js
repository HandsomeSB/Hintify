const fs = require('fs');
const path = require('path');

// Load characters from JSON file
const charactersFilePath = path.resolve(__dirname, 'characters.json');
let characters = {};
let selectedCharacter = null;

try {
    const data = fs.readFileSync(charactersFilePath, 'utf8');
    characters = JSON.parse(data);
    selectCharacter(getAllCharacters()[0]);
} catch (error) {
    console.error('Error loading characters.json:', error);
}

/**
 * Get all character names
 * @returns {string[]} Array of character names
 */
function getAllCharacters() {
    return Object.keys(characters);
}

/**
 * Get model key for a given character name
 * @param {string} name - Character name
 * @returns {string|null} Model key or null if character not found
 */
function getModelKey(name) {
    return characters[name] || null;
}

/**
 * Select a character by name
 * @param {string} name - Character name
 * @returns {string} Model key or error message if character not found
 */
function selectCharacter(name) {
    const modelKey = getModelKey(name);
    if (modelKey) {
        selectedCharacter = name;
        return modelKey;
    } else {
        return `Character "${name}" not found.`;
    }
}

function getSelectedCharacterModelKey() {
    return getModelKey(selectedCharacter);
} 

function getSelectedCharacter() {
    return selectedCharacter;
}

module.exports = {
    getAllCharacters,
    getModelKey,
    selectCharacter,
    getSelectedCharacterModelKey,
    getSelectedCharacter
};