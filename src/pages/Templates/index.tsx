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
  Eye,
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
  const { templates, addTemplate, deleteTemplate, toggleTemplateFavorite, setCurrentScheme, currentScheme } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

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
    navigate('/');
  };

  const handleSaveAsTemplate = () => {
    if (!currentScheme) {
      alert('请先生成一个编织方案');
      navigate('/');
      return;
    }

    const name = prompt('请输入模板名称：', '新模板');
    if (!name) return;

    const category = prompt('请选择分类 (landscape/figure/flower-bird/calligraphy/pattern/animal)：', 'pattern');
    if (!category) return;

    const thumbCanvas = renderWeavingCanvas(
      currentScheme.pixels,
      currentScheme.colors,
      'far',
      currentScheme.stripeWidth
    );

    const newTemplate: Template = {
      id: generateId(),
      name,
      category,
      description: '',
      thumbnail: thumbCanvas.toDataURL('image/png'),
      scheme: currentScheme,
      isFavorite: false,
      usageCount: 0,
      difficulty: 2,
      createdAt: new Date().toISOString(),
    };

    addTemplate(newTemplate);
    alert('模板已保存！');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这个模板吗？')) {
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
              onClick={handleSaveAsTemplate}
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
                <button onClick={handleSaveAsTemplate} className="btn-primary">
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
                        <Eye className="w-4 h-4" />
                        使用此模板
                      </button>
                    </div>

                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 bg-white/80 backdrop-blur-sm rounded text-xs text-ink-600">
                        {getCategoryName(template.category)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-ink-800 truncate">{template.name}</h4>
                      <button
                        onClick={(e) => handleDelete(template.id, e)}
                        className="p-1 text-ink-300 hover:text-cinnabar-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-ink-400 mb-3">
                      <div className="flex items-center gap-1">
                        <Ruler className="w-3 h-3" />
                        {template.scheme.pixelWidth}×{template.scheme.pixelHeight}
                      </div>
                      <div className="flex items-center gap-0.5">
                        {renderDifficultyStars(template.difficulty)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-ink-400">
                      <span>{formatDate(template.createdAt).split(' ')[0]}</span>
                      <span>使用 {template.usageCount} 次</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
