import dts from 'vite-plugin-dts';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
    base: './',
    plugins: [
        dts({
            insertTypesEntry: true,
            rollupTypes: true,
        }),
        {
            // Ensure CJS consumers receive the default class on module.exports and module.exports.default
            name: 'align-cjs-default-export',
            generateBundle(_, bundle) {
                Object.values(bundle).forEach((outputChunk) => {
                    if (outputChunk.type !== 'chunk' || outputChunk.fileName !== 'index.cjs') {
                        return;
                    }
                    outputChunk.code += '\nconst BlotFormatter = module.exports.default || module.exports;\nObject.assign(BlotFormatter, module.exports);\nmodule.exports = BlotFormatter;\nmodule.exports.default = BlotFormatter;\n';
                });
            },
        },
        {
            name: 'copy-css',
            writeBundle() {
                // Ensure the css directory exists
                if (!existsSync('dist/css')) {
                    mkdirSync('dist/css', { recursive: true });
                }
                // Copy CSS file to dist/css
                copyFileSync('src/css/quill-blot-formatter2.css', 'dist/css/quill-blot-formatter2.css');
            }
        },
        // visualizer({ open: true, filename: 'stats.html' }) 
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'QuillBlotFormatter2',
            formats: ['es', 'cjs', 'umd'],
            fileName: (format) => {
                if (format === 'es') return 'index.esm.js';
                if (format === 'cjs') return 'index.cjs';
                if (format === 'umd') return 'index.js';
                return `index.${format}.js`;
            }
        },
        rollupOptions: {
            external: ['quill', 'parchment'],
            output: {
                name: 'QuillBlotFormatter2',
                globals: {
                    quill: 'Quill',
                    parchment: 'Parchment'
                },
                exports: 'named',
                preserveModules: false,
            },
            treeshake: {
                // Allow side effects in modules, false removes tooltip fix
                moduleSideEffects: true, 
                propertyReadSideEffects: false,
                tryCatchDeoptimization: false
            }
        },
        sourcemap: true,
        minify: 'esbuild',
        target: 'es2022'
    },
    server: {
        middlewareMode: false,
        fs: {
            strict: false,
            allow: ['..', '.', '../dist']
        },
        host: true,
        open: '/demo/',
    }
});
