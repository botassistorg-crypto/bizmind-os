// ================================================
// reorderPredictor.js - PART 1: Core Engine
// Smart Reorder Prediction System v1.0
// ================================================

const ReorderPredictor = (function() {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================
    
    const CONFIG = {
        // Default reorder cycles (in days) for common product categories
        DEFAULT_CYCLES: {
            'শ্যাম্পু': 30,
            'shampoo': 30,
            'সাবান': 20,
            'soap': 20,
            'তেল': 45,
            'oil': 45,
            'hair oil': 45,
            'ক্রিম': 30,
            'cream': 30,
            'face cream': 30,
            'লোশন': 25,
            'lotion': 25,
            'body lotion': 25,
            'ফেসওয়াশ': 35,
            'facewash': 35,
            'face wash': 35,
            'টুথপেস্ট': 30,
            'toothpaste': 30,
            'ডিটারজেন্ট': 25,
            'detergent': 25,
            'washing powder': 25,
            'ডায়াপার': 15,
            'diaper': 15,
            'diapers': 15,
            'বেবি ফুড': 14,
            'baby food': 14,
            'দুধ': 7,
            'milk': 7,
            'milk powder': 30,
            'চা': 30,
            'tea': 30,
            'কফি': 30,
            'coffee': 30,
            'মধু': 60,
            'honey': 60,
            'ভিটামিন': 30,
            'vitamin': 30,
            'vitamins': 30,
            'supplements': 30,
            'প্রোটিন': 30,
            'protein': 30,
            'মাস্ক': 14,
            'face mask': 14,
            'সানস্ক্রিন': 45,
            'sunscreen': 45,
            'পারফিউম': 60,
            'perfume': 60,
            'ডিওডোরেন্ট': 30,
            'deodorant': 30,
            'রেজার': 14,
            'razor': 14,
            'razors': 14,
            'sanitary pad': 30,
            'স্যানিটারি প্যাড': 30,
            'contact lens': 30,
            'lens solution': 45,
            'pet food': 30,
            'cat food': 30,
            'dog food': 30,
            'fish food': 30
        },
        
        // Minimum orders needed to calculate pattern
        MIN_ORDERS_FOR_PATTERN: 2,
        
        // Days before predicted reorder to trigger alert
        ALERT_WINDOW_DAYS: 7,
        
        // Maximum days to look back for analysis
        MAX_HISTORY_DAYS: 365,
        
        // Confidence thresholds
        CONFIDENCE: {
            HIGH: 0.8,      // 80%+ confidence
            MEDIUM: 0.5,    // 50-80% confidence
            LOW: 0.3        // 30-50% confidence
        }
    };

    // ============================================
    // DATA STORAGE
    // ============================================
    
    let predictionsCache = [];
    let productCyclesCache = {};
    let lastAnalysisTime = null;

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    
    function daysBetween(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    function addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    function formatDate(date) {
        return new Date(date).toLocaleDateString('bn-BD', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function formatDateEN(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function getProductCategory(productName) {
        const name = productName.toLowerCase();
        for (const [keyword, cycle] of Object.entries(CONFIG.DEFAULT_CYCLES)) {
            if (name.includes(keyword)) {
                return { keyword, defaultCycle: cycle };
            }
        }
        return null;
    }

    function calculateStandardDeviation(values) {
        if (values.length < 2) return 0;
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const squareDiffs = values.map(value => Math.pow(value - avg, 2));
        const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
        return Math.sqrt(avgSquareDiff);
    }

    // ============================================
    // CORE ANALYSIS FUNCTIONS
    // ============================================

    /**
     * Analyze all orders and build purchase patterns
     */
    async function analyzeOrderHistory() {
        console.log('🔍 ReorderPredictor: Starting order analysis...');
        
        try {
            // Get all orders from database
            const orders = await db.orders.toArray();
            const customers = await db.customers.toArray();
            
            if (!orders || orders.length === 0) {
                console.log('⚠️ No orders found for analysis');
                return { success: false, message: 'অর্ডার পাওয়া যায়নি' };
            }

                        // Build customer-product purchase map
            const purchaseMap = this.buildPurchaseMap(orders);
            
            // Calculate reorder cycles for each customer-product pair
            const patterns = this.calculatePurchasePatterns(purchaseMap);
            
            // Generate predictions
            const predictions = this.generatePredictions(patterns, customers);
            
            // Cache results
            predictionsCache = predictions;
            lastAnalysisTime = new Date();
            
            console.log(`✅ Analysis complete: ${predictions.length} predictions generated`);
            
            return {
                success: true,
                predictions: predictions,
                analyzedOrders: orders.length,
                analyzedCustomers: Object.keys(purchaseMap).length
            };

        } catch (error) {
            console.error('❌ Error analyzing orders:', error);
            return { success: false, message: error.message };
        }
    }

    /**
     * Build a map of customer purchases by product
     */
    function buildPurchaseMap(orders) {
        const purchaseMap = {};
        
        orders.forEach(order => {
            if (!order.customerPhone || !order.items) return;
            
            const customerKey = order.customerPhone;
            if (!purchaseMap[customerKey]) {
                purchaseMap[customerKey] = {};
            }
            
            // Handle different item structures
            const items = Array.isArray(order.items) ? order.items : [];
            
            items.forEach(item => {
                const productName = item.name || item.productName || 'Unknown';
                const productKey = productName.toLowerCase().trim();
                
                if (!purchaseMap[customerKey][productKey]) {
                    purchaseMap[customerKey][productKey] = {
                        productName: productName,
                        purchases: [],
                        category: getProductCategory(productName)
                    };
                }
                
                purchaseMap[customerKey][productKey].purchases.push({
                    date: order.date || order.createdAt,
                    quantity: item.quantity || 1,
                    price: item.price || item.unitPrice || 0,
                    orderId: order.orderId || order.id
                });
            });
        });
        
        // Sort purchases by date for each customer-product pair
        Object.values(purchaseMap).forEach(customerData => {
            Object.values(customerData).forEach(productData => {
                productData.purchases.sort((a, b) => new Date(a.date) - new Date(b.date));
            });
        });
        
        return purchaseMap;
    }

    /**
     * Calculate purchase patterns from the purchase map
     */
    function calculatePurchasePatterns(purchaseMap) {
        const patterns = [];
        
        Object.entries(purchaseMap).forEach(([customerPhone, products]) => {
            Object.entries(products).forEach(([productKey, productData]) => {
                const purchases = productData.purchases;
                
                // Need at least 2 purchases to calculate a pattern
                if (purchases.length >= CONFIG.MIN_ORDERS_FOR_PATTERN) {
                    const intervals = [];
                    
                    for (let i = 1; i < purchases.length; i++) {
                        const days = daysBetween(purchases[i-1].date, purchases[i].date);
                        if (days > 0 && days < CONFIG.MAX_HISTORY_DAYS) {
                            intervals.push(days);
                        }
                    }
                    
                    if (intervals.length > 0) {
                        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
                        const stdDev = calculateStandardDeviation(intervals);
                        const lastPurchase = purchases[purchases.length - 1];
                        
                        // Calculate confidence based on consistency
                        const variationCoeff = stdDev / avgInterval;
                        let confidence = 1 - Math.min(variationCoeff, 1);
                        
                        // Boost confidence if matches known category
                        if (productData.category) {
                            const categoryMatch = Math.abs(avgInterval - productData.category.defaultCycle) / productData.category.defaultCycle;
                            if (categoryMatch < 0.3) {
                                confidence = Math.min(confidence + 0.2, 1);
                            }
                        }
                        
                        patterns.push({
                            customerPhone,
                            productName: productData.productName,
                            productKey,
                            avgInterval: Math.round(avgInterval),
                            stdDev: Math.round(stdDev * 10) / 10,
                            confidence: Math.round(confidence * 100) / 100,
                            purchaseCount: purchases.length,
                            lastPurchaseDate: lastPurchase.date,
                            lastQuantity: lastPurchase.quantity,
                            category: productData.category,
                            intervals: intervals
                        });
                    }
                }
                // Use default cycle for products with only 1 purchase but known category
                else if (purchases.length === 1 && productData.category) {
                    const lastPurchase = purchases[0];
                    patterns.push({
                        customerPhone,
                        productName: productData.productName,
                        productKey,
                        avgInterval: productData.category.defaultCycle,
                        stdDev: 0,
                        confidence: 0.4, // Lower confidence for estimated patterns
                        purchaseCount: 1,
                        lastPurchaseDate: lastPurchase.date,
                        lastQuantity: lastPurchase.quantity,
                        category: productData.category,
                        intervals: [],
                        isEstimated: true
                    });
                }
            });
        });
        
        return patterns;
    }

    /**
     * Generate predictions from patterns
     */
    function generatePredictions(patterns, customers) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const predictions = [];
        
        // Create customer lookup map
        const customerMap = {};
        customers.forEach(c => {
            customerMap[c.phone] = c;
        });
        
        patterns.forEach(pattern => {
            const lastPurchase = new Date(pattern.lastPurchaseDate);
            const predictedDate = addDays(lastPurchase, pattern.avgInterval);
            const daysSinceLastPurchase = daysBetween(lastPurchase, today);
            const daysUntilPredicted = daysBetween(today, predictedDate);
            
            // Determine status
            let status, urgency;
            
            if (predictedDate < today) {
                // Overdue
                const daysOverdue = daysBetween(predictedDate, today);
                status = 'overdue';
                urgency = daysOverdue > pattern.avgInterval * 0.5 ? 'critical' : 'high';
            } else if (daysUntilPredicted <= CONFIG.ALERT_WINDOW_DAYS) {
                // Due soon
                status = 'due_soon';
                urgency = daysUntilPredicted <= 3 ? 'high' : 'medium';
            } else if (daysUntilPredicted <= CONFIG.ALERT_WINDOW_DAYS * 2) {
                // Upcoming
                status = 'upcoming';
                urgency = 'low';
            } else {
                // Not due yet
                status = 'not_due';
                urgency = 'none';
            }
            
            // Only include actionable predictions
            if (status !== 'not_due' || pattern.confidence >= CONFIG.CONFIDENCE.HIGH) {
                const customer = customerMap[pattern.customerPhone] || {};
                
                predictions.push({
                    id: `${pattern.customerPhone}-${pattern.productKey}-${Date.now()}`,
                    customerPhone: pattern.customerPhone,
                    customerName: customer.name || 'Unknown',
                    customerTotalSpent: customer.totalSpent || 0,
                    productName: pattern.productName,
                    productKey: pattern.productKey,
                    avgInterval: pattern.avgInterval,
                    confidence: pattern.confidence,
                    confidenceLevel: pattern.confidence >= CONFIG.CONFIDENCE.HIGH ? 'high' :
                                    pattern.confidence >= CONFIG.CONFIDENCE.MEDIUM ? 'medium' : 'low',
                    purchaseCount: pattern.purchaseCount,
                    lastPurchaseDate: pattern.lastPurchaseDate,
                    predictedDate: predictedDate.toISOString(),
                    daysSinceLastPurchase,
                    daysUntilPredicted: predictedDate < today ? -daysBetween(predictedDate, today) : daysUntilPredicted,
                    status,
                    urgency,
                    isEstimated: pattern.isEstimated || false,
                    category: pattern.category
                });
            }
        });
        
        // Sort by urgency and predicted date
        predictions.sort((a, b) => {
            const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3, none: 4 };
            if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
                return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
            }
            return a.daysUntilPredicted - b.daysUntilPredicted;
        });
        
        return predictions;
    }

    // ============================================
    // PUBLIC API - PART 1
    // ============================================

    return {
        CONFIG,
        analyzeOrderHistory,
        buildPurchaseMap,
        calculatePurchasePatterns,
        generatePredictions,
        
        // Getters
        getPredictions: () => predictionsCache,
        getLastAnalysisTime: () => lastAnalysisTime,
        
        // Utilities exposed for other modules
        utils: {
            daysBetween,
            addDays,
            formatDate,
            formatDateEN,
            getProductCategory
        }
    };

})();

// Make available globally
window.ReorderPredictor = ReorderPredictor;

console.log('✅ ReorderPredictor PART 1 loaded: Core Engine');

// ================================================
// reorderPredictor.js - PART 2: Filters & Messages
// Smart Reorder Prediction System v1.0
// ================================================

(function() {
    'use strict';

    // ============================================
    // FILTERING FUNCTIONS
    // ============================================

    /**
     * Get predictions filtered by status
     */
    ReorderPredictor.getFilteredPredictions = function(filters = {}) {
        let predictions = [...this.getPredictions()];
        
        // Filter by status
        if (filters.status && filters.status !== 'all') {
            predictions = predictions.filter(p => p.status === filters.status);
        }
        
        // Filter by urgency
        if (filters.urgency && filters.urgency !== 'all') {
            predictions = predictions.filter(p => p.urgency === filters.urgency);
        }
        
        // Filter by confidence level
        if (filters.confidenceLevel && filters.confidenceLevel !== 'all') {
            predictions = predictions.filter(p => p.confidenceLevel === filters.confidenceLevel);
        }
        
        // Filter by customer
        if (filters.customerPhone) {
            predictions = predictions.filter(p => p.customerPhone === filters.customerPhone);
        }
        
        // Filter by product
        if (filters.productName) {
            const searchTerm = filters.productName.toLowerCase();
            predictions = predictions.filter(p => 
                p.productName.toLowerCase().includes(searchTerm)
            );
        }
        
        // Filter by minimum confidence
        if (filters.minConfidence) {
            predictions = predictions.filter(p => p.confidence >= filters.minConfidence);
        }
        
        // Limit results
        if (filters.limit) {
            predictions = predictions.slice(0, filters.limit);
        }
        
        return predictions;
    };

    /**
     * Get summary statistics
     */
    ReorderPredictor.getStats = function() {
        const predictions = this.getPredictions();
        
        const stats = {
            total: predictions.length,
            byStatus: {
                overdue: 0,
                due_soon: 0,
                upcoming: 0,
                not_due: 0
            },
            byUrgency: {
                critical: 0,
                high: 0,
                medium: 0,
                low: 0,
                none: 0
            },
            byConfidence: {
                high: 0,
                medium: 0,
                low: 0
            },
            uniqueCustomers: new Set(),
            uniqueProducts: new Set(),
            avgConfidence: 0,
            potentialRevenue: 0
        };
        
        predictions.forEach(p => {
            stats.byStatus[p.status]++;
            stats.byUrgency[p.urgency]++;
            stats.byConfidence[p.confidenceLevel]++;
            stats.uniqueCustomers.add(p.customerPhone);
            stats.uniqueProducts.add(p.productKey);
            stats.avgConfidence += p.confidence;
        });
        
        stats.uniqueCustomers = stats.uniqueCustomers.size;
        stats.uniqueProducts = stats.uniqueProducts.size;
        stats.avgConfidence = predictions.length > 0 
            ? Math.round((stats.avgConfidence / predictions.length) * 100) 
            : 0;
        
        // Calculate actionable count
        stats.actionable = stats.byStatus.overdue + stats.byStatus.due_soon;
        
        return stats;
    };

    /**
     * Get top products needing reorder alerts
     */
    ReorderPredictor.getTopProducts = function(limit = 10) {
        const predictions = this.getFilteredPredictions({
            status: 'overdue'
        }).concat(this.getFilteredPredictions({
            status: 'due_soon'
        }));
        
        const productCounts = {};
        
        predictions.forEach(p => {
            if (!productCounts[p.productKey]) {
                productCounts[p.productKey] = {
                    productName: p.productName,
                    count: 0,
                    customers: []
                };
            }
            productCounts[p.productKey].count++;
            productCounts[p.productKey].customers.push(p.customerName);
        });
        
        return Object.values(productCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    };

    /**
     * Get customer reorder summary
     */
    ReorderPredictor.getCustomerSummary = function(customerPhone) {
        const predictions = this.getFilteredPredictions({ customerPhone });
        
        if (predictions.length === 0) {
            return null;
        }
        
        return {
            customerPhone,
            customerName: predictions[0].customerName,
            totalPredictions: predictions.length,
            overdue: predictions.filter(p => p.status === 'overdue').length,
            dueSoon: predictions.filter(p => p.status === 'due_soon').length,
            products: predictions.map(p => ({
                name: p.productName,
                status: p.status,
                daysUntil: p.daysUntilPredicted,
                confidence: p.confidence
            }))
        };
    };

    // ============================================
    // MESSAGE GENERATION
    // ============================================

    /**
     * Message templates for reorder reminders
     */
    ReorderPredictor.MESSAGE_TEMPLATES = {
        single_product_bangla: {
            name: 'Single Product (Bangla)',
            template: `আসসালামু আলাইকুম {customerName} ভাই/আপু! 🙏

আশা করি ভালো আছেন। আপনি গত {daysSince} দিন আগে আমাদের থেকে {productName} নিয়েছিলেন।

এতদিনে হয়তো শেষ হয়ে গেছে! 😊

🎁 এখনই অর্ডার করলে বিশেষ ছাড় পাবেন!

অর্ডার করতে রিপ্লাই দিন অথবা কল করুন।

ধন্যবাদ! 🙏
{businessName}`,
            variables: ['customerName', 'daysSince', 'productName', 'businessName']
        },
        
        single_product_english: {
            name: 'Single Product (English)',
            template: `Hi {customerName}! 👋

Hope you're doing well! You purchased {productName} from us {daysSince} days ago.

It might be time for a refill! 😊

🎁 Order now and get a special discount!

Reply to order or give us a call.

Thanks!
{businessName}`,
            variables: ['customerName', 'daysSince', 'productName', 'businessName']
        },
        
        multiple_products_bangla: {
            name: 'Multiple Products (Bangla)',
            template: `আসসালামু আলাইকুম {customerName} ভাই/আপু! 🙏

আপনার নিয়মিত ব্যবহৃত কিছু পণ্য শেষ হওয়ার সময় হয়েছে:

{productList}

🎁 সব একসাথে অর্ডার করলে ১০% ছাড়!

রিপ্লাই দিন অথবা কল করুন।

ধন্যবাদ! 🙏
{businessName}`,
            variables: ['customerName', 'productList', 'businessName']
        },
        
        urgent_reminder_bangla: {
            name: 'Urgent Reminder (Bangla)',
            template: `⚠️ {customerName} ভাই/আপু!

আপনার {productName} {daysOverdue} দিন আগেই শেষ হওয়ার কথা ছিল!

এখনই অর্ডার করুন, আজকেই ডেলিভারি পাবেন! 🚀

📞 কল করুন অথবা রিপ্লাই দিন।

{businessName}`,
            variables: ['customerName', 'productName', 'daysOverdue', 'businessName']
        },
        
        vip_customer_bangla: {
            name: 'VIP Customer (Bangla)',
            template: `🌟 প্রিয় {customerName}!

আপনি আমাদের বিশেষ কাস্টমার! 💝

আপনার {productName} রিফিল করার সময় হয়েছে।

✨ VIP হিসেবে আপনার জন্য বিশেষ অফার:
🎁 ১৫% ছাড় + ফ্রি ডেলিভারি!

এই অফার শুধু আপনার জন্য, আজকেই অর্ডার করুন!

{businessName}`,
            variables: ['customerName', 'productName', 'businessName']
        },
        
        gentle_reminder_bangla: {
            name: 'Gentle Reminder (Bangla)',
            template: `হ্যালো {customerName}! 😊

শুধু মনে করিয়ে দিতে চাইলাম - আপনার {productName} হয়তো শেষ হয়ে যাচ্ছে।

দরকার হলে জানাবেন, আমরা সব সময় আছি! 🙏

{businessName}`,
            variables: ['customerName', 'productName', 'businessName']
        }
    };

    /**
     * Generate WhatsApp message for a prediction
     */
    ReorderPredictor.generateMessage = function(prediction, templateKey = 'single_product_bangla', customData = {}) {
        const template = this.MESSAGE_TEMPLATES[templateKey];
        if (!template) {
            console.error('Template not found:', templateKey);
            return null;
        }
        
        // Prepare variables
        const variables = {
            customerName: prediction.customerName || 'Customer',
            productName: prediction.productName,
            daysSince: prediction.daysSinceLastPurchase,
            daysOverdue: Math.abs(prediction.daysUntilPredicted),
            businessName: customData.businessName || 'আমাদের শপ',
            productList: '',
            ...customData
        };
        
        // Replace variables in template
        let message = template.template;
        Object.entries(variables).forEach(([key, value]) => {
            message = message.replace(new RegExp(`{${key}}`, 'g'), value);
        });
        
        return {
            text: message,
            templateName: template.name,
            phone: prediction.customerPhone,
            whatsappUrl: `https://wa.me/88${prediction.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`
        };
    };

    /**
     * Generate bulk messages for multiple predictions
     */
    ReorderPredictor.generateBulkMessages = function(predictions, templateKey = 'single_product_bangla', customData = {}) {
        // Group predictions by customer
        const customerGroups = {};
        
        predictions.forEach(p => {
            if (!customerGroups[p.customerPhone]) {
                customerGroups[p.customerPhone] = {
                    customerPhone: p.customerPhone,
                    customerName: p.customerName,
                    predictions: []
                };
            }
            customerGroups[p.customerPhone].predictions.push(p);
        });
        
        const messages = [];
        
        Object.values(customerGroups).forEach(group => {
            if (group.predictions.length === 1) {
                // Single product message
                const msg = this.generateMessage(group.predictions[0], templateKey, customData);
                if (msg) messages.push(msg);
            } else {
                // Multiple products message
                const productList = group.predictions
                    .map(p => `• ${p.productName} (${p.daysSinceLastPurchase} দিন আগে কেনা)`)
                    .join('\n');
                
                const msg = this.generateMessage(group.predictions[0], 'multiple_products_bangla', {
                    ...customData,
                    productList
                });
                if (msg) messages.push(msg);
            }
        });
        
        return messages;
    };

    /**
     * Select appropriate template based on prediction
     */
    ReorderPredictor.selectBestTemplate = function(prediction, customerSegment = null) {
        // VIP customer
        if (customerSegment === 'vip' || prediction.customerTotalSpent > 50000) {
            return 'vip_customer_bangla';
        }
        
        // Urgent/Overdue
        if (prediction.status === 'overdue' && prediction.urgency === 'critical') {
            return 'urgent_reminder_bangla';
        }
        
        // High confidence prediction
        if (prediction.confidence >= 0.8) {
            return 'single_product_bangla';
        }
        
        // Low confidence - be gentle
        if (prediction.confidence < 0.5) {
            return 'gentle_reminder_bangla';
        }
        
        return 'single_product_bangla';
    };

    console.log('✅ ReorderPredictor PART 2 loaded: Filters & Messages');

})();

// ================================================
// reorderPredictor.js - PART 3: UI Components
// Smart Reorder Prediction System v1.0
// ================================================

(function() {
    'use strict';

    // ============================================
    // UI GENERATION
    // ============================================

    /**
     * Generate the main Reorder Predictor dashboard HTML
     */
    ReorderPredictor.renderDashboard = function(containerId = 'reorder-predictor-container') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Container not found:', containerId);
            return;
        }

        const stats = this.getStats();
        const predictions = this.getFilteredPredictions({ limit: 50 });

        container.innerHTML = `
            <div class="reorder-predictor-dashboard">
                <!-- Header -->
                <div class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-xl mb-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="text-2xl font-bold flex items-center gap-2">
                                <i class="ph ph-arrows-clockwise text-3xl"></i>
                                স্মার্ট রিঅর্ডার প্রেডিক্টর
                            </h2>
                            <p class="text-purple-100 mt-1">কোন কাস্টমার কোন প্রোডাক্ট আবার কিনবে - AI দিয়ে জানুন</p>
                        </div>
                        <button onclick="ReorderPredictor.refreshAnalysis()" 
                                class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-all">
                            <i class="ph ph-arrows-clockwise"></i>
                            রিফ্রেশ করুন
                        </button>
                    </div>
                </div>

                <!-- Stats Cards -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    ${this.renderStatsCards(stats)}
                </div>

                <!-- Filters -->
                <div class="bg-white rounded-xl p-4 mb-6 shadow-sm border">
                    <div class="flex flex-wrap gap-4 items-center">
                        <div class="flex items-center gap-2">
                            <i class="ph ph-funnel text-gray-500"></i>
                            <span class="font-medium text-gray-700">ফিল্টার:</span>
                        </div>
                        
                        <select id="reorder-filter-status" onchange="ReorderPredictor.applyFilters()"
                                class="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500">
                            <option value="all">সব স্ট্যাটাস</option>
                            <option value="overdue">⚠️ ওভারডিউ</option>
                            <option value="due_soon">🔔 শীঘ্রই দরকার</option>
                            <option value="upcoming">📅 আপকামিং</option>
                        </select>

                        <select id="reorder-filter-urgency" onchange="ReorderPredictor.applyFilters()"
                                class="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500">
                            <option value="all">সব আর্জেন্সি</option>
                            <option value="critical">🔴 ক্রিটিক্যাল</option>
                            <option value="high">🟠 হাই</option>
                            <option value="medium">🟡 মিডিয়াম</option>
                            <option value="low">🟢 লো</option>
                        </select>

                        <select id="reorder-filter-confidence" onchange="ReorderPredictor.applyFilters()"
                                class="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500">
                            <option value="all">সব কনফিডেন্স</option>
                            <option value="high">🎯 হাই (80%+)</option>
                            <option value="medium">📊 মিডিয়াম (50-80%)</option>
                            <option value="low">❓ লো (30-50%)</option>
                        </select>

                        <input type="text" id="reorder-filter-search" 
                               placeholder="🔍 প্রোডাক্ট বা কাস্টমার খুঁজুন..."
                               onkeyup="ReorderPredictor.applyFilters()"
                               class="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px] focus:ring-2 focus:ring-purple-500">
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-wrap gap-3 mb-6">
                    <button onclick="ReorderPredictor.sendBulkReminders('overdue')"
                            class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all">
                        <i class="ph ph-warning"></i>
                        ওভারডিউ রিমাইন্ডার পাঠান (${stats.byStatus.overdue})
                    </button>
                    
                    <button onclick="ReorderPredictor.sendBulkReminders('due_soon')"
                            class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all">
                        <i class="ph ph-bell-ringing"></i>
                        শীঘ্রই দরকার রিমাইন্ডার (${stats.byStatus.due_soon})
                    </button>
                    
                    <button onclick="ReorderPredictor.exportPredictions()"
                            class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all">
                        <i class="ph ph-download"></i>
                        এক্সপোর্ট করুন
                    </button>
                </div>

                <!-- Predictions List -->
                <div class="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div class="p-4 border-b bg-gray-50">
                        <h3 class="font-semibold text-gray-800 flex items-center gap-2">
                            <i class="ph ph-list-bullets"></i>
                            রিঅর্ডার প্রেডিকশন লিস্ট
                            <span class="text-sm font-normal text-gray-500">(${predictions.length} টি)</span>
                        </h3>
                    </div>
                    
                    <div id="predictions-list" class="divide-y max-h-[600px] overflow-y-auto">
                        ${predictions.length > 0 
                            ? predictions.map(p => this.renderPredictionCard(p)).join('')
                            : this.renderEmptyState()
                        }
                    </div>
                </div>

                <!-- Top Products Section -->
                <div class="mt-6 bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div class="p-4 border-b bg-gray-50">
                        <h3 class="font-semibold text-gray-800 flex items-center gap-2">
                            <i class="ph ph-chart-bar"></i>
                            টপ রিঅর্ডার প্রোডাক্ট
                        </h3>
                    </div>
                    <div class="p-4">
                        ${this.renderTopProducts()}
                    </div>
                </div>
            </div>
        `;
    };

    /**
     * Render stats cards
     */
    ReorderPredictor.renderStatsCards = function(stats) {
        const cards = [
            {
                icon: 'ph-warning-circle',
                label: 'ওভারডিউ',
                value: stats.byStatus.overdue,
                color: 'red',
                bgColor: 'bg-red-50',
                textColor: 'text-red-600',
                iconColor: 'text-red-500'
            },
            {
                icon: 'ph-bell-ringing',
                label: 'শীঘ্রই দরকার',
                value: stats.byStatus.due_soon,
                color: 'orange',
                bgColor: 'bg-orange-50',
                textColor: 'text-orange-600',
                iconColor: 'text-orange-500'
            },
            {
                icon: 'ph-users',
                label: 'ইউনিক কাস্টমার',
                value: stats.uniqueCustomers,
                color: 'blue',
                bgColor: 'bg-blue-50',
                textColor: 'text-blue-600',
                iconColor: 'text-blue-500'
            },
            {
                icon: 'ph-target',
                label: 'গড় কনফিডেন্স',
                value: stats.avgConfidence + '%',
                color: 'green',
                bgColor: 'bg-green-50',
                textColor: 'text-green-600',
                iconColor: 'text-green-500'
            }
        ];

        return cards.map(card => `
            <div class="${card.bgColor} rounded-xl p-4 border border-${card.color}-100">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <i class="ph ${card.icon} text-2xl ${card.iconColor}"></i>
                    </div>
                    <div>
                        <div class="text-2xl font-bold ${card.textColor}">${card.value}</div>
                        <div class="text-sm text-gray-600">${card.label}</div>
                    </div>
                </div>
            </div>
        `).join('');
    };

    /**
     * Render a single prediction card
     */
    ReorderPredictor.renderPredictionCard = function(prediction) {
        const statusConfig = {
            overdue: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-500', text: 'ওভারডিউ' },
            due_soon: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-500', text: 'শীঘ্রই দরকার' },
            upcoming: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-500', text: 'আপকামিং' },
            not_due: { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-500', text: 'পরে দরকার' }
        };

        const urgencyIcons = {
            critical: '🔴',
            high: '🟠',
            medium: '🟡',
            low: '🟢',
            none: '⚪'
        };

        const config = statusConfig[prediction.status] || statusConfig.not_due;
        const confidenceColor = prediction.confidence >= 0.8 ? 'text-green-600' : 
                               prediction.confidence >= 0.5 ? 'text-yellow-600' : 'text-gray-500';

        return `
            <div class="p-4 hover:bg-gray-50 transition-all ${config.bg} border-l-4 ${config.border}" 
                 data-phone="${prediction.customerPhone}" 
                 data-product="${prediction.productKey}"
                 data-status="${prediction.status}"
                 data-urgency="${prediction.urgency}"
                 data-confidence="${prediction.confidenceLevel}">
                <div class="flex items-start justify-between gap-4">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="text-lg">${urgencyIcons[prediction.urgency]}</span>
                            <h4 class="font-semibold text-gray-800">${prediction.customerName}</h4>
                            <span class="text-sm text-gray-500">(${prediction.customerPhone})</span>
                            <span class="${config.badge} text-white text-xs px-2 py-0.5 rounded-full">
                                ${config.text}
                            </span>
                        </div>
                        
                        <div class="flex flex-wrap items-center gap-3 text-sm">
                            <span class="flex items-center gap-1 bg-white px-2 py-1 rounded border">
                                <i class="ph ph-package text-purple-500"></i>
                                <strong>${prediction.productName}</strong>
                            </span>
                            
                            <span class="text-gray-600">
                                <i class="ph ph-calendar-blank"></i>
                                শেষ কেনা: ${this.utils.formatDate(prediction.lastPurchaseDate)}
                            </span>
                            
                            <span class="text-gray-600">
                                <i class="ph ph-clock"></i>
                                ${prediction.daysSinceLastPurchase} দিন আগে
                            </span>
                            
                            <span class="${confidenceColor} font-medium">
                                <i class="ph ph-target"></i>
                                ${Math.round(prediction.confidence * 100)}% নিশ্চিত
                            </span>
                        </div>
                        
                        <div class="mt-2 text-sm text-gray-600">
                            <i class="ph ph-trend-up"></i>
                            গড় ${prediction.avgInterval} দিন পর কেনে
                            ${prediction.isEstimated ? '<span class="text-yellow-600">(অনুমান)</span>' : ''}
                            •
                            <span class="${prediction.daysUntilPredicted < 0 ? 'text-red-600 font-medium' : ''}">
                                ${prediction.daysUntilPredicted < 0 
                                    ? `${Math.abs(prediction.daysUntilPredicted)} দিন দেরি হয়ে গেছে!` 
                                    : `আরো ${prediction.daysUntilPredicted} দিন পর কিনতে পারে`
                                }
                            </span>
                        </div>
                    </div>
                    
                    <div class="flex flex-col gap-2">
                        <button onclick="ReorderPredictor.sendReminder('${prediction.customerPhone}', '${prediction.productKey}')"
                                class="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1 transition-all">
                            <i class="ph ph-whatsapp-logo"></i>
                            মেসেজ
                        </button>
                        <button onclick="ReorderPredictor.showCustomerHistory('${prediction.customerPhone}')"
                                class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm flex items-center gap-1 transition-all">
                            <i class="ph ph-clock-counter-clockwise"></i>
                            হিস্ট্রি
                        </button>
                    </div>
                </div>
            </div>
        `;
    };

    /**
     * Render top products needing reorders
     */
    ReorderPredictor.renderTopProducts = function() {
        const topProducts = this.getTopProducts(5);
        
        if (topProducts.length === 0) {
            return '<p class="text-gray-500 text-center py-4">কোনো ডেটা নেই</p>';
        }

        return `
            <div class="space-y-3">
                ${topProducts.map((product, index) => `
                    <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                            ${index + 1}
                        </div>
                        <div class="flex-1">
                            <div class="font-medium text-gray-800">${product.productName}</div>
                            <div class="text-sm text-gray-500">${product.count} জন কাস্টমারের দরকার</div>
                        </div>
                        <button onclick="ReorderPredictor.filterByProduct('${product.productName}')"
                                class="text-purple-600 hover:text-purple-700 text-sm font-medium">
                            দেখুন →
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    };

    /**
     * Render empty state
     */
    ReorderPredictor.renderEmptyState = function() {
        return `
            <div class="p-12 text-center">
                <div class="w-20 h-20 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                    <i class="ph ph-magnifying-glass text-4xl text-purple-500"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-700 mb-2">কোনো প্রেডিকশন নেই</h3>
                <p class="text-gray-500 mb-4">
                    প্রথমে কিছু অর্ডার যোগ করুন, তাহলে আমরা প্রেডিক্ট করতে পারবো।
                </p>
                <button onclick="ReorderPredictor.refreshAnalysis()"
                        class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-all">
                    <i class="ph ph-arrows-clockwise mr-2"></i>
                    আবার চেষ্টা করুন
                </button>
            </div>
        `;
    };

    console.log('✅ ReorderPredictor PART 3 loaded: UI Components');

})();

// ================================================
// reorderPredictor.js - PART 4: Actions & Integration
// Smart Reorder Prediction System v1.0
// ================================================

(function() {
    'use strict';

    // ============================================
    // USER ACTIONS
    // ============================================

    /**
     * Refresh the analysis
     */
    ReorderPredictor.refreshAnalysis = async function() {
        const container = document.getElementById('reorder-predictor-container');
        if (container) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center p-12">
                    <div class="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mb-4"></div>
                    <p class="text-gray-600">অর্ডার হিস্ট্রি অ্যানালাইজ করছি...</p>
                </div>
            `;
        }

        try {
            const result = await this.analyzeOrderHistory();
            
            if (result.success) {
                this.showToast(`✅ ${result.predictions.length} টি প্রেডিকশন তৈরি হয়েছে!`, 'success');
                this.renderDashboard();
            } else {
                this.showToast('❌ অ্যানালাইসিস ব্যর্থ: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Analysis error:', error);
            this.showToast('❌ একটি সমস্যা হয়েছে', 'error');
        }
    };

    /**
     * Apply filters from UI
     */
    ReorderPredictor.applyFilters = function() {
        const status = document.getElementById('reorder-filter-status')?.value || 'all';
        const urgency = document.getElementById('reorder-filter-urgency')?.value || 'all';
        const confidence = document.getElementById('reorder-filter-confidence')?.value || 'all';
        const search = document.getElementById('reorder-filter-search')?.value || '';

        const predictions = this.getFilteredPredictions({
            status: status !== 'all' ? status : undefined,
            urgency: urgency !== 'all' ? urgency : undefined,
            confidenceLevel: confidence !== 'all' ? confidence : undefined,
            productName: search || undefined
        });

        // Also filter by customer name
        let filtered = predictions;
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = predictions.filter(p => 
                p.customerName.toLowerCase().includes(searchLower) ||
                p.productName.toLowerCase().includes(searchLower) ||
                p.customerPhone.includes(search)
            );
        }

        const listContainer = document.getElementById('predictions-list');
        if (listContainer) {
            listContainer.innerHTML = filtered.length > 0
                ? filtered.map(p => this.renderPredictionCard(p)).join('')
                : `<div class="p-8 text-center text-gray-500">
                     <i class="ph ph-funnel-simple text-4xl mb-2"></i>
                     <p>এই ফিল্টারে কোনো রেজাল্ট নেই</p>
                   </div>`;
        }
    };

    /**
     * Filter by specific product
     */
    ReorderPredictor.filterByProduct = function(productName) {
        const searchInput = document.getElementById('reorder-filter-search');
        if (searchInput) {
            searchInput.value = productName;
            this.applyFilters();
        }
    };

    /**
     * Send reminder to a single customer
     */
    ReorderPredictor.sendReminder = function(customerPhone, productKey) {
        const predictions = this.getFilteredPredictions({ customerPhone });
        const prediction = predictions.find(p => p.productKey === productKey) || predictions[0];
        
        if (!prediction) {
            this.showToast('❌ প্রেডিকশন পাওয়া যায়নি', 'error');
            return;
        }

        // Show template picker modal
        this.showTemplatePickerModal(prediction);
    };

    /**
     * Show template picker modal
     */
    ReorderPredictor.showTemplatePickerModal = function(prediction) {
        const modalHtml = `
            <div id="reorder-template-modal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl">
                    <div class="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-bold flex items-center gap-2">
                                <i class="ph ph-whatsapp-logo text-2xl"></i>
                                রিমাইন্ডার মেসেজ
                            </h3>
                            <button onclick="ReorderPredictor.closeModal()" class="text-white/80 hover:text-white">
                                <i class="ph ph-x text-2xl"></i>
                            </button>
                        </div>
                        <p class="text-green-100 text-sm mt-1">
                            ${prediction.customerName} - ${prediction.productName}
                        </p>
                    </div>
                    
                    <div class="p-4 overflow-y-auto max-h-[60vh]">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">টেমপ্লেট সিলেক্ট করুন:</label>
                            <select id="reorder-template-select" onchange="ReorderPredictor.updatePreview('${prediction.customerPhone}', '${prediction.productKey}')"
                                    class="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500">
                                ${Object.entries(this.MESSAGE_TEMPLATES).map(([key, template]) => `
                                    <option value="${key}">${template.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">বিজনেস নাম:</label>
                            <input type="text" id="reorder-business-name" value="আমাদের শপ"
                                   class="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
                                   onkeyup="ReorderPredictor.updatePreview('${prediction.customerPhone}', '${prediction.productKey}')">
                        </div>
                        
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">মেসেজ প্রিভিউ:</label>
                            <div id="reorder-message-preview" class="bg-gray-50 border rounded-lg p-4 whitespace-pre-wrap text-sm">
                                ${this.generateMessage(prediction, 'single_product_bangla').text}
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">অথবা নিজে লিখুন:</label>
                            <textarea id="reorder-custom-message" rows="4" placeholder="আপনার নিজের মেসেজ লিখুন..."
                                      class="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"></textarea>
                        </div>
                    </div>
                    
                    <div class="p-4 border-t bg-gray-50 flex gap-3">
                        <button onclick="ReorderPredictor.closeModal()"
                                class="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-100 transition-all">
                            বাতিল
                        </button>
                        <button onclick="ReorderPredictor.openWhatsApp('${prediction.customerPhone}', '${prediction.productKey}')"
                                class="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all">
                            <i class="ph ph-whatsapp-logo"></i>
                            WhatsApp এ পাঠান
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    };

    /**
     * Update message preview
     */
    ReorderPredictor.updatePreview = function(customerPhone, productKey) {
        const predictions = this.getFilteredPredictions({ customerPhone });
        const prediction = predictions.find(p => p.productKey === productKey) || predictions[0];
        
        const templateKey = document.getElementById('reorder-template-select')?.value || 'single_product_bangla';
        const businessName = document.getElementById('reorder-business-name')?.value || 'আমাদের শপ';
        
        const message = this.generateMessage(prediction, templateKey, { businessName });
        
        const preview = document.getElementById('reorder-message-preview');
        if (preview && message) {
            preview.textContent = message.text;
        }
    };

    /**
     * Open WhatsApp with message
     */
    ReorderPredictor.openWhatsApp = function(customerPhone, productKey) {
        const customMessage = document.getElementById('reorder-custom-message')?.value;
        let messageText;
        
        if (customMessage && customMessage.trim()) {
            messageText = customMessage.trim();
        } else {
            messageText = document.getElementById('reorder-message-preview')?.textContent || '';
        }
        
        // Format phone number
        let phone = customerPhone.replace(/[^0-9]/g, '');
        if (!phone.startsWith('88')) {
            phone = '88' + phone;
        }
        
        // Create WhatsApp URL
        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`;
        
        // Log the campaign
        this.logCampaign({
            type: 'reorder_reminder',
            customerPhone,
            productKey,
            message: messageText,
            timestamp: new Date().toISOString()
        });
        
        // Open WhatsApp
        window.open(whatsappUrl, '_blank');
        
        // Close modal
        this.closeModal();
        
        this.showToast('✅ WhatsApp ওপেন হয়েছে!', 'success');
    };

    /**
     * Close modal
     */
    ReorderPredictor.closeModal = function() {
        const modal = document.getElementById('reorder-template-modal');
        if (modal) {
            modal.remove();
        }
    };

    /**
     * Send bulk reminders
     */
    ReorderPredictor.sendBulkReminders = async function(status) {
        const predictions = this.getFilteredPredictions({ status });
        
        if (predictions.length === 0) {
            this.showToast('⚠️ এই ক্যাটাগরিতে কোনো কাস্টমার নেই', 'warning');
            return;
        }

        const confirmHtml = `
            <div id="reorder-bulk-modal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl">
                    <div class="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-4 rounded-t-2xl">
                        <h3 class="text-lg font-bold flex items-center gap-2">
                            <i class="ph ph-users text-2xl"></i>
                            বাল্ক রিমাইন্ডার
                        </h3>
                    </div>
                    
                    <div class="p-6">
                        <div class="text-center mb-6">
                            <div class="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                                <i class="ph ph-whatsapp-logo text-3xl text-purple-600"></i>
                            </div>
                            <h4 class="text-xl font-semibold text-gray-800">
                                ${predictions.length} জন কাস্টমারকে মেসেজ পাঠাবেন?
                            </h4>
                            <p class="text-gray-500 mt-2">
                                একে একে WhatsApp ওপেন হবে, আপনি সেন্ড করবেন।
                            </p>
                        </div>
                        
                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                            <p class="text-yellow-700 text-sm flex items-start gap-2">
                                <i class="ph ph-info text-lg mt-0.5"></i>
                                প্রতিটি কাস্টমারের জন্য আলাদা WhatsApp উইন্ডো ওপেন হবে। প্রতিটি মেসেজ ম্যানুয়ালি সেন্ড করতে হবে।
                            </p>
                        </div>
                        
                        <div class="flex gap-3">
                            <button onclick="document.getElementById('reorder-bulk-modal').remove()"
                                    class="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-100 transition-all">
                                বাতিল
                            </button>
                            <button onclick="ReorderPredictor.executeBulkSend('${status}')"
                                    class="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-all">
                                শুরু করুন
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', confirmHtml);
    };

    /**
     * Execute bulk send
     */
    ReorderPredictor.executeBulkSend = async function(status) {
        document.getElementById('reorder-bulk-modal')?.remove();
        
        const predictions = this.getFilteredPredictions({ status });
        const messages = this.generateBulkMessages(predictions);
        
        // Show progress
        let currentIndex = 0;
        
        const showNext = () => {
            if (currentIndex >= messages.length) {
                this.showToast(`✅ ${messages.length} টি মেসেজ কমপ্লিট!`, 'success');
                return;
            }
            
            const message = messages[currentIndex];
            
            // Show progress modal
            const progressHtml = `
                <div id="reorder-progress-modal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6">
                        <div class="text-center mb-4">
                            <div class="text-4xl mb-2">📨</div>
                            <h4 class="text-lg font-semibold">${currentIndex + 1} / ${messages.length}</h4>
                            <p class="text-gray-500">${message.phone}</p>
                        </div>
                        
                        <div class="w-full bg-gray-200 rounded-full h-2 mb-6">
                            <div class="bg-purple-600 h-2 rounded-full transition-all" 
                                 style="width: ${((currentIndex + 1) / messages.length) * 100}%"></div>
                        </div>
                        
                        <div class="flex gap-3">
                            <button onclick="document.getElementById('reorder-progress-modal').remove()"
                                    class="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-100 transition-all">
                                থামুন
                            </button>
                            <button id="next-btn" class="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg transition-all">
                                <i class="ph ph-whatsapp-logo mr-2"></i>
                                WhatsApp ওপেন করুন
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', progressHtml);
            
            document.getElementById('next-btn').onclick = () => {
                window.open(message.whatsappUrl, '_blank');
                
                // Log campaign
                this.logCampaign({
                    type: 'bulk_reorder_reminder',
                    customerPhone: message.phone,
                    message: message.text,
                    batchIndex: currentIndex,
                    batchTotal: messages.length,
                    timestamp: new Date().toISOString()
                });
                
                document.getElementById('reorder-progress-modal')?.remove();
                currentIndex++;
                
                // Small delay before next
                setTimeout(showNext, 500);
            };
        };
        
        showNext();
    };

    /**
     * Show customer history
     */
    ReorderPredictor.showCustomerHistory = async function(customerPhone) {
        try {
            const orders = await db.orders.where('customerPhone').equals(customerPhone).toArray();
            const customer = await db.customers.where('phone').equals(customerPhone).first();
            
            const historyHtml = `
                <div id="reorder-history-modal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div class="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl">
                        <div class="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4">
                            <div class="flex items-center justify-between">
                                <h3 class="text-lg font-bold flex items-center gap-2">
                                    <i class="ph ph-clock-counter-clockwise text-2xl"></i>
                                    অর্ডার হিস্ট্রি
                                </h3>
                                <button onclick="document.getElementById('reorder-history-modal').remove()" 
                                        class="text-white/80 hover:text-white">
                                    <i class="ph ph-x text-2xl"></i>
                                </button>
                            </div>
                            <p class="text-blue-100 text-sm mt-1">
                                ${customer?.name || 'Unknown'} - ${customerPhone}
                            </p>
                        </div>
                        
                        <div class="p-4 overflow-y-auto max-h-[60vh]">
                            ${orders.length > 0 ? orders.sort((a, b) => new Date(b.date) - new Date(a.date)).map(order => `
                                <div class="border rounded-lg p-3 mb-3">
                                    <div class="flex justify-between items-start mb-2">
                                        <span class="text-sm text-gray-500">${this.utils.formatDate(order.date)}</span>
                                        <span class="font-semibold text-green-600">৳${order.grandTotal?.toLocaleString() || 0}</span>
                                    </div>
                                    <div class="text-sm text-gray-600">
                                        ${(order.items || []).map(item => `
                                            <div class="flex justify-between">
                                                <span>• ${item.name || item.productName}</span>
                                                <span class="text-gray-400">×${item.quantity || 1}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('') : '<p class="text-gray-500 text-center py-4">কোনো অর্ডার নেই</p>'}
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', historyHtml);
        } catch (error) {
            console.error('Error loading history:', error);
            this.showToast('❌ হিস্ট্রি লোড করতে সমস্যা হয়েছে', 'error');
        }
    };

    /**
     * Export predictions
     */
    ReorderPredictor.exportPredictions = function() {
        const predictions = this.getPredictions();
        
        if (predictions.length === 0) {
            this.showToast('⚠️ এক্সপোর্ট করার মতো ডেটা নেই', 'warning');
            return;
        }

        // Create CSV
        const headers = ['Customer Name', 'Phone', 'Product', 'Last Purchase', 'Days Since', 'Predicted Date', 'Status', 'Confidence'];
        const rows = predictions.map(p => [
            p.customerName,
            p.customerPhone,
            p.productName,
            this.utils.formatDateEN(p.lastPurchaseDate),
            p.daysSinceLastPurchase,
            this.utils.formatDateEN(p.predictedDate),
            p.status,
            Math.round(p.confidence * 100) + '%'
        ]);

        let csv = headers.join(',') + '\n';
        rows.forEach(row => {
            csv += row.map(cell => `"${cell}"`).join(',') + '\n';
        });

        // Download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `reorder_predictions_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        this.showToast('✅ CSV ডাউনলোড হয়েছে!', 'success');
    };

    /**
     * Log campaign for history
     */
    ReorderPredictor.logCampaign = async function(campaignData) {
        try {
            // Check if campaignHistory table exists
            if (typeof db !== 'undefined' && db.campaignHistory) {
                await db.campaignHistory.add({
                    ...campaignData,
                    id: Date.now(),
                    source: 'reorder_predictor'
                });
            }
            console.log('📊 Campaign logged:', campaignData);
        } catch (error) {
            console.log('Campaign logging skipped (table may not exist)');
        }
    };

    /**
     * Show toast notification
     */
    ReorderPredictor.showToast = function(message, type = 'info') {
        // Check if global toast function exists
        if (typeof showToast === 'function') {
            showToast(message, type);
            return;
        }

        // Fallback toast
        const toast = document.createElement('div');
        const bgColors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };
        
        toast.className = `fixed bottom-4 right-4 ${bgColors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.remove(), 3000);
    };

    // ============================================
    // INITIALIZATION
    // ============================================

    /**
     * Initialize the Reorder Predictor
     */
    ReorderPredictor.init = async function(containerId = 'reorder-predictor-container') {
        console.log('🚀 Initializing ReorderPredictor...');
        
        // Run initial analysis
        await this.refreshAnalysis();
        
        // Render dashboard
        this.renderDashboard(containerId);
        
        console.log('✅ ReorderPredictor initialized successfully!');
    };

    /**
     * Quick access function to add to navigation
     */
    ReorderPredictor.addToNavigation = function() {
        // This can be customized based on your app's navigation structure
        return {
            id: 'reorder-predictor',
            label: 'রিঅর্ডার প্রেডিক্টর',
            labelEn: 'Reorder Predictor',
            icon: 'ph-arrows-clockwise',
            onClick: () => {
                // Navigate to reorder predictor section
                if (typeof navigateTo === 'function') {
                    navigateTo('reorder-predictor');
                }
            }
        };
    };

    console.log('✅ ReorderPredictor PART 4 loaded: Actions & Integration');
    console.log('🎉 ReorderPredictor v1.0 fully loaded! Call ReorderPredictor.init() to start.');

})();