import React, { useState } from 'react';
import katex from 'katex';

// 실제 LLM BPE/SentencePiece 토크나이저 규격 반영 (공백 접두어   표기)
const TOKENS = [
  { text: 'The', display: 'The', id: 464 },
  { text: ' cat', display: ' cat', id: 3797 },
  { text: ' sat', display: ' sat', id: 3348 },
  { text: ' on', display: ' on', id: 319 },
  { text: ' the', display: ' the', id: 262 },
  { text: ' mat', display: ' mat', id: 2603 }
];

const BASE_FREQ = 10000;

// 각도 계산: pos * BASE^(-2i/d)
const getAngle = (pos, i, d) => pos * Math.pow(BASE_FREQ, (-2 * i) / d);

// KaTeX 수식 렌더링 헬퍼
const MathView = ({ math, style }) => {
  const html = katex.renderToString(math, { throwOnError: false });
  return (
    <span 
      style={{ display: 'inline-flex', alignItems: 'center', ...style }} 
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
};

// 단일 SVG 시계 컴포넌트
const ClockItem = ({ index, rotated, isRoPE, label, accentColor }) => {
  const clockSize = 92;
  const radius = 34;
  const center = 46;

  const baseVector = isRoPE ? [0.8, 0.4] : [0, 1];
  const initialX = center + radius * baseVector[0];
  const initialY = center - radius * baseVector[1];
  const rotatedX = center + radius * rotated[0];
  const rotatedY = center - radius * rotated[1];

  const mathFormula = isRoPE
    ? `\\mathbf{q}' = [${rotated[0].toFixed(2)},\\, ${rotated[1].toFixed(2)}]`
    : `\\mathbf{p} = [${rotated[0].toFixed(2)},\\, ${rotated[1].toFixed(2)}]`;

  return (
    <div 
      className="not-content"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '8px 4px',
        minWidth: '115px',
        flex: '1 1 115px',
        boxSizing: 'border-box'
      }}
    >
      <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#1e293b', marginBottom: '1px', textAlign: 'center' }}>
        {label}
      </span>
      <span style={{ fontSize: '10.5px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>
        {index === 0 ? '고주파' : index === 1 ? (isRoPE ? '저주파' : '중주파') : '저주파'}
      </span>

      <svg 
        viewBox="0 0 92 92" 
        style={{ width: `${clockSize}px`, height: `${clockSize}px`, minWidth: `${clockSize}px`, flexShrink: 0 }}
      >
        {/* 아이보리 캔버스 위에 선명하게 올라앉는 화이트 다이얼 */}
        <circle cx={center} cy={center} r={radius + 4} fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.6" />
        
        {/* 눈금선 */}
        <line x1={center} y1={center - radius - 2} x2={center} y2={center - radius + 2} stroke="#94a3b8" strokeWidth="1.5" />
        <line x1={center + radius + 2} y1={center} x2={center + radius - 2} y2={center} stroke="#94a3b8" strokeWidth="1.5" />
        <line x1={center} y1={center + radius + 2} x2={center} y2={center + radius - 2} stroke="#94a3b8" strokeWidth="1.5" />
        <line x1={center - radius - 2} y1={center} x2={center - radius + 2} y2={center} stroke="#94a3b8" strokeWidth="1.5" />

        {/* RoPE 초기 벡터 (점선) */}
        {isRoPE && (
          <>
            <line x1={center} y1={center} x2={initialX} y2={initialY} stroke="#c084fc" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx={initialX} cy={initialY} r="2.5" fill="#c084fc" />
          </>
        )}

        {/* 회전된 벡터 바늘 */}
        <line 
          x1={center} 
          y1={center} 
          x2={rotatedX} 
          y2={rotatedY} 
          stroke={accentColor} 
          strokeWidth="2.8" 
          strokeLinecap="round" 
        />
        <circle cx={rotatedX} cy={rotatedY} r="3.8" fill={accentColor} />
        <circle cx={center} cy={center} r="2.2" fill="#0f172a" />
      </svg>

      {/* KaTeX 형식 좌표 수식 */}
      <div style={{ marginTop: '9px', textAlign: 'center', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <MathView 
          math={mathFormula} 
          style={{ 
            color: isRoPE ? '#7c3aed' : '#0284c7', 
            fontSize: '12px',
            fontFamily: 'KaTeX_Math, serif'
          }} 
        />
      </div>
    </div>
  );
};

export const PESimulator = () => {
  const [position, setPosition] = useState(1); // Query position m
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'pe' | 'rope'

  // PE: d_model = 6 (시계 3개: i=0, 1, 2)
  const peClockData = [0, 1, 2].map((i) => {
    const angle = getAngle(position, i, 6);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      index: i,
      label: `차원 (${i * 2}, ${i * 2 + 1})`,
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
      label: `차원 (${i * 2}, ${i * 2 + 1})`,
      ropeRotated: [
        qx * cos - qy * sin,
        qx * sin + qy * cos
      ]
    };
  });

  // 이론 수식 기반 토큰 간 상대거리 & Attention Score 계산
  const qBase = [0.8, 0.4, 0.6, 0.2];
  const kBase = [0.7, 0.5, 0.5, 0.3];

  const scoreData = TOKENS.map((token, n) => {
    const dist = n - position;
    const absDist = Math.abs(dist);

    // 1. RoPE Score 계산 (d_h = 4, 2쌍 내적)
    let ropeScoreSum = 0;
    for (let i = 0; i < 2; i++) {
      const theta = getAngle(1, i, 4);
      const relAngle = dist * theta;
      const cosR = Math.cos(relAngle);
      const sinR = Math.sin(relAngle);

      const qPair = [qBase[i * 2], qBase[i * 2 + 1]];
      const kPair = [kBase[i * 2], kBase[i * 2 + 1]];

      const kRotated = [
        kPair[0] * cosR - kPair[1] * sinR,
        kPair[0] * sinR + kPair[1] * cosR
      ];
      ropeScoreSum += (qPair[0] * kRotated[0] + qPair[1] * kRotated[1]);
    }
    const normRoPEScore = Math.max(0.05, Math.min(1.0, (ropeScoreSum / 1.5).toFixed(2)));

    // 2. Absolute PE Score 계산 (d_model = 6, 3쌍 내적)
    let pePosDot = 0;
    for (let i = 0; i < 3; i++) {
      const omega = getAngle(1, i, 6);
      pePosDot += Math.cos(dist * omega);
    }
    const baseContentDot = dist === 0 ? 0.9 : (0.4 - 0.05 * absDist);
    const rawPeScore = (baseContentDot + 0.3 * pePosDot) / 1.8;
    const normPEScore = Math.max(0.05, Math.min(1.0, rawPeScore.toFixed(2)));

    return {
      n,
      token: token.display,
      dist,
      absDist,
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
        gap: '24px',
        width: '100%',
        clear: 'both',
        boxSizing: 'border-box',
        margin: '20px 0',
        padding: '24px',
        borderRadius: '20px',
        backgroundColor: '#fbf9f5',
        border: '1px solid #e8e4dc',
        boxShadow: '0 16px 36px -12px rgba(68, 64, 60, 0.08), 0 0 1px 1px rgba(68, 64, 60, 0.03)',
        fontFamily: '"Plus Jakarta Sans", "Noto Sans KR", -apple-system, BlinkMacSystemFont, sans-serif'
      }}
    >
      <style>{`
        .gmarket-font {
          font-family: 'GmarketSans', 'Plus Jakarta Sans', 'Noto Sans KR', sans-serif !important;
        }
        .num-font {
          font-family: 'JetBrains Mono', monospace !important;
          font-feature-settings: "tnum";
          font-variant-numeric: tabular-nums;
        }
        .token-cell {
          cursor: pointer;
          transition: background-color 0.15s ease, color 0.15s ease;
        }
        .token-cell:hover:not(.token-cell-active) {
          background-color: #f8f6f0;
        }
      `}</style>

      {/* 1. 최상단 헤더: 세로 라운드 바 + 타이틀 (좌측) & 뷰 모드 스위처 탭 (우측) */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '12px',
          paddingBottom: '16px',
          borderBottom: '1px solid #e8e4dc'
        }}
      >
        {/* 좌측 세로 바 + 타이틀 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '6px', height: '22px', borderRadius: '5px', background: 'linear-gradient(180deg, #6366f1, #4338ca)' }} />
          <h3 className="gmarket-font" style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.02em' }}>
            PE & RoPE Simulator
          </h3>
        </div>

        {/* 우측 뷰 모드 스위처 탭 */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#eeeae1', padding: '3px', borderRadius: '9px', border: '1px solid #e2ddd3' }}>
          {[
            { id: 'split', label: '전체 비교', activeColor: '#4338ca', shadowColor: 'rgba(67, 56, 202, 0.15)' },
            { id: 'pe', label: 'PE만 보기', activeColor: '#0284c7', shadowColor: 'rgba(2, 132, 199, 0.18)' },
            { id: 'rope', label: 'RoPE만 보기', activeColor: '#7c3aed', shadowColor: 'rgba(124, 58, 237, 0.18)' }
          ].map((mode) => {
            const isActive = viewMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className="gmarket-font"
                style={{
                  padding: '5px 12px',
                  fontSize: '11.5px',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: isActive ? '#ffffff' : 'transparent',
                  color: isActive ? mode.activeColor : '#64748b',
                  boxShadow: isActive ? `0 1px 4px ${mode.shadowColor}` : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Query 토큰 선택 소제목 및 일체형 표(Table) 선택기 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a' }}>
          Query 토큰 선택
        </span>

        <div 
          style={{ 
            width: '100%',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div 
            style={{
              display: 'flex',
              minWidth: '380px',
              border: '1.5px solid #dfdad0',
              borderRadius: '10px',
              overflow: 'hidden',
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            {TOKENS.map((t, idx) => {
              const isSelected = position === idx;
              const isLast = idx === TOKENS.length - 1;
              return (
                <div
                  key={idx}
                  onClick={() => setPosition(idx)}
                  className={`token-cell ${isSelected ? 'token-cell-active' : ''}`}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px 4px',
                    borderRight: isLast ? 'none' : '1px solid #eae5db',
                    backgroundColor: isSelected ? '#eef2ff' : 'transparent',
                    borderBottom: isSelected ? '3px solid #6366f1' : '3px solid transparent',
                    userSelect: 'none'
                  }}
                >
                  <span 
                    style={{ 
                      fontSize: '13.5px', 
                      fontWeight: isSelected ? '800' : '600', 
                      color: isSelected ? '#4338ca' : '#1e293b',
                      fontFamily: '"Plus Jakarta Sans", "Noto Sans KR", sans-serif',
                      letterSpacing: '-0.01em',
                      marginBottom: '2px'
                    }}
                  >
                    {t.display}
                  </span>
                  <MathView 
                    math={`m = ${idx}`} 
                    style={{ 
                      fontSize: '11px', 
                      color: isSelected ? '#4338ca' : '#94a3b8',
                      fontFamily: 'KaTeX_Math, serif'
                    }} 
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. PE & RoPE 시계 다이어그램 섹션 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        
        {/* Absolute PE 시계 영역 */}
        {(viewMode === 'split' || viewMode === 'pe') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', borderBottom: '1px solid #eae5dc', paddingBottom: '6px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#0284c7' }}>
                Absolute PE
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px', width: '100%', justifyContent: 'space-around' }}>
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

        {/* RoPE 시계 영역 */}
        {(viewMode === 'split' || viewMode === 'rope') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', borderBottom: '1px solid #eae5dc', paddingBottom: '6px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#7c3aed' }}>
                Rotary Position Embedding (RoPE)<span style={{ color: '#64748b', fontSize: '11px', verticalAlign: 'super', marginLeft: '2px' }}>*</span>
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px', width: '100%', justifyContent: 'space-around' }}>
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

      {/* 4. Attention 점수 비교 & 상대 거리(Δ) 패널 */}
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          paddingTop: '16px',
          borderTop: '1px solid #e8e4dc'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '6px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
            '{TOKENS[position].display}' 토큰의 Attention Score
          </span>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            <strong style={{ color: '#4338ca' }}>Δ = |n - m|</strong> (상대 거리)
          </span>
        </div>

        {/* Bar Chart List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {scoreData.map((item) => {
            const isSelf = item.n === position;
            return (
              <div 
                key={item.n}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '6px 8px',
                  borderRadius: '8px',
                  backgroundColor: isSelf ? '#eef2ff' : 'transparent',
                  transition: 'background-color 0.15s ease'
                }}
              >
                {/* Token Label & Relative Distance Δ */}
                <div style={{ minWidth: '100px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontFamily: '"Plus Jakarta Sans", "Noto Sans KR", sans-serif', fontWeight: isSelf ? '800' : '600', color: isSelf ? '#4338ca' : '#1e293b' }}>
                    {item.token}
                  </span>
                  {isSelf ? (
                    <span 
                      style={{ 
                        fontSize: '10px', 
                        fontFamily: '"Plus Jakarta Sans", "Noto Sans KR", sans-serif', 
                        fontWeight: '700', 
                        color: '#4338ca',
                        marginRight: '6px'
                      }}
                    >
                      Query
                    </span>
                  ) : (
                    <MathView 
                      math={`\\Delta = ${item.absDist}`} 
                      style={{ 
                        fontSize: '10.5px', 
                        color: '#94a3b8',
                        marginRight: '6px',
                        fontFamily: 'KaTeX_Math, serif'
                      }} 
                    />
                  )}
                </div>

                {/* Bars */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {/* PE Bar */}
                  {(viewMode === 'split' || viewMode === 'pe') && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '9.5px', fontWeight: '700', color: '#0284c7', width: '28px' }}>PE</span>
                      <div style={{ flex: 1, backgroundColor: 'rgba(2, 132, 199, 0.15)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${item.peScore * 100}%`, 
                            backgroundColor: '#0284c7', 
                            height: '100%',
                            transition: 'width 0.25s ease'
                          }} 
                        />
                      </div>
                      <MathView 
                        math={`${item.peScore}`} 
                        style={{ 
                          fontSize: '11px', 
                          color: '#0369a1', 
                          width: '34px', 
                          justifyContent: 'flex-end',
                          fontFamily: 'KaTeX_Math, serif'
                        }} 
                      />
                    </div>
                  )}

                  {/* RoPE Bar */}
                  {(viewMode === 'split' || viewMode === 'rope') && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '9.5px', fontWeight: '700', color: '#7c3aed', width: '28px' }}>RoPE</span>
                      <div style={{ flex: 1, backgroundColor: 'rgba(124, 58, 237, 0.15)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${item.ropeScore * 100}%`, 
                            backgroundColor: '#7c3aed', 
                            height: '100%',
                            transition: 'width 0.25s ease'
                          }} 
                        />
                      </div>
                      <MathView 
                        math={`${item.ropeScore}`} 
                        style={{ 
                          fontSize: '11px', 
                          color: '#6b21a8', 
                          width: '34px', 
                          justifyContent: 'flex-end',
                          fontFamily: 'KaTeX_Math, serif'
                        }} 
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. 주석 (Footnote) */}
      <div style={{ borderTop: '1px dashed #dfdad0', paddingTop: '10px', marginTop: '2px' }}>
        <p style={{ margin: 0, fontSize: '11px', color: '#64748b', lineHeight: 1.6, fontStyle: 'italic' }}>
          <strong style={{ color: '#4338ca', fontStyle: 'normal' }}>*</strong> Absolute PE는 토큰 임베딩 차원, RoPE는 단일 Attention Head 차원에 적용되므로 RoPE의 차원 수가 더 적게 표현된다. 본문에선 각각 6차원(Absolute PE), 4차원(RoPE) 벡터로 표현.
        </p>
      </div>

    </div>
  );
};

export default PESimulator;
