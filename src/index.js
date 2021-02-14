require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const {secureRoutes, publicRoutes} = require('./routes');
const {PORT} = process.env || 3000;
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/secure', secureRoutes);
app.use('/public', publicRoutes);

app.server = app.listen(PORT, () => {
  console.log(`Benevolence payments API is running on port ${PORT}`);
});
