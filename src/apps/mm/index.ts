import { createMMApp } from './mm-app';

const main = async () => {
  const app = createMMApp();
  await app.start();
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
