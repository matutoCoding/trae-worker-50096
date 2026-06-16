import { useMemo, useRef } from 'react';
import {
  Printer,
  X,
  Layers,
  AlertTriangle,
  Star,
  Tag,
  Clock,
  FileText,
  Palette,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { CraftArchive, WeavingScheme } from '@/types';
import { materialTypes } from '@/data/defaultData';
import {
  analyzeWarpSequences,
  analyzeWeftSequences,
  calculateColorSegmentSummary,
} from '@/utils/sequenceUtils';

interface CraftOrderProps {
  archive?: CraftArchive;
  onClose: () => void;
}

export default function CraftOrder({ archive, onClose }: CraftOrderProps) {
  const { currentScheme } = useAppStore();
  const printRef = useRef<HTMLDivElement>(null);

  const scheme: WeavingScheme | null = archive?.scheme || currentScheme;

  const warpSequences = useMemo(() => {
    if (!scheme) return [];
    return analyzeWarpSequences(scheme.pixels, scheme.colors);
  }, [scheme]);

  const weftSequences = useMemo(() => {
    if (!scheme) return [];
    return analyzeWeftSequences(scheme.pixels, scheme.colors);
  }, [scheme]);

  const warpSummary = useMemo(() => {
    if (!scheme) return new Map();
    return calculateColorSegmentSummary(warpSequences, scheme.stripeWidth);
  }, [warpSequences, scheme]);

  const weftSummary = useMemo(() => {
    if (!scheme) return new Map();
    return calculateColorSegmentSummary(weftSequences, scheme.stripeWidth);
  }, [weftSequences, scheme]);

  const deviationStats = useMemo(() => {
    if (!scheme) return { mild: 0, moderate: 0, severe: 0 };
    let mild = 0, moderate = 0, severe = 0;
    scheme.pixels.forEach((row) => {
      row.forEach((pixel) => {
        if (pixel.deviationLevel === 'mild') mild++;
        else if (pixel.deviationLevel === 'moderate') moderate++;
        else if (pixel.deviationLevel === 'severe') severe++;
      });
    });
    return { mild, moderate, severe };
  }, [scheme]);

  if (!scheme) {
    return (
      <div className="fixed inset-0 bg-ink-900/50 flex items-center justify-center z-50 p-4">
        <div className="card w-full max-w-3xl p-8 text-center">
          <p className="text-ink-500 mb-4">没有可出单的方案数据</p>
          <button onClick={onClose} className="btn-secondary">关闭</button>
        </div>
      </div>
    );
  }

  const getMaterialName = (id: string) => {
    return materialTypes.find((m) => m.id === id)?.name || id;
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>竹篾编画制作单 - ${archive?.title || '当前方案'}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: "Noto Serif SC", "SimSun", serif; color: #333; padding: 40px; line-height: 1.8; }
            h1 { font-size: 24px; text-align: center; margin-bottom: 8px; border-bottom: 2px solid #6B8E23; padding-bottom: 12px; }
            .subtitle { text-align: center; color: #888; font-size: 12px; margin-bottom: 30px; }
            .section { margin-bottom: 24px; page-break-inside: avoid; }
            .section-title { font-size: 16px; font-weight: bold; color: #4A3728; border-left: 4px solid #6B8E23; padding-left: 10px; margin-bottom: 12px; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .info-row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #e0e0e0; font-size: 14px; }
            .info-label { color: #888; }
            .info-value { font-weight: bold; }
            .color-row { display: flex; align-items: center; gap: 8px; padding: 6px 0; font-size: 13px; border-bottom: 1px solid #f0f0f0; }
            .color-swatch { width: 20px; height: 20px; border-radius: 4px; border: 1px solid #ccc; flex-shrink: 0; }
            .warning { background: #FFF5F5; border: 1px solid #FEB2B2; border-radius: 6px; padding: 12px; font-size: 13px; color: #9B2C2C; }
            .notes { background: #F5F0E1; border-radius: 6px; padding: 12px; font-size: 13px; white-space: pre-wrap; }
            .thumbnail { text-align: center; margin-bottom: 20px; }
            .thumbnail img { max-width: 280px; border: 1px solid #e0e0e0; border-radius: 8px; }
            .footer { text-align: center; font-size: 11px; color: #aaa; margin-top: 40px; border-top: 1px solid #e0e0e0; padding-top: 12px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const title = archive?.title || '当前方案制作单';

  return (
    <div className="fixed inset-0 bg-ink-900/50 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="card-header flex items-center justify-between">
          <h3 className="font-medium text-ink-800">工艺制作单</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn-primary flex items-center gap-2 text-sm py-1.5 px-3"
            >
              <Printer className="w-4 h-4" />
              打印制作单
            </button>
            <button
              onClick={onClose}
              className="p-1 text-ink-400 hover:text-ink-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto flex-1 scrollbar-thin" ref={printRef}>
          <h1 className="text-xl font-serif text-center text-ink-800 border-b-2 border-bamboo-500 pb-3 mb-2">
            {title}
          </h1>
          <p className="text-center text-xs text-ink-400 mb-6">
            竹篾染色编画 · 色篾排布与挑压成像系统
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="section">
              <div className="section-title text-sm font-bold text-ink-700 border-l-4 border-bamboo-500 pl-2.5 mb-3">
                <FileText className="w-4 h-4 inline mr-1" />
                基本信息
              </div>
              {archive && (
                <>
                  <div className="info-row flex justify-between py-1 border-b border-dashed border-parchment-300 text-sm">
                    <span className="text-ink-400">作品名称</span>
                    <span className="font-medium text-ink-800">{archive.title}</span>
                  </div>
                  {archive.description && (
                    <div className="info-row flex justify-between py-1 border-b border-dashed border-parchment-300 text-sm">
                      <span className="text-ink-400">作品描述</span>
                      <span className="font-medium text-ink-800 text-right max-w-[60%]">{archive.description}</span>
                    </div>
                  )}
                  <div className="info-row flex justify-between py-1 border-b border-dashed border-parchment-300 text-sm">
                    <span className="text-ink-400">竹材种类</span>
                    <span className="font-medium text-ink-800">{getMaterialName(archive.craftParams.material)}</span>
                  </div>
                  <div className="info-row flex justify-between py-1 border-b border-dashed border-parchment-300 text-sm">
                    <span className="text-ink-400">篾厚</span>
                    <span className="font-medium text-ink-800">{archive.craftParams.thickness} mm</span>
                  </div>
                  <div className="info-row flex justify-between py-1 border-b border-dashed border-parchment-300 text-sm items-center">
                    <span className="text-ink-400">难度等级</span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i <= archive.craftParams.difficulty
                              ? 'text-parchment-500 fill-parchment-500'
                              : 'text-parchment-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="info-row flex justify-between py-1 border-b border-dashed border-parchment-300 text-sm">
                    <span className="text-ink-400">预估工时</span>
                    <span className="font-medium text-ink-800">{archive.craftParams.estimatedHours} 小时</span>
                  </div>
                  {archive.tags.length > 0 && (
                    <div className="info-row flex justify-between py-1 border-b border-dashed border-parchment-300 text-sm items-center">
                      <span className="text-ink-400">标签</span>
                      <div className="flex gap-1 flex-wrap justify-end">
                        {archive.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 bg-bamboo-50 text-bamboo-700 text-xs rounded-full">
                            <Tag className="w-3 h-3 inline mr-0.5" />{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              <div className="info-row flex justify-between py-1 border-b border-dashed border-parchment-300 text-sm">
                <span className="text-ink-400">出单日期</span>
                <span className="font-medium text-ink-800">{new Date().toLocaleDateString('zh-CN')}</span>
              </div>
            </div>

            <div className="section">
              <div className="section-title text-sm font-bold text-ink-700 border-l-4 border-bamboo-500 pl-2.5 mb-3">
                <Layers className="w-4 h-4 inline mr-1" />
                方案概要
              </div>
              <div className="thumbnail text-center mb-4">
                <img
                  src={archive?.thumbnail || scheme.imageData}
                  alt="缩略图"
                  className="max-w-[280px] mx-auto border border-parchment-300 rounded-lg"
                />
              </div>
              <div className="info-row flex justify-between py-1 border-b border-dashed border-parchment-300 text-sm">
                <span className="text-ink-400">经篾数量</span>
                <span className="font-medium text-ink-800">{scheme.pixelWidth} 根</span>
              </div>
              <div className="info-row flex justify-between py-1 border-b border-dashed border-parchment-300 text-sm">
                <span className="text-ink-400">纬篾数量</span>
                <span className="font-medium text-ink-800">{scheme.pixelHeight} 根</span>
              </div>
              <div className="info-row flex justify-between py-1 border-b border-dashed border-parchment-300 text-sm">
                <span className="text-ink-400">篾宽</span>
                <span className="font-medium text-ink-800">{scheme.stripeWidth} mm</span>
              </div>
              <div className="info-row flex justify-between py-1 border-b border-dashed border-parchment-300 text-sm">
                <span className="text-ink-400">色彩模式</span>
                <span className="font-medium text-ink-800">{scheme.colorMode === 'monochrome' ? '黑白' : '多色'}</span>
              </div>
              <div className="info-row flex justify-between py-1 border-b border-dashed border-parchment-300 text-sm">
                <span className="text-ink-400">色篾种类</span>
                <span className="font-medium text-ink-800">{scheme.colors.length} 种</span>
              </div>
            </div>
          </div>

          <div className="section mb-6">
            <div className="section-title text-sm font-bold text-ink-700 border-l-4 border-bamboo-500 pl-2.5 mb-3">
              <Palette className="w-4 h-4 inline mr-1" />
              染色用料清单
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-medium text-ink-600 mb-2">经篾用料</h5>
                <div className="space-y-1">
                  {scheme.colors.map((color) => {
                    const stat = warpSummary.get(color.hex);
                    if (!stat) return null;
                    return (
                      <div key={color.id} className="color-row flex items-center gap-2 py-1.5 border-b border-parchment-200 text-sm">
                        <div className="color-swatch w-5 h-5 rounded border border-parchment-300 flex-shrink-0" style={{ backgroundColor: color.hex }} />
                        <span className="flex-1 text-ink-700">{color.name}</span>
                        <span className="text-ink-400 text-xs">{stat.totalSegments}段</span>
                        <span className="font-medium text-bamboo-700">{stat.totalMeters.toFixed(2)} m</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <h5 className="text-sm font-medium text-ink-600 mb-2">纬篾用料</h5>
                <div className="space-y-1">
                  {scheme.colors.map((color) => {
                    const stat = weftSummary.get(color.hex);
                    if (!stat) return null;
                    return (
                      <div key={color.id} className="color-row flex items-center gap-2 py-1.5 border-b border-parchment-200 text-sm">
                        <div className="color-swatch w-5 h-5 rounded border border-parchment-300 flex-shrink-0" style={{ backgroundColor: color.hex }} />
                        <span className="flex-1 text-ink-700">{color.name}</span>
                        <span className="text-ink-400 text-xs">{stat.totalSegments}段</span>
                        <span className="font-medium text-bamboo-700">{stat.totalMeters.toFixed(2)} m</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-bamboo-50 rounded-lg border border-bamboo-100 text-sm">
              <span className="font-medium text-ink-700">用料合计：</span>
              <span className="text-bamboo-700 font-bold ml-2">
                经篾 {scheme.materialEstimate.totalWarpLength.toFixed(2)} m
              </span>
              <span className="mx-2 text-ink-300">+</span>
              <span className="text-bamboo-700 font-bold">
                纬篾 {scheme.materialEstimate.totalWeftLength.toFixed(2)} m
              </span>
              <span className="mx-2 text-ink-300">=</span>
              <span className="text-bamboo-800 font-bold text-base">
                {scheme.materialEstimate.totalLength.toFixed(2)} m
              </span>
            </div>
          </div>

          {(deviationStats.mild + deviationStats.moderate + deviationStats.severe > 0) && (
            <div className="section mb-6">
              <div className="section-title text-sm font-bold text-ink-700 border-l-4 border-cinnabar-500 pl-2.5 mb-3">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                色差风险提示
              </div>
              <div className="warning p-3 bg-cinnabar-50 border border-cinnabar-200 rounded-lg text-sm">
                <div className="flex gap-6 mb-2">
                  <span>轻度偏差：<strong className="text-cinnabar-600">{deviationStats.mild}</strong> 处</span>
                  <span>中度偏差：<strong className="text-cinnabar-700">{deviationStats.moderate}</strong> 处</span>
                  <span>重度偏差：<strong className="text-cinnabar-800">{deviationStats.severe}</strong> 处</span>
                </div>
                <p className="text-xs text-cinnabar-600">
                  色差偏差可能由染色不均引起，建议对重度偏差区域在编织前调整色篾配比。建议使用同一批次染色的篾条以减少色差。
                </p>
              </div>
            </div>
          )}

          {archive?.notes && (
            <div className="section mb-6">
              <div className="section-title text-sm font-bold text-ink-700 border-l-4 border-bamboo-500 pl-2.5 mb-3">
                <Clock className="w-4 h-4 inline mr-1" />
                创作笔记
              </div>
              <div className="notes p-3 bg-parchment-50 rounded-lg text-sm text-ink-600 whitespace-pre-wrap">
                {archive.notes}
              </div>
            </div>
          )}

          <div className="footer text-center text-xs text-ink-300 mt-6 pt-4 border-t border-parchment-200">
            竹篾染色编画 · 色篾排布与挑压成像系统 | 生成日期：{new Date().toLocaleDateString('zh-CN')}
          </div>
        </div>
      </div>
    </div>
  );
}
