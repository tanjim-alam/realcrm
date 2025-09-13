#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🏠 Real Estate CRM Setup');
console.log('========================\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 18) {
  console.error('❌ Node.js version 18 or higher is required');
  console.error(`   Current version: ${nodeVersion}`);
  process.exit(1);
}

console.log(`✅ Node.js version: ${nodeVersion}`);

// Create environment files if they don't exist
const backendEnvPath = path.join(__dirname, 'backend', '.env');
const frontendEnvPath = path.join(__dirname, 'frontend', '.env');

if (!fs.existsSync(backendEnvPath)) {
  console.log('📝 Creating backend/.env file...');
  const backendEnvContent = `PORT=5000
MONGO_URI=mongodb://localhost:27017/realestate_crm
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
NODE_ENV=development`;
  
  fs.writeFileSync(backendEnvPath, backendEnvContent);
  console.log('✅ Backend environment file created');
} else {
  console.log('✅ Backend environment file already exists');
}

if (!fs.existsSync(frontendEnvPath)) {
  console.log('📝 Creating frontend/.env file...');
  const frontendEnvContent = `VITE_API_URL=http://localhost:5000/api`;
  
  fs.writeFileSync(frontendEnvPath, frontendEnvContent);
  console.log('✅ Frontend environment file created');
} else {
  console.log('✅ Frontend environment file already exists');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Root dependencies installed');
  
  execSync('cd backend && npm install', { stdio: 'inherit' });
  console.log('✅ Backend dependencies installed');
  
  execSync('cd frontend && npm install', { stdio: 'inherit' });
  console.log('✅ Frontend dependencies installed');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Make sure MongoDB is running on your system');
console.log('2. Update the JWT_SECRET in backend/.env for production');
console.log('3. Run "npm run dev" to start the development server');
console.log('4. Open http://localhost:5173 in your browser');
console.log('\n🚀 Happy coding!');
