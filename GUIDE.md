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

본문의 특정 용어에 짧은 부가 설명을 표시할 때 `src/components/common/Tooltip.astro`를 사용합니다.

```mdx
import Tooltip from '../../../components/common/Tooltip.astro';

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

### 9. 대화형 시각화 컴포넌트 폰트 시스템 및 가독성 디자인 컨벤션

React/MDX 기반 대화형 시각화 모듈(예: `BackpropSimulator.jsx`, `PEnROPEVisualizer.jsx`)의 한글 가독성, 타이틀 시각적 시원함, 숫자가 바뀔 때의 레이아웃 안정성(Layout Shift 방지)을 위해 아래 폰트 스택 컨벤션을 준수합니다.

- **Gmarket Sans (제목 & 탭 & 레이어 라벨)**:
  컴포넌트 메인 타이틀, Step 탭 버튼, 시각화 노드/카드 제목에는 직곡선 비율이 명확하고 시원시원한 `Gmarket Sans` 폰트를 사용합니다. 별도 파일 다운로드 없이 CDN `@font-face`를 주입하여 사용합니다.

  ```html
  @font-face {
    font-family: 'GmarketSans';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansMedium.woff') format('woff');
    font-weight: 500;
  }
  @font-face {
    font-family: 'GmarketSans';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansBold.woff') format('woff');
    font-weight: 700;
  }

  .gmarket-font {
    font-family: 'GmarketSans', 'Plus Jakarta Sans', 'Noto Sans KR', sans-serif !important;
  }
  ```

- **JetBrains Mono (수치 및 파라미터 고정폭 폰트)**:
  슬라이더 조정, 수치 갱신, 벡터 표식(`[0.60, 0.30]`) 등 수치가 바뀔 때 글자 너비 변화로 인한 UI 떨림(Layout Shift)을 방지하기 위해 `JetBrains Mono` 고정폭 폰트를 `.num-font` 클래스로 지정합니다.

  ```css
  .num-font {
    font-family: 'JetBrains Mono', monospace !important;
    font-feature-settings: "tnum";
    font-variant-numeric: tabular-nums;
  }
  ```

- **Plus Jakarta Sans / Noto Sans KR (본문 및 수식 유도문)**:
  설명 텍스트와 본문은 가독성이 검증된 `Plus Jakarta Sans` 및 `Noto Sans KR`을 기본 폰트 스택으로 선언하여 깔끔한 리서치 대시보드 룩을 형성합니다.

### 10. 모바일 대화형 시각화 컴포넌트 터치 및 스크롤 UX 방어 규칙 (CRITICAL)

MDX 내 대화형 시각화 컴포넌트(SVG 다이어그램, 캔버스, Range 슬라이더, 스크롤 테이블)를 모바일 및 카드 모드(`SectionSlider.astro`) 환경에서 렌더링할 때 발생하는 **터치 제스처 충돌 및 모바일 찌그러짐 현상을 방지하기 위한 필수상수 규칙**입니다.

- **스마트 터치 스와이프 차단 가드 (`Smart Scroll-Ignored Touch Guard`)**:
  카드 슬라이더 모드(`SectionSlider.astro`)에서 사용자가 시뮬레이터 내부의 `input[type="range"]`, `.overflow-x-auto`, `svg`, `table`, 그리고 **KaTeX 수식 영역(`.katex`, `.katex-display`, `.katex-html`)**을 손가락으로 드래그하거나 스크롤할 때, 카드 전체의 좌우 스와이프 이벤트가 감지되어 슬라이드 페이지가 엉뚱하게 넘어가는 현상을 지능 차단합니다.
  - **규칙**: `SectionSlider.astro`의 `touchstart` 감지부에서 `e.target.closest('input[type="range"], select, .overflow-x-auto, svg, button, table, .not-content, .katex, .katex-display, .katex-html')`를 판별하여 해당 수식/조작 영역에서 시작된 터치는 슬라이드 넘김 대상에서 감지 제외합니다.

- **SVG 다이어그램 모바일 좌측 정렬 및 가로 스크롤 패널 (`justifyContent: 'flex-start'`)**:
  다이어그램 캔버스가 가로로 긴 시뮬레이터(예: 신경망 4개 층 다이어그램)를 모바일에서 중앙 정렬(`justifyContent: 'center'`)하면 왼쪽 층(입력층)이 뷰포트 바깥으로 잘린 채 나타나 사용자가 왼쪽으로 스크롤하다 페이지가 넘어가버리는 문제가 발생합니다.
  - **규칙**: 모바일 뷰포트 가로 스크롤 래퍼에는 반드시 `justifyContent: 'flex-start'` 및 `-webkit-overflow-scrolling: touch`를 지정하여 **화면 접속 시 왼쪽(입력층/시작 노드)부터 안전하게 정렬되어 시작**되도록 보장합니다.

- **SVG 다이어그램 내 글자 정렬: 순수 SVG `<text>` + KaTeX 폰트 스택 선언 (iOS Safari 100% 픽셀 정렬 보장 - CRITICAL)**:
  SVG 캔버스 내부에서 HTML을 품는 `<foreignObject>` 태그는 데스크톱 에뮬레이터에서는 정상 정렬되는 것처럼 보여도, **실제 iOS Safari(WebKit) 모바일 엔진에서는 폰트 메트릭 오차로 인해 글자가 아래로 쏠리거나 엇나가 보이는 버그**를 일으킵니다.
  - **해결 규칙**: SVG 다이어그램 내부의 수치/라벨에는 `<foreignObject>` 대신 **순수 SVG `<text textAnchor="middle" dominantBaseline="central">`**을 사용하고, `style={{ fontFamily: 'KaTeX_Math, KaTeX_Main, "Times New Roman", serif', fontStyle: 'italic' }}` 폰트 스택을 연결합니다.
  - **효과**: KaTeX 특유의 고급스러운 수학 이태릭체(`W₁`, `z₁`, `x`, `h₁`, `ŷ`)를 100% 보존하면서, iOS Safari 실기기를 포함한 모든 기기에서 좌표 오차 0.0px의 완벽한 중앙 정렬을 제공합니다.

- **긴 KaTeX 수식 모바일 잘림 방지 전역 스크롤 규칙 (`.katex-display`)**:
  긴 수식 블록이나 분수/수열/체인 룰 곱셈식이 모바일 화면 폭을 넘을 때 잘려서 잘 안 보이는 현상을 보정합니다.
  - **규칙**: `src/styles/custom.css` 내 전역 `.katex-display { overflow-x: auto !important; max-width: 100% !important; -webkit-overflow-scrolling: touch; }` 규칙을 명시하여 모바일 환경에서 수식이 잘리지 않고 손가락 터치로 쓱 가로 스크롤하여 전체 식을 확인할 수 있도록 처리합니다.

### 11. 아티클별 자산 및 시각화 컴포넌트 네임스페이스 경로 규칙 (CRITICAL)

프로젝트 확장 시 자산 및 시각화 컴포넌트가 모호하게 섞이거나 파편화되는 현상을 방지하기 위해 **아티클 슬러그(제목) 기반 1:1 모듈 네임스페이스 규칙**을 엄격히 준수합니다.

- **이미지 자산 경로 (`src/assets/<article-slug>/`)**:
  특정 아티클에 사용되는 고유 이미지, 아바타, 다이어그램 리소스는 `public/`이나 임의 폴더가 아닌 **`src/assets/<article-slug>/` 하위 디렉토리를 생성하여 보관**합니다.
  - **예시**: `src/assets/policy-gradient/robot_avatar.jpg`
  - **효과**: 번들러(Vite/Astro)를 통한 이미지 정적 최적화 및 아티클 단위 자산 격리가 보장됩니다.

- **시각화 컴포넌트 경로 (`src/components/<article-slug>/`)**:
  특정 아티클을 지원하기 위해 작성된 대화형 React/Astro 시각화 컴포넌트는 `src/components/rl/` 등의 범용 디렉토리가 아닌 **`src/components/<article-slug>/` 하위 디렉토리에 1:1로 배치**합니다.
  - **예시**: `src/components/policy-gradient/PolicyGradientVisualizer.jsx`
  - **효과**: MDX 문서(`src/content/docs/architecture/policy-gradient.mdx`)와 시각화 컴포넌트 간의 직관적인 1:1 연동 및 유지보수 명확성이 확보됩니다.

### 12. 웹사이트 통일 컬러 팔레트 가이드 (Color Palette Design System)

웹사이트 전반의 시각적 일관성과 아이덴티티를 유지하기 위해 정립된 표준 컬러 팔레트입니다. 새로운 컴포넌트, 텍스트 강조, UI 버튼 작성 시 본 색상 명세를 준수합니다.

| 분류 | 역할 | 라이트 모드 (Light) | 다크 모드 (Dark) | 주요 사용처 |
| :--- | :--- | :--- | :--- | :--- |
| **Emerald Green** | 핵심 텍스트 강조 & 최적 보상 | `#059669` (Emerald-600) | `#34d399` (Emerald-400) | `<strong>` 본문 키워드, 최적 노드(`RR`), Kinesin 소포체 |
| **Warm Orange** | 주요 액션 & 모드 조작 포인트 | `#f97316` (Orange-500) | `#fb923c` (Orange-400) | '전체화면' 액션 버튼, 슬라이더 조작 포인트, 핵심 알림 |
| **Royal Indigo** | 인용구 & 정보 블록 강조선 | `#6366f1` (Indigo-500) | `#a5b4fc` (Indigo-300) | `<blockquote>` 좌측 수직 강조선, 배경 틴트 |
| **Deep Blue** | 인터랙티브 링크 & 확률 파라미터 | `#2563eb` (Blue-600) | `#60a5fa` (Blue-400) | $P(\text{Right})$ 확률 슬라이더, 중간 보상 노드(`LR`, `RL`) |
| **Purple / Violet** | 안전 제약 & 보조 파라미터 | `#7c3aed` (Violet-600) | `#a78bfa` (Violet-400) | KL Penalty ($\beta$) 슬라이더, 에피소드 카운터 `#Count` |
| **Neutral Slate** | 본문 및 베이스 라인 | `#1e293b` (Slate-800) | `#f8fafc` (Slate-50) | 본문 텍스트, 카드 테두리(`border`), 비활성 트랙 |

- **원칙**: 본문 텍스트 강조는 **Emerald Green**, 상단 액션 인터랙션은 **Warm Orange**, 정보성 인용구는 **Indigo**로 역할을 명확히 분리하여 색상 과다 사용을 방지합니다.

### 13. 카드 슬라이더 및 스토리 분할 진행 바 가이드 (SectionSlider & Story Progress)

아티클을 숏폼 플래시카드(Flashcard) 형태로 직관적으로 소비할 수 있도록 `<SectionSlider>` 공용 컴포넌트를 활용합니다.

- **Instagram Story 분할 프로그레스 바**:
  - `H2` 및 `H3` 헤딩을 기준으로 카드가 자동 분할되며, 상단에 세그먼트 막대(Segmented Bar)가 생성됩니다.
  - **다이렉트 점프**: 독자가 특정 세그먼트 막대를 클릭하면 해당 파트로 1초 만에 즉시 건너뛸 수 있습니다.
  - **호버 툴팁**: 각 세그먼트에 마우스를 올리면 해당 파트의 제목(`Part N: Title`)이 툴팁으로 표시됩니다.
- **작성 원칙**:
  - 1개 카드당 1개의 핵심 개념(One Card, One Idea)을 다루며, 뷰포트 높이 내에서 스크롤 없이 완결되도록 간결한 논문체(~함, ~단계, ~다룸)로 서술합니다.
