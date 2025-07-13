import { vi } from "vitest";

// CI環境でAPI keyが設定されていないためテストが失敗するのを防ぐ
vi.stubEnv("MEXC_API_KEY", "test-api-key");
vi.stubEnv("MEXC_SECRET", "test-secret");
vi.stubEnv("BYBIT_API_KEY", "test-api-key");
vi.stubEnv("BYBIT_SECRET", "test-secret");