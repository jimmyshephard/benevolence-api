require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const {secureRoutes, publicRoutes} = require('./routes');
const PORT = process.env.PORT || 3000;
const HOSTNAME = process.env.HOSTNAME || '127.0.0.1';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/secure', secureRoutes);
app.use('/public', publicRoutes);

app.server = app.listen(PORT, HOSTNAME, () => {
  console.log(`Benevolence payments API is running on port ${PORT}`);
});
