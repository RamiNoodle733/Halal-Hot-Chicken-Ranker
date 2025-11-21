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
        container.innerHTML = '<div class="loading-simple">No spots found.</div>';
        return;
    }

    container.innerHTML = restaurants.map((restaurant, index) => {
        const rank = index + 1;
        const delay = index * 0.1; // Stagger delay
        
        return `
        <div class="card" style="animation-delay: ${delay}s">
            <div class="rank-col">
                ${rank}
                <span class="rank-label">RANK</span>
            </div>
            
            <div class="img-col">
                <img src="${restaurant.imageUrl || 'https://placehold.co/150x150/292524/ff4500?text=HOT'}" alt="${restaurant.name}" onerror="this.src='https://placehold.co/150x150/292524/ff4500?text=HOT'">
            </div>
            
            <div class="info-col">
                <h2 class="card-title">
                    <a href="${restaurant.website || '#'}" target="_blank">${restaurant.name}</a>
                </h2>
                <p class="card-desc">${restaurant.description || 'No description available.'}</p>
            </div>

            <div class="action-col">
                <button class="vote-btn upvote" onclick="vote('${restaurant._id}', 'upvote')" title="Upvote">
                    <i class="fa-solid fa-caret-up"></i>
                </button>
                <div class="score-val">${restaurant.score}</div>
                <button class="vote-btn downvote" onclick="vote('${restaurant._id}', 'downvote')" title="Downvote">
                    <i class="fa-solid fa-caret-down"></i>
                </button>
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
