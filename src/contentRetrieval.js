const vscode = require('vscode');

let fileWatcherInterval = null;
let currentFileContent = '';
let lastUpdateTime = null;

function startFileWatcher() {
    if (fileWatcherInterval) {
        clearInterval(fileWatcherInterval);
    }

    fileWatcherInterval = setInterval(async () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            const document = activeEditor.document;
            const newContent = document.getText();
            
            // Only update and show message if content changed and is not empty
            if (newContent && newContent.trim().length > 0 && newContent !== currentFileContent) {
                currentFileContent = newContent;
                lastUpdateTime = new Date();
                const message = `File content updated: ${activeEditor.document.fileName}`;
                vscode.window.showInformationMessage(message);
            }
        }
    }, 30000); // 30 seconds
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

function getLastUpdateTime() {
    return lastUpdateTime;
}

module.exports = {
    startFileWatcher,
    stopFileWatcher,
    getCurrentContent,
    getLastUpdateTime
};