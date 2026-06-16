import { BambooColor, ProcessStep } from '@/types';
import { generateId } from '@/utils/colorUtils';

export const defaultMonochromeColors: BambooColor[] = [
  {
    id: generateId(),
    name: '米白篾',
    hex: '#F5F0E1',
    category: 'primary',
  },
  {
    id: generateId(),
    name: '炭黑篾',
    hex: '#3F352D',
    category: 'primary',
  },
];

export const defaultMulticolorPalette: BambooColor[] = [
  {
    id: generateId(),
    name: '原竹色',
    hex: '#D9E4BC',
    category: 'primary',
  },
  {
    id: generateId(),
    name: '竹青色',
    hex: '#7BA83E',
    category: 'primary',
  },
  {
    id: generateId(),
    name: '赭红色',
    hex: '#B85450',
    category: 'primary',
  },
  {
    id: generateId(),
    name: '藤黄色',
    hex: '#CDAE6E',
    category: 'primary',
  },
  {
    id: generateId(),
    name: '靛蓝色',
    hex: '#4A6FA5',
    category: 'secondary',
  },
  {
    id: generateId(),
    name: '墨色',
    hex: '#4A3F35',
    category: 'secondary',
  },
];

export const materialTypes = [
  { id: 'phyllostachys', name: '毛竹', description: '质地坚韧，适合大幅作品' },
  { id: 'bambusa', name: '慈竹', description: '纤维细腻，适合精细编织' },
  { id: 'dendrocalamus', name: '麻竹', description: '篾片宽厚，适合立体造型' },
  { id: 'phyllostachys-pubescens', name: '楠竹', description: '色泽温润，最常用竹材' },
];

export const templateCategories = [
  { id: 'landscape', name: '山水风景', icon: 'Mountain' },
  { id: 'figure', name: '人物肖像', icon: 'User' },
  { id: 'flower-bird', name: '花鸟虫鱼', icon: 'Flower2' },
  { id: 'calligraphy', name: '书法文字', icon: 'PenTool' },
  { id: 'pattern', name: '纹样图案', icon: 'Grid3x3' },
  { id: 'animal', name: '瑞兽吉祥', icon: 'Cat' },
];

export const defaultProcessSteps: ProcessStep[] = [
  { id: 'prepare', name: '备篾', completed: false, note: '' },
  { id: 'dye', name: '染色', completed: false, note: '' },
  { id: 'layout', name: '排篾', completed: false, note: '' },
  { id: 'weave', name: '挑压', completed: false, note: '' },
  { id: 'finish', name: '收边', completed: false, note: '' },
];
