---
id: STORY-010
titulo: "Gestão de Usuários"
fase: 1
modulo: usuarios
status: em-progresso
prioridade: alta
agente_responsavel: "Claude Code"
criado: 2026-06-12
atualizado: 2026-06-12
---

# STORY-010 — Gestão de Usuários

## Contexto

O admin do sistema precisa **cadastrar os usuários reais** (líderes, financeiro), definir o **papel** de cada um e **alocá-los nos departamentos** com a função correta (presidente valida / tesoureiro lança). Hoje a criação é feita na mão via API — falta a tela.

Por segurança, **não há auto-cadastro aberto**. Criar login exige `service_role` (o navegador com anon key não pode), então a criação passa por uma **Edge Function** gateada a admin.

## Critérios de Aceite

- [ ] Página `/usuarios` visível **só para admin**
- [ ] Lista usuários (nome, e-mail, papel) — via RPC que junta `auth.users`
- [ ] **Criar usuário**: e-mail + nome + papel + senha temporária (Edge Function `admin-criar-usuario`, gateada a admin, `service_role`)
- [ ] **Alterar papel** (líder/financeiro/admin) — admin pode (RLS já permite; trigger anti-escalonamento libera admin)
- [ ] **Vincular usuário a departamento(s)** com função presidente/tesoureiro (reusa `responsaveis`)
- [ ] **Redefinir senha** de um usuário (Edge Function)
- [ ] Tela mostra a senha temporária gerada para repassar ao usuário

## Segurança 🔒

- Edge Function valida JWT (`auth.getUser()`) e confirma `papel = admin` antes de qualquer ação; `service_role` só dentro dela.
- Input validado; e-mail único; senha forte mínima.
- RPC de listagem `SECURITY DEFINER`, exposta só a admin/financeiro.
- Não vazar `service_role` no frontend.

## Notas

- Mudança de papel não precisa de Edge Function (RLS `perfil_update_proprio` + trigger `protege_papel` já permitem admin).
- Vínculo+função já existe (`definirFuncao`/`responsaveis`) — reaproveitar.
