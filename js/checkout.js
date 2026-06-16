// ===== CHECKOUT PAGE - WHATSAPP ONLY =====

let cart = [];
let orderTotal = 0;
let subtotal = 0;

// Load cart data
function loadCheckoutCart() {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        alert('Your cart is empty!');
        window.location.href = 'cart.html';
        return;
    }
    
    displayOrderSummary();
    updateCartCount();
}

// ✅ Display order summary - NO EMAIL LOGIC
function displayOrderSummary() {
    const itemsContainer = document.getElementById('summaryItems');
    
    // Calculate totals
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // NO COD CHARGES - TOTAL = SUBTOTAL
    orderTotal = subtotal;
    
    // Display items
    itemsContainer.innerHTML = cart.map(item => `
        <div class="summary-item">
            <div class="summary-item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/100?text=Product'">
            </div>
            <div class="summary-item-info">
                <div class="summary-item-name">${item.name}</div>
                <div class="summary-item-qty">Qty: ${item.quantity}</div>
            </div>
            <div class="summary-item-price">₹${item.price * item.quantity}</div>
        </div>
    `).join('');
    
    // Update summary totals
    document.getElementById('summaryItemCount').textContent = itemCount;
    document.getElementById('summarySubtotal').textContent = `₹${subtotal}`;
    document.getElementById('summaryTotal').textContent = `₹${orderTotal}`;
}

// Validate form
function validateForm() {
    const form = document.getElementById('checkoutForm');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return false;
    }
    
    // Validate phone
    const phone = document.getElementById('customerPhone').value;
    if (!/^[0-9]{10}$/.test(phone)) {
        alert('Please enter a valid 10-digit phone number');
        document.getElementById('customerPhone').focus();
        return false;
    }
    
    // Validate pincode
    const pincode = document.getElementById('customerPincode').value;
    if (!/^[0-9]{6}$/.test(pincode)) {
        alert('Please enter a valid 6-digit pincode');
        document.getElementById('customerPincode').focus();
        return false;
    }
    
    return true;
}

// Get form data
function getFormData() {
    return {
        name: document.getElementById('customerName').value.trim(),
        phone: document.getElementById('customerPhone').value.trim(),
        email: document.getElementById('customerEmail').value.trim(),
        address: document.getElementById('customerAddress').value.trim(),
        city: document.getElementById('customerCity').value.trim(),
        state: document.getElementById('customerState').value.trim(),
        pincode: document.getElementById('customerPincode').value.trim(),
        country: document.getElementById('customerCountry').value.trim(),
        notes: document.getElementById('orderNotes').value.trim()
    };
}

// Generate order ID
function generateOrderId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp}-${random}`;
}

// Format date
function formatDate() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return now.toLocaleDateString('en-IN', options);
}

// ✅ ORDER VIA WHATSAPP ONLY
function orderViaWhatsApp() {
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    // Disable button to prevent multiple clicks
    const whatsappBtn = document.querySelector('.btn-whatsapp-order');
    whatsappBtn.disabled = true;
    
    const customerData = getFormData();
    const orderId = generateOrderId();
    
    // Create WhatsApp message
    let message = `🛒 *New Order from JugaaduCart*\n\n`;
    message += `📋 *Order ID:* ${orderId}\n`;
    message += `📅 *Date:* ${formatDate()}\n\n`;
    
    message += `👤 *Customer Details:*\n`;
    message += `Name: ${customerData.name}\n`;
    message += `Phone: ${customerData.phone}\n`;
    message += `Email: ${customerData.email}\n\n`;
    
    message += `📍 *Delivery Address:*\n`;
    message += `${customerData.address}\n`;
    message += `${customerData.city}, ${customerData.state} - ${customerData.pincode}\n`;
    message += `${customerData.country}\n\n`;
    
    message += `🛍️ *Order Items:*\n`;
    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name}\n`;
        message += `   Qty: ${item.quantity} | Price: ₹${item.price}\n`;
        if (item.size) message += `   Size: ${item.size}\n`;
        if (item.color) message += `   Color: ${item.color}\n`;
        message += `   Total: ₹${item.price * item.quantity}\n\n`;
    });
    
    message += `💰 *Payment Summary:*\n`;
    message += `Subtotal: ₹${subtotal}\n`;
    message += `*Total Amount: ₹${orderTotal}*\n\n`;
    
    message += `💳 *Payment Method:* Cash on Delivery (COD)\n`;
    message += `Pay full amount on delivery\n\n`;
    
    if (customerData.notes) {
        message += `📝 *Special Instructions:*\n${customerData.notes}\n\n`;
    }
    
    message += `Please confirm this order. Thank you! 🙏`;
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // WhatsApp URL
    const whatsappUrl = `https://wa.me/918865079136?text=${encodedMessage}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Save order locally & show success
    const orderData = {
        orderId: orderId,
        date: formatDate(),
        customer: customerData,
        items: cart,
        subtotal: subtotal,
        total: orderTotal,
        paymentMethod: 'COD',
        status: 'Pending'
    };
    
    localStorage.setItem('lastOrder', JSON.stringify(orderData));
    localStorage.removeItem('cart');
    
    console.log('✅ Order saved locally:', orderData);
    
    // Show success notification
    showNotification('✅ Order sent to WhatsApp! Check your phone.', 'success');
    
    // Redirect to thank you page after 2 seconds
    setTimeout(() => {
        window.location.href = 'thankyou.html';
    }, 2000);
    
    // Re-enable button
    whatsappBtn.disabled = false;
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

// Update cart count
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElem = document.getElementById('cartCount');
    if (cartCountElem) {
        cartCountElem.textContent = totalItems;
    }
}

// Initialize checkout page
document.addEventListener('DOMContentLoaded', () => {
    loadCheckoutCart();
});