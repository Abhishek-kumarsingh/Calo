/**
 * This script creates a test user in the MongoDB database.
 * Run it with: node scripts/create-test-user.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/interviewai';

// User data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  image: null
};

async function createTestUser() {
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

    // Check if user already exists
    const existingUser = await User.findOne({ email: testUser.email });

    if (existingUser) {
      console.log(`User with email ${testUser.email} already exists`);
      await mongoose.disconnect();
      return;
    }

    // Create new user
    const user = new User(testUser);
    await user.save();

    // Log the created user
    console.log('Created user:', {
      id: user._id.toString(),
      name: user.name,
      email: user.email
    });

    console.log(`Test user created successfully: ${user.email}`);
    console.log('User ID:', user._id.toString());

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

// Run the function
createTestUser();
