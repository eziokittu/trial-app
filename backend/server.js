const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const cors = require('cors');

const productsRoutes = require('./routes/products-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json());
// app.use(express.urlencoded({extended: true}));

const corsOptions = {
  origin: 'http://localhost:3000', // Allow requests only from this origin
  methods: 'GET,POST,PUT,DELETE',
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

app.use('/api/products', productsRoutes);
app.use('/api/users', usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500)
  res.json({message: error.message || 'An unknown error occurred!'});
});

// mongoDB connection URI
// const uriDB = 'mongodb+srv://eziokittu:southpoint19@cluster0.nmjiwwv.mongodb.net/test'; // ATLAS
const uriDB = 'mongodb://localhost:27017/test'; // community server
mongoose
  .connect(uriDB)
  .then(() =>{
    app.listen(5000);
  })
  .catch(err => {
    console.log(err);
  });