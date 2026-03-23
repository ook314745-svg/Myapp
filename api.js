// FR HUB API Interface - Unlimited Access

class FRHubAPI {
    constructor() {
        this.baseURL = 'https://api.openai.com/v1/chat/completions';
        this.isProcessing = false;
    }

    async generateScript(userInput, callback) {
        if (this.isProcessing) return;

        if (!frHub.apiKey) {
            alert('Please configure your API Key first');
            document.getElementById('apiPanel').classList.remove('hidden');
            return;
        }

        this.isProcessing = true;
        this.showLoading(true);

        try {
            const messages = frHub.formatMessages(userInput);

            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${frHub.apiKey}`
                },
                body: JSON.stringify({
                    model: frHub.model,
                    messages: messages,
                    max_tokens: frHub.maxTokens,
                    temperature: 0.8,
                    top_p: 1,
                    presence_penalty: 0,
                    frequency_penalty: 0
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'API Error');
            }

            const data = await response.json();
            const assistantMessage = data.choices[0].message.content;

            // Update conversation history
            frHub.addToHistory('user', userInput);
            frHub.addToHistory('assistant', assistantMessage);

            // Update UI
            this.addMessageToUI('user', userInput);
            this.addMessageToUI('assistant', assistantMessage);

            // Update token count display (approximate)
            const tokens = data.usage?.total_tokens || 'Unknown';
            document.getElementById('tokenCount').textContent = `Tokens: ${tokens}`;

            if (callback) callback(assistantMessage);

        } catch (error) {
            console.error('FR HUB Error:', error);
            this.addMessageToUI('assistant', `**Error:** ${error.message}\n\nCheck your API key or try again.`);
        } finally {
            this.isProcessing = false;
            this.showLoading(false);
        }
    }

    addMessageToUI(role, content) {
        const chatOutput = document.getElementById('chatOutput');

        // Remove welcome message if exists
        const welcome = chatOutput.querySelector('.welcome-message');
        if (welcome) welcome.remove();

        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${role}`;

        const header = document.createElement('div');
        header.className = 'message-header';
        header.innerHTML = role === 'user' ? 
            '<span>➤</span> <span>You</span>' : 
            '<span>◈</span> <span>FR HUB</span>';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        // Process markdown and code blocks
        contentDiv.innerHTML = this.processContent(content);

        messageDiv.appendChild(header);
        messageDiv.appendChild(contentDiv);
        chatOutput.appendChild(messageDiv);

        // Scroll to bottom
        chatOutput.scrollTop = chatOutput.scrollHeight;

        // Add to sidebar history if user message
        if (role === 'user') {
            this.addToSidebar(content);
        }
    }

    processContent(content) {
        // Escape HTML
        let processed = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // Process code blocks
        processed = processed.replace(
            /\`\`\`(\w+)?\n([\s\S]*?)\`\`\`/g,
            (match, lang, code) => {
                const language = lang || 'lua';
                return `<div class="code-block">
                    <div class="code-header">
                        <span>${language.toUpperCase()}</span>
                        <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                    </div>
                    <code>${code.trim()}</code>
                </div>`;
            }
        );

        // Process inline code
        processed = processed.replace(
            /`([^`]+)`/g,
            '<code style="background: #2d2d2d; padding: 2px 6px; border-radius: 3px; font-size: 0.9em;">$1</code>'
        );

        // Process bold
        processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

        // Process newlines
        processed = processed.replace(/\n/g, '<br>');

        return processed;
    }

    addToSidebar(text) {
        const history = document.getElementById('chatHistory');
        const item = document.createElement('div');
        item.className = 'history-item';
        item.textContent = text.length > 30 ? text.substring(0, 30) + '...' : text;
        item.onclick = () => {
            document.getElementById('userInput').value = text;
        };
        history.insertBefore(item, history.firstChild);
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (show) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }
}

// Copy code function
function copyCode(btn) {
    const code = btn.parentElement.nextElementSibling.textContent;
    navigator.clipboard.writeText(code).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 2000);
    });
}

// Initialize API
const frHubAPI = new FRHubAPI();
