"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [style, setStyle] = useState<React.CSSProperties>({});
  const rafRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    // Cancel any in-flight animation
    cancelAnimationFrame(rafRef.current);
    clearTimeout(timerRef.current);

    // Frame 1: snap to start position (no transition yet)
    setStyle({ transform: "translateY(12px)" });

    // Frame 2: begin transition to rest position
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        setStyle({
          transform: "translateY(0)",
          transition: "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        });

        // Frame 3: clear ALL styles after animation completes so Safari
        // releases the GPU compositing layer. A promoted layer in Safari can
        // sit above every other element (including the z-9999 nav) and
        // intercept all mouse events, making every button unclickable.
        timerRef.current = setTimeout(() => setStyle({}), 420);
      });
    });

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timerRef.current);
    };
  }, [pathname]);

  return <div style={style}>{children}</div>;
}
