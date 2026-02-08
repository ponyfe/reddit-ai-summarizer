import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // Reuse main css for tailwind
import { LANGUAGES, TRANSLATIONS, getTranslation, detectLanguage } from './i18n'

const MODELS = [
    { id: 'openai', name: 'OpenAI (GPT-4o/3.5)' },
    { id: 'deepseek', name: 'DeepSeek' },
    { id: 'google', name: 'Google Gemini' },
    { id: 'minimax', name: 'Minimax' },
    { id: 'kimi', name: 'Kimi (Moonshot)' },
    { id: 'zhipu', name: 'Zhipu AI (GLM)' },
    { id: 'tongyi', name: 'Tongyi Qianwen (Qwen)' },
    { id: 'openrouter', name: 'OpenRouter' },
    { id: 'custom', name: 'Custom / Other' }
];

const DEFAULTS = {
    openai: {
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4o'
    },
    deepseek: {
        baseUrl: 'https://api.deepseek.com',
        model: 'deepseek-chat'
    },
    google: {
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
        model: 'gemini-1.5-flash'
    },
    minimax: {
        baseUrl: 'https://api.minimax.chat/v1',
        model: 'abab5.5-chat'
    },
    kimi: {
        baseUrl: 'https://api.moonshot.cn/v1',
        model: 'moonshot-v1-8k'
    },
    zhipu: {
        baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
        model: 'glm-4'
    },
    tongyi: {
        baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        model: 'qwen-turbo'
    },
    openrouter: {
        baseUrl: 'https://openrouter.ai/api/v1',
        model: 'openai/gpt-3.5-turbo'
    },
    custom: {
        baseUrl: '',
        model: ''
    }
};

function OptionsApp() {
    const [provider, setProvider] = useState('openai');
    const [apiKey, setApiKey] = useState('');
    const [baseUrl, setBaseUrl] = useState('');
    const [modelName, setModelName] = useState('gpt-3.5-turbo');
    const [theme, setTheme] = useState('system');
    const [language, setLanguage] = useState(detectLanguage());
    const [autoSummarize, setAutoSummarize] = useState(true);
    const [status, setStatus] = useState('');

    useEffect(() => {
        // Load settings
        chrome.storage.local.get(['llmSettings', 'theme', 'language', 'autoSummarize'], (result) => {
            if (result.llmSettings) {
                const savedProvider = result.llmSettings.provider || 'openai';
                setProvider(savedProvider);
                setApiKey(result.llmSettings.apiKey || '');

                const defaultSettings = DEFAULTS[savedProvider] || DEFAULTS['openai'];
                setBaseUrl(result.llmSettings.baseUrl || defaultSettings.baseUrl);
                setModelName(result.llmSettings.modelName || defaultSettings.model);
            } else {
                setBaseUrl(DEFAULTS['openai'].baseUrl);
                setModelName(DEFAULTS['openai'].model);
            }
            if (result.theme) setTheme(result.theme);
            if (result.language) setLanguage(result.language);
            if (result.autoSummarize !== undefined) setAutoSummarize(result.autoSummarize);
        });
    }, []);

    // Apply Theme to Document for Preview
    useEffect(() => {
        const root = document.documentElement;
        const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        if (isDark) root.classList.add('dark');
        else root.classList.remove('dark');
    }, [theme]);

    const handleProviderChange = (newProvider) => {
        setProvider(newProvider);
        if (DEFAULTS[newProvider]) {
            setBaseUrl(DEFAULTS[newProvider].baseUrl);
            setModelName(DEFAULTS[newProvider].model);
        }
    };

    const handleSave = () => {
        const settings = { provider, apiKey, baseUrl, modelName };
        chrome.storage.local.set({
            llmSettings: settings,
            theme: theme,
            language: language,
            autoSummarize: autoSummarize
        }, () => {
            setStatus(getTranslation(language, 'saved'));
            setTimeout(() => setStatus(''), 2000);
        });
    };

    const t = (key) => getTranslation(language, key);

    return (
        <div className="min-w-[350px] bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
            <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                <h1 className="text-xl font-bold mb-5 flex items-center gap-2">
                    ✨ Reddit AI Summary - {t('settingsTitle')}
                </h1>

                {/* Status Toast */}
                {status && (
                    <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg animate-in fade-in slide-in-from-top-2">
                        {status}
                    </div>
                )}

                <div className="space-y-6">

                    {/* Appearance & Locale */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('theme')}</label>
                            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 border border-gray-200 dark:border-gray-600">
                                {['system', 'light', 'dark'].map((currTheme) => (
                                    <button
                                        key={currTheme}
                                        onClick={() => setTheme(currTheme)}
                                        className={`flex-1 py-1.5 text-xs font-medium rounded-md capitalize transition-colors
                                            ${theme === currTheme
                                                ? 'bg-white dark:bg-gray-600 text-black dark:text-white shadow-sm'
                                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600/50'}
                                        `}
                                    >
                                        {t('themes')[currTheme] || currTheme}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('language')}</label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                {Object.entries(LANGUAGES).map(([code, name]) => (
                                    <option key={code} value={code}>{name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-span-full">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={autoSummarize}
                                    onChange={(e) => setAutoSummarize(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('autoSummarize')}</span>
                            </label>
                            <p className="text-xs text-gray-500 mt-1 ml-6">{t('autoSummarizeHelp')}</p>
                        </div>
                    </div>

                    {/* AI Configuration */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('provider')}</label>
                            <select
                                value={provider}
                                onChange={(e) => handleProviderChange(e.target.value)}
                                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                {MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('apiKey')}</label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                placeholder="sk-..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('baseUrl')}</label>
                            <input
                                type="text"
                                value={baseUrl}
                                onChange={(e) => setBaseUrl(e.target.value)}
                                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                placeholder="https://api.example.com/v1"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {t('baseUrlHelp')}
                                {provider === 'google' && " " + t('googleHelp')}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('modelName')}</label>
                            <input
                                type="text"
                                value={modelName}
                                onChange={(e) => setModelName(e.target.value)}
                                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                placeholder="e.g. gpt-4o"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {t('modelHelp')}
                            </p>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleSave}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-medium transition-colors shadow-sm"
                        >
                            {t('save')}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <OptionsApp />
    </StrictMode>,
)
