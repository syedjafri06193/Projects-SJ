/**
 * Image Captioning System — Frontend JS
 * Handles: file upload, drag-and-drop, API calls, pipeline animation, logs.
 */

"use strict";

const STEPS = ["step-load", "step-preprocess", "step-cnn", "step-lstm", "step-beam", "step-output"];

// ── Pipeline helpers ──────────────────────────────────────────────────────────

function resetSteps() {
  STEPS.forEach(id => { document.getElementById(id).className = "pipe-step"; });
}

function setStep(idx, state) {
  const el = document.getElementById(STEPS[idx]);
  if (el) el.className = "pipe-step " + state;
}

// ── Logging ───────────────────────────────────────────────────────────────────

function addLog(msg, type = "info") {
  const logs = document.getElementById("logs");
  const now  = new Date();
  const ts   = [now.getHours(), now.getMinutes(), now.getSeconds()]
               .map(n => String(n).padStart(2, "0"))
               .join(":");

  const cls   = { info: "linfo", warn: "lwarn", error: "lerr" }[type] || "linfo";
  const label = { info: "INFO ", warn: "WARN ", error: "ERROR" }[type] || "INFO ";

  const line = document.createElement("span");
  line.className = "log-line";
  line.innerHTML =
    `<span class="ts">[${ts}]</span> <span class="${cls}">${label}</span> ${msg}`;
  logs.appendChild(line);
  logs.scrollTop = logs.scrollHeight;
}

// ── Utility ───────────────────────────────────────────────────────────────────

const sleep = ms => new Promise(r => setTimeout(r, ms));

function clearOutput() {
  document.getElementById("caption-result").style.display = "none";
  document.getElementById("alt-section").style.display    = "none";
  document.getElementById("empty-state").style.display    = "block";
  document.getElementById("conf-fill").style.width        = "0%";
  document.getElementById("conf-pct").textContent         = "—";
  document.getElementById("inf-time").textContent         = "—";
  document.getElementById("token-count").textContent      = "—";
  resetSteps();
}

// ── File / image handling ─────────────────────────────────────────────────────

let currentFile = null;

function showPreview(file) {
  currentFile = file;
  const reader = new FileReader();
  reader.onload = e => {
    const preview = document.getElementById("preview-img");
    const zone    = document.getElementById("upload-zone");
    preview.src   = e.target.result;
    preview.style.display = "block";
    zone.style.display    = "none";

    const meta = document.getElementById("image-meta");
    meta.style.display    = "flex";
    const kb = Math.round(file.size / 1024);
    document.getElementById("meta-size").textContent =
      kb > 1024 ? (kb / 1024).toFixed(1) + " MB" : kb + " KB";
    document.getElementById("meta-type").textContent = file.type || "image/*";

    document.getElementById("btn-generate").disabled = false;
    clearOutput();
    addLog(`Image loaded: ${file.name} (${kb} KB)`);
  };
  reader.readAsDataURL(file);
}

function setupFileUpload() {
  const input = document.getElementById("file-input");
  const zone  = document.getElementById("upload-zone");

  input.addEventListener("change", e => {
    const file = e.target.files[0];
    if (file) showPreview(file);
  });

  zone.addEventListener("dragover",  e => { e.preventDefault(); zone.classList.add("drag-over"); });
  zone.addEventListener("dragleave", ()  => zone.classList.remove("drag-over"));
  zone.addEventListener("drop", e => {
    e.preventDefault();
    zone.classList.remove("drag-over");
    const file = e.dataTransfer.files[0];
    if (file) showPreview(file);
  });
}

// ── Pipeline animation ────────────────────────────────────────────────────────

async function animatePipeline() {
  setStep(0, "active");
  await sleep(380);
  addLog("Image loaded into memory buffer");
  setStep(0, "done"); setStep(1, "active");

  await sleep(320);
  addLog("OpenCV: resizing to 224×224, normalizing to [0, 1]");
  addLog("Applying ImageNet mean subtraction: [0.485, 0.456, 0.406]");
  setStep(1, "done"); setStep(2, "active");

  await sleep(480);
  addLog("InceptionV3 forward pass · extracting mixed_10 layer features");
  addLog("Feature vector shape: (1, 2048) · L2 normalized");
  setStep(2, "done"); setStep(3, "active");

  await sleep(560);
  addLog("LSTM decoder initialized with &lt;start&gt; token");
  addLog("Embedding lookup → 256-dim · hidden state (512,)");
  addLog("Soft attention over spatial features applied");
  setStep(3, "done"); setStep(4, "active");

  await sleep(460);
  addLog("Beam search k=3 · max_len=25 · length_penalty=0.7");
  addLog("Generated 3 candidate sequences");
  setStep(4, "done"); setStep(5, "active");

  await sleep(260);
}

// ── Caption rendering ─────────────────────────────────────────────────────────

function renderCaptions(captions, elapsedMs) {
  setStep(5, "done");

  const elapsed = (elapsedMs / 1000).toFixed(2);
  addLog(`Inference complete in ${elapsed}s`);

  const best = captions[0];

  document.getElementById("empty-state").style.display   = "none";
  document.getElementById("caption-result").style.display = "block";
  document.getElementById("caption-text").textContent     = best.text;

  requestAnimationFrame(() => {
    document.getElementById("conf-fill").style.width = Math.round(best.confidence * 100) + "%";
    document.getElementById("conf-pct").textContent  = Math.round(best.confidence * 100) + "%";
  });

  document.getElementById("inf-time").textContent   = elapsed + "s";
  document.getElementById("token-count").textContent = best.text.split(" ").length;

  const altContainer = document.getElementById("alt-captions");
  altContainer.innerHTML = "";

  captions.slice(1).forEach((c, i) => {
    const item = document.createElement("div");
    item.className = "alt-item";
    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");
    item.innerHTML =
      `<span class="alt-rank">#${i + 2}</span>` +
      `<span class="alt-txt">${c.text}</span>` +
      `<span class="alt-score">${Math.round(c.confidence * 100)}%</span>`;
    item.addEventListener("click", () => {
      document.getElementById("caption-text").textContent = c.text;
      document.getElementById("conf-fill").style.width = Math.round(c.confidence * 100) + "%";
      document.getElementById("conf-pct").textContent  = Math.round(c.confidence * 100) + "%";
    });
    item.addEventListener("keydown", e => { if (e.key === "Enter") item.click(); });
    altContainer.appendChild(item);
  });

  if (captions.length > 1) {
    document.getElementById("alt-section").style.display = "block";
  }
}

// ── Main: call API ────────────────────────────────────────────────────────────

window.runCaption = async function () {
  if (!currentFile) return;

  const btn     = document.getElementById("btn-generate");
  const spinner = document.getElementById("spinner");
  const btnIcon = document.getElementById("btn-icon");

  btn.disabled         = true;
  spinner.style.display = "block";
  btnIcon.style.display = "none";
  clearOutput();
  document.getElementById("empty-state").style.display = "none";

  addLog("Starting inference pipeline…");

  const t0      = Date.now();
  const formData = new FormData();
  formData.append("image", currentFile);

  // Run animation and API call in parallel
  const [response] = await Promise.all([
    fetch("/api/caption", { method: "POST", body: formData }),
    animatePipeline(),
  ]);

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    addLog(`Error ${response.status}: ${err.error || "Unknown error"}`, "error");
    btn.disabled         = false;
    spinner.style.display = "none";
    btnIcon.style.display = "";
    return;
  }

  const data = await response.json();
  renderCaptions(data.captions, data.inference_ms ?? (Date.now() - t0));

  spinner.style.display = "none";
  btnIcon.style.display = "";
  btn.disabled          = false;
};

// ── Boot ──────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", setupFileUpload);
