import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import { Overlay } from './Overlay'
import { getRedditDataGlobal } from './extractor';
import styleText from './content.css?inline'
import './content.css'

console.log('Reddit AI Summarizer Content Script Loaded (React)');

function ContentApp() {
    return (
        <StrictMode>
            <Overlay />
        </StrictMode>
    );
}

// Inject the Shadow Root Host
function injectHost() {
    const hostId = 'reddit-ai-summarizer-host';
    if (document.getElementById(hostId)) return;

    const host = document.createElement('div');
    host.id = hostId;
    Object.assign(host.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        zIndex: '2147483647',
        pointerEvents: 'none' // Host is transparent to clicks
    });

    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });

    // Inject styles
    const style = document.createElement('style');
    style.textContent = styleText;
    shadow.appendChild(style);

    const root = createRoot(shadow);
    root.render(<ContentApp />);
}

injectHost();

// Expose extractor globally for Overlay
window.getRedditDataGlobal = getRedditDataGlobal;
