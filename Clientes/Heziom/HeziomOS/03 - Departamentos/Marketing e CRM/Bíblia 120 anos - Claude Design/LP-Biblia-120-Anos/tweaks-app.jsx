/* Tweaks — controles de ajuste da LP Bíblia 120 Anos */
const { useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "gold": ["#E5B875", "#C9A24B"],
  "titleFont": "Cormorant Garamond",
  "density": "regular",
  "showCountdown": true,
  "heroCover": "marrom"
}/*EDITMODE-END*/;

const DENSITY_PAD = { compacto: "84px", regular: "120px", amplo: "156px" };
const COVER_SRC = {
  preta: "assets/produto/mockup-preta-clean.png",
  marrom: "assets/produto/mockup-marrom-clean.png",
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    const root = document.documentElement;
    const gold = Array.isArray(t.gold) ? t.gold : [t.gold, t.gold];
    root.style.setProperty("--gold", gold[0]);
    root.style.setProperty("--gold-base", gold[1]);
    root.style.setProperty("--font-display", `"${t.titleFont}", Georgia, serif`);
    root.style.setProperty("--section-pad", DENSITY_PAD[t.density] || "120px");

    const ann = document.getElementById("announce");
    if (ann) ann.classList.toggle("hide-countdown", !t.showCountdown);

    const book = document.getElementById("hero-book");
    if (book && COVER_SRC[t.heroCover]) book.src = COVER_SRC[t.heroCover];
  }, [t]);

  return (
    <TweaksPanel>
      <TweakSection label="Identidade" />
      <TweakColor
        label="Tom do dourado"
        value={t.gold}
        options={[
          ["#E5B875", "#C9A24B"],
          ["#EAC68C", "#D4A857"],
          ["#D6A24A", "#AD8138"],
        ]}
        onChange={(v) => setTweak("gold", v)}
      />
      <TweakSelect
        label="Fonte do título"
        value={t.titleFont}
        options={["Cormorant Garamond", "Playfair Display", "Fraunces"]}
        onChange={(v) => setTweak("titleFont", v)}
      />
      <TweakSection label="Layout" />
      <TweakRadio
        label="Densidade"
        value={t.density}
        options={["compacto", "regular", "amplo"]}
        onChange={(v) => setTweak("density", v)}
      />
      <TweakRadio
        label="Capa no hero"
        value={t.heroCover}
        options={["preta", "marrom"]}
        onChange={(v) => setTweak("heroCover", v)}
      />
      <TweakToggle
        label="Contagem regressiva"
        value={t.showCountdown}
        onChange={(v) => setTweak("showCountdown", v)}
      />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("tweaks-root")).render(<App />);
