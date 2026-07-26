import React, { useState, useMemo } from 'react';

const DIM = 6;
const MAX_POS = 50;
const BASE = 10000;

const getAngle = (pos, i, d) => pos * Math.pow(BASE, -2 * i / d);

const VectorInput = ({ vector, onChange, label }) => (
  <div className="flex items-center gap-2">
    <span className="w-4 font-mono text-sm">{label}</span>
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
        className="w-16 rounded border border-gray-300 bg-white p-1 text-center text-sm dark:border-gray-600 dark:bg-gray-700"
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
      <span className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">{label}</span>
      <svg viewBox="0 0 100 100" style={{ width: '120px', height: '120px' }}>
        <circle cx="50" cy="50" r="40" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1" className="dark:fill-gray-800/50 dark:stroke-gray-700" />
        <line x1="50" y1="10" x2="50" y2="12" stroke="#9ca3af" strokeWidth="1" />
        <line x1="90" y1="50" x2="88" y2="50" stroke="#9ca3af" strokeWidth="1" />
        <line x1="50" y1="90" x2="50" y2="88" stroke="#9ca3af" strokeWidth="1" />
        <line x1="10" y1="50" x2="12" y2="50" stroke="#9ca3af" strokeWidth="1" />

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
      <div className="mt-2 text-center font-mono text-xs text-gray-500 dark:text-gray-400">
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
  <div className="flex-1 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
    <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h4>
    <p className="mt-1 mb-3 text-sm text-gray-600 dark:text-gray-400">{description}</p>
    <div className="my-4 rounded-md bg-gray-50 p-2 text-center font-mono text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
      {formula}
    </div>
    {children}
  </div>
);

export const PEvsRoPEVisualizer = () => {
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
    <div className="not-content font-sans" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* --- Global Controls --- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <label htmlFor="pe-rope-pos" className="flex justify-between text-sm font-semibold text-gray-800 dark:text-gray-200">
            <span>토큰 위치 (m)</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400">{position}</span>
          </label>
          <input
            id="pe-rope-pos"
            type="range"
            min="0"
            max={MAX_POS}
            value={position}
            onChange={(e) => setPosition(Number(e.target.value))}
            className="mt-2 w-full"
          />
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <label htmlFor="pe-rope-clock" className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
            시계(주파수) 선택
          </label>
          <select
            id="pe-rope-clock"
            value={clockIndex}
            onChange={(e) => setClockIndex(Number(e.target.value))}
            className="mt-2 w-full rounded-md border-gray-300 bg-white text-sm dark:border-gray-600 dark:bg-gray-800"
          >
            {clockLabels.map((label, i) => (
              <option key={i} value={i}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* --- Visualizers --- */}
      <div className="flex flex-col gap-6 md:flex-row">
        {/* --- PE Section --- */}
        <VisualizerSection
          title="Positional Encoding (PE)"
          description="위치(m)에 따라 기준 벡터 [0,1]을 회전시켜 위치 벡터 p_m을 생성하고, 토큰 임베딩에 더합니다."
          formula={<>h<sub>m</sub> = x<sub>m</sub> + p<sub>m</sub></>}
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <Clock
              angle={peAngle}
              label={clockLabels[clockIndex]}
              vector={[0, 1]} // PE는 기준 벡터 [0,1]을 회전
              rotated={peRotated}
              isRoPE={false}
            />
            <div className="text-center">
              <p className="text-xs text-gray-500">
                PE는 토큰 정보와 무관하게,
                <br />
                위치 m에 대한 좌표값을 만듭니다.
              </p>
            </div>
          </div>
        </VisualizerSection>

        {/* --- RoPE Section --- */}
        <VisualizerSection
          title="Rotational PE (RoPE)"
          description="위치(m)에 따라 Query/Key 벡터 q_m 자체를 직접 회전시킵니다. 아래에서 q_m 값을 바꿔보세요."
          formula={<>q'<sub>m</sub> = R(mθ)q<sub>m</sub></>}
        >
          <div className="flex flex-col items-center justify-center gap-4">
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
              <p className="mt-1 text-center text-xs text-gray-500">
                RoPE는 토큰 정보를 담은 벡터를
                <br />
                위치 m만큼 회전시킵니다.
              </p>
            </div>
          </div>
        </VisualizerSection>
      </div>

      {/* --- Summary Table --- */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-full border-collapse text-left">
          <thead className="border-b border-gray-200 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-200">
            <tr>
              <th className="p-2">구분</th>
              <th className="p-2">PE (덧셈 방식)</th>
              <th className="p-2">RoPE (곱셈 방식)</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-600 dark:text-gray-400">
            <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
              <td className="p-2 font-medium">회전 대상</td>
              <td className="p-2">기준 벡터 [0, 1]</td>
              <td className="p-2">Query/Key 벡터 자체</td>
            </tr>
            <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
              <td className="p-2 font-medium">연산 방식</td>
              <td className="p-2">토큰 임베딩에 덧셈</td>
              <td className="p-2">회전 행렬 곱셈</td>
            </tr>
            <tr>
              <td className="p-2 font-medium">결과</td>
              <td className="p-2">위치 정보가 담긴 벡터 생성</td>
              <td className="p-2">내용과 위치 정보가 결합된 벡터</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PEvsRoPEVisualizer;