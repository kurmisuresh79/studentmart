// index.js
// Global variables
let products = [];
let cart = [];
let users = [];
let currentUser = null;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Hide loading screen after 1.5 seconds
    setTimeout(() => {
        const loadingScreen = document.querySelector('.loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }, 1500);
    // Load data from localStorage
    loadData();

    // Initialize the page
    showPage(currentUser ? 'home' : 'home');
    updateCartCount();
    renderFeaturedProducts();
    updateAuthButtons();

    // Initialize event listeners
    initEventListeners();
});

// Rest of your existing JavaScript code remains the same...

// Show page function
// function showPage(pageId) {
//     document.querySelectorAll('.page').forEach(page => {
//         page.classList.add('hidden');
//     });
    
//     document.getElementById(pageId).classList.remove('hidden');
    
//     // Update active nav link
//     if (pageId !== 'login' && pageId !== 'register') {
//         document.querySelectorAll('.nav-link').forEach(link => {
//             link.classList.remove('active');
//             if (link.getAttribute('onclick')?.includes(pageId)) {
//                 link.classList.add('active');
//             }
//         });
//     }
    
//     // Execute page-specific functions
//     switch(pageId) {
//         case 'home':
//             renderFeaturedProducts();
//             break;
//         case 'buy':
//             renderProducts();
//             break;
//         case 'cart':
//             renderCart();
//             break;
//     }
    
//     // Close mobile menu if open
//     if (window.innerWidth <= 768) {
//         const navLinks = document.querySelector('.nav-links');
//         navLinks.style.display = 'none';
//     }
// }

// Load profile data
function loadProfile() {
    if (!currentUser) return;
    
    const user = users.find(u => u.username === currentUser);
    if (!user) return;
    
    // Load user data
    document.getElementById('profileUsername').textContent = user.username;
    document.getElementById('profileEmail').textContent = user.email || 'No email set';
    document.getElementById('profileName').value = user.fullName || '';
    document.getElementById('profilePhone').value = user.phone || '';
    document.getElementById('profileCampus').value = user.campus || '';
    document.getElementById('profileHostel').value = user.hostel || '';
    document.getElementById('profileAddress').value = user.address || '';
    
    // Load profile picture if exists
    if (user.profileImage) {
        document.querySelector('.profile-picture img').src = user.profileImage;
    }
}

// Update profile
function updateProfile() {
    if (!currentUser) return;
    
    const userIndex = users.findIndex(u => u.username === currentUser);
    if (userIndex === -1) return;
    
    // Update user data
    users[userIndex] = {
        ...users[userIndex],
        fullName: document.getElementById('profileName').value,
        phone: document.getElementById('profilePhone').value,
        campus: document.getElementById('profileCampus').value,
        hostel: document.getElementById('profileHostel').value,
        address: document.getElementById('profileAddress').value
    };
    
    saveData();
    showAlert('Profile updated successfully!', 'success');
}

// Handle profile image upload
document.getElementById('profileImageUpload').addEventListener('change', function() {
    if (!currentUser) return;
    
    const file = this.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const userIndex = users.findIndex(u => u.username === currentUser);
        if (userIndex === -1) return;
        
        users[userIndex].profileImage = e.target.result;
        saveData();
        document.querySelector('.profile-picture img').src = e.target.result;
        showAlert('Profile picture updated!', 'success');
    };
    reader.readAsDataURL(file);
});

// Settings functions
function showPasswordForm() {
    document.querySelector('.password-form').classList.remove('hidden');
}

function hidePasswordForm() {
    document.querySelector('.password-form').classList.add('hidden');
}

function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        showAlert('Please fill in all password fields', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showAlert('New passwords do not match', 'error');
        return;
    }
    
    const userIndex = users.findIndex(u => u.username === currentUser);
    if (userIndex === -1) return;
    
    if (users[userIndex].password !== currentPassword) {
        showAlert('Current password is incorrect', 'error');
        return;
    }
    
    users[userIndex].password = newPassword;
    saveData();
    
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    
    hidePasswordForm();
    showAlert('Password changed successfully!', 'success');
}

function confirmDeleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        deleteAccount();
    }
}

function deleteAccount() {
    if (!currentUser) return;
    
    // Remove user from users array
    users = users.filter(u => u.username !== currentUser);
    
    // Remove user's products
    products = products.filter(p => p.owner !== currentUser);
    
    // Remove user's items from cart
    cart = cart.filter(item => item.product.owner !== currentUser);
    
    saveData();
    currentUser = null;
    localStorage.removeItem('currentUser');
    
    showPage('home');
    updateAuthButtons();
    showAlert('Your account has been deleted', 'success');
}

// Update showPage function to load profile when needed
function showPage(pageId) {
    // ... your existing showPage code ...
    
    switch(pageId) {
        // ... your existing cases ...
        case 'profile':
            loadProfile();
            break;
        case 'settings':
            // Load settings if needed
            break;
    }
}



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

// Update auth buttons based on login state
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

// Logout function
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showPage('home');
    updateAuthButtons();
    showAlert('Logged out successfully', 'success');
}






// Update auth buttons function
// function updateAuthButtons() {
//     const authButtonsContainer = document.getElementById('authButtonsContainer');
//     if (!authButtonsContainer) return;
    
//     if (currentUser) {
//         authButtonsContainer.innerHTML = `
//             <div class="user-dropdown">
//                 <div class="user-profile" onclick="toggleDropdown()">
//                     <i class="fas fa-user-circle"></i>
//                     <span class="username">${currentUser}</span>
//                     <i class="fas fa-caret-down"></i>
//                 </div>
//                 <div class="dropdown-menu hidden">
//                     <a href="#" onclick="showPage('profile')"><i class="fas fa-user"></i> Profile</a>
//                     <a href="#" onclick="showPage('settings')"><i class="fas fa-cog"></i> Settings</a>
//                     <a href="#" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</a>
//                 </div>
//             </div>
//         `;
//     } else {
//         authButtonsContainer.innerHTML = `
//             <button class="btn-login" onclick="showPage('login')">Login</button>
//             <button class="btn-signup" onclick="showPage('register')">Sign Up</button>
//         `;
//     }
// }









// DOM Content Loaded
// document.addEventListener('DOMContentLoaded', function() {
//     // Hide loading screen after 1.5 seconds
//     setTimeout(() => {
//         document.querySelector('.loading-screen').style.opacity = '0';
//         setTimeout(() => {
//             document.querySelector('.loading-screen').style.display = 'none';
//         }, 500);
//     }, 1500);

//     // Load data from localStorage
//     loadData();

//     // Initialize the page
//     if (currentUser) {
//         showPage('home');
//         updateCartCount();
//         renderFeaturedProducts();
//         updateAuthButtons();
//     } else {
//         showPage('home');
//         updateAuthButtons();
//     }

//     // Initialize event listeners
//     initEventListeners();
// });

// DOM Content Loaded
// document.addEventListener('DOMContentLoaded', function() {
//     // Hide loading screen after 1.5 seconds
//     setTimeout(() => {
//         document.querySelector('.loading-screen').style.opacity = '0';
//         setTimeout(() => {
//             document.querySelector('.loading-screen').style.display = 'none';
//         }, 500);
//     }, 1500);

//     // Load data from localStorage
//     loadData();

//     // Initialize the page
//     showPage(currentUser ? 'home' : 'home'); // Always start with home page
//     updateCartCount();
//     renderFeaturedProducts();
//     updateAuthButtons();

//     // Initialize event listeners
//     initEventListeners();
// });

// Load data from localStorage
function loadData() {
    products = JSON.parse(localStorage.getItem('products')) || [];
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    users = JSON.parse(localStorage.getItem('users')) || [];
    currentUser = localStorage.getItem('currentUser');
    
    // Add some sample products if empty
    if (products.length === 0) {
        products = [
            {
                id: '1',
                name: 'Calculus Textbook',
                price: 1200,
                contact: '+919876543210',
                about: 'Excellent condition, barely used. Latest edition with all chapters.',
                category: 'textbooks',
                images: ['https://m.media-amazon.com/images/I/81vxw4+UZUL._AC_UF1000,1000_QL80_.jpg'],
                owner: 'john_doe',
                date: new Date().toISOString(),
                rating: 4,
                reviews: 12
            },
            {
                id: '2',
                name: 'MacBook Pro 2020',
                price: 65000,
                contact: '+919876543211',
                about: 'M1 Chip, 16GB RAM, 512GB SSD. In perfect condition with original box.',
                category: 'electronics',
                images: ['https://www.apple.com/v/macbook-pro-14-and-16/b/images/overview/hero/hero_intro_endframe__e6khcva4hkeq_large.jpg'],
                owner: 'jane_smith',
                date: new Date().toISOString(),
                rating: 5,
                reviews: 8
            }
        ];
        localStorage.setItem('products', JSON.stringify(products));
    }
    
    // Add a default user if none exists
    if (users.length === 0) {
        users.push({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        });
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('users', JSON.stringify(users));
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

// Update authentication buttons
// function updateAuthButtons() {
//     const authButtons = document.querySelector('.auth-buttons');
//     if (!authButtons) return;
    
//     if (currentUser) {
//         authButtons.innerHTML = `
//             <span class="welcome-user">Welcome, ${currentUser}</span>
//             <button class="btn-logout" onclick="logout()">
//                 <i class="fas fa-sign-out-alt"></i> Logout
//             </button>
//         `;
//     } else {
//         authButtons.innerHTML = `
//             <button class="btn-login" onclick="showPage('login')">Login</button>
//             <button class="btn-signup" onclick="showPage('register')">Sign Up</button>
//         `;
//     }
// }

// // Show page function
// function showPage(pageId) {
//     document.querySelectorAll('.page').forEach(page => {
//         page.classList.add('hidden');
//     });
    
//     document.getElementById(pageId).classList.remove('hidden');
    
//     // Update active nav link
//     if (pageId !== 'login' && pageId !== 'register') {
//         document.querySelectorAll('.nav-link').forEach(link => {
//             link.classList.remove('active');
//             if (link.getAttribute('onclick')?.includes(pageId)) {
//                 link.classList.add('active');
//             }
//         });
//     }
    
//     // Execute page-specific functions
//     switch(pageId) {
//         case 'home':
//             renderFeaturedProducts();
//             break;
//         case 'buy':
//             renderProducts();
//             break;
//         case 'cart':
//             renderCart();
//             break;
//     }
    

//     // Close mobile menu if open
//     if (window.innerWidth <= 768) {
//         const navLinks = document.querySelector('.nav-links');
//         navLinks.style.display = 'none';
//     }
// }

function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    
    // Show the requested page
    const page = document.getElementById(pageId);
    if (page) {
        page.classList.remove('hidden');
    } else {
        // Fallback to home if page doesn't exist
        document.getElementById('home').classList.remove('hidden');
    }
    
    // Rest of your existing showPage code...
}

// Login function
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showAlert('Please enter both username and password', 'error');
        return;
    }
    
    // Find user in the users array
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = username;
        localStorage.setItem('currentUser', currentUser);
        showAlert('Login successful!', 'success');
        showPage('home');
        updateCartCount();
        updateAuthButtons();
    } else {
        showAlert('Invalid username or password', 'error');
    }
}

// Register function
function register() {
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
    
    if (users.some(u => u.username === username)) {
        showAlert('Username already exists', 'error');
        return;
    }
    
    if (users.some(u => u.email === email)) {
        showAlert('Email already registered', 'error');
        return;
    }
    
    // Add new user
    users.push({
        username,
        email,
        password
    });
    
    saveData();
    showAlert('Registration successful! Please login.', 'success');
    showPage('login');
}

// Handle Google login
function handleGoogleLogin(response) {
    console.log("Google Login Response: ", response);
    
    // Extract user info from response
    const profile = response.getBasicProfile();
    const username = profile.getName();
    const email = profile.getEmail();
    
    // Check if user exists
    let user = users.find(u => u.email === email);
    
    if (!user) {
        // Create new user
        user = {
            username,
            email,
            googleId: response.getId()
        };
        users.push(user);
        saveData();
    }
    
    currentUser = user.username;
    localStorage.setItem('currentUser', currentUser);
    
    showAlert('Google login successful!', 'success');
    showPage('home');
    updateCartCount();
    updateAuthButtons();
}

// Logout function
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showPage('home');
    updateAuthButtons();
    showAlert('Logged out successfully', 'success');
}

// Add product function
function addProduct() {
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
    
    // Create array of image URLs
    const images = Array.from(imageInput.files).map(file => {
        return URL.createObjectURL(file);
    });
    
    // Add new product
    const newProduct = {
        id: Date.now().toString(),
        name,
        price,
        contact,
        about,
        category,
        images,
        owner: currentUser,
        date: new Date().toISOString(),
        rating: Math.floor(Math.random() * 2) + 3, // Random rating 3-5 for demo
        reviews: Math.floor(Math.random() * 50) // Random reviews count for demo
    };
    
    products.push(newProduct);
    saveData();
    
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
}

// Remove preview image
function removePreviewImage(element) {
    element.parentElement.remove();
}

// Render products
function renderProducts(filter = 'all', searchTerm = '') {
    const productList = document.querySelector('.product-list');
    if (!productList) return;
    
    productList.innerHTML = '';
    
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
    
    // Apply sorting
    const sortBy = document.getElementById('sortBy')?.value || 'newest';
    switch(sortBy) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'newest':
        default:
            filteredProducts.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
    }
    
    if (filteredProducts.length === 0) {
        productList.innerHTML = '<p class="no-products">No products found. Try adjusting your search or filters.</p>';
        return;
    }
    
    filteredProducts.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'product-item';
        productItem.innerHTML = `
            <div class="product-item-image">
                <img src="${product.images[0]}" alt="${product.name}">
                <span class="product-badge">${product.category}</span>
            </div>
            <div class="product-item-info">
                <h3 class="product-item-title">${product.name}</h3>
                <p class="product-item-price">₹${product.price.toFixed(2)}</p>
                <div class="product-item-meta">
                    <span class="product-rating">
                        ${'★'.repeat(product.rating)}${'☆'.repeat(5 - product.rating)}
                        (${product.reviews})
                    </span>
                    <span class="product-owner">${product.owner}</span>
                </div>
                <div class="product-item-actions">
                    <button class="btn-add-to-cart" onclick="addToCart('${product.id}')">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                    <button class="btn-view-details" onclick="showProductDetails('${product.id}')">
                        <i class="fas fa-eye"></i> Details
                    </button>
                </div>
            </div>
        `;
        productList.appendChild(productItem);
    });
}

// Filter products
function filterProducts() {
    const category = document.getElementById('categoryFilter').value;
    const searchTerm = document.getElementById('searchInput').value;
    renderProducts(category, searchTerm);
}

// Sort products
function sortProducts() {
    renderProducts(
        document.getElementById('categoryFilter').value,
        document.getElementById('searchInput').value
    );
}

// Render featured products
function renderFeaturedProducts() {
    const featuredContainer = document.querySelector('.featured-products');
    if (!featuredContainer) return;
    
    featuredContainer.innerHTML = '';
    
    // Get 4 random products for demo
    const featuredProducts = [...products].sort(() => 0.5 - Math.random()).slice(0, 4);
    
    if (featuredProducts.length === 0) {
        featuredContainer.innerHTML = '<p class="no-products">No featured products available.</p>';
        return;
    }
    
    featuredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.images[0]}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-price">₹${product.price.toFixed(2)}</p>
                <div class="product-meta">
                    <span class="product-rating">
                        ${'★'.repeat(product.rating)}${'☆'.repeat(5 - product.rating)}
                    </span>
                    <span class="product-category">${product.category}</span>
                </div>
                <button class="btn-primary" onclick="showProductDetails('${product.id}')" style="width:100%;margin-top:15px;">
                    View Details
                </button>
            </div>
        `;
        featuredContainer.appendChild(productCard);
    });
}

// Show product details
function showProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const detailsContainer = document.getElementById('productDetails');
    detailsContainer.innerHTML = `
        <div class="product-details-container">
            <div class="product-gallery">
                <div class="product-thumbnails">
                    ${product.images.map((img, index) => `
                        <div class="product-thumbnail ${index === 0 ? 'active' : ''}" onclick="changeMainImage('${img}', this)">
                            <img src="${img}" alt="Thumbnail ${index + 1}">
                        </div>
                    `).join('')}
                </div>
                <div class="product-main-image">
                    <img src="${product.images[0]}" alt="${product.name}">
                </div>
            </div>
            <div class="product-info">
                <h1 class="product-title">${product.name}</h1>
                <p class="product-price">₹${product.price.toFixed(2)}</p>
                <div class="product-rating">
                    <div class="stars">
                        ${'★'.repeat(product.rating)}${'☆'.repeat(5 - product.rating)}
                    </div>
                    <span class="review-count">${product.reviews} reviews</span>
                </div>
                <p class="product-description">${product.about}</p>
                <div class="product-meta">
                    <div class="meta-item">
                        <span class="meta-label">Category:</span>
                        <span class="meta-value">${product.category}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Seller:</span>
                        <span class="meta-value">${product.owner}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Contact:</span>
                        <span class="meta-value">
                            <a href="https://wa.me/${product.contact}" target="_blank">Chat on WhatsApp</a>
                        </span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Listed on:</span>
                        <span class="meta-value">${new Date(product.date).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="product-actions">
                    <div class="quantity-selector">
                        <button class="quantity-btn" onclick="updateQuantity(-1)">-</button>
                        <input type="text" class="quantity-input" value="1" readonly>
                        <button class="quantity-btn" onclick="updateQuantity(1)">+</button>
                    </div>
                    <button class="btn-primary btn-buy-now" onclick="addToCart('${product.id}', true)">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                </div>
                ${product.owner === currentUser ? `
                    <button class="btn-secondary" onclick="deleteProduct('${product.id}')" style="margin-top:15px;width:100%;">
                        <i class="fas fa-trash"></i> Delete Product
                    </button>
                ` : ''}
            </div>
        </div>
        <button class="btn-secondary" onclick="showPage('buy')" style="margin:30px auto;display:block;">
            <i class="fas fa-arrow-left"></i> Back to Products
        </button>
    `;
    
    showPage('productDetails');
}

// Change main image in product details
function changeMainImage(src, element) {
    document.querySelector('.product-main-image img').src = src;
    document.querySelectorAll('.product-thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
    });
    element.classList.add('active');
}

// Update quantity in product details
function updateQuantity(change) {
    const input = document.querySelector('.quantity-input');
    let value = parseInt(input.value) + change;
    if (value < 1) value = 1;
    input.value = value;
}

// Add to cart
function addToCart(productId, showAlert = false) {
    if (!currentUser) {
        showAlert('Please login to add items to cart', 'error');
        showPage('login');
        return;
    }
    
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Check if product is already in cart
    const existingItem = cart.find(item => item.product.id === productId);
    
    if (existingItem) {
        existingItem.quantity += parseInt(document.querySelector('.quantity-input')?.value || 1);
    } else {
        cart.push({
            product,
            quantity: parseInt(document.querySelector('.quantity-input')?.value || 1)
        });
    }
    
    saveData();
    updateCartCount();
    
    if (showAlert) {
        showAlert('Product added to cart!', 'success');
    }
}

// Remove from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    saveData();
    renderCart();
}

// Update cart count in navbar
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
    });
}

// Render cart
function renderCart() {
    const cartList = document.querySelector('.cart-list');
    if (!cartList) return;
    
    cartList.innerHTML = '';
    
    if (cart.length === 0) {
        cartList.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Looks like you haven't added anything to your cart yet</p>
                <button class="btn-primary" onclick="showPage('buy')">
                    Browse Products
                </button>
            </div>
        `;
        document.getElementById('subtotal').textContent = '₹0.00';
        document.getElementById('total').textContent = '₹0.00';
        return;
    }
    
    let subtotal = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.product.price * item.quantity;
        subtotal += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.product.images[0]}" alt="${item.product.name}">
            </div>
            <div class="cart-item-details">
                <h3 class="cart-item-title">${item.product.name}</h3>
                <p class="cart-item-price">₹${item.product.price.toFixed(2)}</p>
                <a href="#" class="cart-item-remove" onclick="removeFromCart(${index})">
                    <i class="fas fa-trash"></i> Remove
                </a>
            </div>
            <div class="cart-item-quantity">
                <div class="quantity-control">
                    <button class="quantity-btn" onclick="updateCartItemQuantity(${index}, -1)">-</button>
                    <input type="text" class="quantity-input" value="${item.quantity}" readonly>
                    <button class="quantity-btn" onclick="updateCartItemQuantity(${index}, 1)">+</button>
                </div>
            </div>
            <div class="cart-item-total">
                <p class="cart-item-total-price">₹${itemTotal.toFixed(2)}</p>
            </div>
        `;
        cartList.appendChild(cartItem);
    });
    
    document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('total').textContent = `₹${subtotal.toFixed(2)}`;
}

// Update cart item quantity
function updateCartItemQuantity(index, change) {
    const newQuantity = cart[index].quantity + change;
    
    if (newQuantity < 1) {
        removeFromCart(index);
    } else {
        cart[index].quantity = newQuantity;
        saveData();
        renderCart();
    }
}

// Delete product
function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    // Remove from products array
    products = products.filter(product => product.id !== productId);
    
    // Remove from cart if present
    cart = cart.filter(item => item.product.id !== productId);
    
    saveData();
    showAlert('Product deleted successfully', 'success');
    showPage('buy'); // Redirect to marketplace after deletion
}

// Checkout
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
    
    showPage('checkout');
}

// Show alert
function showAlert(message, type) {
    // Remove any existing alerts first
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 3000);
}