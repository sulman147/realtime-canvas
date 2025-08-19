Realtime Canvas

A collaborative real-time canvas app where users can add and drag rectangles or circles, synchronized across all connected clients.

Tech Stack

Frontend: React, TypeScript, Vite, Tailwind, Zustand, React-Konva, socket.io-client

Backend: Node.js, TypeScript, Express, Socket.IO

Backend
cd server
npm install
npm run dev   # runs on http://localhost:4000

Frontend

cd ../client
npm install
npm run dev   # usually http://localhost:5173

Usage

Open http://localhost:5173 in one or more browser tabs.

Click Add Rectangle or Add Circle to place shapes.

Drag shapes to move them — updates sync in real-time across all clients.

Presence indicator shows how many users are online.

Extra functionality added: support for adding circles.