/* Interactive File Tree Component */

document.addEventListener('DOMContentLoaded', function() {
    
    // ========== INTERACTIVE FILE TREE ========== //
    
    function createInteractiveFileTree() {
        const fileTree = document.querySelector('.file-tree');
        if (!fileTree) return;
        
        // Add click handlers to file tree items
        const codeBlock = fileTree.querySelector('code');
        if (!codeBlock) return;
        
        const lines = codeBlock.innerHTML.split('\n');
        let newHTML = '';
        
        lines.forEach((line, index) => {
            if (line.includes('📄') || line.includes('📊')) {
                // Make files clickable
                const fileName = line.match(/📄|📊\s*(.+?)(?:\s|$)/);
                if (fileName) {
                    const linkMatch = line.match(/(\S+\.md)/);
                    if (linkMatch) {
                        const fileLink = linkMatch[1];
                        const href = fileLink === 'dashboard.md' ? 'dashboard/' : 
                                   fileLink.includes('project-blueprint') ? 'Projects/project-blueprint/' :
                                   fileLink.includes('public-note-template') ? 'Templates/public-note-template/' :
                                   '#';
                        line = line.replace(linkMatch[0], 
                            `<a href="${href}" class="file-link" data-file="${fileLink}">${linkMatch[0]}</a>`);
                    }
                }
            } else if (line.includes('📂')) {
                // Make folders expandable
                line = line.replace(/📂\s*(.+?)\//g, 
                    '<span class="folder-link" data-folder="$1">📂 $1/</span>');
            }
            
            newHTML += line + (index < lines.length - 1 ? '\n' : '');
        });
        
        codeBlock.innerHTML = newHTML;
        
        // Add click handlers
        fileTree.querySelectorAll('.file-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href && href !== '#') {
                    // Add loading animation
                    link.classList.add('loading');
                    setTimeout(() => {
                        window.location.href = href;
                    }, 200);
                }
            });
            
            link.addEventListener('mouseenter', () => {
                link.style.background = 'rgba(0, 212, 255, 0.1)';
                link.style.color = 'var(--md-accent-fg-color)';
                link.style.borderRadius = '4px';
                link.style.padding = '2px 4px';
                link.style.transition = 'all 0.2s ease';
            });
            
            link.addEventListener('mouseleave', () => {
                link.style.background = 'transparent';
                link.style.color = 'inherit';
                link.style.padding = '0';
            });
        });
        
        fileTree.querySelectorAll('.folder-link').forEach(folder => {
            folder.addEventListener('click', () => {
                folder.classList.toggle('expanded');
                folder.style.color = folder.classList.contains('expanded') ? 
                    'var(--md-accent-fg-color)' : 'inherit';
            });
            
            folder.style.cursor = 'pointer';
            folder.style.transition = 'color 0.2s ease';
        });
    }
    
    // ========== FOLDER CARD ENHANCEMENTS ========== //
    
    function enhanceFolderCards() {
        const folderCards = document.querySelectorAll('.folder-card');
        
        folderCards.forEach(card => {
            // Add ripple effect
            card.addEventListener('click', function(e) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const ripple = document.createElement('div');
                ripple.style.cssText = `
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(0, 212, 255, 0.3);
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    pointer-events: none;
                    left: ${x - 50}px;
                    top: ${y - 50}px;
                    width: 100px;
                    height: 100px;
                `;
                
                card.style.position = 'relative';
                card.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
            
            // Add magnetic hover effect
            card.addEventListener('mousemove', function(e) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                const distance = Math.sqrt(x * x + y * y);
                const maxDistance = Math.sqrt(rect.width * rect.width + rect.height * rect.height) / 2;
                const intensity = (maxDistance - distance) / maxDistance;
                
                if (intensity > 0) {
                    const moveX = x * intensity * 0.1;
                    const moveY = y * intensity * 0.1;
                    
                    card.style.transform = `translateY(-8px) scale(1.02) translate(${moveX}px, ${moveY}px)`;
                }
            });
            
            card.addEventListener('mouseleave', function() {
                card.style.transform = '';
            });
        });
    }
    
    // ========== ACTIVITY LIST ANIMATIONS ========== //
    
    function animateActivityList() {
        const activityItems = document.querySelectorAll('.activity-list li');
        
        activityItems.forEach((item, index) => {
            // Staggered animation
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            item.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, index * 100);
            
            // Add hover effects
            item.addEventListener('mouseenter', () => {
                item.style.background = 'rgba(0, 212, 255, 0.05)';
                item.style.borderRadius = '6px';
                item.style.padding = '0.75rem 1rem';
                item.style.marginLeft = '-1rem';
                item.style.marginRight = '-1rem';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.background = 'transparent';
                item.style.borderRadius = '0';
                item.style.padding = '0.75rem 0';
                item.style.marginLeft = '0';
                item.style.marginRight = '0';
            });
        });
    }
    
    // ========== FLOATING ANIMATION TRIGGER ========== //
    
    function addFloatingAnimations() {
        const elements = document.querySelectorAll('.folder-card h3');
        elements.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.2}s`;
            element.classList.add('floating-element');
        });
    }
    
    // ========== SCROLL REVEAL ANIMATIONS ========== //
    
    function initScrollReveal() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    entry.target.style.animation = 'slideInUp 0.6s ease forwards';
                }
            });
        }, observerOptions);
        
        // Observe elements for scroll reveal
        const elementsToReveal = document.querySelectorAll('.folder-card, .file-tree, .activity-list');
        elementsToReveal.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            observer.observe(el);
        });
    }
    
    // ========== ENHANCED BUTTON INTERACTIONS ========== //
    
    function enhanceButtons() {
        const buttons = document.querySelectorAll('.action-buttons .md-button');
        
        buttons.forEach(button => {
            // Add loading state
            button.addEventListener('click', function(e) {
                if (button.href && button.href !== '#') {
                    e.preventDefault();
                    
                    button.innerHTML = '<span class="loading-spinner"></span>' + button.innerHTML;
                    button.style.pointerEvents = 'none';
                    
                    setTimeout(() => {
                        window.location.href = button.href;
                    }, 500);
                }
            });
            
            // Add sound effect (visual feedback)
            button.addEventListener('click', function() {
                button.style.animation = 'micro-bounce 0.3s ease';
                setTimeout(() => {
                    button.style.animation = '';
                }, 300);
            });
        });
    }
    
    // ========== KEYBOARD SHORTCUTS ========== //
    
    function addKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Alt + P = Projects
            if (e.altKey && e.code === 'KeyP') {
                e.preventDefault();
                window.location.href = 'Projects/';
            }
            
            // Alt + N = Notes
            if (e.altKey && e.code === 'KeyN') {
                e.preventDefault();
                window.location.href = 'Notes/';
            }
            
            // Alt + D = Dashboard
            if (e.altKey && e.code === 'KeyD') {
                e.preventDefault();
                window.location.href = 'dashboard/';
            }
            
            // Alt + T = Templates
            if (e.altKey && e.code === 'KeyT') {
                e.preventDefault();
                window.location.href = 'Templates/';
            }
        });
    }
    
    // ========== INITIALIZE ALL FEATURES ========== //
    
    createInteractiveFileTree();
    enhanceFolderCards();
    animateActivityList();
    addFloatingAnimations();
    initScrollReveal();
    enhanceButtons();
    addKeyboardShortcuts();
    
    console.log('🎨 Premium interactive features loaded');
});

// ========== CSS ANIMATIONS ========== //
const premiumAnimations = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .loading-spinner {
        display: inline-block;
        width: 12px;
        height: 12px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-right: 0.5rem;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .file-link.loading {
        opacity: 0.6;
        pointer-events: none;
    }
`;

// Inject premium animations CSS
const premiumStyleSheet = document.createElement('style');
premiumStyleSheet.textContent = premiumAnimations;
document.head.appendChild(premiumStyleSheet);
