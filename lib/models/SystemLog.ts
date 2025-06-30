import mongoose from 'mongoose';

// Define the interface for SystemLog document
export interface ISystemLog extends mongoose.Document {
  action: string;
  category: string;
  details: string;
  userId?: mongoose.Types.ObjectId;
  resourceId?: mongoose.Types.ObjectId;
  resourceType?: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure' | 'warning' | 'info';
  eventType?: string;
  message?: string;
  timestamp?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Check if the model already exists to prevent overwriting
const SystemLogModel = mongoose.models.SystemLog || mongoose.model<ISystemLog>(
  'SystemLog',
  new mongoose.Schema({
    action: {
      type: String,
      required: [true, 'Action is required'],
      index: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['auth', 'user', 'interview', 'question', 'admin', 'system'],
      index: true
    },
    details: {
      type: String,
      required: [true, 'Details are required']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true
    },
    resourceType: {
      type: String,
      enum: ['User', 'Interview', 'Question', 'Candidate', 'QuestionBank']
    },
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    },
    status: {
      type: String,
      enum: ['success', 'failure', 'warning', 'info'],
      default: 'info',
      index: true
    },
    eventType: {
      type: String,
      index: true
    },
    message: {
      type: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  })
);

export default SystemLogModel;
