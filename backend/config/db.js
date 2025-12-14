// DATABASE CONFIGURATION FILE

import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables from .env file
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose 6+ doesn't need these options anymore
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit with failure
  }
};

export default connectDB;