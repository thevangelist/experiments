# DStretch - Browser-Based Image Enhancement for Rock Art

A powerful, browser-based image enhancement tool specifically designed for rock art analysis and photography. DStretch applies specialized color filters and advanced image processing techniques to reveal hidden details in rock art images.

## Features

### Color Enhancement Filters
- **Adaptive DStretch (Smart)** - Intelligent filter that adapts to image content
- **YRE (Yellow-Red Enhancement)** - Enhances yellow and red pigments
- **YRD (Yellow-Red-Deep)** - Deep enhancement for yellow-red tones
- **LRE (Long Red Enhancement)** - Enhanced red channel processing
- **LDS (Long Deep Stretch)** - Deep spectral stretching
- **LAB (L*A*B Enhancement)** - LAB color space processing
- **CRGB (Color RGB)** - RGB channel enhancement
- **YBR (Yellow-Blue-Red)** - Multi-channel enhancement
- **LABI (LAB Invert)** - Inverted LAB processing

### Advanced Image Processing
- **Zoned DStretch** - Apply different filters to specific image regions
- **Smart Masking** - Automatically exclude problematic areas (shadows, highlights, vegetation)
- **Shadow Recovery** - Brighten and recover detail in dark areas
- **Highlight Recovery** - Darken and preserve detail in bright areas
- **Clarity Enhancement** - Unsharp mask for improved detail
- **Dehaze** - Reduce atmospheric haze and improve contrast
- **Brightness/Contrast/Saturation** - Standard adjustments with fine control

### User Interface
- Real-time preview of all adjustments
- Interactive zone drawing for selective filtering
- Visual mask overlay to show excluded areas
- Export enhanced images in PNG format
- Responsive design that works on all devices

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

1. **Upload Image**: Click the upload area or drag and drop an image
2. **Select Filter**: Choose from various DStretch filters
3. **Adjust Settings**: Fine-tune brightness, contrast, saturation, etc.
4. **Zone Mode** (Optional): Enable zoned mode to apply different filters to specific areas
   - Select a filter
   - Draw a rectangle on the image
   - Repeat for multiple zones
5. **Smart Masking** (Optional): Enable to automatically exclude problematic areas
6. **Download**: Save your enhanced image

## Technical Details

### Technology Stack
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Canvas API** - Image processing
- **Lucide React** - Icons

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
