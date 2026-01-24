/**
 * ═══════════════════════════════════════════════════════════════
 * PROFIT LEAKAGE DETECTOR - ELITE FEATURE
 * BizMind GrowthOS
 * ═══════════════════════════════════════════════════════════════
 * Finds where business is losing money:
 * - Low margin products
 * - VIP customers churning
 * - Discount overuse
 * - Dead inventory
 * ═══════════════════════════════════════════════════════════════
 */

const ProfitLeakage = {

    // ─────────────────────────────────────────────────────────────
    // HELPER: Format number with commas
    // ─────────────────────────────────────────────────────────────
    formatNumber(num) {
        if (!num || isNaN(num)) return '0';
        return Math.round(num).toLocaleString('en-IN');
    },

    // ─────────────────────────────────────────────────────────────
    // HELPER: Get date ranges
    // ─────────────────────────────────────────────────────────────
    getDateRanges() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const sixtyDaysAgo = new Date(today);
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        
        const ninetyDaysAgo = new Date(today);
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        
        return {
            today: today,
            thirtyDaysAgo: thirtyDaysAgo,
            sixtyDaysAgo: sixtyDaysAgo,
            ninetyDaysAgo: ninetyDaysAgo,
            todayStr: today.toISOString().split('T')[0],
            thirtyDaysAgoStr: thirtyDaysAgo.toISOString().split('T')[0]
        };
    },

    // ─────────────────────────────────────────────────────────────
    // CORE: Detect Low Margin Products
    // ─────────────────────────────────────────────────────────────
    async detectLowMarginProducts() {
        const leaks = [];
        
        try {
            const products = await db.products.toArray();
            const orders = await db.orders.toArray();
            const dates = this.getDateRanges();
            
            // Get recent orders (last 30 days)
            const recentOrders = orders.filter(o => {
                const orderDate = new Date(o.date);
                return orderDate >= dates.thirtyDaysAgo;
            });
            
            // Calculate sales per product
            const productSales = {};
            
            recentOrders.forEach(order => {
                const items = this.parseOrderItems(order.items);
                items.forEach(item => {
                    const sku = item.sku || item.name;
                    if (!productSales[sku]) {
                        productSales[sku] = { qty: 0, revenue: 0 };
                    }
                    productSales[sku].qty += item.qty || 1;
                    productSales[sku].revenue += item.total || 0;
                });
            });
            
            // Check each product for low margin
            products.forEach(product => {
                const costPrice = parseFloat(product.costPrice) || 0;
                const sellingPrice = parseFloat(product.sellingPrice) || 0;
                
                if (costPrice <= 0 || sellingPrice <= 0) return;
                
                const margin = ((sellingPrice - costPrice) / sellingPrice) * 100;
                const profit = sellingPrice - costPrice;
                
                // Flag products with less than 20% margin
                if (margin < 20) {
                    const sales = productSales[product.sku] || { qty: 0, revenue: 0 };
                    const potentialLoss = sales.qty * (profit < 50 ? 50 - profit : 0);
                    
                    leaks.push({
                        type: 'low_margin',
                        severity: margin < 10 ? 'high' : 'medium',
                        product: product,
                        margin: margin.toFixed(1),
                        profit: profit,
                        salesQty: sales.qty,
                        potentialLoss: potentialLoss,
                        suggestion: margin < 10 
                            ? `মূল্য ৳${Math.round(costPrice * 1.25)} করুন অথবা বন্ধ করুন`
                            : `মূল্য ৳${Math.round(costPrice * 1.30)} করলে ভালো মার্জিন হবে`
                    });
                }
            });
            
            // Sort by severity and potential loss
            leaks.sort((a, b) => {
                if (a.severity === 'high' && b.severity !== 'high') return -1;
                if (b.severity === 'high' && a.severity !== 'high') return 1;
                return b.potentialLoss - a.potentialLoss;
            });
            
            return leaks;
            
        } catch (error) {
            console.error('Error detecting low margin products:', error);
            return [];
        }
    },

    // ─────────────────────────────────────────────────────────────
    // CORE: Detect VIP Customer Churn Risk
    // ─────────────────────────────────────────────────────────────
    async detectVIPChurnRisk() {
        const risks = [];
        
        try {
            const customers = await db.customers.toArray();
            const orders = await db.orders.toArray();
            const dates = this.getDateRanges();
            
            // Group orders by customer
            const customerOrders = {};
            orders.forEach(o => {
                const phone = o.customerPhone;
                if (!customerOrders[phone]) {
                    customerOrders[phone] = [];
                }
                customerOrders[phone].push(o);
            });
            
            // Check each customer
            customers.forEach(customer => {
                const custOrders = customerOrders[customer.phone] || [];
                const totalSpent = parseFloat(customer.totalSpent) || 0;
                
                // Only check VIP/high-value customers (spent > 5000)
                if (totalSpent < 5000 || custOrders.length < 2) return;
                
                // Sort orders by date
                custOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                const lastOrderDate = new Date(custOrders[0].date);
                const daysSinceLastOrder = Math.floor((dates.today - lastOrderDate) / (1000 * 60 * 60 * 24));
                
                // Calculate average purchase cycle
                let totalGap = 0;
                for (let i = 1; i < custOrders.length; i++) {
                    const gap = (new Date(custOrders[i-1].date) - new Date(custOrders[i].date)) / (1000 * 60 * 60 * 24);
                    totalGap += gap;
                }
                const avgCycle = custOrders.length > 1 ? totalGap / (custOrders.length - 1) : 30;
                
                // Flag if overdue
                const daysOverdue = daysSinceLastOrder - avgCycle;
                
                if (daysOverdue > 7) {
                    const isVIP = totalSpent >= 10000;
                    
                    risks.push({
                        type: 'vip_churn',
                        severity: daysOverdue > 30 ? 'high' : 'medium',
                        customer: customer,
                        totalSpent: totalSpent,
                        daysSinceLastOrder: daysSinceLastOrder,
                        avgCycle: Math.round(avgCycle),
                        daysOverdue: Math.round(daysOverdue),
                        isVIP: isVIP,
                        potentialLoss: totalSpent, // Lifetime value at risk
                        suggestion: `${daysOverdue > 30 ? 'জরুরি! ' : ''}উইন-ব্যাক অফার পাঠান`
                    });
                }
            });
            
            // Sort by potential loss
            risks.sort((a, b) => b.potentialLoss - a.potentialLoss);
            
            return risks.slice(0, 10); // Top 10 risks
            
        } catch (error) {
            console.error('Error detecting VIP churn:', error);
            return [];
        }
    },

    // ─────────────────────────────────────────────────────────────
    // CORE: Detect Discount Overuse
    // ─────────────────────────────────────────────────────────────
    async detectDiscountOveruse() {
        const analysis = {
            totalOrders: 0,
            discountedOrders: 0,
            totalDiscount: 0,
            discountPercent: 0,
            severity: 'low',
            suggestion: ''
        };
        
        try {
            const orders = await db.orders.toArray();
            const dates = this.getDateRanges();
            
            // Get recent orders
            const recentOrders = orders.filter(o => {
                const orderDate = new Date(o.date);
                return orderDate >= dates.thirtyDaysAgo;
            });
            
            analysis.totalOrders = recentOrders.length;
            
            recentOrders.forEach(order => {
                const discount = parseFloat(order.discount) || 0;
                if (discount > 0) {
                    analysis.discountedOrders++;
                    analysis.totalDiscount += discount;
                }
            });
            
            if (analysis.totalOrders > 0) {
                analysis.discountPercent = ((analysis.discountedOrders / analysis.totalOrders) * 100).toFixed(0);
            }
            
            // Determine severity
            if (analysis.discountPercent > 50) {
                analysis.severity = 'high';
                analysis.suggestion = 'অর্ধেকের বেশি অর্ডারে ডিসকাউন্ট! শুধু নতুন কাস্টমারদের দিন';
            } else if (analysis.discountPercent > 30) {
                analysis.severity = 'medium';
                analysis.suggestion = 'ডিসকাউন্ট একটু বেশি হচ্ছে। VIP দের জন্য রিজার্ভ রাখুন';
            } else {
                analysis.severity = 'low';
                analysis.suggestion = 'ডিসকাউন্ট ব্যালেন্সড আছে 👍';
            }
            
            return analysis;
            
        } catch (error) {
            console.error('Error detecting discount overuse:', error);
            return analysis;
        }
    },

    // ─────────────────────────────────────────────────────────────
    // CORE: Detect Dead/Slow Inventory
    // ─────────────────────────────────────────────────────────────
    async detectDeadInventory() {
        const deadProducts = [];
        
        try {
            const products = await db.products.toArray();
            const orders = await db.orders.toArray();
            const dates = this.getDateRanges();
            
            // Get sales in last 60 days
            const recentOrders = orders.filter(o => {
                const orderDate = new Date(o.date);
                return orderDate >= dates.sixtyDaysAgo;
            });
            
            // Count sales per product
            const productSales = {};
            recentOrders.forEach(order => {
                const items = this.parseOrderItems(order.items);
                items.forEach(item => {
                    const sku = item.sku || item.name;
                    productSales[sku] = (productSales[sku] || 0) + (item.qty || 1);
                });
            });
            
            // Find products with 0 or very low sales
            products.forEach(product => {
                const sales = productSales[product.sku] || 0;
                const costPrice = parseFloat(product.costPrice) || 0;
                const stock = parseInt(product.stock) || 0;
                
                if (sales <= 1 && stock > 0) {
                    const stuckCapital = costPrice * stock;
                    
                    deadProducts.push({
                        type: 'dead_inventory',
                        severity: sales === 0 ? 'high' : 'medium',
                        product: product,
                        salesIn60Days: sales,
                        stock: stock,
                        stuckCapital: stuckCapital,
                        suggestion: sales === 0 
                            ? 'ক্লিয়ারেন্স সেল করুন বা বান্ডেল করুন'
                            : 'হট প্রোডাক্টের সাথে বান্ডেল করুন'
                    });
                }
            });
            
            // Sort by stuck capital
            deadProducts.sort((a, b) => b.stuckCapital - a.stuckCapital);
            
            return deadProducts.slice(0, 10);
            
        } catch (error) {
            console.error('Error detecting dead inventory:', error);
            return [];
        }
    },

    // ─────────────────────────────────────────────────────────────
    // HELPER: Parse order items
    // ─────────────────────────────────────────────────────────────
    parseOrderItems(items) {
        if (!items) return [];
        
        if (Array.isArray(items)) {
            return items.map(item => ({
                sku: item.sku || item.name || 'Unknown',
                name: item.name || item.sku || 'Unknown',
                qty: item.qty || item.quantity || 1,
                total: item.total || item.lineTotal || 0
            }));
        }
        
        if (typeof items === 'string') {
            const parsed = [];
            const parts = items.split(',');
            parts.forEach(part => {
                const match = part.trim().match(/(.+?)\s*\(x(\d+)\)/);
                if (match) {
                    parsed.push({ sku: match[1].trim(), name: match[1].trim(), qty: parseInt(match[2]), total: 0 });
                } else if (part.trim()) {
                    parsed.push({ sku: part.trim(), name: part.trim(), qty: 1, total: 0 });
                }
            });
            return parsed;
        }
        
        return [];
    },

    // ─────────────────────────────────────────────────────────────
    // CORE: Calculate Total Leakage
    // ─────────────────────────────────────────────────────────────
    async calculateTotalLeakage() {
        const [lowMargin, vipChurn, discountAnalysis, deadInventory] = await Promise.all([
            this.detectLowMarginProducts(),
            this.detectVIPChurnRisk(),
            this.detectDiscountOveruse(),
            this.detectDeadInventory()
        ]);
        
        let totalLeakage = 0;
        
        // Add up potential losses
        lowMargin.forEach(l => totalLeakage += l.potentialLoss || 0);
        vipChurn.forEach(l => totalLeakage += l.potentialLoss * 0.3 || 0); // 30% of lifetime value
        totalLeakage += discountAnalysis.totalDiscount || 0;
        deadInventory.forEach(l => totalLeakage += l.stuckCapital || 0);
        
        return {
            totalLeakage: totalLeakage,
            lowMargin: lowMargin,
            vipChurn: vipChurn,
            discountAnalysis: discountAnalysis,
            deadInventory: deadInventory,
            leakageCount: lowMargin.length + vipChurn.length + deadInventory.length + (discountAnalysis.severity !== 'low' ? 1 : 0)
        };
    }
};

// Make globally available
window.ProfitLeakage = ProfitLeakage;

/**
 * ═══════════════════════════════════════════════════════════════
 * PROFIT LEAKAGE DETECTOR - PART 2: UI RENDERING
 * ═══════════════════════════════════════════════════════════════
 */

Object.assign(ProfitLeakage, {

    // ─────────────────────────────────────────────────────────────
    // MAIN: Render Full Report (ELITE ONLY)
    // ─────────────────────────────────────────────────────────────
    async renderFullReport() {
        let container = document.getElementById('main-content');
        
        if (!container) {
            container = document.getElementById('profit-leakage-container');
        }
        
        if (!container) {
            await new Promise(resolve => setTimeout(resolve, 50));
            container = document.getElementById('main-content') 
                     || document.getElementById('profit-leakage-container');
        }
        
        if (!container) {
            console.error('Container not found for Profit Leakage');
            return;
        }
        
        // Show loading
        container.innerHTML = `
            <div class="flex items-center justify-center min-h-screen">
                <div class="text-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                    <p class="text-gray-600">প্রফিট লিকেজ খুঁজছি...</p>
                </div>
            </div>
        `;
        
        // Fetch all data
        const data = await this.calculateTotalLeakage();
        
        // Build HTML
        container.innerHTML = `
            <div class="max-w-4xl mx-auto p-4 space-y-6 pb-24">
                
                <!-- Header -->
                ${this.renderHeader(data)}
                
                <!-- Total Leakage Summary -->
                ${this.renderSummaryCard(data)}
                
                <!-- Low Margin Products -->
                ${this.renderLowMarginSection(data.lowMargin)}
                
                <!-- VIP Churn Risk -->
                ${this.renderVIPChurnSection(data.vipChurn)}
                
                <!-- Discount Analysis -->
                ${this.renderDiscountSection(data.discountAnalysis)}
                
                <!-- Dead Inventory -->
                ${this.renderDeadInventorySection(data.deadInventory)}
                
                <!-- Action Footer -->
                ${this.renderActionFooter()}
                
            </div>
        `;
    },

    // ─────────────────────────────────────────────────────────────
    // RENDER: Header
    // ─────────────────────────────────────────────────────────────
    renderHeader(data) {
        const severityColor = data.totalLeakage > 10000 ? 'from-red-600 to-red-700' : 
                             data.totalLeakage > 5000 ? 'from-orange-500 to-red-500' : 
                             'from-yellow-500 to-orange-500';
        
        return `
            <div class="bg-gradient-to-r ${severityColor} rounded-2xl p-6 text-white shadow-lg">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-bold flex items-center gap-2">
                            🚨 Profit Leakage Detector
                        </h1>
                        <p class="text-white/80 mt-1">আপনার ব্যবসায় কোথায় টাকা লস হচ্ছে</p>
                    </div>
                    <div class="text-right">
                        <span class="bg-white/20 px-3 py-1 rounded-full text-sm">
                            ⚡ ELITE Feature
                        </span>
                    </div>
                </div>
            </div>
        `;
    },

    // ─────────────────────────────────────────────────────────────
    // RENDER: Summary Card
    // ─────────────────────────────────────────────────────────────
    renderSummaryCard(data) {
        const leakageLevel = data.totalLeakage > 10000 ? 'critical' : 
                           data.totalLeakage > 5000 ? 'warning' : 'normal';
        
        const levelStyles = {
            critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: '🔴' },
            warning: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: '🟠' },
            normal: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: '🟡' }
        };
        
        const style = levelStyles[leakageLevel];
        
        return `
            <div class="${style.bg} ${style.border} border-2 rounded-2xl p-6">
                <div class="text-center">
                    <p class="text-gray-600 text-sm mb-2">এই মাসে আনুমানিক লিকেজ</p>
                    <div class="flex items-center justify-center gap-2">
                        <span class="text-4xl">${style.icon}</span>
                        <span class="text-4xl font-bold ${style.text}">৳${this.formatNumber(data.totalLeakage)}</span>
                    </div>
                    <p class="${style.text} mt-2 text-sm">
                        ${data.leakageCount} টি সমস্যা পাওয়া গেছে
                    </p>
                </div>
                
                <!-- Quick Stats -->
                <div class="grid grid-cols-4 gap-3 mt-6">
                    <div class="bg-white rounded-xl p-3 text-center shadow-sm">
                        <p class="text-2xl font-bold text-red-600">${data.lowMargin.length}</p>
                        <p class="text-xs text-gray-500">Low Margin</p>
                    </div>
                    <div class="bg-white rounded-xl p-3 text-center shadow-sm">
                        <p class="text-2xl font-bold text-orange-600">${data.vipChurn.length}</p>
                        <p class="text-xs text-gray-500">VIP at Risk</p>
                    </div>
                    <div class="bg-white rounded-xl p-3 text-center shadow-sm">
                        <p class="text-2xl font-bold text-yellow-600">${data.discountAnalysis.discountPercent}%</p>
                        <p class="text-xs text-gray-500">Discounted</p>
                    </div>
                    <div class="bg-white rounded-xl p-3 text-center shadow-sm">
                        <p class="text-2xl font-bold text-purple-600">${data.deadInventory.length}</p>
                        <p class="text-xs text-gray-500">Dead Stock</p>
                    </div>
                </div>
            </div>
        `;
    },

    // ─────────────────────────────────────────────────────────────
    // RENDER: Low Margin Products Section
    // ─────────────────────────────────────────────────────────────
    renderLowMarginSection(products) {
        if (products.length === 0) {
            return `
                <div class="bg-white rounded-xl p-6 shadow-sm border">
                    <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                        📉 Low Margin Products
                    </h2>
                    <div class="bg-green-50 rounded-lg p-4 text-center">
                        <span class="text-3xl">✅</span>
                        <p class="text-green-700 font-medium mt-2">সব প্রোডাক্টের মার্জিন ভালো আছে!</p>
                    </div>
                </div>
            `;
        }
        
        const productsHTML = products.slice(0, 5).map(item => {
            const severityColor = item.severity === 'high' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50';
            const severityBadge = item.severity === 'high' ? 
                '<span class="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">⚠️ Critical</span>' : 
                '<span class="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">⚡ Warning</span>';
            
            return `
                <div class="${severityColor} border rounded-xl p-4">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex items-center gap-2">
                                <p class="font-semibold text-gray-800">${item.product.name || item.product.sku}</p>
                                ${severityBadge}
                            </div>
                            <div class="mt-2 grid grid-cols-3 gap-2 text-sm">
                                <div>
                                    <p class="text-gray-500">মার্জিন</p>
                                    <p class="font-bold text-red-600">${item.margin}%</p>
                                </div>
                                <div>
                                    <p class="text-gray-500">প্রফিট/ইউনিট</p>
                                    <p class="font-bold text-gray-800">৳${this.formatNumber(item.profit)}</p>
                                </div>
                                <div>
                                    <p class="text-gray-500">বিক্রি (৩০দিন)</p>
                                    <p class="font-bold text-gray-800">${item.salesQty} টি</p>
                                </div>
                            </div>
                            <div class="mt-3 bg-white rounded-lg p-2">
                                <p class="text-sm text-gray-600">
                                    💡 <span class="font-medium">পরামর্শ:</span> ${item.suggestion}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        return `
            <div class="bg-white rounded-xl p-6 shadow-sm border">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
                        📉 Low Margin Products
                    </h2>
                    <span class="bg-red-100 text-red-700 text-sm px-3 py-1 rounded-full">
                        ${products.length} টি পাওয়া গেছে
                    </span>
                </div>
                
                <div class="space-y-4">
                    ${productsHTML}
                </div>
                
                ${products.length > 5 ? `
                    <button class="w-full mt-4 text-center text-red-600 font-medium py-2 hover:bg-red-50 rounded-lg transition">
                        আরও ${products.length - 5} টি দেখুন →
                    </button>
                ` : ''}
            </div>
        `;
    },

    // ─────────────────────────────────────────────────────────────
    // RENDER: VIP Churn Risk Section
    // ─────────────────────────────────────────────────────────────
    renderVIPChurnSection(risks) {
        if (risks.length === 0) {
            return `
                <div class="bg-white rounded-xl p-6 shadow-sm border">
                    <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                        👑 VIP Churn Risk
                    </h2>
                    <div class="bg-green-50 rounded-lg p-4 text-center">
                        <span class="text-3xl">✅</span>
                        <p class="text-green-700 font-medium mt-2">সব VIP কাস্টমার active আছে!</p>
                    </div>
                </div>
            `;
        }
        
        const risksHTML = risks.slice(0, 5).map(item => {
            const severityColor = item.severity === 'high' ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50';
            const severityText = item.severity === 'high' ? 'text-red-700' : 'text-orange-700';
            
            return `
                <div class="${severityColor} border rounded-xl p-4">
                    <div class="flex items-start justify-between">
                        <div class="flex items-start gap-3 flex-1">
                            <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                ${item.isVIP ? '👑' : '⭐'}
                            </div>
                            <div class="flex-1">
                                <div class="flex items-center gap-2">
                                    <p class="font-semibold text-gray-800">${item.customer.name || 'Unknown'}</p>
                                    ${item.isVIP ? '<span class="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">VIP</span>' : ''}
                                </div>
                                <p class="text-sm text-gray-500">${item.customer.phone}</p>
                                
                                <div class="mt-2 grid grid-cols-3 gap-2 text-sm">
                                    <div>
                                        <p class="text-gray-500">মোট খরচ</p>
                                        <p class="font-bold text-gray-800">৳${this.formatNumber(item.totalSpent)}</p>
                                    </div>
                                    <div>
                                        <p class="text-gray-500">শেষ অর্ডার</p>
                                        <p class="font-bold ${severityText}">${item.daysSinceLastOrder} দিন আগে</p>
                                    </div>
                                    <div>
                                        <p class="text-gray-500">Overdue</p>
                                        <p class="font-bold ${severityText}">${item.daysOverdue} দিন</p>
                                    </div>
                                </div>
                                
                                <div class="mt-3 flex gap-2">
                                    <button onclick="ProfitLeakage.copyWinbackMessage('${item.customer.name || 'ভাই'}', '${item.customer.phone}')" 
                                            class="flex-1 bg-white border border-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center justify-center gap-1">
                                        <i class="ph ph-copy"></i> মেসেজ কপি
                                    </button>
                                    <a href="https://wa.me/88${item.customer.phone}" target="_blank"
                                       class="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center justify-center gap-1">
                                        <i class="ph ph-whatsapp-logo"></i> WhatsApp
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        return `
            <div class="bg-white rounded-xl p-6 shadow-sm border">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
                        👑 VIP Churn Risk
                    </h2>
                    <span class="bg-orange-100 text-orange-700 text-sm px-3 py-1 rounded-full">
                        ${risks.length} জন at risk
                    </span>
                </div>
                
                <div class="space-y-4">
                    ${risksHTML}
                </div>
            </div>
        `;
    },

    // ─────────────────────────────────────────────────────────────
    // RENDER: Discount Analysis Section
    // ─────────────────────────────────────────────────────────────
    renderDiscountSection(analysis) {
        const severityStyles = {
            high: { bg: 'bg-red-50', border: 'border-red-200', bar: 'bg-red-500', text: 'text-red-700' },
            medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', bar: 'bg-yellow-500', text: 'text-yellow-700' },
            low: { bg: 'bg-green-50', border: 'border-green-200', bar: 'bg-green-500', text: 'text-green-700' }
        };
        
        const style = severityStyles[analysis.severity];
        
        return `
            <div class="bg-white rounded-xl p-6 shadow-sm border">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
                        🏷️ Discount Analysis
                    </h2>
                    <span class="${style.bg} ${style.text} text-sm px-3 py-1 rounded-full border ${style.border}">
                        ${analysis.severity === 'high' ? '⚠️ বেশি' : analysis.severity === 'medium' ? '⚡ মাঝারি' : '✅ ঠিক আছে'}
                    </span>
                </div>
                
                <div class="${style.bg} ${style.border} border rounded-xl p-4">
                    <div class="grid grid-cols-3 gap-4 text-center mb-4">
                        <div>
                            <p class="text-gray-500 text-sm">মোট অর্ডার</p>
                            <p class="text-2xl font-bold text-gray-800">${analysis.totalOrders}</p>
                        </div>
                        <div>
                            <p class="text-gray-500 text-sm">ডিসকাউন্ট দেওয়া</p>
                            <p class="text-2xl font-bold ${style.text}">${analysis.discountedOrders}</p>
                        </div>
                        <div>
                            <p class="text-gray-500 text-sm">মোট ডিসকাউন্ট</p>
                            <p class="text-2xl font-bold ${style.text}">৳${this.formatNumber(analysis.totalDiscount)}</p>
                        </div>
                    </div>
                    
                    <!-- Progress Bar -->
                    <div class="mb-3">
                        <div class="flex justify-between text-sm mb-1">
                            <span class="text-gray-600">ডিসকাউন্ট রেট</span>
                            <span class="${style.text} font-bold">${analysis.discountPercent}%</span>
                        </div>
                        <div class="h-3 bg-white rounded-full overflow-hidden">
                            <div class="${style.bar} h-full rounded-full transition-all" style="width: ${Math.min(analysis.discountPercent, 100)}%"></div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg p-3 mt-3">
                        <p class="text-sm text-gray-600">
                            💡 <span class="font-medium">পরামর্শ:</span> ${analysis.suggestion}
                        </p>
                    </div>
                </div>
            </div>
        `;
    },

    // ─────────────────────────────────────────────────────────────
    // RENDER: Dead Inventory Section
    // ─────────────────────────────────────────────────────────────
    renderDeadInventorySection(products) {
        if (products.length === 0) {
            return `
                <div class="bg-white rounded-xl p-6 shadow-sm border">
                    <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                        📦 Dead Inventory
                    </h2>
                    <div class="bg-green-50 rounded-lg p-4 text-center">
                        <span class="text-3xl">✅</span>
                        <p class="text-green-700 font-medium mt-2">কোনো ডেড স্টক নেই!</p>
                    </div>
                </div>
            `;
        }
        
        const totalStuckCapital = products.reduce((sum, p) => sum + (p.stuckCapital || 0), 0);
        
        const productsHTML = products.slice(0, 5).map(item => {
            const severityColor = item.severity === 'high' ? 'border-purple-200 bg-purple-50' : 'border-gray-200 bg-gray-50';
            
            return `
                <div class="${severityColor} border rounded-xl p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="font-semibold text-gray-800">${item.product.name || item.product.sku}</p>
                            <p class="text-sm text-gray-500 mt-1">
                                স্টক: ${item.stock} টি | বিক্রি (৬০দিন): ${item.salesIn60Days} টি
                            </p>
                        </div>
                        <div class="text-right">
                            <p class="text-sm text-gray-500">আটকে আছে</p>
                            <p class="font-bold text-purple-700">৳${this.formatNumber(item.stuckCapital)}</p>
                        </div>
                    </div>
                    <div class="mt-2 bg-white rounded-lg p-2">
                        <p class="text-sm text-gray-600">
                            💡 ${item.suggestion}
                        </p>
                    </div>
                </div>
            `;
        }).join('');
        
        return `
            <div class="bg-white rounded-xl p-6 shadow-sm border">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
                        📦 Dead Inventory
                    </h2>
                    <span class="bg-purple-100 text-purple-700 text-sm px-3 py-1 rounded-full">
                        ৳${this.formatNumber(totalStuckCapital)} আটকে আছে
                    </span>
                </div>
                
                <div class="space-y-3">
                    ${productsHTML}
                </div>
            </div>
        `;
    },

    // ─────────────────────────────────────────────────────────────
    // RENDER: Action Footer
    // ─────────────────────────────────────────────────────────────
    renderActionFooter() {
        return `
            <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 border">
                <h3 class="font-bold text-gray-700 mb-3">⚡ দ্রুত অ্যাকশন</h3>
                <div class="grid grid-cols-2 gap-3">
                    <button onclick="window.location.hash='#inventory'" 
                            class="bg-white border border-gray-200 rounded-lg p-3 text-center hover:shadow-md transition">
                        <span class="text-2xl">📦</span>
                        <p class="text-sm text-gray-700 mt-1">Inventory</p>
                    </button>
                    <button onclick="window.location.hash='#customers'" 
                            class="bg-white border border-gray-200 rounded-lg p-3 text-center hover:shadow-md transition">
                        <span class="text-2xl">👥</span>
                        <p class="text-sm text-gray-700 mt-1">Customers</p>
                    </button>
                    <button onclick="ProfitLeakage.refreshReport()" 
                            class="bg-white border border-gray-200 rounded-lg p-3 text-center hover:shadow-md transition">
                        <span class="text-2xl">🔄</span>
                        <p class="text-sm text-gray-700 mt-1">Refresh</p>
                    </button>
                    <button onclick="window.location.hash='#growth'" 
                            class="bg-white border border-gray-200 rounded-lg p-3 text-center hover:shadow-md transition">
                        <span class="text-2xl">🚀</span>
                        <p class="text-sm text-gray-700 mt-1">Growth Hub</p>
                    </button>
                </div>
            </div>
        `;
    },

    // ─────────────────────────────────────────────────────────────
    // ACTION: Copy winback message
    // ─────────────────────────────────────────────────────────────
    copyWinbackMessage(name, phone) {
        const messages = [
            `${name}, অনেকদিন আপনাকে দেখা যাচ্ছে না! 😊 আপনার জন্য স্পেশাল ১০% ডিসকাউন্ট রেখেছি। আজই অর্ডার করুন!`,
            `${name}, আপনার প্রিয় প্রোডাক্টে নতুন স্টক এসেছে! 🎁 প্রথম ১০ জনের জন্য ফ্রি ডেলিভারি। মিস করবেন না!`,
            `${name} ভাই, কেমন আছেন? অনেকদিন অর্ডার নেই আপনার। কিছু লাগলে জানাবেন, স্পেশাল প্রাইস দেব! 🙂`
        ];
        
        const message = messages[Math.floor(Math.random() * messages.length)];
        
        navigator.clipboard.writeText(message).then(() => {
            // Show toast or feedback
            alert('মেসেজ কপি হয়েছে! ✅');
        }).catch(err => {
            console.error('Copy failed:', err);
            alert('কপি করা যায়নি। ম্যানুয়ালি কপি করুন।');
        });
    },

    // ─────────────────────────────────────────────────────────────
    // ACTION: Refresh report
    // ─────────────────────────────────────────────────────────────
    refreshReport() {
        this.renderFullReport();
    }

});

/**
 * ═══════════════════════════════════════════════════════════════
 * PROFIT LEAKAGE DETECTOR - PART 3: TEASER & INTEGRATION
 * ═══════════════════════════════════════════════════════════════
 */

Object.assign(ProfitLeakage, {

    // ─────────────────────────────────────────────────────────────
    // TEASER: Blurred version for GROWTH/STARTER users
    // ─────────────────────────────────────────────────────────────
    async renderTeaser() {
        let container = document.getElementById('main-content');
        
        if (!container) {
            container = document.getElementById('profit-leakage-container');
        }
        
        if (!container) {
            await new Promise(resolve => setTimeout(resolve, 50));
            container = document.getElementById('main-content') 
                     || document.getElementById('profit-leakage-container');
        }
        
        if (!container) {
            console.error('Container not found for Profit Leakage Teaser');
            return;
        }
        
        // Generate fake enticing data
        const fakeData = this.generateTeaserData();
        
        container.innerHTML = `
            <div class="max-w-4xl mx-auto p-4 space-y-6">
                
                <!-- Header (Real) -->
                <div class="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-2xl font-bold flex items-center gap-2">
                                🚨 Profit Leakage Detector
                            </h1>
                            <p class="text-white/80 mt-1">আপনার ব্যবসায় কোথায় টাকা লস হচ্ছে</p>
                        </div>
                        <div class="text-right">
                            <span class="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
                                🔒 ELITE Only
                            </span>
                        </div>
                    </div>
                </div>
                
                <!-- Blurred Preview Container -->
                <div class="relative">
                    
                    <!-- BLURRED CONTENT -->
                    <div class="filter blur-sm pointer-events-none select-none">
                        
                        <!-- Fake Summary -->
                        <div class="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-4">
                            <div class="text-center">
                                <p class="text-gray-600 text-sm mb-2">এই মাসে আনুমানিক লিকেজ</p>
                                <div class="flex items-center justify-center gap-2">
                                    <span class="text-4xl">🔴</span>
                                    <span class="text-4xl font-bold text-red-700">৳${fakeData.totalLeakage}</span>
                                </div>
                                <p class="text-red-600 mt-2 text-sm">${fakeData.issueCount} টি সমস্যা পাওয়া গেছে</p>
                            </div>
                            
                            <div class="grid grid-cols-4 gap-3 mt-6">
                                <div class="bg-white rounded-xl p-3 text-center">
                                    <p class="text-2xl font-bold text-red-600">${fakeData.lowMargin}</p>
                                    <p class="text-xs text-gray-500">Low Margin</p>
                                </div>
                                <div class="bg-white rounded-xl p-3 text-center">
                                    <p class="text-2xl font-bold text-orange-600">${fakeData.vipRisk}</p>
                                    <p class="text-xs text-gray-500">VIP at Risk</p>
                                </div>
                                <div class="bg-white rounded-xl p-3 text-center">
                                    <p class="text-2xl font-bold text-yellow-600">${fakeData.discountRate}%</p>
                                    <p class="text-xs text-gray-500">Discounted</p>
                                </div>
                                <div class="bg-white rounded-xl p-3 text-center">
                                    <p class="text-2xl font-bold text-purple-600">${fakeData.deadStock}</p>
                                    <p class="text-xs text-gray-500">Dead Stock</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Fake Low Margin Section -->
                        <div class="bg-white rounded-xl p-6 shadow-sm border mb-4">
                            <h2 class="text-lg font-bold text-gray-800 mb-4">📉 Low Margin Products</h2>
                            
                            <div class="bg-red-50 border border-red-200 rounded-xl p-4 mb-3">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="font-semibold text-gray-800">Premium Honey 500ml</p>
                                        <p class="text-sm text-red-600">মার্জিন: 8% | প্রফিট: ৳45/unit</p>
                                    </div>
                                    <span class="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">⚠️ Critical</span>
                                </div>
                            </div>
                            
                            <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="font-semibold text-gray-800">Organic Ghee 200g</p>
                                        <p class="text-sm text-yellow-600">মার্জিন: 15% | প্রফিট: ৳80/unit</p>
                                    </div>
                                    <span class="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">⚡ Warning</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Fake VIP Churn Section -->
                        <div class="bg-white rounded-xl p-6 shadow-sm border">
                            <h2 class="text-lg font-bold text-gray-800 mb-4">👑 VIP Churn Risk</h2>
                            
                            <div class="bg-orange-50 border border-orange-200 rounded-xl p-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center">👑</div>
                                    <div>
                                        <p class="font-semibold text-gray-800">Karim Uddin (VIP)</p>
                                        <p class="text-sm text-orange-600">৳28,500 spent | 45 দিন আগে শেষ অর্ডার</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                    
                    <!-- OVERLAY: Upgrade CTA -->
                    <div class="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-xl">
                        <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center border-2 border-red-200">
                            
                            <div class="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span class="text-4xl">🚨</span>
                            </div>
                            
                            <h3 class="text-2xl font-bold text-gray-800 mb-2">
                                Profit Leakage Detector
                            </h3>
                            
                            <p class="text-gray-600 mb-4">
                                জানুন কোথায় আপনার টাকা লস হচ্ছে এবং কিভাবে বাঁচাবেন
                            </p>
                            
                            <div class="bg-red-50 rounded-xl p-4 mb-6 text-left">
                                <p class="text-sm font-medium text-red-800 mb-2">✨ ELITE তে যা পাবেন:</p>
                                <ul class="text-sm text-red-700 space-y-1">
                                    <li>✅ Low Margin Products চিহ্নিত</li>
                                    <li>✅ VIP Customer Churn Alert</li>
                                    <li>✅ Discount Overuse Analysis</li>
                                    <li>✅ Dead Inventory Detection</li>
                                    <li>✅ মোট Leakage Amount</li>
                                </ul>
                            </div>
                            
                            <!-- Loss Calculator Mini -->
                            <div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                                <p class="text-red-700 text-sm">
                                    ⚠️ গড়ে ব্যবসায়ীরা <strong>৳15,000+/মাস</strong> হারায় এই সমস্যাগুলোর কারণে
                                </p>
                                <p class="text-red-600 text-xs mt-1">
                                    আপনি কত হারাচ্ছেন জানেন?
                                </p>
                            </div>
                            
                            <button onclick="ProfitLeakage.showUpgradeModal()" 
                                    class="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-6 rounded-xl font-bold text-lg hover:opacity-90 transition shadow-lg">
                                🚀 ELITE তে আপগ্রেড করুন
                            </button>
                            
                            <p class="text-gray-500 text-sm mt-3">
                                মাত্র ৳2,999/মাস
                            </p>
                            
                        </div>
                    </div>
                    
                </div>
                
            </div>
        `;
    },

    // ─────────────────────────────────────────────────────────────
    // HELPER: Generate fake data for teaser
    // ─────────────────────────────────────────────────────────────
    generateTeaserData() {
        return {
            totalLeakage: (Math.floor(Math.random() * 20) + 10) + ',500',
            issueCount: Math.floor(Math.random() * 8) + 5,
            lowMargin: Math.floor(Math.random() * 5) + 2,
            vipRisk: Math.floor(Math.random() * 4) + 1,
            discountRate: Math.floor(Math.random() * 30) + 25,
            deadStock: Math.floor(Math.random() * 6) + 2
        };
    },

    // ─────────────────────────────────────────────────────────────
    // MODAL: Show upgrade modal
    // ─────────────────────────────────────────────────────────────
    showUpgradeModal() {
        if (typeof LuringSystem !== 'undefined' && LuringSystem.showRevenuePredictionTeaser) {
            LuringSystem.showRevenuePredictionTeaser();
            return;
        }
        
        // Fallback modal
        const existingModal = document.getElementById('upgrade-modal');
        if (existingModal) existingModal.remove();
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
        modal.id = 'upgrade-modal';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
                <span class="text-5xl">👑</span>
                <h3 class="text-xl font-bold text-gray-800 mt-4">ELITE Plan এ আপগ্রেড করুন</h3>
                <p class="text-gray-600 mt-2">Profit Leakage Detector সহ সকল Premium ফিচার আনলক করুন</p>
                
                <div class="mt-6 space-y-3">
                    <a href="https://wa.me/8801XXXXXXXXX?text=আমি%20ELITE%20Plan%20নিতে%20চাই" 
                       target="_blank"
                       class="block w-full bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition">
                        <i class="ph ph-whatsapp-logo"></i> WhatsApp এ যোগাযোগ
                    </a>
                    <button onclick="document.getElementById('upgrade-modal').remove()" 
                            class="block w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition">
                        পরে দেখব
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    },

    // ─────────────────────────────────────────────────────────────
    // MAIN: Render based on user tier
    // ─────────────────────────────────────────────────────────────
    async render() {
        const userTier = await this.getUserTier();
        
        if (userTier === 'ELITE') {
            await this.renderFullReport();
        } else {
            await this.renderTeaser();
        }
    },

    // ─────────────────────────────────────────────────────────────
    // HELPER: Get user tier
    // ─────────────────────────────────────────────────────────────
    async getUserTier() {
        if (typeof AppState !== 'undefined' && AppState.userTier) {
            return AppState.userTier;
        }
        
        try {
            const session = await db.settings.get('user_session');
            if (session && session.value && session.value.tier) {
                return session.value.tier;
            }
        } catch (e) {
            console.error('Error getting user tier:', e);
        }
        
        return 'STARTER';
    }

});