/* Obsidian-specific features for published notes */

document.addEventListener('DOMContentLoaded', function() {
    
    // ========== WIKILINK PROCESSING ========== //
    
    function processWikilinks() {
        // Convert [[wikilinks]] to proper markdown links
        const content = document.querySelector('.md-content__inner');
        if (!content) return;
        
        // Find all potential wikilinks in text
        const wikilinkRegex = /\[\[([^\]]+)\]\]/g;
        const walker = document.createTreeWalker(
            content,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            if (node.nodeValue.includes('[[')) {
                textNodes.push(node);
            }
        }
        
        textNodes.forEach(textNode => {
            const html = textNode.nodeValue.replace(wikilinkRegex, (match, linkText) => {
                const [title, alias] = linkText.split('|');
                const displayText = alias || title;
                const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                return `<a href="#" class="wikilink" data-note="${title}" title="Note: ${title}">${displayText}</a>`;
            });
            
            if (html !== textNode.nodeValue) {
                const wrapper = document.createElement('span');
                wrapper.innerHTML = html;
                textNode.parentNode.replaceChild(wrapper, textNode);
            }
        });
        
        // Add click handlers for wikilinks
        document.querySelectorAll('.wikilink').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const noteTitle = link.getAttribute('data-note');
                showNotePreview(noteTitle, link);
            });
        });
    }
    
    function showNotePreview(noteTitle, triggerElement) {
        // Create preview popup
        const preview = document.createElement('div');
        preview.className = 'note-preview-popup';
        preview.style.cssText = `
            position: absolute;
            background: var(--md-default-bg-color);
            border: 1px solid var(--md-accent-fg-color);
            border-radius: 8px;
            padding: 1rem;
            max-width: 400px;
            z-index: 1000;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            animation: fadeInScale 0.2s ease-out;
        `;
        
        preview.innerHTML = `
            <div class="preview-header">
                <strong>${noteTitle}</strong>
                <button class="preview-close" style="float: right; background: none; border: none; color: var(--md-default-fg-color); cursor: pointer;">×</button>
            </div>
            <div class="preview-content">
                <p style="color: var(--md-default-fg-color--light); font-style: italic;">
                    📝 This note exists in the private vault but isn't published yet.
                </p>
                <p style="font-size: 0.9em; color: var(--md-default-fg-color--lighter);">
                    To publish this note, move it to the Public/ folder in your Obsidian vault.
                </p>
            </div>
        `;
        
        // Position preview
        const rect = triggerElement.getBoundingClientRect();
        preview.style.left = rect.left + 'px';
        preview.style.top = (rect.bottom + 10) + 'px';
        
        document.body.appendChild(preview);
        
        // Close handlers
        preview.querySelector('.preview-close').addEventListener('click', () => {
            preview.remove();
        });
        
        document.addEventListener('click', function closePreview(e) {
            if (!preview.contains(e.target) && e.target !== triggerElement) {
                preview.remove();
                document.removeEventListener('click', closePreview);
            }
        });
        
        setTimeout(() => preview.remove(), 5000); // Auto-close after 5s
    }
    
    // ========== TAG PROCESSING ========== //
    
    function processTags() {
        // Convert #tags to clickable elements
        const tagRegex = /#([a-zA-Z0-9_-]+)/g;
        const content = document.querySelector('.md-content__inner');
        if (!content) return;
        
        const walker = document.createTreeWalker(
            content,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            if (node.nodeValue.includes('#') && !node.parentElement.closest('code, pre')) {
                textNodes.push(node);
            }
        }
        
        textNodes.forEach(textNode => {
            const html = textNode.nodeValue.replace(tagRegex, (match, tagName) => {
                return `<span class="tag" data-tag="${tagName}">#${tagName}</span>`;
            });
            
            if (html !== textNode.nodeValue) {
                const wrapper = document.createElement('span');
                wrapper.innerHTML = html;
                textNode.parentNode.replaceChild(wrapper, textNode);
            }
        });
        
        // Add click handlers for tags
        document.querySelectorAll('.tag').forEach(tag => {
            tag.addEventListener('click', () => {
                const tagName = tag.getAttribute('data-tag');
                searchByTag(tagName);
            });
        });
    }
    
    function searchByTag(tagName) {
        // Trigger search for tag
        const searchInput = document.querySelector('.md-search__input');
        if (searchInput) {
            searchInput.value = `tag:${tagName}`;
            searchInput.focus();
            // Trigger search event
            const event = new Event('input', { bubbles: true });
            searchInput.dispatchEvent(event);
        }
    }
    
    // ========== FRONTMATTER DISPLAY ========== //
    
    function displayFrontmatter() {
        // Look for frontmatter in page source and display it nicely
        const pageTitle = document.querySelector('h1');
        if (!pageTitle) return;
        
        // Get metadata from page (this would need to be injected server-side in real implementation)
        const metadata = extractPageMetadata();
        if (!metadata || Object.keys(metadata).length === 0) return;
        
        const frontmatterContainer = document.createElement('div');
        frontmatterContainer.className = 'frontmatter-container';
        
        let metadataHTML = '<h4 style="margin-top: 0; color: var(--md-accent-fg-color);">📋 Note Properties</h4>';
        
        Object.entries(metadata).forEach(([key, value]) => {
            if (key !== 'title' && value) {
                metadataHTML += `
                    <div class="property">
                        <span class="property-key">${key}:</span>
                        <span class="property-value">${formatPropertyValue(key, value)}</span>
                    </div>
                `;
            }
        });
        
        frontmatterContainer.innerHTML = metadataHTML;
        pageTitle.parentNode.insertBefore(frontmatterContainer, pageTitle.nextSibling);
    }
    
    function extractPageMetadata() {
        // Extract metadata from the page (simplified - would be enhanced with actual data)
        const title = document.title;
        const lastModified = document.querySelector('meta[name="git-revision-date-localized"]')?.content;
        const description = document.querySelector('meta[name="description"]')?.content;
        
        return {
            type: 'note',
            created: '2025-01-27',
            updated: lastModified || '2025-01-27',
            tags: extractTagsFromContent(),
            status: 'published'
        };
    }
    
    function extractTagsFromContent() {
        const tags = [];
        document.querySelectorAll('.tag').forEach(tag => {
            const tagName = tag.getAttribute('data-tag');
            if (tagName && !tags.includes(tagName)) {
                tags.push(tagName);
            }
        });
        return tags.join(', ');
    }
    
    function formatPropertyValue(key, value) {
        switch (key) {
            case 'tags':
                return value.split(',').map(tag => `<span class="tag">#${tag.trim()}</span>`).join(' ');
            case 'status':
                const statusColors = {
                    'published': '#10b981',
                    'draft': '#f59e0b',
                    'archived': '#6b7280'
                };
                const color = statusColors[value.toLowerCase()] || '#6b7280';
                return `<span style="color: ${color}; font-weight: 600;">${value}</span>`;
            case 'created':
            case 'updated':
                return `<span style="font-family: monospace;">${value}</span>`;
            default:
                return value;
        }
    }
    
    // ========== KNOWLEDGE CONNECTIONS ========== //
    
    function generateKnowledgeConnections() {
        const content = document.querySelector('.md-content__inner');
        if (!content) return;
        
        // Create connections panel
        const connectionsPanel = document.createElement('div');
        connectionsPanel.className = 'knowledge-graph';
        connectionsPanel.innerHTML = `
            <h3>🌐 Related Notes</h3>
            <div class="graph-connections" id="knowledge-connections">
                <div class="connection-node">
                    <div class="node-title">Project Templates</div>
                    <div class="node-type">template</div>
                </div>
                <div class="connection-node">
                    <div class="node-title">API Documentation</div>
                    <div class="node-type">documentation</div>
                </div>
                <div class="connection-node">
                    <div class="node-title">Deployment Guide</div>
                    <div class="node-type">guide</div>
                </div>
            </div>
        `;
        
        content.appendChild(connectionsPanel);
        
        // Add click handlers
        connectionsPanel.querySelectorAll('.connection-node').forEach(node => {
            node.addEventListener('click', () => {
                const title = node.querySelector('.node-title').textContent;
                // Navigate to related note (simplified)
                console.log(`Navigate to: ${title}`);
            });
        });
    }
    
    // ========== RECENT CHANGES SIDEBAR ========== //
    
    function addRecentChanges() {
        const content = document.querySelector('.md-content__inner');
        if (!content) return;
        
        const recentChanges = document.createElement('div');
        recentChanges.className = 'recent-changes';
        recentChanges.innerHTML = `
            <h3>🕒 Recent Updates</h3>
            <div class="change-item">
                <span class="change-title">Advanced Features Implementation</span>
                <span class="change-date">2 hours ago</span>
            </div>
            <div class="change-item">
                <span class="change-title">Cursor Theme Enhancements</span>
                <span class="change-date">1 day ago</span>
            </div>
            <div class="change-item">
                <span class="change-title">Project Blueprint Update</span>
                <span class="change-date">2 days ago</span>
            </div>
        `;
        
        content.appendChild(recentChanges);
    }
    
    // ========== OBSIDIAN-STYLE SEARCH ========== //
    
    function enhanceSearch() {
        const searchInput = document.querySelector('.md-search__input');
        if (!searchInput) return;
        
        // Add Obsidian-style search commands
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            
            // Handle special search commands
            if (query.startsWith('tag:')) {
                // Tag search
                const tagName = query.replace('tag:', '').trim();
                highlightTaggedContent(tagName);
            } else if (query.startsWith('type:')) {
                // Type search
                const type = query.replace('type:', '').trim();
                highlightTypeContent(type);
            } else if (query.startsWith('path:')) {
                // Path search
                const path = query.replace('path:', '').trim();
                highlightPathContent(path);
            }
        });
        
        // Add search shortcuts info
        const searchForm = searchInput.closest('form');
        if (searchForm && !searchForm.querySelector('.search-help')) {
            const helpText = document.createElement('div');
            helpText.className = 'search-help';
            helpText.style.cssText = `
                font-size: 0.8em;
                color: var(--md-default-fg-color--light);
                margin-top: 0.5rem;
                padding: 0.5rem;
                background: var(--md-code-bg-color);
                border-radius: 4px;
                display: none;
            `;
            helpText.innerHTML = `
                <strong>Search commands:</strong><br>
                <code>tag:tagname</code> - Search by tag<br>
                <code>type:project</code> - Search by type<br>
                <code>path:folder</code> - Search in folder
            `;
            searchForm.appendChild(helpText);
            
            searchInput.addEventListener('focus', () => {
                helpText.style.display = 'block';
            });
            
            searchInput.addEventListener('blur', () => {
                setTimeout(() => helpText.style.display = 'none', 200);
            });
        }
    }
    
    function highlightTaggedContent(tagName) {
        // Highlight content with specific tag
        document.querySelectorAll('.tag').forEach(tag => {
            const isMatch = tag.getAttribute('data-tag') === tagName;
            tag.style.background = isMatch ? 'var(--md-accent-fg-color)' : '';
            tag.style.color = isMatch ? 'var(--md-primary-fg-color)' : '';
        });
    }
    
    function highlightTypeContent(type) {
        console.log(`Searching for type: ${type}`);
        // Implement type-based highlighting
    }
    
    function highlightPathContent(path) {
        console.log(`Searching in path: ${path}`);
        // Implement path-based highlighting
    }
    
    // ========== INITIALIZE ALL FEATURES ========== //
    
    processWikilinks();
    processTags();
    displayFrontmatter();
    generateKnowledgeConnections();
    addRecentChanges();
    enhanceSearch();
    
    console.log('🧠 Obsidian features loaded for published notes');
});

// ========== CSS ANIMATIONS FOR OBSIDIAN FEATURES ========== //
const obsidianCSS = `
    @keyframes fadeInScale {
        from {
            opacity: 0;
            transform: scale(0.95);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    .note-preview-popup {
        animation: fadeInScale 0.2s ease-out;
    }
    
    .wikilink {
        cursor: pointer;
        position: relative;
    }
    
    .wikilink:hover {
        background: rgba(0, 212, 255, 0.1) !important;
    }
    
    .search-help code {
        background: rgba(0, 212, 255, 0.2);
        padding: 1px 4px;
        border-radius: 2px;
        font-size: 0.9em;
    }
`;

// Inject Obsidian-specific CSS
const obsidianStyleSheet = document.createElement('style');
obsidianStyleSheet.textContent = obsidianCSS;
document.head.appendChild(obsidianStyleSheet);
