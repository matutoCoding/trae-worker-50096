import { useState, useMemo } from 'react';
import {
  Grid3x3,
  Palette,
  Ruler,
  AlertTriangle,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import { useAppStore } from '@/store/useAppStore';
import { BambooColor } from '@/types';
import { generateId } from '@/utils/colorUtils';
import {
  mapToBambooColors,
  detectColorDeviation,
  calculateMaterialEstimate,
  validateWeaving,
} from '@/utils/weavingUtils';
import { defaultMonochromeColors, defaultMulticolorPalette } from '@/data/defaultData';

export default function StripesLayout() {
  const navigate = useNavigate();
  const { currentScheme, updateCurrentScheme, setShowDeviation } = useAppStore();
  const { ui: { showDeviation } } = useAppStore();

  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(null);
  const [isAddingColor, setIsAddingColor] = useState(false);
  const [newColor, setNewColor] = useState({ name: '', hex: '#666666' });

  const colors = currentScheme?.colors || [];

  const stats = useMemo(() => {
    if (!currentScheme) return null;
    return currentScheme.materialEstimate;
  }, [currentScheme]);

  const deviationStats = useMemo(() => {
    if (!currentScheme) return { mild: 0, moderate: 0, severe: 0 };

    let mild = 0, moderate = 0, severe = 0;
    currentScheme.pixels.forEach((row) => {
      row.forEach((pixel) => {
        if (pixel.deviationLevel === 'mild') mild++;
        else if (pixel.deviationLevel === 'moderate') moderate++;
        else if (pixel.deviationLevel === 'severe') severe++;
      });
    });

    return { mild, moderate, severe };
  }, [currentScheme]);

  const handleColorChange = (index: number, field: 'name' | 'hex', value: string) => {
    if (!currentScheme) return;

    const newColors = [...currentScheme.colors];
    newColors[index] = { ...newColors[index], [field]: value };

    const pixels = mapToBambooColors(
      currentScheme.pixels.map((row) =>
        row.map((p) => ({
          r: parseInt(currentScheme.colors[p.colorIndex].hex.slice(1, 3), 16),
          g: parseInt(currentScheme.colors[p.colorIndex].hex.slice(3, 5), 16),
          b: parseInt(currentScheme.colors[p.colorIndex].hex.slice(5, 7), 16),
          brightness: p.brightness,
        }))
      ),
      newColors,
      currentScheme.colorMode,
      currentScheme.brightnessThreshold
    );

    const pixelsWithDeviation = detectColorDeviation(pixels);
    const materialEstimate = calculateMaterialEstimate(
      pixelsWithDeviation,
      currentScheme.stripeWidth,
      newColors
    );
    const weavingValidation = validateWeaving(pixelsWithDeviation);

    updateCurrentScheme({
      colors: newColors,
      pixels: pixelsWithDeviation,
      materialEstimate,
      weavingValidation,
    });
  };

  const handleAddColor = () => {
    if (!currentScheme || !newColor.name.trim()) return;

    const color: BambooColor = {
      id: generateId(),
      name: newColor.name,
      hex: newColor.hex,
      category: 'custom',
    };

    const newColors = [...currentScheme.colors, color];

    const pixels = mapToBambooColors(
      currentScheme.pixels.map((row) =>
        row.map((p) => ({
          r: parseInt(currentScheme.colors[p.colorIndex].hex.slice(1, 3), 16),
          g: parseInt(currentScheme.colors[p.colorIndex].hex.slice(3, 5), 16),
          b: parseInt(currentScheme.colors[p.colorIndex].hex.slice(5, 7), 16),
          brightness: p.brightness,
        }))
      ),
      newColors,
      currentScheme.colorMode,
      currentScheme.brightnessThreshold
    );

    const pixelsWithDeviation = detectColorDeviation(pixels);
    const materialEstimate = calculateMaterialEstimate(
      pixelsWithDeviation,
      currentScheme.stripeWidth,
      newColors
    );
    const weavingValidation = validateWeaving(pixelsWithDeviation);

    updateCurrentScheme({
      colors: newColors,
      pixels: pixelsWithDeviation,
      materialEstimate,
      weavingValidation,
    });

    setNewColor({ name: '', hex: '#666666' });
    setIsAddingColor(false);
  };

  const handleDeleteColor = (index: number) => {
    if (!currentScheme || currentScheme.colors.length <= 2) return;

    const newColors = currentScheme.colors.filter((_, i) => i !== index);

    const pixels = mapToBambooColors(
      currentScheme.pixels.map((row) =>
        row.map((p) => ({
          r: parseInt(currentScheme.colors[p.colorIndex].hex.slice(1, 3), 16),
          g: parseInt(currentScheme.colors[p.colorIndex].hex.slice(3, 5), 16),
          b: parseInt(currentScheme.colors[p.colorIndex].hex.slice(5, 7), 16),
          brightness: p.brightness,
        }))
      ),
      newColors,
      currentScheme.colorMode,
      currentScheme.brightnessThreshold
    );

    const pixelsWithDeviation = detectColorDeviation(pixels);
    const materialEstimate = calculateMaterialEstimate(
      pixelsWithDeviation,
      currentScheme.stripeWidth,
      newColors
    );
    const weavingValidation = validateWeaving(pixelsWithDeviation);

    updateCurrentScheme({
      colors: newColors,
      pixels: pixelsWithDeviation,
      materialEstimate,
      weavingValidation,
    });
  };

  const resetToDefault = () => {
    if (!currentScheme) return;

    const defaultColors =
      currentScheme.colorMode === 'monochrome'
        ? defaultMonochromeColors
        : defaultMulticolorPalette;

    const pixels = mapToBambooColors(
      currentScheme.pixels.map((row) =>
        row.map((p) => ({
          r: parseInt(currentScheme.colors[p.colorIndex].hex.slice(1, 3), 16),
          g: parseInt(currentScheme.colors[p.colorIndex].hex.slice(3, 5), 16),
          b: parseInt(currentScheme.colors[p.colorIndex].hex.slice(5, 7), 16),
          brightness: p.brightness,
        }))
      ),
      defaultColors,
      currentScheme.colorMode,
      currentScheme.brightnessThreshold
    );

    const pixelsWithDeviation = detectColorDeviation(pixels);
    const materialEstimate = calculateMaterialEstimate(
      pixelsWithDeviation,
      currentScheme.stripeWidth,
      defaultColors
    );
    const weavingValidation = validateWeaving(pixelsWithDeviation);

    updateCurrentScheme({
      colors: defaultColors,
      pixels: pixelsWithDeviation,
      materialEstimate,
      weavingValidation,
    });
  };

  if (!currentScheme) {
    return (
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="色篾排布"
          subtitle="经纬色篾挑压组合与染色用量规划"
          icon={<Grid3x3 className="w-7 h-7" />}
        />
        <div className="card p-12 text-center">
          <Grid3x3 className="w-16 h-16 mx-auto mb-4 text-parchment-400" />
          <p className="text-ink-500 mb-6">请先在「图像解析」页面上传并处理图像</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            前往图像解析
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="色篾排布"
        subtitle="经纬色篾挑压组合与染色用量规划"
        icon={<Grid3x3 className="w-7 h-7" />}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="btn-secondary flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </button>
            <button
              onClick={() => navigate('/weaving-preview')}
              className="btn-primary flex items-center gap-2"
            >
              挑压成像
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Grid3x3 className="w-5 h-5 text-bamboo-600" />
                <h3 className="font-medium text-ink-800">色篾网格</h3>
              </div>
              <button
                onClick={() => setShowDeviation(!showDeviation)}
                className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg transition-colors ${
                  showDeviation
                    ? 'bg-cinnabar-100 text-cinnabar-700'
                    : 'bg-parchment-100 text-ink-600 hover:bg-parchment-200'
                }`}
              >
                {showDeviation ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {showDeviation ? '显示偏差' : '隐藏偏差'}
              </button>
            </div>
            <div className="p-4 bg-parchment-100/30 flex items-center justify-center overflow-auto min-h-[500px]">
              <div
                className="inline-grid gap-0 border border-parchment-300 shadow-lg"
                style={{
                  gridTemplateColumns: `repeat(${currentScheme.pixelWidth}, 1fr)`,
                }}
              >
                {currentScheme.pixels.map((row, y) =>
                  row.map((pixel, x) => {
                    const color = colors[pixel.colorIndex] || colors[0];
                    return (
                      <div
                        key={`${x}-${y}`}
                        className={`w-2 h-2 sm:w-2.5 sm:h-2.5 relative ${
                          showDeviation && pixel.deviationLevel === 'severe'
                            ? 'animate-pulse-slow'
                            : ''
                        }`}
                        style={{
                          backgroundColor: color.hex,
                          boxShadow: showDeviation && pixel.deviationLevel
                            ? pixel.deviationLevel === 'severe'
                              ? 'inset 0 0 0 1px rgba(217, 58, 50, 0.8)'
                              : pixel.deviationLevel === 'moderate'
                              ? 'inset 0 0 0 1px rgba(217, 58, 50, 0.5)'
                              : 'inset 0 0 0 1px rgba(217, 58, 50, 0.2)'
                            : 'none',
                        }}
                        title={`位置(${x}, ${y})：${color.name}${
                          pixel.deviationLevel ? ` (偏差: ${pixel.deviationLevel})` : ''
                        }`}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-bamboo-600" />
                <h3 className="font-medium text-ink-800">色篾调色板</h3>
              </div>
              <button
                onClick={resetToDefault}
                className="text-xs text-ink-500 hover:text-bamboo-600"
              >
                重置
              </button>
            </div>
            <div className="p-4 space-y-3">
              {colors.map((color, index) => (
                <div
                  key={color.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedColorIndex === index
                      ? 'border-bamboo-400 bg-bamboo-50'
                      : 'border-parchment-200 hover:border-parchment-300 bg-white'
                  }`}
                  onClick={() => setSelectedColorIndex(
                    selectedColorIndex === index ? null : index
                  )}
                >
                  <div
                    className="w-10 h-10 rounded-lg border border-parchment-300 flex-shrink-0 shadow-inner"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-ink-800 text-sm truncate">
                      {color.name}
                    </div>
                    <div className="text-xs text-ink-400 uppercase">{color.hex}</div>
                  </div>
                  {colors.length > 2 && color.category === 'custom' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteColor(index);
                      }}
                      className="p-1 text-ink-400 hover:text-cinnabar-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              {selectedColorIndex !== null && (
                <div className="p-3 bg-parchment-50 rounded-lg border border-parchment-200 space-y-3">
                  <div>
                    <label className="text-xs text-ink-500 block mb-1">颜色名称</label>
                    <input
                      type="text"
                      value={colors[selectedColorIndex].name}
                      onChange={(e) =>
                        handleColorChange(selectedColorIndex, 'name', e.target.value)
                      }
                      className="input-field text-sm py-2"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-ink-500 block mb-1">色值</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={colors[selectedColorIndex].hex}
                        onChange={(e) =>
                          handleColorChange(selectedColorIndex, 'hex', e.target.value)
                        }
                        className="w-10 h-10 rounded-lg cursor-pointer border border-parchment-300"
                      />
                      <input
                        type="text"
                        value={colors[selectedColorIndex].hex}
                        onChange={(e) =>
                          handleColorChange(selectedColorIndex, 'hex', e.target.value)
                        }
                        className="flex-1 input-field text-sm py-2 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {!isAddingColor ? (
                <button
                  onClick={() => setIsAddingColor(true)}
                  className="w-full py-2.5 border-2 border-dashed border-parchment-300 rounded-lg text-ink-500 hover:border-bamboo-400 hover:text-bamboo-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  添加自定义色篾
                </button>
              ) : (
                <div className="p-3 bg-parchment-50 rounded-lg border border-parchment-200 space-y-3">
                  <div>
                    <label className="text-xs text-ink-500 block mb-1">颜色名称</label>
                    <input
                      type="text"
                      value={newColor.name}
                      onChange={(e) =>
                        setNewColor({ ...newColor, name: e.target.value })
                      }
                      placeholder="如：藏青篾"
                      className="input-field text-sm py-2"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-ink-500 block mb-1">色值</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={newColor.hex}
                        onChange={(e) =>
                          setNewColor({ ...newColor, hex: e.target.value })
                        }
                        className="w-10 h-10 rounded-lg cursor-pointer border border-parchment-300"
                      />
                      <input
                        type="text"
                        value={newColor.hex}
                        onChange={(e) =>
                          setNewColor({ ...newColor, hex: e.target.value })
                        }
                        className="flex-1 input-field text-sm py-2 font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddColor}
                      className="flex-1 btn-primary py-2 text-sm"
                    >
                      添加
                    </button>
                    <button
                      onClick={() => setIsAddingColor(false)}
                      className="flex-1 btn-secondary py-2 text-sm"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {stats && (
            <div className="card">
              <div className="card-header flex items-center gap-2">
                <Ruler className="w-5 h-5 text-bamboo-600" />
                <h3 className="font-medium text-ink-800">用料估算</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-ink-500">经篾总长度</span>
                  <span className="font-medium text-ink-800">
                    {stats.totalWarpLength.toFixed(2)} 米
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-ink-500">纬篾总长度</span>
                  <span className="font-medium text-ink-800">
                    {stats.totalWeftLength.toFixed(2)} 米
                  </span>
                </div>
                <div className="decoration-line" />
                <div className="flex justify-between items-center">
                  <span className="text-ink-700 font-medium">合计</span>
                  <span className="font-bold text-bamboo-700 text-lg">
                    {stats.totalLength.toFixed(2)} 米
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-cinnabar-600" />
              <h3 className="font-medium text-ink-800">色差偏差检测</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-500">轻度偏差</span>
                <span className="text-cinnabar-500 font-medium">
                  {deviationStats.mild} 处
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-500">中度偏差</span>
                <span className="text-cinnabar-600 font-medium">
                  {deviationStats.moderate} 处
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-500">重度偏差</span>
                <span className="text-cinnabar-700 font-medium">
                  {deviationStats.severe} 处
                </span>
              </div>
              <div className="decoration-line" />
              <p className="text-xs text-ink-400">
                色差偏差可能由染色不均引起，重度偏差区域建议在编织前调整色篾配比
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
