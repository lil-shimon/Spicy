import { useEffect, useRef } from 'react';
import { CandlestickSeries, createChart } from 'lightweight-charts';

function App() {
  const url = 'ws://localhost:8080/ws';
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current);
    const series = chart.addSeries(CandlestickSeries);
    const ws = new WebSocket(url);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      series.update(data);
    };

    return () => {
      chart.remove();
      ws.close();
    };
  }, []);

  return (
    <div>
      <h1>stark</h1>
      <div ref={containerRef} style={{ width: '100%', height: 600 }}></div>
    </div>
  );
}

export default App;
