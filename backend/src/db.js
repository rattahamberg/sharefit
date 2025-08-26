import mongoose from 'mongoose';
import { CONFIG } from './config.js';

export async function connectDB() {
    await mongoose.connect(CONFIG.MONGODB_URI);
    console.log("Connected to MongoDB");
}