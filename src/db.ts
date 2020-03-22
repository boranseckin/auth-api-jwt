import fs from 'fs';
import mongoose from 'mongoose';
import tunnel from 'tunnel-ssh';

const {
  dbUrl,
  dbUsername,
  dbPassword,
  dbPrivateKey,
  dbName,
  dbPassphrase,
} = process.env;

const config = {
  host: dbUrl,
  username: 'root',
  privateKey: fs.readFileSync(dbPrivateKey),
  passphrase: dbPassphrase,
  port: 22,
  dstHost: '127.0.0.1',
  dstPort: 27017,
  localHost: '127.0.0.1',
  localPort: 27017,
};

function connectDB(username: string, password: string, name: string) {
  return new Promise((resolve, reject) => {
    mongoose.connect(`mongodb://${username}:${password}@localhost:27017/${name}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      authSource: name,
    })
      .then(resolve)
      .catch((error) => reject(error));
  });
}

tunnel(config, (err) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  console.log('SSH Tunnel connected!');
  connectDB(dbUsername, dbPassword, dbName)
    .then(() => {
      console.log('DB connected!');
    })
    .catch((error) => console.log(error));
});
