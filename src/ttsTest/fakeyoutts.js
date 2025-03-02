const FakeYou = require('fakeyou.js');
const fy = new FakeYou.Client({
    // token: 'anOptionalSecretToken',
    usernameOrEmail: 'zhuharri',
    password: 'dubgiv-bogvow-6fAccu'
});

async function init() {
  // await fy.start();

  const response = await fetch("https://api.fakeyou.com/v1/login", {
    method: "POST",
    body: JSON.stringify({
        username_or_email: "zhuharri",
        password: "dubgiv-bogvow-6fAccu",
    }),
  });

  const json = await response.json();

  console.log(response)
  // if (!json.success) {
  //   throw new Error("Authentication failed.");
  // }

  // const cookie = response.headers
  //   .get("set-cookie")
  //   ?.match(/^\w+.=([^;]+)/)
  //   ?.at(1);

  // return cookie;
}


init().then(async (cookie) => {
  // console.log('FakeYou initialized');
  // const response = await generateTTS();
  // console.log(response)

  // const headers = new Headers();

  // headers.append("content-type", "application/json");
  // headers.append("credentials", "include"); // IMPORTANT! Your cookie will not be sent without this!
  // headers.append("cookie", `session=${cookie}`); // Add the cookie

  // const response = await fetch("https://api.fakeyou.com/tts/inference'", {
  //     method: "POST",
  //     headers: headers,
  //     body: JSON.stringify({
  //       uuid_idempotency_token: "entropy",
  //       tts_model_token: "TM:7wbtjphx8h8v",
  //       inference_text: "Testing"
  //     }),
  // });

  // const json = await response.json();
  // console.log(json);
})
