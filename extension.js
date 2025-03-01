// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { SidebarProvider } = require('./src/sidebarProvider');
const { VoiceRegister } = require('./src/voiceRegister');
const contentRetriever = require('./src/contentRetrieval.js');
const TTS = require('./src/tts.js');
const dotenv = require('dotenv');
const path = require('path');

const voiceRecording = require("./src/voiceRecording");
const whisper = require("./src/wispher");


dotenv.config({ path: path.join(__dirname, '.env') });

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
	const sidebarProvider = new SidebarProvider(context);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
		  'hintify_sidebar_view',
		  sidebarProvider
		)
	  );


	// Start the file watcher
	contentRetriever.startFileWatcher();

	// Register a disposable to clean up the interval when the extension is deactivated
	context.subscriptions.push({
		dispose: () => {
			contentRetriever.stopFileWatcher();
		}
	});

	const tts = new TTS(process.env.OPENAI_KEY);
	tts.sendRequest('Hey Adarsh! You should take a break now!');

  const startRecording = vscode.commands.registerCommand(
    "hintify.startRecording",
    () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      voiceRecording.startRecording(workspaceFolders).then((filePath) => {
        if (filePath) {
          console.log("test");
          // Recording successful, send to Whisper
          whisper
            .transcribe(filePath)
            .then((transcript) => {
              if (transcript) {
                vscode.window.showInformationMessage(
                  "Transcription: " + transcript
                );
                // Optionally delete the wav file here
                voiceRecording.deleteRecording(filePath);
              } else {
                vscode.window.showErrorMessage("Failed to transcribe audio.");
                voiceRecording.deleteRecording(filePath); //delete wav file even if transciption fails.
              }
            })
            .catch((err) => {
              vscode.window.showErrorMessage(
                "Whisper API error: " + err.message
              );
              voiceRecording.deleteRecording(filePath); //delete wav file if whisper api errors.
            });
        }
      });
    }
  );

  const stopRecording = vscode.commands.registerCommand(
    "hintify.stopRecording",
    () => {
      voiceRecording.stopRecording(vscode.workspace.workspaceFolders);
    }
  );

  context.subscriptions.push(startRecording, stopRecording);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
