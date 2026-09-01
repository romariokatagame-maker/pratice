const { verifyToken } = require('./middleware/auth');
const store = require('./data/store');

function registerSocketHandlers(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) return next(new Error('Token tidak ditemukan'));

    try {
      const payload = verifyToken(token);
      const user = store.findUserById(payload.sub);
      if (!user) return next(new Error('User tidak ditemukan'));
      socket.data.user = store.publicUser(user);
      return next();
    } catch (err) {
      return next(new Error('Token tidak valid'));
    }
  });

  io.on('connection', (socket) => {
    const { id, role } = socket.data.user;
    socket.join(`user:${id}`);
    if (role === 'polisi') socket.join('polisi');
    console.log(`Terhubung: ${id} (${role})`);

    socket.on('disconnect', () => {
      console.log(`Terputus: ${id}`);
    });
  });
}

module.exports = registerSocketHandlers;
