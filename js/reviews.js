// ===== PRODUCT REVIEWS =====

// Sample reviews data (In production, ye backend se aayenge)
const allReviews = {
    1: [ // Smart LED Bulb reviews
        {
            id: 1,
            name: 'Rahul Kumar',
            initial: 'R',
            rating: 5,
            date: '2 days ago',
            verified: true,
            text: 'Excellent product! The color options are amazing and setup was very easy. Works perfectly with my phone app. Highly recommended!'
        },
        {
            id: 2,
            name: 'Priya Singh',
            initial: 'P',
            rating: 4,
            date: '5 days ago',
            verified: true,
            text: 'Great bulb! Only issue is the app sometimes takes time to respond, but overall very good quality and pricing.'
        },
        {
            id: 3,
            name: 'Amit Patel',
            initial: 'A',
            rating: 5,
            date: '1 week ago',
            verified: true,
            text: 'Perfect! Better than expected. Brightness is amazing and the colors are vibrant. Delivery was fast too.'
        }
    ],
    2: [ // Vegetable Chopper reviews
        {
            id: 1,
            name: 'Neha Sharma',
            initial: 'N',
            rating: 5,
            date: '3 days ago',
            verified: true,
            text: 'Best chopper I\'ve used! Cuts vegetables in seconds without any mess. Very durable and easy to clean.'
        },
        {
            id: 2,
            name: 'Vikram Rao',
            initial: 'V',
            rating: 4,
            date: '1 week ago',
            verified: true,
            text: 'Good quality product. Blades are sharp and it works well. Could use slightly better grip on the handle.'
        }
    ],
    3: [ // Wireless Charger reviews
        {
            id: 1,
            name: 'Suresh Malhotra',
            initial: 'S',
            rating: 5,
            date: '4 days ago',
            verified: true,
            text: 'Fast charging works great! My phone charges from 0 to 100 in about 2 hours. Very convenient.'
        }
    ]
};

// Get reviews for specific product
function getProductReviews(productId) {
    return allReviews[productId] || [];
}

// Display reviews
function displayProductReviews(productId) {
    const reviewsContainer = document.getElementById('productReviewsContainer');
    
    if (!reviewsContainer) return;
    
    const reviews = getProductReviews(productId);
    
    if (reviews.length === 0) {
        reviewsContainer.innerHTML = `
            <div class="no-reviews">
                <i class="fas fa-comments"></i>
                <p>No reviews yet. Be the first to review this product!</p>
            </div>
        `;
        return;
    }
    
    reviewsContainer.innerHTML = reviews.map(review => createReviewHTML(review)).join('');
}

// Create review HTML
function createReviewHTML(review) {
    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
    
    return `
        <div class="review-card">
            <div class="review-header">
                <div class="reviewer-info">
                    <div class="reviewer-avatar">${review.initial}</div>
                    <div class="reviewer-details">
                        <div class="reviewer-name">
                            ${review.name}
                            ${review.verified ? '<span class="verified-badge"><i class="fas fa-check"></i> Verified</span>' : ''}
                        </div>
                        <div class="review-date">${review.date}</div>
                    </div>
                </div>
                <div class="review-rating">
                    <span class="review-stars">${stars}</span>
                    <span class="rating-value">${review.rating}</span>
                </div>
            </div>
            <div class="review-text">
                <p>${review.text}</p>
            </div>
            <div class="review-footer">
                <button class="helpful-btn" onclick="markHelpful(${review.id})">
                    <i class="fas fa-thumbs-up"></i>
                    Helpful
                </button>
                <button class="report-btn" onclick="reportReview(${review.id})">
                    <i class="fas fa-flag"></i>
                    Report
                </button>
            </div>
        </div>
    `;
}

// Mark review as helpful
function markHelpful(reviewId) {
    const btn = event.target.closest('.helpful-btn');
    btn.classList.toggle('active');
    
    if (btn.classList.contains('active')) {
        btn.innerHTML = '<i class="fas fa-thumbs-up"></i> Helpful (1)';
    } else {
        btn.innerHTML = '<i class="fas fa-thumbs-up"></i> Helpful';
    }
}

// Report review
function reportReview(reviewId) {
    alert('Thank you! We will review this report.');
}

// Add new review (for future form)
function submitReview(productId, rating, title, text) {
    const newReview = {
        id: Date.now(),
        name: 'Your Name', // From form
        initial: 'Y',
        rating: rating,
        date: 'Just now',
        verified: false,
        text: text
    };
    
    if (!allReviews[productId]) {
        allReviews[productId] = [];
    }
    
    allReviews[productId].unshift(newReview);
    
    // Refresh display
    displayProductReviews(productId);
    
    showNotification('Review submitted successfully!', 'success');
}

// Get average rating
function getAverageRating(productId) {
    const reviews = getProductReviews(productId);
    
    if (reviews.length === 0) return 0;
    
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
}

// Get rating distribution
function getRatingDistribution(productId) {
    const reviews = getProductReviews(productId);
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    reviews.forEach(review => {
        distribution[review.rating]++;
    });
    
    return distribution;
}

// Show notification (reusable)
function showNotification(message, type = 'success') {
    const colors = {
        success: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
        warning: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
        error: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)'
    };
    
    const notification = document.createElement('div');
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'times-circle'}"></i>
        <span>${message}</span>
    `;
    notification.style.cssText = `
        position: fixed; top: 100px; right: 20px;
        background: ${colors[type]};
        color: white; padding: 15px 25px; border-radius: 50px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); z-index: 10000;
        display: flex; align-items: center; gap: 10px; font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}