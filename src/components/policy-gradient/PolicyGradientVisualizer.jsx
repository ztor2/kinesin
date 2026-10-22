import React, { useState, useRef, useEffect, useCallback } from 'react';
import katex from 'katex';
import { motion, AnimatePresence } from 'framer-motion';
import chiikawaStudyImg from '../../assets/policy-gradient/chiikawa_study_avatar.png';
import chiikawaHappyImg from '../../assets/policy-gradient/chiikawa_happy_avatar.png';
import chiikawaSadImg from '../../assets/policy-gradient/chiikawa_sad_avatar.png';

// KaTeX 수학 수식 HTML 렌더링 헬퍼 컴포넌트
const MathView = ({ math, style }) => {
  const html = katex.renderToString(math, { throwOnError: false });
  return <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '1.05em', ...style }} dangerouslySetInnerHTML={{ __html: html }} />;
};

// 1. Interactive Component 1: Computational Graph Guard
export const GraphComparisonVisualizer = ({ lang = 'en' }) => {
  const [selectedType, setSelectedType] = useState('supervised');
  const [highlightedNode, setHighlightedNode] = useState(null);

  const t = lang === 'ko' ? {
    title: '계산 그래프(Computational Graph) & 기울기 전파 비교',
    supervised: '지도학습 (Supervised)',
    rl: '강화학습 (RL)',
    param: '파라미터',
    model: '신경망 모델',
    pred: '예측값',
    loss: '손실함수',
    policyParam: '정책 파라미터',
    policyNet: '정책 신경망',
    action: '행동 선택',
    env: '환경 (Env)'
  } : {
    title: 'Computational Graph & Gradient Flow Comparison',
    supervised: 'Supervised Learning',
    rl: 'Reinforcement Learning',
    param: 'Parameters',
    model: 'Model Network',
    pred: 'Prediction',
    loss: 'Loss Function',
    policyParam: 'Policy Param',
    policyNet: 'Policy Network',
    action: 'Action Sampling',
    env: 'Environment (Env)'
  };

  return (
    <div className="gc-visualizer-container" style={{
      width: '100%',
      backgroundColor: '#fbf9f5',
      border: '1px solid #e8e4dc',
      boxShadow: '0 16px 36px -12px rgba(68, 64, 60, 0.08), 0 0 1px 1px rgba(68, 64, 60, 0.03)',
      boxSizing: 'border-box'
    }}>
      <style>{`
        .gc-visualizer-container {
          padding: 24px;
          border-radius: 10px;
        }
        @media (max-width: 640px) {
          .gc-visualizer-container {
            padding: 16px 12px !important;
            border-radius: 14px !important;
          }
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <span className="gmarket-font" style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
          {t.title}
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
            {t.supervised}
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
            {t.rl}
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
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>{t.param}</div>
              <div style={{ fontSize: '16px', color: '#1d4ed8' }}><MathView math="\theta" /></div>
            </div>
            <div style={{ color: '#3b82f6', fontWeight: 'bold' }}>➔</div>
            <div onClick={() => setHighlightedNode('model')} style={{ cursor: 'pointer', padding: '12px 16px', borderRadius: '12px', backgroundColor: highlightedNode === 'model' ? '#dbeafe' : '#ffffff', border: '1.5px solid #3b82f6', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>{t.model}</div>
              <div style={{ fontSize: '15px', color: '#1d4ed8' }}><MathView math="f_\theta(x)" /></div>
            </div>
            <div style={{ color: '#3b82f6', fontWeight: 'bold' }}>➔</div>
            <div onClick={() => setHighlightedNode('pred')} style={{ cursor: 'pointer', padding: '12px 16px', borderRadius: '12px', backgroundColor: highlightedNode === 'pred' ? '#dbeafe' : '#ffffff', border: '1.5px solid #3b82f6', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>{t.pred}</div>
              <div style={{ fontSize: '15px', color: '#1d4ed8' }}><MathView math="\hat{y}" /></div>
            </div>
            <div style={{ color: '#3b82f6', fontWeight: 'bold' }}>➔</div>
            <div onClick={() => setHighlightedNode('loss')} style={{ cursor: 'pointer', padding: '12px 16px', borderRadius: '12px', backgroundColor: highlightedNode === 'loss' ? '#fee2e2' : '#ffffff', border: '1.5px solid #ef4444', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>{t.loss}</div>
              <div style={{ fontSize: '15px', color: '#b91c1c' }}><MathView math="L" /></div>
            </div>
          </div>
        ) : (
          <div style={{ minWidth: '560px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
            <div onClick={() => setHighlightedNode('param')} style={{ cursor: 'pointer', padding: '12px 14px', borderRadius: '12px', backgroundColor: highlightedNode === 'param' ? '#d1fae5' : '#ffffff', border: '1.5px solid #10b981', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>{t.policyParam}</div>
              <div style={{ fontSize: '15px', color: '#047857' }}><MathView math="\theta" /></div>
            </div>
            <div style={{ color: '#10b981', fontWeight: 'bold' }}>➔</div>
            <div onClick={() => setHighlightedNode('policy')} style={{ cursor: 'pointer', padding: '12px 14px', borderRadius: '12px', backgroundColor: highlightedNode === 'policy' ? '#d1fae5' : '#ffffff', border: '1.5px solid #10b981', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>{t.policyNet}</div>
              <div style={{ fontSize: '14.5px', color: '#047857' }}><MathView math="\pi_\theta(a|s)" /></div>
            </div>
            <div style={{ color: '#f59e0b', fontWeight: 'bold' }}>Sampling ➔</div>
            <div onClick={() => setHighlightedNode('action')} style={{ cursor: 'pointer', padding: '12px 14px', borderRadius: '12px', backgroundColor: highlightedNode === 'action' ? '#fef3c7' : '#ffffff', border: '1.5px dashed #f59e0b', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#b45309', fontWeight: '700' }}>{t.action}</div>
              <div style={{ fontSize: '15px', color: '#b45309' }}><MathView math="a" /></div>
            </div>
            <div style={{ color: '#ef4444', fontWeight: 'bold' }}>Black-box ➔</div>
            <div onClick={() => setHighlightedNode('env')} style={{ cursor: 'pointer', padding: '12px 14px', borderRadius: '12px', backgroundColor: highlightedNode === 'env' ? '#fee2e2' : '#ffffff', border: '1.5px solid #ef4444', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#991b1b', fontWeight: '700' }}>{t.env}</div>
              <div style={{ fontSize: '15px', color: '#991b1b' }}><MathView math="R" /></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 2. Main Simulator Component: Clean, De-cluttered & Expanded Nodes
export const ProbabilityMassSimulator = ({ lang = 'en' }) => {
  const [probRight, setProbRight] = useState(0.5);
  const [activeStep, setActiveStep] = useState(null);
  const [activeMathTerm, setActiveMathTerm] = useState('log_prob');
  const formulaScrollRef = useRef(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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
  const rRR = 5;

  const expectedReturn = pLL * rLL + pLR * rLR + pRL * rRL + pRR * rRR;

  // Step term breakdown configuration with REAL-TIME Episode Gradient Value Sync
  const mathTerms = lang === 'ko' ? {
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
          계산된 정책 기울기 <MathView math="\nabla_\theta J(\theta)" /> 변동량은 <MathView math={`\\Delta P = ${lastDelta !== null ? (lastDelta >= 0 ? `+${lastDelta.toFixed(3)}` : lastDelta.toFixed(3)) : '0.000'}`} style={{ color: lastDelta >= 0 ? '#059669' : '#dc2626', fontWeight: 'bold' }} />입니다.
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
          현재 정책의 Right 선택 확률은 <MathView math={`P(\\text{Right}) = ${probRight.toFixed(2)}`} style={{ color: '#2563eb', fontWeight: 'bold' }} /> 이며, <MathView math="P(\text{RR})" /> 궤적 발생 확률은 <MathView math={`${(pRR*100).toFixed(1)}\\%`} style={{ fontWeight: 'bold' }} /> 입니다.
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
          로봇이 선택한 행동 궤적은 <MathView math={`\\tau = \\text{${activeStep || 'START'}}`} style={{ color: '#7c3aed', fontWeight: 'bold' }} /> 입니다. 로그 미분 트릭 <MathView math="\nabla \log \pi = \frac{\nabla \pi}{\pi}" />을 통해 가중치 업데이트 방향을 제공합니다.
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
          환경이 돌려준 보상은 <MathView math={`R = ${lastReward !== null ? lastReward : 0}`} style={{ color: lastReward === 5 ? '#059669' : '#d97706', fontWeight: 'bold' }} />점 입니다. 보상 크기에 따라 기울기 업데이트의 가중치가 조율됩니다.
        </span>
      )
    }
  } : {
    grad_j: {
      symbol: '\\nabla_\\theta J(\\theta)',
      name: 'Expected Return Gradient',
      bgColor: '#f0fdf4',
      themeColor: '#059669',
      highlightBg: '#d1fae5',
      formula: '\\nabla_\\theta J(\\theta) \\approx \\Delta P = ' + (lastDelta !== null ? (lastDelta >= 0 ? `+${lastDelta.toFixed(3)}` : lastDelta.toFixed(3)) : '0.000'),
      valStr: lastDelta !== null ? (lastDelta >= 0 ? `ΔP = +${lastDelta.toFixed(3)}` : `ΔP = ${lastDelta.toFixed(3)}`) : 'ΔP = 0.000',
      descNode: (
        <span>
          Estimated policy gradient step <MathView math="\nabla_\theta J(\theta)" /> is <MathView math={`\\Delta P = ${lastDelta !== null ? (lastDelta >= 0 ? `+${lastDelta.toFixed(3)}` : lastDelta.toFixed(3)) : '0.000'}`} style={{ color: lastDelta >= 0 ? '#059669' : '#dc2626', fontWeight: 'bold' }} />.
          {lastDelta !== null && lastDelta > 0 && <span> (Reinforced rightward branch from high reward)</span>}
          {lastDelta !== null && lastDelta < 0 && <span> (Suppressed rightward branch from sub-baseline return)</span>}
        </span>
      )
    },
    expectation: {
      symbol: '\\mathbb{E}_{\\tau \\sim p_\\theta(\\tau)}',
      name: 'Expectation Operator',
      bgColor: '#eff6ff',
      themeColor: '#2563eb',
      highlightBg: '#dbeafe',
      formula: '\\mathbb{E}_{\\tau} [X] \\implies P(\\text{Right}) = ' + probRight.toFixed(2),
      valStr: `P(Right) = ${probRight.toFixed(2)}`,
      descNode: (
        <span>
          Current probability of choosing Right is <MathView math={`P(\\text{Right}) = ${probRight.toFixed(2)}`} style={{ color: '#2563eb', fontWeight: 'bold' }} />, with trajectory <MathView math="P(\text{RR})" /> probability at <MathView math={`${(pRR*100).toFixed(1)}\\%`} style={{ fontWeight: 'bold' }} />.
        </span>
      )
    },
    log_prob: {
      symbol: '\\nabla_\\theta \\log \\pi_\\theta(a|s)',
      name: 'Log-Probability Gradient',
      bgColor: '#f5f3ff',
      themeColor: '#7c3aed',
      highlightBg: '#ede9fe',
      formula: '\\nabla_\\theta \\log \\pi_\\theta(a|s) \\implies \\text{Trajectory: } ' + (activeStep || 'START'),
      valStr: activeStep || 'START',
      descNode: (
        <span>
          Sampled trajectory is <MathView math={`\\tau = \\text{${activeStep || 'START'}}`} style={{ color: '#7c3aed', fontWeight: 'bold' }} />. The log-derivative trick <MathView math="\nabla \log \pi = \frac{\nabla \pi}{\pi}" /> guides the weight update direction.
        </span>
      )
    },
    reward_weight: {
      symbol: 'R(\\tau)',
      name: 'Reward Weight',
      bgColor: '#fffbeb',
      themeColor: '#d97706',
      highlightBg: '#fef3c7',
      formula: 'R(\\tau) = ' + (lastReward !== null ? `${lastReward} pts` : '0 pts'),
      valStr: lastReward !== null ? `Reward = ${lastReward} pts` : 'Reward = 0 pts',
      descNode: (
        <span>
          Returned environmental reward is <MathView math={`R = ${lastReward !== null ? lastReward : 0}`} style={{ color: lastReward === 5 ? '#059669' : '#d97706', fontWeight: 'bold' }} /> pts, scaling the magnitude and sign of the gradient ascent step.
        </span>
      )
    }
  };

  const activeTermInfo = mathTerms[activeMathTerm];

  const selectMathTerm = (termKey) => {
    setActiveMathTerm(termKey);
    setIsDetailOpen(true);
    const termEl = termRefs[termKey]?.current;
    if (termEl) {
      termEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const isAutoPlayingRef = useRef(isAutoPlaying);

  useEffect(() => {
    isAutoPlayingRef.current = isAutoPlaying;
  }, [isAutoPlaying]);

  // Compute 2D robot position perfectly aligned with node centers
  const getRobotPosition = () => {
    if (!activeStep || activeStep === 'START') return { x: 50, y: 14 };
    if (activeStep === 'L') return { x: 25, y: 48 };
    if (activeStep === 'R') return { x: 75, y: 48 };
    if (activeStep === 'LL') return { x: 12.5, y: 84 };
    if (activeStep === 'LR') return { x: 37.5, y: 84 };
    if (activeStep === 'RL') return { x: 62.5, y: 84 };
    if (activeStep === 'RR') return { x: 87.5, y: 84 };
    return { x: 50, y: 14 };
  };

  const robotPos = getRobotPosition();

  // Dynamic Chiikawa avatar expression based on exploration & reward state
  const getAvatarSrc = () => {
    if (activeStep === 'LL') return chiikawaSadImg.src || chiikawaSadImg;
    if (activeStep === 'RR') return chiikawaHappyImg.src || chiikawaHappyImg;
    return chiikawaStudyImg.src || chiikawaStudyImg;
  };

  const MAX_AUTO_EPISODES = 20;

  // Policy Gradient Real Learning Step: Exploration + Automatic Gradient Update
  const runPolicyGradientStep = () => {
    // Check episode limit
    if (episodeCount >= MAX_AUTO_EPISODES) {
      setIsAutoPlaying(false);
      return;
    }

    // 1. Reset to START
    setActiveStep('START');

    const choice1 = Math.random() < probRight ? 'R' : 'L';
    const choice2 = Math.random() < probRight ? 'R' : 'L';
    const finalTraj = choice1 + choice2;

    let reward = 0;
    if (finalTraj === 'RR') reward = 5;
    else if (finalTraj === 'LR' || finalTraj === 'RL') reward = 1;
    else reward = 0;

    // 2. Move to 1-Step
    setTimeout(() => {
      setActiveStep(choice1);
    }, 400);

    // 3. Move to 2-Step & Perform Policy Update
    setTimeout(() => {
      setActiveStep(finalTraj);
      setEpisodeCount((prev) => {
        const nextCount = prev + 1;
        if (nextCount >= MAX_AUTO_EPISODES) {
          setIsAutoPlaying(false);
        }
        return nextCount;
      });
      setLastReward(reward);

      // Advantage using current REAL-TIME Baseline b (via baselineRef.current)
      const currentBaseline = baselineRef.current;
      const advantage = reward - currentBaseline;
      
      // Tuned Learning Rate to ensure smooth, realistic incremental updates
      const lr = 0.018;

      // True Policy Gradient Score Function:
      const gradStep1 = choice1 === 'R' ? (1 - probRight) : (-probRight);
      const gradStep2 = choice2 === 'R' ? (1 - probRight) : (-probRight);
      const gradTotal = gradStep1 + gradStep2;

      // Pure Policy Gradient Update: ΔP_reward = lr * Advantage * gradTotal
      const deltaP_reward = lr * advantage * gradTotal;

      // KL Divergence Penalty Gradient w.r.t Reference Policy P_ref = 0.5:
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
    }, 950);
  };

  // Continuous Auto-play loop with max limit protection
  useEffect(() => {
    let intervalId = null;
    if (isAutoPlaying) {
      if (episodeCount >= MAX_AUTO_EPISODES) {
        setIsAutoPlaying(false);
        return;
      }
      runPolicyGradientStep();
      intervalId = setInterval(() => {
        setEpisodeCount((curr) => {
          if (curr >= MAX_AUTO_EPISODES) {
            setIsAutoPlaying(false);
            if (intervalId) clearInterval(intervalId);
            return curr;
          }
          return curr;
        });
        runPolicyGradientStep();
      }, 1600);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAutoPlaying]);

  // Reset training episode & policy
  const resetTraining = () => {
    setIsAutoPlaying(false);
    setProbRight(0.5);
    setBaseline(2.0);
    setEpisodeCount(0);
    setLastReward(null);
    setLastDelta(null);
    setActiveStep(null);
  };

  const ui = lang === 'ko' ? {
    title: 'Policy Gradient 시뮬레이터',
    reset: '초기화',
    stopAuto: '❚❚ 자동 학습 정지',
    startAuto: '▶ 자동 연속 학습',
    stepOnce: '1회 탐색 & 학습 실행',
    unit: '점',
    baselineLabel: '기대보상',
    klLabel: 'KL 페널티',
    processTitle: 'Policy Gradient 실시간 수식',
    toggleOpen: '상세 설명 ▾',
    toggleClose: '설명 접기 ▴'
  } : {
    title: 'Policy Gradient Simulator',
    reset: 'Reset',
    stopAuto: '❚❚ Pause Auto',
    startAuto: '▶ Auto Run (20x)',
    stepOnce: 'Step Once',
    unit: ' pts',
    baselineLabel: 'Baseline',
    klLabel: 'KL Penalty',
    processTitle: 'Live Policy Gradient Formula',
    toggleOpen: 'Term Details ▾',
    toggleClose: 'Hide Details ▴'
  };

  return (
    <div className="pg-simulator-container" style={{
      width: '100%',
      backgroundColor: '#fbf9f5',
      border: '1px solid #e8e4dc',
      boxShadow: '0 16px 36px -12px rgba(68, 64, 60, 0.08), 0 0 1px 1px rgba(68, 64, 60, 0.03)',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '"Plus Jakarta Sans", "Noto Sans KR", -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <style>{`
        .pg-simulator-container {
          padding: 24px;
          border-radius: 10px;
          gap: 22px;
        }
        .pg-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
        }
        .pg-header-btns {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }
        .pg-sliders-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          background-color: #f8fafc;
          padding: 16px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }
        .pg-traj-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        .pg-canvas-scroll-wrapper {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          background-color: #f8fafc;
        }
        .pg-canvas-inner {
          position: relative;
          height: 240px;
          min-width: 460px;
          width: 100%;
        }
        .pg-formula-scroll-wrapper {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          background-color: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-sizing: border-box;
          padding: 10px 0;
        }
        .pg-formula-row {
          font-size: 15.5px;
          color: #0f172a;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-wrap: nowrap;
          gap: 6px;
          width: max-content;
          min-width: 100%;
          margin: 0;
          padding: 4px 20px;
          box-sizing: border-box;
        }
        .pg-term-details-btn {
          color: #64748b;
          transition: color 0.15s ease;
        }
        .pg-term-details-btn:hover {
          color: #2563eb !important;
        }

        @media (max-width: 640px) {
          .pg-simulator-container {
            padding: 16px 12px !important;
            border-radius: 14px !important;
            gap: 18px !important;
          }
          .pg-header-row {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .pg-header-btns {
            width: 100% !important;
            display: grid !important;
            grid-template-columns: 1fr 1.3fr 1.4fr !important;
            gap: 6px !important;
          }
          .pg-header-btns button {
            padding: 7px 4px !important;
            font-size: 11.5px !important;
            justify-content: center !important;
            text-align: center !important;
          }
          .pg-sliders-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
            padding: 12px !important;
          }
          .pg-traj-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
          }
          .pg-formula-scroll-wrapper {
            padding: 8px 0 !important;
          }
          .pg-formula-row {
            font-size: 14px !important;
            justify-content: flex-start !important;
            padding: 4px 28px 4px 16px !important;
          }
        }
      `}</style>

      {/* 1. 컴포넌트 헤더 영역 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
        <div className="pg-header-row">
          {/* 좌측 세로형 컬러 바 + 메인 타이틀 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '6px', height: '22px', borderRadius: '5px', background: 'linear-gradient(180deg, #10b981, #059669)', flexShrink: 0 }} />
            <h3 className="gmarket-font" style={{ margin: 0, fontSize: '16.5px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.02em' }}>
              {ui.title}
            </h3>
          </div>

          {/* 우측 컨트롤 버튼 그룹 [초기화] -> [자동 연속 학습] -> [1회 탐색] */}
          <div className="pg-header-btns">
            <button
              onClick={resetTraining}
              className="gmarket-font"
              style={{
                padding: '7px 12px',
                fontSize: '12.5px',
                fontWeight: '700',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#64748b',
                cursor: 'pointer'
              }}
            >
              {ui.reset}
            </button>
            <button
              onClick={() => {
                if (episodeCount >= MAX_AUTO_EPISODES) {
                  setEpisodeCount(0);
                }
                setIsAutoPlaying((prev) => !prev);
              }}
              className="gmarket-font"
              style={{
                padding: '7px 14px',
                fontSize: '12.5px',
                fontWeight: '700',
                borderRadius: '8px',
                border: isAutoPlaying ? '1.5px solid #ef4444' : '1.5px solid #10b981',
                backgroundColor: isAutoPlaying ? '#fef2f2' : '#ecfdf5',
                color: isAutoPlaying ? '#dc2626' : '#047857',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              {isAutoPlaying ? ui.stopAuto : ui.startAuto}
            </button>
            <button
              onClick={() => { setIsAutoPlaying(false); runPolicyGradientStep(); }}
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
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
              }}
            >
              {ui.stepOnce}
            </button>
          </div>
        </div>
      </div>

      {/* 2. 2D 로봇 탐색 다이어그램 캔버스 (가로 스크롤 보호 래퍼) */}
      <div className="pg-canvas-scroll-wrapper">
        <div className="pg-canvas-inner">
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <line x1="50%" y1="14%" x2="25%" y2="48%" stroke={probLeft > 0.5 ? '#3b82f6' : '#cbd5e1'} strokeWidth={probLeft * 6 + 1.5} />
            <line x1="50%" y1="14%" x2="75%" y2="48%" stroke={probRight > 0.5 ? '#3b82f6' : '#cbd5e1'} strokeWidth={probRight * 6 + 1.5} />
            
            <line x1="25%" y1="48%" x2="12.5%" y2="84%" stroke="#cbd5e1" strokeWidth={probLeft * 4 + 1} />
            <line x1="25%" y1="48%" x2="37.5%" y2="84%" stroke="#cbd5e1" strokeWidth={probRight * 4 + 1} />

            <line x1="75%" y1="48%" x2="62.5%" y2="84%" stroke="#cbd5e1" strokeWidth={probLeft * 4 + 1} />
            <line x1="75%" y1="48%" x2="87.5%" y2="84%" stroke="#10b981" strokeWidth={probRight * 5 + 1.5} />
          </svg>

          {/* 다이어그램 우측 상단 에피소드 카운터 */}
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '14px',
            fontSize: '12px',
            fontWeight: '700',
            color: '#6d28d9',
            zIndex: 5
          }}>
            Episode <strong style={{ color: '#6d28d9', fontSize: '13px', fontVariantNumeric: 'tabular-nums' }}>#{episodeCount}</strong>
          </div>

          {/* 1. START 노드 */}
          <div style={{
            position: 'absolute',
            top: '14%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '6px 14px',
            borderRadius: '10px',
            backgroundColor: activeStep === 'START' ? '#dbeafe' : '#ffffff',
            border: activeStep === 'START' ? '2px solid #2563eb' : '1.5px solid #64748b',
            fontSize: '12px',
            fontWeight: '700',
            color: '#1e293b',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            transition: 'all 0.2s ease'
          }}>
            START
          </div>

          {/* 2. 1-Step 노드들 */}
          <div style={{
            position: 'absolute',
            top: '48%',
            left: '25%',
            transform: 'translate(-50%, -50%)',
            padding: '6px 14px',
            borderRadius: '10px',
            backgroundColor: activeStep === 'L' ? '#dbeafe' : '#ffffff',
            border: activeStep === 'L' ? '2px solid #2563eb' : '1.5px solid #64748b',
            fontSize: '12px',
            fontWeight: '700',
            color: '#1e293b',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            transition: 'all 0.2s ease'
          }}>
            Left ({(probLeft*100).toFixed(0)}%)
          </div>
          <div style={{
            position: 'absolute',
            top: '48%',
            left: '75%',
            transform: 'translate(-50%, -50%)',
            padding: '6px 14px',
            borderRadius: '10px',
            backgroundColor: activeStep === 'R' ? '#dbeafe' : '#ffffff',
            border: activeStep === 'R' ? '2px solid #2563eb' : '1.5px solid #64748b',
            fontSize: '12px',
            fontWeight: '700',
            color: '#1e293b',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            transition: 'all 0.2s ease'
          }}>
            Right ({(probRight*100).toFixed(0)}%)
          </div>

        {/* 3. 2-Step 노드들 */}
        <div style={{
          position: 'absolute',
          top: '84%',
          left: '12.5%',
          transform: 'translate(-50%, -50%)',
          padding: '6px 12px',
          borderRadius: '10px',
          backgroundColor: activeStep === 'LL' ? '#fee2e2' : '#ffffff',
          border: activeStep === 'LL' ? '2px solid #ef4444' : '1.5px solid #cbd5e1',
          fontSize: '12px',
          textAlign: 'center',
          color: '#475569',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '3px'
        }}>
          <MathView math="\text{LL: } 0" style={{ fontSize: '12.5px' }} />
          <span style={{ fontSize: '11px', color: '#64748b' }}>{ui.unit.trim()}</span>
        </div>
        <div style={{
          position: 'absolute',
          top: '84%',
          left: '37.5%',
          transform: 'translate(-50%, -50%)',
          padding: '6px 12px',
          borderRadius: '10px',
          backgroundColor: activeStep === 'LR' ? '#dbeafe' : '#ffffff',
          border: activeStep === 'LR' ? '2px solid #2563eb' : '1.5px solid #cbd5e1',
          fontSize: '12px',
          textAlign: 'center',
          color: '#1d4ed8',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '3px'
        }}>
          <MathView math="\text{LR: } 1" style={{ fontSize: '12.5px' }} />
          <span style={{ fontSize: '11px', color: '#1d4ed8' }}>{ui.unit.trim()}</span>
        </div>
        <div style={{
          position: 'absolute',
          top: '84%',
          left: '62.5%',
          transform: 'translate(-50%, -50%)',
          padding: '6px 12px',
          borderRadius: '10px',
          backgroundColor: activeStep === 'RL' ? '#dbeafe' : '#ffffff',
          border: activeStep === 'RL' ? '2px solid #2563eb' : '1.5px solid #cbd5e1',
          fontSize: '12px',
          textAlign: 'center',
          color: '#1d4ed8',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '3px'
        }}>
          <MathView math="\text{RL: } 1" style={{ fontSize: '12.5px' }} />
          <span style={{ fontSize: '11px', color: '#1d4ed8' }}>{ui.unit.trim()}</span>
        </div>
        <div style={{
          position: 'absolute',
          top: '84%',
          left: '87.5%',
          transform: 'translate(-50%, -50%)',
          padding: '6px 14px',
          borderRadius: '10px',
          backgroundColor: activeStep === 'RR' ? '#d1fae5' : '#ecfdf5',
          border: activeStep === 'RR' ? '2.5px solid #059669' : '2px solid #10b981',
          fontSize: '12px',
          textAlign: 'center',
          boxShadow: activeStep === 'RR' ? '0 0 16px rgba(16, 185, 129, 0.6)' : '0 4px 12px rgba(16, 185, 129, 0.2)',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '3px'
        }}>
          <MathView math="\text{RR: } 5" style={{ fontSize: '12.5px', color: '#047857' }} />
          <span style={{ fontSize: '11px', color: '#047857', fontWeight: 'bold' }}>{ui.unit.trim()}</span>
        </div>

        {/* 4. 애니메이션 치이카와 아바타 (정밀 노드 위치 스냅 및 강화학습 보상별 감정 반응) */}
        <motion.div
          animate={{ 
            left: `${robotPos.x}%`, 
            top: `${robotPos.y}%`,
            scale: activeStep === 'RR' ? 1.15 : activeStep === 'LL' ? 0.95 : 1
          }}
          transition={{ type: 'spring', stiffness: 350, damping: 24 }}
          style={{
            position: 'absolute',
            width: '46px',
            height: '46px',
            x: '-50%',
            y: '-50%',
            zIndex: 20,
            pointerEvents: 'none'
          }}
        >
          <img 
            src={getAvatarSrc()} 
            alt="Chiikawa" 
            style={{ 
              width: '100%', 
              height: '100%', 
              borderRadius: '50%', 
              border: activeStep === 'RR' 
                ? '2.5px solid #10b981' 
                : activeStep === 'LL' 
                ? '2.5px solid #ef4444' 
                : '2px solid #3b82f6',
              boxShadow: activeStep === 'RR' 
                ? '0 4px 14px rgba(16, 185, 129, 0.45), 0 0 0 2px #ffffff' 
                : activeStep === 'LL' 
                ? '0 4px 14px rgba(239, 68, 68, 0.35), 0 0 0 2px #ffffff' 
                : '0 4px 12px rgba(59, 130, 246, 0.3), 0 0 0 2px #ffffff',
              objectFit: 'cover',
              backgroundColor: '#ffffff',
              transition: 'border 0.2s ease, box-shadow 0.2s ease'
            }} 
          />
        </motion.div>
      </div>
    </div>

      {/* 3. 다이어그램 하단: 반응형 3-Column 슬라이더 그리드 (화면 너비에 따라 깔끔하게 자동 응답) */}
      <div className="pg-sliders-grid">
        {/* 슬라이더 1: P(Right) 정책 확률 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155' }}>
              <MathView math={`P(\\text{Right}) = ${probRight.toFixed(2)}`} style={{ color: '#2563eb', fontSize: '13px' }} />
            </span>
            {lastDelta !== null && (
              <span>
                <MathView 
                  math={`(${lastDelta >= 0 ? `+${lastDelta.toFixed(3)}` : lastDelta.toFixed(3)})`} 
                  style={{ fontSize: '11.5px', color: lastDelta >= 0 ? '#059669' : '#dc2626' }} 
                />
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
              <MathView math={`J(\\theta) = ${baseline.toFixed(2)}`} style={{ color: '#059669', fontSize: '13px' }} />
              <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '3px' }}>({ui.baselineLabel})</span>
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

        {/* 슬라이더 3: KL Penalty 제약 계수 β (조절 범위: 0.0 ~ 1.0) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155' }}>
              <MathView math={`\\beta = ${klCoef.toFixed(2)}`} style={{ color: '#7c3aed', fontSize: '13px' }} />
              <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '3px' }}>({ui.klLabel})</span>
            </span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={klCoef}
            onChange={(e) => setKlCoef(parseFloat(e.target.value))}
            style={{ width: '100%', cursor: 'pointer', accentColor: '#7c3aed' }}
          />
        </div>
      </div>

      {/* 4. Trajectory 확률 및 보상 상태 바 (테두리 피로감 해소) */}
      <div className="pg-traj-grid">
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
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: item.color, marginBottom: '2px' }}>
              <MathView math={item.traj} /> ({item.r}{ui.unit})
            </div>
            <div style={{ marginTop: '2px' }}>
              <MathView math={`${(item.p * 100).toFixed(1)}\\%`} style={{ fontSize: '13.5px', fontWeight: 'bold', color: item.color }} />
            </div>
            <div style={{ height: '4px', width: '100%', backgroundColor: '#e2e8f0', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${item.p * 100}%`, backgroundColor: item.r === 5 ? '#10b981' : '#3b82f6' }} />
            </div>
          </div>
        ))}
      </div>

      {/* 5. 여유롭고 깔끔해진 수식 항 터치 분석기 */}
      <div 
        style={{
          marginTop: '6px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '8px' 
        }}>
          <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a' }}>
            {ui.processTitle}
          </span>

          <button
            onClick={() => setIsDetailOpen(prev => !prev)}
            className="pg-term-details-btn"
            style={{
              padding: '2px 4px',
              fontSize: '12px',
              fontWeight: '600',
              border: 'none',
              backgroundColor: 'transparent',
              color: isDetailOpen ? '#2563eb' : '#64748b',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px'
            }}
          >
            {isDetailOpen ? ui.toggleClose : ui.toggleOpen}
          </button>
        </div>

        {/* 수식 문자열 하이라이트 블록 */}
        <div
          ref={formulaScrollRef}
          className="pg-formula-scroll-wrapper"
        >
          <div className="pg-formula-row">
            {/* 항 1: \nabla_\theta J(\theta) */}
            <div
              ref={termRefs.grad_j}
              onClick={() => selectMathTerm('grad_j')}
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
              onClick={() => selectMathTerm('expectation')}
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
              onClick={() => selectMathTerm('log_prob')}
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
              onClick={() => selectMathTerm('reward_weight')}
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
        </div>

        {/* 접이식 상세 설명 영역 (설명 카드) */}
        <AnimatePresence>
          {isDetailOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              {/* 상세 설명 카드 */}
              <div
                style={{
                  padding: '14px 16px',
                  backgroundColor: activeTermInfo.bgColor,
                  borderRadius: '12px',
                  border: `1.5px solid ${activeTermInfo.themeColor}50`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  boxShadow: `0 2px 8px ${activeTermInfo.themeColor}15`,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  fontSize: '13.5px',
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
