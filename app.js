// Enhanced Games Data
const games = [
    {
        id: 1,
        title: "2x PUBG Premium Accounts",
        price: 120,
        image: "https://media.karousell.com/media/photos/products/2023/11/13/pubg_acc_for_sale_1699852739_6939e2d9_progressive.jpg",
        videos: [
            "https://www.youtube.com/embed/TFzkbos0oeo",
            "https://www.youtube.com/embed/6A6U6n9yQwQ"
        ],
        specs: {
            level: "50+",
            skins: "20 Rare + 50 Elite",
            weapons: "All Mythic ARs + 5 Legendary Snipers",
            rank: "Conqueror S12, S13",
            matches: "1500+ Battle Royale Matches",
            inventory: "5000 UC + 20 Premium Crates"
        },
        details: "Includes:\n- 2 Full Access Accounts\n- Level 50+\n- Rare Skins\n- 5000+ UC Each"
    },
    {
        id: 2,
        title: "Pubg Medium Account",
        price: 50,
        image: "https://th.bing.com/th/id/OIP.VYYMj9vx8LrUEqssVXD4RgHaEK?rs=1&pid=ImgDetMain",
        videos: ["https://www.youtube.com/embed/TFzkbos0oeo"],
        specs: {
            level: "35",
            skins: "10 Rare + 15 Elite",
            weapons: "3 Mythic ARs + 2 Legendary Snipers",
            rank: "Ace Dominator S14",
            matches: "800+ Matches",
            inventory: "1500 UC + 5 Premium Crates"
        },
        details: "12 upgradables\n- 100+ Skins\n- Full Access"
    }
];

// State
let currentUser = null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let isLogin = true;
let legalAccepted = false;
let cookiesAccepted = false;
let currentProduct = null;
let currentMediaIndex = 0;

// Product Details Functions
function showProductDetails(gameId) {
    currentProduct = games.find(g => g.id === gameId);
    currentMediaIndex = 0;
    
    document.getElementById('productTitle').textContent = currentProduct.title;
    document.getElementById('modalPrice').textContent = currentProduct.price;
    
    // Media Carousel
    const mediaContainer = document.getElementById('mediaContainer');
    mediaContainer.innerHTML = currentProduct.videos.map(video => `
        <iframe 
            class="product-video carousel-item" 
            src="${video}" 
            frameborder="0" 
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
        </iframe>
    `).join('');
    
    // Carousel dots
    const dotsContainer = document.getElementById('carouselDots');
    dotsContainer.innerHTML = currentProduct.videos.map((_, i) => `
        <div class="carousel-dot ${i === 0 ? 'active' : ''}" 
             onclick="showMedia(${i})"></div>
    `).join('');
    
    // Show first media item
    document.querySelectorAll('.carousel-item').forEach((item, i) => {
        item.classList.toggle('active', i === 0);
    });

    // Specifications
    const specsContainer = document.getElementById('productSpecs');
    specsContainer.innerHTML = Object.entries(currentProduct.specs).map(([key, value]) => `
        <div class="spec-item">
            <div class="spec-title">${key.toUpperCase()}</div>
            <div class="spec-value">${value}</div>
        </div>
    `).join('');

    toggleModal('productModal');
}

function showMedia(index) {
    currentMediaIndex = index;
    document.querySelectorAll('.carousel-item').forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });
    document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

// Core Functions
function toggleAuth() {
    isLogin = !isLogin;
    renderAuthForm();
}

function renderAuthForm() {
    const authHTML = `
        <input type="text" class="form-input" placeholder="Username" id="username">
        <input type="password" class="form-input" placeholder="Password" id="password">
        <div class="terms-check">
            <input type="checkbox" id="terms">
            <label for="terms">I agree to the <a href="#" onclick="showLegal('terms')">Terms</a></label>
        </div>
        <button class="btn" onclick="handleAuth()">
            ${isLogin ? 'Login' : 'Sign Up'}
        </button>
    `;
    document.getElementById('authForms').innerHTML = authHTML;
    document.getElementById('toggleAuthBtn').textContent = 
        isLogin ? 'Switch to Sign Up' : 'Switch to Login';
}

function handleAuth() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const termsAccepted = document.getElementById('terms').checked;

    if (!username || !password || !termsAccepted) {
        alert('Please fill all fields and accept terms!');
        return;
    }

    if (isLogin) {
        const storedPass = localStorage.getItem(username);
        if (password === storedPass) {
            currentUser = username;
            toggleModal('authModal');
            updateUI();
        } else {
            alert('Invalid credentials!');
        }
    } else {
        localStorage.setItem(username, password);
        alert('Account created! Please login.');
        toggleAuth();
    }
}

// Cart System
function addToCart(gameId) {
    const game = games.find(g => g.id === gameId);
    cart.push(game);
    updateCart();
    showNotification(`${game.title} added to cart!`);
}

function removeFromCart(gameId) {
    const item = document.querySelector(`.cart-item[data-id="${gameId}"]`);
    if (item) {
        item.classList.add('removing');
        setTimeout(() => {
            cart = cart.filter(i => i.id !== gameId);
            updateCart();
        }, 300);
    }
}

function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    document.getElementById('cartCount').textContent = cart.length;
    renderCartItems();
}

function renderCartItems() {
    const cartItems = document.getElementById('cartItems');
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <div>
                <h3>${item.title}</h3>
                <p>$${item.price}</p>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${item.id})">×</button>
        </div>
    `).join('');
    
    document.getElementById('totalAmount').textContent = 
        cart.reduce((sum, item) => sum + item.price, 0);
}

// Payment Processing
function processPayment() {
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const cardNumber = document.getElementById('cardNumber').value;
    const cardExpiry = document.getElementById('cardExpiry').value;
    const cardCvc = document.getElementById('cardCvc').value;

    if (!email || !phone || !validatePayment(cardNumber, cardExpiry, cardCvc)) {
        alert('Please fill all fields correctly!');
        return;
    }

    showLoading(true);
    setTimeout(() => {
        showLoading(false);
        alert('Payment Successful! Account details will be emailed to you.');
        cart = [];
        updateCart();
        toggleModal('cartModal');
    }, 2000);
}

function validatePayment(number, expiry, cvc) {
    const expiryTest = /^(0[1-9]|1[0-2])\/?([2-9][0-9])$/;
    return number.match(/^\d{16}$/) && 
           expiry.match(expiryTest) && 
           cvc.match(/^\d{3}$/);
}

// Legal System
function verifyAge() {
    const birthdate = new Date(document.getElementById('birthdate').value);
    const ageDiff = Date.now() - birthdate.getTime();
    const ageDate = new Date(ageDiff);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    if(age < 18) {
        alert('Access denied: Must be 18+');
        window.location = 'about:blank';
    } else {
        toggleModal('ageModal');
        sessionStorage.setItem('ageVerified', 'true');
    }
}

function acceptCookies() {
    cookiesAccepted = true;
    localStorage.setItem('cookiesAccepted', 'true');
    document.getElementById('cookieBanner').style.display = 'none';
}

function rejectCookies() {
    cookiesAccepted = false;
    localStorage.setItem('cookiesAccepted', 'false');
    document.getElementById('cookieBanner').style.display = 'none';
}

function showLegal(type) {
    const content = {
        terms: `
            <h2>Terms of Service</h2>
            <p>Welcome to GameTrade Pro! These Terms govern your use of our marketplace for buying/selling gaming accounts and items.</p>
            
            <h3>Prohibited Activities</h3>
            <ul>
                <li>Selling stolen or unauthorized accounts</li>
                <li>Fraudulent transactions</li>
                <li>Using automation tools</li>
                <li>Hacking attempts</li>
                <li>Violating game developers' TOS</li>
            </ul>
        `,
        refund: `
            <h2>Refund Policy</h2>
            <p>Refunds granted for:</p>
            <ul>
                <li>Non-delivery of items</li>
                <li>Significant product misrepresentation</li>
                <li>Unauthorized transactions</li>
            </ul>
            <p>Disputes must be filed within 7 days. All decisions are final.</p>
        `,
        privacy: `
            <h2>Privacy Policy</h2>
            <p>We collect:</p>
            <ul>
                <li>Account information</li>
                <li>Transaction history</li>
                <li>Device data</li>
            </ul>
            <p>Payment data is processed securely through third-party providers.</p>
        `
    }[type];

    const modal = document.createElement('div');
    modal.className = 'checkout-modal active';
    modal.innerHTML = `
        <div class="checkout-content">
            <button class="close-modal" onclick="this.parentElement.parentElement.remove()">×</button>
            <div style="max-height: 70vh; overflow-y: auto; padding: 1rem;">
                ${content}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function showDataRequest() {
    const modal = document.createElement('div');
    modal.className = 'checkout-modal active';
    modal.innerHTML = `
        <div class="checkout-content">
            <button class="close-modal" onclick="this.parentElement.parentElement.remove()">×</button>
            <h2>Data Requests</h2>
            <p>Under data protection laws, you have the right to:</p>
            <ul>
                <li>Request access to your data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of data sharing</li>
            </ul>
            <button class="btn" onclick="requestUserData()">Download My Data</button>
            <button class="btn" onclick="deleteUserData()">Delete My Data</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// UI Functions
function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.toggle('active');
}

function toggleCart() {
    document.getElementById('cartModal').classList.toggle('active');
}

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'flex' : 'none';
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.background = 'var(--primary)';
    notification.style.color = 'var(--dark)';
    notification.style.padding = '1rem 2rem';
    notification.style.borderRadius = '8px';
    notification.style.zIndex = '9999';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialization
function initLegal() {
    if(!sessionStorage.getItem('ageVerified')) {
        document.getElementById('ageModal').classList.add('active');
    }
    
    if(!localStorage.getItem('cookiesAccepted')) {
        document.getElementById('cookieBanner').style.display = 'flex';
    }
}

function init() {
    initLegal();
    const gameContainer = document.getElementById('gameContainer');
    gameContainer.innerHTML = games.map(game => `
        <div class="game-card" onclick="showProductDetails(${game.id})">
            <img src="${game.image}" class="game-image" alt="${game.title}">
            <div class="game-details">
                <h3 class="game-title">${game.title}</h3>
                <pre style="margin: 1rem 0; color: var(--light);">${game.details}</pre>
                <p class="game-price">$${game.price}</p>
                <button class="btn">View Details</button>
            </div>
        </div>
    `).join('');

    document.getElementById('authButton').addEventListener('click', () => toggleModal('authModal'));
    
    window.onclick = function(event) {
        if (event.target.classList.contains('checkout-modal')) {
            event.target.classList.remove('active');
        }
    }
    
    updateCart();
}

// Start the application
init();
