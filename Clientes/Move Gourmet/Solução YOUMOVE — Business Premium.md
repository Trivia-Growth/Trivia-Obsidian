---
tags:
  - solução
  - fluxo
  - youmove
  - appstle
  - business-premium
cliente: Move Gourmet
data: 2026-06-29
status: proposta
---

# Solução YOUMOVE — Business Premium

> Baseado em [[Diagnóstico Appstle - Jun 2026]]. Detalha os problemas, os fluxos corrigidos e o que o upgrade para Business Premium resolve.

---

## 1. Problemas identificados

<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0">

<div style="background:#fef2f2;border:1.5px solid #ef4444;border-radius:8px;padding:12px">
<strong style="color:#dc2626">🔴 CRÍTICO — Gateway incompatível</strong><br>
<small style="color:#7f1d1d">Mercado Pago não suporta Shopify Subscriptions API. Nenhuma cobrança recorrente funciona. Bloqueador de tudo.</small>
</div>

<div style="background:#fef2f2;border:1.5px solid #ef4444;border-radius:8px;padding:12px">
<strong style="color:#dc2626">🔴 CRÍTICO — Clube nunca saiu do papel</strong><br>
<small style="color:#7f1d1d">1 teste cancelado (Fernanda, R$0). Zero clientes reais. Zero receita de assinaturas gerada até hoje.</small>
</div>

<div style="background:#fff7ed;border:1.5px solid #f59e0b;border-radius:8px;padding:12px">
<strong style="color:#92400e">🟡 MÉDIO — Troca de produtos por WhatsApp</strong><br>
<small style="color:#78350f">Produtos fixos desde o 1º mês. Para mudar, cliente fala com a equipe manualmente. Não escala.</small>
</div>

<div style="background:#fff7ed;border:1.5px solid #f59e0b;border-radius:8px;padding:12px">
<strong style="color:#92400e">🟡 MÉDIO — Plano Anual à vista sem produtos</strong><br>
<small style="color:#78350f">0 produtos vinculados. Cliente não consegue assinar por este plano nem com o gateway resolvido.</small>
</div>

<div style="background:#fff7ed;border:1.5px solid #f59e0b;border-radius:8px;padding:12px">
<strong style="color:#92400e">🟡 MÉDIO — "Anual Parcelado" mal configurado</strong><br>
<small style="color:#78350f">Billing idêntico ao "à vista" (12 meses de uma vez). "Parcelado" implica parcelas mensais — inconsistência.</small>
</div>

<div style="background:#fff7ed;border:1.5px solid #f59e0b;border-radius:8px;padding:12px">
<strong style="color:#92400e">🟡 MÉDIO — Desconto zerado na renovação</strong><br>
<small style="color:#78350f">20%/10% somente no 1º ciclo. No 2º, preço cheio. Clientes vão estranhar → risco de churn na renovação.</small>
</div>

<div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:8px;padding:12px">
<strong style="color:#166534">🟢 BAIXO — Tipo de swap inadequado</strong><br>
<small style="color:#14532d">Swap permanente (muda todos os meses futuros). YOUMOVE precisa de swap por entrega, não permanente.</small>
</div>

<div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:8px;padding:12px">
<strong style="color:#166534">🟢 BAIXO — Frequency Change Method</strong><br>
<small style="color:#14532d">Configurado como "Legacy list". Appstle recomenda "Compatible only" para mostrar só frequências válidas.</small>
</div>

</div>

---

## 2. Fluxo do cliente — Antes × Depois

<svg viewBox="0 0 720 530" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;border-radius:10px;border:1px solid #e2e8f0;background:#ffffff;display:block">
  <defs>
    <marker id="ag" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#94a3b8"/></marker>
    <marker id="ar" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#ef4444"/></marker>
    <marker id="agn" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#22c55e"/></marker>
    <marker id="ab" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#3b82f6"/></marker>
  </defs>

  <!-- Header -->
  <rect width="720" height="36" fill="#1e293b" rx="10"/>
  <rect y="26" width="720" height="10" fill="#1e293b"/>
  <text x="360" y="23" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" font-weight="bold" fill="white">Fluxo do Cliente — Antes × Depois</text>

  <!-- Column headers -->
  <rect x="8" y="42" width="340" height="26" rx="5" fill="#fef2f2"/>
  <text x="178" y="60" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" font-weight="bold" fill="#dc2626">HOJE (bloqueado)</text>
  <rect x="372" y="42" width="340" height="26" rx="5" fill="#f0fdf4"/>
  <text x="542" y="60" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="bold" fill="#15803d">COM STRIPE + BUSINESS PREMIUM</text>

  <!-- Divider -->
  <line x1="360" y1="36" x2="360" y2="526" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="5,4"/>

  <!-- ===== LEFT SIDE ===== -->

  <!-- L1 -->
  <rect x="16" y="80" width="328" height="44" rx="7" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="180" y="99" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="600" fill="#334155">1. Acessa a loja</text>
  <text x="180" y="115" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#64748b">movegourmet.com.br</text>
  <line x1="180" y1="124" x2="180" y2="136" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#ag)"/>

  <!-- L2 -->
  <rect x="16" y="138" width="328" height="44" rx="7" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="180" y="157" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="600" fill="#334155">2. Vê widget de assinatura</text>
  <text x="180" y="173" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#64748b">Escolhe plano e produtos do kit inicial</text>
  <line x1="180" y1="182" x2="180" y2="194" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#ag)"/>

  <!-- L3 -->
  <rect x="16" y="196" width="328" height="44" rx="7" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="180" y="215" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="600" fill="#334155">3. Vai para o checkout</text>
  <text x="180" y="231" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#64748b">Mercado Pago disponível como gateway</text>
  <line x1="180" y1="240" x2="180" y2="254" stroke="#ef4444" stroke-width="2" marker-end="url(#ar)"/>

  <!-- FAIL -->
  <rect x="16" y="256" width="328" height="58" rx="7" fill="#fef2f2" stroke="#ef4444" stroke-width="2"/>
  <text x="180" y="278" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" font-weight="bold" fill="#dc2626">❌  FALHA — Assinatura não processa</text>
  <text x="180" y="295" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#991b1b">Mercado Pago não suporta Shopify Subscriptions API.</text>
  <text x="180" y="308" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#991b1b">Cobrança recorrente automática é impossível.</text>
  <line x1="180" y1="314" x2="180" y2="328" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#ag)"/>

  <!-- WhatsApp -->
  <rect x="16" y="330" width="328" height="44" rx="7" fill="#fff7ed" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="180" y="349" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="600" fill="#92400e">4. Cliente avisa por WhatsApp</text>
  <text x="180" y="365" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#78350f">Equipe processa cada pedido manualmente todo mês</text>

  <!-- Result -->
  <rect x="16" y="392" width="328" height="54" rx="7" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="5,4"/>
  <text x="180" y="412" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#64748b">Resultado atual: 0 assinantes reais.</text>
  <text x="180" y="428" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#64748b">1 teste cancelado (Fernanda), R$0 gerado.</text>
  <text x="180" y="441" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" font-weight="bold" fill="#dc2626">Clube YOUMOVE nunca saiu do papel.</text>

  <!-- ===== RIGHT SIDE ===== -->

  <!-- R1 -->
  <rect x="372" y="80" width="340" height="44" rx="7" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
  <text x="542" y="99" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="600" fill="#15803d">1. Acessa loja → página Kit YOUMOVE</text>
  <text x="542" y="115" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#166534">Página dedicada com Build-A-Box integrado</text>
  <line x1="542" y1="124" x2="542" y2="136" stroke="#22c55e" stroke-width="1.5" marker-end="url(#agn)"/>

  <!-- R2 -->
  <rect x="372" y="138" width="340" height="44" rx="7" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
  <text x="542" y="157" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="600" fill="#15803d">2. Monta o kit (Build-A-Box)</text>
  <text x="542" y="173" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#166534">Escolhe 5 de 23 produtos disponíveis</text>
  <line x1="542" y1="182" x2="542" y2="194" stroke="#22c55e" stroke-width="1.5" marker-end="url(#agn)"/>

  <!-- R3 -->
  <rect x="372" y="196" width="340" height="44" rx="7" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
  <text x="542" y="215" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="600" fill="#15803d">3. Escolhe plano + paga via Stripe ✅</text>
  <text x="542" y="231" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#166534">Cartão salvo para cobranças automáticas futuras</text>
  <line x1="542" y1="240" x2="542" y2="254" stroke="#22c55e" stroke-width="1.5" marker-end="url(#agn)"/>

  <!-- R4 -->
  <rect x="372" y="256" width="340" height="44" rx="7" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
  <text x="542" y="275" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="600" fill="#15803d">4. ✅ Kit #1 enviado automaticamente</text>
  <text x="542" y="291" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#166534">Pedido gerado. Cobrança processada. Sem intervenção.</text>
  <line x1="542" y1="300" x2="542" y2="314" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#ab)"/>

  <!-- R5 -->
  <rect x="372" y="316" width="340" height="44" rx="7" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="542" y="335" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="600" fill="#1d4ed8">5. Email automático de lembrete</text>
  <text x="542" y="351" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#1e40af">"Personalize seu kit do próximo mês" (X dias antes)</text>
  <line x1="542" y1="360" x2="542" y2="374" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#ab)"/>

  <!-- R6 -->
  <rect x="372" y="376" width="340" height="44" rx="7" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="542" y="395" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="600" fill="#1d4ed8">6. Acessa portal → remonta kit</text>
  <text x="542" y="411" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#1e40af">Autonomia total. Zero WhatsApp. Zero trabalho manual.</text>
  <line x1="542" y1="420" x2="542" y2="434" stroke="#22c55e" stroke-width="1.5" marker-end="url(#agn)"/>

  <!-- R7 -->
  <rect x="372" y="436" width="340" height="46" rx="7" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
  <text x="542" y="456" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="#14532d">7. ♻️ Pedido + cobrança automáticos</text>
  <text x="542" y="472" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#15803d">Ciclo mensal recorrente. Zero esforço da equipe.</text>

  <!-- Loop arrow -->
  <path d="M 712 459 C 726 459 726 397 712 397" stroke="#22c55e" stroke-width="1.5" fill="none" marker-end="url(#agn)"/>
  <text x="719" y="430" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9" fill="#16a34a" transform="rotate(-90,719,430)">repete</text>

</svg>

---

## 3. Fluxo de gestão — Admin (Business Premium)

<svg viewBox="0 0 720 460" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;border-radius:10px;border:1px solid #e2e8f0;background:#ffffff;display:block">
  <defs>
    <marker id="ad" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#6366f1"/></marker>
    <marker id="ag2" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#94a3b8"/></marker>
  </defs>

  <!-- Header -->
  <rect width="720" height="36" fill="#1e293b" rx="10"/>
  <rect y="26" width="720" height="10" fill="#1e293b"/>
  <text x="360" y="23" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" font-weight="bold" fill="white">Fluxo de Gestão — Admin (Business Premium)</text>

  <!-- ===== FASE 1: CONFIGURAÇÃO INICIAL ===== -->
  <rect x="8" y="44" width="704" height="18" rx="4" fill="#f1f5f9"/>
  <text x="360" y="57" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" font-weight="bold" fill="#475569">FASE 1 — CONFIGURAÇÃO INICIAL (UMA VEZ)</text>

  <!-- Config boxes -->
  <rect x="12" y="68" width="164" height="52" rx="7" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="94" y="86" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="600" fill="#1d4ed8">1. Instalar Stripe</text>
  <text x="94" y="100" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9.5" fill="#1e40af">Gateway compatível com</text>
  <text x="94" y="112" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9.5" fill="#1e40af">Shopify Subscriptions API</text>

  <rect x="184" y="68" width="164" height="52" rx="7" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
  <text x="266" y="86" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="600" fill="#15803d">2. Configurar Build-A-Box</text>
  <text x="266" y="100" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9.5" fill="#166534">Catálogo de produtos + regras</text>
  <text x="266" y="112" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9.5" fill="#166534">(qtd min/max por kit)</text>

  <rect x="356" y="68" width="164" height="52" rx="7" fill="#fefce8" stroke="#eab308" stroke-width="1.5"/>
  <text x="438" y="86" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="600" fill="#713f12">3. Corrigir os planos</text>
  <text x="438" y="100" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9.5" fill="#92400e">Adicionar produtos ao Anual à vista</text>
  <text x="438" y="112" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9.5" fill="#92400e">Renomear "Parcelado" corretamente</text>

  <rect x="528" y="68" width="184" height="52" rx="7" fill="#fdf4ff" stroke="#a855f7" stroke-width="1.5"/>
  <text x="620" y="86" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="600" fill="#6b21a8">4. Portal do cliente</text>
  <text x="620" y="100" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9.5" fill="#7e22ce">Habilitar: cancelar, pausar, trocar</text>
  <text x="620" y="112" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9.5" fill="#7e22ce">produtos + frequency "Compatible only"</text>

  <!-- Arrow down -->
  <line x1="360" y1="120" x2="360" y2="136" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#ag2)"/>

  <!-- ===== FASE 2: OPERAÇÃO MENSAL ===== -->
  <rect x="8" y="140" width="704" height="18" rx="4" fill="#f1f5f9"/>
  <text x="360" y="153" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" font-weight="bold" fill="#475569">FASE 2 — OPERAÇÃO MENSAL</text>

  <!-- Admin actions row label -->
  <text x="16" y="178" font-family="system-ui,sans-serif" font-size="9" font-weight="bold" fill="#6366f1">ADMIN FAZ:</text>

  <rect x="12" y="184" width="214" height="52" rx="7" fill="#f5f3ff" stroke="#6366f1" stroke-width="1.5"/>
  <text x="119" y="202" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="600" fill="#4338ca">Automatic Product Swap</text>
  <text x="119" y="217" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9.5" fill="#4f46e5">Troca kit padrão em massa para</text>
  <text x="119" y="229" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9.5" fill="#4f46e5">todos os assinantes de uma vez</text>

  <rect x="234" y="184" width="214" height="52" rx="7" fill="#f5f3ff" stroke="#6366f1" stroke-width="1.5"/>
  <text x="341" y="202" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="600" fill="#4338ca">Campaigns</text>
  <text x="341" y="217" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9.5" fill="#4f46e5">Notificar segmentos de assinantes</text>
  <text x="341" y="229" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9.5" fill="#4f46e5">(ex: "personalize seu kit de agosto")</text>

  <rect x="456" y="184" width="256" height="52" rx="7" fill="#f5f3ff" stroke="#6366f1" stroke-width="1.5"/>
  <text x="584" y="202" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="600" fill="#4338ca">Gestão individual</text>
  <text x="584" y="217" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9.5" fill="#4f46e5">Criar assinatura manual, cancelar,</text>
  <text x="584" y="229" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9.5" fill="#4f46e5">pausar ou ajustar por assinante</text>

  <!-- Auto row label -->
  <text x="16" y="252" font-family="system-ui,sans-serif" font-size="9" font-weight="bold" fill="#22c55e">AUTOMÁTICO:</text>

  <rect x="12" y="258" width="214" height="52" rx="7" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
  <text x="119" y="276" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="600" fill="#15803d">Cobranças via Stripe</text>
  <text x="119" y="291" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9.5" fill="#166534">Auto-retry se cartão falhar</text>
  <text x="119" y="303" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9.5" fill="#166534">(Backup Payment Recovery — Premium)</text>

  <rect x="234" y="258" width="214" height="52" rx="7" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
  <text x="341" y="276" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="600" fill="#15803d">Pedidos gerados</text>
  <text x="341" y="291" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9.5" fill="#166534">Appstle cria pedido no Shopify</text>
  <text x="341" y="303" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9.5" fill="#166534">automaticamente a cada ciclo</text>

  <rect x="456" y="258" width="256" height="52" rx="7" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
  <text x="584" y="276" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="600" fill="#15803d">Emails de lembrete</text>
  <text x="584" y="291" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9.5" fill="#166534">Appstle avisa cliente antes de cada</text>
  <text x="584" y="303" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9.5" fill="#166534">entrega para personalizar o kit</text>

  <!-- Arrow down -->
  <line x1="360" y1="310" x2="360" y2="326" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#ag2)"/>

  <!-- ===== FASE 3: MONITORAMENTO ===== -->
  <rect x="8" y="330" width="704" height="18" rx="4" fill="#f1f5f9"/>
  <text x="360" y="343" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" font-weight="bold" fill="#475569">FASE 3 — MONITORAMENTO CONTÍNUO</text>

  <rect x="12" y="354" width="218" height="52" rx="7" fill="#fef9c3" stroke="#ca8a04" stroke-width="1.5"/>
  <text x="121" y="372" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="600" fill="#713f12">MRR &amp; Receita</text>
  <text x="121" y="387" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9.5" fill="#92400e">Receita mensal recorrente total</text>
  <text x="121" y="399" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9.5" fill="#92400e">e crescimento de assinantes</text>

  <rect x="238" y="354" width="244" height="52" rx="7" fill="#fef9c3" stroke="#ca8a04" stroke-width="1.5"/>
  <text x="360" y="372" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="600" fill="#713f12">Churn &amp; Retenção</text>
  <text x="360" y="387" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9.5" fill="#92400e">Cancelamentos, pausas e taxa</text>
  <text x="360" y="399" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9.5" fill="#92400e">de retenção por plano</text>

  <rect x="490" y="354" width="222" height="52" rx="7" fill="#fef9c3" stroke="#ca8a04" stroke-width="1.5"/>
  <text x="601" y="372" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="600" fill="#713f12">Inventory Forecasting</text>
  <text x="601" y="387" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9.5" fill="#92400e">Previsão de estoque baseada</text>
  <text x="601" y="399" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9.5" fill="#92400e">nos kits agendados</text>

</svg>

---

## 4. Business atual × Business Premium

<div style="overflow-x:auto;margin:12px 0">
<table style="width:100%;border-collapse:collapse;font-size:13px">
<thead>
<tr>
<th style="background:#1e293b;color:white;padding:10px;text-align:left;border-radius:6px 0 0 0">Recurso</th>
<th style="background:#1e293b;color:white;padding:10px;text-align:center">Business ($30/mês)</th>
<th style="background:#1e293b;color:white;padding:10px;text-align:center;border-radius:0 6px 0 0">Business Premium ($100/mês)</th>
</tr>
</thead>
<tbody>
<tr style="background:#fef2f2">
<td style="padding:9px 10px;border-bottom:1px solid #fecaca;font-weight:600;color:#991b1b">Gateway Stripe (bloqueador principal)</td>
<td style="text-align:center;border-bottom:1px solid #fecaca">⚠️ Precisa instalar</td>
<td style="text-align:center;border-bottom:1px solid #fecaca">⚠️ Precisa instalar</td>
</tr>
<tr>
<td style="padding:9px 10px;border-bottom:1px solid #e2e8f0">Customer Portal completo</td>
<td style="text-align:center;border-bottom:1px solid #e2e8f0">✅</td>
<td style="text-align:center;border-bottom:1px solid #e2e8f0">✅</td>
</tr>
<tr style="background:#f8fafc">
<td style="padding:9px 10px;border-bottom:1px solid #e2e8f0">Build-A-Box (cliente monta kit)</td>
<td style="text-align:center;border-bottom:1px solid #e2e8f0">✅</td>
<td style="text-align:center;border-bottom:1px solid #e2e8f0">✅</td>
</tr>
<tr>
<td style="padding:9px 10px;border-bottom:1px solid #e2e8f0">Personalização por entrega</td>
<td style="text-align:center;border-bottom:1px solid #e2e8f0">✅ (via Build-A-Box)</td>
<td style="text-align:center;border-bottom:1px solid #e2e8f0">✅</td>
</tr>
<tr style="background:#f8fafc">
<td style="padding:9px 10px;border-bottom:1px solid #e2e8f0">Cancellation management tools</td>
<td style="text-align:center;border-bottom:1px solid #e2e8f0">✅</td>
<td style="text-align:center;border-bottom:1px solid #e2e8f0">✅</td>
</tr>
<tr>
<td style="padding:9px 10px;border-bottom:1px solid #e2e8f0">Loyalty Features</td>
<td style="text-align:center;border-bottom:1px solid #e2e8f0">✅</td>
<td style="text-align:center;border-bottom:1px solid #e2e8f0">✅</td>
</tr>
<tr style="background:#fef2f2">
<td style="padding:9px 10px;border-bottom:1px solid #fecaca;font-weight:600;color:#991b1b">Automatic Product Swap (em massa)</td>
<td style="text-align:center;border-bottom:1px solid #fecaca;color:#dc2626;font-weight:bold">❌</td>
<td style="text-align:center;border-bottom:1px solid #fecaca;color:#16a34a;font-weight:bold">✅</td>
</tr>
<tr style="background:#fef2f2">
<td style="padding:9px 10px;border-bottom:1px solid #fecaca;font-weight:600;color:#991b1b">Backup Payment Recovery</td>
<td style="text-align:center;border-bottom:1px solid #fecaca;color:#dc2626;font-weight:bold">❌</td>
<td style="text-align:center;border-bottom:1px solid #fecaca;color:#16a34a;font-weight:bold">✅</td>
</tr>
<tr style="background:#fef2f2">
<td style="padding:9px 10px;border-bottom:1px solid #fecaca;font-weight:600;color:#991b1b">Phased Retry (tentativa progressiva)</td>
<td style="text-align:center;border-bottom:1px solid #fecaca;color:#dc2626;font-weight:bold">❌</td>
<td style="text-align:center;border-bottom:1px solid #fecaca;color:#16a34a;font-weight:bold">✅</td>
</tr>
<tr style="background:#fef2f2">
<td style="padding:9px 10px;border-bottom:1px solid #fecaca;font-weight:600;color:#991b1b">Campaigns (email p/ segmentos)</td>
<td style="text-align:center;border-bottom:1px solid #fecaca;color:#dc2626;font-weight:bold">❌</td>
<td style="text-align:center;border-bottom:1px solid #fecaca;color:#16a34a;font-weight:bold">✅</td>
</tr>
<tr style="background:#fef2f2">
<td style="padding:9px 10px;border-bottom:1px solid #fecaca;font-weight:600;color:#991b1b">Prepaid (Separate Orders)</td>
<td style="text-align:center;border-bottom:1px solid #fecaca;color:#dc2626;font-weight:bold">❌</td>
<td style="text-align:center;border-bottom:1px solid #fecaca;color:#16a34a;font-weight:bold">✅</td>
</tr>
<tr style="background:#fef2f2">
<td style="padding:9px 10px;border-bottom:1px solid #fecaca;font-weight:600;color:#991b1b">Customer Portal Product Upsell</td>
<td style="text-align:center;border-bottom:1px solid #fecaca;color:#dc2626;font-weight:bold">❌</td>
<td style="text-align:center;border-bottom:1px solid #fecaca;color:#16a34a;font-weight:bold">✅</td>
</tr>
<tr style="background:#fef2f2">
<td style="padding:9px 10px;border-bottom:1px solid #fecaca;font-weight:600;color:#991b1b">Dedicated Merchant Success Manager</td>
<td style="text-align:center;border-bottom:1px solid #fecaca;color:#dc2626;font-weight:bold">❌</td>
<td style="text-align:center;border-bottom:1px solid #fecaca;color:#16a34a;font-weight:bold">✅</td>
</tr>
<tr style="background:#f0fdf4">
<td style="padding:9px 10px;font-weight:600;color:#15803d">Limite de receita mensal</td>
<td style="text-align:center;color:#15803d;font-weight:bold">Até $30.000/mês</td>
<td style="text-align:center;color:#15803d;font-weight:bold">Até $100.000/mês</td>
</tr>
</tbody>
</table>
</div>

> **Quando fazer o upgrade?** O Business resolve o essencial para lançar. O Premium faz sentido quando: (1) base de assinantes cresce e gestão manual fica pesada, ou (2) churn por falha de pagamento começa a ser relevante. Matematicamente: 10–15 assinantes ativos nos planos mais caros já justificam o $70/mês a mais de custo.

---

## 5. Próximos passos

- [ ] Instalar e configurar **Stripe** como gateway de assinaturas
- [ ] Fazer teste de assinatura completo com Stripe (criar → cobrar → renovar)
- [ ] Configurar **Build-A-Box** com catálogo dos 23 produtos
- [ ] Vincular produtos ao **Plano Anual à vista** (está com 0 produtos)
- [ ] Alinhar com Fernanda: corrigir nome e estrutura do "Anual Parcelado"
- [ ] Definir com Fernanda o desconto na renovação (0% atual pode gerar churn)
- [ ] Mudar **Frequency Change Method** para "Compatible only"
- [ ] Teste end-to-end: assinar → portal → remontar kit → confirmar próximo pedido
- [ ] Avaliar upgrade para **Business Premium** ao atingir ~10 assinantes ativos
- [ ] Lançar o YOUMOVE para clientes reais

---

## Links úteis

- [[Diagnóstico Appstle - Jun 2026]]
- [[Move Gourmet - Hub]]
- Admin Appstle Billing: https://admin.shopify.com/store/9ja6tr-1i/apps/subscription-by-rhem/dashboard/billing
- Planos de assinatura: https://admin.shopify.com/store/9ja6tr-1i/apps/subscription-by-rhem/dashboard/subscription-plan
- Build-A-Box: https://admin.shopify.com/store/9ja6tr-1i/apps/subscription-by-rhem/dashboard/build-a-box
