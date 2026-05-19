const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");
const farmTooltip = document.getElementById("farmTooltip");

const sourceFarm = document.getElementById("sourceFarm");
const daysRange = document.getElementById("daysRange");
const pressureRange = document.getElementById("infectivityRange");
const controlRange = document.getElementById("controlRange");
const daysOut = document.getElementById("daysOut");
const pressureOut = document.getElementById("infectivityOut");
const controlOut = document.getElementById("controlOut");
const runBtn = document.getElementById("runBtn");
const resetBtn = document.getElementById("resetBtn");
const riskTable = document.getElementById("riskTable");
const apiPreview = document.getElementById("apiPreview");
const copyBtn = document.getElementById("copyBtn");
const highRiskCount = document.getElementById("highRiskCount");
const avgRisk = document.getElementById("avgRisk");
const currentDay = document.getElementById("currentDay");
const updatedAt = document.getElementById("updatedAt");
const scenarioText = document.getElementById("scenarioText");
const modelStatus = document.getElementById("modelStatus");
const modelDetail = document.getElementById("modelDetail");
const langToggle = document.getElementById("langToggle");

const livestock = ["cattle", "pig", "poultry", "goat"];
let lang = "ko";

const labels = {
  ko: {
    brandSubtitle: "가상 농장 그래프 우선순위 시뮬레이션",
    scenarioPanelTitle: "시나리오",
    reset: "시나리오 재생성",
    sourceFarmLabel: "시작 농장",
    daysLabel: "분석 기간",
    pressureLabel: "전파 압력",
    controlLabel: "방역 강도",
    run: "계산",
    running: "계산 중...",
    aiPanelTitle: "브라우저 AI",
    aiNote: "샘플 농장 데이터를 기반으로 우선 확인 대상과 연결 흐름을 시각화합니다. 실제 적용 시 고객사 데이터와 검증 기준을 반영해 고도화할 수 있습니다.",
    help: "도움말",
    toggle: "EN",
    pageTitle: "가상 농장 방역 우선순위 지도",
    readyScenario: "시나리오를 계산하면 날짜별 우선순위 점수가 표시됩니다.",
    highRiskLabel: "높은 우선순위",
    avgRiskLabel: "평균 점수",
    currentDayLabel: "현재 단계",
    legendLow: "낮음",
    legendWatch: "관찰",
    legendHigh: "높음",
    legendSource: "시작점",
    queueTitle: "우선순위 목록",
    waiting: "대기",
    thFarm: "농장",
    thType: "축종",
    thScore: "점수",
    thReason: "근거",
    jsonTitle: "SaaS JSON 페이로드",
    copy: "복사",
    copied: "완료",
    ready: "준비됨",
    readyDetail: "준비됐습니다. 선택한 조건으로 우선순위 계산을 시작합니다.",
    calculating: "계산 중",
    runningModel: "모델 계산 중",
    runningDetail: "{days}일 그래프 계산을 {source}에서 시작합니다...",
    calculatingDay: "{days}일 중 D+{day} 계산 중입니다. 런타임: {runtime}",
    tensorPass: "TensorFlow.js 텐서 패스 {day}/{days} 실행 중...",
    updatedDetail: "Run {run}: {days}일 시뮬레이션을 {runtime}로 계산했습니다.",
    updatedAt: "Run {run} 방금 갱신",
    scenarioLine: "{source} 시작, {days}일 우선순위 분석",
    graphSignal: "그래프 신호",
    highPriority: "높은 우선순위",
    watchFarms: "관찰 농장",
    visibleLinks: "표시 연결",
    top: "상위",
    source: "시작점",
    priority: "우선순위",
    notCalculated: "아직 계산 전",
    useAsSource: "시작점으로 사용",
    monitor: "관찰",
    reasonSource: "시작 농장",
    reasonNear: "시작점과 가까움",
    reasonVehicle: "차량 접촉 높음",
    reasonDensity: "사육 밀도 높음",
    reasonBiosecurity: "방역 취약",
    reasonWind: "바람 노출 높음",
    reasonType: "같은 축종",
    tfRuntime: "TensorFlow.js 텐서 기반 그래프 전파 규칙",
    fallbackRuntime: "JavaScript fallback 그래프 전파 규칙",
    livestock: { cattle: "소", pig: "돼지", poultry: "가금", goat: "염소" },
  },
  en: {
    brandSubtitle: "Virtual farm graph priority simulation",
    scenarioPanelTitle: "Scenario",
    reset: "Regenerate Scenario",
    sourceFarmLabel: "Source farm",
    daysLabel: "Analysis horizon",
    pressureLabel: "Transmission pressure",
    controlLabel: "Control strength",
    run: "Run",
    running: "Running...",
    aiPanelTitle: "Browser AI",
    aiNote: "Visualizes priority targets and connection flow using sample farm data. For production use, it can be refined with customer data and validation criteria.",
    help: "Help",
    toggle: "한글",
    pageTitle: "Virtual Farm Biosecurity Priority Map",
    readyScenario: "Run a scenario to show day-by-day priority scores.",
    highRiskLabel: "High priority",
    avgRiskLabel: "Average score",
    currentDayLabel: "Current step",
    legendLow: "Low",
    legendWatch: "Watch",
    legendHigh: "High",
    legendSource: "Source",
    queueTitle: "Priority Queue",
    waiting: "Waiting",
    thFarm: "Farm",
    thType: "Type",
    thScore: "Score",
    thReason: "Reason",
    jsonTitle: "SaaS JSON Payload",
    copy: "Copy",
    copied: "OK",
    ready: "Ready",
    readyDetail: "Ready. Calculating the selected scenario.",
    calculating: "Calculating",
    runningModel: "Running model",
    runningDetail: "Running {days} day graph calculation from {source}...",
    calculatingDay: "Calculating day {day} of {days} with {runtime}...",
    tensorPass: "TensorFlow.js tensor pass {day} of {days}...",
    updatedDetail: "Updated run {run}: {days} simulated days calculated with {runtime}.",
    updatedAt: "Run {run} updated now",
    scenarioLine: "{source} source, {days}-day priority analysis",
    graphSignal: "Graph signal",
    highPriority: "high priority",
    watchFarms: "watch farms",
    visibleLinks: "visible links",
    top: "Top",
    source: "SOURCE",
    priority: "priority",
    notCalculated: "not calculated",
    useAsSource: "Use as source",
    monitor: "monitor",
    reasonSource: "source farm",
    reasonNear: "near source",
    reasonVehicle: "high vehicle contact",
    reasonDensity: "dense livestock",
    reasonBiosecurity: "low biosecurity",
    reasonWind: "high wind exposure",
    reasonType: "same livestock type",
    tfRuntime: "TensorFlow.js tensor graph-propagation rule",
    fallbackRuntime: "JavaScript fallback graph-propagation rule",
    livestock: { cattle: "Cattle", pig: "Pig", poultry: "Poultry", goat: "Goat" },
  },
};

function text(key, params = {}) {
  let value = labels[lang][key] ?? key;
  Object.entries(params).forEach(([name, paramValue]) => {
    value = value.replaceAll(`{${name}}`, String(paramValue));
  });
  return value;
}

function livestockLabel(typeKey) {
  return labels[lang].livestock[typeKey] ?? typeKey;
}
const farmCount = 44;
let farms = [];
let edges = [];
let adjacency = [];
let results = [];
let dayIndex = 0;
let seed = 9317;
let runCount = 0;
let lastRuntime = "Ready";
let isRunning = false;
let pendingScenarioRun = false;
let hoveredFarmId = null;
let pinnedFarmId = null;

function isTouchMode() {
  return typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;
}

function rand() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}

function createFarms() {
  farms = Array.from({ length: farmCount }, (_, i) => {
    const cluster = i % 4;
    const cx = [210, 490, 760, 615][cluster];
    const cy = [180, 430, 210, 520][cluster];
    const x = Math.max(70, Math.min(910, cx + (rand() - 0.5) * 240));
    const y = Math.max(70, Math.min(550, cy + (rand() - 0.5) * 190));

    return {
      id: `F-${String(i + 1).padStart(3, "0")}`,
      name: `Virtual farm ${i + 1}`,
      x,
      y,
      typeKey: livestock[Math.floor(rand() * livestock.length)],
      density: 0.35 + rand() * 0.65,
      biosecurity: 0.25 + rand() * 0.7,
      vehicle: rand(),
      windExposure: rand(),
      score: 0,
      source: false,
      reason: [],
    };
  });

  spreadOverlappingFarms();
  buildGraph();
}

function spreadOverlappingFarms() {
  const minGap = 38;
  for (let pass = 0; pass < 9; pass += 1) {
    for (let i = 0; i < farms.length; i += 1) {
      for (let j = i + 1; j < farms.length; j += 1) {
        const a = farms[i];
        const b = farms[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist >= minGap) continue;

        const push = (minGap - dist) / 2;
        const nx = dx / dist;
        const ny = dy / dist;
        a.x = Math.max(70, Math.min(910, a.x - nx * push));
        a.y = Math.max(70, Math.min(550, a.y - ny * push));
        b.x = Math.max(70, Math.min(910, b.x + nx * push));
        b.y = Math.max(70, Math.min(550, b.y + ny * push));
      }
    }
  }
}

function buildGraph() {
  edges = [];
  const matrix = Array.from({ length: farms.length }, () => Array(farms.length).fill(0));

  for (let i = 0; i < farms.length; i += 1) {
    for (let j = 0; j < farms.length; j += 1) {
      if (i === j) {
        matrix[i][j] = 1;
        continue;
      }

      const a = farms[i];
      const b = farms[j];
      const dist = distance(a, b);
      const spatial = Math.exp(-dist / 120);
      const sameTypeBoost = a.typeKey === b.typeKey ? 0.1 : 0;
      const crossTypePenalty = a.typeKey === b.typeKey ? 1 : 0.58;
      const vehicleContact = (a.vehicle + b.vehicle) / 2;
      const vehicle = vehicleContact * 0.1;
      const rawWeight = (spatial + sameTypeBoost + vehicle) * crossTypePenalty;
      const meaningfulLink = dist < 210 || rawWeight > 0.38 || vehicleContact > 0.86;
      const weight = meaningfulLink ? Math.min(1, rawWeight) : 0;
      matrix[i][j] = weight;

      if (i < j && weight > 0 && (dist < 210 || weight > 0.38)) {
        edges.push({ from: i, to: j, distance: dist, weight });
      }
    }
  }

  adjacency = matrix.map((row) => {
    const sum = row.reduce((acc, value) => acc + value, 0) || 1;
    return row.map((value) => value / sum);
  });
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function featureMatrix() {
  return farms.map((farm) => [
    farm.x / canvas.width,
    farm.y / canvas.height,
    farm.density,
    farm.biosecurity,
    farm.vehicle,
    farm.windExposure,
    farm.typeKey === "cattle" ? 1 : 0,
    farm.typeKey === "pig" ? 1 : 0,
    farm.typeKey === "poultry" ? 1 : 0,
    farm.typeKey === "goat" ? 1 : 0,
  ]);
}

function explainFarm(farm, source) {
  const reasons = [];
  if (distance(farm, source) < 130) reasons.push("reasonNear");
  if (farm.vehicle > 0.72) reasons.push("reasonVehicle");
  if (farm.density > 0.7) reasons.push("reasonDensity");
  if (farm.biosecurity < 0.42) reasons.push("reasonBiosecurity");
  if (farm.windExposure > 0.72) reasons.push("reasonWind");
  if (farm.typeKey === source.typeKey) reasons.push("reasonType");
  return reasons.slice(0, 3);
}

function waitForPaint() {
  return new Promise((resolve) => {
    const afterFrame = () => window.setTimeout(resolve, 90);
    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(afterFrame);
    } else {
      afterFrame();
    }
  });
}

function setModelState(state, detail) {
  if (modelStatus) {
    modelStatus.className = `badge ${state}`;
    modelStatus.textContent = state === "running" ? text("calculating") : lastRuntime;
  }
  if (modelDetail) {
    modelDetail.textContent = detail;
  }
  if (runBtn) {
    runBtn.textContent = state === "running" ? text("running") : text("run");
    runBtn.disabled = state === "running";
  }
}

function setStaticText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function applyLanguage() {
  document.documentElement.lang = lang;
  document.title = lang === "ko" ? "FarmShield TensorFlow.js 프로토타입" : "FarmShield TensorFlow.js Prototype";

  [
    "brandSubtitle",
    "scenarioPanelTitle",
    "sourceFarmLabel",
    "daysLabel",
    "pressureLabel",
    "controlLabel",
    "aiPanelTitle",
    "aiNote",
    "pageTitle",
    "highRiskLabel",
    "avgRiskLabel",
    "currentDayLabel",
    "legendLow",
    "legendWatch",
    "legendHigh",
    "legendSource",
    "queueTitle",
    "thFarm",
    "thType",
    "thScore",
    "thReason",
    "jsonTitle",
  ].forEach((id) => setStaticText(id, text(id)));

  resetBtn.textContent = text("reset");
  resetBtn.title = lang === "ko" ? "가상 농장 배치를 다시 만들고 계산합니다" : "Regenerate virtual farms and calculate";
  copyBtn.textContent = text("copy");
  copyBtn.title = lang === "ko" ? "JSON 복사" : "Copy JSON";
  document.getElementById("helpLink").textContent = text("help");
  langToggle.textContent = text("toggle");

  populateSources(false);
  syncOutputs();
  render();

  if (!results.length) {
    lastRuntime = text("ready");
    setModelState("done", text("readyDetail"));
  } else {
    lastRuntime = lastRuntime.includes("TensorFlow") ? text("tfRuntime") : text("fallbackRuntime");
    setModelState("done", text("updatedDetail", { run: runCount, days: daysRange.value, runtime: lastRuntime }));
  }
}

async function runTensorFlowModel() {
  if (isRunning) {
    pendingScenarioRun = true;
    return;
  }
  isRunning = true;
  const sourceIndex = Number(sourceFarm.value);
  const totalDays = Number(daysRange.value);
  const pressure = Number(pressureRange.value);
  const control = Number(controlRange.value);
  const source = farms[sourceIndex];
  const hasTf = typeof tf !== "undefined";

  lastRuntime = hasTf ? text("tfRuntime") : text("fallbackRuntime");
  dayIndex = 0;
  currentDay.textContent = text("calculating");
  updatedAt.textContent = text("runningModel");
  setModelState("running", text("runningDetail", { days: totalDays, source: source.id }));
  await waitForPaint();

  let current = Array(farms.length).fill(0);
  current[sourceIndex] = 1;
  results = [snapshot(0, current, sourceIndex)];

  if (!hasTf) {
    for (let day = 1; day <= totalDays; day += 1) {
      current = heuristicStep(current, pressure, control, day, totalDays);
      results.push(snapshot(day, current, sourceIndex));
      if (day === 1 || day === totalDays || day % 3 === 0) {
        currentDay.textContent = `D+${day}`;
        setModelState("running", text("calculatingDay", { day, days: totalDays, runtime: lastRuntime }));
        await waitForPaint();
      }
    }
    runCount += 1;
    dayIndex = results.length - 1;
    render();
    setModelState("done", text("updatedDetail", { run: runCount, days: totalDays, runtime: lastRuntime }));
    await finishModelRun();
    return;
  }

  const adj = tf.tensor2d(adjacency);
  const features = tf.tensor2d(featureMatrix());
  const density = features.slice([0, 2], [-1, 1]);
  const biosecurity = features.slice([0, 3], [-1, 1]);
  const vehicle = features.slice([0, 4], [-1, 1]);
  const exposure = features.slice([0, 5], [-1, 1]);
  const susceptibility = density
    .mul(0.32)
    .add(vehicle.mul(0.23))
    .add(exposure.mul(0.18))
    .sub(biosecurity.mul(0.28))
    .add(0.34)
    .clipByValue(0.05, 1.2);

  let risk = tf.tensor2d(current, [farms.length, 1]);
  for (let day = 1; day <= totalDays; day += 1) {
    const propagated = adj.transpose().matMul(risk);
    const dampening = 1 - control * 0.58;
    const timeBoost = 1 + (day / Math.max(1, totalDays)) * 0.65;
    const next = propagated
      .mul(susceptibility)
      .mul(pressure)
      .mul(dampening)
      .mul(0.28)
      .mul(timeBoost)
      .add(risk.mul(0.96))
      .maximum(risk.mul(0.92))
      .clipByValue(0, 1);

    propagated.dispose();
    risk.dispose();
    risk = next;
    results.push(snapshot(day, Array.from(risk.dataSync()), sourceIndex));
    if (day === 1 || day === totalDays || day % 3 === 0) {
      currentDay.textContent = `D+${day}`;
      setModelState("running", text("tensorPass", { day, days: totalDays }));
      await waitForPaint();
    }
  }

  risk.dispose();
  adj.dispose();
  features.dispose();
  density.dispose();
  biosecurity.dispose();
  vehicle.dispose();
  exposure.dispose();
  susceptibility.dispose();

  farms.forEach((farm, idx) => {
    farm.reason = idx === sourceIndex ? ["reasonSource"] : explainFarm(farm, source);
  });
  runCount += 1;
  dayIndex = results.length - 1;
  render();
  setModelState("done", text("updatedDetail", { run: runCount, days: totalDays, runtime: lastRuntime }));
  await finishModelRun();
}

async function finishModelRun() {
  isRunning = false;
  if (!pendingScenarioRun) return;
  pendingScenarioRun = false;
  await runTensorFlowModel();
}

function heuristicStep(current, pressure, control, day = 1, totalDays = 10) {
  const timeBoost = 1 + (day / Math.max(1, totalDays)) * 0.65;
  return farms.map((farm, idx) => {
    const propagated = adjacency.reduce((sum, row, sourceIdx) => sum + row[idx] * current[sourceIdx], 0);
    const susceptibility = Math.max(
      0.05,
      Math.min(1.2, 0.34 + farm.density * 0.32 + farm.vehicle * 0.23 + farm.windExposure * 0.18 - farm.biosecurity * 0.28),
    );
    const newExposure = propagated * susceptibility * pressure * (1 - control * 0.58) * 0.28 * timeBoost;
    const accumulatedSignal = current[idx] * 0.96 + newExposure;
    return Math.min(1, Math.max(current[idx] * 0.92, accumulatedSignal));
  });
}

function snapshot(day, scores, sourceIndex) {
  return {
    day,
    farms: farms.map((farm, idx) => ({
      ...farm,
      score: idx === sourceIndex ? 1 : Math.min(1, Math.max(0, scores[idx])),
      source: idx === sourceIndex,
      reason: idx === sourceIndex ? ["reasonSource"] : farm.reason,
    })),
  };
}

function drawMap() {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  drawTerrain(w, h);

  const state = results[dayIndex]?.farms || farms;
  const selectedSourceId = farms[Number(sourceFarm.value)]?.id;
  const ranked = [...state].sort((a, b) => b.score - a.score);
  const topFarmIds = new Set(ranked.slice(0, 5).map((farm) => farm.id));

  for (const edge of edges) {
    const a = state[edge.from];
    const b = state[edge.to];
    const aSelected = a.id === selectedSourceId;
    const bSelected = b.id === selectedSourceId;
    const priorityLink = a.source || b.source || aSelected || bSelected || topFarmIds.has(a.id) || topFarmIds.has(b.id);
    const linkRisk = Math.max(a.score, b.score);

    if (!priorityLink && edge.weight < 0.52) continue;

    ctx.lineWidth = priorityLink ? 1.2 + edge.weight * 3.2 + linkRisk * 1.8 : 0.7 + edge.weight * 1.1;
    ctx.strokeStyle = priorityLink
      ? riskColor(linkRisk, false, 0.16 + Math.min(0.38, edge.weight * 0.32 + linkRisk * 0.16))
      : `rgba(82, 112, 112, ${0.035 + edge.weight * 0.08})`;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  state.forEach((farm) => {
    const rank = ranked.findIndex((item) => item.id === farm.id) + 1;
    const radius = 9 + farm.density * 7 + farm.score * 5;
    const isTop = rank > 0 && rank <= 5;
    const isHovered = hoveredFarmId === farm.id;
    const isSelectedSource = farm.source || farm.id === selectedSourceId;

    if (isTop || isSelectedSource || isHovered) {
      ctx.beginPath();
      ctx.arc(farm.x, farm.y, radius + 15 + farm.score * 12 + (isHovered ? 5 : 0), 0, Math.PI * 2);
      ctx.fillStyle = riskColor(farm.score, isSelectedSource, isHovered ? 0.28 : isSelectedSource ? 0.22 : 0.16);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(farm.x, farm.y, radius + 8 + (isHovered ? 3 : 0), 0, Math.PI * 2);
      ctx.lineWidth = isSelectedSource ? 4 : isHovered ? 4 : 3;
      ctx.strokeStyle = isSelectedSource ? "#172126" : riskColor(farm.score, false, 0.9);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(farm.x, farm.y, radius, 0, Math.PI * 2);
    const nodeAlpha = results.length ? Math.max(0.2, isSelectedSource ? 1 : 0.28 + farm.score * 0.72) : 0.9;
    ctx.fillStyle = riskColor(farm.score, isSelectedSource, nodeAlpha);
    ctx.fill();
    ctx.lineWidth = isSelectedSource ? 4 : isTop ? 3 : 1.3;
    ctx.strokeStyle = isSelectedSource ? "#1f2528" : results.length && farm.score < 0.08 ? "rgba(255, 255, 255, 0.48)" : "#ffffff";
    ctx.stroke();

    if (isSelectedSource) {
      const labelX = Math.min(w - 112, farm.x + radius + 8);
      const labelY = Math.max(28, farm.y - radius - 6);

      ctx.fillStyle = "rgba(255, 255, 255, 0.94)";
      roundRect(labelX, labelY - 16, 98, 30, 6);
      ctx.fill();
      ctx.strokeStyle = "rgba(23, 33, 38, 0.34)";
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.fillStyle = "#172126";
      ctx.font = "800 11px Arial";
      ctx.fillText(`${text("source")} ${farm.id}`, labelX + 8, labelY + 2);
    } else if (isTop) {
      const badgeX = farm.x + radius * 0.45;
      const badgeY = farm.y - radius * 0.55;
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, 10, 0, Math.PI * 2);
      ctx.fillStyle = riskColor(farm.score, false, 0.95);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 9px Arial";
      ctx.fillText(String(rank), badgeX - 3, badgeY + 3);
    }
  });

  drawMapSummary(state, ranked);
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    pageX: event.clientX - rect.left,
    pageY: event.clientY - rect.top,
  };
}

function findFarmAt(point) {
  const state = results[dayIndex]?.farms || farms;
  let best = null;
  let bestDistance = Infinity;

  for (const farm of state) {
    const hitRadius = 16 + farm.density * 8 + farm.score * 8;
    const dist = Math.hypot(farm.x - point.x, farm.y - point.y);
    if (dist <= hitRadius && dist < bestDistance) {
      best = farm;
      bestDistance = dist;
    }
  }

  return best;
}

function showFarmTooltip(farm, point, pinned = false) {
  if (!farmTooltip) return;
  const pct = Math.round((farm.score || 0) * 100);
  const reasons = farm.reason?.length ? farm.reason.map((reason) => text(reason)).join(", ") : text("notCalculated");
  farmTooltip.hidden = false;
  farmTooltip.dataset.farmId = farm.id;
  farmTooltip.dataset.pinned = pinned ? "true" : "false";
  farmTooltip.innerHTML = `
    <strong>${farm.id} ${farm.source ? `(${text("source")})` : ""}</strong>
    <span>${livestockLabel(farm.typeKey)} - ${text("priority")} ${pct}%</span>
    <small>${reasons}</small>
    ${pinned ? `<button type="button" data-action="use-source">${text("useAsSource")}</button>` : ""}
  `;
  farmTooltip.style.left = `${Math.min(point.pageX + 14, canvas.clientWidth - 190)}px`;
  farmTooltip.style.top = `${Math.max(12, point.pageY - 16)}px`;
}

function hideFarmTooltip() {
  if (farmTooltip) {
    farmTooltip.hidden = true;
    farmTooltip.dataset.farmId = "";
    farmTooltip.dataset.pinned = "false";
  }
}

function handleCanvasMove(event) {
  if (pinnedFarmId) return;
  const point = canvasPoint(event);
  const farm = findFarmAt(point);
  hoveredFarmId = farm?.id || null;
  canvas.style.cursor = farm ? "pointer" : "default";

  if (farm) {
    showFarmTooltip(farm, point);
  } else {
    hideFarmTooltip();
  }

  drawMap();
}

async function handleCanvasClick(event) {
  const farm = findFarmAt(canvasPoint(event));
  if (!farm || isRunning) return;

  const point = canvasPoint(event);
  hoveredFarmId = farm.id;

  if (isTouchMode()) {
    pinnedFarmId = farm.id;
    showFarmTooltip(farm, point, true);
    drawMap();
    return;
  }

  showFarmTooltip(farm, point, false);
  await useFarmAsSource(farm.id);
}

async function useFarmAsSource(farmId) {
  if (!farmId || isRunning) return;

  const index = farms.findIndex((item) => item.id === farmId);
  if (index < 0) return;

  sourceFarm.value = String(index);
  hoveredFarmId = farmId;
  pinnedFarmId = null;
  hideFarmTooltip();
  await runTensorFlowModel();
}

function roundRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}

function drawMapSummary(state, ranked) {
  const high = state.filter((farm) => farm.score > 0.62).length;
  const watch = state.filter((farm) => farm.score > 0.32 && farm.score <= 0.62).length;
  const visibleLinks = edges.filter((edge) => {
    const a = state[edge.from];
    const b = state[edge.to];
    return edge.weight >= 0.52 || a.source || b.source || a.score > 0.42 || b.score > 0.42;
  }).length;

  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  roundRect(16, 16, 236, 92, 8);
  ctx.fill();
  ctx.strokeStyle = "rgba(23, 33, 38, 0.13)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#172126";
  ctx.font = "800 13px Arial";
  ctx.fillText(text("graphSignal"), 30, 40);
  ctx.font = "700 12px Arial";
  ctx.fillStyle = "#d94b3d";
  ctx.fillText(`${high} ${text("highPriority")}`, 30, 61);
  ctx.fillStyle = "#a66a00";
  ctx.fillText(`${watch} ${text("watchFarms")}`, 30, 80);
  ctx.fillStyle = "#516068";
  ctx.fillText(`${visibleLinks}/${edges.length} ${text("visibleLinks")}`, 30, 99);

  if (ranked[0]) {
    ctx.fillStyle = "#172126";
    ctx.font = "800 12px Arial";
    ctx.fillText(`${text("top")}: ${ranked[0].id} ${Math.round(ranked[0].score * 100)}%`, 132, 61);
  }
}

function drawTerrain(w, h) {
  ctx.fillStyle = "#dfe9e6";
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.moveTo(30, 520);
  ctx.bezierCurveTo(210, 420, 330, 460, 510, 340);
  ctx.bezierCurveTo(690, 220, 810, 260, 960, 100);
  ctx.stroke();

  ctx.strokeStyle = "rgba(64,110,105,0.18)";
  ctx.lineWidth = 2;
  for (let x = 80; x < w; x += 120) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x - 90, h);
    ctx.stroke();
  }
  for (let y = 70; y < h; y += 95) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y + 34);
    ctx.stroke();
  }
}

function riskColor(score, source, alpha) {
  if (source) return `rgba(31, 37, 40, ${alpha})`;
  if (score > 0.62) return `rgba(217, 75, 61, ${alpha})`;
  if (score > 0.32) return `rgba(240, 164, 41, ${alpha})`;
  return `rgba(75, 154, 116, ${alpha})`;
}

function renderTable() {
  const state = results[dayIndex]?.farms || farms;
  const sorted = [...state].sort((a, b) => b.score - a.score).slice(0, 9);

  riskTable.innerHTML = sorted
    .map((farm) => {
      const pct = Math.round(farm.score * 100);
      const reasons = farm.reason.length ? farm.reason.map((reason) => text(reason)).join(", ") : text("monitor");
      return `
        <tr>
          <td>${farm.id}</td>
          <td>${livestockLabel(farm.typeKey)}</td>
          <td><span class="risk-pill" style="background:${riskColor(farm.score, farm.source, 1)}">${pct}%</span></td>
          <td>${reasons}</td>
        </tr>
      `;
    })
    .join("");
}

function renderApi() {
  const state = results[dayIndex]?.farms || farms;
  const source = farms[Number(sourceFarm.value)];
  const payload = {
    scenario_id: `SIM-${Date.now().toString().slice(-6)}`,
    model: "stgnn_inspired_rule_based_priority_prototype",
    model_runtime: typeof tf !== "undefined" ? "tensorflowjs_tensor_ops" : "javascript_fallback_ops",
    model_note: "Rule-based graph propagation prototype, not a trained TensorFlow model.",
    day: dayIndex,
    source_farm_id: source.id,
    note: "Virtual data only. Use as a product demo, not as a validated field prediction.",
    controls: {
      horizon_days: Number(daysRange.value),
      pressure: Number(pressureRange.value),
      control_strength: Number(controlRange.value),
    },
    priority_map: state
      .filter((farm) => farm.score > 0.18)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((farm) => ({
        farm_id: farm.id,
        livestock_type: livestockLabel(farm.typeKey),
        priority_score: Number(farm.score.toFixed(3)),
        priority_level: farm.score >= 0.62 ? "high" : farm.score >= 0.32 ? "watch" : "low",
        lat: Number((36.5 + farm.y / 900).toFixed(6)),
        lng: Number((127.0 + farm.x / 900).toFixed(6)),
        reason_features: farm.reason,
      })),
  };
  apiPreview.textContent = JSON.stringify(payload, null, 2);
}

function renderStats() {
  const state = results[dayIndex]?.farms || farms;
  const high = state.filter((farm) => farm.score > 0.62).length;
  const avg = state.reduce((sum, farm) => sum + farm.score, 0) / state.length;
  const src = farms[Number(sourceFarm.value)];

  highRiskCount.textContent = String(high);
  avgRisk.textContent = `${Math.round(avg * 100)}%`;
  currentDay.textContent = `D+${dayIndex}`;
  updatedAt.textContent = results.length ? text("updatedAt", { run: runCount }) : text("waiting");
  scenarioText.textContent = results.length
    ? text("scenarioLine", { source: src.id, days: daysRange.value })
    : text("readyScenario");
}

function render() {
  drawMap();
  renderTable();
  renderApi();
  renderStats();
}

function populateSources(preserveValue = true) {
  const currentValue = sourceFarm.value;
  sourceFarm.innerHTML = farms
    .map((farm, index) => `<option value="${index}">${farm.id} - ${livestockLabel(farm.typeKey)}</option>`)
    .join("");
  sourceFarm.value = preserveValue && currentValue ? currentValue : "6";
}

function syncOutputs() {
  daysOut.textContent = lang === "ko" ? `${daysRange.value}일` : `${daysRange.value} days`;
  pressureOut.textContent = `${Number(pressureRange.value).toFixed(2)}x`;
  controlOut.textContent = `${Math.round(Number(controlRange.value) * 100)}%`;
}

function resetScenario() {
  seed += 117;
  createFarms();
  populateSources();
  results = [];
  dayIndex = 0;
  runTensorFlowModel();
}

resetBtn.addEventListener("click", resetScenario);
canvas.addEventListener("mousemove", handleCanvasMove);
canvas.addEventListener("mouseleave", () => {
  if (pinnedFarmId) return;
  hoveredFarmId = null;
  canvas.style.cursor = "default";
  hideFarmTooltip();
  drawMap();
});
canvas.addEventListener("click", handleCanvasClick);
farmTooltip?.addEventListener("click", async (event) => {
  if (event.target?.dataset?.action !== "use-source") return;
  await useFarmAsSource(farmTooltip.dataset.farmId);
});

async function handleScenarioControlChange() {
  syncOutputs();
  dayIndex = 0;
  await runTensorFlowModel();
}

[daysRange, pressureRange, controlRange].forEach((el) => {
  el.addEventListener("input", handleScenarioControlChange);
});

sourceFarm.addEventListener("change", handleScenarioControlChange);

copyBtn.addEventListener("click", async () => {
  if (!navigator.clipboard) return;
  await navigator.clipboard.writeText(apiPreview.textContent);
  copyBtn.textContent = text("copied");
  setTimeout(() => {
    copyBtn.textContent = text("copy");
  }, 900);
});

langToggle.addEventListener("click", () => {
  lang = lang === "ko" ? "en" : "ko";
  applyLanguage();
});

createFarms();
populateSources();
syncOutputs();
applyLanguage();
runTensorFlowModel();
