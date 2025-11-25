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
        
        // Calculate total votes (fallback to score if upvotes/downvotes missing)
        const upvotes = restaurant.upvotes || 0;
        const downvotes = restaurant.downvotes || 0;
        const totalVotes = upvotes + downvotes;
        
        // Check if user has voted for this restaurant in this session
        // Now stores 'upvote' or 'downvote'
        const userVote = sessionStorage.getItem(`voted-${restaurant._id}`);
        
        let voteSectionHtml;
        
        // Determine button classes
        const upvoteClass = userVote === 'upvote' ? 'vote-btn upvote selected' : 'vote-btn upvote';
        const downvoteClass = userVote === 'downvote' ? 'vote-btn downvote selected' : 'vote-btn downvote';
        
        if (userVote) {
            // Show "After Vote" state (Split counts)
            const percentage = totalVotes > 0 ? Math.round((upvotes / totalVotes) * 100) : 0;
            voteSectionHtml = `
                <div class="vote-container" id="vote-container-${restaurant._id}">
                    <div class="vote-buttons">
                        <button class="${upvoteClass}" onclick="vote('${restaurant._id}', 'upvote')">
                            <i class="fa-solid fa-arrow-up"></i>
                        </button>
                        <button class="${downvoteClass}" onclick="vote('${restaurant._id}', 'downvote')">
                            <i class="fa-solid fa-arrow-down"></i>
                        </button>
                    </div>
                    <div class="vote-stats" id="vote-stats-${restaurant._id}">
                        <div class="split-votes">
                            <span class="up-count">${upvotes.toLocaleString()}</span>
                            <span class="down-count">${downvotes.toLocaleString()}</span>
                        </div>
                        <div class="percentage-label visible">${percentage}% of people agree!</div>
                    </div>
                </div>
            `;
        } else {
            // Show "Before Vote" state (Total votes)
            voteSectionHtml = `
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
                    </div>
                </div>
            `;
        }
        
        return `
        <div class="card" style="animation-delay: ${delay}s">
            <div class="card-main">
                <div class="img-col">
                    <div class="rank-badge">${rank}</div>
                    <img src="${restaurant.imageUrl || 'https://placehold.co/150x150/292524/ff4500?text=HOT'}" alt="${restaurant.name}" onerror="this.src='https://placehold.co/150x150/292524/ff4500?text=HOT'">
                </div>
                
                <div class="info-col">
                    <h2 class="card-title">
                        <a href="${restaurant.website || '#'}" target="_blank">${restaurant.name}</a>
                    </h2>
                    <p class="card-desc">${restaurant.description || 'No description available.'}</p>
                    
                    <button class="toggle-comments-btn" onclick="toggleComments('${restaurant._id}')">
                        <i class="fa-regular fa-comment"></i> 
                        <span id="comment-count-${restaurant._id}">${restaurant.comments ? restaurant.comments.length : 0}</span> Comments
                    </button>
                </div>

                <div class="vote-col">
                    ${voteSectionHtml}
                </div>
            </div>

            <div id="comments-${restaurant._id}" class="comments-section">
                <div class="comments-header">
                    <span>Comments</span>
                </div>
                <div class="comment-list" id="list-${restaurant._id}">
                    ${(restaurant.comments && restaurant.comments.length > 0) 
                        ? restaurant.comments.map(c => `
                            <div class="comment-item">
                                <div class="comment-meta">
                                    <span class="comment-author">${c.author || 'Anonymous'}</span>
                                    <span class="comment-date">${new Date(c.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div class="comment-text">${c.text}</div>
                            </div>
                        `).join('') 
                        : '<div class="empty-comments">No comments yet. Be the first!</div>'
                    }
                </div>
                <form class="comment-form" onsubmit="submitComment(event, '${restaurant._id}')">
                    <input type="text" name="commentText" class="comment-input" placeholder="Add a comment..." required>
                    <button type="submit" class="comment-submit-btn">Post</button>
                </form>
            </div>
        </div>
    `}).join('');
}

// Handle voting
async function vote(id, action) {
    const container = document.getElementById(`vote-container-${id}`);
    const statsContainer = document.getElementById(`vote-stats-${id}`);
    
    if (!container) return;

    // Check previous vote
    const previousAction = sessionStorage.getItem(`voted-${id}`);
    
    // If clicking the same button, do nothing
    if (previousAction === action) return;

    // Disable buttons temporarily
    const buttons = container.querySelectorAll('button');
    buttons.forEach(btn => btn.disabled = true);

    try {
        const response = await fetch(`${API_URL}/restaurants/${id}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action, previousAction })
        });

        if (response.ok) {
            const updatedRestaurant = await response.json();
            
            // Update session storage
            sessionStorage.setItem(`voted-${id}`, action);
            
            // Update local data
            const index = allRestaurants.findIndex(r => r._id === id);
            if (index !== -1) {
                allRestaurants[index] = updatedRestaurant;
            }

            // Calculate new stats
            const upvotes = updatedRestaurant.upvotes || 0;
            const downvotes = updatedRestaurant.downvotes || 0;
            const totalVotes = upvotes + downvotes;
            const percentage = totalVotes > 0 ? Math.round((upvotes / totalVotes) * 100) : 0;

            // Update Buttons Visual State
            const upBtn = container.querySelector('.upvote');
            const downBtn = container.querySelector('.downvote');
            
            upBtn.classList.remove('selected');
            downBtn.classList.remove('selected');
            
            if (action === 'upvote') upBtn.classList.add('selected');
            if (action === 'downvote') downBtn.classList.add('selected');

            // Update Stats Area
            statsContainer.innerHTML = `
                <div class="split-votes">
                    <span class="up-count">${upvotes.toLocaleString()}</span>
                    <span class="down-count">${downvotes.toLocaleString()}</span>
                </div>
                <div class="percentage-label">${percentage}% of people agree!</div>
            `;
            
            // Trigger fade in
            setTimeout(() => {
                const label = statsContainer.querySelector('.percentage-label');
                if (label) label.classList.add('visible');
            }, 50);

        } else {
            console.error('Vote failed:', await response.text());
        }
    } catch (error) {
        console.error('Error voting:', error);
    } finally {
        // Re-enable buttons
        buttons.forEach(btn => btn.disabled = false);
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

// Modal Logic
const modal = document.getElementById('request-modal');
const openBtn = document.getElementById('open-request-modal');
const closeBtn = document.querySelector('.close-modal');
const requestForm = document.getElementById('request-form');

if (openBtn) {
    openBtn.addEventListener('click', () => {
        modal.classList.add('active');
    });
}

if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
}

// Close on outside click
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
    }
});

// Handle Request Submission
if (requestForm) {
    requestForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = requestForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        submitBtn.disabled = true;
        submitBtn.innerText = 'Sending...';

        const data = {
            name: document.getElementById('req-name').value,
            location: document.getElementById('req-location').value,
            link: document.getElementById('req-link').value
        };

        try {
            const response = await fetch(`${API_URL}/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert('Request sent successfully! Thanks for the tip.');
                modal.classList.remove('active');
                requestForm.reset();
            } else {
                const error = await response.json();
                alert('Failed to send request: ' + (error.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error sending request:', error);
            alert('Error sending request. Please try again later.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = originalText;
        }
    });
}

// Load restaurants when page loads
document.addEventListener('DOMContentLoaded', loadRestaurants);

// Toggle Comments Section
function toggleComments(id) {
    const section = document.getElementById(`comments-${id}`);
    if (section) {
        section.classList.toggle('active');
    }
}

// Submit a new comment
async function submitComment(event, id) {
    event.preventDefault();
    const form = event.target;
    const input = form.querySelector('input[name="commentText"]');
    const btn = form.querySelector('button');
    const text = input.value;
    
    if (!text.trim()) return;

    // Disable form while submitting
    input.disabled = true;
    btn.disabled = true;
    btn.innerText = '...';

    try {
        const response = await fetch(`${API_URL}/restaurants/${id}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: text })
        });

        if (response.ok) {
            const newComment = await response.json();
            
            // Add to list
            const list = document.getElementById(`list-${id}`);
            const emptyMsg = list.querySelector('.empty-comments');
            if (emptyMsg) emptyMsg.remove();

            const commentHtml = `
                <div class="comment-item" style="animation: fadeIn 0.5s ease">
                    <div class="comment-meta">
                        <span class="comment-author">${newComment.author || 'Anonymous'}</span>
                        <span class="comment-date">${new Date(newComment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div class="comment-text">${newComment.text}</div>
                </div>
            `;
            
            list.insertAdjacentHTML('beforeend', commentHtml);
            
            // Update count
            const countSpan = document.getElementById(`comment-count-${id}`);
            if (countSpan) {
                countSpan.innerText = parseInt(countSpan.innerText) + 1;
            }

            // Reset form
            form.reset();
            
            // Scroll to bottom of list
            list.scrollTop = list.scrollHeight;
        } else {
            alert('Failed to post comment. Please try again.');
        }
    } catch (error) {
        console.error('Error posting comment:', error);
        alert('Error posting comment.');
    } finally {
        input.disabled = false;
        btn.disabled = false;
        btn.innerText = 'Post';
        input.focus();
    }
}
