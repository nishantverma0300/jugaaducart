// ===== PRODUCT SLIDER =====

let sliderProducts = [];
let currentSlide = 0;
let autoSlideInterval;
const AUTO_SLIDE_DELAY = 4000; // 4 seconds

// Initialize slider after products load
async function initSlider() {
    try {
        const response = await fetch('data/products.json');
        const data = await response.json();
        
        // Get trending products for slider (or top 5 products)
        sliderProducts = data.products.filter(p => p.trending);
        
        // If less than 3 trending, take top 5 products
        if (sliderProducts.length < 3) {
            sliderProducts = data.products.slice(0, 5);
        }
        
        if (sliderProducts.length === 0) {
            document.getElementById('sliderContainer').innerHTML = 
                '<p style="text-align:center; padding:50px;">No deals available</p>';
            return;
        }
        
        renderSlider();
        renderDots();
        setupSliderEvents();
        startAutoSlide();
    } catch (error) {
        console.error('Error loading slider:', error);
    }
}

// Render all slides
function renderSlider() {
    const track = document.getElementById('sliderTrack');
    
    track.innerHTML = sliderProducts.map(product => createSlideHTML(product)).join('');
}

// Create individual slide HTML
function createSlideHTML(product) {
    const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
    const savings = product.mrp - product.price;
    
    const featuresHTML = product.features.slice(0, 3).map(f => 
        `<span class="slide-feature"><i class="fas fa-check-circle"></i>${f}</span>`
    ).join('');
    
    return `
        <div class="slide">
            <div class="slide-card">
                <div class="slide-content">
                    <span class="slide-tag">
                        <i class="fas fa-fire"></i> HOT DEAL
                    </span>
                    <p class="slide-category">${product.category}</p>
                    <h3 class="slide-title">${product.name}</h3>
                    <p class="slide-description">${product.description}</p>
                    <div class="slide-features">
                        ${featuresHTML}
                    </div>
                    <div class="slide-price-row">
                        <span class="slide-price">₹${product.price}</span>
                        <span class="slide-mrp">₹${product.mrp}</span>
                        <span class="slide-save">Save ₹${savings}</span>
                    </div>
                    <div class="slide-buttons">
                        <button class="slide-btn-primary" onclick="addToCartFromSlider(${product.id})">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                        <a href="product-detail.html?id=${product.id}" class="slide-btn-secondary">
                            <i class="fas fa-eye"></i> View Details
                        </a>
                    </div>
                </div>
                <div class="slide-image">
                    <div class="slide-discount-badge">
                        <span>${discount}%</span>
                        <span>OFF</span>
                    </div>
                    <img src="${product.image}" alt="${product.name}">
                </div>
            </div>
        </div>
    `;
}

// ✅ ADD TO CART FROM SLIDER - WITH AUTO REDIRECT
function addToCartFromSlider(productId) {
    // Get all products from data
    fetch('data/products.json')
        .then(response => response.json())
        .then(data => {
            const product = data.products.find(p => p.id === productId);
            
            if (!product) {
                console.error('Product not found');
                return;
            }
            
            // Get existing cart
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            
            // Check if product already in cart
            const existingItem = cart.find(item => item.id === productId);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: 1
                });
            }
            
            // Save to localStorage
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Update cart count
            updateCartCountSlider();
            
            // Show notification
            showNotificationSlider(`${product.name} added to cart!`);
            
            // ✅ AUTO REDIRECT TO CART AFTER 1.5 SECONDS
            setTimeout(() => {
                window.location.href = 'cart.html';
            }, 1000);
        })
        .catch(error => console.error('Error:', error));
}

// ✅ UPDATE CART COUNT FROM SLIDER
function updateCartCountSlider() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElem = document.getElementById('cartCount');
    if (cartCountElem) {
        cartCountElem.textContent = totalItems;
    }
}

// ✅ NOTIFICATION FUNCTION FOR SLIDER
function showNotificationSlider(message) {
    const notification = document.createElement('div');
    notification.innerHTML = `<i class="fas fa-check-circle"></i> <span>${message}</span>`;
    notification.style.cssText = `
        position: fixed; top: 100px; right: 20px;
        background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
        color: white; padding: 15px 25px; border-radius: 50px;
        box-shadow: 0 8px 32px rgba(76, 175, 80, 0.3); z-index: 10000;
        display: flex; align-items: center; gap: 10px; font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Render dot indicators
function renderDots() {
    const dotsContainer = document.getElementById('sliderDots');
    
    dotsContainer.innerHTML = sliderProducts.map((_, index) => 
        `<button class="slider-dot ${index === 0 ? 'active' : ''}" 
                 onclick="goToSlide(${index})" 
                 aria-label="Go to slide ${index + 1}"></button>`
    ).join('');
}

// Setup event listeners
function setupSliderEvents() {
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    const sliderContainer = document.getElementById('sliderContainer');
    
    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoSlide();
    });
    
    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoSlide();
    });
    
    // Pause on hover
    sliderContainer.addEventListener('mouseenter', stopAutoSlide);
    sliderContainer.addEventListener('mouseleave', startAutoSlide);
    
    // Touch swipe for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    sliderContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    sliderContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) < swipeThreshold) return;
        
        if (diff > 0) {
            nextSlide();
        } else {
            prevSlide();
        }
        resetAutoSlide();
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight') nextSlide();
    });
}

// Go to specific slide
function goToSlide(index) {
    currentSlide = index;
    updateSlider();
    resetAutoSlide();
}

// Next slide
function nextSlide() {
    currentSlide = (currentSlide + 1) % sliderProducts.length;
    updateSlider();
}

// Previous slide
function prevSlide() {
    currentSlide = (currentSlide - 1 + sliderProducts.length) % sliderProducts.length;
    updateSlider();
}

// Update slider position
function updateSlider() {
    const track = document.getElementById('sliderTrack');
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    // Update dots
    document.querySelectorAll('.slider-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

// Auto-slide functions
function startAutoSlide() {
    stopAutoSlide();
    autoSlideInterval = setInterval(nextSlide, AUTO_SLIDE_DELAY);
}

function stopAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
    }
}

function resetAutoSlide() {
    stopAutoSlide();
    startAutoSlide();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('sliderTrack')) {
        initSlider();
    }
    
    // Also initialize cart count on load
    updateCartCountSlider();
});