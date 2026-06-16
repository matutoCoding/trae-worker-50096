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
  List,
  ChevronDown,
  ChevronUp,
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
import {
  analyzeWarpSequences,
  analyzeWeftSequences,
  calculateColorSegmentSummary,
  StripeSequence,
} from '@/utils/sequenceUtils';
import { defaultMonochromeColors, defaultMulticolorPalette } from '@/data/defaultData';

type SequenceTab = 'warp' | 'weft' | 'summary';

export default function StripesLayout() {
  const navigate = useNavigate();
  const { currentScheme, updateCurrentScheme, setShowDeviation } = useAppStore();
  const { ui: { showDeviation } } = useAppStore();

  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(null);
  const [isAddingColor, setIsAddingColor] = useState(false);
  const [newColor, setNewColor] = useState({ name: '', hex: '#666666' });

  const [sequenceTab, setSequenceTab] = useState<SequenceTab>('summary');
  const [expandedStripe, setExpandedStripe] = useState<number | null>(null);

  const colors = useMemo(() => currentScheme?.colors || [], [currentScheme]);

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

  const warpSequences = useMemo(() => {
    if (!currentScheme) return [] as StripeSequence[];
    return analyzeWarpSequences(currentScheme.pixels, colors);
  }, [currentScheme, colors]);

  const weftSequences = useMemo(() => {
    if (!currentScheme) return [] as StripeSequence[];
    return analyzeWeftSequences(currentScheme.pixels, colors);
  }, [currentScheme, colors]);

  const warpSummary = useMemo(() => {
    if (!currentScheme) return new Map();
    return calculateColorSegmentSummary(warpSequences, currentScheme.stripeWidth);
  }, [warpSequences, currentScheme]);

  const weftSummary = useMemo(() => {
    if (!currentScheme) return new Map();
    return calculateColorSegmentSummary(weftSequences, currentScheme.stripeWidth);
  }, [weftSequences, currentScheme]);

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
          <p className="text-ink-500 mb-6">请先在「图像解析」页面上传并处理图像，或从模板库选择一个模板</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => navigate('/')} className="btn-primary">
              前往图像解析
            </button>
            <button onClick={() => navigate('/templates')} className="btn-secondary">
              浏览模板库
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeSequences = sequenceTab === 'warp' ? warpSequences : weftSequences;
  const sequenceLabel = sequenceTab === 'warp' ? '经篾' : '纬篾';

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
        <div className="lg:col-span-2 space-y-6">
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
            <div className="p-4 bg-parchment-100/30 flex items-center justify-center overflow-auto min-h-[400px]">
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

          <div className="card">
            <div className="card-header flex items-center gap-2">
              <List className="w-5 h-5 text-bamboo-600" />
              <h3 className="font-medium text-ink-800">色篾排布序列</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-1 bg-parchment-100 rounded-lg p-1">
                <button
                  onClick={() => setSequenceTab('summary')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    sequenceTab === 'summary'
                      ? 'bg-white text-bamboo-700 shadow-sm'
                      : 'text-ink-500 hover:text-ink-700'
                  }`}
                >
                  染色用量总览
                </button>
                <button
                  onClick={() => setSequenceTab('warp')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    sequenceTab === 'warp'
                      ? 'bg-white text-bamboo-700 shadow-sm'
                      : 'text-ink-500 hover:text-ink-700'
                  }`}
                >
                  经篾序列 ({warpSequences.length}根)
                </button>
                <button
                  onClick={() => setSequenceTab('weft')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    sequenceTab === 'weft'
                      ? 'bg-white text-bamboo-700 shadow-sm'
                      : 'text-ink-500 hover:text-ink-700'
                  }`}
                >
                  纬篾序列 ({weftSequences.length}根)
                </button>
              </div>

              {sequenceTab === 'summary' ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-ink-700 mb-3">经篾染色用量</h4>
                    <div className="space-y-2">
                      {colors.map((color) => {
                        const stat = warpSummary.get(color.hex);
                        if (!stat) return null;
                        return (
                          <div
                            key={color.id}
                            className="flex items-center gap-3 p-2 bg-parchment-50 rounded-lg"
                          >
                            <div
                              className="w-8 h-8 rounded border border-parchment-300 flex-shrink-0"
                              style={{ backgroundColor: color.hex }}
                            />
                            <div className="flex-1">
                              <div className="font-medium text-sm text-ink-700">{color.name}</div>
                              <div className="text-xs text-ink-400">
                                {stat.totalSegments} 段色 · 累计 {stat.totalLength} 格
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-bamboo-700 font-bold">{stat.totalMeters.toFixed(2)} m</div>
                              <div className="text-xs text-ink-400">需要染色长度</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="decoration-line" />

                  <div>
                    <h4 className="text-sm font-medium text-ink-700 mb-3">纬篾染色用量</h4>
                    <div className="space-y-2">
                      {colors.map((color) => {
                        const stat = weftSummary.get(color.hex);
                        if (!stat) return null;
                        return (
                          <div
                            key={color.id}
                            className="flex items-center gap-3 p-2 bg-parchment-50 rounded-lg"
                          >
                            <div
                              className="w-8 h-8 rounded border border-parchment-300 flex-shrink-0"
                              style={{ backgroundColor: color.hex }}
                            />
                            <div className="flex-1">
                              <div className="font-medium text-sm text-ink-700">{color.name}</div>
                              <div className="text-xs text-ink-400">
                                {stat.totalSegments} 段色 · 累计 {stat.totalLength} 格
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-bamboo-700 font-bold">{stat.totalMeters.toFixed(2)} m</div>
                              <div className="text-xs text-ink-400">需要染色长度</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-3 bg-bamboo-50 rounded-lg border border-bamboo-100">
                    <p className="text-xs text-ink-500">
                      💡 <span className="font-medium">备料提示：</span>
                      以上为理论计算长度，实际备料时建议增加 15-20% 的余量，以应对编织损耗和截断。
                      多段色同色可合并染色，减少换色次数。
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 max-h-[450px] overflow-y-auto scrollbar-thin pr-1">
                  <p className="text-xs text-ink-400 mb-3">
                    {sequenceLabel}从左到右/从上到下排列，点击展开查看该根篾的连续色段分布
                  </p>
                  {activeSequences.slice(0, 50).map((seq) => {
                    const isExpanded = expandedStripe === seq.index;
                    return (
                      <div
                        key={seq.index}
                        className="border border-parchment-200 rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedStripe(isExpanded ? null : seq.index)}
                          className="w-full flex items-center gap-2 p-2.5 bg-parchment-50 hover:bg-parchment-100 transition-colors"
                        >
                          <span className="w-16 text-sm font-medium text-ink-500 flex-shrink-0">
                            {sequenceLabel}第 {seq.index + 1} 根
                          </span>
                          <div className="flex-1 flex gap-0.5">
                            {seq.segments.slice(0, 20).map((seg, i) => (
                              <div
                                key={i}
                                className="h-5 rounded-sm"
                                style={{
                                  backgroundColor: seg.colorHex,
                                  flex: seg.length,
                                  minWidth: '4px',
                                }}
                                title={`${seg.colorName}: ${seg.length}格`}
                              />
                            ))}
                            {seq.segments.length > 20 && (
                              <span className="text-xs text-ink-400 self-center ml-1">
                                +{seq.segments.length - 20}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-ink-400 flex-shrink-0 w-20 text-right">
                            {seq.segments.length} 段色
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-ink-400 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-ink-400 flex-shrink-0" />
                          )}
                        </button>
                        {isExpanded && (
                          <div className="p-3 bg-white border-t border-parchment-200 space-y-1.5">
                            {seq.segments.map((seg, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-parchment-50"
                              >
                                <div
                                  className="w-6 h-6 rounded border border-parchment-300 flex-shrink-0"
                                  style={{ backgroundColor: seg.colorHex }}
                                />
                                <div className="flex-1">
                                  <span className="text-sm font-medium text-ink-700">
                                    {seg.colorName}
                                  </span>
                                </div>
                                <div className="text-xs text-ink-500">
                                  位置 {seg.start + 1} - {seg.end + 1}
                                </div>
                                <div className="text-sm font-medium text-bamboo-700 w-20 text-right">
                                  {seg.length} 格
                                </div>
                                <div className="text-xs text-ink-400 w-20 text-right">
                                  {((seg.length * currentScheme.stripeWidth) / 1000).toFixed(3)} m
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {activeSequences.length > 50 && (
                    <p className="text-center text-xs text-ink-400 py-2">
                      仅显示前 50 根{sequenceLabel}，共 {activeSequences.length} 根
                    </p>
                  )}
                </div>
              )}
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
