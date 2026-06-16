// ===== ALL PRODUCTS PAGE =====

let allProducts = [];
let filteredProducts = [];
let currentFilters = {
    category: 'all',
    price: 'all',
    inStock: false,
    trending: false,
    discount: false,
    search: ''
};

// Load products
async function loadAllProducts() {
    try {
        const response = await fetch('data/products.json');
        const data = await response.json();
        allProducts = data.products;
        
        // Check URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        const searchParam = urlParams.get('search');
        
        if (categoryParam) {
            currentFilters.category = categoryParam;
            document.querySelector(`input[name="category"][value="${categoryParam}"]`)?.click();
        }
        
        if (searchParam) {
            currentFilters.search = searchParam;
            document.getElementById('searchInput').value = searchParam;
        }
        
        updateCategoryCounts();
        applyFilters();
        
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('productsGrid').innerHTML = 
            '<p class="error">Failed to load products. Please refresh the page.</p>';
    }
}

// Update category counts
function updateCategoryCounts() {
    const categoryCounts = {};
    
    allProducts.forEach(product => {
        const cat = product.category;
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    
    document.getElementById('count-all').textContent = allProducts.length;
    document.getElementById('count-kitchen').textContent = categoryCounts['Kitchen'] || 0;
    document.getElementById('count-electronics').textContent = categoryCounts['Electronics'] || 0;
    document.getElementById('count-home').textContent = categoryCounts['Home & Living'] || 0;
    document.getElementById('count-mobile').textContent = categoryCounts['Mobile Accessories'] || 0;
    document.getElementById('count-beauty').textContent = categoryCounts['Beauty & Personal Care'] || 0;
    document.getElementById('count-car').textContent = categoryCounts['Car Accessories'] || 0;
}

// Apply all filters
function applyFilters() {
    filteredProducts = allProducts.filter(product => {
        // Category filter
        if (currentFilters.category !== 'all' && product.category !== currentFilters.category) {
            return false;
        }
        
        // Price filter
        if (currentFilters.price !== 'all') {
            const [min, max] = currentFilters.price.split('-').map(Number);
            if (product.price < min || product.price > max) {
                return false;
            }
        }
        
        // Stock filter
        if (currentFilters.inStock && !product.stock) {
            return false;
        }
        
        // Trending filter
        if (currentFilters.trending && !product.trending) {
            return false;
        }
        
        // Discount filter
        if (currentFilters.discount && product.price >= product.mrp) {
            return false;
        }
        
        // Search filter
        if (currentFilters.search) {
            const searchLower = currentFilters.search.toLowerCase();
            const nameMatch = product.name.toLowerCase().includes(searchLower);
            const categoryMatch = product.category.toLowerCase().includes(searchLower);
            const descMatch = product.description.toLowerCase().includes(searchLower);
            
            if (!nameMatch && !categoryMatch && !descMatch) {
                return false;
            }
        }
        
        return true;
    });
    
    displayProducts();
    updatePageHeader();
    updateActiveFilters();
}

// Display products
function displayProducts() {
    const container = document.getElementById('productsGrid');
    const noResults = document.getElementById('noResults');
    
    if (filteredProducts.length === 0) {
        container.style.display = 'none';
        noResults.style.display = 'block';
        document.getElementById('resultsCount').textContent = '0';
        return;
    }
    
    container.style.display = 'grid';
    noResults.style.display = 'none';
    document.getElementById('resultsCount').textContent = filteredProducts.length;
    
    container.innerHTML = filteredProducts.map(product => createProductCard(product)).join('');
}

// Create product card (reuse from products.js)
function createProductCard(product) {
    const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
    const stars = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating));
    
    return `
        <div class="product-card" data-id="${product.id}">
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
                        `<span class="price-original">₹${product.mrp}</span>
                         <span class="price-discount">${discount}% off</span>` 
                        : ''}
                </div>
                <div class="product-actions">
                    <button class="btn-cart" onclick="addToCart(${product.id})">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                    <a href="product-detail.html?id=${product.id}" class="btn-view">
                        <i class="fas fa-eye"></i>
                    </a>
                </div>
            </div>
        </div>
    `;
}

// Update page header
function updatePageHeader() {
    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');
    const breadcrumb = document.getElementById('breadcrumbCurrent');
    
    if (currentFilters.search) {
        pageTitle.textContent = `Search: "${currentFilters.search}"`;
        pageSubtitle.textContent = `${filteredProducts.length} results found`;
        breadcrumb.textContent = 'Search Results';
    } else if (currentFilters.category !== 'all') {
        pageTitle.textContent = currentFilters.category;
        pageSubtitle.textContent = `${filteredProducts.length} products available`;
        breadcrumb.textContent = currentFilters.category;
    } else {
        pageTitle.textContent = 'All Products';
        pageSubtitle.textContent = 'Browse our complete collection';
        breadcrumb.textContent = 'All Products';
    }
}

// Update active filters display
function updateActiveFilters() {
    const container = document.getElementById('activeFilters');
    const tags = [];
    
    if (currentFilters.category !== 'all') {
        tags.push(`<span class="filter-tag">${currentFilters.category} <i class="fas fa-times" onclick="removeFilter('category')"></i></span>`);
    }
    
    if (currentFilters.price !== 'all') {
        tags.push(`<span class="filter-tag">₹${currentFilters.price} <i class="fas fa-times" onclick="removeFilter('price')"></i></span>`);
    }
    
    if (currentFilters.inStock) {
        tags.push(`<span class="filter-tag">In Stock <i class="fas fa-times" onclick="removeFilter('inStock')"></i></span>`);
    }
    
    if (currentFilters.trending) {
        tags.push(`<span class="filter-tag">Trending <i class="fas fa-times" onclick="removeFilter('trending')"></i></span>`);
    }
    
    if (currentFilters.discount) {
        tags.push(`<span class="filter-tag">On Sale <i class="fas fa-times" onclick="removeFilter('discount')"></i></span>`);
    }
    
    if (currentFilters.search) {
        tags.push(`<span class="filter-tag">Search: "${currentFilters.search}" <i class="fas fa-times" onclick="removeFilter('search')"></i></span>`);
    }
    
    container.innerHTML = tags.join('');
    container.style.display = tags.length > 0 ? 'flex' : 'none';
}

// Remove specific filter
function removeFilter(filterType) {
    if (filterType === 'category') {
        currentFilters.category = 'all';
        document.querySelector('input[name="category"][value="all"]').checked = true;
    } else if (filterType === 'price') {
        currentFilters.price = 'all';
        document.querySelector('input[name="price"][value="all"]').checked = true;
    } else if (filterType === 'inStock') {
        currentFilters.inStock = false;
        document.getElementById('inStockOnly').checked = false;
    } else if (filterType === 'trending') {
        currentFilters.trending = false;
        document.getElementById('trendingOnly').checked = false;
    } else if (filterType === 'discount') {
        currentFilters.discount = false;
        document.getElementById('discountOnly').checked = false;
    } else if (filterType === 'search') {
        currentFilters.search = '';
        document.getElementById('searchInput').value = '';
    }
    
    applyFilters();
}

// Clear all filters
function clearAllFilters() {
    currentFilters = {
        category: 'all',
        price: 'all',
        inStock: false,
        trending: false,
        discount: false,
        search: ''
    };
    
    document.querySelector('input[name="category"][value="all"]').checked = true;
    document.querySelector('input[name="price"][value="all"]').checked = true;
    document.getElementById('inStockOnly').checked = false;
    document.getElementById('trendingOnly').checked = false;
    document.getElementById('discountOnly').checked = false;
    document.getElementById('searchInput').value = '';
    
    applyFilters();
}

// Sort products
function sortProducts(sortType) {
    if (sortType === 'price-low') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortType === 'price-high') {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortType === 'name-asc') {
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortType === 'name-desc') {
        filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortType === 'discount') {
    filteredProducts.sort((a, b) => {
        const discountA = ((a.mrp - a.price) / a.mrp) * 100;
        const discountB = ((b.mrp - b.price) / b.mrp) * 100;
        return discountB - discountA; // Higher discount first
    });
}
    
    displayProducts();
}

// Add to cart (reuse from products.js)
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
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
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`${product.name} added to cart!`);
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
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

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadAllProducts();
    updateCartCount();
    
    // Category filter
    document.querySelectorAll('input[name="category"]').forEach(input => {
        input.addEventListener('change', (e) => {
            currentFilters.category = e.target.value;
            applyFilters();
        });
    });
    
    // Price filter
    document.querySelectorAll('input[name="price"]').forEach(input => {
        input.addEventListener('change', (e) => {
            currentFilters.price = e.target.value;
            applyFilters();
        });
    });
    
    // Stock filter
    document.getElementById('inStockOnly').addEventListener('change', (e) => {
        currentFilters.inStock = e.target.checked;
        applyFilters();
    });
    
    // Trending filter
    document.getElementById('trendingOnly').addEventListener('change', (e) => {
        currentFilters.trending = e.target.checked;
        applyFilters();
    });
    
    // Discount filter
    document.getElementById('discountOnly').addEventListener('change', (e) => {
        currentFilters.discount = e.target.checked;
        applyFilters();
    });
    
    // Sort
    document.getElementById('sortSelect').addEventListener('change', (e) => {
        sortProducts(e.target.value);
    });
    
    // Clear filters
    document.getElementById('clearFilters').addEventListener('click', clearAllFilters);
    
    // View toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const view = btn.dataset.view;
            const grid = document.getElementById('productsGrid');
            
            if (view === 'list') {
                grid.classList.add('list-view');
            } else {
                grid.classList.remove('list-view');
            }
        });
    });
    
    // Search functionality
    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.getElementById('searchInput');
    
    searchBtn.addEventListener('click', () => {
        currentFilters.search = searchInput.value.trim();
        applyFilters();
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentFilters.search = searchInput.value.trim();
            applyFilters();
        }
    });
    
    // Mobile filter toggle
    const mobileFilterBtn = document.getElementById('mobileFilterBtn');
    const sidebar = document.getElementById('filtersSidebar');
    
    if (mobileFilterBtn) {
        mobileFilterBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            
            // Create overlay
            let overlay = document.querySelector('.sidebar-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'sidebar-overlay';
                document.body.appendChild(overlay);
                
                overlay.addEventListener('click', () => {
                    sidebar.classList.remove('active');
                    overlay.classList.remove('active');
                });
            }
            overlay.classList.toggle('active');
        });
    }
});