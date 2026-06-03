/* ============================================================
   LP Bíblia 120 Anos · interações
   Contador, FAQ, cupom, modal exit-intent, sticky, reveal
   ============================================================ */
(function () {
  "use strict";

  /* Marca d'água da gravura nas seções escuras */
  document.documentElement.style.setProperty(
    "--woodcut",
    "url('assets/templo/arte-templo-gold.png')"
  );

  /* ---------- 1. Contagem regressiva → 08/07/2026 ---------- */
  var LAUNCH = new Date("2026-07-08T00:00:00-03:00").getTime();
  var cd = {
    d: document.getElementById("cd-d"),
    h: document.getElementById("cd-h"),
    m: document.getElementById("cd-m"),
    s: document.getElementById("cd-s"),
  };
  function pad(n) { return String(n).padStart(2, "0"); }
  function tick() {
    if (!cd.d) return;
    var diff = LAUNCH - Date.now();
    if (diff <= 0) {
      cd.d.textContent = "0"; cd.h.textContent = "00";
      cd.m.textContent = "00"; cd.s.textContent = "00";
      return;
    }
    var s = Math.floor(diff / 1000);
    cd.d.textContent = Math.floor(s / 86400);
    cd.h.textContent = pad(Math.floor((s % 86400) / 3600));
    cd.m.textContent = pad(Math.floor((s % 3600) / 60));
    cd.s.textContent = pad(s % 60);
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- 2. FAQ acordeão ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var btn = item.querySelector(".faq-q");
    var ans = item.querySelector(".faq-a");
    btn.addEventListener("click", function () {
      var open = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function (o) {
        o.classList.remove("open");
        o.querySelector(".faq-a").style.maxHeight = null;
      });
      if (!open) {
        item.classList.add("open");
        ans.style.maxHeight = ans.scrollHeight + "px";
      }
    });
  });

  /* ---------- 3. Formulário de cupom ---------- */
  function wireCoupon(formId, revealId) {
    var form = document.getElementById(formId);
    var reveal = document.getElementById(revealId);
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = form.querySelector("input[type=email]");
      if (!input.value || !input.checkValidity()) {
        input.focus();
        return;
      }
      form.style.display = "none";
      if (reveal) reveal.classList.add("show");
    });
  }
  wireCoupon("coupon-form", "coupon-reveal");
  wireCoupon("modal-form", "modal-reveal");

  /* ---------- 4. Botões de compra (placeholders) ---------- */
  document.querySelectorAll("[data-buy]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      // Substituir href pelos links reais da loja (Tray) com cupom IPP120 aplicado.
      if (a.getAttribute("href") === "#") {
        e.preventDefault();
        var which = a.getAttribute("data-buy");
        console.log("[compra] edição " + which + " → adicionar URL da loja Tray");
      }
    });
  });

  /* ---------- 5. Sticky CTA mobile ---------- */
  var sticky = document.getElementById("sticky");
  var hero = document.getElementById("topo");
  if (sticky && hero && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        sticky.classList.toggle("show", !en.isIntersecting);
      });
    }, { rootMargin: "-300px 0px 0px 0px" }).observe(hero);
  }

  /* ---------- 6. Modal exit-intent ---------- */
  var modal = document.getElementById("modal");
  var modalClose = document.getElementById("modal-close");
  var shown = false;
  function openModal() {
    if (shown) return;
    shown = true;
    try { localStorage.setItem("ipp120_modal", "1"); } catch (e) {}
    modal.classList.add("show");
  }
  function closeModal() { modal.classList.remove("show"); }
  var seen = false;
  try { seen = localStorage.getItem("ipp120_modal") === "1"; } catch (e) {}
  if (modal && !seen) {
    document.addEventListener("mouseout", function (e) {
      if (e.clientY <= 0 && !e.relatedTarget) openModal();
    });
    // fallback mobile: após 35s de leitura
    setTimeout(function () { if (!shown) openModal(); }, 35000);
  }
  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modal) modal.addEventListener("click", function (e) {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });

  /* ---------- 7. Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }
})();
