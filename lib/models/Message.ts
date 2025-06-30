import mongoose from 'mongoose';

// Define the interface for Message document
export interface IMessage extends mongoose.Document {
  content: string;
  role: 'system' | 'user' | 'assistant';
  interview: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Check if the model already exists to prevent overwriting
const MessageModel = mongoose.models.Message || mongoose.model<IMessage>(
  'Message',
  new mongoose.Schema({
    content: {
      type: String,
      required: [true, 'Content is required']
    },
    role: {
      type: String,
      enum: ['system', 'user', 'assistant'],
      required: [true, 'Role is required']
    },
    interview: {
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

export default MessageModel;
