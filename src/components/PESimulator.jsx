import React, { useState } from 'react';

const SENTENCES = [
  { id: 'en', label: 'English', tokens: ['The', 'cat', 'sat', 'on', 'the', 'mat'] },
  { id: 'ko', label: '한국어', tokens: ['인공지능', '모델의', '위치', '인코딩', '원리', '분석'] }
];

const BASE_FREQ = 10000;

// 각도 계산: pos * BASE^(-2i/d)
const getAngle = (pos, i, d) => pos * Math.pow(BASE_FREQ, (-2 * i) / d);

// 단일 SVG 시계 컴포넌트
const ClockItem = ({ index, rotated, isRoPE, label, accentColor }) => {
  const clockSize = 95;
  const radius = 36;
  const center = 47.5;

  const baseVector = isRoPE ? [0.8, 0.4] : [0, 1];
  const initialX = center + radius * baseVector[0];
  const initialY = center - radius * baseVector[1];
  const rotatedX = center + radius * rotated[0];
  const rotatedY = center - radius * rotated[1];

  return (
    <div 
      className="not-content"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px',
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
        minWidth: '135px',
        flex: '1 1 135px',
        boxSizing: 'border-box'
      }}
    >
      <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '2px', textAlign: 'center' }}>
        {label}
      </span>
      <span style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px', fontFamily: 'monospace', fontWeight: '500' }}>
        {index === 0 ? '고주파' : index === 1 ? (isRoPE ? '저주파' : '중주파') : '저주파'}
      </span>

      <svg 
        viewBox="0 0 95 95" 
        style={{ width: `${clockSize}px`, height: `${clockSize}px`, minWidth: `${clockSize}px`, flexShrink: 0 }}
      >
        <circle cx={center} cy={center} r={radius + 3} fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
        
        <line x1={center} y1={center - radius - 2} x2={center} y2={center - radius + 3} stroke="#94a3b8" strokeWidth="1.5" />
        <line x1={center + radius + 2} y1={center} x2={center + radius - 3} y2={center} stroke="#94a3b8" strokeWidth="1.5" />
        <line x1={center} y1={center + radius + 2} x2={center} y2={center + radius - 3} stroke="#94a3b8" strokeWidth="1.5" />
        <line x1={center - radius - 2} y1={center} x2={center - radius + 3} y2={center} stroke="#94a3b8" strokeWidth="1.5" />

        {isRoPE && (
          <>
            <line x1={center} y1={center} x2={initialX} y2={initialY} stroke="#c084fc" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx={initialX} cy={initialY} r="3" fill="#c084fc" />
          </>
        )}

        <line 
          x1={center} 
          y1={center} 
          x2={rotatedX} 
          y2={rotatedY} 
          stroke={accentColor} 
          strokeWidth="3" 
          strokeLinecap="round" 
        />
        <circle cx={rotatedX} cy={rotatedY} r="4" fill={accentColor} />
        <circle cx={center} cy={center} r="2.5" fill="#0f172a" />
      </svg>

      <div style={{ marginTop: '8px', textAlign: 'center', fontFamily: 'monospace', fontSize: '12px', fontWeight: '700' }}>
        {isRoPE ? (
          <span style={{ color: '#7c3aed', backgroundColor: '#f3e8ff', padding: '2px 6px', borderRadius: '4px' }}>
            q' = [{rotated[0].toFixed(2)}, {rotated[1].toFixed(2)}]
          </span>
        ) : (
          <span style={{ color: '#0284c7', backgroundColor: '#e0f2fe', padding: '2px 6px', borderRadius: '4px' }}>
            p = [{rotated[0].toFixed(2)}, {rotated[1].toFixed(2)}]
          </span>
        )}
      </div>
    </div>
  );
};

export const PESimulator = () => {
  const [selectedSentenceIdx, setSelectedSentenceIdx] = useState(0);
  const [position, setPosition] = useState(1); // Query position m
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'pe' | 'rope'

  const sentence = SENTENCES[selectedSentenceIdx];
  const numTokens = sentence.tokens.length;

  // PE: d_model = 6 (시계 3개: i=0, 1, 2)
  const peClockData = [0, 1, 2].map((i) => {
    const angle = getAngle(position, i, 6);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      index: i,
      label: `시계 ${i} (dim ${i * 2}, ${i * 2 + 1})`,
      peRotated: [sin, cos]
    };
  });

  // RoPE: d_h = 4 (Head 차원: 시계 2개: i=0, 1)
  const ropeClockData = [0, 1].map((i) => {
    const angle = getAngle(position, i, 4);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const [qx, qy] = [0.8, 0.4];
    return {
      index: i,
      label: `시계 ${i} (dim ${i * 2}, ${i * 2 + 1})`,
      ropeRotated: [
        qx * cos - qy * sin,
        qx * sin + qy * cos
      ]
    };
  });

  // --- 정확한 이론 수식 기반의 토큰 간 상대거리 & Attention Score 계산 ---
  // Query 위치: m (position), Key 위치: n (0 ~ N-1)
  // RoPE 이론: (q'_m)^T k'_n = \sum q^{(i)T} R((n-m)\theta_i) k^{(i)}
  // PE 이론: (x_m + p_m)^T (x_n + p_n) = x_m^T x_n + x_m^T p_n + p_m^T x_n + p_m^T p_n
  const qBase = [0.8, 0.4, 0.6, 0.2]; // RoPE base q
  const kBase = [0.7, 0.5, 0.5, 0.3]; // RoPE base k

  const scoreData = sentence.tokens.map((token, n) => {
    const dist = n - position;
    const absDist = Math.abs(dist);

    // 1. RoPE Score 계산 (d_h = 4, 2쌍)
    // 쌍 0: theta_0 = 1.0 (고주파), 쌍 1: theta_1 = 0.1 (중저주파)
    let ropeScoreSum = 0;
    for (let i = 0; i < 2; i++) {
      const theta = getAngle(1, i, 4); // theta_i
      const relAngle = dist * theta; // (n-m)*theta_i
      const cosR = Math.cos(relAngle);
      const sinR = Math.sin(relAngle);

      const qPair = [qBase[i * 2], qBase[i * 2 + 1]];
      const kPair = [kBase[i * 2], kBase[i * 2 + 1]];

      // q^T R((n-m)theta) k
      const kRotated = [
        kPair[0] * cosR - kPair[1] * sinR,
        kPair[0] * sinR + kPair[1] * cosR
      ];
      ropeScoreSum += (qPair[0] * kRotated[0] + qPair[1] * kRotated[1]);
    }
    // 정규화 (0~1 범위 시각화용)
    const normRoPEScore = Math.max(0.05, Math.min(1.0, (ropeScoreSum / 1.5).toFixed(2)));

    // 2. Absolute PE Score 계산 (d_model = 6, 3쌍 내적)
    // p_m^T p_n = \sum \cos((n-m)\omega_i) 의 요동치는 패턴 시각화
    let pePosDot = 0;
    for (let i = 0; i < 3; i++) {
      const omega = getAngle(1, i, 6);
      pePosDot += Math.cos(dist * omega);
    }
    // 내용 내적 + 위치 내적 + 교차항 요동 반영
    const baseContentDot = dist === 0 ? 0.9 : (0.4 - 0.05 * absDist);
    const rawPeScore = (baseContentDot + 0.3 * pePosDot) / 1.8;
    const normPEScore = Math.max(0.05, Math.min(1.0, rawPeScore.toFixed(2)));

    return {
      n,
      token,
      dist,
      peScore: normPEScore,
      ropeScore: normRoPEScore
    };
  });

  return (
    <div 
      className="not-content"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
        clear: 'both',
        boxSizing: 'border-box',
        margin: '16px 0',
        padding: '20px',
        borderRadius: '16px',
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* 1. Header View Switcher (중앙 정렬) */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '12px'
        }}
      >
        <div style={{ display: 'flex', gap: '6px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
          {[
            { id: 'split', label: '병렬 비교' },
            { id: 'pe', label: 'PE 만 보기' },
            { id: 'rope', label: 'RoPE 만 보기' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: '700',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === mode.id ? '#ffffff' : 'transparent',
                color: viewMode === mode.id ? '#0f172a' : '#64748b',
                boxShadow: viewMode === mode.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Sentence & Token Selector */}
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          backgroundColor: '#f8fafc',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
            Query 토큰 선택 (위치 m 설정)
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {SENTENCES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedSentenceIdx(idx);
                  setPosition(1);
                }}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: selectedSentenceIdx === idx ? '#2563eb' : '#e2e8f0',
                  color: selectedSentenceIdx === idx ? '#ffffff' : '#475569'
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tokens Row */}
        <div 
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            gap: '10px',
            overflowX: 'auto',
            paddingBottom: '4px',
            width: '100%'
          }}
        >
          {sentence.tokens.map((token, idx) => {
            const isSelected = position === idx;
            return (
              <button
                key={idx}
                onClick={() => setPosition(idx)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justify: 'center',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer',
                  minWidth: '75px',
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: '800', color: isSelected ? '#1d4ed8' : '#0f172a', marginBottom: '3px' }}>
                  {token}
                </span>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: '600', color: isSelected ? '#2563eb' : '#64748b' }}>
                  m = {idx}
                </span>
              </button>
            );
          })}
        </div>

        {/* Position Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#334155', whitespace: 'nowrap' }}>
            Query 위치 조절 (m): <strong style={{ color: '#2563eb', fontFamily: 'monospace', fontSize: '15px', marginLeft: '4px' }}>{position} ("{sentence.tokens[position]}")</strong>
          </span>
          <input
            type="range"
            min="0"
            max={numTokens - 1}
            value={position}
            onChange={(e) => setPosition(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer', accentColor: '#2563eb' }}
          />
        </div>
      </div>

      {/* 3. PE & RoPE Clocks Row Layout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        
        {/* PE Row */}
        {(viewMode === 'split' || viewMode === 'pe') && (
          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '18px',
              borderRadius: '14px',
              backgroundColor: '#f0f9ff',
              border: '2px solid #7dd3fc'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '2px' }}>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0369a1' }}>
                  Absolute Positional Encoding (PE)
                </h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#0369a1', fontWeight: '700', backgroundColor: '#e0f2fe', padding: '3px 10px', borderRadius: '6px', border: '1px solid #bae6fd', textAlign: 'right' }}>
                  적용 단계 : 입력 토큰 임베딩
                </span>
                <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#0284c7', fontWeight: '600' }}>
                  (d = 6)
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '12px', width: '100%' }}>
              {peClockData.map((clk) => (
                <ClockItem
                  key={clk.index}
                  index={clk.index}
                  label={clk.label}
                  rotated={clk.peRotated}
                  isRoPE={false}
                  accentColor="#0284c7"
                />
              ))}
            </div>
          </div>
        )}

        {/* RoPE Row */}
        {(viewMode === 'split' || viewMode === 'rope') && (
          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '18px',
              borderRadius: '14px',
              backgroundColor: '#f5f3ff',
              border: '2px solid #c084fc'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', items: 'center', gap: '8px', paddingTop: '2px' }}>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#6b21a8' }}>
                  Rotary Position Embedding (RoPE)
                </h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#6b21a8', fontWeight: '700', backgroundColor: '#f3e8ff', padding: '3px 10px', borderRadius: '6px', border: '1px solid #e9d5ff', textAlign: 'right' }}>
                  적용 단계 : Query / Key 벡터 단일 Attention Head 범위
                </span>
                <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#7c3aed', fontWeight: '600' }}>
                  (d_h = 4)
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '12px', width: '100%' }}>
              {ropeClockData.map((clk) => (
                <ClockItem
                  key={clk.index}
                  index={clk.index}
                  label={clk.label}
                  rotated={clk.ropeRotated}
                  isRoPE={true}
                  accentColor="#7c3aed"
                />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 4. 신규 패널: 토큰 간 상대 거리 & Attention Score 패널 */}
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          backgroundColor: '#f8fafc',
          padding: '18px',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          marginTop: '4px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
              Query 토큰 '{sentence.tokens[position]}'(m={position}) ↔ Key 토큰(n) 간 Attention 점수 비교
            </h4>
          </div>
        </div>

        {/* Score Bar Chart List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
          {scoreData.map((item) => {
            const isSelf = item.n === position;
            return (
              <div 
                key={item.n}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: isSelf ? '#ffffff' : 'transparent',
                  border: isSelf ? '1px solid #cbd5e1' : 'none'
                }}
              >
                {/* Token Label */}
                <div style={{ minWidth: '90px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: isSelf ? '#2563eb' : '#334155' }}>
                    n={item.n} {item.token}
                  </span>
                  <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#94a3b8' }}>
                    ({item.dist > 0 ? `+${item.dist}` : item.dist})
                  </span>
                </div>

                {/* Bars Comparison */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {/* PE Bar */}
                  {(viewMode === 'split' || viewMode === 'pe') && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '700', color: '#0284c7', width: '32px' }}>PE</span>
                      <div style={{ flex: 1, backgroundColor: '#e0f2fe', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${item.peScore * 100}%`, 
                            backgroundColor: '#0284c7', 
                            height: '100%',
                            transition: 'width 0.3s ease'
                          }} 
                        />
                      </div>
                      <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: '700', color: '#0369a1', width: '36px', textAlign: 'right' }}>
                        {item.peScore}
                      </span>
                    </div>
                  )}

                  {/* RoPE Bar */}
                  {(viewMode === 'split' || viewMode === 'rope') && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '700', color: '#7c3aed', width: '32px' }}>RoPE</span>
                      <div style={{ flex: 1, backgroundColor: '#f3e8ff', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${item.ropeScore * 100}%`, 
                            backgroundColor: '#7c3aed', 
                            height: '100%',
                            transition: 'width 0.3s ease'
                          }} 
                        />
                      </div>
                      <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: '700', color: '#6b21a8', width: '36px', textAlign: 'right' }}>
                        {item.ropeScore}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default PESimulator;
