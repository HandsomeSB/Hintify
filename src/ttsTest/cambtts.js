const fs = require("fs");

const form = new FormData();
form.append("voice_name", "Gordon Ramsay");
form.append("gender", "0");
form.append("age", "58");
form.append("enhance_audio", "false");
form.append("file", fs.createReadStream("../assets/Gordon_Raw.mp3"));

const options = {
  method: 'POST',
  headers: {'x-api-key': '5a69767e-e7dc-4928-9a7a-6b45963bdc8e', 'Content-Type': 'multipart/form-data'}
};

options.body = form;

fetch('https://client.camb.ai/apis/create-custom-voice', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));