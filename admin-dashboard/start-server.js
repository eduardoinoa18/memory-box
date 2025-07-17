#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Memory Box Admin Dashboard...');
console.log('📁 Working directory:', process.cwd());

const adminPath = path.join(__dirname);
console.log('🔧 Admin dashboard path:', adminPath);

// Start the Next.js development server
const server = spawn('npx', ['next', 'dev', '-p', '3001'], {
  cwd: adminPath,
  stdio: 'inherit',
  shell: true
});

server.on('error', (err) => {
  console.error('❌ Failed to start server:', err);
});

server.on('close', (code) => {
  console.log(`🔴 Server process exited with code ${code}`);
});

console.log('🌐 Admin Dashboard will be available at: http://localhost:3001');
console.log('📋 Available routes:');
console.log('   - http://localhost:3001/admin (Main Dashboard)');
console.log('   - http://localhost:3001/admin/users (User Management)');
console.log('   - http://localhost:3001/admin/content (Content Management)');
console.log('   - http://localhost:3001/admin/analytics (Analytics)');
console.log('');
