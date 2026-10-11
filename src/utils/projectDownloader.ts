import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export async function downloadProjectZip(): Promise<void> {
  const zip = new JSZip();

  // Root config files
  zip.file(
    'package.json',
    JSON.stringify(
      {
        name: 'rectifier-simulation-lab',
        private: true,
        version: '1.0.0',
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview',
        },
        dependencies: {
          '@tailwindcss/vite': '^4.3.3',
          '@vitejs/plugin-react': '^6.1.1',
          'lucide-react': '^0.546.0',
          'react': '^19.0.1',
          'react-dom': '^19.0.1',
          'tailwindcss': '^4.3.3',
          'vite': '^8.3.0',
        },
        devDependencies: {
          '@types/node': '^22.14.0',
          '@types/react': '^19.3.0',
          '@types/react-dom': '^19.3.0',
          'typescript': '^7.0.2',
        },
      },
      null,
      2
    )
  );

  zip.file(
    'vite.config.ts',
    `import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
`
  );

  zip.file(
    'tsconfig.json',
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          useDefineForClassFields: false,
          module: 'ESNext',
          types: ['vite/client'],
          lib: ['ES2022', 'DOM', 'DOM.Iterable'],
          skipLibCheck: true,
          moduleResolution: 'bundler',
          isolatedModules: true,
          moduleDetection: 'force',
          jsx: 'react-jsx',
          paths: { '@/*': ['./*'] },
          noEmit: true,
        },
      },
      null,
      2
    )
  );

  zip.file(
    'index.html',
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Rectifier Circuits & Converters Simulation Lab</title>
    <meta name="description" content="Controlled and Uncontrolled Rectifier Simulation Workbench with Real-Time Waveforms and Transfer Characteristic Plot." />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body class="bg-slate-50 text-slate-800 antialiased font-sans">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`
  );

  zip.file(
    '.gitignore',
    `node_modules
dist
dist-ssr
*.local
.env
.DS_Store
`
  );

  zip.file(
    'README.md',
    `# Rectifier & Converter Simulation Lab

Interactive Power Electronics Simulation Workbench for Controlled (SCR) and Uncontrolled (Diode) Rectifiers.

## Quick Start
\`\`\`bash
npm install
npm run dev
\`\`\`
`
  );

  // GitHub Actions Workflow
  const githubWorkflows = zip.folder('.github')?.folder('workflows');
  githubWorkflows?.file(
    'deploy.yml',
    `name: Deploy to GitHub Pages

on:
  push:
    branches: [main, master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install --legacy-peer-deps
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    needs: build
    runs-on: ubuntu-latest
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
`
  );

  // Source Folder
  const src = zip.folder('src');
  src?.file(
    'main.tsx',
    `import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
`
  );

  src?.file(
    'index.css',
    `@import "tailwindcss";

@layer base {
  body {
    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  }
  code, kbd, samp, pre, .font-mono {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
  }
}
`
  );

  // Also include built dist static files for direct drag & drop upload
  const dist = zip.folder('dist');
  try {
    const resHtml = await fetch('./index.html').catch(() => null);
    if (resHtml && resHtml.ok) {
      const htmlText = await resHtml.text();
      dist?.file('index.html', htmlText);
    }
  } catch (e) {
    // ignore
  }

  // Generate Zip
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'Rectifier-Simulation-Lab.zip');
}
