const DEFAULT_DATA = {
  stats: {
    totalProducts: 1234,
    lowStock: 23,
    critical: 5,
    ordersToday: 145,
    revenueLabel: '₹2.4L',
    revenueRaw: 240000,
  },
  stockTrend: [620, 780, 710, 860, 920, 1040],
  salesAnalytics: [42000, 48000, 45000, 56000, 61000, 72000],
  categories: [
    { name: 'Grocery', percent: 35, color: '#22c55e' },
    { name: 'Clothing', percent: 28, color: '#8b5cf6' },
    { name: 'Electronics', percent: 22, color: '#4338ca' },
    { name: 'Footwear', percent: 15, color: '#f97316' },
  ],
  activity: [
    { type: 'order', title: 'New order → Nike Air Max 270', time: '5 min ago' },
    { type: 'alert', title: 'Low stock → Britannia Biscuits', time: '12 min ago' },
    { type: 'product', title: 'Product added → Samsung Galaxy S24', time: '1 hour ago' },
    { type: 'ship', title: 'Order delivered → Zara Slim Fit Jeans', time: '2 hours ago' },
  ]
};

function safeJsonParse(value) {
  try { return JSON.parse(value); } catch { return null; }
}

function getStoredArray(key) {
  const value = localStorage.getItem(key);
  const parsed = safeJsonParse(value);
  return Array.isArray(parsed) ? parsed : null;
}

function formatRevenue(amount) {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return DEFAULT_DATA.stats.revenueLabel;
  const lakhs = amount / 100000;
  if (lakhs >= 1) return `₹${lakhs.toFixed(1)}L`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

function renderStats() {
  const products = getStoredArray('sm_products');
  const orders = getStoredArray('sm_orders');
  const categories = getStoredArray('sm_categories');

  const totalProducts = products ? products.length : DEFAULT_DATA.stats.totalProducts;
  const lowStockCount = products ? products.filter(item => item.qty <= 10 && item.qty > 0).length : DEFAULT_DATA.stats.lowStock;
  const criticalCount = products ? products.filter(item => item.qty <= 5 && item.qty > 0).length : DEFAULT_DATA.stats.critical;
  const ordersToday = orders ? orders.length : DEFAULT_DATA.stats.ordersToday;
  const revenueValue = orders ? orders.filter(order => order.status === 'Delivered').reduce((sum, order) => sum + (order.total || 0), 0) : DEFAULT_DATA.stats.revenueRaw;
  const revenueLabel = formatRevenue(revenueValue);

  const statsHtml = [
    {
      label: 'Total Products',
      value: totalProducts.toLocaleString('en-IN'),
      trend: '12% increase',
      iconClass: 'icon-blue',
      svg: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>'
    },
    {
      label: 'Low Stock Items',
      value: `${lowStockCount} (${criticalCount} critical)`,
      trend: '5 items flagged',
      iconClass: 'icon-red',
      svg: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'
    },
    {
      label: 'Orders Today',
      value: ordersToday.toLocaleString('en-IN'),
      trend: '8% more than yesterday',
      iconClass: 'icon-green',
      svg: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>'
    },
    {
      label: 'Revenue',
      value: revenueLabel,
      trend: '15% growth',
      iconClass: 'icon-purple',
      svg: '<path d="M12 3v18"/><path d="M18 5h-8a4 4 0 0 0 0 8h6a4 4 0 0 1 0 8H6"/>'
    }
  ];

  const container = document.getElementById('statCards');
  if (!container) return;
  container.innerHTML = statsHtml.map(item => `
    <article class="stat-card">
      <div class="stat-content">
        <div class="stat-label">${item.label}</div>
        <div class="stat-value">${item.value}</div>
        <div class="stat-trend">${item.trend}</div>
      </div>
      <div class="stat-icon ${item.iconClass}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${item.svg}</svg>
      </div>
    </article>
  `).join('');
}

function renderCharts() {
  const stockCtx = document.getElementById('stockTrendChart');
  const salesCtx = document.getElementById('salesChart');
  if (!stockCtx || !salesCtx) return;

  const stockChart = new Chart(stockCtx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Stock trends',
        data: DEFAULT_DATA.stockTrend,
        borderColor: '#4338ca',
        backgroundColor: 'rgba(67,56,202,.12)',
        tension: 0.35,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#4338ca'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(226,232,240,.7)' }, ticks: { color: '#6b7280' } },
        y: { grid: { color: 'rgba(226,232,240,.7)' }, ticks: { color: '#6b7280' }, beginAtZero: true }
      }
    }
  });

  const salesChart = new Chart(salesCtx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Sales analytics',
        data: DEFAULT_DATA.salesAnalytics,
        backgroundColor: '#8b5cf6',
        borderRadius: 12,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#6b7280' } },
        y: { grid: { color: 'rgba(226,232,240,.7)' }, ticks: { color: '#6b7280' }, beginAtZero: true }
      }
    }
  });
}

function renderCategoryPerformance() {
  const categories = getStoredArray('sm_categories');
  const displayList = categories && categories.length > 0 ? categories.slice(0, 4).map((cat, index) => {
    const fallback = DEFAULT_DATA.categories[index] || { percent: 10, color: '#a855f7' };
    return {
      name: cat.name,
      percent: fallback.percent,
      color: DEFAULT_DATA.categories[index] ? DEFAULT_DATA.categories[index].color : '#a855f7'
    };
  }) : DEFAULT_DATA.categories;

  const container = document.getElementById('categoryPerformance');
  if (!container) return;
  container.innerHTML = displayList.map(item => `
    <div class="category-item">
      <div class="category-meta">
        <span class="category-dot" style="background:${item.color}"></span>
        <span class="category-name">${item.name}</span>
      </div>
      <span class="category-percent">${item.percent}%</span>
    </div>
  `).join('');
}

function renderActivity() {
  const activities = getStoredArray('sm_activity') || DEFAULT_DATA.activity;
  const container = document.getElementById('recentActivity');
  if (!container) return;

  container.innerHTML = activities.map(item => `
    <article class="activity-item">
      <div class="activity-icon ${item.type}">
        ${getActivityIcon(item.type)}
      </div>
      <div class="activity-text">
        <div class="activity-title">${item.title}</div>
      </div>
      <div class="activity-time">${item.time}</div>
    </article>
  `).join('');
}

function getActivityIcon(type) {
  const icons = {
    order: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    product: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',
    ship: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>'
  };
  return icons[item.type] || icons.product;
}

function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
  });
}

function initDashboard() {
  renderStats();
  renderCharts();
  renderCategoryPerformance();
  renderActivity();
  initThemeToggle();
}

window.addEventListener('DOMContentLoaded', initDashboard);
