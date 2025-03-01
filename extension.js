const vscode = require("vscode");
const voiceRecording = require("./src/voiceRecording");
const whisper = require("./src/wispher");

function activate(context) {
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

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
