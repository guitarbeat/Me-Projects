#!/usr/bin/env node

/**
 * Deployment Health Check Script
 * Validates that the build is ready for deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REQUIRED_FILES = [
  'dist/index.html',
  'dist/manifest.webmanifest',
  'dist/sw.js'
];

const REQUIRED_ASSETS = [
  'dist/assets/index-',
  'dist/assets/vendor-',
  'dist/assets/EmotionalCalendar-'
];

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function checkAssetsExist() {
  const distDir = path.join(__dirname, '../dist');
  if (!fs.existsSync(distDir)) {
    return false;
  }
  
  const files = fs.readdirSync(distDir);
  const assetsDir = path.join(distDir, 'assets');
  
  if (!fs.existsSync(assetsDir)) {
    return false;
  }
  
  const assetFiles = fs.readdirSync(assetsDir);
  
  return REQUIRED_ASSETS.some(pattern => 
    assetFiles.some(file => file.includes(pattern.replace('dist/assets/', '')))
  );
}

function checkBuildSize() {
  const distDir = path.join(__dirname, '../dist');
  if (!fs.existsSync(distDir)) {
    return { success: false, message: 'Dist directory not found' };
  }
  
  const getDirSize = (dir) => {
    let size = 0;
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        size += getDirSize(filePath);
      } else {
        size += stat.size;
      }
    }
    
    return size;
  };
  
  const totalSize = getDirSize(distDir);
  const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
  
  if (totalSize > 50 * 1024 * 1024) { // 50MB limit
    return { 
      success: false, 
      message: `Build size too large: ${sizeInMB}MB (limit: 50MB)` 
    };
  }
  
  return { 
    success: true, 
    message: `Build size: ${sizeInMB}MB` 
  };
}

function main() {
  console.log('🔍 Running deployment health check...\n');
  
  let allChecksPassed = true;
  
  // Check required files
  console.log('📁 Checking required files...');
  for (const file of REQUIRED_FILES) {
    const exists = checkFileExists(file);
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
    if (!exists) allChecksPassed = false;
  }
  
  // Check assets
  console.log('\n🎨 Checking assets...');
  const assetsExist = checkAssetsExist();
  console.log(`  ${assetsExist ? '✅' : '❌'} Required assets found`);
  if (!assetsExist) allChecksPassed = false;
  
  // Check build size
  console.log('\n📊 Checking build size...');
  const sizeCheck = checkBuildSize();
  console.log(`  ${sizeCheck.success ? '✅' : '❌'} ${sizeCheck.message}`);
  if (!sizeCheck.success) allChecksPassed = false;
  
  // Check Vercel config
  console.log('\n⚙️  Checking Vercel configuration...');
  const vercelConfigExists = checkFileExists('vercel.json');
  console.log(`  ${vercelConfigExists ? '✅' : '❌'} vercel.json`);
  if (!vercelConfigExists) allChecksPassed = false;
  
  // Check PWA files
  console.log('\n📱 Checking PWA files...');
  const pwaFiles = ['public/404.html', 'public/500.html', 'api/health.js'];
  for (const file of pwaFiles) {
    const exists = checkFileExists(file);
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
    if (!exists) allChecksPassed = false;
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (allChecksPassed) {
    console.log('🎉 All deployment checks passed! Ready for deployment.');
    process.exit(0);
  } else {
    console.log('❌ Some deployment checks failed. Please fix the issues above.');
    process.exit(1);
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main };