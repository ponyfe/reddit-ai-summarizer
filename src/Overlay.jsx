import { useState, useEffect, useRef } from 'react'
import Markdown from 'react-markdown'
import { generateSummary } from './llmClient'
import {
    Minimize2, Settings as SettingsIcon, RefreshCw,
    MessageSquareText, CheckCircle2, AlertCircle, Loader2,
    Sun, Moon, Monitor, User
} from 'lucide-react'
import { getTranslation, detectLanguage } from './i18n'

export function Overlay() {
    const [isExpanded, setExpanded] = useState(false);

    const [data, setData] = useState(null);
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState(null);
    const [settings, setSettings] = useState({});

    // Theme & Language Management
    const [themeConfig, setThemeConfig] = useState('system');
    const [isDark, setIsDark] = useState(true);
    const [language, setLanguage] = useState(detectLanguage());
    const [autoSummarize, setAutoSummarize] = useState(true);

    // Scroll Management
    const scrollRef = useRef(null);
    const shouldAutoScrollRef = useRef(true);

    const status = error ? 'error' : (loading || analyzing) ? 'loading' : (summary ? 'success' : 'idle');

    useEffect(() => {
        loadSettings();

        const isPostPage = window.location.pathname.includes('/comments/');
        if (isPostPage) {
            // Wait for settings to load before deciding to auto-start
        }

        const changeListener = (changes) => {
            if (changes.theme) setThemeConfig(changes.theme.newValue);
            if (changes.language) setLanguage(changes.language.newValue);
            if (changes.llmSettings) setSettings(changes.llmSettings.newValue || {});
            if (changes.autoSummarize !== undefined) setAutoSummarize(changes.autoSummarize.newValue);
        };
        chrome.storage.onChanged.addListener(changeListener);

        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isExpanded) {
                setExpanded(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            chrome.storage.onChanged.removeListener(changeListener);
            document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isExpanded]); // Re-bind ESC listener if expansion changes, though technically not strictly equivalent to one-shot init. Better: just verify isExpanded in ref or dependency.

    // Better ESC handling: use dependency or ref. Accessing state in listener requires dependency.

    // Theme Effect
    useEffect(() => {
        const computeTheme = () => {
            if (themeConfig === 'system') {
                return window.matchMedia('(prefers-color-scheme: dark)').matches;
            }
            return themeConfig === 'dark';
        };

        const updateTheme = () => setIsDark(computeTheme());
        updateTheme();

        if (themeConfig === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', updateTheme);
            return () => mediaQuery.removeEventListener('change', updateTheme);
        }
    }, [themeConfig]);

    // Smart Auto-Scroll Effect
    useEffect(() => {
        if (isExpanded && shouldAutoScrollRef.current && scrollRef.current) {
            const el = scrollRef.current;
            el.scrollTop = el.scrollHeight;
        }
    }, [summary, isExpanded, analyzing, loading]);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
        shouldAutoScrollRef.current = isAtBottom;
    };

    const loadSettings = () => {
        chrome.storage.local.get(['llmSettings', 'theme', 'language', 'autoSummarize'], (result) => {
            setSettings(result.llmSettings || {});
            setThemeConfig(result.theme || 'system');
            setLanguage(result.language || 'en');

            const autoSum = result.autoSummarize !== undefined ? result.autoSummarize : true;
            setAutoSummarize(autoSum);

            // Trigger auto-start only if on post page AND auto-summarize is ON AND we haven't fetched yet
            const isPostPage = window.location.pathname.includes('/comments/');
            if (isPostPage && autoSum && !data && !loading && !analyzing && !summary) {
                handleAutoStart();
            }
        });
    };

    const cycleTheme = () => {
        const modes = ['system', 'light', 'dark'];
        const nextIndex = (modes.indexOf(themeConfig) + 1) % modes.length;
        const nextTheme = modes[nextIndex];

        setThemeConfig(nextTheme);
        chrome.storage.local.set({ theme: nextTheme });
    };

    const getThemeIcon = () => {
        if (themeConfig === 'system') return <Monitor size={18} />;
        if (themeConfig === 'light') return <Sun size={18} />;
        return <Moon size={18} />;
    };

    const t = (key) => getTranslation(language, key);

    const handleAutoStart = async () => {
        console.log("Auto-starting Reddit AI Summary...");
        fetchRedditData();
    };

    const fetchRedditData = async () => {
        setLoading(true);
        setError(null);
        setData(null);
        setSummary('');
        setAnalyzing(false);
        shouldAutoScrollRef.current = true;
        // If not already expanded, expand it? User might find it intrusive if auto-summarize is ON. 
        // Typically auto-summarize implies we might want to see the result. 
        // But let's keep expansion manual or triggered by click unless explicitly requested.
        // Actually, previous behavior was probably to just run in bg.
        // Let's NOT force expand on auto-start, only on manual click.

        try {
            // Wait for page content to stabilize (comments to finish loading)
            if (window.waitForContentStable) {
                await window.waitForContentStable(1000, 5000);
            } else {
                // Fallback to simple delay if helper not available
                await new Promise(r => setTimeout(r, 1500));
            }

            const extractedData = window.getRedditDataGlobal ? window.getRedditDataGlobal() : null;
            if (!extractedData || !extractedData.title) {
                throw new Error("Could not extract Reddit content. Please refresh or try again.");
            }

            setData(extractedData);
            setLoading(false);

            generateAISummary(extractedData);
        } catch (err) {
            console.error(err);
            setError(err.message);
            setLoading(false);
        }
    };

    const generateAISummary = async (redditData) => {
        setAnalyzing(true);
        shouldAutoScrollRef.current = true;
        try {
            const result = await chrome.storage.local.get(['llmSettings']);
            const currentSettings = result.llmSettings || {};

            // Pass language explicitely
            await generateSummary(redditData, currentSettings, language, (chunk) => {
                setSummary(prev => prev + chunk);
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setAnalyzing(false);
        }
    };

    const toggleExpand = () => {
        const nextState = !isExpanded;
        setExpanded(nextState);
        if (nextState) shouldAutoScrollRef.current = true;

        // If opening and no data, fetch (manual trigger context)
        // If auto-summarize was OFF, we need to trigger fetch now if empty.
        if (nextState && !data && !loading && !analyzing && !error) {
            fetchRedditData();
        }
    };

    const FloatingBubble = () => {
        const isActive = status === 'loading';
        const isSuccess = status === 'success';
        const isError = status === 'error';

        return (
            <div className="fixed bottom-8 right-8 z-[10000] pointer-events-auto">
                {/* Outer glow ring - pulses when loading */}
                <div className={`absolute inset-0 rounded-full transition-all duration-500 ${isActive ? 'animate-ping bg-orange-400/30 scale-150' :
                        isSuccess ? 'bg-green-400/20 scale-110' :
                            isError ? 'bg-red-400/20 scale-110' :
                                'bg-orange-400/10 scale-100'
                    }`} />

                {/* Rotating gradient border for loading state */}
                {isActive && (
                    <div className="absolute inset-[-3px] rounded-full bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-500 animate-spin"
                        style={{ animationDuration: '2s' }} />
                )}

                {/* Main button */}
                <button
                    onClick={toggleExpand}
                    className={`relative flex items-center gap-2 shadow-2xl transition-all duration-500 ease-out hover:scale-110 active:scale-95 overflow-hidden
                        ${isActive
                            ? 'w-14 h-14 rounded-full p-0 justify-center'
                            : 'px-4 py-3 rounded-2xl'
                        }
                        ${isError
                            ? 'bg-gradient-to-br from-red-500 to-red-700 text-white shadow-red-500/40'
                            : isSuccess
                                ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-green-500/40'
                                : 'bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 text-white shadow-orange-500/50'
                        }
                        hover:shadow-[0_0_30px_rgba(249,115,22,0.6)]
                    `}
                    title={isActive ? t('reading') : t('bubbleTooltip')}
                    style={{
                        boxShadow: isActive
                            ? '0 0 40px rgba(249, 115, 22, 0.5), inset 0 0 20px rgba(255,255,255,0.1)'
                            : undefined
                    }}
                >
                    {/* Inner shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-60" />

                    {/* Icon */}
                    <span className="relative z-10">
                        {isActive && <Loader2 className="animate-spin" size={24} />}
                        {isSuccess && <CheckCircle2 size={22} />}
                        {isError && <AlertCircle size={22} />}
                        {status === 'idle' && <MessageSquareText size={20} />}
                    </span>

                    {/* Label text - hidden when loading */}
                    {!isActive && (
                        <span className="relative z-10 font-semibold text-sm whitespace-nowrap">
                            AI Summary
                        </span>
                    )}
                </button>
            </div>
        );
    };

    return (
        <div className={isDark ? 'dark' : ''}>
            <div className="text-gray-900 dark:text-gray-100 font-sans antialiased">
                {!isExpanded && <FloatingBubble />}

                {isExpanded && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200 pointer-events-auto">
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden relative transition-colors duration-200">

                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/95 dark:bg-gray-900/95 shrink-0 transition-colors duration-200">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    ✨ Reddit AI Summary
                                </h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400 mr-2 hidde sm:block">{t('pressEsc')}</span>
                                    <button
                                        onClick={cycleTheme}
                                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
                                        title={`${t('theme')}: ${t('themes')[themeConfig] || themeConfig}`}
                                    >
                                        {getThemeIcon()}
                                    </button>
                                    <button
                                        onClick={() => setExpanded(false)}
                                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
                                        title={t('close')}
                                    >
                                        <Minimize2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div
                                className="flex-1 overflow-y-auto p-0 relative bg-white dark:bg-gray-900 transition-colors duration-200"
                                ref={scrollRef}
                                onScroll={handleScroll}
                            >
                                <div className="p-6 space-y-6 flex flex-col min-h-full">
                                    {loading && (
                                        <div className="flex-1 flex flex-col items-center justify-center py-12 space-y-4">
                                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
                                            <p className="text-gray-500 dark:text-gray-400 animate-pulse">{t('reading')}</p>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg text-red-600 dark:text-red-200 text-sm flex items-start gap-3 shrink-0">
                                            <span className="flex-1 break-words">{t('error')}: {error}</span>
                                            <button onClick={fetchRedditData} className="underline hover:text-black dark:hover:text-white whitespace-nowrap shrink-0 ml-2">{t('retry')}</button>
                                        </div>
                                    )}

                                    {!loading && !error && (data || summary) && (
                                        <>
                                            <div className="prose prose-sm max-w-none flex-1 dark:prose-invert transition-colors duration-200 text-gray-800 dark:text-gray-200">
                                                {analyzing && !summary ? (
                                                    <div className="flex h-full items-center justify-center gap-2 text-gray-400 py-20">
                                                        <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></span>
                                                        <span className="text-lg animate-pulse">{t('thinking')}</span>
                                                    </div>
                                                ) : (
                                                    <div className="relative pb-4">
                                                        <Markdown>{summary}</Markdown>
                                                        {analyzing && (
                                                            <span className="inline-block w-1.5 h-4 ml-0.5 bg-orange-500 animate-cursor-blink align-text-bottom mb-0.5"></span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            {!loading && !error && data && (
                                <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/95 dark:bg-gray-900/95 shrink-0 flex items-center justify-between text-xs text-gray-500 border-gray-200 dark:border-gray-700 transition-colors duration-200 z-10">
                                    <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                        {data.authorAvatar ? (
                                            <img
                                                src={data.authorAvatar}
                                                alt={data.author}
                                                className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                                            />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border border-gray-300 dark:border-gray-600 shrink-0">
                                                <User size={20} className="text-gray-500 dark:text-gray-400" />
                                            </div>
                                        )}
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                {data.author && <span className="font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[120px]">u/{data.author}</span>}
                                                <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 px-1 rounded bg-gray-50 dark:bg-gray-800 shrink-0">
                                                    {settings.modelName || settings.model || 'GPT-3.5'}
                                                </span>
                                                <button
                                                    onClick={fetchRedditData}
                                                    disabled={loading || analyzing}
                                                    className={`ml-2 flex items-center gap-1 transition-colors whitespace-nowrap bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-md shadow-sm ${loading || analyzing
                                                        ? 'opacity-50 cursor-not-allowed text-gray-400'
                                                        : 'hover:text-blue-500 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-900 text-gray-600 dark:text-gray-400'
                                                        }`}
                                                    title={t('resummarize')}
                                                >
                                                    <RefreshCw size={10} className={loading || analyzing ? "animate-spin" : ""} />
                                                    <span>{t('resummarize')}</span>
                                                </button>
                                            </div>
                                            <span className="truncate opacity-75 text-[11px]">{data.title}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
