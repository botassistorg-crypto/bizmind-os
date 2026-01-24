// productManager.js - Edit & Delete Products

const ProductManager = {

    // ─────────────────────────────────────────────────────────────
    // EDIT PRODUCT
    // ─────────────────────────────────────────────────────────────
    async edit(productId) {
        const product = await db.products.get(productId);
        if (!product) {
            alert('Product not found!');
            return;
        }

        const modalHTML = `
            <div id="edit-product-modal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl">
                    
                    <!-- Header -->
                    <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <i class="ph ph-pencil-simple text-2xl"></i>
                                <div>
                                    <h2 class="text-lg font-bold">Edit Product</h2>
                                    <p class="text-white/70 text-sm">প্রোডাক্ট এডিট করুন</p>
                                </div>
                            </div>
                            <button onclick="ProductManager.closeModal()" class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <i class="ph ph-x"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Form -->
                    <form id="edit-product-form" class="p-4 overflow-y-auto max-h-[65vh] space-y-4">
                        
                        <!-- Hidden ID -->
                        <input type="hidden" id="edit-product-id" value="${product.id}">

                        <!-- Name -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                            <input type="text" id="edit-product-name" value="${product.name || ''}" required
                                   class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        </div>

                        <!-- SKU & Category -->
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                                <input type="text" id="edit-product-sku" value="${product.sku || ''}"
                                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <input type="text" id="edit-product-category" value="${product.category || ''}"
                                       placeholder="e.g., Saree, Cosmetics"
                                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            </div>
                        </div>

                        <!-- Price Row -->
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Cost Price *</label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">৳</span>
                                    <input type="number" id="edit-product-cost" value="${product.costPrice || ''}" required
                                           class="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-blue-500">
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Selling Price *</label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">৳</span>
                                    <input type="number" id="edit-product-selling" value="${product.sellingPrice || ''}" required
                                           class="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-blue-500">
                                </div>
                            </div>
                        </div>

                        <!-- Profit Preview -->
                        <div id="edit-profit-preview" class="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                            <p class="text-sm text-green-700">
                                Profit: <strong>৳${(product.sellingPrice || 0) - (product.costPrice || 0)}</strong>
                                (${product.costPrice > 0 ? Math.round(((product.sellingPrice - product.costPrice) / product.costPrice) * 100) : 0}% margin)
                            </p>
                        </div>

                        <!-- Stock Row -->
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                                <input type="number" id="edit-product-stock" value="${product.stockQuantity || 0}"
                                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert</label>
                                <input type="number" id="edit-product-alert" value="${product.alertThreshold || 5}"
                                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>

                        <!-- Expiry Date -->
                        <div class="bg-orange-50 border border-orange-200 rounded-xl p-4">
                            <label class="block text-sm font-medium text-orange-700 mb-1">
                                Expiry Date 
                                <span class="text-orange-400 text-xs font-normal">(Optional)</span>
                            </label>
                            <input type="date" id="edit-product-expiry" value="${product.expiryDate || ''}"
                                   class="w-full bg-white border border-orange-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500">
                            <p class="text-xs text-orange-500 mt-1">পচনশীল প্রোডাক্টের জন্য</p>
                        </div>

                        <!-- Variants -->
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Sizes</label>
                                <input type="text" id="edit-product-sizes" value="${product.sizes || ''}"
                                       placeholder="S, M, L, XL"
                                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Colors</label>
                                <input type="text" id="edit-product-colors" value="${product.colors || ''}"
                                       placeholder="Red, Blue, Green"
                                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>

                    </form>

                    <!-- Footer -->
                    <div class="border-t p-4 bg-gray-50 flex gap-3">
                        <button onclick="ProductManager.closeModal()" 
                                class="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition">
                            Cancel
                        </button>
                        <button onclick="ProductManager.saveEdit()" 
                                class="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                            <i class="ph ph-check"></i>
                            Save Changes
                        </button>
                    </div>

                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.setupProfitCalculation();
    },

    // ─────────────────────────────────────────────────────────────
    // SAVE EDITED PRODUCT
    // ─────────────────────────────────────────────────────────────
    async saveEdit() {
        const id = parseInt(document.getElementById('edit-product-id').value);
        
        const updatedProduct = {
            name: document.getElementById('edit-product-name').value.trim(),
            sku: document.getElementById('edit-product-sku').value.trim(),
            category: document.getElementById('edit-product-category').value.trim(),
            costPrice: parseFloat(document.getElementById('edit-product-cost').value) || 0,
            sellingPrice: parseFloat(document.getElementById('edit-product-selling').value) || 0,
            stockQuantity: parseInt(document.getElementById('edit-product-stock').value) || 0,
            alertThreshold: parseInt(document.getElementById('edit-product-alert').value) || 5,
            sizes: document.getElementById('edit-product-sizes').value.trim(),
            colors: document.getElementById('edit-product-colors').value.trim(),
            expiryDate: document.getElementById('edit-product-expiry').value || null,
            updatedAt: Date.now()
        };

        // Validation
        if (!updatedProduct.name) {
            alert('Product name is required!');
            return;
        }
        if (updatedProduct.sellingPrice <= 0) {
            alert('Selling price must be greater than 0!');
            return;
        }
        if (updatedProduct.sellingPrice < updatedProduct.costPrice) {
            if (!confirm('⚠️ Selling price is LESS than cost price! You will LOSE money. Continue?')) {
                return;
            }
        }

        try {
            await db.products.update(id, updatedProduct);
            this.closeModal();
            
            // Refresh product list
            if (typeof router === 'function') {
                router('inventory');
            }
            
            this.showToast('✅ Product updated!', 'success');
            
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Failed to update product. Please try again.');
        }
    },

    // ─────────────────────────────────────────────────────────────
    // DELETE PRODUCT
    // ─────────────────────────────────────────────────────────────
    async confirmDelete(productId) {
        const product = await db.products.get(productId);
        if (!product) return;

        const modalHTML = `
            <div id="delete-product-modal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
                    
                    <!-- Header -->
                    <div class="bg-red-500 p-4 text-white text-center">
                        <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <i class="ph ph-trash text-3xl"></i>
                        </div>
                        <h2 class="text-xl font-bold">Delete Product?</h2>
                    </div>

                    <!-- Content -->
                    <div class="p-5 text-center">
                        <p class="text-gray-600 mb-2">আপনি কি এই প্রোডাক্ট ডিলিট করতে চান?</p>
                        <p class="font-bold text-gray-800 text-lg">"${product.name}"</p>
                        
                        <div class="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                            <p class="text-red-700 text-sm">⚠️ এই action undo করা যাবে না!</p>
                        </div>
                    </div>

                    <!-- Buttons -->
                    <div class="p-4 border-t flex gap-3">
                        <button onclick="ProductManager.closeDeleteModal()" 
                                class="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition">
                            Cancel
                        </button>
                        <button onclick="ProductManager.deleteProduct(${productId})" 
                                class="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition flex items-center justify-center gap-2">
                            <i class="ph ph-trash"></i>
                            Delete
                        </button>
                    </div>

                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    async deleteProduct(productId) {
        try {
            await db.products.delete(productId);
            this.closeDeleteModal();
            
            if (typeof router === 'function') {
                router('inventory');
            }
            
            this.showToast('🗑️ Product deleted!', 'error');
            
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product.');
        }
    },

    // ─────────────────────────────────────────────────────────────
    // UTILITY FUNCTIONS
    // ─────────────────────────────────────────────────────────────
    setupProfitCalculation() {
        const costInput = document.getElementById('edit-product-cost');
        const sellingInput = document.getElementById('edit-product-selling');
        const profitPreview = document.getElementById('edit-profit-preview');

        const updateProfit = () => {
            const cost = parseFloat(costInput.value) || 0;
            const selling = parseFloat(sellingInput.value) || 0;
            const profit = selling - cost;
            const margin = cost > 0 ? Math.round((profit / cost) * 100) : 0;

            profitPreview.innerHTML = `
                <p class="text-sm ${profit >= 0 ? 'text-green-700' : 'text-red-700'}">
                    Profit: <strong>৳${profit}</strong>
                    (${margin}% margin)
                    ${profit < 0 ? '⚠️ LOSS!' : ''}
                </p>
            `;
            profitPreview.className = `rounded-lg p-3 text-center border ${profit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`;
        };

        costInput.addEventListener('input', updateProfit);
        sellingInput.addEventListener('input', updateProfit);
    },

    closeModal() {
        const modal = document.getElementById('edit-product-modal');
        if (modal) modal.remove();
    },

    closeDeleteModal() {
        const modal = document.getElementById('delete-product-modal');
        if (modal) modal.remove();
    },

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg z-50 ${
            type === 'success' ? 'bg-green-600' : 'bg-red-600'
        } text-white font-medium`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.transition = 'opacity 0.3s';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }
};