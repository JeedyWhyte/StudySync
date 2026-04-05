const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    // Add this where you call mongoose.connect
    mongoose.connection.on('open', () => {
        console.log("Connected to DB:", mongoose.connection.name);
        console.log("Host:", mongoose.connection.host);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

module.exports = connectDB;