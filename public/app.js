// Use relative URL for API calls (works in production and development)
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : '/api';

let allRestaurants = [];

// Fetch and display restaurants
async function loadRestaurants() {
    const container = document.getElementById('restaurants-list');
    try {
        const response = await fetch(`${API_URL}/restaurants`);
        allRestaurants = await response.json();
        renderRestaurants(allRestaurants);
    } catch (error) {
        console.error('Error loading restaurants:', error);
        container.innerHTML = 
            '<p class="error">Failed to load restaurants. Make sure the server is running.</p>';
    }
}

// Render restaurants based on data
function renderRestaurants(restaurants) {
    const container = document.getElementById('restaurants-list');
    
    if (restaurants.length === 0) {
        container.innerHTML = '<p style="text-align:center; grid-column: 1/-1; color: var(--text-muted);">No restaurants found.</p>';
        return;
    }

    container.innerHTML = restaurants.map((restaurant, index) => {
        const rank = index + 1;
        
        return `
        <div class="restaurant-row">
            <div class="rank-section">
                <div class="rank-box">${rank}</div>
            </div>
            
            <div class="image-section">
                <img src="${restaurant.imageUrl || 'https://placehold.co/100x100/1e293b/ff4b1f?text=Chicken'}" alt="${restaurant.name}" onerror="this.src='https://placehold.co/100x100/1e293b/ff4b1f?text=Chicken'">
            </div>
            
            <div class="vote-section">
                <div class="vote-buttons-row">
                    <button class="vote-btn upvote" onclick="vote('${restaurant._id}', 'upvote')" title="Upvote">
                        <i class="fa-solid fa-arrow-up"></i>
                    </button>
                    <button class="vote-btn downvote" onclick="vote('${restaurant._id}', 'downvote')" title="Downvote">
                        <i class="fa-solid fa-arrow-down"></i>
                    </button>
                </div>
                <div class="vote-count">
                    <span class="count-value">${restaurant.score}</span> VOTES
                </div>
            </div>

            <div class="info-section">
                <div class="info-header">
                    <span class="question-text">Have you tried it?</span>
                    <h2 class="restaurant-name">
                        <a href="${restaurant.website || '#'}" target="_blank">${restaurant.name}</a>
                    </h2>
                </div>
                <p class="description">${restaurant.description || ''}</p>
            </div>
        </div>
    `}).join('');
}

// Handle voting
async function vote(id, action) {
    try {
        // The server expects /api/restaurants/:id/upvote or /api/restaurants/:id/downvote
        const response = await fetch(`${API_URL}/restaurants/${id}/${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            // Reload all restaurants to update scores and ranks
            loadRestaurants();
        } else {
            console.error('Vote failed:', await response.text());
        }
    } catch (error) {
        console.error('Error voting:', error);
        alert('Failed to vote. Please try again.');
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
