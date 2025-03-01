const vscode = require("vscode");
const cp = require("child_process");
const path = require("path");
const os = require("os");
const fs = require("fs");

let recordingProcess = null;

function startRecording(workspaceFolders) {
  if (recordingProcess) {
    vscode.window.showInformationMessage("Recording is already in progress.");
    return;
  }

  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage(
      "No workspace folder open to save the recording."
    );
    return;
  }

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
    recordingProcess = cp.exec(command, (error) => {
      if (error && error.signal !== "SIGINT") {
        vscode.window.showErrorMessage(`Recording failed: ${error.message}`);
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

function stopRecording(workspaceFolders) {
  if (!recordingProcess) {
    vscode.window.showErrorMessage("No active recording to stop.");
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outputFile = path.join(
    workspaceFolders[0].uri.fsPath,
    `recording-${timestamp}.wav`
  );

  recordingProcess.kill("SIGINT");
  recordingProcess = null;
  vscode.window.showInformationMessage(
    `Recording stopped and saved as ${outputFile}.`
  );
}

module.exports = {
  startRecording,
  stopRecording,
};
