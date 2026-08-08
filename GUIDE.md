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

### 6. 마크다운 인용문(Blockquote) 및 리스트(Bulleted List) 전역 CSS 규칙

MDX 내에서 인용구(`>`) 및 리스트(`-`) 스타일링 시 Tailwind CSS v4(`@import 'tailwindcss';`)의 Preflight 리셋에 의해 기본 불릿 포인트(`list-style: none`)가 사라지거나 Starlight 전역 CSS에 의해 덮어씌워질 수 있습니다.

- `src/styles/custom.css`에 `@import 'tailwindcss';`를 작성한 뒤, 마크다운 본문 영역(`.sl-markdown-content ul`, `ol`, `li`)의 `list-style-type: disc !important` 및 padding 규칙이 복원되어 있습니다.
- `custom.css` 내 전역 룰(`.sl-markdown-content blockquote:not(:where(.not-content *))`)에 인디고/파스텔톤 배경색, 좌측 굵은 강조선(`border-inline-start-color`), 패딩 및 다크모드 대응 스타일이 `!important`로 지정되어 있습니다.
- 따라서 MDX 문서 작성 시 복잡한 HTML 클래스를 직접 적을 필요 없이, **표준 마크다운 인용문 `>` 및 불릿 리스트 `-` 문법**만 사용하면 자동으로 고품질 디자인과 점(bullet point) 표기가 보장됩니다.

```mdx
> <i><strong>역전파(Backpropagation)</strong>는 연쇄 법칙(Chain Rule)을 활용해 신경망 학습을 가능케 했다.</i>

- 리스트 항목 1
- 리스트 항목 2
```

### 7. React/MDX 대화형 시각화 컴포넌트 내 KaTeX 수학 수식 적용 및 유의사항

React 대화형 시각화 컴포넌트(예: `BackpropSimulator.jsx`) 내부의 수식 텍스트나 분수 기호를 고품질 수학 폰트로 표기할 때 `katex` 라이브러리를 직접 활용합니다.

- **헬퍼 컴포넌트 (`MathView`) 패턴**:
  별도의 외부 React 래퍼 패키지 대신 KaTeX의 `renderToString()`과 `dangerouslySetInnerHTML`을 결합한 경량 헬퍼 컴포넌트를 정의하여 사용합니다.

  ```jsx
  import katex from 'katex';

  const MathView = ({ math, style }) => {
    const html = katex.renderToString(math, { throwOnError: false });
    return (
      <span 
        style={{ display: 'inline-flex', alignItems: 'center', fontSize: '1.12em', ...style }} 
        dangerouslySetInnerHTML={{ __html: html }} 
      />
    );
  };
  ```

- **한글 텍스트 분리 유의사항 (CRITICAL)**:
  `katex.renderToString("손실 함수 L = ...")`처럼 한글 설명 문자열을 통째로 math 모드에 입력하면 `Unicode text character "손" used in math mode` 경고/오류가 발생합니다.
  한글 텍스트는 일반 React DOM(`<span>`)으로 작성하고, **수학 기호 조각만 `<MathView math="..." />`로 분리 주입**해야 경고 없이 깔끔하게 렌더링됩니다.

  ```jsx
  // 올바른 패턴 (한글 텍스트와 KaTeX 수식 분리)
  <span>
    손실 함수 <MathView math="L = \frac{1}{2}(\hat{y} - y)^2" />를 <MathView math="\hat{y}" />에 대해 미분합니다.
  </span>
  ```

- **가독성 폰트 크기 지정**:
  기본 KaTeX 수식 폰트 크기가 약간 작아 보일 수 있으므로 `fontSize: '1.12em'` ~ `15px` 정도의 인라인 스타일을 부여하여 시원한 가독성을 제공합니다.

### 8. `framer-motion` (Motion) 모듈 활용 가이드 및 시각화 모범 사례

React 기반 대화형 시각화 컴포넌트(예: `BackpropSimulator.jsx`)에서 UI 상태 전환, 카드 스위칭, 파라미터 조절 드로어, 수치 갱신 타격감 등을 스프링 물리(Spring Physics) 기반 애니메이션으로 연출할 때 `framer-motion`을 활용합니다.

- **기본 모듈 Import**:
  ```jsx
  import { motion, AnimatePresence } from 'framer-motion';
  ```

- **핵심 모션 패턴**:

  1. **카드 / 내용 매끄러운 스위칭 (`AnimatePresence mode="wait"`)**:
     탭이나 단계(Step) 변경 시 기존 카드가 자연스럽게 퇴장(exit)하고 새 카드가 등재(animate)되는 패턴입니다.
     ```jsx
     <AnimatePresence mode="wait">
       {step === 1 && (
         <motion.div 
           key="step-1"
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.25 }}
         >
           {/* Step 1 내용 */}
         </motion.div>
       )}
     </AnimatePresence>
     ```

  2. **유동 슬라이딩 탭 버튼 (`layoutId`)**:
     여러 개의 탭 버튼 중 선택된 버튼 배경 뱃지가 부드럽게 미끄러지듯 이동하는 물리 애니메이션입니다.
     ```jsx
     {isActive && (
       <motion.div
         layoutId="activeStepPill"
         transition={{ type: 'spring', stiffness: 450, damping: 32 }}
         style={{
           position: 'absolute',
           inset: 0,
           borderRadius: '12px',
           background: t.activeBg,
           zIndex: -1
         }}
       />
     )}
     ```

  3. **접이식 드로어 / 아코디언 (`height: 'auto'`)**:
     설정창이나 부가 옵션을 클릭 시 부드럽게 펼치고 접는 패턴입니다. 최상위에 `overflow: 'hidden'`을 명시합니다.
     ```jsx
     <AnimatePresence>
       {showSettings && (
         <motion.div 
           initial={{ height: 0, opacity: 0 }}
           animate={{ height: 'auto', opacity: 1 }}
           exit={{ height: 0, opacity: 0 }}
           transition={{ duration: 0.3, ease: 'easeInOut' }}
           style={{ overflow: 'hidden' }}
         >
           {/* 슬라이더 및 파라미터 조작부 */}
         </motion.div>
       )}
     </AnimatePresence>
     ```

  4. **수치 갱신 타격감 펄스 (`key={value}`)**:
     학습 실행 또는 값 변경 시 수치가 순간적으로 바뀔 때 `key` 값의 변경을 감지하여 텍스트가 살짝 튀어오르는 스프링 팝업 효과를 줍니다.
     ```jsx
     <motion.span 
       key={w1_next}
       initial={{ scale: 1.25, color: '#10b981' }}
       animate={{ scale: 1, color: '#059669' }}
       transition={{ type: 'spring', stiffness: 400 }}
       style={{ fontWeight: '800' }}
     >
       {w1_next.toFixed(3)}
     </motion.span>
     ```

- **SVG 애니메이션 시 레이아웃 깨짐 방지 규칙 (CRITICAL)**:
  SVG 태그 내부의 `<g>`, `<rect>`, `<circle>` 요소를 `motion` 요소로 변환하고 `animate={{ scale: 1.08 }}`을 주면 기본 CSS `transform-origin`이 SVG 전체 좌상단`(0, 0)`으로 지정되어 다이어그램 노드가 밖으로 튀어나가거나 깨집니다.
  - **해결책**: SVG 내부 요소에 CSS `transform` 계열 변환을 줄 때는 반드시 `style={{ transformBox: 'fill-box', transformOrigin: 'center' }}`를 함께 선언하거나, 고정 좌표계 구조를 유지하고 내부 CSS 속성(`strokeWidth`, `opacity`)만 애니메이션합니다.


