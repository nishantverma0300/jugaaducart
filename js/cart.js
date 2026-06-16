// ===== CART PAGE =====

let cart = [];

// Load cart from localStorage
function loadCart() {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    displayCart();
    updateCartSummary();
    updateCartCount();
}

// Display cart items
function displayCart() {
    const container = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const cartLayout = document.querySelector('.cart-layout');
    
    if (cart.length === 0) {
        if (cartLayout) cartLayout.style.display = 'none';
        if (emptyCart) emptyCart.style.display = 'block';
        return;
    }
    
    if (cartLayout) cartLayout.style.display = 'grid';
    if (emptyCart) emptyCart.style.display = 'none';
    
    container.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            
            <div class="cart-item-info">
                <a href="product-detail.html?id=${item.id}" class="cart-item-name">
                    ${item.name}
                </a>
                
                <div class="cart-item-details">
                    ${item.size ? `<span class="item-detail-tag">Size: ${item.size}</span>` : ''}
                    ${item.color ? `<span class="item-detail-tag">Color: ${item.color}</span>` : ''}
                </div>
                
                <div class="cart-item-price">₹${item.price}</div>
                
                <div class="cart-item-actions">
                    <div class="cart-qty-control">
                        <button class="cart-qty-btn" onclick="updateQuantity(${index}, -1)">−</button>
                        <span class="cart-qty-display">${item.quantity}</span>
                        <button class="cart-qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                    
                    <button class="btn-remove-item" onclick="removeItem(${index})">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
            
            <div class="cart-item-right">
                <div class="cart-item-total">₹${item.price * item.quantity}</div>
            </div>
        </div>
    `).join('');
}

// Update quantity
function updateQuantity(index, change) {
    cart[index].quantity += change;
    
    if (cart[index].quantity < 1) {
        cart[index].quantity = 1;
    }
    
    if (cart[index].quantity > 10) {
        cart[index].quantity = 10;
        showNotification('Maximum quantity is 10', 'warning');
    }
    
    saveCart();
    displayCart();
    updateCartSummary();
    updateCartCount();
}

// Remove item

function removeItem(index) {
    const itemName = cart[index].name;
    
    // Direct remove without confirmation
    cart.splice(index, 1);
    saveCart();
    displayCart();
    updateCartSummary();
    updateCartCount();
    showNotification(`${itemName} removed from cart`, 'success');
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Update cart summary
function updateCartSummary() {
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // COD charges logic (₹30-50 prepaid)
    let codCharges = 0;
   
    
    const total = subtotal + codCharges;
    
    // Calculate savings (if MRP was available)
    const savings = 0; // We'll calculate this if we have MRP data
    
    // Update DOM
    document.getElementById('itemCount').textContent = itemCount;
    document.getElementById('subtotal').textContent = `₹${subtotal}`;
    document.getElementById('codCharges').textContent = `₹${codCharges}`;
    document.getElementById('totalAmount').textContent = `₹${total}`;
    
    // Savings info
    const savingsInfo = document.getElementById('savingsInfo');
    if (savings > 0) {
        savingsInfo.innerHTML = `🎉 You're saving ₹${savings} on this order!`;
        savingsInfo.style.display = 'block';
    } else {
        savingsInfo.style.display = 'none';
    }
    
    // Disable checkout if cart is empty
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
    }
}

// Proceed to checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    window.location.href = 'checkout.html';
}

// Update cart count in header
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElem = document.getElementById('cartCount');
    if (cartCountElem) {
        cartCountElem.textContent = totalItems;
    }
}

// Show notification
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

// Initialize cart page
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
});