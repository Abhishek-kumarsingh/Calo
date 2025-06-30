// This script creates an admin user with the specified credentials
// Run with: node scripts/create-admin-user.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '.env.local' });

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

// Admin user credentials
const adminUser = {
  name: 'Admin User',
  email: 'abhi90067@gmail.com',
  password: 'Aa2275aA',
  role: 'admin'
};

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

// Define User schema for the script
// This should match the schema in lib/models/User.ts
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  image: {
    type: String
  }
}, {
  timestamps: true
});

// Add comparePassword method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create User model
const User = mongoose.models.User || mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingUser = await User.findOne({ email: adminUser.email });

    if (existingUser) {
      console.log(`Admin user with email ${adminUser.email} already exists`);

      // Update the user to ensure they have admin role
      if (existingUser.role !== 'admin') {
        existingUser.role = 'admin';
        await existingUser.save();
        console.log(`Updated user ${adminUser.email} to admin role`);
      }

      // Update password if requested
      const updatePassword = process.argv.includes('--update-password');
      if (updatePassword) {
        const hashedPassword = await bcrypt.hash(adminUser.password, 10);
        existingUser.password = hashedPassword;
        await existingUser.save();
        console.log(`Updated password for ${adminUser.email}`);
      }
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(adminUser.password, 10);

      const newUser = new User({
        name: adminUser.name,
        email: adminUser.email,
        password: hashedPassword,
        role: adminUser.role,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await newUser.save();
      console.log(`Created new admin user: ${adminUser.email}`);
    }

    console.log('Admin user setup complete');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.disconnect();
  }
}

createAdminUser();
