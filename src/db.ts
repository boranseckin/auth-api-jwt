import mongoose from 'mongoose';

export default function connectDB() {
  return new Promise((resolve, reject) => {
    const {
      dbUrl,
      dbPort,
      dbUsername,
      dbPassword,
      dbName,
    } = process.env;

    mongoose.connect(`mongodb://${dbUsername}:${dbPassword}@${dbUrl}:${dbPort}/${dbName}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      authSource: dbName,
    })
      .then(resolve)
      .catch((error) => reject(error));
  });
}
