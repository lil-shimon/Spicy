const createMMApp = () => {
  const start = async () => {
    console.log('MM Bot - Not implemented yet');
  };

  const stop = () => {
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
