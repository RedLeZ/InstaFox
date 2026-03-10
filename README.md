<div align="center">

# 🦊 InstaFox

**Full Instagram Desktop Experience for Firefox Users**

[![Firefox](https://img.shields.io/badge/Firefox-FF7139?style=for-the-badge&logo=Firefox-Browser&logoColor=white)](https://www.mozilla.org/firefox/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=for-the-badge)](https://github.com/redlez/instafox)

*Built out of necessity, designed with privacy in mind.*

</div>

---

## Why InstaFox?

As a Firefox user who primarily works on desktop rather than mobile devices, I needed access to Instagram's full feature set without switching browsers or devices. The web interface has limited functionality, and existing solutions weren't available for Firefox.

InstaFox brings Instagram's complete desktop experience to Firefox users through a lightweight, privacy-focused extension.

### What This Project Demonstrates

- **Practical Problem Solving** - Building real solutions for genuine user needs
- **Modern Web Standards** - Manifest V3 architecture, vanilla JavaScript
- **Privacy-First Design** - Local processing, no external servers, open-source
- **User Experience** - Seamless integration with Instagram's native interface
- **Browser Extension Development** - Working with Firefox's WebExtensions API

---

## ✨ Features

- 📸 **Image Stories** - Upload images directly from desktop
- 🎥 **Video Stories** - Post videos with automatic thumbnail generation
- 🖼️ **Native Integration** - Feels like part of Instagram, not a plugin
- 🔐 **Privacy-Focused** - All processing happens locally in your browser
- ⚡ **Lightweight** - Minimal footprint, maximum performance
- 🎨 **Clean UI** - Modern dark theme with smooth animations

---

## 🚀 Quick Start

### Installation

1. **Download the Extension**
   ```bash
   git clone https://github.com/redlez/instafox.git
   cd instafox
   ```

2. **Load in Firefox**
   - Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
   - Click **"Load Temporary Add-on..."**
   - Select the `manifest.json` file from the InstaFox folder

3. **Start Using**
   - Visit [instagram.com](https://instagram.com) and log in
   - Look for the **InstaFox button** in the top-right corner
   - Click to start creating stories!

### Usage

1. Click the **InstaFox button** (🦊) in the top-right corner on Instagram
2. Select **"Story"** from the dropdown menu
3. Choose your image or video
4. Add a caption (optional)
5. Toggle **Close Friends** if desired
6. Click **"Post Story"** - Done! ✅

---

## 🛠️ Technical Architecture

Built with modern web technologies:

- **Manifest V3** - Latest Firefox extension standard
- **Vanilla JavaScript** - No dependencies, pure performance
- **HTML5 Canvas** - Local video thumbnail generation
- **Web APIs** - Direct integration with Instagram's interface

### Project Structure

```
InstaFox/
├── manifest.json          # Extension configuration
├── background/            # Service worker & background tasks
├── content/              # Instagram page integration
│   ├── inject.js         # Main API interaction logic
│   ├── content.js        # Content script bridge
│   └── styles.css        # UI styling
├── icons/                # Extension icons
└── ui/                   # Extension popup interface
```

---

## 🔒 Privacy & Security

InstaFox is built with privacy as a core principle:

- **No Data Collection** - We don't collect, store, or transmit any user data
- **Local Processing** - All operations happen in your browser
- **Open Source** - Code is publicly available for review
- **No External Servers** - Direct browser-to-Instagram communication only

---

## Technical Considerations

**Browser Compatibility:**
- Requires Firefox 109+ (Manifest V3 support)
- Works with existing Instagram login session

**Development Status:**
- Core features: Image/video stories ✅
- In progress: Multi-photo posts, scheduling features

**Known Limitations:**
- Extension must be reloaded after Firefox restarts (unsigned extension limitation)
- Video thumbnails are auto-generated from the first frame

---

## 🗺️ Roadmap

- [x] Image story support
- [x] Video story support
- [x] Close friends sharing
- [ ] Multi-photo carousel posts
- [ ] Draft saving functionality
- [ ] Scheduled posting
- [ ] Firefox Add-ons store submission
- [ ] Enhanced video processing options

---

## 🤝 Contributing

This is an open-source project built for the Firefox community. Contributions welcome!

- 🐛 Report bugs
- 💡 Suggest features
- 🔧 Submit pull requests
- ⭐ Star this repo

---

## 📄 License

MIT License - Free and open source forever.

---

## 👨‍💻 Author

**RedLeZ**

Built with ❤️ for Firefox users who need desktop-first workflows.

- GitHub: [@redlez](https://github.com/redlez)

---

<div align="center">

**If you find InstaFox useful, please consider giving it a ⭐!**

[Report Bug](https://github.com/redlez/instafox/issues) · [Request Feature](https://github.com/redlez/instafox/issues)

**Note:** This extension enhances Instagram's web interface functionality. Users should ensure their usage aligns with Instagram's community guidelines.

</div>
