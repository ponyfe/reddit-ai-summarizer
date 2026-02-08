console.log('Reddit AI Summarizer Background Script Loaded');

// Open the modal when the extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
    if (tab.url && tab.url.includes("reddit.com")) {
        chrome.tabs.sendMessage(tab.id, { action: 'OPEN_SIDEPANEL' });
    } else {
        console.log("Not a Reddit page");
    }
});

// Listen for messages from content script (optional, if we need to proxy anything)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // We might need this for other features later, but for now the content script handles itself.
    if (message.action === 'OPEN_SIDEPANEL') {
        if (sender.tab) {
            chrome.tabs.sendMessage(sender.tab.id, { action: 'OPEN_SIDEPANEL' });
        }
    }
});
