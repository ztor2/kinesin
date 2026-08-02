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
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4338ca" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
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

  // 체인 룰 개별 미분 항 정보 맵 (rmp 커밋 버전 문구 100% 동일)
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
      highlight: 'loss'
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
      highlight: 'yHat'
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
      highlight: 'w2'
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
      highlight: 'w2'
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
      highlight: 'h1'
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
      highlight: 'w1'
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
        gap: '18px',
        width: '100%',
        clear: 'both',
        boxSizing: 'border-box',
        margin: '20px 0',
        padding: '24px',
        borderRadius: '16px',
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)'
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
              padding: '6px 12px',
              fontSize: '12.5px',
              fontWeight: '700',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: showSettings ? '#f1f5f9' : '#f8fafc',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <span>파라미터 및 학습 설정</span>
            <span style={{ fontSize: '10px', color: '#64748b' }}>{showSettings ? '▲' : '▼ '}</span>
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={handleReset}
              style={{
                padding: '7px 14px',
                fontSize: '12.5px',
                fontWeight: '600',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              초기화
            </button>

            <button 
              onClick={handleRunFullStep}
              style={{
                padding: '7px 16px',
                fontSize: '12.5px',
                fontWeight: '700',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(79, 70, 229, 0.35)'
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
              gap: '10px',
              backgroundColor: '#f8fafc',
              padding: '14px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: '700', color: '#334155' }}>
                <span>입력 (x)</span>
                <span style={{ fontFamily: 'monospace', color: '#4f46e5' }}>{x.toFixed(2)}</span>
              </div>
              <input type="range" min="0.1" max="1.0" step="0.05" value={x} onChange={(e) => { setX(Number(e.target.value)); setStep(1); }} style={{ width: '100%', cursor: 'pointer' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: '700', color: '#334155' }}>
                <span>정답 (y)</span>
                <span style={{ fontFamily: 'monospace', color: '#4f46e5' }}>{target.toFixed(2)}</span>
              </div>
              <input type="range" min="0.1" max="1.0" step="0.05" value={target} onChange={(e) => { setTarget(Number(e.target.value)); setStep(1); }} style={{ width: '100%', cursor: 'pointer' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: '700', color: '#334155' }}>
                <span>편향 (b₁)</span>
                <span style={{ fontFamily: 'monospace', color: '#4f46e5' }}>{b1.toFixed(2)}</span>
              </div>
              <input type="range" min="-1.0" max="1.0" step="0.05" value={b1} onChange={(e) => { setB1(Number(e.target.value)); setStep(1); }} style={{ width: '100%', cursor: 'pointer' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: '700', color: '#334155' }}>
                <span>편향 (b₂)</span>
                <span style={{ fontFamily: 'monospace', color: '#4f46e5' }}>{b2.toFixed(2)}</span>
              </div>
              <input type="range" min="-1.0" max="1.0" step="0.05" value={b2} onChange={(e) => { setB2(Number(e.target.value)); setStep(1); }} style={{ width: '100%', cursor: 'pointer' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: '700', color: '#334155' }}>
                <span>학습률 (η)</span>
                <span style={{ fontFamily: 'monospace', color: '#4f46e5' }}>{lr.toFixed(1)}</span>
              </div>
              <input type="range" min="0.1" max="1.5" step="0.1" value={lr} onChange={(e) => setLr(Number(e.target.value))} style={{ width: '100%', cursor: 'pointer' }} />
            </div>
          </div>
        )}
      </div>

      {/* 2. Step 탭 버튼 (rmp 스타일) */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: '6px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px', flexWrap: 'wrap' }}>
          {[
            { id: 1, label: '1. 순전파 (Forward)' },
            { id: 2, label: '2. 오차 산출 (Loss)' },
            { id: 3, label: '3. 역전파 (Backward)' },
            { id: 4, label: '4. 가중치 갱신' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setStep(t.id)}
              style={{
                padding: '7px 15px',
                fontSize: '13px',
                fontWeight: '700',
                borderRadius: '7px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: step === t.id ? '#4f46e5' : 'transparent',
                color: step === t.id ? '#ffffff' : '#64748b',
                boxShadow: step === t.id ? '0 2px 6px rgba(79,70,229,0.3)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. SVG 신경망 다이어그램 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', gap: '14px' }}>
        <div style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
          <svg viewBox="0 0 660 210" style={{ width: '100%', maxWidth: '660px', height: 'auto', minWidth: '340px' }}>
            <defs>
              <marker id="arrow-blue" viewBox="0 0 10 10" refX="35" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
              </marker>
              <marker id="arrow-orange" viewBox="0 0 10 10" refX="35" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#ea580c" />
              </marker>
            </defs>

            {/* W1 연결선 */}
            <line 
              x1="80" y1="100" x2="270" y2="100" 
              stroke={step === 3 ? '#ea580c' : step === 1 ? '#4f46e5' : activeTerm.highlight === 'w1' ? '#9333ea' : '#cbd5e1'} 
              strokeWidth={step === 1 || step === 3 || activeTerm.highlight === 'w1' ? '4.5' : '2'}
              markerEnd={step === 3 ? undefined : 'url(#arrow-blue)'}
              markerStart={step === 3 ? 'url(#arrow-orange)' : undefined}
            />

            {/* 가중치 W1 뱃지 */}
            <g transform="translate(175, 75)">
              <rect 
                x="-46" y="-13" width="92" height="23" rx="5" 
                fill={step === 4 ? '#dcfce7' : activeTerm.highlight === 'w1' ? '#f3e8ff' : '#ffffff'} 
                stroke={step === 4 ? '#16a34a' : activeTerm.highlight === 'w1' ? '#9333ea' : '#cbd5e1'} 
                strokeWidth={step === 4 || activeTerm.highlight === 'w1' ? '2.5' : '1.5'} 
              />
              <text textAnchor="middle" y="3" fontSize="13" fontFamily="monospace" fontWeight="bold" fill={step === 4 ? '#15803d' : '#1e293b'}>
                W₁ = {w1.toFixed(2)}
              </text>
            </g>

            {/* z1 선형 신호 뱃지 */}
            <g transform="translate(175, 125)">
              <rect x="-42" y="-11" width="84" height="20" rx="4" fill={step === 1 ? '#e0e7ff' : '#f8fafc'} stroke="#c7d2fe" strokeWidth="1" />
              <text textAnchor="middle" y="3" fontSize="11" fontFamily="monospace" fontWeight="700" fill={step === 1 ? '#3730a3' : '#64748b'}>
                z₁ = {z1.toFixed(3)}
              </text>
            </g>

            {/* W2 연결선 */}
            <line 
              x1="270" y1="100" x2="460" y2="100" 
              stroke={step === 3 ? '#ea580c' : step === 1 ? '#4f46e5' : activeTerm.highlight === 'w2' ? '#ea580c' : '#cbd5e1'} 
              strokeWidth={step === 1 || step === 3 || activeTerm.highlight === 'w2' ? '4.5' : '2'}
              markerEnd={step === 3 ? undefined : 'url(#arrow-blue)'}
              markerStart={step === 3 ? 'url(#arrow-orange)' : undefined}
            />

            {/* 가중치 W2 뱃지 */}
            <g transform="translate(365, 75)">
              <rect 
                x="-46" y="-13" width="92" height="23" rx="5" 
                fill={step === 4 ? '#dcfce7' : activeTerm.highlight === 'w2' ? '#ffedd5' : '#ffffff'} 
                stroke={step === 4 ? '#16a34a' : activeTerm.highlight === 'w2' ? '#ea580c' : '#cbd5e1'} 
                strokeWidth={step === 4 || activeTerm.highlight === 'w2' ? '2.5' : '1.5'} 
              />
              <text textAnchor="middle" y="3" fontSize="13" fontFamily="monospace" fontWeight="bold" fill={step === 4 ? '#15803d' : '#1e293b'}>
                W₂ = {w2.toFixed(2)}
              </text>
            </g>

            {/* z2 선형 신호 뱃지 */}
            <g transform="translate(365, 125)">
              <rect x="-42" y="-11" width="84" height="20" rx="4" fill={step === 1 ? '#e0e7ff' : '#f8fafc'} stroke="#c7d2fe" strokeWidth="1" />
              <text textAnchor="middle" y="3" fontSize="11" fontFamily="monospace" fontWeight="700" fill={step === 1 ? '#3730a3' : '#64748b'}>
                z₂ = {z2.toFixed(3)}
              </text>
            </g>

            {/* Loss 수평선 */}
            <line x1="460" y1="100" x2="590" y2="100" stroke={step === 2 ? '#ef4444' : '#cbd5e1'} strokeWidth="2.5" strokeDasharray="4 4" />

            {/* 노드 1: x */}
            <g transform="translate(80, 100)">
              <circle r="36" fill="#ffffff" stroke="#4f46e5" strokeWidth="3" />
              <text textAnchor="middle" y="6" fontSize="18" fontWeight="800" fill="#3730a3">x</text>
              <text textAnchor="middle" y="-45" fontSize="12" fontWeight="700" fill="#64748b">입력층</text>
              <text textAnchor="middle" y="55" fontSize="13" fontFamily="monospace" fontWeight="700" fill="#4f46e5">
                {x.toFixed(2)}
              </text>
            </g>

            {/* 노드 2: h1 */}
            <g transform="translate(270, 100)">
              <circle 
                r="36" 
                fill={step === 1 ? '#e0e7ff' : activeTerm.highlight === 'h1' ? '#f3e8ff' : '#ffffff'} 
                stroke={step === 1 ? '#4f46e5' : activeTerm.highlight === 'h1' ? '#9333ea' : step === 3 ? '#ea580c' : '#cbd5e1'} 
                strokeWidth={step === 1 || activeTerm.highlight === 'h1' ? '4.5' : '2.5'} 
              />
              <text textAnchor="middle" y="6" fontSize="18" fontWeight="800" fill="#1f2937">h₁</text>
              <text textAnchor="middle" y="-45" fontSize="12" fontWeight="700" fill="#6366f1">은닉층</text>
              <text textAnchor="middle" y="55" fontSize="13" fontFamily="monospace" fontWeight="700" fill="#4f46e5">
                {step >= 1 ? h1.toFixed(3) : '?'}
              </text>
            </g>

            {/* 노드 3: yHat */}
            <g transform="translate(460, 100)">
              <circle 
                r="36" 
                fill={step === 1 ? '#e0f2fe' : activeTerm.highlight === 'yHat' ? '#e0f2fe' : '#ffffff'} 
                stroke={step === 1 ? '#0284c7' : activeTerm.highlight === 'yHat' ? '#0284c7' : step === 3 ? '#ea580c' : '#cbd5e1'} 
                strokeWidth={step === 1 || activeTerm.highlight === 'yHat' ? '4.5' : '2.5'} 
              />
              <text textAnchor="middle" y="6" fontSize="18" fontWeight="800" fill="#1f2937">ŷ</text>
              <text textAnchor="middle" y="-45" fontSize="12" fontWeight="700" fill="#0284c7">출력층</text>
              <text textAnchor="middle" y="55" fontSize="13" fontFamily="monospace" fontWeight="700" fill="#0284c7">
                {step >= 1 ? yHat.toFixed(3) : '?'}
              </text>
            </g>

            {/* 노드 4: Loss */}
            <g transform="translate(590, 100)">
              <rect 
                x="-32" y="-25" width="64" height="50" rx="10" 
                fill={step === 2 ? '#fee2e2' : '#fef2f2'} 
                stroke={step === 2 ? '#dc2626' : '#ef4444'} 
                strokeWidth={step === 2 ? '4' : '2.5'} 
              />
              <text textAnchor="middle" y="4" fontSize="14" fontWeight="800" fill="#991b1b">Loss</text>
              <text textAnchor="middle" y="-33" fontSize="12" fontWeight="bold" fill="#991b1b">
                y = {target.toFixed(2)}
              </text>
              <text textAnchor="middle" y="52" fontSize="13" fontFamily="monospace" fontWeight="bold" fill="#dc2626">
                {step >= 2 ? loss.toFixed(4) : '?'}
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* 4. 선택된 Step (1~4) 스마트 연산 카드 (군더더기 이모지/문구 제거 버전) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Step 1: 순전파 */}
        {step === 1 && (
          <div style={{ backgroundColor: '#eef2ff', padding: '16px', borderRadius: '12px', border: '1.5px solid #c7d2fe', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: '800', color: '#3730a3' }}>
              1. 순전파 층별 연산 과정
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #c7d2fe' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#4338ca', display: 'block', marginBottom: '2px' }}>은닉층 (h₁)</span>
                <div style={{ fontSize: '12.5px', color: '#334155' }}>
                  <MathView math={`z_1 = W_1 x + b_1 = ${w1.toFixed(2)}\\times ${x.toFixed(2)} + ${b1.toFixed(2)} = \\mathbf{${z1.toFixed(3)}}`} /><br/>
                  <MathView math={`h_1 = \\sigma(z_1) = \\mathbf{${h1.toFixed(3)}}`} style={{ fontWeight: '700', color: '#4338ca' }} />
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #c7d2fe' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#0284c7', display: 'block', marginBottom: '2px' }}>출력층 (ŷ)</span>
                <div style={{ fontSize: '12.5px', color: '#334155' }}>
                  <MathView math={`z_2 = W_2 h_1 + b_2 = ${w2.toFixed(2)}\\times ${h1.toFixed(3)} + (${b2.toFixed(2)}) = \\mathbf{${z2.toFixed(3)}}`} /><br/>
                  <MathView math={`\\hat{y} = \\sigma(z_2) = \\mathbf{${yHat.toFixed(3)}}`} style={{ fontWeight: '700', color: '#0284c7' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: 오차 산출 */}
        {step === 2 && (
          <div style={{ backgroundColor: '#fef2f2', padding: '16px', borderRadius: '12px', border: '1.5px solid #fca5a5', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: '800', color: '#991b1b' }}>
              2. 오차 및 오차 민감도
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#dc2626', display: 'block', marginBottom: '2px' }}>손실 함수 (Loss)</span>
                <MathView math={`L = \\frac{1}{2}(\\hat{y} - y)^2 = \\frac{1}{2}(${yHat.toFixed(4)} - ${target.toFixed(2)})^2 = \\mathbf{${loss.toFixed(4)}}`} />
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#dc2626', display: 'block', marginBottom: '2px' }}>출력 오차 민감도</span>
                <MathView math={`\\frac{\\partial L}{\\partial \\hat{y}} = \\hat{y} - y = ${yHat.toFixed(4)} - ${target.toFixed(2)} = \\mathbf{${dL_dyHat.toFixed(4)}}`} />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: 역전파 */}
        {step === 3 && (
          <div style={{ backgroundColor: '#fff7ed', padding: '16px', borderRadius: '12px', border: '1.5px solid #fed7aa', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: '800', color: '#9a3412' }}>
              3. 역전파 오차 전달 요약
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #fed7aa', textAlign: 'center' }}>
                <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#ea580c', display: 'block', marginBottom: '2px' }}>1. 출력층 기울기 (δ₂)</span>
                <MathView math={`\\delta_2 = (\\hat{y}-y)\\sigma'(z_2) = \\mathbf{${delta2.toFixed(4)}}`} style={{ fontSize: '12px' }} />
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #fed7aa', textAlign: 'center' }}>
                <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#ea580c', display: 'block', marginBottom: '2px' }}>2. W₂ 기울기 (<MathView math="\frac{\partial L}{\partial W_2}" style={{ fontSize: '11px' }} />)</span>
                <MathView math={`\\frac{\\partial L}{\\partial W_2} = \\delta_2 \\cdot h_1 = \\mathbf{${dL_dw2.toFixed(4)}}`} style={{ fontSize: '12px' }} />
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #fed7aa', textAlign: 'center' }}>
                <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#ea580c', display: 'block', marginBottom: '2px' }}>3. W₁ 기울기 (<MathView math="\frac{\partial L}{\partial W_1}" style={{ fontSize: '11px' }} />)</span>
                <MathView math={`\\frac{\\partial L}{\\partial W_1} = (\\delta_2 W_2)\\sigma'(z_1)x = \\mathbf{${dL_dw1.toFixed(4)}}`} style={{ fontSize: '12px' }} />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: 가중치 갱신 */}
        {step === 4 && (
          <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '12px', border: '1.5px solid #bbf7d0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ fontSize: '14px', fontWeight: '800', color: '#166534' }}>
                4. 가중치 갱신 (Weight Update)
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: '700', color: '#15803d', backgroundColor: '#ffffff', padding: '3px 8px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                갱신 공식: <MathView math="W^{(new)} = W^{(old)} - \eta \cdot \frac{\partial L}{\partial W}" />
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
              <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#15803d', display: 'block', marginBottom: '2px' }}>W₁</span>
                <span style={{ fontSize: '10.5px', color: '#64748b', fontFamily: 'monospace', display: 'block', marginBottom: '4px' }}>
                  {w1.toFixed(3)} - {lr.toFixed(1)}×({dL_dw1.toFixed(4)})
                </span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontFamily: 'monospace', fontSize: '12px', fontWeight: '700' }}>
                  <span style={{ color: '#ef4444' }}>{w1.toFixed(3)}</span>
                  <ArrowRightIcon />
                  <span style={{ color: '#16a34a', fontWeight: '800' }}>{w1_next.toFixed(3)}</span>
                </div>
              </div>

              <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#15803d', display: 'block', marginBottom: '2px' }}>b₁</span>
                <span style={{ fontSize: '10.5px', color: '#64748b', fontFamily: 'monospace', display: 'block', marginBottom: '4px' }}>
                  {b1.toFixed(3)} - {lr.toFixed(1)}×({dL_db1.toFixed(4)})
                </span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontFamily: 'monospace', fontSize: '12px', fontWeight: '700' }}>
                  <span style={{ color: '#ef4444' }}>{b1.toFixed(3)}</span>
                  <ArrowRightIcon />
                  <span style={{ color: '#16a34a', fontWeight: '800' }}>{b1_next.toFixed(3)}</span>
                </div>
              </div>

              <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#15803d', display: 'block', marginBottom: '2px' }}>W₂</span>
                <span style={{ fontSize: '10.5px', color: '#64748b', fontFamily: 'monospace', display: 'block', marginBottom: '4px' }}>
                  {w2.toFixed(3)} - {lr.toFixed(1)}×({dL_dw2.toFixed(4)})
                </span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontFamily: 'monospace', fontSize: '12px', fontWeight: '700' }}>
                  <span style={{ color: '#ef4444' }}>{w2.toFixed(3)}</span>
                  <ArrowRightIcon />
                  <span style={{ color: '#16a34a', fontWeight: '800' }}>{w2_next.toFixed(3)}</span>
                </div>
              </div>

              <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#15803d', display: 'block', marginBottom: '2px' }}>b₂</span>
                <span style={{ fontSize: '10.5px', color: '#64748b', fontFamily: 'monospace', display: 'block', marginBottom: '4px' }}>
                  {b2.toFixed(3)} - {lr.toFixed(1)}×({dL_db2.toFixed(4)})
                </span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontFamily: 'monospace', fontSize: '12px', fontWeight: '700' }}>
                  <span style={{ color: '#ef4444' }}>{b2.toFixed(3)}</span>
                  <ArrowRightIcon />
                  <span style={{ color: '#16a34a', fontWeight: '800' }}>{b2_next.toFixed(3)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. W₁ 연쇄 법칙 상세 과정 (How Chain Rule Works) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid #cbd5e1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
          <span style={{ fontSize: '14px', fontWeight: '800', color: '#3730a3' }}>
            연쇄 법칙을 사용한 <MathView math="W_1" style={{ fontSize: '13px' }} /> 기울기 계산 예시
          </span>
        </div>

        {/* 수치 연산식과 미분 항 클릭 버튼이 통합된 단일 카드 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #c7d2fe', alignItems: 'center' }}>
          {/* 실제 수치를 곱해 결과값을 도출하는 통합 연산식 */}
          <div style={{ fontSize: '13px', color: '#312e81', overflowX: 'auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: '#eef2ff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #c7d2fe' }}>
            <MathView math={`\\frac{\\partial L}{\\partial W_1} = (${dL_dyHat.toFixed(4)}) \\times (${dyHat_dz2.toFixed(4)}) \\times (${w2.toFixed(2)}) \\times (${dh1_dz1.toFixed(4)}) \\times (${x.toFixed(2)}) = `} style={{ fontSize: '13px' }} />
            <span style={{ color: '#4338ca', fontWeight: '800', fontSize: '14px', fontFamily: 'monospace' }}>{dL_dw1.toFixed(4)}</span>
          </div>

          {/* 소제목 삭제된 미분 항 버튼 목록 (수식 버튼만 또렷하게 배치) */}
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
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                      backgroundColor: isSelected ? '#e0e7ff' : '#f8fafc',
                      color: isSelected ? '#3730a3' : '#334155',
                      fontWeight: '800',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 2px 6px rgba(79, 70, 229, 0.25)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <MathView math={info.symbol} style={{ fontSize: '15px' }} />
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* 선택된 항 상세 설명 카드 */}
        <div style={{ padding: '14px 16px', backgroundColor: '#ffffff', borderRadius: '10px', border: '1.5px solid #c7d2fe', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e1b4b', backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
            <span style={{ fontWeight: '800', color: '#3730a3' }}>{activeTerm.name}</span>
            <MathView math={`\\left( ${activeTerm.symbol} \\right) = `} style={{ fontSize: '13px' }} />
            <MathView math={activeTerm.calcFormulaMath} style={{ fontSize: '13px' }} />
          </div>

          <div style={{ padding: '10px 12px', backgroundColor: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#15803d', display: 'block', marginBottom: '2px' }}>
              수식 유도
            </span>
            <div style={{ fontSize: '12.5px', color: '#166534', lineHeight: '1.5' }}>
              {activeTerm.mathReasonNode}
            </div>
          </div>

          <div style={{ padding: '10px 12px', backgroundColor: '#eef2ff', borderRadius: '6px', border: '1px solid #c7d2fe' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#3730a3', display: 'block', marginBottom: '2px' }}>
              개념
            </span>
            <span style={{ fontSize: '12.5px', color: '#312e81', lineHeight: '1.5', display: 'block' }}>
              {activeTerm.description}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default BackpropSimulator;
