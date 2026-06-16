import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Settings,
  Ruler,
  Palette,
  Sun,
  Contrast,
  ArrowRight,
  RefreshCw,
  FileImage,
} from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { useAppStore } from '@/store/useAppStore';
import { defaultMonochromeColors, defaultMulticolorPalette } from '@/data/defaultData';
import {
  loadImage,
  imageToCanvas,
  pixelateImage,
  mapToBambooColors,
  calculatePixelDimensions,
  createWeavingScheme,
  detectColorDeviation,
} from '@/utils/weavingUtils';
import { useNavigate } from 'react-router-dom';

export default function ImageAnalysis() {
  const navigate = useNavigate();
  const { currentScheme, setCurrentScheme } = useAppStore();

  const [isDragging, setIsDragging] = useState(false);
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [sourceCanvas, setSourceCanvas] = useState<HTMLCanvasElement | null>(null);
  const [pixelatedCanvas, setPixelatedCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [stripeWidth, setStripeWidth] = useState(2);
  const [colorMode, setColorMode] = useState<'monochrome' | 'multicolor'>('monochrome');
  const [brightnessThreshold, setBrightnessThreshold] = useState(128);
  const [contrast, setContrast] = useState(0);
  const [brightness, setBrightness] = useState(0);

  const [dimensions, setDimensions] = useState({
    pixelWidth: 0,
    pixelHeight: 0,
    canvasWidth: 0,
    canvasHeight: 0,
  });

  const [restoredFromScheme, setRestoredFromScheme] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentScheme && !restoredFromScheme) {
      setStripeWidth(currentScheme.stripeWidth);
      setColorMode(currentScheme.colorMode);
      setBrightnessThreshold(currentScheme.brightnessThreshold);
      setContrast(currentScheme.contrast);
      setBrightness(currentScheme.brightness);
      setRestoredFromScheme(true);

      if (currentScheme.imageData) {
        loadImage(currentScheme.imageData).then((img) => {
          setSourceImage(img);
        }).catch(() => {});
      }
    }
  }, [currentScheme, restoredFromScheme]);

  const processImage = useCallback(async (img: HTMLImageElement) => {
    setIsProcessing(true);

    try {
      const canvas = imageToCanvas(img, 800);
      setSourceCanvas(canvas);

      const dims = calculatePixelDimensions(canvas.width, canvas.height, stripeWidth);
      setDimensions(dims);

      const { canvas: pixCanvas, pixels: pixPixels } = pixelateImage(
        canvas,
        dims.pixelWidth,
        dims.pixelHeight,
        contrast,
        brightness
      );
      setPixelatedCanvas(pixCanvas);

      const colors = colorMode === 'monochrome' ? defaultMonochromeColors : defaultMulticolorPalette;
      const mappedPixels = mapToBambooColors(pixPixels, colors, colorMode, brightnessThreshold);
      const pixelsWithDeviation = detectColorDeviation(mappedPixels);

      const scheme = createWeavingScheme(
        canvas.toDataURL('image/png'),
        dims.pixelWidth,
        dims.pixelHeight,
        stripeWidth,
        colorMode,
        colors,
        pixelsWithDeviation
      );
      scheme.contrast = contrast;
      scheme.brightness = brightness;
      scheme.brightnessThreshold = brightnessThreshold;

      setCurrentScheme(scheme);
    } catch (error) {
      console.error('图像处理失败:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [stripeWidth, colorMode, brightnessThreshold, contrast, brightness, setCurrentScheme]);

  useEffect(() => {
    if (sourceImage) {
      processImage(sourceImage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stripeWidth, colorMode, brightnessThreshold, contrast, brightness]);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      try {
        const img = await loadImage(dataUrl);
        setSourceImage(img);
        setRestoredFromScheme(true);
        processImage(img);
      } catch (error) {
        console.error('图片加载失败:', error);
      }
    };
    reader.readAsDataURL(file);
  }, [processImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const loadSampleImage = useCallback(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d')!;

    const gradient = ctx.createLinearGradient(0, 0, 400, 300);
    gradient.addColorStop(0, '#D9E4BC');
    gradient.addColorStop(0.5, '#7BA83E');
    gradient.addColorStop(1, '#4A3728');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 300);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(300, 80, 50, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(74, 55, 40, 0.4)';
    ctx.beginPath();
    ctx.moveTo(0, 250);
    ctx.quadraticCurveTo(100, 180, 200, 220);
    ctx.quadraticCurveTo(300, 260, 400, 200);
    ctx.lineTo(400, 300);
    ctx.lineTo(0, 300);
    ctx.closePath();
    ctx.fill();

    const dataUrl = canvas.toDataURL('image/png');
    const img = await loadImage(dataUrl);
    setSourceImage(img);
    setRestoredFromScheme(true);
    processImage(img);
  }, [processImage]);

  const goToStripesLayout = () => {
    navigate('/stripes-layout');
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="图像解析"
        subtitle="上传图像并将其转换为竹篾编织方案"
        icon={<ImageIcon className="w-7 h-7" />}
        actions={
          sourceImage && (
            <button
              onClick={goToStripesLayout}
              className="btn-primary flex items-center gap-2"
            >
              下一步：色篾排布
              <ArrowRight className="w-4 h-4" />
            </button>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {!sourceImage ? (
            <div
              className={`card p-12 transition-all duration-300 ${
                isDragging ? 'border-bamboo-400 bg-bamboo-50' : ''
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="text-center">
                <div
                  className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-colors ${
                    isDragging
                      ? 'bg-bamboo-200 text-bamboo-700'
                      : 'bg-parchment-200 text-ink-500'
                  }`}
                >
                  <Upload className="w-10 h-10" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-ink-800 mb-2">
                  拖拽图片到此处
                </h3>
                <p className="text-ink-500 mb-6">支持 JPG、PNG、WebP 等常见图片格式</p>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-primary"
                  >
                    选择图片
                  </button>
                  <button
                    onClick={loadSampleImage}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <FileImage className="w-4 h-4" />
                    使用示例图
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="card overflow-hidden">
                <div className="card-header flex items-center justify-between">
                  <h3 className="font-medium text-ink-800">原图预览</h3>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-bamboo-600 hover:text-bamboo-700 flex items-center gap-1"
                  >
                    <RefreshCw className="w-4 h-4" />
                    更换图片
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
                <div className="p-4 bg-parchment-100/30 flex items-center justify-center min-h-[300px]">
                  {sourceCanvas && (
                    <img
                      src={sourceCanvas.toDataURL('image/png')}
                      alt="原图预览"
                      className="max-w-full max-h-[400px] object-contain rounded-lg shadow-md"
                    />
                  )}
                </div>
              </div>

              <div className="card overflow-hidden">
                <div className="card-header">
                  <h3 className="font-medium text-ink-800">像素化效果预览</h3>
                </div>
                <div className="p-4 bg-parchment-100/30 flex items-center justify-center min-h-[300px]">
                  {isProcessing ? (
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw className="w-8 h-8 text-bamboo-500 animate-spin" />
                      <span className="text-ink-500">正在处理中...</span>
                    </div>
                  ) : pixelatedCanvas ? (
                    <img
                      src={pixelatedCanvas.toDataURL('image/png')}
                      alt="像素化预览"
                      className="max-w-full max-h-[400px] object-contain rounded-lg shadow-md image-rendering-pixelated"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  ) : null}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <Settings className="w-5 h-5 text-bamboo-600" />
              <h3 className="font-medium text-ink-800">参数设置</h3>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-ink-700 mb-2">
                  <Palette className="w-4 h-4" />
                  色彩模式
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setColorMode('monochrome')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      colorMode === 'monochrome'
                        ? 'bg-bamboo-600 text-white shadow-bamboo'
                        : 'bg-parchment-100 text-ink-600 hover:bg-parchment-200'
                    }`}
                  >
                    黑白
                  </button>
                  <button
                    onClick={() => setColorMode('multicolor')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      colorMode === 'multicolor'
                        ? 'bg-bamboo-600 text-white shadow-bamboo'
                        : 'bg-parchment-100 text-ink-600 hover:bg-parchment-200'
                    }`}
                  >
                    多色
                  </button>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-ink-700 mb-2">
                  <Ruler className="w-4 h-4" />
                  篾宽：{stripeWidth} mm
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={stripeWidth}
                  onChange={(e) => setStripeWidth(parseFloat(e.target.value))}
                  className="w-full h-2 bg-parchment-200 rounded-lg appearance-none cursor-pointer accent-bamboo-600"
                />
                <div className="flex justify-between text-xs text-ink-400 mt-1">
                  <span>0.5mm</span>
                  <span>精细</span>
                  <span>10mm</span>
                </div>
              </div>

              {colorMode === 'monochrome' && (
                <div>
                  <label className="text-sm font-medium text-ink-700 mb-2 block">
                    亮度阈值：{brightnessThreshold}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={brightnessThreshold}
                    onChange={(e) => setBrightnessThreshold(parseInt(e.target.value))}
                    className="w-full h-2 bg-parchment-200 rounded-lg appearance-none cursor-pointer accent-bamboo-600"
                  />
                  <div className="flex justify-between text-xs text-ink-400 mt-1">
                    <span>偏暗</span>
                    <span>适中</span>
                    <span>偏亮</span>
                  </div>
                </div>
              )}

              <div className="decoration-line" />

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-ink-700 mb-2">
                  <Sun className="w-4 h-4" />
                  亮度：{brightness > 0 ? '+' : ''}{brightness}
                </label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="w-full h-2 bg-parchment-200 rounded-lg appearance-none cursor-pointer accent-bamboo-600"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-ink-700 mb-2">
                  <Contrast className="w-4 h-4" />
                  对比度：{contrast > 0 ? '+' : ''}{contrast}
                </label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={contrast}
                  onChange={(e) => setContrast(parseInt(e.target.value))}
                  className="w-full h-2 bg-parchment-200 rounded-lg appearance-none cursor-pointer accent-bamboo-600"
                />
              </div>
            </div>
          </div>

          {sourceImage && (
            <div className="card">
              <div className="card-header flex items-center gap-2">
                <Ruler className="w-5 h-5 text-bamboo-600" />
                <h3 className="font-medium text-ink-800">画幅尺寸</h3>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-ink-500">经篾数量</span>
                  <span className="font-medium text-ink-800">{dimensions.pixelWidth} 根</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink-500">纬篾数量</span>
                  <span className="font-medium text-ink-800">{dimensions.pixelHeight} 根</span>
                </div>
                <div className="decoration-line" />
                <div className="flex justify-between items-center">
                  <span className="text-ink-500">画幅宽度</span>
                  <span className="font-medium text-ink-800">
                    {(dimensions.canvasWidth / 10).toFixed(1)} cm
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink-500">画幅高度</span>
                  <span className="font-medium text-ink-800">
                    {(dimensions.canvasHeight / 10).toFixed(1)} cm
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink-500">成像分辨率</span>
                  <span className="font-medium text-bamboo-600">
                    {dimensions.pixelWidth} × {dimensions.pixelHeight}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
