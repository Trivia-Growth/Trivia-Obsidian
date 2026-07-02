import { describe, expect, it } from "vitest";
import { carregarEnv } from "./env";

describe("carregarEnv", () => {
  it("aplica default de NODE_ENV e aceita config válida", () => {
    const env = carregarEnv({ VITE_SUPABASE_URL: "https://x.supabase.co" });
    expect(env.NODE_ENV).toBe("development");
    expect(env.VITE_SUPABASE_URL).toBe("https://x.supabase.co");
  });

  it("falha (fail-fast) com mensagem legível quando a config é inválida", () => {
    expect(() => carregarEnv({ VITE_SUPABASE_URL: "nao-e-url" })).toThrow(/ambiente inválida/i);
  });
});
