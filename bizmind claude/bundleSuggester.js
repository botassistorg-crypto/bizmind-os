/**
 * ═══════════════════════════════════════════════════════════════
 * SMART BUNDLE SUGGESTER - ELITE FEATURE
 * BizMind GrowthOS
 * ═══════════════════════════════════════════════════════════════
 * Analyzes order history to find products frequently bought together
 * and suggests profitable bundles.
 * ═══════════════════════════════════════════════════════════════
 */

const BundleSuggester = {

    // ─────────────────────────────────────────────────────────────
    // HELPER: Format number with commas
    // ─────────────────────────────────────────────────────────────
    formatNumber(num) {
        if (!num || isNaN(num)) return '0';
        return Math.round(num).toLocaleString('en-IN');
    },

    // ─────────────────────────────────────────────────────────────
    // HELPER: Parse order items (handles string or array)
    // ─────────────────────────────────────────────────────────────
    parseOrderItems(items) {
        if (!items) return [];
        
        // If already array of objects
        if (Array.isArray(items)) {
            return items.map(item => ({
                sku: item.sku || item.name || 'Unknown',
                name: item.name || item.sku || 'Unknown',
                qty: item.qty || item.quantity || 1,
                price: item.price || item.sellingPrice || 0
            }));
        }
        
        // If string like "Honey (x2), Oil (x1)"
        if (typeof items === 'string') {
            const parsed = [];
            const parts = items.split(',');
            parts.forEach(part => {
                const match = part.trim().match(/(.+?)\s*\(x(\d+)\)/);
                if (match) {
                    parsed.push({ 
                        sku: match[1].trim(), 
                        name: match[1].trim(), 
                        qty: parseInt(match[2]), 
                        price: 0 
                    });
                } else if (part.trim()) {
                    parsed.push({ 
                        sku: part.trim(), 
                        name: part.trim(), 
                        qty: 1, 
                        price: 0 
                    });
                }
            });
            return parsed;
        }
        
        return [];
    },

    // ─────────────────────────────────────────────────────────────
    // CORE: Find products bought together
    // ─────────────────────────────────────────────────────────────
    async findProductPairs() {
        const pairCounts = {};
        
        try {
            const orders = await db.orders.toArray();
            
            // Analyze each order
            orders.forEach(order => {
                const items = this.parseOrderItems(order.items);
                
                // Need at least 2 items to form a pair
                if (items.length < 2) return;
                
                // Get unique product names/SKUs in this order
                const productNames = [...new Set(items.map(item => item.name || item.sku))];
                
                // Create pairs from products in same order
                for (let i = 0; i < productNames.length; i++) {
                    for (let j = i + 1; j < productNames.length; j++) {
                        // Sort alphabetically to avoid duplicates (A-B = B-A)
                        const pair = [productNames[i], productNames[j]].sort().join(' + ');
                        
                        if (!pairCounts[pair]) {
                            pairCounts[pair] = {
                                products: [productNames[i], productNames[j]].sort(),
                                count: 0,
                                orderIds: []
                            };
                        }
                        pairCounts[pair].count++;
                        pairCounts[pair].orderIds.push(order.orderId);
                    }
                }
            });
            
            // Convert to array and sort by count
            const pairs = Object.values(pairCounts)
                .filter(pair => pair.count >= 2) // At least 2 times together
                .sort((a, b) => b.count - a.count);
            
            return pairs;
            
        } catch (error) {
            console.error('Error finding product pairs:', error);
            return [];
        }
    },

    // ─────────────────────────────────────────────────────────────
    // CORE: Get product details from database
    // ─────────────────────────────────────────────────────────────
    async getProductDetails(productName) {
        try {
            const products = await db.products.toArray();
            
            // Find product by name or SKU (case-insensitive)
            const product = products.find(p => 
                (p.name && p.name.toLowerCase() === productName.toLowerCase()) ||
                (p.sku && p.sku.toLowerCase() === productName.toLowerCase())
            );
            
            if (product) {
                return {
                    name: product.name || product.sku,
                    sku: product.sku,
                    costPrice: parseFloat(product.costPrice) || 0,
                    sellingPrice: parseFloat(product.sellingPrice) || 0,
                    stock: parseInt(product.stock) || 0
                };
            }
            
            return null;
            
        } catch (error) {
            console.error('Error getting product details:', error);
            return null;
        }
    },

    // ─────────────────────────────────────────────────────────────
    // CORE: Calculate bundle pricing
    // ─────────────────────────────────────────────────────────────
    calculateBundlePricing(products, discountPercent = 10) {
        const totalCost = products.reduce((sum, p) => sum + (p.costPrice || 0), 0);
        const totalSellingPrice = products.reduce((sum, p) => sum + (p.sellingPrice || 0), 0);
        
        const discountAmount = totalSellingPrice * (discountPercent / 100);
        const bundlePrice = totalSellingPrice - discountAmount;
        const bundleProfit = bundlePrice - totalCost;
        const profitMargin = bundlePrice > 0 ? (bundleProfit / bundlePrice * 100) : 0;
        
        return {
            totalCost: totalCost,
            separatePrice: totalSellingPrice,
            discountPercent: discountPercent,
            discountAmount: discountAmount,
            bundlePrice: bundlePrice,
            bundleProfit: bundleProfit,
            profitMargin: profitMargin.toFixed(1),
            isProfitable: bundleProfit > 0 && profitMargin >= 15
        };
    },

    // ─────────────────────────────────────────────────────────────
    // CORE: Generate bundle suggestions
    // ─────────────────────────────────────────────────────────────
    async generateBundleSuggestions() {
        const suggestions = [];
        
        try {
            // Find product pairs
            const pairs = await this.findProductPairs();
            
            // Process top 10 pairs
            for (let i = 0; i < Math.min(pairs.length, 10); i++) {
                const pair = pairs[i];
                
                // Get product details for each product in pair
                const product1 = await this.getProductDetails(pair.products[0]);
                const product2 = await this.getProductDetails(pair.products[1]);
                
                // Skip if we can't find product details
                if (!product1 || !product2) continue;
                
                // Skip if no pricing info
                if (product1.sellingPrice <= 0 || product2.sellingPrice <= 0) continue;
                
                // Calculate bundle pricing at different discounts
                const products = [product1, product2];
                const pricing10 = this.calculateBundlePricing(products, 10);
                const pricing15 = this.calculateBundlePricing(products, 15);
                const pricing5 = this.calculateBundlePricing(products, 5);
                
                // Choose best discount that's still profitable
                let bestPricing = pricing10;
                if (pricing15.isProfitable) {
                    bestPricing = pricing15; // More attractive discount
                } else if (!pricing10.isProfitable && pricing5.isProfitable) {
                    bestPricing = pricing5; // Lower discount to stay profitable
                }
                
                // Generate bundle name
                const bundleName = this.generateBundleName(product1.name, product2.name);
                
                suggestions.push({
                    id: i + 1,
                    bundleName: bundleName,
                    products: products,
                    timesOrderedTogether: pair.count,
                    pricing: bestPricing,
                    confidence: this.calculateConfidence(pair.count),
                    message: this.generateBundleMessage(bundleName, products, bestPricing)
                });
            }
            
            // Sort by confidence (times ordered together)
            suggestions.sort((a, b) => b.timesOrderedTogether - a.timesOrderedTogether);
            
            return suggestions;
            
        } catch (error) {
            console.error('Error generating bundle suggestions:', error);
            return [];
        }
    },

    // ─────────────────────────────────────────────────────────────
    // HELPER: Generate bundle name
    // ─────────────────────────────────────────────────────────────
    generateBundleName(product1, product2) {
        // Simple name combinations
        const names = [
            `${product1} + ${product2} Pack`,
            `${product1.split(' ')[0]} & ${product2.split(' ')[0]} Bundle`,
            `Combo: ${product1.split(' ')[0]} + ${product2.split(' ')[0]}`
        ];
        return names[0]; // Use first option
    },

    // ─────────────────────────────────────────────────────────────
    // HELPER: Calculate confidence score
    // ─────────────────────────────────────────────────────────────
    calculateConfidence(count) {
        if (count >= 10) return { level: 'high', text: 'খুব জনপ্রিয়', color: 'green' };
        if (count >= 5) return { level: 'medium', text: 'জনপ্রিয়', color: 'yellow' };
        return { level: 'low', text: 'সম্ভাবনাময়', color: 'gray' };
    },

    // ─────────────────────────────────────────────────────────────
    // HELPER: Generate WhatsApp message for bundle
    // ─────────────────────────────────────────────────────────────
    generateBundleMessage(bundleName, products, pricing) {
        const productList = products.map(p => `• ${p.name}: ৳${this.formatNumber(p.sellingPrice)}`).join('\n');
        
        return `🎁 *স্পেশাল বান্ডেল অফার!*

${bundleName}

${productList}

━━━━━━━━━━━━━━━
আলাদা কিনলে: ৳${this.formatNumber(pricing.separatePrice)}
*বান্ডেলে মাত্র: ৳${this.formatNumber(pricing.bundlePrice)}*
━━━━━━━━━━━━━━━

🔥 *৳${this.formatNumber(pricing.discountAmount)} সেভ করুন!* (${pricing.discountPercent}% ছাড়)

⏰ সীমিত সময়ের অফার!
অর্ডার করতে রিপ্লাই দিন। 🛒`;
    },

    // ─────────────────────────────────────────────────────────────
    // CORE: Get summary statistics
    // ─────────────────────────────────────────────────────────────
    async getSummaryStats() {
        try {
            const orders = await db.orders.toArray();
            const products = await db.products.toArray();
            
            // Count orders with multiple items
            let multiItemOrders = 0;
            orders.forEach(order => {
                const items = this.parseOrderItems(order.items);
                if (items.length >= 2) multiItemOrders++;
            });
            
            const pairs = await this.findProductPairs();
            
            return {
                totalOrders: orders.length,
                multiItemOrders: multiItemOrders,
                multiItemPercent: orders.length > 0 ? ((multiItemOrders / orders.length) * 100).toFixed(0) : 0,
                totalProducts: products.length,
                bundleOpportunities: pairs.length,
                topPairCount: pairs.length > 0 ? pairs[0].count : 0
            };
            
        } catch (error) {
            console.error('Error getting summary stats:', error);
            return {
                totalOrders: 0,
                multiItemOrders: 0,
                multiItemPercent: 0,
                totalProducts: 0,
                bundleOpportunities: 0,
                topPairCount: 0
            };
        }
    }

};

// Make globally available
window.BundleSuggester = BundleSuggester;

/**
 * ═══════════════════════════════════════════════════════════════
 * SMART BUNDLE SUGGESTER - PART 2: UI RENDERING
 * ═══════════════════════════════════════════════════════════════
 */

Object.assign(BundleSuggester, {

    // ─────────────────────────────────────────────────────────────
    // MAIN: Render Full Page (ELITE ONLY)
    // ─────────────────────────────────────────────────────────────
    async renderFullPage() {
        let container = document.getElementById('main-content');
        
        if (!container) {
            container = document.getElementById('bundle-suggester-container');
        }
        
        if (!container) {
            await new Promise(resolve => setTimeout(resolve, 50));
            container = document.getElementById('main-content') 
                     || document.getElementById('bundle-suggester-container');
        }
        
        if (!container) {
            console.error('Container not found for Bundle Suggester');
            return;
        }
        
        // Show loading
        container.innerHTML = `
            <div class="flex items-center justify-center min-h-screen">
                <div class="text-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p class="text-gray-600">বান্ডেল সাজেশন তৈরি হচ্ছে...</p>
                </div>
            </div>
        `;
        
        // Fetch all data
        const [suggestions, stats] = await Promise.all([
            this.generateBundleSuggestions(),
            this.getSummaryStats()
        ]);
        
        // Build HTML
        container.innerHTML = `
            <div class="max-w-4xl mx-auto p-4 space-y-6 pb-24">
                
                <!-- Header -->
                ${this.renderHeader()}
                
                <!-- Summary Stats -->
                ${this.renderSummaryCard(stats)}
                
                <!-- Bundle Suggestions -->
                ${this.renderBundlesList(suggestions)}
                
                <!-- Tips Section -->
                ${this.renderTipsSection()}
                
                <!-- Action Footer -->
                ${this.renderActionFooter()}
                
            </div>
        `;
    },

    // ─────────────────────────────────────────────────────────────
    // RENDER: Header
    // ─────────────────────────────────────────────────────────────
    renderHeader() {
        return `
            <div class="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-bold flex items-center gap-2">
                            🎁 Smart Bundle Suggester
                        </h1>
                        <p class="text-white/80 mt-1">একসাথে বিক্রি করে বেশি আয় করুন</p>
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
    renderSummaryCard(stats) {
        return `
            <div class="bg-white rounded-2xl p-6 shadow-sm border">
                <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    📊 বান্ডেল সম্ভাবনা
                </h2>
                
                <div class="grid grid-cols-3 gap-4">
                    <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                        <p class="text-3xl font-bold text-blue-700">${stats.bundleOpportunities}</p>
                        <p class="text-xs text-blue-600 mt-1">বান্ডেল সুযোগ</p>
                    </div>
                    <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
                        <p class="text-3xl font-bold text-green-700">${stats.multiItemPercent}%</p>
                        <p class="text-xs text-green-600 mt-1">মাল্টি-আইটেম অর্ডার</p>
                    </div>
                    <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                        <p class="text-3xl font-bold text-purple-700">${stats.topPairCount}</p>
                        <p class="text-xs text-purple-600 mt-1">টপ পেয়ার কাউন্ট</p>
                    </div>
                </div>
                
                ${stats.bundleOpportunities > 0 ? `
                    <div class="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                        <p class="text-green-700 text-sm">
                            💡 <strong>${stats.bundleOpportunities} টি প্রোডাক্ট</strong> একসাথে বিক্রি হয়! বান্ডেল করলে Average Order Value বাড়বে।
                        </p>
                    </div>
                ` : `
                    <div class="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p class="text-yellow-700 text-sm">
                            ⚠️ বান্ডেল সাজেশনের জন্য আরো অর্ডার দরকার যেখানে একাধিক প্রোডাক্ট আছে।
                        </p>
                    </div>
                `}
            </div>
        `;
    },

    // ─────────────────────────────────────────────────────────────
    // RENDER: Bundles List
    // ─────────────────────────────────────────────────────────────
    renderBundlesList(suggestions) {
        if (suggestions.length === 0) {
            return `
                <div class="bg-white rounded-xl p-6 shadow-sm border">
                    <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                        🎁 বান্ডেল সাজেশন
                    </h2>
                    <div class="bg-gray-50 rounded-lg p-8 text-center">
                        <span class="text-5xl">📦</span>
                        <p class="text-gray-600 font-medium mt-4">এখনো বান্ডেল সাজেশন নেই</p>
                        <p class="text-gray-500 text-sm mt-2">
                            বান্ডেল সাজেশন পেতে অর্ডারে একাধিক প্রোডাক্ট থাকতে হবে।<br>
                            আরো অর্ডার হলে এখানে সাজেশন দেখাবে।
                        </p>
                    </div>
                </div>
            `;
        }
        
        const bundlesHTML = suggestions.map((bundle, index) => this.renderBundleCard(bundle, index)).join('');
        
        return `
            <div class="bg-white rounded-xl p-6 shadow-sm border">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
                        🎁 বান্ডেল সাজেশন
                    </h2>
                    <span class="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full">
                        ${suggestions.length} টি বান্ডেল
                    </span>
                </div>
                
                <div class="space-y-4">
                    ${bundlesHTML}
                </div>
            </div>
        `;
    },

    // ─────────────────────────────────────────────────────────────
    // RENDER: Single Bundle Card
    // ─────────────────────────────────────────────────────────────
    renderBundleCard(bundle, index) {
        const confidenceColors = {
            'green': 'bg-green-100 text-green-700 border-green-200',
            'yellow': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'gray': 'bg-gray-100 text-gray-700 border-gray-200'
        };
        
        const confidenceClass = confidenceColors[bundle.confidence.color] || confidenceColors.gray;
        const isProfitable = bundle.pricing.isProfitable;
        
        const productsHTML = bundle.products.map(p => `
            <div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span class="text-gray-700">${p.name}</span>
                <span class="text-gray-500">৳${this.formatNumber(p.sellingPrice)}</span>
            </div>
        `).join('');
        
        return `
            <div class="border-2 ${isProfitable ? 'border-green-200 bg-green-50/30' : 'border-gray-200 bg-gray-50/30'} rounded-xl p-5 transition-all hover:shadow-md">
                
                <!-- Bundle Header -->
                <div class="flex items-start justify-between mb-4">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="text-2xl">🎁</span>
                            <h3 class="font-bold text-gray-800">${bundle.bundleName}</h3>
                        </div>
                        <p class="text-sm text-gray-500 mt-1">
                            ${bundle.timesOrderedTogether} বার একসাথে অর্ডার হয়েছে
                        </p>
                    </div>
                    <span class="${confidenceClass} text-xs px-2 py-1 rounded-full border">
                        ${bundle.confidence.text}
                    </span>
                </div>
                
                <!-- Products -->
                <div class="bg-white rounded-lg p-3 mb-4">
                    ${productsHTML}
                </div>
                
                <!-- Pricing -->
                <div class="grid grid-cols-3 gap-3 mb-4">
                    <div class="bg-gray-100 rounded-lg p-3 text-center">
                        <p class="text-xs text-gray-500">আলাদা মূল্য</p>
                        <p class="text-lg font-bold text-gray-400 line-through">৳${this.formatNumber(bundle.pricing.separatePrice)}</p>
                    </div>
                    <div class="${isProfitable ? 'bg-green-100' : 'bg-yellow-100'} rounded-lg p-3 text-center">
                        <p class="text-xs ${isProfitable ? 'text-green-600' : 'text-yellow-600'}">বান্ডেল মূল্য</p>
                        <p class="text-lg font-bold ${isProfitable ? 'text-green-700' : 'text-yellow-700'}">৳${this.formatNumber(bundle.pricing.bundlePrice)}</p>
                    </div>
                    <div class="bg-purple-100 rounded-lg p-3 text-center">
                        <p class="text-xs text-purple-600">আপনার লাভ</p>
                        <p class="text-lg font-bold text-purple-700">৳${this.formatNumber(bundle.pricing.bundleProfit)}</p>
                    </div>
                </div>
                
                <!-- Profit Warning if Low -->
                ${!isProfitable ? `
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <p class="text-yellow-700 text-sm">
                            ⚠️ মার্জিন কম (${bundle.pricing.profitMargin}%)। ডিসকাউন্ট কমানো যেতে পারে।
                        </p>
                    </div>
                ` : `
                    <div class="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                        <p class="text-green-700 text-sm">
                            ✅ ভালো মার্জিন (${bundle.pricing.profitMargin}%)। এই বান্ডেল প্রমোট করুন!
                        </p>
                    </div>
                `}
                
                <!-- Actions -->
                <div class="flex gap-2">
                    <button onclick="BundleSuggester.copyMessage(${index})" 
                            class="flex-1 bg-green-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-700 transition flex items-center justify-center gap-2">
                        <i class="ph ph-copy"></i>
                        মেসেজ কপি করুন
                    </button>
                    <button onclick="BundleSuggester.shareWhatsApp(${index})" 
                            class="bg-green-100 text-green-700 py-3 px-4 rounded-xl font-medium hover:bg-green-200 transition">
                        <i class="ph ph-whatsapp-logo text-xl"></i>
                    </button>
                </div>
                
            </div>
        `;
    },

    // ─────────────────────────────────────────────────────────────
    // RENDER: Tips Section
    // ─────────────────────────────────────────────────────────────
    renderTipsSection() {
        return `
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                <h3 class="font-bold text-blue-800 mb-3 flex items-center gap-2">
                    💡 বান্ডেল বিক্রির টিপস
                </h3>
                <ul class="text-sm text-blue-700 space-y-2">
                    <li class="flex items-start gap-2">
                        <span>•</span>
                        <span>বান্ডেলে <strong>৫-১৫% ডিসকাউন্ট</strong> দিন - কাস্টমার আকৃষ্ট হবে</span>
                    </li>
                    <li class="flex items-start gap-2">
                        <span>•</span>
                        <span><strong>"সীমিত সময়"</strong> বললে দ্রুত অর্ডার আসে</span>
                    </li>
                    <li class="flex items-start gap-2">
                        <span>•</span>
                        <span>Slow-selling আইটেম <strong>Hot-seller এর সাথে</strong> বান্ডেল করুন</span>
                    </li>
                    <li class="flex items-start gap-2">
                        <span>•</span>
                        <span>বান্ডেলের একটা <strong>আকর্ষণীয় নাম</strong> দিন (যেমন: "হেলথ প্যাক")</span>
                    </li>
                </ul>
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
                        <p class="text-sm text-gray-700 mt-1">Products</p>
                    </button>
                    <button onclick="window.location.hash='#orders'" 
                            class="bg-white border border-gray-200 rounded-lg p-3 text-center hover:shadow-md transition">
                        <span class="text-2xl">🛒</span>
                        <p class="text-sm text-gray-700 mt-1">Orders</p>
                    </button>
                    <button onclick="BundleSuggester.refreshPage()" 
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
    // Store suggestions for actions
    // ─────────────────────────────────────────────────────────────
    currentSuggestions: [],

    // ─────────────────────────────────────────────────────────────
    // ACTION: Copy message to clipboard
    // ─────────────────────────────────────────────────────────────
    async copyMessage(index) {
        // Re-fetch suggestions if not stored
        if (!this.currentSuggestions || this.currentSuggestions.length === 0) {
            this.currentSuggestions = await this.generateBundleSuggestions();
        }
        
        const bundle = this.currentSuggestions[index];
        if (!bundle) {
            alert('বান্ডেল খুঁজে পাওয়া যায়নি');
            return;
        }
        
        navigator.clipboard.writeText(bundle.message).then(() => {
            // Show success feedback
            const btn = event.target.closest('button');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="ph ph-check"></i> কপি হয়েছে!';
            btn.classList.remove('bg-green-600');
            btn.classList.add('bg-green-700');
            
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.classList.remove('bg-green-700');
                btn.classList.add('bg-green-600');
            }, 2000);
        }).catch(err => {
            console.error('Copy failed:', err);
            alert('কপি করা যায়নি। ম্যানুয়ালি কপি করুন।');
        });
    },

    // ─────────────────────────────────────────────────────────────
    // ACTION: Share on WhatsApp
    // ─────────────────────────────────────────────────────────────
    async shareWhatsApp(index) {
        if (!this.currentSuggestions || this.currentSuggestions.length === 0) {
            this.currentSuggestions = await this.generateBundleSuggestions();
        }
        
        const bundle = this.currentSuggestions[index];
        if (!bundle) {
            alert('বান্ডেল খুঁজে পাওয়া যায়নি');
            return;
        }
        
        const encodedMessage = encodeURIComponent(bundle.message);
        window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    },

    // ─────────────────────────────────────────────────────────────
    // ACTION: Refresh page
    // ─────────────────────────────────────────────────────────────
    refreshPage() {
        this.currentSuggestions = [];
        this.renderFullPage();
    }

});

/**
 * ═══════════════════════════════════════════════════════════════
 * SMART BUNDLE SUGGESTER - PART 3: TEASER & INTEGRATION
 * ═══════════════════════════════════════════════════════════════
 */

Object.assign(BundleSuggester, {

    // ─────────────────────────────────────────────────────────────
    // TEASER: Blurred version for GROWTH/STARTER users
    // ─────────────────────────────────────────────────────────────
    async renderTeaser() {
        let container = document.getElementById('main-content');
        
        if (!container) {
            container = document.getElementById('bundle-suggester-container');
        }
        
        if (!container) {
            await new Promise(resolve => setTimeout(resolve, 50));
            container = document.getElementById('main-content') 
                     || document.getElementById('bundle-suggester-container');
        }
        
        if (!container) {
            console.error('Container not found for Bundle Suggester Teaser');
            return;
        }
        
        // Generate fake enticing data
        const fakeData = this.generateTeaserData();
        
        container.innerHTML = `
            <div class="max-w-4xl mx-auto p-4 space-y-6">
                
                <!-- Header (Real) -->
                <div class="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-2xl font-bold flex items-center gap-2">
                                🎁 Smart Bundle Suggester
                            </h1>
                            <p class="text-white/80 mt-1">একসাথে বিক্রি করে বেশি আয় করুন</p>
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
                        <div class="bg-white rounded-2xl p-6 shadow-sm border mb-4">
                            <h2 class="text-lg font-bold text-gray-800 mb-4">📊 বান্ডেল সম্ভাবনা</h2>
                            <div class="grid grid-cols-3 gap-4">
                                <div class="bg-blue-50 rounded-xl p-4 text-center">
                                    <p class="text-3xl font-bold text-blue-700">${fakeData.opportunities}</p>
                                    <p class="text-xs text-blue-600 mt-1">বান্ডেল সুযোগ</p>
                                </div>
                                <div class="bg-green-50 rounded-xl p-4 text-center">
                                    <p class="text-3xl font-bold text-green-700">${fakeData.multiItemPercent}%</p>
                                    <p class="text-xs text-green-600 mt-1">মাল্টি-আইটেম</p>
                                </div>
                                <div class="bg-purple-50 rounded-xl p-4 text-center">
                                    <p class="text-3xl font-bold text-purple-700">${fakeData.topPair}</p>
                                    <p class="text-xs text-purple-600 mt-1">টপ পেয়ার</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Fake Bundle Card 1 -->
                        <div class="bg-white rounded-xl p-5 shadow-sm border mb-4">
                            <div class="flex items-center gap-2 mb-3">
                                <span class="text-2xl">🎁</span>
                                <h3 class="font-bold text-gray-800">Premium Honey + Black Seed Oil Pack</h3>
                                <span class="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">খুব জনপ্রিয়</span>
                            </div>
                            
                            <div class="bg-gray-50 rounded-lg p-3 mb-3">
                                <div class="flex justify-between py-2 border-b">
                                    <span>Premium Honey 500ml</span>
                                    <span>৳550</span>
                                </div>
                                <div class="flex justify-between py-2">
                                    <span>Black Seed Oil 200ml</span>
                                    <span>৳450</span>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-3 gap-3 mb-3">
                                <div class="bg-gray-100 rounded-lg p-3 text-center">
                                    <p class="text-xs text-gray-500">আলাদা</p>
                                    <p class="text-lg font-bold text-gray-400 line-through">৳1,000</p>
                                </div>
                                <div class="bg-green-100 rounded-lg p-3 text-center">
                                    <p class="text-xs text-green-600">বান্ডেল</p>
                                    <p class="text-lg font-bold text-green-700">৳899</p>
                                </div>
                                <div class="bg-purple-100 rounded-lg p-3 text-center">
                                    <p class="text-xs text-purple-600">আপনার লাভ</p>
                                    <p class="text-lg font-bold text-purple-700">৳249</p>
                                </div>
                            </div>
                            
                            <button class="w-full bg-green-600 text-white py-3 rounded-xl">
                                মেসেজ কপি করুন
                            </button>
                        </div>
                        
                        <!-- Fake Bundle Card 2 -->
                        <div class="bg-white rounded-xl p-5 shadow-sm border">
                            <div class="flex items-center gap-2 mb-3">
                                <span class="text-2xl">🎁</span>
                                <h3 class="font-bold text-gray-800">Organic Ghee + Dates Combo</h3>
                                <span class="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">জনপ্রিয়</span>
                            </div>
                            
                            <div class="grid grid-cols-3 gap-3">
                                <div class="bg-gray-100 rounded-lg p-3 text-center">
                                    <p class="text-lg font-bold text-gray-400 line-through">৳850</p>
                                </div>
                                <div class="bg-green-100 rounded-lg p-3 text-center">
                                    <p class="text-lg font-bold text-green-700">৳765</p>
                                </div>
                                <div class="bg-purple-100 rounded-lg p-3 text-center">
                                    <p class="text-lg font-bold text-purple-700">৳185</p>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                    
                    <!-- OVERLAY: Upgrade CTA -->
                    <div class="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-xl">
                        <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center border-2 border-green-200">
                            
                            <div class="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span class="text-4xl">🎁</span>
                            </div>
                            
                            <h3 class="text-2xl font-bold text-gray-800 mb-2">
                                Smart Bundle Suggester
                            </h3>
                            
                            <p class="text-gray-600 mb-4">
                                কোন প্রোডাক্ট একসাথে বিক্রি হয় জানুন এবং বান্ডেল অফার তৈরি করুন
                            </p>
                            
                            <div class="bg-green-50 rounded-xl p-4 mb-6 text-left">
                                <p class="text-sm font-medium text-green-800 mb-2">✨ ELITE তে যা পাবেন:</p>
                                <ul class="text-sm text-green-700 space-y-1">
                                    <li>✅ কোন প্রোডাক্ট একসাথে বিক্রি হয়</li>
                                    <li>✅ অটো বান্ডেল প্রাইসিং</li>
                                    <li>✅ প্রফিট ক্যালকুলেশন</li>
                                    <li>✅ রেডি WhatsApp মেসেজ</li>
                                    <li>✅ বান্ডেল কনফিডেন্স স্কোর</li>
                                </ul>
                            </div>
                            
                            <!-- Potential Earnings -->
                            <div class="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                                <p class="text-green-700 text-sm">
                                    💰 বান্ডেল করলে <strong>Average Order Value ২৫-৪০%</strong> বাড়ে!
                                </p>
                                <p class="text-green-600 text-xs mt-1">
                                    = মাসে <strong>৳${fakeData.potentialEarning}+</strong> extra আয়!
                                </p>
                            </div>
                            
                            <button onclick="BundleSuggester.showUpgradeModal()" 
                                    class="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:opacity-90 transition shadow-lg">
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
            opportunities: Math.floor(Math.random() * 6) + 3,
            multiItemPercent: Math.floor(Math.random() * 25) + 20,
            topPair: Math.floor(Math.random() * 8) + 5,
            potentialEarning: (Math.floor(Math.random() * 5) + 3) + ',000'
        };
    },

    // ─────────────────────────────────────────────────────────────
    // MODAL: Show upgrade modal
    // ─────────────────────────────────────────────────────────────
    showUpgradeModal() {
        // Remove existing modal
        const existingModal = document.getElementById('upgrade-modal');
        if (existingModal) existingModal.remove();
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
        modal.id = 'upgrade-modal';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
                <span class="text-5xl">👑</span>
                <h3 class="text-xl font-bold text-gray-800 mt-4">ELITE Plan এ আপগ্রেড করুন</h3>
                <p class="text-gray-600 mt-2">Smart Bundle Suggester সহ সকল Premium ফিচার আনলক করুন</p>
                
                <div class="mt-6 space-y-3">
                    <a href="https://wa.me/8801700524647?text=আমি%20ELITE%20Plan%20নিতে%20চাই" 
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
        
        // Store suggestions for later use
        if (userTier === 'ELITE') {
            this.currentSuggestions = await this.generateBundleSuggestions();
            await this.renderFullPage();
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