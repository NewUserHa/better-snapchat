const ESBuild = require('esbuild');
const EsbuildPluginImportGlob = require('esbuild-plugin-import-glob');
const CSSModulesPlugin = require('esbuild-css-modules-plugin');
const package = require('../package.json');
const fs = require('fs/promises');
const alias = require('esbuild-plugin-alias');
const dotenv = require('dotenv');
const chokidar = require('chokidar');
const { WebSocketServer } = require('ws');

dotenv.config();

const manifest = {
  manifest_version: 3,
  name: package.name,
  description: package.description,
  version: package.version,
  icons: { 32: 'logo32.png', 48: 'logo48.png', 96: 'logo96.png', 128: 'logo128.png' },
  host_permissions: ['https://web.snapchat.com/*', 'https://www.snapchat.com/web/*'],
  background: { service_worker: './build/hmr.js' },
  permissions: ['webNavigation', 'scripting', 'tabs', 'activeTab'],
  web_accessible_resources: [{ resources: ['./build/*'], matches: ['https://web.snapchat.com/*', 'https://www.snapchat.com/web/*'] }],
};

async function buildExtension() {
  await Promise.all([
    ESBuild.build({
      entryPoints: ['./src/script', './src/hmr'],
      bundle: true,
      minify: true,
      sourcemap: true,
      target: ['chrome58'],
      outbase: './src/',
      outdir: './public/build/',
      logLevel: 'info',
      plugins: [
        EsbuildPluginImportGlob.default(),
        CSSModulesPlugin(),
        alias({
          react: require.resolve('preact/compat'),
          'react-dom': require.resolve('preact/compat'),
        }),
      ],
      define: {
        'process.env.VERSION': JSON.stringify(package.version),
        'process.env.HMR_PORT': process.env.HMR_PORT,
      },
    }),
    fs.writeFile('./public/manifest.json', JSON.stringify(manifest, null, 2)),
  ]);
}

(() => {
  const hmrPort = process.env.HMR_PORT ?? 8080;
  const websocket = new WebSocketServer({ port: hmrPort });

  chokidar.watch('./src').on('change', async (filePath) => {
    console.log('File changed:', filePath);
    console.log('Rebuilding...');

    await buildExtension();
    websocket.clients.forEach((client) => client.send('reload'));

    console.log('Reloaded all clients');
  });

  setInterval(() => {
    websocket.clients.forEach((client) => client.send('ping'));
  }, 60e3);

  console.log('Building: Chrome Extension');
  buildExtension();
})();
