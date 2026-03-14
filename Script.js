// ─── STORE ─────────────────────────────────────────────
var Store = {
  getProducts: () => JSON.parse(localStorage.getItem('products') || '[]'),
  saveProducts: (d) => localStorage.setItem('products', JSON.stringify(d)),
  getOrders: () => JSON.parse(localStorage.getItem('orders') || '[]'),
  saveOrders: (d) => localStorage.setItem('orders', JSON.stringify(d)),
  getGallery: () => JSON.parse(localStorage.getItem('gallery') || '[]'),
  saveGallery: (d) => localStorage.setItem('gallery', JSON.stringify(d)),
};

// ─── DEFAULT DATA ─────────────────────────────────────────────
var DEFAULT_PRODUCTS = [
  {id:'p01',name:'Paracetamol 500mg',category:'Pain Relief',price:50,description:'Relieves mild to moderate pain and fever'},
  {id:'p02',name:'Ibuprofen 400mg',category:'Pain Relief',price:85,description:'Anti-inflammatory pain reliever'},
  {id:'p03',name:'Amoxicillin 250mg',category:'Antibiotics',price:180,description:'Broad-spectrum antibiotic (prescription)'},
];

var DEFAULT_GALLERY = [
  {id:'g01',url:'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&q=80',caption:'Our dispensing counter'},
  {id:'g02',url:'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=400&q=80',caption:'Wide range of medicines'},
];

// ─── INIT ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  if(Store.getProducts().length===0) Store.saveProducts(DEFAULT_PRODUCTS);
  if(Store.getGallery().length===0) Store.saveGallery(DEFAULT_GALLERY);
  buildCategoryFilter();
  displayProducts('All');
  loadGallery();
  updateCartUI();
  loadOrdersDashboard();
});

// ─── CATEGORY FILTER ─────────────────────────────
function buildCategoryFilter(){
  var container = document.getElementById('categoryFilter');
  container.innerHTML = '';
  var products = Store.getProducts();
  var categories = ['All', ...new Set(products.map(p=>p.category))];
  categories.forEach((cat,i)=>{
    let btn=document.createElement('button');
    btn.textContent=cat;
    btn.className='cat-btn'+(i===0?' active':'');
    btn.onclick = () => { document.querySelectorAll('.cat-btn').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); displayProducts(cat);}
    container.appendChild(btn);
  });
}

// ─── DISPLAY PRODUCTS ─────────────────────────────
function displayProducts(category){
  let container=document.getElementById('productContainer');
  let products = Store.getProducts();
  container.innerHTML='';
  let filtered = (category==='All')?products:products.filter(p=>p.category===category);
  filtered.forEach(p=>{
    container.innerHTML += `
      <div class="product">
        <div class="product-category">${p.category}</div>
        <h3>${p.name}</h3>
        <p class="product-desc">${p.description}</p>
        <p class="product-price">Ksh ${p.price}</p>
        <button onclick="addToCart('${p.name}',${p.price})">Add to Cart</button>
      </div>
    `;
  });
}

// ─── SEARCH ─────────────────────────────
function searchProducts(){
  let query = document.getElementById('searchInput').value.toLowerCase();
  displayProducts('All');
  if(query==='') return;
  let products = Store.getProducts().filter(p=>p.name.toLowerCase().includes(query)||p.category.toLowerCase().includes(query));
  let container=document.getElementById('productContainer');
  container.innerHTML='';
  products.forEach(p=>{
    container.innerHTML += `
      <div class="product">
        <div class="product-category">${p.category}</div>
        <h3>${p.name}</h3>
        <p class="product-desc">${p.description}</p>
        <p class="product-price">Ksh ${p.price}</p>
        <button onclick="addToCart('${p.name}',${p.price})">Add to Cart</button>
      </div>
    `;
  });
}

// ─── CART ─────────────────────────────
let cart = JSON.parse(localStorage.getItem("cart"))||[];

function addToCart(name,price){
  let item = cart.find(i=>i.name===name);
  if(item) item.qty++;
  else cart.push({name:name,price:price,qty:1});
  saveCart(); updateCartUI();
}

function saveCart(){ localStorage.setItem("cart",JSON.stringify(cart)); }
function increaseQty(i){ cart[i].qty++; saveCart(); updateCartUI(); }
function decreaseQty(i){ cart[i].qty>1?cart[i].qty--:cart.splice(i,1); saveCart(); updateCartUI(); }
function removeItem(i){ cart.splice(i,1); saveCart(); updateCartUI(); }

function updateCartUI(){
  let container=document.getElementById("cartItems");
  let count=document.getElementById("cartCount");
  container.innerHTML=''; let total=0;
  if(cart.length===0){ container.innerHTML="<p>Your cart is empty 🛒</p>"; document.getElementById("cartTotal").innerText=""; count.innerText="0"; return; }
  cart.forEach((item,i)=>{
    total+=item.price*item.qty;
    container.innerHTML+=`
      <div class="cart-item">
        <span>${item.name}</span>
        <div class="cart-controls">
          <button onclick="decreaseQty(${i})">−</button>
          <span>${item.qty}</span>
          <button onclick="increaseQty(${i})">+</button>
        </div>
        <span>Ksh ${item.price*item.qty}</span>
        <button onclick="removeItem(${i})">❌</button>
      </div>`;
  });
  document.getElementById("cartTotal").innerText="Total: Ksh "+total;
  count.innerText=cart.length;
}

function openCheckout(){ if(cart.length===0){alert("Cart is empty");return;} document.getElementById("checkoutSection").style.display="block"; }

// ─── PLACE ORDER ─────────────────────────────
function placeOrder(){
  let name=document.getElementById("customerName").value;
  let phone=document.getElementById("customerPhone").value;
  let location=document.getElementById("customerLocation").value;
  if(!name||!phone){ alert("Fill details"); return; }
  let orders = Store.getOrders();
  let order = {
    id:'o_'+Date.now(),
    name:name, phone:phone, location:location,
    items:[...cart],
    total:cart.reduce((a,b)=>a+b.price*b.qty,0),
    prescription:'',
    status:'Pending',
    timestamp: Date.now()
  };
  orders.push(order); Store.saveOrders(orders);
  alert("Order placed!");
  cart=[]; saveCart(); updateCartUI();
  document.getElementById("checkoutSection").style.display="none";
  loadOrdersDashboard();
}

// ─── WHATSAPP ORDER ─────────────────────────────
function sendWhatsAppOrder(){
  let message="Hello Maisha Pharmacy, I want to order:\n";
  cart.forEach(i=>message+=i.name+" x"+i.qty+"\n");
  let url="https://wa.me/254741593962?text="+encodeURIComponent(message);
  window.open(url);
}

// ─── ORDERS DASHBOARD ─────────────────────────────
function loadOrdersDashboard(){
  const container=document.getElementById("ordersContainer");
  container.innerHTML=''; let orders=Store.getOrders().sort((a,b)=>b.timestamp-a.timestamp);
  if(orders.length===0){ container.innerHTML='<p>No orders yet.</p>'; return; }
  orders.forEach(o=>{
    let items=o.items.map(i=>i.name+' x'+i.qty).join(', ');
    container.innerHTML+=`
      <div class="order-card" id="order-${o.id}">
        <p><strong>${o.name}</strong> | ${o.phone} | ${o.location}</p>
        <p>🛒 ${items}</p>
        <p>💰 Total: Ksh ${o.total}</p>
        <p>Status: <span id="status-${o.id}">${o.status}</span></p>
        <button onclick="toggleOrderStatus('${o.id}')">Toggle Status</button>
        <p style="color:gray;font-size:0.8rem;">Order ID: ${o.id}</p>
      </div>
    `;
  });
}

function toggleOrderStatus(orderId){
  let orders=Store.getOrders();
  let idx=orders.findIndex(o=>o.id===orderId); if(idx===-1)return;
  orders[idx].status = orders[idx].status==='Pending'?'Completed':'Pending';
  Store.saveOrders(orders);
  document.getElementById(`status-${orderId}`).innerText = orders[idx].status;
}

// ─── GALLERY ─────────────────────────────
function loadGallery(){
  let container = $('galleryContainer'); if(!container) return;
  container.innerHTML='';
  let gallery = Store.getGallery();
  gallery.forEach(g=>{
    let img=document.createElement('img');
    img.src=g.url; img.alt=g.caption;
    img.onclick=()=>openLightbox(g.url);
    container.appendChild(img);
  });
}

function openLightbox(url){
  let lb=$('lightbox'); if(!lb) return;
  lb.style.display='flex';
  $('lightbox-img') && ($('lightbox-img').src=url);
}
function closeLightbox(){ $('lightbox') && ($('lightbox').style.display='none'); }

// ─── PRESCRIPTION PREVIEW ─────────────────────────────
function setupPrescriptionPreview(){
  let prescInput = $('prescriptionFile');
  if(!prescInput) return;
  prescInput.addEventListener('change', function(){
    let file = this.files[0];
    let preview = $('prescriptionPreview');
    if(!preview) return;
    if(file && file.type.indexOf('image/')===0){
      let reader = new FileReader();
      reader.onload = e => preview.innerHTML = `<img src="${e.target.result}" style="max-width:200px">`;
      reader.readAsDataURL(file);
    } else if(file){
      preview.innerHTML = `<p>📄 ${file.name}</p>`;
    } else preview.innerHTML = '';
  });
}
