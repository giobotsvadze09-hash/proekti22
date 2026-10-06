const apiKey = "dfae7d90-d0d4-4dd3-939c-809761c82815";
const apiUrl = "https://restaurantapi.stepacademy.ge/api/products/filter";
const productsUrl = "https://restaurantapi.stepacademy.ge/api/products?Take=10&Page=1";

const categoryMap = {
    "Desserts": 1,
    "First Courses": 2,
    "Main Courses": 3,
    "Pizzas": 4,
    "Side Dishes": 5,
    "Appetizers": 6
};

document.addEventListener("DOMContentLoaded", () => {
    
   
    try {
        updateCartCount();
        renderCartPage();
    } catch (e) { console.error(e); }

    
    try {
        const searchInput = document.getElementById("searchDish");
        const categoryCheckboxes = document.querySelectorAll(".checkbox-list input[type='checkbox']");
        const vegetarianToggle = document.querySelector(".toggle-group input[type='checkbox']");
        const clearBtn = document.querySelector(".clear-filters-btn");
        const dishesGrid = document.querySelector(".dishes-grid");
        const productsCountText = document.querySelector(".menu-header-info p");

        if (dishesGrid) {
            fetchProducts();
        }

        if (searchInput) {
            searchInput.addEventListener("input", fetchFilteredProducts);
        }

        categoryCheckboxes.forEach(cb => {
            cb.addEventListener("change", fetchFilteredProducts);
        });

        if (vegetarianToggle) {
            vegetarianToggle.addEventListener("change", fetchFilteredProducts);
        }

        if (clearBtn) {
            clearBtn.addEventListener("click", () => {
                if (searchInput) searchInput.value = "";
                categoryCheckboxes.forEach(cb => cb.checked = false);
                if (vegetarianToggle) vegetarianToggle.checked = false;
                fetchProducts();
            });
        }

        async function fetchProducts() {
            try {
                const response = await fetch(productsUrl, {
                    method: "GET",
                    headers: { "X-API-KEY": apiKey, "Accept": "application/json" }
                });
                const result = await response.json();
                const products = result.data.products || [];
                displayProducts(products);
                if (productsCountText) productsCountText.textContent = `Showing ${products.length} products`;
            } catch (err) { console.error(err); }
        }

        async function fetchFilteredProducts() {
            const params = new URLSearchParams();
            params.append("Take", "20");
            params.append("Page", "1");

            if (searchInput && searchInput.value.trim()) {
                params.append("Query", searchInput.value.trim());
            }

            let selectedCategory = null;
            categoryCheckboxes.forEach(cb => {
                if (cb.checked) {
                    const labelText = cb.parentElement.textContent.trim();
                    if (categoryMap[labelText]) selectedCategory = categoryMap[labelText];
                }
            });
            if (selectedCategory) params.append("CategoryId", selectedCategory);
            if (vegetarianToggle && vegetarianToggle.checked) params.append("Vegetarian", "true");

            try {
                const response = await fetch(`${apiUrl}?${params.toString()}`, {
                    method: "GET",
                    headers: { "X-API-KEY": apiKey, "Accept": "application/json" }
                });
                const result = await response.json();
                const products = result.data.products || [];
                displayProducts(products);
                if (productsCountText) productsCountText.textContent = `Showing ${products.length} products`;
            } catch (err) { console.error(err); }
        }

        function displayProducts(products) {
            if (!dishesGrid) return;
            dishesGrid.innerHTML = "";
            if (products.length === 0) {
                dishesGrid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">პროდუქტები ვერ მოიძებნა</p>`;
                return;
            }
            products.forEach(product => {
                const card = document.createElement("div");
                card.classList.add("dish-card");
                card.innerHTML = `
                    <div class="dish-img-container"><img src="${product.image}" alt="${product.name}"></div>
                    <div class="dish-info">
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                        <div class="dish-rating"><i class="fa-solid fa-star"></i> <span>${product.rate}</span></div>
                        <div class="dish-footer">
                            <span class="price">$${product.price.toFixed(2)}</span>
                            <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
                        </div>
                    </div>
                `;
                dishesGrid.appendChild(card);
            });

            dishesGrid.querySelectorAll(".add-to-cart-btn").forEach(button => {
                button.addEventListener("click", () => {
                    const cardEl = button.closest('.dish-card');
                    addToCart({
                        id: button.getAttribute("data-id"),
                        name: cardEl.querySelector('h3').textContent,
                        price: parseFloat(cardEl.querySelector('.price').textContent.replace('$', '')),
                        image: cardEl.querySelector('img').src
                    });
                    button.textContent = "Added!";
                    button.style.backgroundColor = "#4CAF50";
                    setTimeout(() => {
                        button.textContent = "Add to Cart";
                        button.style.backgroundColor = "";
                    }, 1000);
                });
            });
        }
    } catch (e) {  }

    try {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        const navRight = document.querySelector(".nav-right");

        if (currentUser && navRight) {
            navRight.innerHTML = `
                <a href="cart.html" class="cart-icon" style="position: relative; text-decoration: none; color: #333; margin-right: 15px;">
                    <i class="fa-solid fa-cart-shopping"></i>
                    <span class="cart-count" style="background: #ff5722; color: white; border-radius: 50%; padding: 2px 6px; font-size: 11px; position: absolute; top: -8px; right: -10px;">0</span>
                </a>
                <div class="profile-menu-container" style="position: relative; display: inline-block;">
                    <div class="profile-icon-btn" id="profileToggleBtn" style="cursor: pointer; color: #ff5722; font-size: 20px; background: #ffebee; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i class="fa-solid fa-user"></i>
                    </div>
                    <div class="profile-dropdown-menu" id="profileDropdown" style="display: none; position: absolute; right: 0; top: 50px; background: white; box-shadow: 0 4px 15px rgba(0,0,0,0.15); border-radius: 8px; width: 220px; overflow: hidden; z-index: 1000; border: 1px solid #eee;">
                        <div style="padding: 15px; border-bottom: 1px solid #eee; background: #fafafa;">
                            <p style="font-size: 12px; color: #777; margin: 0;">Hello:</p>
                            <p style="font-size: 14px; font-weight: bold; color: #333; margin: 2px 0 0 0;">${currentUser.firstName || "User"} ${currentUser.lastName || ""}</p>
                        </div>
                        <ul style="list-style: none; padding: 0; margin: 0;">
                            <li><a href="profile.html" style="display: block; padding: 12px 15px; color: #333; text-decoration: none; font-size: 14px;"><i class="fa-solid fa-user-gear" style="margin-right: 8px;"></i> Profile</a></li>
                            <li><a href="#" id="logoutBtn" style="display: block; padding: 12px 15px; color: #e53935; text-decoration: none; font-size: 14px; border-top: 1px solid #eee;"><i class="fa-solid fa-right-from-bracket" style="margin-right: 8px;"></i> Logout</a></li>
                        </ul>
                    </div>
                </div>
            `;
            updateCartCount();

            const profileToggleBtn = document.getElementById("profileToggleBtn");
            const profileDropdown = document.getElementById("profileDropdown");
            const logoutBtn = document.getElementById("logoutBtn");

            if (profileToggleBtn && profileDropdown) {
                profileToggleBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    profileDropdown.style.display = profileDropdown.style.display === "block" ? "none" : "block";
                });
                window.addEventListener("click", () => {
                    profileDropdown.style.display = "none";
                });
            }

            if (logoutBtn) {
                logoutBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    localStorage.removeItem("currentUser");
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    window.location.href = "index.html";
                });
            }
        }
    } catch (e) { }

   
    try {
        const registerForm = document.getElementById("registerForm");
        if (registerForm) {
            registerForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                const firstName = document.getElementById("firstName").value;
                const lastName = document.getElementById("lastName").value;
                const email = document.getElementById("email").value;
                const password = document.getElementById("password").value;

                try {
                    const response = await fetch("https://restaurantapi.stepacademy.ge/api/auth/register", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Accept": "application/json", "X-API-KEY": apiKey },
                        body: JSON.stringify({ firstName, lastName, email, password })
                    });
                    const data = await response.json();
                    if (response.ok) {
                        alert("რეგისტრაცია წარმატებით დასრულდა!");
                        registerForm.reset();
                        window.location.href = "login.html";
                    } else {
                        alert("შეცდომა რეგისტრაციისას: " + (data.detail || JSON.stringify(data.errors || "უცნობი შეცდომა")));
                    }
                } catch (err) {
                    alert("სერვერთან კავშირის შეცდომა!");
                }
            });
        }
    } catch (e) {  }

   
    try {
        const loginForm = document.getElementById("loginForm");
        if (loginForm) {
            loginForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                const email = document.getElementById("email").value;
                const password = document.getElementById("password").value;

                try {
                    const response = await fetch("https://restaurantapi.stepacademy.ge/api/auth/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Accept": "application/json", "X-API-KEY": apiKey },
                        body: JSON.stringify({ email, password })
                    });
                    const data = await response.json();
                    if (response.ok) {
                        alert("ავტორიზაცია წარმატებულია!");
                        if (data.token) localStorage.setItem("accessToken", data.token);
                        if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
                        
                        const userObj = { firstName: data.firstName || "მომხმარებელი", lastName: data.lastName || "", email: email };
                        localStorage.setItem("currentUser", JSON.stringify(userObj));
                        window.location.href = "index.html";
                    } else {
                        alert("შეცდომა შესვლისას: " + (data.detail || "არასწორი მეილი ან პაროლი"));
                    }
                } catch (err) {
                    alert("სერვერთან კავშირის შეცდომა!");
                }
            });
        }
    } catch (e) {  }

   
    try {
        const togglePassword = document.getElementById("togglePassword");
        const passwordInput = document.getElementById("password");
        if (togglePassword && passwordInput) {
            togglePassword.addEventListener("click", () => {
                const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
                passwordInput.setAttribute("type", type);
                togglePassword.classList.toggle("fa-eye");
                togglePassword.classList.toggle("fa-eye-slash");
            });
        }
    } catch (e) { }

});



function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll(".cart-count").forEach(el => {
        el.textContent = totalCount;
    });
}

function renderCartPage() {
    
    const cartContainer = document.getElementById("cartItemsContainer") || document.querySelector(".cart-items-container") || document.querySelector("main");
    if (!cartContainer) return; 

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    
    let itemsWrapper = document.getElementById("cartItemsContainer") || document.querySelector(".cart-items-container");
    
    if (!itemsWrapper) return;

    itemsWrapper.innerHTML = "";

    const itemsCountText = document.querySelector(".items-count-text");
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (itemsCountText) {
        itemsCountText.textContent = `${totalItems} items`;
    }

    if (cart.length === 0) {
        itemsWrapper.innerHTML = `<p style="text-align: center; color: #777; padding: 40px; font-size: 1.1rem;">თქვენი კალათა ცარიელია</p>`;
        updateSummary(0);
        return;
    }

    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const card = document.createElement("div");
        card.classList.add("cart-item-card");
        card.style.cssText = "display: flex; align-items: center; justify-content: space-between; background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.04); margin-bottom: 20px;";

        card.innerHTML = `
            <div style="display: flex; align-items: center; gap: 20px;">
                <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 10px;">
                <div>
                    <h4 style="margin: 0 0 5px 0; font-size: 1.1rem; color: #222;">${item.name}</h4>
                    <p style="margin: 0 0 10px 0; color: #666; font-size: 0.85rem;">გემრიელი კერძი</p>
                    <div style="display: flex; align-items: center; border: 1px solid #ddd; border-radius: 6px; width: fit-content; overflow: hidden;">
                        <button onclick="changeQuantity('${item.id}', -1)" style="background: #f9f9f9; border: none; padding: 4px 10px; cursor: pointer;">-</button>
                        <span style="padding: 0 10px; font-weight: 600;">${item.quantity}</span>
                        <button onclick="changeQuantity('${item.id}', 1)" style="background: #f9f9f9; border: none; padding: 4px 10px; cursor: pointer;">+</button>
                    </div>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 30px;">
                <div style="text-align: right;">
                    <span style="display: block; font-size: 0.8rem; color: #888;">$${item.price.toFixed(2)} each</span>
                    <span style="font-weight: bold; font-size: 1.1rem; color: #ff5722;">$${itemTotal.toFixed(2)}</span>
                </div>
                <button onclick="removeItem('${item.id}')" style="background: transparent; border: none; color: #e53935; cursor: pointer; font-size: 1.1rem;">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        itemsWrapper.appendChild(card);
    });

    updateSummary(subtotal);
}

function changeQuantity(id, delta) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let item = cart.find(i => i.id == id);

    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id != id);
        }
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    renderCartPage();
    updateCartCount();
}

function removeItem(id) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart = cart.filter(i => i.id != id);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCartPage();
    updateCartCount();
}

function updateSummary(subtotal) {
    let tax = subtotal * 0.10;
    let total = subtotal + tax;

    const subtotalEl = document.getElementById("subtotalPrice");
    const taxEl = document.getElementById("taxPrice");
    const totalEl = document.getElementById("totalPrice");

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}