import React, { useRef, useState, useCallback } from 'react';
import './ColorPicker.css';

interface ColorPickerProps {
  value: string;             // hex e.g. '#1a6b3c'
  onChange: (hex: string) => void;
}

// ─── colour math ──────────────────────────────────────────────────────────
function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

function hsvToHex(h: number, s: number, v: number): string {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r: number, g: number, b: number;
  if (h < 60)       { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else              { r = c; g = 0; b = x; }
  const to = (n: number) =>
    Math.round((n + m) * 255).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex.trim());
  if (!m) return { h: 140, s: 0.6, v: 0.5 };
  const r = parseInt(m[1], 16) / 255;
  const g = parseInt(m[2], 16) / 255;
  const b = parseInt(m[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  return { h, s, v: max };
}

// EyeDropper is not in all TS lib targets yet
interface EyeDropperLike {
  open: () => Promise<{ sRGBHex: string }>;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
  // Seed HSV from the incoming hex once; thereafter drive from internal state
  // so the hue handle doesn't jump when s/v hit zero (which loses hue info).
  const [hsv, setHsv] = useState(() => hexToHsv(value));
  const { h, s, v } = hsv;
  const hex = hsvToHex(h, s, v);

  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  const emit = useCallback(
    (next: { h: number; s: number; v: number }) => {
      setHsv(next);
      onChange(hsvToHex(next.h, next.s, next.v));
    },
    [onChange],
  );

  const handleSv = useCallback(
    (e: React.PointerEvent) => {
      const el = svRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const ns = clamp01((e.clientX - r.left) / r.width);
      const nv = clamp01(1 - (e.clientY - r.top) / r.height);
      emit({ h, s: ns, v: nv });
    },
    [emit, h],
  );

  const handleHue = useCallback(
    (e: React.PointerEvent) => {
      const el = hueRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const nh = clamp01((e.clientX - r.left) / r.width) * 360;
      emit({ h: nh, s, v });
    },
    [emit, s, v],
  );

  const drag = (handler: (e: React.PointerEvent) => void) =>
    (e: React.PointerEvent) => {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      handler(e);
      const move = (ev: PointerEvent) => handler(ev as unknown as React.PointerEvent);
      const up = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    };

  const pickEyedropper = useCallback(async () => {
    const Eye = (window as unknown as { EyeDropper?: new () => EyeDropperLike }).EyeDropper;
    if (!Eye) return;
    try {
      const res = await new Eye().open();
      emit(hexToHsv(res.sRGBHex));
    } catch {
      /* user cancelled */
    }
  }, [emit]);

  const hueColor = hsvToHex(h, 1, 1);
  const hasEyedropper =
    typeof window !== 'undefined' &&
    'EyeDropper' in window;

  return (
    <div className="color-picker">
      {/* Saturation / value square */}
      <div
        ref={svRef}
        className="color-picker__sv"
        style={{ backgroundColor: hueColor }}
        onPointerDown={drag(handleSv)}
      >
        <div className="color-picker__sv-white" />
        <div className="color-picker__sv-black" />
        <div
          className="color-picker__sv-handle"
          style={{ left: `${s * 100}%`, top: `${(1 - v) * 100}%`, backgroundColor: hex }}
        />
      </div>

      {/* Hue slider */}
      <div
        ref={hueRef}
        className="color-picker__hue"
        onPointerDown={drag(handleHue)}
      >
        <div
          className="color-picker__hue-handle"
          style={{ left: `${(h / 360) * 100}%` }}
        />
      </div>

      {/* Readout + eyedropper */}
      <div className="color-picker__footer">
        <span className="color-picker__swatch" style={{ backgroundColor: hex }} />
        <input
          className="color-picker__hex"
          value={hex.toUpperCase()}
          spellCheck={false}
          onChange={(e) => {
            const val = e.target.value;
            if (/^#?[\da-f]{6}$/i.test(val)) emit(hexToHsv(val));
          }}
        />
        {hasEyedropper && (
          <button
            type="button"
            className="color-picker__eyedropper"
            onClick={pickEyedropper}
            title="Піпетка"
            aria-label="Піпетка"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m2 22 1-1h3l9-9" />
              <path d="M3 21v-3l9-9" />
              <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
