import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { nextMeetingData } from '../data/nextMeeting';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

// Define the schema inline to avoid import issues
const BookInfoSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  coverImage: { type: String },
  isbn: { type: String },
}, { _id: false });

const MeetingSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    book: { type: BookInfoSchema, required: true },
    additionalInfo: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Meeting = mongoose.models.Meeting || mongoose.model('Meeting', MeetingSchema);

async function seedMeetings() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully!');

    // Clear existing meetings
    console.log('Clearing existing meetings...');
    await Meeting.deleteMany({});
    console.log('Existing meetings cleared.');

    // Insert the next meeting data
    console.log('Inserting seed data...');
    const meeting = await Meeting.create(nextMeetingData);
    console.log('Seed data inserted successfully!');
    console.log('Meeting created:', meeting);

    console.log('\nSeed completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

seedMeetings();
