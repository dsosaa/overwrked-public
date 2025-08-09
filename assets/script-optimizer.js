/* ========== SCRIPT OPTIMIZATION & PERFORMANCE ========== */

// Script loading optimization to prevent render blocking
(function() {
  'use strict';

  // Configuration for script loading priorities
  const scriptConfig = {
    critical: [
      // Scripts that must load immediately
      'interactive-features.js',
      'advanced-interactions.js'
    ],
    deferred: [
      // Scripts that can load after DOM is ready
      'obsidian-features.js',
      'interactive-file-tree.js',
      'advanced-features.js',
      'obsidian-native-editor.js',
      'breadcrumb-navigation.js'
    ],
    lazy: [
      // Scripts that can load on user interaction
      'real-api-integration.js',
      'advanced-editor.js'
    ]
  };

  // Performance monitoring
  const perfData = {
    startTime: performance.now(),
    scriptLoadTimes: {},
    resourceTimings: []
  };

  // Optimize external Mermaid loading
  function optimizeMermaid() {
    const mermaidScript = document.querySelector('script[src*="mermaid"]');
    if (mermaidScript && !mermaidScript.hasAttribute('async')) {
      // Clone and replace with async version
      const newScript = document.createElement('script');
      newScript.src = mermaidScript.src;
      newScript.async = true;
      newScript.onload = function() {
        if (window.mermaid) {
          mermaid.initialize({ 
            startOnLoad: true,
            theme: 'dark',
            securityLevel: 'loose'
          });
        }
      };
      mermaidScript.parentNode.replaceChild(newScript, mermaidScript);
    }
  }

  // Preload critical resources
  function preloadCriticalResources() {
    // Preload fonts
    const fontPreload = document.createElement('link');
    fontPreload.rel = 'preload';
    fontPreload.as = 'style';
    fontPreload.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200';
    fontPreload.onload = function() {
      this.rel = 'stylesheet';
    };
    document.head.appendChild(fontPreload);

    // Preload critical CSS
    const criticalCSS = [
      'cursor-theme.css',
      'enhanced-visuals.css',
      'mobile-optimization.css'
    ];

    criticalCSS.forEach(css => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = `/assets/${css}`;
      link.onload = function() {
        this.rel = 'stylesheet';
      };
      document.head.appendChild(link);
    });
  }

  // Load scripts with priority
  function loadScriptWithPriority(src, priority = 'deferred') {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `/assets/${src}`;
      
      // Set loading behavior based on priority
      if (priority === 'critical') {
        // Load immediately but don't block render
        script.async = true;
      } else if (priority === 'deferred') {
        // Load after DOM parsing
        script.defer = true;
      } else if (priority === 'lazy') {
        // Load on interaction
        script.loading = 'lazy';
        script.async = true;
      }

      // Track loading time
      const startTime = performance.now();
      
      script.onload = () => {
        perfData.scriptLoadTimes[src] = performance.now() - startTime;
        resolve();
      };
      
      script.onerror = () => {
        console.error(`Failed to load script: ${src}`);
        reject(new Error(`Script load failed: ${src}`));
      };

      document.body.appendChild(script);
    });
  }

  // Intersection Observer for lazy loading
  function setupLazyLoading() {
    const lazyLoadTriggers = document.querySelectorAll('[data-lazy-load]');
    
    if ('IntersectionObserver' in window) {
      const lazyLoadObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const trigger = entry.target;
            const scriptToLoad = trigger.getAttribute('data-lazy-load');
            
            if (scriptToLoad && scriptConfig.lazy.includes(scriptToLoad)) {
              loadScriptWithPriority(scriptToLoad, 'lazy');
              lazyLoadObserver.unobserve(trigger);
            }
          }
        });
      }, {
        rootMargin: '50px'
      });

      lazyLoadTriggers.forEach(trigger => {
        lazyLoadObserver.observe(trigger);
      });
    }
  }

  // Resource hints for faster loading
  function addResourceHints() {
    // DNS prefetch for external domains
    const domains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://unpkg.com'
    ];

    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });

    // Preconnect to critical domains
    const preconnectDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ];

    preconnectDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  // Service Worker for caching (if supported)
  function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      // Check if service worker file exists
      fetch('/sw.js', { method: 'HEAD' })
        .then(response => {
          if (response.ok) {
            navigator.serviceWorker.register('/sw.js')
              .then(registration => {
                console.log('Service Worker registered:', registration);
              })
              .catch(error => {
                console.log('Service Worker registration skipped:', error);
              });
          }
        })
        .catch(() => {
          console.log('Service Worker file not found, skipping registration');
        });
    }
  }

  // Performance monitoring and reporting
  function reportPerformance() {
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const perfMetrics = {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        loadComplete: timing.loadEventEnd - timing.navigationStart,
        domInteractive: timing.domInteractive - timing.navigationStart,
        scripts: perfData.scriptLoadTimes,
        totalScriptTime: Object.values(perfData.scriptLoadTimes).reduce((a, b) => a + b, 0)
      };

      // Log performance metrics
      console.log('Performance Metrics:', perfMetrics);

      // Send to analytics if available
      if (window.gtag) {
        window.gtag('event', 'performance', {
          'event_category': 'Performance',
          'event_label': 'Page Load',
          'value': Math.round(perfMetrics.loadComplete),
          'custom_metrics': perfMetrics
        });
      }
    }
  }

  // Initialize optimizations
  function init() {
    // Add resource hints immediately
    addResourceHints();
    
    // Optimize Mermaid loading
    optimizeMermaid();
    
    // Preload critical resources
    preloadCriticalResources();
    
    // Load critical scripts
    Promise.all(
      scriptConfig.critical.map(script => 
        loadScriptWithPriority(script, 'critical')
      )
    ).then(() => {
      // Load deferred scripts after critical ones
      return Promise.all(
        scriptConfig.deferred.map(script => 
          loadScriptWithPriority(script, 'deferred')
        )
      );
    }).then(() => {
      // Setup lazy loading for remaining scripts
      setupLazyLoading();
      
      // Setup service worker
      setupServiceWorker();
      
      // Report performance metrics
      window.addEventListener('load', () => {
        setTimeout(reportPerformance, 0);
      });
    }).catch(error => {
      console.error('Script loading error:', error);
    });
  }

  // Start optimization as soon as possible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose performance data for debugging
  window.__performanceData = perfData;
})();

// Web Vitals monitoring (Core Web Vitals)
(function() {
  'use strict';

  // Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      // LCP observer not supported
    }
  }

  // First Input Delay (FID)
  if ('PerformanceObserver' in window) {
    try {
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-input') {
            const fid = entry.processingStart - entry.startTime;
            console.log('FID:', fid);
          }
        }
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      // FID observer not supported
    }
  }

  // Cumulative Layout Shift (CLS)
  if ('PerformanceObserver' in window) {
    let clsValue = 0;
    let clsEntries = [];
    
    try {
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            clsEntries.push(entry);
          }
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      
      // Report CLS when page is about to unload
      window.addEventListener('beforeunload', () => {
        console.log('CLS:', clsValue);
      });
    } catch (e) {
      // CLS observer not supported
    }
  }
})();