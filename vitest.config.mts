import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    // 'threads' starts far cheaper than the default 'forks'. On a loaded machine,
    // forked workers were timing out before they could respond, so whole test files
    // never ran at all -- which reads as a pass/fail ambiguity rather than a clear
    // signal. Threads plus a worker cap keeps the suite deterministic under load.
    pool: 'threads',
    poolOptions: { threads: { maxThreads: 4, minThreads: 1 } },
    testTimeout: 15000,
    hookTimeout: 15000,
    environment: 'jsdom',
    globals: true,
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: ['node_modules', '.next', 'e2e'],
  },
})
