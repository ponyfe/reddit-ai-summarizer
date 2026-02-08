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
        url: window.location.href,
        extractedAt: new Date().toISOString()
    };
}
