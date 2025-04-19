const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://studentmart.onrender.com";

// Global variables
let products = [];
let cart = [];
let currentUser = null;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', async function() {
    // Show loading screen
    showLoading(true);
    
    try {
        // Check for existing session
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Verify token and get user data
                const userResponse = await fetch('http://localhost:5000/api/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    currentUser = userData.username;
                    
                    // Load cart data
                    const cartResponse = await fetch('http://localhost:5000/api/cart', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (cartResponse.ok) {
                        cart = await cartResponse.json();
                    }
                }
            } catch (error) {
                console.error('Session load error:', error);
                logout();
            }
        }
        
        // Load products
        const productsResponse = await fetch('http://localhost:5000/api/products');
        if (productsResponse.ok) {
            products = await productsResponse.json();
        }
        
        // Initialize UI
        updateAuthButtons();
        updateCartCount();
        initEventListeners();
        
        // Show home page after everything is loaded
        showPage('home');
    } catch (error) {
        console.error('Initialization error:', error);
        showAlert('Failed to load application data', 'error');
    } finally {
        // Hide loading screen
        setTimeout(() => {
            showLoading(false);
        }, 500);
    }
});

// Show/hide loading indicator
function showLoading(state) {
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = state ? 'flex' : 'none';
    }
    setLoading(state);
}

function setLoading(state) {
    const loader = document.querySelector('.loading-indicator');
    if (loader) {
        loader.classList.toggle('hidden', !state);
    }
}

// Show page function
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    
    const pageElement = document.getElementById(pageId);
    if (pageElement) {
        pageElement.classList.remove('hidden');
    }
    
    // Update active nav link
    if (pageId !== 'login' && pageId !== 'register') {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('onclick')?.includes(pageId)) {
                link.classList.add('active');
            }
        });
    }
    
    // Execute page-specific functions
    switch(pageId) {
        case 'home':
            renderFeaturedProducts();
            break;
        case 'buy':
            renderProducts();
            break;
        case 'cart':
            renderCart();
            break;
        case 'profile':
            loadProfile();
            break;
    }
}

// Authentication functions
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showAlert('Please enter both username and password', 'error');
        return;
    }
    
    try {
        showLoading(true);
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = username;
            localStorage.setItem('token', data.token);
            showAlert('Login successful!', 'success');
            
            // Reload data after login
            const cartResponse = await fetch('http://localhost:5000/api/cart', {
                headers: {
                    'Authorization': `Bearer ${data.token}`
                }
            });
            
            if (cartResponse.ok) {
                cart = await cartResponse.json();
            }
            
            updateCartCount();
            updateAuthButtons();
            showPage('home');
        } else {
            showAlert(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        showAlert('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

async function register() {
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    if (!username || !email || !password || !confirmPassword) {
        showAlert('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('Passwords do not match', 'error');
        return;
    }
    
    try {
        showLoading(true);
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert('Registration successful! Please login.', 'success');
            showPage('login');
        } else {
            showAlert(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        showAlert('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

function logout() {
    localStorage.removeItem('token');
    currentUser = null;
    cart = [];
    updateAuthButtons();
    updateCartCount();
    showAlert('Logged out successfully', 'success');
    showPage('home');
}

// Product functions
async function addProduct() {
    if (!currentUser) {
        showAlert('Please login to add products', 'error');
        showPage('login');
        return;
    }
    
    const name = document.getElementById('itemName').value;
    const price = parseFloat(document.getElementById('itemPrice').value);
    const contact = document.getElementById('itemContact').value;
    const about = document.getElementById('itemAbout').value;
    const category = document.getElementById('itemCategory').value;
    const imageInput = document.getElementById('itemImage');
    
    if (!name || !price || !contact || !about || !category || !imageInput.files || imageInput.files.length === 0) {
        showAlert('Please fill in all fields', 'error');
        return;
    }
    
    try {
        showLoading(true);
        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('contact', contact);
        formData.append('about', about);
        formData.append('category', category);
        
        for (let i = 0; i < imageInput.files.length; i++) {
            formData.append('images', imageInput.files[i]);
        }
        
        const response = await fetch('http://localhost:5000/api/products', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });
        
        if (response.ok) {
            const newProduct = await response.json();
            products.push(newProduct);
            
            // Reset form
            document.getElementById('itemName').value = '';
            document.getElementById('itemPrice').value = '';
            document.getElementById('itemContact').value = '';
            document.getElementById('itemAbout').value = '';
            document.getElementById('itemCategory').value = '';
            document.getElementById('itemImage').value = '';
            document.getElementById('imagePreview').innerHTML = '';
            
            showAlert('Product added successfully!', 'success');
            showPage('buy');
        } else {
            const error = await response.json();
            showAlert(error.message || 'Failed to add product', 'error');
        }
    } catch (error) {
        showAlert('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        showLoading(true);
        const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            products = products.filter(product => product._id !== productId);
            cart = cart.filter(item => item.product._id !== productId);
            showAlert('Product deleted successfully', 'success');
            showPage('buy');
        } else {
            const error = await response.json();
            showAlert(error.message || 'Failed to delete product', 'error');
        }
    } catch (error) {
        showAlert('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Cart functions
async function addToCart(productId, quantity = 1) {
    if (!currentUser) {
        showAlert('Please login to add items to cart', 'error');
        showPage('login');
        return;
    }
    
    try {
        showLoading(true);
        const response = await fetch('http://localhost:5000/api/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ productId, quantity })
        });
        
        if (response.ok) {
            const updatedCart = await response.json();
            cart = updatedCart;
            updateCartCount();
            showAlert('Product added to cart!', 'success');
        } else {
            const error = await response.json();
            showAlert(error.message || 'Failed to add to cart', 'error');
        }
    } catch (error) {
        showAlert('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

async function removeFromCart(index) {
    try {
        showLoading(true);
        const productId = cart[index].product._id;
        const response = await fetch(`http://localhost:5000/api/cart/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            cart.splice(index, 1);
            renderCart();
        } else {
            const error = await response.json();
            showAlert(error.message || 'Failed to remove from cart', 'error');
        }
    } catch (error) {
        showAlert('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

async function updateCartItemQuantity(index, change) {
    const newQuantity = cart[index].quantity + change;
    
    if (newQuantity < 1) {
        removeFromCart(index);
    } else {
        try {
            showLoading(true);
            const productId = cart[index].product._id;
            const response = await fetch(`http://localhost:5000/api/cart/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ quantity: newQuantity })
            });
            
            if (response.ok) {
                const updatedCart = await response.json();
                cart = updatedCart;
                renderCart();
            } else {
                const error = await response.json();
                showAlert(error.message || 'Failed to update quantity', 'error');
            }
        } catch (error) {
            showAlert('Network error. Please try again.', 'error');
        } finally {
            showLoading(false);
        }
    }
}

// Profile functions
async function loadProfile() {
    if (!currentUser) return;
    
    try {
        showLoading(true);
        const response = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            const user = await response.json();
            
            // Update profile form
            document.getElementById('profileUsername').textContent = user.username;
            document.getElementById('profileEmail').textContent = user.email || 'No email set';
            document.getElementById('profileName').value = user.fullName || '';
            document.getElementById('profilePhone').value = user.phone || '';
            document.getElementById('profileCampus').value = user.campus || '';
            document.getElementById('profileHostel').value = user.hostel || '';
            document.getElementById('profileAddress').value = user.address || '';
            
            if (user.profileImage) {
                document.querySelector('.profile-picture img').src = user.profileImage;
            }
        }
    } catch (error) {
        showAlert('Failed to load profile', 'error');
    } finally {
        showLoading(false);
    }
}

async function updateProfile() {
    if (!currentUser) return;
    
    try {
        showLoading(true);
        const response = await fetch('http://localhost:5000/api/auth/me', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                fullName: document.getElementById('profileName').value,
                phone: document.getElementById('profilePhone').value,
                campus: document.getElementById('profileCampus').value,
                hostel: document.getElementById('profileHostel').value,
                address: document.getElementById('profileAddress').value
            })
        });
        
        if (response.ok) {
            showAlert('Profile updated successfully!', 'success');
        } else {
            const error = await response.json();
            showAlert(error.message || 'Failed to update profile', 'error');
        }
    } catch (error) {
        showAlert('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Rendering functions
function renderFeaturedProducts() {
    const featuredContainer = document.querySelector('.featured-products');
    if (!featuredContainer) return;
    
    // Get 4 random products
    const featured = [...products].sort(() => 0.5 - Math.random()).slice(0, 4);
    
    featuredContainer.innerHTML = featured.map(product => `
        <div class="product-card" onclick="showProductDetails('${product._id}')">
            <div class="product-image">
                <img src="${product.images?.[0] || 'https://via.placeholder.com/150'}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-price">₹${product.price}</p>
                <button class="btn-add-to-cart" onclick="event.stopPropagation(); addToCart('${product._id}')">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

function renderProducts(filter = 'all', searchTerm = '') {
    const productList = document.querySelector('.product-list');
    if (!productList) return;
    
    let filteredProducts = [...products];
    
    // Apply category filter
    if (filter !== 'all') {
        filteredProducts = filteredProducts.filter(product => product.category === filter);
    }
    
    // Apply search filter
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(term) || 
            product.about.toLowerCase().includes(term)
        );
    }
    
    productList.innerHTML = filteredProducts.map(product => `
        <div class="product-item">
            <div class="product-image">
                <img src="${product.images?.[0] || 'https://via.placeholder.com/150'}" alt="${product.name}">
            </div>
            <div class="product-details">
                <h3>${product.name}</h3>
                <p class="product-price">₹${product.price}</p>
                <p class="product-category">${product.category}</p>
                <button class="btn-view-details" onclick="showProductDetails('${product._id}')">
                    View Details
                </button>
                <button class="btn-add-to-cart" onclick="addToCart('${product._id}')">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

function renderCart() {
    const cartList = document.querySelector('.cart-list');
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');
    
    if (!cartList || !subtotalEl || !totalEl) return;
    
    if (cart.length === 0) {
        cartList.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        subtotalEl.textContent = '₹0';
        totalEl.textContent = '₹0';
        return;
    }
    
    cartList.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.product.images?.[0] || 'https://via.placeholder.com/150'}" alt="${item.product.name}">
            </div>
            <div class="cart-item-details">
                <h4>${item.product.name}</h4>
                <p class="cart-item-price">₹${item.product.price}</p>
                <div class="cart-item-quantity">
                    <button onclick="updateCartItemQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateCartItemQuantity(${index}, 1)">+</button>
                </div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${index})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    subtotalEl.textContent = `₹${subtotal}`;
    totalEl.textContent = `₹${subtotal}`;
}

function showProductDetails(productId) {
    const product = products.find(p => p._id === productId);
    if (!product) return;
    
    const detailsPage = document.getElementById('productDetails');
    if (!detailsPage) return;
    
    detailsPage.innerHTML = `
        <div class="product-details-container">
            <button class="btn-back" onclick="showPage('buy')">
                <i class="fas fa-arrow-left"></i> Back to Marketplace
            </button>
            
            <div class="product-details-content">
                <div class="product-images">
                    <div class="main-image">
                        <img src="${product.images?.[0] || 'https://via.placeholder.com/400'}" alt="${product.name}">
                    </div>
                    <div class="thumbnail-container">
                        ${product.images?.map((img, i) => `
                            <img src="${img}" alt="Thumbnail ${i+1}" onclick="changeMainImage(this.src)">
                        `).join('') || ''}
                    </div>
                </div>
                
                <div class="product-info">
                    <h2>${product.name}</h2>
                    <p class="product-price">₹${product.price}</p>
                    <p class="product-category">${product.category}</p>
                    
                    <div class="quantity-selector">
                        <label>Quantity:</label>
                        <input type="number" class="quantity-input" value="1" min="1">
                    </div>
                    
                    <button class="btn-add-to-cart" onclick="addToCart('${product._id}', parseInt(document.querySelector('.quantity-input').value))">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                    
                    <div class="product-description">
                        <h3>Description</h3>
                        <p>${product.about}</p>
                    </div>
                    
                    <div class="product-contact">
                        <h3>Contact Seller</h3>
                        <p><i class="fas fa-phone"></i> ${product.contact}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    showPage('productDetails');
}

function changeMainImage(src) {
    const mainImage = document.querySelector('.main-image img');
    if (mainImage) {
        mainImage.src = src;
    }
}

function filterProducts(category = null) {
    const categoryFilter = document.getElementById('categoryFilter');
    const searchInput = document.getElementById('searchInput');
    
    const filterValue = category || (categoryFilter ? categoryFilter.value : 'all');
    const searchValue = searchInput ? searchInput.value : '';
    
    renderProducts(filterValue, searchValue);
}

function sortProducts() {
    const sortBy = document.getElementById('sortBy').value;
    
    switch(sortBy) {
        case 'price-low':
            products.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            products.sort((a, b) => b.price - a.price);
            break;
        case 'newest':
        default:
            products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
    }
    
    renderProducts();
}

// Initialize event listeners
function initEventListeners() {
    // Image preview for add product form
    const imageInput = document.getElementById('itemImage');
    if (imageInput) {
        imageInput.addEventListener('change', function() {
            const preview = document.getElementById('imagePreview');
            preview.innerHTML = '';
            
            if (this.files) {
                Array.from(this.files).forEach(file => {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const previewImage = document.createElement('div');
                        previewImage.className = 'preview-image';
                        previewImage.innerHTML = `
                            <img src="${e.target.result}" alt="Preview">
                            <span class="remove-image" onclick="removePreviewImage(this)">&times;</span>
                        `;
                        preview.appendChild(previewImage);
                    }
                    reader.readAsDataURL(file);
                });
            }
        });
    }
    
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            const navLinks = document.querySelector('.nav-links');
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        });
    }
}

function removePreviewImage(element) {
    element.parentElement.remove();
}

// Update authentication buttons
function updateAuthButtons() {
    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons) return;
    
    if (currentUser) {
        authButtons.innerHTML = `
            <div class="user-dropdown">
                <div class="user-profile" onclick="toggleDropdown()">
                    <i class="fas fa-user-circle"></i>
                    <span class="username">${currentUser}</span>
                    <i class="fas fa-caret-down"></i>
                </div>
                <div class="dropdown-menu hidden">
                    <a href="#" onclick="showPage('profile')"><i class="fas fa-user"></i> Profile</a>
                    <a href="#" onclick="showPage('settings')"><i class="fas fa-cog"></i> Settings</a>
                    <a href="#" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</a>
                </div>
            </div>
        `;
    } else {
        authButtons.innerHTML = `
            <button class="btn-login" onclick="showPage('login')">Login</button>
            <button class="btn-signup" onclick="showPage('register')">Sign Up</button>
        `;
    }
}

// Toggle dropdown menu
function toggleDropdown() {
    const dropdown = document.querySelector('.dropdown-menu');
    dropdown.classList.toggle('hidden');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.querySelector('.dropdown-menu');
    const userProfile = document.querySelector('.user-profile');
    
    if (userProfile && !userProfile.contains(event.target)) {
        dropdown.classList.add('hidden');
    }
});

// Show alert
function showAlert(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `toast-alert ${type}`;
    alert.textContent = message;

    document.body.appendChild(alert);

    // Trigger animation
    setTimeout(() => alert.classList.add('show'), 10);

    // Auto-remove after 4s
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 500);
    }, 4000);
}

// Update cart count in navbar
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
    });
}

// Checkout function
function checkout() {
    if (cart.length === 0) {
        showAlert('Your cart is empty', 'error');
        return;
    }
    
    if (!currentUser) {
        showAlert('Please login to checkout', 'error');
        showPage('login');
        return;
    }
    
    showAlert('Checkout functionality will be implemented soon!', 'info');
}

// Handle Google login
function handleGoogleLogin(response) {
    console.log('Google login response:', response);
    // Implement Google login logic here
}