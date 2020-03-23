import dotenv from 'dotenv';
import connectDB from './db';

dotenv.config();

const fallback = setTimeout(() => {
  throw new Error('Cannot connect to the database!');
}, 5000);

connectDB()
  .then(() => {
    clearTimeout(fallback);
    // eslint-disable-next-line global-require
    require('./server');
  })
  .catch((error) => console.log(error));
