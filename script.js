let currentCategory = null;
let lastView = null;
let cart = JSON.parse(localStorage.getItem("cart")) || [];

let isLoggedIn = false;
let loggedInEmail = "";
// let currentUser = null;
// -----------------------------------------------------------------------------------------------------------------------

const logo = document.getElementById("logo");
const sections = document.querySelectorAll(".section");
const searchInput = document.getElementById("search-input");
const resultsDiv = document.getElementById("results");
const homePage = document.getElementById("home-page");
const BIN_ID = "6894e2e9ae596e708fc45597";
const API_KEY = "$2a$10$WC2M4q0wec7dYNzsNvhL2.24bnz6ryCL4FlQWh2DQo.mgOcsnGwZa";

const registerSection = document.getElementById("register-login-page");
const showLoginLink = document.getElementById("show-login");
const showRegisterLink = document.getElementById("show-register");
const login = document.getElementById("login");
const register = document.getElementById("singin");

const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");
const userIcon = document.getElementById("userIcon");
const cartIcon = document.getElementById("cartIcon");
const cartContainer = document.getElementById("shopping-cart");

// -----------------------------------------------------------------------------------------------------------------------
function showUserProfile() {
  hideHomePage();

  if (!isLoggedIn) {
    resultsDiv.innerHTML = "<p>Please log in to view your profile.</p>";
    return;
  }

  // Fetch user from localStorage (including previous purchases)
  const currentUserData = JSON.parse(localStorage.getItem("currentUser")) || {};
  const purchases = currentUserData.purchases || [];

  // const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
  const userCart = cart || [];
  let cartHtml = "";
  if (Array.isArray(userCart) && userCart.length > 0) {
    cartHtml = userCart
      .map(
        (item) => `
      <div class="cart-item">
        <img src="${item.thumbnail}" alt="${item.title}" style="width:50px; height:50px;">
        <span>${item.title}</span>
        <span>Quantity: ${item.quantity}</span>
        <span>Price: $${item.price}</span>
      </div>
    `
      )
      .join("");
    cartHtml += `
       <div class="cart-actions" style="margin-top: 15px;">
        <button id="checkoutButton" style="padding:10px 20px; background-color:green; color:white; border:none; cursor:pointer;">
        go to cart
      </button>
     </div>
`;
  } else {
    cartHtml = "<p>Your cart is empty</p>";
  }

  let purchasesHtml = "";
  if (purchases.length === 0) {
    purchasesHtml = "<p>No previous orders.</p>";
  } else {
    purchasesHtml = `
      <div class="purchases-container">
        ${purchases
          .map(
            (order, index) => `
            <div class="order">
              <h4>Order #${index + 1}</h4>
              <ul>
                ${order
                  .map(
                    (item) =>
                      `<li> <div class="cart-item">
                          <img src="${item.thumbnail}" alt="${item.title}" style="width:50px; height:50px;">
                          <span>${item.title}</span>
                          <span>Quantity: ${item.quantity}</span>
                           <span>Price: $${item.price}</span></div>
                    
                    </li>`
                  )
                  .join("")}
              </ul>
            </div>
          `
          )
          .join("")}
      </div>
    `;
  }

  resultsDiv.innerHTML = `
  <h2 style="text-align:center; margin-bottom: 20px;">Welcome, ${loggedInEmail}</h2>
  <div class="profile-container">
    <div class="cart-section">
      <h3>🛒 Current Cart</h3>
      ${cartHtml}
    </div>
    <div class="orders-section">
      <h3>📦 Your Previous Orders</h3>
      ${purchasesHtml}
    </div>
  </div>
`;

  document
    .getElementById("checkoutButton")
    .addEventListener("click", function () {
      displayCartInResults();
    });
}

//------------------------------------------------------------------------------------------------------------------------

// -----------------------------------------------------------------------------------------------------------------------
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

function displayUserName() {
  const userNameDisplay = document.getElementById("userNameDisplay");
  const currentUser = getCurrentUser();

  if (currentUser && currentUser.name) {
    userNameDisplay.textContent = `${currentUser.name} (Logout)`;
  } else {
    userNameDisplay.textContent = "Login";
  }
}

function handleUserClick() {
  const currentUser = getCurrentUser();

  if (currentUser && currentUser.name) {
    // User is logged in – ask if they want to log out
    if (confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("currentUser");
      isLoggedIn = false;
      loggedInEmail = "";
      localStorage.removeItem("cart");
      cart = JSON.parse(localStorage.getItem("cart")) || [];
      updateCartCount();
      displayUserName();
    }
  } else {
    // User is not logged in – open login popup
    openLoginPopup();
  }
}

function openLoginPopup() {
  registerSection.classList.toggle("hidden");
}

function checkUserLogin() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (currentUser && currentUser.email) {
    isLoggedIn = true;
    loggedInEmail = currentUser.email;
    cart = currentUser.cart || [];
  } else {
    isLoggedIn = false;
    loggedInEmail = "";
    cart = JSON.parse(localStorage.getItem("cart")) || [];
  }
}

//all about log in and sign up
userIcon.addEventListener("click", () => {
  if (!isLoggedIn) {
    return;
  } else {
    showUserProfile();
  }
});
showLoginLink.addEventListener("click", (e) => {
  e.preventDefault();
  register.classList.add("hidden");
  login.classList.remove("hidden");
});

showRegisterLink.addEventListener("click", (e) => {
  e.preventDefault();
  login.classList.add("hidden");
  register.classList.remove("hidden");
});

document.getElementById("closeRegisterLogin").addEventListener("click", () => {
  registerSection.classList.add("hidden");
  login.classList.add("hidden");
  register.classList.remove("hidden");
});

//sign up form
async function addUser(e) {
  e.preventDefault();

  const user = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    address: document.getElementById("address").value,
    password: document.getElementById("password").value,
    purchases: [],
    cart: [],
  };
  let currentUsers = [];
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
      method: "GET",
      headers: {
        "X-Master-Key": API_KEY,
      },
    });

    const data = await response.json();

    currentUsers = data.record.users || [];
  } catch (error) {
    console.error("Error retrieving users:", error);
  }

  const updatedUsers = [...currentUsers, user];
  console.log("Updated users:", updatedUsers);
  console.log(user);

  // Step 3: Send update to bin
  try {
    await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY,
      },
      body: JSON.stringify({ users: updatedUsers }),
    });

    alert("User added successfully!");
    localStorage.setItem("currentUser", JSON.stringify(user));
    currentUser = user; // Update current user
    isLoggedIn = true;
    loggedInEmail = user.email;
    updateCartCount();
    window.location.href = "index.html";
    signupForm.reset();
  } catch (error) {
    console.error("Error updating:", error);
  }
}

function showPassword() {
  const passwordInput = document.getElementById("loginPassword");
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    togglePassword.textContent = "Hide";
  } else {
    passwordInput.type = "password";
    togglePassword.textContent = "Show";
  }
}

//log in form
async function loginUser(e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: {
        "X-Master-Key": API_KEY,
      },
    });

    const data = await res.json();
    const users = data.record.users || [];
    // search for the user
    const foundUser = users.find(
      (u) => u.email === email && u.password === password
    );
    if (foundUser) {
      alert("Logged in successfully!");
      // Save in localStorage for future login
      localStorage.setItem("currentUser", JSON.stringify(foundUser));
      isLoggedIn = true;
      loggedInEmail = foundUser.email;
      // currentUser = foundUser;
      const localCart = JSON.parse(localStorage.getItem("cart")) || [];
      const serverCart = foundUser.cart || [];

      cart = mergeCarts(localCart, serverCart);

      // Save merged cart in local and user's bin
      localStorage.setItem("cart", JSON.stringify(cart));
      localStorage.setItem(
        "currentUser",
        JSON.stringify({ ...foundUser, cart })
      );

      saveCart();

      window.location.href = "index.html";
      updateCartCount();
    } else {
      alert("Incorrect login details");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("An error occurred. Please try again");
  }
}

function mergeCarts(localCart, serverCart) {
  const mergedCart = [...serverCart]; // Start with server cart

  localCart.forEach((localItem) => {
    const existing = mergedCart.find((item) => item.id === localItem.id);
    if (existing) {
      // If product already exists in cart, add quantities
      existing.quantity += localItem.quantity;
    } else {
      // If not, add the item from local cart
      mergedCart.push(localItem);
    }
  });

  return mergedCart;
}

// -----------------------------------------------------------------------------------------------------------------------

// Initialize App
document.addEventListener("DOMContentLoaded", function () {
  // localStorage.removeItem("cart");
  initializeApp();
  setupEventListeners();
  checkUserLogin();
  displayUserName();
  updateCartCount();
  if (isLoggedIn) {
    loadCartFromBin();
  }
});

async function loadCartFromBin() {
  if (!isLoggedIn) return;

  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
      headers: {
        "X-Master-Key": API_KEY,
      },
    });
    const data = await res.json();
    const users = data.record.users;
    const user = users.find((u) => u.email === loggedInEmail);
    if (user && user.cart) {
      cart = user.cart;
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartCount();
      console.log("Cart loaded from bin:", cart);
    }
  } catch (err) {
    console.error("Error loading cart from bin:", err);
  }
}
//------------==================================================================================================
function initializeApp() {
  showHomePage();
}
function setupEventListeners() {
  document
    .getElementById("userNameDisplay")
    .addEventListener("click", handleUserClick);
  searchInput.addEventListener("input", handleSearch);
  signupForm.addEventListener("submit", (e) => addUser(e));
  loginForm.addEventListener("submit", (e) => loginUser(e));
  document
    .getElementById("togglePassword")
    .addEventListener("click", showPassword);
  cartIcon.addEventListener("click", () => {
    displayCartInResults();
  });
}

// Hide all sections except home page
//click on logo go back to home page
logo.addEventListener("click", () => {
  clearResults();
  searchInput.value = "";
  lastView = null;
  sections.forEach((sec) => (sec.style.display = "none"));

  if (homePage) {
    homePage.style.display = "block";
    homePage.classList.add("fade");
  }
});

// search input listener

// --- Main Functions ---

function handleSearch(event) {
  const query = event.target.value.trim();

  if (query.length > 0) {
    hideHomePage();
    lastView = { type: "search", value: query };
    fetchProducts(query);
  } else {
    clearResults();
    showHomePage();
  }
}

function fetchProducts(query) {
  fetch(`https://dummyjson.com/products/search?q=${encodeURIComponent(query)}`)
    .then((res) => res.json())
    .then((data) => {
      displayResults(data.products);
    })
    .catch((err) => {
      console.error("Error loading data", err);
    });
}

function displayResults(products) {
  clearResults();

  if (!products || products.length === 0) {
    resultsDiv.innerHTML = "<p>No results found.</p>";
    return;
  }

  products.forEach((product) => {
    const card = createProductCard(product);
    resultsDiv.appendChild(card);
  });
}

function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "card";
  card.style.cursor = "pointer";

  card.innerHTML = `
    <img src="${product.thumbnail}" alt="${product.title}">
    <div class="card-body">
      <div class="card-title">${product.title}</div>
      <div class="card-price">$${product.price}</div>
      <div class="product-rating">
                    ${generateStars(product.rating)}
                    <span>(${product.rating})</span>
                </div>
     <div class="product-actions">
                    <button class="add-to-cart large" >
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
    </div>
  `;

  // Listen for click on the card
  card.addEventListener("click", () => {
    displaySingleProduct(product);
  });

  // Listen for add to cart button (prevent opening the product page)
  const addToCartBtn = card.querySelector(".add-to-cart");
  addToCartBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    addToCart(product);
  });

  return card;
}
// -----------------------------------------------------------------------------------------------------------------------
function updateCartCount() {
  const cartCountSpan = document.getElementById("cart-count");
  // Sum of all item quantities in the cart
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCountSpan.textContent = totalItems;
}

function addToCart(product) {
  // Check if the product already exists in the cart
  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    // Create a copy with quantity = 1
    cart.push({
      id: product.id,
      title: product.title,
      thumbnail: product.thumbnail,
      price: product.price,
      quantity: 1,
    });
  }

  saveCart();
}

function removeFromCart(productId) {
  const itemIndex = cart.findIndex((item) => item.id === productId);

  if (itemIndex > -1) {
    if (cart[itemIndex].quantity > 1) {
      cart[itemIndex].quantity -= 1;
    } else {
      cart.splice(itemIndex, 1);
    }
    saveCart();
  }
}

async function saveCart() {
  if (isLoggedIn) {
    try {
      // Step 1: Get all users
      const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
        headers: {
          "X-Master-Key": API_KEY,
        },
      });
      const data = await res.json();
      const users = data.record.users;

      // Step 2: Update user's cart
      const updatedUsers = users.map((u) => {
        if (u.email === loggedInEmail) {
          return { ...u, cart: cart };
        }
        return u;
      });

      // Step 3: Send back to bin
      await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": API_KEY,
        },
        body: JSON.stringify({ users: updatedUsers }),
      });

      console.log("Cart saved to bin for user", loggedInEmail);
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartCount();
    } catch (err) {
      console.error("Error saving cart to bin:", err);
    }
  } else {
    // No user logged in → save to local
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
  }
}

function displayCartInResults() {
  hideHomePage();
  clearResults();

  if (cart.length === 0) {
    resultsDiv.innerHTML = `
    <div class="cart-container">
      <div class="cart-items empty">
        <p>Your cart is empty</p>
      </div>
      <div class="cart-summary">
        <div class="cart-total">Total to pay: $0.00</div>
        <button id="checkoutBtn" disabled>Checkout</button>
      </div>
    </div>
  `;
    return;
  }
  const cartContainer = document.createElement("div");
  cartContainer.className = "cart-container";

  const itemsDiv = document.createElement("div");
  itemsDiv.className = "cart-items";
  itemsDiv.innerHTML = "<h2>Items in your cart:</h2>";

  cart.forEach((item) => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "cart-item";

    itemDiv.innerHTML = `
   <img src="${item.thumbnail}" alt="${item.title}">
   <span class="item-title">${item.title}</span>
   <span class="item-price">Price: $${item.price}</span>
   <div class="quantity-controls">
     <button class="minus-btn" data-id="${item.id}">-</button>
     <span class="quantity-display">${item.quantity}</span>
     <button class="plus-btn" data-id="${item.id}">+</button>
  </div>
  `;

    itemsDiv.appendChild(itemDiv);
  });

  const summaryDiv = document.createElement("div");
  summaryDiv.className = "cart-summary";

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalDiv = document.createElement("div");
  totalDiv.className = "cart-total";
  totalDiv.textContent = `Total to pay: $${totalPrice.toFixed(2)}`;

  const checkoutBtn = document.createElement("button");
  checkoutBtn.textContent = "Checkout";
  checkoutBtn.id = "checkoutBtn";

  const paymentOptionsDiv = document.createElement("div");
  paymentOptionsDiv.className = "payment-options";

  paymentOptionsDiv.innerHTML = `
  <img src="credit_card.jpg" alt="credit cart" title="credit card" />

`;

  summaryDiv.appendChild(totalDiv);
  summaryDiv.appendChild(checkoutBtn);
  summaryDiv.appendChild(paymentOptionsDiv);

  cartContainer.appendChild(itemsDiv);
  cartContainer.appendChild(summaryDiv);

  resultsDiv.appendChild(cartContainer);

  resultsDiv.querySelectorAll(".plus-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      addToCartById(id);
    })
  );

  resultsDiv.querySelectorAll(".minus-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      removeFromCartById(id);
    })
  );

  // Listen for checkout button
  checkoutBtn.addEventListener("click", async () => {
    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    if (!isLoggedIn) {
      // User not logged in - open payment form
      showPaymentForm();
    } else {
      showPaymentForm();
      saveOrderForUser(loggedInEmail, cart);
    }
  });
}

function addToCartById(productId) {
  const id = typeof productId === "string" ? parseInt(productId) : productId;
  const item = cart.find((p) => p.id === id);
  if (item) {
    item.quantity += 1;
    saveCart();
    displayCartInResults();
    updateCartCount();
  }
}
function removeFromCartById(productId) {
  const id = typeof productId === "string" ? parseInt(productId) : productId;
  const index = cart.findIndex((p) => p.id === id);
  if (index > -1) {
    if (cart[index].quantity > 1) {
      cart[index].quantity -= 1;
    } else {
      cart.splice(index, 1);
    }
    saveCart();
    displayCartInResults();
    updateCartCount();
  }
}
//-------------------------------------------------------------------------------------------------------------------------

function showPaymentForm() {
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const formHtml = `
    <div id="paymentForm" >
      <h3>Payment Details</h3>
      <label>Full Name:<br><input type="text" id="fullName" required></label><br><br>
      <label>Phone:<br><input type="tel" id="phone" required></label><br><br>
      <label>Shipping Address:<br><textarea id="address" rows="3" required></textarea></label><br><br>
      
      <h4>Credit Card Details</h4>
      <label>Card Number:<br><input type="text" id="cardNumber" maxlength="19" placeholder="xxxx xxxx xxxx xxxx" required></label><br><br>
      <label>Expiry (MM/YY):<br><input type="text" id="expiry" maxlength="5" placeholder="MM/YY" required></label><br><br>
      <label>CVV:<br><input type="password" id="cvv" maxlength="4" placeholder="123" required></label><br><br>

      <p><strong>Total to pay:</strong> $${totalPrice.toFixed(2)}</p>

      <button id="payBtn">Pay</button>
      <button id="cancelPaymentBtn" style="margin-left:10px;">Cancel</button>
    </div>
  `;

  resultsDiv.innerHTML = formHtml;

  document.getElementById("payBtn").addEventListener("click", () => {
    const name = document.getElementById("fullName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const cardNumber = document
      .getElementById("cardNumber")
      .value.replace(/\s+/g, "");
    const expiry = document.getElementById("expiry").value.trim();
    const cvv = document.getElementById("cvv").value.trim();
    console.log("cart", cart);
    // Basic validation:
    if (!name || !phone || !address || !cardNumber || !expiry || !cvv) {
      alert("Please fill in all fields");
      return;
    }

    if (!/^\d{16}$/.test(cardNumber)) {
      alert("Invalid card number. Please enter 16 digits.");
      return;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      alert("Invalid expiry format. Please enter MM/YY.");
      return;
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      alert("Invalid CVV. Please enter 3 or 4 digits.");
      return;
    }

    // Here you can add real payment handling
    console.log("Payment processing with the following details:", cart);
    // Payment completed - show receipt
    showReceipt({ fullName: name, phone, address }, cart, totalPrice);
  });

  document.getElementById("cancelPaymentBtn").addEventListener("click", () => {
    displayCartInResults();
  });

  // Auto-format card number - add space every 4 digits
  const cardInput = document.getElementById("cardNumber");
  cardInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "").substring(0, 16);
    let formatted = value.replace(/(.{4})/g, "$1 ").trim();
    e.target.value = formatted;
  });
}

function showReceipt(userInfo, cartItems, totalPrice) {
  let receiptHtml = `
    <div id="receipt">
      <h2>Receipt</h2>
      <p><strong>Name:</strong> ${
        userInfo.fullName || loggedInEmail || "Unknown user"
      }</p>
      ${
        userInfo.phone ? `<p><strong>Phone:</strong> ${userInfo.phone}</p>` : ""
      }
      ${
        userInfo.address
          ? `<p><strong>Address:</strong> ${userInfo.address}</p>`
          : ""
      }
      <hr>
      <h3>Order Details:</h3>
      <ul>
  `;
  console.log(cartItems);
  cartItems.forEach((item) => {
    receiptHtml += `<li>${item.title} - Quantity: ${item.quantity} - Unit Price: $${item.price}</li>`;
  });

  receiptHtml += `
      </ul>
      <hr>
      <p><strong>Total to pay:</strong> $${totalPrice.toFixed(2)}</p>
      <button id="backToShopBtn">Back to Shop</button>
    </div>
  `;

  resultsDiv.innerHTML = receiptHtml;

  document.getElementById("backToShopBtn").addEventListener("click", () => {
    cart = [];
    localStorage.removeItem("cart");

    displayCartInResults();
    updateCartCount();
    window.location.href = "index.html";
  });
}

async function saveOrderForUser(email, cartItems) {
  if (!email || !cartItems || cartItems.length === 0) {
    console.error("No email or empty cart");
    return;
  }

  try {
    // 1. Get all users from bin
    const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
      headers: {
        "X-Master-Key": API_KEY,
      },
    });
    const data = await res.json();
    const users = data.record.users;

    // 2. Update the relevant user
    const updatedUsers = users.map((user) => {
      if (user.email === email) {
        // Add new purchase to purchases
        const newPurchases = user.purchases ? [...user.purchases] : [];

        newPurchases.push(cartItems);

        // Empty the cart
        return { ...user, purchases: newPurchases, cart: [] };
      }
      return user;
    });

    // 3. Save back to bin
    const putRes = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY,
      },
      body: JSON.stringify({ users: updatedUsers }),
    });

    if (!putRes.ok) {
      throw new Error("Error saving order to bin");
    }

    console.log("Order saved successfully!");

    // 4. Update user in your code (empty cart in memory too)
    updateCartCount();

    // Optionally update currentUser
    const updatedUser = updatedUsers.find((u) => u.email === email);
    // currentUser = updatedUser;
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
  } catch (error) {
    console.error("Error saving order:", error);
  }
}
//------------------------------------------------------------------------------------------------------------------------
function displaySingleProduct(product) {
  hideHomePage();
  resultsDiv.innerHTML = "";

  const singleProduct = document.createElement("div");
  singleProduct.className = "single-product";

  singleProduct.innerHTML = `
        <div class="product-details-header">
           <button id="backToResults">⬅ Back</button>
        </div>
        
        <div class="product-details-content">
            <div class="product-images">
                <div class="main-image">
                    <img src="${product.images[0]}" alt="${
    product.title
  }" id="main-product-image">
                </div>
                <div class="thumbnail-images">
                    ${product.images
                      .map(
                        (img) => `
                        <img src="${img}" alt="${product.title}" 
                             onclick="document.getElementById('main-product-image').src='${img}'">
                    `
                      )
                      .join("")}
                </div>
            </div>
            
            <div class="product-info">
                <h1>${product.title}</h1>
                <div class="product-rating">
                    ${generateStars(product.rating)}
                    <span>(${product.rating})</span>
                </div>
                <p class="product-price">$${product.price}</p>
                <p class="product-description">${product.description}</p>
                
                <div class="product-specs">
                    <h3>Technical Specifications</h3>
                    <ul>
                        <li><strong>Brand:</strong> ${product.brand}</li>
                        <li><strong>Category:</strong> ${product.category}</li>
                        <li><strong>Stock:</strong> ${product.stock} units</li>
                        ${
                          product.dimensions
                            ? `
                            <li><strong>Weight:</strong> ${product.dimensions.weight} kg</li>
                            <li><strong>Width:</strong> ${product.dimensions.width} cm</li>
                            <li><strong>Height:</strong> ${product.dimensions.height} cm</li>
                            <li><strong>Depth:</strong> ${product.dimensions.depth} cm</li>
                        `
                            : ""
                        }
                    </ul>
                </div>
                
                <div class="product-actions">
                    <button class="add-to-cart large" >
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
        </div>
        
        
        <div class="product-reviews">
            <h3>Customer Reviews</h3>
            <div class="reviews-list">
                ${
                  product.reviews
                    ? product.reviews
                        .map(
                          (review) => `
                    <div class="review">
                        <div class="review-header">
                            <strong>${review.reviewerName}</strong>
                            <div class="review-rating">${generateStars(
                              review.rating
                            )}</div>
                        </div>
                        <p>${review.comment}</p>
                        <small>${new Date(review.date).toLocaleDateString(
                          "en-US"
                        )}</small>
                    </div>
                `
                        )
                        .join("")
                    : "<p>No reviews yet</p>"
                }
            </div>
        </div>
    `;

  resultsDiv.appendChild(singleProduct);
  const addToCartBtn = singleProduct.querySelector(".add-to-cart");
  addToCartBtn.addEventListener("click", (event) => {
    addToCart(product);
  });

  document.getElementById("backToResults").addEventListener("click", () => {
    if (lastView) {
      if (lastView.type === "search") {
        fetchProducts(lastView.value);
      } else if (lastView.type === "category") {
        loadCategory(lastView.value);
      }
    } else {
      clearResults();
      showHomePage();
    }
  });
}
function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  let stars = "";
  for (let i = 0; i < fullStars; i++) {
    stars += '<i class="fas fa-star"></i>';
  }
  if (halfStar) {
    stars += '<i class="fas fa-star-half-alt"></i>';
  }
  for (let i = 0; i < emptyStars; i++) {
    stars += '<i class="far fa-star"></i>';
  }

  return stars;
}

// --- General Display Functions ---

function clearResults() {
  resultsDiv.innerHTML = "";
}

function hideHomePage() {
  if (homePage) {
    homePage.style.display = "none";
  }
}

function showHomePage() {
  if (homePage) {
    homePage.style.display = "block";
  }
}
//-----------------------------------------------------------------------------------------------------------------------

//-----------------------------------------------------------------------------------------------------------------------
// click on the menu
const submenuParents = document.querySelectorAll(".has-submenu");

submenuParents.forEach((item) => {
  item.addEventListener("click", (e) => {
    // prevent <a> navigation if it has submenu
    if (e.target.closest(".has-submenu>a")) e.preventDefault();
    item.classList.toggle("open");
  });
});

//------------------------------------------------------------------------------------------------------------------------
// category links listener
document.querySelectorAll("#categories-menu .submenu a").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const category = link.getAttribute("data-category");
    console.log("Category clicked:", category);
    if (category) {
      loadCategory(category);
    }
  });
});

// נבחר את כל הקטגוריות
const categoryBoxes = document.querySelectorAll(
  ".category-box, .category-right"
);
const contentDiv = document.getElementById("category-content");

categoryBoxes.forEach((box) => {
  box.addEventListener("click", (e) => {
    e.preventDefault();
    const category = box.getAttribute("data-category");
    console.log("Category clicked:", category);
    if (category) {
      loadCategory(category);
    }
  });
});

// loads products by category
function loadCategory(category) {
  hideHomePage();
  clearResults();
  lastView = { type: "category", value: category };
  fetch(
    `https://dummyjson.com/products/category/${encodeURIComponent(category)}`
  )
    .then((res) => res.json())
    .then((data) => {
      displayResults(data.products);
    })
    .catch((err) => {
      console.error("Error loading category:", err);
      resultsDiv.innerHTML = `<p>Unable to load products.</p>`;
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const categories = [
    { key: "womens-bags", id: "cat-women" },
    { key: "mens-shirts", id: "cat-men" },
    { key: "beauty", id: "cat-beauty" },
  ];

  categories.forEach(async (c) => {
    const el =
      document.getElementById(c.id) ||
      document.querySelector(`[data-category="${c.key}"]`);
    if (!el) {
      console.warn("Element not found for", c);
      return;
    }

    try {
      const res = await fetch(
        `https://dummyjson.com/products/category/${c.key}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // בחר תמונה: מוצר ראשון במידה ויש, אחרת placeholder
      const imgSrc =
        data?.products?.[0]?.thumbnail ||
        "https://via.placeholder.com/400x160?text=No+Image";

      const img = document.createElement("img");
      img.src = imgSrc;
      img.alt = c.key;
      img.className = "category-image"; // אם תרצי לשלוט בסגנון עוד
      el.appendChild(img);
    } catch (err) {
      console.error("Error loading category", c.key, err);
      // אפשר להכניס placeholder גם במקרה של שגיאה:
      const img = document.createElement("img");
      img.src = "https://via.placeholder.com/400x160?text=No+Image";
      img.alt = "no-image";
      el.appendChild(img);
    }
  });
});
// -----------------------------------------------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const adsContainer = document.querySelector(".ads-container");

  let current = 0;
  let slides = [];

  const couponCode = "SALE2025";

  fetch("https://dummyjson.com/products")
    .then((res) => res.json())
    .then((data) => {
      const products = data.products;
      const randomProducts = [];
      const usedIndexes = new Set();

      while (randomProducts.length < 4 && usedIndexes.size < products.length) {
        const randomIndex = Math.floor(Math.random() * products.length);
        if (!usedIndexes.has(randomIndex)) {
          usedIndexes.add(randomIndex);
          randomProducts.push(products[randomIndex]);
        }
      }

      randomProducts.forEach((product, i) => {
        const slide = document.createElement("div");
        slide.className = "ad-slide";
        if (i === 0) slide.classList.add("active");

        slide.innerHTML = `
  <div class="ad-slide-content">
    <img src="${product.thumbnail}" alt="${product.title}">
    <div class="ad-slide-text">
      <h4>${product.title}</h4>
      <div class="review-rating">${generateStars(product.rating)}</div>
      <span class="price">$${product.price}</span>
    </div>
  </div>
`;

        slide.addEventListener("click", () => {
          console.log("Product clicked:", product);
          displaySingleProduct(product);
          console.log("Product clicked:");
        });

        // הוספת המודעה לדיב
        adsContainer.insertBefore(
          slide,
          adsContainer.querySelector(".ad-next")
        );
      });

      slides = document.querySelectorAll(".ad-slide");
    })
    .catch(console.error);

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
    });
    current = index;
  }

  function nextSlide() {
    if (slides.length === 0) return;
    showSlide((current + 1) % slides.length);
  }

  setInterval(nextSlide, 5000);
});
