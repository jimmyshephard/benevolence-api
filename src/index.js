require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const routes = require('./routes');
const secureRoutes = routes.secureRoutes;
const publicRoutes = routes.publicRoutes;

const PORT = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.json());

// Bind the routes directly without complex wrapper syntax
app.use('/secure', secureRoutes);
app.use('/public', publicRoutes);

// Simple health route to verify stability
app.get('/health', function(req, res) {
  res.status(200).json({ status: "online" });
});

app.server = app.listen(PORT, function() {
  console.log('Benevolence payments API is running successfully.');
});
