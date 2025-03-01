const vscode = require("vscode");
const voiceRecording = require("./src/voiceRecording");

function activate(context) {
  //Registering command for startRecording
  const startRecording = vscode.commands.registerCommand(
    "hintify.startRecording",
    () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      voiceRecording.startRecording(workspaceFolders);
    }
  );

  //Registering command for stopRecording
  const stopRecording = vscode.commands.registerCommand(
    "hintify.stopRecording",
    () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      voiceRecording.stopRecording(workspaceFolders);
    }
  );

  context.subscriptions.push(startRecording, stopRecording);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
