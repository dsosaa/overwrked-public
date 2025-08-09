// ========== ADVANCED FEATURES JAVASCRIPT ==========

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initAdvancedSearch();
  initBidirectionalEditing();
  initReadingProgress();
  initBookmarkSystem();
  initKeyboardShortcuts();
  initInteractiveElements();
});

// ========== ADVANCED SEARCH SYSTEM ==========

function initAdvancedSearch() {
  // Create search overlay and modal
  const searchOverlay = document.createElement('div');
  searchOverlay.className = 'search-overlay';
  searchOverlay.innerHTML = `
    <div class="advanced-search-modal">
      <div class="search-modal-header">
        <h3 class="search-modal-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          Advanced Search
        </h3>
        <button class="search-close-btn" onclick="closeAdvancedSearch()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 0 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/>
          </svg>
        </button>
      </div>
      <div class="search-modal-body">
        <div class="search-input-group">
          <input type="text" class="search-input" placeholder="Search content, projects, notes..." id="advanced-search-input">
          <div class="search-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </div>
        </div>
        
        <div class="search-filters">
          <div class="filter-group">
            <label class="filter-label">Content Type</label>
            <select class="filter-select" id="content-type-filter">
              <option value="">All Types</option>
              <option value="project">Projects</option>
              <option value="note">Notes</option>
              <option value="template">Templates</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Technology</label>
            <select class="filter-select" id="tech-filter">
              <option value="">All Tech</option>
              <option value="python">Python</option>
              <option value="telegram">Telegram</option>
              <option value="postgresql">PostgreSQL</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Date Range</label>
            <select class="filter-select" id="date-filter">
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
        
        <div class="search-results" id="search-results">
          <div class="search-result-item">
            <div class="search-result-title">Enterprise Telegram Bot Blueprint</div>
            <div class="search-result-meta">Project • Python, Telegram • 2 hours ago</div>
            <div class="search-result-snippet">Comprehensive technical architecture for a monetized <span class="search-highlight">Telegram bot</span> platform with credit systems...</div>
          </div>
          <div class="search-result-item">
            <div class="search-result-title">Public Note Template</div>
            <div class="search-result-meta">Template • Markdown • Today</div>
            <div class="search-result-snippet">Enhanced <span class="search-highlight">template</span> for public notes with pre-configured frontmatter...</div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(searchOverlay);
  
  // Create search trigger button
  const searchTrigger = document.createElement('button');
  searchTrigger.className = 'search-trigger';
  searchTrigger.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
    </svg>
    Search
  `;
  searchTrigger.onclick = openAdvancedSearch;
  document.body.appendChild(searchTrigger);
  
  // Add search functionality
  const searchInput = document.getElementById('advanced-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', performSearch);
  }
}

function openAdvancedSearch() {
  const overlay = document.querySelector('.search-overlay');
  if (overlay) {
    overlay.classList.add('active');
    const input = document.getElementById('advanced-search-input');
    if (input) {
      setTimeout(() => input.focus(), 100);
    }
  }
}

function closeAdvancedSearch() {
  const overlay = document.querySelector('.search-overlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}

function performSearch() {
  const query = document.getElementById('advanced-search-input').value;
  const contentType = document.getElementById('content-type-filter').value;
  const tech = document.getElementById('tech-filter').value;
  const date = document.getElementById('date-filter').value;
  
  // Simulate search results (in real implementation, this would query your content)
  const results = [
    {
      title: 'Enterprise Telegram Bot Blueprint',
      type: 'project',
      tech: ['python', 'telegram'],
      date: '2 hours ago',
      snippet: 'Comprehensive technical architecture for a monetized Telegram bot platform...',
      url: '/Projects/project-blueprint/'
    },
    {
      title: 'Public Note Template',
      type: 'template',
      tech: ['markdown'],
      date: 'Today',
      snippet: 'Enhanced template for public notes with pre-configured frontmatter...',
      url: '/Templates/public-note-template/'
    }
  ];
  
  // Filter and display results
  const filteredResults = results.filter(result => {
    if (contentType && result.type !== contentType) return false;
    if (tech && !result.tech.includes(tech)) return false;
    if (query && !result.title.toLowerCase().includes(query.toLowerCase()) && 
        !result.snippet.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });
  
  displaySearchResults(filteredResults, query);
}

function displaySearchResults(results, query) {
  const container = document.getElementById('search-results');
  if (!container) return;
  
  if (results.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #6b7280;">No results found</div>';
    return;
  }
  
  container.innerHTML = results.map(result => `
    <div class="search-result-item" onclick="window.location.href='${result.url}'">
      <div class="search-result-title">${highlightText(result.title, query)}</div>
      <div class="search-result-meta">${result.type} • ${result.tech.join(', ')} • ${result.date}</div>
      <div class="search-result-snippet">${highlightText(result.snippet, query)}</div>
    </div>
  `).join('');
}

function highlightText(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<span class="search-highlight">$1</span>');
}

// ========== BIDIRECTIONAL EDITING SYSTEM ==========

function initBidirectionalEditing() {
  // Create edit trigger button
  const editTrigger = document.createElement('button');
  editTrigger.className = 'edit-trigger';
  editTrigger.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>
    Edit
  `;
  editTrigger.onclick = openEditMode;
  document.body.appendChild(editTrigger);
  
  // Create edit overlay
  const editOverlay = document.createElement('div');
  editOverlay.className = 'edit-overlay';
  editOverlay.innerHTML = `
    <div class="edit-modal">
      <div class="edit-header">
        <h3 class="edit-title">Edit Current Page</h3>
        <div class="edit-actions">
          <button class="edit-btn" onclick="closeEditMode()">Cancel</button>
          <button class="edit-btn primary" onclick="saveEdits()">Save Changes</button>
        </div>
      </div>
      <textarea class="edit-textarea" id="edit-content" placeholder="Content will load here..."></textarea>
    </div>
  `;
  document.body.appendChild(editOverlay);
}

function openEditMode() {
  // In a real implementation, this would fetch the current page's markdown content
  const currentContent = `---
title: Notes & Projects
description: Published notes and projects from my Obsidian vault
---

# Notes & Projects

Quick access to my published content and ongoing projects.

## 📁 File Explorer

...current page content...`;
  
  const overlay = document.querySelector('.edit-overlay');
  const textarea = document.getElementById('edit-content');
  
  if (overlay && textarea) {
    textarea.value = currentContent;
    overlay.classList.add('active');
    setTimeout(() => textarea.focus(), 100);
  }
}

function closeEditMode() {
  const overlay = document.querySelector('.edit-overlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}

function saveEdits() {
  const content = document.getElementById('edit-content').value;
  
  // In a real implementation, this would:
  // 1. Send the content to your backend/GitHub API
  // 2. Trigger a rebuild of the site
  // 3. Show a success/error message
  
  alert('In a real implementation, this would save your changes to GitHub and trigger a site rebuild!');
  closeEditMode();
}

// ========== READING PROGRESS BAR ==========

function initReadingProgress() {
  const progressBar = document.createElement('div');
  progressBar.className = 'reading-progress';
  document.body.appendChild(progressBar);
  
  function updateProgress() {
    const winHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight - winHeight;
    const scrollTop = window.pageYOffset;
    const progress = (scrollTop / docHeight) * 100;
    
    progressBar.style.width = Math.min(progress, 100) + '%';
  }
  
  window.addEventListener('scroll', updateProgress);
  updateProgress();
}

// ========== BOOKMARK SYSTEM ==========

function initBookmarkSystem() {
  // Create bookmark button
  const bookmarkBtn = document.createElement('button');
  bookmarkBtn.className = 'bookmark-btn';
  bookmarkBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
    </svg>
  `;
  bookmarkBtn.onclick = toggleBookmark;
  document.body.appendChild(bookmarkBtn);
  
  // Create bookmark sidebar
  const bookmarkSidebar = document.createElement('div');
  bookmarkSidebar.className = 'bookmark-sidebar';
  bookmarkSidebar.innerHTML = `
    <div class="bookmark-header">
      <h3 class="bookmark-title">Bookmarks</h3>
    </div>
    <div class="bookmark-list" id="bookmark-list">
      <div class="bookmark-item">
        <div class="bookmark-item-title">Enterprise Telegram Bot Blueprint</div>
        <div class="bookmark-item-url">/Projects/project-blueprint/</div>
      </div>
    </div>
  `;
  document.body.appendChild(bookmarkSidebar);
  
  // Load bookmarks from localStorage
  loadBookmarks();
}

function toggleBookmark() {
  const btn = document.querySelector('.bookmark-btn');
  const sidebar = document.querySelector('.bookmark-sidebar');
  
  if (sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
    btn.classList.remove('bookmarked');
  } else {
    sidebar.classList.add('open');
    btn.classList.add('bookmarked');
  }
}

function loadBookmarks() {
  const bookmarks = JSON.parse(localStorage.getItem('overwrked-bookmarks') || '[]');
  const container = document.getElementById('bookmark-list');
  
  if (container) {
    container.innerHTML = bookmarks.map(bookmark => `
      <div class="bookmark-item" onclick="window.location.href='${bookmark.url}'">
        <div class="bookmark-item-title">${bookmark.title}</div>
        <div class="bookmark-item-url">${bookmark.url}</div>
      </div>
    `).join('');
  }
}

// ========== KEYBOARD SHORTCUTS ==========

function initKeyboardShortcuts() {
  const shortcutsHint = document.createElement('div');
  shortcutsHint.className = 'shortcuts-hint';
  shortcutsHint.innerHTML = `
    <strong>Keyboard Shortcuts:</strong><br>
    Ctrl/Cmd + K: Search • Ctrl/Cmd + E: Edit • Ctrl/Cmd + B: Bookmarks
  `;
  document.body.appendChild(shortcutsHint);
  
  document.addEventListener('keydown', function(e) {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
    
    if (cmdOrCtrl && !e.shiftKey && !e.altKey) {
      switch(e.key.toLowerCase()) {
        case 'k':
          e.preventDefault();
          openAdvancedSearch();
          break;
        case 'e':
          e.preventDefault();
          openEditMode();
          break;
        case 'b':
          e.preventDefault();
          toggleBookmark();
          break;
      }
    }
    
    // Show shortcuts hint on Alt key
    if (e.key === 'Alt') {
      shortcutsHint.classList.add('show');
    }
  });
  
  document.addEventListener('keyup', function(e) {
    if (e.key === 'Alt') {
      shortcutsHint.classList.remove('show');
    }
  });
  
  // ESC to close modals
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeAdvancedSearch();
      closeEditMode();
    }
  });
}

// ========== INTERACTIVE ELEMENTS ==========

function initInteractiveElements() {
  // Click outside to close modals
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('search-overlay')) {
      closeAdvancedSearch();
    }
    if (e.target.classList.contains('edit-overlay')) {
      closeEditMode();
    }
  });
  
  // Enhanced folder card interactions
  const folderCards = document.querySelectorAll('.clean-folder-card');
  folderCards.forEach(card => {
    card.addEventListener('click', function() {
      const type = card.classList.contains('telegram') ? 'Projects' :
                   card.classList.contains('development') ? 'Projects' :
                   card.classList.contains('automation') ? 'Projects' : 'Templates';
      window.location.href = `/${type}/`;
    });
  });
  
  // Activity row click handlers
  const activityRows = document.querySelectorAll('.activity-row');
  activityRows.forEach(row => {
    const link = row.querySelector('.activity-link a');
    if (link) {
      row.style.cursor = 'pointer';
      row.addEventListener('click', function(e) {
        if (e.target !== link) {
          link.click();
        }
      });
    }
  });
}

// ========== UTILITY FUNCTIONS ==========

// Auto-save for edit mode
let autoSaveTimer;
function enableAutoSave() {
  const textarea = document.getElementById('edit-content');
  if (textarea) {
    textarea.addEventListener('input', function() {
      clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        // Auto-save to localStorage as draft
        localStorage.setItem('overwrked-draft', textarea.value);
        console.log('Draft auto-saved');
      }, 2000);
    });
  }
}

// Load draft on edit open
function loadDraft() {
  const draft = localStorage.getItem('overwrked-draft');
  const textarea = document.getElementById('edit-content');
  if (draft && textarea && confirm('Load previously saved draft?')) {
    textarea.value = draft;
  }
}

// Export functionality
function exportContent() {
  const content = document.getElementById('edit-content').value;
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'exported-content.md';
  a.click();
  URL.revokeObjectURL(url);
}
