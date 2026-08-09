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
      head: [
        {
          tag: 'link',
          attrs: { rel: 'preload', href: '/fonts/GmarketSansTTFMedium.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' }
        },
        {
          tag: 'link',
          attrs: { rel: 'preload', href: '/fonts/GmarketSansTTFBold.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' }
        }
      ],
      components: {
          Header: './src/components/common/CustomHeader.astro',
          PageTitle: './src/components/common/CustomPageTitle.astro',
      },
      sidebar: [
          {
              label: 'Architecture',
              items: [{ autogenerate: { directory: 'architecture' } }]
          },
          {
              label: 'Datasets',
              items: [{ autogenerate: { directory: 'datasets' } }]
          },
          {
              label: 'Benchmark',
              items: [{ autogenerate: { directory: 'benchmark' } }]
          },
          {
              label: 'Papers',
              items: [{ autogenerate: { directory: 'papers' } }]
          },
      ],
      expressiveCode: true,
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
