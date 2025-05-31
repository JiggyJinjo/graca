const express = require('express');
const http = require('http');
const path = require('path');
const chokidar = require('chokidar');
const cors = require('cors');
const { Server } = require('socket.io');

// Create Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Enable CORS
app.use(cors());

// Serve static files
app.use(express.static(__dirname));

// File paths we want to watch
const watchPaths = [
  'index.html',
  'css/**/*.css',
  'js/**/*.js',
  'assets/**/*'
];

// Initialize watcher
const watcher = chokidar.watch(watchPaths, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
  cwd: __dirname
});

// MCP-like context data
let contextData = {
  files: {},
  fileChanges: []
};

// Store file contents when they change
watcher.on('add', handleFileChange);
watcher.on('change', handleFileChange);
watcher.on('unlink', path => {
  console.log(`File ${path} has been removed`);
  delete contextData.files[path];
  
  contextData.fileChanges.push({
    path,
    type: 'delete',
    timestamp: new Date().toISOString()
  });
  
  io.emit('file-change', {
    path,
    type: 'delete'
  });
});

// Handle file changes
function handleFileChange(filePath) {
  const fs = require('fs');
  const fullPath = path.join(__dirname, filePath);
  
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    contextData.files[filePath] = content;
    
    contextData.fileChanges.push({
      path: filePath,
      type: 'change',
      timestamp: new Date().toISOString()
    });
    
    console.log(`File ${filePath} has been changed`);
    
    io.emit('file-change', {
      path: filePath,
      type: 'change',
      content
    });
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
  }
}

// MCP-like endpoint to retrieve context
app.get('/mcp/context', (req, res) => {
  res.json({
    version: '1.0.0',
    context: contextData
  });
});

// WebSocket connection for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected');
  
  // Send initial context
  socket.emit('context', contextData);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Website available at http://localhost:${PORT}`);
  console.log(`MCP context available at http://localhost:${PORT}/mcp/context`);
  console.log('Watching for file changes...');
});
