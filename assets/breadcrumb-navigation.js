/* ========== BREADCRUMB NAVIGATION JAVASCRIPT ========== */

// Generate breadcrumb navigation dynamically
document.addEventListener('DOMContentLoaded', function() {
  // Only add breadcrumbs on pages that have navigation
  const hideNav = document.querySelector('meta[name="hide"]');
  if (hideNav && hideNav.content.includes('navigation')) {
    return; // Don't add breadcrumbs on homepage
  }

  // Get current path
  const pathname = window.location.pathname;
  const pathParts = pathname.split('/').filter(part => part && part !== 'index.html');
  
  // Don't show breadcrumbs on root
  if (pathParts.length <= 1) {
    return;
  }

  // Create breadcrumb container
  const breadcrumbNav = document.createElement('nav');
  breadcrumbNav.className = 'breadcrumb-nav';
  breadcrumbNav.setAttribute('aria-label', 'Breadcrumb navigation');
  
  const breadcrumbList = document.createElement('ol');
  breadcrumbList.className = 'breadcrumb-list';
  
  // Add home link
  const homeLi = document.createElement('li');
  const homeLink = document.createElement('a');
  homeLink.href = '/';
  homeLink.textContent = 'Home';
  homeLink.setAttribute('aria-label', 'Go to homepage');
  homeLi.appendChild(homeLink);
  breadcrumbList.appendChild(homeLi);
  
  // Build breadcrumb path
  let currentPath = '';
  pathParts.forEach((part, index) => {
    // Skip the site name part if present
    if (part === 'overwrked-public') {
      return;
    }
    
    currentPath += '/' + part;
    const li = document.createElement('li');
    
    // Format part name (capitalize, remove hyphens)
    const formattedName = part
      .replace(/-/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase())
      .replace('.html', '')
      .replace('.md', '');
    
    if (index === pathParts.length - 1) {
      // Current page (no link)
      const span = document.createElement('span');
      span.className = 'current';
      span.textContent = formattedName;
      span.setAttribute('aria-current', 'page');
      li.appendChild(span);
    } else {
      // Link to parent page
      const link = document.createElement('a');
      link.href = currentPath + '/';
      link.textContent = formattedName;
      link.setAttribute('aria-label', 'Go to ' + formattedName);
      li.appendChild(link);
    }
    
    breadcrumbList.appendChild(li);
  });
  
  breadcrumbNav.appendChild(breadcrumbList);
  
  // Insert breadcrumbs after header but before content
  const mainContent = document.querySelector('.md-content__inner');
  if (mainContent) {
    const firstHeading = mainContent.querySelector('h1');
    if (firstHeading) {
      firstHeading.insertAdjacentElement('afterend', breadcrumbNav);
    } else {
      mainContent.insertAdjacentElement('afterbegin', breadcrumbNav);
    }
  }
  
  // Add structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": []
  };
  
  let position = 1;
  
  // Add home
  structuredData.itemListElement.push({
    "@type": "ListItem",
    "position": position++,
    "name": "Home",
    "item": window.location.origin + "/"
  });
  
  // Add path items
  currentPath = window.location.origin;
  pathParts.forEach((part, index) => {
    if (part === 'overwrked-public') {
      return;
    }
    
    currentPath += '/' + part;
    const formattedName = part
      .replace(/-/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase())
      .replace('.html', '')
      .replace('.md', '');
    
    structuredData.itemListElement.push({
      "@type": "ListItem",
      "position": position++,
      "name": formattedName,
      "item": currentPath + (index < pathParts.length - 1 ? '/' : '')
    });
  });
  
  // Add structured data to page
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
});