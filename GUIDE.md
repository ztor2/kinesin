# MDX React/Tailwind 작성 가이드

MDX 내 React/Tailwind 컴포넌트의 렌더링 및 레이아웃 오류를 방지하기 위한 AI 참조 가이드입니다.

## 핵심 규칙

### 1. 전역 CSS 간섭 차단

Starlight의 마크다운 CSS(`.sl-markdown-content`)에 의해 Tailwind 레이아웃(`flex` 등)이 무효화되는 것을 방지합니다.

- 최상위 wrapper 요소에 반드시 `not-content` 클래스를 추가합니다.

```jsx
<div className="flex flex-row not-content">
  ...
</div>
```

### 2. SVG 그래픽 크기 및 배경 고정

전역 CSS에 의한 크기 변형과 다크모드에서 Tailwind 배경색이 누락되는 문제를 방지합니다.

- SVG 태그에 인라인 스타일로 절대 크기를 지정합니다.
- SVG 내부 최하단에 `rect`, `circle` 등 배경 도형을 배치하고 `fill`, `stroke`를 직접 지정합니다.

```jsx
<svg style={{ width: '80px', flexShrink: 0 }}>
  <circle cx="50" cy="50" r="49" fill="white" stroke="#d1d5db" />
</svg>
```

### 3. 레이아웃 인라인 스타일 병행

특수 환경에서 Tailwind 레이아웃 클래스가 적용되지 않는 상황에 대비합니다.

- 강제 배치가 필요한 경우 Tailwind 클래스와 인라인 스타일을 함께 명시합니다.

```jsx
<div
  className="not-content"
  style={{ display: 'flex', flexDirection: 'row' }}
>
  ...
</div>
```

## MDX 및 파일 시스템 규칙

### 1. 수식 및 특수기호 이스케이프

MDX 파서가 `{}` 기호를 JavaScript 표현식으로 오인해 `ReferenceError`를 발생시키는 것을 방지합니다.

- 수식 및 `{}` 기호는 인라인 코드 블록으로 감쌉니다.

```mdx
`g_k = \theta^{-2(k-1)/d}`
```

### 2. 클라이언트 지시어 사용

`useState` 등 React 상태가 포함된 인터랙티브 컴포넌트를 활성화합니다.

- 컴포넌트 호출 시 `client:visible` 또는 `client:only="react"`를 명시합니다.

```mdx
<MyComponent client:visible />
<MyComponent client:only="react" />
```

### 3. Named Export 사용

모듈 충돌 및 `undefined Component` 에러를 방지합니다.

- `default export`는 지양합니다.
- 컴포넌트는 named export로 선언합니다.
- import 시 정확한 상대 경로를 사용합니다.

```jsx
export const MyComponent = () => {
  return <div className="not-content">...</div>;
};
```

### 4. 외부 링크를 새 탭에서 열기

일반 Markdown 링크 문법을 유지하면서 외부 링크를 새 탭에서 열기 위해 `rehype-external-links`를 사용합니다.

```mdx
[RoPE 논문](https://arxiv.org/abs/2104.09864)
```

- `astro.config.mjs`의 최상위 `markdown.rehypePlugins`에 플러그인을 등록합니다. `starlight()` 옵션 내부에 넣으면 적용되지 않습니다.
- `target: '_blank'`와 `rel: ['noopener', 'noreferrer']`를 함께 설정합니다.
- `/study/...`나 `#제목` 같은 내부 링크에는 새 탭 설정이 적용되지 않습니다.

### 5. Tooltip 컴포넌트 사용

본문의 특정 용어에 짧은 부가 설명을 표시할 때 `src/components/Tooltip.astro`를 사용합니다.

```mdx
import Tooltip from '../../../components/Tooltip.astro';

<Tooltip id="self-attention" text="각 토큰이 다른 토큰들과 얼마나 관련 있는지를 계산하는 방식">Self-Attention</Tooltip>은 병렬로 관계를 계산한다.
```

- `id`는 같은 문서 안에서 중복되지 않는 값을 사용합니다.
- `text`에는 툴팁에 표시할 짧은 설명을 입력합니다.
- 마우스 hover와 키보드 focus에서 모두 표시됩니다.
- CSS 기반 Astro 컴포넌트이므로 `client:*` 지시어가 필요하지 않습니다.
- 한글 조사를 공백 없이 붙이려면 `</Tooltip>은`처럼 작성합니다.
