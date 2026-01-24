// ================================================
// productRecommendations.js - Product Recommendations v1.0
// "Customers who bought X also bought Y"
// ================================================

const ProductRecommendations = (function() {
    'use strict';

    console.log('🛍️ ProductRecommendations: Loading...');

    // ============================================
    // CONFIGURATION
    // ============================================

    const CONFIG = {
        // Minimum times products bought together to count
        MIN_PAIR_COUNT: 2,
        
        // Maximum recommendations to show
        MAX_RECOMMENDATIONS: 5,
        
        // Minimum confidence percentage to show
        MIN_CONFIDENCE: 10
    };

    // ============================================
    // DATA CACHE
    // ============================================

    let pairingsCache = null;
    let lastAnalysisTime = null;

    // ============================================
    // CORE ANALYSIS FUNCTIONS
    // ============================================

       // Analyze all orders to find product pairings
    async function analyzeProductPairings() {
        console.log('🔍 Analyzing product pairings...');

        try {
            const orders = await db.orders.toArray();
            const products = await db.products.toArray();
            
            if (!orders || orders.length === 0) {
                console.log('⚠️ No orders found');
                return { success: false, message: 'কোনো অর্ডার নেই' };
            }

            // Create SKU to product name map
            const skuToName = {};
            products.forEach(p => {
                if (p.sku && p.name) {
                    skuToName[p.sku.toUpperCase()] = p.name.toLowerCase().trim();
                }
            });

            console.log('📦 Products mapped:', Object.keys(skuToName).length);

            // Parse items string to get product names
            function parseItemsString(itemsStr) {
                if (!itemsStr || typeof itemsStr !== 'string') return [];
                
                const productNames = [];
                
                // Split by comma or other delimiters
                const parts = itemsStr.split(/[,;]+/).map(s => s.trim()).filter(s => s);
                
                parts.forEach(part => {
                    // Match patterns like "BG001 (x2)" or "BG001 x2" or just "BG001"
                    const match = part.match(/([A-Za-z0-9]+)/);
                    if (match) {
                        const sku = match[1].toUpperCase();
                        const productName = skuToName[sku];
                        if (productName) {
                            productNames.push(productName);
                        }
                    }
                });
                
                return productNames;
            }

            // Count how many times each product is bought
            const productCounts = {};
            
            // Count how many times each pair is bought together
            const pairCounts = {};

            orders.forEach(order => {
                let productNames = [];
                
                // Handle different item formats
                if (typeof order.items === 'string') {
                    productNames = parseItemsString(order.items);
                } else if (Array.isArray(order.items)) {
                    productNames = order.items.map(item => {
                        const name = item.name || item.productName || '';
                        return name.toLowerCase().trim();
                    }).filter(n => n);
                }
                
                if (productNames.length === 0) return;

                // Get unique product names
                const uniqueNames = [...new Set(productNames)];

                // Count individual products
                uniqueNames.forEach(name => {
                    productCounts[name] = (productCounts[name] || 0) + 1;
                });

                // Count pairs (if order has multiple products)
                if (uniqueNames.length >= 2) {
                    for (let i = 0; i < uniqueNames.length; i++) {
                        for (let j = i + 1; j < uniqueNames.length; j++) {
                            const product1 = uniqueNames[i];
                            const product2 = uniqueNames[j];
                            
                            // Create consistent pair key (alphabetical order)
                            const pairKey = [product1, product2].sort().join('|||');
                            
                            if (!pairCounts[pairKey]) {
                                pairCounts[pairKey] = {
                                    product1: product1,
                                    product2: product2,
                                    count: 0
                                };
                            }
                            pairCounts[pairKey].count++;
                        }
                    }
                }
            });

            console.log('📊 Products found:', Object.keys(productCounts).length);
            console.log('🔗 Pairs found:', Object.keys(pairCounts).length);

            // Build recommendations for each product
            const recommendations = {};

            Object.values(pairCounts).forEach(pair => {
                if (pair.count < CONFIG.MIN_PAIR_COUNT) return;

                // Calculate confidence for product1 -> product2
                const confidence1 = Math.round((pair.count / productCounts[pair.product1]) * 100);
                
                // Calculate confidence for product2 -> product1
                const confidence2 = Math.round((pair.count / productCounts[pair.product2]) * 100);

                // Add recommendation: product1 -> product2
                if (confidence1 >= CONFIG.MIN_CONFIDENCE) {
                    if (!recommendations[pair.product1]) {
                        recommendations[pair.product1] = [];
                    }
                    recommendations[pair.product1].push({
                        product: pair.product2,
                        confidence: confidence1,
                        pairCount: pair.count,
                        productCount: productCounts[pair.product1]
                    });
                }

                // Add recommendation: product2 -> product1
                if (confidence2 >= CONFIG.MIN_CONFIDENCE) {
                    if (!recommendations[pair.product2]) {
                        recommendations[pair.product2] = [];
                    }
                    recommendations[pair.product2].push({
                        product: pair.product1,
                        confidence: confidence2,
                        pairCount: pair.count,
                        productCount: productCounts[pair.product2]
                    });
                }
            });

            // Sort recommendations by confidence
            Object.keys(recommendations).forEach(product => {
                recommendations[product].sort((a, b) => b.confidence - a.confidence);
                recommendations[product] = recommendations[product].slice(0, CONFIG.MAX_RECOMMENDATIONS);
            });

            // Cache results
            pairingsCache = {
                recommendations,
                productCounts,
                totalOrders: orders.length,
                totalProducts: Object.keys(productCounts).length,
                totalPairings: Object.keys(pairCounts).length
            };
            lastAnalysisTime = new Date();

            console.log(`✅ Analysis complete: ${Object.keys(recommendations).length} products with recommendations`);

            return {
                success: true,
                data: pairingsCache
            };

        } catch (error) {
            console.error('❌ Error analyzing pairings:', error);
            return { success: false, message: error.message };
        }
    }
    // Get recommendations for a specific product
    function getRecommendationsFor(productName) {
        if (!pairingsCache) return [];
        
        const key = productName.toLowerCase().trim();
        return pairingsCache.recommendations[key] || [];
    }

    // Get cached data or analyze
    async function getData(forceRefresh = false) {
        if (!forceRefresh && pairingsCache && lastAnalysisTime) {
            const cacheAge = (new Date() - lastAnalysisTime) / (1000 * 60);
            if (cacheAge < 60) {
                return { success: true, data: pairingsCache };
            }
        }
        return await analyzeProductPairings();
    }

    console.log('✅ ProductRecommendations: Part 1 loaded (Core Analysis)');

    // ============================================
    // PART 2: UI COMPONENTS
    // ============================================

    // Format product name nicely
    function formatProductName(name) {
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    // Render main dashboard
    function renderDashboard(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Container not found:', containerId);
            return;
        }

        // Show loading
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12">
                <div class="animate-spin w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full mb-3"></div>
                <p class="text-slate-500">প্রোডাক্ট বিশ্লেষণ করছি...</p>
            </div>
        `;

        // Analyze and render
        getData(true).then(result => {
            if (!result.success) {
                container.innerHTML = renderEmptyState(result.message);
                return;
            }

            const data = result.data;
            container.innerHTML = `
                <div class="product-recommendations-dashboard">
                    
                    <!-- Stats Cards -->
                    ${renderStatsCards(data)}
                    
                    <!-- Top Pairings -->
                    ${renderTopPairings(data)}
                    
                    <!-- Product Search -->
                    ${renderProductSearch(data)}
                    
                    <!-- All Products List -->
                    ${renderAllProducts(data)}
                    
                </div>
            `;
        });
    }

    // Render stats cards
    function renderStatsCards(data) {
        const productsWithRecs = Object.keys(data.recommendations).length;
        
        return `
            <div class="grid grid-cols-3 gap-3 mb-6">
                <div class="bg-cyan-50 rounded-xl p-4 border border-cyan-100 text-center">
                    <div class="text-2xl font-bold text-cyan-600">${data.totalOrders}</div>
                    <div class="text-xs text-cyan-500">অর্ডার বিশ্লেষিত</div>
                </div>
                <div class="bg-purple-50 rounded-xl p-4 border border-purple-100 text-center">
                    <div class="text-2xl font-bold text-purple-600">${data.totalProducts}</div>
                    <div class="text-xs text-purple-500">ইউনিক প্রোডাক্ট</div>
                </div>
                <div class="bg-green-50 rounded-xl p-4 border border-green-100 text-center">
                    <div class="text-2xl font-bold text-green-600">${productsWithRecs}</div>
                    <div class="text-xs text-green-500">সাজেশন আছে</div>
                </div>
            </div>
        `;
    }

    // Render top pairings
    function renderTopPairings(data) {
        // Find top product pairings across all products
        const allPairings = [];
        
        Object.entries(data.recommendations).forEach(([product, recs]) => {
            recs.forEach(rec => {
                allPairings.push({
                    product1: product,
                    product2: rec.product,
                    confidence: rec.confidence,
                    pairCount: rec.pairCount
                });
            });
        });

        // Sort by pair count and get top 5
        allPairings.sort((a, b) => b.pairCount - a.pairCount);
        const topPairings = allPairings.slice(0, 5);

        if (topPairings.length === 0) {
            return '';
        }

        const pairingsHTML = topPairings.map((pair, index) => `
            <div class="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                    ${index + 1}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 text-sm">
                        <span class="font-semibold text-slate-700 truncate">${formatProductName(pair.product1)}</span>
                        <i class="ph ph-plus text-slate-400"></i>
                        <span class="font-semibold text-slate-700 truncate">${formatProductName(pair.product2)}</span>
                    </div>
                    <div class="text-xs text-slate-400">${pair.pairCount} বার একসাথে কেনা হয়েছে</div>
                </div>
                <div class="text-right">
                    <div class="text-lg font-bold text-green-600">${pair.confidence}%</div>
                </div>
            </div>
        `).join('');

        return `
            <div class="mb-6">
                <h3 class="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <i class="ph ph-fire text-orange-500"></i>
                    টপ প্রোডাক্ট পেয়ার
                </h3>
                <div class="space-y-2">
                    ${pairingsHTML}
                </div>
            </div>
        `;
    }

    // Render product search
    function renderProductSearch(data) {
        const productOptions = Object.keys(data.recommendations)
            .map(p => `<option value="${p}">${formatProductName(p)}</option>`)
            .join('');

        return `
            <div class="mb-6">
                <h3 class="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <i class="ph ph-magnifying-glass text-blue-500"></i>
                    প্রোডাক্ট সার্চ করুন
                </h3>
                <div class="bg-white rounded-xl border border-slate-200 p-4">
                    <select id="product-search-select" 
                            onchange="ProductRecommendations.showProductRecommendations(this.value)"
                            class="w-full border border-slate-200 rounded-lg p-3 text-slate-700 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
                        <option value="">-- প্রোডাক্ট সিলেক্ট করুন --</option>
                        ${productOptions}
                    </select>
                    <div id="product-recommendations-result" class="mt-4"></div>
                </div>
            </div>
        `;
    }

    // Show recommendations for selected product
    function showProductRecommendations(productName) {
        const container = document.getElementById('product-recommendations-result');
        if (!container || !productName) {
            if (container) container.innerHTML = '';
            return;
        }

        const recommendations = getRecommendationsFor(productName);

        if (recommendations.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4 text-slate-400">
                    <i class="ph ph-package text-2xl mb-2"></i>
                    <p class="text-sm">এই প্রোডাক্টের জন্য কোনো সাজেশন নেই</p>
                </div>
            `;
            return;
        }

        const recsHTML = recommendations.map(rec => `
            <div class="flex items-center gap-3 p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-100">
                <div class="w-10 h-10 rounded-lg bg-white border border-cyan-200 flex items-center justify-center">
                    <i class="ph-duotone ph-package text-cyan-600 text-xl"></i>
                </div>
                <div class="flex-1">
                    <div class="font-semibold text-slate-700">${formatProductName(rec.product)}</div>
                    <div class="text-xs text-slate-500">${rec.pairCount} বার একসাথে কেনা</div>
                </div>
                <div class="text-right">
                    <div class="text-lg font-bold text-cyan-600">${rec.confidence}%</div>
                    <div class="text-[10px] text-slate-400">কনফিডেন্স</div>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="mb-2">
                <p class="text-sm text-slate-600 mb-3">
                    <span class="font-bold text-cyan-600">${formatProductName(productName)}</span> 
                    যারা কিনেছে তারা এগুলোও কিনেছে:
                </p>
                <div class="space-y-2">
                    ${recsHTML}
                </div>
            </div>
        `;
    }

    // Render all products list
    function renderAllProducts(data) {
        const products = Object.entries(data.recommendations)
            .map(([product, recs]) => ({
                name: product,
                recCount: recs.length,
                topRec: recs[0] || null
            }))
            .sort((a, b) => b.recCount - a.recCount)
            .slice(0, 10);

        if (products.length === 0) {
            return '';
        }

        const productsHTML = products.map(p => `
            <div class="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:border-cyan-200 transition-colors cursor-pointer"
                 onclick="document.getElementById('product-search-select').value='${p.name}'; ProductRecommendations.showProductRecommendations('${p.name}');">
                <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                    <i class="ph-duotone ph-cube text-slate-500 text-xl"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="font-semibold text-slate-700 truncate">${formatProductName(p.name)}</div>
                    <div class="text-xs text-slate-400">${p.recCount} টি সাজেশন</div>
                </div>
                ${p.topRec ? `
                    <div class="text-right">
                        <div class="text-xs text-slate-500">টপ সাজেশন:</div>
                        <div class="text-sm font-medium text-cyan-600 truncate max-w-[100px]">${formatProductName(p.topRec.product)}</div>
                    </div>
                ` : ''}
                <i class="ph ph-caret-right text-slate-300"></i>
            </div>
        `).join('');

        return `
            <div class="mb-6">
                <h3 class="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <i class="ph ph-list-bullets text-purple-500"></i>
                    প্রোডাক্ট লিস্ট
                </h3>
                <div class="space-y-2">
                    ${productsHTML}
                </div>
            </div>
        `;
    }

    // Render empty state
    function renderEmptyState(message) {
        return `
            <div class="flex flex-col items-center justify-center py-12 text-center">
                <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <i class="ph ph-package text-4xl text-slate-400"></i>
                </div>
                <h3 class="text-lg font-semibold text-slate-700 mb-2">ডেটা পাওয়া যায়নি</h3>
                <p class="text-slate-500 text-sm mb-4">${message || 'প্রোডাক্ট সাজেশন তৈরি করতে পারিনি'}</p>
                <p class="text-xs text-slate-400">আরও অর্ডার যোগ করুন, তাহলে সাজেশন পাবেন!</p>
            </div>
        `;
    }

    // Initialize
    async function init(containerId = 'product-recommendations-container') {
        console.log('🛍️ ProductRecommendations: Initializing...');
        renderDashboard(containerId);
    }

    // Refresh
    async function refresh(containerId = 'product-recommendations-container') {
        console.log('🔄 Refreshing recommendations...');
        pairingsCache = null;
        lastAnalysisTime = null;
        renderDashboard(containerId);
    }

    // Show toast
    function showToast(message, type = 'info') {
        const existingToast = document.getElementById('pr-toast');
        if (existingToast) existingToast.remove();

        const bgColor = type === 'success' ? 'bg-green-500' : 
                       type === 'error' ? 'bg-red-500' : 'bg-blue-500';

        const toast = document.createElement('div');
        toast.id = 'pr-toast';
        toast.className = `fixed bottom-24 left-1/2 transform -translate-x-1/2 ${bgColor} text-white px-6 py-3 rounded-xl shadow-lg z-50`;
        toast.textContent = message;

        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    console.log('✅ ProductRecommendations: Part 2 loaded (UI Components)');

        // ============================================
    // PUBLIC API
    // ============================================

    return {
        // Config
        CONFIG,

        // Core functions
        analyzeProductPairings,
        getRecommendationsFor,
        getData,

        // UI functions
        renderDashboard,
        showProductRecommendations,
        init,
        refresh,

        // Utilities
        formatProductName,
        showToast
    };

})();

window.ProductRecommendations = ProductRecommendations;

console.log('🎉 ProductRecommendations v1.0 fully loaded!');