import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 개별 슬라이드 파트 컴포넌트
export const SlidePart = ({ children, title }) => {
  return (
    <div className="slide-part-wrapper" data-slide-title={title} style={{ marginBottom: '16px' }}>
      {children}
    </div>
  );
};

export const SectionSlider = ({ children }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSlideMode, setIsSlideMode] = useState(true);
  const [slides, setSlides] = useState([]);
  const hiddenRef = useRef(null);

  // DOM이 실제로 마운트된 후 HTML 슬라이드 파트들 탐색 및 슬라이드 배열 파싱
  useEffect(() => {
    if (!hiddenRef.current) return;

    const container = hiddenRef.current;
    
    // 1. .slide-part-wrapper 태그 탐색
    let partElements = Array.from(container.querySelectorAll('.slide-part-wrapper'));
    
    // 2. 만약 .slide-part-wrapper가 없다면 h2/h3 태그를 기준으로 자동 분리
    if (partElements.length === 0) {
      const allChildren = Array.from(container.children);
      const tempSlides = [];
      let currentItems = [];
      let currentTitle = 'Intro';

      allChildren.forEach((child) => {
        const heading = child.querySelector('h2, h3') || (['H2', 'H3'].includes(child.tagName) ? child : null);
        if (heading) {
          if (currentItems.length > 0) {
            tempSlides.push({ title: currentTitle, html: currentItems.map(item => item.outerHTML).join('') });
          }
          currentTitle = heading.textContent?.trim() || 'Part';
          currentItems = [child];
        } else {
          currentItems.push(child);
        }
      });

      if (currentItems.length > 0) {
        tempSlides.push({ title: currentTitle, html: currentItems.map(item => item.outerHTML).join('') });
      }

      setSlides(tempSlides);
      return;
    }

    // SlidePart 태그가 명시적으로 존재하는 경우
    const parsed = partElements.map((el, idx) => {
      const title = el.getAttribute('data-slide-title') || el.querySelector('h3, h2')?.textContent?.trim() || `Part ${idx + 1}`;
      return {
        title,
        html: el.innerHTML
      };
    });

    setSlides(parsed);
  }, [children]);

  // 키보드 방향키 탐색 지원
  useEffect(() => {
    if (!isSlideMode) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSlideMode, currentIndex, slides.length]);

  const nextSlide = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="section-slider-root" style={{ width: '100%', position: 'relative', margin: '20px 0' }}>
      {/* 폰트 및 테마 변수 유틸리티 */}
      <style>{`
        .gmarket-font {
          font-family: 'GmarketSans', 'Plus Jakarta Sans', 'Noto Sans KR', sans-serif !important;
        }
        .num-font {
          font-family: 'JetBrains Mono', monospace !important;
        }
        
        .section-slider-card {
          background-color: var(--sl-color-bg-nav, #ffffff);
          color: var(--sl-color-text, #0f172a);
          border: 1px solid var(--sl-color-hairline, #e2e8f0);
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.08);
        }

        .section-slider-header {
          background-color: var(--sl-color-bg-inline-code, #f8fafc);
          border: 1px solid var(--sl-color-hairline, #e2e8f0);
        }

        .section-slider-btn {
          background-color: var(--sl-color-bg-nav, #ffffff);
          color: var(--sl-color-text, #334155);
          border: 1px solid var(--sl-color-hairline, #cbd5e1);
        }
      `}</style>

      {/* DOM 분리를 위한 숨김 컨테이너 (visibility hidden 사용으로 DOM 렌더링 유지) */}
      <div 
        ref={hiddenRef} 
        style={{ 
          position: 'absolute', 
          top: -9999, 
          left: -9999, 
          opacity: 0, 
          pointerEvents: 'none',
          height: 0,
          overflow: 'hidden'
        }}
      >
        {children}
      </div>

      {/* 모드 전환 컨트롤 헤더 */}
      <div 
        className="section-slider-header"
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '16px',
          padding: '12px 18px',
          borderRadius: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="gmarket-font" style={{ fontSize: '13.5px', fontWeight: '700' }}>
            {isSlideMode 
              ? `Part ${currentIndex + 1} / ${slides.length || 1} : ${slides[currentIndex]?.title || ''}` 
              : '전체 문서'}
          </span>
        </div>

        <button
          onClick={() => setIsSlideMode(!isSlideMode)}
          className="gmarket-font section-slider-btn"
          style={{
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: '700',
            borderRadius: '9px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          {isSlideMode ? '전체 문서 보기' : '슬라이드 보기'}
        </button>
      </div>

      {/* 모드 A: DOM 기반 슬라이드 카드 뷰 */}
      {isSlideMode ? (
        <div style={{ position: 'relative', minHeight: '350px' }}>
          {/* 상단 프로그레스 바 */}
          <div style={{ height: '4px', width: '100%', backgroundColor: 'var(--sl-color-hairline, #e2e8f0)', borderRadius: '2px', marginBottom: '16px', overflow: 'hidden' }}>
            <motion.div 
              animate={{ width: `${((currentIndex + 1) / (slides.length || 1)) * 100}%` }}
              transition={{ duration: 0.3 }}
              style={{ height: '100%', background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }}
            />
          </div>

          {/* 메인 슬라이드 카드 컨테이너 */}
          <div 
            className="section-slider-card"
            style={{ 
              position: 'relative',
              borderRadius: '20px',
              padding: '24px 28px',
              overflow: 'hidden'
            }}
          >
            <AnimatePresence mode="wait">
              {slides.length > 0 && (
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 25 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -25 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="sl-markdown-content"
                  dangerouslySetInnerHTML={{ __html: slides[currentIndex].html }}
                />
              )}
            </AnimatePresence>
          </div>

          {/* 하단 네비게이션 좌/우 버튼 */}
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginTop: '16px' 
            }}
          >
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="gmarket-font section-slider-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: '700',
                borderRadius: '12px',
                opacity: currentIndex === 0 ? 0.4 : 1,
                cursor: currentIndex === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <span>◀</span> 이전 파트
            </button>

            <span className="num-font" style={{ fontSize: '13px', fontWeight: '700', opacity: 0.8 }}>
              {currentIndex + 1} / {slides.length}
            </span>

            <button
              onClick={nextSlide}
              disabled={currentIndex === slides.length - 1}
              className="gmarket-font"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: '700',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: currentIndex === slides.length - 1 ? 'var(--sl-color-hairline, #cbd5e1)' : '#4f46e5',
                color: '#ffffff',
                opacity: currentIndex === slides.length - 1 ? 0.4 : 1,
                cursor: currentIndex === slides.length - 1 ? 'not-allowed' : 'pointer',
                boxShadow: currentIndex === slides.length - 1 ? 'none' : '0 4px 12px rgba(79, 70, 229, 0.3)'
              }}
            >
              다음 파트 <span>▶</span>
            </button>
          </div>
        </div>
      ) : (
        /* 모드 B: 전체 스크롤 뷰 */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="sl-markdown-content">
          {children}
        </div>
      )}
    </div>
  );
};

export default SectionSlider;
