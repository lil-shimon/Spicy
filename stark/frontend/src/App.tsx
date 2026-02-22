import { useEffect, useRef } from 'react';
import { CandlestickSeries, createChart } from 'lightweight-charts';

function App() {
  const url = 'ws://localhost:8080/ws';
  const ws = new WebSocket(url);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current);
    const series = chart.addSeries(CandlestickSeries);
    return () => chart.remove();
  }, []);

  ws.onopen = () => {
    console.log('WebSocket connection established');
  };

  return (
    <div>
      <h1>stark</h1>
      <div ref={containerRef} style={{ width: '100%', height: 600 }}></div>
    </div>
  );
}

export default App;
