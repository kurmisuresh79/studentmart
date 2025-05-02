const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

console.log("API Base URL:", API_BASE);

// Global variables
let products = [];
let cart = [];
let currentUser = null;

// Helper function for API calls with loading
async function apiCallWithLoading({ url, method = 'GET', headers = {}, body = null, successCallback, errorCallback }) {
    showLoading(true);
    try {
        const response = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null,
        });
        const data = await response.json();

        if (response.ok) {
            successCallback(data);
        } else {
            errorCallback(data.message || 'Request failed');
        }
    } catch (error) {
        console.error('API call error:', error);
        showAlert('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

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
                const userResponse = await fetch(`${API_BASE}/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    currentUser = userData.username;

                    // Load cart data
                    const cartResponse = await fetch(`${API_BASE}/cart`, {
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
        const productsResponse = await fetch(`${API_BASE}/products`);
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
            if (link.id === `nav-link-${pageId}`) {
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
        case 'settings':
            loadSettings();
            break;
        case 'faqs':
             loadFaqs();
            break;
        case 'safety':
             loadSafety();
             break;
        case 'contact':
             loadContact();
            break;
        case 'privacy':
             loadPrivacy();
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

    apiCallWithLoading({
        url: `${API_BASE}/auth/login`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { username, password },
        successCallback: async (data) => {
            currentUser = username;
            localStorage.setItem('token', data.token);
            showAlert('Login successful!', 'success');

            const cartResponse = await fetch(`${API_BASE}/cart`, {
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
        },
        errorCallback: (errorMessage) => {
            showAlert(errorMessage || 'Login failed', 'error');
        }
    });
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

    apiCallWithLoading({
        url: `${API_BASE}/auth/register`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { username, email, password },
        successCallback: (data) => {
            showAlert('Registration successful! Please login.', 'success');
            showPage('login');
        },
        errorCallback: (errorMessage) => {
            showAlert(errorMessage || 'Registration failed', 'error');
        }
    });
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

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('contact', contact);
    formData.append('about', about);
    formData.append('category', category);
    for (let i = 0; i < imageInput.files.length; i++) {
        formData.append('images', imageInput.files[i]);
    }

    apiCallWithLoading({
        url: `${API_BASE}/products`,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
        successCallback: (newProduct) => {
            products.push(newProduct);
            document.getElementById('itemName').value = '';
            document.getElementById('itemPrice').value = '';
            document.getElementById('itemContact').value = '';
            document.getElementById('itemAbout').value = '';
            document.getElementById('itemCategory').value = '';
            document.getElementById('itemImage').value = '';
            document.getElementById('imagePreview').innerHTML = '';
            showAlert('Product added successfully!', 'success');
            showPage('buy');
        },
        errorCallback: (errorMessage) => {
            showAlert(errorMessage || 'Failed to add product', 'error');
        }
    });
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    apiCallWithLoading({
        url: `${API_BASE}/products/${productId}`,
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        successCallback: () => {
            products = products.filter(product => product._id !== productId);
            cart = cart.filter(item => item.product._id !== productId);
            showAlert('Product deleted successfully', 'success');
            showPage('buy');
        },
        errorCallback: (errorMessage) => {
            showAlert(errorMessage || 'Failed to delete product', 'error');
        }
    });
}

// Cart functions
async function addToCart(productId, quantity = 1) {
    if (!currentUser) {
        showAlert('Please login to add items to cart', 'error');
        showPage('login');
        return;
    }

    apiCallWithLoading({
        url: `${API_BASE}/cart`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: { productId, quantity },
        successCallback: (updatedCart) => {
            cart = updatedCart;
            updateCartCount();
            showAlert('Product added to cart!', 'success');
        },
        errorCallback: (errorMessage) => {
            showAlert(errorMessage || 'Failed to add to cart', 'error');
        }
    });
}

async function removeFromCart(index) {
    const productId = cart[index].product._id;
    apiCallWithLoading({
        url: `${API_BASE}/cart/${productId}`,
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        successCallback: () => {
            cart.splice(index, 1);
            renderCart();
        },
        errorCallback: (errorMessage) => {
            showAlert(errorMessage || 'Failed to remove from cart', 'error');
        }
    });
}

async function updateCartItemQuantity(index, change) {
    const newQuantity = cart[index].quantity + change;

    if (newQuantity < 1) {
        removeFromCart(index);
    } else {
        const productId = cart[index].product._id;
        apiCallWithLoading({
            url: `${API_BASE}/cart/${productId}`,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: { quantity: newQuantity },
            successCallback: (updatedCart) => {
                cart = updatedCart;
                renderCart();
            },
            errorCallback: (errorMessage) => {
                showAlert(errorMessage || 'Failed to update quantity', 'error');
            }
        });
    }
}

// Profile functions
async function loadProfile() {
    if (!currentUser) return;

    apiCallWithLoading({
        url: `${API_BASE}/auth/me`,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        successCallback: (user) => {
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
        },
        errorCallback: () => {
            showAlert('Failed to load profile', 'error');
        }
    });
}

async function updateProfile() {
    if (!currentUser) return;

    apiCallWithLoading({
        url: `${API_BASE}/auth/me`,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: {
            fullName: document.getElementById('profileName').value,
            phone: document.getElementById('profilePhone').value,
            campus: document.getElementById('profileCampus').value,
            hostel: document.getElementById('profileHostel').value,
            address: document.getElementById('profileAddress').value
        },
        successCallback: () => {
            showAlert('Profile updated successfully!', 'success');
        },
        errorCallback: (errorMessage) => {
            showAlert(errorMessage || 'Failed to update profile', 'error');
        }
    });
}
//Setting page
function loadSettings() {
    showPage('settings');
}
//faqs
function loadFaqs() {
    showPage('faqs');
}
//safety
function loadSafety() {
     showPage('safety');
}
//contact
function loadContact() {
     showPage('contact');
}
//privacy
function loadPrivacy() {
     showPage('privacy');
}

// Rendering functions
function renderFeaturedProducts() {
    const featuredContainer = document.querySelector('.featured-products');
    if (!featuredContainer) return;

    // Get 4 random products
    const featured = [...products].sort(() => 0.5 - Math.random()).slice(0, 4);

    featuredContainer.innerHTML = featured.map(product => `
        <div class="product-card" id="product-card-${product._id}">
            <div class="product-image">
                <img src="${product.images?.[0] || 'https://via.placeholder.com/150'}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-price">₹${product.price}</p>
                <button class="btn-add-to-cart" id="add-to-cart-${product._id}">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        </div>
    `).join('');

      // add event listener to the new button
    featured.forEach(product => {
        document.getElementById(`add-to-cart-${product._id}`).addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent the event from bubbling up to the product card
            addToCart(product._id);
        });
        document.getElementById(`product-card-${product._id}`).addEventListener('click', function(){
             showProductDetails(product._id);
        });
    });
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
                <button class="btn-view-details" id="view-details-${product._id}">
                    View Details
                </button>
                <button class="btn-add-to-cart" id="add-to-cart-buy-${product._id}">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        </div>
    `).join('');

      // add event listener to the new button
    filteredProducts.forEach(product => {
        document.getElementById(`add-to-cart-buy-${product._id}`).addEventListener('click', function() {
            addToCart(product._id);
        });
        document.getElementById(`view-details-${product._id}`).addEventListener('click', function(){
             showProductDetails(product._id);
        });
    });
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
                    <button id="remove-cart-${index}">-</button>
                    <span>${item.quantity}</span>
                    <button id="add-cart-${index}">+</button>
                </div>
            </div>
            <button class="cart-item-remove" id="remove-item-${index}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');

       // add event listener to the new button
    cart.forEach((item, index) => {
        document.getElementById(`add-cart-${index}`).addEventListener('click', function() {
           updateCartItemQuantity(index, 1);
        });
        document.getElementById(`remove-cart-${index}`).addEventListener('click', function() {
           updateCartItemQuantity(index, -1);
        });
        document.getElementById(`remove-item-${index}`).addEventListener('click', function(){
             removeFromCart(index);
        });
    });

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
            <button class="btn-back" id="product-details-back">
                <i class="fas fa-arrow-left"></i> Back to Marketplace
            </button>

            <div class="product-details-content">
                <div class="product-images">
                    <div class="main-image">
                        <img src="${product.images?.[0] || 'https://via.placeholder.com/400'}" alt="${product.name}">
                    </div>
                    <div class="thumbnail-container">
                        ${product.images?.map((img, i) => `
                            <img src="${img}" alt="Thumbnail ${i+1}" class="thumbnail">
                        `).join('')}
                    </div>
                </div>
                <div class="product-info">
                    <h2>${product.name}</h2>
                    <p class="product-price">₹${product.price}</p>
                    <p class="product-category">Category: ${product.category}</p>
                    <p class="product-about">About: ${product.about}</p>
                    <p class="product-contact">Contact: ${product.contact}</p>
                   <div class="product-actions">
                       <button class="btn-add-to-cart" id="add-to-cart-details">
                           <i class="fas fa-cart-plus"></i> Add to Cart
                       </button>
                       </div>
                </div>
            </div>
        </div>
    `;
 // Add event listener to the new back button
    document.getElementById('product-details-back').addEventListener('click', function() {
        showPage('buy');
    });
    document.getElementById(`add-to-cart-details`).addEventListener('click', function(){
             addToCart(product._id);
        });
    showPage('productDetails');
}

function showPage(pageId) {
  // Hide all pages
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => page.style.display = 'none');
  
  // Show the selected page
  const selectedPage = document.getElementById(pageId);
  if (selectedPage) {
    selectedPage.style.display = 'block';
  }
} 

// Helper functions
function updateAuthButtons() {
    const authButtonsContainer = document.querySelector('.auth-buttons');
    if (!authButtonsContainer) return;

    authButtonsContainer.innerHTML = currentUser ? `
        <button class="btn-logout" id="logout-button">Logout</button>
    ` : `
        <button class="btn-login" id="login-button">Login</button>
        <button class="btn-signup" id="signup-button">Sign Up</button>
    `;

    if(currentUser){
        document.getElementById('logout-button').addEventListener('click', logout);
    } else{
        document.getElementById('login-button').addEventListener('click', function() {
        showPage('login');
        });
        document.getElementById('signup-button').addEventListener('click', function() {
        showPage('register');
        });
    }

}

function updateCartCount() {
    const cartCountElement = document.querySelector('.cart-count');
    if (!cartCountElement) return;
    cartCountElement.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

function showAlert(message, type) {
    console.log(`${type}: ${message}`);
    //alert(`${type}: ${message}`);
}

function initEventListeners() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const cartCheckoutButton = document.getElementById('cart-checkout');
    const cartContinueButton = document.getElementById('cart-continue');
    const homeAddButton = document.getElementById('home-add');
    const buyAddButton = document.getElementById('buy-add');
    const homeBuyButton = document.getElementById('home-buy');
    const addProductButton = document.getElementById('add-product-button');
    const cancelAddButton = document.getElementById('cancel-add-button');
    const registerButton = document.getElementById('register-button');
    const homeButton = document.getElementById('home-button');
    const loginButton = document.getElementById('login-button');
    const updateProfileButton = document.getElementById('update-profile-button');
    const navLinkHome = document.getElementById('nav-link-home');
    const navLinkBuy = document.getElementById('nav-link-buy');
    const navLinkAdd = document.getElementById('nav-link-add');
    const navLinkCart = document.getElementById('nav-link-cart');
    const profileItem=document.getElementById('home-profile');
    const settingItem=document.getElementById('setting-profile');
    const faqsItem=document.getElementById('home-faqs');
    const safetyItem=document.getElementById('home-safety');
    const contactItem=document.getElementById('home-contact');
    const privacyItem=document.getElementById('home-privacy');

    if (mobileMenuBtn && navLinks) {
         mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
    if (cartCheckoutButton) {
       cartCheckoutButton.addEventListener('click', () => {
        showAlert('Checkout functionality will be implemented soon!', 'info');
    });
    }
     if (cartContinueButton) {
       cartContinueButton.addEventListener('click', () => {
             showPage('buy');
       });
    }
    if (homeAddButton) {
       homeAddButton.addEventListener('click', () => {
             showPage('add');
       });
    }
    if (buyAddButton) {
       buyAddButton.addEventListener('click', () => {
            showPage('buy');
       });
    }
     if (homeBuyButton) {
       homeBuyButton.addEventListener('click', () => {
            showPage('home');
       });
    }
    if (addProductButton) {
        addProductButton.addEventListener('click', addProduct);
    }
    if (cancelAddButton) {
        cancelAddButton.addEventListener('click', () => showPage('home'));
    }
    if (registerButton) {
        registerButton.addEventListener('click', register);
    }
    if (homeButton) {
         homeButton.addEventListener('click', () => showPage('home'));
    }
    if(loginButton){
         loginButton.addEventListener('click', login);
    }
     if (updateProfileButton) {
         updateProfileButton.addEventListener('click', updateProfile);
    }
    if (navLinkHome) {
       navLinkHome.addEventListener('click', () => showPage('home'));
    }
    if (navLinkBuy) {
        navLinkBuy.addEventListener('click', () => showPage('buy'));
    }
    if (navLinkAdd) {
        navLinkAdd.addEventListener('click', () => showPage('add'));
    }
    if (navLinkCart) {
        navLinkCart.addEventListener('click', () => showPage('cart'));
    }
    if(profileItem){
         profileItem.addEventListener('click', () => showPage('profile'));
    }
    if(settingItem){
          settingItem.addEventListener('click', () => showPage('settings'));
    }
    if(faqsItem){
          faqsItem.addEventListener('click', () => showPage('faqs'));
    }
    if(safetyItem){
          safetyItem.addEventListener('click', () => showPage('safety'));
    }
    if(contactItem){
         contactItem.addEventListener('click', () => showPage('contact'));
    }
    if(privacyItem){
          privacyItem.addEventListener('click', () => showPage('privacy'));
    }
}
