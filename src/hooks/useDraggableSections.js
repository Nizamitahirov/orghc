"use client";
import { useState, useRef, useCallback } from "react";

export function useDraggableSections(storageKey, defaultOrder, options = {}) {
  const { enabled = true } = options;

  const [order, setOrder] = useState(() => {
    try {
      const saved = typeof window !== "undefined" && localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = [
          ...parsed.filter(id => defaultOrder.includes(id)),
          ...defaultOrder.filter(id => !parsed.includes(id)),
        ];
        return merged;
      }
    } catch {}
    return defaultOrder;
  });

  const [dragOverId, setDragOverId] = useState(null);
  const dragIdRef = useRef(null);

  const onDragStart = useCallback((id) => { dragIdRef.current = id; }, []);

  const onDragOver = useCallback((e, id) => {
    e.preventDefault();
    setDragOverId(id);
  }, []);

  const onDrop = useCallback((targetId) => {
    const fromId = dragIdRef.current;
    if (!fromId || fromId === targetId) { setDragOverId(null); return; }
    setOrder(prev => {
      const next = [...prev];
      const fi = next.indexOf(fromId);
      const ti = next.indexOf(targetId);
      if (fi === -1 || ti === -1) return prev;
      next.splice(fi, 1);
      next.splice(ti, 0, fromId);
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
      return next;
    });
    setDragOverId(null);
    dragIdRef.current = null;
  }, [storageKey]);

  const onDragLeave = useCallback(() => { setDragOverId(null); }, []);

  const getDragProps = useCallback((id) => ({
    draggable: enabled,
    onDragStart: enabled ? () => onDragStart(id) : undefined,
    onDragOver: enabled ? (e) => onDragOver(e, id) : undefined,
    onDrop: enabled ? () => onDrop(id) : undefined,
    onDragLeave: enabled ? onDragLeave : undefined,
  }), [enabled, onDragStart, onDragOver, onDrop, onDragLeave]);

  const resetOrder = useCallback(() => {
    setOrder(defaultOrder);
    try { localStorage.removeItem(storageKey); } catch {}
  }, [storageKey, defaultOrder]);

  return { order, dragOverId, getDragProps, resetOrder };
}
