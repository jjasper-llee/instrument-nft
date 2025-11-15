// --- Mock Data -------------------------------------------------------------

const instruments = [
  {
    id: "strad-1715",
    name: "1715 &ldquo;Arco&rdquo; Stradivarius",
    maker: "Antonio Stradivari",
    year: 1715,
    valuation: 8000000,
    sharePrice: 1000,
    totalShares: 8000,
    location: "Custody: Secure vault, New York",
    description:
      "A golden-period Stradivarius with a brilliant upper register and deep, complex core. " +
      "Offered here as a fractionalized demo instrument for the ArcoShares prototype.",
    musicians: [
      {
        id: "mus-1",
        name: "Violinist A",
        bio: "Emerging soloist, recent competition laureate, NYC.",
      },
      {
        id: "mus-2",
        name: "Violinist B",
        bio: "Principal in a major symphony orchestra, US.",
      },
      {
        id: "mus-3",
        name: "Violinist C",
        bio: "String quartet member with extensive touring experience.",
      },
    ],
  },
  {
    id: "guarneri-1733",
    name: "1733 &ldquo;Fantasie&rdquo; Guarneri del Gesù",
    maker: "Guarneri del Gesù",
    year: 1733,
    valuation: 6000000,
    sharePrice: 750,
    totalShares: 8000,
    location: "Custody: Zurich, Switzerland",
    description:
      "Dark, powerful tone with extraordinary projection. This Guarneri serves as a second " +
      "demo asset to illustrate how multi-instrument portfolios might look.",
    musicians: [
      {
        id: "mus-4",
        name: "Violinist D",
        bio: "Professor at a European conservatory, active solo career.",
      },
      {
        id: "mus-5",
        name: "Violinist E",
        bio: "Young artist program member at a top festival.",
      },
    ],
  },
];

// --- State Management (Local Storage) -------------------------------------

const STORAGE_KEY = "arcoSharesDemoState";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { holdings: {}, votes: {}, purchases: {} };
    }
    return JSON.parse(raw);
  } catch (_) {
    return { holdings: {}, votes: {}, purchases: {} };
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState(); // { holdings: {instrumentId: shares}, votes: {instrumentId: musicianId} }

// --- Utility Functions -----------------------------------------------------

function formatCurrency(value) {
  return "$" + value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function formatShares(value) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Expose scroll function to HTML
window.scrollToSection = scrollToSection;

// --- Rendering: Hero & Instruments ----------------------------------------

function initHero() {
  const heroInstrument = instruments[0];
  document.getElementById("heroInstrumentName").innerHTML = `${heroInstrument.name}`;
  document.getElementById(
    "heroInstrumentMeta"
  ).textContent = `${heroInstrument.maker} • ${heroInstrument.year}`;
  document.getElementById(
    "heroInstrumentPrice"
  ).textContent = `Valuation (demo): ${formatCurrency(heroInstrument.valuation)}`;
}

function renderInstrumentList() {
  const container = document.getElementById("instrumentList");
  container.innerHTML = "";

  instruments.forEach((inst) => {
    const held = state.holdings[inst.id] || 0;

    const card = document.createElement("article");
    card.className = "card";

    card.innerHTML = `
      <div>
        <h3>${inst.name}</h3>
        <p>${inst.maker} • ${inst.year}</p>
        <p class="small">${inst.location}</p>
        <div class="tag-row">
          <span class="tag">Valuation: ${formatCurrency(inst.valuation)}</span>
          <span class="tag">Share: ${formatCurrency(inst.sharePrice)}</span>
          <span class="tag">Total shares: ${formatShares(inst.totalShares)}</span>
        </div>
      </div>
      <div class="card-footer">
        <div class="small">
          You hold: <strong>${formatShares(held)}</strong> shares
        </div>
        <button class="secondary-btn" data-id="${inst.id}">View &amp; invest</button>
      </div>
    `;

    const btn = card.querySelector("button");
    btn.addEventListener("click", () => openInstrumentDetail(inst.id));

    container.appendChild(card);
  });
}

// --- Instrument Detail & Interaction --------------------------------------

let currentInstrumentId = null;

function openInstrumentDetail(instrumentId) {
  currentInstrumentId = instrumentId;
  const inst = instruments.find((i) => i.id === instrumentId);
  if (!inst) return;

  const detailSection = document.getElementById("instrumentDetail");
  detailSection.classList.remove("hidden");

  document.getElementById("detailName").innerHTML = inst.name;
  document.getElementById(
    "detailMaker"
  ).textContent = `${inst.maker} • ${inst.year}`;
  document.getElementById("detailLocation").textContent = inst.location;
  document.getElementById("detailDescription").textContent = inst.description;

  const held = state.holdings[inst.id] || 0;
  const sharesRemaining = Math.max(inst.totalShares - held, 0);

  document.getElementById(
    "detailValuation"
  ).textContent = formatCurrency(inst.valuation);
  document.getElementById(
    "detailSharePrice"
  ).textContent = formatCurrency(inst.sharePrice);
  document.getElementById(
    "detailTotalShares"
  ).textContent = formatShares(inst.totalShares);
  document.getElementById(
    "detailSharesRemaining"
  ).textContent = formatShares(sharesRemaining);

  document.getElementById("buyFeedback").textContent = "";
  document.getElementById("voteFeedback").textContent = "";

  renderMusicianList(inst);
  renderVoteSummary(inst);
  renderPortfolio();
  scrollToSection("instrumentDetail");
}

function closeInstrumentDetail() {
  currentInstrumentId = null;
  document.getElementById("instrumentDetail").classList.add("hidden");
  scrollToSection("instruments");
}

window.closeInstrumentDetail = closeInstrumentDetail;

// Buy shares (simulated)
function handleBuyShares(event) {
  event.preventDefault();
  if (!currentInstrumentId) return;

  const inst = instruments.find((i) => i.id === currentInstrumentId);
  if (!inst) return;

  const input = document.getElementById("shareAmount");
  const raw = input.value;
  const amount = parseInt(raw, 10);

  if (isNaN(amount) || amount <= 0) {
    document.getElementById("buyFeedback").textContent =
      "Please enter a positive whole number.";
    return;
  }

  const currentlyHeld = state.holdings[inst.id] || 0;
  const sharesRemaining = Math.max(inst.totalShares - currentlyHeld, 0);

  if (amount > sharesRemaining) {
    document.getElementById("buyFeedback").textContent =
      "Not enough demo shares remaining for this instrument.";
    return;
  }

  const newHolding = currentlyHeld + amount;
  state.holdings[inst.id] = newHolding;

  saveState(state);
  renderInstrumentList();
  openInstrumentDetail(inst.id);
  renderPortfolio();

  document.getElementById(
    "buyFeedback"
  ).textContent = `Success! You now hold ${formatShares(newHolding)} demo shares.`;
  input.value = "";
}

window.handleBuyShares = handleBuyShares;

// --- Voting ---------------------------------------------------------------

function renderMusicianList(inst) {
  const container = document.getElementById("musicianList");
  container.innerHTML = "";
  const selectedMusicianId = state.votes[inst.id] || null;
  const heldShares = state.holdings[inst.id] || 0;

  if (heldShares === 0) {
    container.innerHTML =
      '<p class="small">Buy demo shares in this instrument to unlock voting power.</p>';
    return;
  }

  inst.musicians.forEach((m) => {
    const row = document.createElement("div");
    row.className = "musician-card";

    row.innerHTML = `
      <div class="musician-info">
        <div class="musician-name">${m.name}</div>
        <div class="musician-meta">${m.bio}</div>
      </div>
      <button class="vote-btn" data-id="${m.id}">
        ${selectedMusicianId === m.id ? "Selected" : "Vote"}
      </button>
    `;

    const btn = row.querySelector("button");
    if (selectedMusicianId === m.id) {
      btn.classList.add("selected");
    }
    btn.addEventListener("click", () => castVote(inst.id, m.id));

    container.appendChild(row);
  });
}

function castVote(instrumentId, musicianId) {
  const inst = instruments.find((i) => i.id === instrumentId);
  if (!inst) return;

  const heldShares = state.holdings[instrumentId] || 0;
  if (heldShares === 0) {
    document.getElementById("voteFeedback").textContent =
      "You need demo shares in this instrument to vote.";
    return;
  }

  state.votes[instrumentId] = musicianId;
  saveState(state);

  renderMusicianList(inst);
  renderVoteSummary(inst);

  const musician = inst.musicians.find((m) => m.id === musicianId);
  document.getElementById(
    "voteFeedback"
  ).textContent = `You voted for ${musician.name} with ${formatShares(
    heldShares
  )} demo shares.`;
}

// For demo, we simulate aggregate votes using only this browser's state.
function renderVoteSummary(inst) {
  const container = document.getElementById("voteSummary");
  container.innerHTML = "";

  const instrumentId = inst.id;
  const selected = state.votes[instrumentId];

  if (!selected) {
    container.innerHTML =
      '<p class="small">No demo vote recorded yet for this instrument on this device.</p>';
    return;
  }

  const heldShares = state.holdings[instrumentId] || 0;
  const totals = {};
  inst.musicians.forEach((m) => {
    totals[m.id] = 0;
  });
  // In full system, this would aggregate many users.
  totals[selected] = heldShares;

  const max = Math.max(...Object.values(totals));

  inst.musicians.forEach((m) => {
    const votes = totals[m.id];
    const pct = max === 0 ? 0 : Math.round((votes / max) * 100);

    const row = document.createElement("div");
    row.className = "vote-summary-row";

    row.innerHTML = `
      <span>${m.name}</span>
      <span>${formatShares(votes)} shares</span>
    `;
    container.appendChild(row);

    const bar = document.createElement("div");
    bar.className = "vote-bar";

    const fill = document.createElement("div");
    fill.className = "vote-bar-fill";
    fill.style.width = pct + "%";

    bar.appendChild(fill);
    container.appendChild(bar);
  });
}

// --- Portfolio ------------------------------------------------------------

function renderPortfolio() {
  const container = document.getElementById("portfolioContent");
  container.innerHTML = "";

  const entries = Object.entries(state.holdings).filter(([_, shares]) => shares > 0);

  if (entries.length === 0) {
    container.innerHTML =
      '<p class="small">You do not hold any demo shares yet. Buy shares in an instrument above to see your portfolio here.</p>';
    return;
  }

  entries.forEach(([instrumentId, shares]) => {
    const inst = instruments.find((i) => i.id === instrumentId);
    if (!inst) return;

    const value = shares * inst.sharePrice;
    const vote = state.votes[instrumentId];
    const musician = inst.musicians.find((m) => m.id === vote);

    const card = document.createElement("article");
    card.className = "card";

    card.innerHTML = `
      <div>
        <h3>${inst.name}</h3>
        <p>${inst.maker} • ${inst.year}</p>
        <p class="small">Location: ${inst.location}</p>
      </div>
      <div class="tag-row">
        <span class="tag">Shares held: ${formatShares(shares)}</span>
        <span class="tag">Demo value: ${formatCurrency(value)}</span>
        ${
          musician
            ? `<span class="tag">Your vote: ${musician.name}</span>`
            : `<span class="tag">No vote cast yet</span>`
        }
      </div>
      <div class="card-footer">
        <span class="small">Last updated: now</span>
        <button class="secondary-btn">View instrument</button>
      </div>
    `;

    const btn = card.querySelector("button");
    btn.addEventListener("click", () => openInstrumentDetail(inst.id));

    container.appendChild(card);
  });
}

// --- Initialize -----------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  initHero();
  renderInstrumentList();
  renderPortfolio();
});
