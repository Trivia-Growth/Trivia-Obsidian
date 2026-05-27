# Relatório de Implementação — Fluxos de Atendimento
**Grupo Previx** · grupoprevix.com.br
**Data:** 27/05/2026

---

## O que foi implementado

Foram criados dois pontos de atendimento inteligente no site, ambos com fluxo conversacional guiado que coleta as informações do visitante antes de direcioná-lo ao canal correto.

---

## 1. Botão flutuante de WhatsApp

Presente em **todas as páginas** do site, fixo no canto inferior direito. Ao clicar, abre um chat com três opções de atendimento:

![Homepage com botão WhatsApp visível no canto inferior direito]

**Ao clicar no botão, o visitante vê:**

| Opção | O que acontece |
|---|---|
| **Proposta Comercial** | Coleta nome → email → serviço de interesse → gera link direto para o WhatsApp comercial com mensagem pré-preenchida |
| **Administrativo / SAC** | Coleta nome → email → exibe telefones (+55 11 3875-1148 e 0800 515 0000) e email institucional |
| **Trabalhe Conosco** | Coleta nome → email → exibe email de RH (rh@grupoprevix.com.br) com instrução para envio de currículo |

### Fluxo Proposta Comercial — do início ao botão de WhatsApp:

![Widget com fluxo completo e botão verde "Iniciar conversa no WhatsApp"]

O botão verde ao final redireciona para o WhatsApp com a mensagem já formatada:
> *"Olá! Sou [Nome], tenho interesse em [Serviço]. Meu email: [email]"*

---

## 2. Página de Orçamentos & Contato (`/contato`)

Página dedicada com o mesmo chat conversacional, em formato expandido e centralizado. Exibe as mesmas três opções de atendimento e, ao final do fluxo de Proposta Comercial, apresenta o mesmo botão verde de redirecionamento ao WhatsApp.

![Página /contato com chat centralizado e as 3 opções de atendimento]

![Página /contato — fluxo completo com botão "Iniciar conversa no WhatsApp"]

O rodapé do chat também exibe os telefones de contato direto:
> *"Prefere ligar? +55 11 3875-1148 · 0800 515 0000 (24h)"*

---

## Resumo técnico

- **Número WhatsApp configurado:** +55 11 94764-4577
- **Mensagem pré-preenchida:** inclui nome, serviço e email do visitante
- **Serviços disponíveis no fluxo comercial:** Vigilância Patrimonial, Segurança Eletrônica, Portaria e Controle de Acesso, Facilities / Multisserviços, Outros
- **Status:** Todos os fluxos testados e funcionando corretamente em 27/05/2026

---

*Implementação realizada pela Trívia Studio*
