// Test script to verify upload route
const express = require('express');
require('dotenv').config();

console.log('Testing Cloudinary Configuration:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✓ Set' : '✗ Missing');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✓ Set' : '✗ Missing');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✓ Set' : '✗ Missing');

try {
  const cloudinary = require('./src/config/cloudinary');
  console.log('\n✓ Cloudinary config loaded successfully');
  
  const upload = require('./src/middleware/upload.middleware');
  console.log('✓ Upload middleware loaded successfully');
  
  const userRoutes = require('./src/routes/users.routes');
  console.log('✓ User routes loaded successfully');
  
  console.log('\n✅ All modules loaded successfully!');
  console.log('\nPlease restart your backend server with: npm run dev');
} catch (error) {
  console.error('\n❌ Error loading modules:', error.message);
}
