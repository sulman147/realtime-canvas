import CanvasStage from "./components/CanvasStage";
import { useCanvasStore, Shape  } from "./store/canvasStore";
import { socket } from "./lib/socket";
import { useEffect } from "react";

function randomColor() {
  const colors = ["#ef4444","#f59e0b","#10b981","#3b82f6","#8b5cf6","#ec4899"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function App() {
  const { upsertRect, setConnected, setPresence, presence, connected } = useCanvasStore();

   useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onPresence = (n: number) => setPresence(n);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("presence:count", onPresence);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("presence:count", onPresence);
    };
  }, [setConnected, setPresence]);


const addRectangle = () => {
    const rect: Shape = {
      id: crypto.randomUUID(),
      type: "rect",                      // ✅
      x: randomBetween(40, 860),
      y: randomBetween(40, 420),
      width: 120,
      height: 80,
      fill: randomColor()
    };
    upsertRect(rect);                    // optimistic
    socket.emit("shape:add", rect);      // ✅ new event
  };

    const addCircle = () => {
    const circle: Shape = {
      id: crypto.randomUUID(),
      type: "circle",                    // ✅
      x: randomBetween(80, 880),
      y: randomBetween(80, 420),
      radius: 60,
      fill: randomColor()
    };
    upsertRect(circle);                  // optimistic
    socket.emit("shape:add", circle);    // ✅ new event
  };

  return (
    <div className="min-h-screen p-6">
      <header className="flex items-center justify-between max-w-5xl mx-auto mb-4">
        <h1 className="text-2xl font-semibold">Realtime Canvas - Muhammad Sulman</h1>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border ${connected ? "border-green-400 text-green-700" : "border-slate-300 text-slate-500"}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${connected ? "bg-green-500" : "bg-slate-300"}`}></span>
            {connected ? "Connected" : "Disconnected"}
          </span>
          <span className="text-sm text-slate-600">Users online: <b>{presence}</b></span>
          <button
            onClick={addRectangle}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg shadow"
          >
            Add Rectangle
          </button>
          <button onClick={addCircle} className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded-lg shadow">
            Add Circle
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto">
        <CanvasStage />
        <div className="flex justify-between">
        <p className="text-xs text-slate-500 mt-3">
          Tip: Open another tab to see real-time sync. Drag rectangles around!
        </p>
        <p className="text-xs text-slate-500 mt-3">
          Muhammad Sulman Siddiqui
        </p>
        </div>
      </main>
    </div>
  );
}
