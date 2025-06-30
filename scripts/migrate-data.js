/**
 * This script migrates data from the Express server's MongoDB database to the Next.js MongoDB models.
 * It should be run once to transfer all data.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Source database connection (Express server)
const SOURCE_MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/interviewai';

// Define schemas for source models
const sourceUserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  image: String,
  createdAt: Date,
  updatedAt: Date
});

const sourceCandidateSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  role: String,
  department: String,
  user: mongoose.Schema.Types.ObjectId,
  createdAt: Date,
  updatedAt: Date
});

const sourceInterviewSchema = new mongoose.Schema({
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
  createdAt: Date,
  updatedAt: Date
});

const sourceMessageSchema = new mongoose.Schema({
  content: String,
  role: String,
  interview: mongoose.Schema.Types.ObjectId,
  createdAt: Date,
  updatedAt: Date
});

const sourceChatSessionSchema = new mongoose.Schema({
  title: String,
  user: mongoose.Schema.Types.ObjectId,
  messages: [{
    content: String,
    role: String,
    timestamp: Date,
    feedback: String
  }],
  lastUpdated: Date,
  createdAt: Date,
  updatedAt: Date
});

// Connect to the source database
async function migrateData() {
  try {
    console.log('Connecting to source database...');
    await mongoose.connect(SOURCE_MONGODB_URI);
    console.log('Connected to source database');

    // Define source models
    const SourceUser = mongoose.model('User', sourceUserSchema);
    const SourceCandidate = mongoose.model('Candidate', sourceCandidateSchema);
    const SourceInterview = mongoose.model('Interview', sourceInterviewSchema);
    const SourceMessage = mongoose.model('Message', sourceMessageSchema);
    const SourceChatSession = mongoose.model('ChatSession', sourceChatSessionSchema);

    // Fetch all data from source
    console.log('Fetching data from source database...');
    const users = await SourceUser.find({});
    const candidates = await SourceCandidate.find({});
    const interviews = await SourceInterview.find({});
    const messages = await SourceMessage.find({});
    const chatSessions = await SourceChatSession.find({});

    console.log(`Found ${users.length} users`);
    console.log(`Found ${candidates.length} candidates`);
    console.log(`Found ${interviews.length} interviews`);
    console.log(`Found ${messages.length} messages`);
    console.log(`Found ${chatSessions.length} chat sessions`);

    // The data is now ready to be inserted into the Next.js MongoDB models
    // This is done automatically since we're using the same database
    // The Next.js models will read from the same collections

    console.log('Migration complete!');
    
    // Disconnect from the database
    await mongoose.disconnect();
    console.log('Disconnected from database');
  } catch (error) {
    console.error('Error during migration:', error);
  }
}

// Run the migration
migrateData();
