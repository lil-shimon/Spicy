/**
 * Websocket subscribe message type
 */
type Message = {
  /**
   * Websocket channel name (e.g. ticker)
   */
  channel: string;
  /**
   * Websocket symbol (e.g. BTC)
   */
  symbol: string;
};

export const generateSubscribeMessage = ({ symbol, channel }: Message) => {
  const message = {
    command: 'subscribe',
    channel,
    symbol,
  };

  return JSON.stringify(message);
};
