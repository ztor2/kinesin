import React, { useState } from 'react';
import katex from 'katex';
import { motion, AnimatePresence } from 'framer-motion';

// Sigmoid 활성화 함수 및 국소 미분 정의
const sigmoid = (z) => 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, z))));
const sigmoidDf = (z) => {
  const s = sigmoid(z);
  return s * (1 - s);
};

// KaTeX 수학 수식 렌더링 헬퍼 컴포넌트
const MathView = ({ math, style }) => {
  const html = katex.renderToString(math, { throwOnError: false });
  return <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '1.08em', ...style }} dangerouslySetInnerHTML={{ __html: html }} />;
};

// SVG Arrow Right Icon Component
const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
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

  // 현재 Step (0: plain/기본, 1: 순전파, 2: 손실계산, 3: 역전파, 4: 가중치갱신)
  const [step, setStep] = useState(0);

  // 선택된 체인 룰 미분 항 Key
  const [activeTermKey, setActiveTermKey] = useState('dL_dyHat');

  // 학습 실행 여부 추적 (최소 1회 학습 실행 후에만 체인 룰 카드 상호작용 허용)
  const [hasLearned, setHasLearned] = useState(false);
  const [showLearnPrompt, setShowLearnPrompt] = useState(false);
  const [pendingTermKey, setPendingTermKey] = useState(null);

  // --- 1. Forward Pass 연산 ---
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

  // 체인 룰 개별 미분 항 정보 맵
  const chainRuleTerms = {
    dL_dyHat: {
      symbol: '\\frac{\\partial L}{\\partial \\hat{y}}',
      name: '출력 오차 민감도',
      calcFormulaMath: `\\hat{y} - y = ${yHat.toFixed(4)} - ${target.toFixed(2)}`,
      value: dL_dyHat,
      mathReasonNode: (
        <span>
          손실 함수 <MathView math="L = \frac{1}{2}(\hat{y} - y)^2" />를 <MathView math="\hat{y}" />에 대해 미분하면, 2차항 계수 <MathView math="\frac{1}{2}" />과 2가 상쇄되어 단순 오차 차이 <MathView math="(\hat{y} - y)" />로 도출됨.
        </span>
      ),
      descriptionNode: (
        <span>
          최종 예측값(<MathView math="\hat{y}" />)과 목표 정답(<MathView math="y" />) 간의 차이. 역전파 오차 신호의 출발점.
        </span>
      ),
      highlight: 'loss',
      themeColor: '#e11d48',
      bgColor: '#fff1f2',
      accentGlow: 'rgba(225, 29, 72, 0.25)'
    },
    dyHat_dz2: {
      symbol: '\\frac{\\partial \\hat{y}}{\\partial z_2}',
      name: '출력층 Sigmoid 기울기',
      calcFormulaMath: `\\sigma'(z_2) = ${dyHat_dz2.toFixed(4)}`,
      value: dyHat_dz2,
      mathReasonNode: (
        <span>
          출력 활성화 식 <MathView math="\hat{y} = \sigma(z_2)" />를 미분하면 <MathView math="\sigma(z_2)(1 - \sigma(z_2))" />가 됨. 입력 <MathView math="z_2" />에서의 기울기.
        </span>
      ),
      descriptionNode: (
        <span>
          출력 노드의 Sigmoid 비선형 변화율. 오차 신호가 출력 노드를 통과할 때 곱해지는 기울기 민감도.
        </span>
      ),
      highlight: 'yHat',
      themeColor: '#0284c7',
      bgColor: '#f0f9ff',
      accentGlow: 'rgba(2, 132, 199, 0.25)'
    },
    dz2_dw2: {
      symbol: '\\frac{\\partial z_2}{\\partial W_2}',
      name: 'W₂ 책임 입력값',
      calcFormulaMath: `h_1 = ${h1.toFixed(4)}`,
      value: h1,
      mathReasonNode: (
        <span>
          선형 결합 식 <MathView math="z_2 = W_2 h_1 + b_2" />를 <MathView math="W_2" />에 대해 편미분하면 은닉층 입력값 <MathView math="h_1" />이 남음 (<MathView math="\frac{\partial z_2}{\partial W_2} = h_1" />).
        </span>
      ),
      descriptionNode: (
        <span>
          순전파 시 은닉층 <MathView math="h_1" />의 활성화 값. 은닉층 활성화가 클수록 가중치 <MathView math="W_2" />의 수정 폭이 커짐.
        </span>
      ),
      highlight: 'w2',
      themeColor: '#d97706',
      bgColor: '#fffbeb',
      accentGlow: 'rgba(217, 119, 6, 0.25)'
    },
    dz2_dh1: {
      symbol: '\\frac{\\partial z_2}{\\partial h_1}',
      name: '상위 가중치 전파율',
      calcFormulaMath: `W_2 = ${w2.toFixed(4)}`,
      value: w2,
      mathReasonNode: (
        <span>
          선형 결합 식 <MathView math="z_2 = W_2 h_1 + b_2" />를 <MathView math="h_1" />에 대해 편미분하면 계수인 <MathView math="W_2" />가 남음 (<MathView math="\frac{\partial z_2}{\partial h_1} = W_2" />).
        </span>
      ),
      descriptionNode: (
        <span>
          하위 층으로 오차가 역전파될 때 곱해지는 상위 가중치 <MathView math="W_2" />. 연결 강도에 비례하여 오차가 전달됨.
        </span>
      ),
      highlight: 'w2',
      themeColor: '#d97706',
      bgColor: '#fffbeb',
      accentGlow: 'rgba(217, 119, 6, 0.25)'
    },
    dh1_dz1: {
      symbol: '\\frac{\\partial h_1}{\\partial z_1}',
      name: '은닉층 Sigmoid 기울기',
      calcFormulaMath: `\\sigma'(z_1) = ${dh1_dz1.toFixed(4)}`,
      value: dh1_dz1,
      mathReasonNode: (
        <span>
          은닉층 활성화 <MathView math="h_1 = \sigma(z_1)" />를 미분한 <MathView math="\sigma(z_1)(1 - \sigma(z_1))" />. 은닉층 국소 미분값.
        </span>
      ),
      descriptionNode: (
        <span>
          은닉층 활성화 함수(Sigmoid)의 기울기. 상위 오차 신호가 은닉층 노드를 통과하며 재감쇄되는 비율.
        </span>
      ),
      highlight: 'h1',
      themeColor: '#7c3aed',
      bgColor: '#f5f3ff',
      accentGlow: 'rgba(124, 58, 237, 0.25)'
    },
    dz1_dw1: {
      symbol: '\\frac{\\partial z_1}{\\partial W_1}',
      name: 'W₁ 책임 입력값',
      calcFormulaMath: `x = ${x.toFixed(2)}`,
      value: x,
      mathReasonNode: (
        <span>
          선형 결합 식 <MathView math="z_1 = W_1 x + b_1" />을 <MathView math="W_1" />에 대해 편미분하면 최초 입력값 <MathView math="x" />가 남음 (<MathView math="\frac{\partial z_1}{\partial W_1} = x" />).
        </span>
      ),
      descriptionNode: (
        <span>
          최초 입력 데이터(<MathView math="x" />). 입력 데이터 신호의 크기가 가중치 <MathView math="W_1" /> 갱신 스케일을 조정.
        </span>
      ),
      highlight: 'w1',
      themeColor: '#0891b2',
      bgColor: '#ecfeff',
      accentGlow: 'rgba(8, 145, 178, 0.25)'
    }
  };

  const activeTerm = chainRuleTerms[activeTermKey];

  // 하단 체인 룰 카드 버튼 전용: step === 0 (plain 상태)에서만 활성화
  // 체인 룰 카드를 클릭하면 자동으로 step 0으로 전환됨
  const diagramHL = step === 0 ? {
    w1Edge:   activeTermKey === 'dz1_dw1',
    z1:       activeTermKey === 'dh1_dz1' || activeTermKey === 'dz1_dw1',
    h1Node:   activeTermKey === 'dz2_dw2' || activeTermKey === 'dz2_dh1' || activeTermKey === 'dh1_dz1',
    w2Edge:   activeTermKey === 'dz2_dw2' || activeTermKey === 'dz2_dh1',
    z2:       activeTermKey === 'dyHat_dz2' || activeTermKey === 'dz2_dw2' || activeTermKey === 'dz2_dh1',
    yHatNode: activeTermKey === 'dyHat_dz2' || activeTermKey === 'dL_dyHat',
    lossNode: activeTermKey === 'dL_dyHat',
  } : {
    w1Edge: false, z1: false, h1Node: false,
    w2Edge: false, z2: false, yHatNode: false, lossNode: false,
  };

  const handleRunFullStep = () => {
    setW1(w1_next);
    setB1(b1_next);
    setW2(w2_next);
    setB2(b2_next);
    setStep(4);
    setHasLearned(true);
  };

  const handleReset = () => {
    setX(0.8);
    setTarget(1.0);
    setW1(0.6);
    setB1(0.1);
    setW2(1.1);
    setB2(-0.2);
    setLr(0.5);
    setStep(0);
    setHasLearned(false);
  };

  // 체인 룰 카드 클릭 핸들러: 학습 여부 확인 후 분기
  const handleTermClick = (key) => {
    if (hasLearned) {
      setActiveTermKey(key);
      setStep(0);
    } else {
      setPendingTermKey(key);
      setShowLearnPrompt(true);
    }
  };

  // 모달: 확인 → 1회 학습 자동 실행 후 카드 활성화
  const handleLearnConfirm = () => {
    setW1(w1_next);
    setB1(b1_next);
    setW2(w2_next);
    setB2(b2_next);
    setHasLearned(true);
    setShowLearnPrompt(false);
    if (pendingTermKey) {
      setActiveTermKey(pendingTermKey);
      setPendingTermKey(null);
    }
    setStep(0);
  };

  // 모달: 취소
  const handleLearnCancel = () => {
    setShowLearnPrompt(false);
    setPendingTermKey(null);
  };

  const stepsList = [
    { id: 1, label: '1. 순전파', activeBg: 'linear-gradient(135deg, #0284c7, #0369a1)', shadow: 'rgba(2, 132, 199, 0.3)' },
    { id: 2, label: '2. 오차 산출', activeBg: 'linear-gradient(135deg, #e11d48, #be123c)', shadow: 'rgba(225, 29, 72, 0.3)' },
    { id: 3, label: '3. 역전파', activeBg: 'linear-gradient(135deg, #d97706, #b45309)', shadow: 'rgba(217, 119, 6, 0.3)' },
    { id: 4, label: '4. 가중치 갱신', activeBg: 'linear-gradient(135deg, #059669, #047857)', shadow: 'rgba(5, 150, 105, 0.3)' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="not-content"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        width: '100%',
        clear: 'both',
        boxSizing: 'border-box',
        margin: '24px 0',
        padding: '28px',
        borderRadius: '24px',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.07), 0 0 1px 1px rgba(15, 23, 42, 0.02)',
        fontFamily: '"Plus Jakarta Sans", "Noto Sans KR", -apple-system, BlinkMacSystemFont, sans-serif'
      }}
    >
      {/* 폰트 및 커스텀 스타일 유틸리티 */}
      <style>{`
        .gmarket-font {
          font-family: 'GmarketSans', 'Plus Jakarta Sans', 'Noto Sans KR', sans-serif !important;
        }

        .num-font {
          font-family: 'JetBrains Mono', monospace !important;
          font-feature-settings: "tnum";
          font-variant-numeric: tabular-nums;
        }
      `}</style>
      {/* 1. 상단 타이틀 & 컨트롤 헤더 (2줄 구조) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
        {/* Row 1: 독립된 메인 타이틀 영역 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '6px', height: '22px', borderRadius: '5px', background: 'linear-gradient(180deg, #093348, #113c2e)' }} />
          <h3 className="gmarket-font" style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.02em' }}>
            Backpropagation Simulator
          </h3>
        </div>

        {/* Row 2: 우측 정렬된 액션 버튼 그룹 */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowSettings(!showSettings)}
            className="gmarket-font"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              fontSize: '12.5px',
              fontWeight: '700',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              backgroundColor: showSettings ? '#e2e8f0' : '#f8fafc',
              color: '#334155',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <span>파라미터 조정</span>
            <motion.span 
              animate={{ rotate: showSettings ? 180 : 0 }} 
              transition={{ duration: 0.2 }}
              style={{ fontSize: '10px', color: '#64748b', display: 'inline-block' }}
            >
              ▼
            </motion.span>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleReset}
            className="gmarket-font"
            style={{
              padding: '8px 14px',
              fontSize: '12.5px',
              fontWeight: '700',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            초기화
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleRunFullStep}
            className="gmarket-font"
            style={{
              padding: '8px 18px',
              fontSize: '12.5px',
              fontWeight: '700',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #059669, #047857)',
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)'
            }}
          >
            ⚡ 1회 학습 실행
          </motion.button>
        </div>
      </div>

      {/* 접이식 슬라이더 옵션 드로어 */}
        <AnimatePresence>
          {showSettings && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '16px',
                  backgroundColor: '#f8fafc',
                  padding: '18px 20px',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  marginTop: '8px'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>
                    <span>입력 (<MathView math="x" style={{ fontSize: '13px' }} />)</span>
                    <span style={{ fontFamily: 'monospace', color: '#0284c7', fontWeight: '800' }}>{x.toFixed(2)}</span>
                  </div>
                  <input type="range" min="0.1" max="1.0" step="0.05" value={x} onChange={(e) => { setX(Number(e.target.value)); setStep(0); }} style={{ width: '100%', cursor: 'pointer', accentColor: '#0284c7' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>
                    <span>정답 (<MathView math="y" style={{ fontSize: '13px' }} />)</span>
                    <span style={{ fontFamily: 'monospace', color: '#e11d48', fontWeight: '800' }}>{target.toFixed(2)}</span>
                  </div>
                  <input type="range" min="0.1" max="1.0" step="0.05" value={target} onChange={(e) => { setTarget(Number(e.target.value)); setStep(0); }} style={{ width: '100%', cursor: 'pointer', accentColor: '#e11d48' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>
                    <span>편향 (<MathView math="b_1" style={{ fontSize: '13px' }} />)</span>
                    <span style={{ fontFamily: 'monospace', color: '#475569', fontWeight: '800' }}>{b1.toFixed(2)}</span>
                  </div>
                  <input type="range" min="-1.0" max="1.0" step="0.05" value={b1} onChange={(e) => { setB1(Number(e.target.value)); setStep(0); }} style={{ width: '100%', cursor: 'pointer' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>
                    <span>편향 (<MathView math="b_2" style={{ fontSize: '13px' }} />)</span>
                    <span className="num-font" style={{ color: '#475569', fontWeight: '800' }}>{b2.toFixed(2)}</span>
                  </div>
                  <input type="range" min="-1.0" max="1.0" step="0.05" value={b2} onChange={(e) => { setB2(Number(e.target.value)); setStep(0); }} style={{ width: '100%', cursor: 'pointer' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>
                    <span>학습률 (<MathView math="\eta" style={{ fontSize: '13px' }} />)</span>
                    <span className="num-font" style={{ color: '#059669', fontWeight: '800' }}>{lr.toFixed(1)}</span>
                  </div>
                  <input type="range" min="0.1" max="1.5" step="0.1" value={lr} onChange={(e) => setLr(Number(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: '#059669' }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* 2. Step 탭 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '8px', backgroundColor: '#f1f5f9', padding: '6px', borderRadius: '16px', flexWrap: 'nowrap', whiteSpace: 'nowrap', minWidth: 'max-content' }}>
          {stepsList.map((t) => {
            const isActive = step === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setStep(t.id)}
                className="gmarket-font"
                style={{
                  position: 'relative',
                  padding: '9px 20px',
                  fontSize: '13px',
                  fontWeight: '700',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  background: 'transparent',
                  color: isActive ? '#ffffff' : '#475569',
                  zIndex: 1,
                  whiteSpace: 'nowrap',
                  transition: 'color 0.2s ease'
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeStepPill"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '12px',
                      background: t.activeBg,
                      boxShadow: `0 4px 14px ${t.shadow}`,
                      zIndex: -1
                    }}
                  />
                )}
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. 정교한 SVG 다이어그램 (박스 제거 텍스트 하이라이팅 & Y축 원복) */}
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          backgroundColor: '#f8fafc', 
          padding: '24px 16px', 
          borderRadius: '20px', 
          border: '1px solid #cbd5e1', 
          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.02)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'flex-start', WebkitOverflowScrolling: 'touch' }}>
          <svg viewBox="0 0 760 250" style={{ width: '100%', maxWidth: '760px', height: 'auto', minWidth: '580px', flexShrink: 0 }}>
            <defs>
              {/* 은은한 배경 도트 패턴 & 메시 라인 */}
              <pattern id="grid-dots" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="3" cy="3" r="1.2" fill="#94a3b8" opacity="0.3" />
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#e2e8f0" strokeWidth="0.5" opacity="0.5" />
              </pattern>

              {/* 활성화 함수 Sigmoid 미니 곡선 실루엣 */}
              <path id="sigmoid-curve" d="M -24 16 C -8 16, -8 -16, 24 -16" fill="none" stroke="#94a3b8" strokeWidth="2" opacity="0.25" strokeLinecap="round" />

              {/* 깔끔한 화살표 마커 */}
              <marker id="arrow-blue" viewBox="0 0 10 10" refX="44" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#0284c7" />
              </marker>
              <marker id="arrow-orange" viewBox="0 0 10 10" refX="44" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#d97706" />
              </marker>
              <marker id="arrow-cyan" viewBox="0 0 10 10" refX="44" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#0891b2" />
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
              `}</style>
            </defs>

            {/* 배경 패턴 */}
            <rect width="760" height="250" fill="url(#grid-dots)" />

            {/* --- W1 연결선 (입력x -> h1) --- */}
            <line 
              x1="90" y1="120" x2="300" y2="120" 
              stroke={step === 3 ? '#d97706' : step === 1 ? '#0284c7' : diagramHL.w1Edge ? '#0891b2' : '#cbd5e1'} 
              strokeWidth={step === 1 || step === 3 || diagramHL.w1Edge ? '4.5' : '2'}
              strokeDasharray={step === 1 || step === 3 ? '8 6' : 'none'}
              style={{ animation: step === 1 ? 'forwardDashFlow 0.75s linear infinite' : step === 3 ? 'backwardDashFlow 0.75s linear infinite' : 'none' }}
              markerEnd={step === 3 ? undefined : diagramHL.w1Edge ? 'url(#arrow-cyan)' : 'url(#arrow-blue)'}
              markerStart={step === 3 ? 'url(#arrow-orange)' : undefined}
            />

            {/* W1 텍스트 (195, 75) - iOS Safari 100% 픽셀 정렬 보장 KaTeX 폰트 SVG text */}
            <g>
              {step === 4 || step === 3 || diagramHL.w1Edge ? (
                <rect 
                  x="150" y="63" width="90" height="24" rx="12" 
                  fill={step === 4 ? '#d1fae5' : step === 3 ? '#fef3c7' : '#e0f2fe'} 
                />
              ) : null}
              <text 
                x="195" y="75" 
                textAnchor="middle" 
                dominantBaseline="central"
                style={{
                  fontFamily: 'KaTeX_Math, KaTeX_Main, "Times New Roman", serif',
                  fontSize: '14px',
                  fontStyle: 'italic',
                  fontWeight: step === 4 || step === 3 || diagramHL.w1Edge ? 'bold' : 'normal',
                  fill: step === 4 ? '#047857' : step === 3 ? '#b45309' : diagramHL.w1Edge ? '#0284c7' : '#334155'
                }}
              >
                W₁ = {w1.toFixed(2)}
              </text>
            </g>

            {/* z1 텍스트 (195, 165) */}
            <g>
              {step === 1 || diagramHL.z1 ? (
                <rect 
                  x="150" y="153" width="90" height="24" rx="12" 
                  fill="#e0f2fe" 
                />
              ) : null}
              <text 
                x="195" y="165" 
                textAnchor="middle" 
                dominantBaseline="central"
                style={{
                  fontFamily: 'KaTeX_Math, KaTeX_Main, "Times New Roman", serif',
                  fontSize: '14px',
                  fontStyle: 'italic',
                  fontWeight: step === 1 || diagramHL.z1 ? 'bold' : 'normal',
                  fill: step === 1 ? '#0369a1' : diagramHL.z1 ? '#0369a1' : '#64748b'
                }}
              >
                z₁ = {z1.toFixed(3)}
              </text>
            </g>

            {/* --- W2 연결선 (h1 -> yHat) --- */}
            <line 
              x1="300" y1="120" x2="510" y2="120" 
              stroke={step === 3 ? '#d97706' : step === 1 ? '#0284c7' : diagramHL.w2Edge ? '#d97706' : '#cbd5e1'} 
              strokeWidth={step === 1 || step === 3 || diagramHL.w2Edge ? '4.5' : '2'}
              strokeDasharray={step === 1 || step === 3 ? '8 6' : 'none'}
              style={{ animation: step === 1 ? 'forwardDashFlow 0.75s linear infinite' : step === 3 ? 'backwardDashFlow 0.75s linear infinite' : 'none' }}
              markerEnd={step === 3 ? undefined : diagramHL.w2Edge ? 'url(#arrow-orange)' : 'url(#arrow-blue)'}
              markerStart={step === 3 ? 'url(#arrow-orange)' : undefined}
            />

            {/* W2 텍스트 (405, 75) */}
            <g>
              {step === 4 || step === 3 || diagramHL.w2Edge ? (
                <rect 
                  x="360" y="63" width="90" height="24" rx="12" 
                  fill={step === 4 ? '#d1fae5' : '#fef3c7'} 
                />
              ) : null}
              <text 
                x="405" y="75" 
                textAnchor="middle" 
                dominantBaseline="central"
                style={{
                  fontFamily: 'KaTeX_Math, KaTeX_Main, "Times New Roman", serif',
                  fontSize: '14px',
                  fontStyle: 'italic',
                  fontWeight: step === 4 || step === 3 || diagramHL.w2Edge ? 'bold' : 'normal',
                  fill: step === 4 ? '#047857' : step === 3 ? '#b45309' : diagramHL.w2Edge ? '#b45309' : '#334155'
                }}
              >
                W₂ = {w2.toFixed(2)}
              </text>
            </g>

            {/* z2 텍스트 (405, 165) */}
            <g>
              {step === 1 || diagramHL.z2 ? (
                <rect 
                  x="360" y="153" width="90" height="24" rx="12" 
                  fill="#e0f2fe" 
                />
              ) : null}
              <text 
                x="405" y="165" 
                textAnchor="middle" 
                dominantBaseline="central"
                style={{
                  fontFamily: 'KaTeX_Math, KaTeX_Main, "Times New Roman", serif',
                  fontSize: '14px',
                  fontStyle: 'italic',
                  fontWeight: step === 1 || diagramHL.z2 ? 'bold' : 'normal',
                  fill: step === 1 ? '#0369a1' : diagramHL.z2 ? '#0369a1' : '#64748b'
                }}
              >
                z₂ = {z2.toFixed(3)}
              </text>
            </g>

            {/* --- Loss 연결선 (yHat -> Loss) --- */}
            <line 
              x1="510" y1="120" x2="670" y2="120" 
              stroke={step === 2 ? '#e11d48' : '#cbd5e1'} 
              strokeWidth={step === 2 ? '4' : '2'} 
              strokeDasharray={step === 2 ? '6 4' : '5 5'}
              style={{ animation: step === 2 ? 'lossDashFlow 0.6s linear infinite' : 'none' }}
            />

            {/* === 노드 1: x (90, 120) === */}
            <g>
              <circle cx="90" cy="120" r="46" fill="none" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
              <circle cx="90" cy="120" r="40" fill="#ffffff" stroke="#0284c7" strokeWidth="3.5" filter="drop-shadow(0 4px 10px rgba(2, 132, 199, 0.18))" />
              
              {/* KaTeX 수학 폰트 노드 라벨 */}
              <text 
                x="90" y="120" 
                textAnchor="middle" 
                dominantBaseline="central"
                style={{ fontFamily: 'KaTeX_Math, KaTeX_Main, "Times New Roman", serif', fontSize: '23px', fontStyle: 'italic', fontWeight: 'bold', fill: '#0369a1' }}
              >
                x
              </text>
              
              {/* 노드 상단 라벨 */}
              <text className="gmarket-font" textAnchor="middle" x="90" y="60" fontSize="14" fontWeight="700" fill="#475569">입력층</text>

              {/* 하단 KaTeX 수학 폰트 수치 표식 */}
              <text 
                x="90" y="188" 
                textAnchor="middle" 
                dominantBaseline="central"
                style={{ fontFamily: 'KaTeX_Math, KaTeX_Main, "JetBrains Mono", monospace', fontSize: '13.5px', fill: '#0284c7', fontWeight: 'bold' }}
              >
                = {x.toFixed(2)}
              </text>
            </g>

            {/* === 노드 2: h1 (300, 120) === */}
            <g>
              <circle 
                cx="300" cy="120" r="46" 
                fill="none" 
                stroke={step === 1 ? '#0284c7' : diagramHL.h1Node ? '#7c3aed' : '#cbd5e1'} 
                strokeWidth="1.5" 
                strokeDasharray="4 3" 
                opacity="0.6" 
              />
              <circle 
                cx="300" cy="120" r="40" 
                fill={step === 1 ? '#e0f2fe' : diagramHL.h1Node ? '#f5f3ff' : '#ffffff'} 
                stroke={step === 1 ? '#0284c7' : diagramHL.h1Node ? '#7c3aed' : step === 3 ? '#d97706' : '#cbd5e1'} 
                strokeWidth={step === 1 || diagramHL.h1Node ? '4' : '3'} 
                filter="drop-shadow(0 4px 10px rgba(0, 0, 0, 0.08))"
              />

              <use href="#sigmoid-curve" x="300" y="120" />

              {/* KaTeX 수학 폰트 노드 라벨 */}
              <text 
                x="300" y="120" 
                textAnchor="middle" 
                dominantBaseline="central"
                style={{ fontFamily: 'KaTeX_Math, KaTeX_Main, "Times New Roman", serif', fontSize: '22px', fontStyle: 'italic', fontWeight: 'bold', fill: '#1e293b' }}
              >
                h₁
              </text>

              {/* 노드 상단 라벨 */}
              <text className="gmarket-font" textAnchor="middle" x="300" y="60" fontSize="14" fontWeight="700" fill="#0284c7">은닉층</text>

              {/* 하단 KaTeX 수학 폰트 수치 표식 */}
              <text 
                x="300" y="188" 
                textAnchor="middle" 
                dominantBaseline="central"
                style={{ fontFamily: 'KaTeX_Math, KaTeX_Main, "JetBrains Mono", monospace', fontSize: '13.5px', fill: step === 1 ? '#0284c7' : '#334155', fontWeight: 'bold' }}
              >
                {hasLearned || step > 0 ? `= ${h1.toFixed(3)}` : '= ?'}
              </text>
            </g>

            {/* === 노드 3: yHat (510, 120) === */}
            <g>
              <circle 
                cx="510" cy="120" r="46" 
                fill="none" 
                stroke={step === 1 || diagramHL.yHatNode ? '#0284c7' : '#cbd5e1'} 
                strokeWidth="1.5" 
                strokeDasharray="4 3" 
                opacity="0.6" 
              />
              <circle 
                cx="510" cy="120" r="40" 
                fill={step === 1 ? '#e0f2fe' : diagramHL.yHatNode ? '#e0f2fe' : '#ffffff'} 
                stroke={step === 1 || diagramHL.yHatNode ? '#0284c7' : step === 3 ? '#d97706' : '#cbd5e1'} 
                strokeWidth={step === 1 || diagramHL.yHatNode ? '4' : '3'} 
                filter="drop-shadow(0 4px 10px rgba(0, 0, 0, 0.08))"
              />

              <use href="#sigmoid-curve" x="510" y="120" />

              {/* KaTeX 수학 폰트 노드 라벨 */}
              <text 
                x="510" y="120" 
                textAnchor="middle" 
                dominantBaseline="central"
                style={{ fontFamily: 'KaTeX_Math, KaTeX_Main, "Times New Roman", serif', fontSize: '22px', fontStyle: 'italic', fontWeight: 'bold', fill: '#1e293b' }}
              >
                ŷ
              </text>

              {/* 노드 상단 라벨 */}
              <text className="gmarket-font" textAnchor="middle" x="510" y="60" fontSize="14" fontWeight="700" fill="#0284c7">출력층</text>

              {/* 하단 KaTeX 수학 폰트 수치 표식 */}
              <text 
                x="510" y="188" 
                textAnchor="middle" 
                dominantBaseline="central"
                style={{ fontFamily: 'KaTeX_Math, KaTeX_Main, "JetBrains Mono", monospace', fontSize: '13.5px', fill: step === 1 ? '#0284c7' : '#334155', fontWeight: 'bold' }}
              >
                {hasLearned || step > 0 ? `= ${yHat.toFixed(3)}` : '= ?'}
              </text>
            </g>

            {/* === 노드 4: Loss (670, 120) === */}
            <g>
              <rect 
                x="632" y="92" width="76" height="56" rx="14" 
                fill={step === 2 ? '#ffe4e6' : '#ffffff'} 
                stroke={step === 2 ? '#e11d48' : '#f43f5e'} 
                strokeWidth={step === 2 ? '4' : '2.5'} 
                filter="drop-shadow(0 4px 10px rgba(225, 29, 72, 0.15))"
              />

              {/* Loss 노드 라벨 */}
              <text 
                x="670" y="120" 
                textAnchor="middle" 
                dominantBaseline="central"
                style={{ fontFamily: 'KaTeX_Main, "Plus Jakarta Sans", sans-serif', fontSize: '15px', fontWeight: 'bold', fill: '#be123c' }}
              >
                Loss
              </text>

              {/* 상단 KaTeX 정답 목표 표식 */}
              <text 
                x="670" y="60" 
                textAnchor="middle" 
                dominantBaseline="central"
                style={{ fontFamily: 'KaTeX_Math, KaTeX_Main, "JetBrains Mono", monospace', fontSize: '13.5px', fill: '#be123c', fontWeight: 'bold' }}
              >
                y = {target.toFixed(2)}
              </text>

              {/* 하단 KaTeX 손실 값 표식 */}
              <text 
                x="670" y="188" 
                textAnchor="middle" 
                dominantBaseline="central"
                style={{ fontFamily: 'KaTeX_Math, KaTeX_Main, "JetBrains Mono", monospace', fontSize: '13px', fill: step >= 2 ? '#e11d48' : '#64748b', fontWeight: 'bold' }}
              >
                {hasLearned || step >= 2 ? `= ${loss.toFixed(4)}` : '= ?'}
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* 4. 선택된 Step (1~4) 별 세련된 모션 전환 카드 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              style={{ backgroundColor: '#f0f9ff', padding: '20px', borderRadius: '16px', border: '1.5px solid #bae6fd', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 4px 14px -2px rgba(2,132,199,0.08)' }}
            >
              <span className="gmarket-font" style={{ fontSize: '14.5px', fontWeight: '700', color: '#0369a1' }}>
                1. 순전파 (Forward Pass)
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #bae6fd', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  <span className="gmarket-font" style={{ fontSize: '12.5px', fontWeight: '700', color: '#0284c7', display: 'block', marginBottom: '6px' }}>은닉층 (h₁)</span>
                  <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: '1.7' }}>
                    <MathView math={`z_1 = W_1 x + b_1 = ${w1.toFixed(2)}\\times ${x.toFixed(2)} + ${b1.toFixed(2)} = \\mathbf{${z1.toFixed(3)}}`} /><br/>
                    <MathView math={`h_1 = \\sigma(z_1) = \\mathbf{${h1.toFixed(3)}}`} style={{ fontWeight: '800', color: '#0284c7' }} />
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #bae6fd', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  <span className="gmarket-font" style={{ fontSize: '12.5px', fontWeight: '700', color: '#0284c7', display: 'block', marginBottom: '6px' }}>출력층 (ŷ)</span>
                  <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: '1.7' }}>
                    <MathView math={`z_2 = W_2 h_1 + b_2 = ${w2.toFixed(2)}\\times ${h1.toFixed(3)} + (${b2.toFixed(2)}) = \\mathbf{${z2.toFixed(3)}}`} /><br/>
                    <MathView math={`\\hat{y} = \\sigma(z_2) = \\mathbf{${yHat.toFixed(3)}}`} style={{ fontWeight: '800', color: '#0284c7' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              style={{ backgroundColor: '#fff1f2', padding: '20px', borderRadius: '16px', border: '1.5px solid #fecdd3', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 4px 14px -2px rgba(225,29,72,0.08)' }}
            >
              <span className="gmarket-font" style={{ fontSize: '14.5px', fontWeight: '700', color: '#be123c' }}>
                2. 오차 산출 (Loss Calculation)
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #fecdd3', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  <span className="gmarket-font" style={{ fontSize: '12.5px', fontWeight: '700', color: '#e11d48', display: 'block', marginBottom: '6px' }}>손실 함수 (MSE Loss)</span>
                  <MathView math={`L = \\frac{1}{2}(\\hat{y} - y)^2 = \\frac{1}{2}(${yHat.toFixed(4)} - ${target.toFixed(2)})^2 = \\mathbf{${loss.toFixed(4)}}`} style={{ color: '#be123c', fontWeight: '800' }} />
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #fecdd3', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  <span className="gmarket-font" style={{ fontSize: '12.5px', fontWeight: '700', color: '#e11d48', display: 'block', marginBottom: '6px' }}>출력 오차 민감도</span>
                  <MathView math={`\\frac{\\partial L}{\\partial \\hat{y}} = \\hat{y} - y = ${yHat.toFixed(4)} - ${target.toFixed(2)} = \\mathbf{${dL_dyHat.toFixed(4)}}`} style={{ color: '#be123c', fontWeight: '800' }} />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              style={{ backgroundColor: '#fffbeb', padding: '20px', borderRadius: '16px', border: '1.5px solid #fde68a', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 4px 14px -2px rgba(217,119,6,0.08)' }}
            >
              <span className="gmarket-font" style={{ fontSize: '14.5px', fontWeight: '700', color: '#b45309' }}>
                3. 역전파 (Backward Pass)
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '12px 14px', borderRadius: '12px', border: '1px solid #fde68a', textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  <span className="gmarket-font" style={{ fontSize: '12px', fontWeight: '700', color: '#d97706', display: 'block', marginBottom: '4px' }}>1. 출력층 기울기 (δ₂)</span>
                  <MathView math={`\\delta_2 = (\\hat{y}-y)\\sigma'(z_2) = \\mathbf{${delta2.toFixed(4)}}`} style={{ fontSize: '12.5px', color: '#92400e', fontWeight: '800' }} />
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '12px 14px', borderRadius: '12px', border: '1px solid #fde68a', textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  <span className="gmarket-font" style={{ fontSize: '12px', fontWeight: '700', color: '#d97706', display: 'block', marginBottom: '4px' }}>2. W₂ 기울기 (<MathView math="\frac{\partial L}{\partial W_2}" style={{ fontSize: '11px' }} />)</span>
                  <MathView math={`\\frac{\\partial L}{\\partial W_2} = \\delta_2 \\cdot h_1 = \\mathbf{${dL_dw2.toFixed(4)}}`} style={{ fontSize: '12.5px', color: '#92400e', fontWeight: '800' }} />
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '12px 14px', borderRadius: '12px', border: '1px solid #fde68a', textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  <span className="gmarket-font" style={{ fontSize: '12px', fontWeight: '700', color: '#d97706', display: 'block', marginBottom: '4px' }}>3. W₁ 기울기 (<MathView math="\frac{\partial L}{\partial W_1}" style={{ fontSize: '11px' }} />)</span>
                  <MathView math={`\\frac{\\partial L}{\\partial W_1} = (\\delta_2 W_2)\\sigma'(z_1)x = \\mathbf{${dL_dw1.toFixed(4)}}`} style={{ fontSize: '12.5px', color: '#92400e', fontWeight: '800' }} />
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              style={{ backgroundColor: '#ecfdf5', padding: '20px', borderRadius: '16px', border: '1.5px solid #a7f3d0', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 4px 14px -2px rgba(5,150,105,0.08)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span className="gmarket-font" style={{ fontSize: '14.5px', fontWeight: '700', color: '#047857' }}>
                  4. 가중치 갱신 (Gradient Descent)
                </span>
                <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: '700', color: '#059669', backgroundColor: '#ffffff', padding: '4px 10px', borderRadius: '8px', border: '1px solid #a7f3d0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  공식: <MathView math="W^{(new)} = W^{(old)} - \eta \cdot \frac{\partial L}{\partial W}" />
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                <div style={{ padding: '12px 10px', borderRadius: '12px', backgroundColor: '#ffffff', border: '1px solid #a7f3d0', textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#059669', display: 'block', marginBottom: '3px' }}>
                    <MathView math="W_1" style={{ fontSize: '13px' }} />
                  </span>
                  <div style={{ display: 'block', marginBottom: '6px' }}>
                    <MathView math={`${w1.toFixed(3)} - ${lr.toFixed(1)} \\times (${dL_dw1.toFixed(4)})`} style={{ fontSize: '11px', color: '#475569' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: 'monospace', fontSize: '13px', fontWeight: '700' }}>
                    <span style={{ color: '#ef4444' }}>{w1.toFixed(3)}</span>
                    <ArrowRightIcon />
                    <motion.span 
                      key={w1_next}
                      initial={{ scale: 1.25, color: '#10b981' }}
                      animate={{ scale: 1, color: '#059669' }}
                      transition={{ type: 'spring', stiffness: 400 }}
                      style={{ fontWeight: '800' }}
                    >
                      {w1_next.toFixed(3)}
                    </motion.span>
                  </div>
                </div>

                <div style={{ padding: '12px 10px', borderRadius: '12px', backgroundColor: '#ffffff', border: '1px solid #a7f3d0', textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#059669', display: 'block', marginBottom: '3px' }}>
                    <MathView math="b_1" style={{ fontSize: '13px' }} />
                  </span>
                  <div style={{ display: 'block', marginBottom: '6px' }}>
                    <MathView math={`${b1.toFixed(3)} - ${lr.toFixed(1)} \\times (${dL_db1.toFixed(4)})`} style={{ fontSize: '11px', color: '#475569' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: 'monospace', fontSize: '13px', fontWeight: '700' }}>
                    <span style={{ color: '#ef4444' }}>{b1.toFixed(3)}</span>
                    <ArrowRightIcon />
                    <motion.span 
                      key={b1_next}
                      initial={{ scale: 1.25, color: '#10b981' }}
                      animate={{ scale: 1, color: '#059669' }}
                      transition={{ type: 'spring', stiffness: 400 }}
                      style={{ fontWeight: '800' }}
                    >
                      {b1_next.toFixed(3)}
                    </motion.span>
                  </div>
                </div>

                <div style={{ padding: '12px 10px', borderRadius: '12px', backgroundColor: '#ffffff', border: '1px solid #a7f3d0', textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#059669', display: 'block', marginBottom: '3px' }}>
                    <MathView math="W_2" style={{ fontSize: '13px' }} />
                  </span>
                  <div style={{ display: 'block', marginBottom: '6px' }}>
                    <MathView math={`${w2.toFixed(3)} - ${lr.toFixed(1)} \\times (${dL_dw2.toFixed(4)})`} style={{ fontSize: '11px', color: '#475569' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: 'monospace', fontSize: '13px', fontWeight: '700' }}>
                    <span style={{ color: '#ef4444' }}>{w2.toFixed(3)}</span>
                    <ArrowRightIcon />
                    <motion.span 
                      key={w2_next}
                      initial={{ scale: 1.25, color: '#10b981' }}
                      animate={{ scale: 1, color: '#059669' }}
                      transition={{ type: 'spring', stiffness: 400 }}
                      style={{ fontWeight: '800' }}
                    >
                      {w2_next.toFixed(3)}
                    </motion.span>
                  </div>
                </div>

                <div style={{ padding: '12px 10px', borderRadius: '12px', backgroundColor: '#ffffff', border: '1px solid #a7f3d0', textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#059669', display: 'block', marginBottom: '3px' }}>
                    <MathView math="b_2" style={{ fontSize: '13px' }} />
                  </span>
                  <div style={{ display: 'block', marginBottom: '6px' }}>
                    <MathView math={`${b2.toFixed(3)} - ${lr.toFixed(1)} \\times (${dL_db2.toFixed(4)})`} style={{ fontSize: '11px', color: '#475569' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: 'monospace', fontSize: '13px', fontWeight: '700' }}>
                    <span style={{ color: '#ef4444' }}>{b2.toFixed(3)}</span>
                    <ArrowRightIcon />
                    <motion.span 
                      key={b2_next}
                      initial={{ scale: 1.25, color: '#10b981' }}
                      animate={{ scale: 1, color: '#059669' }}
                      transition={{ type: 'spring', stiffness: 400 }}
                      style={{ fontWeight: '800' }}
                    >
                      {b2_next.toFixed(3)}
                    </motion.span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 5. 연쇄 법칙(Chain Rule) 상세 내역 탐색기 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#ffffff', padding: '16px', borderRadius: '18px', border: '1px solid #cbd5e1', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.04)', width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
          <span className="gmarket-font" style={{ fontSize: '14.5px', fontWeight: '700', color: '#0f172a' }}>
            <MathView math="W_1" style={{ fontSize: '14px' }} /> 기울기 계산 과정의 연쇄 법칙 분석
          </span>
        </div>

        {/* 학습 미실행 시 확인 모달 */}
        <AnimatePresence>
          {showLearnPrompt && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px',
                padding: '16px 18px',
                borderRadius: '14px',
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                boxShadow: '0 4px 16px rgba(217, 119, 6, 0.1)',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#92400e', lineHeight: '1.5', textAlign: 'center' }}>
                  실행된 학습이 없습니다. 현재 파라미터로 1회 학습을 자동 실행합니다.
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleLearnConfirm}
                  className="gmarket-font"
                  style={{
                    padding: '8px 22px',
                    fontSize: '13px',
                    fontWeight: '700',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #d97706, #b45309)',
                    color: '#ffffff',
                    cursor: 'pointer',
                    boxShadow: '0 3px 10px rgba(217, 119, 6, 0.3)'
                  }}
                >
                확인
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleLearnCancel}
                  className="gmarket-font"
                  style={{
                    padding: '8px 22px',
                    fontSize: '13px',
                    fontWeight: '700',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  취소
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 수치 곱셈식 */}
        <div style={{ fontSize: '13px', color: '#0f172a', overflowX: 'auto', width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '6px', backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '14px', border: '1px solid #e2e8f0', WebkitOverflowScrolling: 'touch' }}>
          <MathView math={`\\frac{\\partial L}{\\partial W_1} = (${dL_dyHat.toFixed(4)}) \\times (${dyHat_dz2.toFixed(4)}) \\times (${w2.toFixed(2)}) \\times (${dh1_dz1.toFixed(4)}) \\times (${x.toFixed(2)}) = ${dL_dw1.toFixed(4)}`} style={{ fontSize: '13px' }} />
        </div>

        {/* 미분 항 선택 버튼 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flexWrap: 'wrap', width: '100%', boxSizing: 'border-box' }}>
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
                {idx > 0 && <span style={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '13px' }}>×</span>}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTermClick(item.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px 12px',
                    borderRadius: '9px',
                    border: isSelected ? `2px solid ${info.themeColor}` : '1px solid #cbd5e1',
                    backgroundColor: isSelected ? info.bgColor : '#ffffff',
                    color: isSelected ? info.themeColor : '#334155',
                    fontWeight: '800',
                    cursor: 'pointer',
                    boxShadow: isSelected ? `0 4px 12px ${info.accentGlow}` : '0 1px 2px rgba(0,0,0,0.04)'
                  }}
                >
                  <MathView math={info.symbol} style={{ fontSize: '14px' }} />
                </motion.button>
              </React.Fragment>
            );
          })}
        </div>

        {/* 상세 설명 내역 (모바일에서 1column으로 자연스럽게 축소) */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTermKey}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            style={{ padding: '14px', backgroundColor: activeTerm.bgColor, borderRadius: '16px', border: `1.5px solid ${activeTerm.themeColor}35`, display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', boxSizing: 'border-box' }}
          >
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', backgroundColor: '#ffffff', padding: '10px 14px', borderRadius: '10px', border: `1px solid ${activeTerm.themeColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '6px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', overflowX: 'auto', width: '100%', boxSizing: 'border-box' }}>
              <MathView math={`\\left( ${activeTerm.symbol} \\right) = `} style={{ fontSize: '13px' }} />
              <MathView math={activeTerm.calcFormulaMath} style={{ fontSize: '13px' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ padding: '12px 14px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box' }}>
                <span className="gmarket-font" style={{ fontSize: '12.5px', fontWeight: '700', color: activeTerm.themeColor, display: 'block', marginBottom: '4px' }}>
                  항 의미 : {activeTerm.name}
                </span>
                <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: '1.6' }}>
                  {activeTerm.descriptionNode}
                </div>
              </div>

              <div style={{ padding: '12px 14px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box' }}>
                <span className="gmarket-font" style={{ fontSize: '12.5px', fontWeight: '700', color: '#059669', display: 'block', marginBottom: '4px' }}>
                  수식 유도
                </span>
                <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: '1.6' }}>
                  {activeTerm.mathReasonNode}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default BackpropSimulator;
