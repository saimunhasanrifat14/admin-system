require("dotenv").config();
const mongoose = require("mongoose");
const { dbName } = require("../constants/constant");

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${dbName}`
    );
    console.log(`MongoDB Connected: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("MongoDB connection FAILED", error);
    process.exit(1);
  }
};

module.exports = { connectDB };