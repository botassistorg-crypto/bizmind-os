// ============================================
// 🚀 BIZMIND GROWTH OS - COMPLETE LOGIC
// ============================================

const AUTH_API = 'https://script.google.com/macros/s/AKfycbw3ozlur3z5Aoju9RgQkV0ml-LlfSDeH3hWX8GFI18YIWmoJ-lieg0_vq4dq50SY6H90Q/exec';

// ☁️ CENTRAL BACKUP ENGINE (Your deployed script URL)
const BACKUP_API = 'https://script.google.com/macros/s/AKfycbz5FZ4Nf2Jj9BjrNzcUVYukbfYyWUjwRlgo6HkVQWQ-vGvontGhrQWpBsBvymfotnv-uA/exec'; 
// (Paste the URL of the script that has handleFullBackup inside it)

// 1. STATE MANAGEMENT
const AppState = {
    currentView: 'dashboard',
    userTier: 'ELITE',
    currency: '৳'
};

// 2. ROUTER SYSTEM (With Security Check)
async function router(viewName) {
    // 🔒 SECURITY CHECK (Added)
    // If trying to access Growth Tab and NOT Elite
    if (viewName === 'growth' && AppState.userTier !== 'ELITE') {
        alert("🔒 The Growth Engine (AI) is exclusive to ELITE members.\nUpgrade to unlock Offers & CEO Tools.");
        return; // Stop here. Do not load the page.
    }

    AppState.currentView = viewName;

    // Update Bottom Nav UI
    document.querySelectorAll('.nav-btn').forEach(btn => {
        const icon = btn.querySelector('i');
        if (btn.dataset.target === viewName) {
            btn.classList.add('active');
            btn.querySelector('span').classList.replace('text-slate-400', 'text-brand-600');
            icon.classList.remove('ph-bold', 'text-slate-400');
            icon.classList.add('ph-fill', 'text-brand-600');
        } else {
            btn.classList.remove('active');
            btn.querySelector('span').classList.replace('text-brand-600', 'text-slate-400');
            icon.classList.remove('ph-fill', 'text-brand-600');
            icon.classList.add('ph-bold', 'text-slate-400');
        }
    });

    // Render Content
    renderView(viewName);
}
// 3. VIEW RENDERER
async function renderView(viewName) {
    const content = document.getElementById('app-content');
    
    // Show Loading Spinner
    content.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-slate-400 fade-in">
            <i class="ph ph-spinner animate-spin text-3xl text-brand-600"></i>
            <p class="text-xs mt-2 font-medium">Thinking...</p>
        </div>
    `;

    try {
        // Wait a tiny bit for UI smoothness
        await new Promise(r => setTimeout(r, 100));

        let html = '';

               if (viewName === 'dashboard') {
            html = await getDashboardHTML();
            // Initialize Chart Script
            setTimeout(initDashboardScripts, 50);
            
        } else if (viewName === 'orders') {
            html = await getOrderListHTML();
            
        } else if (viewName === 'growth') {
            html = await getGrowthHubHTML();

        } else if (viewName === 'inventory') {
            html = await getInventoryHTML();

        } else if (viewName === 'customers') {
            html = await getCustomerListHTML();

        } else if (viewName === 'menu') {
            // ✅ THIS IS THE NEW PART FOR SETTINGS
            html = await getSettingsHTML();
            
        } else {
            html = `<div class="p-6 text-center">Page Not Found</div>`;
        }

        content.innerHTML = `<div class="fade-in">${html}</div>`;

    } catch (error) {
        console.error("Rendering Error:", error);
        content.innerHTML = `
            <div class="p-6 flex flex-col items-center justify-center h-full text-center">
                <i class="ph ph-warning-circle text-4xl text-red-500 mb-2"></i>
                <h3 class="font-bold text-slate-800">App Crashed</h3>
                <p class="text-xs text-red-600 bg-red-50 p-2 rounded mt-2 break-all">${error.message}</p>
                <button onclick="location.reload()" class="mt-4 bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold">Reload</button>
            </div>
        `;
    }
}

// ============================================
// 📊 VIEW: DASHBOARD 2.0
// ============================================

async function getDashboardHTML() {
    // 1. Get State (Default to 'week' if not set)
    const period = AppState.dashboardPeriod || 'week';
    
    let stats = { sales: 0, profit: 0, orders: 0, expenses: 0 };
    let bestSellers = [];
    
    try {
        if(typeof db !== 'undefined') {
            const allOrders = await db.orders.toArray();
            const allExpenses = await db.expenses.toArray();
            
            // FILTER DATA
            const filteredOrders = filterOrdersByDate(allOrders, period);
            const filteredExpenses = filterOrdersByDate(allExpenses, period); // Reusing same date logic logic
            
            // CALC TOTALS
            filteredOrders.forEach(o => {
                stats.sales += (o.grandTotal || 0);
                stats.profit += (o.netProfit || 0);
            });
            filteredExpenses.forEach(e => stats.expenses += (e.amount || 0));
            stats.orders = filteredOrders.length;
            
            // ANALYTICS
            bestSellers = getBestSellers(filteredOrders);
        }
    } catch(e) {}

    const trueProfit = stats.profit - stats.expenses;

    return `
        <div class="p-5 pb-24 space-y-6 animate-fade-in">
            
            <!-- HEADER & FILTER -->
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-2xl font-bold text-slate-800">Overview</h2>
                    <p class="text-slate-500 text-xs">Financial Health</p>
                </div>
                <div class="bg-white border border-slate-200 rounded-lg p-1 flex">
                    <button onclick="setDashPeriod('today')" class="px-3 py-1 text-[10px] font-bold rounded ${period==='today'?'bg-slate-900 text-white':'text-slate-500'}">Day</button>
                    <button onclick="setDashPeriod('week')" class="px-3 py-1 text-[10px] font-bold rounded ${period==='week'?'bg-slate-900 text-white':'text-slate-500'}">Week</button>
                    <button onclick="setDashPeriod('month')" class="px-3 py-1 text-[10px] font-bold rounded ${period==='month'?'bg-slate-900 text-white':'text-slate-500'}">Month</button>
                </div>
            </div>

            <!-- MAIN CHART (Placeholder) -->
            <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div id="sales-chart" class="w-full h-40"></div>
            </div>

            <!-- FINANCIAL GRID -->
            <div class="grid grid-cols-2 gap-3">
                <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <p class="text-[10px] font-bold text-slate-400 uppercase">Sales</p>
                    <h3 class="text-xl font-bold text-slate-800">${AppState.currency} ${stats.sales}</h3>
                </div>
                <div class="bg-slate-800 p-4 rounded-2xl shadow-lg">
                    <p class="text-[10px] font-bold text-slate-400 uppercase">Net Profit</p>
                    <h3 class="text-xl font-bold text-emerald-400">${AppState.currency} ${trueProfit}</h3>
                </div>
                <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <p class="text-[10px] font-bold text-slate-400 uppercase">Ads/Exp</p>
                    <h3 class="text-xl font-bold text-rose-600">-${stats.expenses}</h3>
                </div>
                <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <p class="text-[10px] font-bold text-slate-400 uppercase">Orders</p>
                    <h3 class="text-xl font-bold text-slate-800">${stats.orders}</h3>
                </div>
            </div>

            <!-- BEST SELLERS LIST -->
            <div>
                <h3 class="font-bold text-slate-700 text-sm mb-3">🔥 Top Products (${period})</h3>
                ${bestSellers.length === 0 ? `<p class="text-xs text-slate-400">No sales in this period.</p>` : 
                  bestSellers.map((p, i) => `
                    <div class="flex justify-between items-center mb-2 bg-white p-3 rounded-xl border border-slate-100">
                        <div class="flex items-center gap-3">
                            <span class="font-bold text-slate-300 text-xs">#${i+1}</span>
                            <span class="text-sm font-bold text-slate-700">${p[0]}</span>
                        </div>
                        <span class="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-bold">${p[1]} sold</span>
                    </div>
                  `).join('')
                }
            </div>
        </div>
    `;
}

// Logic to switch periods
window.setDashPeriod = function(p) {
    AppState.dashboardPeriod = p;
    router('dashboard'); // Reload
}
// 3. CHART INITIALIZER (Add this function to app.js)
function initDashboardScripts() {
    // Fake Data for Visualization (Until we have real date grouping)
    // In production, we would map `chartData` from DB
    const options = {
        series: [{
            name: 'Sales',
            data: [4000, 3000, 2000, 5000, 6000, 8000, 7000] // Dummy 7 day data
        }],
        chart: {
            type: 'area',
            height: 160,
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif'
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2 },
        colors: ['#4f46e5'], // Brand Color
        fill: {
            type: 'gradient',
            gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.1, stops: [0, 90, 100] }
        },
        xaxis: {
            categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            labels: { style: { fontSize: '10px' } },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: { show: false },
        grid: { show: false, padding: { left: 0, right: 0, bottom: 0 } },
        tooltip: {
            theme: 'dark',
            x: { show: false }
        }
    };

    // Render Chart
    setTimeout(() => {
        if(document.querySelector("#sales-chart")) {
            const chart = new ApexCharts(document.querySelector("#sales-chart"), options);
            chart.render();
        }
    }, 100);
}
// ============================================
// 📋 VIEW: ORDER LIST
// ============================================
async function getOrderListHTML() {
    let orders = [];
    try {
        if(typeof db !== 'undefined') {
            orders = await db.orders.reverse().toArray();
        }
    } catch(e) { console.error(e); }

    if (orders.length === 0) {
        return `
            <div class="flex flex-col items-center justify-center h-[70vh] p-6 text-center">
                <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4"><i class="ph-duotone ph-shopping-cart text-4xl text-slate-300"></i></div>
                <h3 class="font-bold text-slate-700 text-lg">No Orders Yet</h3>
                <button onclick="prepareOrderModal()" class="mt-4 bg-brand-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg">+ Create First Order</button>
            </div>
        `;
    }

    const listHTML = orders.map(order => {
        let statusColor = 'bg-slate-100 text-slate-600';
        if (order.status === 'Pending') statusColor = 'bg-orange-100 text-orange-600';
        if (order.status === 'Confirmed') statusColor = 'bg-blue-100 text-blue-600';
        if (order.status === 'Delivered') statusColor = 'bg-emerald-100 text-emerald-600';

        const dateStr = new Date(order.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

        return `
            <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-3">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">${order.orderId}</span>
                        <h4 class="font-bold text-slate-800">${order.customerName}</h4>
                    </div>
                    <span class="text-[10px] font-bold px-2 py-1 rounded-md ${statusColor}">${order.status}</span>
                </div>
                <div class="flex justify-between items-end">
                    <div class="text-xs text-slate-500">
                        <div class="flex items-center gap-1 mb-1"><i class="ph-bold ph-phone"></i> ${order.customerPhone}</div>
                        <div class="flex items-center gap-1"><i class="ph-bold ph-calendar-blank"></i> ${dateStr}</div>
                    </div>
                    <div class="text-right">
                        <p class="text-[10px] text-slate-400">Total Amount</p>
                        <p class="font-bold text-lg text-brand-600">${AppState.currency} ${order.grandTotal}</p>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="p-4">
            <h2 class="font-bold text-xl mb-4 flex items-center gap-2">Orders <span class="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full">${orders.length}</span></h2>
            <div class="relative mb-4">
                <i class="ph-bold ph-magnifying-glass absolute left-3 top-3.5 text-slate-400"></i>
                <input type="text" placeholder="Search ID or Phone..." class="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-brand-500">
            </div>
            <div class="pb-20">${listHTML}</div>
        </div>
    `;
}

// ============================================
// 🧠 VIEW: GROWTH HUB (AI)
// ============================================
// ============================================
// 🧠 VIEW: GROWTH HUB (Updated with Tools)
// ============================================
async function getGrowthHubHTML() {
    let opportunities = [];
    try {
        if(typeof db !== 'undefined') {
            // 1. Dead Stock
            const deadStock = await db.products.where('stockQuantity').above(20).toArray();
            if (deadStock.length > 0) {
                const product = deadStock[0];
                opportunities.push({
                    title: 'Cash Stuck in Inventory',
                    desc: `You have <b>${product.stockQuantity} units</b> of '${product.name}' sitting idle.`,
                    action: 'Run Flash Sale',
                    color: 'from-orange-500 to-red-500',
                    icon: 'ph-fire',
                    waMessage: `🔥 FLASH SALE! ${product.name} is now 20% OFF for the next 24 hours only!`
                });
            }
            // 2. VIPs
            const vips = await db.customers.where('totalSpent').above(5000).toArray();
            if (vips.length > 0) {
                opportunities.push({
                    title: 'Reward Top Customers',
                    desc: `You have <b>${vips.length} VIP customers</b>. Send them a secret offer.`,
                    action: 'Send Secret Gift',
                    color: 'from-purple-600 to-indigo-600',
                    icon: 'ph-crown',
                    waMessage: `Assalamu Alaikum! As a VIP customer, you have a secret gift waiting for you! 🎁`
                });
            }
            // 3. General
            opportunities.push({
                title: 'Increase Order Value',
                desc: 'Suggest a "Combo Pack" to increase profit.',
                action: 'Create Bundle',
                color: 'from-blue-500 to-cyan-500',
                icon: 'ph-package',
                waMessage: `⚡ Summer Combo Deal: Buy 2 get Free Delivery! Reply YES.`
            });
        }
    } catch(e) { console.error(e); }

    const cardsHTML = opportunities.map(opp => `
        <div class="bg-gradient-to-r ${opp.color} rounded-2xl p-5 text-white shadow-lg mb-4 relative overflow-hidden group">
            <div class="relative z-10">
                <div class="flex items-center gap-2 mb-2">
                    <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"><i class="ph-fill ${opp.icon} text-lg"></i></div>
                    <h3 class="font-bold text-lg">${opp.title}</h3>
                </div>
                <p class="text-white/90 text-sm mb-4 leading-relaxed border-l-2 border-white/30 pl-3">${opp.desc}</p>
                <button onclick="openWhatsApp('${opp.waMessage}')" class="bg-white text-slate-900 text-xs font-bold px-4 py-2 rounded-lg shadow-lg active:scale-95 transition-transform flex items-center gap-2">
                    <i class="ph-bold ph-whatsapp-logo text-green-600"></i> ${opp.action}
                </button>
            </div>
            <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>
    `).join('');

    return `
        <div class="p-5 pb-24">
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-slate-800">Growth Engine 🚀</h2>
                <p class="text-slate-500 text-sm">AI-powered suggestions.</p>
            </div>
            
            <!-- OPPORTUNITY CARDS -->
            <div>
                <h3 class="font-bold text-slate-700 text-sm mb-3 uppercase tracking-wider">Active Opportunities</h3>
                ${cardsHTML}
            </div>

            <!-- TOOLS GRID (New!) -->
            <h3 class="font-bold text-slate-700 text-sm mb-3 mt-6 uppercase tracking-wider">Growth Tools</h3>
            <div class="grid grid-cols-2 gap-3">
                
                <!-- Price Doctor Shortcut -->
                <button onclick="openModal('addProduct')" class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center gap-2 active:bg-slate-50 transition-colors">
                    <i class="ph-duotone ph-magic-wand text-3xl text-brand-600"></i>
                    <span class="font-bold text-slate-700 text-sm">Price Doctor</span>
                </button>

                <!-- Time Calculator Button -->
                <button onclick="openModal('timeCalculator')" class="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center gap-2 active:bg-slate-100 transition-colors mt-2">
                    <i class="ph-bold ph-clock text-xl text-slate-600"></i>
                    <span class="font-bold text-slate-700 text-sm">CEO Time Calculator</span>
                </button>
                
                <!-- OFFER AI BUTTON -->
                <button onclick="openModal('offerWizard')" class="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-lg flex flex-col items-center gap-2 active:scale-95 transition-transform group">
                    <i class="ph-duotone ph-sparkle text-3xl text-purple-400 group-hover:text-purple-300"></i>
                    <span class="font-bold text-white text-sm">Offer AI 🧠</span>
                </button>

            </div>
        </div>
    `;
}
// ============================================
// 📦 VIEW: INVENTORY MANAGER
// ============================================
async function getInventoryHTML() {
    let products = [];
    try {
        if(typeof db !== 'undefined') {
            products = await db.products.reverse().toArray();
        }
    } catch(e) { console.error(e); }

    // 1. HEADER & ADD BUTTON
    let html = `
        <div class="p-4 pb-24">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="text-2xl font-bold text-slate-800">Inventory</h2>
                    <p class="text-slate-500 text-sm">Manage stock & prices</p>
                </div>
                <button onclick="prepareProductModal()" class="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg active:scale-95 transition-transform flex items-center gap-2">
                    <i class="ph-bold ph-plus"></i> Add Item
                </button>
            </div>
    `;

    // 2. EMPTY STATE
    if (products.length === 0) {
        html += `
            <div class="py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i class="ph-duotone ph-package text-3xl text-slate-400"></i>
                </div>
                <p class="text-slate-500 font-medium">No products found</p>
                <p class="text-xs text-slate-400 mb-4">Add items to start selling</p>
            </div>
        </div>`;
        return html;
    }

    // 3. PRODUCT LIST
    const list = products.map(p => {
        // Stock Logic
        let stockColor = 'bg-green-100 text-green-700';
        if (p.stockQuantity <= 5) stockColor = 'bg-red-100 text-red-700 font-bold';
        if (p.stockQuantity === 0) stockColor = 'bg-slate-100 text-slate-500';

        return `
            <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-3 flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-xl">
                        📦
                    </div>
                    <div>
                        <h4 class="font-bold text-slate-800 text-sm">${p.name}</h4>
                        <p class="text-[10px] text-slate-400 font-mono">SKU: ${p.sku}</p>
                    </div>
                </div>
                <div class="text-right">
                    <div class="mb-1">
                        <span class="text-[10px] px-2 py-0.5 rounded ${stockColor}">
                            Stock: ${p.stockQuantity}
                        </span>
                    </div>
                    <p class="text-sm font-bold text-slate-700">${AppState.currency} ${p.sellingPrice}</p>
                </div>
            </div>
        `;
    }).join('');

    html += `
        <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <p class="text-[10px] text-slate-400 uppercase font-bold">Total Items</p>
                <p class="text-xl font-bold text-slate-800">${products.length}</p>
            </div>
            <div class="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <p class="text-[10px] text-slate-400 uppercase font-bold">Value</p>
                <p class="text-xl font-bold text-brand-600">${AppState.currency} ${products.reduce((a,b) => a + (b.sellingPrice * b.stockQuantity), 0)}</p>
            </div>
        </div>
        <div>${list}</div>
    </div>`;

    return html;
}
// ============================================
// 👥 VIEW: CUSTOMERS & VIP CRM
// ============================================
async function getCustomerListHTML() {
    // 1. Get VIP Rule (Default > 5000 tk)
    let vipThreshold = 5000;
    try {
        const setting = await db.settings.get('vip_threshold');
        if (setting) vipThreshold = parseInt(setting.value);
    } catch(e) {}

    // 2. Fetch Customers
    let customers = [];
    try {
        if(typeof db !== 'undefined') {
            customers = await db.customers.reverse().toArray();
        }
    } catch(e) {}

    // 3. Separate VIPs
    const vips = customers.filter(c => c.totalSpent >= vipThreshold);
    const regulars = customers.filter(c => c.totalSpent < vipThreshold);

    // 4. HTML Structure
    return `
        <div class="p-4 pb-24">
            
            <!-- HEADER -->
            <div class="flex justify-between items-start mb-6">
                <div>
                    <h2 class="text-2xl font-bold text-slate-800">Customers</h2>
                    <p class="text-slate-500 text-sm">${customers.length} people in database</p>
                </div>
                <button onclick="setVIPRule(${vipThreshold})" class="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-2 rounded-lg border border-brand-100 flex items-center gap-1 active:scale-95">
                    <i class="ph-bold ph-gear"></i> VIP > ${vipThreshold}৳
                </button>
            </div>

            <!-- TABS -->
            <div class="flex p-1 bg-slate-100 rounded-xl mb-4">
                <button onclick="switchCustomerTab('vip')" id="tab-vip" class="flex-1 py-2 text-xs font-bold rounded-lg bg-white text-slate-800 shadow-sm transition-all">
                    👑 VIP Lounge (${vips.length})
                </button>
                <button onclick="switchCustomerTab('all')" id="tab-all" class="flex-1 py-2 text-xs font-bold rounded-lg text-slate-500 transition-all">
                    All Contacts
                </button>
            </div>

            <!-- VIP LIST -->
            <div id="list-vip" class="space-y-3 animate-fade-in">
                ${vips.length === 0 ? `
                    <div class="py-8 text-center border-2 border-dashed border-amber-200 rounded-xl bg-amber-50/50">
                        <i class="ph-duotone ph-crown text-3xl text-amber-400 mb-2"></i>
                        <p class="text-slate-600 font-bold text-sm">No VIPs Yet</p>
                        <p class="text-xs text-slate-400">Customers who spend >${vipThreshold}৳ will appear here.</p>
                    </div>
                ` : renderCustomerCards(vips, true)}
            </div>

            <!-- ALL LIST (Hidden initially) -->
            <div id="list-all" class="space-y-3 hidden animate-fade-in">
                ${renderCustomerCards(regulars, false)}
            </div>
        </div>
    `;
}


// HELPER: Render Cards (Updated with Email Button)
function renderCustomerCards(list, isVip) {
    return list.map(c => `
        <div class="bg-white p-4 rounded-xl border ${isVip ? 'border-amber-200 bg-amber-50/20' : 'border-slate-100'} shadow-sm flex justify-between items-center mb-2">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full ${isVip ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'} flex items-center justify-center text-lg font-bold">
                    ${c.name ? c.name.charAt(0) : '?'}
                </div>
                <div>
                    <h4 class="font-bold text-slate-800 text-sm flex items-center gap-1">
                        ${c.name}
                        ${isVip ? '<i class="ph-fill ph-crown text-amber-500 text-xs"></i>' : ''}
                    </h4>
                    <p class="text-[10px] text-slate-400 font-mono">${c.phone}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="text-[10px] text-slate-400 uppercase">Total Spent</p>
                <p class="text-sm font-bold ${isVip ? 'text-amber-600' : 'text-slate-700'}">
                    ${AppState.currency} ${c.totalSpent}
                </p>
                
                <!-- ACTION BUTTONS -->
                <div class="flex gap-2 justify-end mt-2">
                    <button onclick="openEmail('${c.name}', '${c.email || ''}')" class="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100 font-bold flex items-center gap-1 active:scale-95 transition-transform">
                        <i class="ph-bold ph-envelope"></i> Mail
                    </button>
                    <button onclick="openWhatsApp('Hello ${c.name}!', '${c.phone}')" class="text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100 font-bold flex items-center gap-1 active:scale-95 transition-transform">
                        <i class="ph-bold ph-whatsapp-logo"></i> Chat
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// HELPER: Switch Tabs Logic
window.switchCustomerTab = function(tab) {
    document.getElementById('list-vip').classList.add('hidden');
    document.getElementById('list-all').classList.add('hidden');
    
    // Reset Tab Styles
    document.getElementById('tab-vip').className = "flex-1 py-2 text-xs font-bold rounded-lg text-slate-500 transition-all";
    document.getElementById('tab-all').className = "flex-1 py-2 text-xs font-bold rounded-lg text-slate-500 transition-all";
    
    // Activate Selected
    document.getElementById(`list-${tab}`).classList.remove('hidden');
    document.getElementById(`tab-${tab}`).className = "flex-1 py-2 text-xs font-bold rounded-lg bg-white text-slate-800 shadow-sm transition-all border border-slate-200";
}

// ============================================
// 👑 VIP SETTINGS LOGIC (New & Professional)
// ============================================

// 1. OPEN THE SETTINGS MODAL
window.setVIPRule = function(currentValue) {
    // Open the new professional popup
    openModal('vipSettings');
    
    // Auto-fill the input box with the current value
    setTimeout(() => {
        const input = document.getElementById('vip-input');
        if(input) {
            input.value = currentValue;
            input.select(); // Highlight the number so user can type over it easily
        }
    }, 50);
}

// 2. SAVE THE RULE TO DATABASE
window.handleSaveVIPRule = async function(e) {
    e.preventDefault(); // Stop page reload
    
    const val = document.getElementById('vip-input').value;
    
    if(val && !isNaN(val)) {
        // Save to Database
        await db.settings.put({key: 'vip_threshold', value: parseInt(val)});
        
        closeModal();
        
        // Refresh the Customer View to apply the new rule instantly
        router('customers'); 
    }
}
// ============================================
// ⚙️ VIEW: SETTINGS & BACKUP
// ============================================

async function getSettingsHTML() {
    // Get saved config
    let config = { url: '', sheetId: '' };
    try {
        const urlSetting = await db.settings.get('backup_url');
        const idSetting = await db.settings.get('sheet_id');
        if(urlSetting) config.url = urlSetting.value;
        if(idSetting) config.sheetId = idSetting.value;
    } catch(e) {}

    return `
        <div class="p-5 pb-24 space-y-6 animate-fade-in">
            
            <!-- Header -->
            <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white">
                    <i class="ph-bold ph-gear text-xl"></i>
                </div>
                <div>
                    <h2 class="text-xl font-bold text-slate-800">Settings</h2>
                    <p class="text-xs text-slate-500">Connect your Google Sheet</p>
                </div>
            </div>

                         <!-- Connection Form (Simplified) -->
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h3 class="font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <i class="ph-duotone ph-cloud-arrow-up text-brand-600"></i> Cloud Backup
                </h3>
                <p class="text-xs text-slate-500 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <b>Setup Instructions:</b><br>
                    1. Create a blank Google Sheet.<br>
                    2. Share it with <b>botassist.org@gmail.com</b> (Editor).<br>
                    3. Copy the Sheet ID from the URL.
                </p>
                <form onsubmit="saveBackupConfig(event)" class="space-y-4">
                    <!-- Only Sheet ID needed now -->
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Your Google Sheet ID</label>
                        <input type="text" name="sheetId" value="${config.sheetId}" placeholder="e.g. 1SK9el..." 
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-600 focus:border-brand-500 focus:outline-none">
                    </div>
                    <button type="submit" class="w-full bg-slate-900 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-transform">
                        Connect Database
                    </button>
                </form>
            </div>

            <!-- Business Profile Button -->
            <button onclick="openBusinessSettings()" class="w-full bg-white p-4 mb-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between active:bg-slate-50 transition-colors">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center"><i class="ph-bold ph-storefront text-xl"></i></div>
                    <div class="text-left">
                        <h3 class="font-bold text-slate-700 text-sm">Shop Setup</h3>
                        <p class="text-[10px] text-slate-400">Name, Address, Rates</p>
                    </div>
                </div>
                <i class="ph-bold ph-caret-right text-slate-300"></i>
            </button>

            <!-- ✅ PASTE HERE: People Shortcut -->
            <button onclick="router('customers')" class="w-full bg-white p-4 mb-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between active:bg-slate-50 transition-colors">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                        <i class="ph-bold ph-users text-xl"></i>
                    </div>
                    <div class="text-left">
                        <h3 class="font-bold text-slate-700 text-sm">Customer List</h3>
                        <p class="text-[10px] text-slate-400">View VIPs & History</p>
                    </div>
                </div>
                <i class="ph-bold ph-caret-right text-slate-300"></i>
            </button>

            <!-- Backup Actions -->
            <div class="grid grid-cols-2 gap-3">
                <button onclick="performBackup()" class="bg-blue-50 text-blue-700 p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col items-center gap-2 active:bg-blue-100">
                    <i class="ph-bold ph-upload-simple text-2xl"></i>
                    <span class="font-bold text-xs">Backup Now</span>
                </button>
                <button onclick="performRestore()" class="bg-orange-50 text-orange-700 p-4 rounded-xl border border-orange-100 shadow-sm flex flex-col items-center gap-2 active:bg-orange-100">
                    <i class="ph-bold ph-download-simple text-2xl"></i>
                    <span class="font-bold text-xs">Restore Data</span>
                </button>
            </div>

            <!-- Danger Zone -->
            <div class="pt-6 border-t border-slate-200">
                <button onclick="hardResetApp()" class="w-full text-red-500 text-xs font-bold py-3 hover:bg-red-50 rounded-xl transition-colors">
                    Reset App Data (Delete All)
                </button>
            </div>
        </div>
    `;
}

// LOGIC: Save Settings
async function saveBackupConfig(e) {
    e.preventDefault();

// 🕵️ DEBUGGER (Remove later)
    alert("SYSTEM CHECK: You are currently " + AppState.userTier);
  
    // 🔒 STRICT CHECK - STOP STARTER HERE
    // We check AppState directly because it's loaded at startup
    if (AppState.userTier === 'STARTER') {
        alert("🔒 Cloud Sync is a Paid Feature.\nUpgrade to GROWTH or ELITE.");
        return; // STOP! Do not run the rest of the code.
    }

    const form = e.target;
    const sheetId = form.sheetId.value.trim();
    
    if (!sheetId) { 
        alert("Please enter a Sheet ID"); 
        return; 
    }

    const btn = form.querySelector('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = "Initializing Sheet...";
    
    try {
        // Call Script to Create Tabs
        const response = await fetch(BACKUP_API, {
            method: 'POST',
            body: JSON.stringify({ action: 'SETUP', sheetId: sheetId })
        });
        
        const res = await response.json();
        
        if (res.status === 'success') {
            await db.settings.put({ key: 'sheet_id', value: sheetId });
            alert("✅ Connected & Setup! Your sheet is ready.");
        } else {
            throw new Error(res.message);
        }
        
    } catch(err) {
        alert("Error: " + err.message);
    } finally {
        btn.innerHTML = originalText;
    }
}

// LOGIC: Perform Backup (The Magic)
async function performBackup(e) {
    // 🔒 SECURITY CHECK (Added)
    // Check if user is on STARTER plan (No Backup Allowed)
    if (AppState.userTier === 'STARTER') {
        alert("🔒 Cloud Backup is locked for STARTER plan.\nUpgrade to GROWTH to keep your data safe!");
        return;
    }

    const btn = e.currentTarget; // Get button to show loading state
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i class="ph-bold ph-spinner animate-spin"></i> Syncing...`;

    try {
        // 1. Get Config
        const url = (await db.settings.get('backup_url'))?.value;
        const sheetId = (await db.settings.get('sheet_id'))?.value;
        
        if(!url || !sheetId) throw new Error("Please save settings first!");

        // 2. Gather Data & ENRICH IT
        const rawOrders = await db.orders.toArray();
        const products = await db.products.toArray();
        
        // Helper: Find Product Name by SKU
        const getProductName = (sku) => {
            const p = products.find(x => x.sku === sku);
            return p ? p.name : sku; 
        };

        // Enrich Orders with Product Names
        const enrichedOrders = rawOrders.map(order => {
            let newOrder = JSON.parse(JSON.stringify(order));
            if(newOrder.items && newOrder.items.length > 0) {
                newOrder.items[0].productName = getProductName(newOrder.items[0].sku);
            }
            return newOrder;
        });

        const payload = {
            orders: enrichedOrders,
            products: products,
            customers: await db.customers.toArray(),
            expenses: await db.expenses.toArray()
        };

        // 3. Send to Google
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                action: 'BACKUP_ALL',
                sheetId: sheetId,
                data: payload
            })
        });

        const res = await response.json();
        
        if(res.status === 'success') {
            alert("☁️ Backup Complete! Your data is on Google Sheets.");
        } else {
            throw new Error(res.message);
        }

    } catch(e) {
        alert("❌ Backup Failed: " + e.message);
        console.error(e);
    } finally {
        btn.innerHTML = originalText;
    }
}
// LOGIC: Hard Reset
function hardResetApp() {
    if(confirm("⚠️ ARE YOU SURE? This deletes everything on this phone. Ensure you have a backup!")) {
        // Dexie Delete
        db.delete().then(() => {
            alert("App Reset. Reloading...");
            location.reload();
        });
    }
}


// ============================================
// ➕ MODALS & HELPERS (Final Corrected Version)
// ============================================

const Modals = {
    // 📦 ADD PRODUCT
    addProduct: `
        <div class="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-slide-up">
            <div class="bg-slate-900 text-white p-4 flex justify-between items-center">
                <div><h3 class="font-bold text-lg">Add New Product</h3><p class="text-xs text-slate-400">Inventory Setup</p></div>
                <button onclick="closeModal()" class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center"><i class="ph-bold ph-x"></i></button>
            </div>
            <form onsubmit="handleSaveProduct(event)" class="p-6 space-y-5">
                <div class="space-y-4">
                    <div><label class="block text-xs font-bold text-slate-500 uppercase mb-1">Product Name</label><input type="text" name="name" required placeholder="e.g. Premium Panjabi" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"></div>
                    <div class="grid grid-cols-2 gap-3">
                        <div><label class="block text-xs font-bold text-slate-500 uppercase mb-1">Code (SKU)</label><input type="text" name="sku" required placeholder="e.g. P-101" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"></div>
                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                            <select name="category" id="product-category-select" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold focus:outline-none">
                                <option value="General">General</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-3">
                    <div class="grid grid-cols-2 gap-4">
                        <div><label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cost Price</label><input type="number" name="costPrice" required class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold"></div>
                        <div>
                            <label class="block text-[10px] font-bold text-brand-600 uppercase mb-1 flex justify-between">
                                Selling Price 
                                <span onclick="openPriceDoctor()" class="cursor-pointer text-brand-500 hover:text-brand-700 flex items-center gap-1 bg-brand-50 px-2 rounded-full border border-brand-100"><i class="ph-fill ph-magic-wand"></i> AI Price</span>
                            </label>
                            <input type="number" name="sellingPrice" required class="w-full bg-white border-2 border-brand-200 rounded-xl px-3 py-2 text-sm font-bold text-brand-700">
                        </div>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div><label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Quantity</label><input type="number" name="stock" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold"></div>
                    <div><label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Alert At</label><input type="number" name="alert" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold"></div>
                </div>
                <button type="submit" class="w-full bg-brand-600 text-white font-bold py-3 rounded-xl mt-2">Save Item</button>
            </form>
        </div>
    `,

    // ⚙️ BUSINESS SETTINGS
    businessSettings: `
        <div class="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-slide-up">
            <div class="bg-slate-900 text-white p-4 flex justify-between items-center">
                <div><h3 class="font-bold text-lg">Shop Setup</h3><p class="text-xs text-slate-400">Invoice & Delivery Defaults</p></div>
                <button onclick="closeModal()" class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center"><i class="ph-bold ph-x"></i></button>
            </div>
            
            <form onsubmit="saveBusinessProfile(event)" class="p-6 space-y-6">
                <div class="space-y-3">
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-1">Invoice Details</p>
                    <div><label class="block text-[10px] font-bold text-slate-500 mb-1">Shop Name</label><input type="text" name="shopName" id="set-shopName" placeholder="My Store" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold"></div>
                    <div><label class="block text-[10px] font-bold text-slate-500 mb-1">Address</label><textarea name="shopAddress" id="set-shopAddress" rows="2" placeholder="Dhaka, Bangladesh" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"></textarea></div>
                </div>
                <div class="space-y-3">
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-1">Categories</p>
                    <div><label class="block text-[10px] font-bold text-slate-500 mb-1">List (comma separated)</label><textarea name="categories" id="set-categories" rows="2" placeholder="Saree, Panjabi, Watch" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold"></textarea></div>
                </div>
                <div class="space-y-3">
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-1">Delivery Charges</p>
                    <div class="grid grid-cols-2 gap-4">
                        <div><label class="block text-[10px] font-bold text-slate-500 mb-1">Inside Dhaka</label><input type="number" name="rateInside" id="set-rateInside" placeholder="60" class="w-full pl-3 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold"></div>
                        <div><label class="block text-[10px] font-bold text-slate-500 mb-1">Outside Dhaka</label><input type="number" name="rateOutside" id="set-rateOutside" placeholder="120" class="w-full pl-3 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold"></div>
                    </div>
                </div>
                <button type="submit" class="w-full bg-slate-900 text-white font-bold py-3 rounded-xl shadow-lg">Save Changes</button>
            </form>
        </div>
    `,

    // 🛒 ADD ORDER
    addOrder: `
        <div class="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-slide-up h-[85vh] flex flex-col">
            <div class="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
                <div><h3 class="font-bold text-lg">New Order</h3><p class="text-xs text-slate-400">Create Invoice</p></div>
                <button onclick="closeModal()" class="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center"><i class="ph-bold ph-x"></i></button>
            </div>
            <form onsubmit="handleSaveOrder(event)" class="p-5 space-y-5 overflow-y-auto flex-1">
                <div class="space-y-3">
                    <label class="text-xs font-bold text-brand-600 uppercase">Customer Info</label>
                    <input type="tel" name="phone" required placeholder="Phone (017...)" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold">
                    <input type="text" name="customerName" required placeholder="Name" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm">
                    <input type="email" name="email" placeholder="Email (Optional)" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm">
                    <textarea name="address" required placeholder="Address" rows="2" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"></textarea>
                </div>
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <label class="text-xs font-bold text-slate-500 uppercase">Order Items <span id="stock-indicator" class="ml-2 text-[10px]"></span></label>
                    <select id="product-select" name="productSku" required onchange="updatePriceFromProduct(this)" class="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold"><option value="">-- Choose Item --</option></select>
                    <div class="grid grid-cols-3 gap-3">
                        <div class="col-span-1"><input type="number" name="quantity" value="1" min="1" onchange="calculateTotal()" class="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-center font-bold"></div>
                        <div class="col-span-2"><input type="number" name="unitPrice" id="unit-price" required readonly class="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-right font-bold"></div>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>
                        <label class="text-[10px] font-bold text-slate-500 uppercase">Courier</label>
                        <select name="courier" class="w-full mt-1 bg-white border border-slate-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-brand-500">
                            <option value="Pathao">Pathao</option>
                            <option value="Steadfast">Steadfast</option>
                            <option value="Paperfly">Paperfly</option>
                            <option value="RedX">RedX</option>
                        </select>
                    </div>
                    <div>
                        <div class="flex justify-between items-center mb-1">
                            <label class="text-[10px] font-bold text-slate-500 uppercase">Charge</label>
                            <div class="flex bg-slate-200 rounded p-0.5">
                                <button type="button" onclick="setZone('inside')" class="text-[8px] px-2 rounded bg-white shadow-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">In</button>
                                <button type="button" onclick="setZone('outside')" class="text-[8px] px-2 rounded text-slate-500 hover:text-slate-700 hover:bg-white/50 transition-colors">Out</button>
                            </div>
                        </div>
                        <input type="number" name="deliveryCharge" id="delivery-input" value="120" onchange="calculateTotal()" 
                            class="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-sm font-bold text-center focus:outline-none focus:border-brand-500 text-brand-600">
                    </div>
                </div>
                <div class="bg-slate-900 text-white p-4 rounded-xl flex justify-between items-center shadow-lg sticky bottom-0">
                    <div><p class="text-[10px] text-slate-400 uppercase">Total</p><h2 class="text-2xl font-bold">৳ <span id="grand-total">0</span></h2></div>
                    <button type="submit" class="bg-brand-500 text-white font-bold px-6 py-3 rounded-lg">Confirm</button>
                </div>
            </form>
        </div>
    `,

    // 👑 VIP SETTINGS
    vipSettings: `
        <div class="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-slide-up">
            <div class="bg-slate-900 text-white p-4 flex justify-between items-center">
                <h3 class="font-bold text-lg">VIP Settings</h3>
                <button onclick="closeModal()" class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center"><i class="ph-bold ph-x"></i></button>
            </div>
            <form onsubmit="handleSaveVIPRule(event)" class="p-6 text-center">
                <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500"><i class="ph-duotone ph-crown text-3xl"></i></div>
                <h4 class="font-bold text-slate-800 text-lg mb-2">Define VIPs</h4>
                <p class="text-sm text-slate-500 mb-6">Customers become VIP when spending crosses:</p>
                <div class="relative mb-6">
                    <span class="absolute left-4 top-3.5 font-bold text-slate-400">৳</span>
                    <input type="number" name="threshold" id="vip-input" required class="w-full bg-slate-50 border-2 border-slate-200 rounded-xl pl-8 pr-4 py-3 text-xl font-bold text-center focus:border-brand-500 focus:outline-none">
                </div>
                <button type="submit" class="w-full bg-brand-600 text-white font-bold py-3 rounded-xl">Save Rule</button>
            </form>
        </div>
    `,

    // 💸 ADD EXPENSE
    addExpense: `
        <div class="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-slide-up">
            <div class="bg-rose-600 text-white p-4 flex justify-between items-center">
                <h3 class="font-bold text-lg">Log Expense</h3>
                <button onclick="closeModal()" class="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center"><i class="ph-bold ph-x"></i></button>
            </div>
            <form onsubmit="handleSaveExpense(event)" class="p-6 space-y-5">
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Category</label>
                    <div class="grid grid-cols-3 gap-2">
                        <label class="cursor-pointer"><input type="radio" name="category" value="Marketing" class="peer sr-only" checked><div class="p-3 rounded-xl border border-slate-200 text-center peer-checked:bg-rose-50 peer-checked:border-rose-500 peer-checked:text-rose-700"><i class="ph-duotone ph-megaphone text-xl mb-1"></i><p class="text-[10px] font-bold">Ads</p></div></label>
                        <label class="cursor-pointer"><input type="radio" name="category" value="Packaging" class="peer sr-only"><div class="p-3 rounded-xl border border-slate-200 text-center peer-checked:bg-rose-50 peer-checked:border-rose-500 peer-checked:text-rose-700"><i class="ph-duotone ph-package text-xl mb-1"></i><p class="text-[10px] font-bold">Pack</p></div></label>
                        <label class="cursor-pointer"><input type="radio" name="category" value="Operations" class="peer sr-only"><div class="p-3 rounded-xl border border-slate-200 text-center peer-checked:bg-rose-50 peer-checked:border-rose-500 peer-checked:text-rose-700"><i class="ph-duotone ph-buildings text-xl mb-1"></i><p class="text-[10px] font-bold">Fixed</p></div></label>
                    </div>
                </div>
                <div><label class="block text-xs font-bold text-slate-500 uppercase mb-1">Amount Spent</label><div class="relative"><span class="absolute left-4 top-3.5 font-bold text-rose-500">৳</span><input type="number" name="amount" required placeholder="0" class="w-full bg-rose-50/50 border-2 border-rose-100 rounded-xl pl-8 pr-4 py-3 text-xl font-bold text-slate-800 focus:border-rose-500 focus:outline-none"></div></div>
                <button type="submit" class="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-rose-500/30">Save Expense</button>
            </form>
        </div>
    `,

    // 🪄 PRICE DOCTOR
    priceDoctor: `
        <div class="bg-slate-900 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-slide-up text-white">
            <div class="p-5 border-b border-white/10 flex justify-between items-center">
                <div><h3 class="font-bold text-lg">Price Doctor 🪄</h3><p class="text-xs text-slate-400">Based on Cost: ৳<span id="pd-cost-display">0</span></p></div>
                <button onclick="openModal('addProduct')" class="text-sm text-slate-400 hover:text-white">Back</button>
            </div>
            <div class="p-5 space-y-3">
                <div id="pd-card-a" class="bg-white/5 p-3 rounded-xl border border-white/10 cursor-pointer flex justify-between items-center hover:bg-white/10">
                    <div><p class="text-xs text-brand-400 font-bold uppercase">Charm Pricing</p><p class="text-[10px] text-slate-400">Volume Driver</p></div>
                    <div class="text-right"><h4 class="text-xl font-bold">৳ <span id="pd-price-a">0</span></h4><span id="pd-margin-a" class="text-[10px] text-green-400">0%</span></div>
                </div>
                <div id="pd-card-b" class="bg-brand-600 p-4 rounded-xl border border-brand-400 cursor-pointer flex justify-between items-center shadow-lg transform scale-105">
                    <div><p class="text-xs text-white font-bold uppercase">Profit Max</p><p class="text-[10px] text-brand-100">Recommended</p></div>
                    <div class="text-right"><h4 class="text-2xl font-bold">৳ <span id="pd-price-b">0</span></h4><span id="pd-margin-b" class="text-[10px] bg-white text-brand-700 px-1 rounded font-bold">0%</span></div>
                </div>
                <div id="pd-card-c" class="bg-white/5 p-3 rounded-xl border border-white/10 cursor-pointer flex justify-between items-center hover:bg-white/10">
                    <div><p class="text-xs text-purple-400 font-bold uppercase">Anchor / MRP</p><p class="text-[10px] text-slate-400">High Perception</p></div>
                    <div class="text-right"><h4 class="text-xl font-bold">৳ <span id="pd-price-c">0</span></h4><span id="pd-margin-c" class="text-[10px] text-purple-400">0%</span></div>
                </div>
            </div>
        </div>
    `,

    // 🧠 OFFER AI WIZARD
    offerWizard: `
        <div class="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-slide-up h-[80vh] flex flex-col">
            <div class="bg-purple-900 text-white p-5">
                <div class="flex justify-between items-start">
                    <div><h3 class="font-bold text-lg flex items-center gap-2"><i class="ph-fill ph-brain"></i> Offer AI</h3><p class="text-xs text-purple-200 mt-1">Based on the 6-Step Value Formula.</p></div>
                    <button onclick="closeModal()" class="text-white/70 hover:text-white"><i class="ph-bold ph-x text-xl"></i></button>
                </div>
            </div>
            <form onsubmit="generatePerfectOffer(event)" class="p-6 space-y-6 overflow-y-auto flex-1">
                <div><label class="block text-xs font-bold text-purple-900 uppercase mb-2">1. What are you selling?</label><input type="text" name="product" required placeholder="e.g. Silk Saree" class="w-full bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 text-sm font-bold"></div>
                <div><label class="block text-xs font-bold text-purple-900 uppercase mb-2">2. The Dream Outcome?</label><p class="text-[10px] text-slate-500 mb-2">How will they FEEL?</p><input type="text" name="dream" required placeholder="e.g. Look like a Queen" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"></div>
                <div>
                    <label class="block text-xs font-bold text-purple-900 uppercase mb-2">3. The Main Fear?</label>
                    <select name="roadblock" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm">
                        <option value="risk">Risk ("What if quality is bad?")</option>
                        <option value="money">Money ("Too expensive")</option>
                        <option value="time">Time ("Need it urgently")</option>
                        <option value="effort">Effort ("Hard to use")</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-bold text-purple-900 uppercase mb-2">4. Stack the Value</label>
                    <div class="space-y-2">
                        <label class="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border"><input type="checkbox" name="bonus" value="Free Delivery" checked> 🚚 Free Delivery</label>
                        <label class="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border"><input type="checkbox" name="bonus" value="Premium Box"> 🎁 Premium Box</label>
                        <label class="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border"><input type="checkbox" name="bonus" value="7-Day Returns"> 🛡️ 7-Day Returns</label>
                    </div>
                </div>
                <button type="submit" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2"><i class="ph-bold ph-magic-wand"></i> Generate Magic Offer</button>
            </form>
        </div>
    `,

    // 📄 RESULT MODAL
    offerResult: `
        <div class="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-slide-up">
            <div class="bg-emerald-600 text-white p-4 flex justify-between items-center">
                <h3 class="font-bold text-lg">Offer Generated! 🎉</h3>
                <button onclick="closeModal()" class="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center"><i class="ph-bold ph-x"></i></button>
            </div>
            <div class="p-6">
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-700 leading-relaxed mb-4 font-mono" id="offer-text-output">Generating...</div>
                <div class="grid grid-cols-2 gap-3">
                    <button onclick="copyOfferText()" class="bg-white border border-slate-300 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50">Copy Text</button>
                    <button onclick="sendOfferWA()" class="bg-green-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-500/30">Open WhatsApp</button>
                </div>
            </div>
        </div>
    `,

    // ⏳ TIME COST CALCULATOR
    timeCalculator: `
        <div class="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-slide-up">
            <div class="bg-slate-800 text-white p-5">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-bold text-lg flex items-center gap-2"><i class="ph-fill ph-clock"></i> Time Cost</h3>
                        <p class="text-xs text-slate-400 mt-1">Are you losing money by working?</p>
                    </div>
                    <button onclick="closeModal()" class="text-white/70 hover:text-white"><i class="ph-bold ph-x text-xl"></i></button>
                </div>
            </div>

            <form onsubmit="calculateOpportunityCost(event)" class="p-6 space-y-6">
                
                <!-- 1. Salary Input -->
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-2">What is your time worth?</label>
                    <div class="flex items-center gap-2">
                        <input type="number" name="monthlyGoal" placeholder="Target Income (e.g. 50000)" required
                            class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-brand-500">
                        <span class="text-xs text-slate-400 font-bold">/month</span>
                    </div>
                </div>

                <!-- 2. Task Input -->
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Task Duration</label>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <p class="text-[10px] text-slate-400 mb-1">Hours Spent</p>
                            <input type="number" name="hours" placeholder="0" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-center font-bold">
                        </div>
                        <div>
                            <p class="text-[10px] text-slate-400 mb-1">Task Type</p>
                            <select name="taskType" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-xs">
                                <option value="Packaging">Packing</option>
                                <option value="Delivery">Delivery</option>
                                <option value="Chatting">Replying</option>
                            </select>
                        </div>
                    </div>
                </div>

                <button type="submit" class="w-full bg-slate-800 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2">
                    Calculate Loss
                </button>

                <!-- RESULT AREA (Hidden initially) -->
                <div id="time-result" class="hidden pt-4 border-t border-slate-100 text-center animate-fade-in">
                    <p class="text-xs text-slate-500 uppercase font-bold">This task cost you:</p>
                    <h3 class="text-3xl font-bold text-red-500 my-2">৳ <span id="time-cost-val">0</span></h3>
                    <p class="text-xs text-slate-600 bg-red-50 p-2 rounded-lg leading-relaxed" id="time-advice">
                        Advice loading...
                    </p>
                </div>
            </form>
        </div>
    `
};
// HELPER FUNCTIONS
function openModal(modalName) {
    const overlay = document.getElementById('modal-overlay');
    overlay.innerHTML = Modals[modalName];
    overlay.classList.remove('hidden', 'opacity-0');
}
function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.add('opacity-0');
    setTimeout(() => { overlay.classList.add('hidden'); overlay.innerHTML = ''; }, 200);
}
async function prepareOrderModal() {
    openModal('addOrder');
    const products = await db.products.toArray();
    const select = document.getElementById('product-select');
    select.innerHTML = '<option value="">-- Select Product --</option>';
    products.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.sku;
        opt.dataset.price = p.sellingPrice;
        opt.dataset.cost = p.costPrice;
        opt.dataset.stock = p.stockQuantity;
        opt.text = `${p.name} (Stock: ${p.stockQuantity})`;
        select.appendChild(opt);
    });
}
function updatePriceFromProduct(select) {
    const option = select.options[select.selectedIndex];
    if(option.value) {
        document.getElementById('unit-price').value = option.dataset.price;
        const stock = option.dataset.stock;
        const indicator = document.getElementById('stock-indicator');
        indicator.innerText = `In Stock: ${stock}`;
        indicator.className = stock < 5 ? 'text-red-500 font-bold' : 'text-green-600';
        calculateTotal();
    }
}
function calculateTotal() {
    const qty = document.querySelector('input[name="quantity"]').value || 0;
    const price = document.querySelector('input[name="unitPrice"]').value || 0;
    const delivery = document.querySelector('input[name="deliveryCharge"]').value || 0;
    const total = (qty * price) + parseFloat(delivery);
    document.getElementById('grand-total').innerText = total;
}
async function handleSaveProduct(e) {
    e.preventDefault();
    const form = e.target;
    try {
        await db.products.add({
            name: form.name.value,
            sku: form.sku.value,
            costPrice: parseFloat(form.costPrice.value),
            sellingPrice: parseFloat(form.sellingPrice.value),
            stockQuantity: parseInt(form.stock.value),
            alertThreshold: parseInt(form.alert.value)
        });
        closeModal();
        alert("✅ Product Saved");
        router('dashboard');
    } catch (err) { alert("Error: " + err.message); }
}
async function handleSaveOrder(e) {
    e.preventDefault();
    const form = e.target;
    
    // 1. Get Values
    const select = document.getElementById('product-select');
    const costPrice = parseFloat(select.options[select.selectedIndex].dataset.cost || 0);
    const unitPrice = parseFloat(form.unitPrice.value);
    const quantity = parseInt(form.quantity.value);
    const deliveryCharge = parseFloat(form.deliveryCharge.value);
    const grandTotal = (quantity * unitPrice) + deliveryCharge;
    const netProfit = grandTotal - ((quantity * costPrice) + deliveryCharge);
    
    // NEW: Get Email
    const email = form.email ? form.email.value : "";

    try {
        // 2. Save Order
        await db.orders.add({
            orderId: 'ORD-' + Date.now().toString().slice(-5),
            date: new Date(),
            customerPhone: form.phone.value,
            customerName: form.customerName.value,
            customerEmail: email, // ✅ ADDED HERE
            address: form.address.value,
            status: 'Pending',
            grandTotal: grandTotal,
            netProfit: netProfit,
            items: [{ sku: form.productSku.value, qty: quantity, price: unitPrice }]
        });
        
        // 3. Update Stock
        const product = await db.products.where('sku').equals(form.productSku.value).first();
        if(product) {
            await db.products.update(product.id, { stockQuantity: product.stockQuantity - quantity });
        }

        // 4. Update CRM (Profile)
        const customer = await db.customers.get(form.phone.value);
        if(customer) {
            // Update existing
            await db.customers.update(form.phone.value, { 
                totalSpent: customer.totalSpent + grandTotal,
                email: email || customer.email // Update email if provided
            });
        } else {
            // Create new
            await db.customers.add({
                phone: form.phone.value,
                name: form.customerName.value,
                email: email, // ✅ ADDED HERE
                totalSpent: grandTotal,
                totalOrders: 1,
                riskScore: 0,
                tier: 'Bronze'
            });
        }

        closeModal();
        alert("🎉 Order Placed!");
        router('dashboard');
        
    } catch (err) { 
        alert("Error: " + err.message); 
    }
}

// ============================================
// 💬 FIXED WHATSAPP FUNCTION
// ============================================

function openWhatsApp(text, phoneNumber = null) {
    // 1. Clean the text (Fixes the weird characters)
    const safeText = encodeURIComponent(text.trim());
    
    let url = '';

    if (phoneNumber) {
        // If we have a customer number, go DIRECTLY to their chat
        // Remove spaces, dashes, etc.
        let cleanPhone = phoneNumber.replace(/\D/g, '');
        // Add BD code if missing
        if (!cleanPhone.startsWith('880')) cleanPhone = '880' + cleanPhone.replace(/^0+/, '');
        
        url = `https://wa.me/${cleanPhone}?text=${safeText}`;
    } else {
        // If no number (like Flash Sale), open Contact List
        url = `https://wa.me/?text=${safeText}`;
    }
    
    // 2. Open in new tab
    window.open(url, '_blank');
}
// ============================================
// 💸 EXPENSE LOGIC
// ============================================

async function handleSaveExpense(e) {
    e.preventDefault();
    const form = e.target;
    
    const expenseData = {
        date: new Date(),
        category: form.category.value,
        amount: parseFloat(form.amount.value),
        note: form.note.value
    };

    try {
        // Save to DB
        await db.expenses.add(expenseData);
        
        closeModal();
        alert("💸 Expense Logged!");
        
        // Refresh Dashboard to update "Net Profit"
        router('dashboard'); 

    } catch (err) {
        alert("Error: " + err.message);
    }
}
// ============================================
// 💸 EXPENSE SAVING LOGIC (Missing Piece)
// ============================================

async function handleSaveExpense(e) {
    e.preventDefault(); // Stop page reload
    const form = e.target;
    
    // 1. Get Values
    const expenseData = {
        date: new Date(),
        category: form.category.value,
        amount: parseFloat(form.amount.value) || 0, // Ensure it's a number
        note: "" // Note is optional
    };

    if (expenseData.amount <= 0) {
        alert("Please enter a valid amount!");
        return;
    }

    try {
        // 2. Save to Database
        await db.expenses.add(expenseData);
        
        // 3. Success
        closeModal();
        alert("💸 Expense Saved: " + expenseData.amount);
        
        // 4. Refresh Dashboard to update Profit
        router('dashboard'); 

    } catch (err) {
        console.error(err);
        alert("Error saving expense: " + err.message);
    }
}
// ============================================
// 🧠 PERFECT OFFER GENERATOR LOGIC
// ============================================

let currentGeneratedOffer = "";

function generatePerfectOffer(e) {
    e.preventDefault();
    const form = e.target;
    
    // 1. Capture Inputs
    const product = form.product.value;
    const dream = form.dream.value; // "Look like a Queen"
    const roadblockType = form.roadblock.value;
    
    // Get Checked Bonuses
    const bonuses = Array.from(document.querySelectorAll('input[name="bonus"]:checked'))
        .map(cb => cb.value);
    
    // 2. Apply The Formula (Logic)
    
    // A. Roadblock Solution
    let guarantee = "";
    if (roadblockType === 'risk') guarantee = "Don't like it? Instant Return Policy. No questions asked.";
    if (roadblockType === 'money') guarantee = "Best Price Guarantee for this quality.";
    if (roadblockType === 'time') guarantee = "Order now, Get it within 24 Hours!";
    if (roadblockType === 'effort') guarantee = "Ready to wear. No styling needed.";

    // B. The Value Stack String
    const stack = bonuses.length > 0 
        ? "\n\n🎁 BONUSES INCLUDED:\n" + bonuses.map(b => `✅ ${b}`).join("\n") 
        : "";

    // C. Construct the Copy (The Script)
    const copy = `
✨ THE ${product.toUpperCase()} DREAM DEAL ✨

Want to ${dream}? 
Now you can, without worrying about ${roadblockType}!

Introducing the ${product} Premium Edition.
${guarantee}

${stack}

⏰ URGENCY: Only 5 units left at this price!
👇 Reply "YES" to book yours now!
    `.trim();

    // 3. Show Result
    currentGeneratedOffer = copy;
    openModal('offerResult'); // Switch modals
    
    // Wait for modal to open then inject text
    setTimeout(() => {
        document.getElementById('offer-text-output').innerText = copy;
    }, 100);
}

// Helper: Copy to Clipboard
function copyOfferText() {
    navigator.clipboard.writeText(currentGeneratedOffer);
    alert("Copied to clipboard!");
}

// Helper: Send
function sendOfferWA() {
    openWhatsApp(currentGeneratedOffer);
}
// ============================================
// ⏳ OPPORTUNITY COST LOGIC
// ============================================

function calculateOpportunityCost(e) {
    e.preventDefault();
    const form = e.target;
    
    // 1. Get Inputs
    const monthlyGoal = parseFloat(form.monthlyGoal.value);
    const hours = parseFloat(form.hours.value) || 0;
    const task = form.taskType.value;

    // 2. Calculate Hourly Rate (Assuming 160 work hours/month)
    const hourlyRate = monthlyGoal / 160;
    
    // 3. Calculate Cost
    const cost = Math.round(hourlyRate * hours);

    // 4. Generate Advice
    let advice = "";
    if (cost > 500) {
        advice = `⛔ <b>STOP!</b> You just lost ৳${cost}. You could hire a helper for ৳100/hr to do ${task}. Focus on Marketing instead!`;
    } else {
        advice = `⚠️ <b>Careful.</b> This cost you ৳${cost}. If you do this every day, you lose ৳${cost*30} per month.`;
    }

    // 5. Show Result
    document.getElementById('time-result').classList.remove('hidden');
    document.getElementById('time-cost-val').innerText = cost;
    document.getElementById('time-advice').innerHTML = advice;
}

// INIT

// ============================================
// 🔐 SECURITY & LOGIN LOGIC
// ============================================

// GENERATE DEVICE FINGERPRINT (Simple version)
function getDeviceID() {
    let id = localStorage.getItem('biz_device_id');
    if (!id) {
        id = 'DEV-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
        localStorage.setItem('biz_device_id', id);
    }
    return id;
}
// ============================================
// 🪄 PRICE DOCTOR LOGIC (With Security Check)
// ============================================

function calculatePricing(cost) {
    cost = parseFloat(cost);
    if (!cost || isNaN(cost)) return null;

    // A: Charm (Ends in 90)
    let priceA = Math.ceil((cost * 1.6) / 10) * 10; 
    if (priceA % 100 === 0) priceA -= 10; 

    // B: Balanced (2.5x)
    let priceB = Math.ceil((cost * 2.5) / 50) * 50; 

    // C: Premium Anchor (4x Markup for "Fake MRP")
    let priceC = Math.ceil((cost * 4.0) / 100) * 100; 

    return {
        a: { price: priceA, margin: Math.round(((priceA - cost)/priceA)*100), label: "Charm Price", desc: "Ends in 90/99" },
        b: { price: priceB, margin: Math.round(((priceB - cost)/priceB)*100), label: "Profit Max", desc: "Recommended" },
        c: { price: priceC, margin: Math.round(((priceC - cost)/priceC)*100), label: "Anchor / MRP", desc: "Use as 'Regular Price'" }
    };
}

window.openPriceDoctor = function() {
    // 🔒 SECURITY CHECK (Added)
    // Only ELITE and GROWTH can use this
    if (AppState.userTier !== 'ELITE' && AppState.userTier !== 'GROWTH') {
        alert("🔒 Price Doctor is a paid feature.\nAvailable in GROWTH & ELITE plans.");
        return;
    }

    const costInput = document.querySelector('input[name="costPrice"]');
    const cost = costInput ? costInput.value : 0;

    if (!cost || cost <= 0) {
        alert("Please enter Cost Price first!");
        return;
    }

    const s = calculatePricing(cost);
    openModal('priceDoctor'); // Uses the modal template below

    setTimeout(() => {
        document.getElementById('pd-cost-display').innerText = cost;
        
        ['a', 'b', 'c'].forEach(key => {
            document.getElementById(`pd-price-${key}`).innerText = s[key].price;
            document.getElementById(`pd-margin-${key}`).innerText = s[key].margin + '% Margin';
            
            // Fix click handler to pass cost correctly
            document.getElementById(`pd-card-${key}`).onclick = function() {
                applyPrice(s[key].price, cost);
            };
        });
    }, 50);
}

function applyPrice(price, originalCost) {
    closeModal(); // Close Doctor
    openModal('addProduct'); // Re-open Form
    
    // Fill values back in
    setTimeout(() => {
        const costInput = document.querySelector('input[name="costPrice"]');
        const priceInput = document.querySelector('input[name="sellingPrice"]');
        
        if(costInput) costInput.value = originalCost;
        if(priceInput) priceInput.value = price;
    }, 50);
}

// APP STARTUP
document.addEventListener('DOMContentLoaded', async () => {
    const session = await db.settings.get('user_session');
    
    if (session && session.value) {
        // 1. Set State from Local Storage FIRST
        AppState.userTier = session.value.tier; 
        console.log("Local Tier Loaded:", AppState.userTier);

        // 2. Load App
        router('dashboard');
        
        // 3. FORCE RE-VALIDATE ONLINE (To catch downgrades)
        if(navigator.onLine) {
            validateSession(session.value);
        }
    } else {
        showLoginScreen();
    }
});

function showLoginScreen() {
    document.getElementById('app-content').innerHTML = `
        <div class="h-screen w-full bg-slate-900 flex flex-col items-center justify-center p-6 animate-fade-in">
            <div class="w-24 h-24 bg-gradient-to-tr from-brand-600 to-purple-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-brand-500/20">
                <i class="ph-bold ph-rocket text-5xl text-white"></i>
            </div>
            
            <h1 class="text-3xl font-bold text-white mb-2">BizMind</h1>
            <p class="text-slate-400 text-sm mb-10">The Growth OS for Modern Business</p>
            
            <form onsubmit="handleLogin(event)" class="w-full max-w-xs space-y-4">
                <div>
                    <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Mobile Number</label>
                    <input type="tel" name="mobile" placeholder="017..." required
                        class="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3.5 rounded-xl focus:border-brand-500 focus:outline-none transition-colors">
                </div>
                
                <div>
                    <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">License Key</label>
                    <input type="text" name="key" placeholder="BIZ-XXXX" required
                        class="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3.5 rounded-xl font-mono focus:border-brand-500 focus:outline-none uppercase transition-colors">
                </div>

                <button type="submit" id="login-btn" class="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-500/20 active:scale-95 transition-transform mt-4">
                    Secure Login
                </button>
            </form>
            
            <div class="mt-8 text-center">
                <p class="text-xs text-slate-600">Don't have a key?</p>
                <a href="#" class="text-xs font-bold text-brand-500 hover:text-brand-400">Contact Support</a>
            </div>
        </div>
    `;
    // Hide nav
    document.querySelector('nav').classList.add('hidden');
    document.querySelector('header').classList.add('hidden');
}

async function handleLogin(e) {
    e.preventDefault();
    const btn = document.getElementById('login-btn');
    const mobile = e.target.mobile.value.trim();
    const key = e.target.key.value.trim();
    const deviceId = getDeviceID();
    
    btn.innerHTML = `<i class="ph-bold ph-spinner animate-spin"></i> Verifying...`;
    
    try {
        const url = `${AUTH_API}?mobile=${mobile}&key=${key}&deviceId=${deviceId}`;
        const response = await fetch(url);
        const res = await response.json();
        
        if (res.valid) {
            // SAVE SESSION LOCALLY
            await db.settings.put({ 
                key: 'user_session', 
                value: { mobile, key, tier: res.tier, deviceId } 
            });
            
            alert(`🎉 ${res.message}\nTier: ${res.tier}`);
            location.reload(); // Reload to load full app
        } else {
            alert("❌ Access Denied:\n" + res.message);
            btn.innerHTML = "Try Again";
        }
    } catch (err) {
        alert("⚠️ Internet Error. Check connection.");
        btn.innerHTML = "Try Again";
    }
}

async function validateSession(session) {
    try {
        const url = `${AUTH_API}?mobile=${session.mobile}&key=${session.key}&deviceId=${session.deviceId}`;
        const response = await fetch(url);
        const res = await response.json();
        
        if (!res.valid) {
            await db.settings.delete('user_session');
            alert("⛔ Access Revoked.");
            location.reload();
        } else {
            // ✅ CRITICAL FIX: If sheet says STARTER but App says ELITE -> Downgrade immediately
            if(res.tier !== session.tier) {
                console.log(`Downgrading from ${session.tier} to ${res.tier}`);
                
                // Update Local Object
                session.tier = res.tier;
                AppState.userTier = res.tier;
                
                // Save to DB
                await db.settings.put({ key: 'user_session', value: session });
                
                // Alert User
                alert("ℹ️ Your plan has updated to: " + res.tier);
            }
        }
    } catch(e) { console.log("Offline Check Skipped"); }
}

// ============================================
// 📊 ANALYTICS HELPERS
// ============================================

function filterOrdersByDate(orders, period) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return orders.filter(o => {
        const d = new Date(o.date);
        if (period === 'today') return d >= today;
        if (period === 'week') {
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            return d >= weekAgo;
        }
        if (period === 'month') {
            const monthAgo = new Date(today);
            monthAgo.setMonth(today.getMonth() - 1);
            return d >= monthAgo;
        }
        return true; // All time
    });
}

function getBestSellers(orders) {
    let counts = {};
    orders.forEach(o => {
        if(o.items) {
            o.items.forEach(i => {
                // Use Name or SKU
                const name = i.productName || i.sku; 
                counts[name] = (counts[name] || 0) + i.qty;
            });
        }
    });
    // Sort and take top 3
    return Object.entries(counts)
        .sort((a,b) => b[1] - a[1])
        .slice(0, 3);
}

function openEmail(name, email) {
    // SECURITY
    if (AppState.userTier === 'STARTER') {
        alert("🔒 Email Marketing is locked for STARTER.\nUpgrade to engage customers!");
        return;
    }

    if (!email) {
        alert("⚠️ No email address found for this customer.");
        return;
    }

    const subject = encodeURIComponent(`Special Offer for ${name}`);
    const body = encodeURIComponent(`Hi ${name},\n\nWe noticed you haven't visited us in a while...\n\n(Type your offer here)`);
    
    // DEBUG: Print the link to console to see if it's generated
    console.log(`Opening: mailto:${email}?subject=${subject}&body=${body}`);
    
    // Open Mail Client
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
}

// ============================================
// ⚙️ BUSINESS PROFILE LOGIC (Updated with Categories)
// ============================================

window.openBusinessSettings = async function() {
    openModal('businessSettings');
    
    // Load existing values
    try {
        const profile = await db.settings.get('business_profile');
        if(profile && profile.value) {
            const p = profile.value;
            setTimeout(() => {
                document.getElementById('set-shopName').value = p.shopName || '';
                document.getElementById('set-shopAddress').value = p.address || '';
                document.getElementById('set-rateInside').value = p.rateInside || 60;
                document.getElementById('set-rateOutside').value = p.rateOutside || 120;
                // ✅ ADDED THIS LINE:
                document.getElementById('set-categories').value = p.categories || 'General, Clothing, Electronics';
            }, 50);
        }
    } catch(e) {}
}

window.saveBusinessProfile = async function(e) {
    e.preventDefault();
    const form = e.target;
    
    const profile = {
        shopName: form.shopName.value,
        address: form.shopAddress.value,
        rateInside: parseFloat(form.rateInside.value) || 60,
        rateOutside: parseFloat(form.rateOutside.value) || 120,
        // ✅ ADDED THIS LINE:
        categories: form.categories.value
    };
    
    await db.settings.put({ key: 'business_profile', value: profile });
    closeModal();
    alert("✅ Shop Profile Updated!");
}

// ============================================
// 🚚 SMART DELIVERY LOGIC
// ============================================

async function autoSetDelivery(select) {
    const courierName = select.value;
    const chargeInput = document.querySelector('input[name="deliveryCharge"]');
    
    // 1. Get Settings from DB
    let rates = { inside: 60, outside: 120 }; // Defaults
    try {
        const profile = await db.settings.get('business_profile');
        if(profile) {
            rates.inside = profile.value.rateInside;
            rates.outside = profile.value.rateOutside;
        }
    } catch(e) {}

    // 2. Logic: Assume "Pathao/Steadfast" implies standard rates
    // For a simple UX, we can ask: "Inside or Outside?"
    // OR we can just default to Outside (Safe bet)
    
    // BETTER UX: Add an "Area" toggle in the form.
    // But for now, let's just use the 'Inside' rate as default if user hasn't typed anything
    
    if (chargeInput.value == 120 || chargeInput.value == 60) {
        // Only auto-update if user hasn't customized it manually
        // Let's assume most orders are Outside Dhaka (higher rate)
        chargeInput.value = rates.outside; 
    }
    
    calculateTotal();
}N

async function setZone(zone) {
    const input = document.getElementById('delivery-input');
    
    // Get Settings
    let rates = { inside: 60, outside: 120 };
    try {
        const profile = await db.settings.get('business_profile');
        if(profile) {
            rates.inside = profile.value.rateInside;
            rates.outside = profile.value.rateOutside;
        }
    } catch(e) {}

    // Update Input
    if(zone === 'inside') input.value = rates.inside;
    else input.value = rates.outside;
    
    // Update Style of Buttons (Visual Feedback)
    // (Optional polish step)
    
    calculateTotal();

}
