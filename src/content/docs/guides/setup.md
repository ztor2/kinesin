---
title: 블로그 설정 가이드
description: Kinesin 지식 블로그를 시작하는 방법입니다.
---

## 시작하기

이 블로그는 **Astro Starlight**를 사용하여 만들어졌습니다.

### 문서 추가하기

`src/content/docs/` 폴더 내에 Markdown(`.md`) 또는 MDX(`.mdx`) 파일을 추가하면 자동으로 목차에 반영됩니다.

### 테마 수정하기

`src/styles/custom.css` 파일에서 CSS 변수를 수정하여 간단하게 테마를 바꿀 수 있습니다.

```css
:root {
  --sl-color-accent: #3b82f6;
}
```

### 검색 기능

별도의 설정 없이도 상단 검색바를 통해 문서 내용을 검색할 수 있습니다. (빌드 시 자동으로 인덱싱됩니다)
