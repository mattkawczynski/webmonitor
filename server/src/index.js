const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
const logger = require('./services/logger');
const http = require('http');
const socketIO = require('socket.io');

const middlewares = require('./middlewares');
const urls = require('./api/urls');
const cronSchedule = require('./jobs/cronJob')

require('dotenv').config();

const app = express();
mongoose.set('useCreateIndex', true);
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

app.use(morgan('common'));
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN,
}));
app.use(express.json());

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || req.query.token;
  const authToken = process.env.AUTH_TOKEN;
  if (!authHeader || authHeader !== authToken) {
    logger.error(`Unauthorized request: ${req.originalUrl}`)
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

app.get('/', (req, res) => {
  res.json({
    message: 'Hello',
  });
});

app.use(authenticate);
app.use('/api/urls', urls);

const server = http.createServer(app);
const io = socketIO(server);

app.use(cronSchedule);
cronSchedule(io);
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

io.use((socket, next) => {
  const token = socket.handshake.headers.authorization;

  if (!token) {
    logger.error('Unauthorized connection attempt');
    return next(new Error('Unauthorized'));
  }

  if (token !== process.env.AUTH_TOKEN) {
    logger.error('Invalid token for websocket connection');
    return next(new Error('Invalid token'));
  }

  return next();
});

io.on('connection', (socket) => {
  logger.info('New client connected');
  socket.on('disconnect', () => {
    logger.info('Client disconnected');
  });
});

const port = process.env.PORT || 1337;

server.listen(port, () => {
  logger.info(`The app is active and listening on port ${port}`);
});

