/**
 * This script creates a demo admin user in the MongoDB database.
 * Run it with: node scripts/create-demo-admin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/interviewai';

// Demo admin user data
const demoAdmin = {
  name: 'Admin User',
  email: 'admin@gmail.com',
  password: 'password123',
  image: null
};

async function createDemoAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Define User schema
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      image: String,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    // Hash password before saving
    userSchema.pre('save', async function(next) {
      if (!this.isModified('password')) return next();
      
      try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
      } catch (error) {
        next(error);
      }
    });

    // Create User model
    const User = mongoose.models.User || mongoose.model('User', userSchema);

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: demoAdmin.email });
    
    if (existingAdmin) {
      console.log(`Admin user with email ${demoAdmin.email} already exists`);
      await mongoose.disconnect();
      return;
    }

    // Create new admin user
    const admin = new User(demoAdmin);
    await admin.save();
    
    console.log(`Demo admin user created successfully: ${admin.email}`);
    console.log('Admin ID:', admin._id.toString());
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating demo admin user:', error);
  }
}

// Run the function
createDemoAdmin();
