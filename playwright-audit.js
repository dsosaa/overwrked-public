// ========== PROFESSIONAL UX/UI AUDIT WITH PLAYWRIGHT ==========

const { chromium } = require('playwright');
const fs = require('fs');

class WebsiteDesignAuditor {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.auditResults = {
      timestamp: new Date().toISOString(),
      url: baseUrl,
      scores: {},
      issues: [],
      recommendations: [],
      screenshots: []
    };
  }

  async runAudit() {
    console.log('🎨 Starting Professional UX/UI Audit...');
    console.log(`🌐 Target URL: ${this.baseUrl}`);

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });

    try {
      // Audit different pages and viewports
      await this.auditHomepage(context);
      await this.auditProjectsPage(context);
      await this.auditFeaturesPage(context);
      await this.auditNotesPage(context);
      await this.auditMobileResponsiveness(context);
      await this.auditAccessibility(context);
      await this.auditPerformance(context);

      // Generate comprehensive report
      this.generateReport();

    } catch (error) {
      console.error('❌ Audit failed:', error);
    } finally {
      await browser.close();
    }
  }

  async auditHomepage(context) {
    console.log('📋 Auditing Homepage...');
    
    const page = await context.newPage();
    await page.goto(this.baseUrl);
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({ 
      path: 'homepage-desktop.png', 
      fullPage: true 
    });

    // UI/UX Analysis
    const homepageIssues = [];
    const homepageRecommendations = [];

    // Check hero section
    const heroSection = await page.locator('.clean-hero').first();
    if (await heroSection.count() > 0) {
      const heroText = await heroSection.textContent();
      if (heroText.length < 50) {
        homepageIssues.push({
          severity: 'medium',
          category: 'content',
          issue: 'Hero section text is too brief',
          location: 'Homepage hero section',
          suggestion: 'Expand hero text to 50-100 characters for better engagement'
        });
      }
    }

    // Check folder cards design
    const folderCards = await page.locator('.clean-folder-card').count();
    if (folderCards > 0) {
      // Check card consistency
      const cardHeights = await page.locator('.clean-folder-card').evaluateAll(cards => 
        cards.map(card => card.offsetHeight)
      );
      
      const heightVariance = Math.max(...cardHeights) - Math.min(...cardHeights);
      if (heightVariance > 50) {
        homepageIssues.push({
          severity: 'low',
          category: 'visual-consistency',
          issue: 'Folder cards have inconsistent heights',
          location: 'Browse by Folder section',
          suggestion: 'Use min-height or flexbox to ensure consistent card heights'
        });
      }
    }

    // Check visual hierarchy
    const h2Elements = await page.locator('h2').count();
    if (h2Elements > 5) {
      homepageIssues.push({
        severity: 'medium',
        category: 'information-architecture',
        issue: 'Too many H2 headings may overwhelm users',
        location: 'Homepage structure',
        suggestion: 'Consider combining sections or using H3 for subsections'
      });
    }

    // Check CTA visibility
    const ctaButtons = await page.locator('.clean-btn, .action-btn').count();
    if (ctaButtons < 3) {
      homepageRecommendations.push({
        priority: 'high',
        category: 'conversion',
        recommendation: 'Add more prominent call-to-action buttons',
        implementation: 'Consider adding floating action button or sticky CTA bar'
      });
    }

    // Color contrast analysis
    await this.checkColorContrast(page, homepageIssues);

    // Typography analysis
    await this.checkTypography(page, homepageIssues);

    this.auditResults.issues.push(...homepageIssues);
    this.auditResults.recommendations.push(...homepageRecommendations);

    await page.close();
  }

  async auditProjectsPage(context) {
    console.log('🚀 Auditing Projects Page...');
    
    const page = await context.newPage();
    await page.goto(`${this.baseUrl}/Projects/`);
    await page.waitForLoadState('networkidle');

    await page.screenshot({ 
      path: 'projects-page.png', 
      fullPage: true 
    });

    const projectsIssues = [];

    // Check content density
    const contentBlocks = await page.locator('.category-item, .grid.cards > *').count();
    if (contentBlocks < 3) {
      projectsIssues.push({
        severity: 'medium',
        category: 'content-strategy',
        issue: 'Projects page appears sparse',
        location: 'Projects page content',
        suggestion: 'Add more project categories or placeholder content to show potential'
      });
    }

    // Check navigation breadcrumbs
    const breadcrumbs = await page.locator('[aria-label="breadcrumb"], .breadcrumbs').count();
    if (breadcrumbs === 0) {
      projectsIssues.push({
        severity: 'low',
        category: 'navigation',
        issue: 'Missing breadcrumb navigation',
        location: 'Projects page header',
        suggestion: 'Add breadcrumb navigation for better user orientation'
      });
    }

    this.auditResults.issues.push(...projectsIssues);
    await page.close();
  }

  async auditFeaturesPage(context) {
    console.log('✨ Auditing Features Page...');
    
    const page = await context.newPage();
    await page.goto(`${this.baseUrl}/features/`);
    await page.waitForLoadState('networkidle');

    await page.screenshot({ 
      path: 'features-page.png', 
      fullPage: true 
    });

    const featuresIssues = [];

    // Check feature card layout
    const featureCards = await page.locator('.feature-card').count();
    if (featureCards > 0) {
      // Check for overwhelming content
      if (featureCards > 12) {
        featuresIssues.push({
          severity: 'medium',
          category: 'cognitive-load',
          issue: 'Too many feature cards may overwhelm users',
          location: 'Features page grid',
          suggestion: 'Group features into categories or use progressive disclosure'
        });
      }
    }

    // Check interactive elements
    const interactiveButtons = await page.locator('button, .feature-btn').count();
    if (interactiveButtons > 0) {
      // Test hover states
      await page.hover('.feature-btn');
      const hasHoverEffect = await page.locator('.feature-btn:hover').count() > 0;
      if (!hasHoverEffect) {
        featuresIssues.push({
          severity: 'low',
          category: 'interactivity',
          issue: 'Buttons lack clear hover feedback',
          location: 'Feature action buttons',
          suggestion: 'Add hover effects to improve interactivity feedback'
        });
      }
    }

    this.auditResults.issues.push(...featuresIssues);
    await page.close();
  }

  async auditNotesPage(context) {
    console.log('📝 Auditing Notes Page...');
    
    const page = await context.newPage();
    await page.goto(`${this.baseUrl}/Notes/`);
    await page.waitForLoadState('networkidle');

    await page.screenshot({ 
      path: 'notes-page.png', 
      fullPage: true 
    });

    const notesIssues = [];

    // Check empty state design
    const emptyState = await page.locator('.empty-state').first();
    if (await emptyState.count() > 0) {
      const emptyStateText = await emptyState.textContent();
      if (emptyStateText.includes('No notes published yet')) {
        this.auditResults.recommendations.push({
          priority: 'medium',
          category: 'user-experience',
          recommendation: 'Enhance empty state with actionable guidance',
          implementation: 'Add sample content, getting started guide, or demo notes'
        });
      }
    }

    this.auditResults.issues.push(...notesIssues);
    await page.close();
  }

  async auditMobileResponsiveness(context) {
    console.log('📱 Auditing Mobile Responsiveness...');
    
    const mobileViewports = [
      { width: 390, height: 844, name: 'iPhone 12 Pro' },
      { width: 360, height: 640, name: 'Android Small' },
      { width: 768, height: 1024, name: 'iPad' }
    ];

    for (const viewport of mobileViewports) {
      const page = await context.newPage();
      await page.setViewportSize(viewport);
      await page.goto(this.baseUrl);
      await page.waitForLoadState('networkidle');

      await page.screenshot({ 
        path: `mobile-${viewport.name.toLowerCase().replace(/\s+/g, '-')}.png`,
        fullPage: true 
      });

      // Check mobile-specific issues
      const mobileIssues = [];

      // Check text readability
      const smallText = await page.locator('*').evaluateAll(elements => {
        return elements.filter(el => {
          const style = window.getComputedStyle(el);
          const fontSize = parseFloat(style.fontSize);
          return fontSize < 14 && el.textContent.trim().length > 0;
        }).length;
      });

      if (smallText > 5) {
        mobileIssues.push({
          severity: 'high',
          category: 'mobile-usability',
          issue: 'Text too small on mobile devices',
          location: `${viewport.name} viewport`,
          suggestion: 'Ensure minimum 14px font size for mobile readability'
        });
      }

      // Check button touch targets
      const buttons = await page.locator('button, .btn, .clean-btn').evaluateAll(buttons => {
        return buttons.filter(btn => {
          const rect = btn.getBoundingClientRect();
          return rect.width < 44 || rect.height < 44;
        }).length;
      });

      if (buttons > 0) {
        mobileIssues.push({
          severity: 'medium',
          category: 'mobile-usability',
          issue: 'Touch targets too small for mobile',
          location: `${viewport.name} viewport`,
          suggestion: 'Ensure minimum 44px touch target size for mobile buttons'
        });
      }

      this.auditResults.issues.push(...mobileIssues);
      await page.close();
    }
  }

  async auditAccessibility(context) {
    console.log('♿ Auditing Accessibility...');
    
    const page = await context.newPage();
    await page.goto(this.baseUrl);
    await page.waitForLoadState('networkidle');

    const a11yIssues = [];

    // Check for alt text on images
    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    if (imagesWithoutAlt > 0) {
      a11yIssues.push({
        severity: 'high',
        category: 'accessibility',
        issue: `${imagesWithoutAlt} images missing alt text`,
        location: 'Various pages',
        suggestion: 'Add descriptive alt text to all images'
      });
    }

    // Check heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
    let previousLevel = 0;
    for (let i = 0; i < headings.length; i++) {
      const heading = await page.locator('h1, h2, h3, h4, h5, h6').nth(i);
      const tagName = await heading.evaluate(el => el.tagName);
      const currentLevel = parseInt(tagName.charAt(1));
      
      if (currentLevel - previousLevel > 1) {
        a11yIssues.push({
          severity: 'medium',
          category: 'accessibility',
          issue: 'Heading hierarchy skips levels',
          location: `Heading: "${headings[i].substring(0, 50)}..."`,
          suggestion: 'Maintain proper heading hierarchy (h1→h2→h3, etc.)'
        });
        break;
      }
      previousLevel = currentLevel;
    }

    // Check color contrast (simplified check)
    const contrastIssues = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      let lowContrastCount = 0;
      
      for (let el of elements) {
        const style = window.getComputedStyle(el);
        const bgColor = style.backgroundColor;
        const textColor = style.color;
        
        // Simple heuristic for low contrast
        if (bgColor && textColor && bgColor !== 'rgba(0, 0, 0, 0)') {
          // This is a simplified check - in production, use proper contrast ratio calculation
          if (bgColor === textColor) {
            lowContrastCount++;
          }
        }
      }
      
      return lowContrastCount;
    });

    this.auditResults.issues.push(...a11yIssues);
    await page.close();
  }

  async auditPerformance(context) {
    console.log('⚡ Auditing Performance...');
    
    const page = await context.newPage();
    
    // Enable performance monitoring
    await page.route('**/*', route => {
      const url = route.request().url();
      console.log(`📥 Loading: ${url}`);
      route.continue();
    });

    const startTime = Date.now();
    await page.goto(this.baseUrl);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    const performanceIssues = [];

    // Check load time
    if (loadTime > 3000) {
      performanceIssues.push({
        severity: 'medium',
        category: 'performance',
        issue: `Page load time is ${loadTime}ms (slow)`,
        location: 'Homepage',
        suggestion: 'Optimize images, reduce JavaScript bundle size, enable compression'
      });
    }

    // Check for render-blocking resources
    const scripts = await page.locator('script[src]').count();
    if (scripts > 10) {
      performanceIssues.push({
        severity: 'low',
        category: 'performance',
        issue: `${scripts} external scripts may block rendering`,
        location: 'Page head/body',
        suggestion: 'Bundle scripts, use async/defer attributes, or lazy load non-critical scripts'
      });
    }

    this.auditResults.scores.performance = {
      loadTime: loadTime,
      scriptCount: scripts,
      rating: loadTime < 2000 ? 'excellent' : loadTime < 3000 ? 'good' : 'needs-improvement'
    };

    this.auditResults.issues.push(...performanceIssues);
    await page.close();
  }

  async checkColorContrast(page, issues) {
    // Simplified color contrast check
    const lowContrastElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      return elements.filter(el => {
        const style = window.getComputedStyle(el);
        const bg = style.backgroundColor;
        const color = style.color;
        
        // Simple check for similar colors (in production, use proper WCAG contrast calculation)
        return bg && color && bg !== 'rgba(0, 0, 0, 0)' && 
               (bg.includes('rgb(128') || color.includes('rgb(128')); // Example check
      }).length;
    });

    if (lowContrastElements > 0) {
      issues.push({
        severity: 'medium',
        category: 'accessibility',
        issue: 'Potential color contrast issues detected',
        location: 'Various elements',
        suggestion: 'Ensure WCAG AA contrast ratio (4.5:1 for normal text)'
      });
    }
  }

  async checkTypography(page, issues) {
    const typographyCheck = await page.evaluate(() => {
      const textElements = Array.from(document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div'));
      let fontSizeVariations = new Set();
      let lineHeightIssues = 0;
      
      textElements.forEach(el => {
        const style = window.getComputedStyle(el);
        const fontSize = parseFloat(style.fontSize);
        const lineHeight = parseFloat(style.lineHeight);
        
        fontSizeVariations.add(Math.round(fontSize));
        
        // Check for tight line height
        if (lineHeight && lineHeight < fontSize * 1.2) {
          lineHeightIssues++;
        }
      });
      
      return {
        fontSizeCount: fontSizeVariations.size,
        lineHeightIssues
      };
    });

    if (typographyCheck.fontSizeCount > 8) {
      issues.push({
        severity: 'low',
        category: 'visual-consistency',
        issue: 'Too many font size variations',
        location: 'Typography system',
        suggestion: 'Standardize to 4-6 font sizes for better consistency'
      });
    }

    if (typographyCheck.lineHeightIssues > 3) {
      issues.push({
        severity: 'medium',
        category: 'readability',
        issue: 'Tight line spacing affects readability',
        location: 'Text content',
        suggestion: 'Use minimum 1.4 line-height for body text'
      });
    }
  }

  generateReport() {
    console.log('\n🎨 PROFESSIONAL UX/UI AUDIT REPORT');
    console.log('=====================================');

    // Summary
    const totalIssues = this.auditResults.issues.length;
    const highSeverity = this.auditResults.issues.filter(i => i.severity === 'high').length;
    const mediumSeverity = this.auditResults.issues.filter(i => i.severity === 'medium').length;
    const lowSeverity = this.auditResults.issues.filter(i => i.severity === 'low').length;

    console.log(`\n📊 SUMMARY:`);
    console.log(`   Total Issues: ${totalIssues}`);
    console.log(`   🔴 High Priority: ${highSeverity}`);
    console.log(`   🟡 Medium Priority: ${mediumSeverity}`);
    console.log(`   🟢 Low Priority: ${lowSeverity}`);

    // Issues by Category
    const categories = {};
    this.auditResults.issues.forEach(issue => {
      if (!categories[issue.category]) categories[issue.category] = 0;
      categories[issue.category]++;
    });

    console.log(`\n🎯 ISSUES BY CATEGORY:`);
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} issues`);
    });

    // Top Priority Issues
    console.log(`\n🚨 HIGH PRIORITY ISSUES:`);
    this.auditResults.issues
      .filter(i => i.severity === 'high')
      .forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue.issue}`);
        console.log(`      Location: ${issue.location}`);
        console.log(`      Solution: ${issue.suggestion}`);
        console.log('');
      });

    // Recommendations
    console.log(`\n💡 PROFESSIONAL RECOMMENDATIONS:`);
    this.auditResults.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.recommendation}`);
      console.log(`      Category: ${rec.category}`);
      console.log(`      Implementation: ${rec.implementation}`);
      console.log('');
    });

    // Performance Scores
    if (this.auditResults.scores.performance) {
      console.log(`\n⚡ PERFORMANCE:`);
      console.log(`   Load Time: ${this.auditResults.scores.performance.loadTime}ms`);
      console.log(`   Rating: ${this.auditResults.scores.performance.rating}`);
      console.log(`   Scripts: ${this.auditResults.scores.performance.scriptCount}`);
    }

    // Save detailed report
    const reportPath = 'audit-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.auditResults, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    console.log(`📸 Screenshots saved to current directory`);
  }
}

// Run the audit
async function runDesignAudit() {
  const auditor = new WebsiteDesignAuditor('https://dsosaa.github.io/overwrked-public/');
  await auditor.runAudit();
}

// Export for use
module.exports = { WebsiteDesignAuditor, runDesignAudit };

// Run if called directly
if (require.main === module) {
  runDesignAudit().catch(console.error);
}
