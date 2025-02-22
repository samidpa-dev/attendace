const Path = require('path');
global.__base = Path.join(__dirname, '/');
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const db = require('./app/models');

const app = express();

app.use(helmet());
app.use(cors());

db.sequelize.authenticate().then(() => {
  console.log('Connection has been established successfully.');
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});

