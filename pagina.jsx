import React, { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
} from "recharts";
import {
  LayoutGrid, Calculator, BarChart3, BookOpen, Plus, Trash2, Menu, X, ArrowRight, Boxes,
} from "lucide-react";

/* ---------------------------------------------------------------
   DESIGN TOKENS
   Palette drawn from a Rubik's-style cube's four visible faces,
   used functionally (one color = one cost stage), never decoratively.
   ---------------------------------------------------------------- */
const COLORS = {
  ink: "#181615",
  paper: "#F3EFE6",
  paperDeep: "#EAE3D3",
  line: "#D8CFB8",
  variable: "#2B5FE0", // blue face — variable cost
  fixed: "#E0392B",    // red face — fixed cost (rateio)
  margin: "#F0B429",   // yellow face — margin
  price: "#1E9E5A",    // green face — final price
  muted: "#8B8375",
};

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap');`;

/* ---------------------------------------------------------------
   SEED DATA — extracted from the source spreadsheets (Modelos 1–3)
   ---------------------------------------------------------------- */
const seedFixed = () => ({ aluguel: 1200, maoDeObra: 6000, agua: 180, luz: 300, internet: 89 });

const CATEGORIES = {
  moveis: {
    label: "Móveis",
    unit: "peça",
    icon: "◧",
    fieldLabels: ["Madeira", "Parafusos", "Verniz"],
    defaultMargin: 30,
    fixedCosts: seedFixed(),
    skus: [
      { id: "m1", sku: "001", name: "Mesa de madeira 0,60m × 0,60m", venda: 180, c1: 78, c2: 3.8, c3: 2 },
      { id: "m2", sku: "002", name: "Mesa de madeira 1,00m × 0,60m", venda: 160, c1: 98, c2: 4.8, c3: 2.5 },
      { id: "m3", sku: "003", name: "Mesa de madeira 1,20m × 0,60m", venda: 110, c1: 108, c2: 5.8, c3: 3 },
      { id: "m4", sku: "004", name: "Conjunto mesa 0,60m + 4 cadeiras", venda: 320, c1: 178, c2: 11.8, c3: 7 },
      { id: "m5", sku: "005", name: "Conjunto mesa 1,20m + 6 cadeiras", venda: 270, c1: 240, c2: 14.8, c3: 8 },
      { id: "m6", sku: "006", name: "Cadeira avulsa simples", venda: 505, c1: 28, c2: 1.8, c3: 1 },
      { id: "m7", sku: "007", name: "Cadeira avulsa plus", venda: 412, c1: 32, c2: 1.9, c3: 1 },
      { id: "m8", sku: "008", name: "Cadeira avulsa master", venda: 198, c1: 35, c2: 2, c3: 1 },
    ],
  },
  canetas: {
    label: "Canetas",
    unit: "unidade",
    icon: "◨",
    fieldLabels: ["Corpo / Tubo", "Componentes", "Tinta / Acabamento"],
    defaultMargin: 40,
    fixedCosts: seedFixed(),
    skus: [
      { id: "c1", sku: "001", name: "Esferográfica azul econômica", venda: 1800, c1: 0.42, c2: 0.08, c3: 0.05 },
      { id: "c2", sku: "002", name: "Esferográfica preta econômica", venda: 1600, c1: 0.42, c2: 0.08, c3: 0.05 },
      { id: "c3", sku: "003", name: "Esferográfica vermelha econômica", venda: 1100, c1: 0.42, c2: 0.08, c3: 0.05 },
      { id: "c4", sku: "004", name: "Kit com 4 canetas coloridas", venda: 320, c1: 2.1, c2: 0.35, c3: 0.25 },
      { id: "c5", sku: "005", name: "Kit com 6 canetas premium", venda: 270, c1: 4.2, c2: 0.6, c3: 0.4 },
      { id: "c6", sku: "006", name: "Caneta gel simples", venda: 505, c1: 0.7, c2: 0.12, c3: 0.08 },
      { id: "c7", sku: "007", name: "Caneta gel plus", venda: 412, c1: 1.05, c2: 0.15, c3: 0.1 },
      { id: "c8", sku: "008", name: "Caneta metálica master", venda: 198, c1: 3.8, c2: 0.3, c3: 0.2 },
    ],
  },
  garrafas: {
    label: "Garrafas",
    unit: "unidade",
    icon: "◩",
    fieldLabels: ["Corpo da garrafa", "Componentes", "Acabamento"],
    defaultMargin: 45,
    fixedCosts: seedFixed(),
    skus: [
      { id: "g1", sku: "001", name: "Garrafa térmica básica 500ml", venda: 180, c1: 28, c2: 3.8, c3: 1.5 },
      { id: "g2", sku: "002", name: "Garrafa térmica básica 750ml", venda: 160, c1: 34, c2: 4.2, c3: 1.8 },
      { id: "g3", sku: "003", name: "Garrafa térmica básica 1 litro", venda: 110, c1: 42, c2: 4.8, c3: 2 },
      { id: "g4", sku: "004", name: "Kit com 2 garrafas de 500ml", venda: 320, c1: 58, c2: 7.5, c3: 3 },
      { id: "g5", sku: "005", name: "Kit com 2 garrafas de 1 litro", venda: 270, c1: 86, c2: 9, c3: 3.5 },
      { id: "g6", sku: "006", name: "Garrafa esportiva simples 600ml", venda: 505, c1: 22, c2: 3, c3: 1.2 },
      { id: "g7", sku: "007", name: "Garrafa esportiva plus 750ml", venda: 412, c1: 28, c2: 3.5, c3: 1.5 },
      { id: "g8", sku: "008", name: "Garrafa inox master 1 litro", venda: 198, c1: 52, c2: 5, c3: 2.5 },
    ],
  },
};

const money = (v) =>
  (isFinite(v) ? v : 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const num = (v, d = 1) => (isFinite(v) ? v : 0).toLocaleString("pt-BR", { maximumFractionDigits: d });

/* ---------------------------------------------------------------
   CALCULATION ENGINE — mirrors the spreadsheet formulas exactly:
   custoVar = c1+c2+c3
   rateio   = totalFixo / somaVendaMedia
   custoTotal = custoVar + rateio
   preco    = custoTotal / (1 - margem)
   ---------------------------------------------------------------- */
function computeCategory(cat) {
  const totalFixo = Object.values(cat.fixedCosts).reduce((a, b) => a + (Number(b) || 0), 0);
  const totalVendas = cat.skus.reduce((a, s) => a + (Number(s.venda) || 0), 0);
  const rateio = totalVendas > 0 ? totalFixo / totalVendas : 0;
  const margemFrac = (Number(cat.margin) || 0) / 100;

  const skus = cat.skus.map((s) => {
    const custoVar = (Number(s.c1) || 0) + (Number(s.c2) || 0) + (Number(s.c3) || 0);
    const custoTotal = custoVar + rateio;
    const preco = margemFrac < 1 ? custoTotal / (1 - margemFrac) : custoTotal;
    const margemUnit = preco - custoTotal;
    const receitaMensal = preco * (Number(s.venda) || 0);
    const lucroMensal = margemUnit * (Number(s.venda) || 0);
    return { ...s, custoVar, custoTotal, preco, margemUnit, receitaMensal, lucroMensal };
  });

  const receitaTotal = skus.reduce((a, s) => a + s.receitaMensal, 0);
  const lucroTotal = skus.reduce((a, s) => a + s.lucroMensal, 0);
  const ticketMedio = totalVendas > 0 ? receitaTotal / totalVendas : 0;

  return { skus, totalFixo, totalVendas, rateio, receitaTotal, lucroTotal, ticketMedio };
}

/* ---------------------------------------------------------------
   SHARED UI BITS
   ---------------------------------------------------------------- */
function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-wide" style={{ color: COLORS.muted, fontFamily: "Inter" }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function NumberInput({ value, onChange, prefix }) {
  return (
    <div className="flex items-center gap-1 rounded-md px-2 py-1.5" style={{ background: "#fff", border: `1px solid ${COLORS.line}` }}>
      {prefix && <span className="text-xs" style={{ color: COLORS.muted }}>{prefix}</span>}
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))}
        className="w-full bg-transparent outline-none text-sm text-right"
        style={{ fontFamily: "JetBrains Mono", color: COLORS.ink, fontVariantNumeric: "tabular-nums" }}
      />
    </div>
  );
}

function CategoryPills({ active, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {Object.entries(CATEGORIES).map(([key, c]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className="px-3.5 py-1.5 rounded-full text-sm font-medium transition-all"
          style={{
            fontFamily: "Space Grotesk",
            background: active === key ? COLORS.ink : "transparent",
            color: active === key ? COLORS.paper : COLORS.ink,
            border: `1.5px solid ${COLORS.ink}`,
          }}
        >
          {c.icon} {c.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------
   CUBE NET — the signature element.
   An unfolded cube (cross layout) where each visible panel is one
   stage of the price build-up for a single chosen SKU.
   ---------------------------------------------------------------- */
function CubeNet({ sku, computed, unit }) {
  if (!sku) return null;
  const panel = (label, value, sub, bg, big) => (
    <div
      className="flex flex-col justify-between p-3 rounded-lg"
      style={{ background: bg, minHeight: big ? 132 : 108, color: "#fff" }}
    >
      <span className="text-[10px] uppercase tracking-wider opacity-80" style={{ fontFamily: "Inter" }}>{label}</span>
      <div>
        <div style={{ fontFamily: "JetBrains Mono", fontSize: big ? 22 : 18, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
          {money(value)}
        </div>
        {sub && <div className="text-[11px] opacity-85 mt-0.5" style={{ fontFamily: "Inter" }}>{sub}</div>}
      </div>
    </div>
  );

  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr", gridTemplateRows: "auto auto" }}>
      <div style={{ gridColumn: "2 / 3" }}>{panel("1 · Custo variável", computed.custoVar, "matéria-prima / unidade", COLORS.variable)}</div>
      <div style={{ gridColumn: "1 / 2", gridRow: "2" }}>{panel("2 · Rateio fixo", computed.rateioApplied, "custo fixo ÷ vendas", COLORS.fixed)}</div>
      <div style={{ gridColumn: "2 / 3", gridRow: "2" }}>{panel("Custo total", computed.custoTotal, `por ${unit}`, COLORS.ink, true)}</div>
      <div style={{ gridColumn: "3 / 4", gridRow: "2" }}>{panel("3 · Margem", computed.margemUnit, "lucro planejado", COLORS.margin)}</div>
      <div style={{ gridColumn: "4 / 5", gridRow: "2" }}>{panel("Preço final", computed.preco, "sugestão de venda", COLORS.price, true)}</div>
    </div>
  );
}

/* ---------------------------------------------------------------
   PAGE: INÍCIO
   ---------------------------------------------------------------- */
function Home({ data, go }) {
  const [demoCat, setDemoCat] = useState("garrafas");
  const computed = useMemo(() => computeCategory(data[demoCat]), [data, demoCat]);
  const [demoSkuId, setDemoSkuId] = useState(data[demoCat].skus[0].id);
  const activeSku = computed.skus.find((s) => s.id === demoSkuId) || computed.skus[0];
  const rateioApplied = computed.rateio;

  return (
    <div className="flex flex-col gap-14 pb-16">
      <section className="grid md:grid-cols-[1.1fr_0.9fr] gap-10 items-center pt-10">
        <div>
          <span className="text-xs uppercase tracking-[0.2em]" style={{ color: COLORS.fixed, fontFamily: "Inter" }}>
            Ferramenta de precificação
          </span>
          <h1
            className="mt-3 leading-[1.05]"
            style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "clamp(2rem,4.2vw,3.4rem)", color: COLORS.ink }}
          >
            Cada preço tem uma solução certa.
          </h1>
          <p className="mt-5 text-base md:text-lg max-w-md" style={{ color: "#4A453D", fontFamily: "Inter" }}>
            Monte o custo fixo da fábrica, o custo variável de cada SKU e a margem desejada —
            a ferramenta resolve o preço de venda sugerido, peça por peça, como um cubo mágico:
            uma face de cada vez, até fechar.
          </p>
          <div className="mt-7 flex gap-3 flex-wrap">
            <button
              onClick={() => go("calc")}
              className="px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2"
              style={{ background: COLORS.ink, color: COLORS.paper, fontFamily: "Space Grotesk" }}
            >
              Abrir calculadora <ArrowRight size={15} />
            </button>
            <button
              onClick={() => go("how")}
              className="px-5 py-2.5 rounded-full text-sm font-semibold"
              style={{ border: `1.5px solid ${COLORS.ink}`, color: COLORS.ink, fontFamily: "Space Grotesk" }}
            >
              Como funciona o cálculo
            </button>
          </div>
        </div>

        <div className="rounded-2xl p-5" style={{ background: COLORS.paperDeep, border: `1px solid ${COLORS.line}` }}>
          <div className="flex items-center justify-between mb-3">
            <CategoryPills active={demoCat} onChange={(c) => { setDemoCat(c); setDemoSkuId(data[c].skus[0].id); }} />
          </div>
          <select
            value={demoSkuId}
            onChange={(e) => setDemoSkuId(e.target.value)}
            className="w-full mb-3 text-sm px-2.5 py-2 rounded-md"
            style={{ fontFamily: "Inter", background: "#fff", border: `1px solid ${COLORS.line}` }}
          >
            {data[demoCat].skus.map((s) => (
              <option key={s.id} value={s.id}>{s.sku} — {s.name}</option>
            ))}
          </select>
          <CubeNet sku={activeSku} computed={{ ...activeSku, rateioApplied }} unit={data[demoCat].unit} />
        </div>
      </section>

      <section className="grid sm:grid-cols-3 gap-4">
        {[
          { n: "01", t: "Custos fixos", d: "Aluguel, mão de obra, água, luz e internet — rateados por unidade vendida no mês." },
          { n: "02", t: "Custos variáveis", d: "Insumos que mudam por SKU: matéria-prima, componentes, acabamento." },
          { n: "03", t: "Margem alvo", d: "A margem que a operação precisa manter — o cálculo faz o resto pelo método do divisor." },
        ].map((b) => (
          <div key={b.n} className="p-5 rounded-xl" style={{ border: `1px solid ${COLORS.line}` }}>
            <span style={{ fontFamily: "JetBrains Mono", color: COLORS.muted, fontSize: 13 }}>{b.n}</span>
            <h3 className="mt-1 mb-1.5" style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 17, color: COLORS.ink }}>{b.t}</h3>
            <p className="text-sm" style={{ color: "#5B564C", fontFamily: "Inter" }}>{b.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

/* ---------------------------------------------------------------
   PAGE: CALCULADORA
   ---------------------------------------------------------------- */
function CalcPage({ data, setData }) {
  const [cat, setCat] = useState("garrafas");
  const catData = data[cat];
  const computed = useMemo(() => computeCategory(catData), [catData]);

  const patch = (updater) =>
    setData((prev) => ({ ...prev, [cat]: updater({ ...prev[cat] }) }));

  const updateFixed = (key, val) =>
    patch((c) => ({ ...c, fixedCosts: { ...c.fixedCosts, [key]: val } }));

  const updateMargin = (val) => patch((c) => ({ ...c, margin: val }));

  const updateSkuField = (id, field, val) =>
    patch((c) => ({ ...c, skus: c.skus.map((s) => (s.id === id ? { ...s, [field]: val } : s)) }));

  const addSku = () =>
    patch((c) => ({
      ...c,
      skus: [...c.skus, { id: `${cat}-${Date.now()}`, sku: String(c.skus.length + 1).padStart(3, "0"), name: "Novo item", venda: 0, c1: 0, c2: 0, c3: 0 }],
    }));

  const removeSku = (id) => patch((c) => ({ ...c, skus: c.skus.filter((s) => s.id !== id) }));

  const fixedLabels = { aluguel: "Aluguel", maoDeObra: "Mão de obra", agua: "Água", luz: "Luz", internet: "Internet" };

  return (
    <div className="flex flex-col gap-8 pb-16 pt-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <CategoryPills active={cat} onChange={setCat} />
        <div className="text-sm" style={{ color: COLORS.muted, fontFamily: "Inter" }}>
          Rateio fixo por {catData.unit}: <b style={{ color: COLORS.ink, fontFamily: "JetBrains Mono" }}>{money(computed.rateio)}</b>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_260px] gap-6">
        {/* SKU table */}
        <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${COLORS.line}` }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: COLORS.paperDeep }}>
                  {["SKU", "Produto", "Venda méd./mês", ...catData.fieldLabels, "Custo unit.", "Preço sugerido", "Margem/un."].map((h) => (
                    <th key={h} className="text-left px-3 py-2.5 whitespace-nowrap" style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 11.5, color: "#5B564C", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                      {h}
                    </th>
                  ))}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {computed.skus.map((s) => (
                  <tr key={s.id} style={{ borderTop: `1px solid ${COLORS.line}` }}>
                    <td className="px-3 py-2" style={{ fontFamily: "JetBrains Mono", fontSize: 12.5, color: COLORS.muted }}>{s.sku}</td>
                    <td className="px-3 py-2 min-w-[180px]">
                      <input value={s.name} onChange={(e) => updateSkuField(s.id, "name", e.target.value)} className="w-full bg-transparent outline-none text-sm" style={{ fontFamily: "Inter", color: COLORS.ink }} />
                    </td>
                    <td className="px-1 py-2 w-24"><NumberInput value={s.venda} onChange={(v) => updateSkuField(s.id, "venda", v)} /></td>
                    <td className="px-1 py-2 w-24"><NumberInput value={s.c1} onChange={(v) => updateSkuField(s.id, "c1", v)} prefix="R$" /></td>
                    <td className="px-1 py-2 w-24"><NumberInput value={s.c2} onChange={(v) => updateSkuField(s.id, "c2", v)} prefix="R$" /></td>
                    <td className="px-1 py-2 w-24"><NumberInput value={s.c3} onChange={(v) => updateSkuField(s.id, "c3", v)} prefix="R$" /></td>
                    <td className="px-3 py-2 text-right" style={{ fontFamily: "JetBrains Mono", fontSize: 13 }}>{money(s.custoTotal)}</td>
                    <td className="px-3 py-2 text-right font-semibold" style={{ fontFamily: "JetBrains Mono", fontSize: 13, color: COLORS.price }}>{money(s.preco)}</td>
                    <td className="px-3 py-2 text-right" style={{ fontFamily: "JetBrains Mono", fontSize: 13, color: COLORS.margin }}>{money(s.margemUnit)}</td>
                    <td className="px-2">
                      <button onClick={() => removeSku(s.id)} style={{ color: COLORS.muted }} title="Remover">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={addSku}
            className="flex items-center gap-1.5 px-4 py-3 text-sm font-medium w-full justify-center"
            style={{ borderTop: `1px solid ${COLORS.line}`, color: COLORS.ink, fontFamily: "Space Grotesk", background: COLORS.paper }}
          >
            <Plus size={15} /> Adicionar SKU
          </button>
        </div>

        {/* Fixed costs + margin */}
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-xl" style={{ border: `1px solid ${COLORS.line}` }}>
            <h4 className="mb-3" style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 14, color: COLORS.ink }}>Custos fixos mensais</h4>
            <div className="flex flex-col gap-2.5">
              {Object.entries(catData.fixedCosts).map(([k, v]) => (
                <Field key={k} label={fixedLabels[k]}>
                  <NumberInput value={v} onChange={(val) => updateFixed(k, val)} prefix="R$" />
                </Field>
              ))}
              <div className="flex justify-between pt-2 mt-1 text-sm" style={{ borderTop: `1px solid ${COLORS.line}`, fontFamily: "Inter" }}>
                <span style={{ color: COLORS.muted }}>Total</span>
                <span style={{ fontFamily: "JetBrains Mono", fontWeight: 700 }}>{money(computed.totalFixo)}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl" style={{ border: `1px solid ${COLORS.line}` }}>
            <h4 className="mb-3" style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 14, color: COLORS.ink }}>Margem (markup)</h4>
            <div className="flex items-center gap-3">
              <input
                type="range" min="1" max="80" value={catData.margin}
                onChange={(e) => updateMargin(parseFloat(e.target.value))}
                className="w-full"
              />
              <span style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 15, minWidth: 46, textAlign: "right" }}>{catData.margin}%</span>
            </div>
          </div>

          <div className="p-4 rounded-xl text-white" style={{ background: COLORS.ink }}>
            <h4 className="mb-3" style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 14 }}>Projeção do mês</h4>
            <div className="flex flex-col gap-2 text-sm" style={{ fontFamily: "Inter" }}>
              <div className="flex justify-between"><span className="opacity-70">Receita projetada</span><span style={{ fontFamily: "JetBrains Mono" }}>{money(computed.receitaTotal)}</span></div>
              <div className="flex justify-between"><span className="opacity-70">Lucro projetado</span><span style={{ fontFamily: "JetBrains Mono", color: "#7CE0A8" }}>{money(computed.lucroTotal)}</span></div>
              <div className="flex justify-between"><span className="opacity-70">Ticket médio</span><span style={{ fontFamily: "JetBrains Mono" }}>{money(computed.ticketMedio)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   PAGE: RELATÓRIO
   ---------------------------------------------------------------- */
function ReportPage({ data }) {
  const results = Object.entries(data).map(([key, c]) => ({ key, label: c.label, ...computeCategory(c) }));
  const chartData = results.flatMap((r) =>
    r.skus.map((s) => ({ name: `${r.label.slice(0, 3)} ${s.sku}`, Custo: +s.custoTotal.toFixed(2), Preço: +s.preco.toFixed(2), cat: r.key }))
  );
  const catColor = { moveis: COLORS.variable, canetas: COLORS.margin, garrafas: COLORS.price };

  return (
    <div className="flex flex-col gap-8 pb-16 pt-8">
      <div className="grid sm:grid-cols-3 gap-4">
        {results.map((r) => (
          <div key={r.key} className="p-4 rounded-xl" style={{ border: `1px solid ${COLORS.line}`, borderTop: `4px solid ${catColor[r.key]}` }}>
            <span className="text-xs uppercase tracking-wide" style={{ color: COLORS.muted, fontFamily: "Inter" }}>{r.label}</span>
            <div className="mt-2 text-xl" style={{ fontFamily: "JetBrains Mono", fontWeight: 700, color: COLORS.ink }}>{money(r.receitaTotal)}</div>
            <div className="text-xs mt-0.5" style={{ color: COLORS.muted, fontFamily: "Inter" }}>receita mensal projetada</div>
            <div className="flex justify-between mt-3 text-sm" style={{ fontFamily: "Inter" }}>
              <span style={{ color: "#5B564C" }}>Lucro/mês</span>
              <span style={{ fontFamily: "JetBrains Mono", color: COLORS.price }}>{money(r.lucroTotal)}</span>
            </div>
            <div className="flex justify-between text-sm" style={{ fontFamily: "Inter" }}>
              <span style={{ color: "#5B564C" }}>Ticket médio</span>
              <span style={{ fontFamily: "JetBrains Mono" }}>{money(r.ticketMedio)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl p-4" style={{ border: `1px solid ${COLORS.line}` }}>
        <h4 className="mb-4" style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 15, color: COLORS.ink }}>
          Custo total × preço sugerido, por SKU
        </h4>
        <div style={{ width: "100%", height: 340 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ left: 0, right: 10 }}>
              <CartesianGrid stroke={COLORS.line} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: "Inter" }} interval={2} />
              <YAxis tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} />
              <Tooltip formatter={(v) => money(v)} contentStyle={{ fontFamily: "Inter", fontSize: 12, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontFamily: "Inter", fontSize: 12 }} />
              <Bar dataKey="Custo" fill={COLORS.fixed} radius={[3, 3, 0, 0]} />
              <Bar dataKey="Preço" fill={COLORS.price} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   PAGE: COMO FUNCIONA
   ---------------------------------------------------------------- */
function HowPage() {
  const steps = [
    { c: COLORS.variable, t: "Custo variável unitário", f: "custo_variável = insumo₁ + insumo₂ + insumo₃", d: "Soma dos materiais que mudam de acordo com o produto — madeira, componentes, tinta, acabamento etc." },
    { c: COLORS.fixed, t: "Rateio do custo fixo", f: "rateio = custo_fixo_total ÷ Σ(venda média de todos os SKUs)", d: "As despesas fixas mensais da fábrica (aluguel, mão de obra, água, luz, internet) são divididas pela soma da venda média mensal de todos os produtos da categoria." },
    { c: COLORS.ink, t: "Custo total unitário", f: "custo_total = custo_variável + rateio", d: "O custo real de colocar uma unidade daquele SKU na prateleira, incluindo a fatia que ele carrega da estrutura fixa." },
    { c: COLORS.margin, t: "Margem (markup divisor)", f: "preço = custo_total ÷ (1 − margem)", d: "O preço sugerido usa o método do markup divisor, garantindo que a margem informada seja sobre o preço de venda, não sobre o custo." },
    { c: COLORS.price, t: "Margem unitária", f: "margem_unitária = preço − custo_total", d: "O valor, em reais, que cada unidade vendida deixa de lucro para a operação." },
  ];
  return (
    <div className="flex flex-col gap-5 pb-16 pt-8 max-w-2xl">
      <h2 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 26, color: COLORS.ink }}>Como o preço é calculado</h2>
      <p style={{ fontFamily: "Inter", color: "#5B564C" }}>
        A mesma lógica das planilhas originais, em cinco passos. Cada passo alimenta o próximo —
        mude qualquer número na Calculadora e o preço sugerido é recalculado automaticamente.
      </p>
      <div className="flex flex-col">
        {steps.map((s, i) => (
          <div key={s.t} className="flex gap-4 py-4" style={{ borderTop: i > 0 ? `1px solid ${COLORS.line}` : "none" }}>
            <div className="w-2 rounded-full shrink-0" style={{ background: s.c }} />
            <div>
              <div className="flex items-baseline gap-2">
                <span style={{ fontFamily: "JetBrains Mono", fontSize: 12, color: COLORS.muted }}>0{i + 1}</span>
                <h3 style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 16, color: COLORS.ink }}>{s.t}</h3>
              </div>
              <code className="block mt-1.5 mb-1.5 px-2.5 py-1.5 rounded-md inline-block text-[12.5px]" style={{ background: COLORS.paperDeep, fontFamily: "JetBrains Mono", color: COLORS.ink }}>
                {s.f}
              </code>
              <p className="text-sm" style={{ fontFamily: "Inter", color: "#5B564C" }}>{s.d}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   APP SHELL
   ---------------------------------------------------------------- */
export default function App() {
  const [data, setData] = useState(() => JSON.parse(JSON.stringify(CATEGORIES)));
  const [page, setPage] = useState("home");
  const [navOpen, setNavOpen] = useState(false);

  const nav = [
    { id: "home", label: "Início", icon: LayoutGrid },
    { id: "calc", label: "Calculadora", icon: Calculator },
    { id: "report", label: "Relatório", icon: BarChart3 },
    { id: "how", label: "Como funciona", icon: BookOpen },
  ];

  const go = (id) => { setPage(id); setNavOpen(false); };

  return (
    <div style={{ background: COLORS.paper, minHeight: "100%", fontFamily: "Inter" }}>
      <style>{`
        ${FONT_IMPORT}
        input[type=range]{ accent-color: ${COLORS.ink}; }
        ::selection{ background: ${COLORS.margin}; }
      `}</style>

      <header className="sticky top-0 z-10" style={{ background: `${COLORS.paper}F2`, backdropFilter: "blur(6px)", borderBottom: `1px solid ${COLORS.line}` }}>
        <div className="max-w-6xl mx-auto px-5 md:px-8 flex items-center justify-between h-16">
          <button onClick={() => go("home")} className="flex items-center gap-2">
            <div style={{ background: COLORS.ink, width: 26, height: 26, borderRadius: 6, display: "grid", placeItems: "center" }}>
              <Boxes size={15} color={COLORS.paper} />
            </div>
            <span style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 16, color: COLORS.ink }}>Precifica</span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {nav.map((n) => (
              <button
                key={n.id}
                onClick={() => go(n.id)}
                className="px-3.5 py-2 rounded-full text-sm font-medium flex items-center gap-1.5"
                style={{ fontFamily: "Space Grotesk", background: page === n.id ? COLORS.ink : "transparent", color: page === n.id ? COLORS.paper : COLORS.ink }}
              >
                {n.label}
              </button>
            ))}
          </nav>

          <button className="md:hidden" onClick={() => setNavOpen((v) => !v)}>
            {navOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {navOpen && (
          <div className="md:hidden flex flex-col px-5 pb-3 gap-1">
            {nav.map((n) => (
              <button key={n.id} onClick={() => go(n.id)} className="text-left px-3 py-2 rounded-md text-sm" style={{ fontFamily: "Space Grotesk", background: page === n.id ? COLORS.paperDeep : "transparent", color: COLORS.ink }}>
                {n.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-5 md:px-8">
        {page === "home" && <Home data={data} go={go} />}
        {page === "calc" && <CalcPage data={data} setData={setData} />}
        {page === "report" && <ReportPage data={data} />}
        {page === "how" && <HowPage />}
      </main>

      <footer className="border-t" style={{ borderColor: COLORS.line }}>
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-6 flex justify-between text-xs" style={{ color: COLORS.muted, fontFamily: "Inter" }}>
          <span>Precifica — calculadora de custo e preço sugerido</span>
          <span>Identidade visual inspirada no universo dos cubos mágicos</span>
        </div>
      </footer>
    </div>
  );
}
