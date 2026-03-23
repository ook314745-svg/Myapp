// استخدم Puter.js بدلاً من OpenAI المباشر
class FRHubAPI {
    async generateScript(userInput) {
        this.showLoading(true);
        try {
            // استخدام Puter.js المجاني
            const response = await puter.ai.chat(userInput, {
                model: 'gpt-4',
                systemPrompt: frHub.systemPrompt
            });
            
            frHub.addToHistory('user', userInput);
            frHub.addToHistory('assistant', response);
            this.addMessageToUI('assistant', response);
            
        } catch (error) {
            console.error(error);
            alert('Error: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }
}
