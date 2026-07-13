const mongoose = require('mongoose');

const connectDB = async () => {
  const MAX_RETRIES = 5;
  for (let i = 1; i <= MAX_RETRIES; i++) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return; // success
    } catch (error) {
      console.error(`MongoDB connection attempt ${i}/${MAX_RETRIES} failed: ${error.message}`);
      if (i < MAX_RETRIES) {
        console.log(`Retrying in 5 seconds...`);
        await new Promise(r => setTimeout(r, 5000));
      } else {
        console.error('All MongoDB connection attempts failed. Server will continue without DB.');
      }
    }
  }
};

module.exports = connectDB;
