const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // TEMPORARY: Drop the email index to fix the null duplicate issue
    // This allows sparse index to be recreated correctly by Mongoose
    try {
      await conn.connection.db.collection('users').dropIndex('email_1');
      console.log('Successfully dropped old email index');
    } catch (err) {
      // Ignore if index doesn't exist
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
