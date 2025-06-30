import mongoose from 'mongoose';

// Define the interface for Question document
export interface IQuestion extends mongoose.Document {
  content: string;
  type: 'text' | 'multiple-choice' | 'coding';
  options?: string;
  correctAnswer?: string;
  domain: string;
  subDomain?: string;
  difficulty: 'easy' | 'intermediate' | 'advanced';
  interviewId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Check if the model already exists to prevent overwriting
const QuestionModel = mongoose.models.Question || mongoose.model<IQuestion>(
  'Question',
  new mongoose.Schema({
    content: { 
      type: String, 
      required: true 
    },
    type: {
      type: String,
      required: true,
      enum: ['text', 'multiple-choice', 'coding']
    },
    options: { 
      type: String 
    }, // JSON string for multiple-choice options
    correctAnswer: { 
      type: String 
    },
    domain: { 
      type: String, 
      required: true 
    },
    subDomain: { 
      type: String 
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['easy', 'intermediate', 'advanced']
    },
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: true
    }
  }, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  })
);

export default QuestionModel;
