const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { VoiceRegister } = require('./voiceRegister');
const characterSelector = require('./ttsTest/characterSelector');

class SidebarProvider {
  constructor(_context) {
    this._context = _context;
    this._webviewView = null;
  }

  resolveWebviewView(webviewView, context, _token) {
    webviewView.webview.options = { enableScripts: true };
    this._webviewView = webviewView;

    // Load the HTML file
    const htmlPath = path.join(this._context.extensionPath, 'src', 'sidebar.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    webviewView.webview.html = htmlContent;

    webviewView.webview.onDidReceiveMessage((message) => {
        switch (message.command) {
          case 'recordToggle':
            const voiceRegister = VoiceRegister.INSTANCE;
            voiceRegister.toggleRecording();

            webviewView.webview.postMessage({
                command: 'recordToggle',
                result: voiceRegister.isRecording
            });
            break;
          case 'characterSelected':
            const selectedCharacter = characterSelector.selectCharacter(message.character);
            console.log(`Selected character: ${message.character} with model key: ${selectedCharacter}`);
            break;
        }
    });

    this.populateCharacterDropdown();
  }

  updateContent(data) {
    //TODO, consider implementing a queue to handle multiple
    //concurrent requests
    if(!this._webviewView) {
      console.error('Webview not initialized');
      return;
    }
    this._webviewView.webview.postMessage({
      command: 'updateContent',
      data: data
    });
  }

  populateCharacterDropdown() {
    if(!this._webviewView) {
      console.error('Webview not initialized');
      return;
    }
    const characters = characterSelector.getAllCharacters();
    this._webviewView.webview.postMessage({
      command: 'populateCharacters',
      characters: characters
    });
  }
}

module.exports = { SidebarProvider };