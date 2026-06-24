// Configuração de ambiente tipada e validada na inicialização (fail-fast).
// Regra de segurança: só chaves públicas podem ir ao client (prefixo VITE_*). Segredos
// (service_role, tokens, webhook secrets) ficam no servidor. Ver seguranca/baseline-minimo.md.
//
// Adapte o schema ao seu projeto. O objetivo é: se faltar/!= esperado, a app NÃO sobe.

import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Exemplos (descomente/adapte conforme o projeto):
  // Públicas (podem ir ao client):
  VITE_SUPABASE_URL: z.string().url().optional(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  // Servidor apenas (NUNCA no client):
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  CORS_ALLOWED_ORIGINS: z.string().optional(),
});

export type Env = z.infer<typeof schema>;

/**
 * Valida e retorna o env. Chame uma vez no boot (server) e exporte o resultado.
 * Lança erro legível listando o que falta — não silencie.
 */
export function carregarEnv(fonte: Record<string, string | undefined> = process.env): Env {
  const r = schema.safeParse(fonte);
  if (!r.success) {
    const problemas = r.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Configuração de ambiente inválida:\n${problemas}`);
  }
  return r.data;
}
