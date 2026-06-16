// ===== PRODUCT DETAIL PAGE =====

let currentProduct = null;
let allProducts = [];
let selectedSize = null;
let selectedColor = null;
let quantity = 1;

// Get product ID from URL
function getProductId() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get('id'));
}

// Load product details
async function loadProductDetail() {
    try {
        const productId = getProductId();
        
        if (!productId) {
            window.location.href = 'products.html';
            return;
        }
        
        const response = await fetch('data/products.json');
        const data = await response.json();
        allProducts = data.products;
        
        currentProduct = allProducts.find(p => p.id === productId);
        
        if (!currentProduct) {
            document.getElementById('productDetailContainer').innerHTML = 
                '<div class="error-message"><h2>Product not found</h2><a href="products.html" class="btn btn-primary">Back to Products</a></div>';
            return;
        }
        
        displayProductDetail();
        displayRelatedProducts();
        updateBreadcrumb();
        
    } catch (error) {
        console.error('Error loading product:', error);
        document.getElementById('productDetailContainer').innerHTML = 
            '<div class="error-message"><h2>Failed to load product</h2><p>Please try again later</p></div>';
    }
}

// Display product details
function displayProductDetail() {
    const discount = Math.round(((currentProduct.mrp - currentProduct.price) / currentProduct.mrp) * 100);
    const savings = currentProduct.mrp - currentProduct.price;
    const stars = '★'.repeat(Math.floor(currentProduct.rating)) + '☆'.repeat(5 - Math.floor(currentProduct.rating));
    
    // Update page title
    document.getElementById('pageTitle').textContent = `${currentProduct.name} - JugaaduCart`;
    
    const html = `
        <div class="product-detail-layout">
            
            <!-- Image Gallery -->
            <div class="product-gallery">
                <div class="main-image-container">
                    <div class="product-badges-detail">
                        ${discount > 0 ? `<span class="badge-large badge-sale-large">${discount}% OFF</span>` : ''}
                        ${currentProduct.trending ? '<span class="badge-large badge-trending-large">🔥 Trending</span>' : ''}
                    </div>
                    <img src="${currentProduct.image}" alt="${currentProduct.name}" class="main-image" id="mainImage">
                </div>
                <div class="thumbnail-images">
                    ${currentProduct.images.map((img, index) => `
                        <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="changeImage('${img}', this)">
                            <img src="${img}" alt="Thumbnail ${index + 1}">
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Product Info -->
            <div class="product-detail-info">
                <p class="product-detail-category">${currentProduct.category}</p>
                <h1 class="product-detail-title">${currentProduct.name}</h1>
                
                <!-- Rating -->
                <div class="product-detail-rating">
                    <div class="rating-stars-large">
                        <span class="stars-large">${stars}</span>
                        <span class="rating-number">${currentProduct.rating}</span>
                    </div>
                    <a href="#reviews" class="rating-reviews">${currentProduct.reviews} Reviews</a>
                </div>
                
                <!-- Price -->
                <div class="product-detail-price">
                    <div class="price-row">
                        <span class="price-large">₹${currentProduct.price}</span>
                        ${currentProduct.mrp > currentProduct.price ? 
                            `<span class="mrp-large">₹${currentProduct.mrp}</span>
                             <span class="discount-large">${discount}% OFF</span>` 
                            : ''}
                    </div>
                    ${savings > 0 ? `<p class="savings-text">You save ₹${savings}!</p>` : ''}
                </div>
                
                <!-- Stock Status -->
                <div class="stock-status ${currentProduct.stock ? 'in-stock' : 'out-of-stock'}">
                    <span class="stock-dot"></span>
                    ${currentProduct.stock ? 'In Stock - Ready to Ship' : 'Out of Stock'}
                </div>
                
                <!-- Description -->
                <div class="product-description">
                    <h3 class="description-title">About this product</h3>
                    <p class="description-text">${currentProduct.description}</p>
                </div>
                
                <!-- Features -->
                ${currentProduct.features.length > 0 ? `
                    <div class="product-features">
                        <h3 class="description-title">Key Features</h3>
                        <div class="features-list">
                            ${currentProduct.features.map(feature => `
                                <div class="feature-item">
                                    <i class="fas fa-check-circle"></i>
                                    <span>${feature}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Size Selector -->
                ${currentProduct.sizes && currentProduct.sizes.length > 0 ? `
                    <div class="size-selector">
                        <label class="selector-label">Select Size</label>
                        <div class="size-options">
                            ${currentProduct.sizes.map((size, index) => `
                                <button class="size-option ${index === 0 ? 'active' : ''}" onclick="selectSize('${size}', this)">
                                    ${size}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Color Selector -->
                ${currentProduct.colors && currentProduct.colors.length > 0 ? `
                    <div class="color-selector">
                        <label class="selector-label">Select Color</label>
                        <div class="color-options">
                            ${currentProduct.colors.map((color, index) => `
                                <div class="color-option ${index === 0 ? 'active' : ''}" 
                                     style="background: ${getColorCode(color)}"
                                     data-color="${color}"
                                     onclick="selectColor('${color}', this)">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Quantity Selector -->
                <div class="quantity-selector">
                    <label class="selector-label">Quantity</label>
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="decreaseQuantity()">−</button>
                        <input type="number" class="qty-input" id="quantityInput" value="1" min="1" max="10" readonly>
                        <button class="qty-btn" onclick="increaseQuantity()">+</button>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="product-actions-detail">
                    <button class="btn-add-to-cart" onclick="addToCartDetail()">
                        <i class="fas fa-shopping-cart"></i>
                        Add to Cart
                    </button>
                    <button class="btn-buy-now" onclick="buyNow()">
                        <i class="fas fa-bolt"></i>
                        Buy Now
                    </button>
                </div>
                
                <!-- Delivery Info -->
                <div class="delivery-info">
                    <div class="delivery-item">
                        <div class="delivery-icon">
                            <i class="fas fa-truck"></i>
                        </div>
                        <div class="delivery-text">
                            <h4>Free Delivery</h4>
                            <p>Delivered in 7-10 business days</p>
                        </div>
                    </div>
                    <div class="delivery-item">
                        <div class="delivery-icon">
                            <i class="fas fa-undo"></i>
                        </div>
                        <div class="delivery-text">
                            <h4>7 Days Replacement</h4>
                            <p>Easy return & refund policy</p>
                        </div>
                    </div>
                    <div class="delivery-item">
                        <div class="delivery-icon">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                        <div class="delivery-text">
                            <h4>100% Genuine</h4>
                            <p>Quality checked before dispatch</p>
                        </div>
                    </div>
                </div>
                
            </div>
            
        </div>
        
        <!-- Reviews Section -->
        <div class="reviews-section" id="reviews">
            <div class="reviews-header">
                <h2 class="reviews-title">Customer Reviews</h2>
            </div>
            ${generateSampleReviews()}
        </div>
    `;
    
    document.getElementById('productDetailContainer').innerHTML = html;
    
    // Set initial selections
    if (currentProduct.sizes && currentProduct.sizes.length > 0) {
        selectedSize = currentProduct.sizes[0];
    }
    if (currentProduct.colors && currentProduct.colors.length > 0) {
        selectedColor = currentProduct.colors[0];
    }
}

// Color mapping
function getColorCode(colorName) {
    const colors = {
        'White': '#FFFFFF',
        'Black': '#000000',
        'Red': '#FF0000',
        'Blue': '#0000FF',
        'Green': '#00FF00',
        'Yellow': '#FFFF00',
        'Orange': '#FFA500',
        'Pink': '#FFC0CB',
        'Purple': '#800080',
        'Gray': '#808080',
        'Silver': '#C0C0C0',
        'Gold': '#FFD700',
        'Rose Gold': '#B76E79',
        'Warm White': '#FFF8DC',
        'RGB': 'linear-gradient(90deg, red, orange, yellow, green, blue, purple)'
    };
    return colors[colorName] || '#CCCCCC';
}

// Change main image
function changeImage(imgSrc, thumbnail) {
    document.getElementById('mainImage').src = imgSrc;
    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
    thumbnail.classList.add('active');
}

// Select size
function selectSize(size, button) {
    selectedSize = size;
    document.querySelectorAll('.size-option').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
}

// Select color
function selectColor(color, element) {
    selectedColor = color;
    document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
    element.classList.add('active');
}

// Quantity functions
function increaseQuantity() {
    const input = document.getElementById('quantityInput');
    if (quantity < 10) {
        quantity++;
        input.value = quantity;
    }
}

function decreaseQuantity() {
    const input = document.getElementById('quantityInput');
    if (quantity > 1) {
        quantity--;
        input.value = quantity;
    }
}

// Add to cart from detail page
function addToCartDetail() {
    if (!currentProduct.stock) {
        alert('Sorry, this product is out of stock!');
        return;
    }
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const cartItem = {
        id: currentProduct.id,
        name: currentProduct.name,
        price: currentProduct.price,
        image: currentProduct.image,
        quantity: quantity,
        size: selectedSize,
        color: selectedColor
    };
    
    const existingIndex = cart.findIndex(item => 
        item.id === currentProduct.id && 
        item.size === selectedSize && 
        item.color === selectedColor
    );
    
    if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push(cartItem);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    showNotification(`${quantity} × ${currentProduct.name} added to cart!`);
}

// Buy now
function buyNow() {
    addToCartDetail();
    setTimeout(() => {
        window.location.href = 'cart.html';
    }, 500);
}

// Display related products
function displayRelatedProducts() {
    const related = allProducts
        .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
        .slice(0, 4);
    
    const container = document.getElementById('relatedProducts');
    
    if (related.length === 0) {
        container.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">No related products found</p>';
        return;
    }
    
    container.innerHTML = related.map(product => createProductCard(product)).join('');
}

// Create product card (reuse)
function createProductCard(product) {
    const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
    const stars = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating));
    
    return `
        <div class="product-card">
            <div class="product-badges">
                ${discount > 0 ? `<span class="badge badge-sale">${discount}% OFF</span>` : ''}
                ${product.trending ? '<span class="badge badge-trending">🔥 Trending</span>' : ''}
            </div>
            <a href="product-detail.html?id=${product.id}" class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </a>
            <div class="product-info">
                <p class="product-category">${product.category}</p>
                <a href="product-detail.html?id=${product.id}">
                    <h3 class="product-name">${product.name}</h3>
                </a>
                <div class="product-rating">
                    <span class="stars">${stars}</span>
                    <span class="rating-count">(${product.reviews})</span>
                </div>
                <div class="product-price">
                    <span class="price-current">₹${product.price}</span>
                    ${product.mrp > product.price ? 
                        `<span class="price-original">₹${product.mrp}</span>` : ''}
                </div>
            </div>
        </div>
    `;
}

// Generate sample reviews
function generateSampleReviews() {
    const reviews = [
        { name: 'Rahul K', initial: 'R', rating: 5, text: 'Excellent product! Worth every penny. Fast delivery and great quality.', date: '2 days ago' },
        { name: 'Priya S', initial: 'P', rating: 4, text: 'Good value for money. Product as described. Packaging was good.', date: '5 days ago' },
        { name: 'Amit M', initial: 'A', rating: 5, text: 'Very satisfied with this purchase. Highly recommended!', date: '1 week ago' }
    ];
    
    return reviews.map(review => {
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        return `
            <div class="review-card">
                <div class="review-header">
                    <div class="reviewer-info">
                        <div class="reviewer-avatar">${review.initial}</div>
                        <div>
                            <div class="reviewer-name">${review.name}</div>
                            <div class="review-date">${review.date}</div>
                        </div>
                    </div>
                    <div class="stars-large">${stars}</div>
                </div>
                <p class="review-text">${review.text}</p>
            </div>
        `;
    }).join('');
}

// Update breadcrumb
function updateBreadcrumb() {
    document.getElementById('breadcrumbCategory').textContent = currentProduct.category;
    document.getElementById('breadcrumbProduct').textContent = currentProduct.name;
}

// Show notification
function showNotification(message) {
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

// Update cart count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElem = document.getElementById('cartCount');
    if (cartCountElem) {
        cartCountElem.textContent = totalItems;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProductDetail();
    updateCartCount();
});