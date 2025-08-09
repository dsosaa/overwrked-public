/* Advanced Interactive Features for Material MkDocs */

document.addEventListener('DOMContentLoaded', function() {
    
    // ========== ENHANCED CODE BLOCK ANIMATIONS ========== //
    
    function enhanceCodeBlocks() {
        const codeBlocks = document.querySelectorAll('.highlight');
        
        codeBlocks.forEach((block, index) => {
            // Add language indicator
            const language = block.querySelector('code')?.className?.match(/language-(\w+)/)?.[1] || 'text';
            const indicator = document.createElement('div');
            indicator.className = 'code-language-indicator';
            indicator.textContent = language.toUpperCase();
            indicator.style.cssText = `
                position: absolute;
                top: 8px;
                left: 12px;
                background: var(--md-accent-fg-color);
                color: var(--md-primary-fg-color);
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 0.7rem;
                font-weight: 600;
                z-index: 1;
                opacity: 0.8;
            `;
            
            block.style.position = 'relative';
            block.appendChild(indicator);
            
            // Add line numbers animation
            const lines = block.querySelectorAll('.highlight table tr');
            lines.forEach((line, lineIndex) => {
                line.style.animationDelay = `${lineIndex * 0.05}s`;
                line.classList.add('code-line-animate');
            });
            
            // Add hover effects
            block.addEventListener('mouseenter', () => {
                indicator.style.opacity = '1';
                block.style.boxShadow = '0 4px 20px rgba(0, 212, 255, 0.2)';
            });
            
            block.addEventListener('mouseleave', () => {
                indicator.style.opacity = '0.8';
                block.style.boxShadow = '';
            });
        });
    }
    
    // ========== CONTENT TOGGLES & ACCORDIONS ========== //
    
    function createContentToggles() {
        // Enhanced tabbed content
        const tabbedSets = document.querySelectorAll('.tabbed-set');
        tabbedSets.forEach(set => {
            const labels = set.querySelectorAll('.tabbed-labels label');
            const contents = set.querySelectorAll('.tabbed-content');
            
            labels.forEach((label, index) => {
                label.addEventListener('click', () => {
                    // Animate tab transition
                    contents.forEach(content => {
                        content.style.opacity = '0';
                        content.style.transform = 'translateY(10px)';
                    });
                    
                    setTimeout(() => {
                        const activeContent = set.querySelector(`#__tabbed_${set.dataset.tabs}_${index + 1}`);
                        if (activeContent) {
                            activeContent.style.opacity = '1';
                            activeContent.style.transform = 'translateY(0)';
                        }
                    }, 150);
                });
            });
        });
        
        // Create collapsible sections
        const headers = document.querySelectorAll('h2, h3');
        headers.forEach(header => {
            if (header.textContent.includes('🔽') || header.textContent.includes('▼')) {
                header.style.cursor = 'pointer';
                header.style.userSelect = 'none';
                
                const content = getNextSiblingUntilHeader(header);
                const wrapper = document.createElement('div');
                wrapper.className = 'collapsible-content';
                wrapper.style.cssText = `
                    overflow: hidden;
                    transition: max-height 0.3s ease, opacity 0.3s ease;
                    max-height: 1000px;
                    opacity: 1;
                `;
                
                content.forEach(el => wrapper.appendChild(el));
                header.parentNode.insertBefore(wrapper, header.nextSibling);
                
                header.addEventListener('click', () => {
                    const isCollapsed = wrapper.style.maxHeight === '0px';
                    wrapper.style.maxHeight = isCollapsed ? '1000px' : '0px';
                    wrapper.style.opacity = isCollapsed ? '1' : '0';
                    header.textContent = header.textContent.replace(/🔽|▼|🔼|▲/, isCollapsed ? '🔼' : '🔽');
                });
            }
        });
    }
    
    function getNextSiblingUntilHeader(element) {
        const siblings = [];
        let next = element.nextElementSibling;
        
        while (next && !next.matches('h1, h2, h3, h4, h5, h6')) {
            siblings.push(next);
            next = next.nextElementSibling;
        }
        
        return siblings;
    }
    
    // ========== INTERACTIVE DIAGRAMS ========== //
    
    function enhanceDiagrams() {
        const mermaidDiagrams = document.querySelectorAll('.mermaid');
        mermaidDiagrams.forEach(diagram => {
            diagram.style.transition = 'all 0.3s ease';
            
            diagram.addEventListener('mouseenter', () => {
                diagram.style.transform = 'scale(1.02)';
                diagram.style.boxShadow = '0 8px 32px rgba(0, 212, 255, 0.1)';
            });
            
            diagram.addEventListener('mouseleave', () => {
                diagram.style.transform = 'scale(1)';
                diagram.style.boxShadow = '';
            });
        });
    }
    
    // ========== ENHANCED ADMONITIONS ========== //
    
    function enhanceAdmonitions() {
        const admonitions = document.querySelectorAll('.admonition');
        admonitions.forEach(admonition => {
            const title = admonition.querySelector('.admonition-title');
            if (!title) return;
            
            // Add expand/collapse functionality to certain admonitions
            if (admonition.classList.contains('tip') || 
                admonition.classList.contains('info') || 
                admonition.classList.contains('note')) {
                
                const content = admonition.querySelector('p, .admonition-content');
                if (content) {
                    title.style.cursor = 'pointer';
                    title.style.userSelect = 'none';
                    
                    // Add toggle icon
                    const icon = document.createElement('span');
                    icon.innerHTML = '▼';
                    icon.style.cssText = `
                        float: right;
                        transition: transform 0.3s ease;
                        font-size: 0.8em;
                    `;
                    title.appendChild(icon);
                    
                    let isCollapsed = false;
                    title.addEventListener('click', () => {
                        isCollapsed = !isCollapsed;
                        content.style.display = isCollapsed ? 'none' : 'block';
                        icon.style.transform = isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)';
                        
                        // Animate the admonition
                        admonition.style.transition = 'all 0.3s ease';
                        if (isCollapsed) {
                            admonition.style.opacity = '0.7';
                            admonition.style.transform = 'scale(0.98)';
                        } else {
                            admonition.style.opacity = '1';
                            admonition.style.transform = 'scale(1)';
                        }
                    });
                }
            }
            
            // Add hover effects
            admonition.addEventListener('mouseenter', () => {
                admonition.style.transform = 'translateY(-2px) scale(1.01)';
                admonition.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.1)';
            });
            
            admonition.addEventListener('mouseleave', () => {
                admonition.style.transform = '';
                admonition.style.boxShadow = '';
            });
        });
    }
    
    // ========== PROGRESSIVE CONTENT LOADING ========== //
    
    function setupProgressiveLoading() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('loaded');
                    
                    // Animate children with stagger
                    const children = entry.target.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol, .highlight, .admonition');
                    children.forEach((child, index) => {
                        setTimeout(() => {
                            child.style.opacity = '1';
                            child.style.transform = 'translateY(0)';
                        }, index * 100);
                    });
                    
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        const sections = document.querySelectorAll('.md-content__inner > *');
        sections.forEach(section => {
            if (!section.classList.contains('loaded')) {
                section.style.opacity = '0';
                section.style.transform = 'translateY(20px)';
                section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(section);
            }
        });
    }
    
    // ========== KEYBOARD SHORTCUTS ========== //
    
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.querySelector('.md-search__input');
                if (searchInput) {
                    searchInput.focus();
                }
            }
            
            // Ctrl/Cmd + / for help
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                showKeyboardShortcuts();
            }
            
            // Arrow keys for navigation
            if (e.key === 'ArrowLeft' && e.altKey) {
                const prevLink = document.querySelector('.md-footer__link--prev');
                if (prevLink) prevLink.click();
            }
            
            if (e.key === 'ArrowRight' && e.altKey) {
                const nextLink = document.querySelector('.md-footer__link--next');
                if (nextLink) nextLink.click();
            }
        });
    }
    
    function showKeyboardShortcuts() {
        const modal = document.createElement('div');
        modal.className = 'keyboard-shortcuts-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: var(--md-default-bg-color);
            border: 1px solid var(--md-default-border-color, #21262d);
            border-radius: 8px;
            padding: 2rem;
            max-width: 500px;
            width: 90%;
        `;
        
        content.innerHTML = `
            <h3 style="margin-top: 0; color: var(--md-accent-fg-color);">Keyboard Shortcuts</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0;">
                <div><kbd>Ctrl/Cmd + K</kbd></div><div>Search</div>
                <div><kbd>Ctrl/Cmd + /</kbd></div><div>Show shortcuts</div>
                <div><kbd>Alt + ←</kbd></div><div>Previous page</div>
                <div><kbd>Alt + →</kbd></div><div>Next page</div>
                <div><kbd>Esc</kbd></div><div>Close modal</div>
            </div>
            <button onclick="this.closest('.keyboard-shortcuts-modal').remove()" 
                    style="background: var(--md-accent-fg-color); color: var(--md-primary-fg-color); 
                           border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
                Close
            </button>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escHandler);
            }
        });
    }
    
    // ========== PERFORMANCE MONITORING ========== //
    
    function setupPerformanceMonitoring() {
        // Monitor Core Web Vitals
        if ('web-vital' in window) {
            import('https://unpkg.com/web-vitals@3/dist/web-vitals.js').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
                getCLS(console.log);
                getFID(console.log);
                getFCP(console.log);
                getLCP(console.log);
                getTTFB(console.log);
            });
        }
        
        // Monitor page load performance
        window.addEventListener('load', () => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`Page load time: ${loadTime}ms`);
            
            // Show performance badge for fast loads
            if (loadTime < 2000) {
                const badge = document.createElement('div');
                badge.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: var(--md-accent-fg-color);
                    color: var(--md-primary-fg-color);
                    padding: 8px 12px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    z-index: 1000;
                    opacity: 0;
                    transform: translateY(20px);
                    transition: all 0.3s ease;
                `;
                badge.textContent = `⚡ Fast load: ${loadTime}ms`;
                document.body.appendChild(badge);
                
                setTimeout(() => {
                    badge.style.opacity = '1';
                    badge.style.transform = 'translateY(0)';
                }, 100);
                
                setTimeout(() => {
                    badge.style.opacity = '0';
                    badge.style.transform = 'translateY(20px)';
                    setTimeout(() => badge.remove(), 300);
                }, 3000);
            }
        });
    }
    
    // Initialize all features
    enhanceCodeBlocks();
    createContentToggles();
    enhanceDiagrams();
    enhanceAdmonitions();
    setupProgressiveLoading();
    setupKeyboardShortcuts();
    setupPerformanceMonitoring();
    
    console.log('🚀 Advanced interactive features loaded');
});

// ========== CSS ANIMATIONS FOR INTERACTIVE ELEMENTS ========== //
const advancedCSS = `
    @keyframes code-line-animate {
        from {
            opacity: 0;
            transform: translateX(-10px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .code-line-animate {
        animation: code-line-animate 0.5s ease-out both;
    }
    
    .collapsible-content {
        transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                    opacity 0.3s ease,
                    padding 0.3s ease;
    }
    
    .tabbed-content {
        transition: opacity 0.3s ease, transform 0.3s ease;
    }
    
    .admonition {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .keyboard-shortcuts-modal kbd {
        background: var(--md-code-bg-color);
        border: 1px solid var(--md-default-border-color, #21262d);
        border-radius: 4px;
        padding: 2px 6px;
        font-family: monospace;
        font-size: 0.85em;
    }
    
    /* Enhanced scroll animations */
    .loaded {
        animation: fadeInUp 0.6s ease-out;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* Code block language indicators */
    .highlight {
        position: relative;
    }
    
    .code-language-indicator {
        font-family: "Inter", sans-serif;
        letter-spacing: 0.5px;
    }
    
    /* Performance optimizations */
    @media (prefers-reduced-motion: reduce) {
        .code-line-animate,
        .loaded,
        .collapsible-content,
        .tabbed-content,
        .admonition {
            animation: none !important;
            transition: none !important;
        }
    }
`;

// Inject advanced CSS
const advancedStyleSheet = document.createElement('style');
advancedStyleSheet.textContent = advancedCSS;
document.head.appendChild(advancedStyleSheet);
