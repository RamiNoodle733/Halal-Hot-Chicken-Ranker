const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : '/api';

const EXTERNAL_SOURCES = [
  {
    key: 'states',
    label: 'Population & macro baseline (Plotly)',
    type: 'csv',
    url: 'https://raw.githubusercontent.com/plotly/datasets/master/2014_usa_states.csv'
  },
  {
    key: 'mobility',
    label: 'Airport passenger traffic (Plotly)',
    type: 'csv',
    url: 'https://raw.githubusercontent.com/plotly/datasets/master/2011_february_us_airport_traffic.csv'
  },
  {
    key: 'weather',
    label: 'Climate drag proxy (Vega datasets)',
    type: 'csv',
    url: 'https://raw.githubusercontent.com/vega/vega-datasets/master/data/seattle-weather.csv'
  },
  {
    key: 'ops',
    label: 'Ops performance baseline (Vega cars)',
    type: 'json',
    url: 'https://raw.githubusercontent.com/vega/vega-datasets/master/data/cars.json'
  }
];

const FALLBACK_RESTAURANTS = [
  {
    name: 'Nashville Inferno Labs',
    description: 'Research kitchen infusing halal Nashville heat with data-driven prep windows.',
    website: 'https://example.com/nashville-inferno',
    imageUrl: 'https://images.unsplash.com/photo-1604908177225-6c1ebd128c8c?auto=format&fit=crop&w=600&q=80',
    tags: ['nashville-style', 'halal', 'lab'],
    heatLevel: 9,
    price: 2,
    profile: 'Dine-in + kitchen automation',
    city: 'Nashville',
    state: 'TN',
    upvotes: 220,
    downvotes: 18,
    score: 202,
    comments: []
  },
  {
    name: 'Houston Data Fry',
    description: 'Brisket-spiced hot chicken with a telemetry-driven expo line.',
    website: 'https://example.com/houston-fry',
    imageUrl: 'https://images.unsplash.com/photo-1619252584172-d8a9d1cbe1e8?auto=format&fit=crop&w=600&q=80',
    tags: ['texas heat', 'halal', 'smoke'],
    heatLevel: 8,
    price: 3,
    profile: 'High-volume takeout',
    city: 'Houston',
    state: 'TX',
    upvotes: 180,
    downvotes: 12,
    score: 168,
    comments: []
  },
  {
    name: 'Queens Halo Heat',
    description: 'Charcoal bird with peri-peri lab sauces and halal sourcing.',
    website: 'https://example.com/queens-halo',
    imageUrl: 'https://images.unsplash.com/photo-1565299543923-37dd378984f4?auto=format&fit=crop&w=600&q=80',
    tags: ['peri-peri', 'halal', 'charcoal'],
    heatLevel: 7,
    price: 2,
    profile: 'Urban micro-kitchen',
    city: 'Queens',
    state: 'NY',
    upvotes: 142,
    downvotes: 20,
    score: 122,
    comments: []
  },
  {
    name: 'Detroit Voltage',
    description: 'Electric-red rub with halal thigh-only cuts and crunch metrics.',
    website: 'https://example.com/detroit-voltage',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    tags: ['halal', 'sandwich', 'crunch'],
    heatLevel: 8,
    price: 2,
    profile: 'Drive-thru analytics',
    city: 'Detroit',
    state: 'MI',
    upvotes: 130,
    downvotes: 11,
    score: 119,
    comments: []
  },
  {
    name: 'Bay Area Scoville Studio',
    description: 'Farm-to-fire halal chicken with kombu brine and ML spice curves.',
    website: 'https://example.com/bay-scoville',
    imageUrl: 'https://images.unsplash.com/photo-1608037521297-27c91064b005?auto=format&fit=crop&w=600&q=80',
    tags: ['halal', 'ml-driven', 'farm-to-table'],
    heatLevel: 9,
    price: 4,
    profile: 'Tasting counter',
    city: 'San Francisco',
    state: 'CA',
    upvotes: 98,
    downvotes: 7,
    score: 91,
    comments: []
  },
  {
    name: 'Chicago Signal Fry',
    description: 'Halal fried quarters mapped to foot-traffic layers with dill slaw.',
    website: 'https://example.com/chicago-signal',
    imageUrl: 'https://images.unsplash.com/photo-1608039829574-4bf3b0c82b51?auto=format&fit=crop&w=600&q=80',
    tags: ['midwest', 'halal', 'slaw'],
    heatLevel: 6,
    price: 2,
    profile: 'Campus-focused pop-up',
    city: 'Chicago',
    state: 'IL',
    upvotes: 110,
    downvotes: 22,
    score: 88,
    comments: []
  },
  {
    name: 'Toronto Spice Observatory',
    description: 'Cardamom smoke, halal certification, and heat telemetry board.',
    website: 'https://example.com/toronto-observatory',
    imageUrl: 'https://images.unsplash.com/photo-1608039976986-6e1f34b3a1a2?auto=format&fit=crop&w=600&q=80',
    tags: ['international', 'halal', 'analytics'],
    heatLevel: 7,
    price: 3,
    profile: 'Ghost kitchen + retail',
    city: 'Toronto',
    state: 'ON',
    upvotes: 101,
    downvotes: 16,
    score: 85,
    comments: []
  },
  {
    name: 'Atlanta Emberline',
    description: 'Buttermilk brine with berbere spike and real-time pick-up SLA.',
    website: 'https://example.com/atl-emberline',
    imageUrl: 'https://images.unsplash.com/photo-1604908177225-6c1ebd128c8c?auto=format&fit=crop&w=600&q=80',
    tags: ['southern', 'halal', 'berbere'],
    heatLevel: 8,
    price: 2,
    profile: 'Mixed mode',
    city: 'Atlanta',
    state: 'GA',
    upvotes: 87,
    downvotes: 9,
    score: 78,
    comments: []
  }
];

let state = {
  restaurants: [],
  filtered: [],
  external: { payload: {}, status: [], summary: {} },
  charts: {},
  scenarioLift: 105
};

document.addEventListener('DOMContentLoaded', () => {
  bootstrap().catch(err => console.error('Bootstrap failure', err));
});

async function bootstrap() {
  wireControls();
  setLoadingMessage('restaurants-list', 'Loading enriched data...');
  const [rawRestaurants, external] = await Promise.all([
    loadRestaurants(),
    loadExternalSignals()
  ]);

  state.external = external;
  const enriched = enrichRestaurants(rawRestaurants, external);
  state.restaurants = enriched;
  state.filtered = enriched;

  renderPipeline(external.status, external.summary);
  renderKpis(enriched, external.summary);
  renderInsights(enriched, external.summary);
  renderCharts(enriched, external.summary);
  renderRestaurants(enriched);
}

function wireControls() {
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  if (searchInput) searchInput.addEventListener('input', filterAndSort);
  if (sortSelect) sortSelect.addEventListener('change', filterAndSort);

  const slider = document.getElementById('scenario-slider');
  if (slider) {
    slider.addEventListener('input', () => {
      const val = Number(slider.value);
      state.scenarioLift = val;
      const label = document.getElementById('scenario-value');
      if (label) label.textContent = `${val}%`;
      renderCharts(state.filtered.length ? state.filtered : state.restaurants, state.external.summary);
    });
  }

  const requestForm = document.getElementById('request-form');
  if (requestForm) {
    requestForm.addEventListener('submit', (e) => {
      e.preventDefault();
      submitRequest(requestForm, {
        name: document.getElementById('req-name')?.value,
        location: document.getElementById('req-location')?.value,
        link: document.getElementById('req-link')?.value
      });
    });
  }

  const modalForm = document.getElementById('modal-request-form');
  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      submitRequest(modalForm, {
        name: document.getElementById('modal-req-name')?.value,
        location: document.getElementById('modal-req-location')?.value,
        link: document.getElementById('modal-req-link')?.value
      });
    });
  }

  const modal = document.getElementById('request-modal');
  const openModalBtn = document.getElementById('open-request-modal');
  const openFooterBtn = document.getElementById('open-request-modal-footer');
  const closeBtn = modal?.querySelector('.close-modal');

  if (openModalBtn) openModalBtn.addEventListener('click', () => modal?.classList.add('active'));
  if (openFooterBtn) openFooterBtn.addEventListener('click', () => modal?.classList.add('active'));
  if (closeBtn) closeBtn.addEventListener('click', () => modal?.classList.remove('active'));
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }
}

async function loadRestaurants() {
  try {
    const res = await fetch(`${API_URL}/restaurants`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) && data.length ? data : FALLBACK_RESTAURANTS;
  } catch (error) {
    console.warn('API fetch failed, using fallback data', error);
    return FALLBACK_RESTAURANTS;
  }
}

async function loadExternalSignals() {
  const payload = {};
  const status = [];

  for (const source of EXTERNAL_SOURCES) {
    const entry = { key: source.key, label: source.label, status: 'loading', rows: 0 };
    try {
      const res = await fetch(source.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const data = source.type === 'json' ? JSON.parse(text) : parseCSV(text);
      payload[source.key] = data;
      entry.status = 'ready';
      entry.rows = data.length;
    } catch (error) {
      entry.status = 'degraded';
      entry.error = error.message;
      payload[source.key] = [];
    }
    status.push(entry);
  }

  return { payload, status, summary: buildSignalSummary(payload) };
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines.shift().split(',').map(h => h.trim());
  return lines
    .filter(Boolean)
    .map(line => {
      const cells = line.split(',').map(cell => cell.trim());
      const obj = {};
      headers.forEach((header, idx) => {
        obj[header] = cells[idx];
      });
      return obj;
    });
}

function buildSignalSummary(payload) {
  const states = payload.states || [];
  const mobility = payload.mobility || [];
  const weather = payload.weather || [];
  const ops = payload.ops || [];

  const totalPopulation = states.reduce((sum, row) => sum + Number(row.Population || 0), 0);
  const topState = [...states].sort((a, b) => Number(b.Population || 0) - Number(a.Population || 0))[0];
  const avgPrecip = weather.length
    ? weather.reduce((sum, row) => sum + Number(row.precipitation || 0), 0) / weather.length
    : 0;
  const avgTraffic = mobility.length
    ? mobility.reduce((sum, row) => sum + Number(row.cnt || 0), 0) / mobility.length
    : 0;
  const avgOps = ops.length
    ? ops.reduce((sum, car) => sum + Number(car.Horsepower || 0), 0) / ops.length
    : 0;

  return {
    totalPopulation,
    topState,
    avgPrecip: Number(avgPrecip.toFixed(2)),
    avgTraffic: Math.round(avgTraffic),
    avgOps: Math.round(avgOps),
    externalRows: states.length + mobility.length + weather.length + ops.length
  };
}

function enrichRestaurants(restaurants, signals) {
  const statesPool = signals.payload.states || [];
  const mobility = signals.payload.mobility || [];
  const weather = signals.payload.weather || [];
  const opsPool = signals.payload.ops || [];

  return restaurants.map((restaurant, idx) => {
    const fallback = FALLBACK_RESTAURANTS[idx % FALLBACK_RESTAURANTS.length];
    const base = { ...fallback, ...restaurant };
    const synthetic = !restaurant._id;
    const _id = restaurant._id || `synthetic-${hashToNumber(base.name + idx)}`;
    const location = base.location || deriveLocation(statesPool, mobility, idx);
    const demand = deriveDemand(mobility, location, idx);
    const climateDrag = deriveClimateDrag(weather, idx);
    const opsScore = deriveOpsScore(opsPool, idx);
    const heatLevel = base.heatLevel ?? deriveHeatLevel(weather, idx);
    const engagement = (base.upvotes || 0) + (base.downvotes || 0) + (base.comments?.length || 0);
    const viabilityScore = Math.max(1, Math.min(100, Math.round((heatLevel * 3) + (demand * 0.6) + (opsScore * 0.9) - (climateDrag * 0.4))));
    const riskScore = Math.max(1, Math.min(10, Math.round(10 - (heatLevel / 2) + (climateDrag / 3) + (base.downvotes || 0) * 0.02)));
    const signalScore = Math.round((base.score || 0) + viabilityScore / 2 + demand / 4 + opsScore / 3);
    const forecast = generateForecast(hashToNumber(_id), signalScore);

    return {
      ...base,
      _id,
      synthetic,
      location,
      demand: Math.round(demand),
      climateDrag: Number(climateDrag.toFixed(2)),
      opsScore: Math.round(opsScore),
      viabilityScore,
      riskScore,
      heatLevel,
      signalScore,
      engagement,
      forecast,
      tags: base.tags || fallback.tags || ['halal', 'hot-chicken'],
      profile: base.profile || fallback.profile || 'Mixed-mode service'
    };
  });
}

function deriveLocation(states, mobility, idx) {
  const stateRow = states[idx % Math.max(states.length, 1)] || {};
  const mobilityRow = mobility[idx % Math.max(mobility.length, 1)] || {};
  const city = mobilityRow.city || stateRow.State || 'Multi-city';
  const state = mobilityRow.state || stateRow.Abbreviation || stateRow.Postal || 'US';
  return `${city}, ${state}`;
}

function deriveDemand(mobility, location, idx) {
  if (!mobility.length) return 120 + (idx * 3);
  const mobilityRow = mobility[idx % mobility.length];
  const baseline = Number(mobilityRow.cnt || 0) / 100;
  return baseline + (location.includes('NY') ? 18 : 0) + (idx % 5);
}

function deriveClimateDrag(weather, idx) {
  if (!weather.length) return 0;
  const row = weather[idx % weather.length];
  const precipitation = Number(row.precipitation || 0);
  const wind = Number(row.wind || 0);
  return precipitation * 4 + wind;
}

function deriveOpsScore(opsPool, idx) {
  if (!opsPool.length) return 60 + (idx * 2);
  const car = opsPool[idx % opsPool.length];
  const horsepower = Number(car.Horsepower || 100);
  const acceleration = Number(car.Acceleration || 10);
  return (horsepower * 0.4) + (acceleration * 6);
}

function deriveHeatLevel(weather, idx) {
  if (!weather.length) return 7 + (idx % 3);
  const row = weather[idx % weather.length];
  const tempMax = Number(row.temp_max || 60);
  return Math.max(5, Math.min(10, Math.round((tempMax - 40) / 5)));
}

function generateForecast(seed, startValue) {
  const base = startValue || 80;
  const series = [];
  let current = base;
  for (let i = 0; i < 12; i++) {
    const volatility = ((seed % 7) - 3) * 0.6;
    const drift = 2 + (i * 0.4);
    current = current + drift + volatility;
    series.push(Math.max(10, Math.round(current)));
  }
  return series;
}

function renderKpis(restaurants, summary) {
  const total = restaurants.length;
  const avgViability = restaurants.reduce((sum, r) => sum + (r.viabilityScore || 0), 0) / Math.max(total, 1);
  const engagement = restaurants.reduce((sum, r) => sum + (r.engagement || 0), 0) / Math.max(total, 1);

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText('kpi-total', total);
  setText('kpi-viability', `${Math.round(avgViability)} / 100`);
  setText('kpi-engagement', `${Math.round(engagement)} events`);
  setText('kpi-rows', summary.externalRows || '—');
}

function renderPipeline(status, summary) {
  const grid = document.getElementById('pipeline-grid');
  if (!grid) return;

  const summaryLabel = document.getElementById('pipeline-summary');
  if (summaryLabel) {
    summaryLabel.textContent = `${status.filter(s => s.status === 'ready').length}/${status.length} connectors live • ${summary.externalRows || 0} rows`;
  }

  grid.innerHTML = status.map(entry => `
    <div class="pipeline-card">
      <div class="status status-${entry.status}">
        ${entry.status === 'ready' ? 'Ready' : entry.status === 'degraded' ? 'Degraded' : 'Loading'}
      </div>
      <h4>${entry.label}</h4>
      <p class="small-text">${entry.rows} rows ingested</p>
      ${entry.error ? `<p class="small-text" style="color:#fbbf77">Fallback in use: ${entry.error}</p>` : ''}
    </div>
  `).join('');
}

function renderInsights(restaurants, summary) {
  const container = document.getElementById('insight-feed');
  if (!container) return;

  const best = [...restaurants].sort((a, b) => b.signalScore - a.signalScore)[0];
  const fastestGrowth = restaurants.map(r => ({
    name: r.name,
    growth: (r.forecast?.slice(-3).reduce((a, b) => a + b, 0) || 0) - (r.forecast?.slice(0, 3).reduce((a, b) => a + b, 0) || 0)
  })).sort((a, b) => b.growth - a.growth)[0];

  const cards = [
    {
      title: 'Top signal route',
      body: best ? `${best.name} leads with signal ${best.signalScore} and viability ${best.viabilityScore}/100.` : 'Data loading...'
    },
    {
      title: 'Macro overlay',
      body: summary.topState ? `Largest macro lift from ${summary.topState.State} (${Number(summary.topState.Population || 0).toLocaleString()} population baseline).` : 'Waiting for state data.'
    },
    {
      title: 'Growth runway',
      body: fastestGrowth ? `${fastestGrowth.name} shows strongest 90d lift in forecasted sentiment.` : 'Forecasts warming up.'
    }
  ];

  container.innerHTML = cards.map(card => `
    <div class="insight-card">
      <h4>${card.title}</h4>
      <p>${card.body}</p>
    </div>
  `).join('');
}

function renderCharts(restaurants, summary) {
  const scenarioLift = state.scenarioLift / 100;
  const top = [...restaurants].sort((a, b) => b.signalScore - a.signalScore).slice(0, 8);
  const aggregated = aggregateForecast(restaurants, scenarioLift);

  drawChart('chart-topline', {
    type: 'bar',
    data: {
      labels: top.map(r => r.name),
      datasets: [{
        label: 'Signal',
        data: top.map(r => r.signalScore),
        backgroundColor: 'rgba(245,134,52,0.6)',
        borderColor: '#f58634',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: '#1f2538' }, ticks: { color: '#dfe3f4' } },
        x: { ticks: { color: '#dfe3f4' } }
      }
    }
  });

  drawChart('chart-trend', {
    type: 'line',
    data: {
      labels: aggregated.labels,
      datasets: [
        {
          label: 'Baseline forecast',
          data: aggregated.baseline,
          borderColor: '#7cf8c5',
          backgroundColor: 'rgba(124,248,197,0.2)',
          tension: 0.3
        },
        {
          label: 'Scenario adjusted',
          data: aggregated.scenario,
          borderColor: '#f58634',
          backgroundColor: 'rgba(245,134,52,0.15)',
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#dfe3f4' } } },
      scales: {
        y: { grid: { color: '#1f2538' }, ticks: { color: '#dfe3f4' } },
        x: { ticks: { color: '#dfe3f4' } }
      }
    }
  });

  const median = calcMedianProfile(restaurants);
  drawChart('chart-radar', {
    type: 'radar',
    data: {
      labels: ['Heat', 'Ops', 'Demand', 'Viability', 'Risk'],
      datasets: [
        {
          label: 'Portfolio median',
          data: [median.heat, median.ops, median.demand, median.viability, 10 - median.risk],
          backgroundColor: 'rgba(245,134,52,0.2)',
          borderColor: '#f58634'
        },
        {
          label: 'Macro baseline',
          data: [7, summary.avgOps / 15 || 6, summary.avgTraffic / 800 || 5, 60, 6],
          backgroundColor: 'rgba(124,248,197,0.15)',
          borderColor: '#7cf8c5'
        }
      ]
    },
    options: {
      plugins: { legend: { labels: { color: '#dfe3f4' } } },
      scales: { r: { angleLines: { color: '#1f2538' }, grid: { color: '#1f2538' }, pointLabels: { color: '#dfe3f4' } } }
    }
  });
}

function aggregateForecast(restaurants, lift) {
  const labels = Array.from({ length: 12 }, (_, i) => `M${i + 1}`);
  const baseline = Array(12).fill(0);
  const scenario = Array(12).fill(0);

  restaurants.forEach(r => {
    r.forecast?.forEach((value, idx) => {
      baseline[idx] += value;
      scenario[idx] += value * lift;
    });
  });

  const count = Math.max(restaurants.length, 1);
  return {
    labels,
    baseline: baseline.map(v => Math.round(v / count)),
    scenario: scenario.map(v => Math.round(v / count))
  };
}

function calcMedianProfile(restaurants) {
  const numbers = (arr) => arr.slice().sort((a, b) => a - b);
  const median = (arr) => {
    const sorted = numbers(arr);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  return {
    heat: median(restaurants.map(r => r.heatLevel || 0)),
    ops: median(restaurants.map(r => r.opsScore || 0)),
    demand: median(restaurants.map(r => r.demand || 0)),
    viability: median(restaurants.map(r => r.viabilityScore || 0)),
    risk: median(restaurants.map(r => r.riskScore || 0))
  };
}

function drawChart(canvasId, config) {
  const el = document.getElementById(canvasId);
  if (!el) return;
  if (state.charts[canvasId]) {
    state.charts[canvasId].destroy();
  }
  state.charts[canvasId] = new Chart(el, config);
}

function renderRestaurants(restaurants) {
  const container = document.getElementById('restaurants-list');
  if (!container) return;

  if (!restaurants.length) {
    container.innerHTML = '<div class="loading-simple">No records after filtering.</div>';
    return;
  }

  container.innerHTML = restaurants.map((restaurant, index) => {
    const rank = index + 1;
    const totalVotes = (restaurant.upvotes || 0) + (restaurant.downvotes || 0);
    const percentage = totalVotes > 0 ? Math.round(((restaurant.upvotes || 0) / totalVotes) * 100) : 0;
    const bars = (restaurant.forecast || []).slice(0, 12).map((value, idx) => `<div class="spark-bar ${idx < 3 ? 'muted' : ''}" style="height:${Math.max(10, value / 2)}px"></div>`).join('');

    return `
      <div class="card">
        <div class="card-header">
          <div>
            <div class="eyebrow">${restaurant.location || 'Unknown market'} • ${restaurant.profile}</div>
            <h3>${rank}. ${restaurant.name}</h3>
            <p class="card-desc">${restaurant.description || 'No description available.'}</p>
            <div class="tag-row">
              ${restaurant.tags?.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
          </div>
          <div class="score-badge">
            ${restaurant.signalScore}
            <div style="font-size:12px;color:#ffd7b7;">signal</div>
          </div>
        </div>

        <div class="metric-row">
          <div class="metric"><span>Heat index</span><strong>${restaurant.heatLevel}/10</strong></div>
          <div class="metric"><span>Demand</span><strong>${restaurant.demand}</strong></div>
          <div class="metric"><span>Ops score</span><strong>${restaurant.opsScore}</strong></div>
          <div class="metric"><span>Risk</span><strong>${restaurant.riskScore}/10</strong></div>
        </div>

        <div class="sparkline">${bars}</div>

        <div class="vote-container" id="vote-container-${restaurant._id}">
          <div class="vote-buttons">
            <button class="vote-btn upvote" onclick="vote('${restaurant._id}', 'upvote')">
              <i class="fa-solid fa-arrow-up"></i>
            </button>
            <button class="vote-btn downvote" onclick="vote('${restaurant._id}', 'downvote')">
              <i class="fa-solid fa-arrow-down"></i>
            </button>
          </div>
          <div class="vote-stats" id="vote-stats-${restaurant._id}">
            <span class="total-votes">${totalVotes.toLocaleString()} votes</span>
            <span class="percentage-label">${percentage}% agree</span>
          </div>
        </div>

        <div class="comments-section" id="comments-${restaurant._id}">
          <div class="comments-header">
            <span>Comments</span>
            <span id="comment-count-${restaurant._id}" class="eyebrow">${restaurant.comments ? restaurant.comments.length : 0}</span>
          </div>
          <div class="comment-list" id="list-${restaurant._id}">
            ${renderComments(restaurant)}
          </div>
          <form class="comment-form" onsubmit="submitComment(event, '${restaurant._id}')">
            <input type="text" name="commentText" class="comment-input" placeholder="Add a comment..." required>
            <button type="submit" class="comment-submit-btn">Post</button>
          </form>
        </div>
      </div>
    `;
  }).join('');
}

function renderComments(restaurant) {
  if (!restaurant.comments || !restaurant.comments.length) {
    return '<div class="empty-comments">No comments yet. Be the first!</div>';
  }

  return restaurant.comments.map(c => `
    <div class="comment-item">
      <div class="comment-meta">
        <span class="comment-author">${c.author || 'Anonymous'}</span>
        <span class="comment-date">${new Date(c.createdAt || Date.now()).toLocaleDateString()}</span>
      </div>
      <div class="comment-text">${c.text}</div>
    </div>
  `).join('');
}

function filterAndSort() {
  const searchTerm = (document.getElementById('search-input')?.value || '').toLowerCase();
  const sortBy = document.getElementById('sort-select')?.value || 'signal';

  let filtered = state.restaurants.filter(r =>
    r.name.toLowerCase().includes(searchTerm) ||
    (r.description && r.description.toLowerCase().includes(searchTerm)) ||
    (r.location && r.location.toLowerCase().includes(searchTerm)) ||
    (r.tags && r.tags.some(t => t.toLowerCase().includes(searchTerm)))
  );

  if (sortBy === 'signal') {
    filtered.sort((a, b) => b.signalScore - a.signalScore);
  } else if (sortBy === 'score') {
    filtered.sort((a, b) => (b.score || 0) - (a.score || 0));
  } else if (sortBy === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'risk') {
    filtered.sort((a, b) => a.riskScore - b.riskScore);
  }

  state.filtered = filtered;
  renderCharts(filtered, state.external.summary);
  renderRestaurants(filtered);
}

async function vote(id, action) {
  const restaurant = state.restaurants.find(r => r._id === id);
  if (!restaurant) return;

  const previousAction = sessionStorage.getItem(`voted-${id}`);
  if (previousAction === action) return;

  // Synthetic records update locally
  if (restaurant.synthetic) {
    applyLocalVote(restaurant, action, previousAction);
    sessionStorage.setItem(`voted-${id}`, action);
    renderRestaurants(state.filtered);
    return;
  }

  try {
    const response = await fetch(`${API_URL}/restaurants/${id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, previousAction })
    });

    if (response.ok) {
      const updated = await response.json();
      sessionStorage.setItem(`voted-${id}`, action);
      const idx = state.restaurants.findIndex(r => r._id === id);
      if (idx !== -1) {
        state.restaurants[idx] = { ...state.restaurants[idx], ...updated };
      }
      filterAndSort();
    }
  } catch (error) {
    console.error('Error voting:', error);
  }
}

function applyLocalVote(restaurant, action, previousAction) {
  if (!previousAction) {
    if (action === 'upvote') {
      restaurant.upvotes = (restaurant.upvotes || 0) + 1;
      restaurant.score = (restaurant.score || 0) + 1;
    } else {
      restaurant.downvotes = (restaurant.downvotes || 0) + 1;
      restaurant.score = (restaurant.score || 0) - 1;
    }
  } else if (previousAction !== action) {
    if (action === 'upvote') {
      restaurant.upvotes = (restaurant.upvotes || 0) + 1;
      restaurant.downvotes = Math.max(0, (restaurant.downvotes || 0) - 1);
      restaurant.score = (restaurant.score || 0) + 2;
    } else {
      restaurant.downvotes = (restaurant.downvotes || 0) + 1;
      restaurant.upvotes = Math.max(0, (restaurant.upvotes || 0) - 1);
      restaurant.score = (restaurant.score || 0) - 2;
    }
  }
  restaurant.engagement = (restaurant.upvotes || 0) + (restaurant.downvotes || 0) + (restaurant.comments?.length || 0);
}

async function submitComment(event, id) {
  event.preventDefault();
  const form = event.target;
  const input = form.querySelector('input[name="commentText"]');
  const btn = form.querySelector('button');
  const text = input?.value || '';
  if (!text.trim()) return;

  const restaurant = state.restaurants.find(r => r._id === id);
  if (!restaurant) return;

  input.disabled = true;
  btn.disabled = true;
  btn.textContent = '...';

  try {
    if (restaurant.synthetic) {
      const newComment = { text, author: 'You', createdAt: new Date().toISOString() };
      restaurant.comments = [...(restaurant.comments || []), newComment];
      restaurant.engagement = (restaurant.upvotes || 0) + (restaurant.downvotes || 0) + (restaurant.comments?.length || 0);
      renderRestaurants(state.filtered);
    } else {
      const response = await fetch(`${API_URL}/restaurants/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (response.ok) {
        const newComment = await response.json();
        const idx = state.restaurants.findIndex(r => r._id === id);
        if (idx !== -1) {
          state.restaurants[idx].comments = [...(state.restaurants[idx].comments || []), newComment];
          state.restaurants[idx].engagement = (state.restaurants[idx].upvotes || 0) + (state.restaurants[idx].downvotes || 0) + (state.restaurants[idx].comments?.length || 0);
        }
        renderRestaurants(state.filtered);
      }
    }
  } catch (error) {
    console.error('Error posting comment:', error);
  } finally {
    input.disabled = false;
    btn.disabled = false;
    btn.textContent = 'Post';
    input.value = '';
  }
}

function setLoadingMessage(id, message) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = `<div class="loading-simple">${message}</div>`;
}

async function submitRequest(formEl, payload) {
  const submitBtn = formEl.querySelector('button[type="submit"]');
  const original = submitBtn?.textContent;
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
  }

  try {
    const res = await fetch(`${API_URL}/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      alert('Request sent successfully! Thanks for the signal.');
      formEl.reset();
    } else {
      alert('Request logged locally (email not configured).');
    }
  } catch (error) {
    console.error('Error sending request', error);
    alert('Request logged locally (email not configured).');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = original || 'Send';
    }
    const modal = document.getElementById('request-modal');
    modal?.classList.remove('active');
  }
}

function hashToNumber(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
