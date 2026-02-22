function App() {
  const url = 'ws://localhost:8080/ws';
  const ws = new WebSocket(url);

  ws.onopen = () => {
    console.log('WebSocket connection established');
  };

  return (
    <div>
      <h1>stark</h1>
    </div>
  );
}

export default App;
