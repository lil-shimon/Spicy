import { beforeEach, describe, it, vi, expect } from "vitest";
import { postMessage } from "./post-message";

describe("Post Message", () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    global.fetch = vi.fn();
    process.env = {
      ...OLD_ENV,
      DISCORD_WEBHOOK_URL:
        "https://discord.com/api/webhooks/1234567890/abcdefg",
    };
  });
  it("should post a message to Discord", async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
    });

    const result = await postMessage("Test message");
    expect(result).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      "https://discord.com/api/webhooks/1234567890/abcdefg",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: "Test message" }),
      }
    );
  });

  it("should return false if webhook URL is not set", async () => {
    process.env.DISCORD_WEBHOOK_URL = "";
    const result = await postMessage("Test message");
    expect(result).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("should return false if fetch fails", async () => {
    (fetch as any).mockRejectedValue(new Error("Network error"));
    const result = await postMessage("Test message");
    expect(result).toBe(false);
    expect(fetch).toHaveBeenCalled();
  });

  it("should return false if response is not ok", async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    const result = await postMessage("Test message");
    expect(result).toBe(false);
    expect(fetch).toHaveBeenCalled();
  });
});
