const vscode = require('vscode');

class VoiceRegister {
  static INSTANCE = new VoiceRegister();

  constructor() {
    this._isRecording = false; // Use a private backing field
    this.recordingStartCallbackList = [];
    this.recordingStopCallbackList = [];
  }

  get isRecording() {
    return this._isRecording; // Getter to access the state
  }

  set isRecording(value) {
    if (this._isRecording !== value) { // Only proceed if the state changes
      this._isRecording = value; // Update the backing field
      if (value) {
        this.onRecordingStart(); // Call start callbacks if true
      } else {
        this.onRecordingStop(); // Call stop callbacks if false
      }
    }
  }

  toggleRecording() {
    this.isRecording = !this.isRecording; // Uses setter to flip state and trigger callbacks
  }

  onRecordingStop() {
    for (const callback of this.recordingStopCallbackList) {
      callback();
    }
  }

  onRecordingStart() {
    for (const callback of this.recordingStartCallbackList) {
      callback();
    }
  }

  addRecordingStartCallback(callback) {
    this.recordingStartCallbackList.push(callback);
  }

  addRecordingStopCallback(callback) {
    this.recordingStopCallbackList.push(callback);
  }
}

module.exports = { VoiceRegister };