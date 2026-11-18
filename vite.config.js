import { defineConfig } from 'vite';
import { readdirSync } from 'node:fs';
export default defineConfig({build:{manifest:true,rollupOptions:{input:Object.fromEntries(readdirSync('.').filter(f=>f.endsWith('.html')).map(f=>[f.replace('.html',''),f]))}}});
