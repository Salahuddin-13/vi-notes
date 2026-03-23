import mongoose, { Document, Schema } from 'mongoose';

// Feature 3: Keystroke timing event (only timestamps, no actual keys)
interface KeystrokeEvent {
  timestamp: number;
  type: 'keydown' | 'keyup';
}

// Feature 4: Paste detection event
interface PasteEvent {
  timestamp: number;
  length: number; // number of characters pasted
}

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  text: string;                    // Feature 5: the written content
  keystrokeData: KeystrokeEvent[]; // Feature 3: timing data
  pasteEvents: PasteEvent[];       // Feature 4: paste events
  totalTypingTime: number;         // in milliseconds
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    keystrokeData: [
      {
        timestamp: { type: Number, required: true },
        type: { type: String, enum: ['keydown', 'keyup'], required: true },
      },
    ],
    pasteEvents: [
      {
        timestamp: { type: Number, required: true },
        length: { type: Number, required: true },
      },
    ],
    totalTypingTime: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<ISession>('Session', SessionSchema);
