import { PixelData, BambooColor } from '@/types';

export interface ColorSegment {
  colorIndex: number;
  colorName: string;
  colorHex: string;
  start: number;
  end: number;
  length: number;
}

export interface StripeSequence {
  index: number;
  type: 'warp' | 'weft';
  segments: ColorSegment[];
}

export function analyzeWarpSequences(
  pixels: PixelData[][],
  colors: BambooColor[]
): StripeSequence[] {
  const width = pixels[0].length;
  const height = pixels.length;
  const sequences: StripeSequence[] = [];

  for (let x = 0; x < width; x++) {
    const segments: ColorSegment[] = [];
    let currentColor = -1;
    let segmentStart = 0;

    for (let y = 0; y < height; y++) {
      const pixel = pixels[y][x];
      if (pixel.colorIndex !== currentColor) {
        if (currentColor !== -1) {
          const color = colors[currentColor] || colors[0];
          segments.push({
            colorIndex: currentColor,
            colorName: color.name,
            colorHex: color.hex,
            start: segmentStart,
            end: y - 1,
            length: y - segmentStart,
          });
        }
        currentColor = pixel.colorIndex;
        segmentStart = y;
      }
    }

    if (currentColor !== -1) {
      const color = colors[currentColor] || colors[0];
      segments.push({
        colorIndex: currentColor,
        colorName: color.name,
        colorHex: color.hex,
        start: segmentStart,
        end: height - 1,
        length: height - segmentStart,
      });
    }

    sequences.push({
      index: x,
      type: 'warp',
      segments,
    });
  }

  return sequences;
}

export function analyzeWeftSequences(
  pixels: PixelData[][],
  colors: BambooColor[]
): StripeSequence[] {
  const width = pixels[0].length;
  const height = pixels.length;
  const sequences: StripeSequence[] = [];

  for (let y = 0; y < height; y++) {
    const segments: ColorSegment[] = [];
    let currentColor = -1;
    let segmentStart = 0;

    for (let x = 0; x < width; x++) {
      const pixel = pixels[y][x];
      if (pixel.colorIndex !== currentColor) {
        if (currentColor !== -1) {
          const color = colors[currentColor] || colors[0];
          segments.push({
            colorIndex: currentColor,
            colorName: color.name,
            colorHex: color.hex,
            start: segmentStart,
            end: x - 1,
            length: x - segmentStart,
          });
        }
        currentColor = pixel.colorIndex;
        segmentStart = x;
      }
    }

    if (currentColor !== -1) {
      const color = colors[currentColor] || colors[0];
      segments.push({
        colorIndex: currentColor,
        colorName: color.name,
        colorHex: color.hex,
        start: segmentStart,
        end: width - 1,
        length: width - segmentStart,
      });
    }

    sequences.push({
      index: y,
      type: 'weft',
      segments,
    });
  }

  return sequences;
}

export function calculateColorSegmentSummary(
  sequences: StripeSequence[],
  stripeWidth: number
): Map<string, { totalSegments: number; totalLength: number; totalMeters: number }> {
  const summary = new Map<string, { totalSegments: number; totalLength: number; totalMeters: number }>();

  sequences.forEach((seq) => {
    seq.segments.forEach((seg) => {
      const key = seg.colorHex;
      const existing = summary.get(key) || { totalSegments: 0, totalLength: 0, totalMeters: 0 };
      summary.set(key, {
        totalSegments: existing.totalSegments + 1,
        totalLength: existing.totalLength + seg.length,
        totalMeters: existing.totalMeters + (seg.length * stripeWidth) / 1000,
      });
    });
  });

  return summary;
}
