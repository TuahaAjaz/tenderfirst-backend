const express = require('express');
const { queryParser } = require('express-query-parser');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const app = express();
const mongoose = require('mongoose');
const UserRouter = require('./routes/user');
const RoleRouter = require('./routes/roles');
const CategoryRouter = require('./routes/categories');
const TenderRouter = require('./routes/tenders');
const PoolRouter = require('./routes/pool');
const errorHandler = require('./middlewares/error');
const MongoStore = require('connect-mongo');
const cors = require('cors');
require('dotenv').config('./.env');
const multichain = require('./multichainconfig');

function setAccessControlHeaders(req, res, next) {
  console.log("inside")
  res.header("Access-Control-Allow-Origin", "*"); 
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Allow specific HTTP methods
  res.header("Access-Control-Allow-Headers", "*");
  res.header('Access-Control-Allow-Credentials', 'true');
  // console.log(res);
  next();
}

mongoose.set('strictQuery', false);


app.use(express.json());
app.use(cors({
  credentials: true,
  origin: ["http://localhost:3001"]
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
app.use('/category', CategoryRouter);
app.use('/tender', TenderRouter);
app.use('/role', RoleRouter);
app.use('/pool', PoolRouter);

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
