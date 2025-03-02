// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const { SidebarProvider } = require("./src/sidebarProvider");
const { VoiceRegister } = require("./src/voiceRegister");
const contentRetriever = require("./src/contentRetrieval.js");
const TTS = require("./src/tts.js");
const dotenv = require("dotenv");
const path = require("path");
const openaiService = require("./src/services/openaiService.js");

const voiceRecording = require("./src/voiceRecording");
const whisper = require("./src/wispher");

dotenv.config({ path: path.join(__dirname, ".env") });

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {
  console.log('Congratulations, your extension "hintify" is now active!');

  const voiceRegister = VoiceRegister.INSTANCE;

  voiceRegister.addRecordingStartCallback(() => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    voiceRecording.startRecording(workspaceFolders).then((filePath) => {
      if (filePath) {
        console.log("test");
        // Recording successful, send to Whisper
        whisper
          .transcribe(filePath)
          .then((transcript) => {
            if (transcript) {
              // TODO: Send`transcript` variable to LLM for query
              // transcript.language contains the detected language.

              vscode.window.showInformationMessage(
                "Transcription: " + transcript.text
              );
              // Optionally delete the wav file here
              voiceRecording.deleteRecording(filePath);
            } else {
              vscode.window.showErrorMessage("Failed to transcribe audio.");
              voiceRecording.deleteRecording(filePath); //delete wav file even if transciption fails.
            }
          })
          .catch((err) => {
            vscode.window.showErrorMessage("Whisper API error: " + err.message);
            voiceRecording.deleteRecording(filePath); //delete wav file if whisper api errors.
          });
      }
    });
  });

  voiceRegister.addRecordingStopCallback(() => {
    voiceRecording.stopRecording(vscode.workspace.workspaceFolders);
  });

  context.subscriptions.push(
    vscode.commands.registerCommand("hintify.toggleTalk", () => {
      voiceRegister.toggleRecording();
    })
  );

  // Register the sidebar
  const sidebarProvider = new SidebarProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "hintify_sidebar_view",
      sidebarProvider
    )
  );

  openaiService.initialize();
  const tts = new TTS(process.env.OPENAI_KEY);

  // Start the file watcher
  contentRetriever.startFileWatcher();
  contentRetriever.addFileUpdateCallback(
    async (content, fileName, fileExtension) => {
      console.log("File content updated at:", fileName, fileExtension);
      console.log(content);

      if (openaiService.isConfigured()) {
        sidebarProvider.updateContent("Generating code hints...");
        const response = await openaiService.getCodeHints(
          content,
          fileName,
          fileExtension
        );
        console.log(response);
        sidebarProvider.updateContent("Code hints generated!");

        sidebarProvider.updateContent("Impersonating Gordon Ramsay...");
        const impersonateResponse = await openaiService.impersonate(
          "Gordon Ramsay",
          response
        );
        sidebarProvider.updateContent(impersonateResponse);

        // vscode.window.showInformationMessage('Impersonating...');
        // tts.sendRequest(impersonateResponse);
        // vscode.window.showInformationMessage('Playing audio...');
      } else {
        vscode.window.showErrorMessage("OpenAI not configured");
      }
    }
  );

  // Register a disposable to clean up the interval when the extension is deactivated
  context.subscriptions.push({
    dispose: () => {
      contentRetriever.stopFileWatcher();
    },
  });
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
