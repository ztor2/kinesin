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
          attrs: { rel: 'preconnect', href: 'https://cdn.jsdelivr.net', crossorigin: 'anonymous' }
        },
        {
          tag: 'link',
          attrs: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' }
        },
        {
          tag: 'link',
          attrs: { rel: 'preload', href: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansMedium.woff', as: 'font', type: 'font/woff', crossorigin: 'anonymous' }
        },
        {
          tag: 'link',
          attrs: { rel: 'preload', href: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansBold.woff', as: 'font', type: 'font/woff', crossorigin: 'anonymous' }
        }
      ],
      components: {
          Header: './src/components/CustomHeader.astro',
          PageTitle: './src/components/CustomPageTitle.astro',
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
