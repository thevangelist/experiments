# DStretch - Browser-Based Image Enhancement for Rock Art

A powerful, browser-based image enhancement tool specifically designed for rock art analysis and photography. DStretch applies specialized color filters and advanced image processing techniques to reveal hidden details in rock art images.

## Features

### Color Enhancement Filters

**Basic**
- **Original** - No filter, view unprocessed image
- **Adaptive** - Auto-detects vegetation, shadows, and rock surfaces. Reduces green (lichen/moss), enhances reds in dark areas

**Reds (Faint Ochre/Hematite)**
- **YRE** - Yellow-Red Enhancement: Strong red enhancement, faster but noisier
- **LRE** - Long Red Enhancement: Sharper, less artifact-prone than YRE

**Reds (General/Balanced)**
- **YRD** - Yellow-Red Deep: Pleasing overall red boost with less wild colors
- **LRD** - Long Red Deep: Milder variant with balanced enhancement

**General/Yellows**
- **YDS** - Yellow Deep Stretch: Versatile starter, highlights faint yellows/greens
- **LDS** - Long Deep Stretch: LAB variant, reduces JPEG noise

**Reds/Blacks (Multi-Pigment)**
- **YBR** - Yellow-Blue-Red: For subtle reds/blues
- **LAB** - L*A*B Color Space: Balanced, noise-resistant all-around use

**Blacks/Blues**
- **YBK** - Yellow-Black: Boosts dark pigments
- **LBK** - Long Black: Enhanced dark pigment visibility with blue tones

**Yellows/Whites**
- **YYE** - Yellow-Yellow Enhancement: Amplifies pale yellows
- **LYE** - Long Yellow Enhancement: Refined edges in schematic art
- **YWE** - Yellow-White Enhancement: Enhances white pigments

**Quick/High-Contrast**
- **CRGB** - Color RGB: Fast for initial red reveals, vivid but "crazy" colors
- **RGB0** - RGB Zero: High-contrast quick scan

### Advanced Image Processing
- **Lighting Presets** - Auto-adjust for different shooting conditions (bright sun, shade, cave, etc.)
- **Shadow Recovery** - Brighten and recover detail in dark areas
- **Highlight Recovery** - Darken and preserve detail in bright areas
- **Clarity Enhancement** - Sharpens edges and textures for improved detail
- **Dehaze** - Reduce atmospheric haze and improve contrast
- **Noise Reduction** - Three algorithms: Median, Gaussian, Bilateral
- **Sharpening** - Three algorithms: Unsharp, Highpass, Laplacian
- **Brightness/Contrast/Saturation** - Standard adjustments with fine control (0-200%)

### Zoom & View Controls
- **Zoom In/Out** - Ctrl/Cmd + Scroll to zoom
- **Fit to View** - Reset zoom to fit image
- **100% View** - View at 1:1 pixel ratio (actual size)
- **Pan** - Click and drag when zoomed in
- **Rendering Modes** - Switch between Smooth, Crisp, and Pixelated rendering
- **Original/Edited Toggle** - Compare before and after

### User Interface
- Real-time preview of all adjustments
- Mobile-friendly responsive design
- Collapsible sidebar for small screens
- Export in original format (JPEG, PNG, WebP)
- Supports HEIC, TIFF, and WebP image formats
- Page refresh warning when image is loaded
- Original image dimensions preserved

## Installation & Development

### Prerequisites
- Node.js 18+ and npm

### Setup
```bash
# Navigate to the dstretch project
cd projects/dstretch

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at http://localhost:3000

### Build for Production
```bash
npm run build
```

The optimized build will be created in the `dist` directory.

## Deployment to GitHub Pages

This project is configured to deploy automatically to GitHub Pages.

### Automatic Deployment (GitHub Actions)
When you push changes to the `main` branch, GitHub Actions will automatically:
1. Build the project
2. Deploy to GitHub Pages at: https://thevangelist.github.io/experiments/dstretch/

### Manual Deployment
```bash
# Build and deploy manually
npm run deploy
```

This will build the project and publish to the `gh-pages` branch under the `/dstretch` directory.

### Configuration
The deployment is configured in:
- `vite.config.ts` - Sets base path to `/experiments/dstretch/`
- `.github/workflows/deploy-dstretch.yml` - GitHub Actions workflow
- `package.json` - Deploy script using gh-pages

## Usage

1. **Upload Image**: Click the upload area or drag and drop an image (supports PNG, JPEG, TIFF, HEIC, WebP)
2. **Select Lighting Preset** (Optional): Choose shooting conditions for automatic adjustments
3. **Select Filter**: Choose from various DStretch filters organized by pigment type
4. **Adjust Settings**: Fine-tune brightness, contrast, saturation, enhancement tools
5. **Apply Noise Reduction/Sharpening** (Optional): Clean up noise or enhance detail
6. **Zoom & Pan**: Use zoom controls or Ctrl/Cmd + Scroll to inspect details
7. **Toggle Original/Edited**: Compare before and after
8. **Download**: Save your enhanced image in original format

## Technical Details

### Technology Stack
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Canvas API** - Image processing
- **Lucide React** - Icons
- **heic2any** - HEIC/HEIF conversion
- **UTIF** - TIFF support

### Image Processing
All image processing is done client-side using the HTML5 Canvas API. The tool:
- Manipulates raw pixel data for maximum control
- Applies filters using color space transformations
- Implements advanced techniques like unsharp masking for clarity
- Uses intelligent masking to detect and exclude problematic areas

### Performance
- Real-time processing for images up to 4K resolution
- Efficient pixel-level operations
- Responsive UI that doesn't block during processing

## Project Structure
```
projects/dstretch/
├── src/
│   ├── App.tsx              # Main app component
│   ├── DStretch.tsx         # Core DStretch component
│   ├── main.tsx             # React entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── index.html               # HTML template
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

## License

Part of the Experiments monorepo. See root LICENSE file.

## Credits

Inspired by the desktop DStretch software used in archaeological rock art analysis.
