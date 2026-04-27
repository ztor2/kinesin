// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	integrations: [
		starlight({
			title: 'Kinesin',
			favicon: '/favicon.ico',
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
					label: '용어 사전',
					collapsed: true, // 접혀있는 상태로 시작
					autogenerate: { directory: 'dictionary' },
				},
				// 새로운 카테고리가 필요하면 여기에 추가하세요.

			],
		}),
	],
});
