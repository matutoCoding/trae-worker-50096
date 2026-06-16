import { useState, useMemo } from 'react';
import {
  LayoutGrid,
  Heart,
  Search,
  Plus,
  Trash2,
  Upload,
  Star,
  Layers,
  Ruler,
  Grid3x3,
  X,
  Save,
  Clock,
  Palette,
  Play,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import { useAppStore } from '@/store/useAppStore';
import { Template } from '@/types';
import { generateId, formatDate } from '@/utils/colorUtils';
import { templateCategories } from '@/data/defaultData';
import { renderWeavingCanvas } from '@/utils/weavingUtils';

export default function Templates() {
  const navigate = useNavigate();
  const {
    templates,
    addTemplate,
    deleteTemplate,
    toggleTemplateFavorite,
    setCurrentScheme,
    currentScheme,
    incrementTemplateUsage,
  } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveForm, setSaveForm] = useState({
    name: '',
    category: 'pattern',
    description: '',
    difficulty: 2,
  });

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        activeCategory === 'all' || t.category === activeCategory;
      const matchesFavorite = !showFavoritesOnly || t.isFavorite;
      return matchesSearch && matchesCategory && matchesFavorite;
    });
  }, [templates, searchTerm, activeCategory, showFavoritesOnly]);

  const getCategoryName = (id: string) => {
    return templateCategories.find((c) => c.id === id)?.name || id;
  };

  const handleUseTemplate = (template: Template) => {
    setCurrentScheme(template.scheme);
    incrementTemplateUsage(template.id);
    navigate('/weaving-preview');
  };

  const handleOpenSaveModal = () => {
    if (!currentScheme) {
      alert('请先在图像解析或挑压成像页生成编织方案');
      navigate('/');
      return;
    }
    setSaveForm({
      name: '新模板',
      category: 'pattern',
      description: '',
      difficulty: 2,
    });
    setShowSaveModal(true);
  };

  const handleSaveTemplate = () => {
    if (!currentScheme) return;
    if (!saveForm.name.trim()) {
      alert('请输入模板名称');
      return;
    }

    const thumbCanvas = renderWeavingCanvas(
      currentScheme.pixels,
      currentScheme.colors,
      'far',
      currentScheme.stripeWidth
    );

    const newTemplate: Template = {
      id: generateId(),
      name: saveForm.name,
      category: saveForm.category,
      description: saveForm.description,
      thumbnail: thumbCanvas.toDataURL('image/png'),
      scheme: currentScheme,
      isFavorite: false,
      usageCount: 0,
      difficulty: saveForm.difficulty,
      createdAt: new Date().toISOString(),
    };

    addTemplate(newTemplate);
    setShowSaveModal(false);
    setSaveForm({
      name: '',
      category: 'pattern',
      description: '',
      difficulty: 2,
    });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这个模板吗？此操作不可恢复。')) {
      deleteTemplate(id);
    }
  };

  const renderDifficultyStars = (level: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < level ? 'text-parchment-500 fill-parchment-500' : 'text-parchment-200'
        }`}
      />
    ));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="模板库"
        subtitle="浏览、收藏和复用编织方案模板"
        icon={<LayoutGrid className="w-7 h-7" />}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenSaveModal}
              className="btn-secondary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              保存当前方案
            </button>
            <button className="btn-primary flex items-center gap-2">
              <Upload className="w-4 h-4" />
              导入模板
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-1">
          <div className="card sticky top-6">
            <div className="card-header">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  type="text"
                  placeholder="搜索模板..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 py-2 text-sm"
                />
              </div>
            </div>
            <div className="p-3">
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-3 transition-colors ${
                  showFavoritesOnly
                    ? 'bg-cinnabar-50 text-cinnabar-700'
                    : 'hover:bg-parchment-100 text-ink-600'
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${
                    showFavoritesOnly ? 'fill-cinnabar-500 text-cinnabar-500' : ''
                  }`}
                />
                我的收藏
              </button>

              <div className="decoration-line mb-3" />

              <div className="space-y-1">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                    activeCategory === 'all'
                      ? 'bg-bamboo-100 text-bamboo-800 font-medium'
                      : 'hover:bg-parchment-100 text-ink-600'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                  全部模板
                  <span className="ml-auto text-xs text-ink-400">
                    {templates.length}
                  </span>
                </button>

                {templateCategories.map((cat) => {
                  const count = templates.filter((t) => t.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                        activeCategory === cat.id
                          ? 'bg-bamboo-100 text-bamboo-800 font-medium'
                          : 'hover:bg-parchment-100 text-ink-600'
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                      {cat.name}
                      <span className="ml-auto text-xs text-ink-400">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          {filteredTemplates.length === 0 ? (
            <div className="card p-16 text-center">
              <LayoutGrid className="w-16 h-16 mx-auto mb-4 text-parchment-300" />
              <h3 className="font-serif text-xl text-ink-600 mb-2">暂无模板</h3>
              <p className="text-ink-400 mb-6">
                {searchTerm || activeCategory !== 'all' || showFavoritesOnly
                  ? '没有找到符合条件的模板'
                  : '点击右上角按钮将当前方案保存为模板'}
              </p>
              {!searchTerm && activeCategory === 'all' && !showFavoritesOnly && (
                <button onClick={handleOpenSaveModal} className="btn-primary">
                  保存当前方案为模板
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="card group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="aspect-[4/3] bg-parchment-100 relative overflow-hidden">
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTemplateFavorite(template.id);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          template.isFavorite
                            ? 'fill-cinnabar-500 text-cinnabar-500'
                            : 'text-ink-400'
                        }`}
                      />
                    </button>

                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleUseTemplate(template)}
                        className="w-full py-2 bg-bamboo-600 text-white rounded-lg text-sm font-medium hover:bg-bamboo-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        使用此模板
                      </button>
                    </div>

                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2 py-1 bg-white/80 backdrop-blur-sm rounded text-xs text-ink-600">
                        {getCategoryName(template.category)}
                      </span>
                      {template.usageCount > 0 && (
                        <span className="px-2 py-1 bg-bamboo-100/90 backdrop-blur-sm rounded text-xs text-bamboo-700 font-medium">
                          × {template.usageCount}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-ink-800 truncate flex-1 mr-2">
                        {template.name}
                      </h4>
                      <button
                        onClick={(e) => handleDelete(template.id, e)}
                        className="p-1 text-ink-300 hover:text-cinnabar-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        title="删除模板"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {template.description && (
                      <p className="text-xs text-ink-500 mb-3 line-clamp-2">
                        {template.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-ink-400 mb-3">
                      <div className="flex items-center gap-1">
                        <Ruler className="w-3 h-3" />
                        {template.scheme.pixelWidth}×{template.scheme.pixelHeight}
                      </div>
                      <div className="flex items-center gap-1">
                        <Palette className="w-3 h-3" />
                        {template.scheme.colors.length}色
                      </div>
                      <div className="flex items-center gap-0.5">
                        {renderDifficultyStars(template.difficulty)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-ink-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(template.createdAt).split(' ')[0]}
                      </span>
                      <span>
                        篾宽 {template.scheme.stripeWidth}mm
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 bg-ink-900/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="card-header flex items-center justify-between">
              <h3 className="font-medium text-ink-800">保存为模板</h3>
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
                  模板名称 *
                </label>
                <input
                  type="text"
                  value={saveForm.name}
                  onChange={(e) => setSaveForm({ ...saveForm, name: e.target.value })}
                  className="input-field"
                  placeholder="如：梅兰竹菊纹样"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-ink-700 block mb-1.5">
                  模板分类
                </label>
                <select
                  value={saveForm.category}
                  onChange={(e) => setSaveForm({ ...saveForm, category: e.target.value })}
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
                  value={saveForm.description}
                  onChange={(e) => setSaveForm({ ...saveForm, description: e.target.value })}
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
                  <span className="ml-3 text-sm text-ink-500">
                    {['', '入门', '简单', '中等', '复杂', '精品'][saveForm.difficulty]}
                  </span>
                </div>
              </div>

              {currentScheme && (
                <div className="p-4 bg-parchment-50 rounded-lg border border-parchment-200">
                  <div className="text-xs text-ink-500 mb-2">方案预览</div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <div className="text-ink-400 text-xs mb-0.5">分辨率</div>
                      <div className="font-medium text-ink-700">
                        {currentScheme.pixelWidth}×{currentScheme.pixelHeight}
                      </div>
                    </div>
                    <div>
                      <div className="text-ink-400 text-xs mb-0.5">篾宽</div>
                      <div className="font-medium text-ink-700">
                        {currentScheme.stripeWidth}mm
                      </div>
                    </div>
                    <div>
                      <div className="text-ink-400 text-xs mb-0.5">色数</div>
                      <div className="font-medium text-ink-700">
                        {currentScheme.colors.length}种
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="card-header flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => setShowSaveModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleSaveTemplate}
                className="btn-primary flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                保存模板
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
