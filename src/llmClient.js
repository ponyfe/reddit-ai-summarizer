import { getTranslation } from './i18n';

export async function generateSummary(redditData, settings, language = 'en', onChunk) {
    if (!settings.apiKey) {
        throw new Error("API Key is missing. Please set it in Settings.");
    }

    // Prepare System Prompt
    const targetLanguageName = getTranslation(language, 'promptLanguage');
    const tTitle = getTranslation(language, 'promptTitle');
    const tSummary = getTranslation(language, 'promptSummary');
    const tKeyPoints = getTranslation(language, 'promptKeyPoints');
    const tSentiment = getTranslation(language, 'promptSentiment');

    const systemPrompt = `You are a Reddit Thread Summarizer. 
    Your task is to summarize the following Reddit thread in ${targetLanguageName}.
    
    Structure the summary as follows:
    1. **${tTitle}**: The title of the post.
    2. **${tSummary}**: A concise summary of the main point.
    3. **${tKeyPoints}**: A bulleted list of 3-5 distinct, key arguments or discussions found in the comments.
    4. **${tSentiment}**: Briefly describe the overall sentiment (Positive, Negative, Mixed, Neutral).
    
    Stay objective. Do not hallucinate infomation. Use Markdown formatting.
    Output ONLY the summary in ${targetLanguageName}.`;

    const userContent = `Title: ${redditData.title}\n\nOp Text: ${redditData.selftext}\n\nComments:\n${JSON.stringify(redditData.comments)}`;

    let url = settings.baseUrl || 'https://api.openai.com/v1';
    if (url.endsWith('/')) url = url.slice(0, -1);

    let endpoint = `${url}/chat/completions`; // Default OpenAI compatible

    if (url.includes('deepseek')) {
        endpoint = `${url}/chat/completions`;
    } else if (url.includes('googleapis')) {
        // Google often needs exact path or slightly different
        // But user is expected to put full base url for custom
    }

    // Simple adjustments for known providers if base URL is generic
    const model = settings.modelName || settings.model || 'gpt-3.5-turbo';

    const payload = {
        model: model,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent }
        ],
        stream: true
    };

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`API Error: ${response.status} - ${err}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        // Process SSE lines
        const lines = chunk.split('\n');
        for (const line of lines) {
            if (line.trim() === '') continue;
            if (line.trim() === 'data: [DONE]') continue;
            if (line.startsWith('data: ')) {
                try {
                    const json = JSON.parse(line.slice(6));
                    const text = json.choices[0]?.delta?.content || '';
                    if (text) onChunk(text);
                } catch (e) {
                    console.error('Error parsing chunk', e);
                }
            }
        }
    }
}
