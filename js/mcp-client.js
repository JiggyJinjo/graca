// MCP development helper
// This script connects to the MCP server and logs file changes
// It will only be active during development

(function() {
  // Only load in development mode
  if (window.location.hostname !== 'localhost') return;
  
  // Create a small UI indicator
  const indicator = document.createElement('div');
  indicator.style.position = 'fixed';
  indicator.style.bottom = '10px';
  indicator.style.right = '10px';
  indicator.style.backgroundColor = 'rgba(0, 128, 255, 0.7)';
  indicator.style.color = 'white';
  indicator.style.padding = '5px 10px';
  indicator.style.borderRadius = '4px';
  indicator.style.fontSize = '12px';
  indicator.style.fontFamily = 'monospace';
  indicator.style.zIndex = '9999';
  indicator.style.cursor = 'pointer';
  indicator.textContent = 'MCP Active';
  indicator.title = 'MCP Server is monitoring file changes';
  
  // Add a counter for changes
  let changeCount = 0;
  
  // Load socket.io client from CDN
  const script = document.createElement('script');
  script.src = 'https://cdn.socket.io/4.5.4/socket.io.min.js';
  script.onload = initializeSocket;
  document.head.appendChild(script);
  
  // Initialize socket connection once loaded
  function initializeSocket() {
    // Connect to the server
    const socket = io();
    
    // Log when connected
    socket.on('connect', () => {
      console.log('Connected to MCP server');
      document.body.appendChild(indicator);
    });
    
    // Handle file changes
    socket.on('file-change', (data) => {
      changeCount++;
      indicator.textContent = `MCP Active (${changeCount} changes)`;
      
      console.log(`File changed: ${data.path} (${data.type})`);
      
      // If it's a CSS file, we can apply the changes without reload
      if (data.path.endsWith('.css')) {
        refreshCSS(data.path);
      } else {
        // Flash the indicator for other file types
        indicator.style.backgroundColor = 'rgba(220, 53, 69, 0.8)';
        setTimeout(() => {
          indicator.style.backgroundColor = 'rgba(0, 128, 255, 0.7)';
        }, 500);
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Disconnected from MCP server');
      indicator.style.backgroundColor = 'rgba(108, 117, 125, 0.7)';
      indicator.textContent = 'MCP Disconnected';
    });
    
    // Toggle logs when clicking the indicator
    indicator.addEventListener('click', () => {
      const logsVisible = indicator.getAttribute('data-logs-visible') === 'true';
      
      if (logsVisible) {
        indicator.setAttribute('data-logs-visible', 'false');
        indicator.textContent = `MCP Active (${changeCount} changes)`;
        indicator.style.backgroundColor = 'rgba(0, 128, 255, 0.7)';
      } else {
        indicator.setAttribute('data-logs-visible', 'true');
        indicator.textContent = 'MCP Logs Visible';
        indicator.style.backgroundColor = 'rgba(40, 167, 69, 0.7)';
        console.log('MCP: File change monitoring active');
      }
    });
  }
  
  // Function to refresh CSS without page reload
  function refreshCSS(filePath) {
    const links = document.getElementsByTagName('link');
    
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      
      if (link.rel === 'stylesheet' && link.href.includes(filePath)) {
        const href = link.href.replace(/(&|\?)_cacheOverride=\d+/, '');
        link.href = `${href}${href.includes('?') ? '&' : '?'}_cacheOverride=${new Date().getTime()}`;
        
        // Flash the indicator for visual feedback
        indicator.style.backgroundColor = 'rgba(40, 167, 69, 0.8)';
        setTimeout(() => {
          indicator.style.backgroundColor = 'rgba(0, 128, 255, 0.7)';
        }, 500);
        
        return;
      }
    }
  }
})();
