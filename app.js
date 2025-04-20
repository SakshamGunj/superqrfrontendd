// Restaurant Slot Machine Game - Main Application

// Constants
const SPIN_DURATION = 3000; // 3 seconds for the spin animation
const SPIN_SPEED = 100; // Speed between slot items change in ms
const SLOT_ITEM_HEIGHT = 184; // Height of each slot item in pixels

// Restaurants database (simulated)
const RESTAURANTS = {
    "awesome-burgers": {
        name: "Awesome Burgers",
        description: "Home of the most delicious burgers in town. Our juicy burgers are made with 100% premium beef and fresh ingredients.",
        offers: [
            "Free Burger", "10% Off", "Free Drink", "Free Fries", "Buy 1 Get 1 Free", 
            "20% Off", "Free Dessert", "Free Appetizer", "30% Off Combo"
        ]
    },
    "pizza-palace": {
        name: "Pizza Palace",
        description: "Experience the authentic taste of Italy with our hand-tossed pizzas, baked in wood-fired ovens and topped with premium ingredients.",
        offers: [
            "Free Pizza", "15% Off", "Free Garlic Bread", "Free Soda", "Buy 1 Get 1 Free", 
            "25% Off", "Free Dessert", "Free Side", "30% Off Large Pizza"
        ]
    },
    "peakskitchen": {
        name: "Peaks Kitchen",
        description: "Experience the authentic taste of Italy with our hand-tossed pizzas, baked in wood-fired ovens and topped with premium ingredients.",
        offers: [
            "5% off", "15% Off", "10% off", "Free tea", "Buy 1 Get 1 Free","25% off", "35% Off", "Free Coffee" 
        ]
    },
    "sushi-heaven": {
        name: "Sushi Heaven",
        description: "Fresh and authentic Japanese cuisine. Our master chefs prepare the finest sushi rolls and sashimi with locally sourced ingredients.",
        offers: [
            "Free Roll", "20% Off", "Free Miso Soup", "Free Green Tea", "Buy 1 Get 1 Free", 
            "15% Off", "Free Dessert", "Free Edamame", "30% Off Party Platter"
        ]
    }
};

// State management
const APP_STATE = {
    currentRestaurant: null,
    currentUser: null,
    offers: [],
    currentOffer: null,
    spinning: false,
    slotItems: null,
    spinInterval: null
};

// Helper functions
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
});

// Initialize application based on current URL
function initApp() {
    // Extract restaurant ID from URL - support both direct paths and hash-based routes
    const path = window.location.pathname;
    const hash = window.location.hash.substring(2); // Remove the #/ prefix
    let restaurantId = '';
    
    if (hash && RESTAURANTS[hash]) {
        // Hash-based routing: /#/restaurant-id
        restaurantId = hash;
    } else {
        // Direct path routing: /restaurant-id
        // Extract the last segment of the path and remove any trailing slash
        const pathSegments = path.split('/').filter(segment => segment.length > 0);
        const lastSegment = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : '';
        
        if (lastSegment && RESTAURANTS[lastSegment]) {
            restaurantId = lastSegment;
        }
    }
    
    console.log("Path:", path);
    console.log("Hash:", hash);
    console.log("Resolved Restaurant ID:", restaurantId);
    
    if (restaurantId && RESTAURANTS[restaurantId]) {
        APP_STATE.currentRestaurant = {
            id: restaurantId,
            ...RESTAURANTS[restaurantId]
        };
        loadRestaurantData();
    } else {
        // Default to the first restaurant for local testing
        const firstRestaurantId = Object.keys(RESTAURANTS)[0];
        APP_STATE.currentRestaurant = {
            id: firstRestaurantId,
            ...RESTAURANTS[firstRestaurantId]
        };
        
        // Update URL for proper routing - For direct local testing, use hash-based routing
        // as it doesn't require server configuration
        const newPath = `#/${firstRestaurantId}`;
        window.history.pushState({}, '', newPath);
        loadRestaurantData();
    }
    
    // Check if user is already logged in
    checkLoginStatus();
    
    // Set up dashboard
    setupDashboard();
}

// Add event listener for hash changes to support hash-based navigation
window.addEventListener('hashchange', function() {
    // Reload the page to initialize with the new hash
    window.location.reload();
});

// Load the restaurant data into the UI
function loadRestaurantData() {
    if (!APP_STATE.currentRestaurant) return;
    
    // Set restaurant info
    $('#restaurantName').textContent = APP_STATE.currentRestaurant.name;
    $('#restaurantDescription').textContent = APP_STATE.currentRestaurant.description;
    
    // Set slot machine offers
    APP_STATE.offers = APP_STATE.currentRestaurant.offers;
    initializeSlotMachine();
    
    // Show main content and hide loading screen
    setTimeout(() => {
        $('#loading').classList.add('hidden');
        $('#mainContent').classList.remove('hidden');
    }, 1000);
}

// Initialize the slot machine with offers
function initializeSlotMachine() {
    const slotItems = $('#slotItems');
    slotItems.innerHTML = '';
    
    // Create slot items (3x the number of offers for continuous looping effect)
    for (let i = 0; i < 3; i++) {
        APP_STATE.offers.forEach(offer => {
            const slotItem = document.createElement('div');
            slotItem.className = 'slot-item';
            slotItem.textContent = offer;
            slotItems.appendChild(slotItem);
        });
    }
    
    APP_STATE.slotItems = slotItems;
}

// Set up all event listeners
function setupEventListeners() {
    // Spin button
    $('#spinBtn').addEventListener('click', spinSlotMachine);
    
    // Auth modal
    $$('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    $('#loginBtn').addEventListener('click', openAuthModal);
    $('#logoutBtn').addEventListener('click', handleLogout);
    
    // Auth tabs
    $('#loginTab').addEventListener('click', () => switchAuthTab('login'));
    $('#signupTab').addEventListener('click', () => switchAuthTab('signup'));
    
    // Auth forms
    $('#loginSubmit').addEventListener('click', handleLogin);
    $('#signupSubmit').addEventListener('click', handleSignup);
    
    // Reward modal
    $('#claimBtn').addEventListener('click', showClaimForm);
    $('#spinAgainBtn').addEventListener('click', handleSpinAgain);
    
    // Dashboard
    $('#dashboardBtn').addEventListener('click', openDashboard);
    $('#closeDashboard').addEventListener('click', closeDashboard);
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
}

// Spin the slot machine
function spinSlotMachine() {
    if (APP_STATE.spinning) return;
    
    APP_STATE.spinning = true;
    $('#spinBtn').disabled = true;
    $('#result').textContent = '';
    
    // Calculate total height of all items
    const totalItems = APP_STATE.offers.length;
    const totalHeight = totalItems * SLOT_ITEM_HEIGHT;
    
    // Start spinning animation
    let counter = 0;
    APP_STATE.spinInterval = setInterval(() => {
        counter++;
        const position = -(counter % totalItems) * SLOT_ITEM_HEIGHT;
        APP_STATE.slotItems.style.transform = `translateY(${position}px)`;
    }, SPIN_SPEED);
    
    // Stop spinning after the duration
    setTimeout(() => {
        clearInterval(APP_STATE.spinInterval);
        APP_STATE.spinning = false;
        $('#spinBtn').disabled = false;
        
        // Select random offer
        const randomIndex = Math.floor(Math.random() * APP_STATE.offers.length);
        APP_STATE.currentOffer = APP_STATE.offers[randomIndex];
        
        // Position slot machine to show the winning offer
        const finalPosition = -(randomIndex * SLOT_ITEM_HEIGHT);
        APP_STATE.slotItems.style.transition = 'transform 0.5s ease-out';
        APP_STATE.slotItems.style.transform = `translateY(${finalPosition}px)`;
        
        setTimeout(() => {
            APP_STATE.slotItems.style.transition = 'transform 0.1s ease-out';
            showWinningOffer();
        }, 500);
        
    }, SPIN_DURATION);
}

// Show the winning offer in the modal
function showWinningOffer() {
    $('#offerText').textContent = APP_STATE.currentOffer;
    $('#rewardModal').classList.remove('hidden');
    $('#rewardModal').style.display = 'block';
    
    // Reset coupon code section
    $('#couponCode').classList.add('hidden');
}

// Close all modals
function closeAllModals() {
    // Properly hide modals
    const modals = $$('.modal');
    modals.forEach(modal => {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    });
    
    // Close dashboard
    $('#dashboard').classList.remove('show');
}

// Handle Spin Again button click
function handleSpinAgain() {
    closeAllModals();
    setTimeout(() => {
        spinSlotMachine();
    }, 300);
}

// Show claim form or direct claim based on login status
function showClaimForm() {
    console.log('Claim button clicked');
    
    if (APP_STATE.currentUser) {
        // User is logged in, show coupon
        generateAndShowCoupon();
    } else {
        // User needs to log in first
        $('#rewardModal').style.display = 'none';
        setTimeout(() => {
            $('#authModal').classList.remove('hidden');
            $('#authModal').style.display = 'block';
            switchAuthTab('signup');
        }, 100);
    }
}

// Generate and show coupon code
function generateAndShowCoupon() {
    const couponCode = generateCouponCode();
    $('#couponValue').textContent = couponCode;
    $('#couponCode').classList.remove('hidden');
    
    // Save claimed reward to local storage
    saveClaimedReward(couponCode);
}

// Generate random coupon code
function generateCouponCode() {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

// Save claimed reward to local storage
function saveClaimedReward(couponCode) {
    if (!APP_STATE.currentUser) return;
    
    const reward = {
        restaurantId: APP_STATE.currentRestaurant.id,
        restaurantName: APP_STATE.currentRestaurant.name,
        offer: APP_STATE.currentOffer,
        couponCode: couponCode,
        claimedDate: new Date().toISOString()
    };
    
    let claimedRewards = JSON.parse(localStorage.getItem(`rewards_${APP_STATE.currentUser.email}`)) || [];
    claimedRewards.push(reward);
    localStorage.setItem(`rewards_${APP_STATE.currentUser.email}`, JSON.stringify(claimedRewards));
}

// Open auth modal
function openAuthModal(mode = 'login') {
    console.log('Opening auth modal in mode:', mode);
    $('#authModal').classList.remove('hidden');
    $('#authModal').style.display = 'block';
    
    if (mode === 'claim') {
        switchAuthTab('signup');
    } else {
        switchAuthTab('login');
    }
}

// Switch between login and signup tabs
function switchAuthTab(tab) {
    if (tab === 'login') {
        $('#loginTab').classList.add('active');
        $('#signupTab').classList.remove('active');
        $('#loginForm').classList.remove('hidden');
        $('#signupForm').classList.add('hidden');
    } else {
        $('#loginTab').classList.remove('active');
        $('#signupTab').classList.add('active');
        $('#loginForm').classList.add('hidden');
        $('#signupForm').classList.remove('hidden');
    }
}

// Handle login form submission
function handleLogin() {
    const email = $('#loginEmail').value;
    const password = $('#loginPassword').value;
    
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // Check if user exists in local storage
    const users = JSON.parse(localStorage.getItem('users')) || {};
    const user = users[email];
    
    if (!user) {
        alert('User not found. Please sign up.');
        return;
    }
    
    if (user.password !== password) {
        alert('Incorrect password');
        return;
    }
    
    // Success! Log in the user
    loginUser(user);
    closeAllModals();
    
    // If there was a pending reward claim, show the coupon
    if (APP_STATE.currentOffer) {
        generateAndShowCoupon();
    }
}

// Handle signup form submission
function handleSignup() {
    const name = $('#signupName').value;
    const email = $('#signupEmail').value;
    const password = $('#signupPassword').value;
    const phone = $('#signupPhone').value;
    
    if (!name || !email || !password || !phone) {
        alert('Please fill in all fields');
        return;
    }
    
    // Save user to local storage
    const users = JSON.parse(localStorage.getItem('users')) || {};
    
    // Check if user already exists
    if (users[email]) {
        alert('User with this email already exists');
        return;
    }
    
    // Create new user
    const newUser = { name, email, password, phone };
    users[email] = newUser;
    localStorage.setItem('users', JSON.stringify(users));
    
    // Log in the new user
    loginUser(newUser);
    closeAllModals();
    
    // If there was a pending reward claim, show the coupon
    if (APP_STATE.currentOffer) {
        generateAndShowCoupon();
    }
}

// Login user and update UI
function loginUser(user) {
    APP_STATE.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Update UI
    $('#loginBtn').classList.add('hidden');
    $('#logoutBtn').classList.remove('hidden');
    $('#dashboardBtn').classList.remove('hidden');
    
    // Show welcome message
    $('#result').textContent = `Welcome, ${user.name}!`;
    setTimeout(() => {
        $('#result').textContent = '';
    }, 3000);
}

// Check if user is already logged in (from local storage)
function checkLoginStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        APP_STATE.currentUser = user;
        
        // Update UI for logged in state
        $('#loginBtn').classList.add('hidden');
        $('#logoutBtn').classList.remove('hidden');
        $('#dashboardBtn').classList.remove('hidden');
    }
}

// Handle logout
function handleLogout() {
    APP_STATE.currentUser = null;
    localStorage.removeItem('currentUser');
    
    // Update UI
    $('#loginBtn').classList.remove('hidden');
    $('#logoutBtn').classList.add('hidden');
    $('#dashboardBtn').classList.add('hidden');
    
    // Show logout message
    $('#result').textContent = 'You have been logged out';
    setTimeout(() => {
        $('#result').textContent = '';
    }, 3000);
}

// Dashboard functionality
function setupDashboard() {
    $('#dashboardBtn').addEventListener('click', openDashboard);
    $('#closeDashboard').addEventListener('click', closeDashboard);
}

// Open user dashboard
function openDashboard() {
    if (!APP_STATE.currentUser) return;
    
    // Load user rewards
    loadUserRewards();
    
    // Show dashboard
    $('#dashboard').classList.remove('hidden');
    $('#dashboard').style.display = 'block';
    
    // Add class for animation
    setTimeout(() => {
        $('#dashboard').classList.add('show');
    }, 10);
}

// Close dashboard
function closeDashboard() {
    $('#dashboard').classList.remove('show');
    
    // Wait for animation to complete before hiding
    setTimeout(() => {
        $('#dashboard').classList.add('hidden');
        $('#dashboard').style.display = 'none';
    }, 400);
}

// Load user rewards into dashboard
function loadUserRewards() {
    const rewardsList = $('#rewardsList');
    rewardsList.innerHTML = '';
    
    // Update user name
    $('#userName').textContent = APP_STATE.currentUser.name;
    
    // Get user rewards from local storage
    const claimedRewards = JSON.parse(localStorage.getItem(`rewards_${APP_STATE.currentUser.email}`)) || [];
    
    if (claimedRewards.length === 0) {
        rewardsList.innerHTML = '<p class="no-rewards">You haven\'t claimed any rewards yet. Spin to win!</p>';
        return;
    }
    
    // Group rewards by restaurant
    const rewardsByRestaurant = {};
    claimedRewards.forEach(reward => {
        if (!rewardsByRestaurant[reward.restaurantId]) {
            rewardsByRestaurant[reward.restaurantId] = [];
        }
        rewardsByRestaurant[reward.restaurantId].push(reward);
    });
    
    // Create reward cards for each restaurant
    Object.entries(rewardsByRestaurant).forEach(([restaurantId, rewards]) => {
        rewards.forEach(reward => {
            const card = createRewardCard(reward);
            rewardsList.appendChild(card);
        });
    });
}

// Create a reward card for the dashboard
function createRewardCard(reward) {
    const card = document.createElement('div');
    card.className = 'reward-card';
    
    const formattedDate = new Date(reward.claimedDate).toLocaleDateString();
    
    card.innerHTML = `
        <div class="restaurant-tag">${reward.restaurantName}</div>
        <h3 class="reward-title">${reward.offer}</h3>
        <p class="reward-info">Claimed on: ${formattedDate}</p>
        <div class="reward-code">${reward.couponCode}</div>
    `;
    
    return card;
}

// Show error message
function showError(message) {
    $('#loading').innerHTML = `
        <div class="error-message">
            <h2>Oops!</h2>
            <p>${message}</p>
            <button id="goHomeBtn">Go to Homepage</button>
        </div>
    `;
    
    $('#goHomeBtn').addEventListener('click', () => {
        window.location.href = '/';
    });
}
