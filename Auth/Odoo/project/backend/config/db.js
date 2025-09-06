const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/authDB';
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Mongoose connected to', uri);
  } catch (err) {
    console.error('Mongoose connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
