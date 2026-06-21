---
tipo: demo-e2e
projeto: TriviaEdutech
gerado_em: 2026-06-18
tenant: ESCOLA TEOLÓGICA SÃ DOUTRINA (ETSD)
tenant_id: e7c8d42e-ad16-4a9a-8eac-b57cc6504815
---

# Demonstração End-to-End — TriviaEdutech (ETSD)

> Teste E2E feito **sobre o tenant real da ETSD**, que já tem os cursos com vídeo importados do Vimeo (83 cursos / 563 aulas). Criamos 3 alunos de teste e exercitamos todos os fluxos (edge functions + triggers) sobre os cursos reais. Tudo verificado e **salvo no banco** em 18/06/2026.

## Credenciais

| Papel | Nome | E-mail | Senha |
|---|---|---|---|
| Admin | João Novais | joaonovais@editoraheziom.com.br | `Senh@123@#` |
| Aluno ⭐ | Mateus Souza | aluno.mateus@etsd-demo.com.br | `Demo@1234` |
| Aluno | Priscila Lima | aluno.priscila@etsd-demo.com.br | `Demo@1234` |
| Aluno | Rafael Gomes | aluno.rafael@etsd-demo.com.br | `Demo@1234` |

**Conta mais rica para apresentar:** Mateus Souza — 170 pts, 3 badges, certificado, curso "Adoração Agradável a Deus" 100% concluído, boletim com prova, notificações.

## Conteúdo usado (real da ETSD)

- Curso principal: **Adoração Agradável a Deus** (5 aulas com vídeo) — usado na jornada completa
- 2º curso: **A LINGUAGEM DAS CORES** (8 aulas) — na trilha
- Criados para a demo: 1 trilha ("Trilha de Formação (Demo)"), 1 quiz (numa aula real de Adoração), 1 atividade, 1 post de comunidade

## Edge functions exercitadas (JWT real)

- `submit-quiz` → Mateus **2/2 (100%, aprovado)**
- `submit-activity` (submit + grade) → Priscila entregou, João corrigiu **8/10**

## Verificação — tudo se alimentando

**Notificações por triggers (STORY-046):**

| Destinatário | Notificações |
|---|---|
| Mateus | 3× badge, 1× certificado/curso concluído, 1× matrícula |
| Priscila | atividade corrigida, badge, matrícula |
| Rafael | **2× matrícula** (uma por curso da trilha) |
| João (admin) | comentário + like + mensagem |

**Gamificação no banco (STORY-048):**
- Mateus: **170 pts** (5 aulas×10 + curso 100 + 1º comentário 20) · badges `course_complete`, `first_comment`, `first_lesson`
- Priscila: 20 pts (2 aulas) · badge `first_lesson`

**Jornadas antes quebradas, agora fechadas:**
- **Trilha → matrícula real:** Rafael matriculado em Adoração + A Linguagem das Cores (STORY-044)
- **Atividade → boletim:** nota 8/10 da Priscila aparece no boletim (STORY-045)
- **Prazo de atividade → calendário** (STORY-047)
- **Conclusão → certificado:** Mateus, Adoração Agradável a Deus (código ETSD-…)

## Limpeza (se quiser remover só os dados de teste)

Os 3 alunos de teste e o conteúdo de demo (trilha/quiz/atividade/post) foram adicionados ao tenant real — NÃO usar `delete_tenant_cascade` aqui (apagaria a ETSD inteira). Para remover só o teste: excluir os 3 usuários (`aluno.mateus@`, `aluno.priscila@`, `aluno.rafael@`) e os registros de trilha/quiz/atividade/post criados em 18/06. Posso fazer essa limpeza pontual quando você pedir.
