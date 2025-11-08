# 🧠 SynapseMind Clipper - Browser Extension

Save anything from the web directly to your SynapseMind collection!

## 📦 Installation Instructions

### Step 1: Add Extension Icons

You need 3 icon files (16x16, 48x48, 128x128 PNG images):
- `icon16.png` - Small icon
- `icon48.png` - Medium icon
- `icon128.png` - Large icon

**Quick way to create icons:**
1. Go to https://favicon.io/favicon-generator/
2. Create a simple icon with "SM" text and gradient background
3. Download and extract
4. Rename files to `icon16.png`, `icon48.png`, `icon128.png`
5. Place them in the `synapsemind-extension` folder

**Or use placeholders:**
- Just create any 3 PNG files with those names temporarily
- The extension will still work, just with basic icons

---

### Step 2: Load Extension in Chrome

1. **Open Chrome/Edge browser**

2. **Go to Extensions page:**
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`

3. **Enable "Developer mode"** (toggle in top-right corner)

4. **Click "Load unpacked"**

5. **Select the folder:**
   ```
   C:\Users\vansh\Favorites\Appointy Task Round\synapsemind-extension
   ```

6. **Extension installed!** You should see "SynapseMind Clipper" in your extensions list

---

### Step 3: Login to Extension

1. **Click the extension icon** in your browser toolbar (🧠 puzzle piece icon)

2. **Login with your SynapseMind credentials**
   - Email: your email
   - Password: your password

3. **You're ready to save!**

---

## 🎯 How to Use

### Method 1: Right-Click Context Menu
1. **Select any text** on a webpage
2. **Right-click** → "💾 Save to SynapseMind"
3. **Done!** Check your dashboard

### Method 2: Save Images
1. **Right-click on any image**
2. **Click** "💾 Save Image to SynapseMind"
3. **Image saved!**

### Method 3: Save Links
1. **Right-click on any link**
2. **Click** "💾 Save Link to SynapseMind"
3. **Link saved!**

### Method 4: Save Entire Page
1. **Right-click anywhere** on the page
2. **Click** "💾 Save Page to SynapseMind"
3. **Page saved with title and URL!**

### Method 5: Keyboard Shortcut (Quick Save)
1. **Select text**
2. **Press** `Ctrl+Shift+S` (or `Cmd+Shift+S` on Mac)
3. **Instant save!**

---

## ✨ Features

✅ **One-click saving** - Save from anywhere on the web
✅ **Auto-categorization** - AI detects content type
✅ **Smart metadata** - Captures title, URL, source
✅ **Multiple formats** - Text, images, links, pages
✅ **Real-time sync** - Instantly appears on dashboard
✅ **Keyboard shortcuts** - Quick save with `Ctrl+Shift+S`
✅ **Notifications** - Visual feedback for every save

---

## 🔧 Backend Setup

Make sure your backend is running:

```bash
cd backend
node server.js
```

Backend should be running on: `http://localhost:5000`

---

## 🐛 Troubleshooting

### "Please login first" notification
- Click extension icon and login with your credentials

### "Failed to connect to SynapseMind"
- Make sure backend server is running on port 5000
- Check if `http://localhost:5000/api/health` responds

### Extension not showing in toolbar
- Go to `chrome://extensions/`
- Make sure extension is enabled
- Click puzzle icon → Pin "SynapseMind Clipper"

### Right-click menu not showing
- Reload the webpage after installing extension
- Or disable and re-enable the extension

### CORS errors in console
- Backend already has CORS enabled for extensions
- If issues persist, restart backend server

---

## 🎨 Customization

You can customize the extension by editing:
- `popup.css` - Change colors, fonts, layout
- `background.js` - Modify context menu items
- `content-script.js` - Add custom keyboard shortcuts

---

## 📱 Works on These Sites

✅ YouTube, Twitter/X, Medium, Dev.to
✅ GitHub, Stack Overflow, Reddit
✅ News sites, blogs, documentation
✅ **ANY website on the internet!**

---

## 🚀 Next Steps

After installation:
1. Browse the web normally
2. When you find something interesting, right-click and save
3. Open your SynapseMind dashboard to see all saved items
4. AI automatically organizes and categorizes everything!

---

## 📝 Notes

- Extension uses your existing SynapseMind backend
- All data is saved to your MongoDB database
- Same AI processing as web/mobile uploads
- Login token is stored securely in browser storage
- Works offline - saves when connection restored

---

Enjoy seamless knowledge capture! 🧠✨
