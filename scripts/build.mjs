import { readFile, writeFile, mkdir, rm, cp } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';

const root = fileURLToPath(new URL('../', import.meta.url));
const temporary = path.join(root, '.build');
const source = await readFile(path.join(root, 'index.html'), 'utf8');
const jsx = source.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
if (!jsx) throw new Error('The canonical playbook JSX was not found.');
await mkdir(temporary, { recursive: true });
try {
  const css = await postcss([tailwindcss({
    content: [{ raw: source, extension: 'html' }],
    theme: { extend: { colors: { accent: '#FF6A00' } } },
  })]).process('@tailwind base; @tailwind components; @tailwind utilities;', { from: undefined });
  await cp(path.join(root, 'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'), path.join(temporary, 'inter.woff2'));
  await writeFile(path.join(temporary, 'tailwind.css'), `@font-face { font-family: Inter; font-style: normal; font-weight: 100 900; font-display: swap; src: url('./inter.woff2') format('woff2'); }\n${css.css}`);
  await writeFile(path.join(temporary, 'entry.jsx'),
    `import React from 'react';\nimport * as ReactDOM from 'react-dom/client';\n${jsx[1]}`);
  const html = source
    .replace(/<script[^>]+src="https:\/\/(?:cdn\.tailwindcss\.com|unpkg\.com)[^"]*"[^>]*><\/script>/g, '')
    .replace(/<script>\s*tailwind\.config[\s\S]*?<\/script>/, '')
    .replace(/<link[^>]+(?:fonts\.googleapis\.com|fonts\.gstatic\.com)[^>]*>/g, '')
    .replace(jsx[0], '<script type="module" src="./entry.jsx"></script>')
    .replace(', maximum-scale=1.0, user-scalable=no', '')
    .replace('</head>', '<link rel="stylesheet" href="./tailwind.css" /></head>');
  await writeFile(path.join(temporary, 'index.html'), html);
  await build({ root: temporary, configFile: false, publicDir: false, base: './',
    build: { outDir: path.join(root, 'dist'), emptyOutDir: true }, logLevel: 'warn' });
  await cp(path.join(root, 'node_modules/@fontsource-variable/inter/LICENSE'), path.join(root, 'dist/INTER-LICENSE.txt'));
  console.log('Built the playbook with local JavaScript, compiled CSS and bundled fonts.');
} finally {
  await rm(temporary, { recursive: true, force: true });
}
