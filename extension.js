// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const contentRetriever = require('./src/contentRetrieval.js');

let fileWatcherInterval = null;
let currentFileContent = '';
let lastUpdateTime = null;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "hintify" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('hintify.helloWorld', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Hintify!');
	});

	context.subscriptions.push(disposable);
	vscode.window.registerWebviewViewProvider('hintify_sidebar_view', new SidebarViewProvider());

	// Start the file watcher
	contentRetriever.startFileWatcher();
	
	// Register a disposable to clean up the interval when the extension is deactivated
	context.subscriptions.push({
		dispose: () => {
			contentRetriever.stopFileWatcher();
		}
	});
}

// Remove the old startFileWatcher function as it's now in contentRetrieval.js

class SidebarViewProvider {
	resolveWebviewView(webviewView) {
	  webviewView.webview.options = {
		enableScripts: true
	  };
  
	  webviewView.webview.html = `
		<html>
		  <body>
			<h2>Hello from Sidebar</h2>
			<p>This is your custom sidebar.</p>
		  </body>
		</html>
	  `;
	}
  }

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
