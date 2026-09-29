const mongoose = require('mongoose');

const connectDB = async () => {
  let uri = process.env.MONGO_URI;
  if (process.env.USE_MEMORY_DB === 'true') {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mem = await MongoMemoryServer.create();
    uri = mem.getUri('learnhub');
    console.log('Using in-memory MongoDB (data is lost on restart)');
  }
  const conn = await mongoose.connect(uri);
  console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
};

module.exports = connectDB;
