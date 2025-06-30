/**
 * This script creates test interviews for a user in the MongoDB database.
 * Run it with: node scripts/create-test-interviews.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/interviewai';

// Test user email
const TEST_USER_EMAIL = 'test@example.com';

// Sample interview data
const sampleInterviews = [
  {
    domain: 'Web Development',
    subDomain: 'Frontend',
    level: 'Intermediate',
    status: 'scheduled',
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
    status: 'scheduled',
    type: 'technical',
    title: 'Machine Learning Engineer Interview',
    description: 'Interview for ML engineer position'
  }
];

async function createTestInterviews() {
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

    // Find the test user
    const user = await User.findOne({ email: TEST_USER_EMAIL });
    
    if (!user) {
      console.log(`User with email ${TEST_USER_EMAIL} not found`);
      await mongoose.disconnect();
      return;
    }

    console.log(`Found user: ${user.name} (${user._id})`);

    // Create interviews
    for (const interviewData of sampleInterviews) {
      // Check if interview already exists
      const existingInterview = await Interview.findOne({
        domain: interviewData.domain,
        subDomain: interviewData.subDomain,
        user: user._id
      });
      
      if (existingInterview) {
        console.log(`Interview for ${interviewData.domain}/${interviewData.subDomain} already exists`);
        continue;
      }
      
      // Create new interview
      const interview = new Interview({
        ...interviewData,
        user: user._id,
        questions: []
      });
      
      await interview.save();
      
      console.log(`Created interview: ${interview.title} (${interview._id})`);
    }
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating test interviews:', error);
  }
}

// Run the function
createTestInterviews();
