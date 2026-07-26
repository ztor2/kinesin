import React, { useState } from 'react';

const SENTENCES = [
  { id: 'en', label: 'English', tokens: ['The', 'cat', 'sat', 'on', 'the', 'mat'] },
  { id: 'ko', label: '한국어', tokens: ['귀여운', '고양이가', '이불', '위에', '앉아', '있다'] }
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
        
        {/* 눈금 */}
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

      {/* 가독성 높인 좌표 텍스트 */}
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

export const PositionalEncodingVisualizer = () => {
  const [selectedSentenceIdx, setSelectedSentenceIdx] = useState(0);
  const [position, setPosition] = useState(1);
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'pe' | 'rope'

  const sentence = SENTENCES[selectedSentenceIdx];

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
      {/* 1. Header View Switcher */}
      <div 
        style={{
          display: 'flex',
          justify: 'flex-end',
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
            문장 토큰 선택
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
                  backgroundColor: selectedSentenceIdx === idx ? '#3b82f6' : '#e2e8f0',
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
            위치 조절 (m): <strong style={{ color: '#2563eb', fontFamily: 'monospace', fontSize: '15px', marginLeft: '4px' }}>{position}</strong>
          </span>
          <input
            type="range"
            min="0"
            max={sentence.tokens.length - 1}
            value={position}
            onChange={(e) => setPosition(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer', accentColor: '#2563eb' }}
          />
        </div>
      </div>

      {/* 3. PE & RoPE Row Layout */}
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
              <div style={{ display: 'flex', items: 'center', gap: '8px', paddingTop: '2px' }}>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0369a1' }}>
                  Absolute Positional Encoding (PE)
                </h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#0369a1', fontWeight: '700', backgroundColor: '#e0f2fe', padding: '3px 10px', borderRadius: '6px', border: '1px solid #bae6fd', textAlign: 'right' }}>
                  적용 단계: 입력 토큰 임베딩
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
                  적용 단계 : Q/K 벡터의 단일 Attention head 범위
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
    </div>
  );
};

export default PositionalEncodingVisualizer;
