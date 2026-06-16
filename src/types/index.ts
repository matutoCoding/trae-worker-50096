export interface BambooColor {
  id: string;
  name: string;
  hex: string;
  category: 'primary' | 'secondary' | 'custom';
}

export interface PixelData {
  x: number;
  y: number;
  colorIndex: number;
  brightness: number;
  warpPick: boolean;
  weftPick: boolean;
  colorDeviation?: number;
  deviationLevel?: 'mild' | 'moderate' | 'severe';
}

export interface MaterialBreakdown {
  colorId: string;
  colorName: string;
  colorHex: string;
  warpLength: number;
  weftLength: number;
  totalLength: number;
  count: number;
}

export interface WeavingScheme {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  imageData: string;
  pixelWidth: number;
  pixelHeight: number;
  stripeWidth: number;
  stripeThickness: number;
  colorMode: 'monochrome' | 'multicolor';
  brightnessThreshold: number;
  contrast: number;
  brightness: number;
  colors: BambooColor[];
  pixels: PixelData[][];
  materialEstimate: {
    totalWarpLength: number;
    totalWeftLength: number;
    totalLength: number;
    colorBreakdown: MaterialBreakdown[];
  };
  weavingValidation: {
    edgeClosure: boolean;
    edgeIssues: string[];
    misalignmentRisk: 'low' | 'medium' | 'high';
    misalignmentAreas: { x: number; y: number; severity: number }[];
  };
}

export type WorkOrderStatus = 'pending' | 'in_progress' | 'completed';

export interface ProcessStep {
  id: string;
  name: string;
  completed: boolean;
  note: string;
  completedAt?: string;
}

export interface CraftArchive {
  id: string;
  title: string;
  description: string;
  tags: string[];
  scheme: WeavingScheme;
  craftParams: {
    material: string;
    thickness: number;
    difficulty: number;
    estimatedHours: number;
  };
  notes: string;
  thumbnail: string;
  workOrderStatus: WorkOrderStatus;
  processSteps: ProcessStep[];
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail: string;
  scheme: WeavingScheme;
  isFavorite: boolean;
  usageCount: number;
  difficulty: number;
  createdAt: string;
}

export type ViewMode = 'far' | 'near';

export interface UIState {
  sidebarCollapsed: boolean;
  viewMode: ViewMode;
  zoomLevel: number;
  showDeviation: boolean;
  showGrid: boolean;
}

export interface TemplateCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
}
