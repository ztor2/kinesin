import React, { useState, useRef, useEffect } from 'react';
import katex from 'katex';
import { motion, AnimatePresence } from 'framer-motion';
import robotAvatarImg from '../../assets/policy-gradient/robot_avatar.jpg';

// KaTeX 수학 수식 HTML 렌더링 헬퍼 컴포넌트 (BackpropSimulator 표준 방식)
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
      padding: '20px',
      borderRadius: '16px',
      backgroundColor: '#ffffff',
      border: '1px solid #cbd5e1',
      boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
      boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
        <span className="gmarket-font" style={{ fontSize: '14.5px', fontWeight: '700', color: '#0f172a' }}>
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
        padding: '16px',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        marginBottom: '14px',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}>
        {selectedType === 'supervised' ? (
          <div style={{ minWidth: '480px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
            <div onClick={() => setHighlightedNode('param')} style={{ cursor: 'pointer', padding: '10px 14px', borderRadius: '10px', backgroundColor: highlightedNode === 'param' ? '#dbeafe' : '#ffffff', border: '1.5px solid #3b82f6', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>파라미터</div>
              <div style={{ fontSize: '15px', color: '#1d4ed8' }}><MathView math="\theta" /></div>
            </div>
            <div style={{ color: '#3b82f6', fontWeight: 'bold' }}>➔</div>
            <div onClick={() => setHighlightedNode('model')} style={{ cursor: 'pointer', padding: '10px 14px', borderRadius: '10px', backgroundColor: highlightedNode === 'model' ? '#dbeafe' : '#ffffff', border: '1.5px solid #3b82f6', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>신경망 모델</div>
              <div style={{ fontSize: '14px', color: '#1d4ed8' }}><MathView math="f_\theta(x)" /></div>
            </div>
            <div style={{ color: '#3b82f6', fontWeight: 'bold' }}>➔</div>
            <div onClick={() => setHighlightedNode('pred')} style={{ cursor: 'pointer', padding: '10px 14px', borderRadius: '10px', backgroundColor: highlightedNode === 'pred' ? '#dbeafe' : '#ffffff', border: '1.5px solid #3b82f6', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>예측값</div>
              <div style={{ fontSize: '14px', color: '#1d4ed8' }}><MathView math="\hat{y}" /></div>
            </div>
            <div style={{ color: '#3b82f6', fontWeight: 'bold' }}>➔</div>
            <div onClick={() => setHighlightedNode('loss')} style={{ cursor: 'pointer', padding: '10px 14px', borderRadius: '10px', backgroundColor: highlightedNode === 'loss' ? '#fee2e2' : '#ffffff', border: '1.5px solid #ef4444', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>손실함수</div>
              <div style={{ fontSize: '14px', color: '#b91c1c' }}><MathView math="L" /></div>
            </div>
          </div>
        ) : (
          <div style={{ minWidth: '540px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
            <div onClick={() => setHighlightedNode('param')} style={{ cursor: 'pointer', padding: '10px 12px', borderRadius: '10px', backgroundColor: highlightedNode === 'param' ? '#d1fae5' : '#ffffff', border: '1.5px solid #10b981', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>정책 파라미터</div>
              <div style={{ fontSize: '14px', color: '#047857' }}><MathView math="\theta" /></div>
            </div>
            <div style={{ color: '#10b981', fontWeight: 'bold' }}>➔</div>
            <div onClick={() => setHighlightedNode('policy')} style={{ cursor: 'pointer', padding: '10px 12px', borderRadius: '10px', backgroundColor: highlightedNode === 'policy' ? '#d1fae5' : '#ffffff', border: '1.5px solid #10b981', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>정책 신경망</div>
              <div style={{ fontSize: '13.5px', color: '#047857' }}><MathView math="\pi_\theta(a|s)" /></div>
            </div>
            <div style={{ color: '#f59e0b', fontWeight: 'bold' }}>Sampling ➔</div>
            <div onClick={() => setHighlightedNode('action')} style={{ cursor: 'pointer', padding: '10px 12px', borderRadius: '10px', backgroundColor: highlightedNode === 'action' ? '#fef3c7' : '#ffffff', border: '1.5px dashed #f59e0b', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#b45309', fontWeight: '700' }}>행동 선택</div>
              <div style={{ fontSize: '14px', color: '#b45309' }}><MathView math="a" /></div>
            </div>
            <div style={{ color: '#ef4444', fontWeight: 'bold' }}>Black-box ➔</div>
            <div onClick={() => setHighlightedNode('env')} style={{ cursor: 'pointer', padding: '10px 12px', borderRadius: '10px', backgroundColor: highlightedNode === 'env' ? '#fee2e2' : '#ffffff', border: '1.5px solid #ef4444', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#991b1b', fontWeight: '700' }}>환경 (Env)</div>
              <div style={{ fontSize: '14px', color: '#991b1b' }}><MathView math="R" /></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 2. Main Simulator Component: Integrated Robot Grid Canvas + Real Policy Gradient Learning Loop
export const ProbabilityMassSimulator = () => {
  const [probRight, setProbRight] = useState(0.5);
  const [activeStep, setActiveStep] = useState(null);
  const [activeMathTerm, setActiveMathTerm] = useState('log_prob');
  const [lineCoords, setLineCoords] = useState({ x: 150, width: 80 });

  // Policy Gradient Learning State
  const [episodeCount, setEpisodeCount] = useState(0);
  const [lastReward, setLastReward] = useState(null);
  const [lastDelta, setLastDelta] = useState(null);
  const [isAutoTraining, setIsAutoTraining] = useState(false);

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
      bgColor: '#ecfdf5',
      themeColor: '#059669',
      highlightBg: '#d1fae5',
      formula: '\\nabla_\\theta J(\\theta) \\approx \\Delta P = ' + (lastDelta !== null ? (lastDelta >= 0 ? `+${lastDelta.toFixed(3)}` : lastDelta.toFixed(3)) : '0.000'),
      valStr: lastDelta !== null ? (lastDelta >= 0 ? `ΔP = +${lastDelta.toFixed(3)}` : `ΔP = ${lastDelta.toFixed(3)}`) : 'ΔP = 0.000',
      descNode: (
        <span>
          현재 탐색 에피소드에서 계산된 최종 정책 기울기 <MathView math="\nabla_\theta J(\theta)" /> 변동량은 <strong className="num-font" style={{ color: lastDelta >= 0 ? '#059669' : '#dc2626' }}>{lastDelta !== null ? (lastDelta >= 0 ? `+${lastDelta.toFixed(3)}` : lastDelta.toFixed(3)) : '0.000'}</strong>입니다.
          {lastDelta !== null && lastDelta > 0 && <span> (높은 보상을 받아 Right 이동 확률 상승!)</span>}
          {lastDelta !== null && lastDelta < 0 && <span> (낮은 보상을 받아 Right 이동 확률 하강!)</span>}
        </span>
      ),
      mathDerivNode: (
        <span>
          경사상승법 수식 <MathView math="\theta \leftarrow \theta + \eta \nabla_\theta J(\theta)" />에 의해, 선택된 궤적의 보상 <MathView math="R(\tau)" /> 크기에 비례하여 Right 확률 파라미터가 실시간 갱신됩니다.
        </span>
      )
    },
    expectation: {
      symbol: '\\mathbb{E}_{\\tau \\sim p_\\theta(\\tau)}',
      name: '기댓값 연산자 (Expectation Operator)',
      bgColor: '#eff6ff',
      themeColor: '#2563eb',
      highlightBg: '#dbeafe',
      formula: '\\mathbb{E}_{\\tau \\sim p_\\theta(\\tau)} [X] \\implies P(\\text{Right}) = ' + probRight.toFixed(2),
      valStr: `P(Right) = ${probRight.toFixed(2)}`,
      descNode: (
        <span>
          로봇이 밟는 현재 정책의 궤적 발생 확률 밀도 기댓값입니다. 현재 <MathView math="P(\text{Right})" /> 확률은 <strong className="num-font" style={{ color: '#2563eb' }}>{probRight.toFixed(2)}</strong> 이며, <MathView math="P(\text{RR})" /> 발생 확률은 <strong className="num-font">{(pRR*100).toFixed(1)}%</strong> 입니다.
        </span>
      ),
      mathDerivNode: (
        <span>
          에피소드 샘플 탐색이 누적될수록 Monte Carlo 추정 <MathView math="\frac{1}{N} \sum R(\tau^{(i)}) \nabla_\theta \log \pi_\theta" />이 참 기대값 <MathView math="J(\theta)" /> 수렴 방향으로 안정화됩니다.
        </span>
      )
    },
    log_prob: {
      symbol: '\\nabla_\\theta \\log \\pi_\\theta(a|s)',
      name: '로그 확률 기울기 (Log-Prob Gradient)',
      bgColor: '#f5f3ff',
      themeColor: '#7c3aed',
      highlightBg: '#ede9fe',
      formula: '\\nabla_\\theta \\log \\pi_\\theta(a|s) \\implies \\text{Trajectory: } ' + (activeStep || 'START'),
      valStr: activeStep || 'START',
      descNode: (
        <span>
          로봇이 실제로 선택하여 실행한 행동 궤적은 <strong className="num-font" style={{ color: '#7c3aed' }}>{activeStep || 'START'}</strong> 입니다. 이 선택에 대한 로그 확률 미분값 <MathView math="\nabla_\theta \log \pi_\theta(a|s)" />이 가중치 갱신 방향 벡터가 됩니다.
        </span>
      ),
      mathDerivNode: (
        <span>
          로그 미분 트릭 <MathView math="\nabla_x \\log f(x) = \\frac{\\nabla_x f(x)}{f(x)}" />으로 도출되어, 미분 연산 그래프가 끊어지는 한계를 극복하고 로봇의 선택 확률을 조절합니다.
        </span>
      )
    },
    reward_weight: {
      symbol: 'R(\\tau)',
      name: '보상 스칼라 가중치 (Reward Weight)',
      bgColor: '#fffbeb',
      themeColor: '#d97706',
      highlightBg: '#fef3c7',
      formula: 'R(\\tau) = ' + (lastReward !== null ? `${lastReward}점` : '0점'),
      valStr: lastReward !== null ? `Reward = ${lastReward}점` : 'Reward = 0점',
      descNode: (
        <span>
          현재 에피소드 탐색 결과 환경이 돌려준 보상은 <strong className="num-font" style={{ color: lastReward === 10 ? '#059669' : '#d97706' }}>{lastReward !== null ? `${lastReward}점` : '0점'}</strong> 입니다.
        </span>
      ),
      mathDerivNode: (
        <span>
          보상 <MathView math="R(\tau)" />은 직접 미분되지 않고, 로그 확률 기울기 <MathView math="\nabla_\theta \log \pi_\theta" />의 크기와 방향을 팽창/축소시키는 스칼라 가중치(Weight)로 작용합니다.
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
    if (activeStep === 'RR') return { x: 87.5, y: 80 };
    return { x: 50, y: 28 };
  };

  const robotPos = getRobotPosition();

  // Policy Gradient Real Learning Step: Exploration + Automatic Gradient Update
  const runPolicyGradientStep = () => {
    // 1. Reset to START
    setActiveStep('START');

    // Sample episode trajectory based on CURRENT probRight
    const choice1 = Math.random() < probRight ? 'R' : 'L';
    const choice2 = Math.random() < probRight ? 'R' : 'L';
    const finalTraj = choice1 + choice2;

    // Determine reward R(tau)
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

      // Policy Gradient Update: ΔP ∝ ∇ log π(a|s) * (R - Baseline)
      // Baseline = 2.0 (Average baseline for variance reduction)
      const baseline = 2.0;
      const advantage = reward - baseline;
      const lr = 0.05; // Learning Rate

      // Count number of 'R' actions in trajectory
      const countR = (choice1 === 'R' ? 1 : 0) + (choice2 === 'R' ? 1 : 0);
      let deltaP = 0;

      if (advantage > 0) {
        // Positive advantage -> Increase probability of chosen action 'R'
        deltaP = countR * lr * (advantage / 8.0);
      } else {
        // Negative or zero advantage -> Decrease probability of chosen action 'R'
        deltaP = -((2 - countR) * lr * 0.5);
      }

      setLastDelta(deltaP);

      // Update probRight state (bounded in [0.05, 0.95])
      setProbRight((prevProb) => {
        const nextProb = Math.min(0.95, Math.max(0.05, prevProb + deltaP));
        return nextProb;
      });
    }, 900);
  };

  // Reset training episode & policy
  const resetTraining = () => {
    setProbRight(0.5);
    setEpisodeCount(0);
    setLastReward(null);
    setLastDelta(null);
    setActiveStep(null);
  };

  return (
    <div style={{
      width: '100%',
      padding: '20px',
      borderRadius: '16px',
      backgroundColor: '#ffffff',
      border: '1px solid #cbd5e1',
      boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* 1. 상단 타이틀 및 스코어 & 에피소드 카운터 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="gmarket-font" style={{ fontSize: '14.5px', fontWeight: '700', color: '#0f172a' }}>
            로봇 자율 탐색 & Policy Gradient 정책 자동 학습기
          </span>
          <span className="num-font" style={{ fontSize: '12px', fontWeight: '800', color: '#6d28d9', backgroundColor: '#f5f3ff', padding: '3px 10px', borderRadius: '6px', border: '1px solid #ddd6fe' }}>
            Episode #{episodeCount}
          </span>
        </div>

        <span style={{ fontSize: '13px', fontWeight: '800', color: '#059669', backgroundColor: '#ecfdf5', padding: '4px 12px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
          기대 보상 <MathView math="J(\theta)" /> = <span className="num-font" style={{ fontStyle: 'normal' }}>{expectedReturn.toFixed(2)}</span> 점
        </span>
      </div>

      {/* 2. 로봇 탐색 그리드 캔버스 */}
      <div style={{
        position: 'relative',
        height: '210px',
        width: '100%',
        backgroundColor: '#f8fafc',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <line x1="50%" y1="22%" x2="25%" y2="48%" stroke={probLeft > 0.5 ? '#3b82f6' : '#cbd5e1'} strokeWidth={probLeft * 5 + 1} />
          <line x1="50%" y1="22%" x2="75%" y2="48%" stroke={probRight > 0.5 ? '#3b82f6' : '#cbd5e1'} strokeWidth={probRight * 5 + 1} />
          
          <line x1="25%" y1="48%" x2="12.5%" y2="82%" stroke="#cbd5e1" strokeWidth={probLeft * 3 + 1} />
          <line x1="25%" y1="48%" x2="37.5%" y2="82%" stroke="#cbd5e1" strokeWidth={probRight * 3 + 1} />

          <line x1="75%" y1="48%" x2="62.5%" y2="82%" stroke="#cbd5e1" strokeWidth={probLeft * 3 + 1} />
          <line x1="75%" y1="48%" x2="87.5%" y2="82%" stroke="#10b981" strokeWidth={probRight * 4 + 1} />
        </svg>

        <div style={{ position: 'absolute', top: '12%', left: '50%', transform: 'translate(-50%, -50%)', padding: '4px 10px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #94a3b8', fontSize: '11px', fontWeight: '700', color: '#475569' }}>
          START
        </div>

        <div style={{ position: 'absolute', top: '48%', left: '25%', transform: 'translate(-50%, -50%)', padding: '4px 10px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #94a3b8', fontSize: '11px', fontWeight: '700', color: '#475569' }}>
          Left ({(probLeft*100).toFixed(0)}%)
        </div>
        <div style={{ position: 'absolute', top: '48%', left: '75%', transform: 'translate(-50%, -50%)', padding: '4px 10px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #94a3b8', fontSize: '11px', fontWeight: '700', color: '#475569' }}>
          Right ({(probRight*100).toFixed(0)}%)
        </div>

        <div style={{ position: 'absolute', top: '84%', left: '12.5%', transform: 'translate(-50%, -50%)', padding: '4px 8px', borderRadius: '8px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', fontSize: '11px', textAlign: 'center' }}>
          LL: <strong>0점</strong>
        </div>
        <div style={{ position: 'absolute', top: '84%', left: '37.5%', transform: 'translate(-50%, -50%)', padding: '4px 8px', borderRadius: '8px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', fontSize: '11px', textAlign: 'center' }}>
          LR: <strong>1점</strong>
        </div>
        <div style={{ position: 'absolute', top: '84%', left: '62.5%', transform: 'translate(-50%, -50%)', padding: '4px 8px', borderRadius: '8px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', fontSize: '11px', textAlign: 'center' }}>
          RL: <strong>1점</strong>
        </div>
        <div style={{ position: 'absolute', top: '84%', left: '87.5%', transform: 'translate(-50%, -50%)', padding: '4px 8px', borderRadius: '8px', backgroundColor: '#ecfdf5', border: '1.5px solid #10b981', fontSize: '11px', textAlign: 'center', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)' }}>
          <strong style={{ color: '#047857' }}>RR: 10점</strong>
        </div>

        <motion.div
          animate={{ left: `${robotPos.x}%`, top: `${robotPos.y}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          style={{
            position: 'absolute',
            width: '38px',
            height: '38px',
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
              border: '2px solid #3b82f6',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
              objectFit: 'cover'
            }} 
          />
        </motion.div>
      </div>

      {/* 3. 정책 자동 학습 제어 패널 & 실시간 Gradient 갱신 상태 */}
      <div style={{ backgroundColor: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>
            Right 선택 정책 확률 <MathView math="P(\text{Right})" />: <strong className="num-font" style={{ color: '#2563eb', fontSize: '14px', fontStyle: 'normal' }}>{probRight.toFixed(2)}</strong>
            {lastDelta !== null && (
              <span className="num-font" style={{ fontSize: '12px', marginLeft: '8px', color: lastDelta >= 0 ? '#059669' : '#dc2626', fontWeight: 'bold' }}>
                ({lastDelta >= 0 ? `+${lastDelta.toFixed(3)}` : lastDelta.toFixed(3)})
              </span>
            )}
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={runPolicyGradientStep}
              className="gmarket-font"
              style={{
                padding: '7px 14px',
                fontSize: '12.5px',
                fontWeight: '700',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)'
              }}
            >
              1회 탐색 & Policy Gradient 학습 실행
            </button>
            <button
              onClick={resetTraining}
              className="gmarket-font"
              style={{
                padding: '7px 12px',
                fontSize: '12px',
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
          </div>
        </div>

        {/* 수동 조정도 가능한 슬라이더 (학습 결과 관찰) */}
        <input
          type="range"
          min="0.05"
          max="0.95"
          step="0.01"
          value={probRight}
          onChange={(e) => setProbRight(parseFloat(e.target.value))}
          style={{ width: '100%', cursor: 'pointer', accentColor: '#2563eb' }}
        />

        {lastReward !== null && (
          <div style={{ fontSize: '12px', color: '#475569', backgroundColor: '#ffffff', padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between' }}>
            <span>마지막 탐색 보상: <strong className="num-font" style={{ color: lastReward === 10 ? '#059669' : '#d97706' }}>{lastReward}점</strong></span>
            <span>정책 기울기 갱신: <strong className="num-font" style={{ color: lastDelta >= 0 ? '#059669' : '#dc2626' }}>{lastDelta >= 0 ? '확률 상승 (▲)' : '확률 하강 (▼)'}</strong></span>
          </div>
        )}
      </div>

      {/* 4. Trajectory 확률 및 보상 카드 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
        {[
          { traj: '\\text{LL (Left-Left)}', p: pLL, r: rLL, bg: '#f1f5f9', border: '#cbd5e1', color: '#475569' },
          { traj: '\\text{LR (Left-Right)}', p: pLR, r: rLR, bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
          { traj: '\\text{RL (Right-Left)}', p: pRL, r: rRL, bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
          { traj: '\\text{RR (Right-Right)}', p: pRR, r: rRR, bg: '#ecfdf5', border: '#6ee7b7', color: '#047857' }
        ].map((item, idx) => (
          <div key={idx} style={{
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: activeStep === ['LL', 'LR', 'RL', 'RR'][idx] ? '#fef3c7' : item.bg,
            border: activeStep === ['LL', 'LR', 'RL', 'RR'][idx] ? '2px solid #f59e0b' : `1.5px solid ${item.border}`,
            textAlign: 'center',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: item.color, marginBottom: '4px' }}>
              <MathView math={item.traj} />
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b' }}>보상: <strong><span className="num-font">{item.r}</span>점</strong></div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: item.color, marginTop: '4px' }} className="num-font">
              {(item.p * 100).toFixed(1)}%
            </div>
            <div style={{ height: '5px', width: '100%', backgroundColor: '#e2e8f0', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${item.p * 100}%`, backgroundColor: item.r === 10 ? '#10b981' : '#3b82f6' }} />
            </div>
          </div>
        ))}
      </div>

      {/* 5. 수식 자체 내 직접 클릭 가능한 형광펜 하이라이트 & 실시간 연결선 분석기 */}
      <div 
        ref={containerRef}
        style={{
          position: 'relative',
          marginTop: '8px',
          padding: '16px',
          backgroundColor: '#f8fafc',
          borderRadius: '14px',
          border: '1px solid #cbd5e1',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a' }}>
          Policy Gradient 수식 직접 터치 / 형광펜 항 분석기
        </div>

        {/* 수식 문자열 내부의 각 항이 직접 클릭 가능한 형광펜 하이라이트 블록 */}
        <div style={{
          fontSize: '15px',
          color: '#0f172a',
          overflowX: 'auto',
          width: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'nowrap',
          gap: '4px',
          backgroundColor: '#ffffff',
          padding: '16px 14px',
          borderRadius: '12px',
          border: '1.5px solid #cbd5e1',
          WebkitOverflowScrolling: 'touch',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          {/* 항 1: \nabla_\theta J(\theta) */}
          <div
            ref={termRefs.grad_j}
            onClick={() => setActiveMathTerm('grad_j')}
            style={{
              padding: '4px 8px',
              borderRadius: '8px',
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
              borderRadius: '8px',
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
              borderRadius: '8px',
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
              borderRadius: '8px',
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

        {/* 클릭한 바로 그 수식 위치 X좌표로부터 하단 카드로 떨어지는 수직 동적 SVG 연결선 */}
        <div style={{ position: 'relative', width: '100%', height: '22px', marginTop: '-4px' }}>
          <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <line
              x1={lineCoords.x}
              y1="0"
              x2={lineCoords.x}
              y2="22"
              stroke={activeTermInfo.themeColor}
              strokeWidth="2.5"
              strokeDasharray="4 3"
            />
            <circle
              cx={lineCoords.x}
              cy="22"
              r="4"
              fill={activeTermInfo.themeColor}
            />
          </svg>
        </div>

        {/* 선택된 수식 위치의 하단 분석 카드 (수식과 형광펜-선 1:1 직결) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMathTerm}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            style={{
              padding: '14px',
              backgroundColor: activeTermInfo.bgColor,
              borderRadius: '14px',
              border: `2px solid ${activeTermInfo.themeColor}`,
              boxShadow: `0 4px 14px ${activeTermInfo.themeColor}20`,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{
              fontSize: '13px',
              fontWeight: '700',
              color: activeTermInfo.themeColor,
              backgroundColor: '#ffffff',
              padding: '8px 12px',
              borderRadius: '8px',
              border: `1px solid ${activeTermInfo.themeColor}30`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              overflowX: 'auto'
            }}>
              <span>클릭된 항 수식: <MathView math={activeTermInfo.formula} /></span>
              <span className="num-font" style={{ fontSize: '12px', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', color: '#334155' }}>
                {activeTermInfo.valStr}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '10px 12px', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                <span className="gmarket-font" style={{ fontSize: '12px', fontWeight: '700', color: activeTermInfo.themeColor, display: 'block', marginBottom: '4px' }}>
                  항의 의미 : {activeTermInfo.name}
                </span>
                <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: '1.6' }}>
                  {activeTermInfo.descNode}
                </div>
              </div>

              <div style={{ padding: '10px 12px', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                <span className="gmarket-font" style={{ fontSize: '12px', fontWeight: '700', color: '#059669', display: 'block', marginBottom: '4px' }}>
                  수식 유도 및 미분 원리
                </span>
                <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: '1.6' }}>
                  {activeTermInfo.mathDerivNode}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
