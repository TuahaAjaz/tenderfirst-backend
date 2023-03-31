const express = require('express');
const { queryParser } = require('express-query-parser');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const app = express();
const mongoose = require('mongoose');
const UserRouter = require('./routes/user');
const errorHandler = require('./middlewares/error');
const MongoStore = require('connect-mongo');
require('dotenv').config('./config/config.env');

mongoose.set('strictQuery', false);


app.use(express.json());
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      touchAfter: 24 * 3600, // time period in seconds
      stringify: false,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000,
    },
  })
);
app.use(
  queryParser({
    parseNull: true,
    parseUndefined: true,
    parseBoolean: true,
    parseNumber: true,
  })
);
app.use('/user', UserRouter);

app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

const conn = mongoose.connect(
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Connection to Mongo established');
    }
  }
);

module.exports = conn;
