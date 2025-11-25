import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, RotateCcw, Sliders, Square, Trash2 } from 'lucide-react';

const DStretch = () => {
  const [image, setImage] = useState(null);
  const [filter, setFilter] = useState('none');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [dehaze, setDehaze] = useState(0);
  const [clarity, setClarity] = useState(0);
  const [shadowRecovery, setShadowRecovery] = useState(0);
  const [highlightRecovery, setHighlightRecovery] = useState(0);
  const [adaptiveEnhancement, setAdaptiveEnhancement] = useState(false);
  const [maskMode, setMaskMode] = useState(false);
  const [maskThreshold, setMaskThreshold] = useState(50);
  const [zonedMode, setZonedMode] = useState(false);
  const [zones, setZones] = useState([]);
  const [currentZone, setCurrentZone] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  const originalCanvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);

  const filters = {
    none: 'Original',
    adaptive: 'Adaptive DStretch (Smart)',
    yre: 'YRE (Yellow-Red Enhancement)',
    yrd: 'YRD (Yellow-Red-Deep)',
    lre: 'LRE (Long Red Enhancement)',
    lds: 'LDS (Long Deep Stretch)',
    lab: 'LAB (L*A*B Enhancement)',
    crgb: 'CRGB (Color RGB)',
    ybr: 'YBR (Yellow-Blue-Red)',
    labi: 'LABI (LAB Invert)'
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          drawOriginal(img);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const drawOriginal = (img) => {
    const canvas = originalCanvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
  };

  useEffect(() => {
    if (image) {
      applyFilter();
      drawZoneOverlay();
    }
  }, [image, filter, brightness, contrast, saturation, dehaze, clarity, shadowRecovery, highlightRecovery, adaptiveEnhancement, maskMode, maskThreshold, zones, zonedMode]);

  const applyFilter = () => {
    if (!image) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const origCanvas = originalCanvasRef.current;
    const origCtx = origCanvas.getContext('2d');

    canvas.width = image.width;
    canvas.height = image.height;

    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Create mask for problematic areas (too dark, too bright, or vegetation)
    const mask = new Uint8Array(data.length / 4);
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const idx = i / 4;

      const luminance = (r * 0.299 + g * 0.587 + b * 0.114);
      const greenness = g - (r + b) / 2; // Detect vegetation

      // Mark pixels as good (255) or bad (0) based on thresholds
      const tooDark = luminance < maskThreshold * 0.5;
      const tooBright = luminance > (255 - maskThreshold * 0.5);
      const isVegetation = greenness > 20 && g > 80;

      mask[idx] = (tooDark || tooBright || isVegetation) ? 0 : 255;
    }

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
          const maskIdx = y * width + x;

          // Only apply clarity to good areas
          if (!maskMode || mask[maskIdx] > 128) {
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
    }

    // Apply selected filter
    for (let i = 0; i < data.length; i += 4) {
      const idx = i / 4;
      const x = idx % canvas.width;
      const y = Math.floor(idx / canvas.width);

      // Check if pixel is in any zone
      let zoneFilter = filter;
      let applyToPixel = !maskMode || mask[idx] > 128;

      if (zonedMode && zones.length > 0) {
        for (const zone of zones) {
          if (x >= zone.x && x <= zone.x + zone.width &&
              y >= zone.y && y <= zone.y + zone.height) {
            zoneFilter = zone.filter;
            break;
          }
        }
      }

      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Adaptive DStretch mode
      if (zoneFilter === 'adaptive' && applyToPixel) {
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

      if (!applyToPixel) continue;

      switch (zoneFilter) {
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

      // Visualize mask if in mask mode
      if (maskMode) {
        const idx = i / 4;
        if (mask[idx] < 128) {
          // Overlay red tint on masked areas
          data[i] = Math.min(255, data[i] * 0.7 + 80);
          data[i + 1] = data[i + 1] * 0.5;
          data[i + 2] = data[i + 2] * 0.5;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const drawZoneOverlay = () => {
    if (!zonedMode || !image) return;

    const canvas = overlayCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const mainCanvas = canvasRef.current;

    canvas.width = mainCanvas.width;
    canvas.height = mainCanvas.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw existing zones
    zones.forEach((zone, index) => {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);

      ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
      ctx.fillRect(zone.x, zone.y, zone.width, zone.height);

      ctx.fillStyle = '#00ff00';
      ctx.font = '14px sans-serif';
      ctx.fillText(`Zone ${index + 1}: ${filters[zone.filter]}`, zone.x + 5, zone.y + 20);
    });

    // Draw current zone being created
    if (currentZone) {
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(currentZone.x, currentZone.y, currentZone.width, currentZone.height);
      ctx.setLineDash([]);
    }
  };

  const handleCanvasMouseDown = (e) => {
    if (!zonedMode) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setCurrentZone({ x, y, width: 0, height: 0, filter: filter });
    setIsDrawing(true);
  };

  const handleCanvasMouseMove = (e) => {
    if (!zonedMode || !isDrawing || !currentZone) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setCurrentZone({
      ...currentZone,
      width: x - currentZone.x,
      height: y - currentZone.y
    });
    drawZoneOverlay();
  };

  const handleCanvasMouseUp = () => {
    if (!zonedMode || !isDrawing || !currentZone) return;

    if (Math.abs(currentZone.width) > 10 && Math.abs(currentZone.height) > 10) {
      // Normalize negative dimensions
      const zone = {
        x: currentZone.width < 0 ? currentZone.x + currentZone.width : currentZone.x,
        y: currentZone.height < 0 ? currentZone.y + currentZone.height : currentZone.y,
        width: Math.abs(currentZone.width),
        height: Math.abs(currentZone.height),
        filter: currentZone.filter
      };
      setZones([...zones, zone]);
    }

    setCurrentZone(null);
    setIsDrawing(false);
  };

  const clearZones = () => {
    setZones([]);
    setCurrentZone(null);
  };

  const rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

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

  const hslToRgb = (h, s, l) => {
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
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
    const link = document.createElement('a');
    link.download = `dstretch-${filter}.png`;
    link.href = canvas.toDataURL();
    link.click();
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
    setMaskMode(false);
    setMaskThreshold(50);
    setZonedMode(false);
    setZones([]);
    setCurrentZone(null);
    setFilter('none');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">DStretch Image Enhancement</h1>
          <p className="text-gray-400">Upload rock art images and apply color filters to reveal hidden details</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="bg-gray-800 rounded-lg p-6 space-y-6">
            <div>
              <label className="flex items-center justify-center w-full px-4 py-8 bg-gray-700 rounded-lg border-2 border-dashed border-gray-600 hover:border-blue-500 cursor-pointer transition">
                <div className="text-center">
                  <Upload className="mx-auto mb-2" size={32} />
                  <span className="text-sm">Upload Image</span>
                </div>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Filter Type</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full bg-gray-700 rounded px-3 py-2 text-sm"
              >
                {Object.entries(filters).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              {zonedMode && (
                <p className="text-xs text-yellow-400 mt-1">
                  Selected filter will apply to new zones
                </p>
              )}
            </div>

            <div className="bg-gray-700 rounded p-3 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Zoned DStretch</label>
                <button
                  onClick={() => {
                    setZonedMode(!zonedMode);
                    if (zonedMode) clearZones();
                  }}
                  className={`px-3 py-1 rounded text-xs ${zonedMode ? 'bg-green-600' : 'bg-gray-600'}`}
                >
                  {zonedMode ? 'ON' : 'OFF'}
                </button>
              </div>
              <p className="text-xs text-gray-400">
                {zonedMode ? 'Draw rectangles to apply different filters per zone' : 'Apply different filters to specific areas'}
              </p>
              {zonedMode && zones.length > 0 && (
                <button
                  onClick={clearZones}
                  className="w-full bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs flex items-center justify-center gap-1"
                >
                  <Trash2 size={12} />
                  Clear All Zones ({zones.length})
                </button>
              )}
            </div>

            <div className="bg-gray-700 rounded p-3 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Smart Masking</label>
                <button
                  onClick={() => setMaskMode(!maskMode)}
                  className={`px-3 py-1 rounded text-xs ${maskMode ? 'bg-blue-600' : 'bg-gray-600'}`}
                >
                  {maskMode ? 'ON' : 'OFF'}
                </button>
              </div>
              <p className="text-xs text-gray-400">
                {maskMode ? 'Red overlay shows excluded areas' : 'Ignores shadows, highlights & vegetation'}
              </p>
              {maskMode && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Mask Sensitivity: {maskThreshold}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={maskThreshold}
                    onChange={(e) => setMaskThreshold(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Shadow Recovery: {shadowRecovery}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={shadowRecovery}
                onChange={(e) => setShadowRecovery(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Highlight Recovery: {highlightRecovery}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={highlightRecovery}
                onChange={(e) => setHighlightRecovery(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Brightness: {brightness}%
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Contrast: {contrast}%
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Saturation: {saturation}%
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={saturation}
                onChange={(e) => setSaturation(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Dehaze: {dehaze}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={dehaze}
                onChange={(e) => setDehaze(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Clarity: {clarity}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={clarity}
                onChange={(e) => setClarity(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={resetSettings}
                className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded flex items-center justify-center gap-2"
              >
                <RotateCcw size={16} />
                Reset
              </button>
              <button
                onClick={downloadImage}
                disabled={!image}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-4 py-2 rounded flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Download
              </button>
            </div>
          </div>

          {/* Canvas Display */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-center min-h-[500px]">
              {!image ? (
                <div className="text-center text-gray-500">
                  <Sliders size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Upload an image to begin enhancement</p>
                </div>
              ) : (
                <div className="w-full overflow-auto">
                  <div className="relative inline-block">
                    <canvas
                      ref={canvasRef}
                      onMouseDown={handleCanvasMouseDown}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                      onMouseLeave={handleCanvasMouseUp}
                      className={`max-w-full h-auto mx-auto border border-gray-700 rounded ${zonedMode ? 'cursor-crosshair' : ''}`}
                    />
                    <canvas
                      ref={overlayCanvasRef}
                      className="absolute top-0 left-0 pointer-events-none"
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hidden original canvas */}
        <canvas ref={originalCanvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default DStretch;
