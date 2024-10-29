# Smart AI Auto Form Filler 🚀

**Because life is too short to keep typing your email and phone number everywhere!** 😎

Say goodbye to repetitive typing with the Smart Form Filler extension! Just one click, and your forms magically fill themselves. Don’t worry if a field is missing—you’ll get a friendly prompt to add it, and next time, it’s like we always knew what you needed! 😉

## How It Works 🛠️

1. **Click the Icon** 🔘
   Kick things off with a single click on the extension icon. That’s it—you’re already halfway there!

2. **Behind the Scenes** 🎩
   `popup.js` taps `content.js` on the shoulder, whispering, “Hey, it’s showtime!”

3. **Fetching Data** 📂
   `content.js` gets busy, pulling all the good stuff from `storage.json` via our trusty server (`server.js`). If it finds a match, the form gets filled. 📝

4. **Missing Info? No Problem!** 😅
   Didn’t find what you were looking for? Our slick modal (`modal.html` + `modal.js`) pops up, politely asking for the missing deets. Fill it once, and next time, it’s there waiting for you!

5. **Storing Your Answers** 🗃️
   The new answers head straight to `storage.json` through `server.js`, safely stored for future forms and less hassle. Future you will thank you!

## Why You’ll Love It ❤️

- **Modular & Maintainable**: Organized like a dream, so each part works together smoothly.
- **Scalable**: Built to handle more features—because who knows what forms will throw at you next?
- **Time Saver**: One click, and you’re done. Enjoy the gift of time and avoid the agony of re-entering info.

Get ready to level up your form-filling game. 🥳

**Enjoy filling forms without the fuss!** 👋


```
smart-form-filler/
│
├── popup.js                 # Handles interactions within the popup (e.g., starting form-filling)
├── server.js                # Node.js server to store and update `storage.json` centrally
├── popup.html               # HTML for the extension's popup interface
├── README.md                # Documentation and setup instructions for the extension
├── style.css                # CSS styles for both modal and popup UI
├── manifest.json            # Defines extension properties, permissions, and script locations
├── modal.html               # HTML for the modal that captures user input for missing fields
├── content.js               # Main logic for form filling and interaction with OpenAI API and server
├── storage.json             # Central JSON for question-answer pairs (managed by `server.js`)
├── modal.js                 # Handles logic and interactions within the missing fields modal
└── icons/                   # Folder containing extension icons in different sizes
    ├── icon16.png           # 16x16 icon
    ├── icon48.png           # 48x48 icon
    └── icon128.png          # 128x128 icon for app and toolbar display
