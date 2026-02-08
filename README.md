# 🤖 Reddit AI Summarizer

<p align="center">
  <img src="public/icons/icon128.png" alt="Reddit AI Summarizer" width="128" height="128">
</p>

<p align="center">
  <strong>AI-powered Chrome extension that summarizes Reddit threads instantly</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#supported-providers">Providers</a> •
  <a href="#development">Development</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Built%20with-Vibe%20Coding-blueviolet?style=for-the-badge" alt="Built with Vibe Coding">
  <img src="https://img.shields.io/badge/Powered%20by-Antigravity-orange?style=for-the-badge" alt="Powered by Antigravity">
</p>

> **🎵 Vibe Coding Project**  
> This entire project was built using **vibe coding** with [Antigravity](https://deepmind.google/) — **zero lines of code were written manually**. Every file, feature, and fix was generated through natural language conversations with AI.

---

## ✨ Features

- 🚀 **One-Click Summaries** - Instantly summarize any Reddit post and comments
- 🔄 **Streaming Response** - Watch AI generate summaries in real-time
- 🎨 **Beautiful UI** - Animated floating button with smooth transitions
- 🌙 **Dark Mode** - Automatic theme detection with manual override
- 🌍 **Multi-Language** - Supports 11 languages including English, 中文, 日本語
- 🔐 **Privacy First** - API keys stored locally, no data sent to third parties
- ⚡ **Auto-Summarize** - Optionally summarize pages automatically on load

## 🖼️ Screenshots

<!-- Add your screenshots here -->
| Floating Button | Summary Panel | Settings |
|:---------------:|:-------------:|:--------:|
| ![Button](https://via.placeholder.com/200x150) | ![Panel](https://via.placeholder.com/200x150) | ![Settings](https://via.placeholder.com/200x150) |

## 📦 Installation

### From Chrome Web Store
*Coming soon*

### Manual Installation (Developer Mode)

1. Clone this repository:
   ```bash
   git clone https://github.com/ponyfe/reddit-ai-summarizer.git
   cd reddit-ai-summarizer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable **Developer mode** (top right)
   - Click **Load unpacked**
   - Select the `dist` folder

## 🔧 Supported Providers

| Provider | Models | API Docs |
|----------|--------|----------|
| **OpenAI** | GPT-4o, GPT-3.5-turbo | [Platform](https://platform.openai.com/api-keys) |
| **DeepSeek** | DeepSeek-Chat | [Platform](https://platform.deepseek.com/api_keys) |
| **Google** | Gemini 2.5 Flash | [AI Studio](https://aistudio.google.com/app/apikey) |
| **Anthropic** | Claude 3.5 | [Console](https://console.anthropic.com/settings/keys) |
| **MiniMax** | abab6.5s-chat | [Platform](https://platform.minimaxi.com/user-center/basic-information/interface-key) |
| **Tongyi** | Qwen-Turbo | [Bailian](https://bailian.console.aliyun.com/?apiKey=1) |
| **OpenRouter** | Multiple | [Keys](https://openrouter.ai/keys) |
| **Custom** | Any OpenAI-compatible API | - |

## 🚀 Quick Start

1. **Install** the extension
2. **Click** the extension icon to open settings
3. **Select** your AI provider
4. **Enter** your API key
5. **Visit** any Reddit post
6. **Click** the floating "AI Summary" button
7. **Enjoy** your instant summary! 🎉

## 💻 Development

### Tech Stack
- **React 18** - UI components
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Lucide Icons** - Icon library
- **Chrome Extension Manifest V3**

### Scripts

```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure

```
reddit-ai-summarizer/
├── src/
│   ├── content.jsx      # Content script entry
│   ├── Overlay.jsx      # Main UI overlay component
│   ├── options.jsx      # Settings page
│   ├── llmClient.js     # LLM API integration
│   ├── extractor.js     # Reddit content extraction
│   ├── i18n.js          # Internationalization
│   ├── background.js    # Service worker
│   └── manifest.json    # Extension manifest
├── public/
│   └── icons/           # Extension icons
├── dist/                # Build output
└── package.json
```

## 🌍 Supported Languages

- 🇺🇸 English
- 🇨🇳 简体中文
- 🇪🇸 Español
- 🇩🇪 Deutsch
- 🇫🇷 Français
- 🇯🇵 日本語
- 🇵🇹 Português
- 🇸🇦 العربية
- 🇷🇺 Русский
- 🇮🇳 हिन्दी
- 🇰🇷 한국어

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 💖 Support

If you find this extension helpful, consider:
- ⭐ Starring this repository
- 🐛 Reporting bugs or suggesting features
- ☕ [Supporting on Ko-fi](https://ko-fi.com/pony2026)

---

<p align="center">
  Made with ❤️ for the Reddit community
</p>
