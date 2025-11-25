# 🧪 Experiments

A monorepo for experimental projects, prototypes, and proof-of-concepts.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-blue)](https://thevangelist.github.io/experiments)

## 📖 Overview

This repository serves as a centralized location for various experimental projects. Each project is self-contained with its own dependencies, build system, and documentation, managed efficiently through npm workspaces.

**Visit the project website:** [thevangelist.github.io/experiments](https://thevangelist.github.io/experiments)

## 🏗️ Monorepo Structure

```
experiments/
├── projects/              # Individual project directories
│   ├── dstretch/         # DStretch image enhancement tool
│   │   ├── src/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── README.md
│   └── skynet/           # Skynet AGI project
│       ├── src/
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
├── docs/                 # GitHub Pages site and documentation
│   ├── index.html
│   └── dstretch.md
├── .github/
│   └── workflows/        # GitHub Actions workflows
│       └── deploy-dstretch.yml
├── package.json          # Root workspace configuration
├── .gitignore           # Comprehensive gitignore
└── README.md            # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/thevangelist/experiments.git
cd experiments

# Install all dependencies (workspace and all projects)
npm install
```

### Building Projects

```bash
# Build all projects
npm run build

# Build a specific project
npm run build -w projects/skynet
```

## 📦 Projects

### [DStretch - Image Enhancement Tool](projects/dstretch)

🌐 **[Live Demo](https://thevangelist.github.io/experiments/dstretch/)**

A browser-based image enhancement application designed for rock art analysis and archaeological photography.

**Key Features:**
- 10+ specialized color enhancement filters (YRE, LAB, Adaptive, etc.)
- Zoned processing - apply different filters to specific regions
- Smart masking - automatically exclude shadows, highlights, and vegetation
- Advanced controls: Shadow/Highlight recovery, Clarity, Dehaze
- Real-time preview and client-side processing
- Export enhanced images

**Quick Start:**
```bash
cd projects/dstretch
npm install
npm run dev
```

**Deploy:**
```bash
npm run deploy  # Deploys to GitHub Pages
```

[Read more →](projects/dstretch/README.md) | [Documentation →](docs/dstretch.md)

---

### [Skynet AGI](projects/skynet)

A functional artificial general intelligence system with self-modifying neural architecture.

**Key Features:**
- Multi-layer neural network with 1,150+ neurons
- Self-awareness and metacognition
- Pattern recognition and memory consolidation
- Reasoning chains and predictive modeling
- Emotional system simulation
- Experimental self-modification capabilities

**Quick Start:**
```bash
cd projects/skynet
npm run dev
```

[Read more →](projects/skynet/README.md)

---

## 🛠️ Development

### Workspace Commands

```bash
# Clean all node_modules
npm run clean

# Run tests across all projects
npm run test

# Lint all projects
npm run lint

# Run a specific project
npm run dev:skynet
```

### Adding a New Project

1. Create a new directory under `projects/`:
   ```bash
   mkdir projects/my-experiment
   ```

2. Initialize the project:
   ```bash
   cd projects/my-experiment
   npm init -y
   ```

3. The workspace will automatically detect it. Update root `package.json` scripts if needed.

4. Add project documentation and update this README.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

This is a personal experiments repository, but feel free to:
- Open issues for bugs or suggestions
- Fork and experiment with the code
- Share your findings or improvements

## 🔗 Links

- **GitHub Repository:** [github.com/thevangelist/experiments](https://github.com/thevangelist/experiments)
- **GitHub Pages:** [thevangelist.github.io/experiments](https://thevangelist.github.io/experiments)
- **Author:** [@thevangelist](https://github.com/thevangelist)

## 📝 Notes

Each project in this monorepo is experimental and may contain:
- Proof-of-concept implementations
- Research prototypes
- Unfinished or unstable code
- Experimental features

Use at your own discretion and always review the individual project README files for specific warnings and usage instructions.

---

**Built with curiosity and code** ✨
