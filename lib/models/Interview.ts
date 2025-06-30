import mongoose from 'mongoose';

// Define the interface for AIQuestion subdocument
export interface IAIQuestion {
  question: string;
  answer?: string;
  feedback?: string;
  score?: number;
  type: 'text' | 'multiple-choice' | 'coding' | 'code-correction';
  options?: string[];
  correctOption?: number;
  codeSnippet?: string;
}

// Define the interface for Interview document
export interface IInterview extends mongoose.Document {
  domain: string;
  subDomain: string;
  level: string;
  status: 'scheduled' | 'pending_ai_generation' | 'in_progress' | 'completed' | 'cancelled';
  score?: number;
  overallFeedback?: string;
  questions: IAIQuestion[];
  questionQuantity?: number;
  questionTypes?: {
    text: boolean;
    multipleChoice: boolean;
    coding: boolean;
    codeCorrection: boolean;
  };
  questionTypeDistribution?: {
    text: number;
    multipleChoice: number;
    coding: number;
    codeCorrection: number;
  };
  savedToQuestionBank?: boolean;
  title?: string;
  description?: string;
  date?: Date;
  duration?: number;
  type: 'technical' | 'behavioral' | 'ai_generated' | 'mixed';
  user: mongoose.Types.ObjectId;
  candidateId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Define the AIQuestion schema
const AIQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, default: "" },
  feedback: { type: String, default: "" },
  score: { type: Number, default: 0 },
  type: {
    type: String,
    enum: ['text', 'multiple-choice', 'coding', 'code-correction'],
    default: 'text'
  },
  options: { type: [String], default: [] },
  correctOption: { type: Number, default: null },
  codeSnippet: { type: String, default: "" }
}, { _id: true });

// Check if the model already exists to prevent overwriting
const InterviewModel = mongoose.models.Interview || mongoose.model<IInterview>(
  'Interview',
  new mongoose.Schema({
    domain: {
      type: String,
      required: [true, 'Domain is required']
    },
    subDomain: {
      type: String,
      required: [true, 'Sub-domain is required']
    },
    level: {
      type: String,
      required: [true, 'Level is required']
    },
    status: {
      type: String,
      enum: ['scheduled', 'pending_ai_generation', 'in_progress', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    overallFeedback: {
      type: String
    },
    // For AI-generated interviews, questions are embedded
    questions: [AIQuestionSchema],

    // Question generation preferences
    questionQuantity: {
      type: Number,
      default: 5,
      min: 1,
      max: 20
    },
    questionTypes: {
      text: { type: Boolean, default: true },
      multipleChoice: { type: Boolean, default: false },
      coding: { type: Boolean, default: false },
      codeCorrection: { type: Boolean, default: false }
    },
    questionTypeDistribution: {
      text: { type: Number, default: 100 }, // Percentage
      multipleChoice: { type: Number, default: 0 },
      coding: { type: Number, default: 0 },
      codeCorrection: { type: Number, default: 0 }
    },
    savedToQuestionBank: {
      type: Boolean,
      default: false
    },

    // For manually scheduled interviews
    title: {
      type: String
    },
    description: {
      type: String
    },
    date: {
      type: Date
    },
    duration: {
      type: Number
    }, // in minutes
    type: {
      type: String,
      enum: ['technical', 'behavioral', 'ai_generated', 'mixed'],
      default: 'technical',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate'
    }
  }, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  })
);

export default InterviewModel;
