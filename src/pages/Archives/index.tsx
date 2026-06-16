import { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Tag,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  X,
  Save,
  Layers,
  Ruler,
  Star,
  Play,
  ExternalLink,
  Printer,
  Copy,
  CheckSquare,
  Square,
  ClipboardList,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import { useAppStore } from '@/store/useAppStore';
import { CraftArchive, Template, WorkOrderStatus } from '@/types';
import { generateId, formatDate } from '@/utils/colorUtils';
import { materialTypes, defaultProcessSteps, templateCategories } from '@/data/defaultData';
import { renderWeavingCanvas } from '@/utils/weavingUtils';
import CraftOrder from '@/components/CraftOrder';

const statusConfig: Record<WorkOrderStatus, { label: string; color: string; bg: string }> = {
  pending: { label: '待开工', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
  in_progress: { label: '制作中', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  completed: { label: '已完成', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
};

export default function Archives() {
  const navigate = useNavigate();
  const {
    archives,
    addArchive,
    updateArchive,
    deleteArchive,
    currentScheme,
    setCurrentScheme,
    addTemplate,
    setWorkOrderStatus,
    toggleProcessStep,
    updateProcessStepNote,
  } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArchiveId, setSelectedArchiveId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<CraftArchive>>({});
  const [craftOrderMode, setCraftOrderMode] = useState<'archive' | 'current' | null>(null);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertForm, setConvertForm] = useState({
    name: '',
    category: 'pattern',
    description: '',
    difficulty: 2,
  });

  const selectedArchive = selectedArchiveId
    ? archives.find((a) => a.id === selectedArchiveId) ?? null
    : null;

  useEffect(() => {
    if (archives.length > 0 && !selectedArchiveId) {
      setSelectedArchiveId(archives[0].id);
    }
  }, [archives, selectedArchiveId]);

  const filteredArchives = archives.filter(
    (archive) =>
      archive.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      archive.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      archive.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateFromCurrent = () => {
    if (!currentScheme) {
      alert('请先在图像解析页生成一个编织方案');
      navigate('/');
      return;
    }

    const thumbCanvas = renderWeavingCanvas(
      currentScheme.pixels,
      currentScheme.colors,
      'far',
      currentScheme.stripeWidth
    );

    const newArchive: CraftArchive = {
      id: generateId(),
      title: '',
      description: '',
      tags: [],
      scheme: currentScheme,
      craftParams: {
        material: 'phyllostachys-pubescens',
        thickness: 0.8,
        difficulty: 2,
        estimatedHours: 40,
      },
      notes: '',
      thumbnail: thumbCanvas.toDataURL('image/png'),
      workOrderStatus: 'pending' as const,
      processSteps: defaultProcessSteps.map((s) => ({ ...s, id: generateId() })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEditForm(newArchive);
    setIsEditing(true);
    setShowCreateModal(true);
  };

  const handleSave = () => {
    if (!editForm.title?.trim()) {
      alert('请输入作品名称');
      return;
    }

    if (editForm.id && archives.some((a) => a.id === editForm.id)) {
      updateArchive(editForm.id, editForm);
      setSelectedArchiveId(editForm.id);
    } else {
      const newArchive = editForm as CraftArchive;
      if (!newArchive.id) {
        newArchive.id = generateId();
      }
      newArchive.createdAt = newArchive.createdAt || new Date().toISOString();
      newArchive.updatedAt = new Date().toISOString();
      if (!newArchive.workOrderStatus) {
        newArchive.workOrderStatus = 'pending';
      }
      if (!newArchive.processSteps || newArchive.processSteps.length === 0) {
        newArchive.processSteps = defaultProcessSteps.map((s) => ({ ...s, id: generateId() }));
      }
      addArchive(newArchive);
      setSelectedArchiveId(newArchive.id);
    }

    setShowCreateModal(false);
    setIsEditing(false);
    setEditForm({});
  };

  const handleEdit = (archive: CraftArchive) => {
    setSelectedArchiveId(archive.id);
    setEditForm(archive);
    setIsEditing(true);
    setShowCreateModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个工艺档案吗？')) {
      deleteArchive(id);
      if (selectedArchiveId === id) {
        setSelectedArchiveId(archives.length > 1 ? archives.find((a) => a.id !== id)?.id ?? null : null);
      }
    }
  };

  const handleView = (archive: CraftArchive) => {
    setSelectedArchiveId(archive.id);
    setIsEditing(false);
  };

  const handleConvertToTemplate = () => {
    if (!selectedArchive) return;
    setConvertForm({
      name: selectedArchive.title,
      category: 'pattern',
      description: selectedArchive.description,
      difficulty: selectedArchive.craftParams.difficulty,
    });
    setShowConvertModal(true);
  };

  const handleSaveTemplate = () => {
    if (!selectedArchive) return;
    if (!convertForm.name.trim()) {
      alert('请输入模板名称');
      return;
    }

    const newTemplate: Template = {
      id: generateId(),
      name: convertForm.name,
      category: convertForm.category,
      description: convertForm.description,
      thumbnail: selectedArchive.thumbnail,
      scheme: selectedArchive.scheme,
      isFavorite: false,
      usageCount: 0,
      difficulty: convertForm.difficulty,
      createdAt: new Date().toISOString(),
    };

    addTemplate(newTemplate);
    setShowConvertModal(false);
    alert('模板已保存到「' + templateCategories.find((c) => c.id === convertForm.category)?.name + '」分类');
  };

  const getMaterialName = (id: string) => {
    return materialTypes.find((m) => m.id === id)?.name || id;
  };

  const renderDifficultyStars = (level: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < level ? 'text-parchment-500 fill-parchment-500' : 'text-parchment-200'
        }`}
      />
    ));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="工艺档案"
        subtitle="记录和管理每一幅竹编作品的工艺档案"
        icon={<FileText className="w-7 h-7" />}
        actions={
          <div className="flex items-center gap-3">
            {currentScheme && (
              <button
                onClick={() => setCraftOrderMode('current')}
                className="btn-secondary flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                当前方案出单
              </button>
            )}
            <button
              onClick={handleCreateFromCurrent}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              新建档案
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="card sticky top-6">
            <div className="card-header">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  type="text"
                  placeholder="搜索档案..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 py-2 text-sm"
                />
              </div>
            </div>
            <div className="p-2 max-h-[60vh] overflow-y-auto scrollbar-thin">
              {filteredArchives.length === 0 ? (
                <div className="py-12 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-parchment-300" />
                  <p className="text-sm text-ink-400">暂无档案</p>
                  <p className="text-xs text-ink-400 mt-1">点击上方按钮新建</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredArchives.map((archive) => {
                    const status = archive.workOrderStatus || 'pending';
                    const cfg = statusConfig[status];
                    return (
                      <div
                        key={archive.id}
                        onClick={() => handleView(archive)}
                        className={`p-3 rounded-lg cursor-pointer transition-all border ${
                          selectedArchiveId === archive.id
                            ? 'border-bamboo-400 bg-bamboo-50'
                            : 'border-transparent hover:bg-parchment-100'
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className="w-14 h-14 rounded-lg bg-parchment-200 overflow-hidden flex-shrink-0">
                            <img
                              src={archive.thumbnail}
                              alt={archive.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-ink-800 text-sm truncate">
                                {archive.title}
                              </h4>
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded border ${cfg.bg} ${cfg.color} flex-shrink-0`}
                              >
                                {cfg.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-ink-400 mt-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(archive.createdAt).split(' ')[0]}
                            </div>
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {archive.tags.slice(0, 2).map((tag, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 bg-parchment-100 text-ink-500 text-xs rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {selectedArchive ? (
            <div className="card">
              <div className="card-header flex items-center justify-between">
                <h3 className="font-medium text-ink-800">{selectedArchive.title}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCraftOrderMode('archive')}
                    className="btn-secondary flex items-center gap-1.5 text-sm py-1.5 px-3"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    制作单
                  </button>
                  <button
                    onClick={handleConvertToTemplate}
                    className="btn-secondary flex items-center gap-1.5 text-sm py-1.5 px-3"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    转为模板
                  </button>
                  <button
                    onClick={() => {
                      setCurrentScheme(selectedArchive.scheme);
                      navigate('/weaving-preview');
                    }}
                    className="btn-secondary flex items-center gap-1.5 text-sm py-1.5 px-3"
                  >
                    <Play className="w-3.5 h-3.5" />
                    查看模拟
                  </button>
                  <button
                    onClick={() => {
                      setCurrentScheme(selectedArchive.scheme);
                      navigate('/');
                    }}
                    className="btn-secondary flex items-center gap-1.5 text-sm py-1.5 px-3"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    继续编辑
                  </button>
                  <button
                    onClick={() => handleEdit(selectedArchive)}
                    className="p-2 text-ink-500 hover:text-bamboo-600 hover:bg-bamboo-50 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(selectedArchive.id)}
                    className="p-2 text-ink-500 hover:text-cinnabar-600 hover:bg-cinnabar-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-parchment-100 mb-4">
                      <img
                        src={selectedArchive.thumbnail}
                        alt={selectedArchive.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-ink-500 block mb-1">作品描述</label>
                        <p className="text-sm text-ink-700">
                          {selectedArchive.description || '暂无描述'}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm text-ink-500 block mb-2">标签</label>
                        <div className="flex flex-wrap gap-2">
                          {selectedArchive.tags.length > 0 ? (
                            selectedArchive.tags.map((tag, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-bamboo-50 text-bamboo-700 text-sm rounded-full"
                              >
                                <Tag className="w-3 h-3" />
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-ink-400">暂无标签</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-ink-800 mb-3 flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-bamboo-600" />
                        工艺参数
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-ink-500">竹材种类</span>
                          <span className="text-ink-800 font-medium">
                            {getMaterialName(selectedArchive.craftParams.material)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink-500">篾厚</span>
                          <span className="text-ink-800 font-medium">
                            {selectedArchive.craftParams.thickness} mm
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink-500">难度等级</span>
                          <div className="flex items-center gap-0.5">
                            {renderDifficultyStars(selectedArchive.craftParams.difficulty)}
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink-500">预估工时</span>
                          <span className="text-ink-800 font-medium">
                            {selectedArchive.craftParams.estimatedHours} 小时
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="decoration-line" />

                    <div>
                      <h4 className="font-medium text-ink-800 mb-3 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-bamboo-600" />
                        方案信息
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-ink-500">色彩模式</span>
                          <span className="text-ink-800">
                            {selectedArchive.scheme.colorMode === 'monochrome'
                              ? '黑白'
                              : '多色'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink-500">分辨率</span>
                          <span className="text-ink-800">
                            {selectedArchive.scheme.pixelWidth} ×{' '}
                            {selectedArchive.scheme.pixelHeight}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink-500">篾宽</span>
                          <span className="text-ink-800">
                            {selectedArchive.scheme.stripeWidth} mm
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink-500">总用料</span>
                          <span className="text-bamboo-700 font-medium">
                            {selectedArchive.scheme.materialEstimate.totalLength.toFixed(2)}{' '}
                            米
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="decoration-line" />

                    <div>
                      <h4 className="font-medium text-ink-800 mb-3 flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-bamboo-600" />
                        工单状态
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          {(['pending', 'in_progress', 'completed'] as WorkOrderStatus[]).map(
                            (s) => {
                              const cfg = statusConfig[s];
                              const isActive = (selectedArchive.workOrderStatus || 'pending') === s;
                              return (
                                <button
                                  key={s}
                                  onClick={() => setWorkOrderStatus(selectedArchive.id, s)}
                                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                                    isActive
                                      ? `${cfg.bg} ${cfg.color} ring-1 ring-current`
                                      : 'border-parchment-200 text-ink-400 hover:bg-parchment-50'
                                  }`}
                                >
                                  {cfg.label}
                                </button>
                              );
                            }
                          )}
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-ink-500 mb-1">
                            <span>工序进度</span>
                            <span>
                              {selectedArchive.processSteps?.filter((s) => s.completed).length ?? 0} /{' '}
                              {selectedArchive.processSteps?.length ?? 0}
                            </span>
                          </div>
                          <div className="h-2 bg-parchment-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-bamboo-500 rounded-full transition-all duration-300"
                              style={{
                                width: `${
                                  selectedArchive.processSteps?.length
                                    ? (selectedArchive.processSteps.filter((s) => s.completed).length /
                                        selectedArchive.processSteps.length) *
                                      100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                        {(() => {
                          const steps = selectedArchive.processSteps ?? [];
                          const lastNote = [...steps].reverse().find((s) => s.note);
                          const lastDone = [...steps].reverse().find((s) => s.completed);
                          const activity = lastNote || lastDone;
                          if (!activity) return null;
                          return (
                            <div className="text-xs text-ink-400">
                              <span className="text-ink-500">最近动态：</span>
                              {activity.name}
                              {activity.completedAt && ` · ${formatDate(activity.completedAt)}`}
                              {activity.note && ` — ${activity.note}`}
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="decoration-line" />

                    <div>
                      <h4 className="font-medium text-ink-800 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-bamboo-600" />
                        创建时间
                      </h4>
                      <p className="text-sm text-ink-600">
                        {formatDate(selectedArchive.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedArchive.notes && (
                  <div className="mt-6 pt-6 border-t border-parchment-200">
                    <h4 className="font-medium text-ink-800 mb-3">创作笔记</h4>
                    <p className="text-sm text-ink-600 whitespace-pre-wrap">
                      {selectedArchive.notes}
                    </p>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-parchment-200">
                  <h4 className="font-medium text-ink-800 mb-4 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-bamboo-600" />
                    工序记录
                  </h4>
                  <div className="space-y-3">
                    {(selectedArchive.processSteps ?? []).map((step) => (
                      <div
                        key={step.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                          step.completed
                            ? 'bg-bamboo-50/50 border-bamboo-200'
                            : 'bg-white border-parchment-200'
                        }`}
                      >
                        <button
                          onClick={() => toggleProcessStep(selectedArchive.id, step.id)}
                          className="mt-0.5 text-bamboo-600 hover:text-bamboo-700 flex-shrink-0"
                        >
                          {step.completed ? (
                            <CheckSquare className="w-5 h-5" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-sm font-medium ${
                                step.completed ? 'text-bamboo-700 line-through' : 'text-ink-800'
                              }`}
                            >
                              {step.name}
                            </span>
                            {step.completedAt && (
                              <span className="text-xs text-ink-400">
                                {formatDate(step.completedAt)}
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={step.note}
                            onChange={(e) =>
                              updateProcessStepNote(selectedArchive.id, step.id, e.target.value)
                            }
                            placeholder="添加备注..."
                            className="mt-1 w-full text-xs text-ink-600 bg-transparent border-none outline-none placeholder:text-ink-300 focus:ring-0 p-0"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-16 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-parchment-300" />
              <h3 className="font-serif text-xl text-ink-600 mb-2">选择一个档案查看详情</h3>
              <p className="text-ink-400 mb-6">或点击右上角按钮创建新的工艺档案</p>
              <button onClick={handleCreateFromCurrent} className="btn-primary">
                新建工艺档案
              </button>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-ink-900/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="card-header flex items-center justify-between">
              <h3 className="font-medium text-ink-800">
                {isEditing ? '编辑工艺档案' : '新建工艺档案'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setIsEditing(false);
                  setEditForm({});
                }}
                className="p-1 text-ink-400 hover:text-ink-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-ink-700 block mb-1.5">
                    作品名称 *
                  </label>
                  <input
                    type="text"
                    value={editForm.title || ''}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="input-field"
                    placeholder="输入作品名称"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-ink-700 block mb-1.5">
                    作品描述
                  </label>
                  <textarea
                    value={editForm.description || ''}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    className="input-field min-h-[80px] resize-none"
                    placeholder="描述作品的主题、创意等"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-ink-700 block mb-1.5">
                      竹材种类
                    </label>
                    <select
                      value={editForm.craftParams?.material || ''}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          craftParams: {
                            ...(editForm.craftParams || {
                              material: '',
                              thickness: 0.8,
                              difficulty: 2,
                              estimatedHours: 40,
                            }),
                            material: e.target.value,
                          },
                        })
                      }
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
                      value={editForm.craftParams?.thickness || 0.8}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          craftParams: {
                            ...(editForm.craftParams || {
                              material: 'phyllostachys-pubescens',
                              thickness: 0.8,
                              difficulty: 2,
                              estimatedHours: 40,
                            }),
                            thickness: parseFloat(e.target.value),
                          },
                        })
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
                    <div className="flex items-center gap-2 pt-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() =>
                            setEditForm({
                              ...editForm,
                              craftParams: {
                                ...(editForm.craftParams || {
                                  material: 'phyllostachys-pubescens',
                                  thickness: 0.8,
                                  difficulty: 2,
                                  estimatedHours: 40,
                                }),
                                difficulty: level,
                              },
                            })
                          }
                          className="p-1"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              level <= (editForm.craftParams?.difficulty || 2)
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
                      value={editForm.craftParams?.estimatedHours || 40}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          craftParams: {
                            ...(editForm.craftParams || {
                              material: 'phyllostachys-pubescens',
                              thickness: 0.8,
                              difficulty: 2,
                              estimatedHours: 40,
                            }),
                            estimatedHours: parseInt(e.target.value),
                          },
                        })
                      }
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-ink-700 block mb-1.5">
                    标签 (用逗号分隔)
                  </label>
                  <input
                    type="text"
                    value={editForm.tags?.join(', ') || ''}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        tags: e.target.value
                          .split(',')
                          .map((t) => t.trim())
                          .filter((t) => t),
                      })
                    }
                    className="input-field"
                    placeholder="如：山水, 传统, 精品"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-ink-700 block mb-1.5">
                    创作笔记
                  </label>
                  <textarea
                    value={editForm.notes || ''}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className="input-field min-h-[100px] resize-none"
                    placeholder="记录创作过程中的心得、技巧、注意事项等"
                  />
                </div>
              </div>
            </div>
            <div className="card-header flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setIsEditing(false);
                  setEditForm({});
                }}
                className="btn-secondary"
              >
                取消
              </button>
              <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" />
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showConvertModal && (
        <div className="fixed inset-0 bg-ink-900/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="card-header flex items-center justify-between">
              <h3 className="font-medium text-ink-800">转为模板</h3>
              <button
                onClick={() => setShowConvertModal(false)}
                className="p-1 text-ink-400 hover:text-ink-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="text-sm font-medium text-ink-700 block mb-1.5">
                  模板名称 *
                </label>
                <input
                  type="text"
                  value={convertForm.name}
                  onChange={(e) => setConvertForm({ ...convertForm, name: e.target.value })}
                  className="input-field"
                  placeholder="如：梅兰竹菊纹样"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-ink-700 block mb-1.5">
                  模板分类
                </label>
                <select
                  value={convertForm.category}
                  onChange={(e) => setConvertForm({ ...convertForm, category: e.target.value })}
                  className="input-field"
                >
                  {templateCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-ink-700 block mb-1.5">
                  模板描述
                </label>
                <textarea
                  value={convertForm.description}
                  onChange={(e) => setConvertForm({ ...convertForm, description: e.target.value })}
                  className="input-field min-h-[80px] resize-none"
                  placeholder="描述模板的特点、适用场景等"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-ink-700 block mb-1.5">
                  难度等级
                </label>
                <div className="flex items-center gap-2 pt-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setConvertForm({ ...convertForm, difficulty: level })}
                      className="p-1"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          level <= convertForm.difficulty
                            ? 'text-parchment-500 fill-parchment-500'
                            : 'text-parchment-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-3 text-sm text-ink-500">
                    {['', '入门', '简单', '中等', '复杂', '精品'][convertForm.difficulty]}
                  </span>
                </div>
              </div>

              {selectedArchive && (
                <div className="p-4 bg-parchment-50 rounded-lg border border-parchment-200">
                  <div className="text-xs text-ink-500 mb-2">档案信息</div>
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedArchive.thumbnail}
                      alt=""
                      className="w-16 h-12 rounded border border-parchment-300 object-cover"
                    />
                    <div className="text-sm">
                      <div className="font-medium text-ink-700">{selectedArchive.title}</div>
                      <div className="text-ink-400 text-xs">
                        {selectedArchive.scheme.pixelWidth}×{selectedArchive.scheme.pixelHeight} ·
                        篾宽 {selectedArchive.scheme.stripeWidth}mm ·
                        {selectedArchive.scheme.colors.length}色
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="card-header flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => setShowConvertModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleSaveTemplate}
                className="btn-primary flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                保存为模板
              </button>
            </div>
          </div>
        </div>
      )}

      {craftOrderMode === 'archive' && selectedArchive && (
        <CraftOrder
          archive={selectedArchive}
          onClose={() => setCraftOrderMode(null)}
        />
      )}
      {craftOrderMode === 'current' && (
        <CraftOrder
          useCurrentScheme
          onClose={() => setCraftOrderMode(null)}
        />
      )}
    </div>
  );
}
