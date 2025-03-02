const vscode = require("vscode");
const cp = require("child_process");
const path = require("path");
const os = require("os");
const fs = require("fs").promises; // Use promises for async file operations

let recordingProcess = null;

async function startRecording(workspaceFolders) {
  return new Promise((resolve, reject) => {
    // Checking if the recording is already in progress.
    if (recordingProcess) {
      vscode.window.showInformationMessage("Recording is already in progress.");
      resolve(null);
      return;
    }

    // Checking if you have a project open.
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage(
        "No workspace folder open to save the recording."
      );
      resolve(null); // Return null to indicate failure
      return;
    }

    //Naming convention for the file.
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const outputFile = path.join(
      workspaceFolders[0].uri.fsPath,
      `recording-${timestamp}.wav`
    );

    const platform = os.platform();
    let command;
    const soxPath = "/opt/homebrew/bin/sox"; // Hardcoded sox path

    if (platform === "win32") {
      command = `ffmpeg -f dshow -i audio="Microphone" -y "${outputFile}"`;
    } else if (platform === "darwin" || platform === "linux") {
      command = `${soxPath} -d "${outputFile}"`;
    } else {
      vscode.window.showErrorMessage("Unsupported platform for recording.");
      // Return null to indicate failure
      resolve(null);
      return;
    }

    try {
      recordingProcess = cp.exec(command, (error) => {
        if (error && error.signal !== "SIGINT") {
          vscode.window.showErrorMessage(`Recording failed: ${error.message}`);
          // Return null to indicate failure
          resolve(null);
          return;
        }
        resolve(outputFile); // Resolve with the file path when recording is done.
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
      resolve(null); // Return null to indicate failure
    }
  });
}

// Stop Recording Function
function stopRecording(workspaceFolders) {
  if (!recordingProcess) {
    vscode.window.showErrorMessage("No active recording to stop.");
    return;
  }

  recordingProcess.kill("SIGINT");
  recordingProcess = null;
  vscode.window.showInformationMessage("Recording stopped.");
}

async function deleteRecording(filePath) {
  try {
    await fs.unlink(filePath);
    console.log(`Deleted file: ${filePath}`);
  } catch (err) {
    console.error(`Error deleting file: ${filePath}`, err);
  }
}

module.exports = {
  startRecording,
  stopRecording,
  deleteRecording,
};
