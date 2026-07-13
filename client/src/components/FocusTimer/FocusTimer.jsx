import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, ChevronUp, ChevronDown } from 'lucide-react';
import Button from '../Button/Button';
import './FocusTimer.css';

const MINUTE_OPTIONS = [5, 10, 15, 20, 25, 30, 40, 45, 50, 60, 75, 90, 105, 120];
const ITEM_HEIGHT = 56;

export default function FocusTimer({ onTimerStart, onTimerStop }) {
  const [selectedIdx, setSelectedIdx] = useState(4); // default 25 min
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(120);

  const currentPickerMinutes = isCustomMode ? customMinutes : MINUTE_OPTIONS[selectedIdx];

  // We need to freeze the 'minutes' used for the progress ring when the timer starts
  const [sessionMinutes, setSessionMinutes] = useState(currentPickerMinutes);
  const [timeLeft, setTimeLeft] = useState(currentPickerMinutes * 60);

  const [isActive, setIsActive] = useState(false);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const bellRef = useRef(null);
  const scrollRef = useRef(null);
  const scrollTimeout = useRef(null);

  // --- Keep timeLeft synced if the user changes the picker while NOT active ---
  useEffect(() => {
    if (!isSessionStarted && !isComplete) {
      setTimeLeft(currentPickerMinutes * 60);
      setSessionMinutes(currentPickerMinutes);
    }
  }, [currentPickerMinutes, isSessionStarted, isComplete]);

  // --- Timer countdown ---
  useEffect(() => {
    if (!isActive) return;
    if (timeLeft <= 0) {
      setIsActive(false);
      setIsComplete(true);
      setIsSessionStarted(false);
      onTimerStop?.();
      bellRef.current?.play().catch(() => {});
      return;
    }
    const tick = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(tick);
  }, [isActive, timeLeft, onTimerStop]);

  // --- Helper to scroll the drum to a given index ---
  const scrollToIdx = useCallback((idx, smooth = false) => {
    if (!scrollRef.current) return;
    const target = idx * ITEM_HEIGHT;
    if (smooth) {
      scrollRef.current.scrollTo({ top: target, behavior: 'smooth' });
    } else {
      scrollRef.current.scrollTop = target;
    }
  }, []);

  // --- On mount: center the default selection after DOM is ready ---
  useEffect(() => {
    if (!isCustomMode) {
      const t = setTimeout(() => scrollToIdx(selectedIdx), 60);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCustomMode]);

  // --- Handle scroll-end to snap selection ---
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || isSessionStarted) return;
    clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      if (!scrollRef.current) return;
      const newIdx = Math.round(scrollRef.current.scrollTop / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(MINUTE_OPTIONS.length - 1, newIdx));
      setSelectedIdx(clamped);
      scrollRef.current.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: 'smooth' });
    }, 120);
  }, [isSessionStarted]);

  const stepUp = () => {
    if (isSessionStarted || selectedIdx === 0) return;
    const next = selectedIdx - 1;
    setSelectedIdx(next);
    scrollToIdx(next, true);
  };

  const stepDown = () => {
    if (isSessionStarted || selectedIdx === MINUTE_OPTIONS.length - 1) return;
    const next = selectedIdx + 1;
    setSelectedIdx(next);
    scrollToIdx(next, true);
  };

  const selectItem = (i) => {
    if (isSessionStarted) return;
    setSelectedIdx(i);
    scrollToIdx(i, true);
  };

  const toggleTimer = () => {
    if (isComplete) {
      setIsComplete(false);
      setSessionMinutes(currentPickerMinutes);
      setTimeLeft(currentPickerMinutes * 60);
      setIsActive(true);
      setIsSessionStarted(true);
      onTimerStart?.();
      return;
    }
    if (!isActive) {
      setIsSessionStarted(true);
      onTimerStart?.();
    } else {
      onTimerStop?.();
    }
    setIsActive(prev => !prev);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsComplete(false);
    setIsSessionStarted(false);
    setSessionMinutes(currentPickerMinutes);
    setTimeLeft(currentPickerMinutes * 60);
    onTimerStop?.();
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isDisplayingTimer = isSessionStarted || isComplete;
  const progress = isDisplayingTimer ? ((sessionMinutes * 60 - timeLeft) / (sessionMinutes * 60)) * 100 : 0;

  return (
    <div className="focus-timer">
      <audio ref={bellRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />

      {isDisplayingTimer ? (
        <div className="ft-active-view">
          <div className="ft-ring-container">
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle
                cx="80" cy="80" r="70"
                fill="none"
                stroke={isComplete ? '#ff375f' : '#94F3E4'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - progress / 100)}`}
                transform="rotate(-90 80 80)"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div className="ft-ring-time" style={{ color: isComplete ? '#ff375f' : 'white' }}>
              {isComplete ? '✓' : formatTime(timeLeft)}
            </div>
          </div>
          {isComplete && (
            <div style={{ color: '#ff375f', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Session Complete!
            </div>
          )}
        </div>
      ) : (
        <div className="ft-picker-container">
          <div className="ft-picker-label" style={{ display: 'flex', justifyContent: 'space-between', width: '140px', alignItems: 'center' }}>
            <span>Focus Duration</span>
            <button 
              onClick={() => setIsCustomMode(!isCustomMode)}
              style={{ background: 'none', border: 'none', color: '#37AA9C', cursor: 'pointer', fontSize: '0.7rem', padding: '0 4px', fontWeight: 'bold' }}
              title="Toggle Custom Input"
            >
              {isCustomMode ? 'WHEEL' : 'CUSTOM'}
            </button>
          </div>

          {isCustomMode ? (
            <div style={{ height: '210px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="number" 
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ 
                    width: '100px', fontSize: '2.5rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)', 
                    color: '#94F3E4', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.5rem',
                    outline: 'none', fontWeight: '800'
                  }}
                  min="1"
                />
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '2px' }}>MINUTES</span>
              </div>
            </div>
          ) : (
            <div className="ft-drum-wrapper">
              <button className="ft-step-btn" onClick={stepUp} disabled={selectedIdx === 0}>
                <ChevronUp size={20} />
              </button>

              <div className="ft-drum-outer">
                <div className="ft-drum-highlight" />
                <div className="ft-drum-fade-top" />
                <div className="ft-drum-fade-bottom" />

                <div
                  ref={scrollRef}
                  className="ft-drum-scroll"
                  onScroll={handleScroll}
                >
                  {MINUTE_OPTIONS.map((m, i) => (
                    <div
                      key={m}
                      className={`ft-drum-item ${i === selectedIdx ? 'ft-drum-item--selected' : ''}`}
                      onClick={() => selectItem(i)}
                    >
                      <span className="ft-drum-num">{m}</span>
                      {i === selectedIdx && <span className="ft-drum-unit">min</span>}
                    </div>
                  ))}
                </div>
              </div>

              <button className="ft-step-btn" onClick={stepDown} disabled={selectedIdx === MINUTE_OPTIONS.length - 1}>
                <ChevronDown size={20} />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="timer-controls" style={{ marginTop: '0.5rem' }}>
        <Button
          variant="primary"
          onClick={toggleTimer}
          style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
        >
          {isActive ? <><Pause size={18} /> Pause</> : isComplete ? <><Play size={18} /> Again</> : <><Play size={18} /> Start</>}
        </Button>
        <button onClick={resetTimer} className="icon-btn" title="Reset">
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
}
