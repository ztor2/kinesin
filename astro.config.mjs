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
				Header: './src/components/CustomHeader.astro',
			},
			sidebar: [
				{
					label: 'Fundamentals',
					autogenerate: { directory: 'fundamentals' },
				},
				{
					label: 'Applications',
					autogenerate: { directory: 'applications' },
				},
				{
					label: 'Editorial',
					autogenerate: { directory: 'editorial' },
					}
			],
		}),
	],
});
