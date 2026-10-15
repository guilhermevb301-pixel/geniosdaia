import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({ plugins: [react()], css: { postcss: { plugins: [] } }, test: { environment: 'jsdom', globals: true, include: ['src/test/*.test.tsx'] } });
