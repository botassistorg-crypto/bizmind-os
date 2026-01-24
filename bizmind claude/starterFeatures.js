/**
 * ═══════════════════════════════════════════════════════════════
 * STARTER FEATURES - Value Features for Starter Plan
 * BizMind GrowthOS
 * ═══════════════════════════════════════════════════════════════
 * Features:
 * 1. Daily Sales Summary
 * 2. Limited Customer Alert (1 per day)
 * 3. WhatsApp Order Confirmation
 * ═══════════════════════════════════════════════════════════════
 */

const StarterFeatures = {

    // ─────────────────────────────────────────────────────────────
    // HELPER: Format number with commas
    // ─────────────────────────────────────────────────────────────
    formatNumber(num) {
        if (!num || isNaN(num)) return '0';
        return Math.round(num).toLocaleString('en-IN');
    },

    // ─────────────────────────────────────────────────────────────
    // HELPER: Get today's date string
    // ─────────────────────────────────────────────────────────────
    getTodayString() {
        const today = new Date();
        return today.toISOString().split('T')[0];
    },

    // ─────────────────────────────────────────────────────────────
    // HELPER: Get date range strings
    // ─────────────────────────────────────────────────────────────
    getDateRanges() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - 7);
        
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(lastWeekStart.getDate() - 14);
        
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);
        
        return {
            today: today.toISOString().split('T')[0],
            yesterday: yesterday.toISOString().split('T')[0],
            weekStart: weekStart.toISOString().split('T')[0],
            lastWeekStart: lastWeekStart.toISOString().split('T')[0],
            lastWeekEnd: lastWeekEnd.toISOString().split('T')[0],
            todayObj: today
        };
    },

    // ═══════════════════════════════════════════════════════════
    // FEATURE 1: DAILY SALES SUMMARY
    // ═══════════════════════════════════════════════════════════

    // ─────────────────────────────────────────────────────────────
    // Get today's sales data
    // ─────────────────────────────────────────────────────────────
    async getTodaySales() {
        try {
            const dates = this.getDateRanges();
            const orders = await db.orders.toArray();
            
            // Today's orders
            const todayOrders = orders.filter(o => o.date === dates.today);
            
            // Yesterday's orders (for comparison)
            const yesterdayOrders = orders.filter(o => o.date === dates.yesterday);
            
            // This week's orders
            const weekOrders = orders.filter(o => o.date >= dates.weekStart && o.date <= dates.today);
            
            // Last week's orders (for comparison)
            const lastWeekOrders = orders.filter(o => o.date >= dates.lastWeekStart && o.date < dates.lastWeekEnd);
            
            // Calculate today's stats
            const todayRevenue = todayOrders.reduce((sum, o) => sum + (parseFloat(o.grandTotal) || 0), 0);
            const todayProfit = todayOrders.reduce((sum, o) => sum + (parseFloat(o.netProfit) || 0), 0);
            const todayOrderCount = todayOrders.length;
            
            // Calculate yesterday's stats
            const yesterdayRevenue = yesterdayOrders.reduce((sum, o) => sum + (parseFloat(o.grandTotal) || 0), 0);
            
            // Calculate week stats
            const weekRevenue = weekOrders.reduce((sum, o) => sum + (parseFloat(o.grandTotal) || 0), 0);
            const weekProfit = weekOrders.reduce((sum, o) => sum + (parseFloat(o.netProfit) || 0), 0);
            const weekOrderCount = weekOrders.length;
            
            // Calculate last week stats
            const lastWeekRevenue = lastWeekOrders.reduce((sum, o) => sum + (parseFloat(o.grandTotal) || 0), 0);
            
            // Calculate comparisons
            const vsYesterday = yesterdayRevenue > 0 
                ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100) 
                : (todayRevenue > 0 ? 100 : 0);
            
            const vsLastWeek = lastWeekRevenue > 0 
                ? Math.round(((weekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100) 
                : (weekRevenue > 0 ? 100 : 0);
            
            return {
                today: {
                    revenue: todayRevenue,
                    profit: todayProfit,
                    orders: todayOrderCount,
                    vsYesterday: vsYesterday
                },
                week: {
                    revenue: weekRevenue,
                    profit: weekProfit,
                    orders: weekOrderCount,
                    vsLastWeek: vsLastWeek
                }
            };
            
        } catch (error) {
            console.error('Error getting today sales:', error);
            return {
                today: { revenue: 0, profit: 0, orders: 0, vsYesterday: 0 },
                week: { revenue: 0, profit: 0, orders: 0, vsLastWeek: 0 }
            };
        }
    },

    // ─────────────────────────────────────────────────────────────
    // Render Daily Summary Widget (for Dashboard)
    // ─────────────────────────────────────────────────────────────
    async renderDailySummaryWidget() {
        const data = await this.getTodaySales();
        
        const todayTrend = data.today.vsYesterday >= 0 ? 'up' : 'down';
        const todayTrendIcon = todayTrend === 'up' ? '▲' : '▼';
        const todayTrendColor = todayTrend === 'up' ? 'text-green-600' : 'text-red-600';
        const todayTrendBg = todayTrend === 'up' ? 'bg-green-50' : 'bg-red-50';
        
        const weekTrend = data.week.vsLastWeek >= 0 ? 'up' : 'down';
        const weekTrendIcon = weekTrend === 'up' ? '▲' : '▼';
        const weekTrendColor = weekTrend === 'up' ? 'text-green-600' : 'text-red-600';
        
        return `
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
                
                <!-- Header -->
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-bold text-gray-800 flex items-center gap-2">
                        📊 আজকের সারাংশ
                    </h3>
                    <span class="text-xs text-gray-500">
                        ${new Date().toLocaleDateString('bn-BD', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </span>
                </div>
                
                <!-- Today's Stats -->
                <div class="grid grid-cols-3 gap-3 mb-4">
                    <div class="bg-white rounded-xl p-3 text-center shadow-sm">
                        <p class="text-xs text-gray-500 mb-1">বিক্রি</p>
                        <p class="text-xl font-bold text-blue-600">৳${this.formatNumber(data.today.revenue)}</p>
                        <p class="text-xs ${todayTrendColor} mt-1">
                            ${todayTrendIcon} ${Math.abs(data.today.vsYesterday)}% গতকাল
                        </p>
                    </div>
                    <div class="bg-white rounded-xl p-3 text-center shadow-sm">
                        <p class="text-xs text-gray-500 mb-1">প্রফিট</p>
                        <p class="text-xl font-bold text-green-600">৳${this.formatNumber(data.today.profit)}</p>
                    </div>
                    <div class="bg-white rounded-xl p-3 text-center shadow-sm">
                        <p class="text-xs text-gray-500 mb-1">অর্ডার</p>
                        <p class="text-xl font-bold text-purple-600">${data.today.orders}</p>
                    </div>
                </div>
                
                <!-- Week Summary -->
                <div class="${todayTrendBg} rounded-xl p-3">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-xs text-gray-600">এই সপ্তাহ</p>
                            <p class="font-bold text-gray-800">৳${this.formatNumber(data.week.revenue)}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-xs ${weekTrendColor}">
                                ${weekTrendIcon} ${Math.abs(data.week.vsLastWeek)}%
                            </p>
                            <p class="text-xs text-gray-500">vs গত সপ্তাহ</p>
                        </div>
                    </div>
                </div>
                
            </div>
        `;
    },

    // ═══════════════════════════════════════════════════════════
    // FEATURE 2: LIMITED CUSTOMER ALERT (1 Per Day)
    // ═══════════════════════════════════════════════════════════

    // ─────────────────────────────────────────────────────────────
    // Get ONE at-risk customer (for Starter)
    // ─────────────────────────────────────────────────────────────
    async getOneAtRiskCustomer() {
        try {
            const customers = await db.customers.toArray();
            const orders = await db.orders.toArray();
            const today = new Date();
            
            const atRiskCustomers = [];
            
            // Group orders by customer
            const customerOrders = {};
            orders.forEach(o => {
                const phone = o.customerPhone;
                if (!customerOrders[phone]) {
                    customerOrders[phone] = [];
                }
                customerOrders[phone].push(o);
            });
            
            // Find at-risk customers
            customers.forEach(customer => {
                const custOrders = customerOrders[customer.phone] || [];
                if (custOrders.length === 0) return;
                
                // Sort by date
                custOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                const lastOrderDate = new Date(custOrders[0].date);
                const daysSinceLastOrder = Math.floor((today - lastOrderDate) / (1000 * 60 * 60 * 24));
                
                // At risk if no order in 30-60 days
                if (daysSinceLastOrder >= 30 && daysSinceLastOrder <= 90) {
                    const totalSpent = parseFloat(customer.totalSpent) || 0;
                    
                    atRiskCustomers.push({
                        customer: customer,
                        daysSinceLastOrder: daysSinceLastOrder,
                        totalSpent: totalSpent,
                        orderCount: custOrders.length,
                        riskLevel: daysSinceLastOrder > 60 ? 'high' : 'medium'
                    });
                }
            });
            
            // Sort by total spent (high value first)
            atRiskCustomers.sort((a, b) => b.totalSpent - a.totalSpent);
            
            // Return only TOP 1 for Starter
            return {
                topAtRisk: atRiskCustomers[0] || null,
                totalAtRisk: atRiskCustomers.length
            };
            
        } catch (error) {
            console.error('Error getting at-risk customer:', error);
            return { topAtRisk: null, totalAtRisk: 0 };
        }
    },

    // ─────────────────────────────────────────────────────────────
    // Render Limited Alert Widget (for Starter Dashboard)
    // ─────────────────────────────────────────────────────────────
    async renderLimitedAlertWidget() {
        const data = await this.getOneAtRiskCustomer();
        const userTier = (typeof AppState !== 'undefined' && AppState.userTier) ? AppState.userTier : 'STARTER';
        
        if (!data.topAtRisk) {
            return `
                <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100">
                    <h3 class="font-bold text-gray-800 flex items-center gap-2 mb-3">
                        🔔 Customer Alert
                    </h3>
                    <div class="text-center py-4">
                        <span class="text-3xl">✅</span>
                        <p class="text-green-700 font-medium mt-2">সব কাস্টমার active!</p>
                        <p class="text-green-600 text-sm">এই মুহূর্তে কোনো at-risk কাস্টমার নেই</p>
                    </div>
                </div>
            `;
        }
        
        const risk = data.topAtRisk;
        const riskColor = risk.riskLevel === 'high' ? 'red' : 'orange';
        
        return `
            <div class="bg-gradient-to-br from-${riskColor}-50 to-${riskColor}-100 rounded-2xl p-5 border border-${riskColor}-200">
                
                <!-- Header -->
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-bold text-gray-800 flex items-center gap-2">
                        🔔 Customer Alert
                        <span class="bg-${riskColor}-100 text-${riskColor}-700 text-xs px-2 py-0.5 rounded-full">1/1</span>
                    </h3>
                </div>
                
                <!-- Alert Card -->
                <div class="bg-white rounded-xl p-4 shadow-sm mb-3">
                    <div class="flex items-start gap-3">
                        <div class="w-10 h-10 bg-${riskColor}-100 rounded-full flex items-center justify-center">
                            <span class="text-lg">⚠️</span>
                        </div>
                        <div class="flex-1">
                            <p class="font-semibold text-gray-800">${risk.customer.name || 'Unknown'}</p>
                            <p class="text-sm text-gray-500">${risk.customer.phone}</p>
                            <div class="flex items-center gap-3 mt-2 text-sm">
                                <span class="text-${riskColor}-600 font-medium">
                                    ${risk.daysSinceLastOrder} দিন ধরে অর্ডার নেই
                                </span>
                                <span class="text-gray-400">|</span>
                                <span class="text-gray-600">৳${this.formatNumber(risk.totalSpent)} spent</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Quick Action -->
                    <div class="mt-3 flex gap-2">
                        <a href="https://wa.me/88${risk.customer.phone}?text=${encodeURIComponent(`হ্যালো ${risk.customer.name || ''}! কেমন আছেন? অনেকদিন অর্ডার দেননি। কিছু লাগলে জানাবেন!`)}" 
                           target="_blank"
                           class="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center justify-center gap-1">
                            <i class="ph ph-whatsapp-logo"></i> মেসেজ করুন
                        </a>
                    </div>
                </div>
                
                <!-- Upgrade Prompt -->
                ${data.totalAtRisk > 1 && userTier === 'STARTER' ? `
                    <div class="bg-white/70 rounded-xl p-3 border border-${riskColor}-200">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-gray-700">
                                    🔒 আরো <strong>${data.totalAtRisk - 1} জন</strong> at-risk আছে
                                </p>
                                <p class="text-xs text-gray-500">GROWTH এ সব দেখুন</p>
                            </div>
                            <button onclick="showUpgradePrompt('customer_alerts', 'GROWTH')" 
                                    class="bg-purple-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-purple-700 transition">
                                Unlock
                            </button>
                        </div>
                    </div>
                ` : ''}
                
            </div>
        `;
    },

    // ═══════════════════════════════════════════════════════════
    // FEATURE 3: WHATSAPP ORDER CONFIRMATION
    // ═══════════════════════════════════════════════════════════

    // ─────────────────────────────────────────────────────────────
    // Generate order confirmation message
    // ─────────────────────────────────────────────────────────────
    generateOrderConfirmationMessage(order, customerName = '') {
        const orderId = order.orderId || order.id || 'N/A';
        const total = parseFloat(order.grandTotal) || 0;
        const name = customerName || order.customerName || 'ভাই';
        
        return `✅ *অর্ডার কনফার্মড!*

${name}, আপনার অর্ডার সফলভাবে রিসিভ হয়েছে।

📦 *Order ID:* #${orderId}
💰 *Total:* ৳${this.formatNumber(total)}

ডেলিভারি সম্পর্কে শীঘ্রই জানানো হবে।
ধন্যবাদ! 🙏`;
    },

    // ─────────────────────────────────────────────────────────────
    // Open WhatsApp with order confirmation
    // ─────────────────────────────────────────────────────────────
    sendOrderConfirmation(order, phone, customerName = '') {
        if (!phone) {
            alert('ফোন নম্বর পাওয়া যায়নি');
            return;
        }
        
        const message = this.generateOrderConfirmationMessage(order, customerName);
        const encodedMessage = encodeURIComponent(message);
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const formattedPhone = cleanPhone.startsWith('88') ? cleanPhone : '88' + cleanPhone;
        
        window.open(`https://wa.me/${formattedPhone}?text=${encodedMessage}`, '_blank');
    },

    // ─────────────────────────────────────────────────────────────
    // Render Send Confirmation Button (for Order Detail)
    // ─────────────────────────────────────────────────────────────
    renderConfirmationButton(order, phone, customerName = '') {
        return `
            <button onclick="StarterFeatures.sendOrderConfirmation(${JSON.stringify(order).replace(/"/g, '&quot;')}, '${phone}', '${customerName}')" 
                    class="flex items-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition">
                <i class="ph ph-whatsapp-logo text-lg"></i>
                অর্ডার কনফার্ম পাঠান
            </button>
        `;
    }

};

// Make globally available
window.StarterFeatures = StarterFeatures;