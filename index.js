const { Server } = require("socket.io");

const io = new Server(3001, {
  cors: { origin: "*" }
});

let rooms = {};

io.on("connection", (socket) => {
  socket.on("JOIN_ROOM", ({ roomId }) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = { players: [], turn: 0 };
    }

    rooms[roomId].players.push({
      id: socket.id,
      position: 0
    });

    io.to(roomId).emit("UPDATE", rooms[roomId]);
  });

  socket.on("ROLL_DICE", ({ roomId }) => {
    const game = rooms[roomId];
    const player = game.players[game.turn];

    if (!player || player.id !== socket.id) return;

    const dice = Math.floor(Math.random() * 6) + 1;
    player.position = (player.position + dice) % 40;

    game.turn = (game.turn + 1) % game.players.length;

    io.to(roomId).emit("UPDATE", game);
  });
});
