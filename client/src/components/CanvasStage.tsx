// client/src/components/CanvasStage.tsx
import { Stage, Layer, Rect as KRect, Circle as KCircle } from "react-konva";
import { useEffect, useMemo, useRef } from "react";
import { useCanvasStore, Shape } from "../store/canvasStore";
import { socket } from "../lib/socket";

function throttle<T extends (...args: any[]) => void>(fn: T, wait = 30) {
  let last = 0;
  let timeout: any;
  let lastArgs: any[];
  return (...args: Parameters<T>) => {
    const now = Date.now();
    lastArgs = args;
    const run = () => { last = Date.now(); timeout = null; fn(...lastArgs); };
    if (now - last >= wait) run();
    else if (!timeout) timeout = setTimeout(run, wait - (now - last));
  };
}

export default function CanvasStage() {
  const { rectangles, moveRect, upsertRect, setAll } = useCanvasStore();
  const dims = useMemo(() => ({ w: 1000, h: 600 }), []);

  useEffect(() => {
    const onInit = (list: Shape[]) => {
      setAll(list);
      console.log("CLIENT init", list.length);
    };
    const onAdd = (shape: Shape) => {
      upsertRect(shape);
      console.log("CLIENT got add", shape.id);
    };
    const onMove = ({ id, x, y }: { id: string; x: number; y: number }) => {
      moveRect(id, x, y);
      console.log("CLIENT got move", id, x, y);
    };

    socket.on("init", onInit);
    socket.on("shape:add", onAdd);     // lowercase
    socket.on("shape:move", onMove);   // lowercase

    return () => {
      socket.off("init", onInit);
      socket.off("shape:add", onAdd);
      socket.off("shape:move", onMove);
    };
  }, [moveRect, upsertRect, setAll]);

  const throttledEmitMove = useRef(
    throttle((id: string, x: number, y: number) => {
      console.log("CLIENT emit move (throttled)", id, x, y);
      socket.emit("shape:move", { id, x, y }); // lowercase
    }, 24)
  ).current;

  const items = Object.values(rectangles);

  return (
    <div className="w-full flex justify-center">
      <Stage width={dims.w} height={dims.h} className="bg-white rounded-xl shadow-lg border">
        <Layer>
          {items.map((r) => {
            const onDragMove = (e: any) => {
              const { x, y } = e.target.position();
              moveRect(r.id, x, y);                 // optimistic
              throttledEmitMove(r.id, x, y);        // throttled network
            };
            const onDragEnd = (e: any) => {
              const { x, y } = e.target.position();
              console.log("CLIENT emit move (end)", r.id, x, y);
              socket.emit("shape:move", { id: r.id, x, y }); // unthrottled final
            };

            if (r.type === "rect") {
              return (
                <KRect
                  key={r.id}
                  x={r.x}
                  y={r.y}
                  width={r.width ?? 120}
                  height={r.height ?? 80}
                  fill={r.fill}
                  cornerRadius={8}
                  draggable
                  shadowBlur={4}
                  onDragMove={onDragMove}
                  onDragEnd={onDragEnd}
                />
              );
            }
            if (r.type === "circle") {
              return (
                <KCircle
                  key={r.id}
                  x={r.x}
                  y={r.y}
                  radius={r.radius ?? 60}
                  fill={r.fill}
                  draggable
                  onDragMove={onDragMove}
                  onDragEnd={onDragEnd}
                />
              );
            }
            return null;
          })}
        </Layer>
      </Stage>
    </div>
  );
}
