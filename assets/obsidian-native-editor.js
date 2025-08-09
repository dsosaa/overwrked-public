// ========== NATIVE OBSIDIAN-LIKE EDITOR WITH PROSEMIRROR ==========

// ProseMirror Editor instance
let proseMirrorEditor = null;
let currentFile = null;
let isEditMode = true;
let isAutoSaving = false;
let aiAssistant = null;

// Initialize native editor when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initNativeEditor();
  initObsidianSync();
  initAIAssistant();
  initSmartFeatures();
});

// ========== NATIVE OBSIDIAN EDITOR ==========

function initNativeEditor() {
  // Create native editor button
  const editorTrigger = document.createElement('button');
  editorTrigger.className = 'native-editor-trigger';
  editorTrigger.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>
    Native Editor
  `;
  editorTrigger.onclick = openNativeEditor;
  document.body.appendChild(editorTrigger);
  
  // Create editor overlay
  const editorOverlay = document.createElement('div');
  editorOverlay.className = 'native-editor-overlay';
  editorOverlay.innerHTML = `
    <div class="native-editor-container">
      <div class="editor-header">
        <div class="editor-title">
          <div class="file-info">
            <span class="file-name" id="current-file-name">New Note</span>
            <span class="file-status" id="file-status">●</span>
          </div>
        </div>
        <div class="editor-toolbar">
          <button class="toolbar-btn" onclick="toggleEditView()" title="Toggle Edit/View (Ctrl+Shift+V)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
            <span id="edit-view-label">Edit</span>
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
          <button class="toolbar-btn" onclick="closeNativeEditor()" title="Close (Esc)">
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
            <div class="editor-pane" id="prosemirror-container">
              <div id="prosemirror-editor"></div>
            </div>
            <div class="view-pane" id="view-pane" style="display: none;">
              <div class="view-content" id="view-content"></div>
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

function openNativeEditor(filePath = null) {
  const overlay = document.querySelector('.native-editor-overlay');
  if (overlay) {
    overlay.classList.add('active');
    
    // Initialize ProseMirror Editor
    setTimeout(() => {
      initProseMirrorEditor();
      if (filePath) {
        loadFileFromObsidian(filePath);
      } else {
        loadNewFile();
      }
      loadObsidianFileTree();
    }, 100);
  }
}

function closeNativeEditor() {
  const overlay = document.querySelector('.native-editor-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    if (proseMirrorEditor) {
      proseMirrorEditor.destroy();
      proseMirrorEditor = null;
    }
  }
}

async function initProseMirrorEditor() {
  // Load ProseMirror from CDN (much lighter than Monaco)
  if (!window.ProseMirror) {
    await loadProseMirror();
  }
  
  const container = document.getElementById('prosemirror-editor');
  if (container && window.ProseMirror) {
    // Create ProseMirror editor with markdown support
    proseMirrorEditor = new ProseMirror.Editor({
      mount: container,
      doc: ProseMirror.Document.fromJSON({
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "New Note" }]
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Start writing your note here..." }]
          }
        ]
      }),
      plugins: [
        ProseMirror.keymap(ProseMirror.keymap.keymap({
          "Ctrl-s": saveToObsidian,
          "Ctrl-Shift-v": toggleEditView,
          "Ctrl-Shift-a": toggleAIAssistant
        })),
        ProseMirror.markdown(),
        ProseMirror.placeholder("Start writing..."),
        ProseMirror.history(),
        ProseMirror.collab()
      ]
    });
    
    // Auto-save functionality
    proseMirrorEditor.on("update", () => {
      updateWordCount();
      updateCursorPosition();
      debounceAutoSave();
      updateView();
    });
    
    // Cursor position tracking
    proseMirrorEditor.on("selectionUpdate", updateCursorPosition);
  }
}

async function loadProseMirror() {
  return new Promise((resolve) => {
    // Load ProseMirror core (much smaller than Monaco)
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/prosemirror-view@1.32.7/dist/index.js';
    script.onload = () => {
      // Load additional ProseMirror modules
      const modules = [
        'https://unpkg.com/prosemirror-model@1.19.4/dist/index.js',
        'https://unpkg.com/prosemirror-state@1.4.3/dist/index.js',
        'https://unpkg.com/prosemirror-commands@1.5.2/dist/index.js',
        'https://unpkg.com/prosemirror-keymap@1.2.2/dist/index.js',
        'https://unpkg.com/prosemirror-markdown@1.6.0/dist/index.js',
        'https://unpkg.com/prosemirror-placeholder@1.0.0/dist/index.js',
        'https://unpror-history@1.3.0/dist/index.js',
        'https://unpkg.com/prosemirror-collab@1.3.0/dist/index.js'
      ];
      
      let loaded = 0;
      modules.forEach(src => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
          loaded++;
          if (loaded === modules.length) resolve();
        };
        document.head.appendChild(script);
      });
    };
    document.head.appendChild(script);
  });
}

// ========== EDIT/VIEW TOGGLE ==========

function toggleEditView() {
  isEditMode = !isEditMode;
  const editPane = document.getElementById('prosemirror-container');
  const viewPane = document.getElementById('view-pane');
  const editViewLabel = document.getElementById('edit-view-label');
  
  if (isEditMode) {
    // Switch to Edit mode
    editPane.style.display = 'block';
    viewPane.style.display = 'none';
    editViewLabel.textContent = 'Edit';
    
    // Focus editor
    if (proseMirrorEditor) {
      proseMirrorEditor.focus();
    }
  } else {
    // Switch to View mode
    editPane.style.display = 'none';
    viewPane.style.display = 'block';
    editViewLabel.textContent = 'View';
    
    // Update view content
    updateView();
  }
}

function updateView() {
  const viewContent = document.getElementById('view-content');
  if (viewContent && proseMirrorEditor) {
    // Get markdown content from ProseMirror
    const markdown = proseMirrorEditor.getMarkdown();
    
    // Convert markdown to HTML using a proper parser
    const html = convertMarkdownToHTML(markdown);
    viewContent.innerHTML = html;
  }
}

function convertMarkdownToHTML(markdown) {
  // Use a lightweight markdown parser (much better than regex)
  // This is a simplified version - in production, use marked.js or similar
  return markdown
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
    .replace(/\n/gim, '<br>');
}

// ========== OBSIDIAN INTEGRATION ==========

async function loadFileFromObsidian(filePath) {
  currentFile = filePath;
  updateFileName(filePath);
  updateSyncStatus('Loading from Obsidian...', 'info');
  
  try {
    console.log(`📖 Loading file from Obsidian: ${filePath}`);
    
    // Simulate loading file content (in real implementation, fetch from Obsidian API)
    const content = await simulateFileLoad(filePath);
    
    if (proseMirrorEditor) {
      // Convert markdown to ProseMirror document
      const doc = convertMarkdownToProseMirror(content);
      proseMirrorEditor.setDocument(doc);
    }
    
    updateSyncStatus('File loaded from Obsidian', 'success');
    setTimeout(() => updateSyncStatus('Ready', 'ready'), 2000);
    
    return content;
  } catch (error) {
    console.error('❌ Error loading file:', error);
    updateSyncStatus('Failed to load from Obsidian', 'error');
    return await simulateFileLoad(filePath);
  }
}

async function saveToObsidian() {
  if (!proseMirrorEditor || !currentFile) return;
  
  updateSyncStatus('Saving to Obsidian...', 'info');
  
  try {
    // Get markdown content from ProseMirror
    const markdown = proseMirrorEditor.getMarkdown();
    
    // Save to Obsidian (in real implementation, POST to Obsidian API)
    await simulateFileSave(currentFile, markdown);
    
    updateSyncStatus('Saved to Obsidian', 'success');
    setTimeout(() => updateSyncStatus('Ready', 'ready'), 2000);
    
  } catch (error) {
    console.error('❌ Error saving file:', error);
    updateSyncStatus('Failed to save to Obsidian', 'error');
  }
}

// ========== UTILITY FUNCTIONS ==========

function updateFileName(filePath) {
  const fileNameElement = document.getElementById('current-file-name');
  if (fileNameElement) {
    fileNameElement.textContent = filePath ? filePath.split('/').pop() : 'New Note';
  }
}

function updateSyncStatus(message, type) {
  const statusElement = document.getElementById('sync-status');
  if (statusElement) {
    statusElement.textContent = message;
    statusElement.className = `status-item status-${type}`;
  }
}

function updateWordCount() {
  if (!proseMirrorEditor) return;
  
  const markdown = proseMirrorEditor.getMarkdown();
  const words = markdown.trim().split(/\s+/).length;
  const chars = markdown.length;
  
  const wordCountElement = document.getElementById('word-count');
  const charCountElement = document.getElementById('char-count');
  
  if (wordCountElement) wordCountElement.textContent = `${words} words`;
  if (charCountElement) charCountElement.textContent = `${chars} characters`;
}

function updateCursorPosition() {
  if (!proseMirrorEditor) return;
  
  const selection = proseMirrorEditor.selection;
  const pos = selection.head;
  const doc = proseMirrorEditor.state.doc;
  const line = doc.lineAt(pos).number;
  const col = pos - doc.lineAt(pos).from;
  
  const cursorElement = document.getElementById('cursor-position');
  if (cursorElement) {
    cursorElement.textContent = `Ln ${line}, Col ${col}`;
  }
}

function debounceAutoSave() {
  if (isAutoSaving) return;
  
  isAutoSaving = true;
  setTimeout(() => {
    if (currentFile) {
      saveToObsidian();
    }
    isAutoSaving = false;
  }, 2000);
}

// ========== SIMULATION FUNCTIONS ==========

async function simulateFileLoad(filePath) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return sample content
  return `# ${filePath.split('/').pop().replace('.md', '')}

This is a sample note loaded from Obsidian.

## Features
- **Markdown support** with real-time preview
- **Obsidian integration** for seamless workflow
- **AI assistance** for content creation
- **Mobile optimized** for on-the-go editing

## Getting Started
1. Write your notes in markdown
2. Use the Edit/View toggle to switch modes
3. Save automatically syncs with Obsidian
4. AI assistant helps with content creation

---
*Last modified: ${new Date().toLocaleDateString()}*`;
}

async function simulateFileSave(filePath, content) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  console.log(`💾 Simulated save to Obsidian: ${filePath}`);
  console.log(`Content length: ${content.length} characters`);
  
  return { success: true, message: 'File saved successfully' };
}

// ========== AI ASSISTANT ==========

function toggleAIAssistant() {
  const aiPanel = document.getElementById('ai-assistant-panel');
  if (aiPanel) {
    aiPanel.classList.toggle('active');
  }
}

function sendAIPrompt() {
  const promptInput = document.getElementById('ai-prompt');
  const prompt = promptInput.value.trim();
  
  if (!prompt) return;
  
  // Simulate AI response
  const aiSuggestions = document.getElementById('ai-suggestions');
  if (aiSuggestions) {
    const suggestion = document.createElement('div');
    suggestion.className = 'ai-suggestion';
    suggestion.innerHTML = `
      <div class="ai-suggestion-content">
        <strong>AI Suggestion:</strong> ${prompt}
      </div>
      <button class="ai-apply-btn" onclick="applyAISuggestion(this)">Apply</button>
    `;
    aiSuggestions.appendChild(suggestion);
  }
  
  promptInput.value = '';
}

function applyAISuggestion(button) {
  const suggestion = button.parentElement.querySelector('.ai-suggestion-content');
  const text = suggestion.textContent.replace('AI Suggestion: ', '');
  
  if (proseMirrorEditor) {
    // Insert AI suggestion into editor
    const selection = proseMirrorEditor.selection;
    proseMirrorEditor.insertText(text);
  }
  
  // Remove suggestion
  button.parentElement.remove();
}

// ========== FILE TREE ==========

function loadObsidianFileTree() {
  const fileTree = document.getElementById('obsidian-file-tree');
  if (fileTree) {
    // Simulate loading file tree
    setTimeout(() => {
      fileTree.innerHTML = `
        <div class="file-tree-item">
          <span class="file-icon">📁</span>
          <span class="file-name">Projects</span>
        </div>
        <div class="file-tree-item">
          <span class="file-icon">📁</span>
          <span class="file-name">Notes</span>
        </div>
        <div class="file-tree-item">
          <span class="file-icon">📄</span>
          <span class="file-name">README.md</span>
        </div>
      `;
    }, 1000);
  }
}

// ========== SMART FEATURES ==========

function initSmartFeatures() {
  // Initialize smart features like auto-completion, templates, etc.
  console.log('🚀 Smart features initialized');
}

// ========== OBSIDIAN SYNC ==========

function initObsidianSync() {
  // Initialize Obsidian sync functionality
  console.log('🔄 Obsidian sync initialized');
}

// ========== AI ASSISTANT INIT ==========

function initAIAssistant() {
  // Initialize AI assistant functionality
  console.log('🤖 AI assistant initialized');
}

// ========== LOAD NEW FILE ==========

function loadNewFile() {
  currentFile = null;
  updateFileName(null);
  
  if (proseMirrorEditor) {
    const newDoc = ProseMirror.Document.fromJSON({
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "New Note" }]
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Start writing your note here..." }]
        }
      ]
    });
    proseMirrorEditor.setDocument(newDoc);
  }
}

// ========== CONVERT MARKDOWN TO PROSEMIRROR ==========

function convertMarkdownToProseMirror(markdown) {
  // Convert markdown to ProseMirror document structure
  // This is a simplified version - in production, use proper markdown parsing
  const lines = markdown.split('\n');
  const content = [];
  
  lines.forEach(line => {
    if (line.startsWith('# ')) {
      content.push({
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: line.substring(2) }]
      });
    } else if (line.startsWith('## ')) {
      content.push({
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: line.substring(3) }]
      });
    } else if (line.startsWith('### ')) {
      content.push({
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: line.substring(4) }]
      });
    } else if (line.trim() === '') {
      // Empty line
    } else {
      content.push({
        type: "paragraph",
        content: [{ type: "text", text: line }]
      });
    }
  });
  
  return {
    type: "doc",
    content: content
  };
}

// Export functions for global access
window.openNativeEditor = openNativeEditor;
window.closeNativeEditor = closeNativeEditor;
window.toggleEditView = toggleEditView;
window.toggleAIAssistant = toggleAIAssistant;
window.saveToObsidian = saveToObsidian;
window.sendAIPrompt = sendAIPrompt;
window.applyAISuggestion = applyAISuggestion;
