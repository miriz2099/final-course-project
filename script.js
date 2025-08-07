let currentCategory = null;
let lastView = null;
let users = [];
// -----------------------------------------------------------------------------------------------------------------------

const logo = document.getElementById("logo");
const sections = document.querySelectorAll(".section");
const searchInput = document.getElementById("search-input");
const resultsDiv = document.getElementById("results");
const homePage = document.getElementById("home-page");
const BIN_ID = "6894e2e9ae596e708fc45597";
const API_KEY = "$2a$10$WC2M4q0wec7dYNzsNvhL2.24bnz6ryCL4FlQWh2DQo.mgOcsnGwZa";

const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");
const userIcon = document.getElementById("userIcon");
//const registerPage = document.getElementById("register-page");
//------------------------------------------------------------------------------------------------------------------------

const registerSection = document.getElementById("register-page");
const loginSection = document.getElementById("login-page");

const showLoginLink = document.getElementById("show-login");
const showRegisterLink = document.getElementById("show-register");

// -----------------------------------------------------------------------------------------------------------------------
//all about log in and sign up
userIcon.addEventListener("click", () => {
  registerSection.classList.toggle("hidden");
});
showLoginLink.addEventListener("click", (e) => {
  e.preventDefault();
  registerSection.classList.add("hidden");
  loginSection.classList.remove("hidden");
});

showRegisterLink.addEventListener("click", (e) => {
  e.preventDefault();
  loginSection.classList.add("hidden");
  registerSection.classList.remove("hidden");
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
    if (!response.ok) {
      throw new Error("Failed to retrieve favorites");
    }
    const data = await response.json();

    currentUsers = data.record.users || [];
  } catch (error) {
    console.error("Error retrieving favorites:", error);
  }

  const updatedUsers = [...currentUsers, user];
  console.log("Updated users:", updatedUsers);

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
    const users = data.record.users || [];

    // search for the user
    const foundUser = users.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      alert("התחברת בהצלחה!");
      // שמירה ב־localStorage לצורך התחברות עתידית
      localStorage.setItem("currentUser", JSON.stringify(foundUser));
    } else {
      alert("פרטי ההתחברות שגויים");
    }
  } catch (error) {
    console.error("שגיאה בהתחברות:", error);
    alert("אירעה שגיאה. נסה שוב");
  }
}
// -----------------------------------------------------------------------------------------------------------------------

// Initialize App
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
  setupEventListeners();
  loadUsers();
  checkUserLogin();
});

function initializeApp() {
  showHomePage();
}
function setupEventListeners() {
  searchInput.addEventListener("input", handleSearch);
  signupForm.addEventListener("submit", (e) => addUser(e));
  loginForm.addEventListener("submit", (e) => loginUser(e));
  document
    .getElementById("togglePassword")
    .addEventListener("click", showPassword);
}
function loadUsers() {}
function checkUserLogin() {}
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
    </div>
  `;

  // click listener for the card
  card.addEventListener("click", () => {
    displaySingleProduct(product);
  });

  return card;
}

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
