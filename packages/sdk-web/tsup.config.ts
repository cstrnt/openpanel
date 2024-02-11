import { defineConfig } from 'tsup';

import config from '@mixan/tsconfig/tsup.config.json' assert { type: 'json' };

export default defineConfig({
  ...(config as any),
  entry: ['index.ts', 'cdn.ts'],
  format: ['cjs', 'esm', 'iife'],
});
