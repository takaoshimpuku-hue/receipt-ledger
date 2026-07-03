const defaultDepartments = ["ニュースクール", "オンタップ", "新福"];
const receiptDepartments = ["ニュースクール", "オンタップ"];
const statuses = ["要確認", "未分類", "処理済み"];
const defaultCategories = [
  "食品",
  "飲料",
  "ビール",
  "消耗品",
  "光熱費",
  "通信費",
  "広告費",
  "交通費",
  "家賃",
  "交際費",
  "税金",
  "外注費",
  "バイト",
  "税理士",
  "リース料",
  "保険料",
  "借入",
  "雑費",
];

const defaultFixedExpenses = [
  { id: "fx-news-rent", department: "ニュースクール", category: "家賃", amount: 451000 },
  { id: "fx-news-tel", department: "ニュースクール", category: "通信費", amount: 12000 },
  { id: "fx-news-lease", department: "ニュースクール", category: "リース料", amount: 83050 },
  { id: "fx-news-tax", department: "ニュースクール", category: "税理士", amount: 50000 },
  { id: "fx-news-ins", department: "ニュースクール", category: "保険料", amount: 20000 },
  { id: "fx-news-loan", department: "ニュースクール", category: "借入", amount: 200000 },
  { id: "fx-ontap-rent", department: "オンタップ", category: "家賃", amount: 165000 },
  { id: "fx-ontap-tel", department: "オンタップ", category: "通信費", amount: 12000 },
  { id: "fx-ontap-utility", department: "オンタップ", category: "光熱費", amount: 150000 },
  { id: "fx-shinfuku-loan", department: "新福", category: "借入", amount: 600000 },
];

const dictionary = [
  { category: "ビール", confidence: 0.95, words: ["ビール", "beer", "生ビール", "アサヒ", "サッポロ", "キリン", "プレモル", "モルツ"] },
  { category: "飲料", confidence: 0.85, words: ["飲料", "ドリンク", "コーヒー", "coffee", "茶", "お茶", "ジュース", "炭酸", "牛乳"] },
  { category: "食品", confidence: 0.85, words: ["食品", "食料", "野菜", "肉", "魚", "米", "パン", "卵", "チーズ", "氷", "調味料", "惣菜"] },
  { category: "消耗品", confidence: 0.82, words: ["消耗", "洗剤", "紙", "袋", "備品", "タオル", "ラップ", "アルミ", "ゴミ", "手袋"] },
  { category: "光熱費", confidence: 0.92, words: ["電気", "ガス", "水道", "光熱"] },
  { category: "通信費", confidence: 0.92, words: ["通信", "電話", "wifi", "wi-fi", "インターネット"] },
  { category: "広告費", confidence: 0.9, words: ["広告", "印刷", "チラシ", "sns", "google", "meta"] },
  { category: "交通費", confidence: 0.9, words: ["交通", "電車", "バス", "タクシー", "駐車", "高速"] },
  { category: "家賃", confidence: 0.98, words: ["家賃", "賃料"] },
  { category: "交際費", confidence: 0.85, words: ["接待", "会食", "交際"] },
  { category: "税金", confidence: 0.9, words: ["税", "消費税", "源泉", "住民税"] },
  { category: "外注費", confidence: 0.9, words: ["外注", "業務委託"] },
  { category: "バイト", confidence: 0.9, words: ["アルバイト", "バイト", "給与"] },
  { category: "税理士", confidence: 0.98, words: ["税理士", "会計"] },
  { category: "リース料", confidence: 0.98, words: ["リース"] },
  { category: "保険料", confidence: 0.98, words: ["保険"] },
  { category: "借入", confidence: 0.98, words: ["借入", "返済"] },
];

const storageKey = "monthly-expense-ledger-v2";
const oldRowsKey = "monthly-expense-ledger-v1";
const shareKey = "monthly-expense-ledger-share-token";
let data = loadData();
let activeFilter = "all";
let shareToken = new URLSearchParams(location.search).get("share") || localStorage.getItem(shareKey) || "";
let syncTimer = null;
let syncing = false;

const els = {
  targetMonth: document.querySelector("#targetMonth"),
  receiptInput: document.querySelector("#receiptInput"),
  dropZone: document.querySelector("#dropZone"),
  receiptDept: document.querySelector("#receiptDept"),
  manualDept: document.querySelector("#manualDept"),
  manualCategory: document.querySelector("#manualCategory"),
  manualDate: document.querySelector("#manualDate"),
  manualVendor: document.querySelector("#manualVendor"),
  manualAmount: document.querySelector("#manualAmount"),
  addManualBtn: document.querySelector("#addManualBtn"),
  addFixedBtn: document.querySelector("#addFixedBtn"),
  clearBtn: document.querySelector("#clearBtn"),
  exportBtn: document.querySelector("#exportBtn"),
  saveFixedBtn: document.querySelector("#saveFixedBtn"),
  addCategoryBtn: document.querySelector("#addCategoryBtn"),
  newCategoryInput: document.querySelector("#newCategoryInput"),
  saveSalesBtn: document.querySelector("#saveSalesBtn"),
  createShareBtn: document.querySelector("#createShareBtn"),
  copyShareBtn: document.querySelector("#copyShareBtn"),
  shareUrlInput: document.querySelector("#shareUrlInput"),
  syncStatus: document.querySelector("#syncStatus"),
  salesNight: document.querySelector("#salesNight"),
  salesParty: document.querySelector("#salesParty"),
  status: document.querySelector("#status"),
  summaryGrid: document.querySelector("#summaryGrid"),
  receiptList: document.querySelector("#receiptList"),
  monthlySummaryGrid: document.querySelector("#monthlySummaryGrid"),
  categorySummaryBody: document.querySelector("#categorySummaryBody"),
  receiptCountBody: document.querySelector("#receiptCountBody"),
  salesSummaryGrid: document.querySelector("#salesSummaryGrid"),
  fixedSettingsBody: document.querySelector("#fixedSettingsBody"),
  categoryList: document.querySelector("#categoryList"),
  receiptTemplate: document.querySelector("#receiptTemplate"),
  lineTemplate: document.querySelector("#lineTemplate"),
};

init();

function init() {
  const today = new Date();
  els.targetMonth.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  fillSelect(els.receiptDept, receiptDepartments);
  fillSelect(els.manualDept, defaultDepartments);
  fillSelect(els.manualCategory, data.categories);
  els.manualDate.value = toDateInput(today);
  bindEvents();
  render();
  renderSharePanel();
  loadSharedData();
}

function bindEvents() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.view));
  });
  document.querySelectorAll(".filter-button").forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      document.querySelectorAll(".filter-button").forEach((item) => item.classList.toggle("active", item === button));
      renderReceipts();
    });
  });
  els.targetMonth.addEventListener("change", render);
  els.receiptInput.addEventListener("change", (event) => handleFiles(event.target.files));
  els.dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    els.dropZone.classList.add("dragging");
  });
  els.dropZone.addEventListener("dragleave", () => els.dropZone.classList.remove("dragging"));
  els.dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    els.dropZone.classList.remove("dragging");
    handleFiles(event.dataTransfer.files);
  });
  els.addManualBtn.addEventListener("click", addManualReceipt);
  els.addFixedBtn.addEventListener("click", addFixedRows);
  els.clearBtn.addEventListener("click", clearAll);
  els.exportBtn.addEventListener("click", exportExcel);
  els.saveFixedBtn.addEventListener("click", saveFixedSettings);
  els.addCategoryBtn.addEventListener("click", addCategory);
  els.saveSalesBtn.addEventListener("click", saveSales);
  els.createShareBtn.addEventListener("click", createShareUrl);
  els.copyShareBtn.addEventListener("click", copyShareUrl);
}

async function handleFiles(fileList) {
  const files = [...fileList].filter((file) => file.type.startsWith("image/"));
  if (!files.length) return;

  for (const [index, file] of files.entries()) {
    setStatus(`OCR処理中 ${index + 1}/${files.length}: ${file.name}`);
    const text = await readReceipt(file);
    const receipt = createReceiptFromText(text, file.name, els.receiptDept.value);
    data.receipts.unshift(receipt);
    data.lines.unshift(...createLinesFromText(receipt, text));
    applyReceiptChecks(receipt.id);
    saveData();
    render();
  }

  setStatus(`${files.length}件の写真を取込番号つきで追加しました`);
  els.receiptInput.value = "";
}

async function readReceipt(file) {
  if (!window.Tesseract) return "";
  try {
    const result = await Tesseract.recognize(file, "jpn+eng", {
      logger: (message) => {
        if (message.status === "recognizing text") {
          setStatus(`OCR処理中 ${Math.round(message.progress * 100)}%`);
        }
      },
    });
    return result.data.text || "";
  } catch (error) {
    console.error(error);
    return "";
  }
}

function createReceiptFromText(text, fileName, department) {
  const date = parseDate(text) || monthFirstDate();
  const id = crypto.randomUUID();
  return {
    id,
    importNo: nextImportNo(date),
    date,
    department,
    storeName: parseVendor(text, fileName),
    sourceFileName: fileName,
    sourceType: "receipt",
    rawText: text,
    expectedTotal: parseAmount(text) || 0,
    status: "要確認",
    warningFlags: [],
    createdAt: new Date().toISOString(),
    confirmedAt: "",
  };
}

function createLinesFromText(receipt, text) {
  const candidates = extractItemLines(text);
  const grouped = new Map();

  candidates.forEach((candidate) => {
    const guess = guessCategory(candidate.text);
    if (!candidate.amount) return;
    const current = grouped.get(guess.category) || { amount: 0, confidence: guess.confidence, names: [] };
    current.amount += candidate.amount;
    current.confidence = Math.min(current.confidence, guess.confidence);
    current.names.push(candidate.text);
    grouped.set(guess.category, current);
  });

  if (!grouped.size) {
    const guess = guessCategory(text);
    return [
      {
        id: crypto.randomUUID(),
        receiptId: receipt.id,
        category: guess.category,
        itemName: receipt.storeName,
        amount: receipt.expectedTotal || 0,
        confidence: guess.confidence,
        status: guess.category === "雑費" ? "未分類" : "要確認",
        memo: text ? "AI案。確認してください" : "OCR未読取。手入力してください",
        locked: false,
      },
    ];
  }

  return [...grouped.entries()].map(([category, item]) => ({
    id: crypto.randomUUID(),
    receiptId: receipt.id,
    category,
    itemName: item.names.slice(0, 3).join(" / "),
    amount: item.amount,
    confidence: item.confidence,
    status: category === "雑費" ? "未分類" : "要確認",
    memo: item.confidence < 0.8 ? "分類が怪しい" : "AI案。確認してください",
    locked: false,
  }));
}

function addManualReceipt() {
  const amount = Number(els.manualAmount.value);
  if (!amount) {
    setStatus("金額を入力してください");
    return;
  }
  const date = els.manualDate.value || monthFirstDate();
  const receipt = {
    id: crypto.randomUUID(),
    importNo: nextImportNo(date),
    date,
    department: els.manualDept.value,
    storeName: els.manualVendor.value || "手入力",
    sourceFileName: "手入力",
    sourceType: "manual",
    rawText: "",
    expectedTotal: amount,
    status: "要確認",
    warningFlags: [],
    createdAt: new Date().toISOString(),
    confirmedAt: "",
  };
  data.receipts.unshift(receipt);
  data.lines.unshift({
    id: crypto.randomUUID(),
    receiptId: receipt.id,
    category: els.manualCategory.value,
    itemName: receipt.storeName,
    amount,
    confidence: 1,
    status: "要確認",
    memo: "手入力",
    locked: false,
  });
  els.manualVendor.value = "";
  els.manualAmount.value = "";
  applyReceiptChecks(receipt.id);
  persistAndRender("手入力の取込番号を作成しました");
}

function addFixedRows() {
  const month = els.targetMonth.value;
  const monthDate = `${month}-01`;
  cleanupFixedReceipts(month);
  const grouped = groupBy(data.fixedExpenses, (item) => item.department);
  let added = 0;

  Object.entries(grouped).forEach(([department, items]) => {
    let receipt = data.receipts.find(
      (receipt) => receipt.sourceType === "fixed" && receipt.department === department && receipt.date.startsWith(month)
    );
    if (!receipt) {
      receipt = {
        id: crypto.randomUUID(),
        importNo: `FIX-${month}-${department}`,
        date: monthDate,
        department,
        storeName: "固定費",
        sourceFileName: "固定費設定",
        sourceType: "fixed",
        rawText: "",
        expectedTotal: 0,
        status: "処理済み",
        warningFlags: [],
        createdAt: new Date().toISOString(),
        confirmedAt: new Date().toISOString(),
      };
      data.receipts.unshift(receipt);
    }

    const currentLines = getReceiptLines(receipt.id);
    const missingItems = items.filter((item) => !currentLines.some((line) => line.category === item.category && line.memo === "固定費"));
    data.lines.unshift(
      ...missingItems.map((item) => ({
        id: crypto.randomUUID(),
        receiptId: receipt.id,
        category: item.category,
        itemName: item.category,
        amount: item.amount,
        confidence: 1,
        status: "処理済み",
        memo: "固定費",
        locked: true,
      }))
    );
    receipt.expectedTotal = sum(getReceiptLines(receipt.id).map((line) => line.amount));
    added += missingItems.length;
  });

  persistAndRender(`${added}件の固定費を追加しました`);
}

function cleanupFixedReceipts(month) {
  const fixedReceipts = data.receipts.filter((receipt) => receipt.sourceType === "fixed" && receipt.date.startsWith(month));
  const keepByDepartment = new Map();
  fixedReceipts.forEach((receipt) => {
    const keep = keepByDepartment.get(receipt.department);
    if (!keep) {
      keepByDepartment.set(receipt.department, receipt);
      return;
    }
    getReceiptLines(receipt.id).forEach((line) => {
      const keepLines = getReceiptLines(keep.id);
      if (!keepLines.some((item) => item.category === line.category && item.memo === "固定費")) {
        line.receiptId = keep.id;
      }
    });
    data.receipts = data.receipts.filter((item) => item.id !== receipt.id);
  });
  keepByDepartment.forEach((receipt) => {
    const expectedCategories = new Set((data.fixedExpenses || []).filter((item) => item.department === receipt.department).map((item) => item.category));
    const seen = new Set();
    data.lines = data.lines.filter((line) => {
      if (line.receiptId !== receipt.id) return true;
      const key = `${line.category}|${line.memo}`;
      if (line.memo === "固定費" && (!expectedCategories.has(line.category) || seen.has(key))) return false;
      seen.add(key);
      return true;
    });
    receipt.expectedTotal = sum(getReceiptLines(receipt.id).map((line) => line.amount));
  });
}

function render() {
  ensureCurrentSales();
  renderSummary();
  renderReceipts();
  renderMonthly();
  renderSales();
  renderSettings();
  fillSelect(els.manualCategory, data.categories);
}

function renderSummary() {
  const monthReceipts = getMonthReceipts();
  const monthLines = getLinesForReceipts(monthReceipts);
  const needs = monthReceipts.filter((receipt) => aggregateStatus(receipt) === "要確認").length;
  const unclassified = monthReceipts.filter((receipt) => aggregateStatus(receipt) === "未分類").length;
  const duplicates = monthReceipts.filter((receipt) => receipt.warningFlags.includes("重複疑い")).length;
  const receiptCount = monthReceipts.filter((receipt) => receipt.sourceType === "receipt").length;

  els.summaryGrid.innerHTML = [
    ["ニュースクール", yen(sumByDepartment(monthLines, "ニュースクール"))],
    ["オンタップ", yen(sumByDepartment(monthLines, "オンタップ"))],
    ["要確認 / 未分類", `${needs}件 / ${unclassified}件`],
    ["取込件数 / 重複疑い", `${receiptCount}件 / ${duplicates}件`],
  ]
    .map(summaryCard)
    .join("");
}

function renderReceipts() {
  els.receiptList.innerHTML = "";
  const receipts = getMonthReceipts().filter((receipt) => {
    const status = aggregateStatus(receipt);
    if (activeFilter === "needs") return status === "要確認";
    if (activeFilter === "unclassified") return status === "未分類";
    if (activeFilter === "done") return status === "処理済み";
    return true;
  });

  if (!receipts.length) {
    els.receiptList.innerHTML = `<div class="receipt-card"><strong>対象月のレシートはありません</strong></div>`;
    return;
  }

  receipts.forEach((receipt) => els.receiptList.appendChild(renderReceiptCard(receipt)));
}

function renderReceiptCard(receipt) {
  const card = els.receiptTemplate.content.firstElementChild.cloneNode(true);
  const lines = getReceiptLines(receipt.id);
  const locked = aggregateStatus(receipt) === "処理済み";
  card.classList.toggle("locked", locked);
  card.querySelector(".receipt-title").textContent = `${receipt.importNo} ${receipt.storeName}`;
  card.querySelector(".receipt-meta").textContent = `${receipt.date} / ${receipt.department} / ${receipt.sourceFileName} / 取込 ${formatDateTime(receipt.createdAt)}`;
  card.querySelector(".receipt-badges").innerHTML = badgesForReceipt(receipt).join("");

  card.querySelectorAll("[data-receipt-field]").forEach((input) => {
    const field = input.dataset.receiptField;
    if (field === "department") fillSelect(input, defaultDepartments);
    input.value = receipt[field] ?? "";
    input.disabled = locked;
    input.addEventListener("input", () => {
      receipt[field] = field === "expectedTotal" ? Number(input.value) : input.value;
      applyReceiptChecks(receipt.id);
      saveData();
      render();
    });
  });

  const lineList = card.querySelector(".line-list");
  lines.forEach((line) => lineList.appendChild(renderLineRow(receipt, line, locked)));

  card.querySelector("[data-action='add-line']").disabled = locked;
  card.querySelector("[data-action='add-line']").addEventListener("click", () => {
    data.lines.push({
      id: crypto.randomUUID(),
      receiptId: receipt.id,
      category: data.categories[0],
      itemName: "",
      amount: 0,
      confidence: 1,
      status: "要確認",
      memo: "",
      locked: false,
    });
    applyReceiptChecks(receipt.id);
    persistAndRender("明細を追加しました");
  });
  card.querySelector("[data-action='mark-done']").disabled = locked || receipt.warningFlags.length > 0 || lines.some((line) => !line.amount || line.status !== "要確認" && line.status !== "処理済み");
  card.querySelector("[data-action='mark-done']").addEventListener("click", () => markDone(receipt.id));
  card.querySelector("[data-action='unlock']").disabled = !locked;
  card.querySelector("[data-action='unlock']").addEventListener("click", () => unlockReceipt(receipt.id));
  card.querySelector("[data-action='delete-receipt']").addEventListener("click", () => deleteReceipt(receipt.id));
  return card;
}

function renderLineRow(receipt, line, receiptLocked) {
  const row = els.lineTemplate.content.firstElementChild.cloneNode(true);
  const locked = receiptLocked || line.locked;
  row.querySelectorAll("[data-line-field]").forEach((input) => {
    const field = input.dataset.lineField;
    if (field === "category") fillSelect(input, data.categories);
    if (field === "status") fillSelect(input, statuses);
    input.value = line[field] ?? "";
    input.disabled = locked;
    input.addEventListener("input", () => {
      line[field] = field === "amount" ? Number(input.value) : input.value;
      if (field === "category" && line.status === "未分類") line.status = "要確認";
      applyReceiptChecks(receipt.id);
      saveData();
      render();
    });
  });
  row.querySelector("[data-action='delete-line']").disabled = locked;
  row.querySelector("[data-action='delete-line']").addEventListener("click", () => {
    data.lines = data.lines.filter((item) => item.id !== line.id);
    applyReceiptChecks(receipt.id);
    persistAndRender("明細を削除しました");
  });
  return row;
}

function renderMonthly() {
  const monthReceipts = getMonthReceipts();
  const monthLines = getLinesForReceipts(monthReceipts);
  els.monthlySummaryGrid.innerHTML = [
    ["ニュースクール", yen(sumByDepartment(monthLines, "ニュースクール"))],
    ["オンタップ", yen(sumByDepartment(monthLines, "オンタップ"))],
    ["新福", yen(sumByDepartment(monthLines, "新福"))],
    ["月合計", yen(sum(monthLines.map((line) => line.amount)))],
  ]
    .map(summaryCard)
    .join("");

  els.categorySummaryBody.innerHTML = data.categories
    .map((category) => {
      const ns = sumLines(monthLines, { department: "ニュースクール", category });
      const ot = sumLines(monthLines, { department: "オンタップ", category });
      const sf = sumLines(monthLines, { department: "新福", category });
      const total = ns + ot + sf;
      if (!total) return "";
      return `<tr><td>${escapeHtml(category)}</td><td>${yen(ns)}</td><td>${yen(ot)}</td><td>${yen(sf)}</td><td>${yen(total)}</td></tr>`;
    })
    .join("");

  const byMonth = groupBy(data.receipts.filter((receipt) => receipt.sourceType === "receipt"), (receipt) => receipt.date.slice(0, 7));
  els.receiptCountBody.innerHTML = Object.entries(byMonth)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([month, receipts]) => {
      const ns = receipts.filter((receipt) => receipt.department === "ニュースクール").length;
      const ot = receipts.filter((receipt) => receipt.department === "オンタップ").length;
      return `<tr><td>${month}</td><td>${ns}件</td><td>${ot}件</td><td>${receipts.length}件</td></tr>`;
    })
    .join("");
}

function renderSales() {
  const sales = ensureCurrentSales();
  els.salesNight.value = sales.night || "";
  els.salesParty.value = sales.party || "";
  const monthLines = getLinesForReceipts(getMonthReceipts()).filter((line) => getReceipt(line.receiptId)?.department === "ニュースクール");
  const food = sumLines(monthLines, { category: "食品" });
  const drink = sumLines(monthLines, { category: "飲料" });
  const beer = sumLines(monthLines, { category: "ビール" });
  const totalSales = Number(sales.night || 0) + Number(sales.party || 0);
  els.salesSummaryGrid.innerHTML = [
    ["夜", yen(sales.night || 0)],
    ["パーティー", yen(sales.party || 0)],
    ["売上合計", yen(totalSales)],
    ["食品 原価率", percent(food, totalSales)],
    ["飲料 原価率", percent(drink, totalSales)],
    ["ビール 原価率", percent(beer, totalSales)],
    ["食品+飲料+ビール 原価率", percent(food + drink + beer, totalSales)],
  ]
    .map(summaryCard)
    .join("");
}

function renderSettings() {
  renderSharePanel();
  els.categoryList.innerHTML = data.categories
    .map(
      (category) =>
        `<span class="category-chip">${escapeHtml(category)}${
          defaultCategories.includes(category) ? "" : ` <button data-remove-category="${escapeHtml(category)}" class="danger">削除</button>`
        }</span>`
    )
    .join("");
  els.categoryList.querySelectorAll("[data-remove-category]").forEach((button) => {
    button.addEventListener("click", () => removeCategory(button.dataset.removeCategory));
  });
  els.fixedSettingsBody.innerHTML = data.fixedExpenses
    .map(
      (item) => `
        <tr data-fixed-id="${item.id}">
          <td><select data-fixed-field="department">${defaultDepartments
            .map((department) => `<option value="${department}" ${department === item.department ? "selected" : ""}>${department}</option>`)
            .join("")}</select></td>
          <td><select data-fixed-field="category">${data.categories
            .map((category) => `<option value="${category}" ${category === item.category ? "selected" : ""}>${category}</option>`)
            .join("")}</select></td>
          <td><input data-fixed-field="amount" type="number" min="0" step="1" value="${item.amount}" /></td>
        </tr>`
    )
    .join("");
}

function applyReceiptChecks(receiptId) {
  const receipt = getReceipt(receiptId);
  if (!receipt) return;
  const lines = getReceiptLines(receiptId);
  const flags = new Set();
  if (!receipt.expectedTotal && receipt.sourceType !== "fixed") flags.add("金額不明");
  if (lines.some((line) => !line.amount)) flags.add("金額不明");
  if (lines.some((line) => line.status === "未分類" || line.category === "雑費")) flags.add("未分類");
  if (lines.some((line) => line.confidence < 0.8)) flags.add("分類が怪しい");
  const lineTotal = sum(lines.map((line) => Number(line.amount || 0)));
  if (receipt.expectedTotal && Math.abs(lineTotal - receipt.expectedTotal) > 2) flags.add("明細合計不一致");
  if (receipt.sourceType === "receipt" && hasDuplicate(receipt)) flags.add("重複疑い");
  receipt.warningFlags = [...flags];
  receipt.status = aggregateStatus(receipt);
}

function aggregateStatus(receipt) {
  const lines = getReceiptLines(receipt.id);
  if (lines.length && lines.every((line) => line.status === "処理済み" && line.locked) && receipt.warningFlags.length === 0) return "処理済み";
  if (lines.some((line) => line.status === "未分類") || receipt.warningFlags.includes("未分類")) return "未分類";
  return "要確認";
}

function markDone(receiptId) {
  const receipt = getReceipt(receiptId);
  applyReceiptChecks(receiptId);
  if (receipt.warningFlags.length) {
    setStatus(`まだ確認が必要です: ${receipt.warningFlags.join("、")}`);
    render();
    return;
  }
  getReceiptLines(receiptId).forEach((line) => {
    line.status = "処理済み";
    line.locked = true;
  });
  receipt.status = "処理済み";
  receipt.confirmedAt = new Date().toISOString();
  persistAndRender("処理済みにしました");
}

function unlockReceipt(receiptId) {
  if (!confirm("処理済みを修正しますか？解除すると要確認に戻ります。")) return;
  const receipt = getReceipt(receiptId);
  getReceiptLines(receiptId).forEach((line) => {
    line.locked = false;
    line.status = "要確認";
  });
  receipt.status = "要確認";
  receipt.confirmedAt = "";
  applyReceiptChecks(receiptId);
  persistAndRender("ロックを解除しました");
}

function deleteReceipt(receiptId) {
  if (!confirm("この取込番号を削除しますか？")) return;
  data.receipts = data.receipts.filter((receipt) => receipt.id !== receiptId);
  data.lines = data.lines.filter((line) => line.receiptId !== receiptId);
  persistAndRender("取込番号を削除しました");
}

function saveFixedSettings() {
  document.querySelectorAll("[data-fixed-id]").forEach((row) => {
    const item = data.fixedExpenses.find((fixed) => fixed.id === row.dataset.fixedId);
    if (!item) return;
    row.querySelectorAll("[data-fixed-field]").forEach((input) => {
      item[input.dataset.fixedField] = input.dataset.fixedField === "amount" ? Number(input.value) : input.value;
    });
  });
  persistAndRender("固定費を保存しました");
}

function addCategory() {
  const category = els.newCategoryInput.value.trim();
  if (!category || data.categories.includes(category)) return;
  data.categories.push(category);
  els.newCategoryInput.value = "";
  persistAndRender("項目を追加しました");
}

function removeCategory(category) {
  if (defaultCategories.includes(category)) return;
  if (data.lines.some((line) => line.category === category)) {
    setStatus("この項目を使っている明細があります。先に明細の項目を変更してください");
    return;
  }
  data.categories = data.categories.filter((item) => item !== category);
  persistAndRender("項目を削除しました");
}

function saveSales() {
  const sales = ensureCurrentSales();
  sales.night = Number(els.salesNight.value || 0);
  sales.party = Number(els.salesParty.value || 0);
  persistAndRender("売上を保存しました");
}

function clearAll() {
  const answer = prompt("全データを消去するには「全データを消去」と入力してください。");
  if (answer !== "全データを消去") return;
  data = createInitialData();
  persistAndRender("全データを消去しました");
}

function exportExcel() {
  const workbookApi = typeof XLSX !== "undefined" ? XLSX : window.XLSX;
  if (!workbookApi) {
    setStatus("Excel出力ライブラリを読み込めません。インターネット接続を確認してください");
    return;
  }
  const issues = data.receipts.filter((receipt) => receipt.date.startsWith(String(targetYear())) && aggregateStatus(receipt) !== "処理済み").length;
  if (issues && !confirm(`未処理または要確認が${issues}件あります。このままExcel出力しますか？`)) return;

  const wb = workbookApi.utils.book_new();
  for (let monthIndex = 1; monthIndex <= 12; monthIndex += 1) {
    const month = `${targetYear()}-${String(monthIndex).padStart(2, "0")}`;
    const rows = buildExcelRows(month);
    const ws = workbookApi.utils.aoa_to_sheet(rows);
    ws["!cols"] = [{ wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 28 }, { wch: 12 }, { wch: 18 }, { wch: 26 }, { wch: 22 }];
    workbookApi.utils.book_append_sheet(wb, ws, `${monthIndex}月`);
  }
  const workbookBytes = workbookApi.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([workbookBytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `支出伝票_${targetYear()}年分.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setStatus("Excelを出力しました");
}

function buildExcelRows(month) {
  const receipts = data.receipts.filter((receipt) => receipt.date.startsWith(month));
  const lines = getLinesForReceipts(receipts);
  const sales = data.sales[month] || { night: 0, party: 0 };
  const totalSales = Number(sales.night || 0) + Number(sales.party || 0);
  const nsLines = lines.filter((line) => getReceipt(line.receiptId)?.department === "ニュースクール");
  const food = sumLines(nsLines, { category: "食品" });
  const drink = sumLines(nsLines, { category: "飲料" });
  const beer = sumLines(nsLines, { category: "ビール" });
  const rows = [
    [`${month} 支出伝票`],
    [],
    ["部門別合計"],
    ["部門", "合計"],
    ...defaultDepartments.map((department) => [department, sumByDepartment(lines, department)]),
    ["月合計", sum(lines.map((line) => line.amount))],
    [],
    ["ニュースクール売上・原価率"],
    ["夜", sales.night || 0],
    ["パーティー", sales.party || 0],
    ["売上合計", totalSales],
    ["食品 原価率", percent(food, totalSales)],
    ["飲料 原価率", percent(drink, totalSales)],
    ["ビール 原価率", percent(beer, totalSales)],
    ["食品+飲料+ビール 原価率", percent(food + drink + beer, totalSales)],
    [],
    ["項目別合計"],
    ["項目", "ニュースクール", "オンタップ", "新福", "合計"],
    ...data.categories
      .map((category) => {
        const ns = sumLines(lines, { department: "ニュースクール", category });
        const ot = sumLines(lines, { department: "オンタップ", category });
        const sf = sumLines(lines, { department: "新福", category });
        return [category, ns, ot, sf, ns + ot + sf];
      })
      .filter((row) => row[4]),
    [],
    ["明細"],
    ["取込番号", "日付", "部門", "項目", "内容", "金額", "確認状態", "警告", "元ファイル名"],
  ];
  receipts.forEach((receipt) => {
    getReceiptLines(receipt.id).forEach((line) => {
      rows.push([
        receipt.importNo,
        receipt.date,
        receipt.department,
        line.category,
        line.itemName,
        line.amount,
        line.status,
        receipt.warningFlags.join("、"),
        receipt.sourceFileName,
      ]);
    });
  });
  return rows;
}

function switchView(viewId) {
  document.querySelectorAll(".tab-button").forEach((button) => button.classList.toggle("active", button.dataset.view === viewId));
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active", view.id === viewId));
}

function getMonthReceipts() {
  return data.receipts.filter((receipt) => receipt.date.startsWith(els.targetMonth.value));
}

function getReceipt(id) {
  return data.receipts.find((receipt) => receipt.id === id);
}

function getReceiptLines(receiptId) {
  return data.lines.filter((line) => line.receiptId === receiptId);
}

function getLinesForReceipts(receipts) {
  const ids = new Set(receipts.map((receipt) => receipt.id));
  return data.lines.filter((line) => ids.has(line.receiptId));
}

function sumLines(lines, filters = {}) {
  return sum(
    lines
      .filter((line) => {
        const receipt = getReceipt(line.receiptId);
        if (filters.department && receipt?.department !== filters.department) return false;
        if (filters.category && line.category !== filters.category) return false;
        return true;
      })
      .map((line) => Number(line.amount || 0))
  );
}

function sumByDepartment(lines, department) {
  return sumLines(lines, { department });
}

function badgesForReceipt(receipt) {
  const status = aggregateStatus(receipt);
  const className = status === "処理済み" ? "done" : status === "未分類" ? "unclassified" : "needs";
  return [
    `<span class="badge ${className}">${status}</span>`,
    ...receipt.warningFlags.map((flag) => `<span class="badge ${flag === "重複疑い" ? "duplicate" : "bad"}">${escapeHtml(flag)}</span>`),
    `<span class="badge">${yen(sum(getReceiptLines(receipt.id).map((line) => line.amount)))}</span>`,
  ];
}

function hasDuplicate(receipt) {
  return data.receipts.some((other) => {
    if (other.id === receipt.id || other.sourceType !== "receipt") return false;
    if (other.date !== receipt.date) return false;
    if (!receipt.expectedTotal || !other.expectedTotal || Math.abs(other.expectedTotal - receipt.expectedTotal) > 2) return false;
    const storeScore = similarity(receipt.storeName, other.storeName);
    return storeScore > 0.35 || receipt.sourceFileName === other.sourceFileName;
  });
}

function extractItemLines(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length >= 3 && !/(合計|小計|税込|お預|釣|領収|レシート)/.test(line))
    .map((line) => {
      const match = line.match(/(.+?)\s+[¥￥]?\s*([0-9０-９,，]{2,})\s*円?$/);
      return match ? { text: match[1].trim(), amount: Number(toHalfWidth(match[2]).replace(/[^\d]/g, "")) } : null;
    })
    .filter(Boolean);
}

function guessCategory(text) {
  const source = text.toLowerCase();
  for (const item of dictionary) {
    if (item.words.some((word) => source.includes(word.toLowerCase()))) {
      return { category: item.category, confidence: item.confidence };
    }
  }
  return { category: "雑費", confidence: 0.45 };
}

function parseDate(text) {
  const normalized = text.replace(/[年月.]/g, "/").replace(/日/g, "");
  const match = normalized.match(/(20\d{2}|令和\s*\d+|R\s*\d+)[/\-\s]*(\d{1,2})[/\-\s]*(\d{1,2})/i);
  if (!match) return "";
  let year = match[1];
  if (/令和|R/i.test(year)) year = 2018 + Number(year.replace(/\D/g, ""));
  return `${year}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
}

function parseVendor(text, fallback) {
  const firstReadableLine = text
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length >= 2 && !/^\d|合計|小計|領収|レシート/.test(line));
  return firstReadableLine || fallback.replace(/\.[^.]+$/, "");
}

function parseAmount(text) {
  const lines = text.split("\n");
  const priorityLine = [...lines].reverse().find((line) => /(合計|総合計|税込|お買上|支払|領収)/.test(line));
  const target = priorityLine || text;
  const amounts = [...target.matchAll(/[¥￥]?\s*([0-9０-９,，]{3,})\s*円?/g)]
    .map((match) => Number(toHalfWidth(match[1]).replace(/[^\d]/g, "")))
    .filter(Boolean);
  if (amounts.length) return Math.max(...amounts);
  const allAmounts = [...text.matchAll(/[¥￥]?\s*([0-9０-９,，]{3,})\s*円?/g)]
    .map((match) => Number(toHalfWidth(match[1]).replace(/[^\d]/g, "")))
    .filter(Boolean);
  return allAmounts.length ? Math.max(...allAmounts) : 0;
}

function nextImportNo(date) {
  const month = date.slice(0, 7);
  const count = data.receipts.filter((receipt) => receipt.importNo?.startsWith(`R-${month}`)).length + 1;
  return `R-${month}-${String(count).padStart(3, "0")}`;
}

function ensureCurrentSales() {
  const month = els.targetMonth.value;
  if (!data.sales[month]) data.sales[month] = { night: 0, party: 0 };
  return data.sales[month];
}

function saveData() {
  localStorage.setItem(storageKey, JSON.stringify(data));
  scheduleCloudSave();
}

async function loadSharedData() {
  if (!shareToken) return;
  localStorage.setItem(shareKey, shareToken);
  renderSharePanel("共有データを確認中");
  try {
    const response = await fetch(`/api/state?share=${encodeURIComponent(shareToken)}`);
    if (!response.ok) throw new Error("共有データを読み込めません");
    const payload = await response.json();
    if (payload.data) {
      data = normalizeData(payload.data);
      localStorage.setItem(storageKey, JSON.stringify(data));
      render();
      renderSharePanel(`共有データを読み込みました ${formatDateTime(payload.updatedAt)}`);
    } else {
      await saveCloudNow();
      renderSharePanel("共有URLを作成しました");
    }
  } catch (error) {
    console.error(error);
    renderSharePanel("共有サーバーに接続できません。この端末に保存中");
  }
}

async function createShareUrl() {
  try {
    const response = await fetch("/api/share/new", { method: "POST" });
    if (!response.ok) throw new Error("共有URLを作成できません");
    const payload = await response.json();
    shareToken = payload.token;
    localStorage.setItem(shareKey, shareToken);
    await saveCloudNow();
    updateShareUrlInAddress();
    renderSharePanel("共有URLを作成しました");
  } catch (error) {
    console.error(error);
    renderSharePanel("共有URLを作れません。共有サーバー版のURLで開いてください");
  }
}

async function copyShareUrl() {
  if (!shareToken) {
    await createShareUrl();
    if (!shareToken) return;
  }
  const url = shareUrl();
  try {
    await navigator.clipboard.writeText(url);
    renderSharePanel("共有URLをコピーしました");
  } catch {
    els.shareUrlInput.select();
    document.execCommand("copy");
    renderSharePanel("共有URLをコピーしました");
  }
}

function scheduleCloudSave() {
  if (!shareToken || syncing) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(saveCloudNow, 600);
}

async function saveCloudNow() {
  if (!shareToken) return;
  syncing = true;
  renderSharePanel("共有データを保存中");
  try {
    const response = await fetch(`/api/state?share=${encodeURIComponent(shareToken)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });
    if (!response.ok) throw new Error("共有データを保存できません");
    renderSharePanel("共有データを保存しました");
  } catch (error) {
    console.error(error);
    renderSharePanel("共有サーバーに保存できません。この端末には保存済み");
  } finally {
    syncing = false;
  }
}

function renderSharePanel(message) {
  if (!els.shareUrlInput || !els.syncStatus) return;
  els.shareUrlInput.value = shareToken ? shareUrl() : "";
  els.syncStatus.textContent = message || (shareToken ? "共有URLで同期中" : "この端末に保存中");
}

function shareUrl() {
  const url = new URL(location.href);
  url.searchParams.set("share", shareToken);
  return url.toString();
}

function updateShareUrlInAddress() {
  const url = new URL(location.href);
  url.searchParams.set("share", shareToken);
  history.replaceState(null, "", url);
}

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved?.receipts && saved?.lines) return normalizeData(saved);
  } catch {}
  return migrateOldRows() || createInitialData();
}

function createInitialData() {
  return {
    categories: [...defaultCategories],
    fixedExpenses: defaultFixedExpenses.map((item) => ({ ...item })),
    receipts: [],
    lines: [],
    sales: {},
  };
}

function normalizeData(saved) {
  const savedFixed = saved.fixedExpenses || [];
  const fixedById = new Map(savedFixed.map((item) => [item.id, item]));
  const fixedExpenses = defaultFixedExpenses.map((item) => ({ ...item, ...(fixedById.get(item.id) || {}) }));
  savedFixed.forEach((item) => {
    if (!fixedById.has(item.id) || !defaultFixedExpenses.some((base) => base.id === item.id)) fixedExpenses.push(item);
  });
  return {
    categories: unique([...(saved.categories || []), ...defaultCategories]),
    fixedExpenses,
    receipts: saved.receipts || [],
    lines: saved.lines || [],
    sales: saved.sales || {},
  };
}

function migrateOldRows() {
  try {
    const oldRows = JSON.parse(localStorage.getItem(oldRowsKey));
    if (!Array.isArray(oldRows) || !oldRows.length) return null;
    const migrated = createInitialData();
    oldRows.forEach((row) => {
      const receipt = {
        id: crypto.randomUUID(),
        importNo: row.receiptNo || nextImportNoForData(migrated, row.date || monthFirstDate()),
        date: row.date || monthFirstDate(),
        department: row.department || "ニュースクール",
        storeName: row.vendor || "旧データ",
        sourceFileName: row.memo || "旧データ",
        sourceType: row.memo === "固定費" ? "fixed" : "manual",
        rawText: "",
        expectedTotal: Number(row.amount || 0),
        status: row.status || "要確認",
        warningFlags: [],
        createdAt: new Date().toISOString(),
        confirmedAt: "",
      };
      migrated.receipts.push(receipt);
      migrated.lines.push({
        id: crypto.randomUUID(),
        receiptId: receipt.id,
        category: row.category || "雑費",
        itemName: row.vendor || row.category || "旧データ",
        amount: Number(row.amount || 0),
        confidence: 1,
        status: row.status || "要確認",
        memo: row.memo || "旧データから移行",
        locked: row.status === "処理済み",
      });
    });
    return migrated;
  } catch {
    return null;
  }
}

function nextImportNoForData(targetData, date) {
  const month = date.slice(0, 7);
  const count = targetData.receipts.filter((receipt) => receipt.importNo?.startsWith(`R-${month}`)).length + 1;
  return `R-${month}-${String(count).padStart(3, "0")}`;
}

function persistAndRender(message) {
  saveData();
  render();
  setStatus(message);
}

function setStatus(message) {
  els.status.textContent = message;
}

function fillSelect(select, options) {
  select.innerHTML = options.map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join("");
}

function summaryCard([label, value]) {
  return `<div class="summary-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong></div>`;
}

function groupBy(items, keyFn) {
  return items.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});
}

function sum(items) {
  return items.reduce((total, value) => total + Number(value || 0), 0);
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function targetYear() {
  return Number((els.targetMonth.value || new Date().toISOString().slice(0, 7)).slice(0, 4));
}

function monthFirstDate() {
  const month = els.targetMonth?.value || new Date().toISOString().slice(0, 7);
  return `${month}-01`;
}

function toDateInput(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDateTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("ja-JP", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function yen(value) {
  return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY", maximumFractionDigits: 0 }).format(Number(value || 0));
}

function percent(part, total) {
  if (!total) return "0.0%";
  return `${((Number(part || 0) / Number(total || 0)) * 100).toFixed(1)}%`;
}

function similarity(a, b) {
  const left = new Set(String(a || "").split(""));
  const right = new Set(String(b || "").split(""));
  if (!left.size || !right.size) return 0;
  const intersection = [...left].filter((char) => right.has(char)).length;
  return intersection / Math.max(left.size, right.size);
}

function toHalfWidth(value) {
  return value.replace(/[０-９，]/g, (char) => (char === "，" ? "," : String.fromCharCode(char.charCodeAt(0) - 0xfee0)));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
