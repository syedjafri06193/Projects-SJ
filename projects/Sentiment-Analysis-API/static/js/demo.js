/* demo.js — Live API demo interactions */

(function () {
  const textarea   = document.getElementById("inputText");
  const btn        = document.getElementById("analyzeBtn");
  const resultBox  = document.getElementById("result");
  const errorBox   = document.getElementById("errorBox");
  const labelEl    = document.getElementById("resultLabel");
  const scoreEl    = document.getElementById("resultScore");
  const fillEl     = document.getElementById("scoreFill");
  const breakdownEl= document.getElementById("breakdown");
  const metaEl     = document.getElementById("resultMeta");
  const toggleBtns = document.querySelectorAll(".toggle-btn");
  const chips      = document.querySelectorAll(".chip");

  let activeModel = "vader";

  /* ── Model toggle ── */
  toggleBtns.forEach(b => {
    b.addEventListener("click", () => {
      toggleBtns.forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      activeModel = b.dataset.model;
    });
  });

  /* ── Example chips ── */
  chips.forEach(c => {
    c.addEventListener("click", () => {
      textarea.value = c.dataset.text;
      textarea.focus();
    });
  });

  /* ── Analyze ── */
  btn.addEventListener("click", analyze);
  textarea.addEventListener("keydown", e => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) analyze();
  });

  async function analyze() {
    const text = textarea.value.trim();
    if (!text) { showError("Please enter some text to analyze."); return; }

    setLoading(true);
    hideError();
    hideResult();

    const endpoint = activeModel === "hf" ? "/api/analyze/hf" : "/api/analyze";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();

      if (!res.ok) { showError(data.error || "Request failed."); return; }

      renderResult(data);
    } catch (err) {
      showError("Network error — is the server running?");
    } finally {
      setLoading(false);
    }
  }

  function renderResult(d) {
    const label = d.label;          // POSITIVE | NEGATIVE | NEUTRAL
    const score = d.score;
    const cls   = label === "POSITIVE" ? "pos" : label === "NEGATIVE" ? "neg" : "neu";

    /* label + score */
    labelEl.textContent = label;
    labelEl.className = "result-label " + cls;

    const pct = Math.round(score * 100);
    scoreEl.textContent = `${pct}% confidence`;

    /* colour bar — map compound (-1..1) to 0..100% width */
    const compound = d.compound ?? (label === "POSITIVE" ? score : -score);
    const barPct   = Math.round(((compound + 1) / 2) * 100);
    const barColor = compound > 0.05 ? "#4fd1c5" : compound < -0.05 ? "#f87171" : "#a78bfa";
    fillEl.style.width    = barPct + "%";
    fillEl.style.background = barColor;

    /* breakdown (VADER gives pos/neu/neg, HF doesn't) */
    if (d.positive !== undefined) {
      breakdownEl.innerHTML = `
        <div class="bk-item">
          <div class="bk-label">POSITIVE</div>
          <div class="bk-val pos">${pct_(d.positive)}</div>
        </div>
        <div class="bk-item">
          <div class="bk-label">NEUTRAL</div>
          <div class="bk-val neu">${pct_(d.neutral)}</div>
        </div>
        <div class="bk-item">
          <div class="bk-label">NEGATIVE</div>
          <div class="bk-val neg">${pct_(d.negative)}</div>
        </div>`;
    } else {
      breakdownEl.innerHTML = "";
    }

    /* meta */
    metaEl.textContent = `backend: ${d.backend}  ·  chars: ${d.input_length}  ·  compound: ${d.compound?.toFixed(4) ?? "n/a"}`;

    showResult();
  }

  function pct_(v) { return Math.round(v * 100) + "%"; }

  function setLoading(on) {
    btn.classList.toggle("loading", on);
    btn.querySelector(".btn-label").textContent = on ? "Analyzing…" : "Analyze";
  }

  function showResult()  { resultBox.classList.remove("hidden"); }
  function hideResult()  { resultBox.classList.add("hidden"); }
  function showError(m)  { errorBox.textContent = m; errorBox.classList.remove("hidden"); }
  function hideError()   { errorBox.classList.add("hidden"); }
})();
