// expiryAlert.js - Product Expiry Alert System

const ExpiryAlert = {

    // ─────────────────────────────────────────────────────────────
    // Get Expiring & Expired Products
    // ─────────────────────────────────────────────────────────────
    async getExpiryStatus() {
        const products = await db.products.toArray();
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset to start of day
        
        const sevenDays = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        const result = {
            expired: [],      // Already expired
            critical: [],     // Expiring within 7 days
            warning: [],      // Expiring within 30 days
            total: 0
        };
        
        products.forEach(product => {
            // Skip products without expiry date
            if (!product.expiryDate) return;
            
            const expiryDate = new Date(product.expiryDate);
            expiryDate.setHours(0, 0, 0, 0);
            
            const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
            
            const productInfo = {
                ...product,
                daysUntilExpiry: daysUntilExpiry,
                expiryFormatted: this.formatDate(expiryDate)
            };
            
            if (expiryDate < today) {
                // Already expired
                result.expired.push(productInfo);
            } else if (expiryDate <= sevenDays) {
                // Expiring within 7 days - CRITICAL
                result.critical.push(productInfo);
            } else if (expiryDate <= thirtyDays) {
                // Expiring within 30 days - WARNING
                result.warning.push(productInfo);
            }
        });
        
        result.total = result.expired.length + result.critical.length + result.warning.length;
        
        return result;
    },

    // ─────────────────────────────────────────────────────────────
    // Get Dashboard Widget HTML
    // ─────────────────────────────────────────────────────────────
    async getWidgetHTML() {
        const status = await this.getExpiryStatus();
        
        // No expiry issues
        if (status.total === 0) {
            return `
                <div class="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <i class="ph ph-check-circle text-green-600 text-xl"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-green-800">সব প্রোডাক্ট ঠিক আছে ✓</h4>
                            <p class="text-xs text-green-600">কোনো প্রোডাক্ট expire হচ্ছে না</p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Has expiry issues
        return `
            <div class="bg-white border border-orange-200 rounded-xl overflow-hidden shadow-sm">
                
                <!-- Header -->
                <div class="bg-gradient-to-r from-orange-500 to-red-500 p-3 text-white">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <i class="ph ph-warning text-xl"></i>
                            <h4 class="font-bold">⏰ Expiry Alert</h4>
                        </div>
                        <span class="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                            ${status.total} items
                        </span>
                    </div>
                </div>
                
                <!-- Content -->
                <div class="p-3 space-y-2">
                    
                    ${status.expired.length > 0 ? `
                        <!-- Expired -->
                        <div class="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-2">
                            <div class="flex items-center gap-2">
                                <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                    <i class="ph ph-x-circle text-red-600"></i>
                                </div>
                                <div>
                                    <p class="text-sm font-bold text-red-700">Expired!</p>
                                    <p class="text-xs text-red-600">মেয়াদ শেষ</p>
                                </div>
                            </div>
                            <span class="text-xl font-bold text-red-700">${status.expired.length}</span>
                        </div>
                    ` : ''}
                    
                    ${status.critical.length > 0 ? `
                        <!-- Critical (7 days) -->
                        <div class="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-lg p-2">
                            <div class="flex items-center gap-2">
                                <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                    <i class="ph ph-warning text-orange-600"></i>
                                </div>
                                <div>
                                    <p class="text-sm font-bold text-orange-700">৭ দিনের মধ্যে</p>
                                    <p class="text-xs text-orange-600">Critical!</p>
                                </div>
                            </div>
                            <span class="text-xl font-bold text-orange-700">${status.critical.length}</span>
                        </div>
                    ` : ''}
                    
                    ${status.warning.length > 0 ? `
                        <!-- Warning (30 days) -->
                        <div class="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                            <div class="flex items-center gap-2">
                                <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <i class="ph ph-clock text-yellow-600"></i>
                                </div>
                                <div>
                                    <p class="text-sm font-bold text-yellow-700">৩০ দিনের মধ্যে</p>
                                    <p class="text-xs text-yellow-600">Warning</p>
                                </div>
                            </div>
                            <span class="text-xl font-bold text-yellow-700">${status.warning.length}</span>
                        </div>
                    ` : ''}
                    
                </div>
                
                <!-- Footer -->
                <div class="border-t p-2">
                    <button onclick="ExpiryAlert.showDetails()" 
                            class="w-full py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 transition flex items-center justify-center gap-2">
                        <i class="ph ph-list"></i>
                        বিস্তারিত দেখুন
                    </button>
                </div>
                
            </div>
        `;
    },

    // ─────────────────────────────────────────────────────────────
    // Show Details Modal
    // ─────────────────────────────────────────────────────────────
    async showDetails() {
        const status = await this.getExpiryStatus();
        
        const modalHTML = `
            <div id="expiry-details-modal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden shadow-2xl">
                    
                    <!-- Header -->
                    <div class="bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <i class="ph ph-warning text-2xl"></i>
                                <div>
                                    <h2 class="text-lg font-bold">Expiry Details</h2>
                                    <p class="text-white/80 text-sm">${status.total} products need attention</p>
                                </div>
                            </div>
                            <button onclick="ExpiryAlert.closeModal()" class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <i class="ph ph-x"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Content -->
                    <div class="p-4 overflow-y-auto max-h-[60vh] space-y-4">
                        
                        ${status.expired.length > 0 ? `
                            <!-- Expired Section -->
                            <div>
                                <h4 class="text-sm font-bold text-red-700 mb-2 flex items-center gap-2">
                                    <i class="ph ph-x-circle"></i>
                                    মেয়াদ শেষ (${status.expired.length})
                                </h4>
                                <div class="space-y-2">
                                    ${status.expired.map(p => this.renderProductCard(p, 'expired')).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${status.critical.length > 0 ? `
                            <!-- Critical Section -->
                            <div>
                                <h4 class="text-sm font-bold text-orange-700 mb-2 flex items-center gap-2">
                                    <i class="ph ph-warning"></i>
                                    ৭ দিনের মধ্যে শেষ (${status.critical.length})
                                </h4>
                                <div class="space-y-2">
                                    ${status.critical.map(p => this.renderProductCard(p, 'critical')).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${status.warning.length > 0 ? `
                            <!-- Warning Section -->
                            <div>
                                <h4 class="text-sm font-bold text-yellow-700 mb-2 flex items-center gap-2">
                                    <i class="ph ph-clock"></i>
                                    ৩০ দিনের মধ্যে শেষ (${status.warning.length})
                                </h4>
                                <div class="space-y-2">
                                    ${status.warning.map(p => this.renderProductCard(p, 'warning')).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                    </div>
                    
                    <!-- Footer -->
                    <div class="border-t p-4 bg-gray-50">
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                            <p class="text-xs text-blue-700">
                                💡 <strong>Tip:</strong> Expired প্রোডাক্ট বিক্রি করবেন না। Discount দিয়ে আগে বিক্রি করে ফেলুন!
                            </p>
                        </div>
                        <button onclick="ExpiryAlert.closeModal()" 
                                class="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition">
                            বন্ধ করুন
                        </button>
                    </div>
                    
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    // ─────────────────────────────────────────────────────────────
    // Render Product Card
    // ─────────────────────────────────────────────────────────────
    renderProductCard(product, type) {
        const colors = {
            expired: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700' },
            critical: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' },
            warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700' }
        };
        const c = colors[type];
        
        const daysText = product.daysUntilExpiry < 0 
            ? `${Math.abs(product.daysUntilExpiry)} দিন আগে শেষ` 
            : product.daysUntilExpiry === 0 
                ? 'আজকে শেষ!' 
                : `${product.daysUntilExpiry} দিন বাকি`;
        
        return `
            <div class="${c.bg} ${c.border} border rounded-lg p-3">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <h5 class="font-bold text-gray-800">${product.name}</h5>
                        <p class="text-xs text-gray-500">SKU: ${product.sku || 'N/A'}</p>
                        <div class="mt-2 flex items-center gap-2">
                            <span class="text-xs ${c.badge} px-2 py-0.5 rounded-full">${daysText}</span>
                            <span class="text-xs text-gray-500">Stock: ${product.stockQuantity || 0}</span>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-xs text-gray-500">Expiry</p>
                        <p class="text-sm font-bold ${c.text}">${product.expiryFormatted}</p>
                        <button onclick="ProductManager.edit(${product.id}); ExpiryAlert.closeModal();" 
                                class="mt-2 text-xs text-blue-600 hover:text-blue-800">
                            Edit
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // ─────────────────────────────────────────────────────────────
    // Helper Functions
    // ─────────────────────────────────────────────────────────────
    formatDate(date) {
        return date.toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
        });
    },

    closeModal() {
        const modal = document.getElementById('expiry-details-modal');
        if (modal) modal.remove();
    }
};