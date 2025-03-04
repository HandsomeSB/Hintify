## Hintify

While everyone is thinking about creating apps in just one prompt, we are thinking of how to be better developers. Hintify, unlike other AI tools won't give you direct code to your needs. Instead, it gives you hints about your logic error in code and then <b>you figure the error out!</b>

### Demo

[![Watch the video](https://img.youtube.com/vi/9PYLV_zN6wg/0.jpg)](https://www.youtube.com/watch?v=9PYLV_zN6wg)

### Key Features

- _Code help_: We scrape your active session code and give you hints on what's wrong with your code. Be it logical or compile time error.
- _Voice Query_: While it will gives you suggestions every minute, you have the ability to query it anytime you want.

- _Language Support_: You can talk to it 90+ languages.

Stuck on how to write a binary search? **Ask it and get a response in Mickey Mouse, Yoda and more voices**

### Dependencies

&#x2610; axios \
&#x2610; dotenv \
&#x2610; elevenlabs \
&#x2610; openai

### Locally installed dependencies

&#x2610; sox \
&#x2610; afplay (Mac Specific, comes pre-installed)

### Running Hintify Locally

Follow these steps to set up and run the **Hintify** VS Code extension on your computer.

### 1. Clone the GitHub repo

```sh
git clone git@github.com:HandsomeSB/Hintify.git
cd Hintify
```

### 2. Install npm packages

```sh
npm install
```

### 3. Install local dependencies

#### Mac

```sh
brew install sox
```

#### Windows

- Download and install [Sox](http://sox.sourceforge.net/).
- Add Sox to your system's PATH environment variable.

### 4. Open the project in VS Code

```sh
code .
```

### 5. Add .env file and API keys

create a .env file in the project root directory and add `elevenlabs` and `openai` api keys.

```sh
OPENAI_KEY=
ELEVEN_KEY=
```

### 6. Run the extension in VS Code's Extension Host

```sh
npm run test
```

Alternatively, press `F5` in VS Code to start a new Extension Development Host window.

### Usage

- Once installed, Hintify runs automatically in the background.
- Click on the Hintify's icon on the left pane to bring up the Hintify panel.
- Press the Push to talk Button and start conversing with Mickey Mouse, your personal coding Buddy
