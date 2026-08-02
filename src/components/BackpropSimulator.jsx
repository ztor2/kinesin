import React, { useState } from 'react';

// Sigmoid 활성화 함수 및 국소 미분 정의 (backprop.mdx 문서 설명과 100% 일치)
const sigmoid = (z) => 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, z))));
const sigmoidDf = (z) => {
  const s = sigmoid(z);
  return s * (1 - s);
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
  // MSE 손실의 ŷ 편미분: (ŷ - y)
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

  // 체인 룰 개별 미분 항 정보 맵
  const chainRuleTerms = {
    dL_dyHat: {
      symbol: '∂L / ∂ŷ',
      name: '출력 오차 민감도',
      calcFormula: `ŷ - y = ${yHat.toFixed(4)} - ${target.toFixed(2)}`,
      value: dL_dyHat,
      description: '최종 예측값(ŷ)과 목표 정답(y) 간의 오차 차이입니다. 역전파가 시작되는 맨 첫 번째 출발점 오차 신호입니다.',
      highlight: 'loss'
    },
    dyHat_dz2: {
      symbol: '∂ŷ / ∂z₂',
      name: '출력층 Sigmoid 기울기',
      calcFormula: `Sigmoid'(z₂) = ${dyHat_dz2.toFixed(4)}`,
      value: dyHat_dz2,
      description: '출력층 비선형 활성화 함수(Sigmoid)의 국소 변화율입니다. 오차 신호가 출력 노드를 통과할 때 곱해지는 감쇄/증폭율입니다.',
      highlight: 'yHat'
    },
    dz2_dw2: {
      symbol: '∂z₂ / ∂W₂',
      name: 'W₂ 책임 입력값',
      calcFormula: `h₁ = ${h1.toFixed(4)}`,
      value: h1,
      description: '순전파 시 은닉층 h₁에서 들어온 활성화 값입니다. 과거 입력값이 클수록 가중치 W₂가 지는 오차 책임(기울기)이 커집니다.',
      highlight: 'w2'
    },
    dz2_dh1: {
      symbol: '∂z₂ / ∂h₁',
      name: '상위 가중치 전파율',
      calcFormula: `W₂ = ${w2.toFixed(4)}`,
      value: w2,
      description: '하위 층(h₁)으로 오차가 역전파될 때 곱해지는 상위 층 가중치 W₂입니다. 가중치 크기에 비례해 오차 신호가 전달됩니다.',
      highlight: 'w2'
    },
    dh1_dz1: {
      symbol: '∂h₁ / ∂z₁',
      name: '은닉층 Sigmoid 기울기',
      calcFormula: `Sigmoid'(z₁) = ${dh1_dz1.toFixed(4)}`,
      value: dh1_dz1,
      description: '은닉층 1 활성화 함수(Sigmoid)의 국소 변화율입니다. 상위 오차 신호(δ₂)와 W₂가 곱해진 후 이 미분값이 다시 연쇄 곱셈됩니다.',
      highlight: 'h1'
    },
    dz1_dw1: {
      symbol: '∂z₁ / ∂W₁',
      name: 'W₁ 책임 입력값',
      calcFormula: `x = ${x.toFixed(2)}`,
      value: x,
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
        gap: '20px',
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
      {/* 1. 상단 컨트롤 패널 (우측 정렬: 초기화 -> 1회 학습 실행) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', flexWrap: 'wrap', width: '100%' }}>
        <button 
          onClick={handleReset}
          style={{
            padding: '8px 14px',
            fontSize: '13px',
            fontWeight: '600',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            color: '#475569',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          🔄 초기화
        </button>

        <button 
          onClick={handleRunFullStep}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 18px',
            fontSize: '13px',
            fontWeight: '700',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#4f46e5',
            color: '#ffffff',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(79, 70, 229, 0.35)',
            transition: 'all 0.15s ease'
          }}
        >
          <span>▶</span>
          <span>1회 학습 실행</span>
        </button>
      </div>

      {/* 2. 입력 슬라이더 패널 */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
          backgroundColor: '#f8fafc',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: '#334155' }}>
            <span>입력값 (x)</span>
            <span style={{ fontFamily: 'monospace', color: '#4f46e5' }}>{x.toFixed(2)}</span>
          </div>
          <input 
            type="range" min="0.1" max="1.0" step="0.05" 
            value={x} 
            onChange={(e) => { setX(Number(e.target.value)); setStep(1); }}
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: '#334155' }}>
            <span>목표 정답 (y)</span>
            <span style={{ fontFamily: 'monospace', color: '#4f46e5' }}>{target.toFixed(2)}</span>
          </div>
          <input 
            type="range" min="0.1" max="1.0" step="0.05" 
            value={target} 
            onChange={(e) => { setTarget(Number(e.target.value)); setStep(1); }}
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: '#334155' }}>
            <span>학습률 (η)</span>
            <span style={{ fontFamily: 'monospace', color: '#4f46e5' }}>{lr.toFixed(1)}</span>
          </div>
          <input 
            type="range" min="0.1" max="1.5" step="0.1" 
            value={lr} 
            onChange={(e) => setLr(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* 3. Step 탭 버튼 */}
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
                padding: '7px 14px',
                fontSize: '13px',
                fontWeight: '700',
                borderRadius: '7px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: step === t.id ? '#ffffff' : 'transparent',
                color: step === t.id ? '#0f172a' : '#64748b',
                boxShadow: step === t.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. SVG 신경망 그래프 시각화 (선택된 미분 항 강조 연동) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <div style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
          <svg viewBox="0 0 600 200" style={{ width: '100%', maxWidth: '600px', height: 'auto', minWidth: '320px' }}>
            <defs>
              <marker id="arrow-blue" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
              </marker>
              <marker id="arrow-orange" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#ea580c" />
              </marker>
            </defs>

            {/* W1 연결선 */}
            <line 
              x1="80" y1="100" x2="250" y2="100" 
              stroke={activeTerm.highlight === 'w1' ? '#9333ea' : step === 3 ? '#ea580c' : step >= 1 ? '#4f46e5' : '#cbd5e1'} 
              strokeWidth={activeTerm.highlight === 'w1' ? '5' : step === 3 ? '4' : '3'}
              markerEnd={step === 3 ? undefined : 'url(#arrow-blue)'}
              markerStart={step === 3 ? 'url(#arrow-orange)' : undefined}
            />

            {/* 가중치 W1 뱃지 */}
            <g transform="translate(165, 78)">
              <rect 
                x="-46" y="-13" width="92" height="22" rx="5" 
                fill={activeTerm.highlight === 'w1' ? '#f3e8ff' : '#ffffff'} 
                stroke={activeTerm.highlight === 'w1' ? '#9333ea' : '#cbd5e1'} 
                strokeWidth={activeTerm.highlight === 'w1' ? '2.5' : '1.5'} 
              />
              <text textAnchor="middle" y="3" fontSize="13" fontFamily="monospace" fontWeight="bold" fill={activeTerm.highlight === 'w1' ? '#6b21a8' : '#1e293b'}>
                W₁ = {w1.toFixed(2)}
              </text>
            </g>

            {/* W2 연결선 */}
            <line 
              x1="250" y1="100" x2="420" y2="100" 
              stroke={activeTerm.highlight === 'w2' ? '#ea580c' : step === 3 ? '#ea580c' : step >= 1 ? '#4f46e5' : '#cbd5e1'} 
              strokeWidth={activeTerm.highlight === 'w2' ? '5' : step === 3 ? '4' : '3'}
              markerEnd={step === 3 ? undefined : 'url(#arrow-blue)'}
              markerStart={step === 3 ? 'url(#arrow-orange)' : undefined}
            />

            {/* 가중치 W2 뱃지 */}
            <g transform="translate(335, 78)">
              <rect 
                x="-46" y="-13" width="92" height="22" rx="5" 
                fill={activeTerm.highlight === 'w2' ? '#ffedd5' : '#ffffff'} 
                stroke={activeTerm.highlight === 'w2' ? '#ea580c' : '#cbd5e1'} 
                strokeWidth={activeTerm.highlight === 'w2' ? '2.5' : '1.5'} 
              />
              <text textAnchor="middle" y="3" fontSize="13" fontFamily="monospace" fontWeight="bold" fill={activeTerm.highlight === 'w2' ? '#9a3412' : '#1e293b'}>
                W₂ = {w2.toFixed(2)}
              </text>
            </g>

            {/* Loss 수평선 */}
            <line x1="420" y1="100" x2="540" y2="100" stroke={step >= 2 ? '#ef4444' : '#cbd5e1'} strokeWidth="2.5" strokeDasharray="4 4" />

            {/* 노드 1: x */}
            <g transform="translate(80, 100)">
              <circle r="28" fill="#ffffff" stroke="#4f46e5" strokeWidth="3" />
              <text textAnchor="middle" y="5" fontSize="16" fontWeight="800" fill="#3730a3">x</text>
              <text textAnchor="middle" y="44" fontSize="13" fontFamily="monospace" fontWeight="700" fill="#4f46e5">
                입력: {x.toFixed(2)}
              </text>
            </g>

            {/* 노드 2: h1 (은닉층) */}
            <g transform="translate(250, 100)">
              <circle 
                r="30" 
                fill={activeTerm.highlight === 'h1' ? '#f3e8ff' : '#ffffff'} 
                stroke={activeTerm.highlight === 'h1' ? '#9333ea' : step === 3 ? '#ea580c' : '#4f46e5'} 
                strokeWidth={activeTerm.highlight === 'h1' ? '4' : '3'} 
              />
              <text textAnchor="middle" y="5" fontSize="16" fontWeight="800" fill="#1f2937">h₁</text>
              <text textAnchor="middle" y="-38" fontSize="12" fontWeight="800" fill="#6366f1">
                Sigmoid
              </text>
              <text textAnchor="middle" y="46" fontSize="13" fontFamily="monospace" fontWeight="700" fill="#4f46e5">
                {step >= 1 ? `h₁ = ${h1.toFixed(3)}` : 'h₁ = ?'}
              </text>
            </g>

            {/* 노드 3: yHat (예측값 노드) */}
            <g transform="translate(420, 100)">
              <circle 
                r="30" 
                fill={activeTerm.highlight === 'yHat' ? '#e0f2fe' : '#ffffff'} 
                stroke={activeTerm.highlight === 'yHat' ? '#0284c7' : step === 3 ? '#ea580c' : '#4f46e5'} 
                strokeWidth={activeTerm.highlight === 'yHat' ? '4' : '3'} 
              />
              <text textAnchor="middle" y="5" fontSize="16" fontWeight="800" fill="#1f2937">ŷ</text>
              <text textAnchor="middle" y="-38" fontSize="12" fontWeight="800" fill="#0284c7">
                예측값
              </text>
              <text textAnchor="middle" y="46" fontSize="13" fontFamily="monospace" fontWeight="700" fill="#0284c7">
                {step >= 1 ? `ŷ = ${yHat.toFixed(3)}` : 'ŷ = ?'}
              </text>
            </g>

            {/* 노드 4: Loss 노드 */}
            <g transform="translate(540, 100)">
              <rect 
                x="-28" y="-22" width="56" height="44" rx="8" 
                fill={activeTerm.highlight === 'loss' ? '#fee2e2' : '#fef2f2'} 
                stroke={activeTerm.highlight === 'loss' ? '#b91c1c' : '#ef4444'} 
                strokeWidth={activeTerm.highlight === 'loss' ? '3.5' : '2.5'} 
              />
              <text textAnchor="middle" y="4" fontSize="13" fontWeight="800" fill="#991b1b">Loss</text>
              <text textAnchor="middle" y="44" fontSize="13" fontFamily="monospace" fontWeight="bold" fill="#dc2626">
                {step >= 2 ? `L = ${loss.toFixed(4)}` : 'L = ?'}
              </text>
              <text textAnchor="middle" y="-30" fontSize="12" fontWeight="bold" fill="#991b1b">
                y = {target.toFixed(2)}
              </text>
            </g>
          </svg>
        </div>

        <div style={{ marginTop: '12px', fontSize: '15px', fontWeight: '700', color: '#334155', textAlign: 'center' }}>
          {step === 1 && <span>1. 순전파 (Forward Pass): Sigmoid 활성화 연산을 거쳐 ŷ = {yHat.toFixed(3)} 도출</span>}
          {step === 2 && <span>2. 오차 산출 (Loss): 정답 y = {target.toFixed(2)}와 오차 손실 L = {loss.toFixed(4)} 측정</span>}
          {step === 3 && <span>3. 역전파 (Backward Pass): 연쇄 법칙으로 오차 신호(Gradient)를 뒤에서 앞으로 전달</span>}
          {step === 4 && <span>4. 가중치 갱신 (Weight Update): 경사하강법으로 W₁, b₁, W₂, b₂ 파라미터 업데이트</span>}
        </div>
      </div>

      {/* 5. ⭐ 대화형 Chain Rule 수식 버튼 & 인터랙티브 탐색기 (NEW) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid #cbd5e1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
            How Chain Rule Works
          </span>
        </div>

        {/* W1 체인 룰 분수 수식 버튼 바 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#ffffff', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '13px', fontWeight: '800', color: '#4f46e5' }}>
            [ W₁ 기울기 연쇄 법칙 수식 ] &nbsp; ∂L / ∂W₁ =
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontFamily: 'monospace' }}>
            {[
              { key: 'dL_dyHat', sub: '출력 오차' },
              { key: 'dyHat_dz2', sub: '출력 활성화' },
              { key: 'dz2_dh1', sub: '상위 가중치' },
              { key: 'dh1_dz1', sub: '은닉 활성화' },
              { key: 'dz1_dw1', sub: '입력 신호' }
            ].map((item, idx) => {
              const info = chainRuleTerms[item.key];
              const isSelected = activeTermKey === item.key;
              return (
                <React.Fragment key={item.key}>
                  {idx > 0 && <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>×</span>}
                  <button
                    onClick={() => setActiveTermKey(item.key)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                      backgroundColor: isSelected ? '#eeef4420' : '#f8fafc',
                      color: isSelected ? '#3730a3' : '#334155',
                      fontWeight: '800',
                      fontSize: '13px',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 2px 6px rgba(79, 70, 229, 0.2)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{info.symbol}</span>
                    <span style={{ fontSize: '10px', fontWeight: '600', color: isSelected ? '#4338ca' : '#64748b', marginTop: '2px' }}>
                      {item.sub}
                    </span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* 선택된 항 상세 설명 팝업 카드 */}
        <div style={{ padding: '14px 16px', backgroundColor: '#eef2ff', borderRadius: '10px', border: '1px solid #c7d2fe', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: '800', color: '#3730a3' }}>
              🔍 {activeTerm.title} ({activeTerm.symbol})
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: '800', color: '#4338ca', backgroundColor: '#ffffff', padding: '2px 8px', borderRadius: '6px', border: '1px solid #c7d2fe' }}>
              = {activeTerm.value.toFixed(4)}
            </span>
          </div>
          <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: '700', color: '#1e1b4b' }}>
            계산식: {activeTerm.calcFormula}
          </span>
          <span style={{ fontSize: '13px', color: '#312e81', lineHeight: '1.45', marginTop: '2px' }}>
            {activeTerm.description}
          </span>
        </div>
      </div>

      {/* 6. 역전파 오차 전달 파이프라인 (기존 카딩 유지) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <span style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
          역전파 기울기 최종 계산 요약
        </span>

        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px'
          }}
        >
          {/* Step 1 */}
          <div 
            style={{
              padding: '14px',
              borderRadius: '10px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>1. 출력층 기울기 (δ₂)</span>
            <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#64748b' }}>(ŷ - y) × Sigmoid'(z₂)</span>
            <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '14px', color: '#0f172a', marginTop: '6px' }}>
              δ₂ = {delta2.toFixed(4)}
            </span>
          </div>

          {/* Step 2 */}
          <div 
            style={{
              padding: '14px',
              borderRadius: '10px',
              backgroundColor: '#fff7ed',
              border: '1px solid #ffedd5',
              boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#ea580c', marginBottom: '4px' }}>2. W₂ 기울기 (∇W₂)</span>
            <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#c2410c' }}>δ₂ × h₁</span>
            <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '14px', color: '#9a3412', marginTop: '6px' }}>
              ∇W₂ = {dL_dw2.toFixed(4)}
            </span>
          </div>

          {/* Step 3 */}
          <div 
            style={{
              padding: '14px',
              borderRadius: '10px',
              backgroundColor: '#faf5ff',
              border: '1px solid #f3e8ff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#9333ea', marginBottom: '4px' }}>3. W₁ 기울기 (∇W₁)</span>
            <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#7e22ce' }}>(δ₂ × W₂) × Sigmoid'(z₁) × x</span>
            <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '14px', color: '#6b21a8', marginTop: '6px' }}>
              ∇W₁ = {dL_dw1.toFixed(4)}
            </span>
          </div>
        </div>
      </div>

      {/* 7. 1회 학습 가중치 변화 4열 미니 카드 (붉은색 -> 초록색 화살표 표현) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <span style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
          1회 학습 파라미터 변화
        </span>

        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px'
          }}
        >
          <div style={{ padding: '12px 10px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#4f46e5', display: 'block', marginBottom: '4px' }}>W₁</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: 'monospace', fontSize: '13px', fontWeight: '700' }}>
              <span style={{ color: '#ef4444', fontWeight: '700' }}>{w1.toFixed(3)}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#e0e7ff', flexShrink: 0 }}><ArrowRightIcon /></span>
              <span style={{ color: '#16a34a', fontWeight: '800' }}>{w1_next.toFixed(3)}</span>
            </div>
          </div>

          <div style={{ padding: '12px 10px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#4f46e5', display: 'block', marginBottom: '4px' }}>b₁</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: 'monospace', fontSize: '13px', fontWeight: '700' }}>
              <span style={{ color: '#ef4444', fontWeight: '700' }}>{b1.toFixed(3)}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#e0e7ff', flexShrink: 0 }}><ArrowRightIcon /></span>
              <span style={{ color: '#16a34a', fontWeight: '800' }}>{b1_next.toFixed(3)}</span>
            </div>
          </div>

          <div style={{ padding: '12px 10px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#4f46e5', display: 'block', marginBottom: '4px' }}>W₂</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: 'monospace', fontSize: '13px', fontWeight: '700' }}>
              <span style={{ color: '#ef4444', fontWeight: '700' }}>{w2.toFixed(3)}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#e0e7ff', flexShrink: 0 }}><ArrowRightIcon /></span>
              <span style={{ color: '#16a34a', fontWeight: '800' }}>{w2_next.toFixed(3)}</span>
            </div>
          </div>

          <div style={{ padding: '12px 10px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#4f46e5', display: 'block', marginBottom: '4px' }}>b₂</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: 'monospace', fontSize: '13px', fontWeight: '700' }}>
              <span style={{ color: '#ef4444', fontWeight: '700' }}>{b2.toFixed(3)}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#e0e7ff', flexShrink: 0 }}><ArrowRightIcon /></span>
              <span style={{ color: '#16a34a', fontWeight: '800' }}>{b2_next.toFixed(3)}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default BackpropSimulator;
