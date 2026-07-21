let cart = JSON.parse(localStorage.getItem("umCart")) || [];

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll("#cartCount").forEach(el => {
        el.textContent = count;
    });
}

function showToast(message) {
    let toast = document.querySelector(".toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.className = "toast";
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    localStorage.setItem("umCart", JSON.stringify(cart));
    updateCartCount();
    showToast(`${product.name} added to cart!`);
}

function renderProducts(containerId, productList) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = productList.map(p => `
        <div class="product-card">
            <div class="product-image" style="background:${p.color}">${p.image}</div>
            <div class="product-info">
                <span class="product-category">${p.category}</span>
                <h3>${p.name}</h3>
                <p>${p.description}</p>
                <div class="product-price">PKR ${p.price.toLocaleString()}</div>
                <button class="add-to-cart" onclick="addToCart(${p.id})">Add to Cart</button>
            </div>
        </div>
    `).join("");
}

function renderCart() {
    const container = document.getElementById("cartItems");
    const summary = document.getElementById("cartSummary");
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `<p class="empty-cart">Your cart is empty. <a href="products.html">Browse products</a></p>`;
        if (summary) summary.style.display = "none";
        updateCartCount();
        return;
    }

    if (summary) summary.style.display = "block";

    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image" style="background:${item.color}">${item.image}</div>
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>PKR ${item.price.toLocaleString()}</p>
            </div>
            <div class="cart-item-actions">
                <button class="qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
                <span>${item.qty}</span>
                <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
                <button class="remove-btn" onclick="removeItem(${item.id})">&times;</button>
            </div>
        </div>
    `).join("");

    updateSummary();
}

function updateQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
        cart = cart.filter(i => i.id !== id);
    }
    localStorage.setItem("umCart", JSON.stringify(cart));
    renderCart();
    updateCartCount();
}

function removeItem(id) {
    cart = cart.filter(i => i.id !== id);
    localStorage.setItem("umCart", JSON.stringify(cart));
    renderCart();
    updateCartCount();
    showToast("Item removed from cart.");
}

function updateSummary() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const tax = Math.round(subtotal * 0.1);
    const total = subtotal + tax;
    const subEl = document.getElementById("subtotal");
    const taxEl = document.getElementById("tax");
    const totalEl = document.getElementById("total");
    if (subEl) subEl.textContent = `PKR ${subtotal.toLocaleString()}`;
    if (taxEl) taxEl.textContent = `PKR ${tax.toLocaleString()}`;
    if (totalEl) totalEl.textContent = `PKR ${total.toLocaleString()}`;
    updateCartCount();
}

// ---------- Page specific logic ----------

document.addEventListener("DOMContentLoaded", () => {

    // Hamburger menu
    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("navLinks");
    if (hamburger && navLinks) {
        hamburger.addEventListener("click", () => {
            navLinks.classList.toggle("open");
        });
        document.addEventListener("click", (e) => {
            if (!e.target.closest(".navbar")) {
                navLinks.classList.remove("open");
            }
        });
    }

    updateCartCount();

    // ---- Home page - featured products ----
    const featuredContainer = document.getElementById("featuredProducts");
    if (featuredContainer) {
        const featured = products.slice(0, 4);
        renderProducts("featuredProducts", featured);
    }

    // ---- Products page ----
    const allContainer = document.getElementById("allProducts");
    if (allContainer) {
        renderProducts("allProducts", products);

        // Filter buttons
        const filterBtns = document.querySelectorAll(".filter-btn");
        filterBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                filterBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                const cat = btn.dataset.category;
                const filtered = cat === "all" ? products : products.filter(p => p.category === cat);
                renderProducts("allProducts", filtered);
            });
        });
    }

    // ---- Cart page ----
    if (document.getElementById("cartItems")) {
        renderCart();

        const checkoutBtn = document.getElementById("checkoutBtn");
        const clearBtn = document.getElementById("clearCartBtn");
        if (checkoutBtn) {
            checkoutBtn.addEventListener("click", () => {
                if (cart.length === 0) return;
                showToast("Order placed successfully! Thank you for shopping with UM Software.");
                cart = [];
                localStorage.setItem("umCart", JSON.stringify(cart));
                renderCart();
                updateCartCount();
            });
        }
        if (clearBtn) {
            clearBtn.addEventListener("click", () => {
                if (cart.length === 0) return;
                cart = [];
                localStorage.setItem("umCart", JSON.stringify(cart));
                renderCart();
                updateCartCount();
                showToast("Cart cleared.");
            });
        }
    }

    // ---- Contact form ----
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            showToast("Thank you! Your message has been sent. We'll get back to you soon.");
            contactForm.reset();
        });
    }
});
