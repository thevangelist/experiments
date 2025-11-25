import { useState, useRef, useEffect } from 'react';
import { Upload, Download, RotateCcw, Eye, Menu, X, ZoomIn, ZoomOut, Maximize2, RefreshCw } from 'lucide-react';
import heic2any from 'heic2any';
import UTIF from 'utif';

const DStretch = () => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [filter, setFilter] = useState('none');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [dehaze, setDehaze] = useState(0);
  const [clarity, setClarity] = useState(0);
  const [shadowRecovery, setShadowRecovery] = useState(0);
  const [highlightRecovery, setHighlightRecovery] = useState(0);
  const [adaptiveEnhancement, setAdaptiveEnhancement] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [lightingPreset, setLightingPreset] = useState('none');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [noiseReduction, setNoiseReduction] = useState(0);
  const [noiseAlgorithm, setNoiseAlgorithm] = useState<'median' | 'gaussian' | 'bilateral'>('median');
  const [sharpening, setSharpening] = useState(0);
  const [sharpenAlgorithm, setSharpenAlgorithm] = useState<'unsharp' | 'highpass' | 'laplacian'>('unsharp');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [panStartX, setPanStartX] = useState(0);
  const [panStartY, setPanStartY] = useState(0);
  const [originalFormat, setOriginalFormat] = useState<'jpeg' | 'png' | 'webp'>('png');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);
  const [histogram, setHistogram] = useState<{ r: number[]; g: number[]; b: number[] } | null>(null);

  const lightingPresets = {
    none: {
      name: 'No Preset',
      desc: 'Manual adjustment - start from default settings',
      settings: { brightness: 100, contrast: 100, saturation: 100, shadowRecovery: 0, highlightRecovery: 0, clarity: 0, dehaze: 0 }
    },
    hardLight: {
      name: 'Hard Direct Light',
      desc: 'Harsh sun or flash. High contrast, blown highlights, deep shadows. Adds shadow/highlight recovery.',
      settings: { brightness: 100, contrast: 85, saturation: 95, shadowRecovery: 40, highlightRecovery: 50, clarity: 10, dehaze: 0 }
    },
    softLight: {
      name: 'Soft Diffused',
      desc: 'Overcast or shade. Low contrast, flat. Boosts contrast and saturation for pop.',
      settings: { brightness: 105, contrast: 125, saturation: 115, shadowRecovery: 0, highlightRecovery: 0, clarity: 25, dehaze: 15 }
    },
    goldenHour: {
      name: 'Golden Hour',
      desc: 'Early/late sun. Warm tones, good contrast. Minor adjustments to balance colors.',
      settings: { brightness: 100, contrast: 110, saturation: 105, shadowRecovery: 15, highlightRecovery: 10, clarity: 15, dehaze: 0 }
    },
    cave: {
      name: 'Cave/Deep Overhang',
      desc: 'Very dark, limited light. Heavy shadows. Maximum shadow recovery and brightness boost.',
      settings: { brightness: 135, contrast: 115, saturation: 105, shadowRecovery: 80, highlightRecovery: 0, clarity: 30, dehaze: 25 }
    },
    filteredLight: {
      name: 'Filtered (Trees/Canopy)',
      desc: 'Mixed light through vegetation. Green color cast, uneven. Reduces saturation, adds dehaze.',
      settings: { brightness: 110, contrast: 115, saturation: 85, shadowRecovery: 25, highlightRecovery: 20, clarity: 20, dehaze: 30 }
    },
    rakingLight: {
      name: 'Raking/Side Light',
      desc: 'Strong directional side lighting. Good texture, harsh shadows. Balances shadows while keeping detail.',
      settings: { brightness: 100, contrast: 105, saturation: 100, shadowRecovery: 35, highlightRecovery: 15, clarity: 35, dehaze: 0 }
    },
    backlit: {
      name: 'Backlit/Silhouette',
      desc: 'Light behind subject. Dark foreground. Aggressive shadow recovery and brightness boost.',
      settings: { brightness: 150, contrast: 110, saturation: 95, shadowRecovery: 90, highlightRecovery: 60, clarity: 20, dehaze: 20 }
    }
  };

  const filterGroups = {
    basic: {
      title: 'Basic',
      filters: {
        none: { name: 'Original', desc: 'No filter - view unprocessed image' },
        adaptive: { name: 'Adaptive', desc: 'Auto-detects vegetation, shadows, and rock surfaces. Reduces green (lichen/moss), enhances reds in dark areas. Good starting point for mixed conditions.' }
      }
    },
    reds: {
      title: 'Reds (Faint Ochre/Hematite)',
      filters: {
        yre: { name: 'YRE', desc: 'Yellow-Red Enhancement: Strong red enhancement, faster but noisier. Often first choice for pictographs.' },
        lre: { name: 'LRE', desc: 'Long Red Enhancement: Sharper, less artifact-prone than YRE. Good for iron oxide and hematite pigments.' }
      }
    },
    redsBalanced: {
      title: 'Reds (General/Balanced)',
      filters: {
        yrd: { name: 'YRD', desc: 'Yellow-Red Deep: Pleasing overall red boost with less wild colors. Good for layered sites.' },
        lrd: { name: 'LRD', desc: 'Long Red Deep: Milder variant with balanced enhancement. Less artifacts than YRD.' }
      }
    },
    general: {
      title: 'General/Yellows',
      filters: {
        yds: { name: 'YDS', desc: 'Yellow Deep Stretch: Versatile starter, highlights faint yellows/greens well.' },
        lds: { name: 'LDS', desc: 'Long Deep Stretch: LAB variant, reduces JPEG noise for cleaner results.' }
      }
    },
    multiPigment: {
      title: 'Reds/Blacks (Multi-Pigment)',
      filters: {
        ybr: { name: 'YBR', desc: 'Yellow-Blue-Red: For subtle reds/blues. Good for mixed color sites.' },
        lab: { name: 'LAB', desc: 'L*A*B Color Space: Balanced, noise-resistant all-around use on engravings or mixed colors.' }
      }
    },
    darks: {
      title: 'Blacks/Blues',
      filters: {
        ybk: { name: 'YBK', desc: 'Yellow-Black: Boosts dark pigments. Useful for superposition analysis.' },
        lbk: { name: 'LBK', desc: 'Long Black: Enhanced dark pigment visibility with blue tones.' }
      }
    },
    yellows: {
      title: 'Yellows/Whites',
      filters: {
        yye: { name: 'YYE', desc: 'Yellow-Yellow Enhancement: Amplifies pale yellows. Quick scans.' },
        lye: { name: 'LYE', desc: 'Long Yellow Enhancement: Refined edges in schematic art with yellow/white pigments.' },
        ywe: { name: 'YWE', desc: 'Yellow-White Enhancement: Enhances white pigments. Pairs well with dehazing.' }
      }
    },
    quickScan: {
      title: 'Quick/High-Contrast',
      filters: {
        crgb: { name: 'CRGB', desc: 'Color RGB: Fast for initial red reveals. Vivid but "crazy" colors—great for etchings.' },
        rgb0: { name: 'RGB0', desc: 'RGB Zero: High-contrast quick scan. Good for initial assessment.' }
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = async (file: File) => {
    setIsProcessing(true);
    setProcessingMessage('Loading image...');

    // Detect and store original format
    if (file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg')) {
      setOriginalFormat('jpeg');
    } else if (file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp')) {
      setOriginalFormat('webp');
    } else {
      setOriginalFormat('png');
    }

    let fileToProcess = file;

    // Convert HEIC to JPEG if needed
    if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
      try {
        setProcessingMessage('Converting HEIC image...');
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 1
        });
        fileToProcess = new File(
          [Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob],
          file.name.replace(/\.heic$/i, '.jpg'),
          { type: 'image/jpeg' }
        );
      } catch (error) {
        console.error('HEIC conversion error:', error);
        alert('Failed to convert HEIC image. Please try a different format.');
        setIsProcessing(false);
        setProcessingMessage('');
        return;
      }
    }

    // Convert TIFF to PNG if needed
    if (file.type === 'image/tiff' || file.type === 'image/tif' ||
        file.name.toLowerCase().endsWith('.tiff') || file.name.toLowerCase().endsWith('.tif')) {
      try {
        setProcessingMessage('Converting TIFF image...');
        const arrayBuffer = await file.arrayBuffer();
        const ifds = UTIF.decode(arrayBuffer);
        UTIF.decodeImage(arrayBuffer, ifds[0]);
        const rgba = UTIF.toRGBA8(ifds[0]);

        // Create canvas to convert RGBA to data URL
        const canvas = document.createElement('canvas');
        canvas.width = ifds[0].width;
        canvas.height = ifds[0].height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        imageData.data.set(rgba);
        ctx.putImageData(imageData, 0, 0);

        // Convert to blob then file
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((b) => {
            if (b) resolve(b);
            else reject(new Error('Failed to create blob'));
          }, 'image/png');
        });
        fileToProcess = new File([blob], file.name.replace(/\.tiff?$/i, '.png'), { type: 'image/png' });
      } catch (error) {
        console.error('TIFF conversion error:', error);
        alert('Failed to convert TIFF image. Please try a different format.');
        setIsProcessing(false);
        setProcessingMessage('');
        return;
      }
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Store reference to original image so it persists
        originalImageRef.current = img;
        setImage(img);
        setImageDimensions({ width: img.width, height: img.height });
        drawOriginal(img);
        setIsProcessing(false);
        setProcessingMessage('');
      };
      img.onerror = () => {
        alert('Failed to load image. Please try a different file.');
        setIsProcessing(false);
        setProcessingMessage('');
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      alert('Failed to read image file.');
      setIsProcessing(false);
      setProcessingMessage('');
    };
    reader.readAsDataURL(fileToProcess);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    const fileName = file.name.toLowerCase();
    // Accept image files including HEIC and TIFF (which may not have proper MIME type)
    if (file && (
      file.type.startsWith('image/') ||
      fileName.endsWith('.heic') ||
      fileName.endsWith('.heif') ||
      fileName.endsWith('.tiff') ||
      fileName.endsWith('.tif')
    )) {
      processImageFile(file);
    }
  };

  const drawOriginal = (img: HTMLImageElement) => {
    const canvas = originalCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
  };

  useEffect(() => {
    if (image) {
      applyFilter();
      calculateHistogram();
    }
  }, [image, filter, brightness, contrast, saturation, dehaze, clarity, shadowRecovery, highlightRecovery, adaptiveEnhancement, showOriginal, noiseReduction, noiseAlgorithm, sharpening, sharpenAlgorithm]);

  const calculateHistogram = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const r = new Array(256).fill(0);
    const g = new Array(256).fill(0);
    const b = new Array(256).fill(0);

    for (let i = 0; i < data.length; i += 4) {
      r[data[i]]++;
      g[data[i + 1]]++;
      b[data[i + 2]]++;
    }

    setHistogram({ r, g, b });
  };

  const applyFilter = () => {
    if (!image) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = image.width;
    canvas.height = image.height;

    // If showing original, just display the original image
    if (showOriginal && originalImageRef.current) {
      ctx.drawImage(originalImageRef.current, 0, 0);
      return;
    }

    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Apply shadow and highlight recovery first
    if (shadowRecovery > 0 || highlightRecovery > 0) {
      for (let i = 0; i < data.length; i += 4) {
        const luminance = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);

        // Shadow recovery - brighten dark areas
        if (shadowRecovery > 0 && luminance < 128) {
          const shadowBoost = (1 - luminance / 128) * (shadowRecovery / 100) * 0.5;
          data[i] = Math.min(255, data[i] * (1 + shadowBoost));
          data[i + 1] = Math.min(255, data[i + 1] * (1 + shadowBoost));
          data[i + 2] = Math.min(255, data[i + 2] * (1 + shadowBoost));
        }

        // Highlight recovery - darken bright areas
        if (highlightRecovery > 0 && luminance > 200) {
          const highlightReduction = ((luminance - 200) / 55) * (highlightRecovery / 100) * 0.3;
          data[i] = Math.max(0, data[i] * (1 - highlightReduction));
          data[i + 1] = Math.max(0, data[i + 1] * (1 - highlightReduction));
          data[i + 2] = Math.max(0, data[i + 2] * (1 - highlightReduction));
        }
      }
    }

    // Apply clarity filter (unsharp mask approximation)
    if (clarity > 0) {
      const tempData = new Uint8ClampedArray(data);
      const width = canvas.width;
      const height = canvas.height;

      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = (y * width + x) * 4;

          for (let c = 0; c < 3; c++) {
            const center = tempData[idx + c];
            const top = tempData[((y - 1) * width + x) * 4 + c];
            const bottom = tempData[((y + 1) * width + x) * 4 + c];
            const left = tempData[(y * width + (x - 1)) * 4 + c];
            const right = tempData[(y * width + (x + 1)) * 4 + c];

            const edge = center * 5 - top - bottom - left - right;
            const clarityAmount = clarity / 100;
            data[idx + c] = Math.min(255, Math.max(0, center + edge * clarityAmount * 0.3));
          }
        }
      }
    }

    // Apply selected filter
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Adaptive DStretch mode
      if (filter === 'adaptive') {
        const luminance = (r * 0.299 + g * 0.587 + b * 0.114);
        const greenness = g - (r + b) / 2;

        // Adapt filter based on pixel characteristics
        if (greenness > 15) {
          // Vegetation area - reduce green, enhance other channels
          data[i] = Math.min(255, r * 1.3);
          data[i + 1] = g * 0.4;
          data[i + 2] = Math.min(255, b * 1.2);
        } else if (luminance < 80 && shadowRecovery > 0) {
          // Dark rock area - apply YRE-like enhancement
          data[i] = Math.min(255, r * 1.4);
          data[i + 1] = Math.min(255, g * 0.8);
          data[i + 2] = b * 0.6;
        } else {
          // Normal rock surface - balanced enhancement
          data[i] = Math.min(255, r * 1.2);
          data[i + 1] = Math.min(255, g * 0.9);
          data[i + 2] = Math.min(255, b * 0.8);
        }
        continue;
      }

      switch (filter) {
        case 'yre':
          // Yellow-Red Enhancement
          data[i] = Math.min(255, r * 1.3);
          data[i + 1] = Math.min(255, g * 0.7);
          data[i + 2] = b * 0.5;
          break;
        case 'yrd':
          // Yellow-Red-Deep
          data[i] = Math.min(255, r * 1.4 + 20);
          data[i + 1] = Math.min(255, g * 0.8);
          data[i + 2] = b * 0.3;
          break;
        case 'lre':
          // Long Red Enhancement
          data[i] = Math.min(255, r * 1.5);
          data[i + 1] = g * 0.5;
          data[i + 2] = b * 0.5;
          break;
        case 'lds':
          // Long Deep Stretch
          const gray = (r + g + b) / 3;
          const diff = r - gray;
          data[i] = Math.min(255, Math.max(0, r + diff * 2));
          data[i + 1] = Math.min(255, Math.max(0, g - diff));
          data[i + 2] = Math.min(255, Math.max(0, b - diff));
          break;
        case 'lab':
          // LAB-like enhancement
          const l = 0.3 * r + 0.59 * g + 0.11 * b;
          const a = (r - g) * 1.5;
          const bVal = (g - b) * 1.5;
          data[i] = Math.min(255, Math.max(0, l + a));
          data[i + 1] = Math.min(255, Math.max(0, l));
          data[i + 2] = Math.min(255, Math.max(0, l - bVal));
          break;
        case 'crgb':
          // Color RGB enhancement
          const max = Math.max(r, g, b);
          data[i] = r === max ? 255 : r * 0.5;
          data[i + 1] = g === max ? 255 : g * 0.5;
          data[i + 2] = b === max ? 255 : b * 0.5;
          break;
        case 'ybr':
          // Yellow-Blue-Red
          data[i] = Math.min(255, r * 1.2);
          data[i + 1] = Math.min(255, g * 1.2);
          data[i + 2] = Math.min(255, b * 1.5);
          break;
        case 'labi':
          // LAB Invert
          const lInv = 0.3 * r + 0.59 * g + 0.11 * b;
          const aInv = (g - r) * 1.5;
          const bInv = (b - g) * 1.5;
          data[i] = Math.min(255, Math.max(0, 255 - (lInv + aInv)));
          data[i + 1] = Math.min(255, Math.max(0, 255 - lInv));
          data[i + 2] = Math.min(255, Math.max(0, 255 - (lInv - bInv)));
          break;
        case 'lrd':
          // Long Red Deep - milder red enhancement
          data[i] = Math.min(255, r * 1.35);
          data[i + 1] = g * 0.6;
          data[i + 2] = b * 0.4;
          break;
        case 'yds':
          // Yellow Deep Stretch - yellow/green enhancement
          data[i] = Math.min(255, r * 1.1);
          data[i + 1] = Math.min(255, g * 1.3);
          data[i + 2] = b * 0.7;
          break;
        case 'ybk':
          // Yellow-Black - dark pigment boost
          const lumYbk = (r + g + b) / 3;
          if (lumYbk < 100) {
            data[i] = Math.min(255, r * 1.2);
            data[i + 1] = Math.min(255, g * 1.1);
            data[i + 2] = Math.min(255, b * 1.4);
          } else {
            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
          }
          break;
        case 'lbk':
          // Long Black - enhanced dark with blue tones
          const lumLbk = (r + g + b) / 3;
          if (lumLbk < 120) {
            data[i] = Math.min(255, r * 1.15);
            data[i + 1] = Math.min(255, g * 1.1);
            data[i + 2] = Math.min(255, b * 1.5);
          } else {
            data[i] = r * 0.9;
            data[i + 1] = g * 0.9;
            data[i + 2] = Math.min(255, b * 1.1);
          }
          break;
        case 'yye':
          // Yellow-Yellow Enhancement
          data[i] = Math.min(255, r * 1.2);
          data[i + 1] = Math.min(255, g * 1.4);
          data[i + 2] = b * 0.6;
          break;
        case 'lye':
          // Long Yellow Enhancement - refined yellow/white
          data[i] = Math.min(255, r * 1.15);
          data[i + 1] = Math.min(255, g * 1.35);
          data[i + 2] = b * 0.65;
          break;
        case 'ywe':
          // Yellow-White Enhancement
          const avgYwe = (r + g + b) / 3;
          if (avgYwe > 150) {
            data[i] = Math.min(255, r * 1.1);
            data[i + 1] = Math.min(255, g * 1.15);
            data[i + 2] = Math.min(255, b * 0.95);
          } else {
            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
          }
          break;
        case 'rgb0':
          // RGB Zero - high contrast
          const avgRgb0 = (r + g + b) / 3;
          const rDiff = r - avgRgb0;
          const gDiff = g - avgRgb0;
          const bDiff = b - avgRgb0;
          data[i] = Math.min(255, Math.max(0, avgRgb0 + rDiff * 2.5));
          data[i + 1] = Math.min(255, Math.max(0, avgRgb0 + gDiff * 2.5));
          data[i + 2] = Math.min(255, Math.max(0, avgRgb0 + bDiff * 2.5));
          break;
      }

      // Apply brightness, contrast, saturation
      const hsl = rgbToHsl(data[i], data[i + 1], data[i + 2]);
      hsl[2] = hsl[2] * (brightness / 100);
      hsl[1] = hsl[1] * (saturation / 100);

      const rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);

      // Apply contrast
      const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      data[i] = Math.min(255, Math.max(0, factor * (rgb[0] - 128) + 128));
      data[i + 1] = Math.min(255, Math.max(0, factor * (rgb[1] - 128) + 128));
      data[i + 2] = Math.min(255, Math.max(0, factor * (rgb[2] - 128) + 128));

      // Apply dehaze (increase contrast in darker areas, boost clarity)
      if (dehaze > 0) {
        const luminance = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
        const dehazeFactor = 1 + (dehaze / 100) * (1 - luminance);
        data[i] = Math.min(255, data[i] * dehazeFactor);
        data[i + 1] = Math.min(255, data[i + 1] * dehazeFactor);
        data[i + 2] = Math.min(255, data[i + 2] * dehazeFactor);
      }
    }

    // Apply noise reduction
    if (noiseReduction > 0) {
      applyNoiseReduction(data, canvas.width, canvas.height, noiseAlgorithm, noiseReduction);
    }

    // Apply sharpening
    if (sharpening > 0) {
      applySharpening(data, canvas.width, canvas.height, sharpenAlgorithm, sharpening);
    }

    ctx.putImageData(imageData, 0, 0);
  };


  const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return [h, s, l];
  };

  const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number): number => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return [r * 255, g * 255, b * 255];
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDownloading(true);

    try {
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

      // Use original format - match the input format
      const formatMap = {
        'jpeg': { mime: 'image/jpeg', ext: 'jpg', quality: 0.95 },
        'png': { mime: 'image/png', ext: 'png', quality: 1.0 },
        'webp': { mime: 'image/webp', ext: 'webp', quality: 0.95 }
      };

      const format = formatMap[originalFormat];
      link.download = `dstretch-${filter}-${timestamp}.${format.ext}`;
      link.href = canvas.toDataURL(format.mime, format.quality);
      link.click();

      setTimeout(() => {
        setIsDownloading(false);
      }, 500);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download image.');
      setIsDownloading(false);
    }
  };

  const applyLightingPreset = (presetKey: string) => {
    setLightingPreset(presetKey);
    const preset = lightingPresets[presetKey as keyof typeof lightingPresets];
    if (preset) {
      setBrightness(preset.settings.brightness);
      setContrast(preset.settings.contrast);
      setSaturation(preset.settings.saturation);
      setShadowRecovery(preset.settings.shadowRecovery);
      setHighlightRecovery(preset.settings.highlightRecovery);
      setClarity(preset.settings.clarity);
      setDehaze(preset.settings.dehaze);
    }
  };

  const applyNoiseReduction = (data: Uint8ClampedArray, width: number, height: number, algorithm: string, strength: number) => {
    if (strength === 0) return;

    const tempData = new Uint8ClampedArray(data);
    const radius = Math.max(1, Math.floor(strength / 25));

    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        const idx = (y * width + x) * 4;

        for (let c = 0; c < 3; c++) {
          if (algorithm === 'median') {
            // Median filter - best for salt-and-pepper noise
            const values: number[] = [];
            for (let dy = -radius; dy <= radius; dy++) {
              for (let dx = -radius; dx <= radius; dx++) {
                const nIdx = ((y + dy) * width + (x + dx)) * 4 + c;
                values.push(tempData[nIdx]);
              }
            }
            values.sort((a, b) => a - b);
            data[idx + c] = values[Math.floor(values.length / 2)];
          } else if (algorithm === 'gaussian') {
            // Gaussian blur - smooth noise reduction
            let sum = 0;
            let weightSum = 0;
            for (let dy = -radius; dy <= radius; dy++) {
              for (let dx = -radius; dx <= radius; dx++) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                const weight = Math.exp(-(dist * dist) / (2 * radius * radius));
                const nIdx = ((y + dy) * width + (x + dx)) * 4 + c;
                sum += tempData[nIdx] * weight;
                weightSum += weight;
              }
            }
            const blurred = sum / weightSum;
            const original = tempData[idx + c];
            data[idx + c] = original + (blurred - original) * (strength / 100);
          } else if (algorithm === 'bilateral') {
            // Bilateral filter - edge-preserving noise reduction
            let sum = 0;
            let weightSum = 0;
            const centerVal = tempData[idx + c];
            for (let dy = -radius; dy <= radius; dy++) {
              for (let dx = -radius; dx <= radius; dx++) {
                const nIdx = ((y + dy) * width + (x + dx)) * 4 + c;
                const val = tempData[nIdx];
                const dist = Math.sqrt(dx * dx + dy * dy);
                const spatialWeight = Math.exp(-(dist * dist) / (2 * radius * radius));
                const colorDiff = Math.abs(val - centerVal);
                const rangeWeight = Math.exp(-(colorDiff * colorDiff) / (2 * 50 * 50));
                const weight = spatialWeight * rangeWeight;
                sum += val * weight;
                weightSum += weight;
              }
            }
            const filtered = sum / weightSum;
            const original = tempData[idx + c];
            data[idx + c] = original + (filtered - original) * (strength / 100);
          }
        }
      }
    }
  };

  const applySharpening = (data: Uint8ClampedArray, width: number, height: number, algorithm: string, strength: number) => {
    if (strength === 0) return;

    const tempData = new Uint8ClampedArray(data);
    const amount = strength / 100;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;

        for (let c = 0; c < 3; c++) {
          if (algorithm === 'unsharp') {
            // Unsharp mask - standard sharpening
            const center = tempData[idx + c];
            const top = tempData[((y - 1) * width + x) * 4 + c];
            const bottom = tempData[((y + 1) * width + x) * 4 + c];
            const left = tempData[(y * width + (x - 1)) * 4 + c];
            const right = tempData[(y * width + (x + 1)) * 4 + c];
            const blur = (top + bottom + left + right + center) / 5;
            const sharpened = center + (center - blur) * amount;
            data[idx + c] = Math.min(255, Math.max(0, sharpened));
          } else if (algorithm === 'highpass') {
            // High-pass filter - aggressive sharpening
            const center = tempData[idx + c];
            const top = tempData[((y - 1) * width + x) * 4 + c];
            const bottom = tempData[((y + 1) * width + x) * 4 + c];
            const left = tempData[(y * width + (x - 1)) * 4 + c];
            const right = tempData[(y * width + (x + 1)) * 4 + c];
            const highpass = center * 5 - top - bottom - left - right;
            data[idx + c] = Math.min(255, Math.max(0, center + highpass * amount * 0.5));
          } else if (algorithm === 'laplacian') {
            // Laplacian - edge enhancement
            const center = tempData[idx + c];
            const top = tempData[((y - 1) * width + x) * 4 + c];
            const bottom = tempData[((y + 1) * width + x) * 4 + c];
            const left = tempData[(y * width + (x - 1)) * 4 + c];
            const right = tempData[(y * width + (x + 1)) * 4 + c];
            const topLeft = tempData[((y - 1) * width + (x - 1)) * 4 + c];
            const topRight = tempData[((y - 1) * width + (x + 1)) * 4 + c];
            const bottomLeft = tempData[((y + 1) * width + (x - 1)) * 4 + c];
            const bottomRight = tempData[((y + 1) * width + (x + 1)) * 4 + c];
            const laplacian = center * 9 - top - bottom - left - right - topLeft - topRight - bottomLeft - bottomRight;
            data[idx + c] = Math.min(255, Math.max(0, center + laplacian * amount * 0.2));
          }
        }
      }
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.25, 10));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.25, 0.1));
  };

  const handleZoomFit = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY;
      if (delta < 0) {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoom > 1) {
      setIsPanning(true);
      setPanStartX(e.clientX - panX);
      setPanStartY(e.clientY - panY);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning && zoom > 1) {
      setPanX(e.clientX - panStartX);
      setPanY(e.clientY - panStartY);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const resetSettings = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setDehaze(0);
    setClarity(0);
    setShadowRecovery(0);
    setHighlightRecovery(0);
    setAdaptiveEnhancement(false);
    setNoiseReduction(0);
    setSharpening(0);
    setFilter('none');
    setLightingPreset('none');
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Top Header */}
      <div className="bg-gray-950 border-b border-gray-800 px-3 md:px-6 py-3">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden bg-gray-800 hover:bg-gray-700 p-2 rounded"
              title="Toggle sidebar"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-bold">DStretch</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Rock Art Enhancement</p>
            </div>

            {/* Histogram Display */}
            {histogram && image && (
              <div className="hidden lg:block bg-gray-900 rounded p-2 border border-gray-700" title="RGB Histogram: Shows distribution of red, green, and blue tones. Peaks on left = dark pixels, right = bright pixels. Use to check if colors are clipping or if image needs adjustment.">
                <div className="flex items-end gap-px h-12 w-64">
                  {Array.from({ length: 64 }).map((_, i) => {
                    const binSize = 4;
                    const rVal = histogram.r.slice(i * binSize, (i + 1) * binSize).reduce((a, b) => a + b, 0);
                    const gVal = histogram.g.slice(i * binSize, (i + 1) * binSize).reduce((a, b) => a + b, 0);
                    const bVal = histogram.b.slice(i * binSize, (i + 1) * binSize).reduce((a, b) => a + b, 0);
                    const max = Math.max(...histogram.r, ...histogram.g, ...histogram.b);
                    return (
                      <div key={i} className="flex-1 flex flex-col justify-end items-center gap-px">
                        <div className="w-full bg-red-500 opacity-50" style={{ height: `${(rVal / max) * 100}%` }}></div>
                        <div className="w-full bg-green-500 opacity-50" style={{ height: `${(gVal / max) * 100}%` }}></div>
                        <div className="w-full bg-blue-500 opacity-50" style={{ height: `${(bVal / max) * 100}%` }}></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-1 md:gap-2">
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              disabled={!image}
              className={`${showOriginal ? 'bg-green-600' : 'bg-gray-800'} hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed px-2 md:px-4 py-2 rounded text-xs md:text-sm flex items-center gap-1 md:gap-2`}
              title="Toggle between original and edited view. Click repeatedly to compare changes."
            >
              <Eye size={14} />
              <span className="hidden sm:inline">{showOriginal ? 'Edited' : 'Original'}</span>
            </button>
            <button
              onClick={resetSettings}
              className="bg-gray-800 hover:bg-gray-700 px-2 md:px-4 py-2 rounded text-xs md:text-sm flex items-center gap-1 md:gap-2"
              title="Reset all filters and adjustments to default values"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={handleZoomOut}
              disabled={!image}
              className="bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed px-2 py-2 rounded text-xs md:text-sm"
              title="Zoom out (Ctrl/Cmd + Scroll)"
            >
              <ZoomOut size={14} />
            </button>
            <button
              onClick={handleZoomFit}
              disabled={!image}
              className="bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed px-2 py-2 rounded text-xs md:text-sm"
              title="Fit to view (Reset zoom)"
            >
              <Maximize2 size={14} />
            </button>
            <button
              onClick={handleZoomIn}
              disabled={!image}
              className="bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed px-2 py-2 rounded text-xs md:text-sm"
              title="Zoom in (Ctrl/Cmd + Scroll)"
            >
              <ZoomIn size={14} />
            </button>
            <span className="hidden md:inline text-xs text-gray-500">
              {zoom !== 1 ? `${Math.round(zoom * 100)}%` : ''}
            </span>
            <button
              onClick={downloadImage}
              disabled={!image || isDownloading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:cursor-not-allowed px-2 md:px-4 py-2 rounded text-xs md:text-sm flex items-center gap-1 md:gap-2"
              title={`Save as ${originalFormat.toUpperCase()}. Matches original format.`}
            >
              <Download size={14} className={isDownloading ? 'animate-bounce' : ''} />
              <span className="hidden sm:inline">{isDownloading ? 'Downloading...' : `Download ${originalFormat.toUpperCase()}`}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-65px)] overflow-hidden relative">
        {/* Sidebar Controls */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-20 w-80 bg-gray-800 border-r border-gray-700 flex flex-col overflow-hidden h-full transition-transform duration-300`}>
          <div className="flex-1 overflow-y-auto">
            <div className="p-2.5 md:p-3 space-y-2">
              {/* Upload Section */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex items-center justify-center w-full px-3 py-4 bg-gray-700 rounded-lg border-2 border-dashed cursor-pointer transition ${
                  isDragging ? 'border-blue-400 bg-blue-500/10' : 'border-gray-600 hover:border-blue-500'
                }`}
              >
                <label className="cursor-pointer text-center w-full">
                  <Upload className="mx-auto mb-1.5" size={20} />
                  <span className="text-[11px] block">{isDragging ? 'Drop image here' : 'Upload or Drop Image'}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/tiff,image/tif,image/heic,image/heif,image/webp,.png,.jpg,.jpeg,.tiff,.tif,.heic,.heif"
                    onChange={handleImageUpload}
                    className="hidden"
                    title="Accepts PNG, JPEG, TIFF, HEIC/HEIF, WebP. All edits saved as lossless PNG."
                  />
                </label>
              </div>

              {/* Lighting Presets */}
              <div className="border-t border-gray-700 pt-2">
                <label className="block text-[10px] font-medium mb-1 text-gray-400 uppercase tracking-wide" title="Auto-adjust settings based on shooting conditions. Fixes common problems like harsh shadows or flat lighting.">
                  Lighting Conditions
                </label>
                <select
                  value={lightingPreset}
                  onChange={(e) => applyLightingPreset(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                  title="Select the lighting conditions when photo was taken"
                >
                  {Object.entries(lightingPresets).map(([key, preset]) => (
                    <option key={key} value={key}>
                      {preset.name}
                    </option>
                  ))}
                </select>
                {lightingPreset !== 'none' && (
                  <p className="text-[10px] text-gray-400 mt-1">
                    {lightingPresets[lightingPreset as keyof typeof lightingPresets].desc}
                  </p>
                )}
              </div>

              {/* Filters Section */}
              <div className="space-y-1.5">
                {Object.entries(filterGroups).map(([groupKey, group]) => (
                  <div key={groupKey}>
                    <label className="block text-[10px] font-medium mb-1 text-gray-400 uppercase tracking-wide">
                      {group.title}
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(group.filters).map(([key, filterInfo]) => (
                        <button
                          key={key}
                          onClick={() => setFilter(key)}
                          title={filterInfo.desc}
                          className={`flex-1 min-w-[45px] px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
                            filter === key
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {filterInfo.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Basic Adjustments */}
              <div className="border-t border-gray-700 pt-2">
                <label className="block text-[10px] font-medium mb-1.5 text-gray-400 uppercase tracking-wide">Basic</label>
                <div className="space-y-1.5">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-300 flex justify-between items-center" title="Adjusts overall image lightness. Increase for dark photos, decrease for overexposed images.">
                      <span>Brightness</span>
                      <span className="flex items-center gap-1">
                        <span className="text-gray-400">{brightness}%</span>
                        {brightness !== 100 && (
                          <button onClick={() => setBrightness(100)} className="text-gray-500 hover:text-blue-400 transition-colors" title="Reset to 100%">
                            <RefreshCw size={10} />
                          </button>
                        )}
                      </span>
                    </label>
                    <div className="slider-container">
                      <div className="default-marker" style={{ left: '50%' }}></div>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={brightness}
                        onChange={(e) => setBrightness(Number(e.target.value))}
                        className="w-full"
                        title="Adjusts overall image lightness"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-300 flex justify-between items-center" title="Difference between light and dark areas. Increase to make pigments pop against rock surface.">
                      <span>Contrast</span>
                      <span className="flex items-center gap-1">
                        <span className="text-gray-400">{contrast}%</span>
                        {contrast !== 100 && (
                          <button onClick={() => setContrast(100)} className="text-gray-500 hover:text-blue-400 transition-colors" title="Reset to 100%">
                            <RefreshCw size={10} />
                          </button>
                        )}
                      </span>
                    </label>
                    <div className="slider-container">
                      <div className="default-marker" style={{ left: '50%' }}></div>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={contrast}
                        onChange={(e) => setContrast(Number(e.target.value))}
                        className="w-full"
                        title="Difference between light and dark areas"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-300 flex justify-between items-center" title="Color intensity. Increase to make pigment colors more vivid. Decrease for subtle, natural look.">
                      <span>Saturation</span>
                      <span className="flex items-center gap-1">
                        <span className="text-gray-400">{saturation}%</span>
                        {saturation !== 100 && (
                          <button onClick={() => setSaturation(100)} className="text-gray-500 hover:text-blue-400 transition-colors" title="Reset to 100%">
                            <RefreshCw size={10} />
                          </button>
                        )}
                      </span>
                    </label>
                    <div className="slider-container">
                      <div className="default-marker" style={{ left: '50%' }}></div>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={saturation}
                        onChange={(e) => setSaturation(Number(e.target.value))}
                        className="w-full"
                        title="Color intensity"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhancement Tools */}
              <div className="border-t border-gray-700 pt-2">
                <label className="block text-[10px] font-medium mb-1.5 text-gray-400 uppercase tracking-wide">Enhancement</label>
                <div className="space-y-1.5">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-300 flex justify-between items-center" title="Brightens dark shadowed areas without affecting the rest. Reveals pigments in cave entrances or overhangs.">
                      <span>Shadow Recovery</span>
                      <span className="flex items-center gap-1">
                        <span className="text-gray-400">{shadowRecovery}%</span>
                        {shadowRecovery !== 0 && (
                          <button onClick={() => setShadowRecovery(0)} className="text-gray-500 hover:text-blue-400 transition-colors" title="Reset to 0%">
                            <RefreshCw size={10} />
                          </button>
                        )}
                      </span>
                    </label>
                    <div className="slider-container">
                      <div className="default-marker" style={{ left: '0%' }}></div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={shadowRecovery}
                        onChange={(e) => setShadowRecovery(Number(e.target.value))}
                        className="w-full"
                        title="Brightens dark shadowed areas"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-300 flex justify-between items-center" title="Darkens bright overexposed areas. Recovers detail in sunlit patches or reflective surfaces.">
                      <span>Highlight Recovery</span>
                      <span className="flex items-center gap-1">
                        <span className="text-gray-400">{highlightRecovery}%</span>
                        {highlightRecovery !== 0 && (
                          <button onClick={() => setHighlightRecovery(0)} className="text-gray-500 hover:text-blue-400 transition-colors" title="Reset to 0%">
                            <RefreshCw size={10} />
                          </button>
                        )}
                      </span>
                    </label>
                    <div className="slider-container">
                      <div className="default-marker" style={{ left: '0%' }}></div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={highlightRecovery}
                        onChange={(e) => setHighlightRecovery(Number(e.target.value))}
                        className="w-full"
                        title="Darkens bright overexposed areas"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-300 flex justify-between items-center" title="Sharpens edges and textures. Makes faint lines and boundaries more visible. Use carefully - can create noise at high values.">
                      <span>Clarity</span>
                      <span className="flex items-center gap-1">
                        <span className="text-gray-400">{clarity}%</span>
                        {clarity !== 0 && (
                          <button onClick={() => setClarity(0)} className="text-gray-500 hover:text-blue-400 transition-colors" title="Reset to 0%">
                            <RefreshCw size={10} />
                          </button>
                        )}
                      </span>
                    </label>
                    <div className="slider-container">
                      <div className="default-marker" style={{ left: '0%' }}></div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={clarity}
                        onChange={(e) => setClarity(Number(e.target.value))}
                        className="w-full"
                        title="Sharpens edges and textures"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-300 flex justify-between items-center" title="Cuts through haze and atmospheric effects. Boosts contrast in low-light conditions. Useful for outdoor photos with dust or moisture in the air.">
                      <span>Dehaze</span>
                      <span className="flex items-center gap-1">
                        <span className="text-gray-400">{dehaze}%</span>
                        {dehaze !== 0 && (
                          <button onClick={() => setDehaze(0)} className="text-gray-500 hover:text-blue-400 transition-colors" title="Reset to 0%">
                            <RefreshCw size={10} />
                          </button>
                        )}
                      </span>
                    </label>
                    <div className="slider-container">
                      <div className="default-marker" style={{ left: '0%' }}></div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={dehaze}
                        onChange={(e) => setDehaze(Number(e.target.value))}
                        className="w-full"
                        title="Cuts through haze and atmospheric effects"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-medium text-gray-300 flex items-center gap-1" title="Reduces image noise and grain. Median: best for salt-and-pepper noise. Gaussian: smooth reduction. Bilateral: edge-preserving.">
                        <span>Noise Reduction</span>
                        <span className="text-gray-400">{noiseReduction}%</span>
                        {noiseReduction !== 0 && (
                          <button onClick={() => setNoiseReduction(0)} className="text-gray-500 hover:text-blue-400 transition-colors" title="Reset to 0%">
                            <RefreshCw size={10} />
                          </button>
                        )}
                      </label>
                      <select
                        value={noiseAlgorithm}
                        onChange={(e) => setNoiseAlgorithm(e.target.value as 'median' | 'gaussian' | 'bilateral')}
                        className="bg-gray-700 border border-gray-600 text-gray-200 rounded px-1.5 py-0.5 text-[10px]"
                        title="Noise reduction algorithm"
                      >
                        <option value="median">Median</option>
                        <option value="gaussian">Gaussian</option>
                        <option value="bilateral">Bilateral</option>
                      </select>
                    </div>
                    <div className="slider-container">
                      <div className="default-marker" style={{ left: '0%' }}></div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={noiseReduction}
                        onChange={(e) => setNoiseReduction(Number(e.target.value))}
                        className="w-full"
                        title="Reduces image noise and grain"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-medium text-gray-300 flex items-center gap-1" title="Enhances edge definition and detail. Unsharp: standard sharpening. Highpass: aggressive. Laplacian: edge enhancement.">
                        <span>Sharpening</span>
                        <span className="text-gray-400">{sharpening}%</span>
                        {sharpening !== 0 && (
                          <button onClick={() => setSharpening(0)} className="text-gray-500 hover:text-blue-400 transition-colors" title="Reset to 0%">
                            <RefreshCw size={10} />
                          </button>
                        )}
                      </label>
                      <select
                        value={sharpenAlgorithm}
                        onChange={(e) => setSharpenAlgorithm(e.target.value as 'unsharp' | 'highpass' | 'laplacian')}
                        className="bg-gray-700 border border-gray-600 text-gray-200 rounded px-1.5 py-0.5 text-[10px]"
                        title="Sharpening algorithm"
                      >
                        <option value="unsharp">Unsharp</option>
                        <option value="highpass">Highpass</option>
                        <option value="laplacian">Laplacian</option>
                      </select>
                    </div>
                    <div className="slider-container">
                      <div className="default-marker" style={{ left: '0%' }}></div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sharpening}
                        onChange={(e) => setSharpening(Number(e.target.value))}
                        className="w-full"
                        title="Enhances edge definition and detail"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Loading Overlay */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
            <div className="bg-gray-800 rounded-lg p-8 flex flex-col items-center gap-4 border border-gray-700">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="text-white text-lg">{processingMessage}</p>
            </div>
          </div>
        )}

        {/* Main Canvas Area */}
        <div className="flex-1 bg-gray-900 flex flex-col overflow-hidden">
          {imageDimensions && (
            <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 text-xs text-gray-400 flex items-center justify-between">
              <span>Image: {imageDimensions.width} × {imageDimensions.height} px</span>
              <span className="text-green-400">✓ Original size preserved</span>
            </div>
          )}

          <div
            className="flex-1 flex items-center justify-center p-4 overflow-hidden"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: isPanning ? 'grabbing' : zoom > 1 ? 'grab' : 'default' }}
          >
            {!image ? (
              <div className="text-center text-gray-500">
                <Upload size={64} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg mb-2">Upload an image to begin</p>
                <p className="text-sm text-gray-600">Drag and drop or use the upload button</p>
              </div>
            ) : (
              <div
                className="relative max-w-full max-h-full flex items-center justify-center"
                style={{
                  transform: `scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px)`,
                  transformOrigin: 'center center',
                  transition: isPanning ? 'none' : 'transform 0.1s ease-out'
                }}
              >
                <canvas
                  ref={canvasRef}
                  className="border border-gray-700 shadow-2xl"
                  style={{
                    maxWidth: '100%',
                    maxHeight: 'calc(100vh - 120px)',
                    objectFit: 'contain',
                    pointerEvents: 'none'
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden original canvas */}
      <canvas ref={originalCanvasRef} className="hidden" />
    </div>
  );
};

export default DStretch;
