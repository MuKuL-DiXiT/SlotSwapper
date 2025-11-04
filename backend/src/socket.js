const jwt = require('jsonwebtoken');
const User = require('./models/User');

let io = null;
// userId => Set(socketId)
const userSockets = new Map();

function initSocket(serverIo) {
  io = serverIo;

  io.on('connection', (socket) => {
    // client should emit 'authenticate' with token after connecting
    socket.on('authenticate', async (data) => {
      try {
        const token = data?.token;
        if (!token) return;
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const user = await User.findById(decoded.id).select('_id');
        if (!user) return;
        const id = String(user._id);
        if (!userSockets.has(id)) userSockets.set(id, new Set());
        userSockets.get(id).add(socket.id);
        socket.data.userId = id;
      } catch (err) {
        // ignore invalid token
      }
    });

    socket.on('disconnect', () => {
      const uid = socket.data.userId;
      if (!uid) return;
      const set = userSockets.get(uid);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) userSockets.delete(uid);
      }
    });
  });
}

function notifyUser(userId, event, payload) {
  if (!io) return;
  const sockets = userSockets.get(String(userId));
  if (!sockets) return;
  for (const sid of sockets) {
    io.to(sid).emit(event, payload);
  }
}

module.exports = { initSocket, notifyUser };
