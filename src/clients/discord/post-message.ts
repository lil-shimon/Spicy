import 'dotenv/config';

export const postMessage = async (message: string): Promise<boolean> => {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error('Discord webhook URLが環境変数に設定されていません。');
      return false;
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: message,
      }),
    });

    if (!response.ok) {
      console.error(
        `Discordのメッセージ送信に失敗しました ${response.status} ${response.statusText}`
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error('Discordのメッセージ送信に失敗しました:', error);
    return false;
  }
};
