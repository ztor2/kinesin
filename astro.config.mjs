// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import fs from 'node:fs';
import path from 'node:path';

// 사이드바 자동 생성을 위한 함수
function getDynamicSidebar() {
  const docsPath = path.resolve('src/content/docs');
  
  // 이름 매핑 (폴더명: 사이드바에 표시될 이름)
  const labelMap = {
    'guides': '시작하기',
    'test': '테스트',
    'kinesin': 'Kinesin 노트',
    'history': '히스토리',
    'reference': '참고 자료'
  };

  // 제외할 폴더 및 파일
  const exclude = ['_templates', 'index.mdx', '.obsidian'];

  const items = fs.readdirSync(docsPath)
    .filter(item => !exclude.includes(item))
    .filter(item => fs.statSync(path.join(docsPath, item)).isDirectory())
    .map(dir => ({
      label: labelMap[dir] || dir.charAt(0).toUpperCase() + dir.slice(1), // 매핑이 없으면 폴더명 첫글자 대문자로
      autogenerate: { directory: dir }
    }));

  return items;
}

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
			sidebar: getDynamicSidebar(), // 함수를 호출하여 동적으로 생성된 리스트 적용
		}),
	],
});
