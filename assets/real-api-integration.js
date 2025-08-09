// ========== REAL API INTEGRATION ==========

// Secure API configuration
// IMPORTANT: Never commit real API keys to version control
// Use environment variables or a separate config file that's gitignored
const API_CONFIG = {
  obsidian: {
    baseUrl: 'http://localhost:27123',
    apiKey: process.env.OBSIDIAN_API_KEY || 'YOUR_OBSIDIAN_API_KEY_HERE',
    headers: {
      'Authorization': `Bearer ${process.env.OBSIDIAN_API_KEY || 'YOUR_OBSIDIAN_API_KEY_HERE'}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY_HERE',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4-turbo-preview',
    maxTokens: 2000
  }
};

// Override simulation functions with real API calls
if (typeof window !== 'undefined') {
  
  // ========== REAL OBSIDIAN API INTEGRATION ==========
  
  async function checkObsidianConnection() {
    try {
      console.log('🔄 Checking Obsidian connection...');
      const response = await fetch(`${API_CONFIG.obsidian.baseUrl}/vault`, {
        method: 'GET',
        headers: API_CONFIG.obsidian.headers
      });
      
      if (response.ok) {
        const vaultInfo = await response.json();
        console.log('✅ Connected to Obsidian vault:', vaultInfo);
        updateSyncStatus('Connected to Obsidian', 'success');
        return vaultInfo;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.warn('⚠️ Obsidian not connected:', error.message);
      updateSyncStatus('Obsidian not connected - using simulation', 'warning');
      return null;
    }
  }
  
  async function loadObsidianFileTree() {
    const treeContainer = document.getElementById('obsidian-file-tree');
    if (!treeContainer) return;
    
    try {
      console.log('📁 Loading Obsidian file tree...');
      
      // Get vault structure
      const response = await fetch(`${API_CONFIG.obsidian.baseUrl}/vault`, {
        headers: API_CONFIG.obsidian.headers
      });
      
      if (response.ok) {
        const vaultData = await response.json();
        console.log('📂 Vault structure:', vaultData);
        
        // Get files list
        const filesResponse = await fetch(`${API_CONFIG.obsidian.baseUrl}/vault/`, {
          headers: API_CONFIG.obsidian.headers
        });
        
        if (filesResponse.ok) {
          const files = await filesResponse.json();
          const fileTree = buildFileTreeFromObsidian(files);
          treeContainer.innerHTML = renderFileTree(fileTree);
          console.log('✅ File tree loaded successfully');
        }
      } else {
        throw new Error('Failed to load vault structure');
      }
    } catch (error) {
      console.error('❌ Error loading file tree:', error);
      // Fallback to simulation
      const simulatedFiles = getSimulatedFileTree();
      treeContainer.innerHTML = renderFileTree(simulatedFiles);
    }
  }
  
  async function loadFileFromObsidian(filePath) {
    currentFile = filePath;
    updateFileName(filePath);
    updateSyncStatus('Loading from Obsidian...', 'info');
    
    try {
      console.log(`📖 Loading file from Obsidian: ${filePath}`);
      
      const response = await fetch(`${API_CONFIG.obsidian.baseUrl}/vault/${encodeURIComponent(filePath)}`, {
        headers: API_CONFIG.obsidian.headers
      });
      
      if (response.ok) {
        const content = await response.text();
        console.log(`✅ File loaded: ${content.length} characters`);
        
        if (monacoEditor) {
          monacoEditor.setValue(content);
        }
        
        updateSyncStatus('File loaded from Obsidian', 'success');
        
        // Auto-hide success message
        setTimeout(() => updateSyncStatus('Ready', 'ready'), 2000);
        
        return content;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error loading file:', error);
      updateSyncStatus('Failed to load from Obsidian', 'error');
      
      // Fallback to simulation
      return await simulateFileLoad(filePath);
    }
  }
  
  async function saveToObsidian() {
    if (!monacoEditor || !currentFile) {
      console.warn('⚠️ No file or editor available for saving');
      return;
    }
    
    const content = monacoEditor.getValue();
    updateSyncStatus('Saving to Obsidian...', 'info');
    
    try {
      console.log(`💾 Saving to Obsidian: ${currentFile}`);
      
      const response = await fetch(`${API_CONFIG.obsidian.baseUrl}/vault/${encodeURIComponent(currentFile)}`, {
        method: 'PUT',
        headers: {
          ...API_CONFIG.obsidian.headers,
          'Content-Type': 'text/plain'
        },
        body: content
      });
      
      if (response.ok) {
        console.log('✅ File saved to Obsidian successfully');
        updateSyncStatus('Saved to Obsidian', 'success');
        
        // Update file status indicator
        const fileStatus = document.getElementById('file-status');
        if (fileStatus) {
          fileStatus.classList.add('saved');
        }
        
        // Auto-hide success message
        setTimeout(() => updateSyncStatus('Ready', 'ready'), 2000);
        
        return true;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error saving file:', error);
      updateSyncStatus('Failed to save to Obsidian', 'error');
      
      // Fallback to simulation
      return await simulateFileSave(currentFile, content);
    }
  }
  
  async function createNewFileInObsidian(fileName, content = '') {
    try {
      console.log(`📝 Creating new file in Obsidian: ${fileName}`);
      
      const response = await fetch(`${API_CONFIG.obsidian.baseUrl}/vault/${encodeURIComponent(fileName)}`, {
        method: 'PUT',
        headers: {
          ...API_CONFIG.obsidian.headers,
          'Content-Type': 'text/plain'
        },
        body: content || `# ${fileName.replace('.md', '')}\n\nYour content here...`
      });
      
      if (response.ok) {
        console.log('✅ New file created successfully');
        currentFile = fileName;
        updateFileName(fileName);
        loadObsidianFileTree(); // Refresh file tree
        return true;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error creating file:', error);
      return false;
    }
  }
  
  // ========== REAL OPENAI INTEGRATION ==========
  
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
      console.log('🤖 Sending request to OpenAI...');
      
      const currentContent = monacoEditor?.getValue() || '';
      const contextPrompt = buildContextualPrompt(prompt, currentContent);
      
      const response = await fetch(`${API_CONFIG.openai.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_CONFIG.openai.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: API_CONFIG.openai.model,
          messages: [
            {
              role: 'system',
              content: 'You are an AI assistant helping with Obsidian note organization and content improvement. Provide helpful, actionable suggestions. When suggesting specific changes, format them clearly with "SUGGESTION:" prefix.'
            },
            {
              role: 'user',
              content: contextPrompt
            }
          ],
          max_tokens: API_CONFIG.openai.maxTokens,
          temperature: 0.7
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        
        console.log('✅ AI response received:', aiResponse.substring(0, 100) + '...');
        
        // Remove loading message and add real response
        removeLoadingMessage();
        addAIMessage('assistant', aiResponse);
        
        // Apply suggestions if any
        if (aiResponse.includes('SUGGESTION:')) {
          const suggestion = aiResponse.split('SUGGESTION:')[1].trim();
          addApplySuggestionButton(suggestion);
        }
      } else {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ AI request failed:', error);
      removeLoadingMessage();
      
      // Fallback to simulation if API fails
      const fallbackResponse = await simulateAIResponse(prompt, monacoEditor?.getValue() || '');
      addAIMessage('assistant', `⚠️ Using fallback response:\n\n${fallbackResponse}`);
    }
  }
  
  function buildContextualPrompt(userPrompt, currentContent) {
    const contentInfo = currentContent ? {
      length: currentContent.length,
      lines: currentContent.split('\n').length,
      hasHeaders: /^#+\s/.test(currentContent),
      hasTags: /#\w+/.test(currentContent),
      hasLinks: /\[\[.*?\]\]/.test(currentContent)
    } : null;
    
    let contextPrompt = `User request: "${userPrompt}"\n\n`;
    
    if (contentInfo) {
      contextPrompt += `Current note context:\n`;
      contextPrompt += `- Length: ${contentInfo.length} characters, ${contentInfo.lines} lines\n`;
      contextPrompt += `- Has headers: ${contentInfo.hasHeaders}\n`;
      contextPrompt += `- Has tags: ${contentInfo.hasTags}\n`;
      contextPrompt += `- Has wikilinks: ${contentInfo.hasLinks}\n\n`;
      contextPrompt += `Content preview:\n\`\`\`\n${currentContent.substring(0, 500)}${currentContent.length > 500 ? '...' : ''}\n\`\`\`\n\n`;
    }
    
    contextPrompt += `Please provide helpful suggestions for improving this note based on the user's request.`;
    
    return contextPrompt;
  }
  
  // ========== OBSIDIAN VAULT ANALYSIS ==========
  
  async function analyzeObsidianVault() {
    try {
      console.log('🔍 Analyzing Obsidian vault structure...');
      
      // Get vault info
      const vaultResponse = await fetch(`${API_CONFIG.obsidian.baseUrl}/vault`, {
        headers: API_CONFIG.obsidian.headers
      });
      
      if (!vaultResponse.ok) {
        throw new Error('Cannot access vault');
      }
      
      const vaultInfo = await vaultResponse.json();
      console.log('📊 Vault analysis:', vaultInfo);
      
      // Analyze core settings and structure
      const analysis = {
        vaultInfo,
        timestamp: new Date().toISOString(),
        recommendations: []
      };
      
      // Check for common folders
      const commonFolders = ['Projects', 'Notes', 'Templates', 'Daily Notes', 'Resources'];
      analysis.folderStructure = commonFolders.map(folder => ({
        name: folder,
        exists: false, // Will be updated when we scan files
        recommended: true
      }));
      
      console.log('✅ Vault analysis complete:', analysis);
      return analysis;
      
    } catch (error) {
      console.error('❌ Vault analysis failed:', error);
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
        fallback: true
      };
    }
  }
  
  // ========== UTILITY FUNCTIONS ==========
  
  function buildFileTreeFromObsidian(files) {
    // Convert Obsidian file list to tree structure
    const tree = {};
    
    files.forEach(file => {
      const parts = file.path.split('/');
      let current = tree;
      
      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = {
            name: part,
            type: index === parts.length - 1 ? 'file' : 'folder',
            path: parts.slice(0, index + 1).join('/'),
            children: {}
          };
        }
        current = current[part].children;
      });
    });
    
    return Object.values(tree);
  }
  
  function getSimulatedFileTree() {
    return [
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
  }
  
  // ========== ENHANCED FEATURES ==========
  
  // Auto-detect file type and apply appropriate template
  function applyFileTemplate(fileName) {
    const templates = {
      'daily': `# Daily Note - {{date}}

## 🎯 Today's Focus

## 📝 Notes

## ✅ Tasks
- [ ] 

## 🔗 Links
`,
      'project': `# {{title}}

## 🎯 Overview

## 📋 Requirements

## 🏗️ Implementation

## 🔗 Resources
`,
      'meeting': `# Meeting - {{title}}

**Date:** {{date}}
**Attendees:** 

## 📋 Agenda

## 📝 Notes

## ✅ Action Items
- [ ] 
`
    };
    
    const today = new Date().toISOString().split('T')[0];
    const title = fileName.replace('.md', '').replace(/[-_]/g, ' ');
    
    let template = templates.daily; // default
    
    if (fileName.includes('project')) template = templates.project;
    if (fileName.includes('meeting')) template = templates.meeting;
    
    return template
      .replace(/\{\{date\}\}/g, today)
      .replace(/\{\{title\}\}/g, title);
  }
  
  // Smart file suggestions based on content
  function generateFileSuggestions(content) {
    const suggestions = [];
    
    // Suggest tags
    if (!content.includes('#')) {
      suggestions.push({
        type: 'tags',
        description: 'Consider adding tags for better organization',
        action: 'Add tags like #project, #idea, #todo'
      });
    }
    
    // Suggest headers
    if (!content.includes('#')) {
      suggestions.push({
        type: 'structure',
        description: 'Add headers to improve structure',
        action: 'Use # for main topics, ## for subtopics'
      });
    }
    
    // Suggest links
    if (content.length > 100 && !content.includes('[[')) {
      suggestions.push({
        type: 'links',
        description: 'Consider linking to related notes',
        action: 'Use [[Note Name]] to create connections'
      });
    }
    
    return suggestions;
  }
  
  // Override existing functions
  window.checkObsidianConnection = checkObsidianConnection;
  window.loadObsidianFileTree = loadObsidianFileTree;
  window.loadFileFromObsidian = loadFileFromObsidian;
  window.saveToObsidian = saveToObsidian;
  window.sendAIPrompt = sendAIPrompt;
  window.analyzeObsidianVault = analyzeObsidianVault;
  window.createNewFileInObsidian = createNewFileInObsidian;
  
  console.log('🚀 Real API integration loaded successfully!');
  console.log('🔑 Obsidian API configured for localhost:27123');
  console.log('🤖 OpenAI GPT-4 integration enabled');
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Test connections on startup
  setTimeout(() => {
    checkObsidianConnection();
    analyzeObsidianVault();
  }, 1000);
});
