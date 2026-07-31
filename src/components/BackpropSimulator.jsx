import React, { useState } from 'react';

// SwiGLU (SiLU / Swish) 활성화 함수 및 미분 정의
const sigmoid = (z) => 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, z))));
const swigluFn = (z) => z * sigmoid(z);
const swigluDf = (z) => {
  const s = sigmoid(z);
  return s + z * s * (1 - s);
};

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

  // --- 1. Forward Pass 연산 ---
  const z1 = w1 * x + b1;
  const h1 = swigluFn(z1);
  const z2 = w2 * h1 + b2;
  const yHat = swigluFn(z2);
  const loss = 0.5 * Math.pow(yHat - target, 2);

  // --- 2. Backward Pass (Chain Rule) 연산 ---
  const dL_dyHat = yHat - target;
  const dyHat_dz2 = swigluDf(z2);
  const delta2 = dL_dyHat * dyHat_dz2;

  const dL_dw2 = delta2 * h1;
  const dL_db2 = delta2;

  const dL_dh1 = delta2 * w2;
  const dh1_dz1 = swigluDf(z1);
  const delta1 = dL_dh1 * dh1_dz1;

  const dL_dw1 = delta1 * x;
  const dL_db1 = delta1;

  // --- 3. 갱신 후 파라미터 ---
  const w1_next = w1 - lr * dL_dw1;
  const b1_next = b1 - lr * dL_db1;
  const w2_next = w2 - lr * dL_dw2;
  const b2_next = b2 - lr * dL_db2;

  // 무작위 난수 생성
  const handleRandomize = () => {
    const randomVal = (min, max) => Number((Math.random() * (max - min) + min).toFixed(2));
    setX(randomVal(0.3, 0.9));
    setTarget(randomVal(0.6, 1.0));
    setW1(randomVal(-0.8, 0.8));
    setB1(randomVal(-0.2, 0.2));
    setW2(randomVal(-0.8, 0.8));
    setB2(randomVal(-0.2, 0.2));
    setStep(1);
  };

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
      {/* 1. 상단 타이틀 & 헤더 (중앙 정렬) */}

      {/* 2. 인터랙티브 제어 버튼 그룹 (인라인 스타일로 Starlight 전역 CSS 완벽 오버라이드) */}
      <div style={{ display: 'flex', justifySelf: 'center', justifyContent: 'center', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={handleRandomize}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: '700',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#f8fafc',
            color: '#334155',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.15s ease'
          }}
        >
          <span>무작위 파라미터</span>
        </button>

        <button
          onClick={handleRunFullStep}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 20px',
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

        <button
          onClick={handleReset}
          style={{
            padding: '8px 14px',
            fontSize: '13px',
            fontWeight: '600',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            color: '#64748b',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          초기화
        </button>
      </div>

      {/* 3. 컨트롤 슬라이더 대형 컨테이너 카드 */}
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
            type="range" min="0.1" max="1.0" step="0.05" value={x}
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
            type="range" min="0.1" max="1.0" step="0.05" value={target}
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
            type="range" min="0.1" max="1.5" step="0.1" value={lr}
            onChange={(e) => setLr(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* 4. 4단계 Step 네비게이션 탭 (PESimulator 뷰 스위처 템플릿 양식 적용) */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: '6px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px', flexWrap: 'wrap' }}>
          {[
            { id: 1, label: '1. 순전파 (Forward)' },
            { id: 2, label: '2. 오차 산출 (Loss)' },
            { id: 3, label: '3. 역전파 (Backward)' },
            { id: 4, label: '4. 가중치 갱신' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStep(tab.id)}
              style={{
                padding: '7px 14px',
                fontSize: '13px',
                fontWeight: '700',
                borderRadius: '7px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: step === tab.id ? '#ffffff' : 'transparent',
                color: step === tab.id ? '#0f172a' : '#64748b',
                boxShadow: step === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. 메인 신경망 SVG 시각화 카드 */}
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: '#f8fafc',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}
      >
        <div style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
          <svg viewBox="0 0 600 170" style={{ width: '100%', maxWidth: '600px', height: 'auto', minWidth: '300px' }}>
            <defs>
              <marker id="arrow-blue" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
              </marker>
              <marker id="arrow-orange" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#ea580c" />
              </marker>
            </defs>

            {/* 연결선 W1 */}
            <line
              x1="80" y1="85" x2="250" y2="85"
              stroke={step === 3 ? '#ea580c' : step >= 1 ? '#4f46e5' : '#cbd5e1'}
              strokeWidth={step === 3 ? "3.5" : "2.5"}
              markerEnd={step === 3 ? undefined : "url(#arrow-blue)"}
              markerStart={step === 3 ? "url(#arrow-orange)" : undefined}
            />
            <g transform="translate(165, 68)">
              <rect x="-38" y="-11" width="76" height="18" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
              <text textAnchor="middle" y="2" fontSize="11" fontFamily="monospace" fontWeight="bold" fill="#374151">
                W₁ = {w1.toFixed(2)}
              </text>
            </g>

            {/* 연결선 W2 */}
            <line
              x1="250" y1="85" x2="420" y2="85"
              stroke={step === 3 ? '#ea580c' : step >= 1 ? '#4f46e5' : '#cbd5e1'}
              strokeWidth={step === 3 ? "3.5" : "2.5"}
              markerEnd={step === 3 ? undefined : "url(#arrow-blue)"}
              markerStart={step === 3 ? "url(#arrow-orange)" : undefined}
            />
            <g transform="translate(335, 68)">
              <rect x="-38" y="-11" width="76" height="18" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
              <text textAnchor="middle" y="2" fontSize="11" fontFamily="monospace" fontWeight="bold" fill="#374151">
                W₂ = {w2.toFixed(2)}
              </text>
            </g>

            {/* 연결선 Loss */}
            <line
              x1="420" y1="85" x2="540" y2="85"
              stroke={step >= 2 ? '#ef4444' : '#cbd5e1'}
              strokeWidth="2" strokeDasharray="3 3"
            />

            {/* 노드 1: x */}
            <g transform="translate(80, 85)">
              <circle r="22" fill="#ffffff" stroke="#4f46e5" strokeWidth="2.5" />
              <text textAnchor="middle" y="4" fontSize="13" fontWeight="bold" fill="#3730a3">x</text>
              <text textAnchor="middle" y="38" fontSize="11" fontFamily="monospace" fontWeight="600" fill="#4f46e5">
                입력: {x.toFixed(2)}
              </text>
            </g>

            {/* 노드 2: h1 */}
            <g transform="translate(250, 85)">
              <circle r="24" fill="#ffffff" stroke={step === 3 ? '#ea580c' : '#4f46e5'} strokeWidth="2.5" />
              <text textAnchor="middle" y="4" fontSize="13" fontWeight="bold" fill="#1f2937">h₁</text>
              <text textAnchor="middle" y="-32" fontSize="10" fontWeight="bold" fill="#6366f1">
                SwiGLU
              </text>
              <text textAnchor="middle" y="40" fontSize="11" fontFamily="monospace" fontWeight="600" fill="#4f46e5">
                {step >= 1 ? `h₁ = ${h1.toFixed(3)}` : 'h₁ = ?'}
              </text>
            </g>

            {/* 노드 3: yHat */}
            <g transform="translate(420, 85)">
              <circle r="24" fill="#ffffff" stroke={step === 3 ? '#ea580c' : '#4f46e5'} strokeWidth="2.5" />
              <text textAnchor="middle" y="4" fontSize="13" fontWeight="bold" fill="#1f2937">ŷ</text>
              <text textAnchor="middle" y="-32" fontSize="10" fontWeight="bold" fill="#0284c7">
                예측값
              </text>
              <text textAnchor="middle" y="40" fontSize="11" fontFamily="monospace" fontWeight="600" fill="#0284c7">
                {step >= 1 ? `ŷ = ${yHat.toFixed(3)}` : 'ŷ = ?'}
              </text>
            </g>

            {/* 노드 4: Loss */}
            <g transform="translate(540, 85)">
              <rect x="-22" y="-18" width="44" height="36" rx="6" fill="#fef2f2" stroke="#ef4444" strokeWidth="2" />
              <text textAnchor="middle" y="4" fontSize="11" fontWeight="bold" fill="#991b1b">Loss</text>
              <text textAnchor="middle" y="38" fontSize="11" fontFamily="monospace" fontWeight="bold" fill="#dc2626">
                {step >= 2 ? `L = ${loss.toFixed(4)}` : 'L = ?'}
              </text>
              <text textAnchor="middle" y="-26" fontSize="10" fill="#991b1b">
                y = {target.toFixed(2)}
              </text>
            </g>
          </svg>
        </div>

        <div style={{ marginTop: '10px', fontSize: '14px', fontWeight: '600', color: '#475569', textAlign: 'center' }}>
          {step === 1 && <span>1. 순전파 (Forward Pass): SwiGLU 활성화 연산을 거쳐 ŷ = {yHat.toFixed(3)} 도출</span>}
          {step === 2 && <span>2. 오차 산출 (Loss): 정답 y = {target.toFixed(2)}와 오차 손실 L = {loss.toFixed(4)} 측정</span>}
          {step === 3 && <span>3. 역전파 (Backward Pass): 연쇄 법칙으로 오차 신호(Gradient)를 뒤에서 앞으로 전달</span>}
          {step === 4 && <span>4. 가중치 갱신 (Weight Update): 경사하강법으로 W₁, b₁, W₂, b₂ 파라미터 업데이트</span>}
        </div>
      </div>

      {/* 6. 하단 1: 역전파 오차 전달 파이프라인 카딩 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
          역전파 기울기 계산
        </span>

        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '12px'
          }}
        >
          {/* Step 1 */}
          <div 
            style={{
              padding: '12px',
              borderRadius: '10px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#ef4444', marginBottom: '4px' }}>1. 출력층 기울기 (δ₂)</span>
            <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#64748b' }}>(ŷ - y) × SwiGLU'(z₂)</span>
            <span style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '13px', color: '#0f172a', marginTop: '6px' }}>
              δ₂ = {delta2.toFixed(4)}
            </span>
          </div>

          {/* Step 2 */}
          <div 
            style={{
              padding: '12px',
              borderRadius: '10px',
              backgroundColor: '#fff7ed',
              border: '1px solid #ffedd5',
              boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#ea580c', marginBottom: '4px' }}>2. W₂ 기울기 (∇W₂)</span>
            <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#c2410c' }}>δ₂ × h₁</span>
            <span style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '13px', color: '#9a3412', marginTop: '6px' }}>
              ∇W₂ = {dL_dw2.toFixed(4)}
            </span>
          </div>

          {/* Step 3 */}
          <div 
            style={{
              padding: '12px',
              borderRadius: '10px',
              backgroundColor: '#faf5ff',
              border: '1px solid #f3e8ff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#9333ea', marginBottom: '4px' }}>3. W₁ 기울기 (∇W₁)</span>
            <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#7e22ce' }}>(δ₂ × W₂) × SwiGLU'(z₁) × x</span>
            <span style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '13px', color: '#6b21a8', marginTop: '6px' }}>
              ∇W₁ = {dL_dw1.toFixed(4)}
            </span>
          </div>
        </div>
      </div>

      {/* 7. 하단 2: 1회 학습 가중치 변화 4열 카드 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
          📊 1회 학습 파라미터 변화 (Before ➔ After)
        </span>

        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
            gap: '10px'
          }}
        >
          <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#4f46e5', display: 'block', marginBottom: '2px' }}>W₁</span>
            <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#94a3b8', textDecoration: 'line-through' }}>{w1.toFixed(3)}</span>
            <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: '700', color: '#16a34a', display: 'block', marginTop: '2px' }}>{w1_next.toFixed(3)}</span>
          </div>

          <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#4f46e5', display: 'block', marginBottom: '2px' }}>b₁</span>
            <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#94a3b8', textDecoration: 'line-through' }}>{b1.toFixed(3)}</span>
            <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: '700', color: '#16a34a', display: 'block', marginTop: '2px' }}>{b1_next.toFixed(3)}</span>
          </div>

          <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#4f46e5', display: 'block', marginBottom: '2px' }}>W₂</span>
            <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#94a3b8', textDecoration: 'line-through' }}>{w2.toFixed(3)}</span>
            <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: '700', color: '#16a34a', display: 'block', marginTop: '2px' }}>{w2_next.toFixed(3)}</span>
          </div>

          <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#4f46e5', display: 'block', marginBottom: '2px' }}>b₂</span>
            <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#94a3b8', textDecoration: 'line-through' }}>{b2.toFixed(3)}</span>
            <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: '700', color: '#16a34a', display: 'block', marginTop: '2px' }}>{b2_next.toFixed(3)}</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default BackpropSimulator;
