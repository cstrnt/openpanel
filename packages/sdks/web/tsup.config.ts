import { defineConfig } from 'tsup';

import config from '@openpanel/tsconfig/tsup.config.json' assert { type: 'json' };

export default defineConfig({
  ...(config as any),
  entry: ['index.ts', 'src/tracker.ts'],
  format: ['cjs', 'esm', 'iife'],
});
