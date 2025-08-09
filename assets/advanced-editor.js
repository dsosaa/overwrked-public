// ========== ADVANCED MARKDOWN EDITOR WITH OBSIDIAN INTEGRATION ==========

// Monaco Editor instance
let monacoEditor = null;
let currentFile = null;
let isAutoSaving = false;
let aiAssistant = null;

// Initialize advanced editor when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initAdvancedEditor();
  initObsidianSync();
  initAIAssistant();
  initSmartFeatures();
});

// ========== ADVANCED MONACO EDITOR ==========

function initAdvancedEditor() {
  // Create advanced editor button
  const editorTrigger = document.createElement('button');
  editorTrigger.className = 'advanced-editor-trigger';
  editorTrigger.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>
    Advanced Editor
  `;
  editorTrigger.onclick = openAdvancedEditor;
  document.body.appendChild(editorTrigger);
  
  // Create editor overlay
  const editorOverlay = document.createElement('div');
  editorOverlay.className = 'advanced-editor-overlay';
  editorOverlay.innerHTML = `
    <div class="advanced-editor-container">
      <div class="editor-header">
        <div class="editor-title">
          <div class="file-info">
            <span class="file-name" id="current-file-name">New Note</span>
            <span class="file-status" id="file-status">●</span>
          </div>
        </div>
        <div class="editor-toolbar">
          <button class="toolbar-btn" onclick="togglePreview()" title="Toggle Preview (Ctrl+Shift+P)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
          </button>
          <button class="toolbar-btn" onclick="toggleAIAssistant()" title="AI Assistant (Ctrl+Shift+A)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </button>
          <button class="toolbar-btn" onclick="saveToObsidian()" title="Sync to Obsidian (Ctrl+S)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
            </svg>
          </button>
          <button class="toolbar-btn" onclick="closeAdvancedEditor()" title="Close (Esc)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 0 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="editor-content">
        <div class="editor-sidebar">
          <div class="sidebar-section">
            <h4>File Explorer</h4>
            <div class="file-tree" id="obsidian-file-tree">
              <div class="loading">Loading vault structure...</div>
            </div>
          </div>
          <div class="sidebar-section">
            <h4>AI Assistant</h4>
            <div class="ai-panel" id="ai-assistant-panel">
              <div class="ai-suggestions" id="ai-suggestions"></div>
              <div class="ai-input-group">
                <input type="text" class="ai-input" placeholder="Ask AI to help with your note..." id="ai-prompt">
                <button class="ai-send-btn" onclick="sendAIPrompt()">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="editor-main">
          <div class="editor-panes">
            <div class="editor-pane" id="monaco-container">
              <div id="monaco-editor"></div>
            </div>
            <div class="preview-pane" id="preview-pane" style="display: none;">
              <div class="preview-content" id="preview-content"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="editor-footer">
        <div class="status-bar">
          <span class="status-item" id="word-count">0 words</span>
          <span class="status-item" id="char-count">0 characters</span>
          <span class="status-item" id="cursor-position">Ln 1, Col 1</span>
          <span class="status-item" id="sync-status">Ready</span>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(editorOverlay);
}

function openAdvancedEditor(filePath = null) {
  const overlay = document.querySelector('.advanced-editor-overlay');
  if (overlay) {
    overlay.classList.add('active');
    
    // Initialize Monaco Editor
    setTimeout(() => {
      initMonacoEditor();
      if (filePath) {
        loadFileFromObsidian(filePath);
      } else {
        loadNewFile();
      }
      loadObsidianFileTree();
    }, 100);
  }
}

function closeAdvancedEditor() {
  const overlay = document.querySelector('.advanced-editor-overlay');
  if (overlay) {
    if (monacoEditor) {
      monacoEditor.dispose();
      monacoEditor = null;
    }
    overlay.classList.remove('active');
  }
}

async function initMonacoEditor() {
  // Load Monaco Editor from CDN
  if (!window.monaco) {
    await loadMonacoEditor();
  }
  
  const container = document.getElementById('monaco-editor');
  if (container && window.monaco) {
    monacoEditor = monaco.editor.create(container, {
      value: '# New Note\n\nStart writing your note here...',
      language: 'markdown',
      theme: 'vs-dark',
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Consolas, monospace',
      lineNumbers: 'on',
      wordWrap: 'on',
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      suggest: {
        showWords: true,
        showSnippets: true
      }
    });
    
    // Add custom keybindings
    monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, saveToObsidian);
    monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KEY_P, togglePreview);
    monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KEY_A, toggleAIAssistant);
    
    // Auto-save functionality
    monacoEditor.onDidChangeModelContent(() => {
      updateWordCount();
      updateCursorPosition();
      debounceAutoSave();
      updatePreview();
    });
    
    // Cursor position tracking
    monacoEditor.onDidChangeCursorPosition(updateCursorPosition);
  }
}

async function loadMonacoEditor() {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js';
    script.onload = () => {
      require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });
      require(['vs/editor/editor.main'], resolve);
    };
    document.head.appendChild(script);
  });
}

// ========== OBSIDIAN INTEGRATION ==========

function initObsidianSync() {
  // Initialize connection to Obsidian Local REST API
  console.log('Initializing Obsidian sync...');
  
  // Check if Obsidian Local REST API is available
  checkObsidianConnection();
}

async function checkObsidianConnection() {
  try {
    const response = await fetch('http://localhost:27123/vault', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + getObsidianAPIKey()
      }
    });
    
    if (response.ok) {
      updateSyncStatus('Connected to Obsidian', 'success');
      return true;
    }
  } catch (error) {
    updateSyncStatus('Obsidian not connected', 'warning');
    console.log('Obsidian Local REST API not available. Using simulation mode.');
  }
  return false;
}

async function loadObsidianFileTree() {
  const treeContainer = document.getElementById('obsidian-file-tree');
  
  try {
    // Simulate file tree (in real implementation, this would fetch from Obsidian API)
    const files = [
      { name: 'Projects', type: 'folder', children: [
        { name: 'project-blueprint.md', type: 'file', path: 'Projects/project-blueprint.md' },
        { name: 'telegram-bot.md', type: 'file', path: 'Projects/telegram-bot.md' }
      ]},
      { name: 'Notes', type: 'folder', children: [
        { name: 'daily-notes.md', type: 'file', path: 'Notes/daily-notes.md' }
      ]},
      { name: 'Templates', type: 'folder', children: [
        { name: 'note-template.md', type: 'file', path: 'Templates/note-template.md' }
      ]}
    ];
    
    treeContainer.innerHTML = renderFileTree(files);
  } catch (error) {
    treeContainer.innerHTML = '<div class="error">Failed to load file tree</div>';
  }
}

function renderFileTree(files) {
  return files.map(file => {
    if (file.type === 'folder') {
      return `
        <div class="tree-folder">
          <div class="tree-item folder" onclick="toggleFolder(this)">
            <span class="folder-icon">📁</span>
            <span class="item-name">${file.name}</span>
          </div>
          <div class="tree-children">
            ${file.children ? renderFileTree(file.children) : ''}
          </div>
        </div>
      `;
    } else {
      return `
        <div class="tree-item file" onclick="loadFileFromObsidian('${file.path}')">
          <span class="file-icon">📄</span>
          <span class="item-name">${file.name}</span>
        </div>
      `;
    }
  }).join('');
}

async function loadFileFromObsidian(filePath) {
  currentFile = filePath;
  updateFileName(filePath);
  updateSyncStatus('Loading...', 'info');
  
  try {
    // Simulate loading file content (in real implementation, fetch from Obsidian API)
    const content = await simulateFileLoad(filePath);
    
    if (monacoEditor) {
      monacoEditor.setValue(content);
    }
    
    updateSyncStatus('File loaded', 'success');
  } catch (error) {
    updateSyncStatus('Failed to load file', 'error');
    console.error('Error loading file:', error);
  }
}

async function saveToObsidian() {
  if (!monacoEditor || !currentFile) return;
  
  const content = monacoEditor.getValue();
  updateSyncStatus('Saving...', 'info');
  
  try {
    // Simulate saving to Obsidian (in real implementation, use Obsidian API)
    await simulateFileSave(currentFile, content);
    updateSyncStatus('Saved to Obsidian', 'success');
    
    // Auto-hide success message after 2 seconds
    setTimeout(() => {
      updateSyncStatus('Ready', 'ready');
    }, 2000);
  } catch (error) {
    updateSyncStatus('Failed to save', 'error');
    console.error('Error saving file:', error);
  }
}

// ========== AI ASSISTANT INTEGRATION ==========

function initAIAssistant() {
  aiAssistant = {
    context: '',
    suggestions: [],
    isActive: false
  };
  
  // Add AI input listener
  const aiInput = document.getElementById('ai-prompt');
  if (aiInput) {
    aiInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendAIPrompt();
      }
    });
  }
}

async function sendAIPrompt() {
  const promptInput = document.getElementById('ai-prompt');
  const suggestionsContainer = document.getElementById('ai-suggestions');
  
  if (!promptInput || !suggestionsContainer) return;
  
  const prompt = promptInput.value.trim();
  if (!prompt) return;
  
  promptInput.value = '';
  
  // Add user message
  addAIMessage('user', prompt);
  
  // Show loading
  addAIMessage('assistant', 'Thinking...', true);
  
  try {
    // Simulate AI response (in real implementation, integrate with OpenAI/Claude API)
    const response = await simulateAIResponse(prompt, monacoEditor?.getValue() || '');
    
    // Remove loading message and add real response
    removeLoadingMessage();
    addAIMessage('assistant', response);
    
    // Apply suggestions if any
    if (response.includes('SUGGESTION:')) {
      const suggestion = response.split('SUGGESTION:')[1].trim();
      addApplySuggestionButton(suggestion);
    }
  } catch (error) {
    removeLoadingMessage();
    addAIMessage('assistant', 'Sorry, I encountered an error. Please try again.');
  }
}

function addAIMessage(role, content, isLoading = false) {
  const suggestionsContainer = document.getElementById('ai-suggestions');
  const messageDiv = document.createElement('div');
  messageDiv.className = `ai-message ${role} ${isLoading ? 'loading' : ''}`;
  messageDiv.innerHTML = `
    <div class="message-content">${content}</div>
    ${isLoading ? '<div class="loading-dots"><span></span><span></span><span></span></div>' : ''}
  `;
  suggestionsContainer.appendChild(messageDiv);
  suggestionsContainer.scrollTop = suggestionsContainer.scrollHeight;
}

function removeLoadingMessage() {
  const loadingMessage = document.querySelector('.ai-message.loading');
  if (loadingMessage) {
    loadingMessage.remove();
  }
}

function addApplySuggestionButton(suggestion) {
  const suggestionsContainer = document.getElementById('ai-suggestions');
  const buttonDiv = document.createElement('div');
  buttonDiv.className = 'ai-action';
  buttonDiv.innerHTML = `
    <button class="apply-suggestion-btn" onclick="applySuggestion('${suggestion.replace(/'/g, "\\'")}')">
      Apply Suggestion
    </button>
  `;
  suggestionsContainer.appendChild(buttonDiv);
}

function applySuggestion(suggestion) {
  if (monacoEditor) {
    const currentContent = monacoEditor.getValue();
    const newContent = currentContent + '\n\n' + suggestion;
    monacoEditor.setValue(newContent);
    
    addAIMessage('system', 'Suggestion applied to your note!');
  }
}

// ========== UTILITY FUNCTIONS ==========

function togglePreview() {
  const previewPane = document.getElementById('preview-pane');
  const editorPane = document.querySelector('.editor-pane');
  
  if (previewPane.style.display === 'none') {
    previewPane.style.display = 'block';
    editorPane.style.width = '50%';
    previewPane.style.width = '50%';
    updatePreview();
  } else {
    previewPane.style.display = 'none';
    editorPane.style.width = '100%';
  }
}

function updatePreview() {
  const previewContent = document.getElementById('preview-content');
  if (previewContent && monacoEditor) {
    const markdown = monacoEditor.getValue();
    // Simple markdown to HTML conversion (in real implementation, use a proper parser)
    const html = markdown
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/\n/gim, '<br>');
    
    previewContent.innerHTML = html;
  }
}

function updateWordCount() {
  const wordCountEl = document.getElementById('word-count');
  const charCountEl = document.getElementById('char-count');
  
  if (monacoEditor && wordCountEl && charCountEl) {
    const content = monacoEditor.getValue();
    const words = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    const chars = content.length;
    
    wordCountEl.textContent = `${words} words`;
    charCountEl.textContent = `${chars} characters`;
  }
}

function updateCursorPosition() {
  const cursorPosEl = document.getElementById('cursor-position');
  
  if (monacoEditor && cursorPosEl) {
    const position = monacoEditor.getPosition();
    cursorPosEl.textContent = `Ln ${position.lineNumber}, Col ${position.column}`;
  }
}

function updateSyncStatus(message, type) {
  const statusEl = document.getElementById('sync-status');
  if (statusEl) {
    statusEl.textContent = message;
    statusEl.className = `status-item sync-${type}`;
  }
}

function updateFileName(filePath) {
  const fileNameEl = document.getElementById('current-file-name');
  if (fileNameEl) {
    const fileName = filePath ? filePath.split('/').pop() : 'New Note';
    fileNameEl.textContent = fileName;
  }
}

function toggleFolder(element) {
  const children = element.parentElement.querySelector('.tree-children');
  if (children) {
    children.style.display = children.style.display === 'none' ? 'block' : 'none';
  }
}

function loadNewFile() {
  currentFile = null;
  updateFileName(null);
  if (monacoEditor) {
    monacoEditor.setValue('# New Note\n\nStart writing your note here...');
  }
}

// Auto-save with debouncing
let autoSaveTimeout;
function debounceAutoSave() {
  clearTimeout(autoSaveTimeout);
  autoSaveTimeout = setTimeout(() => {
    if (currentFile && !isAutoSaving) {
      autoSave();
    }
  }, 2000);
}

async function autoSave() {
  isAutoSaving = true;
  updateSyncStatus('Auto-saving...', 'info');
  
  try {
    await saveToObsidian();
  } catch (error) {
    console.error('Auto-save failed:', error);
  } finally {
    isAutoSaving = false;
  }
}

// ========== SIMULATION FUNCTIONS (Replace with real API calls) ==========

async function simulateFileLoad(filePath) {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  
  // Return sample content based on file path
  const sampleContent = {
    'Projects/project-blueprint.md': `# Project Blueprint: Enterprise Telegram Bot

## 🎯 Project Vision & Core Purpose

**Goal:** To build an enterprise-grade Telegram bot that transforms a Telegram channel into a comprehensive business and communication platform.

### Key Functions:
- **💰 Monetization Engine:** Sophisticated system for selling services via Stripe
- **👥 Admin Conversation Management:** Topic-based system in private admin group
- **📊 Business Intelligence:** Advanced analytics on revenue and user engagement`,
    
    'Notes/daily-notes.md': `# Daily Notes

## Today's Tasks
- [ ] Review project requirements
- [ ] Update documentation
- [ ] Test new features

## Notes
Start your daily notes here...`,
    
    'Templates/note-template.md': `# {{title}}

## Overview
Brief description of the topic.

## Main Content
Your main content goes here.

## Related Notes
- [[Link to related note]]

## Tags
#tag1 #tag2`
  };
  
  return sampleContent[filePath] || '# New Note\n\nContent goes here...';
}

async function simulateFileSave(filePath, content) {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
  console.log(`Saved file ${filePath} with ${content.length} characters`);
  return true;
}

async function simulateAIResponse(prompt, currentContent) {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate AI processing time
  
  const responses = {
    'help organize': 'I can help you organize this note! Here are some suggestions:\n\n1. Add clear headings\n2. Use bullet points for lists\n3. Add tags for better discoverability\n\nSUGGESTION: ## Summary\n\nKey points from this note...',
    
    'improve': 'Here are some ways to improve your note:\n\n• Add more specific examples\n• Include relevant links\n• Consider adding a table of contents\n\nSUGGESTION: > **💡 Tip:** Consider adding visual elements like diagrams or code blocks to make this more engaging.',
    
    'tags': 'Based on your content, I suggest these tags:\n\n#project #documentation #telegram #bot #enterprise\n\nSUGGESTION: ---\ntags: [project, documentation, telegram, bot, enterprise]\n---',
    
    default: `I can help you with your note! Here are some things I can do:

• **Organize content** - Restructure and improve layout
• **Add tags** - Suggest relevant tags
• **Improve writing** - Enhance clarity and flow
• **Create templates** - Generate reusable structures
• **Link notes** - Suggest connections to other notes

What would you like me to help with?`
  };
  
  // Simple keyword matching (in real implementation, use actual AI)
  for (const [keyword, response] of Object.entries(responses)) {
    if (keyword !== 'default' && prompt.toLowerCase().includes(keyword)) {
      return response;
    }
  }
  
  return responses.default;
}

function getObsidianAPIKey() {
  // In real implementation, this would be securely stored
  return 'your-obsidian-api-key';
}

// Global keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl+Shift+E to open advanced editor
  if (e.ctrlKey && e.shiftKey && e.key === 'E') {
    e.preventDefault();
    openAdvancedEditor();
  }
  
  // Escape to close editor
  if (e.key === 'Escape') {
    closeAdvancedEditor();
  }
});

// Export functions for global access
window.openAdvancedEditor = openAdvancedEditor;
window.closeAdvancedEditor = closeAdvancedEditor;
window.togglePreview = togglePreview;
window.toggleAIAssistant = () => {
  const panel = document.getElementById('ai-assistant-panel');
  if (panel) {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  }
};
window.saveToObsidian = saveToObsidian;
window.sendAIPrompt = sendAIPrompt;
window.applySuggestion = applySuggestion;
window.toggleFolder = toggleFolder;
