/* =====================================================
   StockMaster – script.js
   All event listeners use addEventListener (no onclick in HTML)
   Data stored/retrieved via localStorage
   ===================================================== */

'use strict';

/* ─────────────────────────────────────────────────────
   CONSTANTS & DEFAULTS
───────────────────────────────────────────────────── */
const DEFAULT_ADMIN = { email: 'admin@stockmaster.com', password: 'admin123', name: 'Admin User' };
const LOW_STOCK_THRESHOLD = 10;
const CRITICAL_THRESHOLD  = 5;
const ITEMS_PER_PAGE      = 8;

const CATEGORY_COLORS = {
  blue:   { bg: '#eff6ff', text: '#3b82f6', barFill: '#3b82f6', pieFill: '#3b82f6' },
  purple: { bg: '#f5f3ff', text: '#8b5cf6', barFill: '#8b5cf6', pieFill: '#8b5cf6' },
  green:  { bg: '#f0fdf4', text: '#22c55e', barFill: '#22c55e', pieFill: '#22c55e' },
  orange: { bg: '#fff7ed', text: '#f97316', barFill: '#f97316', pieFill: '#f97316' },
  red:    { bg: '#fef2f2', text: '#ef4444', barFill: '#ef4444', pieFill: '#ef4444' },
  pink:   { bg: '#fdf2f8', text: '#ec4899', barFill: '#ec4899', pieFill: '#ec4899' },
};

/* ─────────────────────────────────────────────────────
   LOCAL STORAGE HELPERS
───────────────────────────────────────────────────── */
function lsGet(key, fallback = null) {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}
function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch(e) { console.warn('LS write failed', e); }
}

/* ─────────────────────────────────────────────────────
   SEED DEFAULT DATA (only if localStorage is empty)
───────────────────────────────────────────────────── */
function seedData() {
  // Admin credentials
  if (!lsGet('sm_admin')) {
    lsSet('sm_admin', DEFAULT_ADMIN);
  }

  // Categories
  if (!lsGet('sm_categories')) {
    lsSet('sm_categories', [
      { id: 'cat1', name: 'Grocery',     icon: '🛒', color: 'blue'   },
      { id: 'cat2', name: 'Clothing',    icon: '👕', color: 'purple' },
      { id: 'cat3', name: 'Footwear',    icon: '👟', color: 'orange' },
      { id: 'cat4', name: 'Electronics', icon: '💻', color: 'green'  },
    ]);
  }

  // Products
  if (!lsGet('sm_products')) {
    lsSet('sm_products', [
      { id: 'p1',  name: 'Nike Air Max 270',    brand: 'Nike',      category: 'Footwear',    qty: 45,  price: 12999, sku: 'NK-AM270-45' },
      { id: 'p2',  name: 'Adidas Ultraboost',   brand: 'Adidas',    category: 'Footwear',    qty: 8,   price: 15999, sku: 'AD-UB-08'    },
      { id: 'p3',  name: 'Puma RS-X',           brand: 'Puma',      category: 'Footwear',    qty: 0,   price: 9999,  sku: 'PM-RSX-00'   },
      { id: 'p4',  name: 'Zara Slim Fit Jeans', brand: 'Zara',      category: 'Clothing',    qty: 67,  price: 2999,  sku: 'ZA-SFJ-67'   },
      { id: 'p5',  name: 'H&M Cotton T-Shirt',  brand: 'H&M',       category: 'Clothing',    qty: 120, price: 799,   sku: 'HM-CT-120'   },
      { id: 'p6',  name: 'Levis 501 Original',  brand: 'Levis',     category: 'Clothing',    qty: 5,   price: 4999,  sku: 'LV-501-05'   },
      { id: 'p7',  name: 'iPhone 15 Pro',        brand: 'Apple',     category: 'Electronics', qty: 15,  price: 134999,sku: 'AP-IP15P-15'  },
      { id: 'p8',  name: 'Sony WH-1000XM5',     brand: 'Sony',      category: 'Electronics', qty: 7,   price: 29999, sku: 'SN-WH5-07'   },
      { id: 'p9',  name: 'Nestle Maggi Pack',   brand: 'Nestle',    category: 'Grocery',     qty: 450, price: 144,   sku: 'NE-MG-450'   },
      { id: 'p10', name: 'Britannia Biscuits',  brand: 'Britannia', category: 'Grocery',     qty: 6,   price: 40,    sku: 'BR-BS-06'    },
      { id: 'p11', name: 'Amul Butter 500g',    brand: 'Amul',      category: 'Grocery',     qty: 89,  price: 280,   sku: 'AM-BT-89'    },
      { id: 'p12', name: 'Samsung 4K Smart TV', brand: 'Samsung',   category: 'Electronics', qty: 12,  price: 54999, sku: 'SS-4KTV-12'  },
      { id: 'p13', name: 'Puma Track Pants',    brand: 'Puma',      category: 'Clothing',    qty: 3,   price: 1899,  sku: 'PM-TP-03'    },
      { id: 'p14', name: 'Nestle Coffee',       brand: 'Nestle',    category: 'Grocery',     qty: 200, price: 350,   sku: 'NE-CF-200'   },
      { id: 'p15', name: 'Samsung Galaxy S24',  brand: 'Samsung',   category: 'Electronics', qty: 20,  price: 79999, sku: 'SS-GS24-20'  },
    ]);
  }

  // Orders
  if (!lsGet('sm_orders')) {
    lsSet('sm_orders', [
      { id: 'ORD001', date: '2026-04-16', product: 'Nike Air Max 270',    qty: 50,  total: 649950,  status: 'Delivered' },
      { id: 'ORD002', date: '2026-04-15', product: 'Samsung Galaxy S24',  qty: 20,  total: 1599980, status: 'Pending'   },
      { id: 'ORD003', date: '2026-04-14', product: 'Zara Slim Fit Jeans', qty: 100, total: 299900,  status: 'Delivered' },
      { id: 'ORD004', date: '2026-04-13', product: 'Amul Butter 500g',    qty: 200, total: 56000,   status: 'Cancelled' },
      { id: 'ORD005', date: '2026-04-12', product: 'iPhone 15 Pro',       qty: 10,  total: 1349990, status: 'Pending'   },
      { id: 'ORD006', date: '2026-04-10', product: 'H&M Cotton T-Shirt',  qty: 150, total: 119850,  status: 'Delivered' },
      { id: 'ORD007', date: '2026-04-08', product: 'Sony WH-1000XM5',    qty: 15,  total: 449985,  status: 'Delivered' },
      { id: 'ORD008', date: '2026-04-05', product: 'Nestle Maggi Pack',   qty: 500, total: 72000,   status: 'Delivered' },
    ]);
  }

  // Settings
  if (!lsGet('sm_settings')) {
    lsSet('sm_settings', {
      name: 'Admin User', email: 'admin@stockmaster.com', phone: '+91 98765 43210',
      notif1: true, notif2: true, notif3: false, notif4: true, notif5: false,
      language: 'English (US)', timezone: 'IST (Indian Standard Time)', currency: 'INR (₹)',
      darkMode: false,
    });
  }

  // Activity log
  if (!lsGet('sm_activity')) {
    lsSet('sm_activity', [
      { type: 'order',   title: 'New order received',  sub: 'Nike Air Max 270',   time: '5 min ago'    },
      { type: 'alert',   title: 'Low stock alert',     sub: 'Britannia Biscuits', time: '12 min ago'   },
      { type: 'product', title: 'Product added',       sub: 'Samsung Galaxy S24', time: '1 hour ago'   },
      { type: 'ship',    title: 'Order delivered',     sub: 'Zara Slim Fit Jeans',time: '2 hours ago'  },
    ]);
  }
}

/* ─────────────────────────────────────────────────────
   UTILITY
───────────────────────────────────────────────────── */
function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function fmtPrice(n) { return '₹' + Number(n).toLocaleString('en-IN'); }
function fmtDate(d) {
  const date = new Date(d);
  return date.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}
function getStatusBadge(status) {
  const map = { 'In Stock':'badge-green', 'Low Stock':'badge-yellow', 'Out of Stock':'badge-red', 'Delivered':'badge-green', 'Pending':'badge-yellow', 'Cancelled':'badge-red', 'In Transit':'badge-blue' };
  return `<span class="badge ${map[status] || 'badge-gray'}">${esc(status)}</span>`;
}
function getProductStatus(qty) {
  if (qty <= 0) return 'Out of Stock';
  if (qty <= CRITICAL_THRESHOLD) return 'Low Stock';
  if (qty <= LOW_STOCK_THRESHOLD) return 'Low Stock';
  return 'In Stock';
}
function qtyClass(qty) {
  if (qty <= 0 || qty <= CRITICAL_THRESHOLD) return 'qty-critical';
  if (qty <= LOW_STOCK_THRESHOLD) return 'qty-low';
  return 'qty-ok';
}

/* ─────────────────────────────────────────────────────
   TOAST
───────────────────────────────────────────────────── */
function showToast(message, type = 'success') {
  const icons = { success: '✓', error: '✕', info: 'i' };
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<div class="toast-icon">${icons[type]||'i'}</div><div class="toast-msg">${esc(message)}</div>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(30px)';
    toast.style.transition = 'all .3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* ─────────────────────────────────────────────────────
   MODAL HELPERS
───────────────────────────────────────────────────── */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('hidden'); }
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('hidden'); }
}

/* ─────────────────────────────────────────────────────
   LOGIN
───────────────────────────────────────────────────── */
function initLogin() {
  const loginForm  = document.getElementById('loginForm');
  const loginBtn   = document.getElementById('loginBtn');
  const emailInput = document.getElementById('loginEmail');
  const pwInput    = document.getElementById('loginPassword');
  const errorEl    = document.getElementById('loginError');

  if (!loginForm || !loginBtn || !emailInput || !pwInput || !errorEl) return;

  // Auto-fill if remembered
  const remembered = lsGet('sm_remember');
  if (remembered) {
    emailInput.value = remembered.email || '';
  }

  function doLogin(e) {
    if (e) e.preventDefault();
    errorEl.classList.add('hidden');
    errorEl.textContent = '';

    const email = emailInput.value.trim().toLowerCase();
    const pw    = pwInput.value;

    if (!email) { showLoginError('Please enter your email address.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showLoginError('Please enter a valid email address.'); return; }
    if (!pw)    { showLoginError('Please enter your password.');    return; }

    const admin = lsGet('sm_admin') || DEFAULT_ADMIN;
    if (email === admin.email.toLowerCase() && pw === admin.password) {
      // Remember me
      const rememberCheck = document.getElementById('rememberMe');
      if (rememberCheck && rememberCheck.checked) {
        lsSet('sm_remember', { email: admin.email });
      } else {
        localStorage.removeItem('sm_remember');
      }

      lsSet('sm_session', { loggedIn: true, email: admin.email, name: admin.name });
      showApp();
    } else {
      showLoginError('Invalid email or password. Please try again.');
    }
  }

  function showLoginError(msg) {
    errorEl.textContent = msg;
    errorEl.classList.remove('hidden');
  }

  loginBtn.addEventListener('click', doLogin);
  loginForm.addEventListener('submit', doLogin);
  // Allow Enter key in both fields (extra safety)
  emailInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') doLogin(e); });
  pwInput.addEventListener('keydown',   function(e) { if (e.key === 'Enter') doLogin(e); });

  document.getElementById('forgotLink').addEventListener('click', function(e) {
    e.preventDefault();
    const admin = lsGet('sm_admin') || DEFAULT_ADMIN;
    showToast(`Default credentials: ${admin.email} / ${admin.password}`, 'info');
  });
}

/* ─────────────────────────────────────────────────────
   APP INIT / AUTH CHECK
───────────────────────────────────────────────────── */
function showApp() {
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('appContainer').classList.remove('hidden');
  const session = lsGet('sm_session');
  if (session && session.name) {
    document.getElementById('topbarName').textContent = session.name;
  }
  applySettings();
  navigateTo('dashboard');
}

function checkSession() {
  const session = lsGet('sm_session');
  if (session && session.loggedIn) {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    const name = session.name || 'Admin User';
    document.getElementById('topbarName').textContent = name;
    applySettings();
    navigateTo('dashboard');
  } else {
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('appContainer').classList.add('hidden');
  }
}

function applySettings() {
  const settings = lsGet('sm_settings') || {};
  if (settings.darkMode) document.body.classList.add('dark');
  else document.body.classList.remove('dark');
}

/* ─────────────────────────────────────────────────────
   NAVIGATION
───────────────────────────────────────────────────── */
let currentPage = '';

function navigateTo(page) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.classList.add('hidden');
  });
  // Show target page
  const target = document.getElementById('page-' + page);
  if (target) {
    target.classList.remove('hidden');
    target.classList.add('active');
  }
  // Update nav
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.page === page);
  });
  currentPage = page;
  renderPage(page);
}

function renderPage(page) {
  switch (page) {
    case 'dashboard':  renderDashboard();  break;
    case 'categories': renderCategories(); break;
    case 'inventory':  renderInventory();  break;
    case 'orders':     renderOrders();     break;
    case 'shipments':  renderShipments();  break;
    case 'lowstock':   renderLowStock();   break;
    case 'reports':    renderReports();    break;
    case 'settings':   renderSettings();   break;
  }
}

function initNav() {
  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      navigateTo(this.dataset.page);
    });
  });
  
  // Logout button
  const logoutLink = document.getElementById('logoutLink');
  if (logoutLink) {
    logoutLink.addEventListener('click', function(e) {
      e.preventDefault();
      logout();
    });
  }
}

function logout() {
  // Clear the session
  localStorage.removeItem('sm_session');
  localStorage.removeItem('sm_remember');
  // Clear any user-related data
  localStorage.removeItem('sm_admin_name');
  localStorage.removeItem('isLoggedIn');
  // Force redirect to login
  window.location.href = 'index.html';
}

/* ─────────────────────────────────────────────────────
   THEME TOGGLE
───────────────────────────────────────────────────── */
function initTheme() {
  document.getElementById('themeToggle').addEventListener('click', function() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    const settings = lsGet('sm_settings') || {};
    settings.darkMode = isDark;
    lsSet('sm_settings', settings);
  });
}

/* ─────────────────────────────────────────────────────
   GLOBAL SEARCH
───────────────────────────────────────────────────── */
function initGlobalSearch() {
  document.getElementById('globalSearch').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      const q = this.value.trim().toLowerCase();
      if (!q) return;
      // Navigate to inventory and apply search there
      navigateTo('inventory');
      setTimeout(() => {
        document.getElementById('invSearch').value = this.value.trim();
        renderInventoryTable();
        this.value = '';
      }, 100);
    }
  });
}

/* ─────────────────────────────────────────────────────
   CHART INSTANCES (keep references to destroy on re-render)
───────────────────────────────────────────────────── */
const charts = {};
function destroyChart(id) {
  if (charts[id]) { try { charts[id].destroy(); } catch(e){} charts[id] = null; }
}

/* ─────────────────────────────────────────────────────
   DASHBOARD
───────────────────────────────────────────────────── */
function renderDashboard() {
  const products = lsGet('sm_products', []);
  const orders   = lsGet('sm_orders',   []);
  const lowItems = products.filter(p => p.qty <= LOW_STOCK_THRESHOLD && p.qty > 0);
  const outItems = products.filter(p => p.qty === 0);
  const totalRevenue = orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + o.total, 0);

  // Stats
  document.getElementById('dashStats').innerHTML = `
    <div class="stat-card">
      <div class="stat-card-info">
        <div class="stat-card-label">Total Products</div>
        <div class="stat-card-value">${products.length.toLocaleString()}</div>
        <div class="stat-card-trend up">↑ 12% from last month</div>
      </div>
      <div class="stat-icon-wrap si-blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></div>
    </div>
    <div class="stat-card">
      <div class="stat-card-info">
        <div class="stat-card-label">Low Stock Items</div>
        <div class="stat-card-value">${lowItems.length + outItems.length}</div>
        <div class="stat-card-trend down">↓ ${outItems.length} critical</div>
      </div>
      <div class="stat-icon-wrap si-red"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
    </div>
    <div class="stat-card">
      <div class="stat-card-info">
        <div class="stat-card-label">Orders Today</div>
        <div class="stat-card-value">${orders.length * 10 + 5}</div>
        <div class="stat-card-trend up">↑ 8% from yesterday</div>
      </div>
      <div class="stat-icon-wrap si-green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg></div>
    </div>
    <div class="stat-card">
      <div class="stat-card-info">
        <div class="stat-card-label">Revenue</div>
        <div class="stat-card-value">₹${(totalRevenue / 100000).toFixed(1)}L</div>
        <div class="stat-card-trend up">↑ 15% from last week</div>
      </div>
      <div class="stat-icon-wrap si-purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
    </div>`;

  // Stock Trend Chart
  destroyChart('stockTrend');
  const stCtx = document.getElementById('stockTrendChart').getContext('2d');
  charts['stockTrend'] = new Chart(stCtx, {
    type: 'line',
    data: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun'],
      datasets: [{
        label: 'stock', data: [850, 920, 880, 1050, 940, 1120],
        borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,.08)',
        tension: 0.4, fill: true, pointRadius: 4, pointBackgroundColor: '#3b82f6'
      }]
    },
    options: baseChartOptions()
  });

  // Sales Chart
  destroyChart('sales');
  const salCtx = document.getElementById('salesChart').getContext('2d');
  charts['sales'] = new Chart(salCtx, {
    type: 'bar',
    data: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun'],
      datasets: [{
        label: 'sales', data: [45000,52000,48000,61000,55000,67000],
        backgroundColor: '#8b5cf6', borderRadius: 6, borderSkipped: false
      }]
    },
    options: baseChartOptions()
  });

  // Category Pie
  const catData = getCategoryData(products);
  destroyChart('catPie');
  const pieCtx = document.getElementById('catPieChart').getContext('2d');
  charts['catPie'] = new Chart(pieCtx, {
    type: 'pie',
    data: {
      labels: catData.names,
      datasets: [{ data: catData.pcts, backgroundColor: catData.colors, borderWidth: 2, borderColor: '#fff' }]
    },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}%` } }
      },
      elements: { arc: { hoverOffset: 6 } }
    }
  });

  // Category Performance List
  document.getElementById('catPerfList').innerHTML = catData.names.map((name, i) => {
    const cat = (lsGet('sm_categories', [])).find(c => c.name === name) || {};
    const revMap = { Grocery: 125000, Clothing: 98000, Electronics: 156000, Footwear: 67000 };
    const rev = revMap[name] || 50000;
    return `
    <div class="cat-perf-item">
      <div class="cat-perf-dot" style="background:${catData.colors[i]}"></div>
      <div class="cat-perf-name">${esc(name)}</div>
      <div class="cat-perf-val">${fmtPrice(rev)}<br><small>${catData.pcts[i]}% share</small></div>
    </div>`;
  }).join('');

  // Recent Activity
  const activities = lsGet('sm_activity', []);
  document.getElementById('recentActivity').innerHTML = activities.map(a => {
    const iconMap = {
      order:   { cls: 'ai-blue',   svg: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>' },
      alert:   { cls: 'ai-red',    svg: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>' },
      product: { cls: 'ai-green',  svg: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>' },
      ship:    { cls: 'ai-purple', svg: '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>' },
    };
    const icon = iconMap[a.type] || iconMap.product;
    return `
    <div class="activity-item">
      <div class="activity-icon ${icon.cls}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${icon.svg}</svg></div>
      <div class="activity-text">
        <div class="activity-title">${esc(a.title)}</div>
        <div class="activity-sub">${esc(a.sub)}</div>
      </div>
      <div class="activity-time">${esc(a.time)}</div>
    </div>`;
  }).join('');
}

function getCategoryData(products) {
  const categories  = lsGet('sm_categories', []);
  const catCounts   = {};
  const catColorMap = {};
  categories.forEach(c => {
    catCounts[c.name]   = products.filter(p => p.category === c.name).length;
    catColorMap[c.name] = (CATEGORY_COLORS[c.color] || CATEGORY_COLORS.blue).pieFill;
  });
  const total = products.length || 1;
  const names  = categories.map(c => c.name);
  const pcts   = names.map(n => Math.round((catCounts[n] / total) * 100));
  const colors = names.map(n => catColorMap[n]);
  return { names, pcts, colors };
}

function baseChartOptions() {
  const isDark = document.body.classList.contains('dark');
  const gridColor = isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)';
  const tickColor = isDark ? '#8b92b8' : '#9ca3af';
  return {
    responsive: true, maintainAspectRatio: true,
    plugins: {
      legend: { labels: { color: tickColor, font: { family: 'Inter', size: 11 }, boxWidth: 12 } }
    },
    scales: {
      x: { ticks: { color: tickColor, font: { family: 'Inter', size: 11 } }, grid: { color: gridColor } },
      y: { ticks: { color: tickColor, font: { family: 'Inter', size: 11 } }, grid: { color: gridColor }, beginAtZero: true }
    }
  };
}

/* ─────────────────────────────────────────────────────
   CATEGORIES
───────────────────────────────────────────────────── */
function renderCategories() {
  const categories = lsGet('sm_categories', []);
  const products   = lsGet('sm_products',   []);

  // Cards
  document.getElementById('categoryCards').innerHTML = categories.map(cat => {
    const count = products.filter(p => p.category === cat.name).length;
    const cc = CATEGORY_COLORS[cat.color] || CATEGORY_COLORS.blue;
    return `
    <div class="cat-card">
      <div class="cat-actions">
        <button class="action-btn action-edit"  data-edit-cat="${cat.id}" title="Edit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="action-btn action-delete" data-del-cat="${cat.id}" title="Delete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </button>
      </div>
      <div class="cat-card-icon" style="background:${cc.bg}">
        <span>${cat.icon || '📦'}</span>
      </div>
      <div class="cat-card-name">${esc(cat.name)}</div>
      <div class="cat-card-count">${count} Products</div>
    </div>`;
  }).join('') || '<p style="color:#9ca3af;padding:1rem">No categories yet. Add one!</p>';

  // Stats banner
  const totalProducts = products.length;
  const uniqueBrands  = [...new Set(products.map(p => p.brand))].length;
  document.getElementById('catStatsBanner').innerHTML = `
    <div class="cat-stat-big bg-blue"><h4>Total Categories</h4><div class="val">${categories.length}</div></div>
    <div class="cat-stat-big bg-purple"><h4>Total Products</h4><div class="val">${totalProducts}</div></div>
    <div class="cat-stat-big bg-green"><h4>Active Brands</h4><div class="val">${uniqueBrands}</div></div>`;

  // Edit category buttons
  document.querySelectorAll('[data-edit-cat]').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      openEditCategoryModal(this.dataset.editCat);
    });
  });
  // Delete category buttons
  document.querySelectorAll('[data-del-cat]').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      confirmDelete('category', this.dataset.delCat);
    });
  });
}

function openAddCategoryModal() {
  document.getElementById('catEditId').value = '';
  document.getElementById('catName').value   = '';
  document.getElementById('catIcon').value   = '';
  document.getElementById('catColor').value  = 'blue';
  document.getElementById('catModalTitle').textContent = 'Add Category';
  document.getElementById('catModalError').classList.add('hidden');
  openModal('categoryModal');
}

function openEditCategoryModal(id) {
  const cat = lsGet('sm_categories', []).find(c => c.id === id);
  if (!cat) return;
  document.getElementById('catEditId').value = cat.id;
  document.getElementById('catName').value   = cat.name;
  document.getElementById('catIcon').value   = cat.icon || '';
  document.getElementById('catColor').value  = cat.color || 'blue';
  document.getElementById('catModalTitle').textContent = 'Edit Category';
  document.getElementById('catModalError').classList.add('hidden');
  openModal('categoryModal');
}

function saveCategory() {
  const id    = document.getElementById('catEditId').value;
  const name  = document.getElementById('catName').value.trim();
  const icon  = document.getElementById('catIcon').value.trim() || '📦';
  const color = document.getElementById('catColor').value;
  const errEl = document.getElementById('catModalError');

  errEl.classList.add('hidden');
  if (!name) { errEl.textContent = 'Category name is required.'; errEl.classList.remove('hidden'); return; }

  let cats = lsGet('sm_categories', []);
  if (id) {
    // Edit
    const duplicate = cats.find(c => c.name.toLowerCase() === name.toLowerCase() && c.id !== id);
    if (duplicate) { errEl.textContent = 'A category with this name already exists.'; errEl.classList.remove('hidden'); return; }
    cats = cats.map(c => c.id === id ? { ...c, name, icon, color } : c);
    showToast('Category updated!');
  } else {
    // Add
    const duplicate = cats.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (duplicate) { errEl.textContent = 'A category with this name already exists.'; errEl.classList.remove('hidden'); return; }
    cats.push({ id: uid(), name, icon, color });
    showToast('Category added!');

    // Add activity
    const acts = lsGet('sm_activity', []);
    acts.unshift({ type: 'product', title: 'Category added', sub: name, time: 'Just now' });
    lsSet('sm_activity', acts.slice(0, 10));
  }
  lsSet('sm_categories', cats);
  closeModal('categoryModal');
  renderCategories();
  // Refresh category dropdown in product modal
  populateCategoryDropdowns();
}

/* ─────────────────────────────────────────────────────
   INVENTORY
───────────────────────────────────────────────────── */
let invPage = 1;

function renderInventory() {
  invPage = 1;
  populateCategoryDropdowns();
  renderInventoryTable();

  // Bind search
  const searchEl = document.getElementById('invSearch');
  searchEl.oninput = null; // clear old
  searchEl.addEventListener('input', function() { invPage = 1; renderInventoryTable(); });
}

function renderInventoryTable() {
  const products   = lsGet('sm_products', []);
  const search     = (document.getElementById('invSearch')?.value || '').toLowerCase();
  const catFilter  = document.getElementById('filterCategory')?.value || '';
  const statFilter = document.getElementById('filterStatus')?.value   || '';

  let filtered = products.filter(p => {
    const status = getProductStatus(p.qty);
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search) ||
      p.brand.toLowerCase().includes(search) ||
      p.category.toLowerCase().includes(search) ||
      (p.sku || '').toLowerCase().includes(search);
    const matchCat  = !catFilter  || p.category === catFilter;
    const matchStat = !statFilter || status === statFilter;
    return matchSearch && matchCat && matchStat;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE) || 1;
  if (invPage > totalPages) invPage = totalPages;
  const start = (invPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filtered.slice(start, start + ITEMS_PER_PAGE);

  document.getElementById('inventoryCount').textContent = `${total} total product${total !== 1 ? 's' : ''}`;

  const tbody = document.getElementById('inventoryBody');
  if (pageItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2.5rem;color:#9ca3af">No products found.</td></tr>`;
  } else {
    tbody.innerHTML = pageItems.map(p => {
      const status = getProductStatus(p.qty);
      return `
      <tr>
        <td style="font-weight:600">${esc(p.name)}</td>
        <td style="color:#6c63ff;font-weight:500">${esc(p.brand)}</td>
        <td>${esc(p.category)}</td>
        <td class="${qtyClass(p.qty)}">${p.qty}</td>
        <td style="font-weight:600">${fmtPrice(p.price)}</td>
        <td>${getStatusBadge(status)}</td>
        <td>
          <div style="display:flex;gap:.3rem">
            <button class="action-btn action-view" data-view-prod="${p.id}" title="View">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button class="action-btn action-edit" data-edit-prod="${p.id}" title="Edit">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="action-btn action-delete" data-del-prod="${p.id}" title="Delete">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
          </div>
        </td>
      </tr>`;
    }).join('');
  }

  // Re-bind table action buttons
  document.querySelectorAll('[data-view-prod]').forEach(btn => {
    btn.addEventListener('click', () => viewProduct(btn.dataset.viewProd));
  });
  document.querySelectorAll('[data-edit-prod]').forEach(btn => {
    btn.addEventListener('click', () => openEditProductModal(btn.dataset.editProd));
  });
  document.querySelectorAll('[data-del-prod]').forEach(btn => {
    btn.addEventListener('click', () => confirmDelete('product', btn.dataset.delProd));
  });

  // Pagination
  renderPagination(total, totalPages);
}

function renderPagination(total, totalPages) {
  const container = document.getElementById('invPagination');
  const start = (invPage - 1) * ITEMS_PER_PAGE + 1;
  const end   = Math.min(invPage * ITEMS_PER_PAGE, total);

  let btns = `<span class="pagination-info">Showing ${total === 0 ? 0 : start}–${end} of ${total} products</span>`;
  btns += '<div class="pagination-btns">';
  btns += `<button class="page-btn" id="prevPage" ${invPage <= 1 ? 'disabled' : ''}>Previous</button>`;
  for (let i = 1; i <= totalPages; i++) {
    btns += `<button class="page-btn ${i === invPage ? 'active' : ''}" data-pg="${i}">${i}</button>`;
  }
  btns += `<button class="page-btn" id="nextPage" ${invPage >= totalPages ? 'disabled' : ''}>Next</button>`;
  btns += '</div>';
  container.innerHTML = btns;

  const prev = document.getElementById('prevPage');
  const next = document.getElementById('nextPage');
  if (prev) prev.addEventListener('click', () => { if (invPage > 1) { invPage--; renderInventoryTable(); } });
  if (next) next.addEventListener('click', () => { if (invPage < totalPages) { invPage++; renderInventoryTable(); } });
  container.querySelectorAll('[data-pg]').forEach(btn => {
    btn.addEventListener('click', function() { invPage = parseInt(this.dataset.pg); renderInventoryTable(); });
  });
}

function populateCategoryDropdowns() {
  const cats = lsGet('sm_categories', []);
  // Inventory filter dropdown
  const invCatFilter = document.getElementById('filterCategory');
  if (invCatFilter) {
    const cur = invCatFilter.value;
    invCatFilter.innerHTML = '<option value="">All Categories</option>' + cats.map(c => `<option value="${esc(c.name)}" ${cur===c.name?'selected':''}>${esc(c.name)}</option>`).join('');
  }
  // Product modal dropdown
  const pCatSel = document.getElementById('pCategory');
  if (pCatSel) {
    const cur = pCatSel.value;
    pCatSel.innerHTML = '<option value="">Select category</option>' + cats.map(c => `<option value="${esc(c.name)}" ${cur===c.name?'selected':''}>${esc(c.name)}</option>`).join('');
  }
}

function openAddProductModal() {
  document.getElementById('productId').value   = '';
  document.getElementById('pName').value       = '';
  document.getElementById('pBrand').value      = '';
  document.getElementById('pQty').value        = '';
  document.getElementById('pPrice').value      = '';
  document.getElementById('pSku').value        = '';
  document.getElementById('pCategory').value   = '';
  document.getElementById('productModalTitle').textContent = 'Add Product';
  document.getElementById('productModalError').classList.add('hidden');
  populateCategoryDropdowns();
  openModal('productModal');
}

function openEditProductModal(id) {
  const p = lsGet('sm_products', []).find(x => x.id === id);
  if (!p) return;
  document.getElementById('productId').value   = p.id;
  document.getElementById('pName').value       = p.name;
  document.getElementById('pBrand').value      = p.brand;
  document.getElementById('pQty').value        = p.qty;
  document.getElementById('pPrice').value      = p.price;
  document.getElementById('pSku').value        = p.sku || '';
  document.getElementById('productModalTitle').textContent = 'Edit Product';
  document.getElementById('productModalError').classList.add('hidden');
  populateCategoryDropdowns();
  document.getElementById('pCategory').value = p.category;
  openModal('productModal');
}

function viewProduct(id) {
  const p = lsGet('sm_products', []).find(x => x.id === id);
  if (!p) return;
  const status = getProductStatus(p.qty);
  document.getElementById('viewProductBody').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.8rem">
      <div><div style="font-size:.75rem;color:#6b7280;margin-bottom:.2rem">Product Name</div><div style="font-weight:600">${esc(p.name)}</div></div>
      <div><div style="font-size:.75rem;color:#6b7280;margin-bottom:.2rem">Brand</div><div style="font-weight:600;color:#6c63ff">${esc(p.brand)}</div></div>
      <div><div style="font-size:.75rem;color:#6b7280;margin-bottom:.2rem">Category</div><div>${esc(p.category)}</div></div>
      <div><div style="font-size:.75rem;color:#6b7280;margin-bottom:.2rem">SKU</div><div>${esc(p.sku||'—')}</div></div>
      <div><div style="font-size:.75rem;color:#6b7280;margin-bottom:.2rem">Quantity</div><div class="${qtyClass(p.qty)}" style="font-weight:700;font-size:1.1rem">${p.qty}</div></div>
      <div><div style="font-size:.75rem;color:#6b7280;margin-bottom:.2rem">Price</div><div style="font-weight:700;font-size:1.1rem">${fmtPrice(p.price)}</div></div>
      <div><div style="font-size:.75rem;color:#6b7280;margin-bottom:.2rem">Status</div>${getStatusBadge(status)}</div>
    </div>`;
  openModal('viewProductModal');
}

function saveProduct() {
  const id       = document.getElementById('productId').value;
  const name     = document.getElementById('pName').value.trim();
  const brand    = document.getElementById('pBrand').value.trim();
  const category = document.getElementById('pCategory').value;
  const qty      = parseInt(document.getElementById('pQty').value);
  const price    = parseFloat(document.getElementById('pPrice').value);
  const sku      = document.getElementById('pSku').value.trim();
  const errEl    = document.getElementById('productModalError');

  errEl.classList.add('hidden');
  if (!name)             { errEl.textContent = 'Product name is required.';        errEl.classList.remove('hidden'); return; }
  if (!brand)            { errEl.textContent = 'Brand is required.';               errEl.classList.remove('hidden'); return; }
  if (!category)         { errEl.textContent = 'Category is required.';            errEl.classList.remove('hidden'); return; }
  if (isNaN(qty) || qty < 0) { errEl.textContent = 'Quantity must be 0 or more.'; errEl.classList.remove('hidden'); return; }
  if (isNaN(price) || price < 0) { errEl.textContent = 'Price must be 0 or more.';errEl.classList.remove('hidden'); return; }

  let products = lsGet('sm_products', []);
  if (id) {
    products = products.map(p => p.id === id ? { ...p, name, brand, category, qty, price, sku } : p);
    showToast('Product updated!');
  } else {
    products.push({ id: uid(), name, brand, category, qty, price, sku });
    showToast('Product added!');
    const acts = lsGet('sm_activity', []);
    acts.unshift({ type: 'product', title: 'Product added', sub: name, time: 'Just now' });
    lsSet('sm_activity', acts.slice(0, 10));
  }
  lsSet('sm_products', products);
  closeModal('productModal');
  renderInventoryTable();
}

/* ─────────────────────────────────────────────────────
   DELETE CONFIRM (shared)
───────────────────────────────────────────────────── */
let pendingDelete = null;

function confirmDelete(type, id) {
  pendingDelete = { type, id };
  let name = id;
  if (type === 'product') {
    const p = lsGet('sm_products', []).find(x => x.id === id);
    if (p) name = p.name;
  } else if (type === 'category') {
    const c = lsGet('sm_categories', []).find(x => x.id === id);
    if (c) name = c.name;
  }
  document.getElementById('deleteMsg').textContent =
    `Are you sure you want to delete "${name}"? This action cannot be undone.`;
  openModal('deleteModal');
}

function executeDelete() {
  if (!pendingDelete) return;
  const { type, id } = pendingDelete;
  if (type === 'product') {
    lsSet('sm_products', lsGet('sm_products', []).filter(p => p.id !== id));
    showToast('Product deleted.');
    renderInventoryTable();
  } else if (type === 'category') {
    lsSet('sm_categories', lsGet('sm_categories', []).filter(c => c.id !== id));
    showToast('Category deleted.');
    renderCategories();
  }
  pendingDelete = null;
  closeModal('deleteModal');
}

/* ─────────────────────────────────────────────────────
   ORDERS
───────────────────────────────────────────────────── */
function renderOrders() {
  renderOrdersTable(lsGet('sm_orders', []));

  const searchEl = document.getElementById('orderSearch');
  searchEl.oninput = null;
  searchEl.addEventListener('input', function() {
    const q = this.value.toLowerCase();
    const orders = lsGet('sm_orders', []);
    renderOrdersTable(orders.filter(o =>
      o.id.toLowerCase().includes(q) ||
      o.product.toLowerCase().includes(q) ||
      o.status.toLowerCase().includes(q)
    ));
  });

  document.getElementById('exportOrdersBtn').onclick = exportOrders;
}

function renderOrdersTable(orders) {
  document.getElementById('ordersCount').textContent = `${orders.length} total order${orders.length !== 1 ? 's' : ''}`;

  const delivered  = orders.filter(o => o.status === 'Delivered').length;
  const pending    = orders.filter(o => o.status === 'Pending').length;
  const cancelled  = orders.filter(o => o.status === 'Cancelled').length;
  const totalValue = orders.reduce((s, o) => s + o.total, 0);

  document.getElementById('orderSummaryRow').innerHTML = `
    <div class="order-stat os-green"><div class="order-stat-label">Delivered</div><div class="order-stat-val">${delivered}</div></div>
    <div class="order-stat os-yellow"><div class="order-stat-label">Pending</div><div class="order-stat-val">${pending}</div></div>
    <div class="order-stat os-red"><div class="order-stat-label">Cancelled</div><div class="order-stat-val">${cancelled}</div></div>
    <div class="order-stat os-blue"><div class="order-stat-label">Total Value</div><div class="order-stat-val">${fmtPrice(totalValue)}</div></div>`;

  document.getElementById('ordersBody').innerHTML = orders.map(o => `
    <tr>
      <td><span class="order-link">${esc(o.id)}</span></td>
      <td>${fmtDate(o.date)}</td>
      <td style="font-weight:500">${esc(o.product)}</td>
      <td>${o.qty}</td>
      <td style="font-weight:600">${fmtPrice(o.total)}</td>
      <td>${getStatusBadge(o.status)}</td>
    </tr>`).join('') || `<tr><td colspan="6" style="text-align:center;padding:2rem;color:#9ca3af">No orders found.</td></tr>`;
}

function exportOrders() {
  const orders = lsGet('sm_orders', []);
  const rows = [['Order ID', 'Date', 'Product', 'Quantity', 'Total', 'Status']];
  orders.forEach(o => rows.push([o.id, o.date, o.product, o.qty, '₹' + o.total, o.status]));
  const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a'); a.href = url; a.download = 'orders.csv'; a.click();
  URL.revokeObjectURL(url);
  showToast('Orders exported as CSV!');
}

/* ─────────────────────────────────────────────────────
   SHIPMENTS
───────────────────────────────────────────────────── */
function renderShipments() {
  const orders = lsGet('sm_orders', []);
  const pending = orders.find(o => o.status === 'Pending') || orders[0];

  // Tracker
  const tracker = document.getElementById('shipmentTracker');
  const steps = [
    { label: 'Packed',           time: '2026-04-14 10:30 AM', done: true  },
    { label: 'Shipped',          time: '2026-04-14 02:15 PM', done: true  },
    { label: 'Out for Delivery', time: '2026-04-15 08:00 AM', done: true  },
    { label: 'Delivered',        time: 'Expected: 2026-04-16 06:00 PM', done: false },
  ];
  const checkSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';
  const circleSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/></svg>';

  tracker.innerHTML = `
    <div class="ship-order-header">
      <div class="ship-order-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></div>
      <div>
        <div class="ship-order-id">Order #${esc(pending?.id || 'ORD002')}</div>
        <div class="ship-order-product">${esc(pending?.product || 'Samsung Galaxy S24')}</div>
      </div>
    </div>
    <div class="timeline">
      ${steps.map((s, i) => `
      <div class="timeline-step">
        <div class="timeline-left">
          <div class="timeline-circle ${s.done ? 'done' : ''}">${s.done ? checkSvg : circleSvg}</div>
          ${i < steps.length - 1 ? `<div class="timeline-line ${s.done ? 'done' : ''}"></div>` : ''}
        </div>
        <div class="timeline-content">
          <div class="timeline-label ${!s.done ? 'muted' : ''}">${s.label}</div>
          <div class="timeline-time">${s.time}</div>
        </div>
      </div>`).join('')}
    </div>`;

  // Details
  document.getElementById('shipmentDetails').innerHTML = `
    <div class="shipment-details-card">
      <h4>Shipment Details</h4>
      <div class="detail-row"><span>Tracking Number</span><span>TRK1234567890</span></div>
      <div class="detail-row"><span>Carrier</span><span>FedEx Express</span></div>
      <div class="detail-row"><span>Origin</span><span>Mumbai, MH</span></div>
      <div class="detail-row"><span>Destination</span><span>Bangalore, KA</span></div>
      <div class="detail-row"><span>Weight</span><span>2.5 kg</span></div>
      <div class="delivery-box">
        <div class="delivery-label">Estimated Delivery</div>
        <div class="delivery-date">April 16, 2026</div>
        <div class="delivery-time">By 6:00 PM</div>
      </div>
    </div>`;

  // Recent shipments
  const recentOrders = orders.slice(0, 4);
  document.getElementById('recentShipments').innerHTML = `
    <div class="recent-shipments-card">
      <h4>Recent Shipments</h4>
      ${recentOrders.map(o => {
        const sMap = { Delivered: 'badge-green', Pending: 'badge-yellow', Cancelled: 'badge-red' };
        const s2   = { Delivered: 'Delivered', Pending: 'In Transit', Cancelled: 'Cancelled' };
        return `
        <div class="ship-item">
          <div class="ship-item-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></div>
          <div class="ship-item-info">
            <div class="ship-item-name">${esc(o.product)}</div>
            <div class="ship-item-id">${esc(o.id)}</div>
          </div>
          <div class="ship-item-right">
            <span class="badge ${sMap[o.status] || 'badge-gray'}">${s2[o.status] || o.status}</span>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:.2rem">${fmtDate(o.date)}</div>
          </div>
        </div>`;
      }).join('')}
    </div>`;
}

/* ─────────────────────────────────────────────────────
   LOW STOCK
───────────────────────────────────────────────────── */
function renderLowStock() {
  const products  = lsGet('sm_products', []);
  const lowItems  = products.filter(p => p.qty > 0 && p.qty <= LOW_STOCK_THRESHOLD);
  const critItems = products.filter(p => p.qty <= CRITICAL_THRESHOLD); // includes 0
  const reorderVal = critItems.reduce((s, p) => s + p.price * 50, 0);

  document.getElementById('lowStockSubtitle').textContent =
    `${lowItems.length + critItems.filter(p=>p.qty===0).length} items need attention`;

  // Summary cards
  document.getElementById('lowStockSummary').innerHTML = `
    <div class="ls-stat ls-critical">
      <div class="ls-stat-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        Critical
      </div>
      <div class="ls-stat-val">${critItems.length}</div>
      <div class="ls-stat-sub">Less than ${CRITICAL_THRESHOLD} units</div>
    </div>
    <div class="ls-stat ls-warning">
      <div class="ls-stat-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        Warning
      </div>
      <div class="ls-stat-val">${lowItems.filter(p=>p.qty>CRITICAL_THRESHOLD).length}</div>
      <div class="ls-stat-sub">${CRITICAL_THRESHOLD+1}–${LOW_STOCK_THRESHOLD} units remaining</div>
    </div>
    <div class="ls-stat ls-reorder">
      <div class="ls-stat-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        Reorder Value
      </div>
      <div class="ls-stat-val">₹${Math.round(reorderVal/1000)}K</div>
      <div class="ls-stat-sub">Estimated cost</div>
    </div>`;

  // Items list (critical first, then warning)
  const allLow = [...products.filter(p => p.qty <= LOW_STOCK_THRESHOLD)].sort((a,b) => a.qty - b.qty);
  const alertSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
  document.getElementById('lowStockList').innerHTML = allLow.map(p => {
    const isCrit = p.qty <= CRITICAL_THRESHOLD;
    const alertHtml = isCrit
      ? `<div class="ls-alert">Critical: Stock level is critically low. Immediate reorder recommended.</div>`
      : (p.qty <= 5 ? `<div class="ls-alert warning-alert">Warning: Stock running low. Consider reordering soon.</div>` : '');
    return `
    <div class="lowstock-item">
      <div class="lowstock-item-row">
        <div class="ls-icon ${isCrit ? 'critical' : 'warning'}">${alertSvg}</div>
        <div class="ls-info">
          <div class="ls-name">${esc(p.name)}</div>
          <div class="ls-meta">${esc(p.brand)} • ${esc(p.category)}</div>
        </div>
        <div class="ls-qty-price">
          <div class="ls-qty-block">
            <div class="ls-qty-label">Stock</div>
            <div class="ls-qty-val ${isCrit ? 'critical' : 'warning'}">${p.qty}</div>
          </div>
          <div class="ls-price-block">
            <div class="ls-price-label">Price</div>
            <div class="ls-price-val">${fmtPrice(p.price)}</div>
          </div>
        </div>
        <button class="btn-reorder" data-reorder="${p.id}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          Reorder
        </button>
      </div>
      ${alertHtml}
    </div>`;
  }).join('') || '<p style="color:#9ca3af;text-align:center;padding:2rem">All products are adequately stocked!</p>';

  // Reorder buttons
  document.querySelectorAll('[data-reorder]').forEach(btn => {
    btn.addEventListener('click', function() {
      const p = lsGet('sm_products', []).find(x => x.id === this.dataset.reorder);
      if (p) {
        showToast(`Reorder placed for ${p.name}!`);
        // Add activity
        const acts = lsGet('sm_activity', []);
        acts.unshift({ type: 'order', title: 'Reorder placed', sub: p.name, time: 'Just now' });
        lsSet('sm_activity', acts.slice(0, 10));
      }
    });
  });
}

/* ─────────────────────────────────────────────────────
   REPORTS
───────────────────────────────────────────────────── */
function renderReports() {
  const products = lsGet('sm_products', []);
  const orders   = lsGet('sm_orders',   []);

  // Stats
  const totalSales  = orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + o.total, 0);
  const itemsSold   = orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + o.qty, 0);
  const avgOrder    = orders.length ? Math.round(totalSales / orders.length) : 0;
  const stockVal    = products.reduce((s, p) => s + p.price * p.qty, 0);

  document.getElementById('reportStats').innerHTML = `
    <div class="stat-card">
      <div class="stat-card-info">
        <div class="stat-card-label">Total Sales</div>
        <div class="stat-card-value">₹${(totalSales/100000).toFixed(1)}L</div>
        <div class="stat-card-trend up">↑ 18% from last month</div>
      </div>
      <div class="stat-icon-wrap si-blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></div>
    </div>
    <div class="stat-card">
      <div class="stat-card-info">
        <div class="stat-card-label">Items Sold</div>
        <div class="stat-card-value">${itemsSold.toLocaleString()}</div>
        <div class="stat-card-trend up">↑ 12% from last month</div>
      </div>
      <div class="stat-icon-wrap si-purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></div>
    </div>
    <div class="stat-card">
      <div class="stat-card-info">
        <div class="stat-card-label">Avg Order</div>
        <div class="stat-card-value">${fmtPrice(avgOrder)}</div>
        <div class="stat-card-trend up">↑ 5% from last month</div>
      </div>
      <div class="stat-icon-wrap si-green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
    </div>
    <div class="stat-card">
      <div class="stat-card-info">
        <div class="stat-card-label">Stock Value</div>
        <div class="stat-card-value">₹${(stockVal/100000).toFixed(1)}L</div>
        <div class="stat-card-trend" style="color:#6b7280">Current inventory</div>
      </div>
      <div class="stat-icon-wrap si-orange"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></div>
    </div>`;

  // Monthly Stock Chart
  destroyChart('reportStock');
  const rsc = document.getElementById('reportStockChart').getContext('2d');
  charts['reportStock'] = new Chart(rsc, {
    type: 'line',
    data: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun'],
      datasets: [{ label: 'Stock', data: [850,920,880,1050,940,1120], borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,.08)', tension: 0.4, fill: true, pointRadius: 4, pointBackgroundColor: '#3b82f6' }]
    },
    options: baseChartOptions()
  });

  // Monthly Sales Chart
  destroyChart('reportSales');
  const rsac = document.getElementById('reportSalesChart').getContext('2d');
  charts['reportSales'] = new Chart(rsac, {
    type: 'bar',
    data: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun'],
      datasets: [{ label: 'Sales (₹)', data: [45000,52000,48000,61000,55000,67000], backgroundColor: '#8b5cf6', borderRadius: 6, borderSkipped: false }]
    },
    options: baseChartOptions()
  });

  // Pie chart
  const catData = getCategoryData(products);
  destroyChart('reportPie');
  const rpCtx = document.getElementById('reportPieChart').getContext('2d');
  charts['reportPie'] = new Chart(rpCtx, {
    type: 'pie',
    data: {
      labels: catData.names,
      datasets: [{ data: catData.pcts, backgroundColor: catData.colors, borderWidth: 2, borderColor: '#fff' }]
    },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}%` } } }
    }
  });

  // Category Breakdown
  const revMap = { Grocery: 125000, Clothing: 98000, Electronics: 156000, Footwear: 67000 };
  document.getElementById('reportCatBreakdown').innerHTML = catData.names.map((name, i) => {
    const rev = revMap[name] || 50000;
    const pct = catData.pcts[i];
    return `
    <div class="cat-breakdown-item">
      <div class="cat-breakdown-header">
        <div class="cat-bd-dot" style="background:${catData.colors[i]}"></div>
        <div class="cat-bd-name">${esc(name)}</div>
        <div class="cat-bd-pct">${pct}%</div>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${catData.colors[i]}"></div></div>
      <div class="cat-bd-rev">Revenue</div>
    </div>`;
  }).join('');

  // Monthly table
  const monthly = [
    { month:'Jan', sales:45000, stock:850 },
    { month:'Feb', sales:52000, stock:920 },
    { month:'Mar', sales:48000, stock:880 },
    { month:'Apr', sales:61000, stock:1050 },
    { month:'May', sales:55000, stock:940 },
    { month:'Jun', sales:67000, stock:1120 },
  ];
  document.getElementById('monthlyTableBody').innerHTML = monthly.map((m, i) => {
    let growth = '–';
    if (i > 0) {
      const diff = ((m.sales - monthly[i-1].sales) / monthly[i-1].sales * 100).toFixed(1);
      growth = `<span style="color:${diff >= 0 ? '#16a34a' : '#dc2626'};font-weight:600">↑${Math.abs(diff)}%</span>`;
    }
    return `<tr><td>${m.month}</td><td>${fmtPrice(m.sales)}</td><td>${m.stock}</td><td>${growth}</td></tr>`;
  }).join('');

  document.getElementById('exportReportBtn').onclick = exportReport;
}

function exportReport() {
  const rows = [['Month','Sales (₹)','Stock Count']];
  const monthly = [{month:'Jan',sales:45000,stock:850},{month:'Feb',sales:52000,stock:920},{month:'Mar',sales:48000,stock:880},{month:'Apr',sales:61000,stock:1050},{month:'May',sales:55000,stock:940},{month:'Jun',sales:67000,stock:1120}];
  monthly.forEach(m => rows.push([m.month, m.sales, m.stock]));
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a'); a.href = url; a.download = 'report.csv'; a.click();
  URL.revokeObjectURL(url);
  showToast('Report exported!');
}

/* ─────────────────────────────────────────────────────
   SETTINGS
───────────────────────────────────────────────────── */
function renderSettings() {
  const s = lsGet('sm_settings') || {};
  if (s.name)     document.getElementById('settingName').value  = s.name;
  if (s.email)    document.getElementById('settingEmail').value = s.email;
  if (s.phone)    document.getElementById('settingPhone').value = s.phone;
  if (s.language) document.getElementById('settingLang').value  = s.language;
  if (s.timezone) document.getElementById('settingTz').value    = s.timezone;
  if (s.currency) document.getElementById('settingCurrency').value = s.currency;
  ['notif1','notif2','notif3','notif4','notif5'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = s[id] !== undefined ? s[id] : false;
  });
  document.getElementById('settingsMsg').classList.add('hidden');
  document.getElementById('settingsSecurityMsg').classList.add('hidden');
}

function saveSettings() {
  const name     = document.getElementById('settingName').value.trim();
  const email    = document.getElementById('settingEmail').value.trim();
  const phone    = document.getElementById('settingPhone').value.trim();
  const currentPw = document.getElementById('currentPw').value;
  const newPw     = document.getElementById('newPw').value;
  const confirmPw = document.getElementById('confirmPw').value;
  const msgEl     = document.getElementById('settingsMsg');
  const secMsg    = document.getElementById('settingsSecurityMsg');

  msgEl.classList.add('hidden');
  secMsg.classList.add('hidden');

  if (!name || !email) {
    msgEl.textContent = 'Name and email are required.';
    msgEl.className   = 'alert alert-error';
    msgEl.classList.remove('hidden');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    msgEl.textContent = 'Enter a valid email address.';
    msgEl.className   = 'alert alert-error';
    msgEl.classList.remove('hidden');
    return;
  }

  // Password change
  if (currentPw || newPw || confirmPw) {
    const admin = lsGet('sm_admin') || DEFAULT_ADMIN;
    if (currentPw !== admin.password) {
      secMsg.textContent = 'Current password is incorrect.';
      secMsg.style.color = '#dc2626';
      secMsg.classList.remove('hidden');
      return;
    }
    if (!newPw) {
      secMsg.textContent = 'New password cannot be empty.';
      secMsg.style.color = '#dc2626';
      secMsg.classList.remove('hidden');
      return;
    }
    if (newPw.length < 6) {
      secMsg.textContent = 'New password must be at least 6 characters.';
      secMsg.style.color = '#dc2626';
      secMsg.classList.remove('hidden');
      return;
    }
    if (newPw !== confirmPw) {
      secMsg.textContent = 'Passwords do not match.';
      secMsg.style.color = '#dc2626';
      secMsg.classList.remove('hidden');
      return;
    }
    // Update password
    const adminData = lsGet('sm_admin') || DEFAULT_ADMIN;
    adminData.password = newPw;
    lsSet('sm_admin', adminData);
    secMsg.textContent = 'Password changed successfully!';
    secMsg.style.color = '#16a34a';
    secMsg.classList.remove('hidden');
    document.getElementById('currentPw').value = '';
    document.getElementById('newPw').value      = '';
    document.getElementById('confirmPw').value  = '';
  }

  const notifs = {};
  ['notif1','notif2','notif3','notif4','notif5'].forEach(id => {
    notifs[id] = document.getElementById(id).checked;
  });

  const s = {
    name, email, phone,
    language: document.getElementById('settingLang').value,
    timezone: document.getElementById('settingTz').value,
    currency: document.getElementById('settingCurrency').value,
    darkMode: document.body.classList.contains('dark'),
    ...notifs
  };
  lsSet('sm_settings', s);

  // Update admin record name/email
  const adminData = lsGet('sm_admin') || DEFAULT_ADMIN;
  adminData.name  = name;
  adminData.email = email;
  lsSet('sm_admin', adminData);

  // Update session display
  const session = lsGet('sm_session') || {};
  session.name  = name;
  lsSet('sm_session', session);
  document.getElementById('topbarName').textContent = name;

  msgEl.textContent = 'Settings saved successfully!';
  msgEl.className   = 'alert alert-success';
  msgEl.classList.remove('hidden');
  setTimeout(() => msgEl.classList.add('hidden'), 3000);
  showToast('Settings saved!');
}

/* ─────────────────────────────────────────────────────
   FILTER PANEL TOGGLE
───────────────────────────────────────────────────── */
function initFilterPanel() {
  document.getElementById('filterBtn').addEventListener('click', function() {
    const panel = document.getElementById('filterPanel');
    panel.classList.toggle('hidden');
  });
  document.getElementById('filterCategory').addEventListener('change', function() { invPage = 1; renderInventoryTable(); });
  document.getElementById('filterStatus').addEventListener('change',   function() { invPage = 1; renderInventoryTable(); });
  document.getElementById('clearFilters').addEventListener('click', function() {
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterStatus').value   = '';
    document.getElementById('invSearch').value      = '';
    invPage = 1;
    renderInventoryTable();
  });
}

/* ─────────────────────────────────────────────────────
   MODAL CLOSE BUTTONS
───────────────────────────────────────────────────── */
function initModalCloseButtons() {
  // All buttons with data-modal attribute close the specified modal
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('[data-modal]');
    if (btn) closeModal(btn.dataset.modal);
  });
  // Click outside modal to close
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
      if (e.target === this) this.classList.add('hidden');
    });
  });
}

/* ─────────────────────────────────────────────────────
   WIRE UP ALL INTERACTIVE BUTTONS
───────────────────────────────────────────────────── */
function initButtons() {
  // Add Category
  document.getElementById('addCategoryBtn').addEventListener('click', openAddCategoryModal);
  // Save Category
  document.getElementById('saveCategoryBtn').addEventListener('click', saveCategory);

  // Add Product
  document.getElementById('addProductBtn').addEventListener('click', openAddProductModal);
  // Save Product
  document.getElementById('saveProductBtn').addEventListener('click', saveProduct);

  // Delete confirm
  document.getElementById('confirmDeleteBtn').addEventListener('click', executeDelete);

  // Settings save / cancel
  document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
  document.getElementById('cancelSettingsBtn').addEventListener('click', function() {
    renderSettings();
    showToast('Changes discarded.', 'info');
  });
}

/* ─────────────────────────────────────────────────────
   MAIN BOOTSTRAP
───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  // 0. LOGIN PROTECTION - Check session before anything else
  const session = lsGet('sm_session');
  if (!session || !session.loggedIn) {
    // Ensure login page is shown
    const appContainer = document.getElementById('appContainer');
    const loginPage = document.getElementById('loginPage');
    if (appContainer) appContainer.classList.add('hidden');
    if (loginPage) loginPage.classList.remove('hidden');
  }

  // 1. Seed data
  seedData();

  // 2. Check session
  checkSession();

  // 3. Wire up login form
  initLogin();

  // 4. Wire up nav, theme, search
  initNav();
  initTheme();
  initGlobalSearch();

  // 5. Wire up buttons
  initButtons();

  // 6. Filter panel
  initFilterPanel();

  // 7. Modal close buttons
  initModalCloseButtons();

  // 8. User avatar menu → settings
  document.getElementById('userMenuTrigger').addEventListener('click', function() {
    navigateTo('settings');
  });

  // 9. Keyboard escape closes modals
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(m => m.classList.add('hidden'));
    }
  });
});
