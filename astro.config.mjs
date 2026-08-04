// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

import rehypeExternalLinks from 'rehype-external-links';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';


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
              label: 'Architecture',
              autogenerate: { directory: 'architecture' },
          },
          {
              label: 'Datasets',
              autogenerate: { directory: 'datasets' },
          },
          {
              label: 'Benchmark',
              autogenerate: { directory: 'benchmark' },
          },
          {
              label: 'Papers',
              autogenerate: { directory: 'papers' },
          },
      ],
      }), react()],
markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [
    rehypeKatex,
    [
        rehypeExternalLinks,
        {
        target: '_blank',
        rel: ['noopener', 'noreferrer'],
        },
    ],
    ],
},
  vite: {
    plugins: [tailwindcss()],
  },
});
