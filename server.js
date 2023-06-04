const express = require('express');
const { queryParser } = require('express-query-parser');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const app = express();
const mongoose = require('mongoose');
const UserRouter = require('./routes/user');
const CategoryRouter = require('./routes/categories');
const TenderRouter = require('./routes/tenders');
const PoolRouter = require('./routes/pool');
const RatingRouter = require('./routes/ratings');
const errorHandler = require('./middlewares/error');
const MongoStore = require('connect-mongo');
const cors = require('cors');
require('dotenv').config('./.env');
const multichain = require('./multichainconfig');
const cron = require('node-cron');
const { CheckTendersEvaluationTime } = require('./controllers/Cronejob');

mongoose.set('strictQuery', false);

const getFunction = async() => {
  try {
    CheckTendersEvaluationTime();
  }
  catch(err) {
    console.log(err);
  }
}

const task = cron.schedule('0 0 1 * * *', getFunction); //at 1 am every day

task.start();

app.use(express.json());
app.use(cors({
  credentials: true,
  methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
  origin: ["http://localhost:3000", "http://localhost:3001"]
}));
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
      path: '/',
      maxAge: 14 * 24 * 60 * 60 * 1000,
      httpOnly: false,
      sameSite: false,
      secure: false
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
app.use('/category', CategoryRouter);
app.use('/tender', TenderRouter);
app.use('/pool', PoolRouter);
app.use('/rating', RatingRouter);

app.use(errorHandler);

app.listen(process.env.PORT, '0.0.0.0', () => {
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
