const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const healthRoutes = require('./routes/health.routes');
const catalogRoutes = require('./routes/catalog.routes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use(healthRoutes);
app.use(catalogRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
