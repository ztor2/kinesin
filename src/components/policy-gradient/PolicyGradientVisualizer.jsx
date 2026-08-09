import React, { useState, useRef, useEffect } from 'react';
import katex from 'katex';
import { motion, AnimatePresence } from 'framer-motion';
import robotAvatarImg from '../../assets/policy-gradient/robot_avatar.jpg';

// KaTeX 수학 수식 HTML 렌더링 헬퍼 컴포넌트
const MathView = ({ math, style }) => {
  const html = katex.renderToString(math, { throwOnError: false });
  return <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '1.05em', ...style }} dangerouslySetInnerHTML={{ __html: html }} />;
};

// 1. Interactive Component 1: Computational Graph Guard
export const GraphComparisonVisualizer = () => {
  const [selectedType, setSelectedType] = useState('supervised');
  const [highlightedNode, setHighlightedNode] = useState(null);

  return (
    <div style={{
      width: '100%',
      padding: '24px',
      borderRadius: '16px',
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <span className="gmarket-font" style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
          계산 그래프(Computational Graph) & 기울기 전파 비교
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => { setSelectedType('supervised'); setHighlightedNode(null); }}
            className="gmarket-font"
            style={{
              padding: '6px 14px',
              fontSize: '12.5px',
              fontWeight: '700',
              borderRadius: '8px',
              border: selectedType === 'supervised' ? '2px solid #3b82f6' : '1px solid #cbd5e1',
              backgroundColor: selectedType === 'supervised' ? '#eff6ff' : '#ffffff',
              color: selectedType === 'supervised' ? '#1d4ed8' : '#475569',
              cursor: 'pointer'
            }}
          >
            지도학습 (Supervised)
          </button>
          <button
            onClick={() => { setSelectedType('rl'); setHighlightedNode(null); }}
            className="gmarket-font"
            style={{
              padding: '6px 14px',
              fontSize: '12.5px',
              fontWeight: '700',
              borderRadius: '8px',
              border: selectedType === 'rl' ? '2px solid #10b981' : '1px solid #cbd5e1',
              backgroundColor: selectedType === 'rl' ? '#ecfdf5' : '#ffffff',
              color: selectedType === 'rl' ? '#047857' : '#475569',
              cursor: 'pointer'
            }}
          >
            강화학습 (RL)
          </button>
        </div>
      </div>

      <div style={{
        padding: '20px',
        backgroundColor: '#f8fafc',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}>
        {selectedType === 'supervised' ? (
          <div style={{ minWidth: '500px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
            <div onClick={() => setHighlightedNode('param')} style={{ cursor: 'pointer', padding: '12px 16px', borderRadius: '12px', backgroundColor: highlightedNode === 'param' ? '#dbeafe' : '#ffffff', border: '1.5px solid #3b82f6', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>파라미터</div>
              <div style={{ fontSize: '16px', color: '#1d4ed8' }}><MathView math="\theta" /></div>
            </div>
            <div style={{ color: '#3b82f6', fontWeight: 'bold' }}>➔</div>
            <div onClick={() => setHighlightedNode('model')} style={{ cursor: 'pointer', padding: '12px 16px', borderRadius: '12px', backgroundColor: highlightedNode === 'model' ? '#dbeafe' : '#ffffff', border: '1.5px solid #3b82f6', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>신경망 모델</div>
              <div style={{ fontSize: '15px', color: '#1d4ed8' }}><MathView math="f_\theta(x)" /></div>
            </div>
            <div style={{ color: '#3b82f6', fontWeight: 'bold' }}>➔</div>
            <div onClick={() => setHighlightedNode('pred')} style={{ cursor: 'pointer', padding: '12px 16px', borderRadius: '12px', backgroundColor: highlightedNode === 'pred' ? '#dbeafe' : '#ffffff', border: '1.5px solid #3b82f6', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>예측값</div>
              <div style={{ fontSize: '15px', color: '#1d4ed8' }}><MathView math="\hat{y}" /></div>
            </div>
            <div style={{ color: '#3b82f6', fontWeight: 'bold' }}>➔</div>
            <div onClick={() => setHighlightedNode('loss')} style={{ cursor: 'pointer', padding: '12px 16px', borderRadius: '12px', backgroundColor: highlightedNode === 'loss' ? '#fee2e2' : '#ffffff', border: '1.5px solid #ef4444', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>손실함수</div>
              <div style={{ fontSize: '15px', color: '#b91c1c' }}><MathView math="L" /></div>
            </div>
          </div>
        ) : (
          <div style={{ minWidth: '560px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
            <div onClick={() => setHighlightedNode('param')} style={{ cursor: 'pointer', padding: '12px 14px', borderRadius: '12px', backgroundColor: highlightedNode === 'param' ? '#d1fae5' : '#ffffff', border: '1.5px solid #10b981', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>정책 파라미터</div>
              <div style={{ fontSize: '15px', color: '#047857' }}><MathView math="\theta" /></div>
            </div>
            <div style={{ color: '#10b981', fontWeight: 'bold' }}>➔</div>
            <div onClick={() => setHighlightedNode('policy')} style={{ cursor: 'pointer', padding: '12px 14px', borderRadius: '12px', backgroundColor: highlightedNode === 'policy' ? '#d1fae5' : '#ffffff', border: '1.5px solid #10b981', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>정책 신경망</div>
              <div style={{ fontSize: '14.5px', color: '#047857' }}><MathView math="\pi_\theta(a|s)" /></div>
            </div>
            <div style={{ color: '#f59e0b', fontWeight: 'bold' }}>Sampling ➔</div>
            <div onClick={() => setHighlightedNode('action')} style={{ cursor: 'pointer', padding: '12px 14px', borderRadius: '12px', backgroundColor: highlightedNode === 'action' ? '#fef3c7' : '#ffffff', border: '1.5px dashed #f59e0b', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#b45309', fontWeight: '700' }}>행동 선택</div>
              <div style={{ fontSize: '15px', color: '#b45309' }}><MathView math="a" /></div>
            </div>
            <div style={{ color: '#ef4444', fontWeight: 'bold' }}>Black-box ➔</div>
            <div onClick={() => setHighlightedNode('env')} style={{ cursor: 'pointer', padding: '12px 14px', borderRadius: '12px', backgroundColor: highlightedNode === 'env' ? '#fee2e2' : '#ffffff', border: '1.5px solid #ef4444', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#991b1b', fontWeight: '700' }}>환경 (Env)</div>
              <div style={{ fontSize: '15px', color: '#991b1b' }}><MathView math="R" /></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 2. Main Simulator Component: Clean, De-cluttered & Expanded Nodes
export const ProbabilityMassSimulator = () => {
  const [probRight, setProbRight] = useState(0.5);
  const [activeStep, setActiveStep] = useState(null);
  const [activeMathTerm, setActiveMathTerm] = useState('log_prob');
  const [lineCoords, setLineCoords] = useState({ x: 150, width: 80 });

  // Policy Gradient Learning State
  const [episodeCount, setEpisodeCount] = useState(0);
  const [lastReward, setLastReward] = useState(null);
  const [lastDelta, setLastDelta] = useState(null);
  const [baseline, setBaseline] = useState(2.0);
  const baselineRef = useRef(baseline);

  // KL Divergence Penalty Coefficient β State (0.0 ~ 0.5, default 0.0)
  const [klCoef, setKlCoef] = useState(0.0);
  const klCoefRef = useRef(klCoef);

  useEffect(() => {
    baselineRef.current = baseline;
  }, [baseline]);

  useEffect(() => {
    klCoefRef.current = klCoef;
  }, [klCoef]);

  const containerRef = useRef(null);
  const termRefs = {
    grad_j: useRef(null),
    expectation: useRef(null),
    log_prob: useRef(null),
    reward_weight: useRef(null)
  };

  const probLeft = 1 - probRight;
  const pLL = probLeft * probLeft;
  const pLR = probLeft * probRight;
  const pRL = probRight * probLeft;
  const pRR = probRight * probRight;

  const rLL = 0;
  const rLR = 1;
  const rRL = 1;
  const rRR = 10;

  const expectedReturn = pLL * rLL + pLR * rLR + pRL * rRL + pRR * rRR;

  // Step term breakdown configuration with REAL-TIME Episode Gradient Value Sync
  const mathTerms = {
    grad_j: {
      symbol: '\\nabla_\\theta J(\\theta)',
      name: '기대 보상 목적함수 기울기 (Expected Return Gradient)',
      bgColor: '#f0fdf4',
      themeColor: '#059669',
      highlightBg: '#d1fae5',
      formula: '\\nabla_\\theta J(\\theta) \\approx \\Delta P = ' + (lastDelta !== null ? (lastDelta >= 0 ? `+${lastDelta.toFixed(3)}` : lastDelta.toFixed(3)) : '0.000'),
      valStr: lastDelta !== null ? (lastDelta >= 0 ? `ΔP = +${lastDelta.toFixed(3)}` : `ΔP = ${lastDelta.toFixed(3)}`) : 'ΔP = 0.000',
      descNode: (
        <span>
          계산된 정책 기울기 <MathView math="\nabla_\theta J(\theta)" /> 변동량은 <strong className="num-font" style={{ color: lastDelta >= 0 ? '#059669' : '#dc2626' }}>{lastDelta !== null ? (lastDelta >= 0 ? `+${lastDelta.toFixed(3)}` : lastDelta.toFixed(3)) : '0.000'}</strong>입니다.
          {lastDelta !== null && lastDelta > 0 && <span> (높은 보상을 받아 Right 확률이 상승했습니다)</span>}
          {lastDelta !== null && lastDelta < 0 && <span> (낮은 보상을 받아 Right 확률이 조정되었습니다)</span>}
        </span>
      )
    },
    expectation: {
      symbol: '\\mathbb{E}_{\\tau \\sim p_\\theta(\\tau)}',
      name: '기댓값 연산자 (Expectation Operator)',
      bgColor: '#eff6ff',
      themeColor: '#2563eb',
      highlightBg: '#dbeafe',
      formula: '\\mathbb{E}_{\\tau} [X] \\implies P(\\text{Right}) = ' + probRight.toFixed(2),
      valStr: `P(Right) = ${probRight.toFixed(2)}`,
      descNode: (
        <span>
          현재 정책의 Right 선택 확률은 <strong className="num-font" style={{ color: '#2563eb' }}>{probRight.toFixed(2)}</strong> 이며, <MathView math="P(\text{RR})" /> 궤적 발생 확률은 <strong className="num-font">{(pRR*100).toFixed(1)}%</strong> 입니다.
        </span>
      )
    },
    log_prob: {
      symbol: '\\nabla_\\theta \\log \\pi_\\theta(a|s)',
      name: '로그 확률 기울기 (Log-Prob Gradient)',
      bgColor: '#f5f3ff',
      themeColor: '#7c3aed',
      highlightBg: '#ede9fe',
      formula: '\\nabla_\\theta \\log \\pi_\\theta(a|s) \\implies \\text{궤적: } ' + (activeStep || 'START'),
      valStr: activeStep || 'START',
      descNode: (
        <span>
          로봇이 선택한 행동 궤적은 <strong className="num-font" style={{ color: '#7c3aed' }}>{activeStep || 'START'}</strong> 입니다. 로그 미분 트릭 <MathView math="\nabla \log \pi = \frac{\nabla \pi}{\pi}" />을 통해 가중치 업데이트 방향을 제공합니다.
        </span>
      )
    },
    reward_weight: {
      symbol: 'R(\\tau)',
      name: '보상 가중치 (Reward Weight)',
      bgColor: '#fffbeb',
      themeColor: '#d97706',
      highlightBg: '#fef3c7',
      formula: 'R(\\tau) = ' + (lastReward !== null ? `${lastReward}점` : '0점'),
      valStr: lastReward !== null ? `Reward = ${lastReward}점` : 'Reward = 0점',
      descNode: (
        <span>
          환경이 돌려준 보상은 <strong className="num-font" style={{ color: lastReward === 10 ? '#059669' : '#d97706' }}>{lastReward !== null ? `${lastReward}점` : '0점'}</strong> 입니다. 보상 크기에 따라 기울기 업데이트의 가중치가 조율됩니다.
        </span>
      )
    }
  };

  const activeTermInfo = mathTerms[activeMathTerm];

  // Dynamically measure active inline math term element bounds to position connecting beam
  useEffect(() => {
    const termEl = termRefs[activeMathTerm]?.current;
    const containerEl = containerRef.current;

    if (termEl && containerEl) {
      const termRect = termEl.getBoundingClientRect();
      const containerRect = containerEl.getBoundingClientRect();

      const relativeX = termRect.left - containerRect.left;
      const termWidth = termRect.width;

      setLineCoords({
        x: relativeX + termWidth / 2,
        width: termWidth
      });
    }
  }, [activeMathTerm]);

  // Compute 2D robot position based on activeStep
  const getRobotPosition = () => {
    if (!activeStep || activeStep === 'START') return { x: 50, y: 28 };
    if (activeStep === 'L') return { x: 25, y: 32 };
    if (activeStep === 'R') return { x: 75, y: 32 };
    if (activeStep === 'LL') return { x: 12.5, y: 68 };
    if (activeStep === 'LR') return { x: 37.5, y: 68 };
    if (activeStep === 'RL') return { x: 62.5, y: 68 };
    if (activeStep === 'RR') return { x: 87.5, y: 68 };
    return { x: 50, y: 28 };
  };

  const robotPos = getRobotPosition();

  // Policy Gradient Real Learning Step: Exploration + Automatic Gradient Update
  const runPolicyGradientStep = () => {
    // 1. Reset to START
    setActiveStep('START');

    const choice1 = Math.random() < probRight ? 'R' : 'L';
    const choice2 = Math.random() < probRight ? 'R' : 'L';
    const finalTraj = choice1 + choice2;

    let reward = 0;
    if (finalTraj === 'RR') reward = 10;
    else if (finalTraj === 'LR' || finalTraj === 'RL') reward = 1;
    else reward = 0;

    // 2. Move to 1-Step
    setTimeout(() => {
      setActiveStep(choice1);
    }, 350);

    // 3. Move to 2-Step & Perform Policy Update
    setTimeout(() => {
      setActiveStep(finalTraj);
      setEpisodeCount((prev) => prev + 1);
      setLastReward(reward);

      // Advantage using current REAL-TIME Baseline b (via baselineRef.current)
      const currentBaseline = baselineRef.current;
      const advantage = reward - currentBaseline;
      
      // Tuned Learning Rate to ensure smooth, realistic incremental updates
      const lr = 0.015;

      // True Policy Gradient Score Function:
      const gradStep1 = choice1 === 'R' ? (1 - probRight) : (-probRight);
      const gradStep2 = choice2 === 'R' ? (1 - probRight) : (-probRight);
      const gradTotal = gradStep1 + gradStep2;

      // Pure Policy Gradient Update: ΔP_reward = lr * Advantage * gradTotal
      const deltaP_reward = lr * advantage * gradTotal;

      // KL Divergence Penalty Gradient w.r.t Reference Policy P_ref = 0.5:
      // D_KL(P || P_ref) = P log(P / 0.5) + (1-P) log((1-P) / 0.5)
      // ∇_P D_KL = log(P / (1-P)) [Logit difference]
      // Penalty gradient resists deviation from P_ref = 0.5:
      const currentBeta = klCoefRef.current;
      const logitDiff = Math.log(probRight / (1 - probRight));
      const klGrad = currentBeta * logitDiff;
      const deltaP_kl = -lr * klGrad;

      // Total Policy Update: ΔP = ΔP_reward + ΔP_kl
      const deltaP = deltaP_reward + deltaP_kl;

      setLastDelta(deltaP);

      setProbRight((prevProb) => {
        const nextProb = Math.min(0.95, Math.max(0.05, prevProb + deltaP));
        return nextProb;
      });
    }, 900);
  };

  // Reset training episode & policy
  const resetTraining = () => {
    setProbRight(0.5);
    setBaseline(2.0);
    setEpisodeCount(0);
    setLastReward(null);
    setLastDelta(null);
    setActiveStep(null);
  };

  return (
    <div style={{
      width: '100%',
      padding: '24px',
      borderRadius: '16px',
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px' // 넓은 여유 간격
    }}>
      {/* 1. 컴포넌트 헤더 영역 (Backprop 방식 세로 bar + 타이틀) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
        {/* Row 1: 세로형 컬러 바 + 메인 타이틀 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '6px', height: '22px', borderRadius: '5px', background: 'linear-gradient(180deg, #10b981, #059669)' }} />
          <h3 className="gmarket-font" style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.02em' }}>
            Policy Gradient Simulator
          </h3>
        </div>

        {/* Row 2: 우측 정렬된 컨트롤 버튼 그룹 [초기화] -> [1회 탐색 & Policy Gradient 학습 실행] */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
          <button
            onClick={resetTraining}
            className="gmarket-font"
            style={{
              padding: '7px 14px',
              fontSize: '12.5px',
              fontWeight: '700',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#64748b',
              cursor: 'pointer'
            }}
          >
            초기화
          </button>
          <button
            onClick={runPolicyGradientStep}
            className="gmarket-font"
            style={{
              padding: '7px 16px',
              fontSize: '13px',
              fontWeight: '700',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
            }}
          >
            1회 탐색 & 학습 실행
          </button>
        </div>
      </div>

      {/* 2. 시인성이 향상된 크고 선명한 2D 로봇 탐색 다이어그램 캔버스 */}
      <div style={{
        position: 'relative',
        height: '240px',
        width: '100%',
        backgroundColor: '#f8fafc',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <line x1="50%" y1="20%" x2="25%" y2="48%" stroke={probLeft > 0.5 ? '#3b82f6' : '#cbd5e1'} strokeWidth={probLeft * 6 + 1.5} />
          <line x1="50%" y1="20%" x2="75%" y2="48%" stroke={probRight > 0.5 ? '#3b82f6' : '#cbd5e1'} strokeWidth={probRight * 6 + 1.5} />
          
          <line x1="25%" y1="48%" x2="12.5%" y2="82%" stroke="#cbd5e1" strokeWidth={probLeft * 4 + 1} />
          <line x1="25%" y1="48%" x2="37.5%" y2="82%" stroke="#cbd5e1" strokeWidth={probRight * 4 + 1} />

          <line x1="75%" y1="48%" x2="62.5%" y2="82%" stroke="#cbd5e1" strokeWidth={probLeft * 4 + 1} />
          <line x1="75%" y1="48%" x2="87.5%" y2="82%" stroke="#10b981" strokeWidth={probRight * 5 + 1.5} />
        </svg>

        {/* 다이어그램 우측 상단 내부에 위치하는 에피소드 뱃지 */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '14px',
          padding: '4px 10px',
          borderRadius: '8px',
          backgroundColor: '#ffffff',
          border: '1px solid #cbd5e1',
          fontSize: '11.5px',
          fontWeight: '700',
          color: '#6d28d9',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          zIndex: 5
        }}>
          Episode <strong className="num-font" style={{ color: '#6d28d9' }}>#{episodeCount}</strong>
        </div>

        {/* 선명하게 커진 폰트와 여유 있는 노드 박스들 */}
        <div style={{ position: 'absolute', top: '14%', left: '50%', transform: 'translate(-50%, -50%)', padding: '6px 14px', borderRadius: '10px', backgroundColor: '#ffffff', border: '1.5px solid #64748b', fontSize: '12px', fontWeight: '700', color: '#1e293b', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          START
        </div>

        <div style={{ position: 'absolute', top: '48%', left: '25%', transform: 'translate(-50%, -50%)', padding: '6px 14px', borderRadius: '10px', backgroundColor: '#ffffff', border: '1.5px solid #64748b', fontSize: '12px', fontWeight: '700', color: '#1e293b', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          Left ({(probLeft*100).toFixed(0)}%)
        </div>
        <div style={{ position: 'absolute', top: '48%', left: '75%', transform: 'translate(-50%, -50%)', padding: '6px 14px', borderRadius: '10px', backgroundColor: '#ffffff', border: '1.5px solid #64748b', fontSize: '12px', fontWeight: '700', color: '#1e293b', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          Right ({(probRight*100).toFixed(0)}%)
        </div>

        <div style={{ position: 'absolute', top: '84%', left: '12.5%', transform: 'translate(-50%, -50%)', padding: '6px 12px', borderRadius: '10px', backgroundColor: '#ffffff', border: '1.5px solid #cbd5e1', fontSize: '12px', textAlign: 'center', color: '#475569' }}>
          LL: <strong className="num-font">0점</strong>
        </div>
        <div style={{ position: 'absolute', top: '84%', left: '37.5%', transform: 'translate(-50%, -50%)', padding: '6px 12px', borderRadius: '10px', backgroundColor: '#ffffff', border: '1.5px solid #cbd5e1', fontSize: '12px', textAlign: 'center', color: '#1d4ed8' }}>
          LR: <strong className="num-font">1점</strong>
        </div>
        <div style={{ position: 'absolute', top: '84%', left: '62.5%', transform: 'translate(-50%, -50%)', padding: '6px 12px', borderRadius: '10px', backgroundColor: '#ffffff', border: '1.5px solid #cbd5e1', fontSize: '12px', textAlign: 'center', color: '#1d4ed8' }}>
          RL: <strong className="num-font">1점</strong>
        </div>
        <div style={{ position: 'absolute', top: '84%', left: '87.5%', transform: 'translate(-50%, -50%)', padding: '6px 14px', borderRadius: '10px', backgroundColor: '#ecfdf5', border: '2px solid #10b981', fontSize: '12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
          <strong style={{ color: '#047857' }}>RR: 10점</strong>
        </div>

        <motion.div
          animate={{ left: `${robotPos.x}%`, top: `${robotPos.y}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          style={{
            position: 'absolute',
            width: '42px',
            height: '42px',
            transform: 'translate(-50%, -50%)',
            zIndex: 10
          }}
        >
          <img 
            src={robotAvatarImg.src || robotAvatarImg} 
            alt="Robot" 
            style={{ 
              width: '100%', 
              height: '100%', 
              borderRadius: '50%', 
              border: '2.5px solid #3b82f6',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
              objectFit: 'cover'
            }} 
          />
        </motion.div>
      </div>

      {/* 3. 다이어그램 하단: P(Right) 정책 확률, Baseline J(θ), KL Penalty 슬라이더 나란히 (3-Column Grid) 배치 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        {/* 슬라이더 1: P(Right) 정책 확률 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155' }}>
              <MathView math="P(\text{Right})" />: <strong className="num-font" style={{ color: '#2563eb', fontSize: '14px' }}>{probRight.toFixed(2)}</strong>
            </span>
            {lastDelta !== null && (
              <span className="num-font" style={{ fontSize: '11.5px', color: lastDelta >= 0 ? '#059669' : '#dc2626', fontWeight: 'bold' }}>
                ({lastDelta >= 0 ? `+${lastDelta.toFixed(3)}` : lastDelta.toFixed(3)})
              </span>
            )}
          </div>
          <input
            type="range"
            min="0.05"
            max="0.95"
            step="0.01"
            value={probRight}
            onChange={(e) => setProbRight(parseFloat(e.target.value))}
            style={{ width: '100%', cursor: 'pointer', accentColor: '#2563eb' }}
          />
        </div>

        {/* 슬라이더 2: 기대보상 Baseline J(θ) (조절 범위: 0.5 ~ 2.0) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155' }}>
              <MathView math="J(\theta)" /> Baseline: <strong className="num-font" style={{ color: '#059669', fontSize: '14px' }}>{baseline.toFixed(2)}점</strong>
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.05"
            value={baseline}
            onChange={(e) => setBaseline(parseFloat(e.target.value))}
            style={{ width: '100%', cursor: 'pointer', accentColor: '#059669' }}
          />
        </div>

        {/* 슬라이더 3: KL Penalty 제약 계수 β (조절 범위: 0.0 ~ 0.5) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155' }}>
              <MathView math="\text{KL Penalty } \beta" />: <strong className="num-font" style={{ color: '#7c3aed', fontSize: '14px' }}>{klCoef.toFixed(2)}</strong>
            </span>
          </div>
          <input
            type="range"
            min="0.0"
            max="0.5"
            step="0.02"
            value={klCoef}
            onChange={(e) => setKlCoef(parseFloat(e.target.value))}
            style={{ width: '100%', cursor: 'pointer', accentColor: '#7c3aed' }}
          />
        </div>
      </div>

      {/* 4. Trajectory 확률 및 보상 상태 바 (테두리 피로감 해소) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
        {[
          { traj: '\\text{LL}', p: pLL, r: rLL, color: '#475569' },
          { traj: '\\text{LR}', p: pLR, r: rLR, color: '#1d4ed8' },
          { traj: '\\text{RL}', p: pRL, r: rRL, color: '#1d4ed8' },
          { traj: '\\text{RR}', p: pRR, r: rRR, color: '#047857' }
        ].map((item, idx) => (
          <div key={idx} style={{
            padding: '12px',
            borderRadius: '10px',
            backgroundColor: activeStep === ['LL', 'LR', 'RL', 'RR'][idx] ? '#fef3c7' : '#f8fafc',
            border: activeStep === ['LL', 'LR', 'RL', 'RR'][idx] ? '1.5px solid #f59e0b' : '1px solid #e2e8f0',
            textAlign: 'center',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: item.color, marginBottom: '2px' }}>
              <MathView math={item.traj} /> ({item.r}점)
            </div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: item.color, marginTop: '2px' }} className="num-font">
              {(item.p * 100).toFixed(1)}%
            </div>
            <div style={{ height: '4px', width: '100%', backgroundColor: '#e2e8f0', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${item.p * 100}%`, backgroundColor: item.r === 10 ? '#10b981' : '#3b82f6' }} />
            </div>
          </div>
        ))}
      </div>

      {/* 5. 여유롭고 깔끔해진 수식 항 터치 분석기 */}
      <div 
        ref={containerRef}
        style={{
          position: 'relative',
          marginTop: '6px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
          Policy Gradient 계산 프로세스
        </div>

        {/* 수식 문자열 하이라이트 블록 */}
        <div style={{
          fontSize: '15.5px',
          color: '#0f172a',
          overflowX: 'auto',
          width: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'nowrap',
          gap: '6px',
          backgroundColor: '#f8fafc',
          padding: '16px 14px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          WebkitOverflowScrolling: 'touch'
        }}>
          {/* 항 1: \nabla_\theta J(\theta) */}
          <div
            ref={termRefs.grad_j}
            onClick={() => setActiveMathTerm('grad_j')}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              backgroundColor: activeMathTerm === 'grad_j' ? mathTerms.grad_j.highlightBg : 'transparent',
              borderBottom: activeMathTerm === 'grad_j' ? `3px solid ${mathTerms.grad_j.themeColor}` : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'inline-flex'
            }}
          >
            <MathView math="\nabla_\theta J(\theta)" style={{ color: activeMathTerm === 'grad_j' ? mathTerms.grad_j.themeColor : 'inherit', fontWeight: 'bold' }} />
          </div>

          <span style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 2px' }}>=</span>

          {/* 항 2: \mathbb{E}_{\tau \sim p_\theta(\tau)} */}
          <div
            ref={termRefs.expectation}
            onClick={() => setActiveMathTerm('expectation')}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              backgroundColor: activeMathTerm === 'expectation' ? mathTerms.expectation.highlightBg : 'transparent',
              borderBottom: activeMathTerm === 'expectation' ? `3px solid ${mathTerms.expectation.themeColor}` : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'inline-flex'
            }}
          >
            <MathView math="\mathbb{E}_{\tau \sim p_\theta(\tau)}" style={{ color: activeMathTerm === 'expectation' ? mathTerms.expectation.themeColor : 'inherit', fontWeight: 'bold' }} />
          </div>

          <span style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 1px' }}>[</span>

          {/* 항 3: \nabla_\theta \log \pi_\theta(a|s) */}
          <div
            ref={termRefs.log_prob}
            onClick={() => setActiveMathTerm('log_prob')}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              backgroundColor: activeMathTerm === 'log_prob' ? mathTerms.log_prob.highlightBg : 'transparent',
              borderBottom: activeMathTerm === 'log_prob' ? `3px solid ${mathTerms.log_prob.themeColor}` : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'inline-flex'
            }}
          >
            <MathView math="\nabla_\theta \log \pi_\theta(a|s)" style={{ color: activeMathTerm === 'log_prob' ? mathTerms.log_prob.themeColor : 'inherit', fontWeight: 'bold' }} />
          </div>

          <span style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 2px' }}>·</span>

          {/* 항 4: R(\tau) */}
          <div
            ref={termRefs.reward_weight}
            onClick={() => setActiveMathTerm('reward_weight')}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              backgroundColor: activeMathTerm === 'reward_weight' ? mathTerms.reward_weight.highlightBg : 'transparent',
              borderBottom: activeMathTerm === 'reward_weight' ? `3px solid ${mathTerms.reward_weight.themeColor}` : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'inline-flex'
            }}
          >
            <MathView math="R(\tau)" style={{ color: activeMathTerm === 'reward_weight' ? mathTerms.reward_weight.themeColor : 'inherit', fontWeight: 'bold' }} />
          </div>

          <span style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 1px' }}>]</span>
        </div>

        {/* 점선 연결 빔 */}
        <div style={{ position: 'relative', width: '100%', height: '20px', marginTop: '-4px' }}>
          <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <line
              x1={lineCoords.x}
              y1="0"
              x2={lineCoords.x}
              y2="20"
              stroke={activeTermInfo.themeColor}
              strokeWidth="2"
              strokeDasharray="4 3"
            />
            <circle
              cx={lineCoords.x}
              cy="20"
              r="3.5"
              fill={activeTermInfo.themeColor}
            />
          </svg>
        </div>

        {/* 상세 설명 카드 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMathTerm}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            style={{
              padding: '16px',
              backgroundColor: activeTermInfo.bgColor,
              borderRadius: '12px',
              border: `1.5px solid ${activeTermInfo.themeColor}40`,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{
              fontSize: '13px',
              fontWeight: '700',
              color: activeTermInfo.themeColor,
              display: 'flex',
              alignItems: 'center',
              overflowX: 'auto'
            }}>
              <span><MathView math={activeTermInfo.formula} /></span>
            </div>

            <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.65' }}>
              <strong>{activeTermInfo.name}</strong>: {activeTermInfo.descNode}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
