const API_URL = 'http://localhost:3000/api';

// Fetch and display restaurants
async function loadRestaurants() {
    try {
        const response = await fetch(`${API_URL}/restaurants`);
        const restaurants = await response.json();
        displayRestaurants(restaurants);
    } catch (error) {
        console.error('Error loading restaurants:', error);
        document.getElementById('restaurants-list').innerHTML = 
            '<p class="error">Failed to load restaurants. Make sure the server is running.</p>';
    }
}

// Display restaurants in the UI
function displayRestaurants(restaurants) {
    const container = document.getElementById('restaurants-list');
    
    if (restaurants.length === 0) {
        container.innerHTML = '<p>No restaurants yet!</p>';
        return;
    }

    container.innerHTML = restaurants.map((restaurant, index) => `
        <div class="restaurant-card ${index === 0 && restaurant.score > 0 ? 'top-rated' : ''}">
            <div class="rank">#${index + 1}</div>
            <div class="restaurant-info">
                <h2 class="restaurant-name">${restaurant.name}</h2>
                <div class="score-container">
                    <span class="score-label">Score:</span>
                    <span class="score ${restaurant.score > 0 ? 'positive' : restaurant.score < 0 ? 'negative' : ''}">${restaurant.score}</span>
                </div>
            </div>
            <div class="vote-buttons">
                <button class="vote-btn upvote" onclick="vote(${restaurant.id}, 'upvote')">
                    <span class="arrow">▲</span>
                    <span class="vote-text">Upvote</span>
                </button>
                <button class="vote-btn downvote" onclick="vote(${restaurant.id}, 'downvote')">
                    <span class="arrow">▼</span>
                    <span class="vote-text">Downvote</span>
                </button>
            </div>
        </div>
    `).join('');
}

// Handle voting
async function vote(id, action) {
    try {
        const response = await fetch(`${API_URL}/restaurants/${id}/${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            // Reload restaurants to show updated scores and rankings
            await loadRestaurants();
        } else {
            console.error('Vote failed:', await response.text());
        }
    } catch (error) {
        console.error('Error voting:', error);
    }
}

// Load restaurants when page loads
document.addEventListener('DOMContentLoaded', loadRestaurants);
