// Глобальні змінні
let products = [];
let cart = [];
let currentCategory = 'all';

// DOM елементи
const productsGrid = document.getElementById('productsGrid');
const cartBtn = document.getElementById('cartBtn');
const cartModal = document.getElementById('cartModal');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const clearCart = document.getElementById('clearCart');
const checkout = document.getElementById('checkout');
const filterBtns = document.querySelectorAll('.filter-btn');
const categoryCards = document.querySelectorAll('.category-card');
const contactForm = document.getElementById('contactForm');

// Ініціалізація при завантаженні сторінки
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupEventListeners();
    loadCartFromStorage();
    updateCartDisplay();
});

// Налаштування обробників подій
function setupEventListeners() {
    // Кошик
    cartBtn.addEventListener('click', openCart);
    closeCart.addEventListener('click', closeCartModal);
    clearCart.addEventListener('click', clearCartItems);
    checkout.addEventListener('click', checkoutOrder);
    
    // Закриття модального вікна при кліку поза ним
    cartModal.addEventListener('click', function(e) {
        if (e.target === cartModal) {
            closeCartModal();
        }
    });
    
    // Фільтри товарів
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            filterProducts(category);
            
            // Оновлення активного стану кнопок
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Категорії
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = this.dataset.category;
            filterProducts(category);
            
            // Оновлення активного стану кнопок фільтрів
            filterBtns.forEach(btn => btn.classList.remove('active'));
            document.querySelector(`[data-category="${category}"]`).classList.add('active');
            
            // Прокрутка до товарів
            document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
        });
    });
    
    // Форма контактів
    contactForm.addEventListener('submit', handleContactSubmit);
    
    // Плавна прокрутка для навігації
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Завантаження товарів з API
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Помилка завантаження товарів:', error);
        displayProducts([]);
    }
}

// Відображення товарів
function displayProducts(productsToShow) {
    if (productsToShow.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-search"></i>
                <h3>Товари не знайдено</h3>
                <p>Спробуйте змінити фільтр або категорію</p>
            </div>
        `;
        return;
    }
    
    productsGrid.innerHTML = productsToShow.map(product => `
        <div class="product-card" data-category="${product.category}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="product-image-placeholder" style="display: none;">
                    <i class="fas fa-gem"></i>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">${product.price} грн</div>
                <button class="add-to-cart" onclick="addToCart(${product.id})">
                    <i class="fas fa-shopping-cart"></i> Додати в кошик
                </button>
            </div>
        </div>
    `).join('');
}

// Фільтрація товарів
function filterProducts(category) {
    currentCategory = category;
    
    if (category === 'all') {
        displayProducts(products);
    } else {
        const filteredProducts = products.filter(product => product.category === category);
        displayProducts(filteredProducts);
    }
}

// Функції кошика
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    saveCartToStorage();
    updateCartDisplay();
    
    // Анімація додавання в кошик
    showAddToCartAnimation();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCartToStorage();
    updateCartDisplay();
}

function updateCartQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            saveCartToStorage();
            updateCartDisplay();
        }
    }
}

function updateCartDisplay() {
    // Оновлення лічильника товарів
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Оновлення вмісту кошика
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Ваш кошик порожній</p>
            </div>
        `;
        cartTotal.textContent = '0';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.price} грн</p>
                </div>
                <div class="cart-item-controls">
                    <button onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    <button onclick="removeFromCart(${item.id})" class="remove-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = total;
    }
}

function openCart() {
    cartModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeCartModal() {
    cartModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function clearCartItems() {
    cart = [];
    saveCartToStorage();
    updateCartDisplay();
    closeCartModal();
}

function checkoutOrder() {
    if (cart.length === 0) {
        alert('Ваш кошик порожній!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    alert(`Дякуємо за замовлення! Загальна сума: ${total} грн\n\nНаш менеджер зв\'яжеться з вами найближчим часом.`);
    
    clearCartItems();
}

// Збереження та завантаження кошика з localStorage
function saveCartToStorage() {
    localStorage.setItem('soulJewelryCart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('soulJewelryCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Анімація додавання в кошик
function showAddToCartAnimation() {
    cartBtn.style.transform = 'scale(1.2)';
    setTimeout(() => {
        cartBtn.style.transform = 'scale(1)';
    }, 200);
}

// Обробка форми контактів
function handleContactSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    
    // Тут можна додати відправку даних на сервер
    alert(`Дякуємо за повідомлення, ${name}!\n\nМи зв'яжемося з вами найближчим часом.`);
    
    e.target.reset();
}

// Функція для прокрутки до секції
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Додавання стилів для порожнього кошика
const style = document.createElement('style');
style.textContent = `
    .empty-cart {
        text-align: center;
        padding: 2rem;
        color: #666;
    }
    
    .empty-cart i {
        font-size: 3rem;
        margin-bottom: 1rem;
        color: #ccc;
    }
    
    .cart-item-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .cart-item-controls button {
        background: #667eea;
        color: white;
        border: none;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .cart-item-controls .remove-btn {
        background: #e74c3c;
        margin-left: 0.5rem;
    }
    
    .no-products {
        text-align: center;
        padding: 3rem;
        color: #666;
    }
    
    .no-products i {
        font-size: 4rem;
        margin-bottom: 1rem;
        color: #ccc;
    }
`;
document.head.appendChild(style); 