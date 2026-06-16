import { PixelData, BambooColor, WeavingScheme, MaterialBreakdown } from '@/types';
import { getBrightness, findClosestColor, adjustContrast, adjustBrightness, generateId } from './colorUtils';

export async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function imageToCanvas(img: HTMLImageElement, maxSize: number = 800): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  let width = img.width;
  let height = img.height;

  if (width > maxSize || height > maxSize) {
    if (width > height) {
      height = (height / width) * maxSize;
      width = maxSize;
    } else {
      width = (width / height) * maxSize;
      height = maxSize;
    }
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);

  return canvas;
}

export function getPixelData(canvas: HTMLCanvasElement): ImageData {
  const ctx = canvas.getContext('2d')!;
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

export function pixelateImage(
  sourceCanvas: HTMLCanvasElement,
  pixelWidth: number,
  pixelHeight: number,
  contrast: number = 0,
  brightness: number = 0
): { canvas: HTMLCanvasElement; pixels: { r: number; g: number; b: number; brightness: number }[][] } {
  const srcCtx = sourceCanvas.getContext('2d')!;
  const srcData = srcCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height).data;

  const cellWidth = sourceCanvas.width / pixelWidth;
  const cellHeight = sourceCanvas.height / pixelHeight;

  const resultCanvas = document.createElement('canvas');
  resultCanvas.width = pixelWidth;
  resultCanvas.height = pixelHeight;
  const resultCtx = resultCanvas.getContext('2d')!;

  const pixels: { r: number; g: number; b: number; brightness: number }[][] = [];

  for (let y = 0; y < pixelHeight; y++) {
    pixels[y] = [];
    for (let x = 0; x < pixelWidth; x++) {
      const srcX = Math.floor(x * cellWidth);
      const srcY = Math.floor(y * cellHeight);
      const srcEndX = Math.floor((x + 1) * cellWidth);
      const srcEndY = Math.floor((y + 1) * cellHeight);

      let totalR = 0, totalG = 0, totalB = 0, count = 0;

      for (let py = srcY; py < srcEndY && py < sourceCanvas.height; py++) {
        for (let px = srcX; px < srcEndX && px < sourceCanvas.width; px++) {
          const idx = (py * sourceCanvas.width + px) * 4;
          totalR += srcData[idx];
          totalG += srcData[idx + 1];
          totalB += srcData[idx + 2];
          count++;
        }
      }

      let r = totalR / count;
      let g = totalG / count;
      let b = totalB / count;

      if (contrast !== 0) {
        const adjusted = adjustContrast(r, g, b, contrast);
        r = adjusted.r;
        g = adjusted.g;
        b = adjusted.b;
      }

      if (brightness !== 0) {
        const adjusted = adjustBrightness(r, g, b, brightness);
        r = adjusted.r;
        g = adjusted.g;
        b = adjusted.b;
      }

      const bright = getBrightness(r, g, b);
      pixels[y][x] = { r, g, b, brightness: bright };

      resultCtx.fillStyle = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
      resultCtx.fillRect(x, y, 1, 1);
    }
  }

  return { canvas: resultCanvas, pixels };
}

export function mapToBambooColors(
  pixelColors: { r: number; g: number; b: number; brightness: number }[][],
  colors: BambooColor[],
  colorMode: 'monochrome' | 'multicolor',
  threshold: number = 128
): PixelData[][] {
  const height = pixelColors.length;
  const width = pixelColors[0].length;

  const pixels: PixelData[][] = [];

  for (let y = 0; y < height; y++) {
    pixels[y] = [];
    for (let x = 0; x < width; x++) {
      const { r, g, b, brightness } = pixelColors[y][x];

      let colorIndex: number;
      let warpPick: boolean;
      let weftPick: boolean;

      if (colorMode === 'monochrome') {
        const isDark = brightness < threshold;
        colorIndex = isDark ? 1 : 0;
        warpPick = !isDark;
        weftPick = isDark;
      } else {
        colorIndex = findClosestColor(r, g, b, colors);
        const isWarpColor = colorIndex % 2 === 0;
        warpPick = isWarpColor;
        weftPick = !isWarpColor;
      }

      pixels[y][x] = {
        x,
        y,
        colorIndex,
        brightness,
        warpPick,
        weftPick,
      };
    }
  }

  return pixels;
}

export function calculateMaterialEstimate(
  pixels: PixelData[][],
  stripeWidth: number,
  colors: BambooColor[]
): {
  totalWarpLength: number;
  totalWeftLength: number;
  totalLength: number;
  colorBreakdown: MaterialBreakdown[];
} {
  const height = pixels.length;
  const width = pixels[0].length;

  const colorCounts: Map<string, { warp: number; weft: number }> = new Map();
  colors.forEach((c) => colorCounts.set(c.id, { warp: 0, weft: 0 }));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel = pixels[y][x];
      const colorId = colors[pixel.colorIndex]?.id || colors[0].id;
      const counts = colorCounts.get(colorId) || { warp: 0, weft: 0 };

      if (pixel.warpPick) counts.warp++;
      if (pixel.weftPick) counts.weft++;

      colorCounts.set(colorId, counts);
    }
  }

  const colorBreakdown: MaterialBreakdown[] = colors.map((color) => {
    const counts = colorCounts.get(color.id) || { warp: 0, weft: 0 };
    const warpLength = (counts.warp * height * stripeWidth) / 1000;
    const weftLength = (counts.weft * width * stripeWidth) / 1000;
    return {
      colorId: color.id,
      colorName: color.name,
      colorHex: color.hex,
      warpLength,
      weftLength,
      totalLength: warpLength + weftLength,
      count: counts.warp + counts.weft,
    };
  });

  const totalWarpLength = colorBreakdown.reduce((sum, c) => sum + c.warpLength, 0);
  const totalWeftLength = colorBreakdown.reduce((sum, c) => sum + c.weftLength, 0);

  return {
    totalWarpLength,
    totalWeftLength,
    totalLength: totalWarpLength + totalWeftLength,
    colorBreakdown,
  };
}

export function detectColorDeviation(pixels: PixelData[][]): PixelData[][] {
  const height = pixels.length;
  const width = pixels[0].length;

  const result = pixels.map((row) => row.map((p) => ({ ...p })));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const current = result[y][x];
      let totalDeviation = 0;
      let neighborCount = 0;

      const neighbors = [
        [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1],
      ];

      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const neighbor = result[ny][nx];
          if (neighbor.colorIndex !== current.colorIndex) {
            totalDeviation += Math.abs(neighbor.brightness - current.brightness);
            neighborCount++;
          }
        }
      }

      if (neighborCount > 0) {
        const avgDeviation = totalDeviation / neighborCount;
        current.colorDeviation = avgDeviation;

        if (avgDeviation > 80) {
          current.deviationLevel = 'severe';
        } else if (avgDeviation > 40) {
          current.deviationLevel = 'moderate';
        } else if (avgDeviation > 20) {
          current.deviationLevel = 'mild';
        }
      }
    }
  }

  return result;
}

export function validateWeaving(pixels: PixelData[][]): {
  edgeClosure: boolean;
  edgeIssues: string[];
  misalignmentRisk: 'low' | 'medium' | 'high';
  misalignmentAreas: { x: number; y: number; severity: number }[];
} {
  const height = pixels.length;
  const width = pixels[0].length;
  const edgeIssues: string[] = [];
  const misalignmentAreas: { x: number; y: number; severity: number }[] = [];

  let edgeClosure = true;

  for (let x = 0; x < width; x++) {
    if (pixels[0][x].warpPick !== pixels[height - 1][x].warpPick) {
      edgeClosure = false;
    }
  }

  for (let y = 0; y < height; y++) {
    if (pixels[y][0].weftPick !== pixels[y][width - 1].weftPick) {
      edgeClosure = false;
    }
  }

  if (!edgeClosure) {
    edgeIssues.push('上下边缘经篾挑压模式不一致，可能影响闭合收口');
  }

  let patternChanges = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 1; x < width; x++) {
      if (pixels[y][x].colorIndex !== pixels[y][x - 1].colorIndex) {
        patternChanges++;
      }
    }
  }

  const changeDensity = patternChanges / (width * height);

  let misalignmentRisk: 'low' | 'medium' | 'high' = 'low';
  if (changeDensity > 0.3) {
    misalignmentRisk = 'high';
  } else if (changeDensity > 0.15) {
    misalignmentRisk = 'medium';
  }

  for (let y = 2; y < height - 2; y += 3) {
    for (let x = 2; x < width - 2; x += 3) {
      let localChanges = 0;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (dx !== 0 || dy !== 0) {
            if (pixels[y + dy]?.[x + dx]?.colorIndex !== pixels[y][x].colorIndex) {
              localChanges++;
            }
          }
        }
      }
      if (localChanges > 12) {
        misalignmentAreas.push({ x, y, severity: Math.min(100, (localChanges / 24) * 100) });
      }
    }
  }

  return {
    edgeClosure,
    edgeIssues,
    misalignmentRisk,
    misalignmentAreas,
  };
}

export function calculatePixelDimensions(
  imageWidth: number,
  imageHeight: number,
  stripeWidth: number
): { pixelWidth: number; pixelHeight: number; canvasWidth: number; canvasHeight: number } {
  const aspectRatio = imageWidth / imageHeight;
  const maxPixels = 200;

  let pixelWidth: number;
  let pixelHeight: number;

  if (aspectRatio >= 1) {
    pixelWidth = maxPixels;
    pixelHeight = Math.round(maxPixels / aspectRatio);
  } else {
    pixelHeight = maxPixels;
    pixelWidth = Math.round(maxPixels * aspectRatio);
  }

  pixelWidth = Math.max(20, Math.min(200, pixelWidth));
  pixelHeight = Math.max(20, Math.min(200, pixelHeight));

  const canvasWidth = pixelWidth * stripeWidth;
  const canvasHeight = pixelHeight * stripeWidth;

  return { pixelWidth, pixelHeight, canvasWidth, canvasHeight };
}

export function renderWeavingCanvas(
  pixels: PixelData[][],
  colors: BambooColor[],
  viewMode: 'far' | 'near',
  stripeWidth: number,
  showDeviation: boolean = false
): HTMLCanvasElement {
  const height = pixels.length;
  const width = pixels[0].length;

  const scale = viewMode === 'near' ? 8 : 2;
  const displayWidth = width * scale;
  const displayHeight = height * scale;

  const canvas = document.createElement('canvas');
  canvas.width = displayWidth;
  canvas.height = displayHeight;
  const ctx = canvas.getContext('2d')!;

  if (viewMode === 'far') {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = pixels[y][x];
        const color = colors[pixel.colorIndex] || colors[0];
        ctx.fillStyle = color.hex;
        ctx.fillRect(x * scale, y * scale, scale, scale);

        if (showDeviation && pixel.deviationLevel) {
          const alpha = pixel.deviationLevel === 'severe' ? 0.6 :
                        pixel.deviationLevel === 'moderate' ? 0.4 : 0.2;
          ctx.fillStyle = `rgba(184, 84, 80, ${alpha})`;
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    }
  } else {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = pixels[y][x];
        const px = x * scale;
        const py = y * scale;

        const warpColor = colors[pixel.warpPick ? pixel.colorIndex : 0];
        const weftColor = colors[pixel.weftPick ? pixel.colorIndex : 1];

        ctx.fillStyle = weftColor.hex;
        ctx.fillRect(px, py, scale, scale);

        ctx.fillStyle = warpColor.hex;
        ctx.fillRect(px, py, scale, scale / 2);

        ctx.strokeStyle = 'rgba(74, 55, 40, 0.15)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(px + 0.5, py + 0.5, scale - 1, scale - 1);

        if (showDeviation && pixel.deviationLevel) {
          const alpha = pixel.deviationLevel === 'severe' ? 0.5 :
                        pixel.deviationLevel === 'moderate' ? 0.3 : 0.15;
          ctx.fillStyle = `rgba(217, 58, 50, ${alpha})`;
          ctx.fillRect(px, py, scale, scale);
        }
      }
    }
  }

  return canvas;
}

export function createWeavingScheme(
  imageData: string,
  pixelWidth: number,
  pixelHeight: number,
  stripeWidth: number,
  colorMode: 'monochrome' | 'multicolor',
  colors: BambooColor[],
  pixels: PixelData[][]
): WeavingScheme {
  const now = new Date().toISOString();
  const materialEstimate = calculateMaterialEstimate(pixels, stripeWidth, colors);
  const weavingValidation = validateWeaving(pixels);

  return {
    id: generateId(),
    name: '未命名方案',
    createdAt: now,
    updatedAt: now,
    imageData,
    pixelWidth,
    pixelHeight,
    stripeWidth,
    stripeThickness: 0.8,
    colorMode,
    brightnessThreshold: 128,
    contrast: 0,
    brightness: 0,
    colors,
    pixels,
    materialEstimate,
    weavingValidation,
  };
}
