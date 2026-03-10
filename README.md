<div align="center">
  
# 🦊 InstaFox

**Post Instagram Stories from Firefox Desktop**

[![Firefox](https://img.shields.io/badge/Firefox-FF7139?style=for-the-badge&logo=Firefox-Browser&logoColor=white)](https://www.mozilla.org/firefox/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=for-the-badge)](https://github.com/redlez/instafox)

*A powerful Firefox extension that brings Instagram Stories creation to your desktop without compromising on features.*

</div>

---

## Why Was It Made

I've always had issues with Instagram on desktop, and as a Firefox user who doesn't use phones, I found that Inssist has a paywall for mundane features I need. So I took it into my own hands to create this extension for Firefox users (and maybe Chromium users if I finish this one). It will be free and open source forever.

## ✨ Features

- **📸 Image Stories** - Upload images directly to Instagram Stories from desktop
- **🎥 Video Stories** - Post video stories with automatic thumbnail generation
- **🖼️ Native Integration** - Seamlessly integrated into Instagram's interface
- **🔐 Secure** - Uses Instagram's official API endpoints with proper authentication
- **⚡ Fast & Lightweight** - Minimal footprint, maximum performance
- **🎨 Modern UI** - Clean, intuitive interface matching Instagram's design language

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
5. Click **"Publish"** - Done! ✅

## 📋 Requirements

- **Firefox** 109 or later (Manifest V3 support)
- **Instagram Account** (personal or business)
- **Active Internet Connection**

## 🛠️ Technical Details

### Built With

- **Manifest V3** - Modern extension architecture
- **Vanilla JavaScript** - No dependencies, pure performance
- **Instagram Rupload API** - Official upload endpoints
- **HTML5 Canvas** - Video thumbnail generation

### Architecture

```
InstaFox/
├── manifest.json          # Extension configuration
├── background/            # Service worker & background tasks
├── content/              # Instagram page integration
│   ├── inject.js         # Main API interaction logic
│   ├── content.js        # Content script bridge
│   └── styles.css        # UI styling
├── icons/                # Extension icons
└── ui/                   # Additional UI components
```

## 🔒 Privacy & Security

- **No Data Collection** - We don't collect or store any user data
- **Local Processing** - All operations happen on your device
- **Direct Communication** - Talks directly to Instagram's servers
- **No Third-Party Services** - Zero external dependencies

## ⚠️ Disclaimer

This extension uses Instagram's internal web API endpoints. While it mimics the behavior of Instagram's own web interface:

- Use at your own risk
- Instagram's Terms of Service apply
- Not affiliated with or endorsed by Meta/Instagram
- For educational and personal use

## 🐛 Known Issues

- Extension must be reloaded after Firefox restarts (unsigned extension limitation)
- Video thumbnails are auto-generated from the first frame

## 🗺️ Roadmap

- [x] Image story support
- [x] Video story support
- [ ] Close friends sharing
- [ ] Firefox Add-ons store submission
- [ ] Scheduled post support
- [ ] Draft saving functionality
- [ ] Multi-photo carousel posts
- [ ] Story templates & filters

## 🤝 Contributing

Contributions are welcome! Feel free to:

- 🐛 Report bugs
- 💡 Suggest new features  
- 🔧 Submit pull requests
- ⭐ Star this repository

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**RedLeZ**

- GitHub: [@redlez](https://github.com/redlez)
- Made with ❤️ for the Firefox community

---

<div align="center">

**If you find InstaFox useful, please consider giving it a ⭐!**

[Report Bug](https://github.com/redlez/instafox/issues) · [Request Feature](https://github.com/redlez/instafox/issues)

</div>
   - **Post Story** - Posts immediately
   - **Save as Draft** - Saves for later
   - **Schedule** - Set a future date/time

### Creating a Multi-Photo Post

1. Click the **"Create Post"** button
2. Select multiple photos
3. Add a caption
4. Post, save as draft, or schedule

### Managing Drafts & Scheduled Posts

Click the extension icon in the toolbar to:
- View drafts
- Check scheduled posts
- See your posting analytics

## Important Notes

### 📸 Supported Content

- **Images**: JPEG, PNG, WebP formats
- **Videos**: MP4 format with automatic cover generation
- **Caption**: Optional text caption for stories
- **Close Friends**: Share exclusively with your close friends list

### 🔒 Privacy & Security

- This extension runs locally in your browser
- No data is sent to external servers (except Instagram)
- Drafts and analytics are stored in browser local storage
- Your Instagram credentials are never accessed by the extension
- The extension relies on your existing Instagram login session

### ⚡ Limitations

- **Scheduling only works when browser is running** - Uses browser.alarms API which requires Firefox to be open
- **Drafts stored locally** - Not synced across devices
- **Instagram detection** - Instagram may detect and block automated behavior
- **API changes** - Instagram frequently updates their API, which may break functionality

## Technical Architecture

```
InstaFox/
├── manifest.json              # Extension configuration
├── background/
│   └── service-worker.js      # Background tasks, scheduling, analytics
├── content/
│   ├── inject.js              # UI injection and Instagram API interaction
│   ├── content.js             # Content script bridge
│   └── styles.css             # UI styling
├── ui/
│   ├── popup.html             # Extension icon popup
│   └── popup.js               # Popup logic
├── utils/
│   ├── storage.js             # Storage helper functions
│   └── instagram-api.js       # Instagram API abstraction (needs implementation)
└── icons/                     # Extension icons (placeholders)
```

### How It Works

1. **UI Injection**: The content script detects Instagram's interface and injects the InstaFox button and story creation modal
2. **File Handling**: When you upload files, they're processed locally in your browser
3. **Direct API Calls**: Communicates directly with Instagram's rupload API endpoints using your existing session
4. **Local Storage**: Drafts and analytics are stored in browser local storage
5. **Scheduling**: Uses browser.alarms API to trigger posts at scheduled times

## Development Roadmap

### ✅ Phase 1: Foundation (COMPLETED)
- [x] Extension skeleton with Manifest V3
- [x] Content script injection
- [x] Basic UI modals
- [x] Direct API integration

### ✅ Phase 2: API Integration (COMPLETED)
- [x] Reverse-engineer Instagram's story API
- [x] Implement image upload functionality
- [x] Implement video upload functionality
- [x] Error handling and user feedback

### 📋 Phase 3: Enhanced Features (PLANNED)
- [ ] Multi-photo carousel support (backend)
- [ ] Scheduling system refinement
- [ ] Drafts management panel
- [ ] Analytics dashboard
- [ ] Settings page

### 🎨 Phase 4: Polish (PLANNED)
- [ ] Better UI/UX
- [ ] Loading states
- [ ] Proper error messages
- [ ] Extension icons design
- [ ] Documentation

## Troubleshooting

### Extension doesn't appear on Instagram
- Make sure you're on instagram.com (not the login page)
- Check the browser console for errors (F12)
- Try reloading the page
- Verify extension is enabled in about:debugging

### "Create Story" button not working
- Check if you're logged into Instagram
- Verify the extension has the right permissions
- Look for console errors

### Story/Post upload fails
- **This is expected** - API integration is not yet implemented
- See "API Integration Required" section above

## Contributing

This is currently a personal project, but contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Legal & Disclaimer

⚠️ **Important:**
- This extension uses Instagram's private/undocumented API
- Instagram's Terms of Service may prohibit automated posting
- Use at your own risk - your account could be flagged or banned
- This is an educational project demonstrating browser extension capabilities
- Not affiliated with Meta/Instagram

## License

MIT License - See LICENSE file for details

## Credits

Created as an alternative to the Inssist Chrome extension, bringing enhanced Instagram features to Firefox users.

---

**Note:** This extension is in active development. Some features are not yet fully implemented. Check the roadmap above for current status.
