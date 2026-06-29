// hz-capture.js — religação da captura das LPs (cutover Flowbiz, Story 5.23).
// Substitui o submit do GreatPages (morto após o corte) e envia o lead ao
// HeziomOS via o proxy /.netlify/functions/lead com a ORIGEM da LP.
// Cada LP define window.HZ_ORIGEM antes de carregar este script.
(function () {
  var ORIGEM = window.HZ_ORIGEM || 'lp_desconhecida';
  var ENDPOINT = window.HZ_LEAD_ENDPOINT || '/.netlify/functions/lead';

  function utms() {
    var p = new URLSearchParams(location.search), o = {};
    ['source', 'medium', 'campaign', 'content', 'term'].forEach(function (k) {
      var v = p.get('utm_' + k); if (v) o[k] = v;
    });
    return o;
  }
  function val(form, names) {
    for (var i = 0; i < names.length; i++) {
      var el = form.querySelector('[name="' + names[i] + '"]');
      if (el && el.value) return el.value.trim();
    }
    return '';
  }
  function send(form) {
    var nome = val(form, ['nome', 'name']);
    var email = val(form, ['e-mail', 'email']);
    var tel = val(form, ['telefone', 'whatsapp', 'celular', 'phone']);
    if (!nome || !tel) { alert('Por favor, preencha nome e telefone.'); return; }
    var payload = { nome: nome, telefone: tel, email: email, origem: ORIGEM, utm: utms() };
    var btn = form.querySelector('button, [type="submit"], .e_botao');
    if (btn) { btn.disabled = true; }
    fetch(ENDPOINT, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    }).then(function (r) { return r.ok ? r : Promise.reject(r); })
      .then(function () {
        var ty = form.getAttribute('data-hz-thankyou') || window.HZ_THANKYOU;
        if (ty) { location.href = ty; return; }
        form.innerHTML = '<p style="padding:24px;text-align:center;font-size:16px;line-height:1.5">Recebemos seus dados. Em breve entraremos em contato. Obrigado!</p>';
      })
      .catch(function () { if (btn) { btn.disabled = false; } alert('Não foi possível enviar agora. Tente novamente em instantes.'); });
  }
  function wire() {
    var forms = document.querySelectorAll('form.e_formulario');
    if (!forms.length) forms = document.querySelectorAll('form');
    Array.prototype.forEach.call(forms, function (f) {
      if (f.__hzWired) return;
      // Clona p/ remover handlers diretos do GreatPages, depois liga o nosso.
      var clone = f.cloneNode(true);
      if (f.parentNode) f.parentNode.replaceChild(clone, f);
      clone.__hzWired = true;
      clone.removeAttribute('action');
      clone.onsubmit = null;
      clone.addEventListener('submit', function (e) {
        e.preventDefault(); e.stopImmediatePropagation(); send(clone);
      }, true);
      var btn = clone.querySelector('button, [type="submit"], .e_botao');
      if (btn) btn.addEventListener('click', function (e) {
        e.preventDefault(); e.stopImmediatePropagation(); send(clone);
      }, true);
    });
  }
  // Roda em vários momentos (idempotente via __hzWired) para vencer a ordem de
  // init do GreatPages independentemente de quando este script carrega.
  if (document.readyState !== 'loading') wire();
  document.addEventListener('DOMContentLoaded', wire);
  window.addEventListener('load', wire);
})();
