/* ==================================================================
   PRECIFICA — vanilla JS app
   Mirrors the spreadsheet formulas exactly:
     custoVar    = c1 + c2 + c3
     rateio      = totalFixo / somaVendaMedia
     custoTotal  = custoVar + rateio
     preco       = custoTotal / (1 - margem)
     margemUnit  = preco - custoTotal
   ================================================================== */

const COLORS = {
  ink: "#181615",
  paper: "#F3EFE6",
  paperDeep: "#EAE3D3",
  line: "#D8CFB8",
  variable: "#2B5FE0",
  fixed: "#E0392B",
  margin: "#F0B429",
  price: "#1E9E5A",
  muted: "#8B8375",
};

const seedFixed = () => ({ aluguel: 1200, maoDeObra: 6000, agua: 180, luz: 300, internet: 89 });
const FIXED_LABELS = { aluguel: "Aluguel", maoDeObra: "Mão de obra", agua: "Água", luz: "Luz", internet: "Internet" };

const CATEGORIES_SEED = {
  moveis: {
    label: "Móveis", unit: "peça", icon: "◧",
    fieldLabels: ["Madeira", "Parafusos", "Verniz"],
    margin: 30, fixedCosts: seedFixed(),
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
    label: "Canetas", unit: "unidade", icon: "◨",
    fieldLabels: ["Corpo / Tubo", "Componentes", "Tinta / Acabamento"],
    margin: 40, fixedCosts: seedFixed(),
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
    label: "Garrafas", unit: "unidade", icon: "◩",
    fieldLabels: ["Corpo da garrafa", "Componentes", "Acabamento"],
    margin: 45, fixedCosts: seedFixed(),
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

const money = (v) => (isFinite(v) ? v : 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

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
   STATE
   ---------------------------------------------------------------- */
const state = {
  data: JSON.parse(JSON.stringify(CATEGORIES_SEED)),
  page: "home",
  homeDemoCat: "garrafas",
  homeDemoSkuId: CATEGORIES_SEED.garrafas.skus[0].id,
  calcCat: "garrafas",
};
let reportChart = null;

/* ---------------------------------------------------------------
   SHARED RENDER HELPERS
   ---------------------------------------------------------------- */
function pillGroup(activeKey, groupClass, extraAttr) {
  return `<div class="pill-group ${groupClass}">${Object.entries(state.data)
    .map(
      ([key, c]) => `<button class="pill ${key === activeKey ? "active" : ""}" data-${extraAttr}="${key}">${c.icon} ${c.label}</button>`
    )
    .join("")}</div>`;
}

function cubePanel(label, value, sub, bg, big) {
  return `<div class="cube-panel ${big ? "big" : ""}" style="background:${bg}">
    <span class="label">${label}</span>
    <div><div class="value">${money(value)}</div>${sub ? `<div class="sub">${sub}</div>` : ""}</div>
  </div>`;
}

function cubeNet(sku, rateio, unit) {
  if (!sku) return "";
  return `<div class="cube-net">
    <div style="grid-column:2/3">${cubePanel("1 · Custo variável", sku.custoVar, "matéria-prima / unidade", COLORS.variable)}</div>
    <div style="grid-column:1/2;grid-row:2">${cubePanel("2 · Rateio fixo", rateio, "custo fixo ÷ vendas", COLORS.fixed)}</div>
    <div style="grid-column:2/3;grid-row:2">${cubePanel("Custo total", sku.custoTotal, `por ${unit}`, COLORS.ink, true)}</div>
    <div style="grid-column:3/4;grid-row:2">${cubePanel("3 · Margem", sku.margemUnit, "lucro planejado", COLORS.margin)}</div>
    <div style="grid-column:4/5;grid-row:2">${cubePanel("Preço final", sku.preco, "sugestão de venda", COLORS.price, true)}</div>
  </div>`;
}

/* ---------------------------------------------------------------
   PAGE: HOME
   ---------------------------------------------------------------- */
function renderHome() {
  const el = document.getElementById("page-home");
  const cat = state.data[state.homeDemoCat];
  const computed = computeCategory(cat);
  if (!computed.skus.find((s) => s.id === state.homeDemoSkuId)) {
    state.homeDemoSkuId = computed.skus[0].id;
  }
  const activeSku = computed.skus.find((s) => s.id === state.homeDemoSkuId);

  el.innerHTML = `
    <section class="hero">
      <div>
        <span class="eyebrow">Ferramenta de precificação</span>
        <h1>Cada preço tem uma solução certa.</h1>
        <p>Monte o custo fixo da fábrica, o custo variável de cada SKU e a margem desejada —
        a ferramenta resolve o preço de venda sugerido, peça por peça, como um cubo mágico:
        uma face de cada vez, até fechar.</p>
        <div class="hero-actions">
          <button class="btn-primary" data-goto="calc">Abrir calculadora →</button>
          <button class="btn-secondary" data-goto="how">Como funciona o cálculo</button>
        </div>
      </div>

      <div class="demo-card">
        ${pillGroup(state.homeDemoCat, "demo-pills", "demo-cat")}
        <select class="demo-select" id="demo-sku-select">
          ${computed.skus.map((s) => `<option value="${s.id}" ${s.id === activeSku.id ? "selected" : ""}>${s.sku} — ${s.name}</option>`).join("")}
        </select>
        ${cubeNet(activeSku, computed.rateio, cat.unit)}
      </div>
    </section>

    <section class="explain-grid">
      <div class="explain-card">
        <span class="n">01</span>
        <h3>Custos fixos</h3>
        <p>Aluguel, mão de obra, água, luz e internet — rateados por unidade vendida no mês.</p>
      </div>
      <div class="explain-card">
        <span class="n">02</span>
        <h3>Custos variáveis</h3>
        <p>Insumos que mudam por SKU: matéria-prima, componentes, acabamento.</p>
      </div>
      <div class="explain-card">
        <span class="n">03</span>
        <h3>Margem alvo</h3>
        <p>A margem que a operação precisa manter — o cálculo faz o resto pelo método do divisor.</p>
      </div>
    </section>
  `;

  el.querySelectorAll("[data-demo-cat]").forEach((btn) =>
    btn.addEventListener("click", () => {
      state.homeDemoCat = btn.dataset.demoCat;
      state.homeDemoSkuId = state.data[state.homeDemoCat].skus[0].id;
      renderHome();
    })
  );
  el.querySelector("#demo-sku-select").addEventListener("change", (e) => {
    state.homeDemoSkuId = e.target.value;
    renderHome();
  });
  el.querySelectorAll("[data-goto]").forEach((btn) =>
    btn.addEventListener("click", () => goPage(btn.dataset.goto))
  );
}

/* ---------------------------------------------------------------
   PAGE: CALCULADORA
   ---------------------------------------------------------------- */
function renderCalc() {
  const el = document.getElementById("page-calc");
  const catKey = state.calcCat;
  const cat = state.data[catKey];
  const computed = computeCategory(cat);

  el.innerHTML = `
    <div class="calc-top">
      ${pillGroup(catKey, "calc-pills", "calc-cat")}
      <div class="calc-rateio">Rateio fixo por ${cat.unit}: <b>${money(computed.rateio)}</b></div>
    </div>

    <div class="calc-grid">
      <div class="table-card">
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>SKU</th><th>Produto</th><th>Venda méd./mês</th>
                <th>${cat.fieldLabels[0]}</th><th>${cat.fieldLabels[1]}</th><th>${cat.fieldLabels[2]}</th>
                <th>Custo unit.</th><th>Preço sugerido</th><th>Margem/un.</th><th></th>
              </tr>
            </thead>
            <tbody id="sku-tbody">
              ${computed.skus.map(skuRow).join("")}
            </tbody>
          </table>
        </div>
        <button class="add-row-btn" id="add-sku-btn">+ Adicionar SKU</button>
      </div>

      <div class="side-col">
        <div class="card">
          <h4 class="card-title">Custos fixos mensais</h4>
          <div class="fixed-costs-list">
            ${Object.entries(cat.fixedCosts)
              .map(
                ([k, v]) => `
              <label class="field">
                <span class="field-label">${FIXED_LABELS[k]}</span>
                <div class="number-input"><span>R$</span><input type="number" step="0.01" value="${v}" data-fixed-key="${k}" /></div>
              </label>`
              )
              .join("")}
            <div class="fixed-total"><span>Total</span><span>${money(computed.totalFixo)}</span></div>
          </div>
        </div>

        <div class="card">
          <h4 class="card-title">Margem (markup)</h4>
          <div class="margin-row">
            <input type="range" min="1" max="80" value="${cat.margin}" id="margin-range" />
            <span class="margin-value" id="margin-value">${cat.margin}%</span>
          </div>
        </div>

        <div class="projection-card">
          <h4>Projeção do mês</h4>
          <div class="proj-row"><span class="lbl">Receita projetada</span><span class="val">${money(computed.receitaTotal)}</span></div>
          <div class="proj-row"><span class="lbl">Lucro projetado</span><span class="val profit">${money(computed.lucroTotal)}</span></div>
          <div class="proj-row"><span class="lbl">Ticket médio</span><span class="val">${money(computed.ticketMedio)}</span></div>
        </div>
      </div>
    </div>
  `;

  el.querySelectorAll("[data-calc-cat]").forEach((btn) =>
    btn.addEventListener("click", () => {
      state.calcCat = btn.dataset.calcCat;
      renderCalc();
    })
  );
  el.querySelector("#add-sku-btn").addEventListener("click", () => {
    cat.skus.push({
      id: `${catKey}-${Date.now()}`,
      sku: String(cat.skus.length + 1).padStart(3, "0"),
      name: "Novo item",
      venda: 0, c1: 0, c2: 0, c3: 0,
    });
    renderCalc();
  });

  const margeRange = el.querySelector("#margin-range");
  margeRange.addEventListener("input", (e) => {
    cat.margin = parseFloat(e.target.value);
    el.querySelector("#margin-value").textContent = cat.margin + "%";
    updateCalcComputedCells();
  });

  el.querySelectorAll("[data-fixed-key]").forEach((input) =>
    input.addEventListener("input", (e) => {
      cat.fixedCosts[e.target.dataset.fixedKey] = parseFloat(e.target.value) || 0;
      renderCalc();
    })
  );

  bindSkuRowEvents(el, cat);
}

function skuRow(s) {
  return `
    <tr data-row-id="${s.id}">
      <td class="sku-code">${s.sku}</td>
      <td><input class="name-input" value="${escapeHtml(s.name)}" data-field="name" /></td>
      <td class="cell-num"><div class="number-input"><input type="number" step="1" value="${s.venda}" data-field="venda" /></div></td>
      <td class="cell-num"><div class="number-input"><span>R$</span><input type="number" step="0.01" value="${s.c1}" data-field="c1" /></div></td>
      <td class="cell-num"><div class="number-input"><span>R$</span><input type="number" step="0.01" value="${s.c2}" data-field="c2" /></div></td>
      <td class="cell-num"><div class="number-input"><span>R$</span><input type="number" step="0.01" value="${s.c3}" data-field="c3" /></div></td>
      <td class="right custo-cell" data-out="custoTotal">${money(s.custoTotal)}</td>
      <td class="right preco-cell" data-out="preco">${money(s.preco)}</td>
      <td class="right margem-cell" data-out="margemUnit">${money(s.margemUnit)}</td>
      <td><button class="remove-btn" data-remove="${s.id}" title="Remover">✕</button></td>
    </tr>`;
}

function bindSkuRowEvents(el, cat) {
  el.querySelectorAll("#sku-tbody [data-field]").forEach((input) => {
    input.addEventListener("input", (e) => {
      const row = e.target.closest("tr");
      const id = row.dataset.rowId;
      const sku = cat.skus.find((s) => s.id === id);
      const field = e.target.dataset.field;
      sku[field] = field === "name" ? e.target.value : (parseFloat(e.target.value) || 0);
      updateCalcComputedCells();
    });
  });
  el.querySelectorAll("[data-remove]").forEach((btn) =>
    btn.addEventListener("click", () => {
      cat.skus = cat.skus.filter((s) => s.id !== btn.dataset.remove);
      renderCalc();
    })
  );
}

// Lightweight recompute: updates numbers without rebuilding inputs (keeps focus while typing)
function updateCalcComputedCells() {
  const el = document.getElementById("page-calc");
  const cat = state.data[state.calcCat];
  const computed = computeCategory(cat);

  el.querySelector(".calc-rateio b").textContent = money(computed.rateio);
  el.querySelector(".fixed-total span:last-child").textContent = money(computed.totalFixo);

  computed.skus.forEach((s) => {
    const row = el.querySelector(`tr[data-row-id="${s.id}"]`);
    if (!row) return;
    row.querySelector('[data-out="custoTotal"]').textContent = money(s.custoTotal);
    row.querySelector('[data-out="preco"]').textContent = money(s.preco);
    row.querySelector('[data-out="margemUnit"]').textContent = money(s.margemUnit);
  });

  const proj = el.querySelectorAll(".proj-row .val");
  proj[0].textContent = money(computed.receitaTotal);
  proj[1].textContent = money(computed.lucroTotal);
  proj[2].textContent = money(computed.ticketMedio);
}

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

/* ---------------------------------------------------------------
   PAGE: RELATÓRIO
   ---------------------------------------------------------------- */
function renderReport() {
  const el = document.getElementById("page-report");
  const catColor = { moveis: COLORS.variable, canetas: COLORS.margin, garrafas: COLORS.price };
  const results = Object.entries(state.data).map(([key, c]) => ({ key, label: c.label, ...computeCategory(c) }));

  el.innerHTML = `
    <div class="report-page">
      <div class="report-cards">
        ${results
          .map(
            (r) => `
          <div class="report-card" style="border-top-color:${catColor[r.key]}">
            <div class="cat-label">${r.label}</div>
            <div class="big-num">${money(r.receitaTotal)}</div>
            <div class="sub-label">receita mensal projetada</div>
            <div class="mini-row"><span class="k">Lucro/mês</span><span class="v" style="color:${COLORS.price}">${money(r.lucroTotal)}</span></div>
            <div class="mini-row"><span class="k">Ticket médio</span><span class="v">${money(r.ticketMedio)}</span></div>
          </div>`
          )
          .join("")}
      </div>

      <div class="chart-card">
        <h4>Custo total × preço sugerido, por SKU</h4>
        <div class="chart-wrap"><canvas id="report-chart"></canvas></div>
      </div>
    </div>
  `;

  const labels = [];
  const custoData = [];
  const precoData = [];
  results.forEach((r) =>
    r.skus.forEach((s) => {
      labels.push(`${r.label.slice(0, 3)} ${s.sku}`);
      custoData.push(+s.custoTotal.toFixed(2));
      precoData.push(+s.preco.toFixed(2));
    })
  );

  if (reportChart) reportChart.destroy();
  const ctx = document.getElementById("report-chart").getContext("2d");
  reportChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Custo", data: custoData, backgroundColor: COLORS.fixed, borderRadius: 3 },
        { label: "Preço", data: precoData, backgroundColor: COLORS.price, borderRadius: 3 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { font: { family: "Inter", size: 10 } }, grid: { display: false } },
        y: { ticks: { font: { family: "JetBrains Mono", size: 11 } }, grid: { color: COLORS.line } },
      },
      plugins: {
        legend: { labels: { font: { family: "Inter", size: 12 } } },
        tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${money(c.raw)}` } },
      },
    },
  });
}

/* ---------------------------------------------------------------
   PAGE: COMO FUNCIONA
   ---------------------------------------------------------------- */
function renderHow() {
  const el = document.getElementById("page-how");
  const steps = [
    { c: COLORS.variable, t: "Custo variável unitário", f: "custo_variável = insumo₁ + insumo₂ + insumo₃", d: "Soma dos materiais que mudam de acordo com o produto — madeira, componentes, tinta, acabamento etc." },
    { c: COLORS.fixed, t: "Rateio do custo fixo", f: "rateio = custo_fixo_total ÷ Σ(venda média de todos os SKUs)", d: "As despesas fixas mensais da fábrica (aluguel, mão de obra, água, luz, internet) são divididas pela soma da venda média mensal de todos os produtos da categoria." },
    { c: COLORS.ink, t: "Custo total unitário", f: "custo_total = custo_variável + rateio", d: "O custo real de colocar uma unidade daquele SKU na prateleira, incluindo a fatia que ele carrega da estrutura fixa." },
    { c: COLORS.margin, t: "Margem (markup divisor)", f: "preço = custo_total ÷ (1 − margem)", d: "O preço sugerido usa o método do markup divisor, garantindo que a margem informada seja sobre o preço de venda, não sobre o custo." },
    { c: COLORS.price, t: "Margem unitária", f: "margem_unitária = preço − custo_total", d: "O valor, em reais, que cada unidade vendida deixa de lucro para a operação." },
  ];

  el.innerHTML = `
    <div class="how-page">
      <h2>Como o preço é calculado</h2>
      <p>A mesma lógica das planilhas originais, em cinco passos. Cada passo alimenta o próximo —
      mude qualquer número na Calculadora e o preço sugerido é recalculado automaticamente.</p>
      <div>
        ${steps
          .map(
            (s, i) => `
          <div class="step-row">
            <div class="step-bar" style="background:${s.c}"></div>
            <div>
              <div class="step-head">
                <span class="step-num">0${i + 1}</span>
                <h3 class="step-title">${s.t}</h3>
              </div>
              <code class="step-formula">${s.f}</code>
              <p class="step-desc">${s.d}</p>
            </div>
          </div>`
          )
          .join("")}
      </div>
    </div>
  `;
}

/* ---------------------------------------------------------------
   NAVIGATION / INIT
   ---------------------------------------------------------------- */
const RENDERERS = { home: renderHome, calc: renderCalc, report: renderReport, how: renderHow };

function goPage(id) {
  state.page = id;
  document.querySelectorAll(".page").forEach((p) => (p.hidden = p.id !== `page-${id}`));
  document.querySelectorAll(".nav-btn, .nav-btn-mobile").forEach((btn) =>
    btn.classList.toggle("active", btn.dataset.page === id)
  );
  document.getElementById("nav-mobile").hidden = true;
  RENDERERS[id]();
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-page]").forEach((btn) =>
    btn.addEventListener("click", () => goPage(btn.dataset.page))
  );
  document.getElementById("nav-toggle").addEventListener("click", () => {
    const nav = document.getElementById("nav-mobile");
    nav.hidden = !nav.hidden;
  });
  goPage("home");
});
