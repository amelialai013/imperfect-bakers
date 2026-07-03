"use client";

// Safari desktop: any wrapper <div> with CSS transforms or animations creates a
// GPU compositing layer that Safari incorrectly places above the sticky nav in
// the compositor, swallowing all mouse events site-wide.
// Solution: no wrapper element, no animation, no compositing layer.
export default function PageTransition({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
