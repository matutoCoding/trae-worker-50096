export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => {
    const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function getBrightness(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export function colorDistance(
  r1: number, g1: number, b1: number,
  r2: number, g2: number, b2: number
): number {
  const rmean = (r1 + r2) / 2;
  const r = r1 - r2;
  const g = g1 - g2;
  const b = b1 - b2;
  return Math.sqrt(
    (2 + rmean / 256) * r * r +
    4 * g * g +
    (2 + (255 - rmean) / 256) * b * b
  );
}

export function findClosestColor(
  r: number, g: number, b: number,
  palette: { hex: string }[]
): number {
  let minDist = Infinity;
  let closestIndex = 0;

  palette.forEach((color, index) => {
    const { r: cr, g: cg, b: cb } = hexToRgb(color.hex);
    const dist = colorDistance(r, g, b, cr, cg, cb);
    if (dist < minDist) {
      minDist = dist;
      closestIndex = index;
    }
  });

  return closestIndex;
}

export function adjustContrast(r: number, g: number, b: number, contrast: number): { r: number; g: number; b: number } {
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  return {
    r: Math.max(0, Math.min(255, factor * (r - 128) + 128)),
    g: Math.max(0, Math.min(255, factor * (g - 128) + 128)),
    b: Math.max(0, Math.min(255, factor * (b - 128) + 128)),
  };
}

export function adjustBrightness(r: number, g: number, b: number, brightness: number): { r: number; g: number; b: number } {
  return {
    r: Math.max(0, Math.min(255, r + brightness)),
    g: Math.max(0, Math.min(255, g + brightness)),
    b: Math.max(0, Math.min(255, b + brightness)),
  };
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatLength(meters: number): string {
  if (meters >= 1000) {
    return (meters / 1000).toFixed(2) + ' 千米';
  }
  if (meters >= 1) {
    return meters.toFixed(2) + ' 米';
  }
  return (meters * 100).toFixed(1) + ' 厘米';
}
