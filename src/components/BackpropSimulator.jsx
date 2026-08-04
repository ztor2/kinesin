import React, { useState } from 'react';
import katex from 'katex';

// Sigmoid 활성화 함수 및 국소 미분 정의 (backprop.mdx 문서 설명과 100% 일치)
const sigmoid = (z) => 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, z))));
const sigmoidDf = (z) => {
  const s = sigmoid(z);
  return s * (1 - s);
};

// KaTeX 수학 수식 렌더링 헬퍼 컴포넌트
const MathView = ({ math, style }) => {
  const html = katex.renderToString(math, { throwOnError: false });
  return <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '1.12em', ...style }} dangerouslySetInnerHTML={{ __html: html }} />;
};

// SVG Arrow Right Icon Component
const ArrowRightIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

export const BackpropSimulator = () => {
  // 파라미터 상태
  const [x, setX] = useState(0.8);
  const [target, setTarget] = useState(1.0);
  const [w1, setW1] = useState(0.6);
  const [b1, setB1] = useState(0.1);
  const [w2, setW2] = useState(1.1);
  const [b2, setB2] = useState(-0.2);
  const [lr, setLr] = useState(0.5);

  // 설정 아코디언 열림/닫힘 상태
  const [showSettings, setShowSettings] = useState(false);

  // 현재 Step (1: 순전파, 2: 손실계산, 3: 역전파, 4: 가중치갱신)
  const [step, setStep] = useState(1);

  // 선택된 체인 룰 미분 항 Key
  const [activeTermKey, setActiveTermKey] = useState('dL_dyHat');

  // --- 1. Forward Pass 연산 (MSE Loss + Sigmoid 활성화 적용) ---
  const z1 = w1 * x + b1;
  const h1 = sigmoid(z1);
  const z2 = w2 * h1 + b2;
  const yHat = sigmoid(z2);
  const loss = 0.5 * Math.pow(yHat - target, 2);

  // --- 2. Backward Pass (Chain Rule) 연산 ---
  const dL_dyHat = yHat - target;
  const dyHat_dz2 = sigmoidDf(z2);
  const delta2 = dL_dyHat * dyHat_dz2;

  const dL_dw2 = delta2 * h1;
  const dL_db2 = delta2;

  const dL_dh1 = delta2 * w2;
  const dh1_dz1 = sigmoidDf(z1);
  const delta1 = dL_dh1 * dh1_dz1;

  const dL_dw1 = delta1 * x;
  const dL_db1 = delta1;

  // --- 3. 갱신 후 파라미터 ---
  const w1_next = w1 - lr * dL_dw1;
  const b1_next = b1 - lr * dL_db1;
  const w2_next = w2 - lr * dL_dw2;
  const b2_next = b2 - lr * dL_db2;

  // 체인 룰 개별 미분 항 정보 맵 (역할별 테마 색상 지정)
  const chainRuleTerms = {
    dL_dyHat: {
      symbol: '\\frac{\\partial L}{\\partial \\hat{y}}',
      name: '출력 오차 민감도',
      calcFormulaMath: `\\hat{y} - y = ${yHat.toFixed(4)} - ${target.toFixed(2)}`,
      value: dL_dyHat,
      mathReasonNode: (
        <span>
          손실 함수 <MathView math="L = \frac{1}{2}(\hat{y} - y)^2" />를 <MathView math="\hat{y}" />에 대해 미분하면, 2차항 계수 <MathView math="\frac{1}{2}" />과 2가 상쇄되어 단순 오차 차이 <MathView math="(\hat{y} - y)" />만 남습니다.
        </span>
      ),
      description: '최종 예측값(ŷ)과 목표 정답(y) 간의 오차 차이입니다. 역전파가 시작되는 맨 첫 번째 출발점 오차 신호입니다.',
      highlight: 'loss',
      themeColor: '#e11d48',
      bgColor: '#fff1f2'
    },
    dyHat_dz2: {
      symbol: '\\frac{\\partial \\hat{y}}{\\partial z_2}',
      name: '출력층 Sigmoid 기울기',
      calcFormulaMath: `\\sigma'(z_2) = ${dyHat_dz2.toFixed(4)}`,
      value: dyHat_dz2,
      mathReasonNode: (
        <span>
          출력 활성화 식 <MathView math="\hat{y} = \sigma(z_2)" />를 미분하면 <MathView math="\sigma(z_2)(1 - \sigma(z_2))" />가 됩니다. 입력 <MathView math="z_2" /> 위치에서의 비선형 변화율(기울기)입니다.
        </span>
      ),
      description: '출력층 비선형 활성화 함수(Sigmoid)의 국소 변화율입니다. 오차 신호가 출력 노드를 통과할 때 곱해지는 감쇄/증폭율입니다.',
      highlight: 'yHat',
      themeColor: '#0284c7',
      bgColor: '#f0f9ff'
    },
    dz2_dw2: {
      symbol: '\\frac{\\partial z_2}{\\partial W_2}',
      name: 'W₂ 책임 입력값',
      calcFormulaMath: `h_1 = ${h1.toFixed(4)}`,
      value: h1,
      mathReasonNode: (
        <span>
          선형 결합 식 <MathView math="z_2 = W_2 h_1 + b_2" />를 <MathView math="W_2" />에 대해 편미분하면, <MathView math="W_2" />에 곱해져 있던 계수인 은닉층 입력값 <MathView math="h_1" />만 그대로 남습니다 (<MathView math="\frac{\partial z_2}{\partial W_2} = h_1" />).
        </span>
      ),
      description: '순전파 시 은닉층 h₁에서 들어온 활성화 값입니다. 과거 입력값이 클수록 가중치 W₂가 지는 오차 책임(기울기)이 커집니다.',
      highlight: 'w2',
      themeColor: '#d97706',
      bgColor: '#fffbeb'
    },
    dz2_dh1: {
      symbol: '\\frac{\\partial z_2}{\\partial h_1}',
      name: '상위 가중치 전파율',
      calcFormulaMath: `W_2 = ${w2.toFixed(4)}`,
      value: w2,
      mathReasonNode: (
        <span>
          선형 결합 식 <MathView math="z_2 = W_2 h_1 + b_2" />를 이전 층 출력 <MathView math="h_1" />에 대해 편미분하면 계수인 상위 가중치 <MathView math="W_2" />만 남게 됩니다 (<MathView math="\frac{\partial z_2}{\partial h_1} = W_2" />).
        </span>
      ),
      description: '하위 층(h₁)으로 오차가 역전파될 때 곱해지는 상위 층 가중치 W₂입니다. 가중치 크기에 비례해 오차 신호가 전달됩니다.',
      highlight: 'w2',
      themeColor: '#d97706',
      bgColor: '#fffbeb'
    },
    dh1_dz1: {
      symbol: '\\frac{\\partial h_1}{\\partial z_1}',
      name: '은닉층 Sigmoid 기울기',
      calcFormulaMath: `\\sigma'(z_1) = ${dh1_dz1.toFixed(4)}`,
      value: dh1_dz1,
      mathReasonNode: (
        <span>
          은닉층 활성화 식 <MathView math="h_1 = \sigma(z_1)" />를 <MathView math="z_1" />에 대해 미분한 <MathView math="\sigma(z_1)(1 - \sigma(z_1))" />입니다. 은닉층 노드에서의 국소 기울기입니다.
        </span>
      ),
      description: '은닉층 1 활성화 함수(Sigmoid)의 국소 변화율입니다. 상위 오차 신호(δ₂)와 W₂가 곱해진 후 이 미분값이 다시 연쇄 곱셈됩니다.',
      highlight: 'h1',
      themeColor: '#7c3aed',
      bgColor: '#f5f3ff'
    },
    dz1_dw1: {
      symbol: '\\frac{\\partial z_1}{\\partial W_1}',
      name: 'W₁ 책임 입력값',
      calcFormulaMath: `x = ${x.toFixed(2)}`,
      value: x,
      mathReasonNode: (
        <span>
          선형 결합 식 <MathView math="z_1 = W_1 x + b_1" />을 가중치 <MathView math="W_1" />에 대해 편미분하면, <MathView math="W_1" />에 곱해져 있던 계수인 최초 입력값 <MathView math="x" />만 그대로 남게 됩니다 (<MathView math="\frac{\partial z_1}{\partial W_1} = x" />).
        </span>
      ),
      description: '신경망의 최초 입력 데이터(x)입니다. 입력값 크기가 가중치 W₁의 최종 기울기(∇W₁) 크기를 결정짓는 주요 요인입니다.',
      highlight: 'w1',
      themeColor: '#0891b2',
      bgColor: '#ecfeff'
    }
  };

  const activeTerm = chainRuleTerms[activeTermKey];

  // 1회 학습 실행
  const handleRunFullStep = () => {
    setW1(w1_next);
    setB1(b1_next);
    setW2(w2_next);
    setB2(b2_next);
    setStep(4);
  };

  const handleReset = () => {
    setX(0.8);
    setTarget(1.0);
    setW1(0.6);
    setB1(0.1);
    setW2(1.1);
    setB2(-0.2);
    setLr(0.5);
    setStep(1);
  };

  return (
    <div 
      className="not-content font-sans"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
        clear: 'both',
        boxSizing: 'border-box',
        margin: '24px 0',
        padding: '24px',
        borderRadius: '20px',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 4px 12px -2px rgba(0, 0, 0, 0.03)'
      }}
    >
      {/* 1. 상단 컨트롤 패널 & 깔끔한 슬라이더 접이식 컴포넌트 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              fontSize: '12.5px',
              fontWeight: '700',
              borderRadius: '9px',
              border: '1px solid #cbd5e1',
              backgroundColor: showSettings ? '#f1f5f9' : '#f8fafc',
              color: '#334155',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <span>학습 파라미터 설정</span>
            <span style={{ fontSize: '10px', color: '#64748b' }}>{showSettings ? '▲' : '▼'}</span>
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={handleReset}
              style={{
                padding: '7px 14px',
                fontSize: '12.5px',
                fontWeight: '600',
                borderRadius: '9px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}
            >
              초기화
            </button>

            <button 
              onClick={handleRunFullStep}
              style={{
                padding: '7px 18px',
                fontSize: '12.5px',
                fontWeight: '700',
                borderRadius: '9px',
                border: 'none',
                background: 'linear-gradient(135deg, #059669, #047857)',
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)'
              }}
            >
              1회 학습 실행
            </button>
          </div>
        </div>

        {/* 펼쳐지는 슬라이더 설정창 */}
        {showSettings && (
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '12px',
              backgroundColor: '#f8fafc',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: '700', color: '#334155' }}>
                <span>입력 (x)</span>
                <span style={{ fontFamily: 'monospace', color: '#0284c7', fontWeight: 'bold' }}>{x.toFixed(2)}</span>
              </div>
              <input type="range" min="0.1" max="1.0" step="0.05" value={x} onChange={(e) => { setX(Number(e.target.value)); setStep(1); }} style={{ width: '100%', cursor: 'pointer' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: '700', color: '#334155' }}>
                <span>정답 (y)</span>
                <span style={{ fontFamily: 'monospace', color: '#e11d48', fontWeight: 'bold' }}>{target.toFixed(2)}</span>
              </div>
              <input type="range" min="0.1" max="1.0" step="0.05" value={target} onChange={(e) => { setTarget(Number(e.target.value)); setStep(1); }} style={{ width: '100%', cursor: 'pointer' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: '700', color: '#334155' }}>
                <span>편향 (b₁)</span>
                <span style={{ fontFamily: 'monospace', color: '#7c3aed', fontWeight: 'bold' }}>{b1.toFixed(2)}</span>
              </div>
              <input type="range" min="-1.0" max="1.0" step="0.05" value={b1} onChange={(e) => { setB1(Number(e.target.value)); setStep(1); }} style={{ width: '100%', cursor: 'pointer' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: '700', color: '#334155' }}>
                <span>편향 (b₂)</span>
                <span style={{ fontFamily: 'monospace', color: '#d97706', fontWeight: 'bold' }}>{b2.toFixed(2)}</span>
              </div>
              <input type="range" min="-1.0" max="1.0" step="0.05" value={b2} onChange={(e) => { setB2(Number(e.target.value)); setStep(1); }} style={{ width: '100%', cursor: 'pointer' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: '700', color: '#334155' }}>
                <span>학습률 (η)</span>
                <span style={{ fontFamily: 'monospace', color: '#059669', fontWeight: 'bold' }}>{lr.toFixed(1)}</span>
              </div>
              <input type="range" min="0.1" max="1.5" step="0.1" value={lr} onChange={(e) => setLr(Number(e.target.value))} style={{ width: '100%', cursor: 'pointer' }} />
            </div>
          </div>
        )}
      </div>

      {/* 2. Step 탭 버튼 (역할별 풍부한 그래디언트 & 입체감 UI) */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: '8px', backgroundColor: '#f1f5f9', padding: '5px', borderRadius: '12px', flexWrap: 'wrap' }}>
          {[
            { id: 1, label: '1. 순전파 (Forward)', activeBg: 'linear-gradient(135deg, #0284c7, #0369a1)', shadow: 'rgba(2, 132, 199, 0.35)' },
            { id: 2, label: '2. 오차 산출', activeBg: 'linear-gradient(135deg, #e11d48, #be123c)', shadow: 'rgba(225, 29, 72, 0.35)' },
            { id: 3, label: '3. 역전파 (Backward)', activeBg: 'linear-gradient(135deg, #d97706, #b45309)', shadow: 'rgba(217, 119, 6, 0.35)' },
            { id: 4, label: '4. 가중치 갱신', activeBg: 'linear-gradient(135deg, #059669, #047857)', shadow: 'rgba(5, 150, 105, 0.35)' }
          ].map((t) => {
            const isActive = step === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setStep(t.id)}
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '700',
                  borderRadius: '9px',
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? t.activeBg : 'transparent',
                  color: isActive ? '#ffffff' : '#64748b',
                  boxShadow: isActive ? `0 4px 12px ${t.shadow}` : 'none',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. SVG 신경망 다이어그램 (KaTeX 연동, 대형 노드 & 정갈한 펄스 하이라이트) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #cbd5e1', gap: '16px' }}>
        <div style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
          <svg viewBox="0 0 760 250" style={{ width: '100%', maxWidth: '760px', height: 'auto', minWidth: '360px' }}>
            <defs>
              <marker id="arrow-blue" viewBox="0 0 10 10" refX="42" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#0284c7" />
              </marker>
              <marker id="arrow-orange" viewBox="0 0 10 10" refX="42" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#d97706" />
              </marker>
              <style>{`
                @keyframes forwardDashFlow {
                  from { stroke-dashoffset: 0; }
                  to { stroke-dashoffset: -28; }
                }
                @keyframes backwardDashFlow {
                  from { stroke-dashoffset: 28; }
                  to { stroke-dashoffset: 0; }
                }
                @keyframes lossDashFlow {
                  from { stroke-dashoffset: 0; }
                  to { stroke-dashoffset: -20; }
                }
                @keyframes pulseGlow {
                  0% { filter: drop-shadow(0 0 0px rgba(124, 58, 237, 0)); }
                  50% { filter: drop-shadow(0 0 14px rgba(124, 58, 237, 0.95)); }
                  100% { filter: drop-shadow(0 0 0px rgba(124, 58, 237, 0)); }
                }
                @keyframes emeraldPulseGlow {
                  0% { filter: drop-shadow(0 0 0px rgba(16, 185, 129, 0)); }
                  50% { filter: drop-shadow(0 0 14px rgba(16, 185, 129, 0.95)); }
                  100% { filter: drop-shadow(0 0 0px rgba(16, 185, 129, 0)); }
                }
                .active-pulsing-node {
                  animation: pulseGlow 1.2s ease-in-out infinite;
                }
                .step4-green-pulse {
                  animation: emeraldPulseGlow 1.2s ease-in-out infinite;
                }
              `}</style>
            </defs>

            {/* W1 연결선 */}
            <line 
              x1="90" y1="120" x2="300" y2="120" 
              stroke={step === 3 ? '#d97706' : step === 1 ? '#0284c7' : activeTerm.highlight === 'w1' ? '#7c3aed' : '#cbd5e1'} 
              strokeWidth={step === 1 || step === 3 || activeTerm.highlight === 'w1' ? '5' : '2.5'}
              strokeDasharray={step === 1 || step === 3 ? '8 6' : 'none'}
              style={{ animation: step === 1 ? 'forwardDashFlow 0.75s linear infinite' : step === 3 ? 'backwardDashFlow 0.75s linear infinite' : 'none' }}
              markerEnd={step === 3 ? undefined : 'url(#arrow-blue)'}
              markerStart={step === 3 ? 'url(#arrow-orange)' : undefined}
            />

            {/* 가중치 W1 KaTeX 뱃지 (Step 4 선택 시 에메랄드 녹색 반짝임) */}
            <g transform="translate(195, 75)" className={step === 4 ? 'step4-green-pulse' : activeTerm.highlight === 'w1' ? 'active-pulsing-node' : ''}>
              <rect 
                x="-55" y="-15" width="110" height="28" rx="6" 
                fill={step === 4 ? '#d1fae5' : activeTerm.highlight === 'w1' ? '#f5f3ff' : '#ffffff'} 
                stroke="none"
              />
              <foreignObject x="-55" y="-15" width="110" height="28">
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', color: step === 4 ? '#059669' : activeTerm.highlight === 'w1' ? '#6d28d9' : '#334155' }}>
                  <MathView math={`W_1 = ${w1.toFixed(2)}`} style={{ fontSize: '13px' }} />
                </div>
              </foreignObject>
            </g>

            {/* z1 선형 신호 KaTeX 뱃지 */}
            <g transform="translate(195, 165)">
              <rect x="-58" y="-14" width="116" height="28" rx="6" fill={step === 1 ? '#e0f2fe' : '#f1f5f9'} stroke="none" />
              <foreignObject x="-58" y="-14" width="116" height="28">
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', color: step === 1 ? '#0369a1' : '#64748b' }}>
                  <MathView math={`z_1 = ${z1.toFixed(3)}`} style={{ fontSize: '13px' }} />
                </div>
              </foreignObject>
            </g>

            {/* W2 연결선 */}
            <line 
              x1="300" y1="120" x2="510" y2="120" 
              stroke={step === 3 ? '#d97706' : step === 1 ? '#0284c7' : activeTerm.highlight === 'w2' ? '#d97706' : '#cbd5e1'} 
              strokeWidth={step === 1 || step === 3 || activeTerm.highlight === 'w2' ? '5' : '2.5'}
              strokeDasharray={step === 1 || step === 3 ? '8 6' : 'none'}
              style={{ animation: step === 1 ? 'forwardDashFlow 0.75s linear infinite' : step === 3 ? 'backwardDashFlow 0.75s linear infinite' : 'none' }}
              markerEnd={step === 3 ? undefined : 'url(#arrow-blue)'}
              markerStart={step === 3 ? 'url(#arrow-orange)' : undefined}
            />

            {/* 가중치 W2 KaTeX 뱃지 (Step 4 선택 시 에메랄드 녹색 반짝임) */}
            <g transform="translate(405, 75)" className={step === 4 ? 'step4-green-pulse' : activeTerm.highlight === 'w2' ? 'active-pulsing-node' : ''}>
              <rect 
                x="-55" y="-15" width="110" height="28" rx="6" 
                fill={step === 4 ? '#d1fae5' : activeTerm.highlight === 'w2' ? '#fef3c7' : '#ffffff'} 
                stroke="none"
              />
              <foreignObject x="-55" y="-15" width="110" height="28">
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', color: step === 4 ? '#059669' : activeTerm.highlight === 'w2' ? '#b45309' : '#334155' }}>
                  <MathView math={`W_2 = ${w2.toFixed(2)}`} style={{ fontSize: '13px' }} />
                </div>
              </foreignObject>
            </g>

            {/* z2 선형 신호 KaTeX 뱃지 */}
            <g transform="translate(405, 165)">
              <rect x="-58" y="-14" width="116" height="28" rx="6" fill={step === 1 ? '#e0f2fe' : '#f1f5f9'} stroke="none" />
              <foreignObject x="-58" y="-14" width="116" height="28">
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', color: step === 1 ? '#0369a1' : '#64748b' }}>
                  <MathView math={`z_2 = ${z2.toFixed(3)}`} style={{ fontSize: '13px' }} />
                </div>
              </foreignObject>
            </g>

            {/* Loss 수평선 (Step 2 선택 시 장미색 흐름 애니메이션 적용) */}
            <line 
              x1="510" y1="120" x2="670" y2="120" 
              stroke={step === 2 ? '#e11d48' : '#cbd5e1'} 
              strokeWidth={step === 2 ? '3.5' : '2.5'} 
              strokeDasharray={step === 2 ? '6 4' : '5 5'}
              style={{ animation: step === 2 ? 'lossDashFlow 0.6s linear infinite' : 'none' }}
            />

            {/* 노드 1: x (Cyan & Slate 테마) */}
            <g transform="translate(90, 120)">
              <circle r="44" fill="#ffffff" stroke="#0284c7" strokeWidth="3.5" />
              <foreignObject x="-44" y="-44" width="88" height="88">
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0369a1', fontWeight: 'bold' }}>
                  <MathView math="x" style={{ fontSize: '20px' }} />
                </div>
              </foreignObject>
              <text textAnchor="middle" y="-54" fontSize="13" fontWeight="700" fill="#64748b">입력층</text>
              <foreignObject x="-45" y="48" width="90" height="26">
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', fontWeight: 'bold' }}>
                  <MathView math={x.toFixed(2)} style={{ fontSize: '13.5px' }} />
                </div>
              </foreignObject>
            </g>

            {/* 노드 2: h1 (Violet & Indigo 테마) */}
            <g transform="translate(300, 120)" className={activeTerm.highlight === 'h1' ? 'active-pulsing-node' : ''}>
              <circle 
                r="44" 
                fill={step === 1 ? '#e0f2fe' : activeTerm.highlight === 'h1' ? '#f5f3ff' : '#ffffff'} 
                stroke={step === 1 ? '#0284c7' : activeTerm.highlight === 'h1' ? '#7c3aed' : step === 3 ? '#d97706' : '#cbd5e1'} 
                strokeWidth={step === 1 || activeTerm.highlight === 'h1' ? '5' : '3'} 
              />
              <foreignObject x="-44" y="-44" width="88" height="88">
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1f2937', fontWeight: 'bold' }}>
                  <MathView math="h_1" style={{ fontSize: '20px' }} />
                </div>
              </foreignObject>
              <text textAnchor="middle" y="-54" fontSize="13" fontWeight="700" fill="#6d28d9">은닉층</text>
              <foreignObject x="-45" y="48" width="90" height="26">
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6d28d9', fontWeight: 'bold' }}>
                  <MathView math={step >= 1 ? h1.toFixed(3) : '?'} style={{ fontSize: '13.5px' }} />
                </div>
              </foreignObject>
            </g>

            {/* 노드 3: yHat (Sky & Blue 테마, 글로우 애니메이션 삭제) */}
            <g transform="translate(510, 120)">
              <circle 
                r="44" 
                fill={step === 1 ? '#e0f2fe' : activeTermKey === 'dyHat_dz2' ? '#e0f2fe' : '#ffffff'} 
                stroke={step === 1 ? '#0284c7' : activeTermKey === 'dyHat_dz2' ? '#0284c7' : step === 3 ? '#d97706' : '#cbd5e1'} 
                strokeWidth={step === 1 || activeTermKey === 'dyHat_dz2' ? '5' : '3'} 
              />
              <foreignObject x="-44" y="-44" width="88" height="88">
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1f2937', fontWeight: 'bold' }}>
                  <MathView math="\hat{y}" style={{ fontSize: '20px' }} />
                </div>
              </foreignObject>
              <text textAnchor="middle" y="-54" fontSize="13" fontWeight="700" fill="#0284c7">출력층</text>
              <foreignObject x="-45" y="48" width="90" height="26">
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', fontWeight: 'bold' }}>
                  <MathView math={step >= 1 ? yHat.toFixed(3) : '?'} style={{ fontSize: '13.5px' }} />
                </div>
              </foreignObject>
            </g>

            {/* 노드 4: Loss (Rose & Crimson 테마) */}
            <g transform="translate(670, 120)">
              <rect 
                x="-36" y="-28" width="72" height="56" rx="12" 
                fill={step === 2 ? '#ffe4e6' : '#fff1f2'} 
                stroke={step === 2 ? '#e11d48' : '#f43f5e'} 
                strokeWidth={step === 2 ? '4.5' : '3'} 
              />
              <text textAnchor="middle" y="5" fontSize="15" fontWeight="800" fill="#be123c">Loss</text>
              <foreignObject x="-40" y="-58" width="80" height="24">
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', color: '#be123c' }}>
                  <MathView math={`y = ${target.toFixed(2)}`} style={{ fontSize: '13px' }} />
                </div>
              </foreignObject>
              <foreignObject x="-45" y="44" width="90" height="26">
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48', fontWeight: 'bold' }}>
                  <MathView math={step >= 2 ? loss.toFixed(4) : '?'} style={{ fontSize: '13.5px' }} />
                </div>
              </foreignObject>
            </g>
          </svg>
        </div>
      </div>

      {/* 4. 선택된 Step (1~4) 별 세련된 커스텀 파스텔 연산 카드 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Step 1: 순전파 */}
        {step === 1 && (
          <div style={{ backgroundColor: '#f0f9ff', padding: '18px', borderRadius: '14px', border: '1.5px solid #bae6fd', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 4px 12px -2px rgba(2,132,199,0.08)' }}>
            <span style={{ fontSize: '14px', fontWeight: '800', color: '#0369a1' }}>
              1. 순전파 (Forward)
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '10px', border: '1px solid #bae6fd', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#0284c7', display: 'block', marginBottom: '4px' }}>은닉층 (h₁)</span>
                <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: '1.7' }}>
                  <MathView math={`z_1 = W_1 x + b_1 = ${w1.toFixed(2)}\\times ${x.toFixed(2)} + ${b1.toFixed(2)} = \\mathbf{${z1.toFixed(3)}}`} /><br/>
                  <MathView math={`h_1 = \\sigma(z_1) = \\mathbf{${h1.toFixed(3)}}`} style={{ fontWeight: '700', color: '#0284c7' }} />
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '10px', border: '1px solid #bae6fd', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#0284c7', display: 'block', marginBottom: '4px' }}>출력층 (ŷ)</span>
                <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: '1.7' }}>
                  <MathView math={`z_2 = W_2 h_1 + b_2 = ${w2.toFixed(2)}\\times ${h1.toFixed(3)} + (${b2.toFixed(2)}) = \\mathbf{${z2.toFixed(3)}}`} /><br/>
                  <MathView math={`\\hat{y} = \\sigma(z_2) = \\mathbf{${yHat.toFixed(3)}}`} style={{ fontWeight: '700', color: '#0284c7' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: 오차 산출 */}
        {step === 2 && (
          <div style={{ backgroundColor: '#fff1f2', padding: '18px', borderRadius: '14px', border: '1.5px solid #fecdd3', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 4px 12px -2px rgba(225,29,72,0.08)' }}>
            <span style={{ fontSize: '14px', fontWeight: '800', color: '#be123c' }}>
              2. 오차 산출
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '10px', border: '1px solid #fecdd3', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#e11d48', display: 'block', marginBottom: '4px' }}>손실 함수 </span>
                <MathView math={`L = \\frac{1}{2}(\\hat{y} - y)^2 = \\frac{1}{2}(${yHat.toFixed(4)} - ${target.toFixed(2)})^2 = \\mathbf{${loss.toFixed(4)}}`} style={{ color: '#991b1b', fontWeight: '700' }} />
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '10px', border: '1px solid #fecdd3', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#e11d48', display: 'block', marginBottom: '4px' }}>출력 오차 민감도</span>
                <MathView math={`\\frac{\\partial L}{\\partial \\hat{y}} = \\hat{y} - y = ${yHat.toFixed(4)} - ${target.toFixed(2)} = \\mathbf{${dL_dyHat.toFixed(4)}}`} style={{ color: '#991b1b', fontWeight: '700' }} />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: 역전파 */}
        {step === 3 && (
          <div style={{ backgroundColor: '#fffbeb', padding: '18px', borderRadius: '14px', border: '1.5px solid #fde68a', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 4px 12px -2px rgba(217,119,6,0.08)' }}>
            <span style={{ fontSize: '14px', fontWeight: '800', color: '#b45309' }}>
              3. 역전파 (Backward)
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid #fde68a', textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#d97706', display: 'block', marginBottom: '3px' }}>1. 출력층 기울기 (δ₂)</span>
                <MathView math={`\\delta_2 = (\\hat{y}-y)\\sigma'(z_2) = \\mathbf{${delta2.toFixed(4)}}`} style={{ fontSize: '12.5px', color: '#92400e', fontWeight: '700' }} />
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid #fde68a', textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#d97706', display: 'block', marginBottom: '3px' }}>2. W₂ 기울기 (<MathView math="\frac{\partial L}{\partial W_2}" style={{ fontSize: '11px', color: '#d97706' }} />)</span>
                <MathView math={`\\frac{\\partial L}{\\partial W_2} = \\delta_2 \\cdot h_1 = \\mathbf{${dL_dw2.toFixed(4)}}`} style={{ fontSize: '12.5px', color: '#92400e', fontWeight: '700' }} />
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid #fde68a', textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#d97706', display: 'block', marginBottom: '3px' }}>3. W₁ 기울기 (<MathView math="\frac{\partial L}{\partial W_1}" style={{ fontSize: '11px', color: '#d97706' }} />)</span>
                <MathView math={`\\frac{\\partial L}{\\partial W_1} = (\\delta_2 W_2)\\sigma'(z_1)x = \\mathbf{${dL_dw1.toFixed(4)}}`} style={{ fontSize: '12.5px', color: '#92400e', fontWeight: '700' }} />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: 가중치 갱신 */}
        {step === 4 && (
          <div style={{ backgroundColor: '#ecfdf5', padding: '18px', borderRadius: '14px', border: '1.5px solid #a7f3d0', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 4px 12px -2px rgba(5,150,105,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '800', color: '#047857' }}>
                4. 가중치 갱신
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: '700', color: '#059669', backgroundColor: '#ffffff', padding: '4px 10px', borderRadius: '8px', border: '1px solid #a7f3d0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                갱신 공식: <MathView math="W^{(new)} = W^{(old)} - \eta \cdot \frac{\partial L}{\partial W}" />
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '12px 10px', borderRadius: '10px', backgroundColor: '#ffffff', border: '1px solid #a7f3d0', textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#059669', display: 'block', marginBottom: '3px' }}>
                  <MathView math="W_1" style={{ fontSize: '13px', color: '#059669' }} />
                </span>
                <div style={{ display: 'block', marginBottom: '6px' }}>
                  <MathView math={`${w1.toFixed(3)} - ${lr.toFixed(1)} \\times (${dL_dw1.toFixed(4)})`} style={{ fontSize: '11px', color: '#334155' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: 'monospace', fontSize: '14px', fontWeight: '700' }}>
                  <span style={{ color: '#ef4444' }}>{w1.toFixed(3)}</span>
                  <ArrowRightIcon />
                  <span style={{ color: '#059669', fontWeight: '800' }}>{w1_next.toFixed(3)}</span>
                </div>
              </div>

              <div style={{ padding: '12px 10px', borderRadius: '10px', backgroundColor: '#ffffff', border: '1px solid #a7f3d0', textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#059669', display: 'block', marginBottom: '3px' }}>
                  <MathView math="b_1" style={{ fontSize: '13px', color: '#059669' }} />
                </span>
                <div style={{ display: 'block', marginBottom: '6px' }}>
                  <MathView math={`${b1.toFixed(3)} - ${lr.toFixed(1)} \\times (${dL_db1.toFixed(4)})`} style={{ fontSize: '11px', color: '#334155' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: 'monospace', fontSize: '12.5px', fontWeight: '700' }}>
                  <span style={{ color: '#ef4444' }}>{b1.toFixed(3)}</span>
                  <ArrowRightIcon />
                  <span style={{ color: '#059669', fontWeight: '800' }}>{b1_next.toFixed(3)}</span>
                </div>
              </div>

              <div style={{ padding: '12px 10px', borderRadius: '10px', backgroundColor: '#ffffff', border: '1px solid #a7f3d0', textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#059669', display: 'block', marginBottom: '3px' }}>
                  <MathView math="W_2" style={{ fontSize: '13px', color: '#059669' }} />
                </span>
                <div style={{ display: 'block', marginBottom: '6px' }}>
                  <MathView math={`${w2.toFixed(3)} - ${lr.toFixed(1)} \\times (${dL_dw2.toFixed(4)})`} style={{ fontSize: '11px', color: '#334155' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: 'monospace', fontSize: '12.5px', fontWeight: '700' }}>
                  <span style={{ color: '#ef4444' }}>{w2.toFixed(3)}</span>
                  <ArrowRightIcon />
                  <span style={{ color: '#059669', fontWeight: '800' }}>{w2_next.toFixed(3)}</span>
                </div>
              </div>

              <div style={{ padding: '12px 10px', borderRadius: '10px', backgroundColor: '#ffffff', border: '1px solid #a7f3d0', textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#059669', display: 'block', marginBottom: '3px' }}>
                  <MathView math="b_2" style={{ fontSize: '13px', color: '#059669' }} />
                </span>
                <div style={{ display: 'block', marginBottom: '6px' }}>
                  <MathView math={`${b2.toFixed(3)} - ${lr.toFixed(1)} \\times (${dL_db2.toFixed(4)})`} style={{ fontSize: '11px', color: '#334155' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: 'monospace', fontSize: '12.5px', fontWeight: '700' }}>
                  <span style={{ color: '#ef4444' }}>{b2.toFixed(3)}</span>
                  <ArrowRightIcon />
                  <span style={{ color: '#059669', fontWeight: '800' }}>{b2_next.toFixed(3)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. W₁ 연쇄 법칙 상세 과정 (단일 통합 체인 룰 탐색기 카드) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#ffffff', padding: '22px', borderRadius: '18px', border: '1px solid #cbd5e1', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
          <span style={{ fontSize: '14.5px', fontWeight: '800', color: '#1e1b4b' }}>
            연쇄 법칙을 사용한 <MathView math="W_1" style={{ fontSize: '13.5px' }} /> 기울기 계산 과정
          </span>
        </div>

        {/* 1. 수치 곱셈 연산식 바 */}
        <div style={{ fontSize: '13px', color: '#1e1b4b', overflowX: 'auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: '#f1f5f9', padding: '12px 18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <MathView math={`\\frac{\\partial L}{\\partial W_1} = (${dL_dyHat.toFixed(4)}) \\times (${dyHat_dz2.toFixed(4)}) \\times (${w2.toFixed(2)}) \\times (${dh1_dz1.toFixed(4)}) \\times (${x.toFixed(2)}) = ${dL_dw1.toFixed(4)}`} style={{ fontSize: '13px' }} />
        </div>

        {/* 2. 역할별 입체 테마 미분 항 버튼 목록 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', width: '100%' }}>
          {[
            { key: 'dL_dyHat' },
            { key: 'dyHat_dz2' },
            { key: 'dz2_dh1' },
            { key: 'dh1_dz1' },
            { key: 'dz1_dw1' }
          ].map((item, idx) => {
            const info = chainRuleTerms[item.key];
            const isSelected = activeTermKey === item.key;
            return (
              <React.Fragment key={item.key}>
                {idx > 0 && <span style={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '15px' }}>×</span>}
                <button
                  onClick={() => setActiveTermKey(item.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '9px 18px',
                    borderRadius: '10px',
                    border: isSelected ? `2px solid ${info.themeColor}` : '1px solid #cbd5e1',
                    backgroundColor: isSelected ? info.bgColor : '#ffffff',
                    color: isSelected ? info.themeColor : '#334155',
                    fontWeight: '800',
                    cursor: 'pointer',
                    boxShadow: isSelected ? `0 4px 12px ${info.themeColor}33` : '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <MathView math={info.symbol} style={{ fontSize: '15.5px' }} />
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* 3. 선택된 미분 항 통합 상세 내역 (수식 유도 & 개념 2열 통합 카드) */}
        <div style={{ padding: '16px', backgroundColor: activeTerm.bgColor, borderRadius: '14px', border: `1.5px solid ${activeTerm.themeColor}40`, display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.2s ease' }}>
          {/* 하이라이트 요약 헤더 (중앙 정렬) */}
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e1b4b', backgroundColor: '#ffffff', padding: '10px 16px', borderRadius: '10px', border: `1px solid ${activeTerm.themeColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '6px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
            <MathView math={`\\left( ${activeTerm.symbol} \\right) = `} style={{ fontSize: '13px' }} />
            <MathView math={activeTerm.calcFormulaMath} style={{ fontSize: '13px' }} />
          </div>

          {/* 수식 유도 & 개념 2열 세련된 카드 그리드 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            <div style={{ padding: '14px', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #cbd5e1', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#059669', display: 'block', marginBottom: '4px' }}>
                수식 유도
              </span>
              <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: '1.6' }}>
                {activeTerm.mathReasonNode}
              </div>
            </div>

            <div style={{ padding: '14px', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #cbd5e1', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: activeTerm.themeColor, display: 'block', marginBottom: '4px' }}>
                개념 : {activeTerm.name}
              </span>
              <span style={{ fontSize: '12.5px', color: '#334155', lineHeight: '1.6', display: 'block' }}>
                {activeTerm.description}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default BackpropSimulator;
