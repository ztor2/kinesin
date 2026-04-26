// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Kinesin',
			lastUpdated: true,
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/withastro/starlight' },
			],
			customCss: [
				'./src/styles/custom.css',
			],
			components: {
				Sidebar: './src/components/CustomSidebar.astro',
				Header: './src/components/CustomHeader.astro',
			},
			sidebar: [
				{
					label: '시작하기',
					autogenerate: { directory: 'guides' },
				},
				{
					label: '테스트',
					autogenerate: { directory: 'test' },
				},
				{
					label: '참고 자료',
					autogenerate: { directory: 'reference' },
				},
			],
		}),
	],
});
