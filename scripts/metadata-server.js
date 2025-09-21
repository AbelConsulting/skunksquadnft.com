const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files from metadata directory
app.use(express.static(path.join(__dirname, '..', 'metadata')));

// API routes for metadata
app.get('/contract.json', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'metadata', 'contract.json'));
});

app.get('/unrevealed.json', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'metadata', 'unrevealed.json'));
});

app.get('/metadata/:id.json', (req, res) => {
  const id = req.params.id;
  res.sendFile(path.join(__dirname, '..', 'metadata', `${id}.json`));
});

app.get('/metadata/:id', (req, res) => {
  const id = req.params.id;
  res.sendFile(path.join(__dirname, '..', 'metadata', `${id}.json`));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Skunk Squad NFT Metadata Server',
    endpoints: {
      contract: '/contract.json',
      unrevealed: '/unrevealed.json',
      token: '/metadata/{id}.json'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path,
    available_endpoints: [
      '/contract.json',
      '/unrevealed.json', 
      '/metadata/{id}.json',
      '/health'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🌐 Skunk Squad NFT Metadata Server running on http://localhost:${PORT}`);
  console.log(`📄 Contract metadata: http://localhost:${PORT}/contract.json`);
  console.log(`🎭 Unrevealed metadata: http://localhost:${PORT}/unrevealed.json`);
  console.log(`🎨 Token metadata: http://localhost:${PORT}/metadata/1.json`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});

module.exports = app;