// const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "https://studentmart.onrender.com/api";
// const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// // Debugging
// console.log("Environment Variables:", {
//   API_BASE,
//   GOOGLE_CLIENT_ID: GOOGLE_CLIENT_ID ? "*****" : "Not set"
// });

// // Global state
// let products = [];
// let cart = [];
// let currentUser = null;

// // DOM Content Loaded
// document.addEventListener('DOMContentLoaded', async function() {
//     showLoading(true);
    
//     try {
//         // Load session if token exists
//         const token = localStorage.getItem('token');
//         if (token) {
//             await loadSession(token);
//         }
        
//         // Load products
//         await loadProducts();
        
//         // Initialize UI
//         initUI();
//         showPage('home');
//     } catch (error) {
//         console.error('Initialization error:', error);
//         showAlert('Failed to load application data', 'error');
//     } finally {
//         setTimeout(() => showLoading(false), 500);
//     }
// });

// // ======================
// // CORE FUNCTIONS
// // ======================

// async function loadSession(token) {
//     try {
//         const [userResponse, cartResponse] = await Promise.all([
//             fetch(`${API_BASE}/auth/me`, {
//                 headers: { 'Authorization': `Bearer ${token}` }
//             }),
//             fetch(`${API_BASE}/cart`, {
//                 headers: { 'Authorization': `Bearer ${token}` }
//             })
//         ]);
        
//         if (userResponse.ok) {
//             const userData = await userResponse.json();
//             currentUser = userData.username;
//         }
        
//         if (cartResponse.ok) {
//             cart = await cartResponse.json();
//         }
//     } catch (error) {
//         console.error('Session load error:', error);
//         logout();
//     }
// }

// async function loadProducts() {
//     const response = await fetch(`${API_BASE}/products`);
//     if (response.ok) {
//         products = await response.json();
//     } else {
//         throw new Error('Failed to load products');
//     }
// }

// function initUI() {
//     updateAuthButtons();
//     updateCartCount();
//     initEventListeners();
// }

// // ======================
// // AUTHENTICATION
// // ======================

// async function login() {
//     const username = document.getElementById('username').value;
//     const password = document.getElementById('password').value;
    
//     if (!username || !password) {
//         showAlert('Please enter both username and password', 'error');
//         return;
//     }
    
//     try {
//         showLoading(true);
//         const response = await fetch(`${API_BASE}/auth/login`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ username, password })
//         });
        
//         const data = await response.json();
        
//         if (response.ok) {
//             currentUser = username;
//             localStorage.setItem('token', data.token);
//             showAlert('Login successful!', 'success');
//             await loadSession(data.token);
//             showPage('home');
//         } else {
//             showAlert(data.message || 'Login failed', 'error');
//         }
//     } catch (error) {
//         showAlert('Network error. Please try again.', 'error');
//     } finally {
//         showLoading(false);
//     }
// }

// async function register() {
//     const username = document.getElementById('regUsername').value;
//     const email = document.getElementById('regEmail').value;
//     const password = document.getElementById('regPassword').value;
//     const confirmPassword = document.getElementById('regConfirmPassword').value;
    
//     if (password !== confirmPassword) {
//         showAlert('Passwords do not match', 'error');
//         return;
//     }
    
//     try {
//         showLoading(true);
//         const response = await fetch(`${API_BASE}/auth/register`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ username, email, password })
//         });
        
//         const data = await response.json();
        
//         if (response.ok) {
//             showAlert('Registration successful! Please login.', 'success');
//             showPage('login');
//         } else {
//             showAlert(data.message || 'Registration failed', 'error');
//         }
//     } catch (error) {
//         showAlert('Network error. Please try again.', 'error');
//     } finally {
//         showLoading(false);
//     }
// }

// function logout() {
//     localStorage.removeItem('token');
//     currentUser = null;
//     cart = [];
//     updateAuthButtons();
//     updateCartCount();
//     showAlert('Logged out successfully', 'success');
//     showPage('home');
// }

// // ======================
// // PRODUCT MANAGEMENT
// // ======================

// async function addProduct() {
//     if (!currentUser) {
//         showAlert('Please login to add products', 'error');
//         showPage('login');
//         return;
//     }
    
//     const formData = new FormData();
//     formData.append('name', document.getElementById('itemName').value);
//     formData.append('price', document.getElementById('itemPrice').value);
//     formData.append('contact', document.getElementById('itemContact').value);
//     formData.append('about', document.getElementById('itemAbout').value);
//     formData.append('category', document.getElementById('itemCategory').value);
    
//     const imageInput = document.getElementById('itemImage');
//     if (imageInput.files) {
//         Array.from(imageInput.files).forEach(file => {
//             formData.append('images', file);
//         });
//     }
    
//     try {
//         showLoading(true);
//         const response = await fetch(`${API_BASE}/products`, {
//             method: 'POST',
//             headers: {
//                 'Authorization': `Bearer ${localStorage.getItem('token')}`
//             },
//             body: formData
//         });
        
//         if (response.ok) {
//             const newProduct = await response.json();
//             products.push(newProduct);
//             resetProductForm();
//             showAlert('Product added successfully!', 'success');
//             showPage('buy');
//         } else {
//             const error = await response.json();
//             showAlert(error.message || 'Failed to add product', 'error');
//         }
//     } catch (error) {
//         showAlert('Network error. Please try again.', 'error');
//     } finally {
//         showLoading(false);
//     }
// }

// function resetProductForm() {
//     document.getElementById('itemName').value = '';
//     document.getElementById('itemPrice').value = '';
//     document.getElementById('itemContact').value = '';
//     document.getElementById('itemAbout').value = '';
//     document.getElementById('itemCategory').value = '';
//     document.getElementById('itemImage').value = '';
//     document.getElementById('imagePreview').innerHTML = '';
// }

// // ======================
// // CART MANAGEMENT
// // ======================

// async function addToCart(productId, quantity = 1) {
//     if (!currentUser) {
//         showAlert('Please login to add items to cart', 'error');
//         showPage('login');
//         return;
//     }
    
//     try {
//         showLoading(true);
//         const response = await fetch(`${API_BASE}/cart`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${localStorage.getItem('token')}`
//             },
//             body: JSON.stringify({ productId, quantity })
//         });
        
//         if (response.ok) {
//             cart = await response.json();
//             updateCartCount();
//             showAlert('Product added to cart!', 'success');
//         } else {
//             const error = await response.json();
//             showAlert(error.message || 'Failed to add to cart', 'error');
//         }
//     } catch (error) {
//         showAlert('Network error. Please try again.', 'error');
//     } finally {
//         showLoading(false);
//     }
// }

// // ======================
// // UI FUNCTIONS
// // ======================

// function showPage(pageId) {
//     // Hide all pages
//     document.querySelectorAll('.page').forEach(page => {
//         page.classList.add('hidden');
//     });
    
//     // Show requested page
//     const pageElement = document.getElementById(pageId);
//     if (pageElement) pageElement.classList.remove('hidden');
    
//     // Update active nav link
//     if (pageId !== 'login' && pageId !== 'register') {
//         document.querySelectorAll('.nav-link').forEach(link => {
//             link.classList.remove('active');
//             if (link.getAttribute('onclick')?.includes(pageId)) {
//                 link.classList.add('active');
//             }
//         });
//     }
    
//     // Page-specific rendering
//     switch(pageId) {
//         case 'home': renderFeaturedProducts(); break;
//         case 'buy': renderProducts(); break;
//         case 'cart': renderCart(); break;
//         case 'profile': loadProfile(); break;
//     }
// }

// function showLoading(state) {
//     const loadingScreen = document.querySelector('.loading-screen');
//     if (loadingScreen) loadingScreen.style.display = state ? 'flex' : 'none';
// }

// function updateAuthButtons() {
//     const authButtons = document.querySelector('.auth-buttons');
//     if (!authButtons) return;
    
//     authButtons.innerHTML = currentUser ? `
//         <div class="user-dropdown">
//             <div class="user-profile" onclick="toggleDropdown()">
//                 <i class="fas fa-user-circle"></i>
//                 <span class="username">${currentUser}</span>
//                 <i class="fas fa-caret-down"></i>
//             </div>
//             <div class="dropdown-menu hidden">
//                 <a href="#" onclick="showPage('profile')"><i class="fas fa-user"></i> Profile</a>
//                 <a href="#" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</a>
//             </div>
//         </div>
//     ` : `
//         <button class="btn-login" onclick="showPage('login')">Login</button>
//         <button class="btn-signup" onclick="showPage('register')">Sign Up</button>
//     `;
// }

// // ======================
// // RENDERING FUNCTIONS
// // ======================

// function renderFeaturedProducts() {
//     const container = document.querySelector('.featured-products');
//     if (!container) return;
    
//     const featured = [...products].sort(() => 0.5 - Math.random()).slice(0, 4);
    
//     container.innerHTML = featured.map(product => `
//         <div class="product-card" onclick="showProductDetails('${product._id}')">
//             <img src="${product.images?.[0] || 'placeholder.jpg'}" alt="${product.name}">
//             <h3>${product.name}</h3>
//             <p>₹${product.price}</p>
//             <button onclick="event.stopPropagation(); addToCart('${product._id}')">
//                 <i class="fas fa-cart-plus"></i> Add to Cart
//             </button>
//         </div>
//     `).join('');
// }

// // ... [Keep all other rendering functions as they were] ...

// // ======================
// // INITIALIZATION
// // ======================

// function initEventListeners() {
//     // Image preview handler
//     const imageInput = document.getElementById('itemImage');
//     if (imageInput) {
//         imageInput.addEventListener('change', function() {
//             const preview = document.getElementById('imagePreview');
//             preview.innerHTML = '';
            
//             Array.from(this.files).forEach(file => {
//                 const reader = new FileReader();
//                 reader.onload = (e) => {
//                     preview.innerHTML += `
//                         <div class="preview-image">
//                             <img src="${e.target.result}" alt="Preview">
//                             <span class="remove-image" onclick="this.parentElement.remove()">&times;</span>
//                         </div>
//                     `;
//                 };
//                 reader.readAsDataURL(file);
//             });
//         });
//     }
    
//     // Mobile menu toggle
//     document.querySelector('.mobile-menu-btn')?.addEventListener('click', function() {
//         const navLinks = document.querySelector('.nav-links');
//         navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
//     });
// }

// // ======================
// // UTILITY FUNCTIONS
// // ======================

// function showAlert(message, type = 'success') {
//     const alert = document.createElement('div');
//     alert.className = `alert ${type}`;
//     alert.textContent = message;
//     document.body.appendChild(alert);
    
//     setTimeout(() => {
//         alert.classList.add('show');
//         setTimeout(() => {
//             alert.classList.remove('show');
//             setTimeout(() => alert.remove(), 500);
//         }, 3000);
//     }, 10);
// }

// function updateCartCount() {
//     const count = cart.reduce((sum, item) => sum + item.quantity, 0);
//     document.querySelectorAll('.cart-count').forEach(el => el.textContent = count);
// }

// // Make functions available globally
// window.login = login;
// window.register = register;
// window.logout = logout;
// window.addToCart = addToCart;
// window.showPage = showPage;
// window.addProduct = addProduct;
// // ... [Add all other functions that need to be global] ...