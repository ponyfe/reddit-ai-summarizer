# Chrome Web Store 上架指南

## 📦 已准备的文件

- **扩展包**: `reddit-ai-summarizer.zip` (587KB)
- **图标**: `public/icons/icon128.png` (商店展示用)

---

## 🚀 上架步骤

### 1. 注册开发者账号
- 访问 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- 需要支付 **$5 美元** 一次性注册费
- 使用 Google 账号登录

### 2. 创建新项目
1. 点击 **"New Item"**
2. 上传 `reddit-ai-summarizer.zip`

### 3. 填写商店信息

#### 基本信息
| 字段 | 内容 |
|------|------|
| **名称** | Reddit AI Summarizer |
| **简短描述** (132字符内) | Summarize Reddit threads instantly with AI. Supports OpenAI, DeepSeek, Google Gemini and more. |
| **详细描述** | 见下方 |

#### 详细描述 (复制使用)
```
🤖 Reddit AI Summarizer - Your AI-Powered Reading Assistant

Tired of scrolling through endless Reddit threads? Let AI summarize them for you!

✨ FEATURES:
• One-click AI summaries for any Reddit post
• Smart comment analysis with key points extraction
• Streaming response for real-time results
• Beautiful floating button with smooth animations
• Dark mode support
• Multi-language interface (English, 中文, 日本語, and more)

🔧 SUPPORTED AI PROVIDERS:
• OpenAI (GPT-4o, GPT-3.5)
• DeepSeek
• Google Gemini
• Anthropic Claude
• MiniMax
• Tongyi Qwen
• OpenRouter
• Or any OpenAI-compatible API

🔐 PRIVACY:
• Your API keys are stored locally
• No data sent to our servers
• All processing happens between you and your chosen AI provider

💡 HOW TO USE:
1. Install the extension
2. Open extension settings and configure your AI provider
3. Visit any Reddit post
4. Click the floating "AI Summary" button
5. Get an instant, comprehensive summary!

🌐 Perfect for:
• Busy professionals who want quick insights
• Researchers analyzing discussions
• Anyone who wants to save time on Reddit

Made with ❤️ for the Reddit community.
```

### 4. 上传截图和素材

#### 必需素材
| 类型 | 尺寸 | 数量 |
|------|------|------|
| **截图** | 1280x800 或 640x400 | 至少 1 张 (最多 5 张) |
| **小磁贴** | 440x280 | 1 张 |
| **大磁贴** | 920x680 | 1 张 (可选但推荐) |
| **宣传图片** | 1400x560 | 1 张 (可选) |

#### 截图建议
1. 📸 Reddit 页面上的悬浮按钮
2. 📸 AI 总结弹窗 (显示内容)
3. 📸 设置页面 (显示多语言和深色模式)
4. 📸 流式输出效果 (可选)

### 5. 分类和标签
- **类别**: Productivity
- **语言**: 选择所有支持的语言

### 6. 隐私政策
需要提供隐私政策 URL。可以使用:
- GitHub Pages 托管简单隐私政策
- 或使用在线生成器

#### 简单隐私政策模板
```
Privacy Policy for Reddit AI Summarizer

Last updated: [DATE]

This extension stores your API keys locally in your browser. 
We do not collect, transmit, or store any personal data on our servers.
All API calls are made directly from your browser to your chosen AI provider.

Contact: [YOUR_EMAIL]
```

### 7. 提交审核
- 点击 **"Submit for Review"**
- 审核通常需要 **1-3 个工作日**

---

## ⚠️ 注意事项

1. **manifest.json 描述**: 当前描述较短，可以保持不变或扩展
2. **版本号**: 当前为 `1.1.0`，后续更新需递增
3. **权限说明**: 审核时可能需要解释 `host_permissions` 的用途

---

## 🔗 有用链接

- [Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [发布文档](https://developer.chrome.com/docs/webstore/publish/)
- [截图指南](https://developer.chrome.com/docs/webstore/images/)
