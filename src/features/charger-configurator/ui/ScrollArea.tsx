import React, { useRef, useState, useEffect, useCallback } from 'react';
import './ScrollArea.css';

interface ScrollAreaProps {
  /** Extra class applied to the scrolling viewport (keeps each step's layout: gap, flex, padding). */
  className?: string;
  children: React.ReactNode;
}

/*
 * Scrollable region with affordances so the user knows the visible list is not
 * the final content: a top/bottom fade plus an animated chevron that appears
 * only while there is more to scroll below. State is recomputed on scroll and
 * on resize (content or viewport changing height).
 */
export const ScrollArea: React.FC<ScrollAreaProps> = ({ className = '', children }) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [atTop, setAtTop] = useState(false);
  const [atBottom, setAtBottom] = useState(false);

  const update = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const top = el.scrollTop > 4;
    const bottom = el.scrollTop + el.clientHeight < el.scrollHeight - 4;
    setAtTop((prev) => (prev === top ? prev : top));
    setAtBottom((prev) => (prev === bottom ? prev : bottom));
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, [update]);

  return (
    <div
      className={
        'scroll-area' +
        (atTop ? ' scroll-area--has-top' : '') +
        (atBottom ? ' scroll-area--has-bottom' : '')
      }
    >
      <div ref={viewportRef} className={`scroll-area__viewport ${className}`}>
        {children}
      </div>
      <div className="scroll-area__hint" aria-hidden="true">
        <span className="scroll-area__chevron">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </div>
    </div>
  );
};
