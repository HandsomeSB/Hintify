const vscode = require('vscode');
const path = require('path');

let fileWatcherInterval = null;
let currentFileContent = '';
let currentFilePath = '';
let lastUpdateTime = null;
const fileUpdateCallbacks = [];

function startFileWatcher() {
    if (fileWatcherInterval) {
        clearInterval(fileWatcherInterval);
    }

    async function onInterval() { 
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            const document = activeEditor.document;
            const newContent = document.getText();
            
            // Only update and show message if content changed and is not empty
            if (newContent && newContent.trim().length > 0 && newContent !== currentFileContent) {
                currentFileContent = newContent;
                currentFilePath = activeEditor.document.fileName;
                lastUpdateTime = new Date();
                const message = `File content updated: ${activeEditor.document.fileName}`;
                vscode.window.showInformationMessage(message);
                onFileUpdate(); 
            }
        }
    }

    onInterval();

    fileWatcherInterval = setInterval(async () => {
        onInterval();
    }, 60000); // 60 seconds
}

function stopFileWatcher() {
    if (fileWatcherInterval) {
        clearInterval(fileWatcherInterval);
        fileWatcherInterval = null;
    }
}

function getCurrentContent() {
    return currentFileContent;
}

function getCurrentFileName() { 
    return path.basename(currentFilePath);
}

function getCurrentFileExtension() {
    return path.extname(currentFilePath);
}

function getLastUpdateTime() {
    return lastUpdateTime;
}

function addFileUpdateCallback(callback) {
    fileUpdateCallbacks.push(callback);
}

function onFileUpdate() {
    fileUpdateCallbacks.forEach(callback => {
        callback(currentFileContent, path.basename(currentFilePath), path.extname(currentFilePath));  
    });
}

module.exports = {
    startFileWatcher,
    stopFileWatcher,
    getCurrentContent,
    getLastUpdateTime,
    addFileUpdateCallback,
    getCurrentFileName,
    getCurrentFileExtension
};