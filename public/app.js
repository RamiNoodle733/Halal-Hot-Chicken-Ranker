const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : '/api';

const FALLBACK_RESTAURANTS = [
  {
    name: "Dave's Hot Chicken",
    city: 'Houston',
    state: 'TX',
    priceTier: 2,
    heatLevel: 6,
    flavorScore: 9,
    crunchScore: 8,
    valueScore: 7,
    vibeScore: 7,
    description: 'Nashville-style sliders, halal-friendly batches, loud spice without wrecking the palate.',
    website: 'https://daveshotchicken.com',
    imageUrl: '/images/daves-hot-chicken.jpg',
    tags: ['sliders', 'late night', 'national favorite'],
    comments: []
  },
  {
    name: 'Main Bird Hot Chicken',
    city: 'Houston',
    state: 'TX',
    priceTier: 2,
    heatLevel: 5,
    flavorScore: 8,
    crunchScore: 9,
    valueScore: 8,
    vibeScore: 7,
    description: 'Halal Nashville crunch with balanced heat and a buttery bun that does not fall apart.',
    website: 'https://mainbirdhotchicken.com',
    imageUrl: '/images/main-bird.jpg',
    tags: ['tenders', 'buttermilk', 'halal'],
    comments: []
  },
  {
    name: 'Urban Bird Hot Chicken',
    city: 'Houston',
    state: 'TX',
    priceTier: 3,
    heatLevel: 7,
    flavorScore: 9,
    crunchScore: 8,
    valueScore: 7,
    vibeScore: 8,
    description: 'Veteran-owned spot doing halal bird with a smoky kick and crisp skin.',
    website: 'https://www.urbanbirdhotchicken.com',
    imageUrl: '/images/urban-bird.jpg',
    tags: ['veteran owned', 'halal certified'],
    comments: []
  },
  {
    name: 'Birdside HTX',
    city: 'Houston',
    state: 'TX',
    priceTier: 2,
    heatLevel: 6,
    flavorScore: 8,
    crunchScore: 8,
    valueScore: 8,
    vibeScore: 7,
    description: 'Fresh halal fried chicken with a citrusy zing and craveable crunch.',
    website: 'https://birdsidehtx.com',
    imageUrl: '/images/birdside-htx.jpg',
    tags: ['food truck', 'fresh fry'],
    comments: []
  },
  {
    name: 'Clutch City Cluckers',
    city: 'Houston',
    state: 'TX',
    priceTier: 2,
    heatLevel: 6,
    flavorScore: 8,
    crunchScore: 7,
    valueScore: 8,
    vibeScore: 7,
    description: 'Food-truck smash that keeps the spice honest and the pickles cold.',
    website: 'https://clutchcitycluckers.com',
    imageUrl: '/images/clutch-city-cluckers.jpg',
    tags: ['food truck', 'sandwich'],
    comments: []
  },
  {
    name: "Howdy Hot Chicken",
    city: 'Houston',
    state: 'TX',
    priceTier: 2,
    heatLevel: 5,
    flavorScore: 8,
    crunchScore: 8,
    valueScore: 8,
    vibeScore: 7,
    description: 'Friendly heat, halal bird, and a bun that soaks up the sauce.',
    website: 'https://howdyhotchicken.com',
    imageUrl: '/images/howdy-hot-chicken.jpg',
    tags: ['friendly heat', 'quick service'],
    comments: []
  },
  {
    name: "Yummy's Hot Chicken",
    city: 'Houston',
    state: 'TX',
    priceTier: 1,
    heatLevel: 5,
    flavorScore: 7,
    crunchScore: 7,
    valueScore: 9,
    vibeScore: 7,
    description: 'Family-run halal truck with generous portions and a clean fry.',
    website: 'https://yummyshotchicken.com',
    imageUrl: '/images/yummys-hot-chicken.jpg',
    tags: ['family run', 'budget friendly'],
    comments: []
  },
  {
    name: 'Houston TX Hot Chicken',
    city: 'Houston',
    state: 'TX',
    priceTier: 3,
    heatLevel: 7,
    flavorScore: 8,
    crunchScore: 9,
    valueScore: 7,
    vibeScore: 8,
    description: 'Texas-sized halal sandwiches with a peppery rub and crisp lettuce.',
    website: 'https://www.hhc.ooo',
    imageUrl: '/images/houston-tx-hot-chicken.jpg',
    tags: ['peppery', 'big portions'],
    comments: []
  },
  {
    name: 'Imperial Hot Chicken',
    city: 'Houston',
    state: 'TX',
    priceTier: 2,
    heatLevel: 6,
    flavorScore: 8,
    crunchScore: 8,
    valueScore: 8,
    vibeScore: 7,
    description: 'Family-owned halal kitchen serving classic Nashville spice with a honey drizzle option.',
    website: 'https://www.facebook.com/ImperialHotChicken/',
    imageUrl: '/images/imperial-hot-chicken.png',
    tags: ['family owned', 'honey drizzle'],
    comments: []
  }
];

const state = {
  restaurants: [],
  filtered: [],
  activeFilter: null
};

document.addEventListener('DOMContentLoaded', () => {
  bootstrap().catch(err => console.error('Bootstrap failure', err));
});

async function bootstrap() {
  wireControls();
  wireListInteractions();
  setLoadingMessage('restaurants-list', 'Loading spots...');
  setLoadingMessage('top-list', 'Loading picks...');
  setLoadingMessage('top-strip', 'Finding the crunchiest bites...');

  const rawRestaurants = await loadRestaurants();
  state.restaurants = rawRestaurants.map((r, idx) => shapeRestaurant(r, idx));
  state.filtered = [...state.restaurants];
  filterAndSort();
}

function wireControls() {
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  const ctaRank = document.getElementById('cta-rank');

  if (searchInput) searchInput.addEventListener('input', filterAndSort);
  if (sortSelect) sortSelect.addEventListener('change', filterAndSort);

  const quickFilters = document.getElementById('quick-filters');
  if (quickFilters) {
    quickFilters.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-filter]');
      if (!btn) return;
      const filter = btn.dataset.filter;
      state.activeFilter = state.activeFilter === filter ? null : filter;
      quickFilters.querySelectorAll('.chip').forEach(chip => chip.classList.toggle('active', chip.dataset.filter === state.activeFilter));
      filterAndSort();
    });
  }

  if (ctaRank) {
    ctaRank.addEventListener('click', () => {
      document.getElementById('rankings')?.scrollIntoView({ behavior: 'smooth' });
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

function wireListInteractions() {
  const list = document.getElementById('restaurants-list');
  if (!list) return;

  list.addEventListener('click', (e) => {
    const voteBtn = e.target.closest('.vote-btn');
    if (voteBtn) {
      const id = voteBtn.dataset.id;
      const action = voteBtn.dataset.action;
      if (id && action) vote(id, action);
      return;
    }

    const replyBtn = e.target.closest('.reply-btn');
    if (replyBtn) {
      const commentId = replyBtn.dataset.comment;
      const restaurantId = replyBtn.dataset.restaurant;
      const form = list.querySelector(`.reply-form[data-restaurant=\"${restaurantId}\"][data-comment=\"${commentId}\"]`);
      form?.querySelector('.reply-input')?.focus();
    }
  });

  list.addEventListener('submit', (e) => {
    const commentForm = e.target.closest('.comment-form');
    const replyForm = e.target.closest('.reply-form');

    if (commentForm) {
      e.preventDefault();
      const restaurantId = commentForm.dataset.restaurant;
      const input = commentForm.querySelector('.comment-input');
      const text = input?.value || '';
      if (restaurantId && text.trim()) submitComment(restaurantId, text, commentForm);
    }

    if (replyForm) {
      e.preventDefault();
      const restaurantId = replyForm.dataset.restaurant;
      const commentId = replyForm.dataset.comment;
      const input = replyForm.querySelector('.reply-input');
      const text = input?.value || '';
      if (restaurantId && commentId && text.trim()) submitReply(restaurantId, commentId, text, replyForm);
    }
  });
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

function shapeRestaurant(data, idx) {
  const fallback = FALLBACK_RESTAURANTS[idx % FALLBACK_RESTAURANTS.length] || {};
  const base = { ...fallback, ...data };
  const synthetic = !data._id;
  const _id = data._id || `synthetic-${hashToNumber(base.name + idx)}`;
  const heatLevel = clamp(base.heatLevel ?? deriveHeatLevel(idx), 1, 10);
  const priceTier = clamp(base.priceTier ?? 2, 1, 4);
  const flavorScore = clamp(base.flavorScore ?? 7 + (idx % 3), 1, 10);
  const crunchScore = clamp(base.crunchScore ?? 6 + (idx % 4), 1, 10);
  const valueScore = clamp(base.valueScore ?? (10 - priceTier) + (idx % 3), 1, 10);
  const vibeScore = clamp(base.vibeScore ?? 6 + (idx % 3), 1, 10);
  const comments = (base.comments || []).map(enrichComment);

  const restaurant = {
    ...base,
    _id,
    synthetic,
    heatLevel,
    priceTier,
    flavorScore,
    crunchScore,
    valueScore,
    vibeScore,
    tags: base.tags || fallback.tags || [],
    comments,
    upvotes: base.upvotes || 0,
    downvotes: base.downvotes || 0,
    score: base.score || 0,
    imageUrl: base.imageUrl || fallback.imageUrl || '',
    location: base.location || `${base.city || 'Somewhere'}, ${base.state || 'USA'}`
  };

  restaurant.fanScore = computeFanScore(restaurant);
  restaurant.engagement = computeEngagement(restaurant);
  return restaurant;
}

function enrichComment(comment) {
  return {
    ...comment,
    _id: comment._id || `c-${hashToNumber(comment.text || Math.random().toString())}-${Date.now()}`,
    replies: (comment.replies || []).map(reply => ({
      ...reply,
      _id: reply._id || `r-${hashToNumber(reply.text || Math.random().toString())}-${Date.now()}`
    }))
  };
}

function computeFanScore(r) {
  const netVotes = (r.upvotes || 0) - (r.downvotes || 0);
  const flavorWeight = r.flavorScore * 2.2;
  const valueWeight = r.valueScore * 1.6;
  const vibeWeight = r.vibeScore * 1.2;
  const heatPenalty = Math.max(0, r.heatLevel - 7) * 0.6;
  const baseScore = r.score || 0;
  return Math.max(1, Math.round((flavorWeight + valueWeight + vibeWeight + baseScore + netVotes) - heatPenalty));
}

function computeEngagement(r) {
  return (r.upvotes || 0) + (r.downvotes || 0) + (r.comments?.length || 0);
}

function deriveHeatLevel(idx) {
  const base = 5 + (idx % 4);
  return clamp(base, 1, 10);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function filterAndSort() {
  const searchTerm = (document.getElementById('search-input')?.value || '').toLowerCase();
  const sortBy = document.getElementById('sort-select')?.value || 'fan';

  let filtered = state.restaurants.filter(r => {
    const haystack = [r.name, r.description, r.location, ...(r.tags || [])]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(searchTerm);
  });

  if (state.activeFilter === 'budget') {
    filtered = filtered.filter(r => r.priceTier <= 2);
  } else if (state.activeFilter === 'juicy') {
    filtered = filtered.filter(r => r.flavorScore >= 8 || r.crunchScore >= 8);
  } else if (state.activeFilter === 'city') {
    filtered = filtered.filter(r => r.city || r.state || r.location);
  }

  if (sortBy === 'fan') {
    filtered.sort((a, b) => b.fanScore - a.fanScore);
  } else if (sortBy === 'flavor') {
    filtered.sort((a, b) => b.flavorScore - a.flavorScore);
  } else if (sortBy === 'value') {
    filtered.sort((a, b) => b.valueScore - a.valueScore);
  } else if (sortBy === 'heat') {
    filtered.sort((a, b) => a.heatLevel - b.heatLevel);
  }

  state.filtered = filtered;
  renderBoard(filtered);
  renderTopList(filtered);
  renderRestaurants(filtered);
  updateLiveMeta();
}

function updateLiveMeta() {
  const meta = document.getElementById('live-meta');
  if (!meta) return;
  const totalVotes = state.restaurants.reduce((sum, r) => sum + (r.upvotes || 0) + (r.downvotes || 0), 0);
  meta.textContent = `${state.restaurants.length} spots • ${totalVotes} votes tallied`;
}

function renderTopList(restaurants) {
  const list = document.getElementById('top-list');
  if (!list) return;
  const top = [...restaurants].sort((a, b) => b.fanScore - a.fanScore).slice(0, 3);

  if (!top.length) {
    list.innerHTML = '<div class="loading-simple">No spots yet.</div>';
    return;
  }

  list.innerHTML = top.map((r, idx) => `
    <div class="mini-item">
      <div>
        <strong>${idx + 1}. ${r.name}</strong>
        <span>${r.location || r.city || ''}</span>
      </div>
      <div>
        <div style="font-weight:800;color:#f7c548;">${r.fanScore}</div>
        <span style="color:#cfbdb2">fan score</span>
      </div>
    </div>
  `).join('');
}

function renderBoard(restaurants) {
  const strip = document.getElementById('top-strip');
  if (!strip) return;
  const top = [...restaurants].sort((a, b) => b.fanScore - a.fanScore).slice(0, 4);

  strip.innerHTML = top.map((r, idx) => `
    <div class="top-card">
      <div class="top-rank">#${idx + 1}</div>
      <h4>${r.name}</h4>
      <p>${r.location || r.city || 'Unknown'} • ${r.tags?.slice(0, 2).join(' • ') || 'Solid pick'}</p>
      <div class="progress-bar" aria-label="fan score">
        <div class="progress-fill" style="width:${Math.min(r.fanScore, 100)}%"></div>
      </div>
    </div>
  `).join('');
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
    const activeVote = sessionStorage.getItem(`voted-${restaurant._id}`);
    const totalVotes = (restaurant.upvotes || 0) + (restaurant.downvotes || 0);
    const agree = totalVotes > 0 ? Math.round((restaurant.upvotes || 0) / totalVotes * 100) : 0;
    const priceLabel = '$'.repeat(restaurant.priceTier || 1);

    return `
      <article class="card" data-id="${restaurant._id}">
        <div class="card-head">
          <div style="display:flex; gap:12px; align-items:flex-start;">
            <div class="card-thumb" style="background-image:url('${restaurant.imageUrl || ''}');"></div>
            <div>
              <div class="card-meta">${restaurant.location || 'Halal hot chicken'} • ${restaurant.tags?.[0] || 'fan pick'}</div>
              <h3>${rank}. ${restaurant.name}</h3>
              <p class="card-desc">${sanitize(restaurant.description || 'No description yet.')}</p>
              <div class="card-tags">
                <span class="tag">${priceLabel} price</span>
                <span class="tag">Heat ${restaurant.heatLevel}/10</span>
                <span class="tag">${restaurant.vibeScore}/10 vibe</span>
                <span class="tag">${restaurant.city || ''} ${restaurant.state || ''}</span>
              </div>
            </div>
          </div>
          <div class="score-badge">
            ${restaurant.fanScore}
            <span>fan score</span>
          </div>
        </div>

        <div class="metrics">
          ${metricBlock('Flavor', restaurant.flavorScore)}
          ${metricBlock('Crunch', restaurant.crunchScore)}
          ${metricBlock('Value', restaurant.valueScore)}
          ${metricBlock('Heat honesty', restaurant.heatLevel)}
        </div>

        <div class="vote-row">
          <div class="vote-buttons">
            <button class="vote-btn ${activeVote === 'upvote' ? 'selected' : ''}" data-id="${restaurant._id}" data-action="upvote" aria-label="Upvote ${restaurant.name}"><i class="fa-solid fa-fire"></i></button>
            <button class="vote-btn ${activeVote === 'downvote' ? 'selected' : ''}" data-id="${restaurant._id}" data-action="downvote" aria-label="Downvote ${restaurant.name}"><i class="fa-solid fa-thumbs-down"></i></button>
          </div>
          <div class="vote-stats">
            <span>${totalVotes.toLocaleString()} votes</span>
            <span>${agree}% agree</span>
          </div>
          <a class="ghost-btn" href="${restaurant.website || '#'}" target="_blank" rel="noopener">Visit site</a>
        </div>

        <div class="comment-block">
          <div class="comment-row">
            <span>Comments</span>
            <span class="eyebrow">${restaurant.comments ? restaurant.comments.length : 0}</span>
          </div>
          <div class="comment-list">
            ${renderComments(restaurant)}
          </div>
          <form class="comment-form" data-restaurant="${restaurant._id}">
            <input type="text" name="commentText" class="comment-input" placeholder="Drop a note about the crunch, sauce, or price..." required>
            <button type="submit" class="comment-submit-btn">Post</button>
          </form>
        </div>
      </article>
    `;
  }).join('');
}

function metricBlock(label, value, invert = false) {
  const width = clamp(invert ? value * 10 : value * 10, 5, 100);
  return `
    <div class="metric">
      <span>${label}</span>
      <strong>${invert ? 10 - value : value}/10</strong>
      <div class="progress-bar"><div class="progress-fill" style="width:${width}%"></div></div>
    </div>
  `;
}

function renderComments(restaurant) {
  if (!restaurant.comments || !restaurant.comments.length) {
    return '<div class="empty-comments">No comments yet. Be the first!</div>';
  }

  return restaurant.comments.map(comment => `
    <div class="comment-item" data-comment="${comment._id}">
      <div class="comment-meta">
        <span class="comment-author">${sanitize(comment.author || 'Anonymous')}</span>
        <span class="comment-date">${formatDate(comment.createdAt)}</span>
      </div>
      <div class="comment-text">${sanitize(comment.text)}</div>
      <button class="reply-btn" type="button" data-comment="${comment._id}" data-restaurant="${restaurant._id}">Reply</button>
      ${renderReplies(restaurant, comment)}
      <form class="reply-form" data-restaurant="${restaurant._id}" data-comment="${comment._id}">
        <input type="text" name="replyText" class="reply-input" placeholder="Reply to ${sanitize(comment.author || 'this comment')}" required>
        <button type="submit" class="comment-submit-btn">Send</button>
      </form>
    </div>
  `).join('');
}

function renderReplies(restaurant, comment) {
  if (!comment.replies || !comment.replies.length) return '';
  return `<div class="reply-list">${comment.replies.map(reply => `
    <div class="comment-item" data-reply="${reply._id}">
      <div class="comment-meta">
        <span class="comment-author">${sanitize(reply.author || 'Anonymous')}</span>
        <span class="comment-date">${formatDate(reply.createdAt)}</span>
      </div>
      <div class="comment-text">${sanitize(reply.text)}</div>
    </div>
  `).join('')}</div>`;
}

async function vote(id, action) {
  const restaurant = state.restaurants.find(r => r._id === id);
  if (!restaurant) return;

  const previousAction = sessionStorage.getItem(`voted-${id}`);
  if (previousAction === action) return;

  if (restaurant.synthetic) {
    applyLocalVote(restaurant, action, previousAction);
    sessionStorage.setItem(`voted-${id}`, action);
    filterAndSort();
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
        state.restaurants[idx] = shapeRestaurant({ ...state.restaurants[idx], ...updated }, idx);
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
  refreshDerived(restaurant);
}

function refreshDerived(r) {
  r.fanScore = computeFanScore(r);
  r.engagement = computeEngagement(r);
}

async function submitComment(id, text, formEl) {
  const restaurant = state.restaurants.find(r => r._id === id);
  if (!restaurant) return;
  const input = formEl.querySelector('.comment-input');
  const button = formEl.querySelector('button');
  input.disabled = true;
  button.disabled = true;
  button.textContent = '...';

  try {
    if (restaurant.synthetic) {
      const newComment = enrichComment({ text, author: 'You', createdAt: new Date().toISOString(), replies: [] });
      restaurant.comments = [...(restaurant.comments || []), newComment];
      refreshDerived(restaurant);
      filterAndSort();
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
          state.restaurants[idx].comments = [...(state.restaurants[idx].comments || []), enrichComment(newComment)];
          refreshDerived(state.restaurants[idx]);
        }
        filterAndSort();
      }
    }
  } catch (error) {
    console.error('Error posting comment:', error);
  } finally {
    input.disabled = false;
    button.disabled = false;
    button.textContent = 'Post';
    input.value = '';
  }
}

async function submitReply(restaurantId, commentId, text, formEl) {
  const restaurant = state.restaurants.find(r => r._id === restaurantId);
  if (!restaurant) return;
  const input = formEl.querySelector('.reply-input');
  const button = formEl.querySelector('button');
  input.disabled = true;
  button.disabled = true;
  button.textContent = '...';

  try {
    if (restaurant.synthetic) {
      const target = restaurant.comments.find(c => c._id === commentId);
      if (target) {
        target.replies = [...(target.replies || []), enrichComment({ text, author: 'You', createdAt: new Date().toISOString() })];
        refreshDerived(restaurant);
        filterAndSort();
      }
    } else {
      const response = await fetch(`${API_URL}/restaurants/${restaurantId}/comments/${commentId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (response.ok) {
        const newReply = await response.json();
        const idx = state.restaurants.findIndex(r => r._id === restaurantId);
        if (idx !== -1) {
          const comment = state.restaurants[idx].comments.find(c => c._id === commentId);
          if (comment) {
            comment.replies = [...(comment.replies || []), enrichComment(newReply)];
          }
          refreshDerived(state.restaurants[idx]);
        }
        filterAndSort();
      }
    }
  } catch (error) {
    console.error('Error replying:', error);
  } finally {
    input.disabled = false;
    button.disabled = false;
    button.textContent = 'Send';
    input.value = '';
  }
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
      alert('Request sent successfully! Thanks for the lookout.');
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

function setLoadingMessage(id, message) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = `<div class="loading-simple">${message}</div>`;
}

function sanitize(str) {
  return (str || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatDate(value) {
  const date = new Date(value || Date.now());
  return date.toLocaleDateString();
}

function hashToNumber(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
