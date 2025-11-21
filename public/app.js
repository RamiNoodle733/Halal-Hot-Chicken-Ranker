// Use relative URL for API calls (works in production and development)
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : '/api';

let allRestaurants = [];

// Fetch and display restaurants
async function loadRestaurants() {
    const container = document.getElementById('restaurants-list');
    try {
        console.log('Fetching from:', `${API_URL}/restaurants`);
        const response = await fetch(`${API_URL}/restaurants`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        allRestaurants = await response.json();
        console.log('Loaded restaurants:', allRestaurants);
        renderRestaurants(allRestaurants);
    } catch (error) {
        console.error('Error loading restaurants:', error);
        container.innerHTML = 
            `<p class="error">Failed to load restaurants: ${error.message}</p>`;
    }
}

// Render restaurants based on data
function renderRestaurants(restaurants) {
    const container = document.getElementById('restaurants-list');
    
    if (restaurants.length === 0) {
        container.innerHTML = '<div class="loading-terminal"><span class="cursor">></span> NO TARGETS FOUND IN DATABASE.</div>';
        return;
    }

    container.innerHTML = restaurants.map((restaurant, index) => {
        const rank = index + 1;
        // Calculate a percentage for the "bar" based on score (assuming max score around 100 or relative to max)
        // For now, let's just make it relative to a hypothetical max of 50 for visual effect, or just random for "tech" feel if score is low.
        // Actually, let's use the score directly if it's reasonable, or cap it.
        const scorePercent = Math.min(Math.max(restaurant.score * 2, 10), 100); // Rough visual mapping
        
        return `
        <div class="data-card">
            <div class="rank-badge">${rank}</div>
            
            <div class="img-container">
                <img src="${restaurant.imageUrl || 'https://placehold.co/150x150/0a0f14/00f3ff?text=NO+IMG'}" alt="${restaurant.name}" onerror="this.src='https://placehold.co/150x150/0a0f14/00f3ff?text=ERR'">
                <div class="img-overlay"></div>
            </div>
            
            <div class="info-module">
                <div class="info-header">
                    <h2 class="restaurant-name">
                        <a href="${restaurant.website || '#'}" target="_blank">${restaurant.name}</a>
                    </h2>
                    <span class="status-tag">ACTIVE</span>
                </div>
                <p class="desc-text">${restaurant.description || 'DATA CORRUPTED: NO DESCRIPTION AVAILABLE.'}</p>
            </div>

            <div class="stats-module">
                <div class="score-bar-container">
                    <div class="score-label">
                        <span>SPICE_RATING</span>
                        <span>${restaurant.score}</span>
                    </div>
                    <div class="progress-track">
                        <div class="progress-fill" style="width: ${scorePercent}%"></div>
                    </div>
                </div>
                
                <div class="vote-controls">
                    <button class="hud-btn up" onclick="vote('${restaurant._id}', 'upvote')" title="CONFIRM">
                        <i class="fa-solid fa-chevron-up"></i>
                    </button>
                    <button class="hud-btn down" onclick="vote('${restaurant._id}', 'downvote')" title="DENY">
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                </div>
            </div>
        </div>
    `}).join('');
}

// Handle voting
async function vote(id, action) {
    const btn = document.querySelector(`button[onclick="vote('${id}', '${action}')"]`);
    if (btn) btn.disabled = true;

    try {
        // The server expects /api/restaurants/:id/upvote or /api/restaurants/:id/downvote
        const response = await fetch(`${API_URL}/restaurants/${id}/${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const updatedRestaurant = await response.json();
            
            // Update local data efficiently without re-fetching everything
            const index = allRestaurants.findIndex(r => r._id === id);
            if (index !== -1) {
                allRestaurants[index] = updatedRestaurant;
                // Re-sort by score
                allRestaurants.sort((a, b) => b.score - a.score);
                renderRestaurants(allRestaurants);
            } else {
                loadRestaurants();
            }
        } else {
            console.error('Vote failed:', await response.text());
        }
    } catch (error) {
        console.error('Error voting:', error);
        alert('Failed to vote. Please try again.');
    } finally {
        if (btn) btn.disabled = false;
    }
}

// Search and Sort Logic
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');

function filterAndSort() {
    const searchTerm = searchInput.value.toLowerCase();
    const sortBy = sortSelect.value;

    let filtered = allRestaurants.filter(r => 
        r.name.toLowerCase().includes(searchTerm) || 
        (r.description && r.description.toLowerCase().includes(searchTerm))
    );

    if (sortBy === 'score') {
        filtered.sort((a, b) => b.score - a.score);
    } else if (sortBy === 'name') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    renderRestaurants(filtered);
}

if (searchInput) searchInput.addEventListener('input', filterAndSort);
if (sortSelect) sortSelect.addEventListener('change', filterAndSort);

// Load restaurants when page loads
document.addEventListener('DOMContentLoaded', loadRestaurants);
