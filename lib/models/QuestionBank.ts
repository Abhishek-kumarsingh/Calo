import mongoose from 'mongoose';

// Define the interface for QuestionBank document
export interface IQuestionBankItem extends mongoose.Document {
  question: string;
  type: 'text' | 'multiple-choice' | 'coding' | 'code-correction';
  options?: string[];
  correctOption?: number;
  codeSnippet?: string;
  domain: string;
  subDomain?: string;
  difficulty: 'easy' | 'intermediate' | 'advanced';
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Check if the model already exists to prevent overwriting
const QuestionBankModel = mongoose.models.QuestionBank || mongoose.model<IQuestionBankItem>(
  'QuestionBank',
  new mongoose.Schema({
    question: { 
      type: String, 
      required: true 
    },
    type: { 
      type: String, 
      enum: ['text', 'multiple-choice', 'coding', 'code-correction'],
      default: 'text',
      required: true
    },
    options: { 
      type: [String], 
      default: [] 
    }, // For multiple-choice questions
    correctOption: { 
      type: Number, 
      default: null 
    }, // Index of correct option for multiple-choice
    codeSnippet: { 
      type: String, 
      default: "" 
    }, // For coding questions
    domain: { 
      type: String, 
      required: true 
    },
    subDomain: { 
      type: String 
    },
    difficulty: {
      type: String,
      enum: ['easy', 'intermediate', 'advanced'],
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  })
);

export default QuestionBankModel;
