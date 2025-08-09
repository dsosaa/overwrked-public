/* Interactive Features for Enhanced Cursor Theme */

document.addEventListener('DOMContentLoaded', function() {
    
    // ========== READING PROGRESS BAR ========== //
    function updateReadingProgress() {
        const article = document.querySelector('.md-content__inner');
        if (!article) return;
        
        const scrollTop = window.pageYOffset;
        const docHeight = article.offsetHeight;
        const winHeight = window.innerHeight;
        const scrollPercent = scrollTop / (docHeight - winHeight);
        const scrollPercentRounded = Math.round(scrollPercent * 100);
        
        document.documentElement.style.setProperty(
            '--scroll-progress', 
            Math.min(scrollPercentRounded, 100) + '%'
        );
    }
    
    window.addEventListener('scroll', updateReadingProgress);
    updateReadingProgress(); // Initial call
    
    // ========== SMOOTH ANCHOR SCROLLING ========== //
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // ========== ENHANCED CODE COPY FEEDBACK ========== //
    function enhanceCodeCopyButtons() {
        const copyButtons = document.querySelectorAll('.md-clipboard');
        copyButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Visual feedback
                const originalText = this.getAttribute('title') || 'Copy to clipboard';
                this.setAttribute('title', 'Copied!');
                this.style.background = '#10b981';
                
                // Reset after 2 seconds
                setTimeout(() => {
                    this.setAttribute('title', originalText);
                    this.style.background = '';
                }, 2000);
            });
        });
    }
    
    // Re-run when new content loads
    const observer = new MutationObserver(enhanceCodeCopyButtons);
    observer.observe(document.body, { childList: true, subtree: true });
    enhanceCodeCopyButtons(); // Initial call
    
    // ========== INTERACTIVE CARDS ========== //
    function addCardInteractions() {
        const cards = document.querySelectorAll('.md-typeset .grid.cards > *');
        cards.forEach(card => {
            // Add subtle parallax effect on mouse move
            card.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;
                
                this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = '';
            });
        });
    }
    
    addCardInteractions();
    
    // ========== ENHANCED NAVIGATION ========== //
    function enhanceNavigation() {
        // Add active section highlighting
        const sections = document.querySelectorAll('h1, h2, h3');
        const navLinks = document.querySelectorAll('.md-nav__link');
        
        function highlightActiveSection() {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                if (window.pageYOffset >= sectionTop - 60) {
                    current = section.getAttribute('id');
                }
            });
            
            navLinks.forEach(link => {
                link.classList.remove('md-nav__link--active');
                if (link.getAttribute('href') === '#' + current) {
                    link.classList.add('md-nav__link--active');
                }
            });
        }
        
        window.addEventListener('scroll', highlightActiveSection);
    }
    
    enhanceNavigation();
    
    // ========== SEARCH ENHANCEMENTS ========== //
    function enhanceSearch() {
        const searchInput = document.querySelector('.md-search__input');
        if (!searchInput) return;
        
        // Add search suggestions with keyboard navigation
        let currentSuggestion = -1;
        
        searchInput.addEventListener('keydown', function(e) {
            const suggestions = document.querySelectorAll('.md-search-result__item');
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                currentSuggestion = Math.min(currentSuggestion + 1, suggestions.length - 1);
                updateSuggestionHighlight(suggestions);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                currentSuggestion = Math.max(currentSuggestion - 1, -1);
                updateSuggestionHighlight(suggestions);
            } else if (e.key === 'Enter' && currentSuggestion >= 0) {
                e.preventDefault();
                suggestions[currentSuggestion].click();
            }
        });
        
        function updateSuggestionHighlight(suggestions) {
            suggestions.forEach((suggestion, index) => {
                suggestion.classList.toggle('highlighted', index === currentSuggestion);
            });
        }
    }
    
    enhanceSearch();
    
    // ========== TABLE ENHANCEMENTS ========== //
    function enhanceTables() {
        const tables = document.querySelectorAll('.md-typeset table');
        tables.forEach(table => {
            // Add table wrapper for horizontal scrolling
            if (!table.parentElement.classList.contains('table-wrapper')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'table-wrapper';
                wrapper.style.overflowX = 'auto';
                wrapper.style.borderRadius = '8px';
                wrapper.style.border = '1px solid #21262d';
                
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            }
            
            // Add sortable functionality to headers
            const headers = table.querySelectorAll('th');
            headers.forEach((header, index) => {
                if (header.textContent.trim()) {
                    header.style.cursor = 'pointer';
                    header.style.userSelect = 'none';
                    header.addEventListener('click', () => sortTable(table, index));
                }
            });
        });
    }
    
    function sortTable(table, column) {
        const tbody = table.querySelector('tbody');
        if (!tbody) return;
        
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const isAscending = table.getAttribute('data-sort-direction') !== 'asc';
        
        rows.sort((a, b) => {
            const aText = a.cells[column]?.textContent.trim() || '';
            const bText = b.cells[column]?.textContent.trim() || '';
            
            // Try to parse as numbers
            const aNum = parseFloat(aText);
            const bNum = parseFloat(bText);
            
            if (!isNaN(aNum) && !isNaN(bNum)) {
                return isAscending ? aNum - bNum : bNum - aNum;
            }
            
            return isAscending ? 
                aText.localeCompare(bText) : 
                bText.localeCompare(aText);
        });
        
        // Remove existing rows
        rows.forEach(row => row.remove());
        
        // Add sorted rows
        rows.forEach(row => tbody.appendChild(row));
        
        // Update sort direction
        table.setAttribute('data-sort-direction', isAscending ? 'asc' : 'desc');
        
        // Update header indicators
        const headers = table.querySelectorAll('th');
        headers.forEach((header, index) => {
            header.classList.remove('sort-asc', 'sort-desc');
            if (index === column) {
                header.classList.add(isAscending ? 'sort-asc' : 'sort-desc');
            }
        });
    }
    
    enhanceTables();
    
    // ========== LAZY LOADING ANIMATIONS ========== //
    function setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Observe elements that should animate in
        const animatedElements = document.querySelectorAll(
            '.md-typeset h1, .md-typeset h2, .md-typeset h3, ' +
            '.md-typeset .grid.cards > *, .md-typeset .admonition, ' +
            '.md-typeset table, .md-typeset pre'
        );
        
        animatedElements.forEach(el => {
            el.classList.add('animate-on-scroll');
            observer.observe(el);
        });
    }
    
    setupIntersectionObserver();
    
    // ========== ENHANCED TOOLTIPS ========== //
    function addTooltips() {
        const elements = document.querySelectorAll('[title]');
        elements.forEach(element => {
            const title = element.getAttribute('title');
            if (!title) return;
            
            // Remove default title to prevent browser tooltip
            element.removeAttribute('title');
            element.setAttribute('data-tooltip', title);
            
            element.addEventListener('mouseenter', showTooltip);
            element.addEventListener('mouseleave', hideTooltip);
        });
    }
    
    function showTooltip(e) {
        const tooltip = document.createElement('div');
        tooltip.className = 'custom-tooltip';
        tooltip.textContent = e.target.getAttribute('data-tooltip');
        tooltip.style.cssText = `
            position: absolute;
            background: var(--md-code-bg-color);
            color: var(--md-default-fg-color);
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.85rem;
            border: 1px solid #21262d;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            pointer-events: none;
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.2s ease;
        `;
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = e.target.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.bottom + 8 + 'px';
        
        // Animate in
        requestAnimationFrame(() => {
            tooltip.style.opacity = '1';
            tooltip.style.transform = 'translateY(0)';
        });
        
        e.target._tooltip = tooltip;
    }
    
    function hideTooltip(e) {
        const tooltip = e.target._tooltip;
        if (tooltip) {
            tooltip.style.opacity = '0';
            tooltip.style.transform = 'translateY(10px)';
            setTimeout(() => tooltip.remove(), 200);
            delete e.target._tooltip;
        }
    }
    
    addTooltips();
    
    // ========== PERFORMANCE MONITORING ========== //
    function monitorPerformance() {
        // Reduce animations if performance is poor
        let frameCount = 0;
        let lastTime = performance.now();
        
        function checkFPS() {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                
                if (fps < 30) {
                    document.body.classList.add('reduce-animations');
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(checkFPS);
        }
        
        requestAnimationFrame(checkFPS);
    }
    
    monitorPerformance();
    
});

// ========== CSS ADDITIONS FOR JAVASCRIPT FEATURES ========== //
const additionalCSS = `
    .animate-on-scroll {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.6s ease;
    }
    
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
    
    .table-wrapper {
        margin: 1rem 0;
    }
    
    .sort-asc::after {
        content: " ↑";
        color: var(--md-accent-fg-color);
    }
    
    .sort-desc::after {
        content: " ↓";
        color: var(--md-accent-fg-color);
    }
    
    .highlighted {
        background: rgba(0, 212, 255, 0.2) !important;
    }
    
    .reduce-animations * {
        animation-duration: 0.1s !important;
        transition-duration: 0.1s !important;
    }
    
    .custom-tooltip {
        font-family: "Inter", sans-serif;
    }
`;

// Inject additional CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalCSS;
document.head.appendChild(styleSheet);
