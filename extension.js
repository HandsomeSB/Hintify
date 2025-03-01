// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { SidebarProvider } = require('./src/sidebarProvider');
const { VoiceRegister } = require('./src/voiceRegister');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "hintify" is now active!');

	const disposable = vscode.commands.registerCommand('hintify.helloWorld', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Hintify!');
	});
	context.subscriptions.push(disposable);

	const voiceRegister = VoiceRegister.INSTANCE;
	voiceRegister.addRecordingStartCallback(() => {
		vscode.window.showInformationMessage('Recording started');
	});
	voiceRegister.addRecordingStopCallback(() => {
		vscode.window.showInformationMessage('Recording stopped');
	});
	
	context.subscriptions.push(
		vscode.commands.registerCommand('hintify.toggleTalk', () => {
		  voiceRegister.toggleRecording();
		})
	);

	// Register the sidebar
	const sidebarProvider = new SidebarProvider();
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
		  'hintify_sidebar_view',
		  sidebarProvider
		)
	  );
	
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
