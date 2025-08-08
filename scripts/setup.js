#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function setup() {
  console.log('🚀 Setting up Go Tripping Backend Node.js...\n');

  // Check if .env file exists
  const envPath = path.join(__dirname, '..', '.env');
  const envExamplePath = path.join(__dirname, '..', 'env.example');

  if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file from template...');
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ .env file created successfully');
      console.log('⚠️  Please update the .env file with your actual configuration values');
    } else {
      console.log('❌ env.example file not found');
      process.exit(1);
    }
  } else {
    console.log('✅ .env file already exists');
  }

  // Check if node_modules exists
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 Installing dependencies...');
    try {
      execSync('npm install', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
      console.log('✅ Dependencies installed successfully');
    } catch (error) {
      console.log('❌ Failed to install dependencies');
      process.exit(1);
    }
  } else {
    console.log('✅ Dependencies already installed');
  }

  // Check database connection
  console.log('🔍 Testing database connection...');
  try {
    const sequelize = require('../src/config/database');
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
  } catch (error) {
    console.log('❌ Database connection failed');
    console.log('Please check your database configuration in .env file');
    console.log('Error:', error.message);
  }

  console.log('\n🎉 Setup completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Update your .env file with actual configuration values');
  console.log('2. Run "npm run dev" to start the development server');
  console.log('3. Visit http://localhost:5002/api/health to check if the server is running');
  console.log('4. Visit http://localhost:5002/ for API documentation');
}

setup().catch(console.error);
