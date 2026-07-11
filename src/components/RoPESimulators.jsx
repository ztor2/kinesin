import React, { useState } from 'react';

// 공통으로 사용할 다이얼(시계 바늘) 컴포넌트
const Dial = ({ angle, label, frozen, alarm }) => {
  // SVG 좌표계에서 12시 방향이 0도가 되도록 변환
  const x = 50 + 40 * Math.sin(angle);
  const y = 50 - 40 * Math.cos(angle);
  
  const strokeColor = frozen ? "#3b82f6" : (alarm ? "#ef4444" : "#1f2937");
  const bgColor = frozen ? "bg-blue-50 dark:bg-blue-900/30" : (alarm ? "bg-red-50 dark:bg-red-900/30" : "bg-transparent");

  return (
    <div 
      className={`p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${bgColor}`}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, minWidth: '120px' }}
    >
      <span className="font-semibold text-[13px] mb-2 text-gray-700 dark:text-gray-300 text-center">{label}</span>
      
      {/* Astro Starlight의 마크다운 전역 CSS 간섭을 막기 위해 
        SVG 요소의 크기에만 style 속성으로 강제 고정합니다. 
      */}
      <svg 
        viewBox="0 0 100 100" 
        style={{ width: '80px', height: '80px', minWidth: '80px', flexShrink: 0 }}
        className="rounded-full"
      >
        {/* 강제 흰색 배경 레이어 및 테두리 (SVG 내부에 직접 그려서 외부 CSS 간섭 차단) */}
        <circle cx="50" cy="50" r="49" fill="white" stroke="#d1d5db" strokeWidth="2" />
        
        {/* 시계 다이얼 눈금 */}
        <line x1="50" y1="10" x2="50" y2="15" stroke="#9ca3af" strokeWidth="2" />
        <line x1="90" y1="50" x2="85" y2="50" stroke="#9ca3af" strokeWidth="2" />
        <line x1="50" y1="90" x2="50" y2="85" stroke="#9ca3af" strokeWidth="2" />
        <line x1="10" y1="50" x2="15" y2="50" stroke="#9ca3af" strokeWidth="2" />
        
        {/* 바늘 */}
        <line x1="50" y1="50" x2={x} y2={y} stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="50" r="4" fill={strokeColor} />
      </svg>
      
      <div className="mt-3 text-xs font-mono text-gray-500">
        {(angle % (2 * Math.PI)).toFixed(2)} rad
      </div>
      {frozen && <span className="mt-1 text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">FROZEN (의미 채널)</span>}
      {alarm && <span className="mt-1 text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">의미 정렬 붕괴 위험</span>}
    </div>
  );
};

// 1. 시계 비유 시뮬레이터
export const RoPEClockSimulator = () => {
  const [position, setPosition] = useState(1);
  const [baseWavelength, setBaseWavelength] = useState(10000);

  const angleHigh = position * Math.pow(baseWavelength, -2 * (0) / 64);
  const angleMid = position * Math.pow(baseWavelength, -2 * (15) / 64);
  const angleLow = position * Math.pow(baseWavelength, -2 * (31) / 64);

  // 해결: Starlight CSS 무효화를 위해 "not-content" 유지 및 강제 Flex 인라인 스타일 적용
  return (
    <div className="font-sans not-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="text-center mb-2">
        <h3 className="text-lg font-bold mb-1 text-gray-800 dark:text-gray-100">RoPE 다중 주파수(시계 바늘) 시뮬레이터</h3>
        <p className="text-sm text-gray-500">위치를 이동하며 3가지 바늘의 회전 속도 차이를 관찰하세요.</p>
      </div>

      {/* 강제 가로 배치 레이아웃 */}
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
        <Dial angle={angleHigh} label="초침 (고주파수)" />
        <Dial angle={angleMid} label="분침 (중주파수)" />
        <Dial angle={angleLow} label="시침 (저주파수)" />
      </div>

      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label className="flex justify-between text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            <span>토큰 위치 (Position): {position}</span>
          </label>
          <input 
            type="range" min="0" max="1000" value={position} 
            onChange={(e) => setPosition(Number(e.target.value))}
            className="w-full cursor-pointer"
          />
        </div>
        <div>
          <label className="flex justify-between text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            <span>기준 파장 (Base Wavelength θ): {baseWavelength}</span>
          </label>
          <input 
            type="range" min="10" max="100000" step="10" value={baseWavelength} 
            onChange={(e) => setBaseWavelength(Number(e.target.value))}
            className="w-full cursor-pointer"
          />
          <p className="text-xs text-gray-400 mt-1">θ를 줄이면 시침이 빨라지고, 늘리면 시침이 더 느려집니다.</p>
        </div>
      </div>
    </div>
  );
};

// 2. 장기 문맥 시뮬레이터
export const PRoPEComparison = () => {
  const [distance, setDistance] = useState(0);
  const baseWavelength = 10000;
  
  const actualDistance = Math.floor(Math.pow(distance / 100, 3) * 500000); 

  const angleHigh = actualDistance * Math.pow(baseWavelength, -2 * (0) / 64);
  const angleLow = actualDistance * Math.pow(baseWavelength, -2 * (31) / 64);
  
  const isAlarm = angleLow > 1.0;

  // 해결: Starlight CSS 무효화를 위해 "not-content" 유지 및 강제 Flex 인라인 스타일 적용
  return (
    <div className="font-sans not-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="text-center mb-2">
        <h3 className="text-lg font-bold mb-1 text-gray-800 dark:text-gray-100">RoPE vs p-RoPE 장기 문맥 시뮬레이터</h3>
        <p className="text-sm text-gray-500">문맥 길이가 극한으로 길어질 때 저주파수(의미 채널)의 상태를 비교하세요.</p>
      </div>

      {/* 강제 가로 배치 레이아웃 */}
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: '24px' }}>
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 280px' }}>
          <h4 className="font-bold mb-4 text-center text-gray-800 dark:text-gray-200">기존 RoPE (Standard)</h4>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <Dial angle={angleHigh} label="고주파수" />
            <Dial angle={angleLow} label="저주파수" alarm={isAlarm} />
          </div>
        </div>

        <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 280px' }}>
          <h4 className="font-bold mb-4 text-center text-blue-800 dark:text-blue-300">p-RoPE (저주파수 절삭)</h4>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <Dial angle={angleHigh} label="고주파수" />
            <Dial angle={0} label="저주파수" frozen={true} />
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <label className="flex justify-between text-sm font-medium mb-2">
          <span className="font-bold text-indigo-600 dark:text-indigo-400">
            상대적 거리 (Distance): {actualDistance.toLocaleString()} 단어 떨어짐
          </span>
        </label>
        <input 
          type="range" min="0" max="100" value={distance} 
          onChange={(e) => setDistance(Number(e.target.value))}
          className="w-full cursor-pointer"
        />
        <p className="text-xs text-gray-500 mt-2">
          거리가 증가할수록 기존 RoPE의 저주파수(시침)마저 한 바퀴를 돌아버리며 의미 매칭이 무너집니다. 반면 p-RoPE는 거리에 상관없이 완벽하게 고정(Frozen)되어 있습니다.
        </p>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <div className="max-w-5xl mx-auto p-6" style={{ display: 'flex', flexDirection: 'column', gap: '64px' }}>
      <RoPEClockSimulator />
      <hr className="border-t border-gray-300 dark:border-gray-700" />
      <PRoPEComparison />
    </div>
  );
}