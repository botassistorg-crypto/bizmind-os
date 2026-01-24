/**
 * ═══════════════════════════════════════════════════════════════
 * DAILY BRIEFING - ELITE FEATURE
 * BizMind GrowthOS
 * ═══════════════════════════════════════════════════════════════
 * Shows business owners exactly what happened yesterday
 * and what they need to do TODAY.
 * ═══════════════════════════════════════════════════════════════
 */

const DailyBriefing = {

    // ─────────────────────────────────────────────────────────────
    // HELPER: Get date ranges
    // ─────────────────────────────────────────────────────────────
    getDateRanges() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        return {
            today: today.toISOString().split('T')[0],
            yesterday: yesterday.toISOString().split('T')[0],
            weekAgo: weekAgo.toISOString().split('T')[0],
            monthStart: monthStart.toISOString().split('T')[0],
            monthEnd: monthEnd.toISOString().split('T')[0],
            todayObj: today,
            yesterdayObj: yesterday,
            daysLeftInMonth: monthEnd.getDate() - today.getDate() + 1
        };
    },

    // ─────────────────────────────────────────────────────────────
    // HELPER: Get greeting based on time
    // ─────────────────────────────────────────────────────────────
    getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return { emoji: '☀️', text: 'সুপ্রভাত', english: 'Good Morning' };
        if (hour < 17) return { emoji: '🌤️', text: 'শুভ অপরাহ্ন', english: 'Good Afternoon' };
        if (hour < 20) return { emoji: '🌅', text: 'শুভ সন্ধ্যা', english: 'Good Evening' };
        return { emoji: '🌙', text: 'শুভ রাত্রি', english: 'Good Night' };
    },

    // ─────────────────────────────────────────────────────────────
    // HELPER: Get day name in Bangla
    // ─────────────────────────────────────────────────────────────
    getDayName(date) {
        const days = {
            0: { bn: 'রবিবার', en: 'Sunday' },
            1: { bn: 'সোমবার', en: 'Monday' },
            2: { bn: 'মঙ্গলবার', en: 'Tuesday' },
            3: { bn: 'বুধবার', en: 'Wednesday' },
            4: { bn: 'বৃহস্পতিবার', en: 'Thursday' },
            5: { bn: 'শুক্রবার', en: 'Friday' },
            6: { bn: 'শনিবার', en: 'Saturday' }
        };
        return days[date.getDay()];
    },

    // ─────────────────────────────────────────────────────────────
    // CORE: Calculate Yesterday's Performance
    // ─────────────────────────────────────────────────────────────
    async getYesterdayPerformance() {
        const dates = this.getDateRanges();
        
        try {
            // Get yesterday's orders
            const yesterdayOrders = await db.orders
                .where('date')
                .equals(dates.yesterday)
                .toArray();
            
            // Get last 30 days orders for comparison
            const last30Days = new Date(dates.todayObj);
            last30Days.setDate(last30Days.getDate() - 30);
            
            const recentOrders = await db.orders
                .where('date')
                .between(last30Days.toISOString().split('T')[0], dates.yesterday)
                .toArray();
            
            // Calculate yesterday stats
            const yesterdayRevenue = yesterdayOrders.reduce((sum, o) => sum + (parseFloat(o.grandTotal) || 0), 0);
            const yesterdayProfit = yesterdayOrders.reduce((sum, o) => sum + (parseFloat(o.netProfit) || 0), 0);
            const yesterdayOrderCount = yesterdayOrders.length;
            
            // Calculate average daily stats
            const avgDailyRevenue = recentOrders.length > 0 
                ? recentOrders.reduce((sum, o) => sum + (parseFloat(o.grandTotal) || 0), 0) / 30 
                : 0;
            const avgDailyOrders = recentOrders.length / 30;
            
            // Calculate comparison
            const revenueVsAvg = avgDailyRevenue > 0 
                ? ((yesterdayRevenue - avgDailyRevenue) / avgDailyRevenue * 100).toFixed(0)
                : 0;
            
            // Find best selling product yesterday
            const productSales = {};
            yesterdayOrders.forEach(order => {
                const items = this.parseOrderItems(order.items);
                items.forEach(item => {
                    if (!productSales[item.name]) {
                        productSales[item.name] = { qty: 0, revenue: 0 };
                    }
                    productSales[item.name].qty += item.qty;
                    productSales[item.name].revenue += item.total || 0;
                });
            });
            
            const bestProduct = Object.entries(productSales)
                .sort((a, b) => b[1].qty - a[1].qty)[0];
            
            return {
                revenue: yesterdayRevenue,
                profit: yesterdayProfit,
                orderCount: yesterdayOrderCount,
                avgDailyRevenue: avgDailyRevenue,
                revenueVsAvg: parseInt(revenueVsAvg),
                bestProduct: bestProduct ? { name: bestProduct[0], qty: bestProduct[1].qty } : null,
                dayName: this.getDayName(dates.yesterdayObj)
            };
            
        } catch (error) {
            console.error('Error getting yesterday performance:', error);
            return null;
        }
    },

    // ─────────────────────────────────────────────────────────────
    // HELPER: Parse order items (handles string or array)
    // ─────────────────────────────────────────────────────────────
    parseOrderItems(items) {
        if (!items) return [];
        
        // If already array of objects
        if (Array.isArray(items)) {
            return items.map(item => ({
                name: item.name || item.sku || 'Unknown',
                qty: item.qty || item.quantity || 1,
                total: item.total || item.lineTotal || 0
            }));
        }
        
        // If string like "SKU (x2), SKU2 (x1)"
        if (typeof items === 'string') {
            const parsed = [];
            const parts = items.split(',');
            parts.forEach(part => {
                const match = part.trim().match(/(.+?)\s*\(x(\d+)\)/);
                if (match) {
                    parsed.push({ name: match[1].trim(), qty: parseInt(match[2]), total: 0 });
                } else if (part.trim()) {
                    parsed.push({ name: part.trim(), qty: 1, total: 0 });
                }
            });
            return parsed;
        }
        
        return [];
    },

    // ─────────────────────────────────────────────────────────────
    // CORE: Get Priority Actions for Today
    // ─────────────────────────────────────────────────────────────
    async getTodayPriorityActions() {
        const actions = [];
        const dates = this.getDateRanges();
        
        try {
            // 1. VIP customers due for reorder
            const customers = await db.customers.toArray();
            const orders = await db.orders.toArray();
            
            // Group orders by customer
            const customerOrders = {};
            orders.forEach(o => {
                if (!customerOrders[o.customerPhone]) {
                    customerOrders[o.customerPhone] = [];
                }
                customerOrders[o.customerPhone].push(o);
            });
            
            // Find customers due for reorder
            customers.forEach(customer => {
                const custOrders = customerOrders[customer.phone] || [];
                if (custOrders.length < 2) return;
                
                // Calculate average purchase cycle
                custOrders.sort((a, b) => new Date(a.date) - new Date(b.date));
                
                let totalGap = 0;
                for (let i = 1; i < custOrders.length; i++) {
                    const gap = (new Date(custOrders[i].date) - new Date(custOrders[i-1].date)) / (1000 * 60 * 60 * 24);
                    totalGap += gap;
                }
                const avgCycle = totalGap / (custOrders.length - 1);
                
                // Check if due
                const lastOrderDate = new Date(custOrders[custOrders.length - 1].date);
                const daysSinceLastOrder = (dates.todayObj - lastOrderDate) / (1000 * 60 * 60 * 24);
                const daysOverdue = daysSinceLastOrder - avgCycle;
                
                if (daysOverdue >= -2 && daysOverdue <= 7) { // Due within 2 days or up to 7 days overdue
                    const isVIP = customer.tier === 'VIP' || customer.tier === 'Loyal' || customer.totalSpent >= 10000;
                    actions.push({
                        type: 'reorder_due',
                        priority: isVIP ? 'high' : 'medium',
                        customer: customer,
                        daysOverdue: Math.round(daysOverdue),
                        avgCycle: Math.round(avgCycle),
                        message: this.generateReorderMessage(customer)
                    });
                }
            });
            
            // 2. Pending orders > 2 days
            const pendingOrders = await db.orders
                .where('status')
                .anyOf(['Pending', 'pending', 'Processing', 'processing'])
                .toArray();
            
            pendingOrders.forEach(order => {
                const orderDate = new Date(order.date);
                const daysPending = (dates.todayObj - orderDate) / (1000 * 60 * 60 * 24);
                
                if (daysPending >= 2) {
                    actions.push({
                        type: 'pending_order',
                        priority: daysPending >= 4 ? 'high' : 'medium',
                        order: order,
                        daysPending: Math.round(daysPending)
                    });
                }
            });
            
            // 3. Sort by priority
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
            
            return actions.slice(0, 5); // Top 5 actions
            
        } catch (error) {
            console.error('Error getting priority actions:', error);
            return [];
        }
    },

    // ─────────────────────────────────────────────────────────────
    // HELPER: Generate reorder message
    // ─────────────────────────────────────────────────────────────
    generateReorderMessage(customer) {
        const name = customer.name ? customer.name.split(' ')[0] : 'ভাই';
        const messages = [
            `${name}, আপনার প্রিয় প্রোডাক্ট কি শেষ হয়ে গেছে? 🛒 আজই অর্ডার করুন, দ্রুত ডেলিভারি!`,
            `${name}, অনেকদিন অর্ডার করেননি! আপনার জন্য স্পেশাল অফার আছে 🎁`,
            `${name} ভাই, কেমন আছেন? নতুন স্টক এসেছে, দেখে নিন! 📦`
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    },

    // ─────────────────────────────────────────────────────────────
    // CORE: Get Monthly Goal Progress
    // ─────────────────────────────────────────────────────────────
    async getMonthlyProgress() {
        const dates = this.getDateRanges();
        
        try {
            // Get this month's orders
            const monthOrders = await db.orders
                .where('date')
                .between(dates.monthStart, dates.today)
                .toArray();
            
            const monthRevenue = monthOrders.reduce((sum, o) => sum + (parseFloat(o.grandTotal) || 0), 0);
            const monthProfit = monthOrders.reduce((sum, o) => sum + (parseFloat(o.netProfit) || 0), 0);
            
            // Get last month for comparison
            const lastMonthStart = new Date(dates.todayObj.getFullYear(), dates.todayObj.getMonth() - 1, 1);
            const lastMonthEnd = new Date(dates.todayObj.getFullYear(), dates.todayObj.getMonth(), 0);
            
            const lastMonthOrders = await db.orders
                .where('date')
                .between(lastMonthStart.toISOString().split('T')[0], lastMonthEnd.toISOString().split('T')[0])
                .toArray();
            
            const lastMonthRevenue = lastMonthOrders.reduce((sum, o) => sum + (parseFloat(o.grandTotal) || 0), 0);
            
            // Set goal as last month's revenue + 10%
            const monthlyGoal = lastMonthRevenue > 0 ? lastMonthRevenue * 1.1 : 50000;
            const progressPercent = Math.min((monthRevenue / monthlyGoal * 100), 100).toFixed(0);
            const remainingAmount = Math.max(monthlyGoal - monthRevenue, 0);
            const dailyNeeded = dates.daysLeftInMonth > 0 ? remainingAmount / dates.daysLeftInMonth : 0;
            
            return {
                currentRevenue: monthRevenue,
                currentProfit: monthProfit,
                goal: monthlyGoal,
                progressPercent: parseInt(progressPercent),
                remainingAmount: remainingAmount,
                dailyNeeded: dailyNeeded,
                daysLeft: dates.daysLeftInMonth,
                orderCount: monthOrders.length
            };
            
        } catch (error) {
            console.error('Error getting monthly progress:', error);
            return null;
        }
    },

    // ─────────────────────────────────────────────────────────────
    // CORE: Get Today's Opportunity/Insight
    // ─────────────────────────────────────────────────────────────
    async getTodayOpportunity() {
        const dates = this.getDateRanges();
        const todayDayNum = dates.todayObj.getDay();
        const todayDayName = this.getDayName(dates.todayObj);
        
        try {
            // Analyze past performance for this day of week
            const allOrders = await db.orders.toArray();
            
            const dayStats = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
            
            allOrders.forEach(order => {
                const orderDay = new Date(order.date).getDay();
                dayStats[orderDay].push(parseFloat(order.grandTotal) || 0);
            });
            
            // Calculate average for each day
            const dayAverages = {};
            Object.keys(dayStats).forEach(day => {
                const revenues = dayStats[day];
                dayAverages[day] = revenues.length > 0 
                    ? revenues.reduce((a, b) => a + b, 0) / revenues.length 
                    : 0;
            });
            
            // Find best and worst days
            const sortedDays = Object.entries(dayAverages).sort((a, b) => b[1] - a[1]);
            const bestDay = parseInt(sortedDays[0][0]);
            const worstDay = parseInt(sortedDays[sortedDays.length - 1][0]);
            
            // Generate insight based on today
            let insight = {
                type: 'neutral',
                message: '',
                suggestion: ''
            };
            
            if (todayDayNum === bestDay) {
                insight = {
                    type: 'positive',
                    message: `${todayDayName.bn} আপনার সবচেয়ে ভালো দিন! 🔥`,
                    suggestion: 'আজ বেশি প্রোডাক্ট প্রমোট করুন, কাস্টমার active থাকে'
                };
            } else if (todayDayNum === worstDay) {
                insight = {
                    type: 'warning',
                    message: `${todayDayName.bn} সাধারণত slow দিন 📉`,
                    suggestion: 'Flash sale বা স্পেশাল অফার দিয়ে দিনটা কাজে লাগান'
                };
            } else {
                insight = {
                    type: 'neutral',
                    message: `${todayDayName.bn} মোটামুটি average দিন`,
                    suggestion: 'VIP কাস্টমারদের ফলো-আপ করার ভালো সময়'
                };
            }
            
            insight.avgRevenue = dayAverages[todayDayNum];
            
            return insight;
            
        } catch (error) {
            console.error('Error getting today opportunity:', error);
            return null;
        }
    }
};

// Make globally available
window.DailyBriefing = DailyBriefing;

/**
 * ═══════════════════════════════════════════════════════════════
 * DAILY BRIEFING - PART 2: UI RENDERING
 * ═══════════════════════════════════════════════════════════════
 */

// Add these methods to the DailyBriefing object:

Object.assign(DailyBriefing, {

    // ─────────────────────────────────────────────────────────────
    // MAIN: Render Full Briefing (ELITE ONLY)
    // ─────────────────────────────────────────────────────────────
    async renderFullBriefing() {
    // ═══════════════════════════════════════
    // FIX: Wait for container to exist
    // ═══════════════════════════════════════
    let container = document.getElementById('main-content');
    
    if (!container) {
        container = document.getElementById('daily-briefing-container');
    }
    
    if (!container) {
        await new Promise(resolve => setTimeout(resolve, 50));
        container = document.getElementById('main-content') 
                 || document.getElementById('daily-briefing-container');
    }
    
    if (!container) {
        console.error('Container not found for Daily Briefing');
        return;
    }
    
    // Show loading
    container.innerHTML = `
        <div class="flex items-center justify-center min-h-screen">
            <div class="text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p class="text-gray-600">আপনার Daily Briefing তৈরি হচ্ছে...</p>
            </div>
        </div>
    `;
        
        // Fetch all data
        const [yesterday, actions, monthly, opportunity] = await Promise.all([
            this.getYesterdayPerformance(),
            this.getTodayPriorityActions(),
            this.getMonthlyProgress(),
            this.getTodayOpportunity()
        ]);
        
        const greeting = this.getGreeting();
        const dates = this.getDateRanges();
        const todayFormatted = dates.todayObj.toLocaleDateString('bn-BD', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Build HTML
        container.innerHTML = `
            <div class="max-w-4xl mx-auto p-4 space-y-6">
                
                <!-- Header -->
                ${this.renderHeader(greeting, todayFormatted)}
                
                <!-- Yesterday Performance -->
                ${this.renderYesterdayCard(yesterday)}
                
                <!-- Today's Priority Actions -->
                ${this.renderActionsCard(actions)}
                
                <!-- Today's Opportunity -->
                ${this.renderOpportunityCard(opportunity)}
                
                <!-- Monthly Progress -->
                ${this.renderMonthlyCard(monthly)}
                
                <!-- Quick Actions Footer -->
                ${this.renderQuickActions()}
                
            </div>
        `;
        
        // Initialize event listeners
        this.initEventListeners();
    },

    // ─────────────────────────────────────────────────────────────
    // RENDER: Header Section
    // ─────────────────────────────────────────────────────────────
    renderHeader(greeting, todayFormatted) {
        return `
            <div class="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-bold flex items-center gap-2">
                            ${greeting.emoji} ${greeting.text}!
                        </h1>
                        <p class="text-purple-100 mt-1">${todayFormatted}</p>
                    </div>
                    <div class="text-right">
                        <span class="bg-white/20 px-3 py-1 rounded-full text-sm">
                            ⚡ ELITE Feature
                        </span>
                    </div>
                </div>
                <p class="mt-4 text-purple-100">
                    আজকের জন্য আপনার ব্যবসার সারসংক্ষেপ এবং করণীয় কাজগুলো দেখুন
                </p>
            </div>
        `;
    },

    // ─────────────────────────────────────────────────────────────
    // RENDER: Yesterday's Performance Card
    // ─────────────────────────────────────────────────────────────
    renderYesterdayCard(data) {
        if (!data) {
            return `
                <div class="bg-white rounded-xl p-6 shadow-sm border">
                    <h2 class="text-lg font-bold text-gray-800 mb-4">📊 গতকালের পারফরম্যান্স</h2>
                    <p class="text-gray-500">কোনো ডাটা পাওয়া যায়নি</p>
                </div>
            `;
        }
        
        const trendIcon = data.revenueVsAvg >= 0 ? '▲' : '▼';
        const trendColor = data.revenueVsAvg >= 0 ? 'text-green-600' : 'text-red-600';
        const trendBg = data.revenueVsAvg >= 0 ? 'bg-green-50' : 'bg-red-50';
        
        return `
            <div class="bg-white rounded-xl p-6 shadow-sm border">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
                        📊 গতকালের পারফরম্যান্স
                        <span class="text-sm font-normal text-gray-500">(${data.dayName.bn})</span>
                    </h2>
                    <span class="${trendBg} ${trendColor} px-3 py-1 rounded-full text-sm font-medium">
                        ${trendIcon} ${Math.abs(data.revenueVsAvg)}% vs গড়
                    </span>
                </div>
                
                <div class="grid grid-cols-3 gap-4">
                    <!-- Revenue -->
                    <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
                        <p class="text-green-600 text-sm font-medium">রেভিনিউ</p>
                        <p class="text-2xl font-bold text-green-700 mt-1">৳${this.formatNumber(data.revenue)}</p>
                        <p class="text-xs text-green-600 mt-1">গড় ৳${this.formatNumber(data.avgDailyRevenue)}</p>
                    </div>
                    
                    <!-- Orders -->
                    <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                        <p class="text-blue-600 text-sm font-medium">অর্ডার</p>
                        <p class="text-2xl font-bold text-blue-700 mt-1">${data.orderCount}</p>
                        <p class="text-xs text-blue-600 mt-1">টি অর্ডার</p>
                    </div>
                    
                    <!-- Profit -->
                    <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                        <p class="text-purple-600 text-sm font-medium">প্রফিট</p>
                        <p class="text-2xl font-bold text-purple-700 mt-1">৳${this.formatNumber(data.profit)}</p>
                        <p class="text-xs text-purple-600 mt-1">নেট লাভ</p>
                    </div>
                </div>
                
                ${data.bestProduct ? `
                    <div class="mt-4 bg-yellow-50 rounded-lg p-3 flex items-center gap-3">
                        <span class="text-2xl">🏆</span>
                        <div>
                            <p class="text-sm text-yellow-800">
                                <span class="font-medium">বেস্ট সেলার:</span> ${data.bestProduct.name}
                            </p>
                            <p class="text-xs text-yellow-600">${data.bestProduct.qty} টি বিক্রি হয়েছে</p>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    },

    // ─────────────────────────────────────────────────────────────
    // RENDER: Priority Actions Card
    // ─────────────────────────────────────────────────────────────
    renderActionsCard(actions) {
        if (!actions || actions.length === 0) {
            return `
                <div class="bg-white rounded-xl p-6 shadow-sm border">
                    <h2 class="text-lg font-bold text-gray-800 mb-4">🎯 আজকের করণীয়</h2>
                    <div class="bg-green-50 rounded-lg p-4 text-center">
                        <span class="text-4xl">✅</span>
                        <p class="text-green-700 font-medium mt-2">দারুণ! আজ কোনো জরুরি কাজ নেই</p>
                        <p class="text-green-600 text-sm">সব কিছু ঠিকঠাক চলছে</p>
                    </div>
                </div>
            `;
        }
        
        const priorityColors = {
            high: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700' },
            medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700' },
            low: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' }
        };
        
        const actionsHTML = actions.map((action, index) => {
            const colors = priorityColors[action.priority];
            
            if (action.type === 'reorder_due') {
                const customer = action.customer;
                const overdueText = action.daysOverdue > 0 
                    ? `${action.daysOverdue} দিন দেরি হয়ে গেছে!` 
                    : action.daysOverdue === 0 
                        ? 'আজই অর্ডার করার কথা!' 
                        : `${Math.abs(action.daysOverdue)} দিনের মধ্যে অর্ডার করবেন`;
                
                return `
                    <div class="${colors.bg} ${colors.border} border rounded-xl p-4 action-item" data-index="${index}">
                        <div class="flex items-start justify-between">
                            <div class="flex items-start gap-3">
                                <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                    <span class="text-lg">📞</span>
                                </div>
                                <div>
                                    <div class="flex items-center gap-2">
                                        <p class="font-semibold ${colors.text}">${customer.name || 'Unknown'}</p>
                                        ${customer.tier === 'VIP' || customer.totalSpent >= 10000 ? 
                                            '<span class="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">VIP</span>' : ''}
                                    </div>
                                    <p class="text-sm text-gray-600 mt-0.5">${customer.phone}</p>
                                    <p class="text-xs ${colors.text} mt-1">
                                        ⏰ ${overdueText} (গড় সাইকেল: ${action.avgCycle} দিন)
                                    </p>
                                </div>
                            </div>
                            <span class="${colors.badge} text-xs px-2 py-1 rounded-full">
                                ${action.priority === 'high' ? 'জরুরি' : 'মিডিয়াম'}
                            </span>
                        </div>
                        
                        <div class="mt-3 bg-white rounded-lg p-3 border">
                            <p class="text-sm text-gray-700 mb-2">📝 সাজেস্টেড মেসেজ:</p>
                            <p class="text-sm text-gray-600 italic" id="msg-${index}">${action.message}</p>
                        </div>
                        
                        <div class="mt-3 flex gap-2">
                            <button onclick="DailyBriefing.copyMessage(${index}, '${action.message.replace(/'/g, "\\'")}')" 
                                    class="flex-1 bg-white border border-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center justify-center gap-1">
                                <i class="ph ph-copy"></i> কপি করুন
                            </button>
                            <button onclick="DailyBriefing.markDone(${index})" 
                                    class="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center justify-center gap-1">
                                <i class="ph ph-check"></i> Done
                            </button>
                        </div>
                    </div>
                `;
            }
            
            if (action.type === 'pending_order') {
                return `
                    <div class="${colors.bg} ${colors.border} border rounded-xl p-4 action-item" data-index="${index}">
                        <div class="flex items-start justify-between">
                            <div class="flex items-start gap-3">
                                <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                    <span class="text-lg">📦</span>
                                </div>
                                <div>
                                    <p class="font-semibold ${colors.text}">Pending Order #${action.order.orderId}</p>
                                    <p class="text-sm text-gray-600 mt-0.5">${action.order.customerPhone}</p>
                                    <p class="text-xs ${colors.text} mt-1">
                                        ⚠️ ${action.daysPending} দিন ধরে পেন্ডিং আছে!
                                    </p>
                                </div>
                            </div>
                            <span class="${colors.badge} text-xs px-2 py-1 rounded-full">
                                ${action.daysPending >= 4 ? 'জরুরি' : 'চেক করুন'}
                            </span>
                        </div>
                        
                        <div class="mt-3 flex gap-2">
                            <button onclick="window.location.hash='#orders'" 
                                    class="flex-1 bg-white border border-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                                অর্ডার দেখুন
                            </button>
                            <button onclick="DailyBriefing.markDone(${index})" 
                                    class="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition">
                                <i class="ph ph-check"></i> Done
                            </button>
                        </div>
                    </div>
                `;
            }
            
            return '';
        }).join('');
        
        return `
            <div class="bg-white rounded-xl p-6 shadow-sm border">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-lg font-bold text-gray-800">🎯 আজকের করণীয়</h2>
                    <span class="bg-purple-100 text-purple-700 text-sm px-3 py-1 rounded-full">
                        ${actions.length} টি কাজ
                    </span>
                </div>
                
                <div class="space-y-4">
                    ${actionsHTML}
                </div>
            </div>
        `;
    },

    // ─────────────────────────────────────────────────────────────
    // RENDER: Today's Opportunity Card
    // ─────────────────────────────────────────────────────────────
    renderOpportunityCard(opportunity) {
        if (!opportunity) return '';
        
        const typeStyles = {
            positive: { bg: 'bg-green-50', border: 'border-green-200', icon: '🔥', iconBg: 'bg-green-100' },
            warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: '💡', iconBg: 'bg-amber-100' },
            neutral: { bg: 'bg-blue-50', border: 'border-blue-200', icon: '📌', iconBg: 'bg-blue-100' }
        };
        
        const style = typeStyles[opportunity.type];
        
        return `
            <div class="${style.bg} ${style.border} border rounded-xl p-5">
                <div class="flex items-start gap-4">
                    <div class="${style.iconBg} w-12 h-12 rounded-full flex items-center justify-center text-2xl">
                        ${style.icon}
                    </div>
                    <div class="flex-1">
                        <h3 class="font-bold text-gray-800">আজকের Insight</h3>
                        <p class="text-gray-700 mt-1">${opportunity.message}</p>
                        <p class="text-gray-600 text-sm mt-2">
                            💡 <span class="font-medium">পরামর্শ:</span> ${opportunity.suggestion}
                        </p>
                        ${opportunity.avgRevenue > 0 ? `
                            <p class="text-gray-500 text-xs mt-2">
                                এই দিনে গড় আয়: ৳${this.formatNumber(opportunity.avgRevenue)}
                            </p>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    },

    // ─────────────────────────────────────────────────────────────
    // RENDER: Monthly Progress Card
    // ─────────────────────────────────────────────────────────────
    renderMonthlyCard(data) {
        if (!data) return '';
        
        const progressColor = data.progressPercent >= 70 ? 'bg-green-500' : 
                             data.progressPercent >= 40 ? 'bg-yellow-500' : 'bg-red-500';
        
        const statusEmoji = data.progressPercent >= 70 ? '🚀' : 
                           data.progressPercent >= 40 ? '💪' : '⚡';
        
        return `
            <div class="bg-white rounded-xl p-6 shadow-sm border">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-lg font-bold text-gray-800">📈 এই মাসের অগ্রগতি</h2>
                    <span class="text-2xl">${statusEmoji}</span>
                </div>
                
                <!-- Progress Bar -->
                <div class="mb-4">
                    <div class="flex justify-between text-sm mb-2">
                        <span class="text-gray-600">৳${this.formatNumber(data.currentRevenue)}</span>
                        <span class="text-gray-800 font-medium">লক্ষ্য: ৳${this.formatNumber(data.goal)}</span>
                    </div>
                    <div class="h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div class="${progressColor} h-full rounded-full transition-all duration-500" 
                             style="width: ${data.progressPercent}%"></div>
                    </div>
                    <div class="flex justify-between text-xs mt-1">
                        <span class="text-gray-500">${data.progressPercent}% সম্পন্ন</span>
                        <span class="text-gray-500">${data.daysLeft} দিন বাকি</span>
                    </div>
                </div>
                
                <!-- Stats Grid -->
                <div class="grid grid-cols-3 gap-3 mt-4">
                    <div class="bg-gray-50 rounded-lg p-3 text-center">
                        <p class="text-xs text-gray-500">মোট অর্ডার</p>
                        <p class="text-lg font-bold text-gray-800">${data.orderCount}</p>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-3 text-center">
                        <p class="text-xs text-gray-500">নেট প্রফিট</p>
                        <p class="text-lg font-bold text-gray-800">৳${this.formatNumber(data.currentProfit)}</p>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-3 text-center">
                        <p class="text-xs text-gray-500">দৈনিক লক্ষ্য</p>
                        <p class="text-lg font-bold text-gray-800">৳${this.formatNumber(data.dailyNeeded)}</p>
                    </div>
                </div>
                
                ${data.progressPercent < 50 && data.daysLeft <= 15 ? `
                    <div class="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p class="text-amber-800 text-sm">
                            ⚠️ <span class="font-medium">সতর্কতা:</span> লক্ষ্যে পৌঁছাতে দৈনিক ৳${this.formatNumber(data.dailyNeeded)} করতে হবে। 
                            এখনই একটা প্রমোশন চালান!
                        </p>
                    </div>
                ` : ''}
            </div>
        `;
    },

    // ─────────────────────────────────────────────────────────────
    // RENDER: Quick Actions Footer
    // ─────────────────────────────────────────────────────────────
    renderQuickActions() {
        return `
            <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 border">
                <h3 class="font-bold text-gray-700 mb-3">⚡ দ্রুত অ্যাকশন</h3>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button onclick="window.location.hash='#orders'" 
                            class="bg-white border border-gray-200 rounded-lg p-3 text-center hover:shadow-md transition">
                        <span class="text-2xl">📦</span>
                        <p class="text-sm text-gray-700 mt-1">অর্ডার দেখুন</p>
                    </button>
                    <button onclick="window.location.hash='#growth'" 
                            class="bg-white border border-gray-200 rounded-lg p-3 text-center hover:shadow-md transition">
                        <span class="text-2xl">🚀</span>
                        <p class="text-sm text-gray-700 mt-1">Growth Hub</p>
                    </button>
                    <button onclick="window.location.hash='#customer_alerts'" 
                            class="bg-white border border-gray-200 rounded-lg p-3 text-center hover:shadow-md transition">
                        <span class="text-2xl">🔔</span>
                        <p class="text-sm text-gray-700 mt-1">Alerts</p>
                    </button>
                    <button onclick="DailyBriefing.refreshBriefing()" 
                            class="bg-white border border-gray-200 rounded-lg p-3 text-center hover:shadow-md transition">
                        <span class="text-2xl">🔄</span>
                        <p class="text-sm text-gray-700 mt-1">Refresh</p>
                    </button>
                </div>
            </div>
        `;
    },

    // ─────────────────────────────────────────────────────────────
    // HELPER: Format number with commas
    // ─────────────────────────────────────────────────────────────
    formatNumber(num) {
        if (!num || isNaN(num)) return '0';
        return Math.round(num).toLocaleString('en-IN');
    },

    // ─────────────────────────────────────────────────────────────
    // ACTION: Copy message to clipboard
    // ─────────────────────────────────────────────────────────────
    copyMessage(index, message) {
        navigator.clipboard.writeText(message).then(() => {
            // Show feedback
            const btn = event.target.closest('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="ph ph-check"></i> কপি হয়েছে!';
            btn.classList.add('bg-green-100', 'text-green-700');
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.remove('bg-green-100', 'text-green-700');
            }, 2000);
        }).catch(err => {
            console.error('Copy failed:', err);
            alert('কপি করা যায়নি। ম্যানুয়ালি কপি করুন।');
        });
    },

    // ─────────────────────────────────────────────────────────────
    // ACTION: Mark task as done
    // ─────────────────────────────────────────────────────────────
    markDone(index) {
        const actionItem = document.querySelector(`.action-item[data-index="${index}"]`);
        if (actionItem) {
            actionItem.classList.add('opacity-50');
            actionItem.innerHTML = `
                <div class="flex items-center justify-center py-4">
                    <span class="text-green-600 font-medium flex items-center gap-2">
                        <i class="ph ph-check-circle text-2xl"></i>
                        সম্পন্ন হয়েছে!
                    </span>
                </div>
            `;
            
            // Remove after 2 seconds
            setTimeout(() => {
                actionItem.style.height = actionItem.offsetHeight + 'px';
                actionItem.style.overflow = 'hidden';
                actionItem.style.transition = 'all 0.3s ease';
                
                setTimeout(() => {
                    actionItem.style.height = '0';
                    actionItem.style.padding = '0';
                    actionItem.style.margin = '0';
                    actionItem.style.opacity = '0';
                }, 50);
                
                setTimeout(() => {
                    actionItem.remove();
                }, 350);
            }, 1500);
        }
    },

    // ─────────────────────────────────────────────────────────────
    // ACTION: Refresh briefing
    // ─────────────────────────────────────────────────────────────
    refreshBriefing() {
        this.renderFullBriefing();
    },

    // ─────────────────────────────────────────────────────────────
    // Initialize event listeners
    // ─────────────────────────────────────────────────────────────
    initEventListeners() {
        // Any additional event listeners can be added here
    }

});

/**
 * ═══════════════════════════════════════════════════════════════
 * DAILY BRIEFING - PART 3: TEASER & INTEGRATION
 * ═══════════════════════════════════════════════════════════════
 */

Object.assign(DailyBriefing, {

    // ─────────────────────────────────────────────────────────────
    // TEASER: Blurred version for GROWTH/STARTER users
    // ─────────────────────────────────────────────────────────────
    async renderTeaser() {
    // ═══════════════════════════════════════
    // FIX: Wait for container to exist
    // ═══════════════════════════════════════
    let container = document.getElementById('main-content');
    
    if (!container) {
        container = document.getElementById('daily-briefing-container');
    }
    
    if (!container) {
        await new Promise(resolve => setTimeout(resolve, 50));
        container = document.getElementById('main-content') 
                 || document.getElementById('daily-briefing-container');
    }
    
    if (!container) {
        console.error('Container not found for Daily Briefing Teaser');
        return;
    }
    
    const greeting = this.getGreeting();
    const dates = this.getDateRanges();
    
    // Generate FAKE enticing data for teaser
    const fakeData = this.generateTeaserData();
    
    container.innerHTML = `
        <div class="max-w-4xl mx-auto p-4 space-y-6">
       
                <!-- Header (Real) -->
                <div class="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-2xl font-bold flex items-center gap-2">
                                ${greeting.emoji} Daily Business Briefing
                            </h1>
                            <p class="text-purple-100 mt-1">প্রতিদিন সকালে আপনার ব্যবসার সারসংক্ষেপ</p>
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
                        
                        <!-- Fake Yesterday Stats -->
                        <div class="bg-white rounded-xl p-6 shadow-sm border mb-4">
                            <h2 class="text-lg font-bold text-gray-800 mb-4">📊 গতকালের পারফরম্যান্স</h2>
                            <div class="grid grid-cols-3 gap-4">
                                <div class="bg-green-50 rounded-xl p-4 text-center">
                                    <p class="text-green-600 text-sm">রেভিনিউ</p>
                                    <p class="text-2xl font-bold text-green-700">৳${fakeData.revenue}</p>
                                    <p class="text-xs text-green-600">▲ 15% vs গড়</p>
                                </div>
                                <div class="bg-blue-50 rounded-xl p-4 text-center">
                                    <p class="text-blue-600 text-sm">অর্ডার</p>
                                    <p class="text-2xl font-bold text-blue-700">${fakeData.orders}</p>
                                </div>
                                <div class="bg-purple-50 rounded-xl p-4 text-center">
                                    <p class="text-purple-600 text-sm">প্রফিট</p>
                                    <p class="text-2xl font-bold text-purple-700">৳${fakeData.profit}</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Fake Priority Actions -->
                        <div class="bg-white rounded-xl p-6 shadow-sm border mb-4">
                            <h2 class="text-lg font-bold text-gray-800 mb-4">🎯 আজকের করণীয় (${fakeData.tasks} টি কাজ)</h2>
                            
                            <div class="bg-red-50 border border-red-200 rounded-xl p-4 mb-3">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center">📞</div>
                                    <div>
                                        <p class="font-semibold text-red-700">Karim Uddin (VIP)</p>
                                        <p class="text-sm text-gray-600">01712-XXXXXX</p>
                                        <p class="text-xs text-red-600">⏰ 5 দিন দেরি হয়ে গেছে!</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center">📦</div>
                                    <div>
                                        <p class="font-semibold text-yellow-700">2 টি Pending Order</p>
                                        <p class="text-xs text-yellow-600">৩ দিনের বেশি সময় ধরে আটকে আছে</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Fake Monthly Progress -->
                        <div class="bg-white rounded-xl p-6 shadow-sm border">
                            <h2 class="text-lg font-bold text-gray-800 mb-4">📈 এই মাসের অগ্রগতি</h2>
                            <div class="h-4 bg-gray-100 rounded-full overflow-hidden">
                                <div class="bg-green-500 h-full rounded-full" style="width: 67%"></div>
                            </div>
                            <p class="text-sm text-gray-600 mt-2">৳67,500 / ৳100,000 (67%)</p>
                        </div>
                        
                    </div>
                    
                    <!-- OVERLAY: Upgrade CTA -->
                    <div class="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-xl">
                        <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center border-2 border-purple-200">
                            
                            <div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span class="text-4xl">☀️</span>
                            </div>
                            
                            <h3 class="text-2xl font-bold text-gray-800 mb-2">
                                Daily Business Briefing
                            </h3>
                            
                            <p class="text-gray-600 mb-4">
                                প্রতিদিন সকালে জানুন গতকাল কেমন গেল এবং আজ কী করতে হবে
                            </p>
                            
                            <div class="bg-purple-50 rounded-xl p-4 mb-6 text-left">
                                <p class="text-sm font-medium text-purple-800 mb-2">✨ ELITE তে যা পাবেন:</p>
                                <ul class="text-sm text-purple-700 space-y-1">
                                    <li>✅ গতকালের Revenue, Profit, Orders</li>
                                    <li>✅ আজ কোন VIP দের ফলো-আপ করবেন</li>
                                    <li>✅ Pending অর্ডার Alert</li>
                                    <li>✅ মাসিক Goal Progress Tracker</li>
                                    <li>✅ Day-wise Business Insight</li>
                                </ul>
                            </div>
                            
                            <!-- Loss Calculator Mini -->
                            <div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                                <p class="text-red-700 text-sm">
                                    ⚠️ <strong>প্রতিদিন 30+ মিনিট</strong> নষ্ট হচ্ছে ম্যানুয়ালি হিসাব করতে
                                </p>
                                <p class="text-red-600 text-xs mt-1">
                                    = মাসে <strong>15 ঘণ্টা</strong> সময় নষ্ট!
                                </p>
                            </div>
                            
                            <button onclick="DailyBriefing.showUpgradeModal()" 
                                    class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:opacity-90 transition shadow-lg">
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
        // Generate realistic-looking fake numbers
        return {
            revenue: (Math.floor(Math.random() * 15) + 5) + ',500',
            orders: Math.floor(Math.random() * 10) + 5,
            profit: (Math.floor(Math.random() * 8) + 2) + ',200',
            tasks: Math.floor(Math.random() * 4) + 2
        };
    },

    // ─────────────────────────────────────────────────────────────
    // MODAL: Show upgrade modal
    // ─────────────────────────────────────────────────────────────
    showUpgradeModal() {
        // Check if LuringSystem exists
        if (typeof LuringSystem !== 'undefined' && LuringSystem.showUpgradeModal) {
            LuringSystem.showUpgradeModal('daily_briefing', 'ELITE');
        } else {
            // Fallback modal
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
            modal.id = 'upgrade-modal';
            modal.innerHTML = `
                <div class="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
                    <span class="text-5xl">👑</span>
                    <h3 class="text-xl font-bold text-gray-800 mt-4">ELITE Plan এ আপগ্রেড করুন</h3>
                    <p class="text-gray-600 mt-2">Daily Briefing সহ সকল Premium ফিচার আনলক করুন</p>
                    
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
            
            // Close on backdrop click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.remove();
            });
        }
    },

    // ─────────────────────────────────────────────────────────────
    // MAIN: Render based on user tier
    // ─────────────────────────────────────────────────────────────
    async render() {
        // Check user tier
        const userTier = await this.getUserTier();
        
        if (userTier === 'ELITE') {
            await this.renderFullBriefing();
        } else {
            await this.renderTeaser();
        }
    },

    // ─────────────────────────────────────────────────────────────
    // HELPER: Get user tier from AppState or DB
    // ─────────────────────────────────────────────────────────────
    async getUserTier() {
        // First check AppState
        if (typeof AppState !== 'undefined' && AppState.userTier) {
            return AppState.userTier;
        }
        
        // Fallback: check database
        try {
            const session = await db.settings.get('user_session');
            if (session && session.value && session.value.tier) {
                return session.value.tier;
            }
        } catch (e) {
            console.error('Error getting user tier:', e);
        }
        
        // Default to STARTER (most restricted)
        return 'STARTER';
    },

    // ─────────────────────────────────────────────────────────────
    // DASHBOARD WIDGET: Mini version for dashboard
    // ─────────────────────────────────────────────────────────────
    async getDashboardWidget() {
        const userTier = await this.getUserTier();
        
        if (userTier === 'ELITE') {
            // Show real mini briefing
            const actions = await this.getTodayPriorityActions();
            const greeting = this.getGreeting();
            
            return `
                <div class="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="font-bold text-purple-800 flex items-center gap-2">
                            ${greeting.emoji} Daily Briefing
                        </h3>
                        <a href="#daily_briefing" class="text-purple-600 text-sm hover:underline">
                            বিস্তারিত →
                        </a>
                    </div>
                    
                    ${actions.length > 0 ? `
                        <div class="bg-white rounded-lg p-3 border border-purple-100">
                            <p class="text-sm text-gray-600">
                                <span class="font-medium text-purple-700">${actions.length} টি কাজ</span> আজ করতে হবে
                            </p>
                            <p class="text-xs text-gray-500 mt-1">
                                ${actions[0].type === 'reorder_due' 
                                    ? `📞 ${actions[0].customer?.name || 'Customer'} কে ফলো-আপ করুন` 
                                    : '📦 Pending অর্ডার চেক করুন'}
                            </p>
                        </div>
                    ` : `
                        <div class="bg-white rounded-lg p-3 border border-purple-100">
                            <p class="text-sm text-green-600">✅ আজ কোনো জরুরি কাজ নেই!</p>
                        </div>
                    `}
                </div>
            `;
        } else {
            // Show locked widget
            return `
                <div class="bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl p-4 border border-gray-200 relative overflow-hidden">
                    <div class="absolute top-2 right-2">
                        <span class="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">🔒 ELITE</span>
                    </div>
                    
                    <h3 class="font-bold text-gray-700 flex items-center gap-2">
                        ☀️ Daily Briefing
                    </h3>
                    
                    <div class="mt-3 filter blur-sm pointer-events-none">
                        <div class="bg-white rounded-lg p-3">
                            <p class="text-sm text-gray-400">3 টি কাজ আজ করতে হবে...</p>
                        </div>
                    </div>
                    
                    <button onclick="window.location.hash='#daily_briefing'" 
                            class="mt-3 w-full bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition">
                        Unlock করুন
                    </button>
                </div>
            `;
        }
    }

});