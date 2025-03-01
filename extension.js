const vscode = require("vscode");
const cp = require("child_process");
const path = require("path");
const os = require("os");

let recordingProcess = null;

function activate(context) {
  // Register the Start Recording command
  const startRecording = vscode.commands.registerCommand(
    "hintify.startRecording",
    () => {
      if (recordingProcess) {
        vscode.window.showInformationMessage(
          "Recording is already in progress."
        );
        return;
      }

      // Check for an open workspace
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage(
          "No workspace folder open to save the recording."
        );
        return;
      }

      // Generate a unique filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const outputFile = path.join(
        workspaceFolders[0].uri.fsPath,
        `recording-${timestamp}.wav`
      );

      // Determine the platform and set the recording command
      const platform = os.platform();
      let command;

      if (platform === "win32") {
        // Windows: Use ffmpeg with DirectShow
        command = `ffmpeg -f dshow -i audio="Microphone" -y "${outputFile}"`;
      } else if (platform === "darwin" || platform === "linux") {
        // macOS and Linux: Use sox
        command = `sox -d "${outputFile}"`;
      } else {
        vscode.window.showErrorMessage("Unsupported platform for recording.");
        return;
      }

      try {
        // Start the recording process
        recordingProcess = cp.exec(command, (error) => {
          if (error && error.signal !== "SIGINT") {
            vscode.window.showErrorMessage(
              `Recording failed: ${error.message}`
            );
          }
        });
        vscode.window.showInformationMessage("Recording started...");
      } catch (error) {
        if (error.code === "ENOENT") {
          vscode.window.showErrorMessage(
            "Recording tool not found. Please install ffmpeg (Windows) or sox (macOS/Linux)."
          );
        } else {
          vscode.window.showErrorMessage(
            `Failed to start recording: ${error.message}`
          );
        }
      }
    }
  );

  // Register the Stop Recording command
  const stopRecording = vscode.commands.registerCommand(
    "hintify.stopRecording",
    () => {
      if (!recordingProcess) {
        vscode.window.showErrorMessage("No active recording to stop.");
        return;
      }

      // Stop the recording by sending SIGINT
      recordingProcess.kill("SIGINT");
      recordingProcess = null;
      vscode.window.showInformationMessage("Recording stopped and saved.");
    }
  );

  // Add commands to the extension context
  context.subscriptions.push(startRecording, stopRecording);
}

/**
 * Deactivates the extension.
 */
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};

// Recording failed: Command failed: sox -d "/Users/adarshsharma/CS/college/CSC-161/Homeworks/HW2-Rock-Paper-Scissors/recording-2025-03-01T08-58-09-363Z.wav" /bin/sh: sox: command not found
