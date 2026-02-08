import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Coffee, CheckCircle, AlertCircle, Loader2, List, RefreshCw } from 'lucide-react'
import './index.css' // Reuse main css for tailwind
import { LANGUAGES, TRANSLATIONS, getTranslation, detectLanguage } from './i18n'
import { testConnection, fetchModels } from './llmClient'

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
        model: 'gpt-4o',
        docUrl: 'https://platform.openai.com/api-keys'
    },
    deepseek: {
        baseUrl: 'https://api.deepseek.com',
        model: 'deepseek-chat',
        docUrl: 'https://platform.deepseek.com/api_keys'
    },
    google: {
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
        model: 'gemini-2.5-flash',
        docUrl: 'https://aistudio.google.com/app/apikey'
    },
    minimax: {
        baseUrl: 'https://api.minimax.chat/v1',
        model: 'abab5.5-chat',
        docUrl: 'https://platform.minimaxi.com/user-center/basic-information'
    },
    kimi: {
        baseUrl: 'https://api.moonshot.cn/v1',
        model: 'moonshot-v1-8k',
        docUrl: 'https://platform.moonshot.cn/console/api-keys'
    },
    zhipu: {
        baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
        model: 'glm-4',
        docUrl: 'https://open.bigmodel.cn/usercenter/apikeys'
    },
    tongyi: {
        baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        model: 'qwen-turbo-latest',
        docUrl: 'https://bailian.console.aliyun.com/?apiKey=1'
    },
    openrouter: {
        baseUrl: 'https://openrouter.ai/api/v1',
        model: 'openai/gpt-3.5-turbo',
        docUrl: 'https://openrouter.ai/keys'
    },
    custom: {
        baseUrl: '',
        model: '',
        docUrl: ''
    }
};

// URL Validation Helper
const isValidUrl = (url) => {
    if (!url) return true; // Empty is valid (will use default)
    try {
        new URL(url);
        return true;
    } catch {
        return false;
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
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState(null); // { success: boolean, msg: string }

    const [availableModels, setAvailableModels] = useState([]);
    const [isFetchingModels, setIsFetchingModels] = useState(false);
    const [fetchModelMsg, setFetchModelMsg] = useState('');
    const [showModelList, setShowModelList] = useState(false);
    const [urlError, setUrlError] = useState(false);

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
        // Security: Clear API key when switching providers to prevent accidental leakage
        setApiKey('');
        // Clear fetched models from previous provider
        setAvailableModels([]);
        setTestResult(null);
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

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestResult(null);
        try {
            await testConnection({
                apiKey,
                baseUrl,
                modelName
            });
            setTestResult({ success: true, msg: t('testSuccess') });
        } catch (error) {
            console.error(error);
            setTestResult({ success: false, msg: `${t('testFailed')}: ${error.message}` });
        } finally {
            setIsTesting(false);
        }
    };

    const handleFetchModels = async () => {
        setIsFetchingModels(true);
        setFetchModelMsg('');
        try {
            const models = await fetchModels({ apiKey, baseUrl });
            setAvailableModels(models);
            setFetchModelMsg(t('modelsFetched'));
            setTimeout(() => setFetchModelMsg(''), 3000);
        } catch (error) {
            console.error(error);
            setFetchModelMsg(t('error'));
        } finally {
            setIsFetchingModels(false);
        }
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
                            {DEFAULTS[provider]?.docUrl && (
                                <p className="text-xs mt-1">
                                    <a
                                        href={DEFAULTS[provider].docUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 w-fit"
                                    >
                                        {t('getApiKey')} &rarr;
                                    </a>
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('baseUrl')}</label>
                            <input
                                type="text"
                                value={baseUrl}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setBaseUrl(val);
                                    setUrlError(!isValidUrl(val));
                                }}
                                className={`w-full bg-white dark:bg-gray-700 border rounded-lg p-2 text-sm focus:ring-2 outline-none font-mono ${urlError
                                    ? 'border-red-400 dark:border-red-500 focus:ring-red-400'
                                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                                    }`}
                                placeholder="https://api.example.com/v1"
                            />
                            {urlError && (
                                <p className="text-xs text-red-500 mt-1">
                                    Invalid URL format
                                </p>
                            )}
                            {!urlError && (
                                <p className="text-xs text-gray-500 mt-1">
                                    {t('baseUrlHelp')}
                                    {provider === 'google' && " " + t('googleHelp')}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('modelName')}</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1 group">
                                    <input
                                        type="text"
                                        value={modelName}
                                        onChange={(e) => {
                                            setModelName(e.target.value);
                                            // Auto-open list on typing if not empty, or keep it open
                                        }}
                                        onFocus={() => setShowModelList(true)}
                                        onBlur={() => setTimeout(() => setShowModelList(false), 200)} // Delay to allow click
                                        className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                        placeholder="e.g. gpt-4o"
                                        autoComplete="off"
                                    />

                                    {/* Custom Dropdown */}
                                    {showModelList && availableModels.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                                            {availableModels
                                                .filter(m => {
                                                    if (!modelName) return true;
                                                    // Fuzzy match: query chars must appear in sequence
                                                    const query = modelName.toLowerCase();
                                                    const target = m.toLowerCase();
                                                    let i = 0;
                                                    for (let char of target) {
                                                        if (char === query[i]) i++;
                                                        if (i === query.length) return true;
                                                    }
                                                    return false;
                                                })
                                                .map((model) => (
                                                    <div
                                                        key={model}
                                                        title={model}
                                                        className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer font-mono truncate"
                                                        onMouseDown={(e) => {
                                                            e.preventDefault(); // Prevent blur
                                                            setModelName(model);
                                                            setShowModelList(false);
                                                        }}
                                                    >
                                                        {model}
                                                    </div>
                                                ))}
                                            {availableModels.filter(m => {
                                                if (!modelName) return true;
                                                const query = modelName.toLowerCase();
                                                const target = m.toLowerCase();
                                                let i = 0;
                                                for (let char of target) {
                                                    if (char === query[i]) i++;
                                                    if (i === query.length) return true;
                                                }
                                                return false;
                                            }).length === 0 && (
                                                    <div className="px-3 py-2 text-sm text-gray-400 dark:text-gray-500 italic">
                                                        No fuzzy matches found
                                                    </div>
                                                )}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={handleFetchModels}
                                    disabled={isFetchingModels || !apiKey}
                                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={t('fetchModels')}
                                >
                                    {isFetchingModels ? <Loader2 size={18} className="animate-spin" /> : <List size={18} />}
                                </button>
                            </div>
                            <div className="flex justify-between items-start mt-1">
                                <p className="text-xs text-gray-500">
                                    {t('modelHelp')}
                                </p>
                                {fetchModelMsg && (
                                    <span className="text-xs text-green-600 dark:text-green-400">{fetchModelMsg}</span>
                                )}
                            </div>
                        </div>

                        <div className="pt-1 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleTestConnection}
                                    disabled={isTesting || !apiKey}
                                    className={`text-xs flex items-center gap-1.5 px-2 py-1.5 rounded transition-colors
                                        ${isTesting || !apiKey
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                        }`}
                                >
                                    {isTesting ? (
                                        <Loader2 size={12} className="animate-spin" />
                                    ) : (
                                        <CheckCircle size={12} />
                                    )}
                                    <span className="font-medium">{isTesting ? t('testing') : t('testConnection')}</span>
                                </button>

                                {testResult && (
                                    <span className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${testResult.success ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20' : 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'}`}>
                                        {testResult.success ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                                        <span className="max-w-[150px] truncate" title={testResult.msg}>{testResult.msg}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 space-y-3">
                        <button
                            onClick={handleSave}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-medium transition-colors shadow-sm"
                        >
                            {t('save')}
                        </button>



                        <a
                            href="https://ko-fi.com/pony2026"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full bg-[#FF5E5B] hover:bg-[#FF413E] text-white py-2.5 rounded-lg font-medium transition-colors shadow-sm text-sm"
                        >
                            <Coffee size={16} fill="currentColor" />
                            {t('supportMe')}
                        </a>

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
