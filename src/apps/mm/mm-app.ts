import type WebSocket from 'ws';
import { connectKucoinWSL2 } from '../../clients/kucoin/kucoin-ws';
import {
  handleL2Update,
  initFromSnapshot,
  OrderBookState,
} from '../../domain/mm/l2';

type MMApp = {
  start: () => Promise<void>;
  stop: () => Promise<void>;
};

const PAIR = 'BTC-USDT';

export const createMMApp = (): MMApp => {
  // snapshotの値を保持するstate.
  // wsで取得したsequenceとの比較で整合性を保つために使用する.
  let state: OrderBookState | null = null;
  let ws: WebSocket | null = null;

  const buffers = [];

  const start = async () => {
    // TODO: こちら側でmessageのlistenなどを行うようにする.
    ws = await connectKucoinWSL2({ pair: PAIR });

    state = await initFromSnapshot({ pair: PAIR });

    ws.on('message', (data) => {
      if (!state) {
        console.warn('Order book state is not initialized yet.');
        buffers.push(data);
        console.log(`Buffered message count: ${buffers.length}`);
        return;
      }

      const message = JSON.parse(data.toString());

      if (message.type !== 'message') {
        return;
      }

      handleL2Update(state, message.data);
    });

    // TODO: WebSocketで取得したsequenceを保持しておく。（スナップショット取得まで）
    // TODO: Snapshot取得したら、WebSocketで受け取ったmessageのsequenceと比較して整合性を保つ.
    // 同期的に処理を行ってしまうと、Snapshotで帰ってくるlastSequenceがWebSocketで最初に受け取るmessageのsequenceよりも小さい可能性があるため.
    // なので、一旦stateがない時は、bufferとしてmessageを貯めておいて、Snapshot取得後に処理を始めるようにする.
    // それか今の問題点としては初回のSnapshot取得時のsequenceとWebSocketで受け取れるsequenceが結構ズレるので
    // ずれていた場合はsnapshotを再取得。ずれている間はwebsocketのmessageはbufferingして、あっていたらクリア。
    // あっていなかった場合はbufferにメッセージを蓄積して、snapshotを再取得するなどのロジックが良さそう。
  };

  const stop = async () => {
    console.log('MM Bot - Not implemented yet');
  };

  return {
    start,
    stop,
  } as const;
};
