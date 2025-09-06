// Global state management
let currentUser = null;
let currentScreen = 'login-screen';
let products = [];
let cart = [];
let userProducts = [];
let previousPurchases = [];

// Sample data for demonstration
const sampleProducts = [
    {
        id: 1,
        title: "Eco-Friendly Bamboo Phone Case",
        category: "electronics",
        description: "Sustainable bamboo phone case that's biodegradable and stylish.",
        price: 1999,
        image: "../images/BambooCase.jpg",
        seller: "EcoTech Solutions"
    },
    {
        id: 2,
        title: "Organic Cotton T-Shirt",
        category: "clothing",
        description: "100% organic cotton t-shirt made from sustainable materials.",
        price: 2499,
        image: "../images/tshirt.jpg",
        seller: "Green Threads"
    },
    {
        id: 3,
        title: "Solar-Powered Garden Lights",
        category: "home",
        description: "Beautiful solar-powered LED lights for your garden.",
        price: 3699,
        image: "../images/solar-poweredgardenlights.jpg",
        seller: "Sunshine Solutions"
    },
    {
        id: 4,
        title: "Sustainable Living Guide",
        category: "books",
        description: "Complete guide to sustainable living practices.",
        price: 1599,
        image: "../images/sustainablelivingguide.jpg",
        seller: "Green Books"
    },
    {
        id: 5,
        title: "Recycled Glass Water Bottle",
        category: "home",
        description: "Beautiful water bottle made from recycled glass.",
        price: 1849,
        image: "../images/glasswaterbottle.jpg",
        seller: "Eco Essentials"
    },
    {
        id: 6,
        title: "Biodegradable Phone Charger",
        category: "electronics",
        description: "Fast-charging cable made from biodegradable materials.",
        price: 2799,
        image: "../images/biodegradablephonecharger.jpg",
        seller: "Green Tech"
    }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadSampleData();
});

function initializeApp() {
    // Check if user is logged in
    const savedUser = localStorage.getItem('ecofinds_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showScreen('product-feed');
        updateNavigation();
    } else {
        showScreen('login-screen');
    }
}

function setupEventListeners() {
    // Navigation toggle for mobile
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Signup form
    document.getElementById('signup-form').addEventListener('submit', handleSignup);
    
    // Add product form
    document.getElementById('add-product-form').addEventListener('submit', handleAddProduct);
    
    // Profile form
    document.getElementById('profile-form').addEventListener('submit', handleProfileUpdate);
    
    // Search functionality
    document.getElementById('search-input').addEventListener('input', handleSearch);
    
    // Category filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterProducts(this.dataset.category);
        });
    });
    
    // Profile image upload
    document.getElementById('profile-image-input').addEventListener('change', handleProfileImageUpload);
    
    // Profile form toggle
    document.getElementById('toggle-edit-form').addEventListener('click', toggleEditForm);
    
    // Profile form cancel
    document.getElementById('cancel-edit').addEventListener('click', cancelEdit);
}

function loadSampleData() {
    products = [...sampleProducts];
    renderProducts();
}

// Screen management
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    document.getElementById(screenId).classList.add('active');
    currentScreen = screenId;
    
    // Update navigation visibility
    updateNavigation();
    
    // Load screen-specific data
    switch(screenId) {
        case 'product-feed':
            renderProducts();
            break;
        case 'my-listings':
            renderUserProducts();
            break;
        case 'cart':
            renderCart();
            break;
        case 'previous-purchases':
            renderPreviousPurchases();
            break;
        case 'dashboard':
            updateProfileDisplay();
            updateProfileStats();
            break;
    }
}

function updateNavigation() {
    const navbar = document.getElementById('navbar');
    if (currentUser) {
        navbar.style.display = 'block';
    } else {
        navbar.style.display = 'none';
    }
}

function goBack() {
    if (currentScreen === 'product-detail') {
        showScreen('product-feed');
    } else {
        showScreen('product-feed');
    }
}

// Authentication
function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    // Simple validation (in real app, this would be server-side)
    if (email && password) {
        currentUser = {
            id: 1,
            name: 'John Doe',
            email: email,
            phone: '+1 (555) 123-4567',
            location: 'San Francisco, CA',
            bio: 'Passionate about sustainable living and eco-friendly products.'
        };
        
        localStorage.setItem('ecofinds_user', JSON.stringify(currentUser));
        showScreen('product-feed');
        updateNavigation();
        showNotification('Welcome back!', 'success');
    } else {
        showNotification('Please fill in all fields', 'error');
    }
}

function handleSignup(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    
    if (name && email && password) {
        currentUser = {
            id: Date.now(),
            name: name,
            email: email,
            phone: '',
            location: '',
            bio: ''
        };
        
        localStorage.setItem('ecofinds_user', JSON.stringify(currentUser));
        showScreen('product-feed');
        updateNavigation();
        showNotification('Account created successfully!', 'success');
    } else {
        showNotification('Please fill in all fields', 'error');
    }
}

function toggleAuthForm() {
    const loginCard = document.querySelector('.login-card');
    const signupCard = document.getElementById('signup-card');
    
    if (loginCard.style.display === 'none') {
        loginCard.style.display = 'block';
        signupCard.style.display = 'none';
    } else {
        loginCard.style.display = 'none';
        signupCard.style.display = 'block';
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('ecofinds_user');
    showScreen('login-screen');
    updateNavigation();
    showNotification('Logged out successfully', 'success');
}

// Product management
function renderProducts(filteredProducts = products) {
    const grid = document.getElementById('products-grid');
    
    if (filteredProducts.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No products found</h3>
                <p>Try adjusting your search or filter criteria</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" onclick="showProductDetail(${product.id})">
            <div class="product-image">
                <img src="${product.image}" alt="${product.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="placeholder-icon" style="display: none;">
                    <i class="fas fa-leaf"></i>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-category">${product.category}</p>
                <p class="product-price">₹${product.price.toLocaleString()}</p>
            </div>
        </div>
    `).join('');
}

function showProductDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const content = document.getElementById('product-detail-content');
    content.innerHTML = `
        <div class="detail-image">
            <img src="${product.image}" alt="${product.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="placeholder-icon" style="display: none;">
                <i class="fas fa-leaf"></i>
            </div>
        </div>
        <div class="detail-info">
            <h1>${product.title}</h1>
            <p class="detail-category">${product.category}</p>
            <p class="detail-price">₹${product.price.toLocaleString()}</p>
            <p class="detail-description">${product.description}</p>
            <div style="margin-top: 30px;">
                <button class="btn btn-primary" onclick="addToCart(${product.id})">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
            </div>
        </div>
    `;
    
    showScreen('product-detail');
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({...product, quantity: 1});
    }
    
    showNotification('Product added to cart!', 'success');
    renderCart();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    renderCart();
    showNotification('Product removed from cart', 'success');
}

function renderCart() {
    const content = document.getElementById('cart-content');
    const footer = document.getElementById('cart-footer');
    
    if (cart.length === 0) {
        content.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Add some sustainable products to get started!</p>
            </div>
        `;
        footer.style.display = 'none';
        return;
    }
    
    content.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="placeholder-icon" style="display: none;">
                    <i class="fas fa-leaf"></i>
                </div>
            </div>
            <div class="cart-item-info">
                <h3 class="cart-item-title">${item.title}</h3>
                <p class="cart-item-price">₹${item.price.toLocaleString()} x ${item.quantity}</p>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cart-total').textContent = total.toLocaleString();
    
    footer.style.display = 'block';
}

// Product creation
function handleAddProduct(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const newProduct = {
        id: Date.now(),
        title: formData.get('title'),
        category: formData.get('category'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        image: '../images/logo.png', // Default to logo for new products
        seller: currentUser.name
    };
    
    products.push(newProduct);
    userProducts.push(newProduct);
    
    e.target.reset();
    showScreen('product-feed');
    showNotification('Product added successfully!', 'success');
}

function renderUserProducts() {
    const grid = document.getElementById('my-products-grid');
    
    if (userProducts.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-plus-circle"></i>
                <h3>No products listed yet</h3>
                <p>Start by adding your first sustainable product!</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = userProducts.map(product => `
        <div class="my-product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="placeholder-icon" style="display: none;">
                    <i class="fas fa-leaf"></i>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-category">${product.category}</p>
                <p class="product-price">₹${product.price.toLocaleString()}</p>
            </div>
            <div class="my-product-actions">
                <button class="btn btn-edit" onclick="editProduct(${product.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-delete" onclick="deleteProduct(${product.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function editProduct(productId) {
    // In a real app, this would open an edit form
    showNotification('Edit functionality coming soon!', 'info');
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== productId);
        userProducts = userProducts.filter(p => p.id !== productId);
        renderUserProducts();
        showNotification('Product deleted successfully', 'success');
    }
}

// Search and filtering
function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    );
    renderProducts(filteredProducts);
}

function filterProducts(category) {
    if (category === 'all') {
        renderProducts(products);
    } else {
        const filteredProducts = products.filter(product => product.category === category);
        renderProducts(filteredProducts);
    }
}

// Profile management
function handleProfileUpdate(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    currentUser.name = formData.get('name');
    currentUser.email = formData.get('email');
    currentUser.phone = formData.get('phone');
    currentUser.location = formData.get('location');
    currentUser.bio = formData.get('bio');
    
    localStorage.setItem('ecofinds_user', JSON.stringify(currentUser));
    
    // Update display elements
    updateProfileDisplay();
    
    // Hide form
    document.getElementById('profile-form').style.display = 'none';
    document.getElementById('toggle-edit-form').style.display = 'block';
    
    showNotification('Profile updated successfully!', 'success');
}

function handleProfileImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profile-img').src = e.target.result;
        };
        reader.readAsDataURL(file);
        showNotification('Profile image updated!', 'success');
    }
}

function updateProfileDisplay() {
    if (currentUser) {
        document.getElementById('profile-display-name').textContent = currentUser.name;
        document.getElementById('profile-display-email').textContent = currentUser.email;
        document.getElementById('profile-display-location').innerHTML = 
            `<i class="fas fa-map-marker-alt"></i> ${currentUser.location}`;
        
        // Update form values
        document.getElementById('profile-name').value = currentUser.name;
        document.getElementById('profile-email').value = currentUser.email;
        document.getElementById('profile-phone').value = currentUser.phone || '';
        document.getElementById('profile-location').value = currentUser.location || '';
        document.getElementById('profile-bio').value = currentUser.bio || '';
    }
}

function updateProfileStats() {
    // Update stats based on user data
    document.getElementById('total-listings').textContent = userProducts.length;
    document.getElementById('total-purchases').textContent = previousPurchases.length;
    
    // Calculate average rating (mock data for now)
    const avgRating = (4.2 + Math.random() * 1.6).toFixed(1);
    document.getElementById('user-rating').textContent = avgRating;
    
    // Member since year
    const memberSince = new Date().getFullYear() - Math.floor(Math.random() * 3);
    document.getElementById('member-since').textContent = memberSince;
}

function toggleEditForm() {
    const form = document.getElementById('profile-form');
    const toggleBtn = document.getElementById('toggle-edit-form');
    
    if (form.style.display === 'none') {
        form.style.display = 'block';
        toggleBtn.style.display = 'none';
    } else {
        form.style.display = 'none';
        toggleBtn.style.display = 'block';
    }
}

function cancelEdit() {
    document.getElementById('profile-form').style.display = 'none';
    document.getElementById('toggle-edit-form').style.display = 'block';
    
    // Reset form to current values
    updateProfileDisplay();
}

// Purchase history
function renderPreviousPurchases() {
    const content = document.getElementById('purchases-content');
    
    if (previousPurchases.length === 0) {
        content.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <h3>No previous purchases</h3>
                <p>Your purchase history will appear here once you make your first order.</p>
            </div>
        `;
        return;
    }
    
    content.innerHTML = previousPurchases.map(purchase => `
        <div class="purchase-item">
            <div class="product-image" style="width: 80px; height: 80px;">
                <img src="${purchase.image}" alt="${purchase.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="placeholder-icon" style="display: none;">
                    <i class="fas fa-leaf"></i>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-title">${purchase.title}</h3>
                <p class="purchase-date">Purchased on ${purchase.date}</p>
                <p class="product-price">₹${purchase.price.toLocaleString()}</p>
            </div>
        </div>
    `).join('');
}

// Checkout functionality
function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    // Simulate purchase
    const purchaseDate = new Date().toLocaleDateString();
    cart.forEach(item => {
        previousPurchases.push({
            ...item,
            date: purchaseDate
        });
    });
    
    cart = [];
    renderCart();
    showNotification('Purchase completed successfully!', 'success');
}

// Utility functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1001;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Add checkout button event listener
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('checkout-btn')) {
        proceedToCheckout();
    }
});
