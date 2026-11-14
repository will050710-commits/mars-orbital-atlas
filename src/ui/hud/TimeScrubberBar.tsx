import { useCosmosStore } from '../../store/useCosmosStore';
export function TimeScrubberBar() {
  const timeScale = useCosmosStore((state) => state.timeScale);
  const setTimeScale = useCosmosStore((state) => state.setTimeScale);
  return <footer className="hud-bottom-bar glass-panel">
    <span>Chuyển động minh họa · không phải thời gian nhiệm vụ</span>
    <div className="time-preset-buttons" role="group" aria-label="Tốc độ xoay globe">
      {[0, 1, 100, 1000].map((speed) => <button key={speed}
        className={'time-preset-btn ' + (speed === timeScale ? 'is-active' : '')}
        aria-pressed={speed === timeScale} onClick={() => setTimeScale(speed)}>{speed === 0 ? 'Dừng' : speed + '×'}</button>)}
    </div>
  </footer>;
}
