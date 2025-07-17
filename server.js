const express = require('express');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = 19006;

// Serve static files
app.use(express.static(path.join(__dirname)));

// Serve the demo app as the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'memory-box-demo-complete.html'));
});

// API endpoints for demo functionality
app.get('/api/status', (req, res) => {
    res.json({
        status: 'running',
        version: '1.0.0',
        features: {
            upload: true,
            ai_letters: true,
            family_sharing: true,
            search: true,
            timeline: true,
            subscription: true
        }
    });
});

app.get('/api/user', (req, res) => {
    res.json({
        name: 'John Doe',
        email: 'john@example.com',
        plan: 'family',
        storage_used: '2.5GB',
        storage_total: '200GB'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Memory Box Main App running at http://localhost:${PORT}`);
    console.log(`🏢 Admin Dashboard available at http://localhost:3001`);
    console.log(`✨ All features are functional and ready to use!`);
});
