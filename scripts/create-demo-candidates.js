/**
 * This script creates demo candidates for the demo users in the MongoDB database.
 * Run it with: node scripts/create-demo-candidates.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/interviewai';

// Demo user emails
const ADMIN_EMAIL = 'admin@gmail.com';
const USER_EMAIL = 'user@gmail.com';

// Sample candidate data
const sampleCandidates = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    role: 'Frontend Developer',
    department: 'Engineering'
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '987-654-3210',
    role: 'Backend Developer',
    department: 'Engineering'
  },
  {
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    phone: '555-123-4567',
    role: 'Data Scientist',
    department: 'Data Science'
  }
];

async function createDemoCandidates() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Define User schema
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      image: String
    });

    // Define Candidate schema
    const candidateSchema = new mongoose.Schema({
      name: String,
      email: String,
      phone: String,
      role: String,
      department: String,
      user: mongoose.Schema.Types.ObjectId,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    // Create models
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    const Candidate = mongoose.models.Candidate || mongoose.model('Candidate', candidateSchema);

    // Find the admin user
    const adminUser = await User.findOne({ email: ADMIN_EMAIL });
    if (!adminUser) {
      console.log(`Admin user with email ${ADMIN_EMAIL} not found`);
    } else {
      console.log(`Found admin user: ${adminUser.name} (${adminUser._id})`);
      
      // Create candidates for admin
      for (const candidateData of sampleCandidates) {
        // Check if candidate already exists
        const existingCandidate = await Candidate.findOne({
          email: candidateData.email,
          user: adminUser._id
        });
        
        if (existingCandidate) {
          console.log(`Candidate for admin: ${candidateData.name} already exists`);
          continue;
        }
        
        // Create new candidate
        const candidate = new Candidate({
          ...candidateData,
          user: adminUser._id
        });
        
        await candidate.save();
        
        console.log(`Created candidate for admin: ${candidate.name} (${candidate._id})`);
      }
    }

    // Find the regular user
    const regularUser = await User.findOne({ email: USER_EMAIL });
    if (!regularUser) {
      console.log(`Regular user with email ${USER_EMAIL} not found`);
    } else {
      console.log(`Found regular user: ${regularUser.name} (${regularUser._id})`);
      
      // Create candidates for regular user
      for (const candidateData of sampleCandidates) {
        // Check if candidate already exists
        const existingCandidate = await Candidate.findOne({
          email: candidateData.email,
          user: regularUser._id
        });
        
        if (existingCandidate) {
          console.log(`Candidate for user: ${candidateData.name} already exists`);
          continue;
        }
        
        // Create new candidate
        const candidate = new Candidate({
          ...candidateData,
          user: regularUser._id
        });
        
        await candidate.save();
        
        console.log(`Created candidate for user: ${candidate.name} (${candidate._id})`);
      }
    }
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating demo candidates:', error);
  }
}

// Run the function
createDemoCandidates();
