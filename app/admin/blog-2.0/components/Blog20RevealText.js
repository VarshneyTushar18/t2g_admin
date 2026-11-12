"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Claude-style incremental reveal when `animate` is true (fresh reply).
 * Historical messages render instantly.
 */
export default function Blog20RevealText({ text, animate = false, onProgress }) {
  const [shown, setShown] = useState(animate ? "" : text);
  const fullRef = useRef(text);
  fullRef.current = text;

  useEffect(() => {
    if (!animate) {
      setShown(text);
      return undefined;
    }

    setShown("");
    let index = 0;
    const len = text.length;
    const tick = () => {
      const step = len > 2400 ? 12 : len > 800 ? 6 : 3;
      index = Math.min(len, index + step);
      setShown(fullRef.current.slice(0, index));
      if (index % 48 === 0) onProgress?.();
      if (index < len) {
        raf = requestAnimationFrame(tick);
      } else {
        onProgress?.();
      }
    };
    let raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, animate]);

  const streaming = animate && shown.length < text.length;

  return (
    <span className="b20-reveal">
      {shown}
      {streaming ? <span className="b20-stream-cursor" aria-hidden /> : null}
    </span>
  );
}
