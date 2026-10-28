require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const routes = require('./routes');
const secureRoutes = routes.secureRoutes;
const publicRoutes = routes.publicRoutes;

const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:4200')
  .split(',')
  .map(function(origin) { return origin.trim(); })
  .filter(Boolean);
const app = express();

// Allow the UI origins to call the API; requests without an Origin (curl, health checks) pass through
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    callback(null, false);
  }
}));
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
