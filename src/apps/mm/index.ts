type MMApp = {
  start: () => Promise<void>;
  stop: () => Promise<void>;
};

const createMMApp = (): MMApp => {
  const start = async () => {
    console.log('MM Bot - Not implemented yet');
  };

  const stop = async () => {
    console.log('MM Bot - Not implemented yet');
  };

  return {
    start,
    stop,
  };
};

const main = async () => {
  const app = createMMApp();
  await app.start();
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
