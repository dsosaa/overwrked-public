// ========== AI COPILOT FOR MKDOCS MATERIAL ==========
// Material Design integrated AI assistant with CodeMirror 6 support
// Inspired by Obsidian Copilot with web-native implementation

class MaterialAICopilot {
  constructor() {
    this.initialized = false;
    this.chatHistory = [];
    this.currentContext = '';
    this.selectedText = '';
    this.isProcessing = false;
    this.editor = null;
    this.settings = {
      enabled: true,
      provider: 'openai',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      apiEndpoint: '/api/ai-copilot',
      theme: 'auto' // auto, light, dark
    };
    
    this.initWhenReady();
  }

  initWhenReady() {
    // Wait for DOM and check for editor instances
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    this.injectUI();
    this.bindEventListeners();
    this.detectEditors();
    this.applyTheme();
    this.initialized = true;
    console.log('Material AI Copilot initialized');
  }

  injectUI() {
    // Create floating action button (FAB)
    const fab = document.createElement('div');
    fab.className = 'ai-copilot-fab md-fab';
    fab.innerHTML = `
      <button class="md-fab__button" aria-label="AI Copilot" data-md-tooltip="AI Assistant">
        <span class="md-fab__icon material-symbols-outlined">smart_toy</span>
      </button>
    `;
    
    // Create main copilot panel
    const panel = document.createElement('div');
    panel.className = 'ai-copilot-panel';
    panel.innerHTML = `
      <div class="copilot-container">
        <!-- Header with Material Design -->
        <div class="copilot-header md-typeset">
          <div class="copilot-title">
            <span class="material-symbols-outlined">smart_toy</span>
            <h3>AI Copilot</h3>
          </div>
          <div class="copilot-actions">
            <button class="md-button md-button--icon" data-action="clear" data-md-tooltip="Clear chat">
              <span class="material-symbols-outlined">delete_sweep</span>
            </button>
            <button class="md-button md-button--icon" data-action="settings" data-md-tooltip="Settings">
              <span class="material-symbols-outlined">settings</span>
            </button>
            <button class="md-button md-button--icon" data-action="minimize" data-md-tooltip="Minimize">
              <span class="material-symbols-outlined">expand_more</span>
            </button>
            <button class="md-button md-button--icon" data-action="close" data-md-tooltip="Close">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <!-- Quick Actions Bar -->
        <div class="copilot-quick-actions">
          <div class="quick-actions-scroll">
            <button class="md-button md-button--primary quick-action" data-action="explain">
              <span class="material-symbols-outlined">help</span>
              Explain
            </button>
            <button class="md-button md-button--primary quick-action" data-action="improve">
              <span class="material-symbols-outlined">auto_fix_high</span>
              Improve
            </button>
            <button class="md-button md-button--primary quick-action" data-action="summarize">
              <span class="material-symbols-outlined">summarize</span>
              Summarize
            </button>
            <button class="md-button md-button--primary quick-action" data-action="translate">
              <span class="material-symbols-outlined">translate</span>
              Translate
            </button>
            <button class="md-button md-button--primary quick-action" data-action="code">
              <span class="material-symbols-outlined">code</span>
              Generate Code
            </button>
            <button class="md-button md-button--primary quick-action" data-action="fix">
              <span class="material-symbols-outlined">spellcheck</span>
              Fix Grammar
            </button>
          </div>
        </div>

        <!-- Chat Area -->
        <div class="copilot-chat md-typeset">
          <div class="chat-messages" id="copilot-messages">
            <div class="chat-welcome">
              <span class="material-symbols-outlined welcome-icon">waving_hand</span>
              <p>Hi! I'm your AI assistant. I can help you:</p>
              <ul>
                <li>Explain complex concepts</li>
                <li>Improve your writing</li>
                <li>Generate code examples</li>
                <li>Translate content</li>
                <li>Answer questions about your notes</li>
              </ul>
              <p class="welcome-hint">Select text and choose an action, or type your question below.</p>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="copilot-input-area">
          <div class="input-wrapper">
            <textarea 
              class="copilot-input md-input" 
              placeholder="Ask me anything..."
              rows="2"
              id="copilot-input"></textarea>
            <div class="input-actions">
              <button class="md-button md-button--icon" data-action="attach" data-md-tooltip="Attach context">
                <span class="material-symbols-outlined">attach_file</span>
              </button>
              <button class="md-button md-button--icon" data-action="voice" data-md-tooltip="Voice input">
                <span class="material-symbols-outlined">mic</span>
              </button>
              <button class="md-button md-button--primary send-button" id="copilot-send">
                <span class="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
          <div class="input-footer">
            <span class="char-count">0 / 4000</span>
            <span class="model-indicator">
              <span class="material-symbols-outlined">memory</span>
              GPT-4
            </span>
          </div>
        </div>
      </div>
    `;

    // Settings modal
    const settingsModal = document.createElement('div');
    settingsModal.className = 'copilot-settings-modal';
    settingsModal.innerHTML = `
      <div class="md-dialog">
        <div class="md-dialog__inner md-typeset">
          <header class="md-dialog__title">
            <span class="material-symbols-outlined">settings</span>
            AI Copilot Settings
          </header>
          <div class="md-dialog__content">
            <div class="settings-group">
              <label class="md-typeset__label">AI Provider</label>
              <select class="md-select" id="ai-provider">
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic (Claude)</option>
                <option value="google">Google (Gemini)</option>
                <option value="ollama">Ollama (Local)</option>
              </select>
            </div>
            <div class="settings-group">
              <label class="md-typeset__label">Model</label>
              <select class="md-select" id="ai-model">
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="claude-3">Claude 3</option>
                <option value="gemini-pro">Gemini Pro</option>
              </select>
            </div>
            <div class="settings-group">
              <label class="md-typeset__label">Temperature</label>
              <input type="range" class="md-slider" id="ai-temperature" min="0" max="1" step="0.1" value="0.7">
              <span class="slider-value">0.7</span>
            </div>
            <div class="settings-group">
              <label class="md-typeset__label">API Key</label>
              <input type="password" class="md-input" id="ai-api-key" placeholder="Enter your API key">
            </div>
          </div>
          <footer class="md-dialog__actions">
            <button class="md-button" data-action="cancel">Cancel</button>
            <button class="md-button md-button--primary" data-action="save">Save</button>
          </footer>
        </div>
      </div>
    `;

    // Append to body
    document.body.appendChild(fab);
    document.body.appendChild(panel);
    document.body.appendChild(settingsModal);
  }

  bindEventListeners() {
    // FAB click
    document.querySelector('.ai-copilot-fab')?.addEventListener('click', () => {
      this.togglePanel();
    });

    // Panel actions
    document.querySelector('[data-action="close"]')?.addEventListener('click', () => {
      this.closePanel();
    });

    document.querySelector('[data-action="minimize"]')?.addEventListener('click', () => {
      this.minimizePanel();
    });

    document.querySelector('[data-action="clear"]')?.addEventListener('click', () => {
      this.clearChat();
    });

    document.querySelector('[data-action="settings"]')?.addEventListener('click', () => {
      this.openSettings();
    });

    // Quick actions
    document.querySelectorAll('.quick-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        this.executeQuickAction(action);
      });
    });

    // Input handling
    const input = document.getElementById('copilot-input');
    const sendBtn = document.getElementById('copilot-send');

    if (input) {
      input.addEventListener('input', () => this.updateCharCount());
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', () => this.sendMessage());
    }

    // Listen for text selection
    document.addEventListener('mouseup', () => {
      const selection = window.getSelection().toString();
      if (selection) {
        this.selectedText = selection;
      }
    });

    // Keyboard shortcut (Ctrl/Cmd + Shift + A)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        this.togglePanel();
      }
    });
  }

  detectEditors() {
    // Check for CodeMirror 6 instances
    const cmEditors = document.querySelectorAll('.cm-editor');
    if (cmEditors.length > 0) {
      this.attachToCodeMirror(cmEditors[0]);
    }

    // Check for Monaco editor
    if (window.monaco && window.monaco.editor) {
      const monacoEditors = window.monaco.editor.getEditors();
      if (monacoEditors.length > 0) {
        this.attachToMonaco(monacoEditors[0]);
      }
    }

    // Check for standard textareas
    const textareas = document.querySelectorAll('textarea.md-input, textarea[name="content"]');
    if (textareas.length > 0) {
      this.attachToTextarea(textareas[0]);
    }
  }

  attachToCodeMirror(cmElement) {
    // Get CodeMirror view from element
    const view = cmElement.cmView || cmElement._view;
    if (view) {
      this.editor = {
        type: 'codemirror',
        instance: view,
        getContent: () => view.state.doc.toString(),
        getSelection: () => {
          const { from, to } = view.state.selection.main;
          return view.state.doc.sliceString(from, to);
        },
        insertText: (text) => {
          const { from, to } = view.state.selection.main;
          view.dispatch({
            changes: { from, to, insert: text }
          });
        }
      };
    }
  }

  attachToMonaco(editor) {
    this.editor = {
      type: 'monaco',
      instance: editor,
      getContent: () => editor.getValue(),
      getSelection: () => {
        const selection = editor.getSelection();
        return editor.getModel().getValueInRange(selection);
      },
      insertText: (text) => {
        const selection = editor.getSelection();
        editor.executeEdits('ai-copilot', [{
          range: selection,
          text: text
        }]);
      }
    };
  }

  attachToTextarea(textarea) {
    this.editor = {
      type: 'textarea',
      instance: textarea,
      getContent: () => textarea.value,
      getSelection: () => {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        return textarea.value.substring(start, end);
      },
      insertText: (text) => {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, start) + text + textarea.value.substring(end);
      }
    };
  }

  async sendMessage(message = null) {
    const input = document.getElementById('copilot-input');
    const text = message || input?.value.trim();
    
    if (!text || this.isProcessing) return;
    
    this.isProcessing = true;
    this.addMessage('user', text);
    
    if (input) input.value = '';
    this.updateCharCount();
    
    // Show typing indicator
    this.showTypingIndicator();
    
    try {
      const response = await this.callAPI(text);
      this.hideTypingIndicator();
      this.addMessage('assistant', response);
      
      // Add apply button if response contains code
      if (response.includes('```')) {
        this.addActionButtons(response);
      }
    } catch (error) {
      this.hideTypingIndicator();
      this.addMessage('error', 'Failed to get response. Please check your connection and API settings.');
    } finally {
      this.isProcessing = false;
    }
  }

  async executeQuickAction(action) {
    const context = this.selectedText || this.getEditorContent();
    if (!context && action !== 'code') {
      this.addMessage('info', 'Please select some text or have content in the editor.');
      return;
    }

    const prompts = {
      explain: `Explain the following in simple terms:\n\n${context}`,
      improve: `Improve the following text for clarity, style, and professionalism:\n\n${context}`,
      summarize: `Provide a concise summary of the following:\n\n${context}`,
      translate: `Translate the following to Spanish (or detect and translate to English if already in another language):\n\n${context}`,
      code: `Generate code based on the following description:\n\n${context || 'Create a Python function that calculates fibonacci numbers'}`,
      fix: `Fix grammar, spelling, and punctuation in the following:\n\n${context}`
    };

    await this.sendMessage(prompts[action]);
  }

  getEditorContent() {
    if (this.editor && this.editor.getContent) {
      return this.editor.getContent();
    }
    return '';
  }

  async callAPI(prompt) {
    // Check if using mock mode
    if (!this.settings.apiEndpoint || !localStorage.getItem('ai_api_key')) {
      return this.getMockResponse(prompt);
    }

    const context = this.getEditorContent();
    
    const response = await fetch(this.settings.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('ai_api_key')}`
      },
      body: JSON.stringify({
        prompt,
        context: context.substring(0, 4000),
        provider: this.settings.provider,
        model: this.settings.model,
        temperature: this.settings.temperature,
        maxTokens: this.settings.maxTokens,
        chatHistory: this.chatHistory.slice(-5) // Last 5 messages for context
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    return data.response;
  }

  getMockResponse(prompt) {
    const responses = {
      explain: `This concept involves understanding the fundamental principles at work. Let me break it down:

1. **Core Idea**: The main concept here is about organizing information effectively
2. **How it Works**: The system processes data through multiple stages
3. **Key Benefits**: Improved clarity, better organization, and enhanced understanding
4. **Practical Application**: You can apply this in documentation, code structure, and communication`,
      
      improve: `Here's an improved version with better clarity and structure:

The enhanced text maintains the original meaning while improving readability through:
- Clearer sentence structure
- More concise phrasing
- Better paragraph organization
- Consistent tone and style`,
      
      summarize: `**Summary**: This content covers essential concepts related to documentation and knowledge management, emphasizing the importance of clear communication and structured information presentation.`,
      
      translate: `**Traducción al Español**:

Este es el texto traducido que mantiene el significado y contexto original mientras se adapta a las convenciones del español.`,
      
      code: `\`\`\`python
def example_function(data):
    """
    Example function demonstrating best practices.
    
    Args:
        data: Input data to process
    
    Returns:
        Processed result
    """
    # Process the data
    result = [item for item in data if item is not None]
    
    return result
\`\`\``,
      
      fix: `Here's the corrected text with proper grammar and punctuation:

The text has been revised for grammatical accuracy, proper punctuation, and improved readability.`,
      
      default: `I understand your request. Based on the context provided, here's my response:

This is a helpful response that addresses your question with relevant information and actionable insights. Feel free to ask follow-up questions or request clarification on any points.`
    };

    // Match response to prompt type
    for (const [key, response] of Object.entries(responses)) {
      if (prompt.toLowerCase().includes(key)) {
        return response;
      }
    }
    
    return responses.default;
  }

  addMessage(type, content) {
    const messagesContainer = document.getElementById('copilot-messages');
    if (!messagesContainer) return;

    // Remove welcome message if it exists
    const welcome = messagesContainer.querySelector('.chat-welcome');
    if (welcome) welcome.remove();

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message message-${type}`;
    
    const icon = {
      user: 'person',
      assistant: 'smart_toy',
      error: 'error',
      info: 'info',
      system: 'settings'
    }[type] || 'chat';
    
    messageDiv.innerHTML = `
      <div class="message-header">
        <span class="material-symbols-outlined message-icon">${icon}</span>
        <span class="message-role">${type === 'user' ? 'You' : 'AI Assistant'}</span>
        <span class="message-time">${new Date().toLocaleTimeString()}</span>
      </div>
      <div class="message-content md-typeset">${this.formatMessage(content)}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Add to history
    this.chatHistory.push({ role: type, content, timestamp: Date.now() });
  }

  formatMessage(content) {
    // Convert markdown to HTML
    let formatted = content
      // Code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Bold
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Line breaks
      .replace(/\n/g, '<br>');
    
    return formatted;
  }

  showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typing-indicator';
    indicator.innerHTML = `
      <span class="material-symbols-outlined">smart_toy</span>
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
    `;
    
    const messagesContainer = document.getElementById('copilot-messages');
    if (messagesContainer) {
      messagesContainer.appendChild(indicator);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
  }

  addActionButtons(content) {
    const messagesContainer = document.getElementById('copilot-messages');
    if (!messagesContainer) return;

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'message-actions';
    actionsDiv.innerHTML = `
      <button class="md-button md-button--primary" onclick="materialAICopilot.applyToEditor('${btoa(content)}')">
        <span class="material-symbols-outlined">edit_note</span>
        Apply to Editor
      </button>
      <button class="md-button" onclick="materialAICopilot.copyToClipboard('${btoa(content)}')">
        <span class="material-symbols-outlined">content_copy</span>
        Copy
      </button>
    `;
    
    messagesContainer.appendChild(actionsDiv);
  }

  applyToEditor(encodedContent) {
    const content = atob(encodedContent);
    
    if (!this.editor) {
      this.copyToClipboard(encodedContent);
      this.addMessage('info', 'No editor detected. Content copied to clipboard.');
      return;
    }
    
    // Extract code from markdown if present
    const codeMatch = content.match(/```[\w]*\n?([\s\S]*?)```/);
    const textToApply = codeMatch ? codeMatch[1].trim() : content;
    
    this.editor.insertText(textToApply);
    this.addMessage('system', '✅ Applied to editor');
  }

  copyToClipboard(encodedContent) {
    const content = atob(encodedContent);
    navigator.clipboard.writeText(content).then(() => {
      this.addMessage('system', '📋 Copied to clipboard');
    });
  }

  updateCharCount() {
    const input = document.getElementById('copilot-input');
    const counter = document.querySelector('.char-count');
    if (input && counter) {
      const count = input.value.length;
      counter.textContent = `${count} / 4000`;
      counter.style.color = count > 3800 ? 'var(--md-accent-fg-color)' : '';
    }
  }

  togglePanel() {
    const panel = document.querySelector('.ai-copilot-panel');
    panel?.classList.toggle('active');
    
    if (panel?.classList.contains('active')) {
      document.getElementById('copilot-input')?.focus();
    }
  }

  closePanel() {
    const panel = document.querySelector('.ai-copilot-panel');
    panel?.classList.remove('active');
  }

  minimizePanel() {
    const panel = document.querySelector('.ai-copilot-panel');
    panel?.classList.toggle('minimized');
  }

  clearChat() {
    const messagesContainer = document.getElementById('copilot-messages');
    if (messagesContainer) {
      messagesContainer.innerHTML = `
        <div class="chat-welcome">
          <span class="material-symbols-outlined welcome-icon">waving_hand</span>
          <p>Chat cleared. How can I help you?</p>
        </div>
      `;
    }
    this.chatHistory = [];
  }

  openSettings() {
    const modal = document.querySelector('.copilot-settings-modal');
    modal?.classList.add('active');
  }

  applyTheme() {
    const panel = document.querySelector('.ai-copilot-panel');
    if (!panel) return;

    // Detect current theme
    const isDark = document.body.getAttribute('data-md-color-scheme') === 'slate' ||
                   window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    panel.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }
}

// Initialize when ready
const materialAICopilot = new MaterialAICopilot();

// Export for global access
window.materialAICopilot = materialAICopilot;