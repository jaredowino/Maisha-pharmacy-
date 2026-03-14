/* ─── UTILITY ─────────────────────────────── */
function $(id){ return document.getElementById(id); }
function $$(sel){ return document.querySelectorAll(sel); }

/* ─── STORE ─────────────────────────────── */
var Store = {
  getProducts: () => JSON.parse(localStorage.getItem('products') || '[]'),
  saveProducts: d => localStorage.setItem('products', JSON.stringify(d)),
  getOrders:   () => JSON.parse(localStorage.getItem('orders')   || '[]'),
  saveOrders:  d => localStorage.setItem('orders',   JSON.stringify(d)),
  getGallery:  () => JSON.parse(localStorage.getItem('gallery')  || '[]'),
  saveGallery: d => localStorage.setItem('gallery',  JSON.stringify(d)),
};

/* ─── DEFAULT PRODUCTS ─────────────────────────────── */
var DEFAULT_PRODUCTS = [
  {id:'p01', name:'Paracetamol 500mg',        category:'Pain Relief',    price:50,  description:'Fast-acting relief for mild to moderate pain and fever. Pack of 24.'},
  {id:'p02', name:'Ibuprofen 400mg',           category:'Pain Relief',    price:85,  description:'Anti-inflammatory for pain, swelling and fever. Pack of 20.'},
  {id:'p03', name:'Amoxicillin 250mg',         category:'Antibiotics',    price:180, description:'Broad-spectrum antibiotic. Prescription required. Pack of 21.'},
  {id:'p04', name:'Ciprofloxacin 500mg',       category:'Antibiotics',    price:240, description:'Treats bacterial infections. Prescription required. Pack of 14.'},
  {id:'p05', name:'Metformin 850mg',           category:'Diabetes',       price:280, description:'Blood sugar management for Type 2 diabetes. Pack of 30.'},
  {id:'p06', name:'Atorvastatin 20mg',         category:'Cardiovascular', price:420, description:'Lowers cholesterol and protects the heart. Pack of 30.'},
  {id:'p07', name:'Salbutamol Inhaler',        category:'Respiratory',    price:650, description:'Relieves bronchospasm and asthma attacks. 200 doses.'},
  {id:'p08', name:'ORS Sachets',               category:'Rehydration',    price:30,  description:'Oral rehydration salts for dehydration. Box of 10.'},
  {id:'p09', name:'Vitamin C 1000mg',          category:'Vitamins',       price:250, description:'Immune support & antioxidant. 30 effervescent tablets.'},
  {id:'p10', name:'Multivitamin Tablets',      category:'Vitamins',       price:380, description:'Complete daily nutrition support. Bottle of 60.'},
  {id:'p11', name:'Omeprazole 20mg',           category:'Digestive',      price:200, description:'Acid reflux and ulcer treatment. Pack of 14 capsules.'},
  {id:'p12', name:'Loperamide 2mg',            category:'Digestive',      price:80,  description:'Rapid diarrhoea relief. Pack of 12 capsules.'},
  {id:'p13', name:'Artemether/Lumefantrine',   category:'Malaria',        price:550, description:'First-line malaria treatment. Prescription required. Blister of 24.'},
  {id:'p14', name:'Cetirizine 10mg',           category:'Allergy',        price:90,  description:'Non-drowsy allergy and hay fever relief. Pack of 14.'},
  {id:'p15', name:'Hydrocortisone Cream',      category:'Skin Care',      price:160, description:'Reduces skin inflammation and itching. 30g tube.'},
  {id:'p16', name:'Clotrimazole Cream',        category:'Skin Care',      price:190, description:'Antifungal treatment for skin infections. 20g tube.'},
  {id:'p17', name:'Cough Syrup Adult',         category:'Cold & Flu',     price:220, description:'Soothes dry and chesty coughs. 100ml bottle.'},
  {id:'p18', name:'Nasal Decongestant Spray',  category:'Cold & Flu',     price:180, description:'Fast relief from blocked sinuses. 15ml bottle.'},
  {id:'p19', name:'Zinc Sulphate 20mg',        category:'Vitamins',       price:150, description:'Immune and growth support. Pack of 30 tablets.'},
  {id:'p20', name:'Oral Contraceptives',       category:'Reproductive',   price:120, description:'Daily contraceptive pill. Monthly pack of 28.'},
];

/* ─── DEFAULT GALLERY ─────────────────────────────── */
var DEFAULT_GALLERY = [
  {id:'g01', url:'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&q=80', caption:'Our dispensing counter'},
  {id:'g02', url:'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=600&q=80', caption:'Wide range of medicines'},
  {id:'g03', url:'https://images.unsplash.com/photo-1563213126-a4273aed2016?w=600&q=80',    caption:'Pharmacy interior'},
  {id:'g04', url:'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&q=80', caption:'Health & wellness products'},
  {id:'g05', url:'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=80', caption:'Our professional team'},
  {id:'g06', url:'https://images.unsplash.com/photo-1550572017-edd951b55104?w=600&q=80',    caption:'Vitamins & supplements'},
];

/* ─── CART ─────────────────────────────── */
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

/* ─── TOAST ─────────────────────────────── */
function showToast(msg, duration = 2800) {
  let existing = document.querySelector('.toast');
  if (existing) existing.remove();
  let t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(10px)';
    t.style.transition = 'all 0.3s';
    setTimeout(() => t.remove(), 320);
  }, duration);
}

/* ─── INIT ─────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  if (Store.getProducts().length === 0) Store.saveProducts(DEFAULT_PRODUCTS);
  if (Store.getGallery().length  === 0) Store.saveGallery(DEFAULT_GALLERY);

  buildCategoryFilter();
  displayProducts('All');
  loadGallery();
  updateCartUI();
  loadOrdersDashboard();
  setupPrescriptionPreview();
});

/* ─── CATEGORY FILTER ─────────────────────────────── */
function buildCategoryFilter() {
  let container = $('categoryFilter');
  if (!container) return;
  container.innerHTML = '';
  let categories = ['All', ...new Set(Store.getProducts().map(p => p.category))];
  categories.forEach((cat, i) => {
    let btn = document.createElement('button');
    btn.textContent = cat;
    btn.className = 'cat-btn' + (i === 0 ? ' active' : '');
    btn.onclick = () => {
      $$('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      displayProducts(cat);
    };
    container.appendChild(btn);
  });
}

/* ─── DISPLAY PRODUCTS ─────────────────────────────── */
function displayProducts(category) {
  let container = $('productContainer');
  if (!container) return;
  let all  = Store.getProducts();
  let list = category === 'All' ? all : all.filter(p => p.category === category);
  container.innerHTML = '';
  if (!list.length) {
    container.innerHTML = '<p style="color:var(--text-soft);padding:1rem 0;">No products found.</p>';
    return;
  }
  list.forEach((p, idx) => {
    let card = document.createElement('div');
    card.className = 'product';
    card.style.animationDelay = (idx * 0.06) + 's';
    card.innerHTML = `
      <div class="product-category">${p.category}</div>
      <h3>${p.name}</h3>
      <p class="product-desc">${p.description}</p>
      <p class="product-price">Ksh ${p.price.toLocaleString()}</p>
      <button onclick="addToCart('${p.id}','${escHtml(p.name)}',${p.price})">Add to Cart</button>
    `;
    container.appendChild(card);
  });
}

/* ─── SEARCH ─────────────────────────────── */
function searchProducts() {
  let q = ($('searchInput')?.value || '').toLowerCase().trim();
  if (!q) { displayProducts('All'); buildCategoryFilter(); return; }
  let list = Store.getProducts().filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q)
  );
  let container = $('productContainer');
  if (!container) return;
  container.innerHTML = '';
  if (!list.length) {
    container.innerHTML = '<p style="color:var(--text-soft);padding:1rem 0;">No products matched your search.</p>';
    return;
  }
  list.forEach((p, idx) => {
    let card = document.createElement('div');
    card.className = 'product';
    card.style.animationDelay = (idx * 0.06) + 's';
    card.innerHTML = `
      <div class="product-category">${p.category}</div>
      <h3>${p.name}</h3>
      <p class="product-desc">${p.description}</p>
      <p class="product-price">Ksh ${p.price.toLocaleString()}</p>
      <button onclick="addToCart('${p.id}','${escHtml(p.name)}',${p.price})">Add to Cart</button>
    `;
    container.appendChild(card);
  });
}

/* ─── CART FUNCTIONS ─────────────────────────────── */
function addToCart(id, name, price) {
  let item = cart.find(i => i.id === id);
  if (item) item.qty++;
  else cart.push({ id, name, price, qty: 1 });
  saveCart();
  updateCartUI();
  showToast(`✓ ${name} added to cart`);
}

function saveCart() { localStorage.setItem('cart', JSON.stringify(cart)); }
function increaseQty(i) { cart[i].qty++; saveCart(); updateCartUI(); }
function decreaseQty(i) { cart[i].qty > 1 ? cart[i].qty-- : cart.splice(i, 1); saveCart(); updateCartUI(); }
function removeItem(i)  { let n = cart[i].name; cart.splice(i, 1); saveCart(); updateCartUI(); showToast(`Removed ${n} from cart`); }

function updateCartUI() {
  let container = $('cartItems');
  if (!container) return;
  let total = 0;
  container.innerHTML = '';

  if (!cart.length) {
    container.innerHTML = '<p style="color:var(--text-soft);padding:0.5rem 0;">Your cart is empty.</p>';
    if ($('cartTotal')) $('cartTotal').textContent = '';
    $$('#cartCount').forEach(s => s.textContent = '0');
    return;
  }

  cart.forEach((item, i) => {
    total += item.price * item.qty;
    let row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <span>${item.name}</span>
      <div class="cart-controls">
        <button onclick="decreaseQty(${i})">−</button>
        <span>${item.qty}</span>
        <button onclick="increaseQty(${i})">+</button>
      </div>
      <span>Ksh ${(item.price * item.qty).toLocaleString()}</span>
      <button onclick="removeItem(${i})" title="Remove">✕</button>
    `;
    container.appendChild(row);
  });

  if ($('cartTotal')) $('cartTotal').textContent = 'Total: Ksh ' + total.toLocaleString();
  $$('#cartCount').forEach(s => s.textContent = cart.reduce((a, b) => a + b.qty, 0));
}

function openCheckout() {
  if (!cart.length) { showToast('🛒 Your cart is empty'); return; }
  let sec = $('checkoutSection');
  if (sec) { sec.style.display = 'block'; sec.scrollIntoView({ behavior: 'smooth' }); }
}

/* ─── PLACE ORDER ─────────────────────────────── */
function placeOrder() {
  let name     = $('customerName')?.value.trim();
  let phone    = $('customerPhone')?.value.trim();
  let location = $('customerLocation')?.value.trim() || '';
  if (!name || !phone) { showToast('⚠️ Please fill in your name and phone number'); return; }

  let orders = Store.getOrders();
  let order  = {
    id: 'ORD-' + Date.now(),
    name, phone, location,
    items: cart.map(i => ({ ...i })),
    total: cart.reduce((a, b) => a + b.price * b.qty, 0),
    status: 'Pending',
    timestamp: Date.now()
  };
  orders.push(order);
  Store.saveOrders(orders);
  cart = [];
  saveCart();
  updateCartUI();
  if ($('checkoutSection')) $('checkoutSection').style.display = 'none';
  loadOrdersDashboard();
  showToast("✅ Order placed! We'll be in touch shortly.");
}

/* ─── WHATSAPP ORDER ─────────────────────────────── */
function sendWhatsAppOrder() {
  if (!cart.length) { showToast('🛒 Your cart is empty'); return; }
  let msg = '🌿 *Maisha Pharmacy Order*\n\n';
  cart.forEach(i => msg += `• ${i.name} × ${i.qty} — Ksh ${(i.price * i.qty).toLocaleString()}\n`);
  msg += `\n*Total: Ksh ${cart.reduce((a, b) => a + b.price * b.qty, 0).toLocaleString()}*`;
  window.open('https://wa.me/254741593962?text=' + encodeURIComponent(msg), '_blank');
}

/* ─── ORDERS DASHBOARD ─────────────────────────────── */
function loadOrdersDashboard() {
  let container = $('ordersContainer');
  if (!container) return;
  let orders = Store.getOrders().sort((a, b) => b.timestamp - a.timestamp);
  container.innerHTML = '';
  if (!orders.length) {
    container.innerHTML = '<p style="color:var(--text-soft);">No orders yet.</p>';
    return;
  }
  orders.forEach(o => {
    let items   = o.items.map(i => `${i.name} ×${i.qty}`).join(', ');
    let dateStr = new Date(o.timestamp).toLocaleDateString('en-KE', {
      day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'
    });
    let statusClass = o.status === 'Completed' ? 'status-completed' : 'status-pending';
    let card = document.createElement('div');
    card.className = 'order-card';
    card.id = 'order-' + o.id;
    card.innerHTML = `
      <p><strong>${o.name}</strong> · ${o.phone}${o.location ? ' · ' + o.location : ''}</p>
      <p>🛒 ${items}</p>
      <p>💰 <strong>Ksh ${o.total.toLocaleString()}</strong></p>
      <p>Status: <span id="status-${o.id}" class="${statusClass}">${o.status}</span></p>
      <p style="color:var(--text-soft);font-size:0.78rem;margin-top:4px;">📅 ${dateStr} · ID: ${o.id}</p>
      <button onclick="toggleOrderStatus('${o.id}')">Toggle Status</button>
    `;
    container.appendChild(card);
  });
}

function toggleOrderStatus(orderId) {
  let orders = Store.getOrders();
  let idx    = orders.findIndex(o => o.id === orderId);
  if (idx === -1) return;
  orders[idx].status = orders[idx].status === 'Pending' ? 'Completed' : 'Pending';
  Store.saveOrders(orders);
  let el = $('status-' + orderId);
  if (el) {
    el.textContent = orders[idx].status;
    el.className   = orders[idx].status === 'Completed' ? 'status-completed' : 'status-pending';
  }
}

/* ─── GALLERY ─────────────────────────────── */
function loadGallery() {
  let container = $('galleryContainer');
  if (!container) return;
  container.innerHTML = '';
  Store.getGallery().forEach(g => {
    let img     = document.createElement('img');
    img.src     = g.url;
    img.alt     = g.caption;
    img.title   = g.caption;
    img.loading = 'lazy';
    img.onclick = () => openLightbox(g.url);
    container.appendChild(img);
  });
}

function openLightbox(url) {
  let lb = $('lightbox');
  if (!lb) return;
  lb.style.display = 'flex';
  let img = $('lightbox-img');
  if (img) img.src = url;
}
function closeLightbox() {
  let lb = $('lightbox');
  if (lb) lb.style.display = 'none';
}

/* ─── PRESCRIPTION PREVIEW ─────────────────────────────── */
function setupPrescriptionPreview() {
  let input = $('prescriptionFile');
  if (!input) return;
  input.addEventListener('change', function () {
    let file    = this.files[0];
    let preview = $('prescriptionPreview');
    if (!preview) return;
    if (!file) { preview.innerHTML = ''; return; }
    if (file.type.startsWith('image/')) {
      let reader = new FileReader();
      reader.onload = e => {
        preview.innerHTML = `<img src="${e.target.result}" style="max-width:200px;max-height:180px;margin-top:8px;">`;
      };
      reader.readAsDataURL(file);
    } else {
      preview.innerHTML = `<p style="font-size:0.85rem;color:var(--forest);margin-top:6px;">📄 ${escHtml(file.name)}</p>`;
    }
  });
}

/* ─── HELPERS ─────────────────────────────── */
function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
   }
  
