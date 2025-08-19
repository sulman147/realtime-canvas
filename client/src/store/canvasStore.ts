import { create } from "zustand";

export type Shape = {
  id: string;
  type: "rect" | "circle";   // ✅ new
  x: number;
  y: number;
  width?: number;            // rect-only
  height?: number;           // rect-only
  radius?: number;           // circle-only
  fill: string;
};

type CanvasState = {
  connected: boolean;
  presence: number;
  rectangles: Record<string, Shape>;
  upsertRect: (rect: Shape) => void;
  moveRect: (id: string, x: number, y: number) => void;
  setConnected: (v: boolean) => void;
  setPresence: (n: number) => void;
  setAll: (list: Shape[]) => void;
  removeAll: () => void;
};

export const useCanvasStore = create<CanvasState>((set) => ({
  connected: false,
  presence: 0,
  rectangles: {},
  upsertRect: (rect) => set((s) => ({ rectangles: { ...s.rectangles, [rect.id]: rect } })),
  moveRect: (id, x, y) =>
    set((s) => {
      const r = s.rectangles[id];
      if (!r) return {};
      return { rectangles: { ...s.rectangles, [id]: { ...r, x, y } } };
    }),
  setConnected: (v) => set({ connected: v }),
  setPresence: (n) => set({ presence: n }),
  setAll: (list) =>
    set(() => ({
      rectangles: list.reduce<Record<string, Shape>>((acc, r) => {
        acc[r.id] = r;
        return acc;
      }, {})
    })),
  removeAll: () => set({ rectangles: {} })
}));
