const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { VoiceRegister } = require('./voiceRegister');

class SidebarProvider {
  constructor(_context) {
    this._context = _context;
  }

  resolveWebviewView(webviewView, context, _token) {
    webviewView.webview.options = { enableScripts: true };

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
        }
    });
  }
}

module.exports = { SidebarProvider };