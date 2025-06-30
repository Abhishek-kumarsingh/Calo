import mongoose from 'mongoose';

// Define the interface for Candidate document
export interface ICandidate extends mongoose.Document {
  name: string;
  email: string;
  phone?: string;
  role?: string;
  department?: string;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Check if the model already exists to prevent overwriting
const CandidateModel = mongoose.models.Candidate || mongoose.model<ICandidate>(
  'Candidate',
  new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'Name is required']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String
    },
    role: {
      type: String
    },
    department: {
      type: String
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

export default CandidateModel;
