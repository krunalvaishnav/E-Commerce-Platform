const express = require('express');
require('./config/env');
const authRoutes = require('./routes/authRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.set('trust proxy', true);
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'checkout-preview-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/v1/checkout', checkoutRoutes);

app.use(errorHandler);

module.exports = app;
