const vscode = require('vscode');

class SidebarProvider {
  resolveWebviewView(webviewView, context, _token) {
    webviewView.webview.html = `
      <!DOCTYPE html>
      <html>
      <body>
        <h1>Sidebar Works!</h1>
      </body>
      </html>
    `;
  }
}

module.exports = { SidebarProvider };