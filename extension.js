const vscode = require("vscode");
const cp = require("child_process");
const path = require("path");
const os = require("os");
const fs = require("fs");

let recordingProcess = null;

/**
 * Activates the extension and registers the commands.
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Hardcoded path to sox for macOS/Linux
  const soxPath = "/opt/homebrew/bin/sox";

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
        // Windows: Use ffmpeg (assumes it's in PATH)
        command = `ffmpeg -f dshow -i audio="Microphone" -y "${outputFile}"`;
      } else if (platform === "darwin" || platform === "linux") {
        // macOS and Linux: Use hardcoded sox path
        command = `${soxPath} -d "${outputFile}"`;
        // Check if sox exists at the hardcoded path
        if (!fs.existsSync(soxPath)) {
          vscode.window.showErrorMessage(
            'sox not found at /opt/homebrew/bin/sox. Please install it using "brew install sox".'
          );
          return;
        }
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
            `Recording tool not found. Ensure ${
              platform === "win32" ? "ffmpeg" : "sox"
            } is installed.`
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

      const workspaceFolders = vscode.workspace.workspaceFolders;
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

      const outputFile = path.join(
        workspaceFolders[0].uri.fsPath,
        `recording-${timestamp}.wav`
      );
      // Stop the recording by sending SIGINT
      recordingProcess.kill("SIGINT");
      recordingProcess = null;
      vscode.window.showInformationMessage(
        `Recording stopped and saved as ${outputFile}.`
      );
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
