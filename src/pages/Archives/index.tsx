import { useState } from 'react';
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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import { useAppStore } from '@/store/useAppStore';
import { CraftArchive } from '@/types';
import { generateId, formatDate } from '@/utils/colorUtils';
import { materialTypes } from '@/data/defaultData';

export default function Archives() {
  const navigate = useNavigate();
  const { archives, addArchive, updateArchive, deleteArchive, currentScheme } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArchive, setSelectedArchive] = useState<CraftArchive | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<CraftArchive>>({});

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

    const newArchive: CraftArchive = {
      id: generateId(),
      title: '新作品档案',
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
      thumbnail: currentScheme.imageData,
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

    if (editForm.id) {
      updateArchive(editForm.id, editForm);
    } else {
      const newArchive = editForm as CraftArchive;
      newArchive.id = generateId();
      newArchive.createdAt = new Date().toISOString();
      newArchive.updatedAt = new Date().toISOString();
      addArchive(newArchive);
    }

    setShowCreateModal(false);
    setIsEditing(false);
    setEditForm({});
  };

  const handleEdit = (archive: CraftArchive) => {
    setSelectedArchive(archive);
    setEditForm(archive);
    setIsEditing(true);
    setShowCreateModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个工艺档案吗？')) {
      deleteArchive(id);
      if (selectedArchive?.id === id) {
        setSelectedArchive(null);
      }
    }
  };

  const handleView = (archive: CraftArchive) => {
    setSelectedArchive(archive);
    setIsEditing(false);
    setShowCreateModal(true);
    setEditForm(archive);
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
          <button
            onClick={handleCreateFromCurrent}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新建档案
          </button>
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
                  {filteredArchives.map((archive) => (
                    <div
                      key={archive.id}
                      onClick={() => handleView(archive)}
                      className={`p-3 rounded-lg cursor-pointer transition-all border ${
                        selectedArchive?.id === archive.id
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
                          <h4 className="font-medium text-ink-800 text-sm truncate">
                            {archive.title}
                          </h4>
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
                  ))}
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
    </div>
  );
}
