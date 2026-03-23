// FR HUB UI Controller

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const apiPanel = document.getElementById('apiPanel');
    const closePanel = document.getElementById('closePanel');
    const saveApi = document.getElementById('saveApi');
    const newChat = document.getElementById('newChat');
    const exampleBtns = document.querySelectorAll('.example-btn');

    // Auto-resize textarea
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 200) + 'px';
    });

    // Send message
    function sendMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        frHubAPI.generateScript(text);
        userInput.value = '';
        userInput.style.height = 'auto';
    }

    sendBtn.addEventListener('click', sendMessage);

    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // API Panel
    settingsBtn.addEventListener('click', () => {
        apiPanel.classList.remove('hidden');
        if (frHub.apiKey) {
            document.getElementById('apiKey').value = frHub.apiKey;
            document.getElementById('modelSelect').value = frHub.model;
            document.getElementById('maxTokens').value = frHub.maxTokens;
        }
    });

    closePanel.addEventListener('click', () => {
        apiPanel.classList.add('hidden');
    });

    saveApi.addEventListener('click', () => {
        const key = document.getElementById('apiKey').value.trim();
        const model = document.getElementById('modelSelect').value;
        const tokens = document.getElementById('maxTokens').value;

        if (!key) {
            alert('API Key is required');
            return;
        }

        frHub.setApiConfig(key, model, tokens);
        apiPanel.classList.add('hidden');
        document.getElementById('statusText').textContent = 'API Connected';
        document.querySelector('.dot').style.background = 'var(--success)';
    });

    // New Chat
    newChat.addEventListener('click', () => {
        frHub.clearHistory();
        document.getElementById('chatOutput').innerHTML = `
            <div class="welcome-message">
                <h2>FR HUB v1.0</h2>
                <p>New session started. Ready for commands.</p>
            </div>
        `;
        document.getElementById('chatHistory').innerHTML = '';
    });

    // Example buttons
    exampleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            userInput.value = btn.textContent.replace(/"/g, '');
            userInput.focus();
        });
    });

    // Check API status on load
    if (frHub.apiKey) {
        document.getElementById('statusText').textContent = 'API Ready';
    } else {
        document.getElementById('statusText').textContent = 'API Not Configured';
        document.querySelector('.dot').style.background = 'var(--warning)';
    }
});

console.log('%cFR HUB UI Loaded', 'color: #00f0ff;');
