// ========== OBSIDIAN-NATIVE MARKDOWN EDITOR WITH AI COPILOT ==========
// Lightweight, performant, mobile-friendly editor that feels like native Obsidian
// Uses CodeMirror 6 loaded from CDN for optimal performance
// Includes AI Copilot integration inspired by Obsidian Copilot plugin

// ========== EDITOR STATE MANAGEMENT ==========
class ObsidianNativeEditor {
  constructor() {
    this.editor = null;
    this.currentFile = null;
    this.isAutoSaving = false;
    this.vaultFiles = new Map();
    this.settings = {
      theme: 'dark',
      fontSize: 14,
      vimMode: false,
      autoSave: true,
      livePreview: true,
      spellCheck: true,
      // AI Copilot settings
      aiEnabled: true,
      aiProvider: 'openai', // openai, anthropic, ollama
      aiModel: 'gpt-4',
      aiApiKey: '',
      aiTemperature: 0.7,
      aiMaxTokens: 2000,
      aiContextLength: 4000
    };
    this.mobileMode = this.detectMobile();
    this.copilot = null;
    this.chatHistory = [];
    this.init();
  }

  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  init() {
    // Create editor UI structure
    this.createEditorUI();
    // Initialize keyboard shortcuts
    this.initKeyboardShortcuts();
    // Setup auto-save
    this.setupAutoSave();
    // Initialize AI Copilot
    this.initCopilot();
    // Initialize touch gestures for mobile
    if (this.mobileMode) {
      this.initMobileGestures();
    }
  }

  createEditorUI() {
    const editorHTML = `
      <div class="obsidian-native-editor" id="obsidian-native-editor">
        <!-- Floating Action Button for Mobile -->
        ${this.mobileMode ? `
          <button class="native-editor-fab" id="editor-fab">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
          </button>
        ` : ''}

        <!-- Main Editor Modal -->
        <div class="native-editor-modal" id="native-editor-modal">
          <div class="native-editor-container">
            <!-- Compact Header -->
            <div class="native-editor-header">
              <div class="editor-breadcrumb">
                <span class="vault-name">Vault</span>
                <span class="separator">/</span>
                <span class="file-name" id="current-file">New Note.md</span>
              </div>
              <div class="editor-actions">
                <button class="action-btn" id="toggle-preview" title="Preview (Cmd+E)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                </button>
                <button class="action-btn" id="toggle-sidebar" title="File Explorer (Cmd+B)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 18h6c.55 0 1-.45 1-1s-.45-1-1-1H3c-.55 0-1 .45-1 1s.45 1 1 1zM3 6v1c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1zm0 7h12c.55 0 1-.45 1-1s-.45-1-1-1H3c-.55 0-1 .45-1 1s.45 1 1 1z"/>
                  </svg>
                </button>
                <button class="action-btn" id="editor-settings" title="Settings">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                  </svg>
                </button>
                <button class="action-btn close-btn" id="close-editor" title="Close (Esc)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Main Content Area -->
            <div class="native-editor-body">
              <!-- Collapsible Sidebar -->
              <div class="native-sidebar" id="native-sidebar">
                <div class="sidebar-tabs">
                  <button class="tab-btn active" data-tab="files">Files</button>
                  <button class="tab-btn" data-tab="search">Search</button>
                  <button class="tab-btn" data-tab="outline">Outline</button>
                </div>
                <div class="sidebar-content">
                  <div class="tab-pane active" id="files-tab">
                    <div class="file-tree" id="file-tree">
                      <!-- File tree will be rendered here -->
                    </div>
                  </div>
                  <div class="tab-pane" id="search-tab">
                    <input type="text" class="search-input" placeholder="Search vault..." />
                    <div class="search-results"></div>
                  </div>
                  <div class="tab-pane" id="outline-tab">
                    <div class="document-outline" id="document-outline">
                      <!-- Document outline will be rendered here -->
                    </div>
                  </div>
                </div>
              </div>

              <!-- Editor and Preview Panes -->
              <div class="native-editor-content">
                <div class="editor-pane active" id="editor-pane">
                  <div class="codemirror-container" id="codemirror-container"></div>
                </div>
                <div class="preview-pane" id="preview-pane">
                  <div class="preview-content" id="preview-content"></div>
                </div>
              </div>
            </div>

            <!-- Minimal Status Bar -->
            <div class="native-status-bar">
              <span class="status-item" id="word-count">0 words</span>
              <span class="status-item" id="cursor-pos">1:1</span>
              <span class="status-item" id="sync-status">
                <span class="sync-dot"></span>
                Saved
              </span>
            </div>
          </div>
        </div>

        <!-- Quick Command Palette -->
        <div class="command-palette" id="command-palette">
          <input type="text" class="command-input" placeholder="Type a command..." />
          <div class="command-suggestions"></div>
        </div>
      </div>
    `;

    // Inject editor into page
    const container = document.createElement('div');
    container.innerHTML = editorHTML;
    document.body.appendChild(container.firstElementChild);

    // Add event listeners
    this.attachEventListeners();
  }

  attachEventListeners() {
    // FAB button for mobile
    const fab = document.getElementById('editor-fab');
    if (fab) {
      fab.addEventListener('click', () => this.open());
    }

    // Header actions
    document.getElementById('toggle-preview')?.addEventListener('click', () => this.togglePreview());
    document.getElementById('toggle-sidebar')?.addEventListener('click', () => this.toggleSidebar());
    document.getElementById('editor-settings')?.addEventListener('click', () => this.openSettings());
    document.getElementById('close-editor')?.addEventListener('click', () => this.close());

    // Sidebar tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });
  }

  async open(filePath = null) {
    const modal = document.getElementById('native-editor-modal');
    modal?.classList.add('active');

    if (!this.editor) {
      await this.initCodeMirror();
    }

    if (filePath) {
      await this.loadFile(filePath);
    } else {
      this.newFile();
    }

    // Load file tree
    this.loadFileTree();
    
    // Focus editor
    this.editor?.focus();
  }

  close() {
    const modal = document.getElementById('native-editor-modal');
    modal?.classList.remove('active');
    
    // Auto-save if needed
    if (this.settings.autoSave && this.hasUnsavedChanges()) {
      this.save();
    }
  }

  async initCodeMirror() {
    const container = document.getElementById('codemirror-container');
    if (!container) return;

    // Create CodeMirror 6 editor with Obsidian-like configuration
    const startState = EditorState.create({
      doc: '# Welcome to Obsidian-Native Editor\n\nStart typing...',
      extensions: [
        basicSetup,
        markdown(),
        this.settings.theme === 'dark' ? oneDark : [],
        this.settings.vimMode ? vim() : [],
        keymap.of([
          ...defaultKeymap,
          indentWithTab,
          // Custom keybindings
          {key: "Mod-s", run: () => { this.save(); return true; }},
          {key: "Mod-e", run: () => { this.togglePreview(); return true; }},
          {key: "Mod-b", run: () => { this.toggleSidebar(); return true; }},
          {key: "Mod-p", run: () => { this.openCommandPalette(); return true; }},
        ]),
        EditorView.theme({
          "&": {
            fontSize: this.settings.fontSize + "px",
            fontFamily: "JetBrains Mono, monospace"
          },
          ".cm-content": {
            padding: this.mobileMode ? "12px" : "16px",
            lineHeight: "1.6"
          },
          ".cm-scroller": {
            fontFamily: "Inter, system-ui, sans-serif"
          }
        }),
        EditorView.lineWrapping,
        autocompletion({
          override: [this.obsidianCompletions.bind(this)]
        }),
        bracketMatching(),
        highlightSelectionMatches(),
        EditorView.updateListener.of(update => {
          if (update.docChanged) {
            this.onContentChange();
          }
          if (update.selectionSet) {
            this.updateCursorPosition();
          }
        })
      ]
    });

    this.editor = new EditorView({
      state: startState,
      parent: container
    });
  }

  // Obsidian-style completions (wiki links, tags, etc.)
  obsidianCompletions(context) {
    let word = context.matchBefore(/\[\[?\w*|\#\w*/);
    if (!word) return null;
    
    const text = word.text;
    let options = [];

    if (text.startsWith('[[')) {
      // Wiki link completions
      options = Array.from(this.vaultFiles.keys()).map(file => ({
        label: file,
        type: "file",
        apply: `[[${file}]]`
      }));
    } else if (text.startsWith('#')) {
      // Tag completions
      options = this.getPopularTags().map(tag => ({
        label: tag,
        type: "keyword",
        apply: tag
      }));
    }

    return {
      from: word.from,
      options: options.slice(0, 10),
      validFor: /^\w*$/
    };
  }

  onContentChange() {
    this.updateWordCount();
    this.updateOutline();
    
    if (this.settings.livePreview) {
      this.updatePreview();
    }
    
    if (this.settings.autoSave) {
      this.scheduleAutoSave();
    }

    this.markUnsaved();
  }

  updateWordCount() {
    const content = this.editor?.state.doc.toString() || '';
    const words = content.trim().split(/\s+/).filter(w => w.length > 0).length;
    const wordCountEl = document.getElementById('word-count');
    if (wordCountEl) {
      wordCountEl.textContent = `${words} words`;
    }
  }

  updateCursorPosition() {
    const state = this.editor?.state;
    if (!state) return;
    
    const pos = state.selection.main.head;
    const line = state.doc.lineAt(pos);
    const col = pos - line.from + 1;
    
    const cursorEl = document.getElementById('cursor-pos');
    if (cursorEl) {
      cursorEl.textContent = `${line.number}:${col}`;
    }
  }

  updateOutline() {
    const content = this.editor?.state.doc.toString() || '';
    const headings = content.match(/^#{1,6}\s+.+$/gm) || [];
    
    const outlineEl = document.getElementById('document-outline');
    if (outlineEl) {
      outlineEl.innerHTML = headings.map(h => {
        const level = h.match(/^#+/)[0].length;
        const text = h.replace(/^#+\s+/, '');
        return `<div class="outline-item level-${level}" onclick="obsidianEditor.jumpToHeading('${text}')">${text}</div>`;
      }).join('');
    }
  }

  updatePreview() {
    const content = this.editor?.state.doc.toString() || '';
    const previewEl = document.getElementById('preview-content');
    
    if (previewEl) {
      // Use lightweight markdown parser
      previewEl.innerHTML = this.parseMarkdown(content);
    }
  }

  parseMarkdown(markdown) {
    // Lightweight markdown to HTML conversion
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold and italic
      .replace(/\*\*\*(.*)\*\*\*/gim, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      // Links
      .replace(/\[([^\[]+)\]\(([^\)]+)\)/gim, '<a href="$2">$1</a>')
      // Wiki links
      .replace(/\[\[([^\]]+)\]\]/gim, '<a href="#" class="wiki-link">$1</a>')
      // Tags
      .replace(/#(\w+)/gim, '<span class="tag">#$1</span>')
      // Code blocks
      .replace(/```([^`]+)```/gim, '<pre><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      // Lists
      .replace(/^\* (.+)$/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      // Line breaks
      .replace(/\n/gim, '<br>');
    
    return html;
  }

  togglePreview() {
    const editorPane = document.getElementById('editor-pane');
    const previewPane = document.getElementById('preview-pane');
    
    if (previewPane?.classList.contains('active')) {
      // Show editor only
      previewPane.classList.remove('active');
      editorPane?.classList.add('active');
    } else {
      // Show split view
      this.updatePreview();
      previewPane?.classList.add('active');
    }
  }

  toggleSidebar() {
    const sidebar = document.getElementById('native-sidebar');
    sidebar?.classList.toggle('collapsed');
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Update tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === `${tabName}-tab`);
    });
  }

  async loadFileTree() {
    const treeEl = document.getElementById('file-tree');
    if (!treeEl) return;

    // Simulate vault structure
    const files = [
      { name: 'Daily Notes', type: 'folder', children: [
        { name: '2025-01-09.md', type: 'file' },
        { name: '2025-01-08.md', type: 'file' }
      ]},
      { name: 'Projects', type: 'folder', children: [
        { name: 'Telegram Bot.md', type: 'file' },
        { name: 'Website Redesign.md', type: 'file' }
      ]},
      { name: 'Templates', type: 'folder', children: [
        { name: 'Daily Note.md', type: 'file' },
        { name: 'Project Template.md', type: 'file' }
      ]}
    ];

    treeEl.innerHTML = this.renderFileTree(files);
  }

  renderFileTree(items, level = 0) {
    return items.map(item => {
      if (item.type === 'folder') {
        return `
          <div class="tree-folder" style="padding-left: ${level * 12}px">
            <div class="tree-item folder" onclick="obsidianEditor.toggleFolder(this)">
              <span class="folder-icon">📁</span>
              <span>${item.name}</span>
            </div>
            <div class="folder-children">
              ${item.children ? this.renderFileTree(item.children, level + 1) : ''}
            </div>
          </div>
        `;
      } else {
        return `
          <div class="tree-item file" style="padding-left: ${level * 12}px" onclick="obsidianEditor.loadFile('${item.name}')">
            <span class="file-icon">📄</span>
            <span>${item.name}</span>
          </div>
        `;
      }
    }).join('');
  }

  toggleFolder(element) {
    const children = element.parentElement.querySelector('.folder-children');
    if (children) {
      children.classList.toggle('collapsed');
    }
  }

  async loadFile(filePath) {
    this.currentFile = filePath;
    document.getElementById('current-file').textContent = filePath;
    
    // Load file content (simulate for now)
    const content = this.vaultFiles.get(filePath) || `# ${filePath}\n\nStart writing...`;
    
    this.editor?.dispatch({
      changes: {
        from: 0,
        to: this.editor.state.doc.length,
        insert: content
      }
    });
    
    this.markSaved();
  }

  newFile() {
    this.currentFile = 'Untitled.md';
    document.getElementById('current-file').textContent = this.currentFile;
    
    this.editor?.dispatch({
      changes: {
        from: 0,
        to: this.editor.state.doc.length,
        insert: '# New Note\n\n'
      }
    });
    
    this.markSaved();
  }

  async save() {
    if (!this.currentFile || !this.editor) return;
    
    const content = this.editor.state.doc.toString();
    this.vaultFiles.set(this.currentFile, content);
    
    // Simulate save to backend
    await this.syncToBackend(this.currentFile, content);
    
    this.markSaved();
  }

  async syncToBackend(filePath, content) {
    // Simulate API call
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(`Saved ${filePath} (${content.length} chars)`);
        resolve();
      }, 200);
    });
  }

  markUnsaved() {
    const syncStatus = document.getElementById('sync-status');
    if (syncStatus) {
      syncStatus.innerHTML = '<span class="sync-dot unsaved"></span> Modified';
    }
  }

  markSaved() {
    const syncStatus = document.getElementById('sync-status');
    if (syncStatus) {
      syncStatus.innerHTML = '<span class="sync-dot saved"></span> Saved';
    }
  }

  hasUnsavedChanges() {
    return document.querySelector('.sync-dot.unsaved') !== null;
  }

  scheduleAutoSave() {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }
    
    this.autoSaveTimeout = setTimeout(() => {
      this.save();
    }, 2000);
  }

  setupAutoSave() {
    // Auto-save on window blur
    window.addEventListener('blur', () => {
      if (this.settings.autoSave && this.hasUnsavedChanges()) {
        this.save();
      }
    });
  }

  initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Cmd/Ctrl + K for command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.openCommandPalette();
      }
      
      // Escape to close
      if (e.key === 'Escape') {
        const commandPalette = document.getElementById('command-palette');
        if (commandPalette?.classList.contains('active')) {
          this.closeCommandPalette();
        } else {
          this.close();
        }
      }
    });
  }

  openCommandPalette() {
    const palette = document.getElementById('command-palette');
    if (palette) {
      palette.classList.add('active');
      palette.querySelector('.command-input')?.focus();
    }
  }

  closeCommandPalette() {
    const palette = document.getElementById('command-palette');
    palette?.classList.remove('active');
  }

  openSettings() {
    // Settings modal implementation
    console.log('Opening settings...');
  }

  jumpToHeading(headingText) {
    const content = this.editor?.state.doc.toString() || '';
    const lines = content.split('\n');
    let position = 0;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(headingText)) {
        this.editor?.dispatch({
          selection: { anchor: position }
        });
        this.editor?.focus();
        break;
      }
      position += lines[i].length + 1;
    }
  }

  getPopularTags() {
    // Return commonly used tags
    return ['#project', '#idea', '#todo', '#note', '#reference', '#daily'];
  }

  initMobileGestures() {
    let touchStartX = 0;
    const container = document.querySelector('.native-editor-container');
    
    container?.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    });
    
    container?.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchEndX - touchStartX;
      
      // Swipe right to open sidebar
      if (diff > 100) {
        const sidebar = document.getElementById('native-sidebar');
        sidebar?.classList.remove('collapsed');
      }
      
      // Swipe left to close sidebar
      if (diff < -100) {
        const sidebar = document.getElementById('native-sidebar');
        sidebar?.classList.add('collapsed');
      }
    });
  }
}

// Initialize editor when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.obsidianEditor = new ObsidianNativeEditor();
  });
} else {
  window.obsidianEditor = new ObsidianNativeEditor();
}

// Export for global access
export default ObsidianNativeEditor;