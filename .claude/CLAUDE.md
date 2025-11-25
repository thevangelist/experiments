# Experiments Monorepo - Documentation

## UI Design System

### Design Philosophy
- **Inspired by**: Google Labs experiments page
- **Style**: Dark, minimalist, clean, information-dense
- **Target**: Technical/developer audience
- **No emojis** unless explicitly requested

### Color Palette

```css
/* Base */
--bg-primary: #000000 (black)
--text-primary: #d1d5db (gray-300)
--text-secondary: #9ca3af (gray-400)
--text-tertiary: #6b7280 (gray-500)

/* Accents */
--cyan-bright: #00d4ff
--purple-deep: #7b2cbf
--purple-light: #c77dff

/* Borders */
--border-color: #1f2937 (gray-800)

/* Backgrounds */
--card-bg: rgba(0, 0, 0, 0.4)
--tag-bg: rgba(31, 41, 55, 0.5)
```

### Typography

**Headings:**
- Main title: text-2xl, bold, gradient-text
- Hero headline: text-4xl md:text-5xl, bold, text-gray-200
- Section subtitle: text-lg, text-gray-400
- Card title: text-xl, bold, text-gray-200

**Body:**
- Description text: text-sm, text-gray-400, leading-relaxed
- Tags/metadata: text-xs, text-gray-500

### Layout Structure

**Max Width:** max-w-7xl (1280px)
**Spacing:** px-6, py-12, py-16
**Grid:** grid-cols-1 md:grid-cols-2 gap-8

**Page Structure:**
```html
<nav> → Top navigation bar
<header> → Hero section with description
<main> → 2-column project grid
<footer> → Footer with attribution
```

### Components

#### Navigation Bar
- Border: `border-b border-gray-800`
- Gradient logo text on left
- Links on right (GitHub, Docs)
- Hover: text-cyan-bright

#### Hero Section
- Border: `border-b border-gray-800`
- Small subtitle (text-lg text-gray-400)
- Large headline (text-4xl-5xl, text-gray-200)
- Max-width for readability (max-w-3xl)

#### Project Cards
Full card structure:
```html
<a href="..." class="group block border border-gray-800
                     hover:border-cyan-bright/50
                     bg-black/40
                     transition-all duration-300">
  <!-- Visual area (16:9 aspect ratio) -->
  <div class="aspect-video bg-gradient-to-br
              from-purple-deep/20 to-cyan-bright/10
              border-b border-gray-800"></div>

  <!-- Content area -->
  <div class="p-6">
    <!-- Title with optional status badge -->
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-xl font-bold text-gray-200
                 group-hover:text-cyan-bright
                 transition-colors">
        Project Name
      </h3>
      <span class="text-xs text-cyan-bright">LIVE</span>
    </div>

    <!-- Description -->
    <p class="text-sm text-gray-400 mb-4 leading-relaxed">
      Brief description of the project
    </p>

    <!-- Technology tags -->
    <div class="flex gap-2 text-xs text-gray-500">
      <span class="px-2 py-1 bg-gray-800/50 rounded">Tag</span>
      <span class="px-2 py-1 bg-gray-800/50 rounded">Tag</span>
    </div>
  </div>
</a>
```

**Card Visual Guidelines:**
- Use unique gradient for each project
- Gradients: `from-[color]/20 to-[color]/10`
- Keep aspect-video (16:9 ratio)
- Border between visual and content

**Project Status:**
- Live/deployed: Add "LIVE" badge in cyan-bright
- In development: No badge
- Position badge top-right next to title

### Visual Effects

**Gradient Text:**
```css
background: linear-gradient(135deg, #00d4ff, #c77dff, #7b2cbf);
animation: gradient-shift 8s ease infinite;
```

**Grid Background:**
```css
background-image:
  linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
  linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px);
background-size: 50px 50px;
```

**Hover States:**
- Card borders: gray-800 → cyan-bright/50
- Card titles: gray-200 → cyan-bright
- Nav links: gray-400 → cyan-bright
- Transition: duration-300

### Projects Grid Structure

**Layout:**
- 2-column grid on desktop (md:grid-cols-2)
- 1-column on mobile
- gap-8 between cards
- Cards are equal height

**Content Hierarchy per Card:**
1. Visual preview (aspect-video gradient)
2. Title + optional status badge
3. Description (1-2 sentences)
4. Technology tags (3-4 max)

**Adding New Projects:**
1. Create new card following structure above
2. Choose unique gradient colors from palette
3. Add 3-4 relevant technology tags
4. Include "LIVE" badge if deployed
5. Link to GitHub repo or live deployment

### Responsive Design

**Mobile (<768px):**
- Single column
- Full-width cards
- Stacked footer

**Desktop (≥768px):**
- 2-column grid
- Side-by-side footer layout

### Best Practices

1. **Consistency**: Same spacing, colors, effects across all UIs
2. **Contrast**: WCAG standards (gray-300/400 on black)
3. **Card-based**: Use cards for content organization
4. **Information density**: Compact but not overwhelming
5. **Subtle separators**: gray-800 borders
6. **Gradient accents**: Visual interest in placeholders
7. **Tag-based metadata**: Small rounded badges
8. **Smooth transitions**: All interactions smooth (300ms)
9. **No excessive animations**: Only gradient shifts
10. **Mobile-first**: Responsive by default

---

# GitHub Pages Setup

## Repository Structure

This repo deploys to GitHub Pages from the **main branch**.

### URLs
- **Root**: https://thevangelist.github.io/experiments/
- **Projects**: https://thevangelist.github.io/experiments/dstretch/

### Folder Structure

```
experiments/
├── index.html              ← Landing page (root)
├── .nojekyll              ← Disable Jekyll processing
├── dstretch/              ← Built DStretch app (deployed)
│   ├── index.html
│   ├── assets/
│   ├── favicon.png
│   └── logo.png
├── projects/              ← Source code (NOT deployed directly)
│   └── dstretch/
│       ├── src/
│       ├── dist/          ← Build output
│       ├── package.json
│       └── vite.config.ts
└── .github/
    └── workflows/
        └── deploy.yml     ← Automated deployment
```

## GitHub Pages Configuration

**Settings → Pages:**
- Source: Deploy from a branch
- Branch: `main`
- Folder: `/ (root)`

## Deployment Workflow

### For DStretch App

1. **Make changes** in `projects/dstretch/src/`

2. **Build the app:**
   ```bash
   cd projects/dstretch
   npm run build
   ```

3. **Copy build to root deployment folder:**
   ```bash
   cd ../..  # Back to repo root
   rm -rf dstretch/*
   cp -r projects/dstretch/dist/* dstretch/
   ```

4. **Commit and push:**
   ```bash
   git add dstretch/
   git commit -m "Update DStretch app"
   git push origin main
   ```

5. **GitHub Pages automatically deploys** (1-2 minutes)

### Automated Deployment (GitHub Actions)

The workflow at `.github/workflows/deploy.yml` automatically:
- Triggers on push to `main` affecting `projects/dstretch/**`
- Builds the project
- Copies to `_site/dstretch/`
- Deploys to GitHub Pages

**Note:** GitHub Actions workflow currently uses `actions/deploy-pages@v4` which requires specific permissions. For manual deployments, use the workflow above.

## Important Configuration Files

### `projects/dstretch/vite.config.ts`
```typescript
base: '/experiments/dstretch/'  // Must match deployment path
```

### `projects/dstretch/package.json`
```json
"deploy": "vite build && gh-pages -d dist -e dstretch"
```

## Common Issues

1. **404 on subdirectory**: Make sure `dstretch/index.html` exists at repo root
2. **Assets not loading**: Verify Vite `base` path matches deployment URL
3. **GitHub Pages not updating**: Check Settings → Pages is set to `main` branch
4. **Jekyll processing assets**: Ensure `.nojekyll` exists at root

## Adding New Projects

1. Create project in `projects/new-project/`
2. Build the project
3. Copy build output to `new-project/` at repo root
4. Update root `index.html` with link to new project
5. Commit and push

Access at: `https://thevangelist.github.io/experiments/new-project/`
