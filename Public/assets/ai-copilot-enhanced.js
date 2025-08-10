// ========== ENHANCED AI COPILOT FOR MKDOCS MATERIAL ==========
// Material Design integrated AI assistant with advanced UI/UX features
// Version 2.0 - Enhanced with resizable, draggable, and improved functionality

class EnhancedMaterialAICopilot {
  constructor() {
    this.initialized = false;
    this.chatHistory = [];
    this.conversations = new Map(); // Multi-tab conversations
    this.activeConversationId = 'default';
    this.templates = [];
    this.shortcuts = new Map();
    this.selectedText = '';
    this.isProcessing = false;
    this.isDragging = false;
    this.isResizing = false;
    this.streamController = null;
    this.editor = null;
    
    this.settings = {
      enabled: true,
      provider: 'openai',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      apiEndpoint: '/api/ai-copilot',
      theme: 'auto',
      position: { x: null, y: null },
      size: { width: 420, height: 600 },
      dockMode: 'floating', // floating, right, left, bottom
      compactMode: false,
      autoSave: true,
      streamResponses: true,
      soundEnabled: false,
      fontSize: 'medium', // small, medium, large
      highContrast: false
    };
    
    this.loadSettings();
    this.initWhenReady();
  }

  initWhenReady() {
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
    this.registerKeyboardShortcuts();
    this.loadTemplates();
    this.restorePanelState();
    this.initializeConversation('default');
    this.initialized = true;
    console.log('Enhanced Material AI Copilot initialized');
  }

  injectUI() {
    // Create floating action button (FAB)
    const fab = document.createElement('div');
    fab.className = 'ai-copilot-fab md-fab';
    fab.innerHTML = `
      <button class="md-fab__button" aria-label="AI Copilot" data-md-tooltip="AI Assistant (Ctrl+Shift+A)">
        <span class="md-fab__icon material-symbols-outlined">smart_toy</span>
      </button>
      <div class="fab-menu" aria-hidden="true">
        <button class="fab-menu-item" data-action="new-chat" data-md-tooltip="New Chat">
          <span class="material-symbols-outlined">add_comment</span>
        </button>
        <button class="fab-menu-item" data-action="search" data-md-tooltip="Search">
          <span class="material-symbols-outlined">search</span>
        </button>
        <button class="fab-menu-item" data-action="templates" data-md-tooltip="Templates">
          <span class="material-symbols-outlined">library_books</span>
        </button>
      </div>
    `;
    
    // Create main copilot panel with enhanced features
    const panel = document.createElement('div');
    panel.className = 'ai-copilot-panel enhanced';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'AI Assistant');
    panel.innerHTML = `
      <div class="copilot-container">
        <!-- Resize handles -->
        <div class="resize-handle resize-n" data-direction="n"></div>
        <div class="resize-handle resize-e" data-direction="e"></div>
        <div class="resize-handle resize-s" data-direction="s"></div>
        <div class="resize-handle resize-w" data-direction="w"></div>
        <div class="resize-handle resize-ne" data-direction="ne"></div>
        <div class="resize-handle resize-se" data-direction="se"></div>
        <div class="resize-handle resize-sw" data-direction="sw"></div>
        <div class="resize-handle resize-nw" data-direction="nw"></div>
        
        <!-- Header with drag handle -->
        <div class="copilot-header md-typeset" data-draggable="true">
          <div class="copilot-title">
            <span class="material-symbols-outlined">smart_toy</span>
            <h3>AI Copilot</h3>
            <span class="status-indicator" aria-live="polite"></span>
          </div>
          <div class="copilot-actions">
            <button class="md-button md-button--icon" data-action="search" data-md-tooltip="Search (Ctrl+F)">
              <span class="material-symbols-outlined">search</span>
            </button>
            <button class="md-button md-button--icon" data-action="export" data-md-tooltip="Export">
              <span class="material-symbols-outlined">download</span>
            </button>
            <button class="md-button md-button--icon" data-action="dock" data-md-tooltip="Dock Mode">
              <span class="material-symbols-outlined">dock_to_right</span>
            </button>
            <button class="md-button md-button--icon" data-action="settings" data-md-tooltip="Settings">
              <span class="material-symbols-outlined">settings</span>
            </button>
            <button class="md-button md-button--icon" data-action="minimize" data-md-tooltip="Minimize">
              <span class="material-symbols-outlined">expand_more</span>
            </button>
            <button class="md-button md-button--icon" data-action="close" data-md-tooltip="Close (Esc)">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <!-- Conversation Tabs -->
        <div class="conversation-tabs">
          <div class="tabs-container">
            <div class="tab active" data-conversation-id="default">
              <span class="tab-title">Chat 1</span>
              <button class="tab-close" aria-label="Close tab">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <button class="tab-new" data-action="new-conversation" aria-label="New conversation">
              <span class="material-symbols-outlined">add</span>
            </button>
          </div>
        </div>

        <!-- Search Bar (hidden by default) -->
        <div class="copilot-search" style="display: none;">
          <input type="search" class="search-input" placeholder="Search conversations..." />
          <button class="search-close">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Quick Actions Bar (Collapsible) -->
        <div class="copilot-quick-actions collapsible">
          <button class="collapse-toggle" aria-expanded="true" aria-label="Toggle quick actions">
            <span class="material-symbols-outlined">expand_less</span>
          </button>
          <div class="quick-actions-content">
            <div class="quick-actions-categories">
              <div class="action-category" data-category="writing">
                <button class="quick-action" data-action="improve" title="Improve writing">
                  <span class="material-symbols-outlined">auto_fix_high</span>
                  <span class="action-label">Improve</span>
                </button>
                <button class="quick-action" data-action="summarize" title="Summarize">
                  <span class="material-symbols-outlined">summarize</span>
                  <span class="action-label">Summarize</span>
                </button>
                <button class="quick-action" data-action="fix" title="Fix grammar">
                  <span class="material-symbols-outlined">spellcheck</span>
                  <span class="action-label">Fix</span>
                </button>
              </div>
              <div class="action-category" data-category="code">
                <button class="quick-action" data-action="explain" title="Explain code">
                  <span class="material-symbols-outlined">help</span>
                  <span class="action-label">Explain</span>
                </button>
                <button class="quick-action" data-action="code" title="Generate code">
                  <span class="material-symbols-outlined">code</span>
                  <span class="action-label">Code</span>
                </button>
                <button class="quick-action" data-action="debug" title="Debug">
                  <span class="material-symbols-outlined">bug_report</span>
                  <span class="action-label">Debug</span>
                </button>
              </div>
              <div class="action-category" data-category="tools">
                <button class="quick-action" data-action="translate" title="Translate">
                  <span class="material-symbols-outlined">translate</span>
                  <span class="action-label">Translate</span>
                </button>
                <button class="quick-action" data-action="template" title="Templates">
                  <span class="material-symbols-outlined">library_books</span>
                  <span class="action-label">Templates</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Area with enhanced features -->
        <div class="copilot-chat md-typeset" role="log" aria-live="polite">
          <div class="chat-messages" id="copilot-messages">
            <div class="chat-welcome">
              <span class="material-symbols-outlined welcome-icon">waving_hand</span>
              <p>Hi! I'm your enhanced AI assistant. I can help you:</p>
              <ul>
                <li>📝 Improve and edit your writing</li>
                <li>💻 Generate and debug code</li>
                <li>🔍 Explain complex concepts</li>
                <li>🌐 Translate content</li>
                <li>📚 Use templates for common tasks</li>
              </ul>
              <p class="welcome-hint">
                <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> to toggle • 
                <kbd>Ctrl</kbd>+<kbd>/</kbd> for shortcuts
              </p>
            </div>
          </div>
          
          <!-- Scroll to bottom button -->
          <button class="scroll-to-bottom" style="display: none;" aria-label="Scroll to bottom">
            <span class="material-symbols-outlined">arrow_downward</span>
          </button>
        </div>

        <!-- Enhanced Input Area -->
        <div class="copilot-input-area">
          <div class="input-toolbar">
            <button class="toolbar-btn" data-action="attach" data-md-tooltip="Attach context">
              <span class="material-symbols-outlined">attach_file</span>
            </button>
            <button class="toolbar-btn" data-action="voice" data-md-tooltip="Voice input (V)">
              <span class="material-symbols-outlined">mic</span>
            </button>
            <button class="toolbar-btn" data-action="template" data-md-tooltip="Templates (T)">
              <span class="material-symbols-outlined">description</span>
            </button>
            <button class="toolbar-btn" data-action="stop" style="display: none;" data-md-tooltip="Stop generation">
              <span class="material-symbols-outlined">stop_circle</span>
            </button>
          </div>
          
          <div class="input-wrapper">
            <textarea 
              class="copilot-input md-input" 
              placeholder="Ask me anything... (Enter to send, Shift+Enter for new line)"
              rows="2"
              id="copilot-input"
              aria-label="Message input"></textarea>
            <button class="md-button md-button--primary send-button" id="copilot-send" aria-label="Send message">
              <span class="material-symbols-outlined">send</span>
            </button>
          </div>
          
          <div class="input-footer">
            <span class="char-count" aria-live="polite">0 / 4000</span>
            <div class="input-status">
              <span class="model-indicator">
                <span class="material-symbols-outlined">memory</span>
                <span class="model-name">GPT-4</span>
              </span>
              <span class="typing-indicator" style="display: none;">
                <span class="typing-text">AI is typing</span>
                <span class="typing-dots">
                  <span></span><span></span><span></span>
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Templates Modal
    const templatesModal = document.createElement('div');
    templatesModal.className = 'copilot-modal templates-modal';
    templatesModal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <header class="modal-header">
          <h3>Prompt Templates</h3>
          <button class="modal-close" aria-label="Close">
            <span class="material-symbols-outlined">close</span>
          </button>
        </header>
        <div class="modal-body">
          <div class="templates-search">
            <input type="search" placeholder="Search templates..." class="template-search-input" />
          </div>
          <div class="templates-grid">
            <!-- Templates will be loaded here -->
          </div>
        </div>
      </div>
    `;

    // Export Modal
    const exportModal = document.createElement('div');
    exportModal.className = 'copilot-modal export-modal';
    exportModal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <header class="modal-header">
          <h3>Export Conversation</h3>
          <button class="modal-close" aria-label="Close">
            <span class="material-symbols-outlined">close</span>
          </button>
        </header>
        <div class="modal-body">
          <div class="export-options">
            <label class="export-option">
              <input type="radio" name="export-format" value="markdown" checked />
              <span class="option-label">
                <span class="material-symbols-outlined">description</span>
                Markdown (.md)
              </span>
            </label>
            <label class="export-option">
              <input type="radio" name="export-format" value="json" />
              <span class="option-label">
                <span class="material-symbols-outlined">data_object</span>
                JSON (.json)
              </span>
            </label>
            <label class="export-option">
              <input type="radio" name="export-format" value="pdf" />
              <span class="option-label">
                <span class="material-symbols-outlined">picture_as_pdf</span>
                PDF (.pdf)
              </span>
            </label>
            <label class="export-option">
              <input type="radio" name="export-format" value="text" />
              <span class="option-label">
                <span class="material-symbols-outlined">text_snippet</span>
                Plain Text (.txt)
              </span>
            </label>
          </div>
        </div>
        <footer class="modal-footer">
          <button class="md-button" data-action="cancel">Cancel</button>
          <button class="md-button md-button--primary" data-action="export">Export</button>
        </footer>
      </div>
    `;

    // Enhanced Settings Modal
    const settingsModal = document.createElement('div');
    settingsModal.className = 'copilot-modal settings-modal';
    settingsModal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <header class="modal-header">
          <h3>AI Copilot Settings</h3>
          <button class="modal-close" aria-label="Close">
            <span class="material-symbols-outlined">close</span>
          </button>
        </header>
        <div class="modal-body">
          <div class="settings-tabs">
            <button class="settings-tab active" data-tab="general">General</button>
            <button class="settings-tab" data-tab="ai">AI Model</button>
            <button class="settings-tab" data-tab="appearance">Appearance</button>
            <button class="settings-tab" data-tab="shortcuts">Shortcuts</button>
          </div>
          
          <div class="settings-content">
            <div class="settings-panel active" data-panel="general">
              <div class="settings-group">
                <label class="setting-label">
                  <input type="checkbox" id="stream-responses" checked />
                  <span>Stream responses</span>
                </label>
              </div>
              <div class="settings-group">
                <label class="setting-label">
                  <input type="checkbox" id="auto-save" checked />
                  <span>Auto-save conversations</span>
                </label>
              </div>
              <div class="settings-group">
                <label class="setting-label">
                  <input type="checkbox" id="sound-enabled" />
                  <span>Sound notifications</span>
                </label>
              </div>
              <div class="settings-group">
                <label>Default dock position</label>
                <select class="md-select" id="dock-position">
                  <option value="floating">Floating</option>
                  <option value="right">Dock Right</option>
                  <option value="left">Dock Left</option>
                  <option value="bottom">Dock Bottom</option>
                </select>
              </div>
            </div>
            
            <div class="settings-panel" data-panel="ai">
              <div class="settings-group">
                <label>AI Provider</label>
                <select class="md-select" id="ai-provider">
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="google">Google (Gemini)</option>
                  <option value="ollama">Ollama (Local)</option>
                </select>
              </div>
              <div class="settings-group">
                <label>Model</label>
                <select class="md-select" id="ai-model">
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="claude-3">Claude 3</option>
                  <option value="gemini-pro">Gemini Pro</option>
                </select>
              </div>
              <div class="settings-group">
                <label>Temperature <span class="temp-value">0.7</span></label>
                <input type="range" class="md-slider" id="ai-temperature" min="0" max="1" step="0.1" value="0.7" />
              </div>
              <div class="settings-group">
                <label>Max Tokens</label>
                <input type="number" class="md-input" id="max-tokens" value="2000" min="100" max="4000" />
              </div>
              <div class="settings-group">
                <label>API Key</label>
                <input type="password" class="md-input" id="ai-api-key" placeholder="Enter your API key" />
              </div>
            </div>
            
            <div class="settings-panel" data-panel="appearance">
              <div class="settings-group">
                <label>Font Size</label>
                <select class="md-select" id="font-size">
                  <option value="small">Small</option>
                  <option value="medium" selected>Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              <div class="settings-group">
                <label class="setting-label">
                  <input type="checkbox" id="high-contrast" />
                  <span>High contrast mode</span>
                </label>
              </div>
              <div class="settings-group">
                <label class="setting-label">
                  <input type="checkbox" id="compact-mode" />
                  <span>Compact mode</span>
                </label>
              </div>
              <div class="settings-group">
                <label>Theme</label>
                <select class="md-select" id="theme">
                  <option value="auto">Auto</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>
            
            <div class="settings-panel" data-panel="shortcuts">
              <div class="shortcuts-list">
                <div class="shortcut-item">
                  <span class="shortcut-action">Toggle AI Copilot</span>
                  <kbd>Ctrl+Shift+A</kbd>
                </div>
                <div class="shortcut-item">
                  <span class="shortcut-action">New conversation</span>
                  <kbd>Ctrl+N</kbd>
                </div>
                <div class="shortcut-item">
                  <span class="shortcut-action">Search</span>
                  <kbd>Ctrl+F</kbd>
                </div>
                <div class="shortcut-item">
                  <span class="shortcut-action">Export</span>
                  <kbd>Ctrl+E</kbd>
                </div>
                <div class="shortcut-item">
                  <span class="shortcut-action">Templates</span>
                  <kbd>T</kbd>
                </div>
                <div class="shortcut-item">
                  <span class="shortcut-action">Voice input</span>
                  <kbd>V</kbd>
                </div>
                <div class="shortcut-item">
                  <span class="shortcut-action">Close panel</span>
                  <kbd>Esc</kbd>
                </div>
                <div class="shortcut-item">
                  <span class="shortcut-action">Show shortcuts</span>
                  <kbd>Ctrl+/</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
        <footer class="modal-footer">
          <button class="md-button" data-action="reset">Reset to Defaults</button>
          <button class="md-button md-button--primary" data-action="save">Save Settings</button>
        </footer>
      </div>
    `;

    // Append all elements to body
    document.body.appendChild(fab);
    document.body.appendChild(panel);
    document.body.appendChild(templatesModal);
    document.body.appendChild(exportModal);
    document.body.appendChild(settingsModal);

    // Add keyboard shortcuts overlay
    this.createShortcutsOverlay();
  }

  createShortcutsOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'shortcuts-overlay';
    overlay.style.display = 'none';
    overlay.innerHTML = `
      <div class="shortcuts-content">
        <h3>Keyboard Shortcuts</h3>
        <div class="shortcuts-grid">
          <div class="shortcut-group">
            <h4>General</h4>
            <div class="shortcut"><kbd>Ctrl+Shift+A</kbd> Toggle Panel</div>
            <div class="shortcut"><kbd>Esc</kbd> Close Panel</div>
            <div class="shortcut"><kbd>Ctrl+/</kbd> Show Shortcuts</div>
          </div>
          <div class="shortcut-group">
            <h4>Navigation</h4>
            <div class="shortcut"><kbd>Ctrl+N</kbd> New Chat</div>
            <div class="shortcut"><kbd>Ctrl+Tab</kbd> Next Tab</div>
            <div class="shortcut"><kbd>Ctrl+F</kbd> Search</div>
          </div>
          <div class="shortcut-group">
            <h4>Actions</h4>
            <div class="shortcut"><kbd>Enter</kbd> Send Message</div>
            <div class="shortcut"><kbd>T</kbd> Templates</div>
            <div class="shortcut"><kbd>V</kbd> Voice Input</div>
          </div>
          <div class="shortcut-group">
            <h4>Export</h4>
            <div class="shortcut"><kbd>Ctrl+E</kbd> Export Chat</div>
            <div class="shortcut"><kbd>Ctrl+S</kbd> Save Draft</div>
          </div>
        </div>
        <p class="shortcuts-hint">Press <kbd>Ctrl+/</kbd> to close</p>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  bindEventListeners() {
    // FAB and menu
    const fab = document.querySelector('.ai-copilot-fab');
    const fabButton = fab?.querySelector('.md-fab__button');
    
    fabButton?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (e.shiftKey) {
        fab.classList.toggle('menu-open');
      } else {
        this.togglePanel();
      }
    });

    // FAB menu items
    document.querySelectorAll('.fab-menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        this.handleFabMenuAction(action);
        fab?.classList.remove('menu-open');
      });
    });

    // Panel drag and resize
    this.initializeDragResize();

    // Panel actions
    this.bindPanelActions();

    // Quick actions
    this.bindQuickActions();

    // Input handling
    this.bindInputHandlers();

    // Conversation tabs
    this.bindTabHandlers();

    // Search functionality
    this.bindSearchHandlers();

    // Modal handlers
    this.bindModalHandlers();

    // Settings handlers
    this.bindSettingsHandlers();

    // Collapsible sections
    this.bindCollapsibleHandlers();

    // Text selection
    document.addEventListener('mouseup', () => {
      const selection = window.getSelection().toString();
      if (selection) {
        this.selectedText = selection;
        this.showSelectionActions(selection);
      }
    });

    // Window resize handler
    window.addEventListener('resize', () => this.handleWindowResize());

    // Visibility change handler (auto-save)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.settings.autoSave) {
        this.saveAllConversations();
      }
    });
  }

  initializeDragResize() {
    const panel = document.querySelector('.ai-copilot-panel');
    const header = panel?.querySelector('.copilot-header');
    
    // Dragging
    header?.addEventListener('mousedown', (e) => {
      if (e.target.closest('.copilot-actions')) return;
      if (this.settings.dockMode !== 'floating') return;
      
      this.isDragging = true;
      const rect = panel.getBoundingClientRect();
      this.dragOffset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      
      panel.classList.add('dragging');
      e.preventDefault();
    });

    // Resizing
    document.querySelectorAll('.resize-handle').forEach(handle => {
      handle.addEventListener('mousedown', (e) => {
        this.isResizing = true;
        this.resizeDirection = e.currentTarget.dataset.direction;
        this.resizeStart = {
          x: e.clientX,
          y: e.clientY,
          width: panel.offsetWidth,
          height: panel.offsetHeight,
          left: panel.offsetLeft,
          top: panel.offsetTop
        };
        
        panel.classList.add('resizing');
        e.preventDefault();
      });
    });

    // Mouse move and up handlers
    document.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        this.handleDrag(e);
      } else if (this.isResizing) {
        this.handleResize(e);
      }
    });

    document.addEventListener('mouseup', () => {
      if (this.isDragging || this.isResizing) {
        const panel = document.querySelector('.ai-copilot-panel');
        panel?.classList.remove('dragging', 'resizing');
        this.isDragging = false;
        this.isResizing = false;
        this.saveSettings();
      }
    });
  }

  handleDrag(e) {
    const panel = document.querySelector('.ai-copilot-panel');
    if (!panel) return;

    let newX = e.clientX - this.dragOffset.x;
    let newY = e.clientY - this.dragOffset.y;

    // Constrain to viewport
    const maxX = window.innerWidth - panel.offsetWidth;
    const maxY = window.innerHeight - panel.offsetHeight;
    
    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    // Snap to edges
    const snapThreshold = 20;
    if (newX < snapThreshold) newX = 0;
    if (newX > maxX - snapThreshold) newX = maxX;
    if (newY < snapThreshold) newY = 0;
    if (newY > maxY - snapThreshold) newY = maxY;

    panel.style.left = `${newX}px`;
    panel.style.top = `${newY}px`;
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';

    this.settings.position = { x: newX, y: newY };
  }

  handleResize(e) {
    const panel = document.querySelector('.ai-copilot-panel');
    if (!panel) return;

    const deltaX = e.clientX - this.resizeStart.x;
    const deltaY = e.clientY - this.resizeStart.y;
    const direction = this.resizeDirection;

    let newWidth = this.resizeStart.width;
    let newHeight = this.resizeStart.height;
    let newLeft = this.resizeStart.left;
    let newTop = this.resizeStart.top;

    // Handle resize based on direction
    if (direction.includes('e')) newWidth += deltaX;
    if (direction.includes('w')) {
      newWidth -= deltaX;
      newLeft += deltaX;
    }
    if (direction.includes('s')) newHeight += deltaY;
    if (direction.includes('n')) {
      newHeight -= deltaY;
      newTop += deltaY;
    }

    // Apply constraints
    const minWidth = 320;
    const minHeight = 400;
    const maxWidth = window.innerWidth * 0.8;
    const maxHeight = window.innerHeight * 0.9;

    newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
    newHeight = Math.max(minHeight, Math.min(newHeight, maxHeight));

    // Apply new dimensions
    panel.style.width = `${newWidth}px`;
    panel.style.height = `${newHeight}px`;
    
    if (direction.includes('w')) {
      panel.style.left = `${newLeft}px`;
    }
    if (direction.includes('n')) {
      panel.style.top = `${newTop}px`;
    }

    this.settings.size = { width: newWidth, height: newHeight };
    this.updateScrollButtons();
  }

  bindPanelActions() {
    // Close button
    document.querySelector('[data-action="close"]')?.addEventListener('click', () => {
      this.closePanel();
    });

    // Minimize button
    document.querySelector('[data-action="minimize"]')?.addEventListener('click', () => {
      this.minimizePanel();
    });

    // Settings button
    document.querySelector('[data-action="settings"]')?.addEventListener('click', () => {
      this.openSettings();
    });

    // Export button
    document.querySelector('[data-action="export"]')?.addEventListener('click', () => {
      this.openExportModal();
    });

    // Search button
    document.querySelector('[data-action="search"]')?.addEventListener('click', () => {
      this.toggleSearch();
    });

    // Dock button
    document.querySelector('[data-action="dock"]')?.addEventListener('click', () => {
      this.cycleDockMode();
    });

    // Scroll to bottom button
    document.querySelector('.scroll-to-bottom')?.addEventListener('click', () => {
      this.scrollToBottom();
    });
  }

  bindQuickActions() {
    document.querySelectorAll('.quick-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        this.executeQuickAction(action);
      });
    });

    // Template button in quick actions
    document.querySelector('[data-action="template"]')?.addEventListener('click', () => {
      this.openTemplatesModal();
    });
  }

  bindInputHandlers() {
    const input = document.getElementById('copilot-input');
    const sendBtn = document.getElementById('copilot-send');
    const voiceBtn = document.querySelector('[data-action="voice"]');
    const attachBtn = document.querySelector('[data-action="attach"]');
    const stopBtn = document.querySelector('[data-action="stop"]');

    if (input) {
      // Auto-resize textarea
      input.addEventListener('input', () => {
        this.updateCharCount();
        this.autoResizeTextarea(input);
        this.saveDraft();
      });

      // Send on Enter (without Shift)
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      // Focus input when panel opens
      input.addEventListener('focus', () => {
        this.loadDraft();
      });
    }

    sendBtn?.addEventListener('click', () => this.sendMessage());
    voiceBtn?.addEventListener('click', () => this.startVoiceInput());
    attachBtn?.addEventListener('click', () => this.attachContext());
    stopBtn?.addEventListener('click', () => this.stopGeneration());
  }

  bindTabHandlers() {
    // New conversation button
    document.querySelector('[data-action="new-conversation"]')?.addEventListener('click', () => {
      this.createNewConversation();
    });

    // Tab switching
    document.addEventListener('click', (e) => {
      if (e.target.closest('.tab:not(.tab-new)')) {
        const tab = e.target.closest('.tab');
        const conversationId = tab.dataset.conversationId;
        this.switchConversation(conversationId);
      }

      // Tab close button
      if (e.target.closest('.tab-close')) {
        e.stopPropagation();
        const tab = e.target.closest('.tab');
        const conversationId = tab.dataset.conversationId;
        this.closeConversation(conversationId);
      }
    });
  }

  bindSearchHandlers() {
    const searchInput = document.querySelector('.copilot-search .search-input');
    const searchClose = document.querySelector('.copilot-search .search-close');

    searchInput?.addEventListener('input', (e) => {
      this.searchConversations(e.target.value);
    });

    searchClose?.addEventListener('click', () => {
      this.toggleSearch(false);
    });
  }

  bindModalHandlers() {
    // Modal close buttons
    document.querySelectorAll('.modal-close, .modal-overlay').forEach(element => {
      element.addEventListener('click', (e) => {
        const modal = e.target.closest('.copilot-modal');
        this.closeModal(modal);
      });
    });

    // Export modal actions
    document.querySelector('.export-modal [data-action="export"]')?.addEventListener('click', () => {
      this.exportConversation();
    });

    // Settings modal actions
    document.querySelector('.settings-modal [data-action="save"]')?.addEventListener('click', () => {
      this.saveSettingsFromModal();
    });

    document.querySelector('.settings-modal [data-action="reset"]')?.addEventListener('click', () => {
      this.resetSettings();
    });
  }

  bindSettingsHandlers() {
    // Settings tabs
    document.querySelectorAll('.settings-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.currentTarget.dataset.tab;
        this.switchSettingsTab(tabName);
      });
    });

    // Temperature slider
    const tempSlider = document.getElementById('ai-temperature');
    tempSlider?.addEventListener('input', (e) => {
      document.querySelector('.temp-value').textContent = e.target.value;
    });
  }

  bindCollapsibleHandlers() {
    document.querySelectorAll('.collapse-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        const collapsible = e.target.closest('.collapsible');
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        
        collapsible.classList.toggle('collapsed');
        toggle.setAttribute('aria-expanded', !isExpanded);
        
        const icon = toggle.querySelector('.material-symbols-outlined');
        icon.textContent = isExpanded ? 'expand_more' : 'expand_less';
      });
    });
  }

  registerKeyboardShortcuts() {
    // Global shortcuts
    document.addEventListener('keydown', (e) => {
      const panel = document.querySelector('.ai-copilot-panel');
      const isOpen = panel?.classList.contains('active');

      // Toggle panel (Ctrl/Cmd + Shift + A)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        this.togglePanel();
      }

      // Show shortcuts overlay (Ctrl/Cmd + /)
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        this.toggleShortcutsOverlay();
      }

      // Panel-specific shortcuts (only when open)
      if (isOpen) {
        // Close panel (Esc)
        if (e.key === 'Escape') {
          e.preventDefault();
          this.closePanel();
        }

        // New conversation (Ctrl/Cmd + N)
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
          e.preventDefault();
          this.createNewConversation();
        }

        // Search (Ctrl/Cmd + F)
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
          e.preventDefault();
          this.toggleSearch();
        }

        // Export (Ctrl/Cmd + E)
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
          e.preventDefault();
          this.openExportModal();
        }

        // Save draft (Ctrl/Cmd + S)
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          this.saveDraft();
          this.showNotification('Draft saved');
        }

        // Switch tabs (Ctrl/Cmd + Tab)
        if ((e.ctrlKey || e.metaKey) && e.key === 'Tab') {
          e.preventDefault();
          this.switchToNextTab();
        }

        // Quick actions (when input not focused)
        if (!document.activeElement?.matches('input, textarea')) {
          if (e.key === 't' || e.key === 'T') {
            e.preventDefault();
            this.openTemplatesModal();
          }
          
          if (e.key === 'v' || e.key === 'V') {
            e.preventDefault();
            this.startVoiceInput();
          }
        }
      }
    });
  }

  // Conversation Management
  initializeConversation(id) {
    const conversation = {
      id: id,
      title: `Chat ${this.conversations.size + 1}`,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    this.conversations.set(id, conversation);
    this.activeConversationId = id;
    return conversation;
  }

  createNewConversation() {
    const id = `conv_${Date.now()}`;
    const conversation = this.initializeConversation(id);
    
    // Add new tab
    const tabsContainer = document.querySelector('.tabs-container');
    const newTabBtn = tabsContainer?.querySelector('.tab-new');
    
    const tab = document.createElement('div');
    tab.className = 'tab active';
    tab.dataset.conversationId = id;
    tab.innerHTML = `
      <span class="tab-title">${conversation.title}</span>
      <button class="tab-close" aria-label="Close tab">
        <span class="material-symbols-outlined">close</span>
      </button>
    `;
    
    tabsContainer?.insertBefore(tab, newTabBtn);
    
    // Switch to new conversation
    this.switchConversation(id);
    
    // Focus input
    document.getElementById('copilot-input')?.focus();
  }

  switchConversation(id) {
    // Save current conversation state
    this.saveCurrentConversation();
    
    // Update active conversation
    this.activeConversationId = id;
    
    // Update tabs UI
    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.conversationId === id);
    });
    
    // Load conversation messages
    this.loadConversation(id);
  }

  closeConversation(id) {
    if (this.conversations.size <= 1) {
      this.showNotification('Cannot close the last conversation');
      return;
    }
    
    // Remove from map
    this.conversations.delete(id);
    
    // Remove tab
    document.querySelector(`[data-conversation-id="${id}"]`)?.remove();
    
    // Switch to another conversation if this was active
    if (this.activeConversationId === id) {
      const firstId = this.conversations.keys().next().value;
      this.switchConversation(firstId);
    }
  }

  saveCurrentConversation() {
    const conversation = this.conversations.get(this.activeConversationId);
    if (conversation) {
      conversation.updatedAt = Date.now();
      if (this.settings.autoSave) {
        this.saveToLocalStorage();
      }
    }
  }

  loadConversation(id) {
    const conversation = this.conversations.get(id);
    if (!conversation) return;
    
    const messagesContainer = document.getElementById('copilot-messages');
    if (!messagesContainer) return;
    
    // Clear current messages
    messagesContainer.innerHTML = '';
    
    // Load messages or show welcome
    if (conversation.messages.length > 0) {
      conversation.messages.forEach(msg => {
        this.displayMessage(msg.role, msg.content, msg.timestamp, false);
      });
    } else {
      this.showWelcomeMessage();
    }
    
    this.scrollToBottom();
  }

  // Enhanced Message Handling
  async sendMessage(message = null) {
    const input = document.getElementById('copilot-input');
    const text = message || input?.value.trim();
    
    if (!text || this.isProcessing) return;
    
    this.isProcessing = true;
    this.addMessage('user', text);
    
    if (input) {
      input.value = '';
      this.autoResizeTextarea(input);
    }
    this.updateCharCount();
    this.clearDraft();
    
    // Show typing indicator and stop button
    this.showTypingIndicator();
    this.toggleStopButton(true);
    
    try {
      if (this.settings.streamResponses) {
        await this.streamResponse(text);
      } else {
        const response = await this.callAPI(text);
        this.addMessage('assistant', response);
      }
      
      // Play notification sound if enabled
      if (this.settings.soundEnabled) {
        this.playNotificationSound();
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        this.addMessage('error', 'Failed to get response. Please check your connection and API settings.');
      }
    } finally {
      this.hideTypingIndicator();
      this.toggleStopButton(false);
      this.isProcessing = false;
    }
  }

  async streamResponse(prompt) {
    const messagesContainer = document.getElementById('copilot-messages');
    if (!messagesContainer) return;
    
    // Create message container
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message message-assistant';
    messageDiv.innerHTML = `
      <div class="message-header">
        <span class="material-symbols-outlined message-icon">smart_toy</span>
        <span class="message-role">AI Assistant</span>
        <span class="message-time">${new Date().toLocaleTimeString()}</span>
      </div>
      <div class="message-content md-typeset streaming"></div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    const contentDiv = messageDiv.querySelector('.message-content');
    
    // Simulate streaming with mock response
    const response = this.getMockResponse(prompt);
    const words = response.split(' ');
    let currentText = '';
    
    for (let i = 0; i < words.length; i++) {
      if (this.streamController?.signal.aborted) break;
      
      currentText += (i > 0 ? ' ' : '') + words[i];
      contentDiv.innerHTML = this.formatMessage(currentText);
      this.scrollToBottom();
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 50));
    }
    
    contentDiv.classList.remove('streaming');
    
    // Add to conversation history
    const conversation = this.conversations.get(this.activeConversationId);
    if (conversation) {
      conversation.messages.push({
        role: 'assistant',
        content: currentText,
        timestamp: Date.now()
      });
    }
    
    // Add action buttons if response contains code
    if (currentText.includes('```')) {
      this.addActionButtons(currentText);
    }
  }

  stopGeneration() {
    if (this.streamController) {
      this.streamController.abort();
      this.streamController = null;
      this.showNotification('Generation stopped');
    }
  }

  // UI Helper Methods
  showTypingIndicator() {
    const indicator = document.querySelector('.typing-indicator');
    if (indicator) {
      indicator.style.display = 'flex';
    }
  }

  hideTypingIndicator() {
    const indicator = document.querySelector('.typing-indicator');
    if (indicator) {
      indicator.style.display = 'none';
    }
  }

  toggleStopButton(show) {
    const stopBtn = document.querySelector('[data-action="stop"]');
    const sendBtn = document.getElementById('copilot-send');
    
    if (stopBtn) stopBtn.style.display = show ? 'flex' : 'none';
    if (sendBtn) sendBtn.style.display = show ? 'none' : 'flex';
  }

  showWelcomeMessage() {
    const messagesContainer = document.getElementById('copilot-messages');
    if (!messagesContainer) return;
    
    messagesContainer.innerHTML = `
      <div class="chat-welcome">
        <span class="material-symbols-outlined welcome-icon">waving_hand</span>
        <p>Welcome back! How can I assist you today?</p>
        <div class="suggested-prompts">
          <button class="suggested-prompt" data-prompt="Help me improve my code">
            💻 Improve my code
          </button>
          <button class="suggested-prompt" data-prompt="Explain this concept">
            🔍 Explain a concept
          </button>
          <button class="suggested-prompt" data-prompt="Generate documentation">
            📝 Generate docs
          </button>
        </div>
      </div>
    `;
    
    // Bind suggested prompt clicks
    document.querySelectorAll('.suggested-prompt').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const prompt = e.currentTarget.dataset.prompt;
        document.getElementById('copilot-input').value = prompt;
        this.sendMessage(prompt);
      });
    });
  }

  displayMessage(role, content, timestamp = Date.now(), save = true) {
    const messagesContainer = document.getElementById('copilot-messages');
    if (!messagesContainer) return;
    
    // Remove welcome message if exists
    const welcome = messagesContainer.querySelector('.chat-welcome');
    if (welcome) welcome.remove();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message message-${role}`;
    
    const icon = {
      user: 'person',
      assistant: 'smart_toy',
      error: 'error',
      info: 'info',
      system: 'settings'
    }[role] || 'chat';
    
    const roleName = role === 'user' ? 'You' : 'AI Assistant';
    const time = new Date(timestamp).toLocaleTimeString();
    
    messageDiv.innerHTML = `
      <div class="message-header">
        <span class="material-symbols-outlined message-icon">${icon}</span>
        <span class="message-role">${roleName}</span>
        <span class="message-time">${time}</span>
        <button class="message-action" data-action="copy" aria-label="Copy">
          <span class="material-symbols-outlined">content_copy</span>
        </button>
        <button class="message-action" data-action="pin" aria-label="Pin">
          <span class="material-symbols-outlined">push_pin</span>
        </button>
      </div>
      <div class="message-content md-typeset">${this.formatMessage(content)}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    
    // Bind message actions
    messageDiv.querySelectorAll('.message-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        this.handleMessageAction(action, content, messageDiv);
      });
    });
    
    // Save to conversation
    if (save) {
      const conversation = this.conversations.get(this.activeConversationId);
      if (conversation) {
        conversation.messages.push({ role, content, timestamp });
        this.saveCurrentConversation();
      }
    }
    
    this.scrollToBottom();
    this.updateScrollButtons();
  }

  addMessage(role, content) {
    this.displayMessage(role, content, Date.now(), true);
  }

  formatMessage(content) {
    // Enhanced markdown formatting
    let formatted = content
      // Code blocks with language detection
      .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre><code class="language-${lang || 'plaintext'}">${this.escapeHtml(code)}</code></pre>`;
      })
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Bold
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      // Lists
      .replace(/^\- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      // Line breaks
      .replace(/\n/g, '<br>');
    
    return formatted;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  handleMessageAction(action, content, messageDiv) {
    switch (action) {
      case 'copy':
        navigator.clipboard.writeText(content).then(() => {
          this.showNotification('Copied to clipboard');
        });
        break;
      
      case 'pin':
        messageDiv.classList.toggle('pinned');
        const isPinned = messageDiv.classList.contains('pinned');
        this.showNotification(isPinned ? 'Message pinned' : 'Message unpinned');
        break;
    }
  }

  // Search functionality
  toggleSearch(show = null) {
    const searchBar = document.querySelector('.copilot-search');
    const isVisible = searchBar?.style.display !== 'none';
    const shouldShow = show !== null ? show : !isVisible;
    
    if (searchBar) {
      searchBar.style.display = shouldShow ? 'flex' : 'none';
      if (shouldShow) {
        searchBar.querySelector('.search-input')?.focus();
      }
    }
  }

  searchConversations(query) {
    const messages = document.querySelectorAll('.chat-message');
    const lowerQuery = query.toLowerCase();
    
    messages.forEach(msg => {
      const content = msg.textContent.toLowerCase();
      const matches = content.includes(lowerQuery);
      msg.style.display = matches || !query ? 'flex' : 'none';
      
      if (matches && query) {
        msg.classList.add('search-highlight');
      } else {
        msg.classList.remove('search-highlight');
      }
    });
  }

  // Export functionality
  openExportModal() {
    const modal = document.querySelector('.export-modal');
    modal?.classList.add('active');
  }

  async exportConversation() {
    const format = document.querySelector('input[name="export-format"]:checked')?.value || 'markdown';
    const conversation = this.conversations.get(this.activeConversationId);
    
    if (!conversation) return;
    
    let content = '';
    let filename = `conversation_${Date.now()}`;
    let mimeType = 'text/plain';
    
    switch (format) {
      case 'markdown':
        content = this.exportAsMarkdown(conversation);
        filename += '.md';
        mimeType = 'text/markdown';
        break;
      
      case 'json':
        content = JSON.stringify(conversation, null, 2);
        filename += '.json';
        mimeType = 'application/json';
        break;
      
      case 'pdf':
        // Would require additional library for PDF generation
        this.showNotification('PDF export coming soon');
        return;
      
      case 'text':
        content = this.exportAsText(conversation);
        filename += '.txt';
        mimeType = 'text/plain';
        break;
    }
    
    // Download file
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    this.closeModal(document.querySelector('.export-modal'));
    this.showNotification('Conversation exported successfully');
  }

  exportAsMarkdown(conversation) {
    let md = `# AI Copilot Conversation\n\n`;
    md += `**Created:** ${new Date(conversation.createdAt).toLocaleString()}\n`;
    md += `**Updated:** ${new Date(conversation.updatedAt).toLocaleString()}\n\n`;
    md += `---\n\n`;
    
    conversation.messages.forEach(msg => {
      const role = msg.role === 'user' ? '👤 You' : '🤖 AI Assistant';
      const time = new Date(msg.timestamp).toLocaleTimeString();
      md += `### ${role} (${time})\n\n${msg.content}\n\n---\n\n`;
    });
    
    return md;
  }

  exportAsText(conversation) {
    let text = 'AI Copilot Conversation\n';
    text += '======================\n\n';
    
    conversation.messages.forEach(msg => {
      const role = msg.role === 'user' ? 'You' : 'AI';
      const time = new Date(msg.timestamp).toLocaleTimeString();
      text += `[${time}] ${role}:\n${msg.content}\n\n`;
    });
    
    return text;
  }

  // Settings management
  openSettings() {
    const modal = document.querySelector('.settings-modal');
    modal?.classList.add('active');
    this.loadSettingsToModal();
  }

  loadSettingsToModal() {
    // Load current settings into modal
    document.getElementById('stream-responses').checked = this.settings.streamResponses;
    document.getElementById('auto-save').checked = this.settings.autoSave;
    document.getElementById('sound-enabled').checked = this.settings.soundEnabled;
    document.getElementById('dock-position').value = this.settings.dockMode;
    document.getElementById('ai-provider').value = this.settings.provider;
    document.getElementById('ai-model').value = this.settings.model;
    document.getElementById('ai-temperature').value = this.settings.temperature;
    document.getElementById('max-tokens').value = this.settings.maxTokens;
    document.getElementById('font-size').value = this.settings.fontSize;
    document.getElementById('high-contrast').checked = this.settings.highContrast;
    document.getElementById('compact-mode').checked = this.settings.compactMode;
    document.getElementById('theme').value = this.settings.theme;
    
    // Update temperature display
    document.querySelector('.temp-value').textContent = this.settings.temperature;
  }

  saveSettingsFromModal() {
    // Save settings from modal
    this.settings.streamResponses = document.getElementById('stream-responses').checked;
    this.settings.autoSave = document.getElementById('auto-save').checked;
    this.settings.soundEnabled = document.getElementById('sound-enabled').checked;
    this.settings.dockMode = document.getElementById('dock-position').value;
    this.settings.provider = document.getElementById('ai-provider').value;
    this.settings.model = document.getElementById('ai-model').value;
    this.settings.temperature = parseFloat(document.getElementById('ai-temperature').value);
    this.settings.maxTokens = parseInt(document.getElementById('max-tokens').value);
    this.settings.fontSize = document.getElementById('font-size').value;
    this.settings.highContrast = document.getElementById('high-contrast').checked;
    this.settings.compactMode = document.getElementById('compact-mode').checked;
    this.settings.theme = document.getElementById('theme').value;
    
    // Apply settings
    this.applySettings();
    this.saveSettings();
    
    // Close modal
    this.closeModal(document.querySelector('.settings-modal'));
    this.showNotification('Settings saved');
  }

  applySettings() {
    const panel = document.querySelector('.ai-copilot-panel');
    if (!panel) return;
    
    // Apply theme
    this.applyTheme();
    
    // Apply font size
    panel.setAttribute('data-font-size', this.settings.fontSize);
    
    // Apply high contrast
    panel.classList.toggle('high-contrast', this.settings.highContrast);
    
    // Apply compact mode
    panel.classList.toggle('compact', this.settings.compactMode);
    
    // Apply dock mode
    this.setDockMode(this.settings.dockMode);
    
    // Update model indicator
    document.querySelector('.model-name').textContent = this.settings.model.toUpperCase();
  }

  // Dock mode management
  cycleDockMode() {
    const modes = ['floating', 'right', 'left', 'bottom'];
    const currentIndex = modes.indexOf(this.settings.dockMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    const nextMode = modes[nextIndex];
    
    this.setDockMode(nextMode);
    this.settings.dockMode = nextMode;
    this.saveSettings();
    
    this.showNotification(`Dock mode: ${nextMode}`);
  }

  setDockMode(mode) {
    const panel = document.querySelector('.ai-copilot-panel');
    if (!panel) return;
    
    // Remove all dock classes
    panel.classList.remove('dock-right', 'dock-left', 'dock-bottom', 'floating');
    
    // Apply new dock mode
    switch (mode) {
      case 'right':
        panel.classList.add('dock-right');
        panel.style.left = 'auto';
        panel.style.right = '0';
        panel.style.top = '0';
        panel.style.bottom = '0';
        panel.style.width = `${this.settings.size.width}px`;
        panel.style.height = '100%';
        break;
      
      case 'left':
        panel.classList.add('dock-left');
        panel.style.left = '0';
        panel.style.right = 'auto';
        panel.style.top = '0';
        panel.style.bottom = '0';
        panel.style.width = `${this.settings.size.width}px`;
        panel.style.height = '100%';
        break;
      
      case 'bottom':
        panel.classList.add('dock-bottom');
        panel.style.left = '0';
        panel.style.right = '0';
        panel.style.top = 'auto';
        panel.style.bottom = '0';
        panel.style.width = '100%';
        panel.style.height = `${this.settings.size.height}px`;
        break;
      
      case 'floating':
      default:
        panel.classList.add('floating');
        this.restorePanelPosition();
        break;
    }
    
    // Update dock button icon
    const dockBtn = document.querySelector('[data-action="dock"] .material-symbols-outlined');
    if (dockBtn) {
      const icons = {
        floating: 'open_in_full',
        right: 'dock_to_right',
        left: 'dock_to_left',
        bottom: 'dock_to_bottom'
      };
      dockBtn.textContent = icons[mode] || 'dock_to_right';
    }
  }

  // Utility methods
  autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 150);
    textarea.style.height = `${newHeight}px`;
  }

  updateCharCount() {
    const input = document.getElementById('copilot-input');
    const counter = document.querySelector('.char-count');
    
    if (input && counter) {
      const count = input.value.length;
      counter.textContent = `${count} / 4000`;
      counter.classList.toggle('warning', count > 3800);
      counter.classList.toggle('error', count >= 4000);
    }
  }

  scrollToBottom() {
    const messagesContainer = document.getElementById('copilot-messages');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  updateScrollButtons() {
    const messagesContainer = document.getElementById('copilot-messages');
    const scrollBtn = document.querySelector('.scroll-to-bottom');
    
    if (messagesContainer && scrollBtn) {
      const isScrolledUp = messagesContainer.scrollHeight - messagesContainer.scrollTop > messagesContainer.clientHeight + 100;
      scrollBtn.style.display = isScrolledUp ? 'flex' : 'none';
    }
  }

  showNotification(message, duration = 3000) {
    const notification = document.createElement('div');
    notification.className = 'copilot-notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }

  playNotificationSound() {
    // Create and play a simple notification sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }

  // Storage methods
  saveSettings() {
    localStorage.setItem('ai_copilot_settings', JSON.stringify(this.settings));
  }

  loadSettings() {
    const saved = localStorage.getItem('ai_copilot_settings');
    if (saved) {
      try {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }

  saveDraft() {
    const input = document.getElementById('copilot-input');
    if (input) {
      localStorage.setItem('ai_copilot_draft', input.value);
    }
  }

  loadDraft() {
    const input = document.getElementById('copilot-input');
    const draft = localStorage.getItem('ai_copilot_draft');
    if (input && draft) {
      input.value = draft;
      this.autoResizeTextarea(input);
      this.updateCharCount();
    }
  }

  clearDraft() {
    localStorage.removeItem('ai_copilot_draft');
  }

  saveToLocalStorage() {
    const data = {
      conversations: Array.from(this.conversations.entries()),
      activeConversationId: this.activeConversationId
    };
    localStorage.setItem('ai_copilot_conversations', JSON.stringify(data));
  }

  loadFromLocalStorage() {
    const saved = localStorage.getItem('ai_copilot_conversations');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.conversations = new Map(data.conversations);
        this.activeConversationId = data.activeConversationId;
      } catch (e) {
        console.error('Failed to load conversations:', e);
      }
    }
  }

  // Panel state methods
  togglePanel() {
    const panel = document.querySelector('.ai-copilot-panel');
    const isActive = panel?.classList.contains('active');
    
    if (isActive) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  openPanel() {
    const panel = document.querySelector('.ai-copilot-panel');
    panel?.classList.add('active');
    
    // Focus input
    setTimeout(() => {
      document.getElementById('copilot-input')?.focus();
    }, 100);
    
    // Update scroll buttons
    this.updateScrollButtons();
  }

  closePanel() {
    const panel = document.querySelector('.ai-copilot-panel');
    panel?.classList.remove('active');
    
    // Save state
    this.saveCurrentConversation();
  }

  minimizePanel() {
    const panel = document.querySelector('.ai-copilot-panel');
    const isMinimized = panel?.classList.contains('minimized');
    
    panel?.classList.toggle('minimized');
    
    const minimizeBtn = document.querySelector('[data-action="minimize"] .material-symbols-outlined');
    if (minimizeBtn) {
      minimizeBtn.textContent = isMinimized ? 'expand_more' : 'expand_less';
    }
  }

  restorePanelState() {
    if (this.settings.position.x !== null && this.settings.position.y !== null) {
      this.restorePanelPosition();
    }
    
    if (this.settings.size.width && this.settings.size.height) {
      this.restorePanelSize();
    }
  }

  restorePanelPosition() {
    const panel = document.querySelector('.ai-copilot-panel');
    if (panel && this.settings.dockMode === 'floating') {
      panel.style.left = `${this.settings.position.x}px`;
      panel.style.top = `${this.settings.position.y}px`;
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
    }
  }

  restorePanelSize() {
    const panel = document.querySelector('.ai-copilot-panel');
    if (panel) {
      panel.style.width = `${this.settings.size.width}px`;
      panel.style.height = `${this.settings.size.height}px`;
    }
  }

  handleWindowResize() {
    const panel = document.querySelector('.ai-copilot-panel');
    if (!panel || this.settings.dockMode !== 'floating') return;
    
    // Ensure panel stays within viewport
    const rect = panel.getBoundingClientRect();
    let adjusted = false;
    
    if (rect.right > window.innerWidth) {
      panel.style.left = `${window.innerWidth - panel.offsetWidth}px`;
      adjusted = true;
    }
    
    if (rect.bottom > window.innerHeight) {
      panel.style.top = `${window.innerHeight - panel.offsetHeight}px`;
      adjusted = true;
    }
    
    if (adjusted) {
      this.settings.position = {
        x: panel.offsetLeft,
        y: panel.offsetTop
      };
      this.saveSettings();
    }
  }

  // Template management
  async loadTemplates() {
    // Load default templates
    this.templates = [
      {
        id: 'improve-code',
        title: 'Improve Code',
        category: 'Code',
        prompt: 'Please review and improve the following code:\n\n{selection}',
        icon: 'auto_fix_high'
      },
      {
        id: 'explain-code',
        title: 'Explain Code',
        category: 'Code',
        prompt: 'Please explain what this code does in simple terms:\n\n{selection}',
        icon: 'help'
      },
      {
        id: 'write-tests',
        title: 'Write Tests',
        category: 'Code',
        prompt: 'Please write comprehensive tests for the following code:\n\n{selection}',
        icon: 'bug_report'
      },
      {
        id: 'improve-writing',
        title: 'Improve Writing',
        category: 'Writing',
        prompt: 'Please improve the following text for clarity and professionalism:\n\n{selection}',
        icon: 'edit_note'
      },
      {
        id: 'summarize',
        title: 'Summarize',
        category: 'Writing',
        prompt: 'Please provide a concise summary of the following:\n\n{selection}',
        icon: 'summarize'
      },
      {
        id: 'translate',
        title: 'Translate',
        category: 'Language',
        prompt: 'Please translate the following to {language}:\n\n{selection}',
        icon: 'translate'
      }
    ];
    
    // Load user templates from storage
    const userTemplates = localStorage.getItem('ai_copilot_templates');
    if (userTemplates) {
      try {
        const parsed = JSON.parse(userTemplates);
        this.templates = [...this.templates, ...parsed];
      } catch (e) {
        console.error('Failed to load user templates:', e);
      }
    }
  }

  openTemplatesModal() {
    const modal = document.querySelector('.templates-modal');
    if (!modal) return;
    
    modal.classList.add('active');
    this.renderTemplates();
  }

  renderTemplates(filter = '') {
    const grid = document.querySelector('.templates-grid');
    if (!grid) return;
    
    const filtered = this.templates.filter(t => 
      t.title.toLowerCase().includes(filter.toLowerCase()) ||
      t.category.toLowerCase().includes(filter.toLowerCase())
    );
    
    grid.innerHTML = filtered.map(template => `
      <div class="template-card" data-template-id="${template.id}">
        <div class="template-icon">
          <span class="material-symbols-outlined">${template.icon}</span>
        </div>
        <div class="template-content">
          <h4>${template.title}</h4>
          <span class="template-category">${template.category}</span>
        </div>
      </div>
    `).join('');
    
    // Bind click handlers
    grid.querySelectorAll('.template-card').forEach(card => {
      card.addEventListener('click', () => {
        const templateId = card.dataset.templateId;
        this.applyTemplate(templateId);
      });
    });
  }

  applyTemplate(templateId) {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return;
    
    let prompt = template.prompt;
    
    // Replace placeholders
    prompt = prompt.replace('{selection}', this.selectedText || '[Your text here]');
    prompt = prompt.replace('{language}', 'Spanish'); // Default, could be configurable
    
    // Set input value
    const input = document.getElementById('copilot-input');
    if (input) {
      input.value = prompt;
      this.autoResizeTextarea(input);
      this.updateCharCount();
    }
    
    // Close modal
    this.closeModal(document.querySelector('.templates-modal'));
    
    // Focus input
    input?.focus();
  }

  // Modal management
  closeModal(modal) {
    if (modal) {
      modal.classList.remove('active');
    }
  }

  switchSettingsTab(tabName) {
    // Update tab UI
    document.querySelectorAll('.settings-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Update panel UI
    document.querySelectorAll('.settings-panel').forEach(panel => {
      panel.classList.toggle('active', panel.dataset.panel === tabName);
    });
  }

  // Shortcuts overlay
  toggleShortcutsOverlay() {
    const overlay = document.querySelector('.shortcuts-overlay');
    if (overlay) {
      const isVisible = overlay.style.display !== 'none';
      overlay.style.display = isVisible ? 'none' : 'flex';
    }
  }

  // Voice input
  startVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      this.showNotification('Voice input not supported in this browser');
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    
    const voiceBtn = document.querySelector('[data-action="voice"]');
    const input = document.getElementById('copilot-input');
    
    recognition.onstart = () => {
      voiceBtn?.classList.add('recording');
      this.showNotification('Listening...');
    };
    
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      
      if (input) {
        input.value = transcript;
        this.autoResizeTextarea(input);
        this.updateCharCount();
      }
    };
    
    recognition.onerror = (event) => {
      voiceBtn?.classList.remove('recording');
      this.showNotification(`Voice input error: ${event.error}`);
    };
    
    recognition.onend = () => {
      voiceBtn?.classList.remove('recording');
    };
    
    recognition.start();
  }

  // Context attachment
  attachContext() {
    const context = this.getEditorContent();
    if (context) {
      const input = document.getElementById('copilot-input');
      if (input) {
        input.value = `Context from editor:\n\`\`\`\n${context.substring(0, 1000)}\n\`\`\`\n\n${input.value}`;
        this.autoResizeTextarea(input);
        this.updateCharCount();
        this.showNotification('Context attached');
      }
    } else {
      this.showNotification('No editor content to attach');
    }
  }

  // Selection actions
  showSelectionActions(selection) {
    // Could show a floating menu with quick actions for selected text
    // For now, just store the selection
    this.selectedText = selection;
  }

  // Tab management
  switchToNextTab() {
    const tabs = Array.from(document.querySelectorAll('.tab:not(.tab-new)'));
    const currentIndex = tabs.findIndex(tab => tab.classList.contains('active'));
    const nextIndex = (currentIndex + 1) % tabs.length;
    
    if (tabs[nextIndex]) {
      const conversationId = tabs[nextIndex].dataset.conversationId;
      this.switchConversation(conversationId);
    }
  }

  // Additional helper methods continue...
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

  getEditorContent() {
    if (this.editor && this.editor.getContent) {
      return this.editor.getContent();
    }
    return '';
  }

  async executeQuickAction(action) {
    const context = this.selectedText || this.getEditorContent();
    if (!context && action !== 'code' && action !== 'template') {
      this.addMessage('info', 'Please select some text or have content in the editor.');
      return;
    }

    const prompts = {
      explain: `Explain the following in simple terms:\n\n${context}`,
      improve: `Improve the following text for clarity, style, and professionalism:\n\n${context}`,
      summarize: `Provide a concise summary of the following:\n\n${context}`,
      translate: `Translate the following to Spanish (or detect and translate to English if already in another language):\n\n${context}`,
      code: `Generate code based on the following description:\n\n${context || 'Create a Python function that calculates fibonacci numbers'}`,
      fix: `Fix grammar, spelling, and punctuation in the following:\n\n${context}`,
      debug: `Debug and fix the following code:\n\n${context}`,
      template: null // Opens template modal instead
    };

    if (action === 'template') {
      this.openTemplatesModal();
    } else if (prompts[action]) {
      await this.sendMessage(prompts[action]);
    }
  }

  async callAPI(prompt) {
    // Check if using mock mode
    if (!this.settings.apiEndpoint || !localStorage.getItem('ai_api_key')) {
      return this.getMockResponse(prompt);
    }

    const context = this.getEditorContent();
    
    // Create abort controller for stopping generation
    this.streamController = new AbortController();
    
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
        chatHistory: this.chatHistory.slice(-5),
        stream: this.settings.streamResponses
      }),
      signal: this.streamController.signal
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
      
      debug: `I've identified the following issues in your code:

1. **Syntax Error**: Missing closing parenthesis on line 5
2. **Logic Error**: The loop condition will cause an infinite loop
3. **Performance Issue**: Consider using a more efficient algorithm

Here's the corrected version:
\`\`\`javascript
// Fixed code here
\`\`\``,
      
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

  addActionButtons(content) {
    const messagesContainer = document.getElementById('copilot-messages');
    if (!messagesContainer) return;

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'message-actions-bar';
    actionsDiv.innerHTML = `
      <button class="md-button md-button--primary" onclick="enhancedMaterialAICopilot.applyToEditor('${btoa(content)}')">
        <span class="material-symbols-outlined">edit_note</span>
        Apply to Editor
      </button>
      <button class="md-button" onclick="enhancedMaterialAICopilot.copyToClipboard('${btoa(content)}')">
        <span class="material-symbols-outlined">content_copy</span>
        Copy
      </button>
      <button class="md-button" onclick="enhancedMaterialAICopilot.insertBelow('${btoa(content)}')">
        <span class="material-symbols-outlined">add_box</span>
        Insert Below
      </button>
    `;
    
    messagesContainer.appendChild(actionsDiv);
  }

  applyToEditor(encodedContent) {
    const content = atob(encodedContent);
    
    if (!this.editor) {
      this.copyToClipboard(encodedContent);
      this.showNotification('No editor detected. Content copied to clipboard.');
      return;
    }
    
    // Extract code from markdown if present
    const codeMatch = content.match(/```[\w]*\n?([\s\S]*?)```/);
    const textToApply = codeMatch ? codeMatch[1].trim() : content;
    
    this.editor.insertText(textToApply);
    this.showNotification('Applied to editor');
  }

  insertBelow(encodedContent) {
    const content = atob(encodedContent);
    
    if (!this.editor) {
      this.copyToClipboard(encodedContent);
      return;
    }
    
    // Move to end of current selection and insert
    const currentContent = this.editor.getContent();
    const newContent = currentContent + '\n\n' + content;
    this.editor.instance.value = newContent;
    
    this.showNotification('Inserted below current content');
  }

  copyToClipboard(encodedContent) {
    const content = atob(encodedContent);
    navigator.clipboard.writeText(content).then(() => {
      this.showNotification('Copied to clipboard');
    });
  }

  applyTheme() {
    const panel = document.querySelector('.ai-copilot-panel');
    if (!panel) return;

    let isDark = false;
    
    if (this.settings.theme === 'auto') {
      isDark = document.body.getAttribute('data-md-color-scheme') === 'slate' ||
               window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      isDark = this.settings.theme === 'dark';
    }
    
    panel.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }

  resetSettings() {
    this.settings = {
      enabled: true,
      provider: 'openai',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      apiEndpoint: '/api/ai-copilot',
      theme: 'auto',
      position: { x: null, y: null },
      size: { width: 420, height: 600 },
      dockMode: 'floating',
      compactMode: false,
      autoSave: true,
      streamResponses: true,
      soundEnabled: false,
      fontSize: 'medium',
      highContrast: false
    };
    
    this.saveSettings();
    this.applySettings();
    this.showNotification('Settings reset to defaults');
  }

  saveAllConversations() {
    this.saveCurrentConversation();
    this.saveToLocalStorage();
  }

  handleFabMenuAction(action) {
    switch (action) {
      case 'new-chat':
        this.openPanel();
        this.createNewConversation();
        break;
      case 'search':
        this.openPanel();
        this.toggleSearch(true);
        break;
      case 'templates':
        this.openPanel();
        this.openTemplatesModal();
        break;
    }
  }
}

// Initialize enhanced AI Copilot
const enhancedMaterialAICopilot = new EnhancedMaterialAICopilot();

// Export for global access
window.enhancedMaterialAICopilot = enhancedMaterialAICopilot;