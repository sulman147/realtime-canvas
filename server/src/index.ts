import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }, // dev-friendly; lock this down in prod
});


type Shape = {
  id: string;
  type: "rect" | "circle";
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  fill: string;
};

const shapes = new Map<string, Shape>();  // in-memory state

io.on("connection", (socket) => {
  // Send current state to the new client
  socket.emit("init", Array.from(shapes.values()));

  // Presence (optional)
  io.emit("presence:count", io.engine.clientsCount);

  // Rectangle added
   socket.on("shape:add", (shape: Shape) => {
    if (!shape?.id || !shape?.type) return;
    shapes.set(shape.id, shape);
    socket.broadcast.emit("shape:add", shape);
  });

  // Rectangle moved
  socket.on("shape:move", ({ id, x, y }: { id: string; x: number; y: number }) => {
    const s = shapes.get(id);
    if (!s) return;
    s.x = x; s.y = y;
    shapes.set(id, s);
    socket.broadcast.emit("shape:move", { id, x, y });
  });

  socket.on("disconnect", () => {
    io.emit("presence:count", io.engine.clientsCount);
  });
});

app.get("/", (_, res) => {
  res.send("Realtime Canvas Server is running");
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Socket.IO server listening on http://localhost:${PORT}`);
});
