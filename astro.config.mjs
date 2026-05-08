// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	integrations: [
		starlight({
			title: 'Kinesin',
			favicon: '/favicon.ico',
			lastUpdated: true,
			customCss: [
				'./src/styles/custom.css',
			],
			components: {
				Sidebar: './src/components/CustomSidebar.astro',
				Header: './src/components/CustomHeader.astro',
			},
			sidebar: [
				{
					autogenerate: { directory: '' },
				},
			],
		}),
	],
});
