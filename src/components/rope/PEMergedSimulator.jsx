import React, { useState, useMemo } from 'react';

const DIM = 6;
const MAX_POS = 50;
const BASE = 10000;

const getAngle = (pos, i, d) => pos * Math.pow(BASE, -2 * i / d);

const VectorInput = ({ vector, onChange, label }) => (
  <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
    <span className="font-mono text-xs font-semibold sm:text-sm">{label}</span>
    {vector.map((val, i) => (
      <input
        key={i}
        type="number"
        min="-1"
        max="1"
        step="0.1"
        value={val}
        onChange={(e) => {
          const newVec = [...vector];
          newVec[i] = Number(e.target.value);
          onChange(newVec);
        }}
        className="num-font w-12 rounded-md border border-slate-300 bg-white p-1 text-center text-xs font-bold text-slate-800 shadow-xs sm:w-16 sm:text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      />
    ))}
  </div>
);

const Clock = ({ angle, label, vector, rotated, isRoPE = false }) => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const initialX = 50 + 38 * vector[0];
  const initialY = 50 - 38 * vector[1];
  const rotatedX = 50 + 38 * rotated[0];
  const rotatedY = 50 - 38 * rotated[1];

  return (
    <div className="flex flex-col items-center">
      <span className="gmarket-font mb-2 text-xs font-bold text-slate-700 sm:text-sm dark:text-slate-200">{label}</span>
      <svg viewBox="0 0 100 100" className="h-24 w-24 sm:h-28 sm:w-28">
        <circle cx="50" cy="50" r="40" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" className="dark:fill-slate-800/50 dark:stroke-slate-700" />
        <line x1="50" y1="10" x2="50" y2="13" stroke="#94a3b8" strokeWidth="1" />
        <line x1="90" y1="50" x2="87" y2="50" stroke="#94a3b8" strokeWidth="1" />
        <line x1="50" y1="90" x2="50" y2="87" stroke="#94a3b8" strokeWidth="1" />
        <line x1="10" y1="50" x2="13" y2="50" stroke="#94a3b8" strokeWidth="1" />

        {isRoPE && (
          <>
            <line x1="50" y1="50" x2={initialX} y2={initialY} stroke="#a5b4fc" strokeWidth="2" strokeDasharray="3 2" />
            <circle cx={initialX} cy={initialY} r="3" fill="#a5b4fc" />
          </>
        )}

        <line x1="50" y1="50" x2={rotatedX} y2={rotatedY} stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={rotatedX} cy={rotatedY} r="4" fill="#4f46e5" />
        <circle cx="50" cy="50" r="2" fill="#3730a3" />
      </svg>
      <div className="num-font mt-2 text-center text-[11px] font-semibold text-slate-600 sm:text-xs dark:text-slate-400">
        {isRoPE ? (
          <>
            q'=[{rotated[0].toFixed(2)}, {rotated[1].toFixed(2)}]
          </>
        ) : (
          <>
            p=[{rotated[0].toFixed(2)}, {rotated[1].toFixed(2)}]
          </>
        )}
      </div>
    </div>
  );
};

const VisualizerSection = ({ title, description, children, formula }) => (
  <div className="flex-1 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-5 dark:border-slate-700 dark:bg-slate-900">
    <h4 className="gmarket-font text-base font-bold text-slate-800 sm:text-lg dark:text-slate-100">{title}</h4>
    <p className="mt-1 mb-2 text-xs text-slate-600 sm:mb-3 sm:text-sm dark:text-slate-400">{description}</p>
    <div className="num-font my-3 rounded-lg bg-slate-50 p-2 text-center text-xs font-semibold text-slate-700 sm:my-4 sm:p-2.5 sm:text-sm dark:bg-slate-800 dark:text-slate-300">
      {formula}
    </div>
    {children}
  </div>
);

export const PEMergedSimulator = () => {
  const [position, setPosition] = useState(5);
  const [clockIndex, setClockIndex] = useState(0);
  const [qVec, setQVec] = useState([0.6, 0.3]);

  const peAngle = getAngle(position, clockIndex, DIM);
  const peRotated = [Math.sin(peAngle), Math.cos(peAngle)];

  const ropeAngle = getAngle(position, clockIndex, DIM);
  const ropeRotated = useMemo(() => {
    const cos = Math.cos(ropeAngle);
    const sin = Math.sin(ropeAngle);
    const [qx, qy] = qVec;
    return [
      qx * cos - qy * sin,
      qx * sin + qy * cos,
    ];
  }, [ropeAngle, qVec]);

  const clockLabels = Array.from({ length: DIM / 2 }, (_, i) => `시계 ${i} (dim ${i * 2}, ${i * 2 + 1})`);

  return (
    <div 
      className="not-content my-4 flex w-full flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:my-6 sm:gap-6 sm:p-7 dark:border-slate-800 dark:bg-slate-950"
      style={{ 
        boxSizing: 'border-box',
        fontFamily: '"Plus Jakarta Sans", "Noto Sans KR", -apple-system, BlinkMacSystemFont, sans-serif'
      }}
    >
      {/* 폰트 유틸리티 */}
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
      
      {/* --- Header Title Section --- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
        <div style={{ width: '5px', height: '20px', borderRadius: '4px', background: 'linear-gradient(180deg, #4f46e5, #3730a3)' }} />
        <h3 className="gmarket-font" style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.02em' }}>
          Positional Encoding & RoPE Visualizer
        </h3>
      </div>
      
      {/* --- Global Controls --- */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs sm:p-4 dark:border-slate-700 dark:bg-slate-900">
          <label htmlFor="pe-rope-pos" className="gmarket-font flex justify-between text-xs font-bold text-slate-800 sm:text-sm dark:text-slate-200">
            <span>토큰 위치 (m)</span>
            <span className="num-font font-bold text-indigo-600 dark:text-indigo-400">{position}</span>
          </label>
          <input
            id="pe-rope-pos"
            type="range"
            min="0"
            max={MAX_POS}
            value={position}
            onChange={(e) => setPosition(Number(e.target.value))}
            className="mt-2 w-full accent-indigo-600"
          />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs sm:p-4 dark:border-slate-700 dark:bg-slate-900">
          <label htmlFor="pe-rope-clock" className="gmarket-font block text-xs font-bold text-slate-800 sm:text-sm dark:text-slate-200">
            시계(주파수) 선택
          </label>
          <select
            id="pe-rope-clock"
            value={clockIndex}
            onChange={(e) => setClockIndex(Number(e.target.value))}
            className="gmarket-font mt-2 w-full rounded-md border-slate-300 bg-white text-xs font-medium sm:text-sm dark:border-slate-600 dark:bg-slate-800"
          >
            {clockLabels.map((label, i) => (
              <option key={i} value={i}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* --- Visualizers --- */}
      <div className="flex flex-col gap-4 md:flex-row sm:gap-6">
        {/* --- PE Section --- */}
        <VisualizerSection
          title="Positional Encoding (PE)"
          description="위치(m)에 따라 기준 벡터 [0,1]을 회전시켜 위치 벡터 p_m을 생성하고, 토큰 임베딩에 더합니다."
          formula={<>h<sub>m</sub> = x<sub>m</sub> + p<sub>m</sub></>}
        >
          <div className="flex flex-col items-center justify-center gap-3 sm:gap-4">
            <Clock
              angle={peAngle}
              label={clockLabels[clockIndex]}
              vector={[0, 1]}
              rotated={peRotated}
              isRoPE={false}
            />
            <div className="text-center">
              <p className="text-[11px] text-gray-500 sm:text-xs">
                PE는 토큰 정보와 무관하게,
                <br />
                위치 m에 대한 좌표값을 만듭니다.
              </p>
            </div>
          </div>
        </VisualizerSection>

        {/* --- RoPE Section --- */}
        <VisualizerSection
          title="Rotary Position Embedding (RoPE)"
          description="위치(m)에 따라 Query/Key 벡터 q_m 자체를 직접 회전시킵니다. 아래에서 q_m 값을 바꿔보세요."
          formula={<>q'<sub>m</sub> = R(mθ)q<sub>m</sub></>}
        >
          <div className="flex flex-col items-center justify-center gap-3 sm:gap-4">
            <Clock
              angle={ropeAngle}
              label={clockLabels[clockIndex]}
              vector={qVec}
              rotated={ropeRotated}
              isRoPE={true}
            />
            <div className="flex flex-col items-center gap-2">
               <VectorInput 
                label="q ="
                vector={qVec}
                onChange={setQVec}
              />
              <p className="mt-1 text-center text-[11px] text-gray-500 sm:text-xs">
                RoPE는 토큰 정보를 담은 벡터를
                <br />
                위치 m만큼 회전시킵니다.
              </p>
            </div>
          </div>
        </VisualizerSection>
      </div>

      {/* --- Summary Table --- */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xs dark:border-slate-700 dark:bg-slate-900">
        <table className="w-full min-w-full border-collapse text-left text-xs sm:text-sm">
          <thead className="gmarket-font border-b border-slate-200 font-bold text-slate-800 dark:border-slate-700 dark:text-slate-200">
            <tr>
              <th className="p-2 sm:p-3 whitespace-nowrap">구분</th>
              <th className="p-2 sm:p-3 whitespace-nowrap">PE (덧셈 방식)</th>
              <th className="p-2 sm:p-3 whitespace-nowrap">RoPE (곱셈 방식)</th>
            </tr>
          </thead>
          <tbody className="text-slate-600 dark:text-slate-400">
            <tr className="border-b border-slate-200/50 dark:border-slate-700/50">
              <td className="gmarket-font p-2 font-bold text-slate-700 sm:p-3 dark:text-slate-300 whitespace-nowrap">회전 대상</td>
              <td className="p-2 sm:p-3">기준 벡터 [0, 1]</td>
              <td className="p-2 sm:p-3">Query/Key 벡터 자체</td>
            </tr>
            <tr className="border-b border-slate-200/50 dark:border-slate-700/50">
              <td className="gmarket-font p-2 font-bold text-slate-700 sm:p-3 dark:text-slate-300 whitespace-nowrap">연산 방식</td>
              <td className="p-2 sm:p-3">토큰 임베딩에 덧셈</td>
              <td className="p-2 sm:p-3">회전 행렬 곱셈</td>
            </tr>
            <tr>
              <td className="gmarket-font p-2 font-bold text-slate-700 sm:p-3 dark:text-slate-300 whitespace-nowrap">결과</td>
              <td className="p-3">위치 정보가 담긴 벡터 생성</td>
              <td className="p-3">내용과 위치 정보가 결합된 벡터</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PEMergedSimulator;