// ================================================
// revenuePrediction.js - Revenue Prediction System v1.0
// ================================================

const RevenuePrediction = (function() {
    'use strict';

    console.log('📈 RevenuePrediction: Loading...');

    // ============================================
    // CONFIGURATION
    // ============================================
    
    const CONFIG = {
        // How many months of history to analyze
        HISTORY_MONTHS: 6,
        
        // Minimum orders needed for prediction
        MIN_ORDERS: 5,
        
        // Seasonal factors (Bangladesh context)
        SEASONAL_FACTORS: {
            1: 0.9,   // January - Post Eid slump
            2: 0.85,  // February - Low season
            3: 1.0,   // March - Normal
            4: 1.15,  // April - Pohela Boishakh boost
            5: 1.1,   // May - Normal+
            6: 0.95,  // June - Monsoon start
            7: 0.9,   // July - Monsoon
            8: 0.95,  // August - Monsoon end
            9: 1.05,  // September - Pre-Eid
            10: 1.3,  // October - Eid ul Fitr (varies)
            11: 1.1,  // November - Post Eid
            12: 1.2   // December - Winter/Holiday
        },
        
        // Confidence thresholds
        CONFIDENCE: {
            HIGH: 80,
            MEDIUM: 60,
            LOW: 40
        }
    };

    // ============================================
    // DATA CACHE
    // ============================================
    
    let predictionCache = null;
    let lastCalculationTime = null;

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    // Get month name in Bangla
    function getMonthNameBangla(monthIndex) {
        const months = [
            'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল',
            'মে', 'জুন', 'জুলাই', 'আগস্ট',
            'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
        ];
        return months[monthIndex];
    }

    // Get month name in English
    function getMonthNameEnglish(monthIndex) {
        const months = [
            'January', 'February', 'March', 'April',
            'May', 'June', 'July', 'August',
            'September', 'October', 'November', 'December'
        ];
        return months[monthIndex];
    }

    // Format currency
    function formatCurrency(amount) {
        return '৳' + Math.round(amount).toLocaleString('en-IN');
    }

    // Get start of month
    function getStartOfMonth(date) {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    }

    // Get end of month
    function getEndOfMonth(date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    }

    // Add months to date
    function addMonths(date, months) {
        const result = new Date(date);
        result.setMonth(result.getMonth() + months);
        return result;
    }

    console.log('✅ RevenuePrediction: Part 1 loaded (Config & Utilities)');

    // ============================================
    // PART 2: CORE ANALYSIS FUNCTIONS
    // ============================================

    // Get monthly revenue from orders
    async function getMonthlyRevenue(monthsBack = 6) {
        try {
            const orders = await db.orders.toArray();
            const today = new Date();
            const monthlyData = [];

            for (let i = monthsBack - 1; i >= 0; i--) {
                const targetDate = addMonths(today, -i);
                const monthStart = getStartOfMonth(targetDate);
                const monthEnd = getEndOfMonth(targetDate);

                const monthOrders = orders.filter(order => {
                    const orderDate = new Date(order.date || order.createdAt);
                    return orderDate >= monthStart && orderDate <= monthEnd;
                });

                const revenue = monthOrders.reduce((sum, order) => {
                    return sum + (order.grandTotal || 0);
                }, 0);

                const profit = monthOrders.reduce((sum, order) => {
                    return sum + (order.netProfit || order.grandTotal * 0.3 || 0);
                }, 0);

                monthlyData.push({
                    month: targetDate.getMonth(),
                    year: targetDate.getFullYear(),
                    monthName: getMonthNameBangla(targetDate.getMonth()),
                    monthNameEn: getMonthNameEnglish(targetDate.getMonth()),
                    revenue: revenue,
                    profit: profit,
                    orderCount: monthOrders.length,
                    avgOrderValue: monthOrders.length > 0 ? revenue / monthOrders.length : 0
                });
            }

            return monthlyData;
        } catch (error) {
            console.error('❌ Error getting monthly revenue:', error);
            return [];
        }
    }

    // Get customer purchase patterns
    async function getCustomerPatterns() {
        try {
            const customers = await db.customers.toArray();
            const orders = await db.orders.toArray();

            const patterns = customers.map(customer => {
                const customerOrders = orders.filter(o => 
                    o.customerPhone === customer.phone || 
                    String(o.customerPhone) === String(customer.phone)
                );

                if (customerOrders.length === 0) {
                    return null;
                }

                // Sort by date
                customerOrders.sort((a, b) => 
                    new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt)
                );

                const lastOrder = customerOrders[customerOrders.length - 1];
                const lastOrderDate = new Date(lastOrder.date || lastOrder.createdAt);
                const daysSinceLastOrder = Math.floor(
                    (new Date() - lastOrderDate) / (1000 * 60 * 60 * 24)
                );

                // Calculate average order value
                const totalSpent = customerOrders.reduce((sum, o) => 
                    sum + (o.grandTotal || 0), 0
                );
                const avgOrderValue = totalSpent / customerOrders.length;

                // Calculate average days between orders
                let avgDaysBetween = 30; // Default
                if (customerOrders.length > 1) {
                    const firstOrderDate = new Date(customerOrders[0].date || customerOrders[0].createdAt);
                    const totalDays = Math.floor((lastOrderDate - firstOrderDate) / (1000 * 60 * 60 * 24));
                    avgDaysBetween = Math.max(1, Math.floor(totalDays / (customerOrders.length - 1)));
                }

                // Predict next order likelihood (0-100%)
                let orderLikelihood = 0;
                if (daysSinceLastOrder <= avgDaysBetween * 0.5) {
                    orderLikelihood = 30; // Recently ordered
                } else if (daysSinceLastOrder <= avgDaysBetween) {
                    orderLikelihood = 70; // Due soon
                } else if (daysSinceLastOrder <= avgDaysBetween * 1.5) {
                    orderLikelihood = 90; // Overdue
                } else {
                    orderLikelihood = 50; // At risk
                }

                return {
                    phone: customer.phone,
                    name: customer.name || 'Unknown',
                    totalOrders: customerOrders.length,
                    totalSpent: totalSpent,
                    avgOrderValue: avgOrderValue,
                    avgDaysBetween: avgDaysBetween,
                    daysSinceLastOrder: daysSinceLastOrder,
                    lastOrderDate: lastOrderDate,
                    orderLikelihood: orderLikelihood,
                    predictedNextValue: avgOrderValue * (orderLikelihood / 100)
                };
            }).filter(p => p !== null);

            // Sort by likelihood to order
            patterns.sort((a, b) => b.orderLikelihood - a.orderLikelihood);

            return patterns;
        } catch (error) {
            console.error('❌ Error getting customer patterns:', error);
            return [];
        }
    }

    // Calculate growth rate
    function calculateGrowthRate(monthlyData) {
        if (monthlyData.length < 2) return 0;

        const recentMonths = monthlyData.slice(-3);
        const olderMonths = monthlyData.slice(0, 3);

        const recentAvg = recentMonths.reduce((sum, m) => sum + m.revenue, 0) / recentMonths.length;
        const olderAvg = olderMonths.reduce((sum, m) => sum + m.revenue, 0) / olderMonths.length;

        if (olderAvg === 0) return 0;

        return ((recentAvg - olderAvg) / olderAvg) * 100;
    }

    console.log('✅ RevenuePrediction: Part 2 loaded (Core Analysis)');

    // ============================================
    // PART 3: PREDICTION ENGINE
    // ============================================

    // Main prediction function
    async function generatePredictions() {
        console.log('🔮 Generating revenue predictions...');

        try {
            // Get historical data
            const monthlyData = await getMonthlyRevenue(CONFIG.HISTORY_MONTHS);
            const customerPatterns = await getCustomerPatterns();

            if (monthlyData.length === 0) {
                return {
                    success: false,
                    message: 'পর্যাপ্ত ডেটা নেই',
                    predictions: null
                };
            }

            // Calculate base metrics
            const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
            const avgMonthlyRevenue = totalRevenue / monthlyData.length;
            const growthRate = calculateGrowthRate(monthlyData);

            // Get current month info
            const today = new Date();
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();

            // Predict next 3 months
            const futurePredictions = [];

            for (let i = 1; i <= 3; i++) {
                const futureDate = addMonths(today, i);
                const futureMonth = futureDate.getMonth();
                const futureYear = futureDate.getFullYear();

                // Base prediction from average
                let predicted = avgMonthlyRevenue;

                // Apply growth trend
                predicted = predicted * (1 + (growthRate / 100) * (i * 0.5));

                // Apply seasonal factor
                const seasonalFactor = CONFIG.SEASONAL_FACTORS[futureMonth + 1] || 1;
                predicted = predicted * seasonalFactor;

                // Calculate confidence based on data quality
                let confidence = 50; // Base confidence

                // More historical data = higher confidence
                confidence += Math.min(monthlyData.length * 5, 20);

                // Consistent revenue = higher confidence
                const revenueVariance = calculateVariance(monthlyData.map(m => m.revenue));
                const avgRevenue = avgMonthlyRevenue;
                const varianceRatio = avgRevenue > 0 ? revenueVariance / avgRevenue : 1;
                confidence -= Math.min(varianceRatio * 10, 20);

                // More customers = higher confidence
                confidence += Math.min(customerPatterns.length * 2, 15);

                // Cap confidence
                confidence = Math.max(20, Math.min(95, confidence));

                futurePredictions.push({
                    month: futureMonth,
                    year: futureYear,
                    monthName: getMonthNameBangla(futureMonth),
                    monthNameEn: getMonthNameEnglish(futureMonth),
                    predictedRevenue: Math.round(predicted),
                    confidence: Math.round(confidence),
                    seasonalFactor: seasonalFactor,
                    growthApplied: growthRate
                });
            }

            // Predict which customers will likely order
            const likelyBuyers = customerPatterns
                .filter(c => c.orderLikelihood >= 50)
                .slice(0, 10)
                .map(c => ({
                    name: c.name,
                    phone: c.phone,
                    likelihood: c.orderLikelihood,
                    expectedValue: Math.round(c.predictedNextValue),
                    daysSinceOrder: c.daysSinceLastOrder,
                    avgOrderValue: Math.round(c.avgOrderValue)
                }));

            // Calculate total predicted revenue for next month
            const nextMonthPrediction = futurePredictions[0];

            // Build result
            const result = {
                success: true,
                generatedAt: new Date().toISOString(),
                
                // Historical summary
                historical: {
                    monthsAnalyzed: monthlyData.length,
                    totalRevenue: Math.round(totalRevenue),
                    avgMonthlyRevenue: Math.round(avgMonthlyRevenue),
                    growthRate: Math.round(growthRate * 10) / 10,
                    monthlyData: monthlyData
                },

                // Next month prediction
                nextMonth: {
                    month: nextMonthPrediction.month,
                    year: nextMonthPrediction.year,
                    monthName: nextMonthPrediction.monthName,
                    predictedRevenue: nextMonthPrediction.predictedRevenue,
                    confidence: nextMonthPrediction.confidence,
                    range: {
                        low: Math.round(nextMonthPrediction.predictedRevenue * 0.8),
                        high: Math.round(nextMonthPrediction.predictedRevenue * 1.2)
                    }
                },

                // 3-month forecast
                forecast: futurePredictions,

                // Likely buyers
                likelyBuyers: likelyBuyers,
                totalLikelyBuyers: likelyBuyers.length,
                expectedFromLikelyBuyers: likelyBuyers.reduce((sum, b) => sum + b.expectedValue, 0),

                // Customer insights
                customerInsights: {
                    totalCustomers: customerPatterns.length,
                    activeCustomers: customerPatterns.filter(c => c.daysSinceLastOrder <= 30).length,
                    atRiskCustomers: customerPatterns.filter(c => c.daysSinceLastOrder > 60).length
                }
            };

            // Cache result
            predictionCache = result;
            lastCalculationTime = new Date();

            console.log('✅ Predictions generated successfully!');
            return result;

        } catch (error) {
            console.error('❌ Error generating predictions:', error);
            return {
                success: false,
                message: error.message,
                predictions: null
            };
        }
    }

    // Calculate variance for confidence scoring
    function calculateVariance(values) {
        if (values.length === 0) return 0;
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const squareDiffs = values.map(value => Math.pow(value - avg, 2));
        return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / values.length);
    }

    // Get cached predictions or generate new
    async function getPredictions(forceRefresh = false) {
        // Return cache if valid (less than 1 hour old)
        if (!forceRefresh && predictionCache && lastCalculationTime) {
            const cacheAge = (new Date() - lastCalculationTime) / (1000 * 60);
            if (cacheAge < 60) {
                console.log('📦 Using cached predictions');
                return predictionCache;
            }
        }

        return await generatePredictions();
    }

    console.log('✅ RevenuePrediction: Part 3 loaded (Prediction Engine)');

    // ============================================
    // PART 4: UI COMPONENTS
    // ============================================

    // Render main dashboard
    function renderDashboard(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Container not found:', containerId);
            return;
        }

        if (!data || !data.success) {
            container.innerHTML = renderEmptyState(data?.message || 'ডেটা লোড করতে সমস্যা হয়েছে');
            return;
        }

        container.innerHTML = `
            <div class="revenue-prediction-dashboard">
                
                <!-- Header Stats -->
                ${renderHeaderStats(data)}
                
                <!-- Next Month Prediction Card -->
                ${renderNextMonthCard(data.nextMonth)}
                
                <!-- 3-Month Forecast -->
                ${renderForecastSection(data.forecast)}
                
                <!-- Historical Chart -->
                ${renderHistoricalChart(data.historical)}
                
                <!-- Likely Buyers -->
                ${renderLikelyBuyers(data.likelyBuyers)}
                
                <!-- Customer Insights -->
                ${renderCustomerInsights(data.customerInsights)}
                
            </div>
        `;
    }

    // Render header stats
    function renderHeaderStats(data) {
        const growthColor = data.historical.growthRate >= 0 ? 'text-green-600' : 'text-red-600';
        const growthIcon = data.historical.growthRate >= 0 ? 'ph-trend-up' : 'ph-trend-down';
        const growthBg = data.historical.growthRate >= 0 ? 'bg-green-50' : 'bg-red-50';

        return `
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <!-- Avg Monthly Revenue -->
                <div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div class="flex items-center gap-2 mb-1">
                        <i class="ph ph-chart-line text-blue-500"></i>
                        <span class="text-xs text-blue-600 font-medium">গড় মাসিক</span>
                    </div>
                    <div class="text-xl font-bold text-blue-700">
                        ${formatCurrency(data.historical.avgMonthlyRevenue)}
                    </div>
                </div>

                <!-- Growth Rate -->
                <div class="${growthBg} rounded-xl p-4 border ${data.historical.growthRate >= 0 ? 'border-green-100' : 'border-red-100'}">
                    <div class="flex items-center gap-2 mb-1">
                        <i class="ph ${growthIcon} ${growthColor}"></i>
                        <span class="text-xs ${growthColor} font-medium">গ্রোথ রেট</span>
                    </div>
                    <div class="text-xl font-bold ${growthColor}">
                        ${data.historical.growthRate >= 0 ? '+' : ''}${data.historical.growthRate}%
                    </div>
                </div>

                <!-- Months Analyzed -->
                <div class="bg-purple-50 rounded-xl p-4 border border-purple-100">
                    <div class="flex items-center gap-2 mb-1">
                        <i class="ph ph-calendar text-purple-500"></i>
                        <span class="text-xs text-purple-600 font-medium">বিশ্লেষিত</span>
                    </div>
                    <div class="text-xl font-bold text-purple-700">
                        ${data.historical.monthsAnalyzed} মাস
                    </div>
                </div>

                <!-- Likely Buyers -->
                <div class="bg-orange-50 rounded-xl p-4 border border-orange-100">
                    <div class="flex items-center gap-2 mb-1">
                        <i class="ph ph-users text-orange-500"></i>
                        <span class="text-xs text-orange-600 font-medium">সম্ভাব্য ক্রেতা</span>
                    </div>
                    <div class="text-xl font-bold text-orange-700">
                        ${data.totalLikelyBuyers} জন
                    </div>
                </div>
            </div>
        `;
    }

    // Render next month prediction card
    function renderNextMonthCard(nextMonth) {
        const confidenceColor = nextMonth.confidence >= 70 ? 'text-green-600' : 
                               nextMonth.confidence >= 50 ? 'text-yellow-600' : 'text-red-600';
        const confidenceBg = nextMonth.confidence >= 70 ? 'bg-green-100' : 
                            nextMonth.confidence >= 50 ? 'bg-yellow-100' : 'bg-red-100';

        return `
            <div class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white mb-6 shadow-lg">
                <div class="flex items-start justify-between mb-4">
                    <div>
                        <h3 class="text-lg font-bold opacity-90">পরবর্তী মাসের পূর্বাভাস</h3>
                        <p class="text-indigo-200 text-sm">${nextMonth.monthName} ${nextMonth.year}</p>
                    </div>
                    <div class="${confidenceBg} ${confidenceColor} px-3 py-1 rounded-full text-sm font-bold">
                        ${nextMonth.confidence}% নিশ্চিত
                    </div>
                </div>

                <div class="text-4xl font-bold mb-2">
                    ${formatCurrency(nextMonth.predictedRevenue)}
                </div>

                <div class="flex items-center gap-4 text-sm text-indigo-200">
                    <span class="flex items-center gap-1">
                        <i class="ph ph-arrow-down"></i>
                        সর্বনিম্ন: ${formatCurrency(nextMonth.range.low)}
                    </span>
                    <span class="flex items-center gap-1">
                        <i class="ph ph-arrow-up"></i>
                        সর্বোচ্চ: ${formatCurrency(nextMonth.range.high)}
                    </span>
                </div>
            </div>
        `;
    }

    // Render 3-month forecast
    function renderForecastSection(forecast) {
        const forecastCards = forecast.map((month, index) => {
            const bgColors = ['bg-blue-50', 'bg-green-50', 'bg-purple-50'];
            const borderColors = ['border-blue-200', 'border-green-200', 'border-purple-200'];
            const textColors = ['text-blue-700', 'text-green-700', 'text-purple-700'];

            return `
                <div class="${bgColors[index]} rounded-xl p-4 border ${borderColors[index]}">
                    <div class="text-sm font-medium text-slate-600 mb-1">
                        ${month.monthName} ${month.year}
                    </div>
                    <div class="text-2xl font-bold ${textColors[index]}">
                        ${formatCurrency(month.predictedRevenue)}
                    </div>
                    <div class="flex items-center gap-2 mt-2">
                        <div class="flex-1 bg-white rounded-full h-2 overflow-hidden">
                            <div class="h-full bg-current opacity-50 rounded-full" 
                                 style="width: ${month.confidence}%"></div>
                        </div>
                        <span class="text-xs font-medium">${month.confidence}%</span>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="mb-6">
                <h3 class="font-bold text-slate-700 text-sm mb-3 uppercase tracking-wider flex items-center gap-2">
                    <i class="ph ph-calendar-blank text-lg"></i>
                    ৩ মাসের পূর্বাভাস
                </h3>
                <div class="grid grid-cols-3 gap-3">
                    ${forecastCards}
                </div>
            </div>
        `;
    }

    // Render historical chart (simple bar chart)
    function renderHistoricalChart(historical) {
        const maxRevenue = Math.max(...historical.monthlyData.map(m => m.revenue), 1);

        const bars = historical.monthlyData.map(month => {
            const heightPercent = (month.revenue / maxRevenue) * 100;
            return `
                <div class="flex flex-col items-center gap-1 flex-1">
                    <div class="text-xs font-bold text-slate-600">
                        ${formatCurrency(month.revenue)}
                    </div>
                    <div class="w-full bg-slate-100 rounded-t-lg relative" style="height: 120px;">
                        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500"
                             style="height: ${Math.max(heightPercent, 5)}%"></div>
                    </div>
                    <div class="text-xs text-slate-500 font-medium">
                        ${month.monthName.substring(0, 3)}
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="bg-white rounded-xl p-4 border border-slate-200 mb-6">
                <h3 class="font-bold text-slate-700 text-sm mb-4 uppercase tracking-wider flex items-center gap-2">
                    <i class="ph ph-chart-bar text-lg"></i>
                    বিগত মাসের রেভিনিউ
                </h3>
                <div class="flex items-end gap-2">
                    ${bars}
                </div>
            </div>
        `;
    }

    // Render likely buyers section
    function renderLikelyBuyers(likelyBuyers) {
        if (likelyBuyers.length === 0) {
            return `
                <div class="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 text-center">
                    <i class="ph ph-users text-3xl text-slate-300 mb-2"></i>
                    <p class="text-slate-500 text-sm">সম্ভাব্য ক্রেতার ডেটা নেই</p>
                </div>
            `;
        }

        const buyerCards = likelyBuyers.slice(0, 5).map(buyer => {
            const likelihoodColor = buyer.likelihood >= 70 ? 'bg-green-500' : 
                                   buyer.likelihood >= 50 ? 'bg-yellow-500' : 'bg-red-500';
            return `
                <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                        ${buyer.name.charAt(0)}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="font-semibold text-slate-800 truncate">${buyer.name}</div>
                        <div class="text-xs text-slate-500">${buyer.daysSinceOrder} দিন আগে কিনেছে</div>
                    </div>
                    <div class="text-right">
                        <div class="font-bold text-green-600">${formatCurrency(buyer.expectedValue)}</div>
                        <div class="flex items-center gap-1">
                            <div class="w-12 bg-slate-200 rounded-full h-1.5">
                                <div class="${likelihoodColor} h-1.5 rounded-full" style="width: ${buyer.likelihood}%"></div>
                            </div>
                            <span class="text-xs text-slate-500">${buyer.likelihood}%</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="bg-white rounded-xl p-4 border border-slate-200 mb-6">
                <h3 class="font-bold text-slate-700 text-sm mb-3 uppercase tracking-wider flex items-center gap-2">
                    <i class="ph ph-user-circle-plus text-lg"></i>
                    সম্ভাব্য ক্রেতা (এই মাসে কিনতে পারে)
                </h3>
                <div class="space-y-2">
                    ${buyerCards}
                </div>
            </div>
        `;
    }

    // Render customer insights
    function renderCustomerInsights(insights) {
        return `
            <div class="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-4 text-white">
                <h3 class="font-bold text-sm mb-3 uppercase tracking-wider flex items-center gap-2">
                    <i class="ph ph-lightbulb text-yellow-400 text-lg"></i>
                    কাস্টমার ইনসাইট
                </h3>
                <div class="grid grid-cols-3 gap-3">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-white">${insights.totalCustomers}</div>
                        <div class="text-xs text-slate-300">মোট কাস্টমার</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-green-400">${insights.activeCustomers}</div>
                        <div class="text-xs text-slate-300">সক্রিয় (৩০ দিন)</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-red-400">${insights.atRiskCustomers}</div>
                        <div class="text-xs text-slate-300">ঝুঁকিতে (৬০+ দিন)</div>
                    </div>
                </div>
            </div>
        `;
    }

    // Render empty state
    function renderEmptyState(message) {
        return `
            <div class="flex flex-col items-center justify-center py-12 text-center">
                <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <i class="ph ph-chart-line-down text-4xl text-slate-400"></i>
                </div>
                <h3 class="text-lg font-semibold text-slate-700 mb-2">পূর্বাভাস তৈরি করা যায়নি</h3>
                <p class="text-slate-500 mb-4">${message}</p>
                <p class="text-sm text-slate-400">আরও অর্ডার যোগ করুন, তাহলে আমরা ভবিষ্যৎ প্রেডিক্ট করতে পারব!</p>
            </div>
        `;
    }

    console.log('✅ RevenuePrediction: Part 4 loaded (UI Components)');

    // ============================================
    // PART 5: INTEGRATION & PUBLIC API
    // ============================================

    // Initialize and render dashboard
    async function init(containerId = 'revenue-prediction-container') {
        console.log('📈 RevenuePrediction: Initializing...');

        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-12">
                    <div class="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full mb-3"></div>
                    <p class="text-slate-500">পূর্বাভাস তৈরি করছি...</p>
                </div>
            `;
        }

        try {
            const predictions = await generatePredictions();
            renderDashboard(containerId, predictions);
            console.log('✅ RevenuePrediction: Dashboard rendered!');
            return predictions;
        } catch (error) {
            console.error('❌ RevenuePrediction init error:', error);
            if (container) {
                container.innerHTML = renderEmptyState('একটি সমস্যা হয়েছে: ' + error.message);
            }
            return null;
        }
    }

    // Refresh predictions
    async function refresh(containerId = 'revenue-prediction-container') {
        console.log('🔄 Refreshing predictions...');
        predictionCache = null;
        lastCalculationTime = null;
        return await init(containerId);
    }

    // Quick summary for dashboard widgets
    async function getQuickSummary() {
        const predictions = await getPredictions();
        
        if (!predictions || !predictions.success) {
            return {
                available: false,
                message: 'ডেটা নেই'
            };
        }

        return {
            available: true,
            nextMonthRevenue: predictions.nextMonth.predictedRevenue,
            nextMonthName: predictions.nextMonth.monthName,
            confidence: predictions.nextMonth.confidence,
            growthRate: predictions.historical.growthRate,
            likelyBuyers: predictions.totalLikelyBuyers
        };
    }

    // Show toast notification
    function showToast(message, type = 'info') {
        const existingToast = document.getElementById('revenue-toast');
        if (existingToast) existingToast.remove();

        const bgColor = type === 'success' ? 'bg-green-500' : 
                       type === 'error' ? 'bg-red-500' : 'bg-blue-500';

        const toast = document.createElement('div');
        toast.id = 'revenue-toast';
        toast.className = `fixed bottom-24 left-1/2 transform -translate-x-1/2 ${bgColor} text-white px-6 py-3 rounded-xl shadow-lg z-50`;
        toast.textContent = message;

        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    console.log('✅ RevenuePrediction: Part 5 loaded (Integration)');

       // ============================================
    // PUBLIC API
    // ============================================

    return {
        // Config
        CONFIG,

        // Utilities
        getMonthNameBangla,
        getMonthNameEnglish,
        formatCurrency,

        // Core functions
        getMonthlyRevenue,
        getCustomerPatterns,
        calculateGrowthRate,

        // Prediction functions
        generatePredictions,
        getPredictions,

        // UI functions
        renderDashboard,
        init,
        refresh,

        // Quick access
        getQuickSummary,

        // Helpers
        showToast
    };

})();

// Make globally available
window.RevenuePrediction = RevenuePrediction;

console.log('🎉 RevenuePrediction v1.0 fully loaded!');