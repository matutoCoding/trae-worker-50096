import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Eye,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Move,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Save,
  FileText,
  Layers,
  X,
  Tag,
  Calendar,
  Star,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import { useAppStore } from '@/store/useAppStore';
import { renderWeavingCanvas } from '@/utils/weavingUtils';
import { generateId } from '@/utils/colorUtils';
import { CraftArchive } from '@/types';
import { materialTypes } from '@/data/defaultData';

export default function WeavingPreview() {
  const navigate = useNavigate();
  const {
    currentScheme,
    ui,
    setViewMode,
    setZoomLevel,
    addArchive,
  } = useAppStore();
  const { viewMode, zoomLevel, showDeviation } = ui;

  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0 });

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveForm, setSaveForm] = useState({
    title: '',
    description: '',
    tags: '',
    material: 'phyllostachys-pubescens',
    thickness: 0.8,
    difficulty: 2,
    estimatedHours: 40,
    notes: '',
  });

  const renderedCanvas = useMemo(() => {
    if (!currentScheme) return null;
    return renderWeavingCanvas(
      currentScheme.pixels,
      currentScheme.colors,
      viewMode,
      currentScheme.stripeWidth,
      showDeviation
    );
  }, [currentScheme, viewMode, showDeviation]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.5, Math.min(5, zoomLevel + delta));
    setZoomLevel(newZoom);
  };

  const resetView = () => {
    setPosition({ x: 0, y: 0 });
    setZoomLevel(1);
  };

  const handleZoomIn = () => {
    setZoomLevel(Math.min(5, zoomLevel + 0.2));
  };

  const handleZoomOut = () => {
    setZoomLevel(Math.max(0.5, zoomLevel - 0.2));
  };

  const handleSaveArchive = () => {
    if (!currentScheme) return;
    if (!saveForm.title.trim()) {
      alert('请输入作品名称');
      return;
    }

    const thumbCanvas = renderWeavingCanvas(
      currentScheme.pixels,
      currentScheme.colors,
      'far',
      currentScheme.stripeWidth
    );

    const archive: CraftArchive = {
      id: generateId(),
      title: saveForm.title,
      description: saveForm.description,
      tags: saveForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
      scheme: currentScheme,
      craftParams: {
        material: saveForm.material,
        thickness: saveForm.thickness,
        difficulty: saveForm.difficulty,
        estimatedHours: saveForm.estimatedHours,
      },
      notes: saveForm.notes,
      thumbnail: thumbCanvas.toDataURL('image/png'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addArchive(archive);
    setShowSaveModal(false);
    setSaveForm({
      title: '',
      description: '',
      tags: '',
      material: 'phyllostachys-pubescens',
      thickness: 0.8,
      difficulty: 2,
      estimatedHours: 40,
      notes: '',
    });
    navigate('/archives');
  };

  const validation = currentScheme?.weavingValidation;

  const riskColor = {
    low: 'text-green-600 bg-green-50',
    medium: 'text-yellow-600 bg-yellow-50',
    high: 'text-red-600 bg-red-50',
  };

  const riskLabel = {
    low: '低风险',
    medium: '中风险',
    high: '高风险',
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-') handleZoomOut();
      if (e.key === '0') resetView();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomLevel]);

  if (!currentScheme) {
    return (
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="挑压成像"
          subtitle="远观近看模拟与编织可行性校验"
          icon={<Eye className="w-7 h-7" />}
        />
        <div className="card p-12 text-center">
          <Eye className="w-16 h-16 mx-auto mb-4 text-parchment-400" />
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

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      <PageHeader
        title="挑压成像"
        subtitle="远观近看模拟与编织可行性校验"
        icon={<Eye className="w-7 h-7" />}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/stripes-layout')}
              className="btn-secondary flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </button>
            <button className="btn-secondary flex items-center gap-2">
              <Download className="w-4 h-4" />
              导出方案
            </button>
            <button
              onClick={() => setShowSaveModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              保存为档案
            </button>
          </div>
        }
      />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        <div className="lg:col-span-3 flex flex-col min-h-0">
          <div className="card flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="card-header flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-bamboo-600" />
                <h3 className="font-medium text-ink-800">编织模拟</h3>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-parchment-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('far')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                      viewMode === 'far'
                        ? 'bg-white text-bamboo-700 shadow-sm'
                        : 'text-ink-500 hover:text-ink-700'
                    }`}
                  >
                    远观
                  </button>
                  <button
                    onClick={() => setViewMode('near')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                      viewMode === 'near'
                        ? 'bg-white text-bamboo-700 shadow-sm'
                        : 'text-ink-500 hover:text-ink-700'
                    }`}
                  >
                    近看
                  </button>
                </div>

                <div className="flex items-center gap-1 bg-parchment-100 rounded-lg p-1">
                  <button
                    onClick={handleZoomOut}
                    className="p-2 rounded-md text-ink-500 hover:text-ink-700 hover:bg-white transition-all"
                    title="缩小"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-ink-600 min-w-[3rem] text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="p-2 rounded-md text-ink-500 hover:text-ink-700 hover:bg-white transition-all"
                    title="放大"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={resetView}
                    className="p-2 rounded-md text-ink-500 hover:text-ink-700 hover:bg-white transition-all"
                    title="重置视图"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div
              ref={canvasRef}
              className={`flex-1 overflow-hidden bg-parchment-100/50 relative ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                }}
              >
                {renderedCanvas && (
                  <img
                    src={renderedCanvas.toDataURL('image/png')}
                    alt="编织模拟"
                    className="max-w-none shadow-2xl rounded-sm"
                    style={{ imageRendering: viewMode === 'near' ? 'pixelated' : 'auto' }}
                  />
                )}
              </div>

              <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs text-ink-400">
                <Move className="w-4 h-4" />
                拖拽平移 · 滚轮缩放 · ±键缩放 · 0键重置
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 overflow-y-auto scrollbar-thin">
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-bamboo-600" />
              <h3 className="font-medium text-ink-800">编织校验</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-600">边缘闭合性</span>
                <span
                  className={`flex items-center gap-1.5 text-sm font-medium ${
                    validation?.edgeClosure
                      ? 'text-green-600'
                      : 'text-cinnabar-600'
                  }`}
                >
                  {validation?.edgeClosure ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  {validation?.edgeClosure ? '良好' : '需调整'}
                </span>
              </div>

              {validation?.edgeIssues && validation.edgeIssues.length > 0 && (
                <div className="p-3 bg-cinnabar-50 rounded-lg border border-cinnabar-200">
                  {validation.edgeIssues.map((issue, i) => (
                    <p key={i} className="text-xs text-cinnabar-700">
                      · {issue}
                    </p>
                  ))}
                </div>
              )}

              <div className="decoration-line" />

              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-600">错位风险</span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    riskColor[validation?.misalignmentRisk || 'low']
                  }`}
                >
                  {riskLabel[validation?.misalignmentRisk || 'low']}
                </span>
              </div>

              {validation?.misalignmentAreas &&
                validation.misalignmentAreas.length > 0 && (
                  <div className="text-xs text-ink-500">
                    检测到 {validation.misalignmentAreas.length} 处高风险区域
                  </div>
                )}
            </div>
          </div>

          <div className="card">
            <div className="card-header flex items-center gap-2">
              <FileText className="w-5 h-5 text-bamboo-600" />
              <h3 className="font-medium text-ink-800">方案信息</h3>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-500">经篾数量</span>
                <span className="text-ink-800 font-medium">
                  {currentScheme.pixelWidth} 根
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">纬篾数量</span>
                <span className="text-ink-800 font-medium">
                  {currentScheme.pixelHeight} 根
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">篾宽</span>
                <span className="text-ink-800 font-medium">
                  {currentScheme.stripeWidth} mm
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">色彩模式</span>
                <span className="text-ink-800 font-medium">
                  {currentScheme.colorMode === 'monochrome' ? '黑白' : '多色'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">色篾种类</span>
                <span className="text-ink-800 font-medium">
                  {currentScheme.colors.length} 种
                </span>
              </div>
              <div className="decoration-line" />
              <div className="flex justify-between">
                <span className="text-ink-500">总用料</span>
                <span className="text-bamboo-700 font-bold">
                  {currentScheme.materialEstimate.totalLength.toFixed(2)} 米
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-cinnabar-600" />
              <h3 className="font-medium text-ink-800">注意事项</h3>
            </div>
            <div className="p-4 space-y-2 text-xs text-ink-600">
              <p>· 建议使用同一批次染色的篾条，以减少色差</p>
              <p>· 编织时注意保持经篾张力一致</p>
              <p>· 细节丰富区域建议适当放大篾宽</p>
              <p>· 高错位风险区域可考虑简化设计</p>
            </div>
          </div>
        </div>
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 bg-ink-900/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="card-header flex items-center justify-between">
              <h3 className="font-medium text-ink-800">保存为工艺档案</h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="p-1 text-ink-400 hover:text-ink-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="text-sm font-medium text-ink-700 block mb-1.5">
                  作品名称 *
                </label>
                <input
                  type="text"
                  value={saveForm.title}
                  onChange={(e) => setSaveForm({ ...saveForm, title: e.target.value })}
                  className="input-field"
                  placeholder="如：山居秋暝竹编画"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-ink-700 block mb-1.5">
                  作品描述
                </label>
                <textarea
                  value={saveForm.description}
                  onChange={(e) => setSaveForm({ ...saveForm, description: e.target.value })}
                  className="input-field min-h-[70px] resize-none"
                  placeholder="描述作品的主题、创意、灵感来源等"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-ink-700 block mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-4 h-4" />
                  标签（用逗号分隔）
                </label>
                <input
                  type="text"
                  value={saveForm.tags}
                  onChange={(e) => setSaveForm({ ...saveForm, tags: e.target.value })}
                  className="input-field"
                  placeholder="如：山水, 传统, 精品"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-ink-700 block mb-1.5">
                    竹材种类
                  </label>
                  <select
                    value={saveForm.material}
                    onChange={(e) => setSaveForm({ ...saveForm, material: e.target.value })}
                    className="input-field"
                  >
                    {materialTypes.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-ink-700 block mb-1.5">
                    篾厚 (mm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.2"
                    value={saveForm.thickness}
                    onChange={(e) =>
                      setSaveForm({ ...saveForm, thickness: parseFloat(e.target.value) || 0.8 })
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-ink-700 block mb-1.5">
                    难度等级
                  </label>
                  <div className="flex items-center gap-1 pt-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setSaveForm({ ...saveForm, difficulty: level })}
                        className="p-1"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            level <= saveForm.difficulty
                              ? 'text-parchment-500 fill-parchment-500'
                              : 'text-parchment-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-ink-700 block mb-1.5">
                    预估工时 (小时)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={saveForm.estimatedHours}
                    onChange={(e) =>
                      setSaveForm({
                        ...saveForm,
                        estimatedHours: parseInt(e.target.value) || 40,
                      })
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-ink-700 block mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  创作笔记
                </label>
                <textarea
                  value={saveForm.notes}
                  onChange={(e) => setSaveForm({ ...saveForm, notes: e.target.value })}
                  className="input-field min-h-[80px] resize-none"
                  placeholder="记录编织过程中的心得、技巧、遇到的问题及解决方法等"
                />
              </div>
            </div>
            <div className="card-header flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => setShowSaveModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleSaveArchive}
                className="btn-primary flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                保存档案
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
