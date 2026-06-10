import React, { useEffect, useRef } from 'react';

interface RecolorCanvasProps {
  /** Greyscale source body PNG (grey or black variant) — provides shading. */
  src: string;
  /** Target hex colour, e.g. '#EDFF21'. */
  hex: string;
  /**
   * Optional corpus mask (SVG/PNG silhouette). When given, the recolour is
   * clipped to the mask so only the body is painted and baked-in details
   * (screen, LED stripe, logo, top light) from the black base layer below show
   * through the mask's cutouts. Without it, clipping falls back to the source
   * PNG's own alpha (whole silhouette).
   */
  maskSrc?: string;
  className?: string;
}

// WCAG relative luminance (0..1) from a #RRGGBB hex.
export function hexToLuminance(hex: string): number {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex.trim());
  if (!m) return 0.5;
  const toLinear = (v: number) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return (
    0.2126 * toLinear(parseInt(m[1], 16)) +
    0.7152 * toLinear(parseInt(m[2], 16)) +
    0.0722 * toLinear(parseInt(m[3], 16))
  );
}

// Very dark targets keep more detail from the black body; everything else
// recolours from the grey body.
export function recolorSourceKey(hex: string): 'black' | 'grey' {
  return hexToLuminance(hex) < 0.15 ? 'black' : 'grey';
}

// Per-luminance-zone tuning so bright/pastel colours don't blow out and dark
// ones don't go muddy (mirrors the production configurator's filter table).
function filterForLuminance(tLum: number): string {
  if (tLum < 0.15) return 'contrast(0.9) brightness(1.1) saturate(1)';
  if (tLum < 0.55) return 'contrast(1.15) brightness(1) saturate(1)';
  if (tLum < 0.7) return 'contrast(1.2) brightness(1) saturate(1)';
  if (tLum < 0.9) return 'contrast(1.05) brightness(0.92) saturate(0.7)';
  return 'contrast(1.05) brightness(0.78) saturate(0.6)';
}

/*
 * Renders a colour-replaced version of a greyscale station body.
 *   1. fill the canvas with the target colour (provides hue + chroma)
 *   2. draw the body PNG with 'luminosity' blend (provides shading/detail)
 *   3. clip to the PNG's alpha via 'destination-in' (keeps the silhouette)
 * The canvas is only displayed, never read back, so cross-origin CDN bodies
 * tainting the canvas is harmless.
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export const RecolorCanvas: React.FC<RecolorCanvasProps> = ({ src, hex, maskSrc, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cancelled = false;
    const loads = [loadImage(src)];
    if (maskSrc) loads.push(loadImage(maskSrc));

    Promise.all(loads)
      .then(([body, mask]) => {
        if (cancelled) return;
        const nw = body.naturalWidth;
        const nh = body.naturalHeight;
        canvas.width = nw;
        canvas.height = nh;

        ctx.clearRect(0, 0, nw, nh);
        ctx.fillStyle = hex;
        ctx.fillRect(0, 0, nw, nh);

        // Shading: target colour gets the body PNG's luminosity.
        ctx.filter = filterForLuminance(hexToLuminance(hex));
        ctx.globalCompositeOperation = 'luminosity';
        ctx.drawImage(body, 0, 0);
        ctx.filter = 'none';

        // Clip: to the corpus mask if present (stretched to the body's size,
        // matching production's mask-size = natural PNG size), else to the
        // body PNG's own alpha.
        ctx.globalCompositeOperation = 'destination-in';
        if (mask) {
          ctx.drawImage(mask, 0, 0, nw, nh);
        } else {
          ctx.drawImage(body, 0, 0);
        }
        ctx.globalCompositeOperation = 'source-over';
      })
      .catch(() => {
        /* image failed to load — leave canvas blank, base layer shows */
      });

    return () => {
      cancelled = true;
    };
  }, [src, hex, maskSrc]);

  return <canvas ref={canvasRef} className={className} />;
};
