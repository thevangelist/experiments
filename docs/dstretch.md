# DStretch Image Enhancement Tool

## Overview

DStretch is a browser-based image enhancement application specifically designed for rock art analysis. It provides specialized color filters and advanced image processing techniques to reveal hidden details in rock art photography.

## Live Demo

🌐 **Live Application**: https://thevangelist.github.io/experiments/dstretch/

## What is DStretch?

DStretch is inspired by the desktop software of the same name used by archaeologists worldwide to digitally enhance images of rock art (pictographs and petroglyphs). This browser-based version brings these powerful enhancement capabilities to the web, making them accessible without any software installation.

### Why DStretch?

Rock art photography often faces challenges:
- Faded pigments that are barely visible
- Poor lighting conditions
- Atmospheric haze or patina
- Vegetation obscuring details
- Variable lighting across the rock surface

DStretch addresses these challenges through:
- Specialized color space transformations
- Selective channel enhancement
- Intelligent masking of problematic areas
- Zone-based processing for variable conditions

## Key Features

### 1. Specialized Color Filters

The tool includes multiple scientifically-calibrated filters designed for different pigment types:

- **YRE (Yellow-Red Enhancement)** - Best for red ochre and similar pigments
- **YRD (Yellow-Red-Deep)** - Deep enhancement for faded red pigments
- **LRE (Long Red Enhancement)** - Maximum red channel enhancement
- **Adaptive Mode** - Automatically adapts to image content

### 2. Zoned Processing

Unlike many image editors, DStretch allows you to apply different filters to different regions:
- Draw rectangular zones on your image
- Apply a different filter to each zone
- Perfect for images with variable lighting or multiple pigment types

### 3. Smart Masking

Automatically detects and excludes problematic areas:
- Deep shadows (too dark to enhance)
- Blown highlights (overexposed areas)
- Vegetation (green plant matter)
- Visual overlay shows which areas are being excluded

### 4. Advanced Controls

Professional-grade image adjustments:
- **Shadow Recovery** - Brighten dark areas without affecting highlights
- **Highlight Recovery** - Preserve detail in bright areas
- **Clarity** - Local contrast enhancement (unsharp masking)
- **Dehaze** - Reduce atmospheric haze
- **Standard Controls** - Brightness, contrast, saturation

## Use Cases

### Archaeological Documentation
- Enhance faded pictographs for academic publication
- Reveal hidden details in rock art for analysis
- Create high-quality documentation of cultural heritage sites

### Photography Enhancement
- Improve rock art photographs taken in poor conditions
- Enhance details in geological formations
- Process images for research and education

### Conservation
- Document deteriorating rock art
- Track changes in pigment visibility over time
- Create baseline documentation for conservation efforts

## Technical Implementation

### Client-Side Processing
All image processing happens in your browser:
- No server uploads (your images stay private)
- No internet required after initial load
- Fast processing using Canvas API
- Works offline (can be installed as PWA)

### Technology Stack
- **React** - Modern UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Responsive styling
- **Canvas API** - Real-time image processing
- **Vite** - Fast build and development

### Image Processing Algorithms

The tool implements several advanced techniques:

1. **Color Space Transformations** - RGB to LAB conversions for perceptually-uniform color adjustments
2. **Selective Channel Enhancement** - Independent manipulation of color channels
3. **Unsharp Masking** - Edge detection and enhancement for clarity
4. **Adaptive Tone Mapping** - Smart shadow/highlight recovery
5. **Vegetation Detection** - Algorithmic detection of green plant matter

## Getting Started

### For Users

1. Visit the live app: https://thevangelist.github.io/experiments/dstretch/
2. Upload an image (drag and drop or click to browse)
3. Select a filter type
4. Adjust settings to taste
5. Download your enhanced image

### For Developers

See the [project README](../projects/dstretch/README.md) for:
- Installation instructions
- Development setup
- Build configuration
- Deployment guide

## Comparison with Desktop DStretch

### Advantages of Browser Version
- No installation required
- Works on any device with a browser
- Automatic updates
- Shareable via URL
- Free and open source

### Desktop Version Features
- More filter presets
- Batch processing
- Advanced color calibration
- Integration with ImageJ

## Future Enhancements

Planned features:
- [ ] Additional filter presets from desktop version
- [ ] Histogram visualization
- [ ] Before/after comparison slider
- [ ] Batch processing multiple images
- [ ] Export settings presets
- [ ] Color picker for custom filters
- [ ] Mobile app version
- [ ] Advanced masking tools (polygon, freehand)

## Academic Use

This tool is designed for serious archaeological and scientific work. If you use DStretch in your research:

- Cite the original DStretch software
- Document your enhancement methodology
- Save both original and enhanced images
- Note filter types and settings used

## Contributing

This is part of the Experiments monorepo. Contributions welcome!

See the main [repository README](../README.md) for contribution guidelines.

## References

- Original DStretch software: http://www.dstretch.com/
- Rock Art Image Enhancement: [Academic papers and resources]
- Archaeological Photography: [Best practices guides]

## Support

For issues, questions, or feature requests, please use the GitHub issue tracker.

---

**Note**: While DStretch is a powerful tool, it should be used responsibly. Always:
- Keep original, unenhanced images
- Disclose enhancement methods in publications
- Avoid over-enhancement that creates artifacts
- Understand the limitations of digital enhancement
