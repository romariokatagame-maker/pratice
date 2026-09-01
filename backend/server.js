require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const createApp = require('./src/app');
const registerSocketHandlers = require('./src/socket');
const store = require('./src/data/store');

const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const io = new Server({ cors: { origin: CORS_ORIGIN } });
const server = http.createServer(createApp(io));

io.attach(server);
registerSocketHandlers(io);

if (process.env.SEED_DEMO_USERS !== 'false') {
  store.seed();
}

server.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
  console.log(`WebSocket: ws://localhost:${PORT}`);
});
