import { io, Socket } from "socket.io-client";

const URL = "http://localhost:4000";

export const socket: Socket = io(URL, {
  transports: ["websocket"], // faster in dev
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 500,
  reconnectionDelayMax: 3000
});
