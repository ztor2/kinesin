// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  integrations: [starlight({
      title: 'Kinesin',
      favicon: '/favicon.ico',
      lastUpdated: true,
      customCss: [
          './src/styles/custom.css',
      ],
      components: {
          Header: './src/components/CustomHeader.astro',
      },
      sidebar: [
          {
              label: 'Study',
              autogenerate: { directory: 'study' },
          },
          {
              label: 'Datasets',
              autogenerate: { directory: 'datasets' },
          },
          {
              label: 'Benchmark',
              autogenerate: { directory: 'benchmark' },
          },
      ],
      }), react()],

  vite: {
    plugins: [tailwindcss()],
  },
});