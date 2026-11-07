import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const docsDir = path.join(rootDir, 'docs');

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('[postbuild] Cleaning dist/index.html for production static hosting...');
const distIndexPath = path.join(distDir, 'index.html');
if (fs.existsSync(distIndexPath)) {
  let html = fs.readFileSync(distIndexPath, 'utf8');
  // Strip any root-only fallback redirect so production builds never trigger redirect loops
  html = html.replace(/<!-- GITHUB_PAGES_ROOT_FALLBACK_START -->[\s\S]*?<!-- GITHUB_PAGES_ROOT_FALLBACK_END -->/g, '');
  fs.writeFileSync(distIndexPath, html, 'utf8');

  // Create dist/404.html for GitHub Pages SPA routing
  const dist404Path = path.join(distDir, '404.html');
  fs.writeFileSync(dist404Path, html, 'utf8');
  console.log('[postbuild] Created dist/404.html');
}

// Add .nojekyll to dist to bypass Jekyll on GitHub Pages
fs.writeFileSync(path.join(distDir, '.nojekyll'), '', 'utf8');
fs.writeFileSync(path.join(rootDir, '.nojekyll'), '', 'utf8');

// Copy dist to docs
console.log('[postbuild] Syncing dist to docs folder for GitHub Pages branch deployment...');
if (fs.existsSync(docsDir)) {
  fs.rmSync(docsDir, { recursive: true, force: true });
}
copyDirRecursive(distDir, docsDir);
fs.writeFileSync(path.join(docsDir, '.nojekyll'), '', 'utf8');

console.log('[postbuild] Successfully built docs/ and dist/ with .nojekyll and 404 fallback!');
