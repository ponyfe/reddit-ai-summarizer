export function getRedditDataGlobal() {
    console.log('Extracting Reddit Data (Module)...');

    // 1. Title
    let title = '';
    const h1 = document.querySelector('h1');
    if (h1) {
        title = h1.innerText.trim();
    } else {
        const shredditTitle = document.querySelector('shreddit-title');
        if (shredditTitle) title = shredditTitle.getAttribute('title') || "";
    }

    // 2. Post Body
    let body = '';
    const bodySlot = document.querySelector('[slot="text-body"]');
    if (bodySlot) {
        body = bodySlot.innerText.trim();
    } else {
        const userText = document.querySelector('.usertext-body');
        if (userText) body = userText.innerText.trim();
    }

    // 3. Author Info
    let author = '';
    let authorAvatar = '';
    const shredditPost = document.querySelector('shreddit-post');
    if (shredditPost) {
        author = shredditPost.getAttribute('author') || '';
        authorAvatar = shredditPost.getAttribute('author-icon-img');

        if (!authorAvatar) {
            // Try inside the shadow dom or children. 
            // Often it's in a slot="credit-bar" or similar.
            // Let's look for faceplate-img or just an img with specific classes or context.
            const img = shredditPost.querySelector('faceplate-img') ||
                shredditPost.querySelector('img[alt*="Avatar"]') ||
                document.querySelector('img[alt*="' + author + '"]'); // Global fallback if author known

            if (img) authorAvatar = img.src || img.getAttribute('src');
        }

        if (!authorAvatar) authorAvatar = ""; // Ensure string
    } else {
        // Fallback for old reddit or other layouts
        const authorLink = document.querySelector('.author');
        if (authorLink) author = authorLink.innerText.trim();
    }

    // 3. Comments
    const comments = [];
    const shredditComments = document.querySelectorAll('shreddit-comment');
    if (shredditComments.length > 0) {
        shredditComments.forEach((comment, index) => {
            if (index >= 20) return;
            const contentSlot = comment.querySelector('[slot="comment"]');
            const author = comment.getAttribute('author');

            if (contentSlot) {
                comments.push({
                    author,
                    text: contentSlot.innerText.trim()
                });
            }
        });
    } else {
        const commentElements = document.querySelectorAll('.comment');
        commentElements.forEach((comment, index) => {
            if (index >= 20) return;
            const author = comment.querySelector('.author')?.innerText;
            const text = comment.querySelector('.usertext-body')?.innerText;
            if (text) {
                comments.push({ author, text });
            }
        });
    }

    return {
        title,
        body,
        comments,
        author,
        authorAvatar,
        url: window.location.href,
        extractedAt: new Date().toISOString()
    };
}
