import mongoose from 'mongoose';

// Define the interface for ChatMessage subdocument
export interface IChatMessage {
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  feedback?: 'positive' | 'negative' | null;
}

// Define the interface for ChatSession document
export interface IChatSession extends mongoose.Document {
  title: string;
  user: mongoose.Types.ObjectId;
  messages: IChatMessage[];
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Define the ChatMessage schema
const ChatMessageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: [true, 'Role is required']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  feedback: {
    type: String,
    enum: ['positive', 'negative'],
    default: null
  }
}, { _id: false });

// Check if the model already exists to prevent overwriting
const ChatSessionModel = mongoose.models.ChatSession || mongoose.model<IChatSession>(
  'ChatSession',
  new mongoose.Schema({
    title: {
      type: String,
      default: 'New Chat'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    messages: [ChatMessageSchema],
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  })
);

export default ChatSessionModel;
