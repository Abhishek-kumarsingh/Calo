/**
 * This script creates demo interviews for the demo users in the MongoDB database.
 * Run it with: node scripts/create-demo-interviews.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/interviewai';

// Demo user emails
const ADMIN_EMAIL = 'admin@gmail.com';
const USER_EMAIL = 'user@gmail.com';

// Sample interview data
const sampleInterviews = [
  {
    domain: 'Web Development',
    subDomain: 'Frontend',
    level: 'Intermediate',
    status: 'completed',
    score: 85,
    type: 'technical',
    title: 'Frontend Developer Interview',
    description: 'Interview for frontend developer position'
  },
  {
    domain: 'Web Development',
    subDomain: 'Backend',
    level: 'Advanced',
    status: 'scheduled',
    type: 'technical',
    title: 'Backend Developer Interview',
    description: 'Interview for backend developer position'
  },
  {
    domain: 'Data Science',
    subDomain: 'Machine Learning',
    level: 'Intermediate',
    status: 'in_progress',
    type: 'technical',
    title: 'Machine Learning Engineer Interview',
    description: 'Interview for ML engineer position'
  }
];

async function createDemoInterviews() {
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

    // Define Interview schema
    const interviewSchema = new mongoose.Schema({
      domain: String,
      subDomain: String,
      level: String,
      status: String,
      score: Number,
      overallFeedback: String,
      questions: [{
        question: String,
        answer: String,
        feedback: String,
        score: Number,
        type: String,
        options: [String],
        correctOption: Number,
        codeSnippet: String
      }],
      title: String,
      description: String,
      date: Date,
      duration: Number,
      type: String,
      user: mongoose.Schema.Types.ObjectId,
      candidateId: mongoose.Schema.Types.ObjectId,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    // Create models
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    const Interview = mongoose.models.Interview || mongoose.model('Interview', interviewSchema);

    // Find the admin user
    const adminUser = await User.findOne({ email: ADMIN_EMAIL });
    if (!adminUser) {
      console.log(`Admin user with email ${ADMIN_EMAIL} not found`);
    } else {
      console.log(`Found admin user: ${adminUser.name} (${adminUser._id})`);
      
      // Create interviews for admin
      for (const interviewData of sampleInterviews) {
        // Check if interview already exists
        const existingInterview = await Interview.findOne({
          domain: interviewData.domain,
          subDomain: interviewData.subDomain,
          user: adminUser._id
        });
        
        if (existingInterview) {
          console.log(`Interview for admin: ${interviewData.domain}/${interviewData.subDomain} already exists`);
          continue;
        }
        
        // Create new interview
        const interview = new Interview({
          ...interviewData,
          user: adminUser._id,
          questions: []
        });
        
        await interview.save();
        
        console.log(`Created interview for admin: ${interview.title} (${interview._id})`);
      }
    }

    // Find the regular user
    const regularUser = await User.findOne({ email: USER_EMAIL });
    if (!regularUser) {
      console.log(`Regular user with email ${USER_EMAIL} not found`);
    } else {
      console.log(`Found regular user: ${regularUser.name} (${regularUser._id})`);
      
      // Create interviews for regular user
      for (const interviewData of sampleInterviews) {
        // Check if interview already exists
        const existingInterview = await Interview.findOne({
          domain: interviewData.domain,
          subDomain: interviewData.subDomain,
          user: regularUser._id
        });
        
        if (existingInterview) {
          console.log(`Interview for user: ${interviewData.domain}/${interviewData.subDomain} already exists`);
          continue;
        }
        
        // Create new interview
        const interview = new Interview({
          ...interviewData,
          user: regularUser._id,
          questions: []
        });
        
        await interview.save();
        
        console.log(`Created interview for user: ${interview.title} (${interview._id})`);
      }
    }
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating demo interviews:', error);
  }
}

// Run the function
createDemoInterviews();
