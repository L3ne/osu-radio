import { define } from 'bun';

export default {
  preload: [],
  target: 'bun',
  entrypoints: ['./src/app/layout.tsx'],
  outdir: './dist',
};
