let currentCategory = null;
let lastView = null;
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let currentUser = null;
let isLoggedIn = false;
let loggedInEmail = "";
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
function showPaymentForm() {
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const formHtml = `
    <div id="paymentForm" >
      <h3>פרטי תשלום</h3>
      <label>שם מלא:<br><input type="text" id="fullName" required></label><br><br>
      <label>טלפון:<br><input type="tel" id="phone" required></label><br><br>
      <label>כתובת למשלוח:<br><textarea id="address" rows="3" required></textarea></label><br><br>
      
      <h4>פרטי כרטיס אשראי</h4>
      <label>מספר כרטיס:<br><input type="text" id="cardNumber" maxlength="19" placeholder="xxxx xxxx xxxx xxxx" required></label><br><br>
      <label>תוקף (MM/YY):<br><input type="text" id="expiry" maxlength="5" placeholder="MM/YY" required></label><br><br>
      <label>CVV:<br><input type="password" id="cvv" maxlength="4" placeholder="123" required></label><br><br>

      <p><strong>סה"כ לתשלום:</strong> $${totalPrice.toFixed(2)}</p>

      <button id="payBtn">שלם</button>
      <button id="cancelPaymentBtn" style="margin-left:10px;">ביטול</button>
    </div>
  `;

  resultsDiv.innerHTML = formHtml;
  console.log("cart----------", cart);

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
    // בדיקות בסיסיות:
    if (!name || !phone || !address || !cardNumber || !expiry || !cvv) {
      alert("אנא מלא את כל השדות");
      return;
    }

    if (!/^\d{16}$/.test(cardNumber)) {
      alert("מספר כרטיס לא חוקי. יש להזין 16 ספרות.");
      return;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      alert("פורמט תוקף לא חוקי. יש להזין MM/YY.");
      return;
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      alert("CVV לא חוקי. יש להזין 3 או 4 ספרות.");
      return;
    }

    // כאן אפשר להוסיף טיפול תשלום אמיתי
    console.log("תשלום מתבצע עם הפרטים הבאים:", cart);
    // תשלום הושלם - הצג קבלה
    showReceipt({ fullName: name, phone, address }, cart, totalPrice);
  });

  document.getElementById("cancelPaymentBtn").addEventListener("click", () => {
    displayCartInResults(); // חוזר לעגלת הקניות
  });

  // עיצוב אוטומטי למספר כרטיס - להוסיף רווח כל 4 ספרות
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
      <h2>קבלה</h2>
      <p><strong>שם:</strong> ${
        userInfo.fullName || loggedInEmail || "משתמש לא מזוהה"
      }</p>
      ${
        userInfo.phone ? `<p><strong>טלפון:</strong> ${userInfo.phone}</p>` : ""
      }
      ${
        userInfo.address
          ? `<p><strong>כתובת:</strong> ${userInfo.address}</p>`
          : ""
      }
      <hr>
      <h3>פרטי ההזמנה:</h3>
      <ul>
  `;
  console.log(cartItems);
  cartItems.forEach((item) => {
    receiptHtml += `<li>${item.title} - כמות: ${item.quantity} - מחיר יחידה: $${item.price}</li>`;
  });

  receiptHtml += `
      </ul>
      <hr>
      <p><strong>סה"כ לתשלום:</strong> $${totalPrice.toFixed(2)}</p>
      <button id="backToShopBtn">חזרה לחנות</button>
    </div>
  `;

  resultsDiv.innerHTML = receiptHtml;

  document.getElementById("backToShopBtn").addEventListener("click", () => {
    // נקה עגלה אם רוצים, או תשאירי לפי הלוגיקה שלך

    cart = [];
    localStorage.removeItem("cart");

    displayCartInResults();
    updateCartCount();
    window.location.href = "index.html";
  });
}

async function saveOrderForUser(email, cartItems) {
  if (!email || !cartItems || cartItems.length === 0) {
    console.error("אין מייל או עגלה ריקה");
    return;
  }

  try {
    // 1. קבלת כל המשתמשים מהבין
    const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
      headers: {
        "X-Master-Key": API_KEY,
      },
    });
    const data = await res.json();
    const users = data.record.users;

    // 2. עדכון המשתמש המתאים
    const updatedUsers = users.map((user) => {
      if (user.email === email) {
        // הוספת רכישה חדשה ל-purchases
        const newPurchases = user.purchases ? [...user.purchases] : [];

        // אפשר להוסיף גם תאריך ההזמנה
        // const order = {
        //   id: Date.now(), // מזהה ייחודי להזמנה
        //   date: new Date().toISOString(),
        //   items: cartItems,
        // };

        newPurchases.push(cartItems);

        // ריקון העגלה
        return { ...user, purchases: newPurchases, cart: [] };
      }
      return user;
    });

    // 3. שמירה חזרה לבין
    const putRes = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY,
      },
      body: JSON.stringify({ users: updatedUsers }),
    });

    if (!putRes.ok) {
      throw new Error("שגיאה בשמירת ההזמנה בבין");
    }

    console.log("ההזמנה נשמרה בהצלחה!");

    // 4. עדכון המשתמש בקוד שלך (ריקון העגלה גם בזיכרון)
    updateCartCount();

    // אפשר גם לעדכן currentUser
    const updatedUser = updatedUsers.find((u) => u.email === email);
    currentUser = updatedUser;
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
  } catch (error) {
    console.error("שגיאה בשמירת ההזמנה:", error);
  }
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
    userNameDisplay.textContent = `${currentUser.name} (התנתק)`;
  } else {
    userNameDisplay.textContent = "התחבר";
  }
}

function handleUserClick() {
  const currentUser = getCurrentUser();

  if (currentUser && currentUser.name) {
    // המשתמש מחובר – שואלים אם להתנתק
    if (confirm("האם את/ה בטוח/ה שברצונך להתנתק?")) {
      localStorage.removeItem("currentUser");
      isLoggedIn = false;
      loggedInEmail = "";
      localStorage.removeItem("cart");
      cart = JSON.parse(localStorage.getItem("cart")) || [];
      updateCartCount();
      displayUserName();
    }
  } else {
    // המשתמש לא מחובר – כאן אפשר לפתוח חלון התחברות
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
// userIcon.addEventListener("click", () => {
//   registerSection.classList.toggle("hidden");
// });
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

//sing in form
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

  // שלב 3: שלח עדכון ל־bin
  try {
    await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY,
      },
      body: JSON.stringify({ users: updatedUsers }),
    });

    alert("משתמש נוסף בהצלחה!");
    localStorage.setItem("currentUser", JSON.stringify(user));
    currentUser = user; // עדכון המשתמש הנוכחי
    isLoggedIn = true;
    loggedInEmail = user.email;
    updateCartCount();
    window.location.href = "index.html";
    signupForm.reset();
  } catch (error) {
    console.error("שגיאה בעדכון:", error);
  }
}

function showPassword() {
  const passwordInput = document.getElementById("loginPassword");
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    togglePassword.textContent = "הסתר";
  } else {
    passwordInput.type = "password";
    togglePassword.textContent = "הצג";
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
    console.log("Data from JSONBin:", data);
    const users = data.record.users || [];
    console.log("All users:", users);
    // search for the user
    const foundUser = users.find(
      (u) => u.email === email && u.password === password
    );
    console.log("Found user:", foundUser);
    if (foundUser) {
      alert("התחברת בהצלחה!");
      // שמירה ב־localStorage לצורך התחברות עתידית
      localStorage.setItem("currentUser", JSON.stringify(foundUser));
      isLoggedIn = true;
      loggedInEmail = foundUser.email;
      currentUser = foundUser;
      console.log(foundUser);
      const localCart = JSON.parse(localStorage.getItem("cart")) || [];
      const serverCart = foundUser.cart || [];

      cart = mergeCarts(localCart, serverCart);

      // שומר את הסל המאוחד בלוקל ואת הסל של המשתמש בבין
      localStorage.setItem("cart", JSON.stringify(cart));
      localStorage.setItem(
        "currentUser",
        JSON.stringify({ ...foundUser, cart })
      );

      saveCart();

      window.location.href = "index.html";
      updateCartCount();
    } else {
      alert("פרטי ההתחברות שגויים");
    }
  } catch (error) {
    console.error("שגיאה בהתחברות:", error);
    alert("אירעה שגיאה. נסה שוב");
  }
}

function mergeCarts(localCart, serverCart) {
  const mergedCart = [...serverCart]; // מתחילים עם הסל מהשרת

  localCart.forEach((localItem) => {
    const existing = mergedCart.find((item) => item.id === localItem.id);
    if (existing) {
      // אם המוצר כבר קיים בסל, מוסיפים את הכמויות
      existing.quantity += localItem.quantity;
    } else {
      // אם לא קיים, מוסיפים את הפריט מהסל המקומי
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
});

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
  console.log(sections);

  if (homePage) {
    homePage.style.display = "block";
    homePage.classList.add("fade");
  }
});

// search input listener

// --- פונקציות עיקריות ---

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
      console.error("eror load the data", err);
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
      <button class="add-to-cart">הוסף לסל</button>
    </div>
  `;

  // מאזין ללחיצה על כל הקלף
  card.addEventListener("click", () => {
    displaySingleProduct(product);
  });

  // מאזין לכפתור הוספה לסל (מונע את פתיחת הדף)
  const addToCartBtn = card.querySelector(".add-to-cart");
  addToCartBtn.addEventListener("click", (event) => {
    event.stopPropagation(); // כדי שלא יפעיל את קליק הקלף
    addToCart(product);
  });

  return card;
}
// -----------------------------------------------------------------------------------------------------------------------
function updateCartCount() {
  const cartCountSpan = document.getElementById("cart-count");
  // סכום כמויות כל הפריטים בעגלה
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCountSpan.textContent = totalItems;
}

function addToCart(product) {
  // בודקת אם המוצר כבר קיים בעגלה
  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1; // מעלה כמות
  } else {
    // יוצרת עותק עם quantity = 1
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
      // שלב 1: קבלת כל המשתמשים
      const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
        headers: {
          "X-Master-Key": API_KEY,
        },
      });
      const data = await res.json();
      const users = data.record.users;

      // שלב 2: עדכון הסל של המשתמש
      const updatedUsers = users.map((u) => {
        if (u.email === loggedInEmail) {
          return { ...u, cart: cart };
        }
        return u;
      });

      // שלב 3: שליחה חזרה ל-bin
      await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": API_KEY,
        },
        body: JSON.stringify({ users: updatedUsers }),
      });

      console.log("הסל נשמר בבין למשתמש", loggedInEmail);
      updateCartCount();
    } catch (err) {
      console.error("שגיאה בשמירת הסל לבין:", err);
    }
  } else {
    // אין משתמש מחובר → שמירה בלוקל
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
  }
}

function displayCartInResults() {
  hideHomePage();
  clearResults(); // מנקה קודם

  if (cart.length === 0) {
    resultsDiv.innerHTML = "<p>העגלה ריקה</p>";
    return;
  }

  const cartContainer = document.createElement("div");
  cartContainer.className = "cart-container";

  cart.forEach((item) => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "cart-item";

    itemDiv.innerHTML = `
     <img src="${item.thumbnail}" alt="${item.title}">
     <span class="item-title">${item.title}</span>
     <span class="item-price">מחיר: $${item.price}</span>
     <div class="quantity-controls">
       <button class="minus-btn" data-id="${item.id}">-</button>
       <span class="quantity-display">${item.quantity}</span>
       <button class="plus-btn" data-id="${item.id}">+</button>
  </div>
`;
    const totalPrice = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const totalDiv = document.createElement("div");
    totalDiv.className = "cart-total";
    totalDiv.textContent = `סה"כ לתשלום: $${totalPrice.toFixed(2)}`;
    cartContainer.appendChild(totalDiv);

    cartContainer.appendChild(itemDiv);
  });

  // כפתור לתשלום
  const checkoutBtn = document.createElement("button");
  checkoutBtn.textContent = "לתשלום";
  checkoutBtn.id = "checkoutBtn";
  cartContainer.appendChild(checkoutBtn);

  resultsDiv.appendChild(cartContainer);

  // מאזינים לכפתורי פלוס ומינוס
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

  // מאזין לכפתור לתשלום
  checkoutBtn.addEventListener("click", async () => {
    if (cart.length === 0) {
      alert("העגלה ריקה");
      return;
    }

    console.log(isLoggedIn, loggedInEmail, currentUser);
    if (!isLoggedIn) {
      // משתמש לא מחובר - נפתח טופס למילוי פרטים
      showPaymentForm();
    } else {
      // משתמש מחובר - שמור הזמנה ואז הצג קבלה
      console.log("שומר הזמנה למשתמש", loggedInEmail, currentUser);
      console.log(cart);

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
//------------------------------------------------------------------------------------------------------------------------
function displaySingleProduct(product) {
  resultsDiv.innerHTML = "";

  const singleProduct = document.createElement("div");
  singleProduct.className = "single-product";

  singleProduct.innerHTML = `
    <h2>${product.title}</h2>
    <img src="${product.thumbnail}" alt="${product.title}" style="max-width:300px;">
    <p><strong>price:</strong> $${product.price}</p>
    <p><strong>description:</strong> ${product.description}</p>
    <button id="backToResults">⬅ back </button>
  `;

  resultsDiv.appendChild(singleProduct);

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

// --- פונקציות תצוגה כלליות ---

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
    e.preventDefault(); // prevent default anchor behavior
    const category = link.getAttribute("data-category");
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
